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

    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi

    this.midiParser = new DIATONIC.midi.Parse(this);
    this.midiPlayer = new DIATONIC.midi.Player(this, accordionParams.playButton);
    
  
    this.gaita = new DIATONIC.map.Gaita(this, accordionParams);
    
    DR.register( this );
    DR.register( this.gaita );

    var that = this;
    
    this.checkboxHorizontal.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
       that.gaita.setupKeyboard();
    }, false );
    
};

DIATONIC.map.Map.prototype.translate = function() {
  document.getElementById("toolsBtn").innerHTML = '<i class="icon-wrench"></i>&nbsp;'+DR.resource["toolsBtn"][DR.language];
  document.getElementById("octaveUpBtn").title = DR.resource["DR_octave"][DR.language];
  document.getElementById("octaveUpBtn").innerHTML = '<i class="icon-arrow-up"></i>&nbsp;'+DR.resource["DR_octave"][DR.language];
  document.getElementById("octaveDwBtn").title = DR.resource["DR_octave"][DR.language];
  document.getElementById("octaveDwBtn").innerHTML = '<i class="icon-arrow-down"></i>&nbsp;'+DR.resource["DR_octave"][DR.language];
  document.getElementById("pdfBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.resource["pdfBtn"][DR.language];
  document.getElementById("printBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.resource["printBtn"][DR.language];
  document.getElementById("printPreviewBtn").innerHTML = DR.resource["printPreviewBtn"][DR.language];
  document.getElementById("saveBtn").innerHTML = DR.resource["saveBtn"][DR.language];
  document.getElementById("closeBtn").innerHTML = DR.resource["closeBtn"][DR.language];
  document.getElementById("forceRefresh").innerHTML = DR.resource["forceRefresh"][DR.language];
  document.getElementById("DR_message").alt = DR.resource["DR_message"][DR.language];
  document.getElementById("gotoMeasureBtn").value = DR.resource["DR_goto"][DR.language];
  document.getElementById("modeBtn").title = DR.resource[this.currentMode === "normal"?"modeBtn":"DR_didactic"][DR.language];
  
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

DIATONIC.map.Map.prototype.salvaMusica = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var name = this.editor.tunes[0].metaText.title + ".abcx";
        var conteudo = this.editor.editarea.getString();
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.resource["DR_err_saving"][DR.language]);
    }    
};

DIATONIC.map.Map.prototype.salvaRepertorio = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var accordion = this.gaita.getSelectedAccordion();
        var name = accordion.name + ".abcx";
        var conteudo = "";
        for( var title in accordion.songs) {
          conteudo += accordion.songs[title] + '\n\n';
        }
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.resource["DR_err_saving"][DR.language]);
    }    
    
};

DIATONIC.map.Map.prototype.carregaRepertorio = function(original, files) {
    var that = this;
    var accordion = that.gaita.getSelectedAccordion();
    if (original) {
        accordion.loadSongs( function() {  // devido à falta de sincronismo, preciso usar o call back;
            var songTitle = accordion.getFirstSong();
            that.gaita.loadSongList(songTitle);
            that.gaita.renderTune( songTitle, {}, true );
            
        });
    } else {
        accordion.songs = {};
        for (var s = 0; s < files.length; s++) {
            var tunebook = new ABCJS.TuneBook(files[s].content);
            for (var t = 0; t < tunebook.tunes.length; t++) {
                accordion.songs[tunebook.tunes[t].title] = tunebook.tunes[t].abc;

            }
        }
        var songTitle = accordion.getFirstSong();
        that.gaita.loadSongList(songTitle);
        that.gaita.renderTune( songTitle, {}, true );
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
    if (this.midiPlayer.playing) {
        this.midiPlayer.pausePlay();
    } else {
        this.gaita.clearKeyboard();
        var midi;
        switch (myMap.currentTab) {
            case "tabTunes":
                midi = this.gaita.midiTune;
                break;
            case "tabChords":
                midi = this.gaita.midiChord;
                break;
            case "tabPractices":
                midi = this.gaita.midiPractice;
                break;
        }

        this.midiPlayer.startPlay(midi);
    }
};

DIATONIC.map.Map.prototype.didacticPlayRenderedSong = function(type, value) {
    this.gaita.clearKeyboard();
    var midi;
    switch (myMap.currentTab) {
        case "tabTunes":
            midi = this.gaita.midiTune;
            break;
        case "tabChords":
            midi = this.gaita.midiChord;
            break;
        case "tabPractices":
            midi = this.gaita.midiPractice;
            break;
    }
    this.midiPlayer.startDidacticPlay(midi, type, value);

    //this.midiPlayer.startDebugPlay(midi,type);
};

