
if (!window.SITE)
    window.SITE = {};

SITE.Estudio = function (interfaceParams, playerParams) {
    
    this.ypos = 0; // controle de scroll
    this.lastStaffGroup = -1; // controle de scroll
    this.lastYpos = 0; // controle de scroll
    var that = this;
    
    var canvas_id = 'canvasDiv';
    var warnings_id = 'warningsDiv';

    this.oldAbcText = null;
    this.warnings = [];
    this.currentMode = "normal"; 
    this.editorVisible = true;
    this.mapVisible = false;
    
    this.keyboardWindow = new DRAGGABLE.Div( 
          null 
        , [ 'move|Mover', 'rotate|Rotacionar', 'zoom|Zoom','globe|Mudar Notação']
        , {title: 'Keyb', translate: false, statusBar: false, top: "100px", left: "300px", zIndex: 100} 
        , {listener: this, method: 'keyboardCallback'}
    );
                
    this.studioDiv = new DRAGGABLE.Div( 
          interfaceParams.studioDiv 
        , [ 'restore|Restaurar configuração padrão']
        , {translate: false, statusBar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'Estúdio ABCX'}
        , {listener: this, method: 'studioCallback'}
    );
    
    this.studioDiv.setVisible(true);
    
    this.editareaFixa = new ABCXJS.edit.EditArea(this.studioDiv.dataDiv, this);

    this.editareaMovel = new ABCXJS.edit.EditArea(null, this);
    this.editareaMovel.setVisible(false);

    this.editorWindow = this.editareaFixa;

    this.editorWindow.setVisible(true);
    this.editorWindow.setToolBarVisible(false);
    this.editorWindow.resize(true);

    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'controlDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.studioDiv.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.studioControlDiv).innerHTML;
    document.getElementById(interfaceParams.studioControlDiv).innerHTML = "";

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", interfaceParams.studioCanvasDiv );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv customScrollBar" );
   
    if (interfaceParams.generate_warnings) {
        this.warningsDiv = document.createElement("DIV");
        this.warningsDiv.setAttribute("id", warnings_id);
        this.warningsDiv.setAttribute("class", "warningsDiv" );
        this.studioCanvasDiv.appendChild(this.warningsDiv);
    }
    
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    this.studioCanvasDiv.appendChild(this.canvasDiv);
    
    this.studioDiv.dataDiv.appendChild(this.studioCanvasDiv);
    
    this.playTreble = true;
    this.playBass = true;
    this.timerOn = false;
    this.clefsToPlay = (this.playTreble?"T":"")+(this.playBass?"B":"");
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         , tab: undefined, div: undefined ,selector: undefined };
    
    this.renderedTune.div = this.canvasDiv;
    
    if (interfaceParams.generate_tablature) {
        if (interfaceParams.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(interfaceParams.accordion_options);

            if (interfaceParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(interfaceParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + interfaceParams.generate_tablature + ' não suportada!');
        }
    }
    
    if( interfaceParams.onchange ) {
        this.onchangeCallback = interfaceParams.onchange;
    }
    
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.forceRefreshButton = document.getElementById(interfaceParams.forceRefresh);
    this.forceRefreshCheckbox = document.getElementById(interfaceParams.forceRefreshCheckbox);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);

    // player control
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.timerButton = document.getElementById(playerParams.timerBtn);
    this.FClefButton = document.getElementById(playerParams.FClefBtn);
    this.GClefButton = document.getElementById(playerParams.GClefBtn);
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

    
    this.showEditorButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        that.showEditor();
    }, false);
    
    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showMap();
    }, false);
    
    this.forceRefreshButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.fireChanged(0, "force");
    }, false);
    
    this.saveButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.salvaMusica();
    }, false);
    
    this.printButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        ga('send', 'event', 'Estúdio', 'print', that.renderedTune.title);
        that.printPreview(that.renderedTune.div.innerHTML, ["#divTitulo","#studioDiv"], that.renderedTune.abc.formatting.landscape);
        return;

    }, false);

    this.modeButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        that.changePlayMode();
    }, false);

    this.timerButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        that.timerOn = ! that.timerOn;
        that.setTimerIcon(that.timerOn, 0);
    }, false);
    
    this.FClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if( that.playBass) {
            this.innerHTML = '<i class="m-ico-bass-clef-3" style="opacity:0.9;color:lightgray;"></i>'+
                              '<i class="m-ico-forbidden" style="position:absolute;left:4px;top:6px"></i>';
        } else {
            this.innerHTML = '<i class="m-ico-bass-clef-3" ></i>';

        }
        that.playBass = ! that.playBass;
        that.clefsToPlay = (that.playTreble?"T":"")+(that.playBass?"B":"");
    }, false);

    this.GClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if( that.playTreble) {
            this.innerHTML = '<i class="m-ico-treble-clef-5" style="opacity:0.9;color:lightgray;"></i>'+
                              '<i class="m-ico-forbidden" style="position:absolute;left:4px;top:6px"></i>';
        } else {
            this.innerHTML = '<i class="m-ico-treble-clef-5" ></i>';
        }
        that.playTreble = ! that.playTreble;
        that.clefsToPlay = (that.playTreble?"T":"")+(that.playBass?"B":"");
    }, false);

    this.playButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.midiPlayer.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.stopPlay();
    }, false);


    this.stepButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('note');
    }, false);

    this.stepMeasureButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        that.startPlay('measure');
    }, false);

    this.repeatButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('repeat', that.gotoMeasureButton.value, that.untilMeasureButton.value );
    }, false);

    this.tempoButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        var andamento = that.midiPlayer.adjustAndamento();
        switch (andamento) {
            case 1:
                that.tempoButton.innerHTML = '&#160;&#160;1&#160;&#160';
                break;
            case 1 / 2:
                that.tempoButton.innerHTML = '&#160;&#189;&#160;';
                break;
            case 1 / 4:
                that.tempoButton.innerHTML = '&#160;&#188;&#160;';
                break;
        }
    }, false);


    this.gotoMeasureButton.addEventListener("keypress", function (evt) {
        //evt.preventDefault();
        if (evt.keyCode === 13) {
            that.startPlay('goto', this.value, that.untilMeasureButton.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function (evt) {
        //evt.preventDefault();
        if (this.value === DR.getResource("DR_goto")) {
            this.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function (evt) {
        //evt.preventDefault();
        if (this.value === "") {
            this.value = DR.getResource("DR_goto");
        }
    }, false);
    
    this.untilMeasureButton.addEventListener("keypress", function (evt) {
        //evt.preventDefault();
        if (evt.keyCode === 13) {
            that.startPlay('goto', that.gotoMeasureButton.value, this.value);
        }
    }, false);

    this.untilMeasureButton.addEventListener("focus", function (evt) {
        //evt.preventDefault();
        if (this.value === DR.getResource("DR_until")) {
            this.value = "";
        }
    }, false);

    this.untilMeasureButton.addEventListener("blur", function (evt) {
        //evt.preventDefault();
        if (this.value === "") {
            this.value = DR.getResource("DR_until");
        }
    }, false);
    
    if (interfaceParams.generate_midi) {
        
        this.playerCallBackOnScroll = function( player ) {
            that.setScrolling(player);
        };

        this.playerCallBackOnPlay = function( player ) {
            var strTime = player.getTime().cTime;
            if(that.gotoMeasureButton && ! parseInt(that.untilMeasureButton.value))
                that.gotoMeasureButton.value = player.currentMeasure;
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = strTime;
            
            that.midiPlayer.setPlayableClefs( that.clefsToPlay );

        };

        this.playerCallBackOnEnd = function( player ) {
            var warns = that.midiPlayer.getWarnings();
            that.playButton.title = DR.getResource("playBtn");
            that.playButton.innerHTML = '&#160;<i class="ico-play"></i>&#160;';
            that.renderedTune.printer.clearSelection();
            that.accordion.clearKeyboard(true);
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = "00:00.00";
            if( warns ) {
                var wd =  document.getElementById("warningsDiv");
                var txt = "";
                warns.forEach(function(msg){ txt += msg + '<br/>'; });
                wd.style.color = 'blue';
                wd.innerHTML = txt;
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

SITE.Estudio.prototype.resize = function( ) {
    
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || daocument.body.clientWidth;

    // -paddingTop 78
    var h = (winH -78 - 10 ); 
    var w = (winW - 10 ); 
    
    this.studioDiv.topDiv.style.height = Math.max(h,200) +"px";
    this.studioDiv.topDiv.style.width = Math.max(w,400) +"px";
    this.studioDiv.dataDiv.style.height = "100%";
   
    var e = 0;
    var t = this.studioDiv.dataDiv.clientHeight;
    if(window.getComputedStyle(this.editareaFixa.container.topDiv).display !== 'none') {
        e = this.editareaFixa.container.topDiv.clientHeight+4;
    }
    var c = this.controlDiv.clientHeight;

    this.studioCanvasDiv.style.height = (t-e-c-6) +"px";
    
    this.posicionaTeclado();
    
};

SITE.Estudio.prototype.setVisible = function(  visible ) {
    this.studioDiv.parent.style.display = visible?'block':'none';
};

SITE.Estudio.prototype.setup = function( mapa, tab, accordionId) {
    
    //window.getComputedStyle( tab.selector ).display !== 'none'
    //this.setupProps();
    
    this.setVisible(true);
    this.resize();
    this.mapa = mapa;
    
    this.accordion.loadById(accordionId);
    
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    this.renderedTune.abc = tab.abc;
    
    this.setString(this.renderedTune.text);
    this.editorWindow.setVisible(true);
    this.editorWindow.resize(true);
    
    this.editorWindow.container.setTitle('-&#160;' + tab.title);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    this.studioDiv.setTitle( '-&#160;' + this.accordion.getTxtModel() );

    this.studioCanvasDiv.scrollTop = 0;
    
    this.fireChanged2(0,'force');
};

SITE.Estudio.prototype.showMap = function() {
    this.mapVisible = ! this.mapVisible;
    this.accordion.loadedKeyboard.render_opts.show = this.mapVisible;
    if(this.mapVisible) {
        this.keyboardWindow.setVisible(true);
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('I_showMap').setAttribute('class', 'ico-folder-open' );
    } else {
        this.hideMap();
    }
};

SITE.Estudio.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.loadedKeyboard.render_opts.show = this.mapVisible;
    this.keyboardWindow.setVisible(false);
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('I_showMap').setAttribute('class', 'ico-folder' );
};

SITE.Estudio.prototype.showEditor = function() {
    this.editorVisible = ! this.editorVisible;
    if(this.editorVisible) {
        this.editorWindow.setVisible(this.editorVisible);
        document.getElementById('I_showEditor').setAttribute('class', 'ico-folder-open' );
        this.resize();
    } else {
        this.hideEditor();
    }
};

SITE.Estudio.prototype.hideEditor = function() {
    document.getElementById('I_showEditor').setAttribute('class', 'ico-folder' );
    this.editorWindow.setVisible(false);
    this.editorVisible = false;
    this.resize();
};



SITE.Estudio.prototype.editorCallback = function (e) {
    //    this.keySelector = new ABCXJS.edit.KeySelector(ks, this);
    //    
    //    document.getElementById('octaveUpBtn').addEventListener("click", function (evt) {
    //        evt.preventDefault();
    //        this.blur();
    //        that.editorChanged(12, "force");
    //    }, false);
    //    
    //    document.getElementById('octaveDwBtn').addEventListener("click", function (evt) {
    //        evt.preventDefault();
    //        this.blur();
    //        that.editorChanged(-12, "force");
    //    }, false);
    //    
    //    document.getElementById('forceRefresh2').addEventListener("click", function (evt) {
    //        evt.preventDefault();
    //        this.blur();
    //        that.editorChanged(0, "force");
    //    }, false);
    //
    //   DR.forcedResource('forceRefresh', 'Atualizar', '2', 'forceRefresh2');
    switch(e) {
        case 'GUTTER': // liga/desliga a numeracao de linhas
            this.editorWindow.setGutter();
            break;
        case 'LIGHT': // liga/desliga realce de sintaxe
            this.editorWindow.setSyntaxHighLight();
            break;
        case 'POPIN':
            this.editorWindow.setVisible(false);
            this.editorWindow = this.editareaFixa;
            this.editorWindow.setString(this.editareaMovel.getString());
            this.editorWindow.setVisible(true);
            this.editorWindow.resize();
            this.resize();
            break;
        case 'POPOUT':
            this.editorWindow.setVisible(false);
            this.editorWindow = this.editareaMovel;
            this.editorWindow.setString(this.editareaFixa.getString());
            this.editorWindow.setVisible(true);
            this.editorWindow.resize();
            this.resize();
            break;
        case 'MOVE':
            //var k = this.keyboardWindow.topDiv;
            //FILEMANAGER.saveLocal( 'property.keyboardDiv.settings',  k.style.top  + '|' + k.style.left );
            break;
        case 'CLOSE':
            this.hideEditor();
            break;
        case 'RESIZE':
            this.editorWindow.resize(true);
            break;
    }
};

SITE.Estudio.prototype.studioCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.setVisible(false);
            this.mapa.showMapa(true);
            break;
        case 'RESTORE':
            break;
    }
};

SITE.Estudio.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            break;
        case 'CLOSE':
            this.hideMap();
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            break;
        default:
            alert(e);
    }
};


SITE.Estudio.prototype.getString = function() {
    return this.editorWindow.getString();
};

SITE.Estudio.prototype.setString = function(str) {
    this.editorWindow.setString(str);
};

SITE.Estudio.prototype.setScrolling = function(player) {
    if( !this.studioCanvasDiv || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.studioCanvasDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        
        this.ypos = top;
        this.studioCanvasDiv.scrollTop = this.ypos;    
    }

};

SITE.Estudio.prototype.translate = function( ) {
    //this.initEditArea( "editorTextArea" );
}; 

SITE.Estudio.prototype.changePageOrientation = function (orientation) {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = '@page {margin: 1cm; size: ' + orientation + '}';

};

SITE.Estudio.prototype.printPreview = function (html, landscape ) {
    
    var dv = document.getElementById('printPreviewDiv');
    
    this.changePageOrientation(landscape? 'landscape': 'portrait');
    
    dv.style.display = 'block';
    dv.innerHTML = html;
    window.print();
    dv.style.display = 'none';
    
};

SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.parseABC(0);
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};
SITE.Estudio.prototype.changePlayMode = function() {
    if( this.currentMode === "normal" ) {
        $("#divNormalPlayControls" ).hide();
        this.currentMode  = "learning";
        this.modeButton.innerHTML = '<i class="m-ico-learning-4" ></i>';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divDidacticPlayControls" ).fadeIn();
    } else {
        $("#divDidacticPlayControls" ).hide();
        this.currentMode  = "normal";
        this.modeButton.innerHTML = '<i class="m-ico-headphones" ></i>';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divNormalPlayControls" ).fadeIn();
    }
};

SITE.Estudio.prototype.posicionaTeclado = function( ) {
    var w = window.innerWidth;
    
    var k = this.keyboardWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    k.style.left = x+"px";
};

SITE.Estudio.prototype.startPlay = function( type, value, valueF ) {
    this.ypos = this.studioCanvasDiv.scrollTop;
    this.lastStaffGroup = -1;
    
    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="ico-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        this.editorWindow.setReadOnly(true);
        this.editorWindow.aceEditor.container.style.pointerEvents="none"

        this.StartPlayWithTimer(this.renderedTune.abc.midi, type, value, valueF, this.timerOn ? 10: 0 );
        
    }
};

SITE.Estudio.prototype.setTimerIcon = function( timerOn, value ) {
    value = value || 0;
    
    
    
    var ico = '400';
    if( timerOn ) {
        switch( value ) {
            case 0:  ico = '300'; break;
            case 1:  ico = '000'; break;
            case 2: ico = '033'; break;
            case 3: ico = '066'; break;
            case 6: ico = '100'; break;
            case 9: ico = '200'; break;
            default: ico = '';
        }
    }
    if( ico !== ''  ) {
        if( ico !== '400' && ico !== '300') {
            MIDI.noteOn(0,  90, 100, 0 );
            MIDI.noteOff(0, 90, value > 3 ? 0.10 : 0.05  );
        }
        this.timerButton.innerHTML = '<i class="m-ico-timer-'+ico+'" ></i>';
    }
};

SITE.Estudio.prototype.StartPlayWithTimer = function(midi, type, value, valueF, counter ) {
     var that = this;
    
    if( type !== 'note' && this.timerOn && counter > 0 ) {
        that.setTimerIcon( that.timerOn, counter );
        counter -= 1;
        window.setTimeout(function(){that.StartPlayWithTimer(midi, type, value, valueF, counter); }, 1000.0/3 );
    } else {
        that.setTimerIcon( that.timerOn, 0 );
        if(type==="normal") {
            this.midiPlayer.setPlayableClefs('TB');
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                ga('send', 'event', 'Estúdio', 'play', this.renderedTune.title);
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            this.midiPlayer.setPlayableClefs( this.clefsToPlay );
            ga('send', 'event', 'Estúdio', 'didactic-play', this.renderedTune.title);
            this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value, valueF );
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
    
    var abcParser = new ABCXJS.parse.Parse( this.transposer, this.accordion );
    
    abcParser.parse(this.getString(), this.parserparams );
    
    this.renderedTune.abc = abcParser.getTune();
    this.renderedTune.text = abcParser.getStrTune();
    
    // transposição e geracao de tablatura podem ter alterado o texto ABC
    this.parsing = true; // tratar melhor essa forma de inibir evento change da editarea durante a atualização da string
    this.setString( this.renderedTune.text );
    delete this.parsing;
    
    if( this.transposer && this.keySelector ) {
        this.keySelector.set( this.transposer.keyToNumber( this.transposer.getKeyVoice(0) ) );       
    }
    
    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
        this.warnings.push(warnings[j]);
    }
    
    if ( this.midiParser ) {
        this.midiParser.parse( this.renderedTune.abc, this.accordion.loadedKeyboard );
        var warnings = this.midiParser.getWarnings();
        for (var j=0; j<warnings.length; j++) {
           this.warnings.push(warnings[j]);
        }
    }
    
    return this.renderedTune.abc;
    
};        

SITE.Estudio.prototype.onChange = function() {
    this.studioCanvasDiv.scrollTop = this.lastYpos;
    this.resize();
};

SITE.Estudio.prototype.fireChanged = function (transpose, force) {
    var self = this;
    var loader = this.startLoader( "FC" );
    loader.start(  function() { self.fireChanged2(transpose, force, loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};

SITE.Estudio.prototype.fireChanged2 = function (transpose, force, loader) {

    if( force || this.oldAbcText !== this.getString() ) {
        
        this.oldAbcText = this.getString();
    
        this.lastYpos = this.studioCanvasDiv.scrollTop || 0;               

        if( this.parseABC(transpose) ) {
            this.modelChanged();
        }
    }
    
    if(loader) {
        loader.stop();
    }    
};

SITE.Estudio.prototype.modelChanged = function() {
    
    this.renderedTune.div.innerHTML = "";
    if (this.renderedTune.abc === undefined) {
        return;
    }

    var paper = new SVG.Printer( this.renderedTune.div );
    this.renderedTune.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    //this.renderedTune.printer.printTune( this.renderedTune.abc, {color:'black', backgroundColor:'#ffd'} );
    this.renderedTune.printer.printTune( this.renderedTune.abc ); 
    
    if (this.warningsDiv) {
        this.warningsDiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsDiv.innerHTML = (this.warnings.length > 0 ? this.warnings.join("<br/>") : "No warnings or errors.") ;
    }
    
    this.renderedTune.printer.addSelectListener(this);
    this.updateSelection();
    
    if (this.onchangeCallback) {
        this.onchangeCallback(this);
    }    
    
};

SITE.Estudio.prototype.highlight = function(abcelem) {
    if(this.editorVisible) {
        this.editorWindow.setSelection(abcelem);
    }    
    if(this.mapVisible && !this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
    }    
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.Estudio.prototype.unhighlight = function(abcelem) {
    if(this.editorVisible) {
        this.editorWindow.clearSelection(abcelem);
    }    
};

SITE.Estudio.prototype.updateSelection = function (force) {
    var that = this;
    if( force ) {
        var selection = that.editorWindow.getSelection();
        try {
            that.renderedTune.printer.rangeHighlight(selection);
        } catch (e) {
        } // maybe printer isn't defined yet?
        delete this.updating;
    } else {
        if( this.updating ) return;
        this.updating = true;
        setTimeout( that.updateSelection(true), 300 );
    }
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
