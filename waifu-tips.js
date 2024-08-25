
window.PIXI = PIXI;
const live2d = PIXI.live2d;
const canvasWidth = 300;//画布宽
const canvasHeigth = 400;//画布高
const firstModelId=0;//首次加载的模型id
const firstModelTexturesId=0;//首次加载的材质id
const github="https://github.com/lrplrplrp/live2d"

async function loadWidget(config) {
	let {
		waifuPath,
		modelListPath
	} = config;
	let modelList,
		waifuTips,
		model = null;
	localStorage.removeItem("waifu-display");
	sessionStorage.removeItem("waifu-text");
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
			<div id="waifu-tips"></div>
			<canvas id="live2d"></canvas>
			<div id="waifu-tool">
				<span class="fa fa-xl fa-comment"></span>
				<span class="fa fa-xl fa-solid fa-cloud"></span>
				<span class="fa fa-xl fa-paper-plane"></span>
				<span class="fa fa-xl fa-user-circle"></span>
				<span class="fa fa-xl fa-street-view"></span>
				<span class="fa fa-xl fa-info-circle"></span>
				<span class="fa fa-xl fa-brands fa-github"></span>
				<span class="fa fa-xl fa-times"></span>
			</div>
		</div>`);
	document.getElementById("live2d").width = canvasWidth;//fa-brands fa-github   fa-solid fa-cloud 
	document.getElementById("live2d").height = canvasHeigth;

	const app = new PIXI.Application({
		width: canvasWidth,
		height: canvasHeigth,
		view: document.getElementById('live2d'),
		autoStart: true,
		transparent: true
	});

	// setTimeout(() => {
	// 	document.getElementById("waifu").style.bottom = 0;
	// }, 0);

	if (localStorage.getItem("skin") === "furvous") document.getElementById("waifu-tips").style.color = "white";

	function randomSelection(obj) {
		return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
	}

	function idSelection(obj, id) {
		return Array.isArray(obj) ? obj[id] : obj;
	}

	// 检测用户活动状态，并在空闲时显示消息
	let userAction = false,
		userActionTimer=0,
		messageTimer;
	window.addEventListener("mousemove", () => userAction = true);
	window.addEventListener("keydown", () => userAction = true);
	setInterval(() => {
		if (userAction) userActionTimer=0;
	}, 1000);

	let weather=await getWeather();
	//在特定时间执行一次操作
	setInterval(async () => {
		const now=new Date();
		waifuTips.timer.forEach(({
			date,
			time,
			interaction
		}) => {
			if (checkDateTime(date,time,now)) {
				loadInteraction(interaction);
			}
		});
		if(userActionTimer>=60)loadInteraction(waifuTips.messages.idleMsg);
		const nowWeather=await getWeather();
		if(weather!=nowWeather){
			showWeatherText();
			weather=nowWeather;
		}
	}, 60000);

	const firstMin=new Date().getMinutes();
	function checkDateTime(date,time,now){
		function checkDate(){
			if(!date)return true;
			let dateSplit=date.split("-");
			after = dateSplit[0],
			before = dateSplit[1] || after;
			let afterSplit=after.split("/"),
			beforeSplit=before.split("/");
			if ((afterSplit[0] <= now.getMonth() + 1 && now.getMonth() + 1 <=beforeSplit[0]) && 
			(afterSplit[1] <= now.getDate() && now.getDate() <= beforeSplit[1])) return true;
			return false;
		}
		function checkTime(){
			if(!time)return true;
			let timeSplit=time.split("-");
			after = timeSplit[0],
			before = timeSplit[1] || after;
			let afterSplit=after.split(":"),
			beforeSplit=before.split(":");
			if(timeSplit[1]){
				if((afterSplit[0] <= now.getHours() && now.getHours() <=beforeSplit[0])){
					if(firstMin==now.getMinutes())return true;
					else return false;
				}
			}
			if ((afterSplit[0] <= now.getHours() && now.getHours() <=beforeSplit[0]) && 
			(afterSplit[1] <= now.getMinutes() && now.getMinutes() <= beforeSplit[1])) return true;
			return false;
		}
		return (checkDate() && checkTime())
	}
	

	async function initModel() {
		let modelId = localStorage.getItem("modelId"),
			modelTexturesId = localStorage.getItem("modelTexturesId");
		if (modelId === null) {
			// 首次访问加载 指定模型 的 指定材质
			modelId = firstModelId; // 模型 ID
			modelTexturesId = firstModelTexturesId; // 材质 ID
		}

		await loadModelConfig(modelId);
		loadModel(modelId, modelTexturesId).then(result => {
			model = result;
			window.addEventListener("mouseover", event => {
				for (let {
					selector,
					interaction
				} of waifuTips.mouseover) {
					if (!event.target.matches(selector)) continue;
					console.log(interaction);
					if(interaction)loadInteraction(interaction);
					return;
				}
			});
			window.addEventListener("click", event => {
				for (let {
					selector,
					interaction
				} of waifuTips.click) {
					if (!event.target.matches(selector)) continue;
					if(interaction)loadInteraction(interaction,(text)=>text.replace("{text}", event.target.innerText));
					return;
				}
			});
			
		});
	}

	function registerEventListener() {
		document.querySelector("#waifu-tool .fa-comment").addEventListener("click", showHitokoto); //showHitokoto
		document.querySelector("#waifu-tool .fa-cloud").addEventListener("click", showWeatherText);//fa-cloud
		document.querySelector("#waifu-tool .fa-paper-plane").addEventListener("click", () => {
			if (window.Asteroids) {
				if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
				window.ASTEROIDSPLAYERS.push(new Asteroids());
			} else {
				const script = document.createElement("script");
				script.src = "";
				document.head.appendChild(script);
			}
		});
		document.querySelector("#waifu-tool .fa-user-circle").addEventListener("click", loadOtherModel);
		document.querySelector("#waifu-tool .fa-street-view").addEventListener("click", loadRandModel);
		document.querySelector("#waifu-tool .fa-info-circle").addEventListener("click", () => {loadInteraction(waifuTips.messages.about);});
		document.querySelector("#waifu-tool .fa-github").addEventListener("click", () => {open(github);});
		document.querySelector("#waifu-tool .fa-times").addEventListener("click", () => {
			localStorage.setItem("waifu-display", Date.now());
			//showMessage(waifuTips.messages.close, 11);
			document.getElementById("waifu").style.bottom = "-500px";
			setTimeout(() => {
				//document.getElementById("waifu").style.display = "none";//有动作就会出现无头的情况
				app.stop();
				document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
			}, 3000);
		});

		// const devtools = () => { };//试了几个方法都不是很准确，放弃了
		// devtools.toString = () => {
		// 	showMessage(waifuTips.messages.devtools, 9);
		// };
		// console.log("%c", devtools);

		
		window.addEventListener("copy", () => {
			loadInteraction(waifuTips.messages.copy,null,priority=4);
		});
		window.addEventListener("visibilitychange", () => {
			if (!document.hidden) loadInteraction(waifuTips.messages.focus);
		});
		const toggle = document.getElementById("waifu-toggle");
		toggle.addEventListener("click", () => {
			app.start();
		});
	}



	function welcomeMessage() {
		let text;
		if (location.pathname === "/lrplrplrp/") { // 如果是主页，可在浏览器后台输入location.pathname确定判断条件
			loadInteraction(waifuTips.messages.home)
		} 
		if (document.referrer !== "") {
			const referrer = new URL(document.referrer),
				domain = referrer.hostname.split(".")[1];
			if (location.hostname === referrer.hostname) text = waifuTips.messages.location;
			for(key in waifuTips.messages.domain)if(domain===key)text=waifuTips.messages.domain[key];
			if(!text) text = waifuTips.messages.domain_other;
		} 
		if(!text)text = waifuTips.messages.path_other;
		loadInteraction(text);
	}

	function showHitokoto() {
		// 增加 hitokoto.cn 的 API
		fetch("https://v1.hitokoto.cn?c=k")
			.then(response => response.json())
			.then(result => {
				showMessage(result.hitokoto,9);
			});
	}

	//获得当前天气的API
	//晴，多云，小雨，阴
	async function getWeather() {
		const now = new Date().getHours();
		let weather;
		await $.ajax({
			type: "GET",
			url: "https://cdn.weather.hao.360.cn/sed_api_weather_info.php?app=360chrome",
			dataType: "jsonp",
			jsonp: "_jsonp", //参数名  
			success: function (result) {
				console.log(result);
				if (now <= 9) weather = result.weather[0].info.dawn[1];
				else if (now > 9 && now <= 16) weather = result.weather[0].info.day[1];
				else weather = result.weather[0].info.night[1];
			}
		});
		return weather;
	}

	//根据天气获取文本
	async function showWeatherText() {
		const weather = await getWeather();
		if ("weather" in waifuTips && weather in waifuTips.weather) {
			const text = waifuTips.weather[weather];
			console.log(text);
			loadInteraction(text);
		} else loadInteraction({text:`现在的天气是${weather}`});
	}

	//作者并没兼容老版模型的hitarea，需要自己完成点击区域的创建
	function drawHitArea(model) {
		if (Object.keys(model.internalModel.hitAreas).length > 0) {
			model.on('hit', (hitarea) => {
				setMotion( "Tap" + hitarea);
			});
		} else if ("hit_areas_custom" in model.internalModel.settings.json) {
			//没想到特别好的办法，只能先将就一下了
			model.on('click', (hitarea) => {
				const canvasPro = document.getElementById("live2d").getBoundingClientRect();
				//console.log(hitarea.data.originalEvent.clientX, hitarea.data.originalEvent.clientY);
				if (hitarea.data.originalEvent.clientY - canvasPro.top < canvasHeigth / 2) setMotion( "flick_head");
				else setMotion( "tap_body");
			});
		}
	}

	//以下是查看官方代码研究失败的废弃代码，仅供参考，从官方的代码逻辑实在是难理解参数的意思
	/*function drawHitArea(model) {
		const hitAreasCustom = model.internalModel.settings.json.hit_areas_custom;
		const canvasPro=document.getElementById("live2d").getBoundingClientRect();
		const rect=hitareaSwap(model.internalModel.originalWidth,hitAreasCustom);//internalModel.originalWidth
		const zero={"x":(canvasPro.right-canvasPro.left)/2,"y":(canvasPro.bottom-canvasPro.top)/2}
		console.log(rect);
		console.log(zero);
		let rectanglex = new PIXI.Graphics();
		rectanglex.lineStyle(4, 0x000000, 1);
		//rectanglex.drawRect(model.width/2, 0, 0,1000);
		rectanglex.drawRect(model.internalModel.originalWidth/2, 0, 0,model.internalModel.originalHeight);//internalModel.originalHeight
		rectanglex.endFill();
		let rectangley = new PIXI.Graphics();
		rectangley.lineStyle(4, 0x000000, 1);
		//rectangley.drawRect(0, model.height/2, model.width,0);
		rectangley.drawRect(0, model.internalModel.originalHeight/2, model.internalModel.originalWidth,0);
		rectangley.endFill();
		let rectangle = new PIXI.Graphics();
		//rectangle.beginFill(0x66CCFF);
		rectangle.lineStyle(4, 0xFF3300, 1);
		//rectangle.drawRect(500, 600, 100,120);
		//rectangle.drawRect(rect.head_x[0]+model.x, rect.head_y[1]+model.y, rect.head_y[0]-rect.head_x[0],rect.head_x[1]- rect.head_y[1]);
		rectangle.drawRect(rect.head_x[0], rect.head_y[0], rect.head_x[1]-rect.head_x[0],rect.head_y[1]- rect.head_y[0]);
		console.log(rect.head_x[0], rect.head_y[1], rect.head_y[0]-rect.head_x[0],rect.head_x[1]- rect.head_y[1]);
		rectangle.endFill();
		let rectangle1 = new PIXI.Graphics();
		//rectangle.beginFill(0x66CCFF);
		rectangle1.lineStyle(4, 0xFF3300, 1);
		//rectangle1.drawRect(rect.body_x[0], rect.body_y[1], rect.body_y[0]-rect.body_x[0],rect.body_x[1]- rect.body_y[1]);
		rectangle1.drawRect(rect.body_x[0], rect.body_y[0], rect.body_x[1]-rect.body_x[0],rect.body_y[1]- rect.body_y[0]);
		rectangle1.endFill();
		model.addChild(rectangle);
		model.addChild(rectangle1);
		model.addChild(rectanglex);
		model.addChild(rectangley);
		console.log(document.getElementById("live2d").getBoundingClientRect());
		
	}

	//转换关系（鼠标x坐标-画布left）*（2/画布宽）*8/3-1
	//（鼠标y坐标-画布top）*-（2/画布宽）*8/3+1
	//e >= t[0] && e <= i[0] && r <= t[1] && r >= i[1]//t:head_x,i:head_y,e:转换后x,r:转换后y
	//根据代码逻辑正常的xmin是head_x[0],xmax是head_y[0],ymin是head_y[1],ymax是head_x[1]
	//画布中心点为0,0
	function hitareaSwap(width,hitarea) {
		function xSwap(width,x){
			//return (x+1)*3/8*canvas.width/2;
			return (x+1)*width/2;
		}
		function ySwap(width,y){
			//return (y+1)*3/8*canvas.width/(-2);
			return (y-1)*width/(-2);
		}
		return {
			"head_x": [xSwap(width,hitarea.head_x[0]), xSwap(width,hitarea.head_x[1])],
			"head_y": [ySwap(width,hitarea.head_y[0]), ySwap(width,hitarea.head_y[1])],
			"body_x": [xSwap(width,hitarea.body_x[0]), xSwap(width,hitarea.body_x[1])],
			"body_y": [ySwap(width,hitarea.body_y[0]), ySwap(width,hitarea.body_y[1])]
		};
		 var i = C.getBoundingClientRect(), //i是画布矩形
			console.log("getBoundingClientRect", i);
		o = $({
				x: i.left + i.width / 2,
				y: i.top + i.height * X
			}, {
				x: t.clientX, //274//0.9999999552965164
				y: t.clientY //693//-0.7597402204070001
			}, i),
			n = m(o.x - i.left), //鼠标相对画布坐标
			s = T(o.y - i.top); //
		function h(t, i) {
			return t.x * i.x + t.y * i.y
		}

		function l(t, i) {
			var e = Math.sqrt(t * t + i * i);
			return {
				x: t / e,
				y: i / e
			}
		}

		function m(t) { //t[0]=2/画布宽，t[12]实在看不懂，一直等于-1
			var i = G.transformX(t); //return this.tr[0] * t * 8 / 3 + this.tr[12] //tr[0]:缩放x tr[12]:x位置
			return B.invertTransformX(i) //
		}

		function T(t) {
			var i = G.transformY(t);
			return B.invertTransformY(i)
		}

		function $(t, i, e) { //t画布中心i鼠标e画布矩形
			function r(t, i) {
				return 180 * Math.acos(h({
					x: 0,
					y: 1
				}, l(t, i))) / Math.PI
			}
			if (i.x < e.left + e.width && i.y < e.top + e.height && i.x > e.left && i.y > e.top) return i;
			var o = t.x - i.x,
				n = t.y - i.y,
				s = r(o, n);
			i.x < t.x && (s = 360 - s);
			var _ = 360 - r(e.left - t.x, -1 * (e.top - t.y)),
				a = 360 - r(e.left - t.x, -1 * (e.top + e.height - t.y)),
				$ = r(e.left + e.width - t.x, -1 * (e.top - t.y)),
				u = r(e.left + e.width - t.x, -1 * (e.top + e.height - t.y)),
				p = n / o,
				f = {};
			if (s < $) {
				var c = e.top - t.y,
					d = c / p;
				f = {
					y: t.y + c,
					x: t.x + d
				}
			} else if (s < u) {
				var g = e.left + e.width - t.x,
					y = g * p;
				f = {
					y: t.y + y,
					x: t.x + g
				}
			} else if (s < a) {
				var m = e.top + e.height - t.y,
					T = m / p;
				f = {
					y: t.y + m,
					x: t.x + T
				}
			} else if (s < _) {
				var P = t.x - e.left,
					S = P * p;
				f = {
					y: t.y - S,
					x: t.x - P
				}
			} else {
				var v = e.top - t.y,
					L = v / p;
				f = {
					y: t.y + v,
					x: t.x + L
				}
			}
			return f
		} 
	}*/

	//优先级规划：交互优先级：1 ，text优先级：3，各类特殊事件优先级：9
	function showMessage(text,priority,timeout) {
		if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority))
			return;
		if (messageTimer) {
			clearTimeout(messageTimer);
			messageTimer = null;
		}
		text = randomSelection(text);
		timeout=timeout?timeout:countChars(text)*1000;
		sessionStorage.setItem("waifu-text", priority);
		const tips = document.getElementById("waifu-tips");
		tips.innerHTML = text;
		tips.classList.add("waifu-tips-active");
		messageTimer = setTimeout(() => {
			sessionStorage.removeItem("waifu-text");
			tips.classList.remove("waifu-tips-active");
		}, timeout);
	}

	async function loadModelList() {
		const response = await fetch(modelListPath);
		modelList = await response.json();
	}

	async function loadWaifuTips(modelId) {
		const modelconfig = modelList.models[modelId];
		let path;
		if ('tipsUrl' in modelconfig && modelconfig.tipsUrl != "") {
			path = modelList.models[modelId].tipsUrl;
		} else path = waifuPath;
		const response = await fetch(path);
		waifuTips = await response.json();
		if(waifuTips.messages.meetMsg)loadInteraction(waifuTips.messages.meetMsg)
	}

	async function loadModelConfig(modelId) {
		if (!modelList) await loadModelList();
		await loadWaifuTips(modelId);
	}

	async function loadModel(modelId, modelTexturesId) {
		localStorage.setItem("modelId", modelId);
		localStorage.setItem("modelTexturesId", modelTexturesId);
		app.stage.removeChildren();
		model = await live2d.Live2DModel.from(idSelection(modelList.models[modelId].url, modelTexturesId));
		app.stage.addChild(model);
		model.buttonMode = true;
		autoSetTransform(modelId);
		drawHitArea(model);
		console.log(model);
		console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
		//setTimeout(() => {
		document.getElementById("waifu").style.bottom = 0;
		//}, 500);
		return model;
	}

	//自动调整模型位置和大小，使其适应元素
	function autoSetTransform(modelId) {
		const h = canvasHeigth / model.internalModel.originalHeight;
		const w = canvasWidth / model.internalModel.originalWidth;
		if ('config' in modelList.models[modelId]) { //读取用户配置并修改配置
			const config = modelList.models[modelId].config;
			const min = Math.min(h, w)
			model.scale.set(config.scaleX * min, config.scaleY * min);
			model.y = (canvasHeigth - model.height) / 2 + config.y;
			model.x = (canvasWidth - model.width) / 2 + config.x;
		} else {
			model.scale.set(Math.min(h, w));
			model.y = (canvasHeigth - model.height) / 2;
			model.x = (canvasWidth - model.width) / 2;
		}
	}

	//设置表情
	async function setExpression( exp, time = 4) {
		const expressionManager = model.internalModel.motionManager.expressionManager;
		if (exp) {
			if (waifuTips.expression && waifuTips.expression[exp]) showMessage(waifuTips.expression[exp], 1);
			expressionManager.setExpression(randomSelection(exp));
			setTimeout(() => {
				expressionManager.resetExpression();
				//重置表情不会修改当前表情，且当修改的表情与当前表情一致时，修改会失败，所以重置表情后需要手动修改当前表情的值
				expressionManager.currentExpression = expressionManager.defaultExpression;
			}, time * 1000);
		} else {
			expressionManager.setExpression(); //随机加载表情
		}
	}

	//设置动作
	async function setMotion( group, index) {
		console.log(group);
		console.log(await model.motion(group, index),group);
		if (waifuTips.motion && waifuTips.motion[group]) showMessage(waifuTips.motion[group], 1);
	}

	//中英文字符计算，并返回读完所需的大概时间，单位s
	function countChars(str) {
		let chinese = 0; 
		let english = 0; 
		let special = 0; 
	   
		for (let i = 0; i < str.length; i++) {
		  const charCode = String(str).charCodeAt(i);
		  if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
			chinese++;
		  } else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
			english++;
		  } else {
			special++;
		  }
		}
		return 1+(~~(chinese/3)+~~(english/10)+~~(special/2));
	}

	//交互读取
	function loadInteraction(interaction,textFunc,priority=3){
		let text="";
		if(interaction.text){
			text=randomSelection(interaction.text);
			if(textFunc)textFunc(text);
			showMessage(text,priority);
		}
		if(interaction.motion)setMotion( interaction.motion);
		else if(interaction.expression)setExpression( interaction.expression, time)
	}

	async function loadRandModel() {
		const modelId = localStorage.getItem("modelId");
		let modelTexturesId = localStorage.getItem("modelTexturesId");

		// 随机选择
		//const target = randomSelection(modelList.models[modelId]);
		//loadlive2d("live2d", `${modelListPath}model/${target}/index.json`);
		//if(Array.isArray(modelList.models[modelId]))showMessage("我的新衣服好看嘛？", 4000, 10);
		//else showMessage("我还没有其他衣服呢！", 4000, 10);

		//顺序选择
		if (Array.isArray(modelList.models[modelId].url)) {
			const index = (++modelTexturesId >= modelList.models[modelId].url.length) ? 0 :
				modelTexturesId;
			loadModel(modelId, index);
			loadInteraction(waifuTips.messages.newClothes);
		} else loadInteraction(waifuTips.messages.notNewClothes);

		//控制台输出模型材质id
		console.log("模型ID:" + modelId);
		console.log("材质ID:" + modelTexturesId);

	}

	async function loadOtherModel() {
		let modelId = localStorage.getItem("modelId");
		const index = (++modelId >= modelList.models.length) ? 0 : modelId;
		loadModel(index, 0, "");
		loadModelConfig(index);
	}


	await initModel();
	registerEventListener();
	welcomeMessage();
}

function initWidget(config) {
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
			<span>看板娘</span>
		</div>`);
	const toggle = document.getElementById("waifu-toggle");
	toggle.addEventListener("click", () => {
		toggle.classList.remove("waifu-toggle-active");
		if (toggle.getAttribute("first-time")) {
			loadWidget(config);
			toggle.removeAttribute("first-time");
		} else {
			localStorage.removeItem("waifu-display");
			//document.getElementById("waifu").style.display = "";
			setTimeout(() => {
				document.getElementById("waifu").style.bottom = 0;
			}, 0);
		}
	});
	if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
		toggle.setAttribute("first-time", true);
		setTimeout(() => {
			toggle.classList.add("waifu-toggle-active");
		}, 0);
	} else {
		loadWidget(config);
	}
}
