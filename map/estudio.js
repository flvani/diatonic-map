if (!window.SITE)
    window.SITE = {};

SITE.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

SITE.EditArea.prototype.addSelectionListener = function (listener) {
    this.textarea.onmousemove = function (ev) {
        if (this.isDragging)
            listener.updateSelection();
    };
};

SITE.EditArea.prototype.addChangeListener = function (listener) {
    this.textarea.onkeyup = function () {
        listener.fireChanged();
    };
    this.textarea.onmousedown = function () {
        this.isDragging = true;
        listener.updateSelection();
    };
    this.textarea.onmouseup = function () {
        this.isDragging = false;
        listener.fireChanged();
    };
    this.textarea.onchange = function () {
        listener.fireChanged();
    };
};

//TODO won't work under IE?
SITE.EditArea.prototype.getSelection = function() {
    return {start: this.textarea.selectionStart, end: this.textarea.selectionEnd};
};

SITE.EditArea.prototype.setSelection = function (start, end) {
    if (this.textarea.setSelectionRange)
        this.textarea.setSelectionRange(start, end);
    else if (this.textarea.createTextRange) {
        // For IE8
        var e = this.textarea.createTextRange();
        e.collapse(true);
        e.moveEnd('character', end);
        e.moveStart('character', start);
        e.select();
    }
    this.textarea.focus();
};

SITE.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

SITE.EditArea.prototype.setString = function(str ) {
  this.textarea.value = str;
  this.textarea.selectionStart = 0;  
  this.textarea.selectionEnd = 0;  
  this.initialText = this.getString();
//  if (this.changelistener && typeof( noRefresh ) === 'undefined' ) {
//    this.changelistener.fireChanged();
//  }
};

SITE.EditArea.prototype.appendString = function(str ) {
  //retira \n ao final  
  var t = this.textarea.value;
  while( t.charAt(t.length-1) === '\n' ) {
    t = t.substr(0,t.length-1);
  }
  this.setString(t+str );
};

SITE.EditArea.prototype.getElem = function() {
  return this.textarea;
};

SITE.KeySelector = function(id) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }
};

SITE.KeySelector.prototype.populate = function(offSet) {
    
    while( this.selector.options.length > 0 ) {
        this.selector.remove(0);
    }            
        
    for (var i = this.cromaticLength+offSet; i >= -this.cromaticLength+2+offSet; i--) {
        var opt = document.createElement('option');
        if(i-1 > offSet) 
            opt.innerHTML = ABCXJS.parse.number2keysharp[(i+this.cromaticLength-1)%this.cromaticLength] ;
        else
            opt.innerHTML = ABCXJS.parse.number2keyflat[(i+this.cromaticLength-1)%this.cromaticLength] ;
        opt.value = (i+this.cromaticLength-1);
        this.selector.appendChild(opt);
    }
    this.oldValue = offSet+this.cromaticLength;
    this.selector.value = offSet+this.cromaticLength;
};

SITE.KeySelector.prototype.set = function(value) {
    this.populate(value);
};

SITE.KeySelector.prototype.addChangeListener = function (editor) {
    this.selector.onchange = function () {
        editor.fireChanged(this.value - editor.keySelector.oldValue, "force");
    };
};

SITE.Estudio = function (interfaceParams, editorParams, playerParams) {
    var that = this;
    
    this.warnings = [];
    this.currentMode = "normal"; // somente será normal na pagina inicial
    this.renderedTune = {text: undefined, abc: undefined, title: undefined, div: undefined, selector: undefined};
    
    if (typeof editorParams.textArea === "string") {
        this.editArea = new SITE.EditArea(editorParams.textArea);
    } else {
        this.editArea = editorParams.textArea;
    }
    
    this.editArea.addSelectionListener(this);
    this.editArea.addChangeListener(this);
    
    if (editorParams.generate_tablature) {
        if (editorParams.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(editorParams.accordion_options);

            if (editorParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(editorParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getName();
            }
        } else {
            throw new Error('Tablatura para ' + editorParams.generate_tablature + ' não suportada!');
        }
    }
    if (editorParams.keySelector_id) {
        this.keySelector = new SITE.KeySelector(editorParams.keySelector_id);
        this.keySelector.addChangeListener(this);
    }


    if (editorParams.canvas_id) {
        this.renderedTune.div = document.getElementById(editorParams.canvas_id);
    } else if (editorParams.paper_id) {
        this.renderedTune.div = document.getElementById(editorParams.paper_id);
    } else {
        this.renderedTune.div = document.createElement("DIV");
        this.editArea.getElem().parentNode.insertBefore(this.renderedTune.div, this.editArea.getElem());
    }

    if (editorParams.generate_warnings) {
        if (editorParams.warnings_id) {
            this.warningsdiv = document.getElementById(editorParams.warnings_id);
        } else {
            this.warningsdiv = this.renderedTune.div;
        }
    }

    if (editorParams.generate_midi) {
        this.midiParser = new ABCXJS.midi.Parse();
        this.midiPlayer = new ABCXJS.midi.Player(this);
    }

    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.printPreviewButton = document.getElementById(interfaceParams.printPreviewBtn);

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

    this.saveButton.addEventListener("click", function () {
        that.salvaMusica();
    }, false);

    this.showMapButton.addEventListener("click", function () {
        var l = document.getElementById('DR_showMap');
        that.accordion.render_keyboard_opts.show = !that.accordion.render_keyboard_opts.show;
        l.innerHTML = that.accordion.render_keyboard_opts.show ? 'Hide Map' : 'Show Map';
        that.accordion.printKeyboard();
    }, false);

    this.printPreviewButton.addEventListener("click", function () {
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

    this.modeButton.addEventListener('click', function () {
        that.changePlayMode();
    }, false);

    this.playButton.addEventListener("click", function () {
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function () {
        that.midiPlayer.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function () {
        if (that.midi.printer)
            that.midi.printer.clearSelection();
        that.editor.accordion.clearKeyboard(true);
        that.ypos = 1000;
        that.gotoMeasureButton.value = "1";
        that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.clearDidacticPlay();
    }, false);


    this.stepButton.addEventListener("click", function () {
        that.startPlay('note');
    }, false);

    this.stepMeasureButton.addEventListener("click", function () {
        that.startPlay('measure');
    }, false);

    this.repeatButton.addEventListener("click", function () {
        that.startPlay('repeat');
    }, false);

    this.tempoButton.addEventListener("click", function () {
        var andamento = that.midiPlayer.adjustAndamento();
        switch (andamento) {
            case 1:
                that.tempoButton.innerHTML = '<b>&nbsp;1&nbsp;<b>';
                break;
            case 1 / 2:
                that.tempoButton.innerHTML = '<b>&nbsp;&#189;&nbsp;<b>';
                break;
            case 1 / 4:
                that.tempoButton.innerHTML = '<b>&nbsp;&#188;&nbsp;<b>';
                break;
        }
    }, false);


    this.gotoMeasureButton.addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
            that.startPlay('goto', this.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function () {
        if (that.gotoMeasureButton.value === DR.getResource("DR_goto")) {
            that.gotoMeasureButton.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function () {
        if (that.gotoMeasureButton.value === "") {
            that.gotoMeasureButton.value = DR.getResource("DR_goto");
        }
    }, false);

};

SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.parseABC(0, "force");
        var name = this.tune.metaText.title + ".abcx";
        var conteudo = this.editArea.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};
    
SITE.Estudio.prototype.hideEditor = function(w) {
    w.location = "#";
    var finalText = editAreaLoader.getValue("taNewEditor");
    
    if(this.initialText !== finalText ) {
        this.editArea.setString( finalText );
        this.fireChanged(0, 'force');
    }
};

SITE.Estudio.prototype.showEditor = function(w) {
    w.location = "#newEditor";

    editAreaLoader.init({
        id: "taNewEditor"	// id of the textarea to transform	
       ,start_highlight: true
       ,allow_toggle: false
       ,language: "pt"
       ,syntax: "abc"	
       ,toolbar: "search, |, undo, redo, |, highlight , reset_highlight "
       ,allow_resize: "n"
       ,is_multi_files: false
       ,show_line_colors: true
    });
    
    this.initialText = this.editArea.getString();
    
    editAreaLoader.setValue("taNewEditor", this.initialText );

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
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};

SITE.Estudio.prototype.parseABC = function(transpose, force) {
    
    this.warnings = [];
    
    if(typeof transpose !== "undefined") {
        if( this.transposer )
          this.transposer.reset(transpose);
        else
          this.transposer = new ABCXJS.parse.Transposer( transpose );
    }
    
    var abcParser = new ABCXJS.parse.Parse( this.transposer, this.accordion );
    abcParser.parse(this.editArea.getString(), this.parserparams );
    this.renderedTune.abc = abcParser.getTune();

    if( this.accordion ) { 
        // obtem possiveis linhas inferidas para tablatura
        this.editArea.appendString( this.accordion.updateEditor() );
    }
    
    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
      this.warnings.push(warnings[j]);
    }

    if ( this.midiParser ) {
        this.midiParser.parse( this.renderedTune.abc, this.accordion.getKeyboard() );
        var warnings = this.midiParser.getWarnings();
        for (var j=0; j<warnings.length; j++) {
           this.warnings.push(warnings[j]);
        }
    }
    
    return this.renderedTune.abc;
};        

SITE.Estudio.prototype.highlight = function(abcelem) {
  this.editArea.setSelection(abcelem.startChar, abcelem.endChar);
};

// call when abc text is changed and needs re-parsing
SITE.Estudio.prototype.fireChanged = function (transpose, force) {

    if (this.parseABC(transpose, force)) {
        this.modelChanged();
    }
};

SITE.Estudio.prototype.modelChanged = function() {
    
    this.renderedTune.div.innerHTML = "";
    if (this.renderedTune.abc === undefined) {
        return;
    }

    var paper = Raphael(this.renderedTune.div, 1100, 700);
    this.renderedTune.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    this.renderedTune.printer.printABC(this.renderedTune.abc);
    
    if (this.warningsdiv) {
        this.warningsdiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsdiv.innerHTML = '<hr>' + (this.warnings.length > 0 ? this.warnings.join("<br>") : "No warnings or errors.") + '<hr>';
    }
    
    this.renderedTune.printer.addSelectListener(this);
    this.updateSelection();
    
    if (this.onchangeCallback)
        this.onchangeCallback(this);
    
};

SITE.Estudio.prototype.setABC = function(tab) {
    this.renderedTune.text = tab.text;
    this.renderedTune.abc = tab.abc;
    this.renderedTune.div.innerHTML = tab.div.innerHTML;
    this.editArea.setString(this.renderedTune.text);
};

SITE.Estudio.prototype.updateSelection = function() {
  var selection = this.editArea.getSelection();
  try {
    this.printer.rangeHighlight(selection.start, selection.end);
  } catch (e) {} // maybe printer isn't defined yet?
};
