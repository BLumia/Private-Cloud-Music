; // Private Cloud Music - player.js
; // Licence: WTFPL
; // BLumia - 2016/11/11
; // szO Chris Orz

// formatTime by Chrissssss
function formatTime(t) {
	var m=Math.floor(t/60),s=Math.round(t-Math.floor(t/60)*60);
	if(s<10)return m+":0"+s;
	else if(s==60)return (m+1)+":00";
	else return m+":"+s;
}

$(function() {
	var Player = {
		path : 'Music/Test',
		data : null,
		audio : null,
		currentIndex : -1,
		loop: 0,
		audioTag : $('audio'),
		playlist : $('#playlist'),
		nowPlaying : $('#nowPlaying'),
		
		playAtIndex: function(i) {
			Player.audio.pause(); // neccessary ?
			Player.currentIndex = i;
			Player.audio.src = (Player.path + Player.data[i]);
			Player.audio.load(); // neccessary ?
			Player.audio.play();
			window.history.replaceState("","Test Title","#/"+Player.path+Player.data[Player.currentIndex]+"/"); // title seems be fucked.
			Player.nowPlaying.html(decodeURIComponent(Player.data[Player.currentIndex]));
		},
		
		freshData: function(folderName) {
			$.ajax({
				type: "GET",
				url: "./GetPlaylist.php?foldername="+folderName,
				dataType: "json",
				async : false,
				success: function(data){
					Player.data = eval(data);
				}
			});
		},
 
		freshPlaylist : function() {
			var len = Player.data.length;
			var songTitle = '';
			Player.playlist.empty();
			for (var i = 0; i < len; i++) {
				songTitle = decodeURIComponent(Player.data[i]);
				Player.playlist.append($('<a>').attr('index', i).append([
					$('<li>').text(songTitle),
				]));
			}
			
			// everytime after update playlist dom, do this (why?)
			$('#playlist a').click(function() {
				Player.playAtIndex($(this).attr('index'));
			});
		},
		
		urlMatch : function() {
			var isUrlMatched = false;
			// Match folder name and song title.
			var re = new RegExp("[#][/](.*[/])(.*.mp3)[/]");
			var urlMatch = re.exec(location.href);
			if (urlMatch != null) {
				isUrlMatched = true;
				Player.path = urlMatch[1];
				Player.audio.src = (Player.path + urlMatch[2]);
				Player.audio.play();
				Player.nowPlaying.html(decodeURIComponent(urlMatch[2]));
			}
			// Only match folder name.
			if (!isUrlMatched) {
				re = new RegExp("[#][/](.*[/])");
				urlMatch = re.exec(location.href);
				if (urlMatch != null) {
					isUrlMatched = true;
					Player.path = urlMatch[1];
				}
			}
		},
 
		init : function() {
			Player.audio = Player.audioTag.get(0);
			Player.urlMatch();
			Player.freshData(Player.path.replace('Music/','').replace('/',''));
			Player.freshPlaylist();
			
			$('#btn-loop').html(Player.loop == 1 ? 'Loop: on' : 'Loop: off');
		},
 
		ready : function() {
			Player.audio.ontimeupdate = function() {
				$('#curTime').html(formatTime(Player.audio.currentTime));
				$('#totalTime').html(formatTime(Player.audio.duration));
				$('#timebar').css('width',Player.audio.currentTime/Player.audio.duration*100+"%");
				var r=0; // Yeye Chris Begin {
				for(var i=0;i<Player.audio.buffered.length;++i)
				r=r<Player.audio.buffered.end(i)?Player.audio.buffered.end(i):r; // Chris Always Yeye }
				$('#bufferbar').css('width',r/Player.audio.duration*100+"%");
			};
			
			Player.audio.onpause = function() {
				$('#btn-play').html("Play");
			}
			
			Player.audio.onplay = function() {
				$('#btn-play').html("Pause");
			}
			
			$('#progressbar').on('click', function(e) {
				var sr=this.getBoundingClientRect();
				var p=(e.clientX-sr.left)/sr.width;
				Player.audio.currentTime=Player.audio.duration*p;
			});
			
			$('*').on('click', 'button', function() {
				if(Player.data[Player.currentIndex]) Player.nowPlaying.html(decodeURIComponent(Player.data[Player.currentIndex]));
			});
 
			$('#btn-play').click(function() {
				if(Player.audio.paused) {
					Player.audio.play();
				} else {
					Player.audio.pause();
				}
				if (Player.currentIndex == -1 && Player.audio.readyState == 0) {
					$('#btn-next').click();
				}
			});
 
			$('#btn-next').click(function() {
				if (Player.currentIndex == -1) {
					Player.playAtIndex(0);
				} else if (Player.currentIndex == (Player.data.length - 1)) {
					Player.playAtIndex(0);
				} else {
					Player.playAtIndex(Number(Player.currentIndex) + 1);
				}
			});
 
			$('#btn-prev').click(function() {
				if (Player.currentIndex == -1) {
					Player.playAtIndex(0);
				} else if (Player.currentIndex == 0) {
					Player.playAtIndex(Player.data.length - 1);
				} else {
					Player.playAtIndex(Number(Player.currentIndex) - 1);
				}
			});
 
			$('#btn-loop').click(function() {
				Player.loop = 1 - Player.loop;
				if (Player.loop == 1) {
					Player.audio.loop = true;
					$('#btn-loop').html('Loop: on');
				} else {
					Player.audio.loop = false;
					$('#btn-loop').html('Loop: off');
				}
			});
 
			$('#btn-order').click(function() {
				Player.audio.onended = function() {
					if (Player.loop == 0) {
						$('#btn-next').click();
					}
				};
			});
			
			$('#folderlist a').click(function() {
				Player.path = $(this).attr('aim') + '/';
				Player.freshData($(this).attr('aim'));
				Player.freshPlaylist();
			});
		}
	};
 
	Player.init();
	Player.ready();
});