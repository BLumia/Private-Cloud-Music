; // SPDX-FileCopyrightText: 2021 Gary Wang <toblumia@outlook.com>
; // SPDX-License-Identifier: MIT
; // szO Chris && 2jjy && jxpxxzj Orz
; //     ↑ Moe    ↑ Moe   ↑ Moe

// formatTime,getCookie by Chrissssss
function formatTime(t) {
    if(isNaN(t))return '--:--';
    let m=Math.floor(t/60),s=Math.round(t-Math.floor(t/60)*60);
    if(s<10)return `${m}:0${s}`;
    else if(s==60)return `${m+1}:00`;
    else return `${m}:${s}`;
}
function getCookie(key) {
    if (!navigator.cookieEnabled) return "";
    return document.cookie.replace(new RegExp('(?:(?:^|.*;\\s*)'+key+'\\s*\\=\\s*([^;]*).*$)|^.*$'),'$1');
}
function setCookie(cookieName, cookieValue, maxAge = 0) {
    if (!navigator.cookieEnabled) return;
    var cookieStr = cookieName + "=" + cookieValue;
    if (maxAge > 0) cookieStr += ";max-age=" + maxAge;
    document.cookie = cookieStr;
}
function displayName(item) {
    return item.displayName ? item.displayName : decodeURIComponent(item.fileName);
}

(function() {
    var Helper = function() {
        this.el = null;
        this.entry = function(selector) {
            if (typeof selector == 'string') {
                if (selector[0] == '<') {
                    var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
                    if (singleTagRE.test(selector)) this.el = document.createElement(RegExp.$1);
                } else {
                    this.el = document.getElementById(selector);
                }
            }
            else this.el = selector;
            return this;
        }
    }
    Helper.prototype = {    
        css: function(property, value) {
            if(this.el) this.el.style.cssText += ';' + property + ":" + value;
            return this;
        },
        attr: function(attr, value) {
            if(this.el) this.el.setAttribute(attr, value);
            return this;
        },
        removeData: function(attr) {
            if(this.el) this.el.removeAttribute("data-" + attr);
            return this;
        },
        data: function(attr, value) {
            if(this.el) this.el.setAttribute("data-" + attr, JSON.stringify(value));
            return this;
        },
        append: function(node) {
            if(this.el) this.el.appendChild(node);
            return this;
        },
        text: function(content) {
            if(this.el) this.el.textContent = content;
            return this;
        },
        click: function(handler) {
            if(!this.el) return this;
            if (typeof(handler) == "function") this.el.onclick = handler;
            else this.el.click();
            return this;
        },
        innerHTML: function(text) {
            if(this.el) this.el.innerHTML = text;
            return this;
        }
    }
    var H = function(selector) {
        var f = new Helper();
        return f.entry(selector);
    }
    function TrickOrTreat(promiseRsp) {
        if (!promiseRsp.ok) {
            throw Error(promiseRsp.statusText); // to cancel the Promise chain...
        }
        return promiseRsp.json();
    }
    var Player = {
        mediaRootUrl: '',
        path: null, // sample: 'Test/'
        data: null,
        preferredFormats: undefined, // sample: 'mp3,ogg'
        audio: document.getElementsByTagName('audio')[0],
        currentIndex: -1,
        loop: 0,
        order: 0,
        playlist: H("playlist").el,
        folderlist: H("folderlist").el,
        nowPlaying: H("nowPlaying").el,
        apiUrl: "./api.php",
        _currentSongInfoJson: undefined,
        _chapterNeedUpdate: true,

        setInfoJson: (jsonData) => {
            this._currentSongInfoJson = jsonData;
            this._chapterNeedUpdate = true;
        },
        
        updateMetadata: function() {
            if ('mediaSession' in navigator) {
                window.navigator.mediaSession.metadata = new MediaMetadata({
                    title: nowPlaying.innerHTML,
                    album: decodeURIComponent(this.path)
                });
            }
        },

        applyChapterData: () => {
            if (!this._chapterNeedUpdate) return;
            if (Player.audio.duration) {
                if (this._currentSongInfoJson) {
                    let duration = Player.audio.duration;
                    let progressChapterData = [];
                    this._currentSongInfoJson.chapters.forEach((chapter) => {
                        let chapterObj = {};
                        chapterObj.start = chapter.start_time / duration * 100;
                        chapterObj.title = chapter.title;
                        progressChapterData.push(chapterObj);
                    });
                    H("progress-bar").data("chapters", progressChapterData);
                } else {
                    H("progress-bar").removeData("chapters");
                }
                this._chapterNeedUpdate = false;
            }
        },

        fetchAdditionalInfo: (infoJsonfileUrl) => {
            fetch(infoJsonfileUrl).then(TrickOrTreat).then((data) => {
                Player.setInfoJson(data);
            });
        },

        playAtIndex: function(i) {
            let fullPath = this.path + this.data[i].fileName;
            let srcUrl = this.data[i].url ? this.data[i].url : (this.mediaRootUrl + fullPath);
            // FIXME: trigger this when audio doesn't finished load will cause play promise error.
            this.audio.pause();
            this.currentIndex = i;
            this.audio.src = srcUrl;
            this.audio.load();
            this.audio.play();
            window.history.replaceState("","Useless Title","#/" + fullPath + "/"); // title seems be fucked.
            H(this.nowPlaying).innerHTML(displayName(this.data[i]));

            if (this.data[i].additionalInfo) {
                let infoJsonFile = (fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath) + ".info.json";
                this.fetchAdditionalInfo(infoJsonFile);
            } else {
                this.setInfoJson(undefined);
            }
        },

        fetchServerInfo: function(callback) {
            var that = this;
            fetch(this.apiUrl, {
                method: 'POST',
                body: new URLSearchParams({
                    'do': 'getserverinfo'
                })
            }).then(TrickOrTreat).then((data) => {
                if (data.result.mediaRootUrl && data.result.mediaRootUrl.length > 1) {
                    that.mediaRootUrl = data.result.mediaRootUrl;
                    if (!that.mediaRootUrl.endsWith('/')) {
                        that.mediaRootUrl = that.mediaRootUrl + '/';
                    }
                }
                if (data.result.serverName) {
                    let el = H("server-name");
                    if (el) {
                        el.text(data.result.serverName);
                    }
                    document.title = data.result.serverName;
                }
                
                typeof callback === 'function' && callback();
            })
        },

        freshFolderlist: function(callback) {
            var that = this;
            requestBody = {
                'do': 'getfilelist',
            };
            if (that.preferredFormats) {
                requestBody['preferredFormats'] = that.preferredFormats;
            }
            fetch(this.apiUrl, {
                method: 'POST',
                body: new URLSearchParams(requestBody)
            }).then(TrickOrTreat).then((data) => {
                if (data.status != 200) { 
                    console.error("Fetch error. Reason: " + data.message + " Url: ./api.php");
                    return;
                }
                data.result.data.subFolderList.forEach(function(item, i) {
                    var decodedFolderName = decodeURIComponent(item);
                    if (that.path == null) that.path = item + '/';
                    // attr aim data as uriencoded path.
                    H(that.folderlist).append(
                        H("<a>").attr('aim', item).append(
                            H("<li>").text(decodedFolderName + '/').el
                        ).el
                    );
                });
                
                var nodeList = document.querySelectorAll('#folderlist a');
                for(var i = 0; i < nodeList.length; i++) {
                    var el = nodeList[i];
                    el.onclick = function() {
                        that.path = this.getAttribute('aim') + '/';
                        that.fetchData();
                    };
                }
                
                typeof callback === 'function' && callback();
            });
        },

        fetchData: function() {
            var that = this;
            
            fetch(this.apiUrl, {
                method: 'POST',
                body: new URLSearchParams({
                    'do': 'getfilelist',
                    'folder': that.path
                })
            }).then(TrickOrTreat).then((data) => {
                that.data = data.result.data.musicList;
                that.freshPlaylist();
                that.freshSubFolderList(data.result.data.subFolderList);
            });
        },

        freshPlaylist : function() {
            var that = this;
            var data = this.data;
            var songTitle = '';
            this.playlist.innerHTML = '';
            data.forEach(function(item, i) {
                songTitle = displayName(item);
                H(that.playlist).append(
                    H("<a>").attr('index', i).append(
                        H("<li>").text(songTitle).el
                    ).el
                );
            });
            // everytime after update playlist dom, do this.
            var nodeList = document.querySelectorAll('#playlist a');
            for(var i = 0; i < nodeList.length; i++) {
                var el = nodeList[i];
                el.onclick = function() {
                    that.playAtIndex(this.getAttribute('index'));
                };
            }
        },

        freshSubFolderList : function(list) {
            var that = this;
            H("subfolderlist").innerHTML("");
            list.forEach(function(item, i) {
                var decodedFolderName = decodeURIComponent(item);
                // attr aim data as uriencoded path.
                H("subfolderlist").append(
                    H("<a>").attr('aim', item).append(
                        H("<li>").text(decodedFolderName + '/').el
                    ).el
                );
            });
            var nodeList = document.querySelectorAll('#subfolderlist a');
            for(var i = 0; i < nodeList.length; i++) {
                var el = nodeList[i];
                el.onclick = function() {
                    that.path = this.getAttribute('aim') + '/';
                    that.fetchData();
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
                this.audio.play().catch((reason) => { console.log(reason); });
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

        applyLoop : function() {
            if (this.loop == 1) {
                this.audio.loop = true;
                H("btn-loop").innerHTML("Loop: √");
            } else {
                this.audio.loop = false;
                H("btn-loop").innerHTML("Loop: ×");
            }
        },

        applyOrder : function() {
            if (this.order == 1) {
                this.audio.onended = function() {
                    if (this.loop == 0) {
                        H("btn-next").click();
                    }
                };
                H("btn-order").innerHTML("Order: √");
            } else {
                this.audio.onended = undefined;
                H("btn-order").innerHTML("Order: ×");
            }
        },

        init : function() {
            var that = this;
            this.fetchServerInfo(function() {
                that.freshFolderlist(function() {
                    that.urlMatch();
                    that.fetchData();
                });
            });
            this.loop = getCookie("pcm-loop") == "1" ? 1 : 0;
            this.order = getCookie("pcm-order") == "1" ? 1 : 0;
            this.applyLoop();
            this.applyOrder();
        },

        ready : function() {
            var that = this;
            
            this.audio.ontimeupdate = () => {
                this.applyChapterData();
                H("curTime").innerHTML(formatTime(Player.audio.currentTime));
                H("totalTime").innerHTML(formatTime(Player.audio.duration));
                H("progress-bar").attr("value", Player.audio.currentTime / Player.audio.duration*100);
                var r = 0;
                for (var i=0; i<Player.audio.buffered.length; ++i)
                    r = r<Player.audio.buffered.end(i) ? Player.audio.buffered.end(i) : r;
                H("progress-bar").attr("buffer", r / Player.audio.duration*100);
            };
            
            this.audio.onpause = function() {
                H("btn-play").innerHTML("Play");
            }

            this.audio.onplay = function() {
                H("btn-play").innerHTML("Pause");
                that.updateMetadata();
            }

            H("progress-bar").click(function(e) {
                var sr=this.getBoundingClientRect();
                var p=(e.clientX-sr.left)/sr.width;
                that.audio.currentTime=that.audio.duration*p;
            });

            var nodeList = document.getElementsByTagName('button');
            for(var i = 0; i < nodeList.length; i++) {
                var el = nodeList[i];
                el.onclick = function() {
                    if(that.data[that.currentIndex]) H(that.nowPlaying).innerHTML(displayName(that.data[that.currentIndex]));
                };
            }

            H("btn-play").click(function() {
                if(that.audio.paused) {
                    that.audio.play();
                } else {
                    that.audio.pause();
                }
                if (that.currentIndex == -1 && that.audio.readyState == 0) {
                    H("btn-next").click();
                }
            });

            H("btn-next").click(function() {
                if (that.currentIndex == -1) {
                    that.playAtIndex(0);
                } else if (that.currentIndex == (that.data.length - 1)) {
                    that.playAtIndex(0);
                } else {
                    that.playAtIndex(Number(that.currentIndex) + 1);
                }
            });

            H("btn-prev").click(function() {
                if (that.currentIndex == -1) {
                    that.playAtIndex(0);
                } else if (that.currentIndex == 0) {
                    that.playAtIndex(that.data.length - 1);
                } else {
                    that.playAtIndex(Number(that.currentIndex) - 1);
                }
            });

            H("btn-loop").click(function() {
                that.loop = 1 - that.loop;
                that.applyLoop();
                setCookie("pcm-loop", that.loop, 157680000);
            });

            H("btn-order").click(function() {
                that.order = 1 - that.order;
                that.applyOrder();
                setCookie("pcm-order", that.order, 157680000);
            });
            
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', function() { H("btn-prev").click(); });
                navigator.mediaSession.setActionHandler('nexttrack', function() { H("btn-next").click(); });
            }
        }
    };

    Player.init();
    Player.ready();
}());
