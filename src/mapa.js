/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    document.body.style.overflow = 'hidden';
    
    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.lastStaffGroup = -1; // também auxilia no controle de scroll
    
    // incluir ilheiras numeradas e hide fingering, hide lyrics flavio2022
    this.parserparams = {}

    this.modal = new SITE.Modal( { print: true, callback: { listener: this, method: 'modalCallback'} } )
    this.modalHelp = new SITE.Modal( { print: true, type: 'help', callback: { listener: this, method: 'helpCallback'} } )
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.loadByIdx = this.songId = interfaceParams.songId; // debug = '2054';
    
    this.keyboardDiv = interfaceParams.keyboardDiv;
    
    this.fileLoadMap = document.getElementById('fileLoadMap');
    this.fileLoadRepertoire = document.getElementById('fileLoadRepertoire');
    this.settingsMenu = document.getElementById(interfaceParams.settingsMenu);
    this.mapDiv = document.getElementById(interfaceParams.mapDiv);

    //interfaceParams.accordion_options.render_keyboard_opts.scale = 0.8;
    this.accordion = new window.ABCXJS.tablature.Accordion( 
          interfaceParams.accordion_options 
        , SITE.properties.options.tabFormat 
        ,!SITE.properties.options.tabShowOnlyNumbers  );

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
                    'Sobre|ABOUT'
                ]}
        ]);
//        'Vídeo Tutoriais|TUTORIAL',
    //this.menu.disableSubItem( 'menuInformacoes', 'TUTORIAL' );
        
    //this.menu.disableSubItem( 'menuInformacoes', 'ESTUDIO' );
    //this.menu.disableSubItem( 'menuInformacoes', 'ABCX' );
        
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
    this.media = new SITE.Media( this.mapDiv, interfaceParams.btShowMedia, SITE.properties.mediaDiv, false ); 
    this.buttonChangeNotation = document.getElementById(interfaceParams.btChangeNotation);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.toolsButton = document.getElementById(interfaceParams.toolsBtn);

    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);
    
    //this.printButton.addEventListener("touchstart", function(event) {  that.printPartiture(this, event); }, false);
    this.printButton.addEventListener("click", function(event) { that.printPartiture(this, event); }, false);
    //this.toolsButton.addEventListener("touchstart", function(event) { that.openEstudio(this, event); }, false);
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
            that.currentPlayTimeLabel.innerHTML = "00:00";
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
            this.modalHelp.show('HelpTitle', 'JUMPS', '/html/sinaisRepeticao.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'ABCX':
            this.modalHelp.show('HelpTitle', 'ABCX', '/html/formatoABCX.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'ESTUDIO':
            this.modalHelp.show('HelpTitle', 'ESTUDIO', '/html/estudioABCX.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'TABS':
            this.modalHelp.show('HelpTitle', 'TABS', '/html/tablatura.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'TABSTRANSPORTADA':
            this.modalHelp.show('HelpTitle', 'TABSTRANSPORTADA', '/html/tablaturaTransportada.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'MAPS':
            this.modalHelp.show('HelpTitle', 'MAPS', '/html/mapas.pt_BR.html', { width: '1024', height: '600', print:true } );
            break;
        case 'TUTORIAL':
            this.modalHelp.show('HelpTitle', 'TUTORIAL', '/html/tutoriais.pt_BR.html', { width: '1024', height: '600', print:false } );
            break;
        case 'ABOUT':
            this.modalHelp.show('AboutTitle', '', '/html/about.pt_BR.html', { width: '800', print:false } );
            break;
        case 'GAITA_MINUANO_GC':
        case 'CONCERTINA_PORTUGUESA':
        case 'GAITA_HOHNER_CORONA_GCF':
        case 'GAITA_HOHNER_CORONA_BEA':
        case 'GAITA_HOHNER_CORONA_ADG':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        default: // as gaitas conhecidas e outras carregadas sob demanda
            this.setup({accordionId:ev});
    }
};

SITE.Mapa.prototype.loadOriginalRepertoire = function () {
    
    if (this.accordion.loaded.localResource) return;

    var self = this;
    var loader = SITE.startLoader( "LoadRepertoire", this.tuneContainerDiv );
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
        this.accordion.loaded.songs.details[title].hidden = false; // carrega mesmo invisivel
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
        SITE.ga('event', 'page_view', {
            page_title: this.getActiveTab().title
           ,page_path: SITE.root+'/index/'+this.accordion.getId()
           ,event_category: 'View'
        })        
    
        if(! this.repertoireWin ) {
            this.repertoireWin = new SITE.Repertorio();
        }
        this.repertoireWin.geraIndex(this);
        
        delete this.loadByIdx;
    } else {
        SITE.ga('event', 'page_view', {
            page_title: this.getActiveTab().title
           ,page_path: SITE.root+'/'+this.accordion.getId()
           ,event_category: 'View'
        })        

    }

};

SITE.Mapa.prototype.printPartiture = function (button, event) {
    var currentABC = this.getActiveTab();
    event.preventDefault();
    button.blur();
    if(  currentABC.div.innerHTML )  {
        
        SITE.ga( 'event', 'print', { 
            event_category: 'Mapa'  
           ,event_label: currentABC.title
        });

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
            this.renderTAB( tab );
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
               ,showMapBtn: 't2pShowMapBtn'
               //,printBtn:'t2pPrintBtn'
               ,showEditorBtn: 't2pShowEditorBtn'
               ,updateBtn:'t2pForceRefresh'
               ,loadBtn:'t2pLoadBtn'
               ,saveBtn:'t2pSaveBtn'
               ,editPartBtn:'t2pOpenInPartEditBtn'
               ,savePartBtn:'t2pSavePartBtn'
               ,gotoMeasureBtn: "t2pGotoMeasureBtn"
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
              , lyricsBtn: "lyricsBtn"
              , fingeringBtn: "fingeringBtn"
              , tabformatBtn: "tabformatBtn"
              , timerBtn: "timerBtn"
              , playBtn: "playBtn2"
              , stopBtn: "stopBtn2"
              , clearBtn: "clearBtn"
              , gotoMeasureBtn: "gotoMeasureBtn"
              , untilMeasureBtn: "untilMeasureBtn"
              , stepBtn: "stepBtn"
              , repeatBtn: "repeatBtn"
              , stepMeasureBtn: "stepMeasureBtn"
              , tempoSld: "tempoSld"
              , GClefBtn: "GClefBtn"
              , FClefBtn: "FClefBtn"
              , currentPlayTimeLabel: "currentPlayTimeLabel2"
          } 
        );
    }

    if( tab.text ) {
        SITE.ga('event', 'page_view', {
                 page_title: tab.title
                ,page_path: SITE.root+'/studioABCX/'+this.accordion.getId()
                ,event_category: 'View'
            })        

        var loader = SITE.startLoader( "OpenEstudio", this.tuneContainerDiv );
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
                SITE.ga( 'event', 'play', { 
                    event_category: 'Mapa'  
                   ,event_label: currentABC.title
                });

                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML =  '<i class="ico-pause"></i>';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(currentABC.abc.midi, type, value ) ) {
                SITE.ga( 'event', 'didactic-play', { 
                    event_category: 'Mapa'  
                   ,event_label: currentABC.title
                });
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
            
    newAccordionJSON.image = newImage || 'images/accordions/accordion.default.gif';
    
    if( ! this.accordion.accordionExists(newAccordionJSON.id) ) {
        DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap( newAccordionJSON, true ) );
        DIATONIC.map.sortAccordions();
    }   
    
    this.setup({accordionId:newAccordionJSON.id});
    
    var accordion = this.accordion.loaded;
    
    if( newChords ) {
        var objRet = { items:{}, ids: {}, details:{}, sortedIndex: [] };
        var tunebook = new ABCXJS.TuneBook(newChords);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            var tune = tunebook.tunes[t];
            var id = tune.id;
            var hidden = false;
            if( id.toLowerCase().charAt(0) === 'h' ) {
                id = id.substr(1);
                hidden = true;
            }
            
            objRet.ids[id] = tune.title;
            objRet.items[tune.title] = tune.abc;
            objRet.details[tune.title] = { composer: tune.composer, id: id, hidden: hidden  };
            objRet.sortedIndex.push( tune.title );
        }   
        accordion.chords =  objRet;
        accordion.chords.sortedIndex.sort();
        this.renderedChord.title = accordion.getFirstChord();;
        this.loadABCList(this.renderedChord.tab);
    }

    if( newPractices ) {
        var objRet = { items:{}, ids: {}, details:{}, sortedIndex: [] };
        var tunebook = new ABCXJS.TuneBook(newPractices);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            var tune = tunebook.tunes[t];
            var id = tune.id;
            var hidden = false;
            if( id.toLowerCase().charAt(0) === 'h' ) {
                id = id.substr(1);
                hidden = true;
            }
            
            objRet.ids[id] = tune.title;
            objRet.items[tune.title] = tune.abc;
            objRet.details[tune.title] = { composer: tune.composer, id: id, hidden: hidden  };
            objRet.sortedIndex.push( tune.title );
        }   
        accordion.practices =  objRet;
        accordion.practices.sortedIndex.sort();
        this.renderedPractice.title = accordion.getFirstPractice();
        this.loadABCList(this.renderedPractice.tab);
    }
    
    if( newTunes ) {
        var objRet = { items:{}, ids: {}, details:{}, sortedIndex: [] };
        var tunebook = new ABCXJS.TuneBook(newTunes);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            var tune = tunebook.tunes[t];
            var id = tune.id;
            var hidden = false;
            if( id.toLowerCase().charAt(0) === 'h' ) {
                id = id.substr(1);
                hidden = true;
            }
            
            objRet.ids[id] = tune.title;
            objRet.items[tune.title] = tune.abc;
            objRet.details[tune.title] = { composer: tune.composer, id: id, hidden: hidden  };
            objRet.sortedIndex.push( tune.title );
        }   
        accordion.songs =  objRet;
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

    var loader = SITE.startLoader( "ReloadRepertoire", that.tuneContainerDiv );
    loader.start(  function() { 
        accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  
            that.renderedTune.title = accordion.getFirstSong();
            that.loadABCList(that.renderedTune.tab);
            that.showTab('songsTab');
            loader.stop();
        });
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
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
            
            var id = tunebook.tunes[t].id;
            var hidden = false;
            if( id.toLowerCase().charAt(0) === 'h' ) {
                id = id.substr(1);
                // neste caso, mostra mesmo que marcado como hidden.
                hidden = false;
            }
            
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.details[tunebook.tunes[t].title] = { composer: tunebook.tunes[t].composer, id: id, hidden: hidden };
            accordion.songs.ids[id] = tunebook.tunes[t].title;

            if(! first ) {
                // marca a primeira das novas canções para ser selecionada
                this.renderedTune.title = tunebook.tunes[t].title;
                first = true;
            }
            
            SITE.ga( 'event', 'loadSong', { 
                event_category: 'Mapa'  
               ,event_label: tunebook.tunes[t].title
            });
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
        var loader = SITE.startLoader( "TABLoader" + type, this.tuneContainerDiv );
        loader.start(  function() { 
            self.midiPlayer.stopPlay();
            self.renderTAB( tab );
            // flavio 2022 novo page view gtag
            SITE.ga('event', 'page_view', {
                page_title: tab.title
               ,page_path: SITE.root+'/'+self.accordion.getId()
               ,event_category: 'View'
            })        
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
        
        if(items.details[title].hidden){
            continue;
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
    
    this.parserparams.hideLyrices = !SITE.properties.options.lyrics;
    this.parserparams.hideFingering = !SITE.properties.options.fingering;
    this.parserparams.ilheirasNumeradas = SITE.properties.options.rowsNumbered;

    this.abcParser.parse( tab.text, this.parserparams );
    tab.abc = this.abcParser.getTune();
    tab.text = this.abcParser.getStrTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.loadedKeyboard );
    }
    
    var paper = new SVG.Printer( tab.div );
    
    //this.printerparams = {scale: 0.8}; // flavio - scale era 1

    tab.printer = new ABCXJS.write.Printer(paper, this.printerparams, this.accordion.loadedKeyboard );
            
    //tab.printer.printTune( tab.abc, {color:'black', backgroundColor:'#ffd' } ); 
    tab.printer.printABC( tab.abc ); // flavio - era printTune
    
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
        , container: document.getElementById('mapaDiv')
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

    var that = this;

    var width = 620;
    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;    
        
    var x = winW/2 - width/2;
    
    if(!this.settings) {
        this.settings = {};
        this.settings.window = new DRAGGABLE.ui.Window( 
              null 
            , null
            , { title: 'PreferencesTitle', translator: SITE.translator, statusbar: false, 
                    top: "300px", left: x+"px", height:'480px',  width: width+'px', zIndex: 70 } 
            , {listener: this, method: 'settingsCallback'}
        );

        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('PreferencesTitle')
           ,page_path: SITE.root+'/settings'
           ,event_category: 'View'
        })        

        this.settings.window.topDiv.style.zIndex = 101;

        var cookieValue = document.cookie.match(/(;)?cookiebar=([^;]*);?/)[2];
        var cookieSets = ""
        if (cookieValue ) { // CookieAllowed
            cookieSets = '<a href="#" onclick="document.cookie=\'cookiebar=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/\'; setupCookieBar(); return false;"><span data-translate="cookiePrefs" >'+SITE.translator.getResource('cookiePrefs')+'</span></a>'
        }

        this.settings.window.dataDiv.innerHTML= '\
        <div class="menu-group">\
            <table>\
              <tr>\
                <th colspan="2"><span data-translate="PrefsIdiom" >'+SITE.translator.getResource('PrefsIdiom')+'</span></th>\
                <th><div id="settingsLanguageMenu" class="topMenu"></div></th>\
              </tr>\
              <tr style="display:none;">\
              <th colspan="2"><br><span data-translate="PrefsTabFormat" >'+SITE.translator.getResource('PrefsTabFormat')+'</span></th>\
              <th><br><div id="settingsTabMenu" class="topMenu"></div></th>\
              </tr>\
              <tr style="display:none;">\
                <td> </td><td colspan="2"><input id="chkOnlyNumbers" type="checkbox">&nbsp;<span data-translate="PrefsPropsOnlyNumbers" >'+SITE.translator.getResource('PrefsPropsOnlyNumbers')+'</span></td>\
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
              <tr style="height:30px; white-space:nowrap;">\
                <td></td><td colspan="2">'+ cookieSets +'</td>\
              </tr>\
              <tr style="height:30px; white-space:nowrap;">\
                <td> </td><td colspan="2">\
                <a id="aPolicy"    href="" style="width:25%; display:block; float: left;"><span data-translate="PrivacyTitle">Politica</span></a>\
                </td>\
              </tr>\
              <tr style="height:30px; white-space:nowrap;">\
                <td> </td><td colspan="2">\
                <a id="aTerms" href="" style="width:fit-content; display:block; float: left;"><span data-translate="TermsTitle">Termos</span></a>\
                </td>\
              </tr>\
            </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1"></div>\n\
            <div id="botao2"></div>\n\
            <div id="botao3"></div>\n\
        </div>' ;
    

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

        this.settings.tabMenu = new DRAGGABLE.ui.DropdownMenu(
            'settingsTabMenu'
            ,  { listener:this, method:'settingsCallback', translate: true }
            ,  [{title: '...', ddmId: 'menuFormato',
                    itens: [
                        '&#160;Modelo Alemão|0TAB',
                        '&#160;Numérica 1 (se disponível)|1TAB',
                        '&#160;Numérica 2 (se disponível)|2TAB' 
                    ]}]
            );

        this.settings.tabFormat = SITE.properties.options.tabFormat;
        this.settings.tabMenu.setSubMenuTitle( 'menuFormato', this.settings.tabMenu.selectItem( 'menuFormato', this.settings.tabFormat.toString()+"TAB" ));

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
        this.settings.chkOnlyNumbers = document.getElementById( 'chkOnlyNumbers');

        this.aTerms = document.getElementById("aTerms");
        this.aPolicy = document.getElementById("aPolicy");
    
        this.aPolicy.addEventListener("click", function(evt) {
            evt.preventDefault();
            this.blur();
            if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
                that.modal.show('PrivacyTitle', '', 'privacidade/politica.html' );
            } else {
                that.modal.show('PrivacyTitle', '', 'privacy/policy.html' );
            }
        }, false );
    
        this.aTerms.addEventListener("click", function(evt) {
            evt.preventDefault();
            this.blur();
            if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
                that.modal.show('TermsTitle', '', 'privacidade/termos.e.condicoes.html' );
            } else {
                that.modal.show('TermsTitle', '', 'privacy/terms.n.conditions.html' );
            }
        }, false );

        SITE.translator.translate();
                
    }            
    
    this.settings.corRealce.style.backgroundColor = this.settings.corRealce.value = SITE.properties.colors.highLight;
    this.settings.closeColor.style.backgroundColor = this.settings.closeColor.value = SITE.properties.colors.close;
    this.settings.openColor.style.backgroundColor = this.settings.openColor.value = SITE.properties.colors.open ;

    
    this.settings.chkOnlyNumbers.checked = SITE.properties.options.tabShowOnlyNumbers;
    this.settings.showWarnings.checked = SITE.properties.options.showWarnings;
    this.settings.autoRefresh.checked = SITE.properties.options.autoRefresh;
    this.settings.pianoSound.checked = SITE.properties.options.pianoSound;
    this.settings.useTransparency.checked = SITE.properties.colors.useTransparency;
    
    this.settings.window.setVisible(true);
    
};

SITE.Mapa.prototype.settingsCallback = function (action, elem) {
    switch (action) {
        case '0TAB':
        case '1TAB':
        case '2TAB':
            this.settings.tabFormat = action;
            this.settings.tabMenu.setSubMenuTitle( 'menuFormato', this.settings.tabMenu.selectItem( 'menuFormato', action ));
            break;
        case 'de_DE':
        case 'en_US':
        case 'es_ES':
        case 'fr_FR':
        case 'it_IT':
        case 'pt_BR':
        case 'ru_RU':
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
            SITE.ga( 'event', 'reset', { 
                event_category: 'Configuration'  
               ,event_label: SITE.properties.version
            });
            this.applySettings();
            break;
        case 'RESET-NO':
        case 'RESET-CANCEL':
            this.alert.close();
            break;
    }
};

SITE.Mapa.prototype.applySettings = function() {

    if( parseInt(this.settings.tabFormat) !== SITE.properties.options.tabFormat ||
        this.settings.chkOnlyNumbers.checked  !== SITE.properties.options.tabShowOnlyNumbers ) 
    {
        SITE.properties.options.tabShowOnlyNumbers= this.settings.chkOnlyNumbers.checked;
        SITE.properties.options.tabFormat = parseInt(this.settings.tabFormat);
        this.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)
        this.accordion.loadedKeyboard.reprint();
        this.renderTAB( this.getActiveTab() );

        if (this.studio) {
            this.studio.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)
            this.studio.accordion.loadedKeyboard.reprint();
            this.studio.renderedTune.printer.printABC( this.studio.renderedTune.abc ); // flavio - era printTune
        }

        if (this.tab2part) {
            this.tab2part.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)
            this.tab2part.renderedTune.printer.printABC(this.renderedTune.abc);
        }

        if (this.ABC2part) {
            this.ABC2part.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)
            this.ABC2part.renderedTune.printer.printABC(this.renderedTune.abc);
        }
            
        //tratar também outros locais onde hajam teclado (tab editor, part editor)

    }
    if( this.settings.lang !== SITE.properties.options.language ) {
        SITE.properties.options.language = this.settings.lang;

        SITE.ga( 'event', 'changeLang', { 
            event_category: 'Configuration'  
           ,event_label: SITE.properties.options.language
        });

        SITE.translator.loadLanguage( this.settings.lang, function () { SITE.translator.translate(); } );  
        //SITE.askHelp();

    }
    
    if( this.settings.pianoSound.checked  !== SITE.properties.options.pianoSound ) {
        SITE.properties.options.pianoSound = this.settings.pianoSound.checked;
        SITE.ga( 'event', 'changeInstrument', { 
            event_category: 'Configuration'  
           ,event_label: SITE.properties.options.pianoSound?'piano':'accordion'
        });
        
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
    var savedDisplays = {};
    
    divsToHide.forEach( function( div ) {
        var hd = document.getElementById(div.substring(1));
        savedDisplays[div.substring(1)] = hd.style.display;
        hd.style.display = "none";
        
    });

    this.changePageOrientation(landscape? 'landscape': 'portrait');

    dv.innerHTML = html;
    dv.style.display = 'block';

    setTimeout( function () { 
        
        window.print(); 

        dv.style.display = 'none';

        divsToHide.forEach( function( div ) {
            var hd = document.getElementById(div.substring(1));
            hd.style.display = savedDisplays[div.substring(1)];
        });

    });
    
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

SITE.Mapa.prototype.setFocus = function() {
    if(this.studio && window.getComputedStyle(this.studio.Div.parent).display !== 'none') {
        this.studio.editorWindow.aceEditor.focus();
    } else if(this.tab2part && window.getComputedStyle(this.tab2part.Div.parent).display !== 'none') {      
        this.tab2part.editorWindow.aceEditor.focus();
    } else if(this.ABC2part && window.getComputedStyle(this.ABC2part.Div.parent).display !== 'none') {      
        this.ABC2part.editorWindow.aceEditor.focus();
    } else {
    }
}


SITE.Mapa.prototype.modalCallback = function( action ) {
    if( action === 'CLOSE' ) {
        this.modal.close();
    } else if( action === 'PRINT' ) {
        var container = this.modal.getContainer();
        if( container ) {
            this.printPreview( container.innerHTML, 
                [ "#topBar", "#mapaDiv", "#"+this.settings.window.topDiv.id, "#"+this.modal.modalWindow.topDiv.id ], false );
        }
    }
};

SITE.Mapa.prototype.helpCallback = function ( action ) {
    if( action === 'CLOSE' ) {
        this.modalHelp.close();
    } else if( action === 'PRINT' ) {
        var container = this.modalHelp.getContainer();
        if( container ) {
            this.printPreview( container.innerHTML,
               [ "#topBar", "#mapaDiv", "#"+this.modalHelp.modalWindow.topDiv.id ], false );
        }
    }
};
