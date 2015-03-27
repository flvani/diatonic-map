if (!window.SITE)
    window.SITE = {};

SITE.Estudio = function( interfaceParams, editorParams, playerParams ) {
    var that = this;
    
    this.midiPlayer = new ABCXJS.midi.Player(this);
    
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.printPreviewButton = document.getElementById(interfaceParams.printPreviewBtn);
    
    this.editor =  new ABCXJS.Editor(
        editorParams.textArea
     ,{
        canvas_id: editorParams.canvas_id
     //,accordionSelector_id: editorParams.accordionSelector_id
       ,accordionNameSpan: editorParams.accordionNameSpan
       ,refreshController_id: editorParams.refreshController_id
       ,keySelector_id: editorParams.keySelector_id
       ,generate_midi: editorParams.generate_midi
       ,midi_options: editorParams.midi_options || {}
       ,generate_warnings: editorParams.generate_warnings
       ,warnings_id: editorParams.warnings_id
       ,generate_tablature: editorParams.generate_tablature
       ,accordion_options: editorParams.accordion_options
       //,render_options: {}
       //,gui: false
    });
    
    // player control
    this.showMapButton = document.getElementById(playerParams.showMapBtn);
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.gotoMeasureButton = document.getElementById(playerParams.gotoMeasureBtn);
    this.currentPlayTimeLabel = document.getElementById(playerParams.currentPlayTimeLabel);
    this.stepButton = document.getElementById(playerParams.stepBtn);
    this.stepMeasureButton = document.getElementById(playerParams.stepMeasureBtn);
    this.repeatButton = document.getElementById(playerParams.repeatBtn);
    this.clearButton = document.getElementById(playerParams.clearBtn);
    this.tempoButton = document.getElementById(playerParams.tempoBtn);

    this.saveButton.addEventListener("click", function() {
        that.salvaMusica();
    }, false);

    this.showMapButton.addEventListener("click", function() {
        var l = document.getElementById('DR_showMap');
        that.editor.accordion.render_keyboard_opts.show = !that.editor.accordion.render_keyboard_opts.show;
        l.innerHTML = that.editor.accordion.render_keyboard_opts.show? 'Hide Map':'Show Map';
        that.editor.accordion.printKeyboard();
    }, false);
    
    this.printPreviewButton.addEventListener("click", function() {
        $("#divTitulo").hide();
        $("#warningsDiv").hide();
        $("#editControlDiv").hide();
        document.body.style.paddingTop = '0px';
        window.print();
        document.body.style.paddingTop = '273px';
        $("#divTitulo").fadeIn();
        $("#warningsDiv").fadeIn();
        $("#editControlDiv").fadeIn();
    }, false);

    this.modeButton.addEventListener('click', function() {
        that.changePlayMode();
    }, false );
    
    this.playButton.addEventListener("click", function() {
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function() {
        that.midiPlayer.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function() {
        if(that.midi.printer)
            that.midi.printer.clearSelection();
        that.editor.accordion.clearKeyboard(true);
        that.ypos = 1000;
        that.gotoMeasureButton.value = "1";
        that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.clearDidacticPlay();
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

    this.tempoButton.addEventListener("click", function() {
        var andamento = that.midiPlayer.adjustAndamento();
        switch( andamento ) {
            case 1:
                that.tempoButton.innerHTML = '<b>&nbsp;1&nbsp;<b>';
                break;
            case 1/2:
                that.tempoButton.innerHTML = '<b>&nbsp;&#189;&nbsp;<b>';
                break;
            case 1/4:
                that.tempoButton.innerHTML = '<b>&nbsp;&#188;&nbsp;<b>';
                break;
        }
    }, false);
    
    
    this.gotoMeasureButton.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
           that.startPlay('goto', this.value  );
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

SITE.Estudio.prototype.salvaMusica = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        this.editor.parseABC(0, "force" );
        var name = this.editor.tunes[0].metaText.title + ".abcx";
        var conteudo = this.editor.editarea.getString();
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.getResource("DR_err_saving"));
    }    
};
SITE.Estudio.prototype.hideEditor = function(w) {
    w.location = "#cancel";
    w.location = "#map";
    this.editor.setString( editAreaLoader.getValue("taNewEditor"));
};

SITE.Estudio.prototype.showEditor = function(w) {
        	editAreaLoader.setValue("taNewEditor", this.editor.getString());
                w.location = "#newEditor";
                return;
                
		editAreaLoader.init({
			 id: "taNewEditor"	// id of the textarea to transform	
			,start_highlight: true
			,allow_toggle: false
			,language: "pt"
			,syntax: "abc"	
			,toolbar: "search, |, undo, redo, |, highlight , reset_highlight "
			,allow_resize: "y"
			,is_multi_files: false
			,show_line_colors: true
		});
};

SITE.Estudio.prototype.changePlayMode = function() {
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

SITE.Estudio.prototype.startPlay = function( type, value ) {
    //this.editor.parseABC(0, "force" );
    if(this.editor.tunes)
        this.midi = this.editor.tunes[0].midi;
    else
        return;
    
    if( this.midiPlayer.playing) {
        
        this.ypos = 1000;
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.editor.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};
