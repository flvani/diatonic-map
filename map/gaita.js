if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

DIATONIC.map.Gaita = function(map) {
    
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
    this.sounding = false;
    
    this.player = new DIATONIC.play.Player(this.map);

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

DIATONIC.map.Gaita.prototype.setup = function(div) {

  var nHeight,nWidth,bassX,trebleX,bassY,trebleY,xi,yi,xxi,yyi;

  // configura e mostra a gaita inicial
  var gaita = this.accordions[this.selected];
  var nIlheiras = gaita.getNumKeysRows();
  var nIlheirasBaixo = gaita.getNumBassesRows();
  
  this.map.reset();
   
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
 
  var nTotIlheiras = nIlheiras+nIlheirasBaixo+2;

  if( bHorizontal ) {
    nHeight = nTotIlheiras*(this.BTNSIZE+this.BTNSPACE);
    nWidth  = (maiorIlheira+1) *this.BTNSIZE + (maiorIlheira+2) * this.BTNSPACE;
    bassX   = this.BTNSPACE*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(this.BTNSIZE+this.BTNSPACE);
    trebleX = this.BTNSPACE*4;
    xi = bassX -1.5 * (this.BTNSIZE+this.BTNSPACE); 
    if( bEspelho ) {
       yi = this.BTNSPACE + (nTotIlheiras-1.5) * (this.BTNSIZE+this.BTNSPACE);  
    }else {
       yi = this.BTNSPACE + (1.5) * (this.BTNSIZE+this.BTNSPACE);  
    }
  } else {
     nWidth  = nTotIlheiras*(this.BTNSIZE+this.BTNSPACE);
     nHeight = (maiorIlheira+1) *this.BTNSIZE + (maiorIlheira+2) * this.BTNSPACE;
     bassY   = this.BTNSPACE*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(this.BTNSIZE+this.BTNSPACE);
     trebleY = this.BTNSPACE*4;
     yi = bassY -1.5 * (this.BTNSIZE+this.BTNSPACE); 
    
    if( bEspelho ) {
           xi = this.BTNSPACE + (1.5) * (this.BTNSIZE+this.BTNSPACE) ; 
    }else {
           xi = this.BTNSPACE + (nTotIlheiras-1.5) * (this.BTNSIZE+this.BTNSPACE) ; 
    }
  }

  this.map.defineStage(nHeight, nWidth, div);

  { // desenhar o botão com a legenda abre/fecha
    var circle = new Kinetic.Circle({
      x: xi,
      y: yi,
      radius: this.BTNSIZE / 1.5,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      id: 'b_help'
    });

    var circlePos = circle.getPosition();
    var Dy = (this.BTNSIZE/2 - this.FONTSIZE) / 2;

    var line = new Kinetic.Line({
      points: [circlePos.x-(this.BTNSIZE/1.5), circlePos.y+5,circlePos.x+(this.BTNSIZE/1.5), circlePos.y-4],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    });

    var textoOpen  = this.map.createKinectText( 'abre ', 0, 100, DIATONIC.open, circlePos.x+2, circlePos.y + Dy );
    var textoClose = this.map.createKinectText( 'fecha ', 0, 100, DIATONIC.close, circlePos.x+2, circlePos.y - this.FONTSIZE - Dy );

    this.map.add(circle);
    this.map.add(line);
    this.map.add(textoOpen.key);
    this.map.add(textoClose.key);
  }

  for (var j=0; j<this.keyboard.length; j++) {

    if( bHorizontal ) {
      if( bEspelho ) {
        if( j < nIlheiras ) {
           xi = trebleX + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
           yi = this.BTNSPACE + (j+1) * (this.BTNSIZE+this.BTNSPACE); 
        }else {
           xi = bassX + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
           yi = this.BTNSPACE + (j+2) * (this.BTNSIZE+this.BTNSPACE);  
        }
      } else { 
        if( j < nIlheiras ) {
           xi = trebleX + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
           yi = this.BTNSPACE + (nTotIlheiras-j-1) * (this.BTNSIZE+this.BTNSPACE); 
        }else {
           xi = bassX + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
           yi = this.BTNSPACE + (nTotIlheiras-j-2) * (this.BTNSIZE+this.BTNSPACE);  
        }
      }
    } else {
      if( bEspelho ) {
        if( j < nIlheiras ) {
           xi = this.BTNSPACE + (nTotIlheiras-j-1) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = trebleY + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
        }else {
           xi = this.BTNSPACE + (nTotIlheiras-j-2) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = bassY + 0.5 * (this.BTNSIZE+this.BTNSPACE); 
        }
       } else {
        if( j < nIlheiras ) {
           xi = this.BTNSPACE + (j+1) * (this.BTNSIZE+this.BTNSPACE) ; 
           yi = trebleY + (gaita.getKeysLayout(j)+0.5) * (this.BTNSIZE+this.BTNSPACE);
        }else {
           xi = this.BTNSPACE + (j+2) * (this.BTNSIZE+this.BTNSPACE) ; 
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
      var isPedal = gaita.isPedal( i, j );
      var circle = new Kinetic.Circle({
        x: xxi,
        y: yyi,
        radius: this.BTNSIZE / 2,
        fill: 'white',
        stroke: (isPedal ? 'red' : 'black' ),
        strokeWidth: (isPedal ? 2 : 1 ),
        id: 'b_'+ j +'_' + i
      });

      circlePos = circle.getPosition();
      Dy = (this.BTNSIZE/2 - this.FONTSIZE) / 2;

      var line = new Kinetic.Line({
        points: [circlePos.x-(this.BTNSIZE/2), circlePos.y+5,circlePos.x+(this.BTNSIZE/2), circlePos.y-4],
        stroke: (isPedal ? 'red' : 'black' ),
        strokeWidth: (isPedal ? 2 : 1 ),
        lineCap: 'round',
        lineJoin: 'round'
      });

      this.keyboard[j][i] = {};
      this.keyboard[j][i].btn = circle;
 
      if(j<nIlheiras) {
        this.keyboard[j][i].notaOpen  = this.parseNote( openKeysRow[i], false );
        this.keyboard[j][i].notaClose = this.parseNote( closeKeysRow[i], false );
      } else {
        this.keyboard[j][i].notaOpen  = this.parseNote( openBassRow[i], true );
        this.keyboard[j][i].notaClose = this.parseNote( closeBassRow[i], true );
      }

      this.keyboard[j][i].notaOpen.labels  = this.map.createKinectText( '', j, i, DIATONIC.open, circlePos.x, circlePos.y + Dy );
      this.keyboard[j][i].notaClose.labels = this.map.createKinectText( '', j, i, DIATONIC.close, circlePos.x, circlePos.y - this.FONTSIZE - Dy );

      this.minNoteInUse = Math.min( this.keyboard[j][i].notaOpen.value, this.minNoteInUse );
      this.minNoteInUse = Math.min( this.keyboard[j][i].notaClose.value, this.minNoteInUse );
      this.maxNoteInUse = Math.max( this.keyboard[j][i].notaOpen.value+12, this.maxNoteInUse );
      this.maxNoteInUse = Math.max( this.keyboard[j][i].notaClose.value+12, this.maxNoteInUse );

      if (typeof (this.keyboard[j][i].notaClose.key) === "undefined" ) alert( j + ' ' + i );
      setButtonText( this.keyboard[j][i] );

      this.map.add(circle);
      this.map.add(line);

      this.map.add(this.keyboard[j][i].notaOpen.labels.key);
      this.map.add(this.keyboard[j][i].notaOpen.labels.compl);
      this.map.add(this.keyboard[j][i].notaOpen.labels.octave);
      this.map.add(this.keyboard[j][i].notaClose.labels.key);
      this.map.add(this.keyboard[j][i].notaClose.labels.compl);
      this.map.add(this.keyboard[j][i].notaClose.labels.octave);

    } 
  }
  

  this.map.setGaitaName( gaita );
  this.map.setGaitaImage( gaita );

  this.map.mostraAfinacao();

 this.carregaTabelaAcordes(this.map);
 
 this.renderTune("Maitia, nun zira?", {}, "songDiv", "tabSongs" );
 //this.renderTune("Teste", {}, "songDiv", "tabSongs"  );
 
 this.map.draw();
  
};

DIATONIC.map.Gaita.prototype.parseNote = function(p_nota, isBass) {

  var nota = {};

  nota.key        = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( 0, p_nota.indexOf( ":" ) ) : p_nota ;
  nota.complement = p_nota.indexOf( ":" ) > 0 ? p_nota.substr( p_nota.indexOf( ":" )+1, p_nota.length - p_nota.indexOf( ":" ) ) : '';
  nota.octave     = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.charAt(nota.key.length-1) : 4;
  nota.key        = parseInt(nota.key.charAt(nota.key.length-1)) ? nota.key.substr( 0, nota.key.length-1 ) : nota.key;
  nota.value      =  this.keyToNote[ nota.key.toUpperCase() + nota.octave ];

  if (typeof (nota.value) === "undefined" ) alert( 'Nota inválida: ' + p_nota );

  nota.isChord    = ( p_nota.charAt(0) === p_nota.charAt(0).toLowerCase() );
  nota.isBass     = isBass;
  nota.isMenor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;
  nota.labels     = {};

  return nota;
};

DIATONIC.map.Gaita.prototype.carregaTabelaAcordes = function(map) {
  var accordion = this.accordions[this.selected];
  var chord_str = '<tr><td><strong>Acorde</strong></td><td><strong>Variação</strong></td></tr>';

  for (var c=0; c < accordion.getChords().length; c++) {
      var nome = this.parseNote(accordion.getChordSymbol(c));
      chord_str +=  '<tr><td id="chord_'+ c +'">' + nome.key + '<sub>' + nome.complement + '</sub>' + '</td><td>';
      var variations = accordion.getChordVariations(c);
    for (var v=0; v < variations.length; v++) {
      var opening = variations[v][0] === DIATONIC.open;
      chord_str += '<button id="chord_'+ c +'_'+ v +'" class="btn btn-';
      chord_str += opening ? 'success"' : 'warning"';
      chord_str += ' title="' + (opening ? 'Abrindo o fole' : 'Fechando o fole') + '"';
      chord_str += ' onclick="myMap.gaita.setAcorde(' + c + ',' + v + ')" ';  
      chord_str += ' onmouseover="myMap.gaita.setAcorde(' + c + ',' + v + ')" > ' + (v + 1) ;
      chord_str += ' <i class="' + (opening ? 'icon-resize-full' : 'icon-resize-small' ) + ' icon-white"></i>';
      chord_str += " </button> ";
    }
    chord_str += '</td></tr>';
  }
  document.getElementById("chords_table").innerHTML = chord_str;
};

DIATONIC.map.Gaita.prototype.setAcorde = function(chord_no, var_no) {
  
  //destaca notas do acorde selecionado e toca o som correspondente
  var accordion = this.accordions[this.selected];
  if( this.sounding ) return;

  var chord = accordion.getChords()[chord_no];
  var noteList = accordion.getChordVariations(chord_no)[var_no];
  this.selectedChord = chord_no;

  this.clearKeyboard();

  var nota = this.map.transporta( this.parseNote( chord[0] ) );
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
   
  document.getElementById( 'chord_' + chord_no + '_' + var_no ).style.setProperty('background-color', 'gray', 'important');
  this.modifiedItems.push( 'chord_' + chord_no + '_' + var_no );

  this.map.draw();

  if(this.player) {
    if (this.map.checkboxAcordeon.checked) this.player.playAcorde(noteList, 0);
    if (this.map.checkboxPiano.checked) this.player.playAcorde(noteList, 1);
  }
};

DIATONIC.map.Gaita.prototype.clearKeyboard = function() {

  for (var i=0; i < this.modifiedItems.length; i++) {
    var item = this.modifiedItems[i];
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

  this.map.draw();
  this.modifiedItems = new Array();
};

DIATONIC.map.Gaita.prototype.markButton = function(dir, row, button) {
    this.modifiedItems.push( this.keyboard[row][button] );
    if (dir === DIATONIC.close) {
        this.keyboard[row][button].btn.setFill('#f5b043'); // yellow
        this.keyboard[row][button].notaClose.labels.key.setFill('red');
        this.keyboard[row][button].notaClose.labels.compl.setFill('red');
        this.keyboard[row][button].notaClose.labels.octave.setFill('red');
        this.keyboard[row][button].notaOpen.labels.key.setFill('#f5b043');
        this.keyboard[row][button].notaOpen.labels.compl.setFill('#f5b043');
        this.keyboard[row][button].notaOpen.labels.octave.setFill('#f5b043');
    } else {
        this.keyboard[row][button].modified = true;
        this.keyboard[row][button].btn.setFill('#24e3be'); // ligthgreen
        this.keyboard[row][button].notaOpen.labels.key.setFill('red');
        this.keyboard[row][button].notaOpen.labels.compl.setFill('red');
        this.keyboard[row][button].notaOpen.labels.octave.setFill('red');
        this.keyboard[row][button].notaClose.labels.key.setFill('#24e3be');
        this.keyboard[row][button].notaClose.labels.compl.setFill('#24e3be');
        this.keyboard[row][button].notaClose.labels.octave.setFill('#24e3be');
    }
};


DIATONIC.map.Gaita.prototype.renderTune = function(title, params, div, containerDiv ) {
  debug = false;
  var accordion = this.accordions[this.selected];
  var accordionTab = new window.ABCJS.tablature.Accordion();
  var abcParser = new window.ABCJS.parse.Parse(null, accordionTab);
  var vdiv = document.getElementById(div);
  var vContainerDiv = document.getElementById(containerDiv);
  abcParser.parse(accordion.getSong(title), params); //TODO handle multiple tunes
  var tune = abcParser.getTune();
  vdiv.innerHTML = "";
  vdiv.innerTEXT = "";
  vdiv.style.display = "inline";
  if(vContainerDiv) vContainerDiv.style.display = "inline";
  var paper = Raphael(div, 700, 400);
  var printer = new ABCJS.write.Printer(paper, {}, accordionTab );// TODO: handle printer params
  printer.printABC(tune);
  if(vContainerDiv) vContainerDiv.style.display = "none";
};
