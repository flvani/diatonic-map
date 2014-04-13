/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.play)
    window.DIATONIC.play = {};

DIATONIC.play.Player = function(map) {
    this.map = map;
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

