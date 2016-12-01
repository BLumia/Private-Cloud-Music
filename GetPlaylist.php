<?php
	
	function GIVEMETHEFUCKINGUTF8($text) {
		return iconv(mb_detect_encoding($text, mb_detect_order(), true), "UTF-8", $text);
    }
	$musicList = array();


	$folderName=$_GET['foldername'];
	$curMainPath = dirname(__FILE__)."/Music";
	$fileList = scandir($curMainPath);
	$id = 0;
	foreach($fileList as $oneFileName)
	{
		if($oneFileName == "." || $oneFileName == "..") continue;
		$utf8FileName = GIVEMETHEFUCKINGUTF8($oneFileName);
		$oneFilePath = $curMainPath."/".$oneFileName;
		
		if (is_dir($oneFilePath)) {
			$id++;
			if($utf8FileName==$folderName)
			{
				$curPath=$oneFilePath;
				break;
			}
		}
	}
	$fileList = scandir($curPath);
	function getFileExtension($fileName) {
		$explodeArr = explode('.',$fileName);
		$explodeArr = array_reverse($explodeArr);  
		return strtolower($explodeArr[0]);
	}
	
	foreach($fileList as $oneFileName) {
		if (getFileExtension(GIVEMETHEFUCKINGUTF8($oneFileName)) == 'mp3') {
			array_push($musicList, rawurlencode(GIVEMETHEFUCKINGUTF8($oneFileName)));
		}
	}
	
	echo json_encode($musicList);