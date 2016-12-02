<?php
	if(!isset($_POST['do'])) exit("[]");
	
	$curPath = dirname(__FILE__);
	$songFolderPath = $curPath; // Change this if you'd like to put your song folders into a sub folder or somewhere else.
	$command = strtolower($_POST['do']);
	
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    }
	function GIVEMETHEFUCKINGGB2312($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "gb2312", $text);
    }
	
	function getFileExtension($fileName) {
		$explodeArr = explode('.',$fileName);
		$explodeArr = array_reverse($explodeArr);  
		return strtolower($explodeArr[0]);
	}
	
	switch($command) {
		case "getfolders":
			$fileList = scandir($songFolderPath);
			$folderList = array();
			foreach($fileList as $oneFileName) {
				if($oneFileName == "." || $oneFileName == "..") continue;
				$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
				$oneFilePath = $songFolderPath."/".$oneFileName;
				// Check ignore strategy config file?
				if (is_dir($oneFilePath) /* && file_exists($oneFilePath."/GetPlaylist.php") */) {
					array_push($folderList, rawurlencode($utf8FileName));
				}
			}
			exit(json_encode($folderList));
		case "getplaylist":
			if(!isset($_POST['folder'])) exit("[]");
			$fileList = scandir($songFolderPath."/".GIVEMETHEFUCKINGGB2312(rawurldecode($_POST['folder']))); 
			$musicList = array();
			foreach($fileList as $oneFileName) {
				if (getFileExtension(GIVEMETHEFUCKINGUTF8($oneFileName)) == 'mp3') {
					array_push($musicList, rawurlencode(GIVEMETHEFUCKINGUTF8($oneFileName)));
				}
			}
			exit(json_encode($musicList));
		default:
			exit("[]");
	}
