<html>
<meta charset="utf-8">
<title>Private Playlist</title>
<script src="./jquery-3.0.0.min.js"></script>
<ul id="folderlist">
<?php
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    }
	$curPath = dirname(__FILE__)."/Music";
	$fileList = scandir($curPath);
	$id = 0;
	foreach($fileList as $oneFileName)
	{
		if($oneFileName == "." || $oneFileName == "..") continue;
		$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
		$oneFilePath = $curPath."/".$oneFileName;
		
		if (is_dir($oneFilePath)) {
			$id++;
			echo "<li><a aim='{$utf8FileName}' id='$id'>{$utf8FileName}/</a></li>";
		}
	}
?>
</ul>
<ol id="playlist">
</ol>
Now Playing: <span id="nowPlaying"></span><br/>
<audio controls></audio><br/>
<button id="btn-prev">Prev</button>
<button id="btn-play">Play</button>
<button id="btn-next">Next</button>
<button id="btn-loop">Loop</button>
<button id="btn-order">Order</button>

<script src="./player.js"></script>
</html>