<?php
	$curPath = dirname(__FILE__);
	$fileList = scandir($curPath);
	$folderList = array();
	
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    }
	
	foreach($fileList as $oneFileName) {
		if($oneFileName == "." || $oneFileName == "..") continue;
		$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
		$oneFilePath = $curPath."/".$oneFileName;
		
		if (is_dir($oneFilePath) && file_exists($oneFilePath."/GetPlaylist.php")) {
			array_push($folderList, rawurlencode($utf8FileName));
		}
	}
	
	echo json_encode($folderList);