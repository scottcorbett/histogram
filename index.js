/** 
@module histogram
*/
"use strict;";
module.exports = Histogram;


/**
A module to create image histograms.
@constructor
@alias module:histogram
@param {object} [conf] Object literal configuration object with all optional fields. See example for default values.
@author scottcorbett
@example
   
new require("histogram")({       
  width : 255, // width of the resulting image.
  height : 128, // height of the resulting image.
  red: #d55, // colour used for red in the graph.
  green: #5d5, // colour used for green in the graph. 
  blue: #55d, // colour used for blue in the graph.
  black: #555 // colour used for portions of the graph overlapped by all colours  
});
 */
function Histogram(conf){
	if (!(this instanceof Histogram)) return new Histogram(conf);

	this.histogram = [];
	this.conf = {
		width: 255,
		height: 128,
		red: "#d55",
		green: "#5d5",
		blue: "#55d",
		black: "#555"
	};
	this.setConf(conf);
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.clearRGB();
}

/**
Sets configuration used for drawing, expects an object in the same format as the constructor conf.			
@param {object} conf Object literal configuration object with all optional fields.
@return {histogram} self
*/
Histogram.prototype.setConf = function(conf){
	var name = "";
	for (name in conf){
		this.conf[name] = conf[name];
	}
	return this;
};
	
/**
Creates an image histogram based off the img object passed in and returns a data url.
@param {Image} source Source image to base histogram on.
@return {String} data url for the resulting histogram.
*/
Histogram.prototype.forImg = function(source){
	var srcCanvas = document.createElement("canvas");
	var ctx = srcCanvas.getContext('2d');
	ctx.canvas.width = source.width;
	ctx.canvas.height = source.height;
	ctx.drawImage(source, 0, 0);
	return this.forCanvas(srcCanvas);
};

/**
Creates an image histogram based off the canvas object passed in and returns a data url.
@param {Canvas} source Source canvas to base histogram on.
@return {String} data url for the resulting histogram.
*/
Histogram.prototype.forCanvas = function(source){
	var ctx = source.getContext('2d');
	var img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
	for (var i=0; i<img.data.length; i=i+4){
		this.setRGB({
			r: img.data[i],
			g: img.data[i+1],
			b: img.data[i+2]
		});
	}

	return this.draw();
};

/**
Clears the rgb values used to generated the histogram.
*/
Histogram.prototype.clearRGB = function(){
	for (var i=0; i<=255; i++){
		this.histogram[i] = {
			r: 0,
			g: 0,
			b: 0
		};
	}
};

/**
Increments the RGB tone counts based off the object literal passed in. 
@param {object} val Object literal with rgb values to add to tone counts.
@example
histogram.setRBG({              
  r : 255,  
  g : 128,  
  b : 64  
}); 
*/
Histogram.prototype.setRGB = function(val){
	this.histogram[Math.min(255, Math.max(0, val.r))].r++;
	this.histogram[Math.min(255, Math.max(0, val.g))].g++;
	this.histogram[Math.min(255, Math.max(0, val.b))].b++;
};

/**
Generates the histogram based off the RGB tone counts set and returns a data url for the resulting image.
@return {String} data url for the resulting histogram.
*/
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

/**
Draw a polygon on the main canvas.
@param {String} colour Colour of the polygon
@param {Function} val Function to get the value used for a point. Function will get rgb object literal will be passed in.
@private
*/
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
