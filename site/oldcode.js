/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


SITE.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.textChanged = true; // vou usar para recalcular os dados de scroll da textarea
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

SITE.EditArea.prototype.addSelectionListener = function (listener) {
    this.textarea.onmousemove = function (ev) {
        if (this.isDragging) {
            listener.updateSelection();
        }    
    };
};

SITE.EditArea.prototype.addChangeListener = function (listener) {
    this.textarea.onkeyup = function () {
        this.textChanged = true;
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onmousedown = function () {
        this.isDragging = true;
        listener.updateSelection();
    };
    this.textarea.onmouseup = function () {
        this.isDragging = false;
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onchange = function () {
        this.textChanged = true;
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
};

SITE.EditArea.prototype.setSelection = function  (start, end ) {
    this.scrollTo(start);
    this.textarea.setSelectionRange(start, end);
    this.textarea.focus();
};

SITE.EditArea.prototype.scrollTo = function(start)
{
  var found = false;  
  var l = 0;
  this.computeScrollData();
  while(!found &&  l < this.totalLines ) {
      if( start > this.lineLimits[l].i+this.lineLimits[l].f ) {
          l ++;
      } else {
          found = true;
      }
  }
  if(!found) return;
  var x =  (start - this.lineLimits[l].i) / this.maxLine;
  
  var top = ((l  / this.totalLines) * this.textarea.scrollHeight)-this.textarea.clientHeight/2;
  
  var left = ( (x<0.33?0:x<0.66?0.33:0.66) ) * this.textarea.scrollWidth;
  
  this.textarea.scrollTop = top;
  this.textarea.scrollLeft = left ;
};

SITE.EditArea.prototype.computeScrollData = function () {
   if ( !this.textChanged ) return;
   var lines = this.textarea.value.split('\n');    
   this.textChanged=false;
   this.totalLines = lines.length;
   this.lineLimits = [];
   this.maxLine = 0;

   var size = 0;
   for( var l=0; l< lines.length; l++ ) {
       this.lineLimits[l] = { i: size, f: lines[l].length };
       size += lines[l].length + 1;
       this.maxLine = Math.max( lines[l].length, this.maxLine );
   }
};

SITE.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

SITE.EditArea.prototype.setString = function(str) {
  this.textChanged = true;
  this.initialText = str;
  this.textarea.value = str;
  this.textarea.selectionStart = 0;  
  this.textarea.selectionEnd = 0;  
};

SITE.EditArea.prototype.getElem = function() {
  return this.textarea;
};

SITE.KeySelector = function(id) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }
};

SITE.KeySelector.prototype.populate = function(offSet) {
    
    while( this.selector.options.length > 0 ) {
        this.selector.remove(0);
    }            
        
    for (var i = this.cromaticLength+offSet; i >= -this.cromaticLength+2+offSet; i--) {
        var opt = document.createElement('option');
        if(i-1 > offSet) 
            opt.innerHTML = ABCXJS.parse.number2keysharp[(i+this.cromaticLength-1)%this.cromaticLength] ;
        else
            opt.innerHTML = ABCXJS.parse.number2keyflat[(i+this.cromaticLength-1)%this.cromaticLength] ;
        opt.value = (i+this.cromaticLength-1);
        this.selector.appendChild(opt);
    }
    this.oldValue = offSet+this.cromaticLength;
    this.selector.value = offSet+this.cromaticLength;
};

SITE.KeySelector.prototype.set = function(value) {
    this.populate(value);
};

SITE.KeySelector.prototype.addChangeListener = function (editor) {
    this.selector.onchange = function () {
        editor.editorChanged(this.value - editor.keySelector.oldValue, "force");
    };
};

