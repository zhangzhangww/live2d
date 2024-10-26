#   :sparkles:Live2d For Web:sparkles:
-   [简体中文](./README_CN.md)|Englis
-   [:link:InstructionsForUse](#InstructionsForUse)
-   [:link:NewStructure](#NewStructure)
-   [:link:ThankYou](#ThankYou)
-   [:link:referenceLink](#ReferenceLink)
-   [:link:demoAddress](https://lrplrplrp.github.io/live2dDemo.html)
>My foreign language proficiency is not very good, and the following content is translated by machine. I hope foreign friends can understand
-   Hello everyone, after grinding for so long, we have finally improved the new version of Live2d for the ship. First of all, thank you to [guansss](https://github.com/guansss/pixi-live2d-display)  The Live2D framework of the experts and the previous experts who wrote Live2D. This modification has redesigned the structure of waifu-jps.json and model_ist.json, and allows for individual configuration of waifu-jps.json for a single model. The model's address can also be configured freely. Overall, it supports more configurations, supports more models, and optimizes the configuration logic.
##  InstructionsForUse
-   Quick to use, simply add the following code inside the head tag, with load.exe as your load.exe file address
```html
<script src="loads.js"></script>
```
-   But you definitely don't want your paper man wife to be the same wooden man as before speaking, so please see the detailed configuration below
-Document Description:
```
Index.min.js -- live2d framework
Live2d.min.js -- live2d core (compatible with models 2.0 and below)
Live2dcubismcore.min.js -- live2d core (compatible with models 3.0 and above)
Pixi.min.js -- Pixijs rendering
Loads.js - Resource loading file
Waif-tips.js - Model, Text Box, Button Loading
Waifu. css - Model, Text Box Style File
All.min.css - Button icon style file
Waif-tips.json - default model text file
Waif-tips-XXX.json - Single Model Text File
```
***
-   Resource file address configuration
-   [loads.js](./loads.js#L28)
```javascript
async function loadScriptsInOrder(){
	if (screen.width >= 768) {
	await Promise.all([
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
***
-   Model Canvas Configuration
-   [waifu-tips.js](./waifu-tips.js#L1)
```javascript
window.PIXI = PIXI;// Please ignore
const live2d = PIXI.live2d;// Please ignore
const canvasWidth = 300;// Canvas width
const canvasHeigth = 400;// Canvas height
const firstModelId=0;// First loaded model ID
const firstModelTexturesId=0;// First loaded material ID
const github="https://github.com/lrplrplrp/live2d" //GitHub address
```
>The following content is for backend configuration, fork please go to the repository[ https://github.com/lrplrplrp/live2d_api ]( https://github.com/lrplrplrp/live2d_api )
***
-   Model address and model loading configuration
```json
{
"url":" https://raw.bgithub.xyz/lrplrplrp/live2d_api/master/model/genshin/BCSZ1.1/BCSZ1.1.model3.json ",
"URLDescription": "The structure file of the model, 2.0 and below are modeljson or index.json, and 3.0 and above are model3.json",
"tipsUrl":"./waifu-tips-BCSZ.json",
"TipURLDescription": "Single model text file address. If it is empty, use the address configured in load. js",
"config":{
    "x":0,
    "Explanation of x": "The horizontal axis offset of the model is set to 0 by default",
    "y":0,
    "Explanation": "The vertical axis of the model is offset and defaults to 0",
    "scaleX":1.8,
    "ScaleX Description": "The horizontal axis of the model is scaled to 1 by default",
    "scaleY":1.8,
    "Scale Y Explanation": "The vertical axis of the model is scaled, default is 1"
    }
}
```
***
-   Model Text File Configuration
-   Due to the file being too long, we will only briefly explain the node classification here
-   [Interactions in Special Cases of Messages Model](./waifu-tips.json#L2)
-   [hover over mouse interaction when hovering over certain elements](./waifu-tips.json#L22)
-   [click interaction when clicking on certain elements](./waifu-tips.json#L313)
-   [timer - interaction at a specific time](./waifu-tips. json#L329)
##  NewStructure
-   In order to make the interaction more vivid, the structure of waif-tips.json has been redesigned, which can trigger actions and expressions during interaction and add text to the actions. However, because the actions and expressions of each model are named differently, a separate file needs to be configured
-   [waifu-tips-BCSZ.json](./waifu-tips-BCSZ.json#L23)
```json
"selector": "#waifu-tool .fa-paper-plane",
"interaction":{
    "text": [" Do you want to play Airplane Wars? "," This button says Don't click.", "What, do you want to play a game with me?", "I heard it can make you jump!"],
    "motion":"Start"
}
```
-   [waifu-tips-BCSZ.json](./waifu-tips-BCSZ.json#L272)
```json
"motion":{
    "Tap早上好":" Good morning, hmm? Why do you look so lethargic? Didn't you sleep well? Oh, did you do something bad last night",
    "Tap中午好": "Hmm, what are you going to eat for lunch? I'm tired of Oily bean curd, and I want to eat something light. I haven't seen the little girl of Shexingjia for a long time, so let's go to eat her Dim sum.",
    "Tap晚上好":" The moonlight tonight is so clear, it's a waste not to do anything. Come with me for a walk under the moon, don't refuse"
}
```
-   When there are both actions and expressions in the interactive configuration, the expression will be played first, and the priority of the interactive text will be higher than that of the action text, while the priority of other texts will be higher than that of the interactive text
##  ThankYou
- [stevenjoezhang]( https://github.com/stevenjoezhang )
- [fghrsh]( https://github.com/fghrsh )
- [guansss]( https://github.com/guansss )
- [Akilarlxh]( https://github.com/Akilarlxh )
##  ReferenceLink
- [ https://github.com/stevenjoezhang/live2d-widget ]( https://github.com/stevenjoezhang/live2d-widget )
- [ https://github.com/fghrsh/live2d_api ]( https://github.com/fghrsh/live2d_api )
- [ https://github.com/guansss/pixi-live2d-display ]( https://github.com/guansss/pixi-live2d-display )
- [ https://github.com/Akilarlxh/live2d_api ]( https://github.com/Akilarlxh/live2d_api )