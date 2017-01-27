; // Private Cloud Music - player.js
; // Licence: WTFPL
; // BLumia - 2016/11/11
; // szO Chris && 2jjy Orz

// formatTime by Chrissssss
function formatTime(t) {
	var m=Math.floor(t/60),s=Math.round(t-Math.floor(t/60)*60);
	if(s<10)return m+":0"+s;
	else if(s==60)return (m+1)+":00";
	else return m+":"+s;
}

$(function() {
	var Player = {
		path : null, // sample: 'Test/'
		data : null,
		audio : null,
		currentIndex : -1,
		loop: 0,
		order: 0,
		audioTag : $('audio'),
		playlist : $('#playlist'),
		folderlist : $('#folderlist'),
		nowPlaying : document.getElementById("nowPlaying"),
		
		playAtIndex: function(i) {
			this.audio.pause(); // neccessary ?
			this.currentIndex = i;
			this.audio.src = (Player.path + Player.data[i].fileName);
			this.audio.load(); // neccessary ?
			this.audio.play();
			window.history.replaceState("","Test Title","#/"+Player.path+Player.data[i].fileName+"/"); // title seems be fucked.
			this.nowPlaying.innerHTML = decodeURIComponent(Player.data[i].fileName);
		},
		
		freshFolderlist: function() {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "./api.php", false);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4 || xhr.status != 200) return;
				var data = JSON.parse(xhr.responseText);
				if (data.status != 200) { 
					console.error("Fetch error. Reason: " + data.message + " Url: ./api.php");
					return;
				}
				data.result.data.forEach(function(item, i){
					var decodedFolderName = decodeURIComponent(item);
					if (Player.path == null) Player.path = item + '/';
					// attr aim data as uriencoded path.
					Player.folderlist.append($('<a>').attr('aim', item).append([
						$('<li>').text(decodedFolderName + '/'),
					]));
				});
			};
			xhr.onerror = function() {
				console.error("Ajax load folders failed. Status: " + xhr.status + " Url: ./api.php");
			};
			xhr.send("do=getfolders");
		},
		
		fetchData: function() {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "./api.php", true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4 || xhr.status != 200) return;
				var data = JSON.parse(xhr.responseText);
				if (data.status != 200) { 
					console.error("Fetch error. Reason: " + data.message + " Url: ./api.php");
					return;
				}
				Player.data = data.result.data;
				Player.freshPlaylist();
			};
			xhr.onerror = function() {
				console.error("Ajax load playlist failed. Status: " + xhr.status + " Url: ./api.php");
				Player.data = [];
			};
			xhr.send("do=getplaylist&folder="+Player.path);
		},
 
		freshPlaylist : function() {
			var data = this.data;
			var songTitle = '';
			this.playlist.empty();
			data.forEach(function(item, i){
				songTitle = decodeURIComponent(item.fileName);
				Player.playlist.append($('<a>').attr('index', i).append([
					$('<li>').text(songTitle),
				]));
			});
			// everytime after update playlist dom, do this.
			$('#playlist a').click(function() {
				Player.playAtIndex($(this).attr('index'));
			});
		},
		
		urlMatch : function() {
			var isUrlMatched = false;
			// Match folder name and song title.
			var re = new RegExp("[#][/](.*[/])(.*.[a-zA-z0-9]{1,3})[/]");
			var urlMatch = re.exec(location.href);
			if (urlMatch != null) {
				isUrlMatched = true;
				this.path = urlMatch[1];
				this.audio.src = (this.path + urlMatch[2]);
				this.audio.play();
				this.nowPlaying.innerHTML = decodeURIComponent(urlMatch[2]);
			}
			// Only match folder name.
			if (!isUrlMatched) {
				re = new RegExp("[#][/](.*[/])");
				urlMatch = re.exec(location.href);
				if (urlMatch != null) {
					isUrlMatched = true;
					this.path = urlMatch[1];
				}
			}
		},
 
		init : function() {
			this.audio = this.audioTag.get(0);
			this.freshFolderlist();
			this.urlMatch();
			this.fetchData();
			
			document.getElementById("btn-loop").innerHTML = Player.loop == 1 ? 'Loop: √' : 'Loop: ×';
			document.getElementById("btn-order").innerHTML = Player.order == 1 ? 'Order: √' : 'Order: ×';
		},
 
		ready : function() {
			this.audio.ontimeupdate = function() {
				document.getElementById("curTime").innerHTML = formatTime(Player.audio.currentTime);
				document.getElementById("totalTime").innerHTML = formatTime(Player.audio.duration);
				document.getElementById("timebar").style.width = Player.audio.currentTime / Player.audio.duration*100+"%";
				var r = 0;
				for(var i=0; i<Player.audio.buffered.length; ++i)
					r = r<Player.audio.buffered.end(i) ? Player.audio.buffered.end(i) : r;
				document.getElementById("bufferbar").style.width = r / Player.audio.duration*100+"%";
			};
			
			this.audio.onpause = function() {
				document.getElementById("btn-play").innerHTML="Play";
			}
			
			this.audio.onplay = function() {
				document.getElementById("btn-play").innerHTML="Pause";
			}
			
			document.getElementById("progressbar").onclick = function(e) {
				var sr=this.getBoundingClientRect();
				var p=(e.clientX-sr.left)/sr.width;
				Player.audio.currentTime=Player.audio.duration*p;
			};
			
			$('*').on('click', 'button', function() {
				if(Player.data[Player.currentIndex]) Player.nowPlaying.innerHTML = decodeURIComponent(Player.data[Player.currentIndex].fileName);
			});

			document.getElementById("btn-play").onclick = function() {
				if(Player.audio.paused) {
					Player.audio.play();
				} else {
					Player.audio.pause();
				}
				if (Player.currentIndex == -1 && Player.audio.readyState == 0) {
					document.getElementById("btn-next").click();
				}
			};

			document.getElementById("btn-next").onclick = function() {
				if (Player.currentIndex == -1) {
					Player.playAtIndex(0);
				} else if (Player.currentIndex == (Player.data.length - 1)) {
					Player.playAtIndex(0);
				} else {
					Player.playAtIndex(Number(Player.currentIndex) + 1);
				}
			};

			document.getElementById("btn-prev").onclick = function() {
				if (Player.currentIndex == -1) {
					Player.playAtIndex(0);
				} else if (Player.currentIndex == 0) {
					Player.playAtIndex(Player.data.length - 1);
				} else {
					Player.playAtIndex(Number(Player.currentIndex) - 1);
				}
			};

			document.getElementById("btn-loop").onclick = function() {
				Player.loop = 1 - Player.loop;
				if (Player.loop == 1) {
					Player.audio.loop = true;
					document.getElementById("btn-loop").innerHTML="Loop: √";
				} else {
					Player.audio.loop = false;
					document.getElementById("btn-loop").innerHTML="Loop: ×";
				}
			};
 
			document.getElementById("btn-order").onclick = function() {
				Player.order = 1 - Player.order;
				if (Player.order == 1) {
					Player.audio.onended = function() {
						if (Player.loop == 0) {
							document.getElementById("btn-next").click();
						}
					};
					document.getElementById("btn-order").innerHTML="Order: √";
				} else {
					Player.audio.onended = undefined;
					document.getElementById("btn-order").innerHTML="Order: ×";
				}
				
			};
			
			$('#folderlist a').click(function() {
				Player.path = $(this).attr('aim') + '/';
				Player.fetchData();
			});
		}
	};
 
	Player.init();
	Player.ready();
});