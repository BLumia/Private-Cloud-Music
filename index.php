<html>
<meta charset="utf-8">
<title>Private Playlist</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="./w3.css">
<script src="./jquery-3.0.0.min.js"></script>
<style>.w3-sidenav ul li { padding-left: 2px;}</style>

<nav class="w3-sidenav w3-collapse w3-light-grey w3-animate-left w3-card-2" style="z-index: 3; width: 250px; display: none;" id="mySidenav">
<header class="w3-container w3-dark-grey">
	<h2>Folders <a href="javascript:void(0)" onclick="w3_close()" class="w3-right w3-xlarge w3-hide-large w3-closenav" title="close sidenav">×</a></h2>
</header>
<ul class="w3-ul" style="margin-bottom: 120px;" id="folderlist">
<?php
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    }
	$curPath = dirname(__FILE__);
	$fileList = scandir($curPath);
	
	foreach($fileList as $oneFileName) {
		if($oneFileName == "." || $oneFileName == "..") continue;
		$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
		$oneFilePath = $curPath."/".$oneFileName;
		
		if (is_dir($oneFilePath) && file_exists($oneFilePath."/GetPlaylist.php")) {
			echo "<a aim='{$utf8FileName}'><li>{$utf8FileName}/</li></a>";
		}
	}
?>
</ul>
</nav>
<div class="w3-overlay w3-hide-large w3-animate-opacity" onclick="w3_close()" style="cursor: pointer; display: none;" id="myOverlay"></div>
<div class="w3-main" style="margin-left:250px;">
	<header class="w3-container w3-red w3-top">
		<h2><span class="w3-opennav w3-xlarge w3-left w3-hide-large" onclick="w3_open()" id="openNav">&#9776;</span>&nbsp;Private Cloud Music</h2>
	</header>
	<header class="w3-container w3-yellow"><h2>You can't see me</h2></header>
	<ul class="w3-ul w3-hoverable" style="margin-bottom: 120px;" id="playlist">
	</ul>
</div>
<div class="w3-bottom" style="z-index: 6;">
	<div class="w3-panel w3-Brown">
		<div class="w3-row">
			<div class="w3-col s2 w3-container w3-left-align">
				<p><span id="curTime">0:00</span></p>
			</div>
			<div class="w3-col s8 w3-container w3-center">
				<p id="nowPlaying">Not playing at all.</p>
				<audio></audio>
			</div>
			<div class="w3-col s2 w3-container w3-right-align">
				<p><span id="totalTime">0:00</span></p>
			</div>
		</div>
		<div class="w3-container">
			<div id="progressbar" class="w3-progress-container">
				<div id="bufferbar" class="w3-progressbar" style="background-color:#AAA; width:0%"></div>
				<div id="timebar" class="w3-progressbar w3-blue" style="width:0%"></div>
			</div>
		</div>
		<div class="w3-container w3-center" style="padding:6px 0px;">
			<button class="w3-btn w3-tiny" id="btn-prev">Prev</button>
			<button class="w3-btn w3-tiny" id="btn-play">Play</button>
			<button class="w3-btn w3-tiny" id="btn-next">Next</button>
			<button class="w3-btn w3-tiny" id="btn-loop">Loop</button>
			<button class="w3-btn w3-tiny" id="btn-order">Order</button>
		</div>
	</div>
</div> 

<script src="./player.js"></script>
<script>
function w3_open() {
    document.getElementById("mySidenav").style.display = "block";
    document.getElementById("myOverlay").style.display = "block";
}
function w3_close() {
    document.getElementById("mySidenav").style.display = "none";
    document.getElementById("myOverlay").style.display = "none";
}
</script>
</html>