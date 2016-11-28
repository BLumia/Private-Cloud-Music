<html>
<meta charset="utf-8">
<title>Private Playlist</title>
<script src="./jquery-3.0.0.min.js"></script>
<ul id="folderlist">
<?php
	$curPath = dirname(__FILE__);
	$fileList = scandir($curPath);
	
	foreach($fileList as $oneFileName) {
		if($oneFileName == "." || $oneFileName == "..") continue;
		$oneFilePath = $curPath."/".$oneFileName;
		if (is_dir($oneFilePath) && file_exists($oneFilePath."/GetPlaylist.php")) {
			echo "<li><a aim='{$oneFileName}'>{$oneFileName}/</a></li>";
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