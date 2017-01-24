### Get folder list API:

* POST:
	+ 'do' = "getfolders"

* RETURN:
	+ json with the following struct.

``` json
{
	"status": 200,
	"message": "",
	"result":{
		"type": "folderList",
		"data": [
			"Folder1", "Folder2", "Folder3"
		]
	}
}
```

------------------------------------------------------------------

### Get file list of given folder name.

* POST:
	+ 'do' = "getplaylist"
	+ 'folder' = folder name

* RETURN:
	json with the following struct. (if folder exist)
	
``` json
{
	"status": 200,
	"message": "",
	"result":{
		"type": "fileList",
		"data": [
			{
				"fileName": "FileName.mp3",
				"fileSize": 123123123,
				"hash": "vhiudasxnuoegfqoasc=="
			},
			{
				"fileName": "FileName2.wav",
				"fileSize": 123123123,
				"hash": "qwezcrgxnuoegfqoasc=="
			}
		]
	}
}
```

------------------------------------------------------------------

### If anything wrong.

* RETURN:
	+ json with HTTP status code and error message.

``` json
{
	"status": 400,
	"message": "illegal request!",
}
```