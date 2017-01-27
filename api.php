<?php
	$curPath = dirname(__FILE__);
	$songFolderPath = $curPath; // Change this if you'd like to put your song folders into a sub folder or somewhere else.
	
	$allowedExts = array("mp3", "wav");
	
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
	}
	
	function getFileExtension($fileName) {
		$explodeArr = explode('.',$fileName);
		$explodeArr = array_reverse($explodeArr);  
		return strtolower($explodeArr[0]);
	}
	
	function fire($status, $message, $result = null) {
		if ($result == null) unset($result);
		$httpStatusCode = array( 
			200 => "HTTP/1.1 200 OK",
			400 => "HTTP/1.1 400 Bad Request",
			401 => "HTTP/1.1 401 Unauthorized",
			403 => "HTTP/1.1 403 Forbidden",
			404 => "HTTP/1.1 404 Not Found",
			500 => "HTTP/1.1 500 Internal Server Error",
			501 => "HTTP/1.1 501 Not Implemented",
			503 => "HTTP/1.1 503 Service Unavailable",
			504 => "HTTP/1.1 504 Gateway Time-out"
		);
		header('Content-Type: application/json');
		@header($httpStatusCode[$statusCode]);
		exit(json_encode(compact("status", "message", "result")));
	}
	
	//------------------------------------------------------------------------------
	
	if(!filter_has_var(INPUT_POST, 'do')) {
		fire(400, "Illegal request!");
	}
	
	$command = strtolower($_POST['do']);
	
	switch($command) {
		case "getfolders":
			$fileList = scandir($songFolderPath);
			$folderList = array();
			foreach($fileList as $oneFileName) {
				if($oneFileName == "." || $oneFileName == "..") continue;
				$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
				$oneFilePath = "{$songFolderPath}/{$oneFileName}";
				// Check ignore strategy config file?
				if (is_dir($oneFilePath)) {
					array_push($folderList, rawurlencode($utf8FileName));
				}
			}
			$result = array("type"=>"folderList", "data"=>$folderList);
			fire(200, "OK", $result);
			break;
		case "getplaylist":
			if(!isset($_POST['folder'])) fire(400, "Illegal request!");
			$actualSongFolder = null;
			$folderList = scandir($songFolderPath);
			foreach($folderList as $oneFolderName) {
				if (GIVEMETHEFUCKINGUTF8($oneFolderName)."/"==urldecode($_POST['folder'])) {
					$actualSongFolder="{$songFolderPath}/{$oneFolderName}";
					break;
				}
			}
			if($actualSongFolder == null) fire(404, "Folder \"{$_POST['folder']}\" not exist!");
			$fileList = scandir($actualSongFolder);
			$musicList = array();
			foreach($fileList as $oneFileName) {
				$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
				$curFilePath = "{$actualSongFolder}/{$oneFileName}";
				if (in_array(getFileExtension($utf8FileName),$allowedExts)) {
					array_push($musicList, 
						array(
							"fileName"=>rawurlencode($utf8FileName),
							"fileSize"=>filesize($curFilePath),
							"modifiedTime"=>filemtime($curFilePath)
						)
					);
				}
			}
			$result = array("type"=>"fileList", "data"=>$musicList);
			fire(200, "OK", $result);
			break;
		default:
			fire(400, "Illegal request!");
	}
