
// TODO: corrigir a rotina setKeyboardCanvasId

if (!window.SITE)
    window.SITE = {};

SITE.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

SITE.EditArea.prototype.addSelectionListener = function (listener) {
    this.textarea.onmousemove = function (ev) {
        if (this.isDragging) {
            listener.updateSelection();
        }    
    };
};

SITE.EditArea.prototype.addChangeListener = function (listener) {
    this.textarea.onkeyup = function () {
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onmousedown = function () {
        this.isDragging = true;
        listener.updateSelection();
    };
    this.textarea.onmouseup = function () {
        this.isDragging = false;
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onchange = function () {
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
};

SITE.EditArea.prototype.setSelection = function (start, end) {
    this.textarea.setSelectionRange(start, end);
    this.textarea.focus();
};

SITE.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

SITE.EditArea.prototype.setString = function(str) {
  this.initialText = str;
  this.textarea.value = str;
  this.textarea.selectionStart = 0;  
  this.textarea.selectionEnd = 0;  
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
        editor.editorChanged(this.value - editor.keySelector.oldValue, "force");
    };
};

SITE.Estudio = function (interfaceParams, editorParams, playerParams) {
    this.ypos = 0;
    this.lastYpos = 0;
    var that = this;
    
    this.oldAbcText = null;
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
    
    this.editArea.addSelectionListener(this);
    this.editArea.addChangeListener(this);
    
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
    
    if( editorParams.onchange ) {
        this.onchangeCallback = editorParams.onchange;
    }
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.forceRefreshButton = document.getElementById(interfaceParams.forceRefresh);
    this.forceRefreshCheckbox = document.getElementById(interfaceParams.forceRefreshCheckbox);
    this.printButton = document.getElementById(interfaceParams.printBtn);
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
    
    this.forceRefreshButton.addEventListener("click", function () {
        that.fireChanged(0, "force");
    }, false);
    
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

    this.printButton.addEventListener("click", function () {
        
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
        that.gotoMeasureButton.value = DR.getResource("DR_goto");
        that.untilMeasureButton.value = DR.getResource("DR_until");
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
    
    DR.addAgent( this ); // register for translate

};

SITE.Estudio.prototype.setScrolling = function(y, channel) {
    var d = document.getElementById( 'studioCanvasDiv');
    if( ! d || channel > 0 ) return;
    if( y !== this.ypos ) {
        this.ypos = y;
        d.scrollTop = this.ypos - 40;    
    }
};


SITE.Estudio.prototype.translate = function( ) {
    this.initEditArea( "editorTextArea" );
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
        case 'GLOBE':
            this.accordion.changeNotation();
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
        this.parseABC(0);
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
    if(this.editArea.getString() !== finalText ) {
        this.editArea.setString( finalText );
        this.fireChanged(0, 'force');
    }
};

SITE.Estudio.prototype.showEditor = function() {
    this.editorVisible = ! this.editorVisible;
    if(this.editorVisible) {
        document.getElementById( 'textareaABC').readOnly = true;
        editAreaLoader.setValue("editorTextArea", this.editArea.getString() );
        editAreaLoader.setSelectionRange("editorTextArea", 0, 0);
        this.editorWindow.topDiv.style.display = 'inline';
        this.initEditArea( "editorTextArea" );
        document.getElementById('I_showEditor').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideEditor();
    }
};

SITE.Estudio.prototype.setupEditor = function() {
    var that = this;
    var ks = "selKey";
    this.editorWindow.dataDiv.innerHTML =     
        '<textarea id="editorTextArea" rows="25"></textarea>'
        + '<div style="width: 100%; padding:2px; margin-left:2px;" >'
        +    '<select id="'+ks+'" ></select>'
        +    '<button id="octaveUpBtn" class="btn" title="+ Oitava" onclick="" ><i class="icon-arrow-up"></i>&nbsp;Oitava</button>'
        +    '<button id="octaveDwBtn" class="btn" title="- Oitava" onclick="" ><i class="icon-arrow-down"></i>&nbsp;Oitava</button>'
        +    '<button id="forceRefresh2" class="btn" title="Atualizar" onclick="" >Atualizar</button>'
        + '</div>';
                            

    this.initEditArea( "editorTextArea", 850, 478 );
    
    this.keySelector = new SITE.KeySelector(ks);
    this.keySelector.addChangeListener(this);
    
    document.getElementById('octaveUpBtn').addEventListener("click", function () {
        that.editorChanged(12, "force");
    }, false);
    
    document.getElementById('octaveDwBtn').addEventListener("click", function () {
        that.editorChanged(-12, "force");
    }, false);
    
    document.getElementById('forceRefresh2').addEventListener("click", function () {
        that.editorChanged(0, "force");
    }, false);

   DR.forcedResource('forceRefresh', 'Atualizar', '2', 'forceRefresh2');

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
    return false;
};

SITE.Estudio.prototype.initEditArea = function( id, w, h) {
    var o = {
        id: id	// id of the textarea to transform	
       ,start_highlight: true
       ,allow_toggle: false
       ,syntax: "abc"	
       ,toolbar: "search, |, undo, redo, |, highlight , reset_highlight "
       ,allow_resize: "both"
       ,is_multi_files: false
       ,show_line_colors: true
       ,replace_tab_by_spaces: 4
    };   
    
    switch(DR.language){
        case DR.pt_BR: o.language = 'pt'; break;
        case DR.en_US: o.language = 'en'; break;
        case DR.de_DE: o.language = 'de'; break;
    }
    
    if(w && h)  {
        o.min_width = w;
        o.min_height = h;
    } else {    
        var e = document.getElementById("frame_"+id);
        if( this.editorVisible && o.language !== this.editorCurrLang && e) {
            o.min_width =  e.clientWidth;
            o.min_height = e.clientHeight;
        } else {
            return ; // não é necessário inicializar ou não é seguro
        }
    }
        
    editAreaLoader.init(o);
    this.editorCurrLang = o.language;
};

SITE.Estudio.prototype.changePlayMode = function() {
    if( this.currentMode === "normal" ) {
        $("#divNormalPlayControls" ).hide();
        this.currentMode  = "learning";
        this.modeButton.innerHTML = '<img src="img/learning5.png" alt="" width="20" height="20">';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divDidacticPlayControls" ).fadeIn();
    } else {
        $("#divDidacticPlayControls" ).hide();
        this.currentMode  = "normal";
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

SITE.Estudio.prototype.parseABC = function(transpose) {
    
    this.warnings = [];
    
    if(typeof transpose !== "undefined") {
        if( this.transposer )
          this.transposer.reset(transpose);
        else
          this.transposer = new ABCXJS.parse.Transposer( transpose );
    }
    
    var text =  this.editArea.getString();
    var abcParser = new ABCXJS.parse.Parse( this.transposer, this.accordion );
    
    abcParser.parse(text, this.parserparams );

    if( this.transposer ) { 
        if( this.transposer.offSet !== 0 ) {
          var lines = abcParser.tuneHouseKeeping(text);
          this.editArea.setString( this.transposer.updateEditor( lines ), "norefresh" );
        }
        if(this.keySelector) 
            this.keySelector.set( this.transposer.keyToNumber( this.transposer.getKeyVoice(0) ) );       
    }
    
    if( this.accordion ) { 
        // obtem possiveis linhas inferidas para tablatura
        this.editArea.appendString( this.accordion.updateEditor() );
    }
    
    this.renderedTune.text = this.editArea.getString();
    this.renderedTune.abc = abcParser.getTune();
    
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
  editAreaLoader.setSelectionRange("editorTextArea", abcelem.startChar, abcelem.endChar)
};

SITE.Estudio.prototype.onChange = function() {
    document.getElementById("studioCanvasDiv").scrollTop = this.lastYpos;
};

SITE.Estudio.prototype.editorChanged = function (transpose, force) {
    this.editArea.setString(editAreaLoader.getValue("editorTextArea"));
    this.fireChanged(transpose, force);
    editAreaLoader.setValue("editorTextArea", this.editArea.getString());
    editAreaLoader.setSelectionRange("editorTextArea", 0, 0 );
};

SITE.Estudio.prototype.fireChanged = function (transpose, force) {
    var self = this;
    var loader = this.startLoader( "FC" );
    loader.start(  function() { self.fireChanged2(transpose, force, loader); }, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
};

SITE.Estudio.prototype.fireChanged2 = function (transpose, force, loader) {
    
    if( force || this.oldAbcText !== this.editArea.getString() ) {
        
        this.oldAbcText = this.editArea.getString();
    
        this.lastYpos = document.getElementById("studioCanvasDiv").scrollTop || 0;               

        if (this.parseABC(transpose)) {
            this.modelChanged();
        }
    }    
    if(loader)
        loader.stop();
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
    
    if (this.onchangeCallback) {
        this.onchangeCallback(this);
    }    
    
};

SITE.Estudio.prototype.setup = function(tab, accordionId) {
    this.resize();
    this.accordion.loadById(accordionId);
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    this.renderedTune.abc = tab.abc;
    this.editArea.setString(this.renderedTune.text);
    editAreaLoader.setValue("editorTextArea", this.renderedTune.text );
    this.editorWindow.setTitle('-&nbsp;' + tab.title);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    this.fireChanged2(0,'force');
};

SITE.Estudio.prototype.updateSelection = function() {
  try {
    this.renderedTune.printer.rangeHighlight(this.editArea.textarea.selectionStart, this.editArea.textarea.selectionEnd);
  } catch (e) {} // maybe printer isn't defined yet?
};

SITE.Estudio.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};
