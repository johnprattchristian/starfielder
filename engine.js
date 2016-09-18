var objsCreated = 0;
var log = function(words){
	console.log(words);
};



function GameEngine(canvas){
	var that = this;
	// canvas references
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	var ctx = this.ctx;
	var canvas = this.canvas;
	// the framerate
	this.frameRate = 60;
	// the list of objects that need to be continuously rendered:
	this.objects = [];
	var objects = this.objects;
	this.clearObjects = function(){
		that.objects.splice(0,that.objects.length);
	}
	this.matchObjNames = function(str){
		var matched = [];
		for(var o in that.objects){
			var item = that.objects[o];
			if(item.name.includes(str)){
				matched.push(item);
			}
		}
		return matched;
	}
	// draw function
	this.bgColor = 'blue';
	this.perDrawCallback = null;
	this.draw = function(){
		// drawBG
		ctx.fillStyle = that.bgColor;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		if(objects.length > 0){
			// organize objs by z-index:
			var layers = [[],[],[]];
			for(var i in objects){
				var item = objects[i];
				if(item.z < 0){
					layers[0].push(item);
				}
				else if(item.z === 0){
					layers[1].push(item);
				}
				else if(item.z > 0){
					layers[2].push(item);
				}
			}
			
			// draw objects, starting with -z index
			for(var layer in layers){
				var zIndex = layers[layer];
				for(var i in zIndex){
					var item = zIndex[i];
					// decide what kind of drawable object:
					if(item instanceof GameObject){ // objs with sprites
						ctx.drawImage(item.sprite,item.x,item.y,item.width,item.height);
					}
					else if(item instanceof Geometry){ // circles and rectangles (canvas native)
						item.drawProcedure(ctx);
					}
				}
			}
			if(that.perDrawCallback !== null){
				that.perDrawCallback();
			}
		}
		else{
			log('drawing nothing. (objects list is empty)');
		}
	};
	
	
	// let us add an object to the game
	this.addObject = function(obj,x=0,y=0){
		// force positioning of object when created
		obj.x = x - obj.origin.x;
		obj.y = y - obj.origin.y;
		objects.push(obj);
	};
	var addObject = this.addObject;
	// batch-adding objects
	this.addObjects = function(objs){
		for(var o in objs){
			addObject(objs[o]);
		}
	};
	this.destroyObject = function(obj){
		// find the index of the argument object
		var index = this.objects.indexOf(obj);
		// if it exists
		if(index !== -1){
			// delete object from game engine
			this.objects.splice(index,1);
		}
		else{
			log('object is not in objects list');
		}
	};

	// give us ability to start and stop the engine
	var drawInterval = 0; // init var
	
	var drawFunct = this.draw;
	this.start = function(){
		drawInterval = setInterval(function(){drawFunct()},1000 / this.frameRate);
	}
	this.pause = function(){
		clearInterval(drawInterval);
	}
	
	this.highlightObj = function(object){
		that.pause();
		var o = object;
		ctx.fillStyle = 'green';
		ctx.fillRect(o.x-5,o.y-5,o.width+5,o.height+5);
	}
}

function GameObject(name = ('object'+objsCreated),type = 'simple',w,h){
	var object = this; // for use inside functions
	
	// create a default numerical-suffixed name if none given
	if(name === 'object'+objsCreated){
		objsCreated++;
	}
	else{
		this.name = name;
	}
	
	// check if type is one of a select few types of game objects
	if(['simple','player'].indexOf(type) === -1){
		this.type = 'simple';
	}
	else{
		this.type = type;
	}
	
	// the origin point on the objects sprite
	this.origin = {
		x:0,
		y:0
	}
	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	this.moveTo = function(x,y){
		object.x = x - object.origin.x;
		object.y = y - object.origin.y;
	}
	this.move = function(x,y){
		object.x += x;
		object.y += y;
	}
	this.width = w;
	this.height = h;

	this.sprites = [];
	this.sprites.push({
		name:'empty',
		image:new Image(w,h)
	});
	this.sprite = this.sprites[0].image;
	this.addSprite = function(name,src){
		// create a new image from the src
		var img = new Image();
		img.src = src;
		// if the default sprite is empty, replace it
		if(object.sprites[0].name === 'empty'){
			object.sprites[0] = {name:name,image:img};
			return true;
		}
		// otherwise...
		// push a new sprite with the name and image
		object.sprites.push({
			name:name,
			image:img
		});
	}
	// change the displayed sprite
	this.changeSprite = function(id){
		var sprite = getSprite(object.sprites,id);
		if(sprite !== false){
			object.sprite = sprite.image;
		}
	}
	

}

var geometryTypes = ['rect','circle'];
function Geometry(type = 'rect',name = 'geometry'+objsCreated,w,h,color){
	var that = this;
	if(geometryTypes.indexOf(type) == -1){
		type = 'rect';
	}
	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	this.width = w;
	this.height = h;
	this.type = type;
	this.name = name;
	this.color = color;
	this.outline = false;
	this.lineStyle = {
		width:0,
		color:color
	}
	this.origin = {
		x:0,
		y:0
	}
	this.drawProcedure = function(ctx){
		ctx.fillStyle = that.color;
		if(type == 'rect'){
			ctx.fillRect(that.x - that.origin.x,that.y - that.origin.y,that.width,that.height);
			if(that.outline){
				// draw outline
			}
		}
		else if(type == 'circle'){
			ctx.beginPath();
			ctx.arc(that.x - that.origin.x + that.width / 2,that.y - that.origin.y + that.width / 2,that.width,0,Math.PI*2,false);
			ctx.fill();
			ctx.closePath();
		}
	}
}
