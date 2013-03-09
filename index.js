module.exports = Histogram;

function Histogram(conf){
	  if (!(this instanceof Histogram)) return new Histogram(conf);
	  
	  this.histogram = [];
	  this.conf = {
		  width: 255
		  , height: 128
		  , red: "#d55"
		  , green: "#5d5"
		  , blue: "#55d"
		  , black: "#555"
	  };
	  this.setConf(conf);
	  this.canvas = document.createElement('canvas');
	  this.context = this.canvas.getContext('2d');	  	  
	  this.clearRGB();
}

Histogram.prototype.setConf = function(conf){	
	for (name in conf){
		this.conf[name] = conf[name];
	}
	return this;
};
	

Histogram.prototype.forImg = function(source){
	var srcCanvas = document.createElement("canvas");
	var ctx = srcCanvas.getContext('2d');
   	ctx.canvas.width = source.width;
	ctx.canvas.height = source.height;
	ctx.drawImage(source, 0, 0);
	return this.forCanvas(srcCanvas);
};

Histogram.prototype.forCanvas = function(source){
	var ctx = source.getContext('2d');
	var img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
   	for (var i=0; i<img.data.length; i=i+4){
   		this.setRGB({
   			r: img.data[i]
   			, g: img.data[i+1]
   			, b: img.data[i+2]
   		});
   	}
   	
   	return this.draw();
};

Histogram.prototype.clearRGB = function(){
	for (var i=0; i<=255; i++){
		this.histogram[i] = {
			r: 0
			, g: 0
			, b: 0
		};
	}
};

Histogram.prototype.setRGB = function(val){
	this.histogram[Math.min(255, Math.max(0, val.r))].r++;
	this.histogram[Math.min(255, Math.max(0, val.g))].g++;
	this.histogram[Math.min(255, Math.max(0, val.b))].b++;
};

Histogram.prototype.draw = function(){
	this.context.canvas.width = this.conf.width;
	this.context.canvas.height = this.conf.height;	
	
	//find the largest tone value, ignoring the extremes at index 0 && 255.
	var m=0;
	for (var i = 1; i<255; i++){
		m = Math.max(m, this.histogram[i].r, this.histogram[i].g, this.histogram[i].b);
	}
	
	//make the colour polys blend
	this.context.globalCompositeOperation="lighter";

	//draw red
	this.drawPoly(this.conf.red, function(val){
		return val.r / m;
	});
	
	//draw green
	this.drawPoly(this.conf.green, function(val){
		return val.g / m;
	});
	
	//draw blue
	this.drawPoly(this.conf.blue, function(val){
		return val.b / m;
	});
	
	//make the black poly overwrite
	this.context.globalCompositeOperation="source-over";	
	
	//draw black
	this.drawPoly(this.conf.black, function(val){
		var r = val.r / m;
		var g = val.g / m;
		var b = val.b / m;
		return Math.min(r,g,b);					
	});
	
	return this.canvas.toDataURL();
};

Histogram.prototype.drawPoly = function(colour, val){
	var w = this.context.canvas.width;
	var h = this.context.canvas.height;
	this.context.beginPath();		
	this.context.moveTo(0, h);		
	this.context.fillStyle = colour;
	for (var x = 0; x<=255; x++){
		this.context.lineTo((w/255)*x,(h-(val(this.histogram[x])*h)));						
	}			
	this.context.lineTo(w, h);
	this.context.closePath();
	this.context.fill();
};
