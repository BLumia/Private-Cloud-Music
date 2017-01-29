; // Private Cloud Music - player.js
; // Licence: WTFPL
; // BLumia - 2016/11/11
; // szO Chris && 2jjy && jxpxxzj Orz
; //     ↑ Moe    ↑ Moe   ↑ Moe

// formatTime by Chrissssss
function formatTime(t) {
    const m=Math.floor(t/60),s=Math.round(t-Math.floor(t/60)*60);
    if(s<10)return m+":0"+s;
    else if(s==60)return (m+1)+":00";
    else return m+":"+s;
};

class Player {
    constructor(config) {
        this.audioTag = config.audioEl;
        this.api = config.api;
        this.path = config.defaultFolder;
        this.audio = this.audioTag.get(0);
        this.playlist = $('#playlist'),
        this.folderlist = $('#folderlist'),
        this.nowPlaying = document.getElementById('nowPlaying'),
        this.freshFolderlist();
        this.urlMatch();
        this.fetchData();
        document.getElementById("btn-loop").innerHTML = this.loop == 1 ? 'Loop: √' : 'Loop: ×';
        document.getElementById("btn-order").innerHTML = this.order == 1 ? 'Order: √' : 'Order: ×';
    }

    playAtIndex(i) {
        this.audio.pause(); // neccessary ?
        this.currentIndex = i;
        this.audio.src = (this.path + this.data[i].fileName);
        this.audio.load(); // neccessary ?
        this.audio.play();
        window.history.replaceState("","Test Title","#/"+this.path+this.data[i].fileName+"/"); // title seems be fucked.
        this.nowPlaying.innerHTML = decodeURIComponent(this.data[i].fileName);
    }
        
    freshFolderlist() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.api, false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        const that = this;
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4 || xhr.status != 200) return;
            const data = JSON.parse(xhr.responseText);
            if (data.status != 200) { 
                console.error("Fetch error. Reason: " + data.message + " Url: ./api.php");
                return;
            }
            data.result.data.forEach((item, i) => {
                const decodedFolderName = decodeURIComponent(item);
                if (that.path == null) that.path = item + '/';               
                // attr aim data as uriencoded path.
                that.folderlist.append($('<a>').attr('aim', item).append([
                    $('<li>').text(decodedFolderName + '/'),
                ]));
            });
        };
        xhr.onerror = () => {
            console.error("Ajax load folders failed. Status: " + xhr.status + " Url: " + that.api);
        };
        xhr.send("do=getfolders");
    }
        
    fetchData() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.api, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4 || xhr.status != 200) return;
            const data = JSON.parse(xhr.responseText);
            if (data.status != 200) { 
                console.error("Fetch error. Reason: " + data.message + " Url: " + this.api);
                return;
            }
            this.data = data.result.data;
            this.freshPlaylist();
        };
        xhr.onerror = () => {
            console.error("Ajax load playlist failed. Status: " + xhr.status + " Url: " + this.api);
            this.data = [];
        };
        xhr.send("do=getplaylist&folder=" + this.path);
    }
 
    freshPlaylist() {
        const data = this.data;
        let songTitle = '';
        this.playlist.empty();
        data.forEach((item, i) => {
            songTitle = decodeURIComponent(item.fileName);
            this.playlist.append($('<a>').attr('index', i).append([
                $('<li>').text(songTitle),
            ]));
        });
        // everytime after update playlist dom, do this.
        const that = this;
        $('#playlist a').click(function() {
            that.playAtIndex($(this).attr('index'));
        });
    }
        
    urlMatch() {
        let isUrlMatched = false;
        // Match folder name and song title.
        let re = new RegExp("[#][/](.*[/])(.*.[a-zA-z0-9]{1,3})[/]");
        let urlMatch = re.exec(location.href);
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
    }

    ready() {
        this.audio.ontimeupdate = () => {
            document.getElementById("curTime").innerHTML = formatTime(this.audio.currentTime);
            document.getElementById("totalTime").innerHTML = formatTime(this.audio.duration);
            document.getElementById("timebar").style.width = this.audio.currentTime / this.audio.duration*100+"%";
            let r = 0;
            for(let i=0; i<this.audio.buffered.length; ++i)
                r = r<this.audio.buffered.end(i) ? this.audio.buffered.end(i) : r;
            document.getElementById("bufferbar").style.width = r / this.audio.duration*100+"%";
        };
            
        this.audio.onpause = () => {
            document.getElementById("btn-play").innerHTML="Play";
        };
            
        this.audio.onplay = () => {
            document.getElementById("btn-play").innerHTML="Pause";
        };

        const that = this;  
        document.getElementById("progressbar").onclick = function(e) {
            const sr=this.getBoundingClientRect();
            const p=(e.clientX-sr.left)/sr.width;
            that.audio.currentTime=that.audio.duration*p;
        };
            
        $('*').on('click', 'button', () => {
            if(this.data[this.currentIndex]) this.nowPlaying.innerHTML = decodeURIComponent(this.data[this.currentIndex].fileName);
        });

        document.getElementById("btn-play").onclick = () => {
            if(this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
            if (this.currentIndex == -1 && this.audio.readyState == 0) {
                document.getElementById("btn-next").click();
            }
        };

        document.getElementById("btn-next").onclick = () => {
            if (this.currentIndex == -1) {
                this.playAtIndex(0);
            } else if (this.currentIndex == (this.data.length - 1)) {
                this.playAtIndex(0);
            } else {
                this.playAtIndex(Number(this.currentIndex) + 1);
            }
        };

        document.getElementById("btn-prev").onclick = () => {
            if (this.currentIndex == -1) {
                this.playAtIndex(0);
            } else if (this.currentIndex == 0) {
                this.playAtIndex(this.data.length - 1);
            } else {
                this.playAtIndex(Number(this.currentIndex) - 1);
            }
        };

        document.getElementById("btn-loop").onclick = () => {
            this.loop = 1 - this.loop;
            if (this.loop == 1) {
                this.audio.loop = true;
                document.getElementById("btn-loop").innerHTML="Loop: √";
            } else {
                this.audio.loop = false;
                document.getElementById("btn-loop").innerHTML="Loop: ×";
            }
        };
 
        document.getElementById("btn-order").onclick = () => {
            this.order = 1 - this.order;
            if (this.order == 1) {
                this.audio.onended = () => {
                    if (this.loop == 0) {
                        document.getElementById("btn-next").click();
                    }
                };
                document.getElementById("btn-order").innerHTML="Order: √";
            } else {
                this.audio.onended = undefined;
                document.getElementById("btn-order").innerHTML="Order: ×";
            }
                
        };
        
        $('#folderlist a').click(function() {
            that.path = $(this).attr('aim') + '/';
            that.fetchData();
        });
    }
}

