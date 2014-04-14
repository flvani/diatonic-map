/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

DIATONIC.map.Units = {
    // aspectos do botão
     BTNSIZE: 56
    ,BTNSPACE: 3
    ,FONTSIZE: 18 // razoavel ser menor que metade do btnSize
};

DIATONIC.map.Map = function( interfaceParams ) {

    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE; 

    this.gTimeout;
    this.gIntervalo = 256;
    this.gShowLabel = false;
    this.gCurrentToneOffset = 0;
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);
    this.afinacoesComuns = [["C", "F"], ["G", "C"], ["A", "D"], ["A", "D", "G"]];

    this.gaita = new DIATONIC.map.Gaita(this, interfaceParams.accordionParams);

    this.gStage;
    this.gLayer;
    
    var that = this;
    
    this.checkboxHorizontal.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );
    
};

DIATONIC.map.Map.prototype.resetLayer = function() {
  this.gLayer = new Kinetic.Layer();
};
  
DIATONIC.map.Map.prototype.isHorizontal = function() {
    return this.checkboxHorizontal.checked;
};

DIATONIC.map.Map.prototype.isMirror = function() {
    return this.checkboxEspelho.checked;
};

DIATONIC.map.Map.prototype.carregaListaGaitas  = function() {
  for (var c=0; c < this.gaita.accordions.length; c++) {
    $('#opcoes_gaita').append('<li><a href="#" id="pop_gaita_'+ c 
            +'" onclick="setupGaita(\''+ this.gaita.accordions[c].getId() +'\')">' + this.gaita.accordions[c].getName() 
            + '</a></li>');
  }
};

DIATONIC.map.Map.prototype.carregaListaAfinacoesComuns = function() {
  for (var c=0; c < this.afinacoesComuns.length; c++) {
    $('#opcoes_afinacao').append('<li><a href="#" id="pop_tone_'+ c 
            +'" onclick="set_pop_tone('+ this.gaita.parseNote(this.afinacoesComuns[c][0]).value +')">' 
            + this.geraLabelListaAfinacao( this.afinacoesComuns[c] ) + '</a></li>' );
  }
};

DIATONIC.map.Map.prototype.geraLabelListaAfinacao = function(v_afinacao) {
  var str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + this.transporta( this.gaita.parseNote(v_afinacao[c] ) ).key + str_label;
  }
  return this.transporta( this.gaita.parseNote( v_afinacao[0] ) ).key + str_label;
};

DIATONIC.map.Map.prototype.setGaitaName = function(gaita) {
  this.gaitaNamePlaceHolder.innerHTML = gaita.getName();
};  

DIATONIC.map.Map.prototype.setGaitaImage = function(gaita) {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+gaita.getPathToImage()
          +'" alt="'+gaita.getName()+'" style="height:220px; width:220px;" />';
};

DIATONIC.map.Map.prototype.transporta = function(nota) {

  var note = (nota.value + this.gCurrentToneOffset) % 12;

  nota.octave = (nota.value + this.gCurrentToneOffset - 12) / 12 >> 0;
  nota.key    = this.gShowLabel ? this.gaita.number2key_br[note] : this.gaita.number2key[note];
  if( nota.isChord )  {
    nota.key = this.gaita.number2key_br[note].toLowerCase();
  }

  return nota;
};

DIATONIC.map.Map.prototype.mostraAfinacao = function() {
  var v_afinacao = this.gaita.accordions[this.gaita.selected].getAfinacao();
  var str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + this.transporta( this.gaita.parseNote( v_afinacao[c] ) ).key + str_label;
  }
  $('#afinacao').text( this.transporta( this.gaita.parseNote( v_afinacao[0] ) ).key + str_label );
};


DIATONIC.map.Map.prototype.set_pop_tone = function(tone) {
  var nota = this.gaita.parseNote( this.gaita.getSelectedAccordion().getAfinacao() );
  var afinacao = nota.value;
  this.gCurrentToneOffset = tone - afinacao;
  this.gaita.redrawKeyboard();
};

DIATONIC.map.Map.prototype.defineStage = function( h, w, div )  {
  this.gStage = new Kinetic.Stage({ container: div, height: h, width: w });
  this.gStage.add(this.gLayer);
};
  
DIATONIC.map.Map.prototype.draw = function() {
  this.gStage.batchDraw();
};

DIATONIC.map.Map.prototype.add = function( kinItem ) {
  this.gLayer.add(kinItem);
}; 
  
DIATONIC.map.Map.prototype.createKinectText= function( p_texto_inicial, param_row, param_column, param_open_close, param_x, param_y)  {

  labels = {};

  labels.key = new Kinetic.Text({
    x: param_x - (this.BTNSIZE * 0.5),
    y: param_y - 1,
    text: p_texto_inicial, fontSize: this.FONTSIZE, fontFamily: 'Arial',
    id: 'l_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: this.BTNSIZE, align: 'center'
  });

  labels.compl = new Kinetic.Text({
    x: param_x - (this.BTNSIZE * 0.5),
    y: param_y + 2,
    text: p_texto_inicial, fontSize: this.FONTSIZE-4, fontFamily: 'Arial', fontStyle: 'italic',
    id: 'l_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: this.BTNSIZE, align: 'center'
  });

  labels.octave = new Kinetic.Text({
    x: param_x - (this.BTNSIZE * 0.5),
    y: param_y + 8,
    text: "", fontSize: this.FONTSIZE-8, fontFamily: 'Arial',
    id: 'l8_' + param_row + '_' + param_column + '_' + param_open_close,
    fill: 'black', width: this.BTNSIZE, align: 'center'
  });

  return labels;
};

DIATONIC.map.Map.prototype.setButtonText = function (p_button) {
   this.transporta( p_button.notaOpen );
   this.transporta( p_button.notaClose );

   p_button.notaOpen.labels.key.setText( p_button.notaOpen.key  );
   p_button.notaOpen.labels.compl.setText( p_button.notaOpen.complement );
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
