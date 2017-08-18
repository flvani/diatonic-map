/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.PartGen = function( interfaceParams ) {
    var that = this;
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.partGenDiv
        , null
        , {translate: false, statusbar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'Gerador de Partituras'}
        , {listener: this, method: 't2pCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    var toClub = (interfaceParams.accordion_options.id === 'GAITA_HOHNER_CLUB_IIIM_BR' );
    var fromClub = (interfaceParams.accordion_options.id !== 'GAITA_HOHNER_CLUB_IIIM_BR' );
    
    var canvas_id = 't2pCanvasDiv';
    var warnings_id = 't2pWarningsDiv';

    this.warnings = [];
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
    this.tabParser = new ABCXJS.Tab2Part(toClub, fromClub);
    
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
    
    this.editorWindow = new ABCXJS.edit.EditArea(
        this.Div.dataDiv
       ,{listener : this, method: 'editorCallback' }
       ,{   draggable:SITE.properties.partGen.editor.floating
           ,toolbar: true, statusbar:true, translate:false
           ,title: 'Editor de Tablaturas'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.editorWindow.setVisible(false);

    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        this.Div.dataDiv
       ,[ 'move|Mover', 'rotate|Rotacionar', 'zoom|Zoom', 'globe|Mudar Notação']
       ,{title: '', translate: false, statusbar: false
            , top: SITE.properties.partGen.keyboard.top
            , left: SITE.properties.partGen.keyboard.left
            , zIndex: 100
       } 
      ,{listener: this, method: 'keyboardCallback'}
    );
    
    this.accordion.setRenderOptions({
        draggable: true
       ,show: SITE.properties.partGen.keyboard.visible
       ,transpose: SITE.properties.partGen.keyboard.transpose
       ,mirror: SITE.properties.partGen.keyboard.mirror
       ,scale: SITE.properties.partGen.keyboard.scale
       ,label: SITE.properties.partGen.keyboard.label
    });
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 't2pcontrolDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.controlDiv).innerHTML;
    document.getElementById(interfaceParams.controlDiv).innerHTML = "";
    
    if (interfaceParams.generate_warnings) {
        this.warningsDiv = document.createElement("DIV");
        this.warningsDiv.setAttribute("id", warnings_id);
        this.warningsDiv.setAttribute("class", "warningsDiv" );
        this.Div.dataDiv.appendChild(this.warningsDiv);
        this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    }

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", 't2pStudioCanvasDiv' );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv customScrollBar" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    this.studioCanvasDiv.appendChild(this.canvasDiv);
    
    this.renderedTune.div = this.canvasDiv;
    
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);
    
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);

    // player control
    this.playButton = document.getElementById(interfaceParams.playBtn);
    this.stopButton = document.getElementById(interfaceParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(interfaceParams.currentPlayTimeLabel);
    
    //this.ckShowWarns = document.getElementById(interfaceParams.ckShowWarns);
    this.ckShowABC = document.getElementById(interfaceParams.ckShowABC);
    this.ckConvertToClub = document.getElementById(interfaceParams.ckConvertToClub);
    this.convertToClub = document.getElementById('convertToClub');

    this.ckConvertFromClub = document.getElementById(interfaceParams.ckConvertFromClub);
    this.convertFromClub = document.getElementById('convertFromClub');
        
    this.ckConvertToClub.checked = toClub;
    this.convertToClub.style.display = toClub ? 'inline' : 'none';

    this.ckConvertFromClub.checked = false;
    this.convertFromClub.style.display = fromClub ? 'inline' : 'none';
    
    this.showEditorButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showEditor();
    }, false);
    
    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showKeyboard();
    }, false);
    
    
    

//    this.ckShowWarns.addEventListener("click", function() {
//        var divWarn = document.getElementById("t2pWarningsDiv");
//        if( this.checked ) {
//            divWarn.style.display = 'inline';
//        } else {
//            divWarn.style.display = 'none';
//        }
//    }, false);
//
//    this.ckShowABC.addEventListener("click", function() {
//        var divABC = document.getElementById("t2pABCDiv");
//        if( this.checked ) {
//            divABC.style.display = 'inline';
//        } else {
//            divABC.style.display = 'none';
//        }
//    }, false);
//
//    this.ckConvertToClub.addEventListener("click", function() {
//        that.update();
//    }, false);
//
//    this.ckConvertFromClub.addEventListener("click", function() {
//        that.update();
//    }, false);
//
//    this.textarea = document.getElementById(interfaceParams.textarea);
//
//    this.printButton.addEventListener("click", function() {
//        that.printPreview(that.tab.div.innerHTML, ["#divTitulo","#t2pDiv"]);
//    }, false);
//
//    this.saveButton.addEventListener("click", function() {
//        that.salvaPartitura();
//    }, false);
//    
//    this.showMapButton.addEventListener("click", function() {
//        that.showMap();
//    }, false);
//    
//    this.updateButton.addEventListener("click", function() {
//        that.update();
//    }, false);
//    
//    this.playerCallBackOnScroll = function( player ) {
//        that.setScrolling( player );
//    };
//
//    this.playerCallBackOnPlay = function( player ) {
//        var strTime = player.getTime().cTime;
//        if(that.gotoMeasureButton)
//            that.gotoMeasureButton.value = player.currentMeasure;
//        if(that.currentPlayTimeLabel)
//            that.currentPlayTimeLabel.innerHTML = strTime;
//    };
//
//    this.playerCallBackOnEnd = function( player ) {
//        var warns = that.midiPlayer.getWarnings();
//        that.playButton.title = DR.getResource("playBtn");
//        that.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
//        that.tab.abc.midi.printer.clearSelection();
//        that.accordion.clearKeyboard(true);
//        if(that.currentPlayTimeLabel)
//            that.currentPlayTimeLabel.innerHTML = "00:00.00";
//        if( warns ) {
//            var wd =  document.getElementById("t2pWarningsDiv");
//            var txt = "";
//            warns.forEach(function(msg){ txt += msg + '<br>'; });
//            wd.style.color = 'blue';
//            wd.innerHTML = '<hr>'+txt+'<hr>';
//        }
//    };
//
//    this.playButton.addEventListener("click", function() {
//        that.startPlay( 'normal' );
//    }, false);
//
//    this.stopButton.addEventListener("click", function() {
//        that.midiPlayer.stopPlay();
//    }, false);
//    
//
//    // inicio do setup do mapa    
//    this.midiParser = new ABCXJS.midi.Parse();
//    this.midiPlayer = new ABCXJS.midi.Player(this);
//    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
//    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
//    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );
//
//    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );
//    
//    this.editorWindow = interfaceParams.editorWindow;
//    this.keyboardWindow = interfaceParams.keyboardWindow;
//    
//    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
//    document.getElementById("t2pSpanAccordeon").innerHTML = ' (' + this.accordion.getTxtModel() + ')'; 
//    
//    this.textarea.value = document.getElementById("lixo").value;
//    
//    this.update();
    
};


SITE.PartGen.prototype.setup = function(options) {
    
    this.accordion.loadById(options.accordionId);
    
    this.setVisible(true);
    //this.setString("tab.text");
    //this.fireChanged(0, {force:true} );
    this.Div.setTitle( '-&#160;' + this.accordion.getTxtModel() );
    
    this.showEditor(SITE.properties.partGen.editor.visible);
    //this.editorWindow.container.setTitle('-&#160;' + tab.title);
    this.editorWindow.dockWindow(!SITE.properties.partGen.editor.floating);
    this.editorWindow.setToolBarVisible(SITE.properties.partGen.editor.floating);
    this.editorWindow.setStatusBarVisible(SITE.properties.partGen.editor.floating);
    
    if(SITE.properties.partGen.editor.floating) {
        if( SITE.properties.partGen.editor.maximized ) {
            this.editorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.editorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.editorWindow.container.dispatchAction('POPIN');
    }

    this.showKeyboard(SITE.properties.partGen.keyboard.visible);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    
    this.resize();
    
};

SITE.PartGen.prototype.resize = function( ) {
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    // -paddingTop 78
    var h = (winH -78 - 10 ); 
    var w = (winW - 10 ); 
    
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w,400) +"px";
    this.Div.dataDiv.style.height = "100%";
   
    var e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    if(! SITE.properties.studio.editor.floating) {
        e = this.editorWindow.container.topDiv.clientHeight+4;
    }

    this.studioCanvasDiv.style.height = t-(e+c+6) +"px";
    
    //this.posicionaTeclado();
    
    this.editorWindow.resize();
};



SITE.PartGen.prototype.closePartGen = function(save) {
    this.setVisible(false);
    (save) && SITE.SaveProperties();
    return;
    
    var loader = this.startLoader( "ClosePartGen" );
    var self = this;
    loader.start(  function() { 
        (save) && SITE.SaveProperties();
        self.midiPlayer.stopPlay();
        self.mapa.openMapa( self.getString() );
        loader.stop();
    }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};


SITE.PartGen.prototype.showEditor = function(show) {
    SITE.properties.partGen.editor.visible = 
            (typeof show === 'undefined'? ! SITE.properties.partGen.editor.visible : show );
    
    if(SITE.properties.partGen.editor.visible) {
        this.editorWindow.setVisible(true);
        document.getElementById('t2pI_showEditor').setAttribute('class', 'ico-folder-open' );
    } else {
        document.getElementById('t2pI_showEditor').setAttribute('class', 'ico-folder' );
        this.editorWindow.setVisible(false);
    }
    this.resize();
};

SITE.PartGen.prototype.showKeyboard = function(show) {
    SITE.properties.partGen.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.partGen.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.partGen.keyboard.visible;
    
    if(SITE.properties.partGen.keyboard.visible) {
        this.keyboardWindow.setVisible(true);
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('t2pI_showMap').setAttribute('class', 'ico-folder-open' );
        this.posicionaTeclado();
    } else {
        this.accordion.render_opts.show = false;
        this.keyboardWindow.setVisible(false);
        document.getElementById('t2pI_showMap').setAttribute('class', 'ico-folder' );
    }
};



SITE.PartGen.prototype.editorCallback = function (action, elem) {
    switch(action) {
        case 'REFRESH': 
           this.fireChanged(0, {force:true} );
           break;
        case 'DOWNLOAD': 
           this.salvaMusica();
           break;
        case 'MAXIMIZE': 
            this.maximizeEditor(true);
            break;
        case 'RESTORE': 
            this.maximizeEditor(false);
            break;
        case 'POPIN':
            SITE.properties.partGen.editor.floating = false;
            this.editorWindow.dockWindow(true);
            this.editorWindow.setToolBarVisible(false);
            this.editorWindow.setStatusBarVisible(false);
            this.editorWindow.container.move(0,0);
            this.editorWindow.container.setSize("calc(100% -5px)","200px");
            this.resize();
            break;
        case 'POPOUT':
            SITE.properties.partGen.editor.floating = true;
            this.editorWindow.dockWindow(false);
            this.editorWindow.setToolBarVisible(true);
            this.editorWindow.setStatusBarVisible(true);
            this.maximizeEditor(SITE.properties.partGen.editor.maximized);
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            if(SITE.properties.partGen.editor.floating && !SITE.properties.partGen.editor.maximized){
                var k = this.editorWindow.container.topDiv.style;
                SITE.properties.partGen.editor.left = k.left;
                SITE.properties.partGen.editor.top = k.top;
                SITE.properties.partGen.editor.width = k.width;
                SITE.properties.partGen.editor.height = k.height;
            }
            break;
        case 'CLOSE':
            this.showEditor(false);
            break;
    }
};

SITE.PartGen.prototype.maximizeEditor = function(maximize) {

    this.editorWindow.setMaximized(maximize);
    SITE.properties.partGen.editor.maximized = maximize;
    
    if( maximize ) {
        this.editorWindow.container.move(0,0);
        this.editorWindow.container.topDiv.style.width = "100%";
        this.editorWindow.container.topDiv.style.height = "calc( 100% - 7px)";
    } else {
        var k = this.editorWindow.container.topDiv.style;
        k.left = SITE.properties.partGen.editor.left;
        k.top = SITE.properties.partGen.editor.top;
        k.width = SITE.properties.partGen.editor.width;
        k.height = SITE.properties.partGen.editor.height;
    }
    this.editorWindow.resize();
};


SITE.PartGen.prototype.t2pCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.closePartGen(true);
            break;
    }
};

SITE.PartGen.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};



SITE.PartGen.prototype.update = function() {
    var abcText = this.tabParser.parse(this.textarea.value, this.accordion.loadedKeyboard, this.ckConvertToClub.checked, this.ckConvertFromClub.checked );
    this.printABC( abcText );
};

SITE.PartGen.prototype.printABC = function(abcText) {
    this.renderedTune.text = abcText;
    var divWarn = document.getElementById("t2pWarningsDiv");
    var divABC = document.getElementById("t2pABCDiv");
    
    divABC.innerHTML = this.renderedTune.text.replace(/\n/g,'\<br\>');
   
    var warns = this.tabParser.getWarnings();
    if(warns) {
        divWarn.innerHTML = warns;
        divWarn.style.color = 'red';
    } else {
        divWarn.innerHTML = 'Partitura gerada com sucesso!';
        divWarn.style.color = 'green';
    }
    
    this.renderedTune.div = document.getElementById("t2pCanvasDiv");
    
    this.parseABC(this.tab);
    
    var paper = new SVG.Printer( this.renderedTune.div );
    var printer = new ABCXJS.write.Printer( paper );
    
    printer.printABC(this.renderedTune.abc);
    
};

SITE.PartGen.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.loadedKeyboard );
    }
};        

SITE.PartGen.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.loadedKeyboard.render_opts.show = this.mapVisible;
    this.keyboardWindow.topDiv.style.display = 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('t2p_I_showMap').setAttribute('class', 'icon-folder-close' );
};

SITE.PartGen.prototype.showMap = function() {
    this.mapVisible = ! this.mapVisible;
    this.accordion.loadedKeyboard.render_opts.show = this.mapVisible;
    if(this.mapVisible) {
        this.keyboardWindow.topDiv.style.display = 'inline';
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('t2p_I_showMap').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideMap();
    }
};

SITE.PartGen.prototype.keyboardCallback = function( e ) {
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

SITE.PartGen.prototype.salvaPartitura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.renderedTune.text;
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};

SITE.PartGen.prototype.printPreview = function (html, divsToHide) {
    var bg = document.body.style.backgroundColor;
    var dv = document.getElementById('t2pPrintPreviewDiv');
    
    divsToHide.forEach( function( div ) {
        $(div).hide();
    });
    $("#t2pPrintPreviewDiv").show();
    
    dv.innerHTML = html;
    
    document.body.style.paddingTop = '0px';
    document.body.style.backgroundColor = '#fff';
    window.print();
    document.body.style.backgroundColor = bg;
    document.body.style.paddingTop = '50px';
    
    $("#t2pPrintPreviewDiv").hide();
    divsToHide.forEach( function( div ) {
        $(div).show();
    });

};

SITE.PartGen.prototype.startPlay = function( type, value ) {
    if( this.midiPlayer.playing) {
        
        this.ypos = 1000;
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&#160;<i class="icon-pause"></i>&#160;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};

SITE.PartGen.prototype.setScrolling = function(y, channel) {
//    if( !this.tuneContainerDiv || channel > 0 ) return;
//    if( y !== this.ypos ) {
//        this.ypos = y;
//        this.tuneContainerDiv.scrollTop = this.ypos - 40;    
//    }
};
