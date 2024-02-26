
if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.Estudio = function (mapa, interfaceParams, playerParams) {
    
    this.mapa = mapa;
    
    // incluir ilheiras numeradas e hide fingering flavio2022
    this.parserparams = {}

    this.ypos = 0; // controle de scrollf
    this.lastStaffGroup = -1; // controle de scroll
    this.lastYpos = 0; // controle de scroll
    var that = this;
    
    var canvas_id = 'canvasDiv';
    var warnings_id = 'warningsDiv';

    this.warnings = [];
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.studioDiv
        , null
        , {translator: SITE.translator, statusbar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'EstudioTitle'}
        , {listener: this, method: 'studioCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    if (interfaceParams.generate_tablature) {
        if (interfaceParams.generate_tablature === 'accordion') {
            this.accordion = new window.ABCXJS.tablature.Accordion( 
                interfaceParams.accordion_options 
              , SITE.properties.options.tabFormat 
              ,!SITE.properties.options.tabShowOnlyNumbers 
              , SITE.properties.options.rowsNumbered
            );
            if (interfaceParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(interfaceParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + interfaceParams.generate_tablature + ' não suportada!');
        }
    }
    
    this.editorWindow = new ABCXJS.edit.EditArea(
        this.Div.dataDiv
       ,{listener : this, method: 'editorCallback' }
       ,{   draggable:SITE.properties.studio.editor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'EstudioEditorTitle'
           ,compileOnChange: SITE.properties.options.autoRefresh
        }
    );
    this.editorWindow.setVisible(false);

    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'controlDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.studioControlDiv).innerHTML;
    document.getElementById(interfaceParams.studioControlDiv).innerHTML = "";

    this.media = new SITE.Media( this.Div.dataDiv, interfaceParams.btShowMedia, SITE.properties.studio.media, false ); 
    
    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        this.Div.dataDiv
       ,[ 'move', 'rotate', 'zoom', 'globe']
       ,{title: '', translator: SITE.translator, statusbar: false
            , top: SITE.properties.studio.keyboard.top
            , left: SITE.properties.studio.keyboard.left
       } 
      ,{listener: this, method: 'keyboardCallback'}
    );
    
    this.accordion.setRenderOptions({
        draggable: true
       ,show: SITE.properties.studio.keyboard.visible
       ,transpose: SITE.properties.studio.keyboard.transpose
       ,mirror: SITE.properties.studio.keyboard.mirror
       ,scale: SITE.properties.studio.keyboard.scale
       ,label: SITE.properties.studio.keyboard.label
    });
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", interfaceParams.studioCanvasDiv );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    this.studioCanvasDiv.appendChild(this.canvasDiv);
    
    this.renderedTune.div = this.canvasDiv;
    
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);
    
    if(this.ps)
        this.ps.destroy();
    
    this.ps = new PerfectScrollbar( this.studioCanvasDiv, {
        handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
        wheelSpeed: 1,
        wheelPropagation: false,
        suppressScrollX: false,
        minScrollbarLength: 100,
        swipeEasing: true,
        scrollingThreshold: 500
    });
    
    
    if( interfaceParams.onchange ) {
        this.onchangeCallback = interfaceParams.onchange;
    }
    
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.forceRefreshButton = document.getElementById(interfaceParams.forceRefresh);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);

    // player control
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.lyricsButton = document.getElementById(playerParams.lyricsBtn);
    this.fingeringButton = document.getElementById(playerParams.fingeringBtn);
    this.tabformatButton = document.getElementById(playerParams.tabformatBtn);
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
    this.tempoButton = document.getElementById(playerParams.tempoSld);

    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showKeyboard();
    }, false);

    this.showEditorButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showEditor();
    }, false);

    this.forceRefreshButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.fireChanged(0, {force:true, showProgress:true } );
    }, false);
    
    this.saveButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.salvaMusica();
    }, false);
    
    this.printButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        
        SITE.ga( 'event', 'print', { 
            event_category: 'Mapa'  
           ,event_label: that.renderedTune.title
        });
        
        that.mapa.printPreview(that.renderedTune.div.innerHTML, ["#topBar","#studioDiv"], that.renderedTune.abc.formatting.landscape);
        return;

    }, false);

    this.modeButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        that.changePlayMode();
    }, false);

    this.lyricsButton.addEventListener('click', function (evt) {
        if(that.midiPlayer.playing) that.studioStopPlay();
        evt.preventDefault();
        this.blur();
        SITE.properties.options.lyrics = !SITE.properties.options.lyrics;
        that.parserparams.hideLyrics = !SITE.properties.options.lyrics;

        that.setLyricsIcon();
        that.fireChanged(0, {force:true, showProgress:true } );
    }, false);

    this.fingeringButton.addEventListener('click', function (evt) {
        if(that.midiPlayer.playing) that.studioStopPlay();
        evt.preventDefault();
        this.blur();
        SITE.properties.options.fingering = !SITE.properties.options.fingering;
        that.parserparams.hideFingering = !SITE.properties.options.fingering;

        that.setFingeringIcon();
        that.fireChanged(0, {force:true, showProgress:true } );
    }, false);

    this.tabformatButton.addEventListener('click', function (evt) {
        if(that.midiPlayer.playing) that.studioStopPlay();
        evt.preventDefault();
        this.blur();
        if( this.currentTabF  === undefined ) {
            this.currentTabF = 1
        } 

        switch(this.currentTabF) {
            case 0: // alemã - ilheiras com apóstrofes
                this.currentTabF = 1;
                SITE.properties.options.tabFormat = 0
                SITE.properties.options.rowsNumbered = false;
                SITE.properties.options.tabShowOnlyNumbers= true;
                that.parserparams.ilheirasNumeradas = SITE.properties.options.rowsNumbered;
                break;
            case 1: // alemã - ilheiras numeradas
                this.currentTabF = 2;
                SITE.properties.options.tabFormat = 0
                SITE.properties.options.rowsNumbered = true;
                break;
            case 2: // numerica ciclica 
                this.currentTabF = 3;
                SITE.properties.options.tabFormat = 1
                SITE.properties.options.tabShowOnlyNumbers= false;
                SITE.properties.options.rowsNumbered = false;
                break;
            case 3: // numerica ciclica - somente números
                this.currentTabF = 4;
                SITE.properties.options.tabFormat = 1
                SITE.properties.options.tabShowOnlyNumbers= true;
                break;
            case 4: // numerica continua
                this.currentTabF = 5;
                SITE.properties.options.tabShowOnlyNumbers= false;
                SITE.properties.options.tabFormat = 2
                break;
            case 5: // numerica continua - somente números
                this.currentTabF = 0;
                SITE.properties.options.tabShowOnlyNumbers= true;
                SITE.properties.options.tabFormat = 2
                break;
        }

        that.accordion.setFormatoTab(
              SITE.properties.options.tabFormat
            ,!SITE.properties.options.tabShowOnlyNumbers
            , SITE.properties.options.rowsNumbered
        );

        that.accordion.printKeyboard(that.keyboardWindow.dataDiv);

        that.fireChanged(0, {force:true, showProgress:false } );

    }, false);

    this.timerButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        SITE.properties.studio.timerOn = ! SITE.properties.studio.timerOn;
        that.setTimerIcon( 0 );
    }, false);
    
    this.FClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        SITE.properties.studio.bassOn = ! SITE.properties.studio.bassOn;
        that.setBassIcon();
    }, false);

    this.GClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        SITE.properties.studio.trebleOn = ! SITE.properties.studio.trebleOn;
        that.setTrebleIcon();
    }, false);

    this.playButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        window.setTimeout(function(){ that.startPlay( 'normal' );}, 0 );
    }, false);

    this.stopButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.blockEdition(false);
        if(that.currentPlayTimeLabel)
           that.currentPlayTimeLabel.innerHTML = "00:00";
        that.studioStopPlay();
    }, false);

    this.clearButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.currentPlayTimeLabel.innerHTML = "00:00";
        that.blockEdition(false);
        that.studioStopPlay();
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
        if(!that.midiPlayer.playing)
            that.startPlay('repeat', that.gotoMeasureButton.value, that.untilMeasureButton.value );
    }, false);

    this.slider = new DRAGGABLE.ui.Slider( this.tempoButton,
        {
            min: 25, max: 200, start:100, step:25, speed:100, color: 'white', bgcolor:'red', size:{w:115, h:23, tw:48},
            callback: function(v) { that.midiPlayer.setAndamento(v); } 
        } 
    );

    this.gotoMeasureButton.addEventListener("keypress", function (evt) {
        if (evt.keyCode === 13) {
            that.startPlay('goto', this.value, that.untilMeasureButton.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function (evt) {
        if (this.value === SITE.translator.getResource("gotoMeasure").val) {
            this.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function (evt) {
        if (this.value === "") {
            this.value = SITE.translator.getResource("gotoMeasure").val;
        }
    }, false);
    
    this.untilMeasureButton.addEventListener("keypress", function (evt) {
        if (evt.keyCode === 13) {
            that.startPlay('goto', that.gotoMeasureButton.value, this.value);
        }
    }, false);

    this.untilMeasureButton.addEventListener("focus", function (evt) {
        if (this.value === SITE.translator.getResource("untilMeasure").val) {
            this.value = "";
        }
    }, false);

    this.untilMeasureButton.addEventListener("blur", function (evt) {
        if (this.value === "") {
            this.value = SITE.translator.getResource("untilMeasure").val;
        }
    }, false);
    
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling(player);
    };

    this.playerCallBackOnPlay = function( player ) {
        var strTime = player.getTime().cTime;
        if(that.gotoMeasureButton && ! parseInt(that.untilMeasureButton.value))
            that.gotoMeasureButton.value = player.currentMeasure;
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = strTime;

        that.midiPlayer.setPlayableClefs( (SITE.properties.studio.trebleOn?"T":"")+(SITE.properties.studio.bassOn?"B":"") );
    };

    this.playerCallBackOnEnd = function( player ) {
        var warns = that.midiPlayer.getWarnings();
        that.playButton.title = SITE.translator.getResource("playBtn");
        that.playButton.innerHTML = '&#160;<i class="ico-play"></i>&#160;';
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.blockEdition(false);
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
    
};

SITE.Estudio.prototype.setup = function( tab, accordionId) {
    
    if(this.mapa)
        this.mapa.closeMapa();
    
    this.accordion.loadById(accordionId);
    
    this.renderedTune.abc = tab.abc;
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    
    this.changePlayMode(SITE.properties.studio.mode);
    this.setBassIcon();
    this.setTrebleIcon();
    this.setTimerIcon( 0 );
    
    this.setVisible(true);
    this.setString(tab.text);
    this.fireChanged(0, {force:true} );
    this.Div.setSubTitle( '- ' + this.accordion.getTxtModel() );
    this.studioCanvasDiv.scrollTop = 0;

    this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    
    this.showEditor(SITE.properties.studio.editor.visible);

    this.editorWindow.container.setSubTitle( '- ' + tab.title );
    this.editorWindow.restartUndoManager();
    
    if(SITE.properties.studio.editor.floating) {
        if( SITE.properties.studio.editor.maximized ) {
            this.editorWindow.setFloating(true);
            this.editorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.editorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.editorWindow.container.dispatchAction('POPIN');
    }

    this.showKeyboard(SITE.properties.studio.keyboard.visible);

    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    
    SITE.translator.translate( this.Div.topDiv );
};

SITE.Estudio.prototype.resize = function( ) {
    
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    // -paddingTop 78
    var h = (winH -78 - 10 ); 
    var w = (winW - 8 ); 
    
    this.Div.topDiv.style.left = "3px";
    this.Div.topDiv.style.top = "82px";
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w,400) +"px";
   
    var w = 0, e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    if(! SITE.properties.showWarnings) {
        w = this.warningsDiv.clientHeight;
    }
    
    if(! SITE.properties.studio.editor.floating) {
        e = this.editorWindow.container.topDiv.clientHeight+4;
    }

    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";
    
    this.posicionaTeclado();
    this.editorWindow.resize();
    
    (this.ps) && this.ps.update();
    
};

SITE.Estudio.prototype.showKeyboard = function(show) {
    SITE.properties.studio.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.studio.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.studio.keyboard.visible;
    
    if(SITE.properties.studio.keyboard.visible) {
        this.keyboardWindow.setVisible(true);
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('I_showMap').setAttribute('class', 'ico-folder-open' );
        this.posicionaTeclado();
    } else {
        this.accordion.render_opts.show = false;
        this.keyboardWindow.setVisible(false);
        document.getElementById('I_showMap').setAttribute('class', 'ico-folder' );
    }
};

SITE.Estudio.prototype.showEditor = function(show) {
    SITE.properties.studio.editor.visible = 
            (typeof show === 'undefined'? ! SITE.properties.studio.editor.visible : show );
    
    if(SITE.properties.studio.editor.visible) {
        this.editorWindow.setVisible(true);
        this.editorWindow.resize();
        document.getElementById('I_showEditor').setAttribute('class', 'ico-folder-open' );
    } else {
        document.getElementById('I_showEditor').setAttribute('class', 'ico-folder' );
        this.editorWindow.setVisible(false);
    }
    this.resize();
};

SITE.Estudio.prototype.editorCallback = function (action, elem) {
    switch(action) {
        case '0': 
            break;
        case  '1':  case  '2':  case  '3':  case   '4': case   '5': case '6': 
        case  '7':  case  '8':  case  '9':  case  '10': case  '11': 
        case '-1':  case '-2':  case '-3':  case  '-4': case  '-5': case '-6': 
        case '-7':  case '-8':  case '-9':  case '-10': case '-11': 
            this.fireChanged( parseInt(action), {force:true} );
           break;
        case 'OCTAVEUP': 
           this.fireChanged(12, {force:true} );
           break;
        case 'OCTAVEDOWN': 
           this.fireChanged(-12, {force:true} );
           break;
        case 'REFRESH': 
           this.fireChanged(0, {force:true} );
           break;
        case 'DOWNLOAD': 
           this.salvaMusica();
           break;
        case 'MAXIMIZE': 
            this.editorWindow.maximizeWindow( true, SITE.properties.studio.editor );
            break;
        case 'RESTORE': 
            this.editorWindow.maximizeWindow( false, SITE.properties.studio.editor );
            break;
        case 'POPIN':
            this.editorWindow.dockWindow(true, SITE.properties.studio.editor, 0, 0, "calc(100% - 5px)", "200px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.editorWindow.dockWindow(false, SITE.properties.studio.editor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.editorWindow.retrieveProps( SITE.properties.studio.editor );
            break;
        case 'CLOSE':
            this.showEditor(false);
            break;
    }
};

SITE.Estudio.prototype.studioCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.closeEstudio(true);
            break;
    }
};

SITE.Estudio.prototype.studioStopPlay = function( e ) {
    this.midiPlayer.stopPlay();
};

SITE.Estudio.prototype.closeEstudio = function(save) {
    var self = this;
    if(!this.mapa){
        self.setVisible(false);
        self.studioStopPlay();
    } else {
        var loader = SITE.startLoader( "CloseStudio", self.studioCanvasDiv );
        loader.start(  function() { 
            (save) && SITE.SaveProperties();
            self.studioStopPlay();
            self.mapa.openMapa( self.getString() );
            self.setVisible(false);
            loader.stop();
        }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
    }
};
        
SITE.Estudio.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};

SITE.Estudio.prototype.setAutoRefresh = function( value ) {
    this.editorWindow.setCompileOnChange(value);
};

SITE.Estudio.prototype.getString = function() {
    return this.editorWindow.getString();
};

SITE.Estudio.prototype.setString = function(str) {
    this.editorWindow.setString(str);
};

SITE.Estudio.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            var k = this.keyboardWindow.topDiv.style;
            SITE.properties.studio.keyboard.left = k.left;
            SITE.properties.studio.keyboard.top = k.top;
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.studio.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.studio.keyboard.mirror = this.accordion.render_opts.mirror;
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.studio.keyboard.scale = this.accordion.render_opts.scale;
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            SITE.properties.studio.keyboard.label = this.accordion.render_opts.label;
            break;
        case 'CLOSE':
            this.showKeyboard(false);
            break;
    }
};

SITE.Estudio.prototype.setScrolling = function(player) {
    if( !this.studioCanvasDiv || !player.currAbsElem || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.studioCanvasDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top-12;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        
        this.ypos = top;
        this.studioCanvasDiv.scrollTop = this.ypos;    
    }
};

SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.fireChanged(0, {force:false, showProgress:true } );
        //this.parseABC(0, true );
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};
SITE.Estudio.prototype.changePlayMode = function(mode) {
    
    SITE.properties.studio.mode = mode? mode : 
            (SITE.properties.studio.mode==="normal"? "learning":"normal");
    
    this.midiPlayer.setAndamento( this.slider.getValue() );
    
    if( SITE.properties.studio.mode === "normal" ) {
        $("#divDidacticPlayControls" ).hide();
        SITE.properties.studio.mode  = "normal";
        this.modeButton.innerHTML = '<i class="ico-listening" ></i>';
        $("#divNormalPlayControls" ).fadeIn();
    } else {
        $("#divNormalPlayControls" ).hide();
        SITE.properties.studio.mode  = "learning";
        this.modeButton.innerHTML = '<i class="ico-learning" ></i>';
        $("#divDidacticPlayControls" ).fadeIn();
    }
};

SITE.Estudio.prototype.posicionaTeclado = function() {
    
    if( ! SITE.properties.studio.keyboard.visible ) return;
    
    var w = window.innerWidth;
    
    var k = this.keyboardWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    k.style.left = x+"px";
};

SITE.Estudio.prototype.blockEdition = function( block ) {
    this.editorWindow.setReadOnly(!block);
    this.editorWindow.container.dispatchAction('READONLY');
    if( block ) {
        this.editorWindow.setEditorHighLightStyle();
    } else {
        this.editorWindow.clearEditorHighLightStyle();
        this.editorWindow.aceEditor.focus();
    }
};

SITE.Estudio.prototype.startPlay = function( type, value, valueF ) {
    this.ypos = this.studioCanvasDiv.scrollTop;
    this.lastStaffGroup = -1;
    var that = this;
    
    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = SITE.translator.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="ico-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        this.blockEdition(false);
        
    } else {
        this.accordion.clearKeyboard();
        if (type === "normal" ) {
            this.blockEdition(true);
        }
        
        // esse timeout é só para garantir o tempo para iniciar o play
        window.setTimeout(function(){that.StartPlayWithTimer(that.renderedTune.abc.midi, type, value, valueF, SITE.properties.studio.timerOn ? 10 : 0); }, 0 );
    }
};

SITE.Estudio.prototype.setBassIcon = function() {
    if( SITE.properties.studio.bassOn ) {
        this.FClefButton.innerHTML = '<i class="ico-clef-bass" ></i>';
    } else {
        this.FClefButton.innerHTML = '<i class="ico-clef-bass" style="opacity:0.5; filter: grayscale(1);"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px; filter: grayscale(1);"></i>';
    }
};

SITE.Estudio.prototype.setTrebleIcon = function() {
    if( SITE.properties.studio.trebleOn ) {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" ></i>';
    } else {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" style="opacity:0.5; filter: grayscale(1);"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px; filter: grayscale(1);"></i>';
    }
};

SITE.Estudio.prototype.setTimerIcon = function( value ) {
    value = value || 0;
    
    var ico = '00';
    if( SITE.properties.studio.timerOn ) {
        switch( value ) {
            case 0:  ico = '00'; break;
            case 1:  ico = '05'; break;
            case 2:  ico = '15'; break;
            case 3:  ico = '20'; break;
            case 6:  ico = '30'; break;
            case 9:  ico = '45'; break;
            default: ico = '';
        }
        if( ico !== ''  ) {
            if( ico !== '00' ) {
                MIDI.noteOn(0,  90, 100, 0 );
                MIDI.noteOff(0, 90, value > 3 ? 0.10 : 0.05  );
            }
            this.timerButton.innerHTML = '<i class="ico-timer-'+ico+'" ></i>';
        }
    } else {
        this.timerButton.innerHTML = '<i class="ico-timer-00" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};

SITE.Estudio.prototype.setLyricsIcon = function( ) {
    if( SITE.properties.options.lyrics ) {
        this.lyricsButton.innerHTML = '<i class="ico-letter-l" ></i>';
    } else {
        this.lyricsButton.innerHTML = '<i class="ico-letter-l" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};

SITE.Estudio.prototype.setFingeringIcon = function( ) {
    if( SITE.properties.options.fingering ) {
        this.fingeringButton.innerHTML = '<i class="ico-alien-fingering" ></i>';
    } else {
        this.fingeringButton.innerHTML = '<i class="ico-alien-fingering" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};

SITE.Estudio.prototype.StartPlayWithTimer = function(midi, type, value, valueF, counter ) {
     var that = this;
    
    if( type !== 'note' && SITE.properties.studio.timerOn && counter > 0 ) {
        that.setTimerIcon( counter );
        counter -= 1;
        window.setTimeout(function(){that.StartPlayWithTimer(midi, type, value, valueF, counter); }, 1000.0/3 );
    } else {
        that.setTimerIcon( 0 );
        if(type==="normal") {
            this.midiPlayer.setPlayableClefs('TB');
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                
                SITE.ga( 'event', 'play', { 
                    event_category: 'Mapa'  
                   ,event_label: this.renderedTune.title
                });
                
                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML = '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            this.midiPlayer.setPlayableClefs( (SITE.properties.studio.trebleOn?"T":"")+(SITE.properties.studio.bassOn?"B":"") );
            
            SITE.ga( 'event', 'didactic-play', { 
                event_category: 'Mapa'  
               ,event_label: this.renderedTune.title
            });

            this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value, valueF );
        }
    }
};

SITE.Estudio.prototype.parseABC = function (transpose, force) {

    var text = this.getString();

    this.warnings = [];

    if (text === "") {
        this.renderedTune.text = this.initialText = this.renderedTune.abc = undefined;
        return true;
    }

    if (text === this.initialText && !force) {
        this.updateSelection();
        return false;
    }

    if (typeof transpose !== "undefined") {
        if (this.transposer)
            this.transposer.reset(transpose);
        else
            this.transposer = new ABCXJS.parse.Transposer(transpose);
    }

    if (!this.abcParser)
        this.abcParser = new ABCXJS.parse.Parse(this.transposer, this.accordion);
    try {
        this.abcParser.parse(text, this.parserparams);

        this.renderedTune.abc = this.abcParser.getTune();
        this.renderedTune.text = this.initialText = this.abcParser.getStrTune();
    } catch(e) {
        waterbug.log( 'Could not parse ABC.' );
        waterbug.show();
    }

    // transposição e geracao de tablatura podem ter alterado o texto ABC
    if (text !== this.initialText)
        this.setString(this.renderedTune.text);

    if (this.transposer && this.editorWindow.keySelector) {
        this.editorWindow.keySelector.populate(this.transposer.keyToNumber(this.transposer.getKeyVoice(0)));
    }

    var warnings = this.abcParser.getWarnings() || [];
    for (var j = 0; j < warnings.length; j++) {
        this.warnings.push(warnings[j]);
    }

    if (this.midiParser) {
        this.midiParser.parse(this.renderedTune.abc, this.accordion.loadedKeyboard);
        this.midiPlayer.reset();
        this.midiPlayer.setAndamento( this.slider.getValue() );
        var warnings = this.midiParser.getWarnings();
        for (var j = 0; j < warnings.length; j++) {
            this.warnings.push(warnings[j]);
        }
    }

    return true;

};

SITE.Estudio.prototype.onChange = function() {
    this.studioCanvasDiv.scrollTop = this.lastYpos;
    this.resize();
};

SITE.Estudio.prototype.fireChanged = function (transpose, _opts) {
    
    if( this.changing ) return;

    //necessário garantir que o midiplayer esteja parado antes de atualizar a partitura
    if( this.midiPlayer.playing ) this.midiPlayer.stopPlay();
    
    this.lastYpos = this.studioCanvasDiv.scrollTop || 0;               
    
    this.changing = true;
    var opts = _opts || {};
    var force = opts.force || false;
    var showProgress = opts.showProgress || false;

    if (this.parseABC(transpose, force)) {
        this.modelChanged(showProgress);
    } else {
        delete this.changing;
    }
};

SITE.Estudio.prototype.modelChanged = function(showProgress) {
    var self = this;
    if(showProgress) {
        var loader = SITE.startLoader( "ModelChanged", self.studioCanvasDiv );
        loader.start(  function() { self.onModelChanged(loader); }, '<br>&nbsp;&nbsp;&nbsp;Gerando partitura...<br><br>' );
    } else {
        self.onModelChanged();
    }    
};

SITE.Estudio.prototype.onModelChanged = function(loader) {
    
    this.renderedTune.div.innerHTML = "";
    this.renderedTune.div.style.display = "none";
    
    if (this.renderedTune.abc === undefined) {
        delete this.changing;
        return;
    }

    this.renderedTune.div.style.display = "";
    var paper = new SVG.Printer( this.renderedTune.div );
    this.renderedTune.printer = new ABCXJS.write.Printer(paper, this.printerparams, this.accordion.loadedKeyboard );
    //this.renderedTune.printer.printTune( this.renderedTune.abc, {color:'black', backgroundColor:'#ffd'} );
    this.renderedTune.printer.printTune( this.renderedTune.abc, this.parserparams ); 
    
    if (this.warningsDiv) {
        this.warningsDiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsDiv.innerHTML = (this.warnings.length > 0 ? this.warnings.join("<br/>") : "No warnings or errors.") ;
    }
    
    this.renderedTune.printer.addSelectListener(this);
    this.updateSelection();
    
    if (this.onchangeCallback) {
        this.onchangeCallback(this);
    }    
    if( loader ) {
        loader.update( false, '<br>&nbsp;&nbsp;&nbsp;Gerando tablatura...<br><br>' );
        loader.stop();
    }
    
    this.media.show(this.renderedTune);
    
    delete this.changing;
    
};

SITE.Estudio.prototype.highlight = function(abcelem) {
    if( !this.midiPlayer.playing) {
        if(SITE.properties.studio.keyboard.visible ) {
            this.accordion.clearKeyboard(true);
            this.midiParser.setSelection(abcelem);
        }
        if(SITE.properties.studio.editor.visible) {
            this.editorWindow.setSelection(abcelem);
        }    
    }    
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.Estudio.prototype.unhighlight = function(abcelem) {
    if(SITE.properties.studio.editor.visible) {
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
