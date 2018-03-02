/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    document.body.style.overflow = 'hidden';
    
    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.lastStaffGroup = -1; // também auxilia no controle de scroll
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.loadByIdx = this.songId = interfaceParams.songId;
    
    this.keyboardDiv = interfaceParams.keyboardDiv;
    
    this.fileLoadMap = document.getElementById('fileLoadMap');
    this.fileLoadRepertoire = document.getElementById('fileLoadRepertoire');
    this.settingsMenu = document.getElementById(interfaceParams.settingsMenu);
    this.mapDiv = document.getElementById(interfaceParams.mapDiv);

    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );
    this.abcParser = new ABCXJS.parse.Parse( null, this.accordion );
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    
    this.menu = new DRAGGABLE.ui.DropdownMenu(
           interfaceParams.mapMenuDiv
        ,  { listener: that, method:'menuCallback', translate: true }
        ,  [{title: 'Acordeões', ddmId: 'menuGaitas', itens: [] }
           ,{title: 'Repertório', ddmId: 'menuRepertorio',
                itens: [
                    'Índice|IDXREPERTOIRE',
                    'Restaurar o original|RESTOREREPERTOIRE',
                    'Carregar do drive local|LOADREPERTOIRE',
                    'Exportar para drive local|EXPORTREPERTOIRE',
                    '---',
                    'Extrair tablatura|PART2TAB',
                    'Tablatura&nbsp;&nbsp;<i class="ico-open-right"></i> Partitura|TAB2PART',
                    'ABC&nbsp;&nbsp;<i class="ico-open-right"></i> Partitura|ABC2PART'
                ]}
           ,{title: 'Informações', ddmId: 'menuInformacoes',
                itens: [
                    'Mapas para acordeões|MAPS',
                    'Tablaturas para acordeões|TABS',
                    //'Tablaturas para gaita transportada <img src="images/novo.png">|TABSTRANSPORTADA',
                    'Tablaturas para gaita transportada|TABSTRANSPORTADA',
                    'Símbolos de Repetição|JUMPS',
                    'Estúdio ABCX|ESTUDIO',
                    'Formato ABCX|ABCX',
                    'Vídeo Tutoriais|TUTORIAL',
                    'Sobre|ABOUT'
                ]}
        ]);
        
    this.menu.disableSubItem( 'menuInformacoes', 'ESTUDIO' );
    this.menu.disableSubItem( 'menuInformacoes', 'ABCX' );
    this.menu.disableSubItem( 'menuInformacoes', 'TUTORIAL' );
        
    this.accordionSelector = new ABCXJS.edit.AccordionSelector( 
            'menuGaitas', this.menu, 
            { listener:this, method: 'menuCallback' }, 
            [
                '---',
                'Salvar mapa corrente|SAVEMAP',
                'Carregar mapa do disco local|LOADMAP'
            ]
    );
    
    // tab control
    var radios = document.getElementsByName( tabParams.tabRadioGroup);
    
    for( var r=0; r < radios.length; r ++ ) {
       radios[r].addEventListener('change', function() { 
           that.showTab(this.id); 
       });
    }
    
    this.tuneContainerDiv = document.getElementById(tabParams.tuneContainerDiv);
    
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
    this.media = new SITE.Media( this.mapDiv, interfaceParams.btShowMedia, SITE.properties.mediaDiv ); 
    this.buttonChangeNotation = document.getElementById(interfaceParams.btChangeNotation);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.toolsButton = document.getElementById(interfaceParams.toolsBtn);

    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);
    
    this.printButton.addEventListener("touchstart", function(event) {  that.printPartiture(this, event); }, false);
    this.printButton.addEventListener("click", function(event) { that.printPartiture(this, event); }, false);
    this.toolsButton.addEventListener("touchstart", function(event) { that.openEstudio(this, event); }, false);
    this.toolsButton.addEventListener("click", function(event) { that.openEstudio(this, event); }, false);
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
        that.playButton.title = SITE.translator.getResource("playBtn");
        that.playButton.innerHTML = '<i class="ico-play"></i>';
        currentABC.abc.midi.printer.clearSelection();
        that.accordion.clearKeyboard(true);
    };

    this.playButton.addEventListener("click", function(evt) {
       evt.preventDefault();
       //timeout para garantir o inicio da execucao
       window.setTimeout(function(){ that.startPlay( 'normal' );}, 0 );
       
    }, false);

    this.stopButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.stopPlay();
    }, false);
    
    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );

    //DR.addAgent( this ); // register for translate
    this.defineInstrument(true);
    
    this.showAccordionName();
    this.showAccordionImage();
    this.accordionSelector.populate(false);
    this.accordion.printKeyboard( this.keyboardDiv );
    this.loadOriginalRepertoire();
    
    SITE.translator.translate();
    
    this.resize();
    
};

SITE.Mapa.prototype.setup = function (tabParams) {

    if( this.accordion.accordionIsCurrent(tabParams.accordionId) ) {
        if( tabParams.songId ) {
            this.showTab('songsTab');
            this.showABC('songs#'+tabParams.songId);
        }
        return;
    }   
    
    if( tabParams.songId ) {
        this.songId = tabParams.songId;
    }
    
    this.midiPlayer.reset();
    this.accordion.loadById(tabParams.accordionId);
    
    this.showAccordionName();
    this.showAccordionImage();
    this.accordionSelector.populate(false);
    SITE.translator.translate(this.menu.container);
    this.accordion.printKeyboard( this.keyboardDiv );
    this.loadOriginalRepertoire();
    this.resize();
    
    if (!this.accordion.loaded.localResource) { // não salva informação para acordeão local
        FILEMANAGER.saveLocal('property.accordion', this.accordion.getId());
    }
};

SITE.Mapa.prototype.resize = function() {
   
    // redimensiona a tela partitura
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;    
   
    var s1 = document.getElementById( 'section1' );
    var s2 = document.getElementById( 'section2' );
    
    // -paddingTop 78 -margins 14 -shadow 2 
    var h = (winH - s1.clientHeight - (s2.clientHeight - this.tuneContainerDiv.clientHeight) -78 -14 -2 ); 
    
    this.tuneContainerDiv.style.height = Math.max(h,200) +"px";
    
    this.renderedTune.div.style.height = (Math.max(h,200)-5) +"px";
    (this.renderedTune.ps) && this.renderedTune.ps.update();
    this.renderedChord.div.style.height = (Math.max(h,200)-5) +"px";
    (this.renderedChord.ps) && this.renderedChord.ps.update();
    this.renderedPractice.div.style.height = (Math.max(h,200)-5) +"px";
    (this.renderedPractice.ps) && this.renderedPractice.ps.update();
    
    this.media.posiciona();

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
            this.fileLoadRepertoire.click();
            break;
        case 'EXPORTREPERTOIRE':
            this.exportaRepertorio();
            break;
        case 'PART2TAB':
            this.openPart2Tab();
            break;
        case 'TAB2PART':
            this.openTab2Part();
            break;
        case 'ABC2PART':
            this.openABC2Part();
            break;
        case 'IDXREPERTOIRE':
            if(! this.repertoireWin ) {
                this.repertoireWin = new SITE.Repertorio();
            }
            this.repertoireWin.geraIndex(this);
            break;
        case 'JUMPS':
            this.showHelp('HelpTitle', 'JUMPS', '/diatonic-map/html/sinaisRepeticao.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'ABCX':
            this.showHelp('HelpTitle', 'ABCX', '/diatonic-map/html/formatoABCX.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'ESTUDIO':
            this.showHelp('HelpTitle', 'ESTUDIO', '/diatonic-map/html/estudioABCX.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TABS':
            this.showHelp('HelpTitle', 'TABS', '/diatonic-map/html/tablatura.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TABSTRANSPORTADA':
            this.showHelp('HelpTitle', 'TABSTRANSPORTADA', '/diatonic-map/html/tablaturaTransportada.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'MAPS':
            this.showHelp('HelpTitle', 'MAPS', '/diatonic-map/html/mapas.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TUTORIAL':
            this.showHelp('HelpTitle', 'TUTORIAL', '/diatonic-map/html/tutoriais.pt_BR.html', { width: '1024', height: '600', print:false } );
            break;
        case 'ABOUT':
            this.showHelp('AboutTitle', '', '/diatonic-map/html/about.pt_BR.html', { width: '800', print:false } );
            break;
        case 'GAITA_MINUANO_GC':
        case 'CONCERTINA_PORTUGUESA':
        case 'GAITA_HOHNER_CORONA_II':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        default: // as gaitas conhecidas e outras carregadas sob demanda
            this.setup({accordionId:ev});
    }
};

SITE.Mapa.prototype.loadOriginalRepertoire = function () {
    
    if (this.accordion.loaded.localResource) return;

    var self = this;
    var loader = this.startLoader( "LoadRepertoire", this.tuneContainerDiv );
    loader.start(  function() { self.doLoadOriginalRepertoire(loader); }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
};
    
SITE.Mapa.prototype.doLoadOriginalRepertoire = function (loader) {
    
    this.renderedChord.title = 
            FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.chords.title')
        || this.accordion.loaded.getFirstChord();
    
    
    this.loadABCList(this.renderedChord.tab);

    this.renderedPractice.title = 
           FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.practices.title')
        || this.accordion.loaded.getFirstPractice();

    this.loadABCList(this.renderedPractice.tab);

    var title;
    
    if(  this.songId ) {
        title = this.accordion.loaded.songs.ids[this.songId];
        delete this.songId; // load once
    }
    
    this.renderedTune.title = 
            title
        ||  FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.songs.title')
        || this.accordion.loaded.getFirstSong();

    this.loadABCList(this.renderedTune.tab);
    
    this.showTab('songsTab');
    
    loader.stop();
    
    if( this.loadByIdx ) {
        SITE.ga('send', 'event', 'Mapa5', 'index', this.getActiveTab().title);
        
//        SITE.myGtag( 'event', 'index', {
//          send_to : 'acessos',
//          event_category: 'Mapa5',
//          event_action: 'index',
//          event_label: this.getActiveTab().title,
//          event_value: 0,
//          nonInteraction: false 
//        });                
        
        if(! this.repertoireWin ) {
            this.repertoireWin = new SITE.Repertorio();
        }
        this.repertoireWin.geraIndex(this);
        
        delete this.loadByIdx;
    }

};

SITE.Mapa.prototype.printPartiture = function (button, event) {
    var currentABC = this.getActiveTab();
    event.preventDefault();
    button.blur();
    if(  currentABC.div.innerHTML )  {
        
        SITE.ga('send', 'event', 'Mapa5', 'print', currentABC.title);
        
//        SITE.myGtag( 'event', 'print', {
//          send_to : 'acessos',
//          event_category: 'Mapa5',
//          event_action: 'print',
//          event_label: currentABC.title,
//          event_value: 0,
//          nonInteraction: false 
//        });                
        
        this.printPreview(currentABC.div.innerHTML, ["#topBar","#mapaDiv"], currentABC.abc.formatting.landscape );
    }
};

SITE.Mapa.prototype.openMapa = function (newABCText) {
    
    var tab = this.getActiveTab();
    
    this.menu.enableSubMenu('menuGaitas');
    this.menu.enableSubMenu('menuRepertorio');
    this.setVisible(true);
    
    this.accordion.printKeyboard( this.keyboardDiv );
    this.resize();
    
    if( newABCText !== undefined ) {
        if( newABCText === tab.text )  {
            return;
        } else {
            tab.text = newABCText;
            this.accordion.loaded.setSong(tab.title, tab.text );
            this.renderTAB( tab );
        }
    }
};

SITE.Mapa.prototype.closeMapa = function () {
    this.media.pause();
    this.midiPlayer.stopPlay();
    this.setVisible(false);
    
    this.menu.disableSubMenu('menuGaitas');
    this.menu.disableSubMenu('menuRepertorio');
};

SITE.Mapa.prototype.openPart2Tab = function () {
    if( ! this.part2tab ) {
        this.part2tab = new SITE.TabGen(
            this
            ,{  // interfaceParams
                tabGenDiv: 'tabGenDiv'
               ,controlDiv: 'p2tControlDiv-raw' 
               ,saveBtn:'p2tSaveBtn'
               ,updateBtn:'p2tForceRefresh'
               ,openBtn: 'p2tOpenInGenerator'
            }
        );
    }
    this.part2tab.setup(this.activeTab.text);
};

SITE.Mapa.prototype.openABC2Part = function () {
    if( ! this.ABC2part ) {
        this.ABC2part = new SITE.PartEdit(
            this
            ,{   // interfaceParams
                partEditDiv: 'partEditDiv'
               ,controlDiv: 'a2pControlDiv-raw' 
               ,showEditorBtn: 'a2pShowEditorBtn'
               ,showMapBtn: 'a2pShowMapBtn'
               ,updateBtn:'a2pForceRefresh'
               ,loadBtn:'a2pLoadBtn'
               ,saveBtn:'a2pSaveBtn'
               ,printBtn:'a2pPrintBtn'
               ,playBtn: "a2pPlayBtn"
               ,stopBtn: "a2pStopBtn"
               ,btShowMedia: 'a2pbuttonShowMedia'
               ,currentPlayTimeLabel: "a2pCurrentPlayTimeLabel"
               ,generate_tablature: 'accordion'
               ,accordion_options: {
                     id: this.accordion.getId()
                    ,accordionMaps: DIATONIC.map.accordionMaps
                    ,translator: SITE.translator 
                    ,render_keyboard_opts:{
                         transpose:false
                        ,mirror: false
                        ,scale:0.8
                        ,draggable:true
                        ,show:false
                        ,label:false
                    }
                }
            });
    } 
    this.ABC2part.setup({accordionId: this.accordion.getId()});
};

SITE.Mapa.prototype.openTab2Part = function () {
    if( ! this.tab2part ) {
        this.tab2part = new SITE.PartGen(
            this
            ,{   // interfaceParams
                partGenDiv: 'partGenDiv'
               ,controlDiv: 't2pControlDiv-raw' 
               //,showMapBtn: 't2pShowMapBtn'
               //,printBtn:'t2pPrintBtn'
               ,showEditorBtn: 't2pShowEditorBtn'
               ,updateBtn:'t2pForceRefresh'
               ,loadBtn:'t2pLoadBtn'
               ,saveBtn:'t2pSaveBtn'
               ,editPartBtn:'t2pOpenInPartEditBtn'
               ,savePartBtn:'t2pSavePartBtn'
               ,playBtn: "t2pPlayBtn"
               ,stopBtn: "t2pStopBtn"
               ,currentPlayTimeLabel: "t2pCurrentPlayTimeLabel"
               ,btShowMedia: 't2pbuttonShowMedia'
               ,ckShowABC:'ckShowABC'
               ,ckConvertToClub:'ckConvertToClub'
               ,ckConvertFromClub:'ckConvertFromClub'
               ,generate_tablature: 'accordion'
               ,accordion_options: {
                     id: this.accordion.getId()
                    ,accordionMaps: DIATONIC.map.accordionMaps
                    ,translator: SITE.translator 
                    ,render_keyboard_opts:{
                         transpose:false
                        ,mirror: false
                        ,scale:0.8
                        ,draggable:true
                        ,show:false
                        ,label:false
                    }
                }
            });
    } 
    this.tab2part.setup({accordionId: this.accordion.getId()});
};

SITE.Mapa.prototype.openEstudio = function (button, event) {
    var self = this;
    var tab = self.getActiveTab();
    
    if(event) {
        event.preventDefault();
        button.blur();
    }
    
    if( ! this.studio ) {
        this.studio = new SITE.Estudio(
            this
            ,{   // interfaceParams
                studioDiv: 'studioDiv'
               ,studioControlDiv: 'studioControlDiv'
               ,studioCanvasDiv: 'studioCanvasDiv'
               ,generate_tablature: 'accordion'
               ,showMapBtn: 'showMapBtn'
               ,showEditorBtn: 'showEditorBtn'
               ,showTextBtn: 'showTextBtn'
               ,printBtn:'printBtn'
               ,saveBtn:'saveBtn'
               ,forceRefresh:'forceRefresh'
               ,btShowMedia: 'buttonShowMedia2'
               ,accordion_options: {
                     id: this.accordion.getId()
                    ,accordionMaps: DIATONIC.map.accordionMaps
                    ,translator: SITE.translator 
                    ,render_keyboard_opts:{
                         transpose:false
                        ,mirror:false
                        ,scale:0.8
                        ,draggable:true
                        ,show:false
                        ,label:false
                    }
                }
               ,onchange: function( studio ) { studio.onChange(); }
          } 
          , {   // playerParams
                modeBtn: "modeBtn"
              , timerBtn: "timerBtn"
              , playBtn: "playBtn2"
              , stopBtn: "stopBtn2"
              , clearBtn: "clearBtn"
              , gotoMeasureBtn: "gotoMeasureBtn"
              , untilMeasureBtn: "untilMeasureBtn"
              , stepBtn: "stepBtn"
              , repeatBtn: "repeatBtn"
              , stepMeasureBtn: "stepMeasureBtn"
              , tempoBtn: "tempoBtn"
              , GClefBtn: "GClefBtn"
              , FClefBtn: "FClefBtn"
              , currentPlayTimeLabel: "currentPlayTimeLabel2"
          } 
        );
    }

    if( tab.text ) {
        SITE.ga('send', 'event', 'Mapa5', 'tools', tab.title);
        
//        SITE.myGtag( 'event', 'tools', {
//          send_to : 'acessos',
//          event_category: 'Mapa5',
//          event_action: 'tools',
//          event_label: tab.title,
//          event_value: 0,
//          nonInteraction: false 
//        });                
        
        
        var loader = this.startLoader( "OpenEstudio" );
        loader.start(  function() { 
            self.studio.setup( tab, self.accordion.getId() );
            loader.stop();
        }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
    }
};

SITE.Mapa.prototype.startPlay = function( type, value ) {
    var currentABC = this.getActiveTab();

    this.ypos = this.tuneContainerDiv.scrollTop;
    this.lastStaffGroup = -1; 

    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = SITE.translator.getResource("playBtn");
            this.playButton.innerHTML = '<i class="ico-play"></i>';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(currentABC.abc.midi) ) {
                SITE.ga('send', 'event', 'Mapa5', 'play', currentABC.title);
                
//                SITE.myGtag( 'event', 'play', {
//                  send_to : 'acessos',
//                  event_category: 'Mapa5',
//                  event_action: 'play',
//                  event_label: currentABC.title,
//                  event_value: 0,
//                  nonInteraction: false 
//                });                

                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML =  '<i class="ico-pause"></i>';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(currentABC.abc.midi, type, value ) ) {
                SITE.ga('send', 'event', 'Mapa5', 'didactic-play', currentABC.title);
                
//                SITE.myGtag( 'event', 'didactic-play', {
//                  send_to : 'acessos',
//                  event_category: 'Mapa5',
//                  event_action: 'didactic-play',
//                  event_label: currentABC.title,
//                  event_value: 0,
//                  nonInteraction: false 
//                });                

            }
        }
    }
};

SITE.Mapa.prototype.setScrolling = function(player) {
    if( !this.activeTab || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.activeTab.div.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top-12;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        this.ypos = top;
        this.activeTab.div.scrollTop = this.ypos;    
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
        alert( SITE.translator.getResource("err_saving") );
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
        var loader = that.startLoader( "LoadRepertoire", that.tuneContainerDiv  );
        loader.start(  function() { that.doLoadMap(FILEMANAGER.files, loader ); }
                , '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
        evt.target.value = "";
    });
};

SITE.Mapa.prototype.doLoadMap = function( files, loader ) {
    
    var newAccordionJSON, newImage;
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
    
    if( newAccordionJSON === undefined ) {
        loader.stop();
        console.log( 'O arquivo principal .accordion não foi encontrado!' );
        return;
    }
            
    newAccordionJSON.image = newImage || 'images/accordion.default.gif';
    
    if( ! this.accordion.accordionExists(newAccordionJSON.id) ) {
        DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap( newAccordionJSON, true ) );
        DIATONIC.map.sortAccordions();
    }   
    
    this.setup({accordionId:newAccordionJSON.id});
    
    var accordion = this.accordion.loaded;
    
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
    
    this.showTab('songsTab');
    loader.stop();
};

SITE.Mapa.prototype.restauraRepertorio = function() {
    
    var that = this;
    var accordion = that.accordion.loaded;
    
    if( accordion.localResource ) {
        // não é possível restaurar repertório para acordeão local;
        return;
    }
    
    accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  
        that.renderedTune.title = accordion.getFirstSong();
        that.loadABCList(that.renderedTune.tab);
        that.showTab('songsTab');
    });
};

SITE.Mapa.prototype.carregaRepertorioLocal = function(evt) {
    var that = this;
    FILEMANAGER.loadLocalFiles( evt, function() {
      that.doCarregaRepertorioLocal(FILEMANAGER.files);
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
            // add or replace content
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.details[tunebook.tunes[t].title] = { composer: tunebook.tunes[t].composer, id: tunebook.tunes[t].id };
            accordion.songs.ids[tunebook.tunes[t].id] = tunebook.tunes[t].title;

            if(! first ) {
                // marca a primeira das novas canções para ser selecionada
                this.renderedTune.title = tunebook.tunes[t].title;
                first = true;
            }
            
            SITE.ga('send', 'event', 'Mapa5', 'loadSong', tunebook.tunes[t].title);
            
//            SITE.myGtag( 'event', 'loadSong', {
//              send_to : 'acessos',
//              event_category: 'Mapa5',
//              event_action: 'loadSong',
//              event_label: tunebook.tunes[t].title,
//              event_value: 0,
//              nonInteraction: false 
//            });                
        }    
    }

    // reordena a lista
    accordion.songs.sortedIndex.sort();
    this.loadABCList(this.renderedTune.tab);
    this.showTab('songsTab');
        
};

SITE.Mapa.prototype.showTab = function(tabString) {
    
    var tab = this.getActiveTab();
    
    if( tab ) {
        tab.selector.style.display = 'none';
        this.silencia(true);
    }
    
    tab = this.setActiveTab(tabString);
    
    tab.selector.style.display = 'block';
    
    this.media.show(tab);
};

SITE.Mapa.prototype.showABC = function(action) {
    var type, title, self = this;
    var tab = self.getActiveTab();
    var a = action.split('#');
    
    if( action.indexOf('#') >= 0 && parseInt(a[1]) > 0 ) {
        type = a[0];
        title = this.accordion.loaded[type].ids[ a[1] ];
    } else {
        waterbug.logError( 'ABCX not found!');
        waterbug.show();
        return;
    }
    
    if( tab.title !== title && tab.menu.selectItem( tab.ddmId, action ) ) {
        tab.title = title;
        tab.text = this.accordion.loaded.getAbcText( tab.tab, tab.title );
        var cleanedTitle = title.replace(/\(.*\)/g,"").trim();
        tab.menu.setSubMenuTitle( tab.ddmId, (cleanedTitle.length>43 ? cleanedTitle.substr(0,40) + "..." : cleanedTitle) );
        if( !this.accordion.loaded.localResource)
            FILEMANAGER.saveLocal( 'property.'+this.accordion.getId()+'.'+type+'.title', tab.title );
        var loader = this.startLoader( "TABLoader" + type, this.tuneContainerDiv );
        loader.start(  function() { 
            self.midiPlayer.stopPlay();
            self.renderTAB( tab );
            self.media.show( tab );
            self.tuneContainerDiv.scrollTop = 0;    
            loader.stop();
        }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
    } else {
        console.log( 'Song title not found!');
    }
};

SITE.Mapa.prototype.loadABCList = function(type) {
    var tab, items;
    switch( type ) {
        case 'songs':
            tab = this.renderedTune;
            tab.ddmId = 'songsMenu';
            items = this.accordion.loaded.songs;
            break;
        case 'practices':
            tab = this.renderedPractice;
            tab.ddmId = 'practicesMenu';
            items = this.accordion.loaded.practices;
            break;
        case 'chords':
            tab = this.renderedChord;
            tab.ddmId = 'chordsMenu';
            items = this.accordion.loaded.chords;
            break;
    };
    
    tab.abc = tab.text = undefined;
    tab.div.innerHTML = "";
    tab.menu = new DRAGGABLE.ui.DropdownMenu( 
        tab.selector
        , {listener:this, method: 'showABC', translate:false }
        , [{title: '...', ddmId: tab.ddmId, itens: []}]
    );
    
    var achou = false;
    for( var i = 0; i < items.sortedIndex.length; i++) {
        
        var title = items.sortedIndex[i];
        var cleanedTitle = title.replace(/\(.*\)/g,"").trim();
        var vid = 0;
        
        if( ! items.details[title] || isNaN(parseInt(items.details[title].id)) ) {
            waterbug.logError( 'Missing or incorrect ID (X:nnn) for "' + title +'"' );
            waterbug.show();
        } else {
            vid = items.details[title].id;
        }
        
        var m = tab.menu.addItemSubMenu( tab.ddmId, cleanedTitle +'|'+type+'#'+vid);
        if(title === tab.title ) {
            achou = true;
            tab.menu.setSubMenuTitle( tab.ddmId, cleanedTitle );
            tab.menu.selectItem(tab.ddmId, m);
            tab.text = this.accordion.loaded.getAbcText(type, title);
        }    
    }
    if( !achou && items.sortedIndex.length > 0 ) {
        var title = items.sortedIndex[0];
        var cleanedTitle = title.replace(/\(.*\)/g,"").trim();
        tab.menu.setSubMenuTitle( tab.ddmId, cleanedTitle );
        tab.menu.selectItem(tab.ddmId, type+'#'+items.details[title].id);
        tab.text = this.accordion.loaded.getAbcText(type, title);
    }
    
    this.setActiveTab(type+'Tab');
    this.renderTAB( tab );
    
};

SITE.Mapa.prototype.renderTAB = function( tab ) {
    
    if (tab.title === undefined || tab.text === undefined ) {
        tab.text = undefined;
        tab.title = undefined;
        return;
    }
    
    this.abcParser.parse( tab.text, this.parserparams );
    tab.abc = this.abcParser.getTune();
    tab.text = this.abcParser.getStrTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.loadedKeyboard );
    }
    
    var paper = new SVG.Printer( tab.div );
    tab.printer = new ABCXJS.write.Printer(paper, this.printerparams );
            
    //tab.printer.printTune( tab.abc, {color:'black', backgroundColor:'#ffd' } ); 
    tab.printer.printTune( tab.abc ); 
    
    tab.printer.addSelectListener(this);
    this.accordion.clearKeyboard(true);
    
    tab.div.scrollTop = 0;
    
    if( tab.ps ) 
        tab.ps.update();
    else    
        tab.ps = new PerfectScrollbar( tab.div, {
            handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
            wheelSpeed: 1,
            wheelPropagation: false,
            suppressScrollX: false,
            minScrollbarLength: 100,
            swipeEasing: true,
            scrollingThreshold: 500
        });
    
    
};

SITE.Mapa.prototype.setActiveTab = function(tab) {
    document.getElementById(tab).checked = true;
    
    if( this.activeTab ) this.activeTab.selector.style.display = 'none';

    switch(tab) {
        case 'songsTab':
            this.activeTab = this.renderedTune;
            break;
        case 'practicesTab':
            this.activeTab = this.renderedPractice;
            break;
        case 'chordsTab':
            this.activeTab = this.renderedChord;
            break;
    }
    return this.activeTab;
};

SITE.Mapa.prototype.getActiveTab = function() {
    return this.activeTab;
};

SITE.Mapa.prototype.setVisible = function ( visible ) {
    this.mapDiv.style.display = (visible? 'inline':'none');
};

SITE.Mapa.prototype.showAccordionImage = function() {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+this.accordion.loaded.image
        +'" alt="'+this.accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '" style="height:200px; width:200px;" />';
};

SITE.Mapa.prototype.showAccordionName = function() {
  this.gaitaNamePlaceHolder.innerHTML = this.accordion.getFullName() + ' <span data-translate="keys">' + SITE.translator.getResource('keys') + '</span>';
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

SITE.Mapa.prototype.startLoader = function(id, container, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: container? container: document.body
        ,onstart: start // call function once loader has started	
        ,oncomplete: stop // call function once loader has started	
    });
    return loader;
};

SITE.Mapa.prototype.defineInstrument = function(onlySet) {
    
    var instrument = SITE.properties.options.pianoSound ?  "acoustic_grand_piano" : "accordion" ;
    
    var setInstrument = function () {
        var instrumentId = SITE.properties.options.pianoSound? 0: 21; // accordion
        MIDI.programChange( 0, instrumentId );
        MIDI.programChange( 1, instrumentId );
        MIDI.programChange( 2, instrumentId );
        MIDI.programChange( 3, instrumentId );
        MIDI.programChange( 4, instrumentId );
        MIDI.programChange( 5, instrumentId );
    };
    
    if( onlySet ) {
        setInstrument();
        return;
    }
    
    MIDI.widget = new sketch.ui.Timer({
        size:180
        //, container: document.getElementById('mapaDiv')
        , cor1:SITE.properties.colors.close, cor2: SITE.properties.colors.open});
    
    MIDI.widget.setFormat( SITE.translator.getResource('loading'));

    MIDI.loadPlugin({
         soundfontUrl: "./soundfont/"
        ,instruments: instrument
        ,onprogress: function( total, done, currentPercent ) {
            var percent = ((done*100)+currentPercent)/(total);
            MIDI.widget.setValue(Math.round(percent));
        }
        ,callback: function() {
            setInstrument();
        }
    });
};

SITE.Mapa.prototype.showSettings = function() {

    //window.waterbug && window.waterbug.show();

    var width = 600;
    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;    
        
    var x = winW/2 - width/2;
    
    if(!this.settings) {
        this.settings = {};
        this.settings.window = new DRAGGABLE.ui.Window( 
              null 
            , null
            , {title: 'PreferencesTitle', translator: SITE.translator, statusbar: false, top: "300px", left: x+"px", height:'400px',  width: width+'px', zIndex: 50} 
            , {listener: this, method: 'settingsCallback'}
        );

        this.settings.window.topDiv.style.zIndex = 101;

//              <tr>\
//                <th colspan="2">Acordeão:</th><td><div id="settingsAcordeonsMenu" class="topMenu"></div></td>\
//              </tr>\

        this.settings.window.dataDiv.innerHTML= '\
        <div class="menu-group">\
            <table>\
              <tr>\
                <th colspan="2"><span data-translate="PrefsIdiom" >'+SITE.translator.getResource('PrefsIdiom')+'</span></th><th><div id="settingsLanguageMenu" class="topMenu"></div></th>\
              </tr>\
              <tr>\
                <th colspan="2"><br><span data-translate="PrefsColor" >'+SITE.translator.getResource('PrefsColor')+'</span></th><td></td>\
              </tr>\
              <tr>\
                <td style="width:15px;"></td><td data-translate="PrefsColorHighlight" >'
                    +SITE.translator.getResource('PrefsColorHighlight')
                        +'</td><td><input id="corRealce" type="text" ><input id="chkTransparency" type="checkbox">&nbsp;<span data-translate="PrefsColorTransparency" >'
                            +SITE.translator.getResource('PrefsColorTransparency')+'</span></td>\
              </tr>\
              <tr>\
                <td></td><td data-translate="PrefsColorClosingBellows" >'+SITE.translator.getResource('PrefsColorClosingBellows')+'</td><td><input id="foleFechando" type="text" ></td>\
              </tr>\
              <tr>\
                <td></td><td data-translate="PrefsColorOpeningBellows" >'+SITE.translator.getResource('PrefsColorOpeningBellows')+'</td><td><input id="foleAbrindo" type="text" ></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br><span data-translate="PrefsProps" >'+SITE.translator.getResource('PrefsProps')+'</span></th><td></td>\
              </tr>\
              <tr>\
                <td> </td><td colspan="2"><input id="chkPiano" type="checkbox">&nbsp;<span data-translate="PrefsPropsCKPiano" >'+SITE.translator.getResource('PrefsPropsCKPiano')+'</span></td>\
              </tr>\
              <tr>\
                <td> </td><td colspan="2"><input id="chkWarnings" type="checkbox">&nbsp;<span data-translate="PrefsPropsCKShowWarnings" >'+SITE.translator.getResource('PrefsPropsCKShowWarnings')+'</span></td>\
              </tr>\
              <tr>\
                <td> </td><td colspan="2"><input id="chkAutoRefresh" type="checkbox">&nbsp;<span data-translate="PrefsPropsCKAutoRefresh" >'+SITE.translator.getResource('PrefsPropsCKAutoRefresh')+'</span></td>\
              </tr>\
            </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1"></div>\n\
            <div id="botao2"></div>\n\
            <div id="botao3"></div>\n\
        </div>';
        
        this.settings.window.addPushButtons([
            'botao1|apply',
            'botao2|reset|PrefsReset',
            'botao3|cancel'
        ]);
                
//        var selector = new ABCXJS.edit.AccordionSelector( 
//                'sel2', 'settingsAcordeonsMenu', {listener: this, method: 'settingsCallback'} );
//        
//        selector.populate(true, 'GAITA_HOHNER_CLUB_IIIM_BR');
        
        this.settings.menu = new DRAGGABLE.ui.DropdownMenu(
               'settingsLanguageMenu'
            ,  { listener:this, method: 'settingsCallback', translate: false  }
            ,  [ {title: 'Idioma', ddmId: 'menuIdiomas', itens: [] } ]
            );
    
        this.picker = new DRAGGABLE.ui.ColorPicker(['corRealce', 'foleFechando', 'foleAbrindo'], {translator: SITE.translator});
      
        SITE.translator.menuPopulate(this.settings.menu, 'menuIdiomas');
        this.settings.lang = SITE.properties.options.language;

        this.settings.useTransparency =  document.getElementById( 'chkTransparency');
        this.settings.corRealce = document.getElementById( 'corRealce');
        this.settings.closeColor = document.getElementById( 'foleFechando');
        this.settings.openColor = document.getElementById( 'foleAbrindo');
        this.settings.showWarnings = document.getElementById( 'chkWarnings');
        this.settings.autoRefresh = document.getElementById( 'chkAutoRefresh');
        this.settings.pianoSound = document.getElementById( 'chkPiano');
    }            
    
    this.settings.corRealce.style.backgroundColor = this.settings.corRealce.value = SITE.properties.colors.highLight;
    this.settings.closeColor.style.backgroundColor = this.settings.closeColor.value = SITE.properties.colors.close;
    this.settings.openColor.style.backgroundColor = this.settings.openColor.value = SITE.properties.colors.open ;

    this.settings.showWarnings.checked = SITE.properties.options.showWarnings;
    this.settings.autoRefresh.checked = SITE.properties.options.autoRefresh;
    this.settings.pianoSound.checked = SITE.properties.options.pianoSound;
    this.settings.useTransparency.checked = SITE.properties.colors.useTransparency;
    
    this.settings.window.setVisible(true);
    
};

SITE.Mapa.prototype.settingsCallback = function (action, elem) {
    switch (action) {
        case 'de_DE':
        case 'en_US':
        case 'es_ES':
        case 'fr_FR':
        case 'it_IT':
        case 'pt_BR':
            this.settings.lang = action;
            this.settings.menu.setSubMenuTitle( 'menuIdiomas', this.settings.menu.selectItem( 'menuIdiomas', action ));
            break;
        case 'MOVE':
            break;
        case 'CLOSE':
        case 'CANCEL':
            this.picker.close();
            this.settings.window.setVisible(false);
            break;
        case 'APPLY':
            SITE.properties.colors.highLight = this.settings.corRealce.value;
            SITE.properties.colors.close = this.settings.closeColor.value;
            SITE.properties.colors.open = this.settings.openColor.value;
            SITE.properties.options.showWarnings = this.settings.showWarnings.checked;
            SITE.properties.options.autoRefresh = this.settings.autoRefresh.checked;
            SITE.properties.colors.useTransparency = this.settings.useTransparency.checked;

            this.picker.close();
            this.settings.window.setVisible(false);
            this.applySettings();
            SITE.SaveProperties();
            break;
        case 'RESET':
            this.alert = new DRAGGABLE.ui.Alert(
                    this.settings.window, action,
                    '<br>'+SITE.translator.getResource('resetMsgTitle'),
                    '<br>'+SITE.translator.getResource('resetMsgDescription'),
                    {translator: SITE.translator} );
            break;
        case 'RESET-YES':
            this.alert.close();
            this.picker.close();
            this.settings.window.setVisible(false);
            SITE.ResetProperties();
            SITE.ga('send', 'event', 'Configuration', 'reset', SITE.properties.version );
            
//            SITE.myGtag( 'event', 'reset', {
//              send_to : 'outros',
//              event_category: 'Configuration',
//              event_action: 'reset',
//              event_label: SITE.properties.version,
//              event_value: 0,
//              nonInteraction: true 
//            });  
            
            this.applySettings();
            break;
        case 'RESET-NO':
        case 'RESET-CANCEL':
            this.alert.close();
            break;
    }
};

SITE.Mapa.prototype.applySettings = function() {

    if( this.settings.lang !== SITE.properties.options.language ) {
        SITE.properties.options.language = this.settings.lang;
        
        SITE.ga('send', 'event', 'Configuration', 'changeLang', SITE.properties.options.language);
        
//        SITE.myGtag( 'event', 'changeLang', {
//          send_to : 'outros',
//          event_category: 'Configuration',
//          event_action: 'changeLang',
//          event_label: SITE.properties.options.language,
//          event_value: 0,
//          nonInteraction: true 
//        });

        SITE.translator.loadLanguage( this.settings.lang, function () { SITE.translator.translate(); } );  
    }
    
    if( this.settings.pianoSound.checked  !== SITE.properties.options.pianoSound ) {
        SITE.properties.options.pianoSound = this.settings.pianoSound.checked;
        SITE.ga('send', 'event', 'Configuration', 'changeInstrument', SITE.properties.options.pianoSound?'piano':'accordion');
        
//        SITE.myGtag( 'event', 'changeInstrument', {
//          send_to : 'outros',
//          event_category: 'Configuration',
//          event_action: 'changeInstrument',
//          event_label: SITE.properties.options.pianoSound?'piano':'accordion',
//          event_value: 0,
//          nonInteraction: true 
//        });
        
        this.defineInstrument();
    }
    
    this.media.show(this.getActiveTab());

    if (this.studio) {
        this.studio.setAutoRefresh(SITE.properties.options.autoRefresh);
        this.studio.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    if (this.part2tab) {
        this.part2tab.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    if (this.tab2part) {
        this.tab2part.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    if (this.ABC2part) {
        this.ABC2part.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    
    this.resizeActiveWindow();
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.accordion.loadedKeyboard.legenda.setOpen();
    this.accordion.loadedKeyboard.legenda.setClose();
};

SITE.Mapa.prototype.changePageOrientation = function (orientation) {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = '@page {margin: 1cm; size: ' + orientation + '}';

};

SITE.Mapa.prototype.printPreview = function (html, divsToHide, landscape ) {
    
    var dv = document.getElementById('printPreviewDiv');
    
    if (window.matchMedia ) {
        
        divsToHide.forEach( function( div ) {
            var hd = document.getElementById(div.substring(1));
            hd.style.opacity = 0;
        });

        this.changePageOrientation(landscape? 'landscape': 'portrait');

        dv.innerHTML = html;
        dv.style.display = 'block';
        
        window.setTimeout( function () { 
            window.print(); 
            
            dv.style.display = 'none';

            divsToHide.forEach( function( div ) {
                var hd = document.getElementById(div.substring(1));
                hd.style.opacity = 1;
            });
                
        }, 200 );
        
    }    
};

SITE.Mapa.prototype.resizeActiveWindow = function() {
    if(this.studio && window.getComputedStyle(this.studio.Div.parent).display !== 'none') {
       this.studio.resize();
    } else if(this.tab2part && window.getComputedStyle(this.tab2part.Div.parent).display !== 'none') {      
       this.tab2part.resize();
    } else if(this.ABC2part && window.getComputedStyle(this.ABC2part.Div.parent).display !== 'none') {      
       this.ABC2part.resize();
    } else if(this.part2tab && window.getComputedStyle(this.part2tab.Div.parent).display !== 'none') {      
       this.part2tab.resize();
    } else {    
        this.resize();
    }    
};

SITE.Mapa.prototype.silencia = function(force) {
    if(this.studio && window.getComputedStyle(this.studio.Div.parent).display !== 'none') {
        if( this.studio.midiPlayer.playing) {
            if(force )
                this.studio.midiPlayer.stopPlay();
            else
                this.studio.startPlay('normal'); // pause
            
        }
    } else if(this.tab2part && window.getComputedStyle(this.tab2part.Div.parent).display !== 'none') {      
        if( this.tab2part.midiPlayer.playing) {
            if(force )
                this.tab2part.midiPlayer.stopPlay();
            else
                this.tab2part.startPlay('normal'); // pause
        }
    } else {
        if( this.midiPlayer.playing) {
            if(force )
                this.midiPlayer.stopPlay();
            else
                this.startPlay('normal'); // pause
        }
    }
};

SITE.Mapa.prototype.showHelp = function ( title, subTitle, url, options ) {
    var that = this;
    options = options || {};
    options.width = typeof options.width === 'undefined'? '800' : options.width;
    options.height = typeof options.height === 'undefined'? undefined : options.height;
    options.print = typeof options.print === 'undefined'? true : options.print;
    
    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;    
        
    var x = winW/2 - options.width/2;
    
    if( ! this.helpWindow ) {
        this.helpWindow = new DRAGGABLE.ui.Window(
            null
          , ['print|printBtn']
          , {title: '', translator: SITE.translator, draggable: true, statusbar: false, top: "200px", left: x+"px", height:"auto", zIndex: 70}
          , { listener: this, method:'helpCallback' }
        );
        this.helpWindow.dataDiv.style.height = "auto";
    }

    this.helpWindow.setTitle(title, SITE.translator);
    this.helpWindow.setSubTitle(subTitle, SITE.translator);
    this.helpWindow.setButtonVisible('PRINT', options.print );
    
    this.helpWindow.dataDiv.innerHTML = '<object data="'+url+'" type="text/html" ></object>';
    this.iframe = this.helpWindow.dataDiv.getElementsByTagName("object")[0];
    
    var loader = this.startLoader( "About" );
    
    this.iframe.style.width = options.width+"px";
    this.iframe.style.height = (options.height?options.height:400)+"px";
    that.helpWindow.topDiv.style.opacity = "0";
    that.helpWindow.setVisible(true);
            
    loader.start(  function() { 
        if( options.height ) {
            that.iframe.addEventListener("load", function () { 
                that.helpWindow.topDiv.style.opacity = "1";
                that.iframe.style.height = options.height+"px";
                
                var header = this.contentDocument.getElementById('helpHeader');
                var frm = this.contentDocument.getElementById('helpFrame');
                var container = this.contentDocument.getElementById('helpContainer');
                if( header ) header.style.display = 'none';
                if( frm ) frm.style.overflow = 'hidden';
                if( container ) {
                    container.style.top = '0';
                    container.style.height = (options.height-18)+"px";;
                    container.style.overflow = 'hidden';
                    container.style.border = '1px solid rgba(255, 153, 34, 0.2)';
                    var v = new PerfectScrollbar( container, {
                        handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
                        wheelSpeed: 1,
                        wheelPropagation: false,
                        suppressScrollX: false,
                        minScrollbarLength: 100,
                        swipeEasing: true,
                        scrollingThreshold: 500
                    });
                }
                
                loader.stop();
            });    
        } else { // auto determina a altura
            that.iframe.addEventListener("load", function () { 
                this.contentDocument.body.style.overflow ="hidden";
                var info = this.contentDocument.getElementById('siteVerI');
                if( info ) info.innerHTML=SITE.siteVersion;
                that.iframe.style.height = this.contentDocument.body.clientHeight+"px";
                that.helpWindow.topDiv.style.opacity = "1";
                that.helpWindow.dataDiv.style.overflow = "hidden";
                loader.stop();
            });
        }
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
};

SITE.Mapa.prototype.helpCallback = function ( action ) {
    if( action === 'CLOSE' ) {
        this.helpWindow.setVisible(false);
    } else if( action === 'PRINT' ) {
        var container = this.iframe.contentDocument.getElementById('helpContainer');
        if( container ) {
            //var t = container.style.top;
            //container.style.top = '0';
            this.printPreview( container.innerHTML, [ "#"+this.helpWindow.topDiv.id, "#topBar","#mapaDiv"], false );
            //var header = this.iframe.contentDocument.getElementById('helpHeader');
            //if( header ) header.style.display = 'none';
            //container.style.top = t;
        }
    }
//    console.log( action );
};

