#   :sparkles:看板娘前端:sparkles:
-   简体中文|[Englis](./README.md)
-   [:link:食用说明](#食用说明)
-   [:link:新增结构](#新增结构)
-   [:link:鸣谢](#鸣谢)
-   [:link:参考链接](#参考链接)
##  食用说明
-   快速使用，只需在head标签内加上如下代码
```html
<script src="loads.js"></script>
```
-   这种方法很快，但会因CDN失效导致无法显示，所以强烈建议了解一下手动配置地址文件的方法
-   文件说明：
```
index.min.js--live2d框架
live2d.min.js--live2d核心(兼容2.0及以下版本模型)
live2dcubismcore.min.js--live2d核心(兼容3.0及以上版本模型)
pixi.min.js--pixijs渲染
loads.js--资源加载文件
waifu-tips.js--模型，文本框，按钮加载
waifu.css--模型，文本框样式文件
all.min.css--按钮图标样式文件
waifu-tips.json--默认模型文本文件
waifu-tips-XXX.json--单模型文本文件
```
-   资源文件地址配置
-   [loads.js](./loads.js#L28)
```javascript
async function loadScriptsInOrder(){
	if (screen.width >= 768) {//使用宽度判断设备是否适合加载
	await Promise.all([//以下文件地址可根据实际情况进行更改
			loadExternalResource(live2d_path + "pixi.min.js", "js"),
			loadExternalResource("./live2d.min.js", "js"),
			loadExternalResource("./live2dcubismcore.min.js", "js"),
			loadExternalResource("http://cdn.bootcss.com/jquery/1.11.3/jquery.min.js", "js"),
			loadExternalResource(live2d_path + "waifu.css", "css"),
			loadExternalResource("https://cdn.bootcdn.net/ajax/libs/font-awesome/6.6.0/css/all.min.css", "css")
		])
	await loadExternalResource("./index.min.js", "js");
	await loadExternalResource(live2d_path + "waifu-tips.js", "js");
	initWidget({
		waifuPath: live2d_path + "waifu-tips.json",
		modelListPath: "./model_list.json"
	});
}}
```
-   [model_list.json](./model_list.json#L3)
```json
    {
      "url":"https://raw.bgithub.xyz/lrplrplrp/live2d_api/master/model/genshin/BCSZ1.1/BCSZ1.1.model3.json",
      "url说明":"模型的结构文件,2.0及以下为 model.json 或 index.json ，3.0以上为 model3.json 结尾",
      "tipsUrl":"./waifu-tips-BCSZ.json",
      "tipsUrl说明":"单模型文本文件地址，若为空，则使用load.js中配置的地址。",
      "config":{
        "x":0,
        "x说明":"模型的横轴偏移，默认为0",
        "y":0,
        "y说明":"模型的纵轴偏移，默认为0",
        "scaleX":1.8,
        "scaleX说明":"模型的横轴缩放，默认为1",
        "scaleY":1.8,
        "scaleY说明":"模型的纵轴缩放，默认为1"
      }
    }
```
##  新增结构

##  鸣谢

##  参考链接