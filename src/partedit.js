/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.PartEdit = function( mapa, interfaceParams ) {
    
    this.mapa = mapa;
    
    var that = this;
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.partEditDiv
        , ['help']
        , {translator: SITE.translator, statusbar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'PartEditTitle'}
        , {listener: this, method: 'a2pCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    
    var canvas_id = 'a2pCanvasDiv';
    var warnings_id = 'a2pWarningsDiv';

    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
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
       ,{   draggable:SITE.properties.partEdit.editor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'PartEditEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.editorWindow.setVisible(false);
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'a2pcontrolDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.controlDiv).innerHTML;
    document.getElementById(interfaceParams.controlDiv).innerHTML = "";
    
    this.media = new SITE.Media( this.Div.dataDiv, interfaceParams.btShowMedia, SITE.properties.partEdit.media ); 
    
    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        this.Div.dataDiv
       ,[ 'move', 'rotate', 'zoom', 'globe']
       ,{title: '', translator: SITE.translator, statusbar: false
            , top: SITE.properties.partEdit.keyboard.top
            , left: SITE.properties.partEdit.keyboard.left
       } 
      ,{listener: this, method: 'keyboardCallback'}
    );
    
    this.accordion.setRenderOptions({
        draggable: true
       ,show: SITE.properties.partEdit.keyboard.visible
       ,transpose: SITE.properties.partEdit.keyboard.transpose
       ,mirror: SITE.properties.partEdit.keyboard.mirror
       ,scale: SITE.properties.partEdit.keyboard.scale
       ,label: SITE.properties.partEdit.keyboard.label
    });
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", 'a2pStudioCanvasDiv' );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    
    this.studioCanvasDiv.appendChild(this.canvasDiv);
    
    this.renderedTune.div = this.canvasDiv;
    
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);
    
    if( this.ps )
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

    this.fileLoadABC = document.getElementById('fileLoadABC');
    this.fileLoadABC.addEventListener('change', function(event) { that.carregaPartitura(event); }, false);        

    
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);
    this.loadButton = document.getElementById(interfaceParams.loadBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.printButton = document.getElementById(interfaceParams.printBtn);

    // player control
    this.playButton = document.getElementById(interfaceParams.playBtn);
    this.stopButton = document.getElementById(interfaceParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(interfaceParams.currentPlayTimeLabel);
    
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
    
    this.updateButton.addEventListener("click", function() {
        that.fireChanged();
    }, false);

    this.loadButton.addEventListener("click", function() {
        that.fileLoadABC.click();
    }, false);
    
    this.saveButton.addEventListener("click", function() {
        that.salvaPartitura();
    }, false);
    
    this.printButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.mapa.printPreview(that.renderedTune.div.innerHTML, ["#topBar","#mapaDiv","#partEditDiv"], that.renderedTune.abc.formatting.landscape);
    }, false);

    
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling(player);
    };
    
    this.playerCallBackOnPlay = function( player ) {
        var strTime = player.getTime().cTime;
        if(that.gotoMeasureButton)
            that.gotoMeasureButton.value = player.currentMeasure;
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = strTime;
    };

    this.playerCallBackOnEnd = function( player ) {
        var warns = that.midiPlayer.getWarnings();
        that.playButton.title = SITE.translator.getResource("playBtn");
        that.playButton.innerHTML = '&#160;<i class="ico-play"></i>&#160;';
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.blockEdition(false);
        if( warns ) {
            var txt = "";
            warns.forEach(function(msg){ txt += msg + '<br>'; });
            that.warningsDiv.style.color = 'blue';
            that.warningsDiv.innerHTML = '<hr>'+txt+'<hr>';
        }
    };

    this.playButton.addEventListener("click", function() {
       window.setTimeout(function(){ that.startPlay( 'normal' );}, 0 );
    }, false);

    this.stopButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.blockEdition(false);
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.stopPlay();
    }, false);
    

    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );
    
};


SITE.PartEdit.prototype.setup = function(options) {
    
    this.mapa.closeMapa();
    
    this.accordion.loadById(options.accordionId);
    
    this.setVisible(true);
    if( this.editorWindow.getString() === "" ) {
        var text = FILEMANAGER.loadLocal("ultimaPartituraEditada");
        if( ! text ) {
            text = this.getDemoText();
        }
        this.editorWindow.setString(text);
    }
    
    this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    
    this.fireChanged();
    this.editorWindow.restartUndoManager();
    
    this.Div.setSubTitle( '- ' + this.accordion.getTxtModel() );
    
    this.showEditor(SITE.properties.partEdit.editor.visible);

    if(SITE.properties.partEdit.editor.floating) {
        if( SITE.properties.partEdit.editor.maximized ) {
            this.editorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.editorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.editorWindow.container.dispatchAction('POPIN');
    }

    this.showKeyboard(SITE.properties.partEdit.keyboard.visible);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    
    this.resize();
    
};

SITE.PartEdit.prototype.resize = function( ) {
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
    
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w,400) +"px";
   
    var w = 0, e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    if(! SITE.properties.showWarnings) {
        w = this.warningsDiv.clientHeight;
    }
    
    if(! SITE.properties.partEdit.editor.floating) {
        e = this.editorWindow.container.topDiv.clientHeight+4;
    }

    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";
    
    this.posicionaTeclado();
    this.editorWindow.resize();
    
    (this.ps) && this.ps.update();
    
};

SITE.PartEdit.prototype.posicionaTeclado = function() {
    
    if( ! SITE.properties.partEdit.keyboard.visible ) return;
    
    var w = window.innerWidth;
    
    var k = this.keyboardWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    k.style.left = x+"px";
};


SITE.PartEdit.prototype.closePartEdit = function(save) {
    var self = this;
    var loader = this.mapa.startLoader( "ClosePartEdit" );
    
    loader.start(  function() { 
        var text = self.editorWindow.getString();
        self.setVisible(false);
        self.editorWindow.setString("");
        self.midiPlayer.stopPlay();
        (save) && SITE.SaveProperties();
        if(text !== "" ) 
            FILEMANAGER.saveLocal( 'ultimaPartituraEditada', text );
        self.mapa.openMapa();
        loader.stop();
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
};


SITE.PartEdit.prototype.showEditor = function(show) {
    SITE.properties.partEdit.editor.visible = 
            (typeof show === 'undefined'? ! SITE.properties.partEdit.editor.visible : show );
    
    if(SITE.properties.partEdit.editor.visible) {
        this.editorWindow.setVisible(true);
        document.getElementById('a2pI_showEditor').setAttribute('class', 'ico-folder-open' );
    } else {
        document.getElementById('a2pI_showEditor').setAttribute('class', 'ico-folder' );
        this.editorWindow.setVisible(false);
    }
    this.resize();
};

SITE.PartEdit.prototype.showKeyboard = function(show) {
    SITE.properties.partEdit.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.partEdit.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.partEdit.keyboard.visible;
    
    if(SITE.properties.partEdit.keyboard.visible) {
        this.keyboardWindow.setVisible(true);
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('a2pI_showMap').setAttribute('class', 'ico-folder-open' );
        this.posicionaTeclado();
    } else {
        this.accordion.render_opts.show = false;
        this.keyboardWindow.setVisible(false);
        document.getElementById('a2pI_showMap').setAttribute('class', 'ico-folder' );
    }
};

SITE.PartEdit.prototype.editorCallback = function (action, elem) {
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
           this.fireChanged();
           break;
        case 'DOWNLOAD': 
            this.salvaPartitura();
           break;
        case 'MAXIMIZE': 
            this.editorWindow.maximizeWindow( true, SITE.properties.partEdit.editor );
            break;
        case 'RESTORE': 
            this.editorWindow.maximizeWindow( false, SITE.properties.partEdit.editor );
            break;
        case 'POPIN':
            this.editorWindow.dockWindow(true, SITE.properties.partEdit.editor, 0, 0, "calc(100% - 5px)", "200px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.editorWindow.dockWindow(false, SITE.properties.partEdit.editor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.editorWindow.retrieveProps( SITE.properties.partEdit.editor );
            break;
        case 'CLOSE':
            this.showEditor(false);
            break;
    }
};

SITE.PartEdit.prototype.a2pCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.closePartEdit(true);
            break;
        case 'HELP':
            //this.mapa.showHelp('HelpTitle', 'PartEditTitle', '/diatonic-map/html/geradorPartitura.pt_BR.html', { width: '1024', height: '600' } );
            alert( 'Not implemented yet!' );
    }
};

SITE.PartEdit.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};

SITE.PartEdit.prototype.fireChanged = function(transpose) {
    
    var text = this.editorWindow.getString();
    
    if(text !== "" ) {
    
        FILEMANAGER.saveLocal( 'ultimaPartituraEditada', text );

        this.parseABC(text, transpose);
        this.printABC();
        
    } else {
        this.editorWindow.container.setSubTitle( "" );
        this.warningsDiv.innerHTML = "";
        this.renderedTune.div.innerHTML = "";
        delete this.renderedTune.abc.midi;
    }   
    this.resize();
};

SITE.PartEdit.prototype.parseABC = function(text, transpose) {
    
    transpose = transpose || 0;
    
    var transposer = new ABCXJS.parse.Transposer(transpose);
    
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );

    try {
        abcParser.parse(text, this.parserparams );
        this.renderedTune.text = abcParser.getStrTune();
        
        if( this.renderedTune.text !== text ) {
            this.editorWindow.setString(this.renderedTune.text);
            //FILEMANAGER.saveLocal( 'ultimaPartituraEditada', this.renderedTune.text );
        }
    } catch(e) {
        waterbug.log( 'Could not parse ABC.' );
        waterbug.show();
    }
            
    this.renderedTune.abc = abcParser.getTune();
    this.renderedTune.title = this.renderedTune.abc.metaText.title ;

    if (this.editorWindow.keySelector) {
        this.editorWindow.keySelector.populate(transposer.keyToNumber(transposer.getKeyVoice(0)));
    }

    var warnings = abcParser.getWarnings() || [];

    if(this.renderedTune.title) {
        this.editorWindow.container.setSubTitle('- ' + this.renderedTune.abc.metaText.title );
        if( ! this.GApartEdit || this.GApartEdit !== this.renderedTune.abc.metaText.title ) {
            this.GApartEdit = this.renderedTune.abc.metaText.title;
            SITE.ga('send', 'event', 'Mapa5', 'partEdit', this.GApartEdit );
        }
        
    }else
        this.editorWindow.container.setSubTitle( "" );

    if ( this.midiParser ) {
        this.midiParser.parse( this.renderedTune.abc, this.accordion.loadedKeyboard );
        warnings = warnings.concat(this.midiParser.getWarnings() );
    }
    
    if(warnings.length>0) {
        this.warningsDiv.innerHTML = warnings.join('<br>');
        this.warningsDiv.style.color = 'red';
    } else {
        this.warningsDiv.innerHTML = 'Partitura gerada com sucesso!';
        this.warningsDiv.style.color = 'green';
    }
    
    
};        

SITE.PartEdit.prototype.printABC = function() {
    
    this.renderedTune.div.innerHTML = "";
    
    this.renderedTune.printer = new ABCXJS.write.Printer( new SVG.Printer( this.renderedTune.div ) );
    
    this.renderedTune.printer.printABC(this.renderedTune.abc);
    
    this.renderedTune.printer.addSelectListener(this);
    
    this.media.show(this.renderedTune);
    
};

SITE.PartEdit.prototype.highlight = function(abcelem) {
    if( !this.midiPlayer.playing ) {
        if(SITE.properties.partEdit.keyboard.visible ) {
            this.accordion.clearKeyboard(true);
            this.midiParser.setSelection(abcelem);
        }    
        if(SITE.properties.partEdit.editor.visible ) {
            this.editorWindow.setSelection(abcelem);
        }    
    }
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.PartEdit.prototype.unhighlight = function(abcelem) {
    if(SITE.properties.partEdit.editor.visible) {
        this.editorWindow.clearSelection(abcelem);
    }    
};

SITE.PartEdit.prototype.updateSelection = function (force) {
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

SITE.PartEdit.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            var k = this.keyboardWindow.topDiv.style;
            SITE.properties.partEdit.keyboard.left = k.left;
            SITE.properties.partEdit.keyboard.top = k.top;
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partEdit.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.partEdit.keyboard.mirror = this.accordion.render_opts.mirror;
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partEdit.keyboard.scale = this.accordion.render_opts.scale;
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            SITE.properties.partEdit.keyboard.label = this.accordion.render_opts.label;
            break;
        case 'CLOSE':
            this.showKeyboard(false);
            break;
    }
};

SITE.PartEdit.prototype.salvaPartitura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.renderedTune.text;
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};

SITE.PartEdit.prototype.carregaPartitura = function(evt) {
    var that = this;
    FILEMANAGER.loadLocalFiles( evt, function() {
      that.doCarregaPartitura(FILEMANAGER.files);
      evt.target.value = "";
    });
};

SITE.PartEdit.prototype.doCarregaPartitura = function(file) {
    this.editorWindow.setString(file[0].content);
    this.fireChanged();
};

SITE.PartEdit.prototype.blockEdition = function( block ) {
    this.editorWindow.setReadOnly(!block);
    this.editorWindow.container.dispatchAction('READONLY');
    if( block ) {
        this.editorWindow.setEditorHighLightStyle();
    } else {
        this.editorWindow.clearEditorHighLightStyle();
        this.editorWindow.aceEditor.focus();
    }
};

SITE.PartEdit.prototype.startPlay = function( type, value ) {
    this.ypos = this.studioCanvasDiv.scrollTop;
    this.lastStaffGroup = -1;
    
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
        if(type==="normal") {
            this.blockEdition(true);
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML = '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value ) ) {
            }
        }
    }
};

SITE.PartEdit.prototype.setScrolling = function(player) {
    if( !this.studioCanvasDiv || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
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

SITE.PartEdit.prototype.getDemoText = function() {
    return '\
X: 1\n\
T:Oh! Susannah\n\
F:/diatonic-map/images/susannah.tablatura.png\n\
M:2/4\n\
L:1/4\n\
Q:100\n\
K:G\n\
V:melodia treble\n\
|"C"c c|e/2e/2 -e/2e/2|"G"d/2d/2 B/2G/2|"D7"A3/2G/4A/4|\\\n\
"G"B/2d/2 d3/4e/4|d/2B/2 G/2A/2|"G"B/2B/2 "D7"A/2A/2|"G"G2 |\n\
V:baixos bass\n\
| C, [C,E,G,] | C, z | G,, z | D, z | G,, z | G,, z | D, [D,^F,A,] | G,, z |\n\
V:tablatura accordionTab';
    
};
