/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.play)
    window.DIATONIC.play = {};

DIATONIC.play.Player = function(map, parent, options) {
  options = options || {};
  
  this.map = map;

  this.playlist = []; // contains {time:t,funct:f} pairs
  this.trackcount = 0;
  this.timecount = 0;
  this.tempo = 60;
  this.i = 0;
  this.currenttime = 0;
  
  this.parent = parent;
  this.scale = [0,2,4,5,7,9,11];
  this.restart = {line:0, staff:0, voice:0, pos:0};
  this.visited = {};
  this.multiplier =1;
  this.next = null;
  this.qpm = options.qpm || 180;
  this.program = options.program || 2;
	this.noteOnAndChannel = "%90";
  this.listeners = [];
  this.transpose = 0;	// PER
 
};

DIATONIC.play.Player.prototype.addListener = function(listener) {
  this.listeners.push(listener);
};

DIATONIC.play.Player.prototype.notifySelect = function (abcelem) {
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].notifySelect(abcelem.abselem);
  }
};

DIATONIC.play.Player.prototype.getMark = function() {
  return {line:this.line, staff:this.staff, 
	  voice:this.voice, pos:this.pos};
};

DIATONIC.play.Player.prototype.getMarkString = function(mark) {
  mark = mark || this;
  return "line"+mark.line+"staff"+mark.staff+ 
	  "voice"+mark.voice+"pos"+mark.pos;
};

DIATONIC.play.Player.prototype.goToMark = function(mark) {
  this.line=mark.line;
  this.staff=mark.staff;
  this.voice=mark.voice;
  this.pos=mark.pos;
};

DIATONIC.play.Player.prototype.markVisited = function() {
  this.lastmark = this.getMarkString();
  this.visited[this.lastmark] = true;
};

DIATONIC.play.Player.prototype.isVisited = function() {
  if (this.visited[this.getMarkString()]) return true;
  return false;
};

DIATONIC.play.Player.prototype.setJumpMark = function(mark) {
  this.visited[this.lastmark] = mark;
};

DIATONIC.play.Player.prototype.getJumpMark = function() {
  return this.visited[this.getMarkString()];
};

DIATONIC.play.Player.prototype.getLine = function() {
  return this.abctune.lines[this.line];
};

DIATONIC.play.Player.prototype.getStaff = function() {
  try {
  return this.getLine().staffs[this.staff];
  } catch (e) {

  }
};

DIATONIC.play.Player.prototype.getVoice = function() {
  return this.getStaff().voices[this.voice];
};

DIATONIC.play.Player.prototype.getElem = function() {
  return this.getVoice()[this.pos];
};


DIATONIC.play.Player.prototype.startPlay = function() {
    
  if(this.map.gaita.printer) {
      this.addListener(this.map.gaita.printer);
  }

    
  this.playing = true;
  var self = this;
  // repeat every 16th note TODO see the min in the piece
  this.ticksperinterval = 480/4;
  this.doPlay();
  this.playinterval = window.setInterval(function() {self.doPlay(); },
					 (60000/(this.tempo*4)));
};

DIATONIC.play.Player.prototype.stopPlay = function() {
  this.i=0;
  this.currenttime=0;
  this.pausePlay();
  //this.playlink.innerHTML = "play";
};

DIATONIC.play.Player.prototype.pausePlay = function() {
  this.playing = false;
  window.clearInterval(this.playinterval);
  //this.stopAllNotes();
};



DIATONIC.play.Player.prototype.doPlay = function() {
  while(this.playlist[this.i] && 
	this.playlist[this.i].time <= this.currenttime) {
    this.playlist[this.i].funct();
    this.i++;
  } 
  if (this.playlist[this.i]) {
    this.currenttime+=this.ticksperinterval;
  } else {
    this.stopPlay();
  }
};



DIATONIC.play.Player.prototype.stopPlayingNClear = function() {  
  window.clearTimeout(this.map.gTimeout);  
  this.map.gaita.clearKeyboard();
  this.map.gaita.sounding = false;
  this.map.gIntervalo = 256;
};

DIATONIC.play.Player.prototype.stopPlaying = function() {  
  window.clearTimeout(this.map.gTimeout);  
  this.map.gaita.sounding = false;
  this.map.gIntervalo = 256;
};
   
DIATONIC.play.Player.prototype.setTempo = function (qpm) {
  this.tempo = qpm;
};
   
DIATONIC.play.Player.prototype.playTabSong = function(tune) {
    var bpm  = 108.0;
    var duration = 0.25;
    this.baseduration = 480*4; // nice and divisible, equals 1 whole note
    this.baraccidentals = [];
    this.playlist = []; // contains {time:t,funct:f} pairs
    
    this.abctune = tune;
    
    if(tune.metaText.tempo) {
       bpm = tune.metaText.tempo.bpm || bpm;
       duration = tune.metaText.tempo.duration[0] || duration;
    }
    if(tune.hasTablature) {
      s = tune.tabStaffPos;
    }
    this.qpm = bpm*duration*4;
    this.setTempo(this.qpm);    
    
    this.staffcount=1; // we'll know the actual number once we enter the code
    for(this.staff=0;this.staff<this.staffcount;this.staff++) {
      this.voicecount=1;
      for(this.voice=0;this.voice<this.voicecount;this.voice++) {
	this.startTrack();
	this.restart = {line:0, staff:this.staff, voice:this.voice, pos:0};
	this.next= null;
	for(this.line=0; this.line<this.abctune.lines.length; this.line++) {
	  if (this.getLine().staffs) {
	    this.writeABCLine();
	  }
	}
	this.endTrack();
      }
    }

    this.startPlay();
    //this.stopPlay();
    
//    for(var l = 0; l < tune.lines.length; l++){
//        for(var v = 0; v < tune.lines[l].staffs[s].voices[0].length; v++){
//
//        }
//    }

    return tune;
};

DIATONIC.play.Player.prototype.updatePos = function() {
  while(this.playlist[this.playlistpos] && 
	this.playlist[this.playlistpos].time<this.timecount) {
    this.playlistpos++;
  }
};


DIATONIC.play.Player.prototype.startNote = function (pitch, loudness, abcelem) {
  this.timecount+=this.silencelength;
  this.silencelength = 0;
  if (this.first) {
    //nothing special if first?
  }
  this.updatePos();
  var self=this;
  this.playlist.splice(this.playlistpos,0, {   
    time:this.timecount,
	funct:function() {
        MIDI.noteOn(/*channel*/0, pitch, loudness, /*delay*/0);
//	self.playNote(pitch);
	self.notifySelect(abcelem);
      }
    });
};

DIATONIC.play.Player.prototype.endNote = function (pitch, length) {
  this.timecount+=length;
  this.updatePos();
  this.playlist.splice(this.playlistpos, 0, {   
    time:this.timecount,
	funct:	function() {
        MIDI.noteOff(/*channel*/0, pitch, 0);
	//self.stopNote(pitch);
      }
    });
};

DIATONIC.play.Player.prototype.addRest = function (length) {
  this.silencelength += length;
};


DIATONIC.play.Player.prototype.startTrack = function () {
  this.silencelength = 0;
  this.trackcount++;
  this.timecount=0;
  this.playlistpos=0;
  this.first=true;
  if (this.instrument) {
    this.setInstrument(this.instrument);
  }
	if (this.channel) {
	  this.setChannel(this.channel);
	}
};

DIATONIC.play.Player.prototype.endTrack = function () {
  // need to do anything?
};


DIATONIC.play.Player.prototype.setInstrument = function (number) {
  this.instrument=number;
  this.midiapi.setInstrument(number);
  //TODO push this into the playlist?
};

DIATONIC.play.Player.prototype.setChannel = function (number) {
  this.channel=number;
  this.midiapi.setChannel(number);
};

DIATONIC.play.Player.prototype.writeABCLine = function() {
  this.staffcount = this.getLine().staffs.length;
  this.voicecount = this.getStaff().voices.length;
  this.setKeySignature(this.getStaff().key);
  this.writeABCVoiceLine();
};

DIATONIC.play.Player.prototype.writeABCVoiceLine = function () {
  this.pos=0;
  while (this.pos<this.getVoice().length) {
    this.writeABCElement(this.getElem());
    if (this.next) {
      this.goToMark(this.next);
      this.next = null;
      if (!this.getLine().staffs) return;
    } else {
      this.pos++;
    }
  }
};

DIATONIC.play.Player.prototype.writeABCElement = function(elem) {
  var foo;
  switch (elem.el_type) {
  case "note":
    this.writeNote(elem);
    break;
  case "key":
    this.setKeySignature(elem);
    break;
  case "bar":
    this.handleBar(elem);
	  break;
  case "meter":
  case "clef":
    break;
  default:
    
  }
  
};


DIATONIC.play.Player.prototype.writeNote = function(elem) {

  if (elem.startTriplet) {
	  if (elem.startTriplet === 2)
		  this.multiplier = 3/2;
	  else
	    this.multiplier=(elem.startTriplet-1)/elem.startTriplet;
  }

  var mididuration = elem.duration*this.baseduration*this.multiplier;
  if (elem.pitches) {
    var midipitches = [];
    for (var i=0; i<elem.pitches.length; i++) {
      var note = elem.pitches[i];
      var pitch= note.pitch;
      if (note.accidental) {
	switch(note.accidental) { // change that pitch (not other octaves) for the rest of the bar
	case "sharp": 
	  this.baraccidentals[pitch]=1; break;
	case "flat": 
	  this.baraccidentals[pitch]=-1; break;
	case "natural":
	  this.baraccidentals[pitch]=0; break;
		case "dblsharp":
			this.baraccidentals[pitch]=2; break;
		case "dblflat":
			this.baraccidentals[pitch]=-2; break;
	}
      }
      
      midipitches[i] = 60 + 12*this.extractOctave(pitch)+this.scale[this.extractNote(pitch)];
      
      if (this.baraccidentals[pitch]!==undefined) {
	midipitches[i] += this.baraccidentals[pitch];
      } else { // use normal accidentals
	midipitches[i] += this.accidentals[this.extractNote(pitch)];
      }
    midipitches[i] += this.transpose;	// PER
      
      this.startNote(midipitches[i], 127, elem);

      if (note.startTie) {
	this.tieduration=mididuration;
      } 
    }

    for (i=0; i<elem.pitches.length; i++) {
      var note = elem.pitches[i];
      var pitch= note.pitch+this.transpose;	// PER
      if (note.startTie) continue; // don't terminate it
      if (note.endTie) {
	this.endNote(midipitches[i],mididuration+this.tieduration);
      } else {
	this.endNote(midipitches[i],mididuration);
      }
      mididuration = 0; // put these to zero as we've moved forward in the midi
      this.tieduration=0;
    }
  } else if (elem.rest && elem.rest.type !== 'spacer') {
    this.addRest(mididuration);
  }

  if (elem.endTriplet) {
    this.multiplier=1;
  }

};

DIATONIC.play.Player.prototype.handleBar = function (elem) {
  this.baraccidentals = [];
  
  
  var repeat = (elem.type==="bar_right_repeat" || elem.type==="bar_dbl_repeat");
  var skip = (elem.startEnding)?true:false;
  var setvisited = (repeat || skip);
  var setrestart = (elem.type==="bar_left_repeat" || elem.type==="bar_dbl_repeat" || elem.type==="bar_thick_thin" || elem.type==="bar_thin_thick" || elem.type==="bar_thin_thin" || elem.type==="bar_right_repeat");

  var next = null;

  if (this.isVisited()) {
    next = this.getJumpMark();
  } else {

    if (skip || repeat) {
      if (this.visited[this.lastmark] === true) {
	this.setJumpMark(this.getMark());
      }  
    }

    if (setvisited) {
      this.markVisited();
    }

    if (repeat) {
      next = this.restart;
      this.setJumpMark(this.getMark());
    }
  }

  if (setrestart) {
    this.restart = this.getMark();
  }

  if (next && this.getMarkString(next)!==this.getMarkString()) {
    this.next = next;
  }

};

DIATONIC.play.Player.prototype.setKeySignature = function(elem) {
  this.accidentals = [0,0,0,0,0,0,0];
  if (this.abctune.formatting.bagpipes) {
    elem.accidentals=[{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
  }
  if (!elem.accidentals) return;
	window.ABCJS.parse.each(elem.accidentals, function(acc) {
		var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ?0 : -1;

		var lowercase = acc.note.toLowerCase();
		var note = this.extractNote(lowercase.charCodeAt(0)-'c'.charCodeAt(0));
		this.accidentals[note]+=d;
	  }, this);

};

DIATONIC.play.Player.prototype.extractNote = function(pitch) {
  pitch = pitch%7;
  if (pitch<0) pitch+=7;
  return pitch;
};

DIATONIC.play.Player.prototype.extractOctave = function(pitch) {
  return Math.floor(pitch/7);
};



DIATONIC.play.Player.prototype.playAcorde = function(noteList, channel) {

    if (this.map.gaita.sounding)
        return;

    var delay = this.map.gIntervalo / 1000;
    var velocity = 127; // how hard the note hits
    var nota;

    // play the note
    this.map.gaita.sounding = true;
    MIDI.setVolume(channel, 127);

    var len = noteList[1].length;
    for (i = 0; i < len; i++) {
        if (noteList[0] === DIATONIC.close) {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose.value;
        } else {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen.value;
        }
        nota += this.map.gCurrentToneOffset;

        MIDI.noteOn(channel, nota, velocity, (i - 0) * delay);
        MIDI.noteOff(channel, nota, (i - 0 + 1) * delay);
        MIDI.noteOn(channel, nota + 12, velocity, (i - 0) * delay);
        MIDI.noteOff(channel, nota + 12, (i - 0 + 1) * delay);
        
        MIDI.noteOn(channel, nota, velocity, (len + 1) * delay);
        MIDI.noteOff(channel, nota, (len + 3) * delay);
        MIDI.noteOn(channel, nota + 12, velocity, (len + 1) * delay);
        MIDI.noteOff(channel, nota + 12, (len + 3) * delay);
    }
    var that = this;
    setTimeout(function(){that.stopPlaying();}, (len + 3) * delay * 1000);
};


DIATONIC.play.Player.prototype.playSound = function( noteList, channel ) {

  var delay = this.map.gIntervalo/1000; 
  var velocity = 127; // how hard the note hits
  var nota;
  var offset = this.map.gCurrentOffset;

  MIDI.setVolume(channel, 127);

  for (i=0; i < noteList[1].length; i++) {
    if (noteList[0] === DIATONIC.close) {
      nota   = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose;
    } else {
      nota   = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen;
    }
    if( nota.isChord ) {
      generateAndPlayChord(nota, channel);
    } else {
      MIDI.noteOn(channel, nota.value + offset, velocity, 0);	    	
      MIDI.noteOff(channel, nota.value + offset, delay);
      MIDI.noteOn(channel, nota.value + offset +12, velocity, 0);	    	
      MIDI.noteOff(channel, nota.value + offset +12, delay);
    }
  }
};

DIATONIC.play.Player.prototype.generateAndPlayChord = function( chord, channel ) {
  /* 
     formação de acordes:
        acorde maior   0, 4, 7
        acorde menor   0, 3, 7
        acorde setima  0, 4, 7, 10
        acorde menor setima   0, 3, 7, 10
  */

  var delay = this.map.gIntervalo/1000; 
  var velocity = 127; // how hard the note hits
  var nota;
  var offset = this.map.gCurrentOffset;


  MIDI.setVolume(channel, 127);
  MIDI.noteOn(channel, nota.value + offset, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset, delay);
  MIDI.noteOn(channel, nota.value + offset+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset+12, delay);

  var d = chord.isMenor ? 3 : 4;
 
  MIDI.noteOn(channel, nota.value + offset+d, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset+d, delay);
  MIDI.noteOn(channel, nota.value + offset+d+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset+d+12, delay);

  MIDI.noteOn(channel, nota.value + offset+7, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset+7, delay);
  MIDI.noteOn(channel, nota.value + offset+7+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + offset+7+12, delay);

  if( chord.isSetima ) {
      MIDI.noteOn(0, nota.value + offset+10, velocity, 0);	    	
      MIDI.noteOff(0, nota.value + offset+10, delay);
      MIDI.noteOn(0, nota.value + offset+10+12, velocity, 0);	    	
      MIDI.noteOff(0, nota.value + offset+10+12, delay);
  }

};

DIATONIC.play.Player.prototype.playEscala = function(nEscala, intervalo, ascendente, loop ) {

  stopPlaying();

  gIntervalo = intervalo;
  nNotaInicial = 0;
  incremento = 1;
  notaFinal =  this.map.gaita.gaitas[this.map.gaita.selected][c_escalas][nEscala][c_notas].length;

  if( ! ascendente ) {
    nNotaInicial = notaFinal-1;
    incremento = -1;
    notaFinal = -1 ;
  } ;

  setNotes(nEscala, nNotaInicial);

  (function doPlay(nNota) {
    gTimeout=setTimeout(function() {
      if (nNota !== notaFinal ) {
        setNotes(nEscala, nNota);
        nNota+=incremento; 
        doPlay(nNota);
      } else {
        if( loop ) {
          doPlay(nNotaInicial);
        } else { 
          clearKeyboard();
        }
      }
    }, gIntervalo);
  })(nNotaInicial+incremento);

};

