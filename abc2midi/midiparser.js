/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.midi) 
    window.DIATONIC.midi = {baseduration: 1920 }; // nice and divisible, equals 1 whole note
//
// Porque preciso conhecer o mapa?
//   - Por que durante a execução, vai afetar elementos de tela:
//       vai destacar as notas que estão impressas na pauta
//       vai destacar os botões do acordion caso haja uma tablatura.

DIATONIC.midi.Parse = function( map, options ) {
    this.map = map;
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    this.reset( options );
};

DIATONIC.midi.Parse.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.next = null;
    this.timecount = 0;
    this.trackcount = 0;
    this.multiplier = 1;
    this.qpm = options.qpm || 180;
    this.transpose = options.transpose || 0;	// PER
    
    this.visited = {};
    this.startTieElem= {};
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    
    this.lastTabElem = [];
    this.baraccidentals = [];
    //this.currBarNumber = 0;
        
    this.midiTune = { 
        tempo: 60
       ,notes : [] // each note contains a {time:t,funct:f} pair
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

DIATONIC.midi.Parse.prototype.parseTabSong = function(tune, printer) {
    var bpm = 108.0;
    var duration = 0.25;
    
    this.reset();
    
    if (printer) {
        this.setPrinter(printer);
    }    
    
    this.abctune = tune;

    if (tune.metaText.tempo) {
        bpm = tune.metaText.tempo.bpm || bpm;
        duration = tune.metaText.tempo.duration[0] || duration;
    }

    this.qpm = bpm * duration * 16; 
    this.setTempo(this.qpm);

    this.staffcount = 1; // we'll know the actual number once we enter the code
    for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
        this.voicecount = 1;
        for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
            this.setChannel(this.staff);
            this.startTrack();
            this.restart = {line: 0, staff: this.staff, voice: this.voice, pos: 0};
            this.next = null;
            for (this.line = 0; this.line < this.abctune.lines.length; this.line++) {
              if(this.abctune.lines[this.line].staffs){
                this.writeABCLine();
              }
            }
            this.endTrack();
        }
    }
    // varre a lista de notas procurando a primeira ocorrencia de cada compasso.
    for(var i = 0; i < this.midiTune.notes.length; i++ ) {
      if( this.midiTune.notes[i].barNumber && this.midiTune.measures[this.midiTune.notes[i].barNumber] === undefined ) {
         if(this.midiTune.notes[i].barNumber === 20 ) {
             var n = this.playlistpos;
         }
         this.midiTune.measures[this.midiTune.notes[i].barNumber] =  i;
      }   
    }
//    if(this.staff === 0 && abcelem.barNumber && this.currBarNumber !== abcelem.barNumber) {
//      if( this.midiTune.measures[abcelem.barNumber] === undefined ) {
//         if(abcelem.barNumber === 11 ) {
//             var n = this.playlistpos;
//         }
//         this.midiTune.measures[abcelem.barNumber] =  this.playlistpos;
//      }   
//      this.currBarNumber = abcelem.barNumber;
//    }
    
    

    return this.midiTune;
};

DIATONIC.midi.Parse.prototype.writeABCLine = function() {
    this.staffcount = this.getLine().staffs.length;
    this.voicecount = this.getStaff().voices.length;
    this.setKeySignature(this.getStaff().key);
    this.writeABCVoiceLine();
};

DIATONIC.midi.Parse.prototype.writeABCVoiceLine = function() {
    this.pos = 0;
    while (this.pos < this.getVoice().length) {
        this.writeABCElement(this.getElem());
        if (this.next) {
            this.goToMark(this.next);
            this.next = null;
        } else {
            this.pos++;
        }
    }
};

DIATONIC.midi.Parse.prototype.writeABCElement = function(elem) {
    switch (elem.el_type) {
        case "note":
            if (this.getStaff().clef.type !== "accordionTab") {
              this.writeNote(elem);
            } else {
              this.selectButtons(elem);
            }
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

DIATONIC.midi.Parse.prototype.writeNote = function(elem) {

    if (elem.startTriplet) {
        if (elem.startTriplet === 2)
            this.multiplier = 3 / 2;
        else
            this.multiplier = (elem.startTriplet - 1) / elem.startTriplet;
    }

    var mididuration = elem.duration * DIATONIC.midi.baseduration * this.multiplier;

    this.timecount += this.silencelength;
    this.silencelength = 0;
    
    if (elem.pitches) {
        var midipitch;
        for (var i = 0; i < elem.pitches.length; i++) {
            var note = elem.pitches[i];
            var pitch = note.pitch;
            if (note.accidental) {
              // change that pitch (not other octaves) for the rest of the bar
              this.baraccidentals[pitch] = this.getAccOffset(note.accidental);
            }

            midipitch = 60 + 12 * this.extractOctave(pitch) + this.scale[this.extractNote(pitch)];

            if (this.baraccidentals[pitch] !== undefined) {
                midipitch += this.baraccidentals[pitch];
            } else { // use normal accidentals
                midipitch += this.accidentals[this.extractNote(pitch)];
            }
            midipitch += this.transpose;	// PER
            

            if (note.startTie) {
                this.startNote(midipitch, 256, elem, this.timecount);
                this.startTieElem[midipitch] = elem;
            } else if (note.endTie) {
                this.selectNote(elem, this.timecount);
                this.unSelectNote(elem, this.timecount + mididuration);
                this.endTies( midipitch, mididuration );
            } else {
                this.startNote(midipitch, 256, elem, this.timecount);
                this.endNote(midipitch, elem, this.timecount + mididuration);
            } 
        }
        this.timecount += mididuration;
        
    } else if (elem.rest && elem.rest.type !== 'spacer') {
        this.silencelength += mididuration;
        this.selectNote(elem, this.timecount);
        this.unSelectNote(elem, this.timecount + mididuration);
    }

    if (elem.endTriplet) {
        this.multiplier = 1;
    }

};

DIATONIC.midi.Parse.prototype.endTies = function(midipitch, mididuration ) {
    var dur = mididuration || 0;
    if( midipitch ) {
       this.unSelectNote(this.startTieElem[midipitch], this.timecount + dur);
       this.endNote(midipitch, this.startTieElem[midipitch], this.timecount + dur );
       delete this.startTieElem[midipitch];
    } else {
        for (var index in this.startTieElem) {
            var elem = this.startTieElem[index];
            this.unSelectNote( elem, this.timecount);
            this.endNote(index, elem, this.timecount);
        }
        this.startTieElem = {};
    }
};

DIATONIC.midi.Parse.prototype.handleBar = function(elem) {
    this.baraccidentals = [];

    var repeat = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var skip = (elem.startEnding) ? true : false;
    var setvisited = (repeat || skip);
    var setrestart = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat" || 
                      elem.type === "bar_thick_thin" || elem.type === "bar_thin_thick" || 
                      elem.type === "bar_thin_thin" || elem.type === "bar_right_repeat");

    var next = null;

    if (this.isVisited()) {
        next = this.getJumpMark();
    } else {

        if (skip || repeat) {
            if (this.visited[this.lastmark] === true) {
                this.endTies();
                this.setJumpMark(this.getMark());
            }
        }

        if (setvisited) {
            this.markVisited();
        }

        if (repeat) {
            next = this.restart;
            this.endTies();
            this.setJumpMark(this.getMark());
        }
    }

    if (setrestart) {
        this.restart = this.getMark();
    }

    if (next && this.getMarkString(next) !== this.getMarkString()) {
        this.next = next;
    }

};

DIATONIC.midi.Parse.prototype.getMark = function() {
    return {line: this.line, staff: this.staff,
        voice: this.voice, pos: this.pos};
};

DIATONIC.midi.Parse.prototype.getMarkString = function(mark) {
    mark = mark || this;
    return "line" + mark.line + "staff" + mark.staff +
           "voice" + mark.voice + "pos" + mark.pos;
};

DIATONIC.midi.Parse.prototype.goToMark = function(mark) {
    this.line = mark.line;
    this.staff = mark.staff;
    this.voice = mark.voice;
    this.pos = mark.pos;
};

DIATONIC.midi.Parse.prototype.markVisited = function() {
    this.lastmark = this.getMarkString();
    this.visited[this.lastmark] = true;
};

DIATONIC.midi.Parse.prototype.isVisited = function() {
    if (this.visited[this.getMarkString()])
        return true;
    return false;
};

DIATONIC.midi.Parse.prototype.setJumpMark = function(mark) {
    this.visited[this.lastmark] = mark;
};

DIATONIC.midi.Parse.prototype.getJumpMark = function() {
    return this.visited[this.getMarkString()];
};

DIATONIC.midi.Parse.prototype.hasTablature = function() {
    return this.abctune.hasTablature;
};

DIATONIC.midi.Parse.prototype.getLine = function() {
    return this.abctune.lines[this.line];
};

DIATONIC.midi.Parse.prototype.getStaff = function() {
    return this.getLine().staffs[this.staff];
};

DIATONIC.midi.Parse.prototype.getVoice = function() {
    return this.getStaff().voices[this.voice];
};

DIATONIC.midi.Parse.prototype.getElem = function() {
    return this.getVoice()[this.pos];
};

DIATONIC.midi.Parse.prototype.setTempo = function(qpm) {
    this.midiTune.tempo = qpm;
};

DIATONIC.midi.Parse.prototype.setPrinter = function(pt) {
    this.midiTune.printer = pt;
};

DIATONIC.midi.Parse.prototype.startTrack = function() {
    this.trackcount++;
    this.timecount = 0;
    this.playlistpos = 0;
    this.silencelength = 0;
};

DIATONIC.midi.Parse.prototype.endTrack = function() {
    // need to do anything?
};

DIATONIC.midi.Parse.prototype.syncPlayList = function(time) {
    while (this.midiTune.notes[this.playlistpos] &&
            this.midiTune.notes[this.playlistpos].time <= time) {
        this.playlistpos++;
    }
};

DIATONIC.midi.Parse.prototype.setChannel = function(number) {
    this.channel = number;
};

DIATONIC.midi.Parse.prototype.startNote = function(pitch, loudness, abcelem, startTime) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = self.channel;
    var printer = self.midiTune.printer;
    var b;
    if(this.staff === 0 && abcelem.barNumber ) {
        b = abcelem.barNumber;
    }
    
    this.midiTune.notes.splice(this.playlistpos, 0, {
         time: startTime
        ,barNumber : b
        ,funct: function() {
            MIDI.noteOn(channel, pitch, loudness, 0);
            self.notifySelect(abcelem, channel, printer);
        }
    });
};

DIATONIC.midi.Parse.prototype.endNote = function(pitch, abcelem, endTime) {
    this.syncPlayList(endTime-1);
    var channel = this.channel;
    var self = this;
    this.midiTune.notes.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            MIDI.noteOff(channel, pitch, 0);
            self.notifyUnSelect(abcelem);
        }
    });
};

DIATONIC.midi.Parse.prototype.getAccOffset = function(txtAcc) {
// a partir do nome do acidente, retorna o offset no modelo cromatico
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

DIATONIC.midi.Parse.prototype.setKeySignature = function(elem) {
    this.accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (this.abctune.formatting.bagpipes) {
        elem.accidentals = [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
    }
    if (!elem.accidentals)  return;
    
    window.ABCJS.parse.each(elem.accidentals, function(acc) {
        var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ? 0 : -1;
        var lowercase = acc.note.toLowerCase();
        var note = this.extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
        this.accidentals[note] += d;
    }, this);

};

DIATONIC.midi.Parse.prototype.extractNote = function(pitch) {
    pitch = pitch % 7;
    if (pitch < 0)
        pitch += 7;
    return pitch;
};

DIATONIC.midi.Parse.prototype.extractOctave = function(pitch) {
    return Math.floor(pitch / 7);
};

DIATONIC.midi.Parse.prototype.setScrolling = function(y, channel) {
    if( !this.map.tuneContainerDiv || channel > 0 ) return;
    if( Math.abs(y - this.map.ypos) > 200 ) {
        this.map.ypos = y;
        this.map.tuneContainerDiv.scrollTop = this.map.ypos - 60;    
    }
};

DIATONIC.midi.Parse.prototype.notifyUnSelect = function(abcelem) {
    abcelem.abselem.unhighlight();
};

DIATONIC.midi.Parse.prototype.notifySelect = function(abcelem,channel, printer) {
    this.setScrolling(abcelem.abselem.y,channel);
    printer.notifySelect(abcelem.abselem);
};

DIATONIC.midi.Parse.prototype.selectNote = function(abcelem, startTime) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = self.channel;
    var printer = self.midiTune.printer;
    var b;
    if(this.staff === 0 && abcelem.barNumber ) {
        b = abcelem.barNumber;
    }
    
    this.midiTune.notes.splice(this.playlistpos, 0, {
        time: startTime
       ,barNumber : b
       ,funct: function() {
            self.notifySelect(abcelem, channel, printer);
       }
    });
};
DIATONIC.midi.Parse.prototype.unSelectNote = function(abcelem, endTime) {
    this.syncPlayList(endTime-1);
    var self = this;
    //var channel = this.channel;
    this.midiTune.notes.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            self.notifyUnSelect(abcelem);
        }
    });
};


DIATONIC.midi.Parse.prototype.selectButton = function( abcelem, dir, button, startTime ) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = self.channel;
    var printer = self.midiTune.printer;
    this.midiTune.notes.splice(this.playlistpos, 0, {
        time: startTime,
        funct: function() {
            self.notifySelectButton(dir, button);
            self.notifySelect(abcelem, channel,  printer);
        }
    });
};
 
DIATONIC.midi.Parse.prototype.unSelectButton = function( abcelem, button, endTime ) {
    this.syncPlayList(endTime-1);
    var self = this;
    var channel = this.channel;
    this.midiTune.notes.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            self.notifyUnSelectButton(button);
            self.notifyUnSelect(abcelem, channel);
        }
    });
 };

DIATONIC.midi.Parse.prototype.notifyUnSelectButton = function(button) {
    if (button === null) return;
    button.clear();
};

DIATONIC.midi.Parse.prototype.notifySelectButton = function(dir, button) {
  if(button === null) return;
  if(dir === DIATONIC.open)
    button.setOpen() ;
  else
    button.setClose();
};

DIATONIC.midi.Parse.prototype.getBassButton = function( dir, b ) {
    if(b === '--->') return null;
    var kb = this.map.gaita.keyboard;
    var nota = this.map.gaita.parseNote(b, true );
    for( var j = kb.length; j > kb.length - 2; j-- ) {
      for( var i = 0; i < kb[j-1].length; i++ ) {
          var tecla = kb[j-1][i];
          if(dir === DIATONIC.open) {
            if(tecla.notaOpen.key === nota.key ) return tecla.btn;
          } else {  
            if(tecla.notaClose.key === nota.key ) return tecla.btn;
          }
      }   
    }
    return null;
};

DIATONIC.midi.Parse.prototype.getButton = function( b ) {
    if(b === 'x') return null;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(this.map.gaita.keyboard[row][button]) 
        return this.map.gaita.keyboard[row][button].btn;
    return null;
};

DIATONIC.midi.Parse.prototype.selectButtons = function(elem) {
    var mididuration = elem.duration * DIATONIC.midi.baseduration * this.multiplier;
    if (elem.pitches) {
        
        var dir = elem.bellows === "+" ? DIATONIC.close : DIATONIC.open;
        var button;
        for (var i = 0; i < elem.pitches.length; i++) {

            if (elem.pitches[i].type === "rest")
                continue;
            if (elem.pitches[i].bass) {
                if (elem.inTieBass) {
                    button = this.lastTabElem[i];
                } else {
                    button = this.getBassButton(dir, elem.pitches[i].c);
                    this.lastTabElem[i] = button;
                }
            } else {
                if (elem.inTieTreb) {
                    button = this.lastTabElem[i];
                } else {
                    button = this.getButton(elem.pitches[i].c);
                    this.lastTabElem[i] = button;
                }
            }
            this.selectButton(elem, dir, button, this.timecount);
            this.unSelectButton(elem, button, this.timecount + mididuration);

        }
    }
    this.timecount += mididuration;
};
