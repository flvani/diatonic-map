/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - tratar notas longas
 *   - tratar endings sem marca de final ??
 *   - tratar endings em compassos com repeat bar
 *   - implementar: segno, coda, capo e fine
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.midi) 
    window.DIATONIC.midi = {baseduration: 1920 }; // nice and divisible, equals 1 whole note

DIATONIC.midi.Parse = function( gaita ) {
    this.gaita = gaita;
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    this.reset();
};

DIATONIC.midi.Parse.prototype.reset = function() {
    
    this.multiplier = 1;
    this.timecount = 0;
    this.repeating = false;
    this.next = null;
    this.visited = {};
    this.lastMark = {};       
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    
    this.startTieElem = {};
    this.lastTabElem = [];
    this.baraccidentals = [];
    this.channel = -1;
    this.parsedElements = [];
    
    this.midiTune = { 
        tempo: 640
       ,printer: null
       ,playlist: [] // nova strutura, usando 2 elementos de array por intervalo de tempo (um para ends e outro para starts) 
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

DIATONIC.midi.Parse.prototype.parse = function(tune, printer) {
    
    var self = this;
    var currBar = 0;
    
    this.reset();

    this.abctune = tune;
    
    if (printer) {
        this.midiTune.printer = printer;
    }

    if (tune.metaText.tempo) {
        var bpm = tune.metaText.tempo.bpm || 160;
        var duration = tune.metaText.tempo.duration[0] || 0.25;
        this.midiTune.tempo = bpm * duration * 16;
    }

    //faz o parse dos elementos abcx 
    this.staffcount = 1; 
    for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
        this.voicecount = 1;
        for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
            this.startTrack();
            for (this.line = 0; this.line < this.abctune.lines.length; this.line++) {
                this.writeABCLine();
            }
            this.endTrack();
        }
    }
    
    //cria a playlist a partir dos elementos analisados  
    this.parsedElements.forEach( function( item, time ) {
        
        if( item[0].pitches.length + item[0].abcelems.length + item[0].buttons.length > 0 ) {
            self.midiTune.playlist.push( {item: item[0], time: time, start: false } );
        }
        
        if( item[1].pitches.length + item[1].abcelems.length + item[1].buttons.length > 0 ) {
            if( item[1].barNumber && item[1].barNumber > currBar ) {
                currBar = item[1].barNumber;
                delete item[1].barNumber;
                self.midiTune.measures[currBar] = self.midiTune.playlist.length;
                self.midiTune.playlist.push( {item: item[1], time: time, barNumber: currBar, start: true } );
            } else {
                delete item[1].barNumber;
                self.midiTune.playlist.push( {item: item[1], time: time, start: true } );
            }
        }
    });
    
    return this.midiTune;
};

DIATONIC.midi.Parse.prototype.writeABCLine = function() {
    
    if ( this.abctune.lines[this.line].staffs ) {
        this.staffcount = this.getLine().staffs.length;
        this.voicecount = this.getStaff().voices.length;
        this.setKeySignature(this.getStaff().key);
        this.writeABCVoiceLine();
    }    
};

DIATONIC.midi.Parse.prototype.writeABCVoiceLine = function() {
    this.pos = 0;
    this.next = null;
    while (this.pos < this.getVoice().length) {
        this.writeABCElement(this.getElem());
        if (this.next) {
            this.line = this.next.line;
            this.staff = this.next.staff;
            this.voice = this.next.voice;
            this.pos = this.next.pos;
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
        this.multiplier = (elem.startTriplet === 2) ? 3 / 2 : (elem.startTriplet - 1) / elem.startTriplet;
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
            
            if (note.startTie || note.startSlur/* || elem.startSlur*/) {
                this.startNote(elem, this.timecount, midipitch );
                this.startTieElem[midipitch] = elem;
            } else if (note.endTie || note.endSlur/* || elem.endSlur */) {
                this.endTies( midipitch, mididuration, elem, note.endSlur );
            } else {
                if( this.startTieElem[midipitch] ) {
                  this.startNote( elem, this.timecount);
                  this.endNote( elem, this.timecount + mididuration);
                } else {
                  this.startNote(elem, this.timecount, midipitch );
                  this.endNote(elem, this.timecount + mididuration, midipitch );
                }
            } 
        }
        this.timecount += mididuration;
        
    } else if (elem.rest && elem.rest.type !== 'spacer') {
        this.silencelength += mididuration;
        this.startNote(elem, this.timecount);
        this.endNote(elem, this.timecount + mididuration);
    }

    if (elem.endTriplet) {
        this.multiplier = 1;
    }
};

DIATONIC.midi.Parse.prototype.selectButtons = function(elem) {
    var mididuration = elem.duration * DIATONIC.midi.baseduration;
    if (elem.pitches) {
        
        var button;
        var bassCounter = 0; // gato para resolver o problema de agora ter um ou dois botões de baixos
        for (var i = 0; i < elem.pitches.length; i++) {
            
            if (elem.pitches[i].bass ) 
                bassCounter++;
            
            if (elem.pitches[i].type === "rest") 
                continue;
            
            if (elem.pitches[i].bass) {
                if (elem.pitches[i].c === '-->') {
                    button = this.lastTabElem[i];
                } else {
                    button = this.getBassButton(elem.bellows, elem.pitches[i].c);
                    this.lastTabElem[i] = button;
                }
            } else {
                if ( elem.pitches[i].c === '-->') {
                    button = this.lastTabElem[10+i-bassCounter];
                } else {
                    button = this.getButton(elem.pitches[i].c);
                    this.lastTabElem[10+i-bassCounter] = button;
                }
            }
            this.startButton(elem, button, this.timecount);
            this.endButton(elem, button, this.timecount + mididuration);

        }
    }
    this.timecount += mididuration;
};

DIATONIC.midi.Parse.prototype.endTies = function(midipitch, mididuration, endElem, slur) {
    var startElem = this.startTieElem[midipitch];
    if (startElem) {
        this.endNote(startElem, this.timecount + mididuration, midipitch );
        this.startNote(endElem, this.timecount);
        this.endNote(endElem, this.timecount + mididuration);
        delete this.startTieElem[midipitch];
    } else {
        console.log( 'Ligaduras de expressão não implementadas!');
        this.clearTies();
        this.startNote(endElem, this.timecount, midipitch );
        this.endNote(endElem, this.timecount + mididuration, midipitch );
    }
 };
 
DIATONIC.midi.Parse.prototype.clearTies = function() {
    for (var index in this.startTieElem) {
        var startElem = this.startTieElem[index];
        this.endNote(startElem, this.timecount, index );
    }
    this.startTieElem = {};
};

DIATONIC.midi.Parse.prototype.handleBar = function(elem) {
    this.baraccidentals = [];

    var skip       = (elem.startEnding) ? true : false;
    var repeat     = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var setrestart = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat" || 
                      elem.type === "bar_thick_thin" || elem.type === "bar_thin_thick" || 
                      elem.type === "bar_thin_thin" || elem.type === "bar_right_repeat");

    if ( this.isVisited() ) {
        if( ! this.repeating && this.getMarkString(this.lastMark) !== this.getMarkString() )
            this.next = this.lastMark;
    } else {
        if( this.repeating ) {
            this.repeating = false;
        } else {
            if( repeat || skip ) {
                this.setVisited();
            }
            if ( repeat ) {
                this.repeating = true;
                this.next = this.restart;
                this.lastMark = this.getMark();
                this.clearTies();
            }
            if ( setrestart ) {
                this.restart = this.getMark();
            }
        }
    }
};

DIATONIC.midi.Parse.prototype.setVisited = function() {
    this.visited[this.getMarkString()] = true;
};

DIATONIC.midi.Parse.prototype.isVisited = function() {
    return  this.visited[this.getMarkString()];
};

DIATONIC.midi.Parse.prototype.initParsedElements = function(time) {
    if( ! this.parsedElements[time] ) {
        this.parsedElements[time] = [{pitches:[], abcelems:[], buttons:[]},{pitches:[], abcelems:[], buttons:[], barNumber: null}];
    }
};

DIATONIC.midi.Parse.prototype.startNote = function(abcelem, startTime, pitch ) {
    this.initParsedElements(startTime);
    
    this.parsedElements[startTime][1].abcelems.push({abcelem:abcelem,channel:this.channel});

    if( ! isNaN( pitch ) )
        this.parsedElements[startTime][1].pitches.push({pitch:pitch,channel:this.channel});
    
    if(this.staff === 0 && this.voice === 0 && abcelem.barNumber ) 
        this.parsedElements[startTime][1].barNumber = this.parsedElements[startTime][1].barNumber || abcelem.barNumber;
};

DIATONIC.midi.Parse.prototype.endNote = function(abcelem, endTime, pitch ) {
    this.initParsedElements(endTime);
    this.parsedElements[endTime][0].abcelems.push({abcelem:abcelem});
    if( ! isNaN( pitch ) )
        this.parsedElements[endTime][0].pitches.push({pitch:pitch,channel:this.channel});
};

DIATONIC.midi.Parse.prototype.startButton = function( abcelem, button, startTime ) {
    this.initParsedElements(startTime);
    this.parsedElements[startTime][1].abcelems.push({abcelem:abcelem,channel:this.channel});
    this.parsedElements[startTime][1].buttons.push({button:button,abcelem:abcelem});
};
 
DIATONIC.midi.Parse.prototype.endButton = function( abcelem, button, endTime ) {
    this.initParsedElements(endTime);
    this.parsedElements[endTime][0].abcelems.push({abcelem:abcelem});
    this.parsedElements[endTime][0].buttons.push({button:button});
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

DIATONIC.midi.Parse.prototype.startTrack = function() {
    this.channel ++;
    this.timecount = 0;
    this.playlistpos = 0;
    this.silencelength = 0;
};

DIATONIC.midi.Parse.prototype.endTrack = function() {
    // need to do anything?
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
    
    window.ABCXJS.parse.each(elem.accidentals, function(acc) {
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

DIATONIC.midi.Parse.prototype.getBassButton = function( bellows, b ) {
    if(b === '-->') return null;
    var kb = this.gaita.keyboard;
    var nota = this.gaita.parseNote(b, true );
    for( var j = kb.length; j > kb.length - 2; j-- ) {
      for( var i = 0; i < kb[j-1].length; i++ ) {
          var tecla = kb[j-1][i];
          if(bellows === '+') {
            if(tecla.notaClose.key === nota.key ) return tecla.btn;
          } else {  
            if(tecla.notaOpen.key === nota.key ) return tecla.btn;
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
    if(this.gaita.keyboard[row][button]) 
        return this.gaita.keyboard[row][button].btn;
    return null;
};
