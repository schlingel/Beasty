function getRandom(min, max) {
	if(min > max) {
		return -1;
	}
 
	if(min == max) {
		return min;
	}
 
	var r;
 
	do {
		r = Math.random();
	} while(r == 1.0);
 
	return min + parseInt(r * (max - min + 1));
}

function ElectroBeast(size, layer) {
	this.gameObj = undefined;
	this.x = 0;
	this.y = 0;
	this.layer = layer;
	this.size = size;
	this.canvasContext = undefined;
	this.updateInterval = 250; //ms
	this.time = this.updateInterval;
	this.gradToRadiantFactor = 0.017453292519943;
};

ElectroBeast.prototype.setX = function(x) {
	this.x = x;
	return this;
}

ElectroBeast.prototype.setY = function(y) {
	this.y = y;
	return this;
}

ElectroBeast.prototype.getCoords = function() {
	var coords = [];
	
	for(var i = 0; i < 4; i++) {
		coords.push(this.getRealCoord(this.getLayerCoord(), i))
	}
	
	return coords;
}

ElectroBeast.prototype.getLayerCoord = function() {
	var angle = getRandom(0, 90) * this.gradToRadiantFactor;
	var radius = parseInt(this.size / 2);
	
	var x = parseInt(Math.cos(angle) * radius);
	var y = parseInt(Math.sin(angle) * radius);
	
	return [x, y];
}

/**
 * sector defines in which circle sector the coordinates are in.
 * id    x/y
 * =========
 * 0 ... +/+
 * 1 ... -/+
 * 2 ... -/-
 * 3 ... +/-
 */
ElectroBeast.prototype.getRealCoord = function(coord, sector) {
	if(sector < 0 || sector > 3) {
		throw "Not in range! [0, 3]";
	}
	
	var radius = parseInt(this.size / 2);
	var xAddition = [
       function(x) { return x + radius; },
       function(x) { return radius - x; },
       function(x) { return radius - x; },
       function(x) { return x + radius; }
	];
	
	var yAddition = [
       function(y) { return radius - y; },
       function(y) { return radius - y; },
       function(y) { return y + radius; },
       function(y) { return y + radius; },
	];
	
	return [xAddition[sector](coord[0]), yAddition[sector](coord[1])];
}

ElectroBeast.prototype.update = function(deltaT) {
	this.time += deltaT;
	
	if(this.time >= this.updateInterval) {
		this.time = 0;
		this.coords = [];
		for(var i = 0; i < this.layer; i++) {
			this.coords.push(this.getCoords());
		}		
	}
};

ElectroBeast.prototype.setGameObj = function(gameObj) {
	this.gameObj = gameObj;
	this.canvasContext = gameObj.context;

	return this;
};

ElectroBeast.prototype.draw = function() {
	this.canvasContext.beginPath();
	var radius = Math.floor(this.size / 2);
	this.canvasContext.fillStyle = 'white';
	this.canvasContext.style = 'white';
	this.canvasContext.arc(this.x + radius, this.y + radius, radius, 0, 2 * Math.PI, false);
	this.canvasContext.fill();
	this.canvasContext.closePath();
	this.canvasContext.beginPath();
	
	for(var e = 0; e < this.layer; e++) {
		var coords = this.coords[e];
		var point = coords[0];
		
			
		
		this.canvasContext.style = 'black';
		this.canvasContext.moveTo(point[0] + this.x, point[1] + this.y);
		
		for(var i = 1; i < coords.length; i++) {
			this.drawLineTo(coords[i]);
		}
		
		this.drawLineTo(coords[0]);	
	}
	
	this.canvasContext.closePath();		
};

ElectroBeast.prototype.drawLineTo = function(point) {
	var x = point[0] + this.x;
	var y = point[1] + this.y;
	
	this.canvasContext.lineTo(x, y);
	this.canvasContext.stroke();
};

(function() {
	var fps = 1000 / 25;
	
	function Game(id) {
		this.lastUpdate = (new Date()).getMilliseconds();
		this.gameObjs = [];
		this.canvas = document.getElementById(id);
		this.context = this.canvas.getContext('2d');
	};
	
	Game.prototype.update = function() {
		var now = (new Date()).getMilliseconds();
		var deltaT = now - this.lastUpdate;
		deltaT = deltaT < 0 ? 16 : deltaT;
		this.lastUpdate = now;
		
		for(var i = 0; i < this.gameObjs.length; i++) {
			this.gameObjs[i].update(deltaT);
			this.gameObjs[i].draw();
		}
	};
	
	Game.prototype.addGameObj = function(gameObj) {
		gameObj.setGameObj(this);
		this.gameObjs.push(gameObj);
	};
	
	var timerId = setInterval(function() {
		if(document.readyState === 'complete') {
			clearInterval(timerId);
			window.Game = new Game('canvas_area');					

			window.Game.addGameObj(new ElectroBeast(160, 10).setX(100).setY(0));
			
			window.Game.addGameObj(new ElectroBeast(60, 7)
										.setX(100)
										.setY(100));

			window.Game.addGameObj(new ElectroBeast(40, 4)
										.setX(10)
										.setY(10));
			
			window.Game.gameLoopTimerId = setInterval(function() {
				window.Game.update();
			}, fps);
		}
	}, 10);
})();