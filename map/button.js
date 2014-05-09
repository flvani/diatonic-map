/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

Raphael.fn.arc = function(startX, startY, endX, endY, radius1, radius2, angle) {
  var arcSVG = [radius1, radius2, angle, 0, 1, endX, endY].join(' ');
  return this.path('M'+startX+' '+startY + " a " + arcSVG);
};

Raphael.fn.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
  var startX = centerX+radius*Math.cos(startAngle*Math.PI/180); 
  var startY = centerY+radius*Math.sin(startAngle*Math.PI/180);
  var endX = centerX+radius*Math.cos(endAngle*Math.PI/180); 
  var endY = centerY+radius*Math.sin(endAngle*Math.PI/180);
  return this.arc(startX, startY, endX-startX, endY-startY, radius, radius, 0);
};

DIATONIC.map.Button = function( paper, x, y, labelOpen, labelClose, options ) {

    var opt = options || {};
    
    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNRADIUS = opt.radius || DIATONIC.map.Units.BTNRADIUS;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = opt.fontsize || DIATONIC.map.Units.FONTSIZE; 
    this.x = x;
    this.y = y;
    this.labelOpen = labelOpen;
    this.labelClose = labelClose;
    this.paper = paper;

};

DIATONIC.map.Button.prototype.draw = function() {

    this.circle = this.paper.circle(this.x, this.y, this.BTNRADIUS + 2);
    this.circle.attr({"fill": "white", "stroke": "#000", "stroke-width": 1});

    this.line = this.paper.path( ["M", this.x-(this.BTNRADIUS+1), this.y+5, "L", this.x+this.BTNRADIUS+1, this.y-5 ] );
    this.line.attr({"fill": "none", "stroke": "#000", "stroke-width": 1});

    this.closeSide = this.paper.circularArc(this.x, this.y - 1, this.BTNRADIUS+1, 170, 350);
    this.closeSide.attr({"fill": "none", "stroke": "#00f", "stroke-width": 0});

    this.openSide = this.paper.circularArc(this.x, this.y + 1, this.BTNRADIUS+1, 350, 170);
    this.openSide.attr({"fill": "none", "stroke": "#00f", "stroke-width": 0});
    
    this.t1 = this.paper.text(this.x-10, this.y-10, this.labelClose).attr({'text-anchor': 'start'});
    this.t1.attr({"font-family": "Sans Serif", "font-size": this.FONTSIZE });
    
    this.t2 = this.paper.text(this.x-10, this.y+12, this.labelOpen).attr({'text-anchor': 'start'});
    this.t2.attr({"font-family": "Sans Serif", "font-size": this.FONTSIZE });

};

DIATONIC.map.Button.prototype.clear = function() {
    this.openSide.attr({"fill": "none", "stroke": "#0f0", "stroke-width": 0});
    this.closeSide.attr({"fill": "none", "stroke": "#00f", "stroke-width": 0});
};

DIATONIC.map.Button.prototype.setOpen = function() {
    this.openSide.attr({"fill": "#0f0", "stroke": "#0f0", "stroke-width": 0});
};
DIATONIC.map.Button.prototype.setClose = function() {
    this.closeSide.attr({"fill": "#f00", "stroke": "#00f", "stroke-width": 0});
};

/*
function drawCircle() {
  var archtype = Raphael("canvas60s", 200, 200);
  archtype.customAttributes.arc = function (xloc, yloc, value, total, R) {
    var alpha = 360 / total * value,
        a = (90 - alpha) * Math.PI / 180,
        x = xloc + R * Math.cos(a),
        y = yloc - R * Math.sin(a),
        path;
    if (total == value) {
      path = [
          ["M", xloc, yloc - R],
          ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
      ];
    } else {
      path = [
          ["M", xloc, yloc - R],
          ["A", R, R, 0, +(alpha > 180), 1, x, y]
      ];
    }
    return {
       path: path
    };
  };


  var my_arc = archtype.path().attr({
      "stroke": "#339933",
      "stroke-width": 10,
      arc: [100, 100, 0, 100, 50]
  });



  my_arc.animate({
     arc: [100, 100, 100, 100, 50]
  }, 60000);



};
*/