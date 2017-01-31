; // Private Cloud Music - player.js
; // Licence: WTFPL
; // BLumia - 2016/11/11
; // szO Chris && 2jjy && jxpxxzj Orz
; //     ↑ Moe    ↑ Moe   ↑ Moe

// formatTime by Chrissssss
function formatTime(t) {
    var m=Math.floor(t/60),s=Math.round(t-Math.floor(t/60)*60);
    if(s<10)return m+":0"+s;
    else if(s==60)return (m+1)+":00";
    else return m+":"+s;
}

(function() {
    var Helper = {
        el: null,
        entry: function(selector) {
            if (typeof selector == 'string') this.el = document.getElementById(selector);
            else this.el = selector;
            return this;
        },
        css: function(property, value) {
            if(this.el) this.el.style.cssText += ';' + property + ":" + value;
        },
        innerHTML: function(text) {
            if(this.el) this.el.innerHTML = text;
        }
    }
    var H = function(selector) {
        return Helper.entry(selector);
    }
    var Player = {
        path: null, // sample: 'Test/'
        data: null,
        audio: document.getElementsByTagName('audio')[0],
        currentIndex: -1,
        loop: 0,
        order: 0,
        playlist: H("playlist").el,
        folderlist: H("folderlist").el,
        nowPlaying: H("nowPlaying").el,
        
        playAtIndex: function(i) {
            // FIXME: trigger this when audio doesn't finished load will cause play promise error.
            this.audio.pause();
            this.currentIndex = i;
            this.audio.src = (this.path + this.data[i].fileName);
            this.audio.load();
            this.audio.play();
            window.history.replaceState("","Useless Title","#/"+this.path+this.data[i].fileName+"/"); // title seems be fucked.
            H(this.nowPlaying).innerHTML(decodeURIComponent(this.data[i].fileName));
        },
        
        freshFolderlist: function(callback) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "./api.php", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var that = this;
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var data = JSON.parse(xhr.responseText);
                if (data.status != 200) { 
                    console.error("Fetch error. Reason: " + data.message + " Url: ./api.php");
                    return;
                }
                data.result.data.forEach(function(item, i){
                    var decodedFolderName = decodeURIComponent(item);
                    if (that.path == null) that.path = item + '/';
                    // attr aim data as uriencoded path.
                    var el = document.createElement("a");
                    el.setAttribute('aim', item);
                    var subEl = document.createElement("li");
                    subEl.textContent = decodedFolderName + '/';
                    el.appendChild(subEl);
                    that.folderlist.appendChild(el);
                });
            };
            xhr.onerror = function() {
                console.error("Ajax load folders failed. Status: " + xhr.status + " Url: ./api.php");
            };
            xhr.onloadend = function() {
                typeof callback === 'function' && callback();
            }
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
            this.playlist.innerHTML = '';
            data.forEach((item, i) => {
                songTitle = decodeURIComponent(item.fileName);
                var el = document.createElement("a");
                el.setAttribute('index', i);
                var subEl = document.createElement("li");
                subEl.textContent = songTitle;
                el.appendChild(subEl);
                this.playlist.appendChild(el);
            });
            // everytime after update playlist dom, do this.
            var that = this;
            var nodeList = document.querySelectorAll('#playlist a');
            for(var i = 0; i < nodeList.length; i++) {
                var el = nodeList[i];
                el.onclick = function() {
                    that.playAtIndex(this.getAttribute('index'));
                };
            }
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
                H(this.nowPlaying).innerHTML(decodeURIComponent(urlMatch[2]));
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
            var that = this;
            this.freshFolderlist(function() {
                that.urlMatch();
                that.fetchData();
            });
            H("btn-loop").innerHTML(Player.loop == 1 ? 'Loop: √' : 'Loop: ×');
            H("btn-order").innerHTML(Player.order == 1 ? 'Order: √' : 'Order: ×');
        },
 
        ready : function() {
            this.audio.ontimeupdate = function() {
                H("curTime").innerHTML(formatTime(Player.audio.currentTime));
                H("totalTime").innerHTML(formatTime(Player.audio.duration));
                H("timebar").css("width", Player.audio.currentTime / Player.audio.duration*100+"%");
                var r = 0;
                for(var i=0; i<Player.audio.buffered.length; ++i)
                    r = r<Player.audio.buffered.end(i) ? Player.audio.buffered.end(i) : r;
                H("bufferbar").css("width", r / Player.audio.duration*100+"%");
            };
            
            this.audio.onpause = function() {
                H("btn-play").innerHTML("Play");
            }
            
            this.audio.onplay = function() {
                H("btn-play").innerHTML("Pause");
            }
            
            var that = this;
            H("progressbar").el.onclick = function(e) {
                var sr=this.getBoundingClientRect();
                var p=(e.clientX-sr.left)/sr.width;
                that.audio.currentTime=that.audio.duration*p;
            };
            
            var nodeList = document.getElementsByTagName('button');
            for(let i = 0; i < nodeList.length; i++) {
                let el = nodeList[i];
                el.onclick = function() {
                    if(that.data[that.currentIndex]) H(that.nowPlaying).innerHTML(decodeURIComponent(that.data[that.currentIndex].fileName));
                };
            }

            H("btn-play").el.onclick = function() {
                if(that.audio.paused) {
                    that.audio.play();
                } else {
                    that.audio.pause();
                }
                if (that.currentIndex == -1 && that.audio.readyState == 0) {
                    H("btn-next").el.click();
                }
            };

            H("btn-next").el.onclick = function() {
                if (that.currentIndex == -1) {
                    that.playAtIndex(0);
                } else if (that.currentIndex == (that.data.length - 1)) {
                    that.playAtIndex(0);
                } else {
                    that.playAtIndex(Number(that.currentIndex) + 1);
                }
            };

            H("btn-prev").el.onclick = function() {
                if (that.currentIndex == -1) {
                    that.playAtIndex(0);
                } else if (that.currentIndex == 0) {
                    that.playAtIndex(that.data.length - 1);
                } else {
                    that.playAtIndex(Number(that.currentIndex) - 1);
                }
            };

            H("btn-loop").el.onclick = function() {
                that.loop = 1 - that.loop;
                if (that.loop == 1) {
                    that.audio.loop = true;
                    H("btn-loop").innerHTML("Loop: √");
                } else {
                    that.audio.loop = false;
                    H("btn-loop").innerHTML("Loop: ×");
                }
            };
 
            H("btn-order").el.onclick = function() {
                that.order = 1 - that.order;
                if (that.order == 1) {
                    that.audio.onended = function() {
                        if (that.loop == 0) {
                            H("btn-next").el.click();
                        }
                    };
                    H("btn-order").innerHTML("Order: √");
                } else {
                    that.audio.onended = undefined;
                    H("btn-order").innerHTML("Order: ×");
                }
                
            };
            
            var nodeList = document.querySelectorAll('#folderlist a');
            for(var i = 0; i < nodeList.length; i++) {
                var el = nodeList[i];
                el.onclick = function() {
                    that.path = this.getAttribute('aim') + '/';
                    that.fetchData();
                };
            }
        }
    };
 
    Player.init();
    Player.ready();
}());