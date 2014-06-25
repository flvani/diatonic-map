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
     BTNSIZE: 52
    ,BTNRADIUS: 26
    ,BTNSPACE: 3
    ,FONTSIZE: 18 // razoavel ser menor que metade do btnSize
};

DIATONIC.map.Map = function( interfaceParams, accordionParams, editorParams ) {

    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE; 

    this.gTimeout;
    this.toneOffSet = 0;
    this.gIntervalo = 256;
    this.gShowLabel = false;
    
    this.editor =  new ABCJS.Editor(
                         editorParams.textArea
                      ,{
                         canvas_id: editorParams.canvas_id
                        ,refreshController_id: editorParams.refreshController_id
                        ,accordionSelector_id: editorParams.accordionSelector_id
                        ,keySelector_id: editorParams.keySelector_id
                        ,warnings_id: editorParams.warnings_id
                        //,midi_id: "midi"
                        //,midi_options: {program: 21, qpm: 150, type: "qt"}
                        //,render_options: {}
                        //,gui: false
                      });
    
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    this.tuneContainerDiv = document.getElementById(interfaceParams.tuneContainerDiv);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);


    this.midiParser = new DIATONIC.midi.Parse(this);
    this.midiPlayer = new DIATONIC.midi.Player(this, accordionParams.playButton);
  
    this.gaita = new DIATONIC.map.Gaita(this, accordionParams);
    
    //criar impressoras e folhas de papel para cada aba    

    DR_register( this );
    DR_register( this.gaita );

    var that = this;
    
    this.checkboxHorizontal.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );
    
};

DIATONIC.map.Map.prototype.translate = function() {
  document.getElementById("editorBtn").innerHTML = DR.resource["editorBtn"][DR.language];
  document.getElementById("didaticoBtn").innerHTML = DR.resource["didaticoBtn"][DR.language];
  
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

DIATONIC.map.Map.prototype.setGaitaImage = function(gaita) {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+gaita.getPathToImage()
          +'" alt="'+gaita.getName()+'" style="height:200px; width:200px;" />';
};

DIATONIC.map.Map.prototype.setGaitaName = function(gaita) {
  this.gaitaNamePlaceHolder.innerHTML = gaita.getName() + " - " + this.getTxtAfinacao();
};

DIATONIC.map.Map.prototype.getTxtAfinacao = function() {
  var v_afinacao = this.gaita.accordions[this.gaita.selected].getAfinacao();
  var str_label = '';
  for (var c = v_afinacao.length-1; c > 0 ; c--) {
    str_label = '/' + this.gaita.parseNote( v_afinacao[c] ).key + str_label;
  }
  return this.gaita.parseNote( v_afinacao[0] ).key + str_label;
};

DIATONIC.map.Map.prototype.stopRenderedSong = function() {
    this.midiPlayer.stopPlay();
};

DIATONIC.map.Map.prototype.playRenderedSong = function() {
  if( this.midiPlayer.playing ) {
    this.midiPlayer.pausePlay();
   } else {
     this.gaita.clearKeyboard();
     this.midiPlayer.startPlay(this.gaita.tuneMidi, this.midiParser.tempo);
   } 
};

DIATONIC.map.Map.prototype.didaticPlayRenderedSong = function() {
  this.gaita.clearKeyboard();
  this.midiPlayer.startDebugPlay(this.gaita.tuneMidi, this.midiParser.tempo);
};

