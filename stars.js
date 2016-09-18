var Engine;
var starsCount = 0;
var canvas,ctx;

var fps = 15;

var stars = [];

var starParams = {
	minWidth:0.1,
	maxWidth:3,
	minBright:240,
	bias:0.2,
	influence:0.8
}

var generateRandomStar = function(maxY = canvas.height){
	var bounds = [0,0];
	
	// Star size
	var rnd = Math.random()*(starParams.maxWidth / 2 - starParams.minWidth / 2)+starParams.minWidth /2;
	var mix = Math.random()*starParams.influence;
	var radius = rnd * (1 - mix) + (starParams.bias * mix);
	
	var rgb = {
		r:Math.floor(Math.random()*(255-starParams.minBright)+starParams.minBright),
		g:Math.floor(Math.random()*(255-starParams.minBright)+starParams.minBright),
		b:Math.floor(Math.random()*(255-starParams.minBright)+starParams.minBright)
	}
	var yellowredblue = Math.floor(Math.random()*3);
	
	// lean the color towards red, yellow, blue, or white
	/*var whiteBias = 3,
		whiteInfluence = 1;
	var yellowredblue = Math.floor(Math.random()*3);
	var whiteMix = Math.random()*whiteInfluence;
	yellowredblue = yellowredblue * (1 - whiteMix) + (whiteInfluence * whiteBias);*/
	
	var hue;
	switch(yellowredblue){
		case 0: // yellow
			hue = {r:255,g:255,b:0};
			break;
		case 1: // red
			hue = {r:255,g:0,b:0};
			break;
		case 2: // blue
			hue = {r:0,g:0,b:255};
			break;
		case 3: // white
			hue = {r:255,g:255,b:255};
			break;
	}
	
	var hueInfluence = 0.2;
	var hueMix = Math.random()*hueInfluence;
	
	var finalColor = {
		r: Math.floor(rgb.r * (1-hueMix) + (hueInfluence * hue.r)),
		g: Math.floor(rgb.g * (1-hueMix) + (hueInfluence * hue.g)),
		b: Math.floor(rgb.b * (1-hueMix) + (hueInfluence * hue.b))
	};
	
	//console.log('finalColor: ');
	//console.log(finalColor);
	
	var rgba = 'rgba('+finalColor.r+','+finalColor.g+','+finalColor.b+',1)';
	
	// create star with procedurally generated properties
	var Star = new Geometry('circle','star'+starsCount,radius,radius,rgba);
	starsCount++;
	
	var minY = (-200);
	// Star location
	var x = (Math.random()*canvas.width),
		y = (Math.random()*(maxY - minY)+minY);
	
	Engine.addObject(Star,x,y);
}

var moveStarsInterval = 0;
var createStars = function(starAmount){
	for(var c = 0;c < starAmount;c++){
		generateRandomStar();
	}
	
	moveStarsInterval = setInterval(function(){
		for(var i in Engine.objects){
			var star = Engine.objects[i];
			star.y+=1;
			if(star.y > canvas.height || star.y < 0 || star.x < 0 || star.x > canvas.width){
				star.y = -(Math.random()*500);
				star.x = Math.random()*canvas.width;
			}
		}
	},50);
}

$(function(){
	canvas = document.querySelector('canvas');
	
	canvas.width = window.innerWidth-50;
	canvas.height = window.innerHeight-50;
	
	ctx = canvas.getContext('2d');
	
	
	Engine = new GameEngine(canvas);
	Engine.bgColor = 'black';
	Engine.start();
	$('input[type=range]').val(2000);
	createStars(2000);
	//setTimeout(Engine.pause,1000);
	//Engine.highlightObj(Engine.objects[32]);
	
	var changeTimeout = 0;
	$('input[type=range]').on('change',function(){
		changeTimeout = setTimeout(function(){
		clearInterval(moveStarsInterval);
			clearTimeout(changeTimeout);
			$('.starCount').html($('input[type=range]').val());
			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			Engine.pause();
			Engine.clearObjects();
			createStars($('input[type=range]').val());
			Engine.start();
		},100);
	});
});