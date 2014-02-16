function parseNote( p_nota, isBass ) {

  var nota = {};

  nota.key        = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( 0, p_nota.indexOf( ":" ) ) : p_nota ;
  nota.complement = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( p_nota.indexOf( ":" )+1, p_nota.length - p_nota.indexOf( ":" ) ) : '';
  nota.octave     = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.charAt(nota.key.length-1) : 4;
  nota.key        = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.substr( 0, nota.key.length-1 ) : nota.key;
  nota.value      =  GAITA.keyToNote[ nota.key.toUpperCase() + nota.octave ];

  if (typeof (nota.value) === "undefined" ) alert( 'Nota inválida: ' + p_nota );

  nota.isChord    = ( p_nota.charAt(0) == p_nota.charAt(0).toLowerCase() );
  nota.isBass     = isBass;
  nota.isMenor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;
  nota.labels     = {};

  return nota;
}

function transporta( nota ) {

  //notaori = nota;
  var note = (nota.value + gCurrentToneOffset) % 12;

  nota.octave = (nota.value + gCurrentToneOffset - 12) / 12 >> 0;
  nota.key    = gShowLabel ? GAITA.number2key_br[note] : GAITA.number2key[note];
  if( nota.isChord )  {
    nota.key = GAITA.number2key_br[note].toLowerCase();
  }

  return nota;
}

function createKinectText( p_texto_inicial, param_row, param_column, param_open_close, param_x, param_y) {

  labels = {};

  labels.key = new Kinetic.Text({
    x: param_x - (c_btnSize * 0.5),
    y: param_y - 1,
    text: p_texto_inicial, fontSize: c_fontSize, fontFamily: 'Arial',
    id: 'l_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: c_btnSize, align: 'center',
  });

  labels.compl = new Kinetic.Text({
    x: param_x - (c_btnSize * 0.5),
    y: param_y + 2,
    text: p_texto_inicial, fontSize: c_fontSize-4, fontFamily: 'Arial', fontStyle: 'italic',
    id: 'l_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: c_btnSize, align: 'center',
  });

  labels.octave = new Kinetic.Text({
    x: param_x - (c_btnSize * 0.5),
    y: param_y + 8,
    text: "", fontSize: c_fontSize-8, fontFamily: 'Arial',
    id: 'l8_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: c_btnSize, align: 'center',
  });

  return labels;
}

function setButtonText(p_button) {
   transporta( p_button.notaOpen );
   transporta( p_button.notaClose );

   p_button.notaOpen.labels.key.setText( p_button.notaOpen.key  );
   p_button.notaOpen.labels.compl.setText( p_button.notaOpen.complement );//
   p_button.notaOpen.labels.octave.setText( p_button.notaOpen.isBass ? '' : p_button.notaOpen.octave );

   p_button.notaOpen.labels.key.offsetX( p_button.notaOpen.labels.compl.getTextWidth()/2 + p_button.notaOpen.labels.octave.getTextWidth()/2 );
   p_button.notaOpen.labels.compl.offsetX( -p_button.notaOpen.labels.key.getTextWidth()/2 + p_button.notaOpen.labels.octave.getTextWidth()/2 );
   p_button.notaOpen.labels.octave.offsetX( -p_button.notaOpen.labels.key.getTextWidth()/2 - p_button.notaOpen.labels.compl.getTextWidth()/2 );
 
   p_button.notaClose.labels.key.setText( p_button.notaClose.key  );
   p_button.notaClose.labels.compl.setText( p_button.notaClose.complement );
   p_button.notaClose.labels.octave.setText( p_button.notaClose.isBass ? '' : p_button.notaClose.octave );

   p_button.notaClose.labels.key.offsetX( p_button.notaClose.labels.compl.getTextWidth()/2 + p_button.notaClose.labels.octave.getTextWidth()/2  );
   p_button.notaClose.labels.compl.offsetX( -p_button.notaClose.labels.key.getTextWidth()/2 + p_button.notaClose.labels.octave.getTextWidth()/2 );
   p_button.notaClose.labels.octave.offsetX( -p_button.notaClose.labels.key.getTextWidth()/2 - p_button.notaClose.labels.compl.getTextWidth()/2 );

}

function substituiHTML( oid, marcador, newText ) {
  // esta função procura o texto do innerHTML de um elemento e substitui do inicio até o marcador com newText
  str = document.getElementById( oid ).innerHTML;
  pos = str.indexOf(marcador); 
  resto = str.length - pos;
  document.getElementById( oid ).innerHTML = newText + '' +  str.substr( pos, resto );
}

function mostraAfinacao() {
  v_afinacao = GAITA.gaitas[GAITA.selected][c_afinacao];
  str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + transporta( parseNote( v_afinacao[c] ) ).key + str_label;
  }
  $('#afinacao').text( transporta( parseNote( v_afinacao[0] ) ).key + str_label );
}

function geraLabelListaAfinacao( v_afinacao ) {
  str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + transporta( parseNote(v_afinacao[c] ) ).key + str_label;
  }
  return transporta( parseNote( v_afinacao[0] ) ).key + str_label;
}

function set_pop_tone(tone) {
  gCurrentToneOffset = tone - parseNote( GAITA.gaitas[GAITA.selected][c_afinacao][0] ).value;
  redrawKeyboard();
}

function markButtonClose (row, button) {
    setModifiedItem( GAITA.keyboard[row][button] );
    GAITA.keyboard[row][button].btn.setFill('#f5b043'); // yellow
    GAITA.keyboard[row][button].notaClose.labels.key.setFill('red');
    GAITA.keyboard[row][button].notaClose.labels.compl.setFill('red');
    GAITA.keyboard[row][button].notaClose.labels.octave.setFill('red');
    GAITA.keyboard[row][button].notaOpen.labels.key.setFill('#f5b043');
    GAITA.keyboard[row][button].notaOpen.labels.compl.setFill('#f5b043');
    GAITA.keyboard[row][button].notaOpen.labels.octave.setFill('#f5b043');
}

function markButtonOpen (row, button) {
    setModifiedItem( GAITA.keyboard[row][button] );
    GAITA.keyboard[row][button].modified = true;
    GAITA.keyboard[row][button].btn.setFill('#24e3be'); // ligthgreen
    GAITA.keyboard[row][button].notaOpen.labels.key.setFill('red');
    GAITA.keyboard[row][button].notaOpen.labels.compl.setFill('red');
    GAITA.keyboard[row][button].notaOpen.labels.octave.setFill('red');
    GAITA.keyboard[row][button].notaClose.labels.key.setFill('#24e3be');
    GAITA.keyboard[row][button].notaClose.labels.compl.setFill('#24e3be');
    GAITA.keyboard[row][button].notaClose.labels.octave.setFill('#24e3be');
}

function setModifiedItem( item ) {
  GAITA.modifiedItems[GAITA.modifiedItems.length] = item;
}

function clearKeyboard() {

  for (i=0; i < GAITA.modifiedItems.length; i++) {
    item = GAITA.modifiedItems[i];
    if( typeof( item ) === 'object' ) {
       item.btn.setFill('white');
       item.notaOpen.labels.key.setFill('black');
       item.notaOpen.labels.compl.setFill('black');
       item.notaOpen.labels.octave.setFill('black');
       item.notaClose.labels.compl.setFill('black');
       item.notaClose.labels.key.setFill('black');
       item.notaClose.labels.octave.setFill('black');
    } else {
      document.getElementById( item ).style.removeProperty('background-color');
    }
  }

  $('#acordeAtualVazio').show();
  $('#acordeAtualFoleAbrindo').hide();
  $('#acordeAtualFoleFechando').hide();

  gLayer.batchDraw();
  GAITA.modifiedItems = new Array();
}

function redrawKeyboard () {
  aChords = GAITA.gaitas[GAITA.selected][c_acordes];
  aEscalas = GAITA.gaitas[GAITA.selected][c_escalas];

  for( j=0; j < GAITA.keyboard.length; j++) {
    for (i=0; i < GAITA.keyboard[j].length; i++) {
      setButtonText(GAITA.keyboard[j][i]) 
    }
  }

  for (var c=0; c < aChords.length; c++) {
	nome = transporta(parseNote(aChords[c][c_symbol]));
     $('#chord_' + c).html( nome.key + '<sub>' + nome.complement + '</sub>' );
  }

  for (var c=0; c < aEscalas.length; c++) {

	nome = transporta(parseNote(aScales[c][c_symbol]));
    substituiHTML( 'scale_' + c, '<br>', nome.key + '<i>' + nome.complement + '</i>' );

    for (var v=0; v < aEscalas[c][c_notas].length; v++) {
      opening = aEscalas[c][c_notas][v][0]  == c_open;
      aNotes = aEscalas[c][c_notas][v][1];
      labelNotas = '';
      for( var n=aNotes.length-1; n > 0;  n-- ) {
		 botao = GAITA.keyboard[aNotes[n][0]][aNotes[n][1]];
         labelNotas = '/' + (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
      }   
      botao = GAITA.keyboard[aNotes[0][0]][aNotes[0][1]];
      labelNotas = (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
      substituiHTML( 'scale_' + c + '_' + v, '<br>', labelNotas );
    }
  }

  if (GAITA.selectedChord != -1) {
    nota = transporta(parseNote( aChords[GAITA.selectedChord][0] ) );
    acorde_lbl =  nota.key + '<sub>' + nota.complement + '</sub>';
    substituiHTML( 'acordeAtualFoleAbrindo', '&nbsp;', acorde_lbl  );
    substituiHTML( 'acordeAtualFoleFechando', '&nbsp;', acorde_lbl  );
  }
  
  mostraAfinacao();
  gLayer.draw();

}

function stopPlaying() {  

  clearTimeout(gTimeout);  
  clearKeyboard();
  GAITA.sounding = false;
  gIntervalo = 256;

}     
   
function playAcorde( noteList, channel )
{

  var delay = gIntervalo/1000; 
  var velocity = 127; // how hard the note hits

  // play the note
  GAITA.sounding=true;
  MIDI.setVolume(channel, 127);

  len = noteList[1].length;
  for (i=0; i < len; i++) {
    if (noteList[0] == c_close) {
      nota   = GAITA.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose.value;
    } else {
      nota   = GAITA.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen.value;
    }
    nota += gCurrentToneOffset;

 	MIDI.noteOn(channel, nota, velocity, (i-0)*delay);	    	
 	MIDI.noteOff(channel, nota, (i-0+1)*delay);
 	MIDI.noteOn(channel, nota+12, velocity, (i-0)*delay);	    	
 	MIDI.noteOff(channel, nota+12, (i-0+1)*delay);
 	MIDI.noteOn(channel, nota, velocity, (len+1)*delay);	    	
 	MIDI.noteOff(channel, nota, (len+3)*delay);
 	MIDI.noteOn(channel, nota+12, velocity, (len+1)*delay);	    	
 	MIDI.noteOff(channel, nota+12, (len+3)*delay);
 }
 setTimeout(function(){GAITA.sounding=false;},(len+3)*delay*1000);
}


function playSound( noteList, channel ) {

  var delay = gIntervalo/1000; 
  var velocity = 127; // how hard the note hits

  MIDI.setVolume(channel, 127);

  for (i=0; i < noteList[1].length; i++) {
    if (noteList[0] == c_close) {
      nota   = GAITA.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaClose;
    } else {
      nota   = GAITA.keyboard[noteList[1][i][0]][noteList[1][i][1]].notaOpen;
    }
    if( nota.isChord ) {
      generateAndPlayChord(nota, channel);
    } else {
      MIDI.noteOn(channel, nota.value + gCurrentToneOffset, velocity, 0);	    	
      MIDI.noteOff(channel, nota.value + gCurrentToneOffset, delay);
      MIDI.noteOn(channel, nota.value + gCurrentToneOffset +12, velocity, 0);	    	
      MIDI.noteOff(channel, nota.value + gCurrentToneOffset +12, delay);
    }
  }
}

function generateAndPlayChord( chord, channel ) {
  /* 
     formação de acordes:
        acorde maior   0, 4, 7
        acorde menor   0, 3, 7
        acorde setima  0, 4, 7, 10
        acorde menor setima   0, 3, 7, 10
  */

  var delay = gIntervalo/1000; 
  var velocity = 127; // how hard the note hits

  MIDI.setVolume(channel, 127);
  MIDI.noteOn(channel, nota.value + gCurrentToneOffset, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset, delay);
  MIDI.noteOn(channel, nota.value + gCurrentToneOffset+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset+12, delay);

  d = chord.isMenor ? 3 : 4;
 
  MIDI.noteOn(channel, nota.value + gCurrentToneOffset+d, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset+d, delay);
  MIDI.noteOn(channel, nota.value + gCurrentToneOffset+d+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset+d+12, delay);

  MIDI.noteOn(channel, nota.value + gCurrentToneOffset+7, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset+7, delay);
  MIDI.noteOn(channel, nota.value + gCurrentToneOffset+7+12, velocity, 0);	    	
  MIDI.noteOff(channel, nota.value + gCurrentToneOffset+7+12, delay);

  if( chord.isSetima ) {
      MIDI.noteOn(0, nota.value + gCurrentToneOffset+10, velocity, 0);	    	
      MIDI.noteOff(0, nota.value + gCurrentToneOffset+10, delay);
      MIDI.noteOn(0, nota.value + gCurrentToneOffset+10+12, velocity, 0);	    	
      MIDI.noteOff(0, nota.value + gCurrentToneOffset+10+12, delay);
  }

}

function playEscala(nEscala, intervalo, ascendente, loop ) {

  stopPlaying();

  gIntervalo = intervalo;
  nNotaInicial = 0;
  incremento = 1;
  notaFinal =  GAITA.gaitas[GAITA.selected][c_escalas][nEscala][c_notas].length;

  if( ! ascendente ) {
    nNotaInicial = notaFinal-1;
    incremento = -1;
    notaFinal = -1 
  } 

  setNotes(nEscala, nNotaInicial);

  (function doPlay(nNota) {
    gTimeout=setTimeout(function() {
      if (nNota != notaFinal ) {
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

}

function setNotes(scale_no, note_no) {

  //destaca notas da escala selecionada e toca o som correspondente
  noteList = GAITA.gaitas[GAITA.selected][c_escalas][scale_no][c_notas][note_no];

  clearKeyboard();

  if (noteList[0] == c_close) {
    markButton = markButtonClose;
  } else {
    markButton = markButtonOpen;
  }

  for (i=0; i < noteList[1].length; i++) {
    markButton(noteList[1][i][0], noteList[1][i][1]);
  }

  document.getElementById( 'scale_' + scale_no + '_' + note_no ).style.setProperty('background-color', 'gray', 'important');
  setModifiedItem( 'scale_' + scale_no + '_' + note_no );
  gLayer.draw();

  if (checkboxAcordeon.checked) playSound(noteList, 0);
  if (checkboxPiano.checked) playSound(noteList, 1);

}

function setAcorde(chord_no, var_no) {
  
  //destaca notas do acorde selecionado e toca o som correspondente
  if( GAITA.sounding ) return;

  aChords = GAITA.gaitas[GAITA.selected][c_acordes];
  noteList = aChords[chord_no][c_variations][var_no];
  GAITA.selectedChord = chord_no;

  clearKeyboard();

  nota = transporta(parseNote( aChords[GAITA.selectedChord][0] ) );
  acorde_lbl =  nota.key + '<sub>' + nota.complement + '</sub>';
  substituiHTML( 'acordeAtualFoleAbrindo', '&nbsp;', acorde_lbl  );
  substituiHTML( 'acordeAtualFoleFechando', '&nbsp;', acorde_lbl );

  if (noteList[0] == c_close) {
    $('#acordeAtualVazio').hide();
    $('#acordeAtualFoleAbrindo').hide();
    $('#acordeAtualFoleFechando').show();
    markButton = markButtonClose;
  } else {
    $('#acordeAtualVazio').hide();
    $('#acordeAtualFoleFechando').hide();
    $('#acordeAtualFoleAbrindo').show();
    markButton = markButtonOpen;
  }

  for (i=0; i < noteList[1].length; i++) {
    markButton(noteList[1][i][0], noteList[1][i][1]);
  }
   
  document.getElementById( 'chord_' + chord_no + '_' + var_no ).style.setProperty('background-color', 'gray', 'important');
  setModifiedItem( 'chord_' + chord_no + '_' + var_no );

  gLayer.draw();

  if (checkboxAcordeon.checked) playAcorde(noteList, 0);
  if (checkboxPiano.checked) playAcorde(noteList, 1);

}


function carregaListaGaitas() {
  for (var c=0; c < GAITA.gaitas.length; c++) {
    $('#opcoes_gaita').append('<li><a href="#" id="pop_gaita_'+ c +'" onclick="setupGaita('+ c +')">' + GAITA.gaitas[c][c_nome] + '</a></li>');
  }
}

function carregaListaAfinacoesComuns() {
  for (var c=0; c < GAITA.afinacoesComuns.length; c++) {
    $('#opcoes_afinacao').append('<li><a href="#" id="pop_tone_'+ c +'" onclick="set_pop_tone('+ parseNote(GAITA.afinacoesComuns[c][0]).value +')">' + geraLabelListaAfinacao( GAITA.afinacoesComuns[c] ) + '</a></li>' );
  }
}

function carregaTabelaAcordes() {
  aChords = GAITA.gaitas[GAITA.selected][c_acordes];
  chord_str = '<tr><td><strong>Acorde</strong></td><td><strong>Variação</strong></td></tr>';

  for (var c=0; c < aChords.length; c++) {
	nome = parseNote(aChords[c][c_symbol]);
    chord_str +=  '<tr><td id="chord_'+ c +'">' + nome.key + '<sub>' + nome.complement + '</sub>' + '</td><td>';
    for (var v=0; v < aChords[c][c_variations].length; v++) {
      opening = aChords[c][c_variations][v][0] == c_open;
      chord_str += '<button id="chord_'+ c +'_'+ v +'" class="btn btn-';
      chord_str += opening ? 'success"' : 'warning"';
      chord_str += ' title="' + (opening ? 'Abrindo o fole' : 'Fechando o fole') + '"';
      chord_str += ' onclick="setAcorde(' + c + ',' + v + ')" ';  
      chord_str += ' onmouseover="setAcorde(' + c + ',' + v + ')" > ' + (v + 1) ;
      chord_str += ' <i class="' + (opening ? 'icon-resize-full' : 'icon-resize-small' ) + ' icon-white"></i>';
      chord_str += " </button> ";
    }
    chord_str += '</td></tr>';
  }
  document.getElementById("chords_table").innerHTML = chord_str;
}

function carregaTabelaEscalas() {
  aScales = GAITA.gaitas[GAITA.selected][c_escalas];

  scale_str = '<tr><td><strong>Escala</strong></td><td><strong>Notas</strong></td></tr>';

  for (var c=0; c < aScales.length; c++) {
	nome = parseNote(aScales[c][c_symbol]);
    scale_str += 
         '<tr><td id="scale_'+ c +'">'+  nome.key + '<i>' + nome.complement + '</i>'
      +  '<br>' 
      +  '<button id="backward_'+ c +'" class="btn btn-warning" title="Escala Descendente" onclick="playEscala('+ c +', '+gIntervalo+', false, true);"><i class="icon-backward icon-white"></i></button>'
      +  '<button id="pause_'+ c +'" class="btn btn-warning" title="Para a execução" onclick="stopPlaying();"><i class="icon-stop icon-white"></i></button>'
      +  '<button id="forward_'+ c +'" class="btn btn-warning" title="Escala Ascendente" onclick="playEscala('+ c +', '+gIntervalo+', true, true);"><i class="icon-forward icon-white"></i></button>'
      +  '&nbsp;'
      +  '<button id="fbackward_'+ c +'" class="btn btn-success" title="Diminui a velocidade" onclick="gIntervalo *= 2;"><i class="icon-minus-sign icon-white"></i></button>'
      +  '<button id="fforward_'+ c +'" class="btn btn-success" title="Aumenta Velocidade" onclick="gIntervalo /= 2;"><i class="icon-plus-sign icon-white"></i></button>'
      +  '</td><td>';
    
    for (var v=0; v < aScales[c][c_notas].length; v++) {
       opening = aScales[c][c_notas][v][0] == c_open;
       aNotes = aScales[c][c_notas][v][1];
       labelNotas = '';
       for( var n=aNotes.length-1; n > 0;  n-- ) {
		 botao = GAITA.keyboard[aNotes[n][0]][aNotes[n][1]];
         labelNotas = '/' + (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
       }   
       botao = GAITA.keyboard[aNotes[0][0]][aNotes[0][1]];
       labelNotas = (opening ? botao.notaOpen.key +'<i>'+ botao.notaOpen.complement+'</i>' : botao.notaClose.key+'<i>'+ botao.notaClose.complement+'</i>') + labelNotas;
       scale_str += '<button id="scale_'+ c +'_'+ v +'" class="btn btn-';                    
       scale_str += opening ? 'success"' : 'warning"';
       scale_str += ' title="';
       scale_str += opening ? 'Abrindo o fole' : 'Fechando o fole';
       scale_str += '" onmouseover="setNotes(' + c +',' + v + ')" > ' + labelNotas ;
       scale_str += '<br><i class="';
       scale_str += opening ? 'icon-resize-full' : 'icon-resize-small';
       scale_str += ' icon-white"></i>';
       scale_str += " </button> ";
    }

    scale_str += '</td></tr>';

  }
  document.getElementById("scales_table").innerHTML = scale_str;
}
