/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.LoadProperties = function() {
    
    FILEMANAGER.removeLocal('diatonic-map.site.properties' ); // para testes - remover ao final
    
    SITE.properties = JSON.parse( FILEMANAGER.loadLocal('diatonic-map.site.properties' ) ); 
    
    if( ! SITE.properties ) {
        SITE.properties = {};
        SITE.properties.colors = {
             highLight: 'red'
            ,fill: 'white'
            ,background: 'none'
            ,close: '#ff3a3a'
            ,open: '#ffba3b'
        };
        
        SITE.properties.options = {
             language: 'pt_BR'
            ,showWarnings: false
            ,autoRefresh: false
            ,pianoSound: false
        };
        
        SITE.properties.mediaDiv = {
             visible: false
            ,top: "100px"
            ,left: "1200px"
            ,width: 300
            ,height: 300 * 0.55666667
        };
        
        SITE.properties.studio = {
             mode: 'normal'
            ,timerOn: false
            ,trebleOn: true
            ,bassOn: true
            ,editor : {
                 visible: true
                ,floating:true
                ,maximized: false
                ,top: "40px"
                ,left: "50px"
                ,width: "700px"
                ,height: "480px"
            }
            , keyboard: {
                 visible: true
                ,top: "65px"
                ,left: "1200px"
                ,scale: 0.8
                ,mirror: true
                ,transpose: false
                ,label: false
            }
        };
        
        SITE.SaveProperties();
        SITE.properties = JSON.parse( FILEMANAGER.loadLocal('diatonic-map.site.properties' ) ); // para testes - remover ao final
    }
};

SITE.SaveProperties = function() {
    FILEMANAGER.saveLocal('diatonic-map.site.properties', JSON.stringify(SITE.properties));
};


SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.lastStaffGroup = -1; // também auxilia no controle de scroll
    this.fileLoadMap = document.getElementById('fileLoadMap');
    this.fileLoadRepertoire = document.getElementById('fileLoadRepertoire');
    
    this.keyboardDiv = interfaceParams.keyboardDiv;
    this.settingsMenu = document.getElementById(interfaceParams.settingsMenu);
    this.mapDiv = document.getElementById(interfaceParams.mapDiv);

    // melhorar este tratamento
    var radios = document.getElementsByName('tabControl');
    for( var r=0; r < radios.length; r ++ ) {
       radios[r].addEventListener('change', function() { 
           that.showTab(this.id); 
       });
    }
    
    this.showMediaButton = document.getElementById('buttonShowMedia');
    this.showMediaButton.addEventListener('click', function () { 
        that.mediaCallback('OPEN');
    });

    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );

    this.abcParser = new ABCXJS.parse.Parse( null, this.accordion );
    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    
    this.menu = new DRAGGABLE.ui.DropdownMenu(
           interfaceParams.mapMenuDiv
        ,  { listener: that, method:'menuCallback' }
        ,  [{title: 'Acordeons', ddmId: 'menuGaitas', itens: [] }
           ,{title: 'Repertório', ddmId: 'menuRepertorio',
                itens: [
                    'Restaurar o original|RESTOREREPERTOIRE',
                    'Carregar do drive local|LOADREPERTOIRE',
                    'Exportar para drive local|EXPORTREPERTOIRE',
                    '---',
                    'Partitura&nbsp;&nbsp;<i class="ico-open-right"></i> Tablatura|PART2TAB',
                    'Tablatura&nbsp;&nbsp;<i class="ico-open-right"></i> Partitura|TAB2PART'
                ]}
           ,{title: 'Informações', ddmId: 'menuInformacoes',
                itens: [
                    'Tutoriais|TUTORIAL',
                    'Mapas para acordeons|MAPS',
                    'Tablaturas para acordeons|TABS',
                    'Tablaturas para gaita transportada <img src="images/novo.png">|TABSTRANSPORTADA',
                    'Símbolos de Repetição|JUMPS',
                    'Estúdio ABCX|ESTUDIO',
                    'Formato ABCX|ABCX',
                    'Sobre|ABOUT'
                ]}
        ]);
    
    this.accordionSelector = new ABCXJS.edit.AccordionSelector( 
            'menuGaitas', this.menu, 
            { listener:this, method: 'menuCallback' }, 
            [
                '---',
                'Salvar mapa corrente|SAVEMAP',
                'Carregar mapa do disco local|LOADMAP'
            ]
    );

    this.studio = tabParams.studio;
    
    // tab control
    this.tuneContainerDiv = document.getElementById(interfaceParams.tuneContainerDiv);
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined, tab:'songs'
                        ,div: document.getElementById(tabParams.songSelectorParms.tabDiv)
                        ,selector: document.getElementById(tabParams.songSelectorParms.menuDiv) };
    this.renderedChord = {text:undefined, abc:undefined, title:undefined, tab: 'chords'
                         ,div: document.getElementById(tabParams.chordSelectorParms.tabDiv)
                         ,selector: document.getElementById(tabParams.chordSelectorParms.menuDiv) };
    this.renderedPractice = {text:undefined, abc:undefined, title:undefined, tab: 'practices'
                            ,div: document.getElementById(tabParams.practiceSelectorParms.tabDiv)
                            ,selector: document.getElementById(tabParams.practiceSelectorParms.menuDiv) };
    
    // player control
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(playerParams.currentPlayTimeLabel);
    
    // screen control
    this.buttonChangeNotation = document.getElementById(interfaceParams.btChangeNotation);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.toolsButton = document.getElementById(interfaceParams.toolsBtn);

    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);
    
    this.printButton.addEventListener("touchstart", function(event) {  that.printPartiture(this, event); }, false);
    this.printButton.addEventListener("click", function(event) { that.printPartiture(this, event); }, false);
    this.toolsButton.addEventListener("touchstart", function(event) { that.showStudio(this, event); }, false);
    this.toolsButton.addEventListener("click", function(event) { that.showStudio(this, event); }, false);
    this.fileLoadMap.addEventListener('change', function(event) { that.loadMap(event); }, false);        
    this.fileLoadRepertoire.addEventListener('change', function(event) { that.carregaRepertorioLocal(event); }, false);        

    this.settingsMenu.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.showSettings();
    }, false );
    
    
    this.buttonChangeNotation.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.accordion.changeNotation();
    }, false );
    
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling( player );
    };

    this.playerCallBackOnPlay = function( player ) {
        var strTime = player.getTime().cTime;
        if(that.gotoMeasureButton)
            that.gotoMeasureButton.value = player.currentMeasure;
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = strTime;
    };

    this.playerCallBackOnEnd = function( player ) {
        var currentABC = that.getActiveTab();
        var warns = that.midiPlayer.getWarnings();
        that.playButton.title = DR.getResource("playBtn");
        that.playButton.innerHTML = '<i class="ico-play"></i>';
        currentABC.abc.midi.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        
        var wd =  document.getElementById("mapaWarningsDiv");
        
        if( warns && wd) {
            var txt = "";
            warns.forEach(function(msg){ txt += msg + '<br/>'; });
            wd.style.color = 'blue';
            wd.innerHTML = txt;
        }
    };

    this.playButton.addEventListener("click", function(evt) {
       evt.preventDefault();
       that.startPlay( 'normal' );
    }, false);

    this.stopButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        that.midiPlayer.stopPlay();
    }, false);
    
    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );


    this.accordionSelector.populate(false);
    this.showAccordionName();
    this.showAccordionImage();
    this.loadOriginalRepertoire();
    this.printKeyboard();
    
    this.mediaWindow = new DRAGGABLE.ui.Window( 
          this.mapDiv
        , null
        , {title: 'Videoaula', translate: false, statusBar: false
            , top: SITE.properties.mediaDiv.top
            , left: SITE.properties.mediaDiv.left
            , zIndex: 1000} 
        , {listener: this, method: 'mediaCallback'}
    );
    
    DR.addAgent( this ); // register for translate

    this.resize();
    
};

SITE.Mapa.prototype.setup = function (tabParams) {

    if( this.accordionIsCurrent(tabParams.accordionId) ) {
        return;
    }   
    
    var gaita = this.accordion.loadById(tabParams.accordionId);
    
    if (!gaita) {
        console.log('Gaita não encontrada!');
        return;
    }
    
    this.accordionSelector.populate(false);
    this.showAccordionName();
    this.showAccordionImage();
    this.midiPlayer.reset();
    
    if (!gaita.localResource) { // não salva informação para acordeon local
        FILEMANAGER.saveLocal('property.accordion', gaita.getId());
        this.loadOriginalRepertoire(tabParams);
    } else {
        this.resize();
    }
};

SITE.Mapa.prototype.setVisible = function ( visible ) {
    this.mapDiv.style.display = (visible? 'inline':'none');
};

SITE.Mapa.prototype.printKeyboard = function() {
    this.accordion.printKeyboard( this.keyboardDiv );
};

SITE.Mapa.prototype.resize = function() {
   
    // redimensiona a tela partitura
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;    
   
    var s1 = document.getElementById( 'section1' );
    var s2 = document.getElementById( 'section2' );
    
    // -paddingTop 75 -margins 18 -2 shadow
    var h = (winH - s1.clientHeight - (s2.clientHeight - this.tuneContainerDiv.clientHeight) -75 -18 -2 ); 
    
    this.tuneContainerDiv.style.height = Math.max(h,200) +"px";
    
    // posiciona a janela de midia
    this.posicionaMidia();

};

SITE.Mapa.prototype.menuCallback = function (ev) {
    switch(ev) {
        case 'LOADMAP':
            this.fileLoadMap.click();
            break;
        case 'SAVEMAP':
            this.save();
            break;
        case 'RESTOREREPERTOIRE':
            this.restauraRepertorio();
            break;
        case 'LOADREPERTOIRE':
            // primeiro seleciona um ou mais arquivos e depois chama carregaRepertorioLocal();
            this.fileLoadRepertoire.click();
            break;
        case 'EXPORTREPERTOIRE':
            this.exportaRepertorio();
            break;
        case 'TUTORIAL':
            w1.setTitle('Tutoriais')
            w1.dataDiv.innerHTML = '<embed src="/diatonic-map/html5/tutoriais.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'TABS':
            w1.setTitle('Tablaturas para Acordeons')
            w1.dataDiv.innerHTML = '<embed src="/diatonic-map/html5/tablatura.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'TABSTRANSPORTADA':
            w1.setTitle('Tablaturas para Transportada')
            w1.dataDiv.innerHTML = '<embed src="/diatonic-map/html5/tablaturaTransportada.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'MAPS':
            w1.setTitle('Mapas para Acordeons')
            w1.dataDiv.innerHTML = '<embed src="/diatonic-map/html5/mapas.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'ABOUT':
            var e = document.createElement("iframe"); 
            w1.setTitle('Sobre...')
            w1.dataDiv.innerHTML = '';
            w1.dataDiv.appendChild(e);
            e.setAttribute("src", "/diatonic-map/html5/sobre.html" );
            e.setAttribute("frameborder", "0" );
            e.setAttribute("scrolling", "no" );
            e.setAttribute("height", "412" );
            e.setAttribute("width", "800" );
            e.addEventListener("load", function () { 
                e.style.height = e.contentWindow.document.body.scrollHeight + 'px';  
            } );
            w1.topDiv.style.display = 'inline';
            break;
        case 'PART2TAB':
        case 'TAB2PART':
            alert(ev);
            break;
        case 'GAITA_MINUANO_GC':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
        default: // as gaitas conhecidas e outras carregadas so demanda
            this.setup({accordionId:ev});
    }
};

SITE.Mapa.prototype.loadOriginalRepertoire = function (tabParams) {
    var self = this;
    var loader = this.startLoader( "LoadRepertoire" );
    loader.start(  function() { self.doLoadOriginalRepertoire(tabParams,loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};
    
SITE.Mapa.prototype.doLoadOriginalRepertoire = function (tabParams, loader) {
    tabParams = tabParams || {};
    
    this.renderedChord.title = tabParams.chordTitle
        || FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.chords.title')
        || this.accordion.loaded.getFirstChord();

    this.loadABCList(this.renderedChord.tab);

    this.renderedPractice.title = tabParams.practiceTitle
        || FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.practices.title')
        || this.accordion.loaded.getFirstPractice();

    this.loadABCList(this.renderedPractice.tab);

    this.renderedTune.title = tabParams.songTitle
        || FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.songs.title')
        || this.accordion.loaded.getFirstSong();

    this.loadABCList(this.renderedTune.tab);
    
    this.showTab('tabSongs');
    
    loader.stop();

};

SITE.Mapa.prototype.printPartiture = function (button, event) {
    var currentABC = this.getActiveTab();
    event.preventDefault();
    button.blur();
    if(  currentABC.div.innerHTML && this.studio )  {
        ga('send', 'event', 'Mapa', 'print', currentABC.title);
        this.studio.printPreview(currentABC.div.innerHTML, ["#topBar","#mapDiv"], currentABC.abc.formatting.landscape );
    }
};

SITE.Mapa.prototype.showMapa = function ( visible ) {
    if( visible ) {
        this.menu.enableSubMenu('menuGaitas');
        this.menu.enableSubMenu('menuRepertorio');
        this.reprintTab( this.studio.getString() );
        this.setVisible(true);
        this.printKeyboard();
        this.resize();
    } else {
        this.pauseMedia();
        this.midiPlayer.stopPlay();
        this.setVisible(false);
        this.menu.disableSubMenu('menuGaitas');
        this.menu.disableSubMenu('menuRepertorio');
    }
};

SITE.Mapa.prototype.showStudio = function (button, event) {
    var self = this;
    var currentABC = self.getActiveTab();
    
    event.preventDefault();
    button.blur();

    if( currentABC.div.innerHTML && this.studio ) {
        ga('send', 'event', 'Mapa', 'tools', currentABC.title);
        var loader = this.startLoader( "XStudio" );
        loader.start(  function() { self.doShowStudio(loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
    }
};

SITE.Mapa.prototype.doShowStudio = function (loader) {
    
    this.showMapa(false);
    this.studio.setup( this, this.getActiveTab(), this.accordion.getId() );
    
    loader.stop();
};

SITE.Mapa.prototype.setupProps = function () {
    var props = FILEMANAGER.loadLocal('property.studio.settings');
    //props = null; // debug
   
    if( props ) {
        props = props.split('|');
        this.studio.textVisible                      = (props[0] === 'true');
        this.studio.editorVisible                    = (props[1] === 'true');
        this.studio.mapVisible                       = (props[2] === 'true');
        this.studio.editorWindow.topDiv.style.top    = props[3]; 
        this.studio.editorWindow.topDiv.style.left   = props[4]; 
        this.studio.keyboardWindow.topDiv.style.top  = props[5]; 
        this.studio.keyboardWindow.topDiv.style.left = props[6]; 
        this.studio.accordion.loadedKeyboard.render_opts.scale = parseFloat(props[7]);
        this.studio.accordion.loadedKeyboard.render_opts.mirror  = (props[8] === 'true');
        this.studio.accordion.loadedKeyboard.render_opts.transpose = (props[9] === 'true');
        this.studio.accordion.loadedKeyboard.render_opts.label = (props[10] === 'true');
        
        this.studio.textVisible    = ! this.studio.textVisible;
        this.studio.editorVisible  = ! this.studio.editorVisible;
        this.studio.mapVisible     = ! this.studio.mapVisible;
        this.studio.showABCXText();
        this.studio.showEditor();
        this.studio.showMap();
    }
};

SITE.Mapa.prototype.restoreStudio = function () {
    this.studio.textVisible = true;
    this.studio.editorVisible = false;
    this.studio.mapVisible = false;
    this.studio.editorWindow.topDiv.style.top = "120px";
    this.studio.editorWindow.topDiv.style.left = "40px";
    this.studio.keyboardWindow.topDiv.style.top = "120px";
    this.studio.keyboardWindow.topDiv.style.left = "900px";
    this.studio.accordion.loadedKeyboard.render_opts.scale = 0.8;
    this.studio.accordion.loadedKeyboard.render_opts.mirror = false;
    this.studio.accordion.loadedKeyboard.render_opts.transpose = false;
    this.studio.accordion.loadedKeyboard.render_opts.label = false;
    
    FILEMANAGER.saveLocal( 'property.studio.settings', 
        this.studio.textVisible 
        + '|' + this.studio.editorVisible 
        + '|' + this.studio.mapVisible 
        + '|' + this.studio.editorWindow.topDiv.style.top
        + '|' + this.studio.editorWindow.topDiv.style.left
        + '|' + this.studio.keyboardWindow.topDiv.style.top
        + '|' + this.studio.keyboardWindow.topDiv.style.left
        + '|' + this.studio.accordion.loadedKeyboard.render_opts.scale
        + '|' + this.studio.accordion.loadedKeyboard.render_opts.mirror
        + '|' + this.studio.accordion.loadedKeyboard.render_opts.transpose
        + '|' + this.studio.accordion.loadedKeyboard.render_opts.label
        );

    this.setupProps();
};

//SITE.Mapa.prototype.closeStudio = function () {
//    var self = this;
//    var loader = this.startLoader( "XStudio" );
//    loader.start(  function() { self.closeStudio2(loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
//};
//    
//SITE.Mapa.prototype.closeStudio2 = function (loader) {
//    
//    this.studio.midiPlayer.stopPlay();
//    
//    FILEMANAGER.saveLocal( 'property.studio.settings', 
//        this.studio.textVisible 
//        + '|' + this.studio.editorVisible 
//        + '|' + this.studio.mapVisible 
//        + '|' + this.studio.editorWindow.topDiv.style.top
//        + '|' + this.studio.editorWindow.topDiv.style.left
//        + '|' + this.studio.keyboardWindow.topDiv.style.top
//        + '|' + this.studio.keyboardWindow.topDiv.style.left
//        + '|' + this.studio.accordion.loadedKeyboard.render_opts.scale
//        + '|' + this.studio.accordion.loadedKeyboard.render_opts.mirror
//        + '|' + this.studio.accordion.loadedKeyboard.render_opts.transpose
//        + '|' + this.studio.accordion.loadedKeyboard.render_opts.label
//        );
//
//    this.printTab();
//    this.resize();
//    loader.stop();
//};


//SITE.Mapa.prototype.rotateKeyboard = function() {
//    this.accordion.rotateKeyboard();
//};
//
//SITE.Mapa.prototype.scaleKeyboard = function() {
//    this.accordion.scaleKeyboard();
//};


SITE.Mapa.prototype.startPlay = function( type, value ) {
    var currentABC = this.getActiveTab();

    this.ypos = this.tuneContainerDiv.scrollTop;
    this.lastStaffGroup = -1; 

    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '<i class="ico-play"></i>';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(currentABC.abc.midi) ) {
                ga('send', 'event', 'Mapa', 'play', currentABC.title);
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML =  '<i class="ico-pause"></i>';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(currentABC.abc.midi, type, value ) ) {
                ga('send', 'event', 'Mapa', 'didactic-play', currentABC.title);
            }
        }
    }
};

SITE.Mapa.prototype.setScrolling = function(player) {
    if( !this.tuneContainerDiv || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.tuneContainerDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        this.ypos = top;
        this.tuneContainerDiv.scrollTop = this.ypos;    
    }
};

SITE.Mapa.prototype.exportaRepertorio = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var accordion = this.accordion.loaded;
        var name = accordion.getId().toLowerCase() + ".repertorio.abcx";
        var conteudo = "";
        for( var title in accordion.songs.items) {
          conteudo += accordion.songs.items[title] + '\n\n';
        }
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.getResource("DR_err_saving"));
    }    
};

SITE.Mapa.prototype.save = function() {
    var accordion = this.accordion.loaded;
    var txtAccordion = 
            '{\n'+
            '   "id":'+JSON.stringify(accordion.id)+'\n'+
            '  ,"menuOrder":'+JSON.stringify(accordion.menuOrder+100)+'\n'+
            '  ,"model":'+JSON.stringify(accordion.model)+'\n'+
            '  ,"tuning":'+JSON.stringify(accordion.tuning)+'\n'+
            '  ,"buttons":'+JSON.stringify(accordion.buttons)+'\n'+
            '  ,"pedal":'+JSON.stringify(accordion.keyboard.pedalInfo)+'\n'+
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
    
    FILEMANAGER.download( accordion.getId().toLowerCase() + '.accordion', txtAccordion );
};

SITE.Mapa.prototype.loadMap = function(evt) {
    var that = this;
    evt.preventDefault();
    FILEMANAGER.loadLocalFiles(evt, function() {
        var loader = that.startLoader( "LoadRepertoire" );
        loader.start(  function() { that.doLoadMap(FILEMANAGER.files, loader ); }
                , '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
        evt.target.value = "";
    });
};

SITE.Mapa.prototype.doLoadMap = function( files, loader ) {
    
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
                 case 'abcx':
                 case 'tunes':
                    newTunes += files[f].content;
                    break;
                 case 'chords':
                    newChords += files[f].content;
                    break;
                 case 'practices':
                    newPractices += files[f].content;
                    break;
             }
        }
    }
            
    newAccordionJSON.image = newImage || 'images/accordion.default.gif';
    
    if( ! this.accordionExists(newAccordionJSON.id) ) {
        
        newAccordion = new DIATONIC.map.AccordionMap( newAccordionJSON, true );
        
        DIATONIC.map.accordionMaps.push( newAccordion );
        
        DIATONIC.map.accordionMaps.sort( function(a,b) { 
            return a.menuOrder > b.menuOrder;
        });
        
    }   
    
    this.setup({accordionId:newAccordionJSON.id});
    
    var accordion = this.accordion.loaded;
    
    if( newTunes ) {
        var tunebook = new ABCXJS.TuneBook(newTunes);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.songs.sortedIndex.sort();
        this.renderedTune.title = accordion.getFirstSong();
        this.loadABCList(this.renderedTune.tab);
    }
    if( newChords ) {
        var tunebook = new ABCXJS.TuneBook(newChords);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.chords.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.chords.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.chords.sortedIndex.sort();
        this.renderedChord.title = accordion.getFirstChord();;
        this.loadABCList(this.renderedChord.tab);
    }
    if( newPractices ) {
        var tunebook = new ABCXJS.TuneBook(newPractices);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.practices.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.practices.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.practices.sortedIndex.sort();
        this.renderedPractice.title = accordion.getFirstPractice();
        this.loadABCList(this.renderedPractice.tab);
    }
    
    this.showTab('tabSongs');
    
    loader.stop();
};

SITE.Mapa.prototype.restauraRepertorio = function() {
    
    var that = this;
    var accordion = that.accordion.loaded;
    
    if( accordion.localResource ) {
        console.log( 'Can\'t reload repertoire for local accordion!');
        return;
    }
    
    // devido à falta de sincronismo, preciso usar o call back;
    accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  
        that.renderedTune.title = accordion.getFirstSong();
        that.loadABCList(that.renderedTune.tab);
        that.showMedia(that.renderedTune);
    });
};

SITE.Mapa.prototype.carregaRepertorioLocal = function(evt) {
    var that = this;
    FILEMANAGER.loadLocalFiles( evt, function() {
      that.doCarregaRepertorioLocal(false, FILEMANAGER.files);
      evt.target.value = "";
    });
};

SITE.Mapa.prototype.doCarregaRepertorioLocal = function(files) {
    
    var first = false;
    var accordion = this.accordion.loaded;

    for (var s = 0; s < files.length; s++) {
        var tunebook = new ABCXJS.TuneBook(files[s].content);

        for (var t = 0; t < tunebook.tunes.length; t++) {

            if( ! accordion.songs.items[tunebook.tunes[t].title] ) {
                // adiciona novo index
                accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
            } 
            //add or replace
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;

            if(! first ) {
                // marca a primeira das novas canções para ser selecionada
                this.renderedTune.title = tunebook.tunes[t].title;
                first = true;
            }

            ga('send', 'event', 'Mapa', 'load', tunebook.tunes[t].title);
        }    
    }

    // reordena a lista
    accordion.songs.sortedIndex.sort();
    //mostra?
    this.loadABCList(this.renderedTune.tab);
    this.showMedia(this.renderedTune);
        
};

SITE.Mapa.prototype.showAccordionImage = function() {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+this.accordion.loaded.image
        +'" alt="'+this.accordion.getFullName() + ' ' + DR.getResource('DR_keys') + '" style="height:200px; width:200px;" />';
};

SITE.Mapa.prototype.showAccordionName = function() {
  this.gaitaNamePlaceHolder.innerHTML = this.accordion.getFullName() + ' ' + DR.getResource('DR_keys');
};

SITE.Mapa.prototype.showTab = function(tabString) {
    
    // procura tab ativa
    var tab = this.getActiveTab();
    
    // na primeira vez não existe (melhorar isso)
    if( tab )
        tab.selector.style.display = 'none';
    
    // define a nova ativa
    this.setActiveTab(tabString);
    
    // obtem a nova tab ativa 
    tab = this.getActiveTab();
    
    tab.selector.style.display = 'block';
    
    this.showMedia(tab);
};

SITE.Mapa.prototype.reprintTab = function( newABCText ) {
    
    var currentTab = this.getActiveTab();
    
    if( newABCText ) {
        if( newABCText === currentTab.text )  {
            return;
    } else {
            currentTab.text = newABCText;
            this.accordion.loaded.setSong(currentTab.title, currentTab.text );
            this.renderTAB( currentTab );
        }
    }
};

SITE.Mapa.prototype.accordionExists = function(id) {
    return this.accordion.accordionExists(id);
};

SITE.Mapa.prototype.accordionIsCurrent = function(id) {
    return this.accordion.accordionIsCurrent(id);
};

SITE.Mapa.prototype.showABC = function(evt) {
    var self = this;
    var a = evt.split('-');
    var type = a[0];
    var i = parseInt(a[1]);
    var currentTab = self.getActiveTab();
    if( currentTab.title === this.accordion.loaded[type].sortedIndex[i] ) {
        return; // já está ativo
    }
    var loader = this.startLoader( "TABLoader" + type );
    loader.start(  function() { self.doShowABC(type, currentTab, i, loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};

SITE.Mapa.prototype.doShowABC = function(type, tab, i, loader ) {
    tab.title = this.accordion.loaded[type].sortedIndex[i];
    
    if( tab.menu.selectItem(tab.ddmId, tab.title) ) {
        if( !this.accordion.loaded.localResource)
            FILEMANAGER.saveLocal( 'property.'+this.accordion.getId()+'.'+type+'.title', tab.title );
        tab.menu.setSubMenuTitle( tab.ddmId, (tab.title.length>43 ? tab.title.substr(0,40) + "..." : tab.title) );
        this.renderTAB( tab );
        this.showMedia( tab );
        this.tuneContainerDiv.scrollTop = 0;    
        
    } else {
        console.log( 'Song title not found!');
    }
    
    loader.stop();
};

SITE.Mapa.prototype.loadABCList = function(type) {
    var tab;
    var items;
    switch( type ) {
        case 'songs':
            tab = this.renderedTune;
            tab.ddmId = 'songsMenu';
            items = this.accordion.loaded.songs.sortedIndex;
            break;
        case 'practices':
            tab = this.renderedPractice;
            tab.ddmId = 'practicesMenu';
            items = this.accordion.loaded.practices.sortedIndex;
            break;
        case 'chords':
            tab = this.renderedChord;
            tab.ddmId = 'chordsMenu';
            items = this.accordion.loaded.chords.sortedIndex;
            break;
    };
    
    tab.abc = tab.text = undefined;
    tab.div.innerHTML = "";
    tab.menu = new DRAGGABLE.ui.DropdownMenu( 
        tab.selector
        , {listener:this, method: 'showABC' }
        , [{title: '...', ddmId: tab.ddmId, itens: []}]
    );
    
    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        var m = tab.menu.addItemSubMenu( tab.ddmId, title +'|'+type+'-'+i);
        if(title === tab.title ) {
            tab.menu.setSubMenuTitle( tab.ddmId, title );
            tab.menu.selectItem(tab.ddmId, m);
        }    
    }

    this.renderTAB( tab );
    
};

SITE.Mapa.prototype.renderTAB = function( tab ) {
    
    tab.text = this.accordion.loaded.getAbcText(tab.tab, tab.title);
    
    if (tab.title === "" || tab.text === undefined ) {
        tab.text = undefined;
        tab.title = "";
        return;
    }
    
    this.abcParser.parse(tab.text, this.parserparams );
    tab.abc = this.abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.loadedKeyboard );
    }
    
    var paper = new SVG.Printer( tab.div );
    tab.printer = new ABCXJS.write.Printer(paper, this.printerparams );

    //tab.printer.printTune( tab.abc, {color:'black', backgroundColor:'#ffd' } ); 
    tab.printer.printTune( tab.abc ); 
    
    tab.printer.addSelectListener(this);
    this.accordion.clearKeyboard(true);
    
};

SITE.Mapa.prototype.setActiveTab = function(tab) {
    document.getElementById(tab).checked = true;
    switch(tab) {
        case 'tabSongs':
            this.activeTab = this.renderedTune;
            break;
        case 'tabPractices':
            this.activeTab = this.renderedPractice;
            break;
        case 'tabChords':
            this.activeTab = this.renderedChord;
            break;
    }
};

SITE.Mapa.prototype.getActiveTab = function() {
    return this.activeTab;
};
        

SITE.Mapa.prototype.highlight = function(abcelem) {
    if(!this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
    }    
};

//// neste caso não precisa fazer nada pq o texto abcx está escondido
//SITE.Mapa.prototype.unhighlight = function(abcelem) {
//};

SITE.Mapa.prototype.mediaCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            var m = this.mediaWindow.topDiv;
            FILEMANAGER.saveLocal( 'property.mediaDiv.settings',  m.style.top  + '|' + m.style.left );
            break;
        case 'OPEN':
            SITE.properties.mediaDiv.visible = true;
            this.mediaWindow.setVisible(true);
            this.showMediaButton.style.display = 'none';
            break;
        case 'CLOSE':
            this.pauseMedia();
            SITE.properties.mediaDiv.visible = false;
            this.mediaWindow.setVisible(false);
            this.showMediaButton.style.display = 'inline';
            break;
    }
    return false;
};

SITE.Mapa.prototype.pauseMedia = function() {
    if(!this.mediaWindow) return;
    var iframe = this.mediaWindow.dataDiv.getElementsByTagName("iframe")[0];
    if(!iframe) return;
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo", "args":""}', '*');            
    //iframe.postMessage('{"event":"command","func":"playVideo", "args":""}', '*');            
};

SITE.Mapa.prototype.showMedia = function(tab) {
    
    var url;
    
    if(tab.abc && tab.abc.metaText.url ) {
        url = tab.abc.metaText.url;
    } 
    
    if(url) {
        if( window.innerWidth > 1500 )  {
            SITE.properties.mediaDiv.width = 600;
            SITE.properties.mediaDiv.height = SITE.properties.mediaDiv.width * 0.55666667;
        }
        var embbed = '<iframe width="'
                +SITE.properties.mediaDiv.width+'" height="'
                +SITE.properties.mediaDiv.height+'" src="'
                +url+'?rel=0&amp;showinfo=0&amp;enablejsapi=1" frameborder="0" allowfullscreen="allowfullscreen"></iframe>';
        
        this.mediaWindow.dataDiv.innerHTML = embbed;
        this.mediaWindow.dataDiv.style.width = SITE.properties.mediaDiv.width + 'px'; 
        this.mediaWindow.dataDiv.style.height = SITE.properties.mediaDiv.height + 'px';
        this.mediaWindow.dataDiv.style.overflow = 'hidden';
        
        if( SITE.properties.mediaDiv.visible ) {
            this.mediaWindow.setVisible(true);
            this.posicionaMidia();
        } else {
            this.showMediaButton.style.display = 'inline';
        }
    } else {
        this.pauseMedia();
        this.mediaWindow.setVisible(false);
        this.showMediaButton.style.display = 'none';
    }
};

// posiciona a janela de mídia, se disponível
SITE.Mapa.prototype.posicionaMidia = function () {

    if( ! SITE.properties.mediaDiv.visible 
            || ! this.mediaWindow 
                || this.mediaWindow.topDiv.style.display === 'none') 
                        return;
    
    var w = window.innerWidth;
    
    var k = this.mediaWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    SITE.properties.mediaDiv.left = k.style.left = x+"px";
        
};

SITE.Mapa.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: this.tuneContainerDiv //document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};

SITE.Mapa.prototype.settingsCallback = function(action, elem ) {
    switch(action) {
        case 'MOVE': 
            break;
        case 'CLOSE': 
        case 'CANCEL':
            this.settingsWindow.setVisible(false);
            break;
        case 'APPLY':
           ABCXJS.write.color.highLight = this.p1.value;
           DIATONIC.map.color.close = this.p2.value;
           DIATONIC.map.color.open = this.p3.value;
           this.accordion.loadedKeyboard.legenda.setOpen();
           this.accordion.loadedKeyboard.legenda.setClose();
           this.settingsWindow.setVisible(false);
           break;
        case 'RESET':
            this.alert = new DRAGGABLE.ui.Alert( 
                this.settingsWindow, action, 
                '<br>Você deseja redefinir todos os itens?',
                '<br>Isto fará com que todos os itens retornem para suas configurações iniciais, '+
                    'isto inclui cores e posicionamento, entre outras coisas.');
            break;
        case 'RESET-YES':
            break;
        case 'RESET-NO':
        case 'RESET-CANCEL':
            this.alert.close();
            this.alert = null;
            break;
   }
};

SITE.Mapa.prototype.showSettings = function() {
    
    if(!this.settingsWindow) {
    
        this.settingsWindow = new DRAGGABLE.ui.Window( 
              null 
            , null
            , {title: 'Preferências', translate: false, statusBar: false, top: "300px", left: "500px", height:'400px',  width:'600px', zIndex: 50} 
            , {listener: this, method: 'settingsCallback'}
        );

        this.settingsWindow.topDiv.style.zIndex = 101;
        

//              <tr>\
//                <th colspan="2">Acordeon:</th><td><div id="settingsAcordeonsMenu" class="topMenu"></div></td>\
//              </tr>\
        this.settingsWindow.dataDiv.innerHTML= '\
        <div class="menu-group">\
            <table>\
              <tr>\
                <th colspan="2">Idioma:</th><th><div id="settingsLanguageMenu" class="topMenu"></div></th>\
              </tr>\
              <tr>\
                <th colspan="2"><br>Cores:</th><td></td>\
              </tr>\
              <tr>\
                <td></td><td>Cor de Realce</td><td><input type="text" id="corRealce" ></td>\
              </tr>\
              <tr>\
                <td></td><td>Fole Fechando</td><td><input type="text" id="foleFechando" ></td>\
              </tr>\
              <tr>\
                <td></td><td>Fole Abrindo</td><td><input type="text" id="foleAbrindo" ></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br>Propriedades:</th><td></td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Mostrar avisos e erros de compilação</td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Atualizar partitura automaticamente</td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Usar sons de Piano Acústico</td>\
              </tr>\
            </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1"></div>\n\
            <div id="botao2"></div>\n\
            <div id="botao3"></div>\n\
        </div>';
        
        this.settingsWindow.addPushButtons([
            'botao1|APPLY|Aplicar',
            'botao2|RESET|Redefinir',
            'botao3|CANCEL|Cancelar'
        ]);
                
                
//        var selector = new ABCXJS.edit.AccordionSelector( 
//                'sel2', 'settingsAcordeonsMenu', {listener: this, method: 'settingsCallback'} );
//        
//        selector.populate(true, 'GAITA_HOHNER_CLUB_IIIM_BR');
        
        var menu = new DRAGGABLE.ui.DropdownMenu(
               'settingsLanguageMenu'
            ,  { listener:this, method:'settingsCallback' }
            ,  [{title: 'Idioma', ddmId: 'menuIdiomas',
                    itens: [
                        '<img src="images/pt_BR.png" alt="idiomas" />&#160;Português|pt_BR',
                        '<img src="images/en_US.png" alt="idiomas" />&#160;English|en_US',
                        '<img src="images/de_DE.png" alt="idiomas" />&#160;Deustch|de_DE' 
                    ]}]
            );
    
        menu.setSubMenuTitle('menuIdiomas', '<img src="images/pt_BR.png" alt="idiomas" />&#160;Português');
        menu.disableSubMenu('menuIdiomas');

        this.p1 = document.getElementById( 'corRealce');
        this.p2 = document.getElementById( 'foleFechando');
        this.p3 = document.getElementById( 'foleAbrindo');

        this.p1.style.backgroundColor = this.p1.value = ABCXJS.write.color.highLight;
        this.p2.style.backgroundColor = this.p2.value = DIATONIC.map.color.close;
        this.p3.style.backgroundColor = this.p3.value = DIATONIC.map.color.open ;

        new DRAGGABLE.ui.ColorPicker(['corRealce', 'foleFechando', 'foleAbrindo']);

    }            
    
    this.settingsWindow.setVisible(true);
    
};

SITE.Mapa.prototype.translate = function() {
    
  this.accordion.keyboard.legenda.setText( true, DR.getResource('DR_pull'), DR.getResource('DR_push') );
  this.showAccordionName();
  
  document.title = DR.getResource("DR_title");  
  
  DR.setDescription();
  
  document.getElementById("toolsBtn").innerHTML = '<i class="ico-wrench"></i>&#160;'+DR.getResource("toolsBtn");
  document.getElementById("printBtn2").innerHTML = '<i class="ico-print"></i>&#160;'+DR.getResource("printBtn");
  document.getElementById("pdfBtn").innerHTML = '<i class="ico-print"></i>&#160;'+DR.getResource("pdfBtn");
  document.getElementById("DR_message").alt = DR.getResource("DR_message");
  
  document.getElementById("octaveUpBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveUpBtn").innerHTML = '<i class="ico-octave-up"></i>&#160;'+DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").innerHTML = '<i class="ico--octave-down"></i>&#160;'+DR.getResource("DR_octave");
  document.getElementById("printBtn").innerHTML = '<i class="ico-print"></i>&#160;'+DR.getResource("printBtn");
  document.getElementById("saveBtn").innerHTML = '<i class="ico-download"></i>&#160;'+DR.getResource("saveBtn");
  document.getElementById("forceRefresh").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("forceRefresh2").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("gotoMeasureBtn").value = DR.getResource("DR_goto");
  document.getElementById("untilMeasureBtn").value = DR.getResource("DR_until");
  
};

// Esta rotina foi criada como forma de verificar todos warnings de compilacao do repertório
SITE.Mapa.prototype.debugRepertorio = function( ) {
    
    var warnings = [];

    for (var title in this.accordion.loaded.songs.items ) {

        warnings.push( title );
        var l = warnings.length;

        this.abcParser.parse( this.accordion.loaded.songs.items[title] );

        var w = this.abcParser.getWarnings() || [];
        for (var j=0; j<w.length; j++) {
            warnings.push( '\n\t' + w[j] );
        }

        if ( this.midiParser ) {
            this.midiParser.parse( this.abcParser.getTune(), this.accordion.loadedKeyboard );
            var w= this.midiParser.getWarnings();
            for (var j=0; j<w.length; j++) {
                warnings.push('\n\t' + w[j]);
            }
        }

        warnings.push(l === warnings.length?'\ --> OK\n' : '\n' );
    }

    console.log(warnings.join(''));
        
};        
