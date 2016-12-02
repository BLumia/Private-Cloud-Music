<?php
	if(!isset($_POST['do'])) exit("[]");
	
	$curPath = dirname(__FILE__);
	$songFolderPath = $curPath; // Change this if you'd like to put your song folders into a sub folder or somewhere else.
	$command = strtolower($_POST['do']);
	
	function convertToEncoding($text, $encoding = "UTF-8") {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), $encoding, $text);
    }
	
	function getActuallEncoding($text) {
		$encodingList = array('UTF-8', 'gb2312', 'ISO-8859-1');
		foreach($encodingList as $oneEncode) {
			$oneResult = iconv(mb_detect_encoding($text, mb_detect_order(), true), $oneEncode, $text);
			if(md5($oneResult) == md5($text)) return $oneEncode;
		}
		return "UNKNOWN"; // This return value may cause problem.
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
				$utf8FileName = convertToEncoding($oneFileName);
				$oneFilePath = $songFolderPath."/".$oneFileName;
				// Check ignore strategy config file?
				if (is_dir($oneFilePath) /* && file_exists($oneFilePath."/GetPlaylist.php") */) {
					array_push($folderList, array(rawurlencode($utf8FileName), getActuallEncoding($oneFileName)));
				}
			}
			exit(json_encode($folderList));
		case "getplaylist":
			if(!isset($_POST['folder'])) exit("[]");
			$fileList = scandir($songFolderPath."/".convertToEncoding(rawurldecode($_POST['folder']), "gb2312")); 
			$musicList = array();
			foreach($fileList as $oneFileName) {
				if (getFileExtension(convertToEncoding($oneFileName)) == 'mp3') {
					array_push($musicList, rawurlencode(convertToEncoding($oneFileName)));
				}
			}
			exit(json_encode($musicList));
		default:
			exit("[]");
	}
