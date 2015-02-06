/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Units = {
    // aspectos do botão
     BTNSIZE: 52
    ,BTNRADIUS: 26
    ,BTNSPACE: 3
    ,FONTSIZE: 18 // razoavel ser menor que metade do btnSize
};

DIATONIC.map.Map = function( interfaceParams, accordionParams, editorParams, playerParams ) {

    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE; 

    var that = this;
    this.currentTab = '';
    this.currentMode = "normal";
    
    DR.register( this ); // register for translate
    
    this.gaita = new DIATONIC.map.Gaita(this, accordionParams);
    
    this.midiParser = new DIATONIC.midi.Parse(this.gaita);
    this.midiPlayer = new DIATONIC.midi.Player(this);
  
    
    this.editor =  new ABCXJS.Editor(
                         editorParams.textArea
                      ,{
                         canvas_id: editorParams.canvas_id
                        ,refreshController_id: editorParams.refreshController_id
                        ,accordionSelector_id: editorParams.accordionSelector_id
                        ,accordionMaps: this.gaita.accordions
                        ,keySelector_id: editorParams.keySelector_id
                        ,warnings_id: editorParams.warnings_id
                        //,midi_id: "midi"
                        //,midi_options: {program: 21, qpm: 150, type: "qt"}
                        //,render_options: {}
                        //,gui: false
                      });
    
    // screen control
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    this.tuneContainerDiv = document.getElementById(interfaceParams.tuneContainerDiv);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);

    // player control
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.gotoMeasureButton = document.getElementById(playerParams.gotoMeasureBtn);
    this.stepButton = document.getElementById(playerParams.stepBtn);
    this.stepMeasureButton = document.getElementById(playerParams.stepMeasureBtn);
    this.repeatButton = document.getElementById(playerParams.repeatBtn);
    this.clearButton = document.getElementById(playerParams.clearBtn);
    this.tempoButton = document.getElementById(playerParams.tempoBtn);

    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi

    this.checkboxHorizontal.addEventListener('click', function() {
        that.gaita.setupKeyboard();
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
        that.gaita.setupKeyboard();
    }, false );
    
    this.modeButton.addEventListener('click', function() {
        that.changePlayMode();
    }, false );
    
    this.playButton.addEventListener("click", function() {
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function() {
        that.midiPlayer.stopPlay();
    }, false);

    this.stepButton.addEventListener("click", function() {
        that.startPlay('note');
    }, false);

    this.stepMeasureButton.addEventListener("click", function() {
        that.startPlay('measure');
    }, false);

    this.repeatButton.addEventListener("click", function() {
        that.startPlay('repeat');
    }, false);

    this.clearButton.addEventListener("click", function() {
        that.midiPlayer.clearDidacticPlay();
    }, false);

    this.tempoButton.addEventListener("click", function() {
        that.midiPlayer.adjustAndamento();
    }, false);
    
    this.gotoMeasureButton.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
           that.startPlay('goto', this.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function() {
        if (that.gotoMeasureButton.value === DR.getResource("DR_goto")) {
           that.gotoMeasureButton.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function() {
        if (that.gotoMeasureButton.value === "") {
           that.gotoMeasureButton.value = DR.getResource("DR_goto");
        }
    }, false);
};

DIATONIC.map.Map.prototype.setScrolling = function(y, channel) {
    if( !this.tuneContainerDiv || channel > 0 ) return;
    if( y !== this.ypos ) {
        this.ypos = y;
        this.tuneContainerDiv.scrollTop = this.ypos - 40;    
    }
};

DIATONIC.map.Map.prototype.translate = function() {
    
  document.title = DR.getResource("DR_title");  
  
  document.getElementById("DR_description").setAttribute("content",DR.getResource("DR_description"));
  document.getElementById("toolsBtn").innerHTML = '<i class="icon-wrench"></i>&nbsp;'+DR.getResource("toolsBtn");
  document.getElementById("octaveUpBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveUpBtn").innerHTML = '<i class="icon-arrow-up"></i>&nbsp;'+DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").innerHTML = '<i class="icon-arrow-down"></i>&nbsp;'+DR.getResource("DR_octave");
  document.getElementById("pdfBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.getResource("pdfBtn");
  document.getElementById("printBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.getResource("printBtn");
  document.getElementById("printPreviewBtn").innerHTML = DR.getResource("printPreviewBtn");
  document.getElementById("saveBtn").innerHTML = DR.getResource("saveBtn");
  document.getElementById("closeBtn").innerHTML = DR.getResource("closeBtn");
  document.getElementById("forceRefresh").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("DR_message").alt = DR.getResource("DR_message");
  document.getElementById("gotoMeasureBtn").value = DR.getResource("DR_goto");
  document.getElementById("modeBtn").title = DR.getResource(this.currentMode === "normal"?"modeBtn":"DR_didactic");
  
  this.carregaListaGaitas();
};

DIATONIC.map.Map.prototype.isHorizontal = function() {
    return this.checkboxHorizontal.checked;
};

DIATONIC.map.Map.prototype.isMirror = function() {
    return this.checkboxEspelho.checked;
};

DIATONIC.map.Map.prototype.carregaListaGaitas  = function(g) {
    var gaita = g || this.gaita;
    var ord = [];
    for (var c=0; c < gaita.accordions.length; c++) {
       ord.push( [ gaita.accordions[c].menuOrder, gaita.accordions[c].getName() , gaita.accordions[c].getId() ] );
    }

    ord.sort();

    $('#opcoes_gaita').empty();

    for (var c=0; c < ord.length; c++) {
        $('#opcoes_gaita').append('<li><a href="#" id="pop_gaita_' +
            c  +'" onclick="setupGaita(\''+ ord[c][2] +'\')">' + ord[c][1] + ' ' + DR.getResource('DR_keys')  + '</a></li>');
    }

    $('#opcoes_gaita')
        .append('<hr style="height: 3px; margin: 5px;">')
        .append('<li><a id="extra1" href="#" onclick="saveMap();">' + DR.getResource('DR_save_map') + '</a></li>')
        .append('<li><a id="extra2" href="#" onclick="document.getElementById(\'fileLoadMap\').click();">' + DR.getResource('DR_load_map') + '</a></li>');
};

DIATONIC.map.Map.prototype.salvaMusica = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var name = this.editor.tunes[0].metaText.title + ".abcx";
        var conteudo = this.editor.editarea.getString();
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.getResource("DR_err_saving"));
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
        alert( DR.getResource("DR_err_saving"));
    }    
};

//  ,"menuOrder" : 0
//  ,"model":"Hohner Corona II"
//  ,"tuning":["A","D","G"]
//  ,"buttons":["31","8"]
//  ,"pedal":[]
//  ,"keyboard": 
//    {
//       "layout": [0.5, 0, 0.5]
//      ,"keys":
//      {
//        "close": [["E♭3", "A3", "C♯4", "E4", "A4", "C♯5", "E5", "A5", "C♯6", "E6"], ["G♯3", "A3", "D4", "F♯4", "A4", "D5", "F♯5", "A5", "D6", "F♯6", "A6"], ["F4", "D4", "G4", "B4", "D5", "G5", "B5", "D6", "G6", "B6"]]
//       , "open": [["F3", "B3", "D4", "F♯4", "G♯4", "B4", "D5", "F♯5", "G♯5", "B5"], ["B♭3", "C♯4", "E4", "G4", "B4", "C♯5", "E5", "G5", "B5", "C♯6", "E6"], ["E♭4", "F♯4", "A4", "C5", "E5", "F♯5", "A5", "C6", "E6", "F♯6"]]
//      }
//      ,"basses":
//      {
//        "close": [["f♯2", "F♯2", "b2", "B2", "c2", "C2"], ["a2", "A2", "d2", "D2", "g2", "G2"]]
//       , "open": [["b2:m", "B2", "e2:m", "E2", "c2", "C2"], ["e2", "E2", "a2", "A2", "d2", "D2"]]
//      }
//    }
//}

DIATONIC.map.Map.prototype.save = function() {
    var accordion = this.gaita.getSelectedAccordion();
    var txtAccordion = 
            '{\n'+
            '   "id":'+JSON.stringify(accordion.id)+'\n'+
            '  ,"menuOrder":'+JSON.stringify(accordion.menuOrder+100)+'\n'+
            '  ,"model":'+JSON.stringify(accordion.model)+'\n'+
            '  ,"tuning":'+JSON.stringify(accordion.tuning)+'\n'+
            '  ,"buttons":'+JSON.stringify(accordion.buttons)+'\n'+
            '  ,"pedal":'+JSON.stringify(accordion.pedal)+'\n'+
            '  ,"keyboard":\n'+
            '  {\n'+
            '     "layout":'+JSON.stringify(accordion.keyboard.layout)+'\n'+
            '     ,"keys":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.keys.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.keys.open)+'\n'+
            '     }\n'+
            '     ,"basses":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.basses.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.basses.open)+'\n'+
            '     }\n'+
            '  }\n'+
            '}\n';
    
    FILEMANAGER.download( accordion.getName() + '.accordion', txtAccordion );
};

DIATONIC.map.Map.prototype.load = function(files) {
    
    var newAccordion, newAccordionJSON, newImage;
    var newTunes = "", newChords = "", newPractices = "";
    
    for(var f = 0; f < files.length; f++ ){
        if( files[f].type === 'image' ) {
           newImage = files[f].content;
        } else {
             switch(files[f].extension.toLowerCase()) {
                 case 'accordion':
                    newAccordionJSON = JSON.parse( files[f].content );
                    break;
                 case 'tunes':
                    newTunes = files[f].content;
                    break;
                 case 'chords':
                    newChords = files[f].content;
                    break;
                 case 'practices':
                    newPractices = files[f].content;
                    break;
             }
        }
    }
            
    newAccordionJSON.image = newImage || 'img/accordion.default.gif';
    
    if( ! this.gaita.accordionExists(newAccordionJSON.id) ) {
        newAccordion = new DIATONIC.map.Accordion( newAccordionJSON, true );
        
        DIATONIC.map.accordionMaps.push( newAccordion  );
        this.carregaListaGaitas(this.gaita);
        this.editor.accordionSelector.updateAccordionList();
    }   
    
    if( ! this.gaita.accordionCurrent(newAccordion.id) ) {
        this.gaita.setup({accordionId:newAccordion.id});
    }   
    
    var accordion = this.gaita.getSelectedAccordion();
    
    if( newTunes ) {
        var tunebook = new ABCXJS.TuneBook(newTunes);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.songs.sortedIndex.sort();
        var tt = accordion.getFirstSong();
        this.gaita.loadSongList(tt);
        this.gaita.renderTune( tt, {}, this.currentTab === "tabTunes" );
    }
    if( newChords ) {
        var tunebook = new ABCXJS.TuneBook(newChords);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.chords.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.chords.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.chords.sortedIndex.sort();
        var tt = accordion.getFirstChord();
        this.gaita.loadChordList(tt);
        this.gaita.renderChord( tt, {}, this.currentTab === "tabChords" );
    }
    if( newPractices ) {
        var tunebook = new ABCXJS.TuneBook(newPractices);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.practices.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.practices.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.practices.sortedIndex.sort();
        var tt = accordion.getFirstPractice();
        this.gaita.loadPracticeList(tt);
        this.gaita.renderPractice( tt, {}, this.currentTab === "tabChords" );
    }
};

DIATONIC.map.Map.prototype.carregaRepertorio = function(original, files) {
    var that = this;
    var accordion = that.gaita.getSelectedAccordion();
    if (original) {
        if( accordion.localResource ) {
            console.log( 'Can\'t reload repertoire for local accordion!');
            return;
        }
        accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  // devido à falta de sincronismo, preciso usar o call back;
            var songTitle = accordion.getFirstSong();
            that.gaita.loadSongList(songTitle);
            that.gaita.renderTune( songTitle, {}, that.currentTab === "tabTunes" );
            
        });
    } else {
        accordion.songs = { items:{}, sortedIndex: [] };
        for (var s = 0; s < files.length; s++) {
            var tunebook = new ABCXJS.TuneBook(files[s].content);
            for (var t = 0; t < tunebook.tunes.length; t++) {
                accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
            }    
        }
        accordion.songs.sortedIndex.sort();
        var songTitle = accordion.getFirstSong();
        that.gaita.loadSongList(songTitle);
        that.gaita.renderTune( songTitle, {}, this.currentTab === "tabTunes" );
    }
};

DIATONIC.map.Map.prototype.setGaitaImage = function(gaita) {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+gaita.getPathToImage()
          +'" alt="'+gaita.getName() + ' ' + DR.getResource('DR_keys') + '" style="height:200px; width:200px;" />';
};

DIATONIC.map.Map.prototype.setGaitaName = function(gaita) {
  this.gaitaNamePlaceHolder.innerHTML = gaita.getName() + ' ' + DR.getResource('DR_keys');
};

DIATONIC.map.Map.prototype.startPlay = function( type, value ) {
    if (type === "normal" && this.midiPlayer.playing) {
        this.midiPlayer.pausePlay();
    } else {
        this.gaita.clearKeyboard();
        var midi;
        switch (this.currentTab) {
            case "tabTunes":
                midi = this.gaita.renderedTune.midi;
                break;
            case "tabChords":
                midi = this.gaita.renderedChord.midi;
                break;
            case "tabPractices":
                midi = this.gaita.renderedPractice.midi;
                break;
        }
        if(type==="normal")
          this.midiPlayer.startPlay(midi);
        else
          this.midiPlayer.startDidacticPlay(midi, type, value);
    }
};

DIATONIC.map.Map.prototype.changePlayMode = function() {
    if( this.currentMode === "normal" ) {
        $("#divNormalPlayControls" ).hide();
        this.currentMode  = "learning";
        this.modeButton.title = DR.getResource("DR_didactic");
        this.modeButton.innerHTML = '<img src="img/learning5.png" alt="" width="20" height="20">';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divDidacticPlayControls" ).fadeIn();
    } else {
        $("#divDidacticPlayControls" ).hide();
        this.currentMode  = "normal";
        this.modeButton.title = DR.getResource("modeBtn");
        this.modeButton.innerHTML = '<img src="img/listening3.png" alt="" width="20" height="20">';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divNormalPlayControls" ).fadeIn();
    }
};

DIATONIC.map.Map.prototype.defineActiveTab = function( which ) {
    this.currentTab = which;
    this.currentMode = "learning";
    this.midiPlayer.reset();
    this.changePlayMode();
    switch (this.currentTab) {
        case "tabTunes":
            this.gaita.songSelector.style.display  = 'inline';
            this.gaita.chordSelector.style.display  = 'none';
            this.gaita.practiceSelector.style.display  = 'none';
            break;
        case "tabChords":
            this.gaita.chordSelector.style.display  = 'inline';
            this.gaita.practiceSelector.style.display  = 'none';
            this.gaita.songSelector.style.display  = 'none';
            break;
        case "tabPractices":
            this.gaita.practiceSelector.style.display  = 'inline';
            this.gaita.chordSelector.style.display  = 'none';
            this.gaita.songSelector.style.display  = 'none';
            break;
    }
};

DIATONIC.map.Map.prototype.getTabTune = function( ) {
    var tune = undefined;
    var accordion = this.gaita.getSelectedAccordion();
    switch (this.currentTab) {
        case "tabTunes":
            if(this.gaita.renderedTune) {
              tune = this.gaita.songDiv.innerHTML;
              this.editor.setString( accordion.getSong(this.gaita.renderedTune.title), "noRefresh" );
            }  
            break;
        case "tabChords":
            if(this.gaita.renderedChord) {
              tune = this.gaita.chordDiv.innerHTML;
              this.editor.setString( accordion.getChord(this.gaita.renderedChord.title), "noRefresh" );
            }  
            break;
        case "tabPractices":
            if(this.gaita.renderedPractice) {
              tune = this.gaita.practiceDiv.innerHTML;
              this.editor.setString( accordion.getPractice(this.gaita.renderedPractice.title), "noRefresh" );
            }  
            break;
    }
    return tune;
};

DIATONIC.map.Map.prototype.setTabTune = function( ) {
    var accordion = this.gaita.getSelectedAccordion();
    switch (this.currentTab) {
        case "tabTunes":
            accordion.setSong(this.gaita.renderedTune.title, this.editor.getString() );
            this.gaita.printTune(true);
            break;
        case "tabChords":
            accordion.setChord(this.gaita.renderedChord.title, this.editor.getString() );
            this.gaita.printChord(true);
            break;
        case "tabPractices":
            accordion.setPractice(this.gaita.renderedPractice.title, this.editor.getString() );
            this.gaita.printPractice(true);
            break;
    }
};
