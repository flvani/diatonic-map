
// TODO: corrigir a rotina setKeyboardCanvasId

if (!window.SITE)
    window.SITE = {};

SITE.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

//SITE.EditArea.prototype.addSelectionListener = function (listener) {
//    this.textarea.onmousemove = function (ev) {
//        if (this.isDragging)
//            listener.updateSelection();
//    };
//};
//
//SITE.EditArea.prototype.addChangeListener = function (listener) {
//    this.textarea.onkeyup = function () {
//        listener.fireChanged();
//    };
//    this.textarea.onmousedown = function () {
//        this.isDragging = true;
//        listener.updateSelection();
//    };
//    this.textarea.onmouseup = function () {
//        this.isDragging = false;
//        listener.fireChanged();
//    };
//    this.textarea.onchange = function () {
//        listener.fireChanged();
//    };
//};

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
    this.ypos = 0;
    var that = this;
    
    this.warnings = [];
    this.currentMode = "normal"; 
    this.editorVisible = false;
    this.mapVisible = false;
    this.textVisible = true;
    this.editorWindow = editorParams.editorWindow;
    this.keyboardWindow = editorParams.keyboardWindow;
    
    this.setupEditor();
    
    this.renderedTune = {text: undefined, abc: undefined, title: undefined, div: undefined, selector: undefined};
    
    if (typeof editorParams.textArea === "string") {
        this.editArea = new SITE.EditArea(editorParams.textArea);
    } else {
        this.editArea = editorParams.textArea;
    }
    
    //this.editArea.addSelectionListener(this);
    //this.editArea.addChangeListener(this);
    
    if (editorParams.generate_tablature) {
        if (editorParams.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(editorParams.accordion_options);

            if (editorParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(editorParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
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

    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.printPreviewButton = document.getElementById(interfaceParams.printPreviewBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    this.showTextButton = document.getElementById(interfaceParams.showTextBtn);

    // player control
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.gotoMeasureButton = document.getElementById(playerParams.gotoMeasureBtn);
    this.untilMeasureButton = document.getElementById(playerParams.untilMeasureBtn);
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
        that.showMap();
    }, false);
    
    this.showTextButton.addEventListener("click", function () {
        that.showABCXText();
    }, false);
    
    this.showEditorButton.addEventListener("click", function () {
        that.showEditor();
    }, false);

    this.printPreviewButton.addEventListener("click", function () {
        
        that.printPreview(that.renderedTune.div.innerHTML, ["#divTitulo","#studioDiv"]);
        return;

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
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.ypos = 1000;
        that.gotoMeasureButton.value = "1";
        that.untilMeasureButton.value = "";
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
        that.startPlay('repeat', that.gotoMeasureButton.value, that.untilMeasureButton.value );
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
            that.startPlay('goto', this.value, that.untilMeasureButton.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function () {
        if (this.value === DR.getResource("DR_goto")) {
            this.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function () {
        if (this.value === "") {
            this.value = DR.getResource("DR_goto");
        }
    }, false);
    
    this.untilMeasureButton.addEventListener("keypress", function (e) {
        if (e.keyCode === 13) {
            that.startPlay('goto', that.gotoMeasureButton.value, this.value);
        }
    }, false);

    this.untilMeasureButton.addEventListener("focus", function () {
        if (this.value === DR.getResource("DR_until")) {
            this.value = "";
        }
    }, false);

    this.untilMeasureButton.addEventListener("blur", function () {
        if (this.value === "") {
            this.value = DR.getResource("DR_until");
        }
    }, false);
    
    
    if (editorParams.generate_midi) {
        
        this.playerCallBackOnScroll = function( player ) {
            that.setScrolling(player.currAbsElem.y, player.currChannel );
        };

        this.playerCallBackOnPlay = function( player ) {
            var strTime = player.getTime().cTime;
            if(that.gotoMeasureButton && ! parseInt(that.untilMeasureButton.value))
                that.gotoMeasureButton.value = player.currentMeasure;
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = strTime;
        };

        this.playerCallBackOnEnd = function( player ) {
            var warns = that.midiPlayer.getWarnings();
            that.playButton.title = DR.getResource("playBtn");
            that.playButton.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
            that.renderedTune.printer.clearSelection();
            that.accordion.clearKeyboard(true);
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = "00:00.00";
            if( warns ) {
                var wd =  document.getElementById("warningsDiv");
                var txt = "";
                warns.forEach(function(msg){ txt += msg + '<br>'; });
                wd.style.color = 'blue';
                wd.innerHTML = '<hr>'+txt+'<hr>';
            }
        };
        
        this.midiParser = new ABCXJS.midi.Parse();
        this.midiPlayer = new ABCXJS.midi.Player(this);
        this.midiPlayer.defineCallbackOnPlay( this.playerCallBackOnPlay );
        this.midiPlayer.defineCallbackOnEnd( this.playerCallBackOnEnd );
        this.midiPlayer.defineCallbackOnScroll( this.playerCallBackOnScroll );
    }

};

SITE.Estudio.prototype.setScrolling = function(y, channel) {
    var d = document.getElementById( 'studioCanvasDiv');
    if( ! d || channel > 0 ) return;
    if( y !== this.ypos ) {
        this.ypos = y;
        d.scrollTop = this.ypos - 40;    
    }
};

SITE.Estudio.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            break;
        case 'MINUS':
            this.hideMap();
            break;
        case 'RETWEET':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM-IN':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        default:
            alert(e);
    }
};

SITE.Estudio.prototype.printPreview = function (html, divsToHide) {
    var bg = document.body.style.backgroundColor;
    var dv = document.getElementById('printPreviewDiv');
    
    divsToHide.forEach( function( div ) {
        $(div).hide();
    });
    $("#printPreviewDiv").show();
    
    dv.innerHTML = html;
    
    document.body.style.paddingTop = '0px';
    document.body.style.backgroundColor = '#fff';
    window.print();
    document.body.style.backgroundColor = bg;
    document.body.style.paddingTop = '50px';
    
    $("#printPreviewDiv").hide();
    divsToHide.forEach( function( div ) {
        $(div).show();
    });

};


SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.parseABC(0, "force");
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.editArea.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};
    
SITE.Estudio.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    this.keyboardWindow.topDiv.style.display = 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('I_showMap').setAttribute('class', 'icon-folder-close' );
};

SITE.Estudio.prototype.showMap = function() {
    this.mapVisible = ! this.mapVisible;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    if(this.mapVisible) {
        this.keyboardWindow.topDiv.style.display = 'inline-block';
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('I_showMap').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideMap();
    }
};
    

SITE.Estudio.prototype.showABCXText = function () {
    this.textVisible = !this.textVisible;
    if (this.textVisible) {
        this.editArea.textarea.style.display = 'inline';
        document.getElementById('I_showText').setAttribute('class','icon-folder-open');
    } else {
        this.editArea.textarea.style.display = 'none';
        document.getElementById('I_showText').setAttribute('class','icon-folder-close');
    }
    this.resize();
};

SITE.Estudio.prototype.hideEditor = function() {
    document.getElementById('I_showEditor').setAttribute('class', 'icon-folder-close' );
    this.editorWindow.topDiv.style.display = 'none';
    this.editorVisible = false;
    var finalText = editAreaLoader.getValue("editorTextArea");
    document.getElementById( 'textareaABC').readOnly = false;
    if(this.initialText !== finalText ) {
        this.editArea.setString( finalText );
        this.fireChanged(0, 'force');
    }
};

SITE.Estudio.prototype.showEditor = function() {
    this.editorVisible = ! this.editorVisible;
    if(this.editorVisible) {
        this.initialText = this.editArea.getString();
        document.getElementById( 'textareaABC').readOnly = true;
        editAreaLoader.setValue("editorTextArea", this.initialText );
        editAreaLoader.setSelectionRange("editorTextArea", 0, 0);
        this.editorWindow.topDiv.style.display = 'inline-block';
        document.getElementById('I_showEditor').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideEditor();
    }
};

SITE.Estudio.prototype.setupEditor = function() {
    this.editorWindow.dataDiv.innerHTML =     
        '<textarea id="editorTextArea" rows="25"></textarea>'
        + '<div style="width: 100%;" >'
        +     '<select id="selKey" ></select>'
        +    '<button id="octaveUpBtn" class="btn" title="+ Oitava" onclick="javascript:doTranspose(12); return false;" ><i class="icon-arrow-up"></i>&nbsp;Oitava</button>'
        +    '<button id="octaveDwBtn" class="btn" title="- Oitava" onclick="javascript:doTranspose(-12); return false;" ><i class="icon-arrow-down"></i>&nbsp;Oitava</button>'
        + '</div>';

    this.initEditArea( "editorTextArea", "pt", 850, 478 );
};

SITE.Estudio.prototype.editorCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            break;
        case 'MINUS':
            this.hideEditor();
            break;
        case 'ZOOM-IN':
        case 'RETWEET':
        default:
            alert(e);
    }
};

SITE.Estudio.prototype.initEditArea = function( id, lang, w, h) {
    editAreaLoader.init({
        id: id	// id of the textarea to transform	
       ,start_highlight: true
       ,allow_toggle: false
       ,language: lang
       ,syntax: "abc"	
       ,toolbar: "search, |, undo, redo, |, highlight , reset_highlight "
       ,allow_resize: "both"
       ,is_multi_files: false
       ,show_line_colors: true
       ,replace_tab_by_spaces: 4
       ,min_width: w || 400
       ,min_height: h || 200
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

SITE.Estudio.prototype.resize = function( ) {
    var t = document.getElementById( 'textareaABC');
    var m = document.getElementById( 'studioMenu');
    var h = document.getElementById( 'studioHeader');
    var o = document.getElementById( 'studioContentDiv');
    var i = document.getElementById( 'studioCanvasDiv');

    t.style.width = parseInt(m.clientWidth) - 24 + "px";
    i.style.height = (o.clientHeight - h.clientHeight - m.clientHeight - 10) + "px";
    //console.log(h.clientWidth - 'h.clientWidth');
};

SITE.Estudio.prototype.startPlay = function( type, value, valueF ) {
    
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
            if( this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value, valueF ) ) {
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
    
//    editorCallbackOnChange = function ( editor ) {
//        window.scrollTo( 0, window.lastYpos );
//    };
    
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

SITE.Estudio.prototype.setup = function(tab, accordionId) {
    this.resize();
    this.accordion.loadById(accordionId);
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    this.renderedTune.abc = tab.abc;
    this.editArea.setString(this.renderedTune.text);
    this.editorWindow.setTitle('Editor ABCX - ' + tab.title);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    this.modelChanged();
};

SITE.Estudio.prototype.updateSelection = function() {
  var selection = this.editArea.getSelection();
  try {
    this.renderedTune.printer.rangeHighlight(selection.start, selection.end);
  } catch (e) {} // maybe printer isn't defined yet?
};
