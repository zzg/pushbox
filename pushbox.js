/*---------------------------------------------\
|  pushbox game                                |
|----------------------------------------------|
|author: 郑志刚, 286584758@qq.com              |
|version 1.0.0                                 |
|Created 2006-04-11                            |
\---------------------------------------------*/

PushBoxGameConfig = {
	wallBackground : 'url(resource/wall.bmp)',
	boxBackground :  'url(resource/box.bmp) no-repeat center',
	roadTableBackground : 'url(resource/floor.bmp)',
	roadPointBackground : 'url(resource/floor.bmp) no-repeat center',
	targetBackground : 'url(resource/target.jpg) no-repeat center',
	driverLeftBackground : 'url(resource/left.bmp) no-repeat center',
	driverRightBackground : 'url(resource/right.bmp) no-repeat center',
	driverUpBackground : 'url(resource/up.bmp) no-repeat center',
	driverDownBackground : 'url(resource/down.bmp) no-repeat center',
	upTargetBackground : 'url(resource/upTarget.bmp) no-repeat center',
	downTargetBackground : 'url(resource/downTarget.bmp) no-repeat center',
	leftTargetBackground : 'url(resource/leftTarget.bmp) no-repeat center',
	rightTargetBackground : 'url(resource/rightTarget.bmp) no-repeat center',
	achieveBackground : 'url(resource/achieve.jpg) no-repeat center'
};

var PushBoxGame = function(frame, openAllLevels){	
	if("string" == typeof(frame))
		frame = document.getElementById(frame);
	this.frame = frame || document.body || document;
	this.openAllLevels = openAllLevels===true;
	this.allPoints = [];
	this.driver = null;
	this.gameBoxes = []; 
	this.boxWidth = 40;
	this.boxHeight = 40;
	this.isWin = false;
	window.pushBoxGame = this;
	if(Browser.IE){
		document.documentElement.addBehavior("#default#userData");
	}
	this.sessionMaxLevelKey="PushBoxGame_MaxLevel";
	//this.deletePassMaxLevel();
	this.passMaxLevel = this.loadPassMaxLevel();
	this.level = this.passMaxLevel;
	this.start = function(){
		if(!this.level && this.level != 0) return;
		this.isWin = false;
		this.frame.innerHTML = "";
		this.frame.style.cursor = "default";
		this.allPoints = [];
		this.gameBoxes = [];
		this.initialize();
	};
	this.restart = function(){
		if(!this.level && this.level != 0) return;
		this.start(this.level);
	}
};

var PointStatus = {
	OUTSIDE:0,
	ROAD:1,
	TARGET:2,
	WALL:3,
	DriverPointData : 4,
	BoxPointData : 5
};

var Direction = {
	 LEFT : 37,
	   UP : 38, 
	RIGHT : 39,
	 DOWN : 40
};

var Point= function(x, y, element, pointStatus){
	this.x = x;
	this.y = y;
	this.element = element;	
	this.pointStatus = pointStatus;
	this.moverType = null; //GameBox or Driver
	this.canPass = function(){return this.pointStatus==PointStatus.ROAD || this.pointStatus==PointStatus.TARGET};
};

var GameBox = function (point){
	this.point = point;
	this.achieve = false;
	this.type = "box";
};

var Driver = function(point, direction){
	this.point = point;
	this.direction = direction;
	this.type = "driver";
	this.setDirection = function(){
		var direction = this.direction;
		var elem = this.point.element;
		var isTarget = this.point.pointStatus==PointStatus.TARGET;
		switch(direction){
			case Direction.LEFT:
				elem.style.background =isTarget?PushBoxGameConfig.leftTargetBackground:PushBoxGameConfig.driverLeftBackground;
				break;
			case Direction.UP:
				elem.style.background =isTarget?PushBoxGameConfig.upTargetBackground:PushBoxGameConfig.driverUpBackground;
				break;
			case Direction.RIGHT:
				elem.style.background =isTarget?PushBoxGameConfig.rightTargetBackground:PushBoxGameConfig.driverRightBackground;
				break;
			case Direction.DOWN:
				elem.style.background =isTarget?PushBoxGameConfig.downTargetBackground:PushBoxGameConfig.driverDownBackground;
				break;
		}
	}
};

PushBoxGame.prototype.initialize = function(){
	var direction = Direction.RIGHT;
	var gameData = GameData[this.level];
	var table = document.createElement("table");
	table.setAttribute('border', '0');
	table.style.borderCollapse = "collapse";
	table.style.background = PushBoxGameConfig.roadTableBackground;
	for(var y = 0; y < gameData.length; y++){
		var tr=table.insertRow(y);
		this.allPoints[y] = [];
		for(var x = 0; x < gameData[y].length; x++){
			var td= tr.insertCell(x);
			td.style.textAlign = "center";
			td.style.verticalAlign="middle";
			td.setAttribute('width', this.boxWidth);
			td.setAttribute('height', this.boxHeight);
			var val = gameData[y][x];
			var status = val;
			var point;
			if(val == PointStatus.DriverPointData){
				status = PointStatus.ROAD;
				point = new Point(x,y,td,status);
				this.driver = new Driver(point, direction);
				point.moverType =  this.driver;
			}
			else if(val == PointStatus.BoxPointData){
				status = PointStatus.ROAD;
				point = new Point(x,y,td,status);
				var gameBox = new GameBox(point);
				point.moverType = gameBox;
				this.gameBoxes[this.gameBoxes.length] = gameBox;
			}
			else {
				point = new Point(x,y,td,status);
			}
			this.allPoints[y][x] = point;
			this.render(point); 
		}
	}
	this.gameBoard = table;
	this.frame.appendChild(table);
	var bottomTab = document.createElement("table");
	bottomTab.width = this.gameBoard.clientWidth;
	bottomTab.setAttribute('border', '0');
	var _tr = bottomTab.insertRow(0);
	var _td1 = _tr.insertCell(0);
	_td1.style.color = "#528A42";
	_td1.style.fontSize = "18px";
	_td1.style.textAlign = "center";
	_td1.innerHTML='level: <select onchange="pushBoxGame.selectLever(this)" id="levelSelect"></select>';
	var _td2 = _tr.insertCell(1);
	_td2.style.color = "blue";
	_td2.style.textAlign = "center";
	_td2.innerHTML='<a href="javascript:void(0);" style="font-family:Algerian;cursor:pointer;text-decoration:underline;" onclick="pushBoxGame.restart()">restart</a>';
	var _td3 = _tr.insertCell(2);
	_td3.style.textAlign = "center";
	_td3.style.color = "blue";
	_td3.innerHTML='<div id="nextAnchorId" style="visibility:hidden;"><a herf="javascript:void(0);" style="font-family:Algerian;cursor:pointer;text-decoration:underline;" onclick="pushBoxGame.playNext();">next</a></div>';
	this.frame.appendChild(bottomTab);
	var levelSelect = document.getElementById("levelSelect");
	var levelCount = this.openAllLevels?GameData.length-1:this.passMaxLevel;
	for(var i=0; i <= levelCount; i++){
		var opt = new Option(i+1, i);
		levelSelect.add(opt);
	}
	levelSelect[this.level].selected = true;
	var _game = this;
	var intervalId = null;
	document.onkeydown= function(event){
		var event = event||window.event;
		_game.setDirection(event);
		intervalId = setTimeout("pushBoxGame.play()", 10);
		return false;
	}
	document.onkeyup= function(event){
		if(intervalId) clearTimeout(intervalId);
		//var event = event||window.event;
		//_game.play(event);
	}
	
};

PushBoxGame.prototype.render = function (point){
	var elem = point.element;
	var moverType = point.moverType;
	switch(point.pointStatus){
	  	case PointStatus.OUTSIDE :
	 		elem.style.background = "#FFFFFF";
	 		break;
	 	case PointStatus.ROAD :
			elem.style.background = "";
	 		break;
	 	case PointStatus.TARGET :
	 		elem.style.background = PushBoxGameConfig.targetBackground;	 		
	 		break;	
	 	case PointStatus.WALL :
	 		elem.style.background = PushBoxGameConfig.wallBackground;
	 		break;
	}
	
	if(moverType){
		if(moverType.type == "box"){
			if(point.pointStatus == PointStatus.TARGET){
	 			elem.style.background = PushBoxGameConfig.achieveBackground;
	 		}
	 		else{
	 			elem.style.background = PushBoxGameConfig.boxBackground;
	 		}
		}
		else if (moverType.type == "driver"){
			moverType.setDirection();
		}
	}
	
};

PushBoxGame.prototype.setDirection = function(event){
	if(this.isWin) return;
	this.driver.direction =  event.keyCode;
	this.driver.setDirection();
};

PushBoxGame.prototype.play = function(){
	if(this.isWin) return;
	var allPoint = this.allPoints;
	var driver = this.driver;
	var point = driver.point;
	var nextPoint1 = null;
	var nextPoint2 = null;
	switch(driver.direction){
		case Direction.LEFT:
			nextPoint1 = getPassPoint(point.x-1, point.y);
			nextPoint2 = getPassPoint(point.x-2, point.y);
			break;
		case Direction.UP:
			nextPoint1 = getPassPoint(point.x, point.y-1);
			nextPoint2 = getPassPoint(point.x, point.y-2);
			break;
		case Direction.RIGHT:
			nextPoint1 = getPassPoint(point.x+1, point.y);
			nextPoint2 = getPassPoint(point.x+2, point.y);
			break;
		case Direction.DOWN:
			nextPoint1 = getPassPoint(point.x, point.y+1);
			nextPoint2 = getPassPoint(point.x, point.y+2);
	}
	
	if(nextPoint1 == null) 
		return;
	else if(nextPoint1.moverType && "box" == nextPoint1.moverType.type){
		 if(nextPoint2 == null) return;
		 if(nextPoint2.moverType && "box" == nextPoint2.moverType.type)
		 	return;
		 this.pushBox(nextPoint1, nextPoint2);
		 if(this.checkWin()){
		 	this.isWin = true;
		 	this.setGameWinMsg();
		 }
	}
	else {
		this.moveDriver(nextPoint1);
	}
	
	function getPassPoint(x, y){
		if(y >= 0 && y < allPoint.length && x >= 0 && x < allPoint[y].length){
		 	var p = allPoint[y][x];
		 	if(p.canPass()) return p;
		}
	}
};

PushBoxGame.prototype.playNext= function(){
	this.level++;
	if(this.level >= GameData.length)
	{
		this.level--;
		return;
	}
	if(this.level > this.passMaxLevel){	 		
		this.savePassMaxLevel(this.level);
	}
	this.start();
};

PushBoxGame.prototype.selectLever = function(selObj){
	this.level = selObj.value;
	this.restart();
};

PushBoxGame.prototype.pushBox = function(boxPoint, targetPoint){
	var driverPoint = this.driver.point;
	var driver_moverType = driverPoint.moverType;
	var box_moverType = boxPoint.moverType;
	
	targetPoint.moverType = box_moverType;
	box_moverType.point = targetPoint;
	this.render(targetPoint);
	
	this.driver.point = boxPoint;	
	boxPoint.moverType = driver_moverType;
	this.render(boxPoint);
	
	driverPoint.moverType = null;
	this.render(driverPoint);
	
	targetPoint.moverType.achieve = false;
	if(targetPoint.pointStatus == PointStatus.TARGET){
		targetPoint.moverType.achieve = true;
	}
	
};

PushBoxGame.prototype.moveDriver = function(targetPoint){
	var driverPoint = this.driver.point;
	var moverType = driverPoint.moverType;
	
	this.driver.point = targetPoint;
	targetPoint.moverType = moverType;
	this.render(targetPoint);
	
	driverPoint.moverType = null;
	this.render(driverPoint, true);
	
};

PushBoxGame.prototype.checkWin = function (){
	var gameBoxes = this.gameBoxes;
	for(var i = 0; i < gameBoxes.length; i++){
		if(!gameBoxes[i].achieve) return false;
	}	
	return true;
};

PushBoxGame.prototype.setGameWinMsg= function (){
	var left = this.gameBoard.clientWidth / 2;
	var top = this.gameBoard.clientHeight / 2;
 	var gameWinMsg = '<div style="color:red;font-size:50px;font-weight:bolder;">winner</div>';
 	var winMsg = document.createElement("div");
 	winMsg.style.fontFamily = "Algerian";
	//winMsg.style.fontSize = "24px";
	winMsg.style.color = "red";
	winMsg.style.position = "absolute";
	winMsg.style.zIndex = "100";
	winMsg.style.textAlign = "center";
	winMsg.innerHTML = gameWinMsg;
	winMsg.style.left = (left-80)+"px";
	winMsg.style.top = (top-40)+"px";
	this.driver.point.element.style.filter = "alpha(opacity=20)";
	this.driver.point.element.style.opacity = "0.20";
	this.frame.appendChild(winMsg);
	document.getElementById("nextAnchorId").style.visibility = "visible";
};

PushBoxGame.prototype.loadPassMaxLevel = function(){
	var maxLevel;
	try{
		if(window.localStorage){
			maxLevel = localStorage.getItem(this.sessionMaxLevelKey);
		}
		else if(Browser.IE){
			with(document.documentElement){
				load(this.sessionMaxLevelKey);
        		maxLevel = getAttribute(this.sessionMaxLevelKey);
			}
		}else{
			maxLevel = 0;
		}
	}catch(ex){
		alert("loadPassMaxLevel error:"+ex.message);
		maxLevel = 0;
	}
	if(maxLevel == null) maxLevel = 0;
	return maxLevel;
};

PushBoxGame.prototype.savePassMaxLevel = function(level){
	try{
		if(window.localStorage){
			localStorage.setItem(this.sessionMaxLevelKey,level);
		}
		else if(Browser.IE){
			with(document.documentElement){
				setAttribute(this.sessionMaxLevelKey,level);
				save(this.sessionMaxLevelKey);
			}
		}
	}catch(ex){
		alert("savePassMaxLevel error:"+ex.message);
	}
	this.passMaxLevel = level;
};

PushBoxGame.prototype.deletePassMaxLevel = function(){
	try{
		if(window.localStorage){
			localStorage.removeItem(this.sessionMaxLevelKey);
		}
		else if(Browser.IE){
			with(document.documentElement){
				setAttribute(this.sessionMaxLevelKey,0);
				save(this.sessionMaxLevelKey);
			}
		}
	}catch(ex){
		alert("deletePassMaxLevel error:"+ ex.message);
	}
}

var Browser = {
     IE:     !!(window.attachEvent && !window.opera),
     Opera:  !!window.opera,
     WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
     Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
     FireFox: navigator.userAgent.indexOf('Mozilla') > -1 && navigator.userAgent.indexOf('Firefox') > 0
}

var GameData = [
//level 1:
  [
	[3,3,3,3,3,3,3],
	[3,1,2,2,5,1,3],
	[3,1,3,1,5,1,3],
	[3,1,3,1,3,1,3],
	[3,1,5,4,3,1,3],
	[3,2,5,1,1,1,3],
	[3,2,3,3,3,3,3],
	[3,3,3,0,0,0,0]],
//level 2:
  [
	[0,0,3,3,3,3,0,0,0],
	[3,3,3,1,1,3,3,3,3],
	[3,1,1,1,1,1,5,1,3],
	[3,1,3,1,1,3,5,1,3],
	[3,1,2,1,2,3,4,1,3],
	[3,3,3,3,3,3,3,3,3]],
 //level 3: 
  [
  	[0,0,0,3,3,3,3,3,0,0,0,0],
	[3,3,3,3,1,1,1,3,0,0,0,0],
	[3,2,2,3,5,5,1,3,0,0,0,0],
	[3,1,2,2,5,1,1,3,3,3,3,3],
	[3,1,4,3,1,3,1,3,1,1,1,3],
	[3,1,1,5,1,1,1,1,1,5,1,3],
	[3,1,1,3,3,3,3,3,3,3,2,3],
	[3,3,3,3,0,0,0,0,0,3,3,3]],
//level 4:
  [
	[0,0,0,3,3,3,0,0,0,0,0],
	[0,0,3,3,1,3,0,3,3,3,3],
	[0,3,3,1,1,3,3,3,1,1,3],
	[3,3,1,5,1,1,1,1,1,1,3],
	[3,1,1,1,4,5,1,3,1,1,3],
	[3,3,3,1,5,3,3,3,1,1,3],
	[0,0,3,1,1,3,2,2,1,1,3],
	[0,3,3,1,3,3,2,3,1,3,3],
	[0,3,1,1,1,1,1,1,3,3,0],
	[0,3,1,1,1,1,1,3,3,0,0],
	[0,3,3,3,3,3,3,3,0,0,0]],
//level 5:
  [
	[0,0,0,3,3,3,3,3,3,3,3],
	[0,0,0,3,1,1,1,1,1,1,3],
	[3,3,3,3,1,3,3,3,3,1,3],
	[3,1,5,1,5,1,2,2,3,1,3],
	[3,1,3,1,1,2,3,1,3,1,3],
	[3,1,3,1,3,3,3,1,3,1,3],
	[3,1,3,2,3,1,5,1,1,1,3],
	[3,1,3,2,5,4,5,1,1,3,3],
	[3,1,3,5,3,3,3,1,1,3,0],
	[3,1,1,2,1,1,1,1,1,3,0],
	[3,3,3,3,3,3,3,3,3,3,0]],
//level 6:
  [
	[3,3,3,3,3,3,3,3,3,3],
	[3,1,1,1,1,1,1,1,1,3],
	[3,1,1,5,1,5,1,5,1,3],
	[3,3,4,3,3,3,3,3,1,3],
	[3,1,1,1,2,1,2,1,2,3],
	[3,1,1,1,1,1,1,1,1,3],
	[3,3,3,3,3,3,3,3,3,3]],
//level 7:
  [
	[3,3,3,3,3,3,3,3,3],
	[3,1,1,1,3,1,1,1,3],
	[3,1,5,1,1,1,5,1,3],
	[3,3,1,3,1,3,1,3,3],
	[3,1,1,3,1,3,1,1,3],
	[3,1,5,2,2,2,1,1,3],
	[3,3,3,1,4,1,3,3,3],
	[0,0,3,3,3,3,3,0,0]],

//level 8:
  [
	[3,3,3,3,3,3,3,3,0,0],
	[3,1,1,3,3,1,1,3,3,3],
	[3,1,1,1,1,1,5,1,1,3],
	[3,2,2,3,3,4,5,1,1,3],
	[3,2,2,3,3,1,5,1,1,3],
	[3,1,1,1,1,1,5,1,1,3],
	[3,1,1,3,3,1,1,3,3,3],
	[3,3,3,3,3,3,3,3,0,0]],

//level 9:
  [
	[3,3,3,3,3,3,3,3,3,3],
	[3,1,1,1,1,1,3,2,1,3],
	[3,1,1,5,1,1,1,2,2,3],
	[3,1,1,1,1,3,1,1,2,3],
	[3,3,3,3,1,3,3,3,3,3],
	[3,1,5,1,5,1,5,1,4,3],
	[3,1,1,1,1,1,1,1,1,3],
	[3,3,3,3,3,3,3,3,3,3]],
//level 10:
  [
	[0,0,0,0,0,0,0,3,3,3,3,3,0],
	[0,3,3,3,3,3,3,3,1,1,1,3,3],
	[3,3,1,3,1,4,3,3,1,5,5,1,3],
	[3,1,1,1,1,5,1,1,1,1,1,1,3],
	[3,1,1,5,1,1,3,3,3,1,1,1,3],
	[3,3,3,1,3,3,3,3,3,5,3,3,3],
	[3,1,5,1,1,3,3,3,1,1,2,3,0],
	[3,1,5,1,5,1,5,1,1,2,2,3,0],
	[3,1,1,1,1,3,3,3,2,2,2,3,0],
	[3,1,1,1,1,3,1,3,2,2,2,3,0],
	[3,3,3,3,3,3,1,3,3,3,3,3,0]],
//level 11:
  [
	[0,0,0,0,0,3,3,3,3,3,3,3],
	[0,0,0,0,0,3,1,1,3,1,1,3],
	[0,0,0,0,0,3,1,5,1,5,1,3],
	[3,3,3,3,3,3,1,1,3,1,1,3],
	[3,1,2,2,1,3,1,4,1,1,1,3],
	[3,1,1,2,1,1,1,5,3,5,1,3],
	[3,1,1,2,1,3,1,1,3,1,1,3],
	[3,3,3,3,3,3,3,3,3,3,3,3]],
//level 12:
  [
	[3,3,3,3,3,3,3,3,3,3,3,3],
	[3,1,1,1,1,1,1,1,1,1,1,3],
	[3,1,1,1,1,1,5,5,5,1,1,3],
	[3,3,1,3,1,1,5,4,5,1,1,3],
	[3,2,2,2,3,3,5,5,5,3,3,3],
	[3,2,1,2,1,1,1,1,1,1,1,3],
	[3,2,2,2,1,1,3,1,1,1,1,3],
	[3,3,3,3,3,3,3,3,3,3,3,3]],
//level 13:
  [
	[3,3,3,3,3,3,3,3,3,3,3],
	[3,1,1,2,3,1,1,3,1,1,3],
	[3,2,2,2,2,1,5,3,5,1,3],
	[3,1,1,2,3,1,1,1,1,1,3],
	[3,3,3,3,3,1,1,3,1,1,3],
	[3,1,1,5,1,1,5,5,5,1,3],
	[3,1,1,1,1,1,4,3,1,1,3],
	[3,3,3,3,3,3,3,3,3,3,3]],
//level 14:
  [
	[3,3,3,3,3,3,3],
	[3,1,1,3,2,2,3],
	[3,1,1,4,5,1,3],
	[3,1,5,2,5,1,3],
	[3,1,1,1,1,1,3]],
//level 15:
  [
	[3,3,3,3,3,3,3,3,3],
	[3,1,1,1,4,1,1,1,3],
	[3,1,1,5,2,5,1,1,3],
	[3,3,2,3,5,3,2,3,3],
	[3,1,1,5,2,1,1,1,3],
	[3,1,1,1,3,1,1,1,3],
	[3,3,3,3,3,3,3,3,3]],
//level 16:
  [
	[0,3,3,3,3,3,3],
	[3,3,1,2,2,2,3],
	[3,1,5,1,5,1,3],
	[3,1,5,4,5,1,3],
	[3,1,5,1,5,1,3],
	[3,2,2,2,1,3,3],
	[3,3,3,3,3,3,0]],
//level 17:
  [
	[3,3,3,3,3,3,3,3],
	[3,1,1,1,1,1,1,3],
	[3,1,5,5,5,1,1,3],
	[3,1,2,2,2,3,3,3],
	[3,3,3,2,2,2,1,3],
	[3,1,1,5,5,5,1,3],
	[3,1,4,1,1,1,1,3],
	[3,3,3,3,3,3,3,3]],
//level 18:
  [
	[3,3,3,3,3,0,0,0,0],
	[3,4,1,1,3,0,0,0,0],
	[3,1,5,5,3,0,3,3,3],
	[3,1,5,1,3,0,3,2,3],
	[3,3,3,1,3,3,3,2,3],
	[0,3,3,1,1,1,1,2,3],
	[0,3,1,1,1,3,1,1,3],
	[0,3,1,1,1,3,3,3,3],
	[0,3,3,3,3,0,0,0,0]],
//level 19:
  [
	[0,3,3,3,3,0,0,0],
	[0,3,4,1,3,3,3,0],
	[0,3,1,5,1,1,3,0],
	[3,3,3,1,3,1,3,3],
	[3,2,3,1,3,1,1,3],
	[3,2,5,1,1,3,1,3],
	[3,2,1,1,1,5,1,3],
	[3,3,3,3,3,3,3,3]],
//level 20:
  [
	[0,3,3,3,3,3,3,3,0,0],
	[0,3,1,1,1,1,1,3,3,3],
	[3,3,5,3,3,3,1,1,1,3],
	[3,1,4,1,5,1,1,5,1,3],
	[3,1,2,2,3,1,5,1,3,3],
	[3,3,2,2,3,1,1,1,3,0],
	[0,3,3,3,3,3,3,3,3,0]],
//level 21:
  [
	[3,3,3,3,3,3,3,0,0],
	[3,1,1,1,1,1,3,0,0],
	[3,1,5,5,5,3,3,0,0],
	[3,1,1,3,2,2,3,3,3],
	[3,3,1,1,2,2,5,1,3],
	[0,3,1,4,1,1,1,1,3],
	[0,3,3,3,3,3,3,3,3]],
//level 22:
  [
	[0,3,3,3,3,3,0],
	[3,3,1,1,1,3,3],
	[3,1,1,1,1,1,3],
	[3,1,3,1,3,1,3],
	[3,1,1,5,3,1,3],
	[3,1,1,5,3,1,3],
	[3,5,5,4,5,5,3],
	[3,2,2,2,2,2,3],
	[3,3,3,3,3,3,3]]
];
