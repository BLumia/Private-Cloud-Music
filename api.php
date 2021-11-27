<?php
	$curPath = dirname(__FILE__);
	$songFolderPath = $curPath; // Change this if you'd like to put your song folders into a sub folder or somewhere else.
	$serverInfo = array(
		"serverName" => "Private Cloud Music",
		"serverShortName" => "PCM",
		// This tell the client the preffered folder name if it supports local storage.
		// Optional, user can still able to change it.
		"baseFolderNameHint" => "pcm",
		// This tell the server which format is preferred if there are multiple formats available for a same music.
		// Optional, server could still simply ignore this hint.
		"preferredFormatsHint" => "mp3,ogg",
	);

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
		if (function_exists('http_response_code')) {
			http_response_code(intval($status));
		} else {
			@header($httpStatusCode[$status]);
		}
		header('Content-Type: application/json');
		exit(json_encode(compact("status", "message", "result")));
	}
	
	//------------------------------------------------------------------------------
	
	if(!filter_has_var(INPUT_POST, 'do')) {
		fire(400, "Illegal request!");
	}
	
	$command = strtolower($_POST['do']);
	
	switch($command) {
		case "getserverinfo":
			$urlPath = pathinfo($_SERVER['REQUEST_URI'], PATHINFO_DIRNAME);
			$result = array(
				"apiVersion" => 1,
				// This is required for concatenate the full media url for playback since we only return a file name in getfilelist API.
				// for this implementaion, the media root url is the same base url as the api url.
				"mediaRootUrl" => ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://').$_SERVER['HTTP_HOST'].$urlPath,
			);
			fire(200, "OK", array_merge($serverInfo, $result));
			break;
		case "getfilelist":
			$requestFolderStr = "";
			if(isset($_POST['folder'])) $requestFolderStr = $_POST['folder'];
			if(substr($requestFolderStr, -1) != '/' && strlen($requestFolderStr) > 1) $requestFolderStr.='/';
			$actualSongFolder = null;
			if(is_dir($songFolderPath."/".urldecode($requestFolderStr))) {
				$actualSongFolder = $songFolderPath."/".urldecode($requestFolderStr);
			} else {
				// Solve problem if using weird charset.
				// This will cause problem if given path is not a single folder.
				// eg. "Folder/Subfolder/".
				$folderList = scandir($songFolderPath);
				foreach ($folderList as $oneFolderName) {
					if (GIVEMETHEFUCKINGUTF8($oneFolderName)."/"==urldecode($requestFolderStr)) {
						$actualSongFolder="{$songFolderPath}/{$oneFolderName}";
						break;
					}
				}
			}
			if ($actualSongFolder == null) fire(404, "Folder \"{$requestFolderStr}\" not exist!");
			$fileList = scandir($actualSongFolder);
			$musicList = array();
			$subFolderList = array();
			foreach ($fileList as $oneFileName) {
				if ($oneFileName == "." || $oneFileName == "..") continue;
				$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
				$curFilePath = "{$actualSongFolder}/{$oneFileName}";
				$infoJsonFile = pathinfo($curFilePath, PATHINFO_FILENAME);
				$infoJsonFilePath = "{$actualSongFolder}/{$infoJsonFile}.info.json";
				if (is_dir($curFilePath)) {
					array_push($subFolderList, $requestFolderStr.rawurlencode($utf8FileName));
					continue;
				}
				if (in_array(getFileExtension($utf8FileName), $allowedExts)) {
					array_push($musicList, 
						array(
							"fileName"       => rawurlencode($utf8FileName),
							"fileSize"       => filesize($curFilePath),
							"modifiedTime"   => filemtime($curFilePath),
							"additionalInfo" => file_exists($infoJsonFilePath)
						)
					);
				}
			}
			$result = array("type"=>"fileList", "data"=>compact("musicList", "subFolderList"));
			fire(200, "OK", $result);
			break;
		default:
			fire(400, "Illegal request!");
	}
