## API Description

- All APIs are directly send to the backend of Private Cloud Music. For example, `api.php` on your server. and all APIs are using **POST** method. 

- Content-Type of your request should be `x-www-form-urlencoded`. 

- Use `do` parameter to specify what data is requested. and use other additional parameter accroding to your `do` parameter.

- Always return a **json** to process. Contains a http `status` code node, a `message` node. and the most important `result` node.

- `result` node only avaliable if the request is legal. Contains the data content `type` and the main `data` content.

------------------------------------------------------------------

## API Spec

### Get server information for later use.

* POST:
	+ 'do' = "getserverinfo"

* RETURN:
	json with the following struct.

``` json
{
	"status": 200,
	"message": "OK",
	"result": {
		"serverName": "Server Name",
		"serverShortName": "SN",
		"baseFolderNameHint": "sn",
		"preferredFormatsHint": "mp3,ogg",
		"apiVersion": 1,
		"mediaRootUrl": "http://localhost/pcm/"
	}
}
```

### Get file list of given folder name.

* POST:
	+ 'do' = "getfilelist"
	+ 'folder' = folder name (optional, default value = "")

* RETURN:
	json with the following struct. (if folder exist)

``` json
{
	"status": 200,
	"message": "OK",
	"result":{
		"type": "fileList",
		"data": {
			"musicList": [
				{
					"fileName": "FileName.mp3",
					"fileSize": 123123123,
					"modifiedTime": "1313065072",
					"additionalInfo": false
				},
				{
					"fileName": "FileName2.wav",
					"fileSize": 123123123,
					"modifiedTime": "1313065072",
					"additionalInfo": false
				}
			],
			"subFolderList": [
				"FolderA/SubfolderA", "FolderA/SubfolderB"
			]
		}
	}
}
```

### Playback

Media file located at URL: `mediaRootUrl` + `path` + `fileName`. `mediaRootUrl` can be obtained from the `getserverinfo` API, `path` is the folder path of the current media file.

Once you get the URL, just feed the url to the player.

### If anything wrong.

* RETURN:
	+ json with HTTP status code and error message.

``` json
{
	"status": 400,
	"message": "illegal request!",
}
```

------------------------------------------------------------------

## Example

We assume your Private Cloud Music backend can be access at url `http://foo.bar/baz/api.php` and we use `wget` for the following example.

### Get file list of given folder name.

``` bash
	wget --post-data "do=getfilelist&folder=Folder1" http://foo.bar/baz/api.php
```

If `Folder1` exist, this will get the audio file list inside the folder named `Folder1`. Since `do` parameter value is `getplaylist`. If that folder doesn't exist, will get an error contains the http status code and the error message.
