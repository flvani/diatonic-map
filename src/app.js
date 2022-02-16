
if (!window.SITE)
    window.SITE = {};

SITE.App = function( interfaceParams, tabParams, playerParams ) {

    document.body.style.overflow = 'hidden';
    
    var that = this;
    this.container = document.getElementById('appDiv')
    this.tab = {title:'', text:'', ddmId:'menuSongs', type: 'songs' }
    
    this.Back = this.Close; // define a funcao a ser chamada quando o comando back é acioando no telefone
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.settingsMenu = document.getElementById(interfaceParams.settingsMenu);

    this.accordion = new window.ABCXJS.tablature.Accordion( 
          interfaceParams.accordion_options 
        , SITE.properties.options.tabFormat 
        ,!SITE.properties.options.tabShowOnlyNumbers  );
    
    this.accordionSelector = new ABCXJS.edit.AccordionSelector( 
        interfaceParams.mapMenuGaitasDiv, interfaceParams.mapMenuGaitasDiv, 
        { listener:that, method: 'menuCallback', label: 'Accordion' }
    );

    this.tab.title = FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.songs.title')
                     || this.accordion.loaded.getFirstSong();

    this.openBtn = document.getElementById(interfaceParams.openBtn) ;
    this.openBtn.addEventListener("click", function(event) { that.openAppView(); }, false);

    this.songSelector = document.getElementById(interfaceParams.mapMenuSongsDiv) ;

    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);

    this.settingsMenu.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.showSettings();
    }, false );

    this.setPrivacyLang();

    this.defineInstrument(true);
    
    this.showAccordionName();
    this.showAccordionImage();

    this.accordionSelector.populate(false);
    
    this.songSelectorPopulate();
    
    SITE.translator.translate();
    
    this.setVisible(true);
    this.resize();
    
};

SITE.App.prototype.changeAccordion = function (tabParams) {

    this.accordion.loadById(tabParams.accordionId);
    
    this.showAccordionName();
    this.showAccordionImage();
    this.accordionSelector.populate(false);
    this.songSelectorPopulate();
    this.resize();
    
    if (!this.accordion.loaded.localResource) { // não salva informação para acordeão local
        FILEMANAGER.saveLocal('property.accordion', this.accordion.getId());
    }
};

SITE.App.prototype.resize = function() {
    // o app não tem resize
    return ;
};

SITE.App.prototype.songSelectorPopulate = function() {

    var achou = false;
    var items = this.accordion.loaded.songs;
    var ddmId = this.tab.ddmId
    var type  = 'songs';

    this.menuSongs = new DRAGGABLE.ui.DropdownMenu( 
          this.songSelector
        , {listener:this, method: 'showABC', translate:false, label: 'Song' }
        , [{title: '...', ddmId: this.tab.ddmId, itens: []}]
    );
    
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
        
        var m = this.menuSongs.addItemSubMenu( ddmId, cleanedTitle +'|'+type+'#'+vid);

        if(title === this.tab.title ) {
            achou = true;
            this.menuSongs.setSubMenuTitle( this.tab.ddmId, cleanedTitle );
            this.menuSongs.selectItem(this.tab.ddmId, m);
            this.tab.text = this.accordion.loaded.getAbcText(this.tab.type, title);
        }    
            
    }

    if( !achou && items.sortedIndex.length > 0 ) {
        var title = items.sortedIndex[0];
        this.tab.title = title;
        var cleanedTitle = title.replace(/\(.*\)/g,"").trim();
        this.menuSongs.setSubMenuTitle( this.tab.ddmId, cleanedTitle );
        this.menuSongs.selectItem(this.tab.ddmId, this.tab.type+'#'+items.details[title].id);
        this.tab.text = this.accordion.loaded.getAbcText(this.tab.type, title);
    }
};

SITE.App.prototype.showABC = function(action) {
    
    var type, title, self = this;
    var a = action.split('#');
    
    if( action.indexOf('#') >= 0 && parseInt(a[1]) > 0 ) {
        type = a[0];
        title = this.accordion.loaded[type].ids[ a[1] ];
    } else {
        waterbug.logError( 'ABCX not found!');
        waterbug.show();
        return;
    }
    
    if( this.tab.title !== title && this.menuSongs.selectItem( this.tab.ddmId, action ) ) {
        this.tab.title = title;
        this.tab.text = this.accordion.loaded.getAbcText( type, title );
        var cleanedTitle = title.replace(/\(.*\)/g,"").trim();
        this.menuSongs.setSubMenuTitle( this.tab.ddmId, (cleanedTitle.length>43 ? cleanedTitle.substr(0,40) + "..." : cleanedTitle) );
        if( !this.accordion.loaded.localResource)
            FILEMANAGER.saveLocal( 'property.'+this.accordion.getId()+'.'+type+'.title', title );
    } else {
        console.log( 'Song title not found!');
    }
};

SITE.App.prototype.menuCallback = function (ev) {
    switch(ev) {
        case 'GAITA_MINUANO_GC':
        case 'CONCERTINA_PORTUGUESA':
        case 'GAITA_HOHNER_CORONA_GCF':
        case 'GAITA_HOHNER_CORONA_ADG':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        default: // as gaitas conhecidas e outras carregadas sob demanda
            this.changeAccordion({accordionId:ev});
    }
};

SITE.App.prototype.openAppView = function (button, event) {
    var self = this;

    if(event) {
        event.preventDefault();
        button.blur();
    }
    
    if( ! this.appView ) {
        this.appView = new SITE.AppView(
            this
            ,{   // interfaceParams
                studioDiv: 'studioDiv'
               ,keyboardDiv: 'keyboardDiv'
               ,studioControlDiv: 'studioControlDiv'
               ,studioCanvasDiv: 'studioCanvasDiv'
               ,generate_tablature: 'accordion'
               ,backBtn: 'backBtn'
               ,showMapBtn: 'showMapBtn'
               ,printBtn: 'printBtn'
               ,btShowMedia: 'buttonShowMedia'
               ,accordion_options: {
                     id: this.accordion.getId()
                    ,accordionMaps: DIATONIC.map.accordionMaps
                    ,translator: SITE.translator 
                    ,render_keyboard_opts:{}
                }
               ,onchange: function( appView ) { appView.onChange(); }
          } 
          , {   // playerParams
                modeBtn: "modeBtn"
              , lyricsBtn: "lyricsBtn"
              , fingeringBtn: "fingeringBtn"
              , tabformatBtn: "tabformatBtn"
              , timerBtn: "timerBtn"
              , playBtn: "playBtn"
              , stopBtn: "stopBtn"
              , clearBtn: "clearBtn"
              , gotoMeasureBtn: "gotoMeasureBtn"
              , untilMeasureBtn: "untilMeasureBtn"
              , stepBtn: "stepBtn"
              , repeatBtn: "repeatBtn"
              , stepMeasureBtn: "stepMeasureBtn"
              , tempoSld: "tempoSld"
              , GClefBtn: "GClefBtn"
              , FClefBtn: "FClefBtn"
              , currentPlayTimeLabel: "currentPlayTimeLabel"
          } 
        );
    }

    this.Back = this.closeAppView;

    if( self.tab.text ) {
        SITE.ga('event', 'page_view', {
            page_title: self.tab.title
           ,page_path: SITE.root+'/'+self.accordion.getId()
        })        

        var loader = this.startLoader( "openAppView" );
        loader.start(  function() { 
            self.appView.setup( self.tab, self.accordion.getId() );
            loader.stop();
        }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
    }
};

SITE.App.prototype.setVisible = function ( visible ) {
    this.container.style.display = (visible? 'block':'none');
};

SITE.App.prototype.showAccordionImage = function() {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+this.accordion.loaded.image
        +'" alt="'+this.accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '" style="height:200px; width:200px;" />';
};

SITE.App.prototype.showAccordionName = function() {
    var t = this.accordion.getFullName() + ' <span data-translate="keys">' + SITE.translator.getResource('keys') + '</span>';
    this.accordionSelector.menu.setSubMenuTitle( this.accordionSelector.ddmId, t );
};

SITE.App.prototype.startLoader = function(id, container, start, stop) {

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

SITE.App.prototype.defineInstrument = function(onlySet) {
    var that = this;
    
    that.instrument = SITE.properties.options.pianoSound ?  "acoustic_grand_piano" : "accordion" ;
    
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
        //, container: document.getElementById('appDiv')
        , cor1:SITE.properties.colors.close, cor2: SITE.properties.colors.open});
    
    MIDI.widget.setFormat( SITE.translator.getResource('loading'));

    MIDI.loadPlugin({
         soundfontUrl: "./soundfont/"
        ,instruments: that.instrument
        ,onprogress: function( total, done, currentPercent ) {
            var percent = ((done*100)+currentPercent)/(total);
            MIDI.widget.setValue(Math.round(percent));
        }
        ,callback: function() {
            setInstrument();
        }
    });
};

SITE.App.prototype.showSettings = function() {

    //window.waterbug && window.waterbug.show();

    var width = 620;
    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;    
        
    //var x = winW/2 - width/2;
    var x = 70;
    
    if(!this.settings) {
        this.settings = {};
        this.settings.popupWin = new DRAGGABLE.ui.Window( 
              null 
            , null
            , {title: 'PreferencesTitle', translator: SITE.translator, statusbar: false, top: "40px", left: x+"px", height:'530px',  width: width+'px', zIndex: 50} 
            , {listener: this, method: 'settingsCallback'}
        );

        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('PreferencesTitle')
           ,page_path: SITE.root+'/settings'
        })        

        this.settings.popupWin.topDiv.style.zIndex = 101;

        this.settings.popupWin.dataDiv.innerHTML= '\
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
              <tr style="height:40px; display:none;">\
                <td> </td><td colspan="2"><div id="sldOnlyNumbers"></div>\
                <span data-translate="PrefsPropsOnlyNumbers" >'+SITE.translator.getResource('PrefsPropsOnlyNumbers')+'</span></a></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br><span data-translate="PrefsColor" >'+SITE.translator.getResource('PrefsColor')+'</span></th><td></td>\
              </tr>\
              <tr>\
                <td style="width:15px;"></td><td data-translate="PrefsColorHighlight" >'+SITE.translator.getResource('PrefsColorHighlight')+'</td>\
                <td><input id="corRealce" type="text" readonly >&nbsp;<div id="sldTransparency"></div>\
                        <span data-translate="PrefsColorTransparency" >'+SITE.translator.getResource('PrefsColorTransparency')+'</span></td>\
              </tr>\
              <tr>\
                <td></td><td data-translate="PrefsColorClosingBellows" >'+SITE.translator.getResource('PrefsColorClosingBellows')+'</td>\
                <td><input readonly id="foleFechando" type="text" ></td>\
              </tr>\
              <tr>\
                <td></td><td data-translate="PrefsColorOpeningBellows" >'+SITE.translator.getResource('PrefsColorOpeningBellows')+'</td>\
                <td><input readonly id="foleAbrindo" type="text" ></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br><span data-translate="PrefsProps" >'+SITE.translator.getResource('PrefsProps')+'</span></th><td></td>\
              </tr>\
              <tr style="height:40px;">\
                <td> </td><td colspan="2"><div id="sldPianoSound"></div>\
                <span data-translate="PrefsPropsCKPiano" >'+SITE.translator.getResource('PrefsPropsCKPiano')+'</span></a></td>\
              </tr>\
              <tr style="height:40px;">\
                <td> </td><td colspan="2"><div id="sldKeyboardRight"></div>\
                <span data-translate="PrefsPropsCKkeyboardAlignRight" >'+SITE.translator.getResource('PrefsPropsCKkeyboardAlignRight')+'</span></td>\
              </tr>\
              <tr style="height:40px;">\
                <td> </td><td colspan="2"><div id="sldSuppressTitles"></div>\
                <span data-translate="PrefsPropsChkSuppressTitles" >'+SITE.translator.getResource('PrefsPropsChkSuppressTitles')+'</span></td>\
              </tr>\
              <tr style="display:none;">\
                <td> </td><td colspan="2"><input id="chkWarnings" type="checkbox">&nbsp;\
                <span data-translate="PrefsPropsCKShowWarnings" >'+SITE.translator.getResource('PrefsPropsCKShowWarnings')+'</span></td>\
              </tr>\
              <tr style="display:none;">\
                <td> </td><td colspan="2"><input id="chkAutoRefresh" type="checkbox">&nbsp;\
                <span data-translate="PrefsPropsCKAutoRefresh" >'+SITE.translator.getResource('PrefsPropsCKAutoRefresh')+'</span></td>\
              </tr>\
              </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1"></div>\n\
            <div id="botao2"></div>\n\
            <div id="botao3"></div>\n\
        </div>';
     
        this.settings.sldOnlyNumbers = new DRAGGABLE.ui.Slider( document.getElementById( 'sldOnlyNumbers' ),
            { min: 0, max: 1, start: 0, step:1, type: 'bin', speed:100, color: 'white', bgcolor:'red', size:{w:60 , h:25, tw:40}, callback: null } 
        );

        this.settings.sldTransparency = new DRAGGABLE.ui.Slider( document.getElementById( 'sldTransparency' ),
            { min: 0, max: 1, start: 0, step:1, type: 'bin', speed:100, color: 'white', bgcolor:'red', size:{w:60 , h:25, tw:40}, callback: null } 
        );

        this.settings.sldPianoSound = new DRAGGABLE.ui.Slider( document.getElementById( 'sldPianoSound' ),
            { min: 0, max: 1, start: 0, step:1, type: 'bin', speed:100, color: 'white', bgcolor:'red', size:{w:60 , h:25, tw:40}, callback: null } 
        );

        this.settings.sldKeyboardRight = new DRAGGABLE.ui.Slider( document.getElementById( 'sldKeyboardRight' ),
            { min: 0, max: 1, start: 0, step:1, type: 'bin', speed:100, color: 'white', bgcolor:'red', size:{w:60 , h:25, tw:40}, callback: null } 
        );

        this.settings.sldSuppressTitles = new DRAGGABLE.ui.Slider( document.getElementById( 'sldSuppressTitles' ),
            { min: 0, max: 1, start: 0, step:1, type: 'bin', speed:100, color: 'white', bgcolor:'red', size:{w:60 , h:25, tw:40}, callback: null } 
        );

        this.settings.popupWin.addPushButtons([
            'botao1|apply',
            'botao2|reset|PrefsReset',
            'botao3|cancel'
        ]);
                
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

        this.picker = new DRAGGABLE.ui.ColorPicker(['corRealce', 'foleFechando', 'foleAbrindo'], {readonly: false, translator: SITE.translator});
      
        SITE.translator.menuPopulate(this.settings.menu, 'menuIdiomas');
        
        this.settings.lang = SITE.properties.options.language;

        this.settings.corRealce = document.getElementById( 'corRealce');
        this.settings.closeColor = document.getElementById( 'foleFechando');
        this.settings.openColor = document.getElementById( 'foleAbrindo');

        this.settings.showWarnings = document.getElementById( 'chkWarnings');
        this.settings.autoRefresh = document.getElementById( 'chkAutoRefresh');
    }          

    this.settings.originalOnlyNumber = SITE.properties.options.tabShowOnlyNumbers;
    this.settings.originalLang = SITE.properties.options.language;
    this.settings.originalPianoSound = SITE.properties.options.pianoSound;
    
    this.settings.corRealce.style.backgroundColor = this.settings.corRealce.value = SITE.properties.colors.highLight;
    this.settings.closeColor.style.backgroundColor = this.settings.closeColor.value = SITE.properties.colors.close;
    this.settings.openColor.style.backgroundColor = this.settings.openColor.value = SITE.properties.colors.open ;

    this.settings.sldOnlyNumbers.setValue(SITE.properties.options.tabShowOnlyNumbers?"1":"0", false);
    this.settings.sldTransparency.setValue(SITE.properties.colors.useTransparency?"1":"0", false);
    this.settings.sldPianoSound.setValue(SITE.properties.options.pianoSound?"1":"0", false);
    this.settings.sldKeyboardRight.setValue(SITE.properties.options.keyboardRight?"1":"0", false);
    this.settings.sldSuppressTitles.setValue(SITE.properties.options.suppressTitles?"1":"0", false);

    this.settings.showWarnings.checked = SITE.properties.options.showWarnings;
    this.settings.autoRefresh.checked = SITE.properties.options.autoRefresh;
    
    this.settings.popupWin.setVisible(true);
    
};

SITE.App.prototype.settingsCallback = function (action, elem) {
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
            this.settings.lang = action;
            this.settings.menu.setSubMenuTitle( 'menuIdiomas', this.settings.menu.selectItem( 'menuIdiomas', action ));
            break;
        case 'MOVE':
            break;
        case 'CLOSE':
        case 'CANCEL':
            this.picker.close();
            this.settings.popupWin.setVisible(false);
            break;
        case 'APPLY':
            SITE.properties.colors.highLight = this.settings.corRealce.value;
            SITE.properties.colors.close = this.settings.closeColor.value;
            SITE.properties.colors.open = this.settings.openColor.value;

            SITE.properties.colors.useTransparency = this.settings.sldTransparency.getBoolValue();
            SITE.properties.options.keyboardRight = this.settings.sldKeyboardRight.getBoolValue();
            SITE.properties.options.suppressTitles = this.settings.sldSuppressTitles.getBoolValue();
            SITE.properties.options.tabShowOnlyNumbers = this.settings.sldOnlyNumbers.getBoolValue();
            SITE.properties.options.pianoSound = this.settings.sldPianoSound.getBoolValue();
            SITE.properties.options.language = this.settings.lang;

            SITE.properties.options.showWarnings = this.settings.showWarnings.checked;
            SITE.properties.options.autoRefresh = this.settings.autoRefresh.checked;

            this.picker.close();
            this.settings.popupWin.setVisible(false);
            this.applySettings();
            SITE.SaveProperties();
            break;
        case 'RESET':
            this.alert = new DRAGGABLE.ui.Alert(
                    this.settings.popupWin, action,
                    '<br>'+SITE.translator.getResource('resetMsgTitle'),
                    '<br>'+SITE.translator.getResource('resetMsgDescription'),
                    {translator: SITE.translator} );
            break;
        case 'RESET-YES':
            this.alert.close();
            this.picker.close();
            this.settings.popupWin.setVisible(false);
            SITE.ResetProperties();
            SITE.ga( 'event', 'reset', { 
                'event_category': 'Configuration'  
               ,'event_label': SITE.properties.version
            });
            
            this.applySettings();
            break;
        case 'RESET-NO':
        case 'RESET-CANCEL':
            this.alert.close();
            break;
    }
};

SITE.App.prototype.applySettings = function() {

    //fazer os ajustes quando selecionar o formato de tablatura
    if( parseInt(this.settings.tabFormat) !== SITE.properties.options.tabFormat || 
        this.settings.originalOnlyNumber !== SITE.properties.options.tabShowOnlyNumbers ) 
    {
        SITE.properties.options.tabFormat = parseInt(this.settings.tabFormat);
        this.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)

        if (this.appView) {
            this.appView.accordion.setFormatoTab(SITE.properties.options.tabFormat,!SITE.properties.options.tabShowOnlyNumbers)
        }
    }

    if( this.settings.originalLang !== SITE.properties.options.language ) {
        SITE.ga( 'event', 'changeLang', { 
            'event_category': 'Configuration'  
           ,'event_label': SITE.properties.options.language
        });
        SITE.translator.loadLanguage( this.settings.lang, function () { SITE.translator.translate(); } );  
        this.setPrivacyLang();
    }
    
    if( this.settings.originalPianoSound !== SITE.properties.options.pianoSound ) {
        SITE.ga( 'event', 'changeInstrument', { 
            'event_category': 'Configuration'  
           ,'event_label': SITE.properties.options.pianoSound?'piano':'accordion'
        });
        this.defineInstrument();
    }

    (this.appView) && this.appView.setKeyboardDetails()
   
    this.resizeActiveWindow();
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.accordion.loadedKeyboard.legenda.setOpen();
    this.accordion.loadedKeyboard.legenda.setClose();
};

SITE.App.prototype.resizeActiveWindow = function() {
    if(this.appView && window.getComputedStyle(this.appView.Div.parent).display !== 'none') {
       this.appView.resize();
    } else {    
        this.resize();
    }    
};

SITE.App.prototype.silencia = function(force) {
    if(this.appView && window.getComputedStyle(this.appView.Div.parent).display !== 'none') {
        if( this.appView.midiPlayer.playing) {
            if(force )
                this.appView.midiPlayer.stopPlay();
            else
                this.appView.startPlay('normal'); // pause
            
        }
    }
};

SITE.App.prototype.setFocus = function() {
/*     if(this.appView && window.getComputedStyle(this.appView.Div.parent).display !== 'none') {
        this.appView.editorWindow.aceEditor.focus();
    } */
}

SITE.App.prototype.showModal = function ( title, subTitle, url, options ) {
    var that = this;
    options = options || {};
    options.width = typeof options.width === 'undefined'? '800' : options.width;
    options.height = typeof options.height === 'undefined'? undefined : options.height;
    options.print = typeof options.print === 'undefined'? true : options.print;
    
    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;    
        
    var x = winW/2 - options.width/2;
    
    if( ! this.modalWindow ) {
        this.modalWindow = new DRAGGABLE.ui.Window(
            null
          , ['print|printBtn']
          , {title: '', translator: SITE.translator, draggable: true, statusbar: false, top: "30px" , height:"90%", left: "60px", width:"calc(92% - 60px)", zIndex: 70}
          , { listener: this, method:'modalCallback' }
        );
        this.modalWindow.dataDiv.style.height = "auto";

        this.modalWindow.dataDiv.innerHTML = 
            '<object id="myFrame" data="" type="text/html" ></object> \
             <div id="pg" class="pushbutton-group" style="right: 4px; bottom: 4px;" >\
                <div id="btClose"></div>\n\
             </div>';
    
        this.modalWindow.addPushButtons( [ 'btClose|close' ] );
    }

    this.Back = this.modalClose;

    this.modalWindow.setTitle(title, SITE.translator);
    this.modalWindow.setSubTitle(subTitle, SITE.translator);
    this.modalWindow.setButtonVisible('PRINT', options.print );

    this.iframe = document.getElementById("myFrame");

    this.modalWindow.topDiv.style.opacity = "0";
    this.modalWindow.setVisible(true);
    this.modalWindow.dataDiv.height = (this.modalWindow.topDiv.clientHeight-25)+"px";
    this.iframe.style.width = "100%";
    this.iframe.style.height =  (this.modalWindow.topDiv.clientHeight-25)+"px";
    this.modalWindow.dataDiv.height = this.iframe.style.height;

    this.info;
    this.container;

    var loader = this.startLoader( "Modal" );

    that.iframe.setAttribute("data", url); 

    that.iframe.addEventListener("load", function () { 
        that.container = this.contentDocument.getElementById('modalContainer');
        that.info = this.contentDocument.getElementById('siteVerI');
        $(that.iframe).ready(function() {

            if( that.info ) that.info.innerHTML=SITE.siteVersion;
            
            if( that.container ) {

                that.container.style.top = '0';
                that.container.style.height = (that.modalWindow.dataDiv.clientHeight-70)+"px"
                that.container.style.overflow = 'hidden';
                that.container.style.border = '1px solid rgba(255, 153, 34, 0.2)';
                var v = new PerfectScrollbar( that.container, {
                    handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
                    wheelSpeed: 1,
                    wheelPropagation: false,
                    suppressScrollX: false,
                    minScrollbarLength: 100,
                    swipeEasing: true,
                    scrollingThreshold: 500
                });

                var anchors = that.container.getElementsByTagName("a");
                for (var i = 0; i < anchors.length; i++) {
                    anchors[i].onclick = function() {return false;};
                }
            }
            
            that.modalWindow.topDiv.style.opacity = "1";
            loader.stop();
        });    
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
};

SITE.App.prototype.modalCallback = function ( action ) {
    that = this;

    if( action === 'CLOSE' ) {
        that.modalClose();
    } else if( action === 'PRINT' ) {
        // não implementado para o aplicativo
        //var container = this.iframe.contentDocument.getElementById('modalContainer');
        //if( container ) {
        //    this.printPreview( container.innerHTML, [ "#"+this.modalWindow.topDiv.id, "#topBar","#appDiv"], false );
        //}
    }
};

SITE.App.prototype.modalClose = function () {
    this.iframe.setAttribute("data", ""); 
    this.modalWindow.setVisible(false);
    this.Back = this.Close;
};

SITE.App.prototype.closeAppView = function() {
    this.appView.setVisible(false);
    this.appView.keyboardWindow.setVisible(false);
    this.appView.studioStopPlay();
    this.Back = this.Close;
    SITE.SaveProperties();
};

SITE.App.prototype.goBackOrClose = function (  ) {
    return this.Back();
};

SITE.App.prototype.Close = function () {
    window.DiatonicApp && window.DiatonicApp.closeApp();
};

SITE.App.prototype.setPrivacyLang = function (  ) {
    var that = this;
    this.aPolicy = document.getElementById("aPolicy");
    this.aTerms = document.getElementById("aTerms");
    this.aVersion = document.getElementById("aVersion");

    this.aPolicy.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('PrivacyTitle')
           ,page_path: SITE.root+'/help'
        })

        if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
            that.showModal('PrivacyTitle', '', 'privacidade/politica.html', { width: '800', height: '500', print:false } );
        } else {
            that.showModal('PrivacyTitle', '', 'privacy/policy.html', { width: '800', height: '500', print:false } );
        }
    }, false );

    this.aTerms.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('TermsTitle')
           ,page_path: SITE.root+'/help'
        })

        if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
            that.showModal('TermsTitle', '', 'privacidade/termos.e.condicoes.html', { width: '800', height: '500', print:false } );
        } else {
            that.showModal('TermsTitle', '', 'privacy/terms.n.conditions.html', { width: '800', height: '500', print:false } );
        }
    }, false );

    this.aVersion.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('AboutAppTitle')
           ,page_path: SITE.root+'/help'
        })
        if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
            that.showModal('AboutAppTitle', '', 'privacidade/sobreApp.html', { width: '800', height: '500', print:false } );
        } else {
            that.showModal('AboutAppTitle', '', 'privacy/aboutApp.html', { width: '800', height: '500', print:false } );
        }
    }, false );
};
