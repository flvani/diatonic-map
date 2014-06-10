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
    this.selectedChord = -1;
    this.keyboard = {};
    this.modifiedItems = {};
    this.renderedTune = undefined;
    this.printer = undefined;

    this.songDiv = document.getElementById(interfaceParams.songDiv);
    this.songContainerDiv = document.getElementById(interfaceParams.songContainerDiv);
    this.keyboardContentDiv = document.getElementById(interfaceParams.keyboardContentDiv);
    this.songSelector = document.getElementById(interfaceParams.songSelector);
    
    this.player = new DIATONIC.play.Player(this.map, interfaceParams.tabContentDiv);

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
  
  this.map.toneOffSet = 0;
  
  //o ideal seria ajustar o acordion do editor e seletor pelo id
  this.map.editor.accordion.load( this.selected );
  this.map.editor.accordionSelector.set(this.selected);
  
  this.setupKeyboard();

  this.map.setGaitaName( gaita );
  
  this.map.setGaitaImage( gaita );

  //this.carregaTabelaAcordes(this.map);
  
  if(!accordionParams.songTitle){
      accordionParams.songTitle = this.getSelectedAccordion().getFirstSong();
  }
 
  this.loadSongList(accordionParams.songTitle);
 
  this.renderTune( accordionParams.songTitle, {}, true );
  
};


DIATONIC.map.Gaita.prototype.translate = function() {
  this.keyboard.legenda.setTextOpen( DR.resource["DR_pull"][DR.language]);
  this.keyboard.legenda.setTextClose( DR.resource["DR_push"][DR.language]);
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

  var paper = this.map.definePaper(this.keyboardContentDiv, nWidth, nHeight );

  // desenha o botão de legenda  
  this.keyboard.legenda = new DIATONIC.map.Button( 
          paper, xi, yi, DR.resource["DR_pull"][DR.language], DR.resource["DR_push"][DR.language], 
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

      this.keyboard[j][i].btn = new DIATONIC.map.Button( paper, xxi, yyi
            , this.keyboard[j][i].notaOpen.key + (this.keyboard[j][i].notaOpen.isMinor?'-':'')
            , this.keyboard[j][i].notaClose.key  + (this.keyboard[j][i].notaClose.isMinor?'-':'')
            , {pedal: gaita.isPedal( i, j )} 
      );
      
      this.keyboard[j][i].btn.draw();

    } 
  }
  if(this.renderedTune)
    this.player.parseTabSong(this.renderedTune);

};


DIATONIC.map.Gaita.prototype.addChangeListenerToSongSelector = function(gaita) {
  this.songSelector.onchange = function() {
    gaita.renderTune( this.value, {}, true );
  };
};


DIATONIC.map.Gaita.prototype.loadSongList = function(tt) {
    
    while( this.songSelector.options.length > 0 ) {
        this.songSelector.remove(0);
    }            
    
    var songs = this.getSelectedAccordion().songs;
    for( var title in songs) {
        var opt = document.createElement('option');
        opt.innerHTML = title;
        opt.value = title;
        this.songSelector.appendChild(opt);
    }   
    this.songSelector.value = tt;
    this.addChangeListenerToSongSelector(this);
    
};

DIATONIC.map.Gaita.prototype.stopRenderedSong = function(control) {
    this.player.stopPlay();
};

DIATONIC.map.Gaita.prototype.playRenderedSong = function(control) {
  if( control.value === DR.resource["DR_pause"][DR.language] ) {
    this.player.pausePlay();
   } else {
     this.player.startPlay(control);
   } 
};

DIATONIC.map.Gaita.prototype.didaticPlayRenderedSong = function(control) {
  if( control.value === DR.resource["DR_pause"][DR.language] ) {
    this.player.pausePlay();
   } else {
     this.player.startDebugPlay(control);
   } 
};


DIATONIC.map.Gaita.prototype.printTune = function( params, alreadyOnPage ) {
    
    alreadyOnPage = alreadyOnPage || true;
    
    if(this.paper) {
       this.paper.clear();
       this.paper.height = 300;
    } else {
      this.paper = Raphael(this.songDiv, 700, 400);
    }
    
    
	var loader = new myWidget.Loader({
		id: "songLoader",
		bars: 0,
		radius: 0,
		lineWidth: 20,
		lineHeight: 70,
		timeout: 1, // maximum timeout in seconds.
		background: "rgba(0,0,0,0.5)",
		container: this.songContainerDiv,
		oncomplete: function() {
			// call function once loader has completed
		},
		onstart: function() {
			// call function once loader has started	
		}
	});
        
    //var d = new Date();
    //console.log(d.getMilliseconds());
    this.map.editor.parseABC(0, "force" );
    //console.log(d.getMilliseconds());
    //loader.update(null, "Wait...");
    this.renderedTune = this.map.editor.tunes[0];
    this.printer = new ABCJS.write.Printer(this.paper, params || {} );// TODO: handle printer params
    if(this.songContainerDiv)$("#"+this.songContainerDiv.id).fadeIn();
    $("#"+this.songDiv.id).fadeIn();
    this.printer.printABC(this.renderedTune, loader);
    $("#"+this.songDiv.id).hide();
    //loader.update(null,"Generating MIDI...",95);
    this.player.parseTabSong(this.renderedTune);
    //console.log(d.getMilliseconds());
    //loader.update(null,"Printing","...");
    loader.stop();
    $("#"+this.songDiv.id).fadeIn();
    if (!alreadyOnPage) $("#"+this.songContainerDiv.id).hide();
};

DIATONIC.map.Gaita.prototype.renderTune = function( title, params, alreadyOnPage ) {
  if(this.paper) {
    this.paper.clear();
    this.paper.height = 300;
  } else {
    this.paper = Raphael(this.songDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedTune = undefined;
      return;
  }
  this.map.editor.setString( this.getSelectedAccordion().getSong(title), "noRefresh" );

//  if(this.songContainerDiv)$("#"+this.songContainerDiv.id).fadeIn();
//  $("#"+this.songDiv.id).fadeIn();
  
  this.printTune(params, alreadyOnPage);

//  if (!alreadyOnPage) $("#"+this.songContainerDiv.id).hide();
  
};

DIATONIC.map.Gaita.prototype.transporta = function(nota) {
  if(! nota) return;
  
  var note = (nota.value + this.map.toneOffSet) % 12;

  nota.octave = (nota.value + this.map.toneOffSet - 12) / 12 >> 0;
  nota.key    = this.map.gShowLabel ? this.number2key_br[note] : this.number2key[note];
  
  if( nota.isChord )  {
    //nota.key = this.number2key_br[note].toLowerCase();
    nota.key = this.number2key[note].toLowerCase() ;
    
  }

  return nota;
};

DIATONIC.map.Accordion.prototype.g = function() {
  var v_afinacao = this.gaita.accordions[this.gaita.selected].getAfinacao();
  var str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + this.gaita.parseNote( v_afinacao[c] ).key + str_label;
  }
  $('#afinacao').text( this.gaita.parseNote( v_afinacao[0] ).key + str_label );
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

  return this.transporta(nota);
};


DIATONIC.map.Gaita.prototype.redrawKeyboard = function() {
    var accordion = this.getSelectedAccordion();

    for (j = 0; j < this.keyboard.length; j++) {
        for (i = 0; i < this.keyboard[j].length; i++) {
            this.setButtonText(this.keyboard[j][i]);
        }
    }

    for (var c = 0; c < accordion.getChords().length; c++) {
        var nome = this.parseNote(accordion.getChordSymbol(c));
        var acorde_lbl = nome.key + '<sub>' + nome.complement + '</sub>';
        $('#chord_' + c).html( acorde_lbl );
        if (this.selectedChord === c) {
            substituiHTML('acordeAtualFoleAbrindo', '&nbsp;', acorde_lbl);
            substituiHTML('acordeAtualFoleFechando', '&nbsp;', acorde_lbl);
        }
    }

    //this.map.mostraAfinacao();
    //this.map.draw();

//    aEscalas = GAITA.gaitas[GAITA.selected][c_escalas];
//    for (var c = 0; c < aEscalas.length; c++) {
//
//        nome = parseNote(aScales[c][c_symbol]);
//        substituiHTML('scale_' + c, '<br>', nome.key + '<i>' + nome.complement + '</i>');
//
//        for (var v = 0; v < aEscalas[c][c_notas].length; v++) {
//            opening = aEscalas[c][c_notas][v][0] === c_open;
//            aNotes = aEscalas[c][c_notas][v][1];
//            labelNotas = '';
//            for (var n = aNotes.length - 1; n > 0; n--) {
//                botao = GAITA.keyboard[aNotes[n][0]][aNotes[n][1]];
//                labelNotas = '/' + (opening ? botao.notaOpen.key + '<i>' + botao.notaOpen.complement + '</i>' : botao.notaClose.key + '<i>' + botao.notaClose.complement + '</i>') + labelNotas;
//            }
//            botao = GAITA.keyboard[aNotes[0][0]][aNotes[0][1]];
//            labelNotas = (opening ? botao.notaOpen.key + '<i>' + botao.notaOpen.complement + '</i>' : botao.notaClose.key + '<i>' + botao.notaClose.complement + '</i>') + labelNotas;
//            substituiHTML('scale_' + c + '_' + v, '<br>', labelNotas);
//        }
//    }


};


DIATONIC.map.Gaita.prototype.carregaTabelaAcordes = function(map) {
  var accordion = this.getSelectedAccordion();
  var chord_str = '<tr><td><strong>Acorde</strong></td><td><strong>Variação</strong></td></tr>';

  for (var c=0; c < accordion.getChords().length; c++) {
      var nome = this.parseNote(accordion.getChordSymbol(c));
      chord_str +=  '<tr><td id="chord_'+ c +'">' + nome.key + '<sub>' + nome.complement + '</sub>' + '</td><td>';
      var variations = accordion.getChordVariations(c);
    for (var v=0; v < variations.length; v++) {
      var opening = variations[v][0] === DIATONIC.open;
      chord_str += '<button id="chord_'+ c +'_'+ v +'" class="btn" style="color:black; background-color:';
      chord_str += opening ? '#00ff00"' : '#00b2ee"';
      chord_str += ' title="' + (opening ? 'Abrindo o fole' : 'Fechando o fole') + '"';
      chord_str += ' onclick="myMap.gaita.setAcorde(' + c + ',' + v + ')" ';  
      chord_str += ' onmouseover="myMap.gaita.setAcorde(' + c + ',' + v + ')" > ' + (v + 1) ;
      chord_str += ' <i class="' + (opening ? 'icon-resize-full' : 'icon-resize-small' ) + ' icon-black"></i>';
      chord_str += " </button> ";
    }
    chord_str += '</td></tr>';
  }
  document.getElementById("chords_table").innerHTML = chord_str;
};

DIATONIC.map.Gaita.prototype.setAcorde = function(chord_no, var_no) {
  
  if( this.player.sounding ) return;
  
  //destaca notas do acorde selecionado e toca o som correspondente
  var accordion = this.accordions[this.selected];
  
  var chord = accordion.getChords()[chord_no];
  var noteList = accordion.getChordVariations(chord_no)[var_no];
  this.selectedChord = chord_no;

  this.clearKeyboard();

  var nota = this.parseNote( chord[0] );
  var acorde_lbl =  nota.key + '<sub>' + nota.complement + '</sub>';
  substituiHTML( 'acordeAtualFoleAbrindo', '&nbsp;', acorde_lbl  );
  substituiHTML( 'acordeAtualFoleFechando', '&nbsp;', acorde_lbl );

  if (noteList[0] === DIATONIC.close) {
    $('#acordeAtualVazio').hide();
    $('#acordeAtualFoleAbrindo').hide();
    $('#acordeAtualFoleFechando').show();
  } else {
    $('#acordeAtualVazio').hide();
    $('#acordeAtualFoleFechando').hide();
    $('#acordeAtualFoleAbrindo').show();
  }

  for (i=0; i < noteList[1].length; i++) {
    this.markButton(noteList[0], noteList[1][i][0], noteList[1][i][1]);
  }

  //acertar isso... não posso simplemente setar uma cor  
  document.getElementById( 'chord_' + chord_no + '_' + var_no ).style.setProperty('background-color', 'gray', 'important');
  this.modifiedItems.push( 'chord_' + chord_no + '_' + var_no );


  //acertar isso: atualmente, uso dois canais para accordeon (um para cada staff) 
  if(this.player) {
    if (this.map.checkboxAcordeon.checked) this.player.playAcorde(noteList, 0);
    if (this.map.checkboxPiano.checked) this.player.playAcorde(noteList, 1);
  }
};

DIATONIC.map.Gaita.prototype.clearKeyboard = function(full) {

  for (var i=0; i < this.modifiedItems.length; i++) {
    var item = this.modifiedItems[i];
    if( typeof( item ) === 'object' ) {
       if(!full) item.btn.clear();
    } else {
      //acertar isso... não posso simplemente remover a cor
      document.getElementById( item ).style.removeProperty('background-color');
    }
  }
  
  if(full) {
    for (var j = 0; j < this.keyboard.length; j++) {
        for (var i = 0; i < this.keyboard[j].length; i++) {
            this.keyboard[j][i].btn.clear();
        }
    }
  }

  $('#acordeAtualVazio').show();
  $('#acordeAtualFoleAbrindo').hide();
  $('#acordeAtualFoleFechando').hide();

  //this.map.draw();
  this.modifiedItems = new Array();
};


DIATONIC.map.Gaita.prototype.clearButton = function(button) {
    button.btn.clear();
    //button.btn.setFill('white');
    //button.notaOpen.labels.key.setFill('black');
    //button.notaOpen.labels.compl.setFill('black');
    //button.notaOpen.labels.octave.setFill('black');
    //button.notaClose.labels.compl.setFill('black');
    //button.notaClose.labels.key.setFill('black');
    //button.notaClose.labels.octave.setFill('black');
};

DIATONIC.map.Gaita.prototype.markButton = function(dir, row, button) {
    this.selectButton(dir, this.keyboard[row][button]);
};

DIATONIC.map.Gaita.prototype.selectButton = function(dir, button) {

    this.modifiedItems.push(button);
    if (dir === DIATONIC.close) {
        button.btn.setClose();
        //button.btn.setFill('#f5b043'); // yellow
        //button.notaClose.labels.key.setFill('red');
        //button.notaClose.labels.compl.setFill('red');
        //button.notaClose.labels.octave.setFill('red');
        //button.notaOpen.labels.key.setFill('#f5b043');
        //button.notaOpen.labels.compl.setFill('#f5b043');
        //button.notaOpen.labels.octave.setFill('#f5b043');
    } else {
        button.btn.setOpen();
        //button.btn.setFill('#24e3be'); // ligthgreen
        //button.notaOpen.labels.key.setFill('red');
        //button.notaOpen.labels.compl.setFill('red');
        //button.notaOpen.labels.octave.setFill('red');
        //button.notaClose.labels.key.setFill('#24e3be');
        //button.notaClose.labels.compl.setFill('#24e3be');
        //button.notaClose.labels.octave.setFill('#24e3be');
    }
};

DIATONIC.map.Gaita.prototype.setButtonText = function (p_button) {
   this.transporta( p_button.notaOpen );
   this.transporta( p_button.notaClose );
   p_button.btn.setTextOpen( p_button.notaOpen.key + (p_button.notaOpen.isMinor?'-':'')  );
   p_button.btn.setTextClose( p_button.notaClose.key + (p_button.notaClose.isMinor?'-':'')  );

};
