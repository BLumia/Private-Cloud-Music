<?php
	if(!isset($_POST['do'])) exit("[]");
	
	$curPath = dirname(__FILE__);
	$songFolderPath = $curPath; // Change this if you'd like to put your song folders into a sub folder or somewhere else.
	$command = strtolower($_POST['do']);
	
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
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
				if (is_dir($oneFilePath)) {
					array_push($folderList, rawurlencode($utf8FileName));
				}
			}
			exit(json_encode($folderList));
		case "getplaylist":
			if(!isset($_POST['folder'])) exit("[]");
			$actualSongFolder="";
			$fileList = scandir($songFolderPath);
			foreach($fileList as $oneFileName) {
				if (rawurlencode(GIVEMETHEFUCKINGUTF8($oneFileName))."/"==$_POST['folder']) {
					$actualSongFolder=$songFolderPath."/".$oneFileName;
					break;
				}
			}
			$fileList = scandir($actualSongFolder);
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
