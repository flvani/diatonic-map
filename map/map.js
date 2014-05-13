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
    ,BTNRADIUS: 28
    ,BTNSPACE: 3
    ,FONTSIZE: 18 // razoavel ser menor que metade do btnSize
};

DIATONIC.map.Map = function( interfaceParams ) {

    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE; 

    this.gTimeout;
    this.toneOffSet = 0;
    this.gIntervalo = 256;
    this.gShowLabel = false;
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);
    this.afinacoesComuns = [["C", "F"], ["G", "C"], ["A", "D"], ["A", "D", "G"]];

    this.gaita = new DIATONIC.map.Gaita(this, interfaceParams.accordionParams);

    var that = this;
    
    this.checkboxHorizontal.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );
    
};

DIATONIC.map.Map.prototype.isHorizontal = function() {
    return this.checkboxHorizontal.checked;
};

DIATONIC.map.Map.prototype.isMirror = function() {
    return this.checkboxEspelho.checked;
};


DIATONIC.map.Map.prototype.definePaper = function( div, w, h )  {
  if(this.paper) {
      this.paper.clear();
      this.paper.setSize(w,h);
  } else {
     this.paper = Raphael(div, w, h );
  }  
  return this.paper;
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
    str_label = '/' + this.gaita.parseNote(v_afinacao[c]  ).key + str_label;
  }
  return this.gaita.parseNote( v_afinacao[0] ).key + str_label;
};

DIATONIC.map.Map.prototype.setGaitaName = function(gaita) {
  this.gaitaNamePlaceHolder.innerHTML = gaita.getName();
};  

DIATONIC.map.Map.prototype.setGaitaImage = function(gaita) {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+gaita.getPathToImage()
          +'" alt="'+gaita.getName()+'" style="height:220px; width:220px;" />';
};

DIATONIC.map.Map.prototype.mostraAfinacao = function() {
  var v_afinacao = this.gaita.accordions[this.gaita.selected].getAfinacao();
  var str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + this.gaita.parseNote( v_afinacao[c] ).key + str_label;
  }
  $('#afinacao').text( this.gaita.parseNote( v_afinacao[0] ).key + str_label );
};


DIATONIC.map.Map.prototype.set_pop_tone = function(tone) {
  var nota = this.gaita.parseNote( this.gaita.getSelectedAccordion().getAfinacao()[0] );
  var afinacao = nota.value;
  this.toneOffSet = tone - afinacao;
  this.gaita.redrawKeyboard();
};
