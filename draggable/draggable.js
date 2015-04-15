/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DRAGGABLE)
    window.DRAGGABLE= {};

DRAGGABLE.idWin = 0;

DRAGGABLE.Div = function(topDiv, title, aButtons, callBack ) {
    var self = this;
    
    this.topDiv = document.getElementById(topDiv);
    
    if(!this.topDiv) {
        // criar uma div
        return;
    }    
    
    this.id = ++DRAGGABLE.idWin;
    
    self.topDiv.style.position = "fixed";
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = "100px";
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = "100px";
    
    this.marginTop  = this.topDiv.offsetTop - parseInt(this.topDiv.style.top) ;
    this.marginLeft = this.topDiv.offsetLeft - parseInt(this.topDiv.style.left);
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu" ); 
    div.setAttribute("draggable", "false" ); 
    div.innerHTML = this.addButtons(this.id, aButtons, callBack ) + this.addTitle(this.id, title);
    this.topDiv.appendChild( div );
    this.menuDiv = div;
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    this.moveButton = document.getElementById("dMOVEButton"+this.id);
    this.closeButton = document.getElementById("dMINUSButton"+this.id);
    this.titleSpan = document.getElementById("dSpanTitle"+this.id);

    this.divMove = function(e){
        e.stopPropagation();
        e.preventDefault();
        self.topDiv.style.top = ((e.y-self.y) + parseInt(self.topDiv.style.top) ) + "px";
        self.topDiv.style.left = ((e.x-self.x) + parseInt(self.topDiv.style.left) ) + "px"; 
        self.x = e.x;
        self.y = e.y;
        
    };

    this.mouseUp = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
    };

    this.mouseDown = function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.x;
        self.y = e.y;

    };

    this.moveButton.addEventListener( 'mousedown', this.mouseDown, false);
    window.addEventListener('mouseup', this.mouseUp, false);
    
};

DRAGGABLE.Div.prototype.setTitle = function( title ) {
    this.titleSpan.innerHTML = title;
};

DRAGGABLE.Div.prototype.addTitle = function( id, title ) {
    return '<div class="dTitle"><span id="dSpanTitle'+id+'" >'+title+'</span>';
};

DRAGGABLE.Div.prototype.addButtons = function( id,  aButtons, callBack ) {
    var txt = "";
    aButtons.forEach( function (label) {
        label = label.split('|');
        label[1]  = label.length > 1 ? label[1] : "";
        txt += '<div id="d'+label[0].toUpperCase() +'Button'+id+
                '" class="dButton" draggable="false"><a href="#" title="'+label[1]+'" onclick="'
                +callBack+'(\''+label[0].toUpperCase()+'\')"><i class="icon-'
                +label[0].toLowerCase()+' icon-white"></i></a></div>';
    });
    return txt;
};
