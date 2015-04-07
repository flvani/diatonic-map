/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.accordionMaps = [];

DIATONIC.map.key2number = 
    {"C":0, "C♯":1, "D♭":1, "D":2, "D♯":3, "E♭":3, "E":4, 
     "F":5 ,"F♯":6 ,"G♭":6, "G":7, "G♯":8 ,"A♭":8, "A":9, "A♯":10, "B♭":10, "B":11 };

DIATONIC.map.number2key    = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
DIATONIC.map.number2key_br = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];

DIATONIC.map.Units = {
    // aspectos do botão
     BTNSIZE: 52
    ,BTNRADIUS: 26
    ,BTNSPACE: 3
    ,FONTSIZE: 18 // razoavel ser menor que metade do btnSize
};


DIATONIC.map.loadAccordionMaps = function ( files, cb )  {
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++ ) {
        toLoad ++;
        FILEMANAGER.register('MAP');

        $.getJSON( files[f], {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('MAP', true);
                DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap(data) );
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('MAP', false);
                var err = textStatus + ", " + error;
                console.log( "Accordion Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --;
                if( toLoad === 0 && cb ) cb();
            });
    }
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.AccordionMap = function (res, local) {
    this.id = res.id;
    this.menuOrder = res.menuOrder;
    this.model = res.model;
    this.tuning = res.tuning;
    this.buttons = res.buttons;
    this.image = res.image || 'img/accordion.default.gif';
    this.keyboard = new DIATONIC.map.Keyboard( res.keyboard, res.pedal );
    this.songPathList = res.songPathList;
    this.practicePathList = res.practicePathList;
    this.chordPathList = res.chordPathList;
    this.localResource = local || false;
    this.songs = { items:{}, sortedIndex: [] };
    this.practices = { items:{}, sortedIndex: [] };
    this.chords = { items:{}, sortedIndex: [] };

    if( ! this.localResource ) {
        this.songs = this.loadABCX( this.songPathList );
        this.chords = this.loadABCX( this.chordPathList );
        this.practices = this.loadABCX( this.practicePathList );
    }
};

DIATONIC.map.AccordionMap.prototype.getId = function () {
    return this.id;
};

DIATONIC.map.AccordionMap.prototype.getName = function () {
    return this.getModel() + " " + this.getTxtTuning() + " - " + this.getTxtNumButtons();
};

DIATONIC.map.AccordionMap.prototype.getModel = function () {
    return this.model;
};

DIATONIC.map.AccordionMap.prototype.getTxtNumButtons = function() {
    var a = this.buttons;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' + a[c] + str_label;
    }
    return a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getTxtTuning = function() {
    var a = this.tuning;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' +  a[c] + str_label;
    }
    return  a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getPathToImage = function () {
    return this.image;
};

DIATONIC.map.AccordionMap.prototype.getChord = function (name) {
    return this.chords.items[name];
};
DIATONIC.map.AccordionMap.prototype.setChord = function (name,content, addSort) {
    this.chords.items[name] = content;
    if(addSort) this.chords.sortedIndex.push( name );
};

DIATONIC.map.AccordionMap.prototype.getSong = function (name) {
    return this.songs.items[name];
};
DIATONIC.map.AccordionMap.prototype.setSong = function (name,content, addSort) {
    this.songs.items[name] = content;
    if(addSort) this.songs.sortedIndex.push( name );
};

DIATONIC.map.AccordionMap.prototype.getPractice = function (name) {
    return this.practices.items[name];
};
DIATONIC.map.AccordionMap.prototype.setPractice = function (name,content, addSort) {
    this.practices.items[name] = content;
    if(addSort) this.practices.sortedIndex.push( name );
};

DIATONIC.map.AccordionMap.prototype.getFirstSong = function () {
    var ret = this.songs.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstPractice = function () {
    var ret = this.practices.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstChord = function () {
    var ret = this.chords.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.loadABCX = function(pathList, cb ) {
    var toLoad = 0;
    var path;
    var objRet = { items:{}, sortedIndex: [] };
    for (var s = 0; s < pathList.length; s++) {
        toLoad ++;
        FILEMANAGER.register('ABCX');
        path = pathList[s];
        $.get( path )
            .done( function( data ) {
                FILEMANAGER.deregister('ABCX', true);
                var tunebook = new ABCXJS.TuneBook(data);
                for (var t = 0; t < tunebook.tunes.length; t ++)  {
                    objRet.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                    objRet.sortedIndex.push( tunebook.tunes[t].title );
                }    
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('ABCX', false);
                var err = textStatus + ", " + error;
                console.log( "ABCX Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --;
                if(toLoad === 0 ) { 
                   objRet.sortedIndex.sort();
                   if(cb) cb(); // call back in the last pass
                }
            });
    }
    return objRet;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Keyboard = function (keyMap, pedalInfo) {
    this.showLabel = false;
    this.pedalInfo = pedalInfo;
    this.layout = keyMap.layout;
    this.keys = keyMap.keys;
    this.basses = keyMap.basses;
    this.noteToButtonsOpen = {};
    this.noteToButtonsClose = {};
    this.legenda = {};
    this.baseLine = {}; // linha decorativa
    
    this.limits = {minX:10000, minY:10000, maxX:0, maxY:0};
    
    this.BTNRADIUS = DIATONIC.map.Units.BTNRADIUS;
    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE;
    
    this.setup(keyMap);
};

DIATONIC.map.Keyboard.prototype.setup = function (keyMap) {

    var x, y, yi, bassY;

    var nIlheiras = keyMap.keys.open.length;
    var nIlheirasBaixo = keyMap.basses.open.length;

    this.keyMap = new Array();
    this.modifiedItems = new Array();

    // ilheiras da mao direita
    var maiorIlheira = 0;
    for (i = 0; i < nIlheiras; i++) {
        this.keyMap[i] = new Array(keyMap.keys.open[i].length);
        maiorIlheira = Math.max( keyMap.keys.open[i].length, maiorIlheira);
    }

    // ilheiras da mao esquerda
    var maiorIlheiraBaixo = keyMap.basses.open[0].length;
    for (i = nIlheiras; i < nIlheiras + nIlheirasBaixo; i++) {
        this.keyMap[i] = new Array(keyMap.basses.open[i - nIlheiras].length);
    }

    this.width = (nIlheiras + nIlheirasBaixo + 1) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSPACE*2;
    this.height = (maiorIlheira) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSIZE/2;
    
    bassY = this.BTNSPACE * 4 + (((maiorIlheira - maiorIlheiraBaixo) / 2)) * (this.BTNSIZE + this.BTNSPACE);
    
    var openRow, closeRow, bass, noteName;
    
    for (var j = 0; j < this.keyMap.length; j++) {

        if (j < nIlheiras) {
            x = this.BTNSPACE + (j + 0.6) * (this.BTNSIZE + this.BTNSPACE);
            yi = (this.BTNSPACE * 4) + (this.getLayout(j) + 0.5) * (this.BTNSIZE + this.BTNSPACE);
            openRow = keyMap.keys.open[j];
            closeRow = keyMap.keys.close[j];
            bass = false;
        } else {
            x = this.BTNSPACE + (j + 1.4) * (this.BTNSIZE + this.BTNSPACE);
            yi = bassY + 0.5 * (this.BTNSIZE + this.BTNSPACE);
            openRow = keyMap.basses.open[j - nIlheiras];
            closeRow = keyMap.basses.close[j - nIlheiras];
            bass = true;
        }

        for (var i = 0; i < this.keyMap[j].length; i++) {

            y = yi + i * (this.BTNSIZE + this.BTNSPACE);
            
            this.limits.minX = Math.min(this.limits.minX, x );
            this.limits.minY = Math.min(this.limits.minY, y );
            this.limits.maxX = Math.max(this.limits.maxX, x );
            this.limits.maxY = Math.max(this.limits.maxY, y );

            var btn  = new DIATONIC.map.Button( x, y, {pedal: this.isPedal(i, j)} );
            
            btn.tabButton = (i + 1) + Array(j + 1).join("'");
            btn.openNote = this.parseNote(openRow[i], bass);
            btn.closeNote = this.parseNote(closeRow[i], bass);
            btn.setText( this.showLabel );
            
            noteName = btn.openNote.key + (bass?'':btn.openNote.octave);
            if (!this.noteToButtonsOpen[ noteName ]) this.noteToButtonsOpen[ noteName ] = [];
            this.noteToButtonsOpen[ noteName ].push(btn.tabButton);

            noteName = btn.closeNote.key + (bass?'':btn.closeNote.octave);
            if (!this.noteToButtonsClose[ noteName ]) this.noteToButtonsClose[ noteName ] = [];
            this.noteToButtonsClose[ noteName ].push(btn.tabButton);
            
            this.keyMap[j][i] = btn;
        }
    }
    // posiciona linha decorativa
    x = this.BTNSPACE + (nIlheiras+0.5) * (this.BTNSIZE + this.BTNSPACE);
    y = bassY - 0.5 * (this.BTNSIZE + this.BTNSPACE);
    this.baseLine = {x: x, yi:y, yf:y + 5 * (this.BTNSIZE + this.BTNSPACE)};
    
    // adiciona o botão de legenda - acertar textos de legenda
    // DR.getResource("DR_pull"), DR.getResource("DR_push"),
    this.legenda = new DIATONIC.map.Button( 
        this.limits.maxX-(this.BTNRADIUS + this.BTNSPACE), this.limits.minY+(this.BTNRADIUS + this.BTNSPACE), 
        {openLabel: 'Abre', closeLabel: 'Fecha', radius: 36, pedal: true, fontsize: 14, xLabel: 0, textAnchor: 'middle', color: '#828282'}
    );
};

DIATONIC.map.Keyboard.prototype.print = function (paper, div, options ) {
    
    options = options || {};
    
    this.paper = paper;
    this.paper.clear();
    
    options.scale = options.scale || 1;
    options.mirror = options.mirror || false;
    options.transpose = options.transpose || false;
    
    this.legenda.draw(this.paper, this.limits, options);
    this.legenda.setOpen();
    this.legenda.setClose();
    
    if(options.transpose) {
        this.paper.setSize(this.height*options.scale,this.width*options.scale);
        div.style.height = this.width*options.scale + "px";
        div.style.width = this.height*options.scale + "px";
        var mirr = options.mirror ? this.baseLine.x : this.limits.maxX - (this.baseLine.x - this.limits.minX);
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(this.baseLine.yi*options.scale, x*options.scale, this.baseLine.yf*options.scale, x*options.scale);
        }
    } else {
        this.paper.setSize(this.width*options.scale, this.height*options.scale);
        div.style.height = this.height*options.scale + "px";
        div.style.width = this.width*options.scale + "px";
        var mirr = options.mirror ? this.limits.maxX - (this.baseLine.x - this.limits.minX) : this.baseLine.x;
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(x*options.scale, this.baseLine.yi*options.scale, x*options.scale, this.baseLine.yf*options.scale);
        }
    }
    
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].draw(this.paper, this.limits, options );
        }
    }
};

DIATONIC.map.Keyboard.prototype.drawLine = function(xi,yi,xf,yf) {
    this.paper.path( ["M", xi, yi, "L", xf, yf ] )
            .attr({"fill": "none", "stroke": "black", "stroke-width": 1});
};

DIATONIC.map.Keyboard.prototype.getLayout = function (r) {
    return this.layout[r] || 0;
};

DIATONIC.map.Keyboard.prototype.isPedal = function (i,j) {
    return (this.pedalInfo[1] === (i+1)) && (this.pedalInfo[0] === (j+1));
};

DIATONIC.map.Keyboard.prototype.parseNote = function(txtNota, isBass) {

  var nota = {};
  var s = txtNota.split(":");
  var k = s[0].charAt(s[0].length-1);
  
  nota.key        = parseInt(k) ? s[0].replace( k, '' ) : s[0];
  nota.octave     = parseInt(k) ? parseInt(k) : 4;
  nota.complement = s[1] ? s[1] : "";
  nota.value      = DIATONIC.map.key2number[ nota.key.toUpperCase() ];
  nota.isChord    = ( nota.key === nota.key.toLowerCase() );
  nota.isBass     = isBass;
  nota.isMinor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;
  
  if (typeof (nota.value) === "undefined" ) {
      throw new Error( 'Nota inválida: ' + txtNota );
  };

  return nota;
};

DIATONIC.map.Keyboard.prototype.changeNotation = function() {
    this.showLabel = !this.showLabel;
    this.redraw();
};

DIATONIC.map.Keyboard.prototype.redraw = function() {
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            var key = this.keyMap[j][i];
            key.setText( this.showLabel );
        }
    }
};

DIATONIC.map.Keyboard.prototype.clear = function (full) {
    full = true; // modificação em andamento
    if (full) {
        for (var j = 0; j < this.keyMap.length; j++) {
            for (var i = 0; i < this.keyMap[j].length; i++) {
                this.keyMap[j][i].clear();
            }
        }
    } else {
        for (var i = 0; i < this.modifiedItems.length; i++) {
            this.modifiedItems[i].clear();
        }
    }
    this.modifiedItems = new Array();
};


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

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

DIATONIC.map.Button = function( x, y, options ) {

    var opt = options || {};
    
    this.x = x;
    this.y = y;
    this.paper = null;
    this.openNote = null;
    this.closeNote = null;
    this.closeSide = null;
    this.openSide = null;
    this.closeNoteKey = null;
    this.openNoteKey = null;
    this.tabButton = null;
    
    this.openColor = opt.openColor || '#00ff00';
    this.closeColor = opt.closeColor || '#00b2ee';
    this.openLabel = opt.openLabel|| '';
    this.closeLabel = opt.closeLabel|| '';
    this.xLabel = opt.xLabel || 0;
    this.pedal = opt.pedal || false;
    this.stroke = this.pedal ? 2 : 1;
    this.textAnchor = opt.textAnchor || 'middle';
    this.color = opt.color || (opt.pedal? 'red' :'black');
    this.BTNRADIUS = opt.radius || DIATONIC.map.Units.BTNRADIUS;
    this.FONTSIZE = opt.fontsize || DIATONIC.map.Units.FONTSIZE; 

};

DIATONIC.map.Button.prototype.draw = function( paper, limits, options ) {
    
    var currX, currY, currRadius, currFontSize;

    if( options.transpose ) {
        //horizontal
        currX = this.y;
        currY = options.mirror ? this.x : limits.maxX - (this.x - limits.minX);
    } else {
        //vertical
        currX = options.mirror ? limits.maxX - (this.x - limits.minX): this.x;
        currY = this.y;
    }
    
    currX *= options.scale;
    currY *= options.scale;
    currRadius =  this.BTNRADIUS*options.scale;
    currFontSize = this.FONTSIZE*options.scale;
    
    //background
    this.paper = paper || this.paper;
    
    this.circle = this.paper.circle(currX, currY, currRadius);
    this.circle.attr({"fill": "white", "stroke": "white", "stroke-width": 0});

    this.closeSide = this.paper.circularArc(currX, currY, currRadius, 170, 350);
    this.closeSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});

    this.openSide = this.paper.circularArc(currX, currY, currRadius, 350, 170);
    this.openSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});

    this.closeNoteKey = this.paper.text(currX + (this.xLabel*options.scale), currY-(12*options.scale), this.closeLabel)
            .attr({'text-anchor': this.textAnchor, "font-family": "Sans Serif", "font-size": currFontSize });
    
    this.openNoteKey = this.paper.text(currX + (this.xLabel*options.scale), currY+(12*options.scale), this.openLabel)
            .attr({'text-anchor': this.textAnchor, "font-family": "Sans Serif", "font-size": currFontSize });
    
    // top circle and line
    this.paper.circle(currX, currY, currRadius)
            .attr({"fill": "none", "stroke": this.color, "stroke-width": this.stroke});
    this.paper.path( ["M", currX-currRadius, currY+(5*options.scale), "L", currX+currRadius, currY-(5*options.scale) ] )
            .attr({"fill": "none", "stroke": this.color, "stroke-width": this.stroke});
};

DIATONIC.map.Button.prototype.clear = function() {
    if(!this.closeSide) return;
    this.openSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});
    this.closeSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.openSide) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.openSide.attr({"fill": that.openColor, "stroke": that.openColor, "stroke-width": 0});}, delay );
    } else {
        that.openSide.attr({"fill": that.openColor, "stroke": that.openColor, "stroke-width": 0});
    }
};
DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.closeSide) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.closeSide.attr({"fill": that.closeColor, "stroke": that.closeColor, "stroke-width": 0});}, delay);
    } else {
        that.closeSide.attr({"fill": that.closeColor, "stroke": that.closeColor, "stroke-width": 0});
    }    
};

DIATONIC.map.Button.prototype.getLabel = function(nota, showLabel) {
    var l = '';
    if (nota.isChord) {
        l = DIATONIC.map.number2key[ nota.value ].toLowerCase() + '';
    } else {
        if (showLabel) {
            l = nota.key = DIATONIC.map.number2key_br[nota.value ];
        } else {
            l = nota.key = DIATONIC.map.number2key[nota.value ];
        }
    }
    if( nota.isMinor ) {
        l+='-';
    }
    
    return l;
};
  
DIATONIC.map.Button.prototype.setText = function( showLabel ) {
    this.setTextOpen( this.getLabel( this.openNote, showLabel ) );
    this.setTextClose( this.getLabel( this.closeNote, showLabel ) );
};

DIATONIC.map.Button.prototype.setTextClose = function(t) {
    this.closeLabel = t;
    if(this.closeNoteKey)
        this.closeNoteKey.attr('text', this.closeLabel );
};

DIATONIC.map.Button.prototype.setTextOpen = function(t) {
    this.openLabel = t;
    if(this.openNoteKey)
        this.openNoteKey.attr('text', this.openLabel );
};
