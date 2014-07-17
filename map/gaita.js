if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

DIATONIC.map.Gaita = function(map, interfaceParams ) {
    
    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE; 
    
    this.map = map;
    this.keyToNote = {}; // C8  == 108
    this.noteToKey = {}; // 108 ==  C8
    this.minNote = 0x15; //  A0 = first note
    this.maxNote = 0x6C; //  C8 = last note
    this.number2key = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
    this.number2keyflat = ["C", "D♭", "D", "D♯", "E", "F", "G♭", "G", "A♭", "A", "A♯", "B"];
    this.number2key_br = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];
    this.minNoteInUse = this.maxNote;
    this.maxNoteInUse = this.minNote;
    this.accordions = [];
    this.selected = -1;
    this.showLabel = false;
    this.keyboard = {};
    this.modifiedItems = {};
    this.paper = undefined;
    
    DR.register( this ); // register for translate
    
    this.songDiv = document.getElementById(interfaceParams.songDiv);
    this.songSelector = document.getElementById(interfaceParams.songSelector);

    this.practiceDiv = document.getElementById(interfaceParams.practiceDiv);
    this.practiceSelector = document.getElementById(interfaceParams.practiceSelector);

    this.chordDiv = document.getElementById(interfaceParams.chordDiv);
    this.chordSelector = document.getElementById(interfaceParams.chordSelector);
    
    this.keyboardContentDiv = document.getElementById(interfaceParams.keyboardContentDiv);
    
    if (window.DIATONIC.map.models.length > 0) {
        this.accordions = window.DIATONIC.map.models;
        this.selected = 0;
    }
    
    // popular arrays com nomes e valores de notas
    for (var n = this.minNote; n <= this.maxNote; n++) {
        var octave = (n - 12) / 12 >> 0;
        var name = this.number2key[n % 12] + octave;
        this.noteToKey[n] = name;
        this.keyToNote[name] = n;
        name = this.number2keyflat[n % 12] + octave;
        this.keyToNote[name] = n;
    }
};

DIATONIC.map.Gaita.prototype.selectAccordion = function(id) {
    this.selected = -1;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) this.selected = a;
    }
    return this.accordions[this.selected];
};

DIATONIC.map.Gaita.prototype.getSelectedAccordion = function() {
    return this.accordions[this.selected];
};

DIATONIC.map.Gaita.prototype.setup = function(accordionParams) {

  var gaita = this.selectAccordion(accordionParams.accordionId);
  
   this.renderedTune = undefined;
   this.renderedPractice = undefined;
   this.renderedChord = undefined;
  
  //o ideal seria ajustar o acordion do editor e seletor pelo id
  this.map.editor.accordion.load( this.selected );
  this.map.editor.accordionSelector.set(this.selected);
  
  this.setupKeyboard();

  this.map.setGaitaName( gaita );
  this.map.setGaitaImage( gaita );

  if(!accordionParams.practiceTitle){
    var tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.practice.title');
    accordionParams.practiceTitle = tit || this.getSelectedAccordion().getFirstPractice();
  }
  this.loadPracticeList(accordionParams.practiceTitle);
  this.renderPractice( accordionParams.practiceTitle, {}, this.map.currentTab === "tabPractices" );

  if(!accordionParams.chordTitle){
    var tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.chord.title');
    accordionParams.chordTitle = tit || this.getSelectedAccordion().getFirstChord();
  }
  this.loadChordList(accordionParams.chordTitle);
  this.renderChord( accordionParams.chordTitle, {}, this.map.currentTab === "tabChords" );

  if(!accordionParams.songTitle){
      var tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.song.title');
      accordionParams.songTitle = tit || this.getSelectedAccordion().getFirstSong();
  }
  this.loadSongList(accordionParams.songTitle);
  this.renderTune( accordionParams.songTitle, {}, this.map.currentTab === "tabTunes" );

};

DIATONIC.map.Gaita.prototype.translate = function() {
  this.keyboard.legenda.setTextOpen( DR.getResource('DR_pull') );
  this.keyboard.legenda.setTextClose( DR.getResource('DR_push') );
};

DIATONIC.map.Gaita.prototype.setupKeyboard = function() {

  var nHeight,nWidth,bassX,trebleX,bassY,trebleY,xi,yi,xxi,yyi;
 
  // configura e mostra a gaita inicial
  var gaita = this.getSelectedAccordion();
  var nIlheiras = gaita.getNumKeysRows();
  var nIlheirasBaixo = gaita.getNumBassesRows();
  
  var bHorizontal = this.map.isHorizontal();
  var bEspelho = this.map.isMirror();

  // para localizar as notas extremas
  this.minNoteInUse   = this.maxNote;
  this.maxNoteInUse   = this.minNote;

  //this.selected = nGaita;
  this.keyboard = new Array();
  this.modifiedItems = new Array();

  // ilheiras da mao direita
  var maiorIlheira = 0;
  for (i=0; i<nIlheiras; i++) {
    this.keyboard[i] = new Array( gaita.getKeysOpenRow(i).length );
    maiorIlheira = gaita.getKeysOpenRow(i).length > maiorIlheira ? gaita.getKeysOpenRow(i).length : maiorIlheira;
  }

  // ilheiras da mao esquerda
  var maiorIlheiraBaixo = gaita.getBassOpenRow(0).length;
  for (i=nIlheiras; i<nIlheiras+nIlheirasBaixo; i++) {
    this.keyboard[i] = new Array( gaita.getBassOpenRow(i-nIlheiras).length );
  }
 
  var nTotIlheiras = nIlheiras+nIlheirasBaixo+1;

  if( bHorizontal ) {
    nHeight = nTotIlheiras*(this.BTNSIZE+this.BTNSPACE) + this.BTNSPACE;
    nWidth  = (maiorIlheira)*(this.BTNSIZE+this.BTNSPACE) + this.BTNSIZE/2;
    bassX   = this.BTNSPACE*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(this.BTNSIZE+this.BTNSPACE);
    trebleX = this.BTNSPACE*4;
    xi = bassX -1.5 * (this.BTNSIZE+this.BTNSPACE); 
    if( bEspelho ) {
       yi = this.BTNSPACE + (nTotIlheiras-1.1) * (this.BTNSIZE+this.BTNSPACE);  
    }else {
       yi = this.BTNSPACE + (1.1) * (this.BTNSIZE+this.BTNSPACE);  
    }
  } else {
     nWidth  = nTotIlheiras*(this.BTNSIZE+this.BTNSPACE) + this.BTNSPACE;
     nHeight = (maiorIlheira)*(this.BTNSIZE+this.BTNSPACE) + this.BTNSIZE/2;
     bassY   = this.BTNSPACE*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(this.BTNSIZE+this.BTNSPACE);
     trebleY = this.BTNSPACE*4;
     yi = bassY -1.5 * (this.BTNSIZE+this.BTNSPACE); 
    
    if( bEspelho ) {
           xi = this.BTNSPACE + (1.1) * (this.BTNSIZE+this.BTNSPACE) ; 
    }else {
           xi = this.BTNSPACE + (nTotIlheiras-1.1) * (this.BTNSIZE+this.BTNSPACE) ; 
    }
  }

  this.definePaper(this.keyboardContentDiv, nWidth, nHeight );

  // desenha o botão de legenda  
  this.keyboard.legenda = new DIATONIC.map.Button( 
          this.paper, xi, yi, DR.getResource("DR_pull"), DR.getResource("DR_push"), 
             { radius:36, pedal: true, fontsize:14, xLabel: 0,textAnchor:'middle', color: '#828282'} );
             
  this.keyboard.legenda.draw();
  this.keyboard.legenda.setOpen();
  this.keyboard.legenda.setClose();
  
    if( bHorizontal ) {
      if( bEspelho ) {
        this.keyboard.legenda.drawLine(xi+ 0,yi-70,xi+420,yi-70);
        this.keyboard.legenda.drawLine(xi+ 0,yi-80,xi+420,yi-80);
        this.keyboard.legenda.drawLine(xi+ 0,yi-90,xi+420,yi-90);
      } else {
        this.keyboard.legenda.drawLine(xi+ 0,yi+70,xi+420,yi+70);
        this.keyboard.legenda.drawLine(xi+ 0,yi+80,xi+420,yi+80);
        this.keyboard.legenda.drawLine(xi+ 0,yi+90,xi+420,yi+90);
      }
   } else {
      if( bEspelho ) {
          
      } else {
          
      }
   }
  
  for (var j=0; j<this.keyboard.length; j++) {

    if( bHorizontal ) {
      if( bEspelho ) {
        if( j < nIlheiras ) {
           xi = trebleX + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
           yi = this.BTNSPACE + (j+.6) * (this.BTNSIZE+this.BTNSPACE); 
        }else {
           xi = bassX + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
           yi = this.BTNSPACE + (j+1.4) * (this.BTNSIZE+this.BTNSPACE);  
        }
      } else { 
        if( j < nIlheiras ) {
           xi = trebleX + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
           yi = this.BTNSPACE + (nTotIlheiras-j-.6) * (this.BTNSIZE+this.BTNSPACE); 
        }else {
           xi = bassX + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
           yi = this.BTNSPACE + (nTotIlheiras-j-1.4) * (this.BTNSIZE+this.BTNSPACE);  
        }
      }
    } else {
      if( bEspelho ) {
        if( j < nIlheiras ) {
           xi = this.BTNSPACE + (nTotIlheiras-j-.6) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = trebleY + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
        }else {
           xi = this.BTNSPACE + (nTotIlheiras-j-1.4) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = bassY + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
        }
       } else {
        if( j < nIlheiras ) {
           xi = this.BTNSPACE + (j+0.6) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = trebleY + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
        }else {
           xi = this.BTNSPACE + (j+1.4) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = bassY + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
        }
      }
    }
    
    var openKeysRow   = gaita.getKeysOpenRow(j); 
    var closeKeysRow  = gaita.getKeysCloseRow(j);
    var openBassRow  = gaita.getBassOpenRow(j-nIlheiras);
    var closeBassRow = gaita.getBassCloseRow(j-nIlheiras);

    for (var i=0; i<this.keyboard[j].length; i++) {

      if ( bHorizontal ) {
         xxi = xi + i*(this.BTNSIZE + this.BTNSPACE);
         yyi = yi;
      } else {
         xxi = xi;
         yyi = yi + i*(this.BTNSIZE + this.BTNSPACE);
      }
      
      this.keyboard[j][i] = {};
 
      if(j<nIlheiras) {
        this.keyboard[j][i].notaOpen  = this.parseNote( openKeysRow[i], false );
        this.keyboard[j][i].notaClose = this.parseNote( closeKeysRow[i], false );
      } else {
        this.keyboard[j][i].notaOpen  = this.parseNote( openBassRow[i], true );
        this.keyboard[j][i].notaClose = this.parseNote( closeBassRow[i], true );
      }

      this.minNoteInUse = Math.min( this.keyboard[j][i].notaOpen.value, this.minNoteInUse );
      this.minNoteInUse = Math.min( this.keyboard[j][i].notaClose.value, this.minNoteInUse );
      this.maxNoteInUse = Math.max( this.keyboard[j][i].notaOpen.value+12, this.maxNoteInUse );
      this.maxNoteInUse = Math.max( this.keyboard[j][i].notaClose.value+12, this.maxNoteInUse );

      this.keyboard[j][i].btn = new DIATONIC.map.Button( this.paper, xxi, yyi
            , this.keyboard[j][i].notaOpen.key + (this.keyboard[j][i].notaOpen.isMinor?'-':'')
            , this.keyboard[j][i].notaClose.key  + (this.keyboard[j][i].notaClose.isMinor?'-':'')
            , {pedal: gaita.isPedal( i, j )} 
      );
      
      this.keyboard[j][i].btn.draw();

    } 
  }
  
  if(this.renderedTune)
    this.renderedTune.midi = this.map.midiParser.parseTabSong(this.renderedTune, this.songPrinter);
  if(this.renderedPractice)
    this.renderedPractice.midi = this.map.midiParser.parseTabSong(this.renderedPractice, this.practicePrinter);
  if(this.renderedChord)
    this.renderedChord.midi = this.map.midiParser.parseTabSong(this.renderedChord, this.chordPrinter);

};

DIATONIC.map.Gaita.prototype.addChangeListenerToChordSelector = function(gaita) {
    this.chordSelector.onchange = function() {
    FILEMANAGER.saveLocal( 'property.'+gaita.getSelectedAccordion().getId()+'.chord.title', this.value );
    gaita.renderChord( this.value, {}, true );
    gaita.map.tuneContainerDiv.scrollTop = 0;    
  };
};

DIATONIC.map.Gaita.prototype.addChangeListenerToPracticeSelector = function(gaita) {
    this.practiceSelector.onchange = function() {
    FILEMANAGER.saveLocal( 'property.'+gaita.getSelectedAccordion().getId()+'.practice.title', this.value );
    gaita.renderPractice( this.value, {}, true );
    gaita.map.tuneContainerDiv.scrollTop = 0;    
  };
};

DIATONIC.map.Gaita.prototype.addChangeListenerToSongSelector = function(gaita) {
    this.songSelector.onchange = function() {
    FILEMANAGER.saveLocal( 'property.'+gaita.getSelectedAccordion().getId()+'.song.title', this.value );
    gaita.renderTune( this.value, {}, true );
    gaita.map.tuneContainerDiv.scrollTop = 0;    
  };
};

DIATONIC.map.Gaita.prototype.loadSongList = function(tt) {
    
    while( this.songSelector.options.length > 0 ) {
        this.songSelector.remove(0);
    }            
    
    var items = this.getSelectedAccordion().songs.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        var title = items[i];
        var opt = document.createElement('option');
        opt.innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        opt.value = title;
        this.songSelector.appendChild(opt);
        if(title === tt) {
            this.songSelector.value = tt;
        }    
    }   
    this.addChangeListenerToSongSelector(this);
    
};

DIATONIC.map.Gaita.prototype.loadPracticeList = function(tt) {
    
    while( this.practiceSelector.options.length > 0 ) {
        this.practiceSelector.remove(0);
    }            
    
    var items = this.getSelectedAccordion().practices.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        var title = items[i];
        var opt = document.createElement('option');
        opt.innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        opt.value = title;
        this.practiceSelector.appendChild(opt);
        if(title === tt) {
            this.practiceSelector.value = tt;
        }    
    }   
    this.addChangeListenerToPracticeSelector(this);
    
};

DIATONIC.map.Gaita.prototype.loadChordList = function(tt) {
    
    while( this.chordSelector.options.length > 0 ) {
        this.chordSelector.remove(0);
    }            
    
    var items = this.getSelectedAccordion().chords.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        var title = items[i];
        var opt = document.createElement('option');
        opt.innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        opt.value = title;
        this.chordSelector.appendChild(opt);
        if(title === tt) {
            this.chordSelector.value = tt;
        }    
    }   
    this.addChangeListenerToChordSelector(this);
    
};

DIATONIC.map.Gaita.prototype.printTune = function(alreadyOnPage, params ) {

    if (this.songPaper) {
        this.songPaper.clear();
        this.songPaper.height = 300;
    } else {
        this.songPaper = Raphael(this.songDiv, 700, 400);
    }


    var loader = this.startLoader("songLoader");
    
    this.map.editor.parseABC(0, "force");
    this.renderedTune.abc = this.map.editor.tunes[0];
    this.songPrinter = new ABCJS.write.Printer(this.songPaper, params || {});
    $("#" + this.songDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.songPrinter.printABC(this.renderedTune.abc);
    $("#" + this.songDiv.id).hide();
    this.renderedTune.midi = this.map.midiParser.parseTabSong(this.renderedTune.abc, this.songPrinter);
    loader.stop();
    if (alreadyOnPage)
      $("#" + this.songDiv.id).fadeIn();
};

DIATONIC.map.Gaita.prototype.renderTune = function( title, params, alreadyOnPage ) {
  if(this.songPaper) {
    this.songPaper.clear();
    this.songPaper.height = 300;
  } else {
    this.songPaper = Raphael(this.songDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedTune = undefined;
      return;
  }
  this.renderedTune = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getSong(title), "noRefresh" );
  this.printTune(alreadyOnPage, params);
};

DIATONIC.map.Gaita.prototype.printPractice = function(alreadyOnPage, params) {

    if (this.practicePaper) {
        this.practicePaper.clear();
        this.practicePaper.height = 300;
    } else {
        this.practicePaper = Raphael(this.practiceDiv, 700, 400);
    }


    var loader = this.startLoader("practiceLoader");
    this.map.editor.parseABC(0, "force");
    this.renderedPractice.abc = this.map.editor.tunes[0];
    this.practicePrinter = new ABCJS.write.Printer(this.practicePaper, params || {});

    $("#" + this.practiceDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.practicePrinter.printABC(this.renderedPractice.abc);
    $("#" + this.practiceDiv.id).hide();
    
    this.renderedPractice.midi = this.map.midiParser.parseTabSong(this.renderedPractice.abc, this.practicePrinter);

    loader.stop();
    if (alreadyOnPage)
      $("#" + this.practiceDiv.id).fadeIn();
};



DIATONIC.map.Gaita.prototype.renderPractice = function( title, params, alreadyOnPage ) {
  if(this.practicePaper) {
    this.practicePaper.clear();
    this.practicePaper.height = 300;
  } else {
    this.practicePaper = Raphael(this.practiceDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedPractice = undefined;
      return;
  }
  this.renderedPractice = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getPractice(title), "noRefresh" );

  this.printPractice(alreadyOnPage, params);

};


DIATONIC.map.Gaita.prototype.printChord = function(alreadyOnPage, params) {

    if (this.chordPaper) {
        this.chordPaper.clear();
        this.chordPaper.height = 300;
    } else {
        this.chordPaper = Raphael(this.chordDiv, 700, 400);
    }

    var loader = this.startLoader("chordLoader");
    this.map.editor.parseABC(0, "force");
    this.renderedChord.abc = this.map.editor.tunes[0];
    this.chordPrinter = new ABCJS.write.Printer(this.chordPaper, params || {});

    $("#" + this.chordDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.chordPrinter.printABC(this.renderedChord.abc);
    $("#" + this.chordDiv.id).hide();
    
    this.renderedChord.midi = this.map.midiParser.parseTabSong(this.renderedChord.abc, this.chordPrinter);
    
    loader.stop();
    if (alreadyOnPage)
      $("#" + this.chordDiv.id).fadeIn();
};

DIATONIC.map.Gaita.prototype.renderChord = function( title, params, alreadyOnPage ) {
  if(this.chordPaper) {
    this.chordPaper.clear();
    this.chordPaper.height = 300;
  } else {
    this.chordPaper = Raphael(this.chordDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedChord = undefined;
      return;
  }
  this.renderedChord = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getChord(title), "noRefresh" );

  this.printChord(alreadyOnPage,params);

};

DIATONIC.map.Gaita.prototype.startLoader = function(id) {

    var loader = new window.widgets.Loader({
        id: id,
        bars: 0,
        radius: 0,
        lineWidth: 20,
        lineHeight: 70,
        timeout: 1, // maximum timeout in seconds.
        background: "rgba(0,0,0,0.5)",
        container: document.body,
        oncomplete: function() {
            // call function once loader has completed
        },
        onstart: function() {
            // call function once loader has started	
        }
    });
    return loader;

};

DIATONIC.map.Gaita.prototype.parseNote = function(p_nota, isBass) {

  var nota = {};

  nota.key        = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( 0, p_nota.indexOf( ":" ) ) : p_nota ;
  nota.complement = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( p_nota.indexOf( ":" )+1, p_nota.length - p_nota.indexOf( ":" ) ) : '';
  nota.octave     = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.charAt(nota.key.length-1) : 4;
  nota.key        = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.substr( 0, nota.key.length-1 ) : nota.key;
  nota.value      =  this.keyToNote[ nota.key.toUpperCase() + nota.octave ];

  if (typeof (nota.value) === "undefined" ) 
      alert( 'Nota inválida: ' + p_nota );

  nota.isChord    = ( p_nota.charAt(0) === p_nota.charAt(0).toLowerCase() );
  nota.isBass     = isBass;
  nota.isMinor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;

  return this.setKeyLabel( nota );
};

DIATONIC.map.Gaita.prototype.setKeyLabel = function(nota) {
  if( nota.isChord )  {
    nota.key = this.number2key[nota.value % 12].toLowerCase() ;
  } else {
      if( this.showLabel) {
        nota.key = this.number2key_br[nota.value % 12] ;
      } else {
        nota.key = this.number2key[nota.value % 12];
      }
  }
  return nota;
};

DIATONIC.map.Gaita.prototype.changeNotation = function() {
    this.showLabel = !this.showLabel;
    myMap.gaita.redrawKeyboard();
};

DIATONIC.map.Gaita.prototype.redrawKeyboard = function() {
    for (j = 0; j < this.keyboard.length; j++) {
        for (i = 0; i < this.keyboard[j].length; i++) {
            this.setButtonText(this.keyboard[j][i]);
        }
    }
};

DIATONIC.map.Gaita.prototype.setButtonText = function (p_button) {
   this.setKeyLabel( p_button.notaOpen );
   this.setKeyLabel( p_button.notaClose );
   p_button.btn.setTextOpen( p_button.notaOpen.key + (p_button.notaOpen.isMinor?'-':'')  );
   p_button.btn.setTextClose( p_button.notaClose.key + (p_button.notaClose.isMinor?'-':'')  );

};

DIATONIC.map.Gaita.prototype.clearKeyboard = function(full) {

  if(full) {
    for (var j = 0; j < this.keyboard.length; j++) {
        for (var i = 0; i < this.keyboard[j].length; i++) {
            this.keyboard[j][i].btn.clear();
        }
     }
  } else  {
    for (var i=0; i < this.modifiedItems.length; i++) {
      this.modifiedItems[i].btn.clear();
    }
  }
  this.modifiedItems = new Array();
};

DIATONIC.map.Gaita.prototype.clearButton = function(button) {
    button.btn.clear();
};

DIATONIC.map.Gaita.prototype.selectButton = function(dir, button) {

    this.modifiedItems.push(button);
    if (dir === DIATONIC.close) {
        button.btn.setClose();
    } else {
        button.btn.setOpen();
    }
};

DIATONIC.map.Gaita.prototype.definePaper = function( div, w, h )  {
  if(this.paper) {
      this.paper.clear();
      this.paper.setSize(w,h);
  } else {
     this.paper = Raphael(div, w, h );
  }  
  return this.paper;
};

