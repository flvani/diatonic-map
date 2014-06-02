/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.play)
    window.DIATONIC.play = {};

DIATONIC.play.Player = function(map, container, options ) {

    this.map = map;
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    this.reset( options );
    this.tuneContainer = document.getElementById(container);

};

DIATONIC.play.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.startTieElem = [];
    this.lastTabElem = [];
    this.trackcount = 0;
    this.timecount = 0;
    this.tempo = 60;
    this.i = 0;
    this.currenttime = 0;
    this.ypos = 0;
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    this.visited = {};
    this.multiplier = 1;
    this.listeners = [];
    this.next = null;
    this.qpm = options.qpm || 180;
    this.transpose = options.transpose || 0;	// PER
    this.sounding = false; // usado apenas pelo antigo metodo de tocar acordes
    
    this.baseduration = 1920; // nice and divisible, equals 1 whole note
    this.ticksperinterval = this.baseduration / 16; // 16th note - TODO: see the min in the piece
    this.playlist = []; // contains {time:t,funct:f} pairs
    this.baraccidentals = [];
    this.accordion = undefined;
    
};

DIATONIC.play.Player.prototype.startDebugPlay = function(control) {
    var i = 0, t = 0;
    while(i< this.playlist.length) {
        while(i < this.playlist.length && t >= this.playlist[i].time) {
            this.playlist[i].funct();
            i++;
        }
        t += this.ticksperinterval;
    }
};


DIATONIC.play.Player.prototype.parseTabSong = function(tune) {
    var bpm = 108.0;
    var duration = 0.25;
    
    this.reset( );
    this.accordion = this.map.gaita.getSelectedAccordion();

    this.abctune = tune;

    if (tune.metaText.tempo) {
        bpm = tune.metaText.tempo.bpm || bpm;
        duration = tune.metaText.tempo.duration[0] || duration;
    }

    this.qpm = bpm * duration * 16; // por que multiplicar por 16??? é fixo?
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
              this.writeABCLine();
            }
            this.endTrack();
        }
    }

    if (this.map.gaita.printer) {
        this.addListener(this.map.gaita.printer);
    }

    //this.startDebugPlay();
    return tune;
};

DIATONIC.play.Player.prototype.doPlay = function() {
    while (this.playlist[this.i] &&
           this.playlist[this.i].time < this.currenttime) {
        this.playlist[this.i].funct();
        this.i++;
    }
    if (this.playlist[this.i]) {
        this.currenttime += this.ticksperinterval;
    } else {
        this.stopPlay();
    }
};

DIATONIC.play.Player.prototype.startPlay = function(control) {
    this.ypos = this.tuneContainer.scrollTop + 70;
    this.map.gaita.clearKeyboard();

    this.playing = true;
    this.playLink = control;
    this.playLink.value = "Pause";
    
    var self = this;
    this.doPlay();
    this.playinterval = window.setInterval(function() {
        self.doPlay();
    }, (60000 / (this.tempo)));
};

DIATONIC.play.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currenttime = 0;
    this.pausePlay();
    this.playLink.value = "Play";
    this.clearSelection();
    this.map.gaita.clearKeyboard(true);
};

DIATONIC.play.Player.prototype.pausePlay = function() {
    MIDI.stopAllNotes();
    window.clearInterval(this.playinterval);
    this.playLink.value = "Play";
    this.playing = false;
    //this.clearSelection();
    //this.map.gaita.clearKeyboard(true);
};

DIATONIC.play.Player.prototype.addListener = function(listener) {
    this.listeners.push(listener);
};

DIATONIC.play.Player.prototype.clearSelection = function() {
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].clearSelection();
        //this.setScrolling(0);
    }
};

DIATONIC.play.Player.prototype.setScrolling = function(y, channel) {
    if( !this.tuneContainer || channel > 0 ) return;
    if( Math.abs(y - this.ypos) > 200 ) {
        this.ypos = y;
        this.tuneContainer.scrollTop = this.ypos - 70;    
    }
};

DIATONIC.play.Player.prototype.notifyUnSelect = function(abcelem) {
    abcelem.abselem.unhighlight();
};

DIATONIC.play.Player.prototype.notifySelect = function(abcelem,channel) {
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].notifySelect(abcelem.abselem);
        this.setScrolling(abcelem.abselem.y,channel);
    }
};
DIATONIC.play.Player.prototype.notifyClearNSelect = function(abcelem,channel) {
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i].notifyClearNSelect(abcelem.abselem);
        this.setScrolling(abcelem.abselem.y,channel);
    }
};

DIATONIC.play.Player.prototype.getMark = function() {
    return {line: this.line, staff: this.staff,
        voice: this.voice, pos: this.pos};
};

DIATONIC.play.Player.prototype.getMarkString = function(mark) {
    mark = mark || this;
    return "line" + mark.line + "staff" + mark.staff +
           "voice" + mark.voice + "pos" + mark.pos;
};

DIATONIC.play.Player.prototype.goToMark = function(mark) {
    this.line = mark.line;
    this.staff = mark.staff;
    this.voice = mark.voice;
    this.pos = mark.pos;
};

DIATONIC.play.Player.prototype.markVisited = function() {
    this.lastmark = this.getMarkString();
    this.visited[this.lastmark] = true;
};

DIATONIC.play.Player.prototype.isVisited = function() {
    if (this.visited[this.getMarkString()])
        return true;
    return false;
};

DIATONIC.play.Player.prototype.setJumpMark = function(mark) {
    this.visited[this.lastmark] = mark;
};

DIATONIC.play.Player.prototype.getJumpMark = function() {
    return this.visited[this.getMarkString()];
};

DIATONIC.play.Player.prototype.hasTablature = function() {
    return this.abctune.hasTablature;
};

DIATONIC.play.Player.prototype.getLine = function() {
    return this.abctune.lines[this.line];
};

DIATONIC.play.Player.prototype.getStaff = function() {
    return this.getLine().staffs[this.staff];
};

DIATONIC.play.Player.prototype.getVoice = function() {
    return this.getStaff().voices[this.voice];
};

DIATONIC.play.Player.prototype.getElem = function() {
    return this.getVoice()[this.pos];
};

DIATONIC.play.Player.prototype.setTempo = function(qpm) {
    this.tempo = qpm;
};

DIATONIC.play.Player.prototype.startTrack = function() {
    this.trackcount++;
    this.timecount = 0;
    this.playlistpos = 0;
    this.silencelength = 0;
};

DIATONIC.play.Player.prototype.endTrack = function() {
    // need to do anything?
};

DIATONIC.play.Player.prototype.syncPlayList = function(time) {
    while (this.playlist[this.playlistpos] &&
            this.playlist[this.playlistpos].time <= time) {
        this.playlistpos++;
    }
};

DIATONIC.play.Player.prototype.setInstrument = function(number) {
    this.instrument = number;
    this.midiapi.setInstrument(number);
    //TODO push this into the playlist?
};

DIATONIC.play.Player.prototype.setChannel = function(number) {
    this.channel = number;
};

DIATONIC.play.Player.prototype.startNote = function(pitch, loudness, abcelem, startTime) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = this.channel;
    this.playlist.splice(this.playlistpos, 0, {
        time: startTime,
        funct: function() {
            MIDI.noteOn(channel, pitch, loudness, 0);
            self.notifySelect(abcelem, channel);
        }
    });
};

DIATONIC.play.Player.prototype.selectNote = function(abcelem, startTime) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = this.channel;
    this.playlist.splice(this.playlistpos, 0, {
        time: startTime,
        funct: function() {
            self.notifySelect(abcelem, channel);
        }
    });
};
DIATONIC.play.Player.prototype.unSelectNote = function(abcelem, endTime) {
    this.syncPlayList(endTime-1);
    var self = this;
    //var channel = this.channel;
    this.playlist.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            self.notifyUnSelect(abcelem);
        }
    });
};


DIATONIC.play.Player.prototype.endNote = function(pitch, abcelem, endTime) {
    this.syncPlayList(endTime-1);
    var channel = this.channel;
    var self = this;
    this.playlist.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            MIDI.noteOff(channel, pitch, 0);
            self.notifyUnSelect(abcelem);
        }
    });
};

DIATONIC.play.Player.prototype.writeABCLine = function() {
    this.staffcount = this.getLine().staffs.length;
    this.voicecount = this.getStaff().voices.length;
    this.setKeySignature(this.getStaff().key);
    this.writeABCVoiceLine();
};

DIATONIC.play.Player.prototype.writeABCVoiceLine = function() {
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

DIATONIC.play.Player.prototype.writeABCElement = function(elem) {
    switch (elem.el_type) {
        case "note":
            var s = this.getStaff();
            if (s.clef.type !== "accordionTab") {
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

DIATONIC.play.Player.prototype.notifyUnSelectButton = function(button) {
  if(button === null) return;
 //console.log(this.currenttime);
 button.clear() ;
};

DIATONIC.play.Player.prototype.notifySelectButton = function(dir, button) {
  if(button === null) return;
  //console.log(this.currenttime);
  if(dir === DIATONIC.open)
    button.setOpen() ;
  else
    button.setClose();
};

DIATONIC.play.Player.prototype.selectButton = function( abcelem, dir, button, startTime ) {
    this.syncPlayList(startTime);
    var self = this;
    var channel = this.channel;
    this.playlist.splice(this.playlistpos, 0, {
        time: startTime,
        funct: function() {
            self.notifySelectButton(dir, button);
            self.notifySelect(abcelem, channel);
        }
    });
};
 
DIATONIC.play.Player.prototype.unSelectButton = function( abcelem, button, endTime ) {
    this.syncPlayList(endTime-1);
    var self = this;
    var channel = this.channel;
    this.playlist.splice(this.playlistpos, 0, {
        time: endTime,
        funct: function() {
            self.notifyUnSelectButton(button);
            self.notifyUnSelect(abcelem, channel);
        }
    });
 };

DIATONIC.play.Player.prototype.getBassButton = function( dir, b ) {
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

DIATONIC.play.Player.prototype.getButton = function( b ) {
    if(b === 'x') return null;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(this.map.gaita.keyboard[row][button]) 
        return this.map.gaita.keyboard[row][button].btn;
    return null;
};

DIATONIC.play.Player.prototype.selectButtons = function(elem) {
    var mididuration = elem.duration * this.baseduration * this.multiplier;
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
        //this.selectNote(elem, this.timecount);
        //this.unSelectNote(elem, this.timecount + mididuration);
    }
    this.timecount += mididuration;
};

DIATONIC.play.Player.prototype.writeNote = function(elem) {

    if (elem.startTriplet) {
        if (elem.startTriplet === 2)
            this.multiplier = 3 / 2;
        else
            this.multiplier = (elem.startTriplet - 1) / elem.startTriplet;
    }

    var mididuration = elem.duration * this.baseduration * this.multiplier;

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
                this.endNote(midipitch, this.startTieElem[midipitch], this.timecount + mididuration );
                delete this.startTieElem[midipitch];
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

DIATONIC.play.Player.prototype.handleBar = function(elem) {
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

    if (next && this.getMarkString(next) !== this.getMarkString()) {
        this.next = next;
    }

};

DIATONIC.play.Player.prototype.getAccOffset = function(txtAcc) {
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

DIATONIC.play.Player.prototype.setKeySignature = function(elem) {
    this.accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (this.abctune.formatting.bagpipes) {
        elem.accidentals = [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
    }
    if (!elem.accidentals)
        return;
    window.ABCJS.parse.each(elem.accidentals, function(acc) {
        var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ? 0 : -1;
        var lowercase = acc.note.toLowerCase();
        var note = this.extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
        this.accidentals[note] += d;
    }, this);

};

DIATONIC.play.Player.prototype.extractNote = function(pitch) {
    pitch = pitch % 7;
    if (pitch < 0)
        pitch += 7;
    return pitch;
};

DIATONIC.play.Player.prototype.extractOctave = function(pitch) {
    return Math.floor(pitch / 7);
};


DIATONIC.play.Player.prototype.stoipPlayingNClear = function() {
    window.clearTimeout(this.map.gTimeout);
    this.map.gaita.clearKeyboard();
    this.sounding = false;
    this.map.gIntervalo = 256;
};

DIATONIC.play.Player.prototype.stoipPlaying = function() {
    window.clearTimeout(this.map.gTimeout);
    this.sounding = false;
    this.map.gIntervalo = 256;
};


DIATONIC.play.Player.prototype.playAcorde = function(noteList, channel) {

    if (this.sounding)
        return;

    var delay = this.map.gIntervalo / 1000;
    var velocity = 127; // how hard the note hits
    var nota;

    // play the note
    this.sounding = true;
    MIDI.setVolume(channel, 127);

    var len = noteList[1].length;
    for (i = 0; i < len; i++) {
        if (noteList[0] === DIATONIC.close) {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose.value;
        } else {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen.value;
        }
        nota += this.map.toneOffSet;

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
    setTimeout(function() {
        that.stoipPlaying();
    }, (len + 3) * delay * 1000);
};


DIATONIC.play.Player.prototype.playSound = function(noteList, channel) {

    var delay = this.map.gIntervalo / 1000;
    var velocity = 127; // how hard the note hits
    var nota;
    var offset = this.map.gCurrentOffset;

    MIDI.setVolume(channel, 127);

    for (i = 0; i < noteList[1].length; i++) {
        if (noteList[0] === DIATONIC.close) {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose;
        } else {
            nota = this.map.gaita.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen;
        }
        if (nota.isChord) {
            generateAndPlayChord(nota, channel);
        } else {
            MIDI.noteOn(channel, nota.value + offset, velocity, 0);
            MIDI.noteOff(channel, nota.value + offset, delay);
            MIDI.noteOn(channel, nota.value + offset + 12, velocity, 0);
            MIDI.noteOff(channel, nota.value + offset + 12, delay);
        }
    }
};

DIATONIC.play.Player.prototype.generateAndPlayChord = function(chord, channel) {
    /* 
     formação de acordes:
     acorde maior   0, 4, 7
     acorde menor   0, 3, 7
     acorde setima  0, 4, 7, 10
     acorde menor setima   0, 3, 7, 10
     */

    var delay = this.map.gIntervalo / 1000;
    var velocity = 127; // how hard the note hits
    var nota;
    var offset = this.map.gCurrentOffset;


    MIDI.setVolume(channel, 127);
    MIDI.noteOn(channel, nota.value + offset, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset, delay);
    MIDI.noteOn(channel, nota.value + offset + 12, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset + 12, delay);

    var d = chord.isMinor ? 3 : 4;

    MIDI.noteOn(channel, nota.value + offset + d, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset + d, delay);
    MIDI.noteOn(channel, nota.value + offset + d + 12, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset + d + 12, delay);

    MIDI.noteOn(channel, nota.value + offset + 7, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset + 7, delay);
    MIDI.noteOn(channel, nota.value + offset + 7 + 12, velocity, 0);
    MIDI.noteOff(channel, nota.value + offset + 7 + 12, delay);

    if (chord.isSetima) {
        MIDI.noteOn(0, nota.value + offset + 10, velocity, 0);
        MIDI.noteOff(0, nota.value + offset + 10, delay);
        MIDI.noteOn(0, nota.value + offset + 10 + 12, velocity, 0);
        MIDI.noteOff(0, nota.value + offset + 10 + 12, delay);
    }

};

DIATONIC.play.Player.prototype.playEscala = function(nEscala, intervalo, ascendente, loop) {

    stoipPlaying();

    gIntervalo = intervalo;
    nNotaInicial = 0;
    incremento = 1;
    notaFinal = this.map.gaita.gaitas[this.map.gaita.selected][c_escalas][nEscala][c_notas].length;

    if (!ascendente) {
        nNotaInicial = notaFinal - 1;
        incremento = -1;
        notaFinal = -1;
    }   ;

    setNotes(nEscala, nNotaInicial);

    (function doPlay2(nNota) {
        gTimeout = setTimeout(function() {
            if (nNota !== notaFinal) {
                setNotes(nEscala, nNota);
                nNota += incremento;
                doPlay2(nNota);
            } else {
                if (loop) {
                    doPlay2(nNotaInicial);
                } else {
                    clearKeyboard();
                }
            }
        }, gIntervalo);
    })(nNotaInicial + incremento);

};

