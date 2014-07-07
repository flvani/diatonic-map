/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.midi) 
    window.DIATONIC.midi = {baseduration: 1920 }; // nice and divisible, equals 1 whole note

DIATONIC.midi.Player = function(map, playButton, options ) {

    this.map = map;
    this.playLink = playButton;
    
    this.reset( options );
};

DIATONIC.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 60;
    this.playing = false;
    this.playlist = []; // contains {time:t,funct:f} pairs
    this.ticksperinterval = DIATONIC.midi.baseduration / 16; // 16th note - TODO: see the min in the piece
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.currentMeasurePos = 0;
    this.lastMeasurePos = 0;
    this.currentAndamento = 1;
    
};

DIATONIC.midi.Player.prototype.adjustAndamento = function(bt) {
    
    if(this.currentAndamento === 1 ) {
        this.currentAndamento = 0.5;
        this.currentTime = this.currentTime * 2;
        bt.innerHTML = '<b>&nbsp;&#189;&nbsp;<b>';
    } else if(this.currentAndamento === 0.5 ) {
        bt.innerHTML = '<b>&nbsp;&#188;&nbsp;<b>';
        this.currentTime = this.currentTime * 2;
        this.currentAndamento = 0.25;
    } else if(this.currentAndamento === 0.25 ) {
        this.currentAndamento = 1;
        this.currentTime = this.currentTime /4;
        bt.innerHTML = '<b>&nbsp;1&nbsp;<b>';
    }    
};

DIATONIC.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
    this.playLink.title = DR.resource["playBtn"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
    this.printer.clearSelection();
    this.map.gaita.clearKeyboard(true);
};

DIATONIC.midi.Player.prototype.pausePlay = function() {
    MIDI.stopAllNotes();
    window.clearInterval(this.playinterval);
    this.playLink.title = DR.resource["playBtn"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
    this.playing = false;
    this.map.ypos = 1000;
};


DIATONIC.midi.Player.prototype.startPlay = function(what) {

    if(this.playing) return;
    
    this.playlist = what.notes;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.map.ypos = 1000;

    this.playing = true;
    this.playLink.title = DR.resource["DR_pause"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
  
    var self = this;
    this.doPlay();
    this.playinterval = window.setInterval(function() { self.doPlay(); }, 60000/this.tempo);
};

DIATONIC.midi.Player.prototype.doPlay = function() {
    while (this.playlist[this.i] &&
           this.playlist[this.i].time <= this.currentTime) {
        this.playlist[this.i].funct();
        this.i++;
    }
    if (this.playlist[this.i]) {
        this.currentTime += this.ticksperinterval;
    } else {
        this.stopPlay();
    }
};

DIATONIC.midi.Player.prototype.clearDidacticPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.currentMeasurePos = 0;
    this.lastMeasurePos = 0;
    this.pauseDidacticPlay();
    this.printer.clearSelection();
    this.map.gaita.clearKeyboard(true);
};


DIATONIC.midi.Player.prototype.pauseDidacticPlay = function(nonStop) {
    if(!nonStop) MIDI.stopAllNotes();
    window.clearInterval(this.didacticPlayinterval);
    this.playing = false;
    this.map.ypos = 1000;
};

DIATONIC.midi.Player.prototype.startDidacticPlay = function(what, type, value) {

    if(this.playing) return;
    
    this.playlist = what.notes;
    this.tempo  = what.tempo;
    this.printer = what.printer;
//    this.measures = what.measures;
    this.map.ypos = 1000;

    this.playing = true;
    
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            var curr = (that.playlist[that.i].time*(1/that.currentAndamento));
            var criteria = function () { 
                return curr === (that.playlist[that.i].time*(1/that.currentAndamento));
            };
            break;
        case 'goto': // goto and play measure
            that.currentMeasure = parseInt(value);
            if(what.measures[that.currentMeasure] !== undefined )
                that.lastMeasurePos = what.measures[that.currentMeasure];
            else {
               this.pauseDidacticPlay();
               return;
           }   
        case 'repeat': // measure
            if(that.currentMeasure === 1) {
                that.i = 0;
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                that.currentMeasurePos = that.i;
            } else {
                that.i = that.lastMeasurePos;
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                that.currentMeasure = that.playlist[that.i].barNumber;
                that.currentMeasurePos = that.i;
                
            }    
        case 'measure': // play-measure
            var curr = that.currentMeasure;
            var criteria = function () { 
                return curr === that.currentMeasure;
            };
            break;
    }
  
    this.doDidacticPlay(criteria);
    this.didacticPlayinterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, 60000/this.tempo);
};

DIATONIC.midi.Player.prototype.doDidacticPlay = function(criteria) {
    while (this.playlist[this.i] && criteria() &&
            (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.playlist[this.i].funct();
        this.i++;
        if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
            this.lastMeasurePos = this.currentMeasurePos;
            this.currentMeasurePos = this.i;
            this.currentMeasure = this.playlist[this.i].barNumber;
            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
        }
        
    }
    if( this.playlist[this.i] && criteria() ) {
        this.currentTime += this.ticksperinterval;
    } else {
        this.pauseDidacticPlay(true);
    }
};



//DIATONIC.midi.Player.prototype.playMeasure = function() {
//    var started = false;
//    while(this.i < this.playlist.length && !( started && this.playlist[this.i].barNumber ) ) {
//        started = true;
//        if(this.playlist[this.i].barNumber) {
//            this.currentMeasure = this.playlist[this.i].barNumber;
//            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
//        }
//        this.playlist[this.i].funct();
//        this.i++;
//    }
//    this.t = this.playlist[this.i].time;
//};
//
//DIATONIC.midi.Player.prototype.doDebugPlay = function(container) {
//    var that = this;
//    this.pressed = false;
//    while(this.i < this.playlist.length && this.t >= (this.playlist[this.i].time*(1/this.currentAndamento))) {
//        if(this.playlist[this.i].barNumber) {
//            this.currentMeasure = this.playlist[this.i].barNumber;
//            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
//        }
//        this.playlist[this.i].funct();
//        this.i++;
//    }
//    this.t = this.playlist[this.i].time;
//    setTimeout(that.waitForIt(container),1);
//};
//
//
//DIATONIC.midi.Player.prototype.startDebugPlay = function(what,container) {
//    
//    var that = this;
//    
//    if(!this.playing){
//      this.key = '';
//      this.pressed = false;
//      this.i = 0;
//      this.t = 0;
//      this.playing = true;
//      this.playlist = what.notes;
//      this.tempo  = what.tempo;
//      this.printer = what.printer;
//    }
//    
//    //container.addEventListener('keydown', that.keydownHandler, false);
//    //container.addEventListener('mousedown', that.mousedownHandler, false);
//    this.doDebugPlay(container);
//};
//
//DIATONIC.midi.Player.prototype.keydownHandler = function (e) {
//  this.pressed = true;
//  this.key = e.keyCode;
//};
//
//DIATONIC.midi.Player.prototype.mousedownHandler = function () {
//  this.key = 'mousedown';
//  this.pressed = true;
//};
//
//DIATONIC.midi.Player.prototype.waitForIt = function(container) {
//  var that = this;
//  if (!this.pressed && this.key !== 27 ) {
//    setTimeout(that.waitForIt,1);
//  } else {
//    if(this.key !== 27 && this.i < this.playlist.length) {
//      this.doDebugPlay(); 
//    } else {
//        //console.log('saindo');
//        this.playing = false;
//        // unregister your handler method for the keydown event
//        //container.removeEventListener('keydown', that.keydownHandler, false);
//        //container.removeEventListener('mousedown', that.mousedownHandler, false);
//    }
//  }
//};
