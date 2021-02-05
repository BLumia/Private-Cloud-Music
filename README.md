# Private Cloud Music

## What's this?

Getting tired copy the music file to your phone, your iTouch, your MP3 player and other device everytime when you leave your personal computer? Why not copy them to your *personal cloud* and enjoy them everywhere? 

This is a really tinny simple web-app for user who want to listen music on his/her server conveniently. just require a server which can host php! Then just simply upload this web-app and your mp3 files, it's done. 

## How to deploy?

Download the source code, Upload them to a server can run php and place to the right path, then create folder at that path and upload your mp3 into it. Done!

Easy! right?

## Customization? 

 - index.html UI  
 You can modify `index.html` if you want some little change. If you wanna more changes or wanna do this on your own, modify `index-fast.html` . Also, create one from scratch is also okay, remember import `player.js` , add `<audio>` element, and two elements with id `playlist` and `folderlist` .  
 - player.js Logic  
 Default folder (if not provide a folder name in URL) we open will be the first avaliable folder. Change the value of `Player.path` if you wanna "imperial" a folder(name end with a `/` ). Other logic just read the code yourself and modify as you like.  
 - api.php Logic  
 All two kinds of requests send to here. See it yourself. All request simply return as json contains the most important informations you need. You can do this with any programming language you love, create one and replace `api.php` , then replace all `api.php` inside `player.js` to let request goes to the right place.

## LICENCE

[MIT](https://spdx.org/licenses/MIT.html)

----------------------------------------------

# 私有云音乐

## 这什么玩意儿？

每次去个什么地方都得把自己私藏的洗脑mp3拷到各种要带设备？还不如传自己服务器上自己爱怎么听怎么听。服务器有了，差个web-app？用我这个啊:D

这个web-app是一个非常轻巧简单易部署的云音乐网页应用。只需要一个兹磁php的服务器就能用辣！传上去这个repo的代码，然后同目录搞几个文件夹放你想到处听的歌，就完事儿辣！

## 这玩意儿怎么用？

下载代码，然后传到你的能跑php的服务器上，同路径创建几个文件夹上传你的私藏mp3，就完事儿辣！

## 能魔改嘛？

当然啦！尽量保持代码和结构简单的目的就在于保持“方便部署”和“方便魔改”的特点。代码基本打开之后看两眼就知道是怎么回事儿了，不懂代码？下面有一些简单帮助：

 - 网页前端略丑啊这个 `index.html`  
 你可以用你任意喜欢的编辑器编辑 `index.html` 修改成你要的效果，当然如果你想大改，还是从 `index-fast.html` 改起比较好。当然，你也可以完全自己写前端页面，别忘了，除了导入 `player.js` 之外，网页一定要有一个 `<audio>` 标签，以及两个id分别为 `playlist` 和 `folderlist` 的元素（这里是列表组）。
 - 钦定更多逻辑吼吗？ `player.js`  
 如果你没有从URL钦定一个文件夹的话，你打开网页后会默认载入第一个可用的文件夹。如果你想钦定一个文件夹，直接修改 `Player.path` 的值为你要钦定的文件夹就好（文件夹名称末尾需要有一个 `/` 结尾）。其它针对这个文件的定制基本都是改源码逻辑的，所以你至少得能看懂js，然后改就是了。
 - 请求都去哪了 `api.php`  
 所有的请求都会发送到 `api.php` ，且所有的请求返回值都是一个包含着你肯定需要用到的内容的json。详细内容自己看看就清楚。当然，你也可以用任意你喜欢的语言实现这个文件本身的功能，并替代这个文件。别忘了去 `player.js` 中替换所有发送到 `api.php` 的请求到正确的地方就好。
 
# 协议？

[MIT](https://spdx.org/licenses/MIT.html)
