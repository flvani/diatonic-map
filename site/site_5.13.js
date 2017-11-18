/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.getDate = function (){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    return yyyy*10000+mm*100+dd;
};

SITE.ga = function ( p1, p2, p3, p4, p5  ){
    if( ga && SITE.getVersion('mainSITE', '' ) !== 'debug' &&  ga && SITE.getVersion('mainSITE', '' ) !== 'unknown'  ) {
        ga( p1, p2, p3, p4, p5 );
    } else {
        console.log('Funcao ga não definida.');
    }
};

SITE.getVersion = function(tag, label) {
    var el = document.getElementById(tag);
    if(!el) return 'unknown';
    var res = el.src.match(/\_[0-9]*\.[0-9]*/g);
    return res ? label+res[0].substr(1) : 'debug';
};

SITE.getLanguage = function ( ) {
    var language = window.navigator.userLanguage || window.navigator.language; 
    
    if( language.indexOf( '-' ) >= 0 ) {
        language = language.replace('-', '_' );
        for( var id in SITE.properties.known_languages ) {
            if( id.toLowerCase() === language.toLocaleLowerCase() ) {
                return id;
            }
        }
    } 
    // não encontrou a linguagem exata, então tenta apenas pelo prefixo.
    for( var id in SITE.properties.known_languages ) {
        if( id.substr(0,2) === language.substr(0,2) ) {
            return id;
        }
    }
    return 'en_US';
};

SITE.LoadProperties = function() {
    
    //FILEMANAGER.removeLocal('diatonic-map.site.properties' ); // usdo para forçar reset da propriedades
    
    try{
        SITE.properties = JSON.parse( FILEMANAGER.loadLocal('diatonic-map.site.properties' ) ); 
    } catch(e) {
        waterbug.log( 'Could not load the properties.');
        waterbug.show( 'Could not save the properties');
        SITE.ga('create', 'UA-62839199-1', 'auto');
        SITE.ga('send', 'event', 'Error', 'html5storage', 'loadingLocal' );
    }
    
    var ver = SITE.getVersion('mainSITE', '' );
    
    if( ! SITE.properties ) {
        
        SITE.ResetProperties();
        
    } else {
        
        if( ver !== 'debug' && ( ! SITE.properties.version || SITE.properties.version === 'debug' || parseFloat( SITE.properties.version ) < parseFloat( ver ) )  ) {
        
            SITE.properties.version = ver;

            if(SITE.properties.version === '5.07' ) {

                SITE.properties.known_languages = {
                     de_DE: { file: 'languages/de_DE.lang', image: "images/de_DE.png", name: 'Deustch' } 
                    ,en_US: { file: 'languages/en_US.lang', image: "images/en_US.png", name: 'US English' } 
                    ,es_ES: { file: 'languages/es_ES.lang', image: "images/es_ES.png", name: 'Español' } 
                    ,fr_FR: { file: 'languages/fr_FR.lang', image: "images/fr_FR.png", name: 'Français' } 
                    ,it_IT: { file: 'languages/it_IT.lang', image: "images/it_IT.png", name: 'Italiano' } 
                    ,pt_BR: { file: 'languages/pt_BR.lang', image: "images/pt_BR.png", name: 'Português do Brasil' } 
                };

                SITE.properties.options.language = SITE.getLanguage() ;
                SITE.properties.colors.highLight = '#ff0000';
                SITE.properties.options.showWarnings = false;
                SITE.properties.options.showConsole = false;
                SITE.properties.options.pianoSound = false;
            }

            SITE.SaveProperties();
        }
    }
    if( ver === 'debug' ) {
        SITE.properties.options.showConsole = true;
        //SITE.properties.options.language = SITE.getLanguage();
    }
};

SITE.SaveProperties = function() {
    try{
        FILEMANAGER.saveLocal('diatonic-map.site.properties', JSON.stringify(SITE.properties));
    } catch(e) {
        waterbug.log( 'Could not save the properties');
        waterbug.show( 'Could not save the properties');
        SITE.ga('create', 'UA-62839199-1', 'auto');
        SITE.ga('send', 'event', 'Error', 'html5storage', 'savingLocal' );
    }
};

SITE.ResetProperties = function() {
    
    SITE.properties = {};
    
    SITE.properties.known_languages = {
         de_DE: { file: 'languages/de_DE.lang', image: "images/de_DE.png", name: 'Deustch' } 
        ,en_US: { file: 'languages/en_US.lang', image: "images/en_US.png", name: 'US English' } 
        ,es_ES: { file: 'languages/es_ES.lang', image: "images/es_ES.png", name: 'Español' } 
        ,fr_FR: { file: 'languages/fr_FR.lang', image: "images/fr_FR.png", name: 'Français' } 
        ,it_IT: { file: 'languages/it_IT.lang', image: "images/it_IT.png", name: 'Italiano' } 
        ,pt_BR: { file: 'languages/pt_BR.lang', image: "images/pt_BR.png", name: 'Português do Brasil' } 
    };
    
    SITE.properties.version = SITE.getVersion( 'mainSITE', '' );
    
    SITE.properties.colors = {
         useTransparency: true
        ,highLight: '#ff0000'
        ,fill: 'white'
        ,background: 'none'
        ,close: '#ff3a3a'
        ,open: '#ffba3b'
    };

    SITE.properties.options = {
         language: SITE.getLanguage()
        ,showWarnings: false
        ,showConsole: false
        ,pianoSound: false
        ,autoRefresh: false
    };

    SITE.properties.mediaDiv = {
         visible: true
        ,top: "100px"
        ,left: "1200px"
        ,width: 300
        ,height: 300 * 0.55666667
    };
    SITE.properties.tabGen = {
        abcEditor : {
            floating: false
            ,maximized: false
            ,top: "70px"
            ,left: "25px"
            ,width: "940px"
            ,height: "560px"
        }
        , tabEditor : {
             floating: false
            ,maximized: false
            ,top: "140px"
            ,left: "75px"
            ,width: "940px"
            ,height: "560px"
        }
    };

    SITE.properties.partGen = {
          showABCText:false
        , convertFromClub:false
        , convertToClub:false
        , editor : {
             visible: true
            ,floating: false
            ,maximized: false
            ,top: "40px"
            ,left: "50px"
            ,width: "700px"
            ,height: "480px"
        }
        , keyboard: {
             visible: false
            ,top: "65px"
            ,left: "1200px"
            ,scale: 1
            ,mirror: true
            ,transpose: false
            ,label: false
        }
    };
    
    SITE.properties.studio = {
         mode: 'normal'
        ,timerOn: false
        ,trebleOn: true
        ,bassOn: true
        ,editor : {
             visible: true
            ,floating: false
            ,maximized: false
            ,top: "40px"
            ,left: "50px"
            ,width: "700px"
            ,height: "480px"
        }
        , keyboard: {
             visible: false
            ,top: "65px"
            ,left: "1200px"
            ,scale: 1
            ,mirror: true
            ,transpose: false
            ,label: false
        }
    };
    
    SITE.SaveProperties();
    
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

if (!window.SITE.lang)
    window.SITE.lang = {};

SITE.Translator = function(options) {
    
    options = options || {};
    
    if( ! options.language ) {
        options.language  = 'pt_BR';
    }
    
    this.language = null;
    this.loadLanguage(options.language, options.callback);
    
};

SITE.Translator.prototype.loadLanguage = function(lang, callback) {
    var toLoad = 1;
    var that = this;
    FILEMANAGER.register('LANG');
    
    if( ! SITE.properties || ! SITE.properties.known_languages ) {
        SITE.ResetProperties();
    }
    
    if( ! SITE.properties.known_languages[lang] ) {
        that.log( "Unknown language: "+ lang +". Loading English..." );
        lang='en_US';
        SITE.properties.options.language = lang;
        SITE.SaveProperties();
    }
    var arq = SITE.properties.known_languages[lang].file;
    
    $.getJSON( arq, {  format: "json"  })
        .done(function( data ) {
            FILEMANAGER.deregister('LANG', true);
            that.language = data;
            //that.log( data.langName + ": ok..");
         })
        .fail(function( data, textStatus, error ) {
            FILEMANAGER.deregister('LANG', false);
            that.log( "Failed to load language "+ lang +":\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + textStatus + ", " + error +'.' );
        })
        .always(function() {
            toLoad --;
            if( toLoad === 0 ) {
                callback && callback();
            }
        });
};


SITE.Translator.prototype.menuPopulate = function(menu, ddmId ) {
    var m, toSel;

    menu.emptySubMenu( ddmId );    
    
    for( var id in SITE.properties.known_languages ) {
        var tt = '<img src="'+ SITE.properties.known_languages[id].image +'" />&#160;' + SITE.properties.known_languages[id].name;
        m = menu.addItemSubMenu( ddmId, tt + '|' + id );
        
        if( this.language && this.language.id===id) {
            toSel = m;
        }
    }
    
    if( toSel )
        menu.setSubMenuTitle( ddmId, menu.selectItem( ddmId, toSel ));
    
};



SITE.Translator.prototype.getResource = function(id) {
    if(!this.language) return null;
    var res = this.language.resources[id];
    (!res) && this.log( 'Missing translation for "' + id + '" in "' + this.language.langName + '".' );
    return res;
};

SITE.Translator.prototype.translate = function(container) {
    
    if(!this.language) return;
    
    container = container || document;
    
    var translables = container.querySelectorAll('[data-translate]');
    var translablesArray = Array.prototype.slice.apply(translables);
    
//    for( var item of translablesArray ) {
    for( var i=0; i < translablesArray.length; i ++ ) {
        var item = translablesArray[i];
        var vlr = this.language.resources[item.getAttribute("data-translate")];
        if( vlr ) {
            switch( item.nodeName ) {
                case 'INPUT':
                    if( item.type === 'text' ) {
                        item.title = vlr.tip;
                        item.value = vlr.val;
                    }
                    break;
                case 'BUTTON': 
                case 'I': 
                    item.title = vlr; 
                    break;
                default: 
                    item.innerHTML = vlr;
            }
        } else {
            this.log( 'Missing translatation for "' +item.getAttribute("data-translate") + '" in "' + this.language.langName + '".' );
        }
    }
};    

SITE.Translator.prototype.sortLanguages = function () {
    this.languages.sort( function(a,b) { 
        return parseInt(a.menuOrder) - parseInt(b.menuOrder);
    });
};

SITE.Translator.prototype.log = function(msg) {
    if( msg.substr( 27, 6 ) === 'GAITA_' ) return;
    waterbug.log( msg );
    (SITE.properties.options.showConsole) && waterbug.show();
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.Media = function( parent, btShowMedia, opts ) {
    var that = this;
    var options = opts || {};
    
    this.Div = parent || null;
    this.proportion = 0.55666667;
    this.youTubeURL = false;
    this.useSiteProperties = opts.useSiteProperties || false;
    
    if(btShowMedia) {
        this.showMediaButton = document.getElementById( btShowMedia );
        this.showMediaButton.addEventListener('click', function () { 
            that.callback('OPEN');
        }, false );
    }
    
    this.mediaWindow = new DRAGGABLE.ui.Window( 
            this.Div
          , null
          , {title: 'showMedia', translator: SITE.translator
              , statusbar: options.resize || false
              , top: SITE.properties.mediaDiv.top
              , left: SITE.properties.mediaDiv.left
              , zIndex: options.zIndex } 
          , {listener: this, method: 'callback'}
    );
    
};

SITE.Media.prototype.callback = function( e ) {
    switch(e) {
        case 'RESIZE':
            this.resize();
            break;
        case 'MOVE':
            var m = this.mediaWindow.topDiv;
            if( this.useSiteProperties ) {
                SITE.properties.mediaDiv.top = m.style.top;
                SITE.properties.mediaDiv.left = m.style.left;
                SITE.SaveProperties();
            }
            break;
        case 'OPEN':
            if( this.useSiteProperties ) {
                SITE.properties.mediaDiv.visible = true;
                SITE.SaveProperties();
            }    
            this.mediaWindow.setVisible(true);
            if(this.showMediaButton)
                this.showMediaButton.style.display = 'none';
            break;
        case 'CLOSE':
            this.pause();
            if( this.useSiteProperties ) {
                SITE.properties.mediaDiv.visible = false;
                SITE.SaveProperties();
            }
            if(this.showMediaButton) {
                this.mediaWindow.setVisible(false);
                this.showMediaButton.style.display = 'inline';
            }
            break;
    }
    return false;
};

SITE.Media.prototype.pause = function() {
    if(!this.mediaWindow || !this.currTab ) return;
    var iframe = this.currTab.div.getElementsByTagName("iframe")[0];
    if(!iframe) return;
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo", "args":""}', '*');            
    //iframe.postMessage('{"event":"command","func":"playVideo", "args":""}', '*');            
};

SITE.Media.prototype.show = function(tab) {
    
    var that = this;
    
    var url, embed;
   
    if(tab.abc && tab.abc.metaText.url ) {
        url = tab.abc.metaText.url;
    } 
    
    if(url) {
    
        if( url  !== this.url ) {
            this.url = url;
            var maxTitle=0;
            if( window.innerWidth >= 1200 )  {
                SITE.properties.mediaDiv.width = 600;
                maxTitle=46;
            } else if( window.innerWidth >= 950 ) { 
                SITE.properties.mediaDiv.width = 400;
                maxTitle=27;
            } else {
                SITE.properties.mediaDiv.width = 300;
                maxTitle=17;
            }
            
            SITE.properties.mediaDiv.height = SITE.properties.mediaDiv.width * this.proportion;
            
            this.mediaWindow.dataDiv.style.width = SITE.properties.mediaDiv.width + 'px'; 
            this.mediaWindow.dataDiv.style.height = SITE.properties.mediaDiv.height + 'px';
            
            if( ! this.tabDiv ) {
                this.tabDiv = document.createElement('div');
                this.tabDiv.className='media-tabs';
                this.mediaWindow.topDiv.appendChild(this.tabDiv);
                this.mediaWindow.topDiv.style.overflow = 'visible';
            } else {
                this.tabDiv.innerHTML = "";
                this.mediaWindow.dataDiv.innerHTML = "";
            }
        
            var aUrl = url.split('\n');
            
            this.tabs = {};
            this.currTab = null;
            
            for( var r = 0; r < aUrl.length && r < 10; r ++ ) {
                var mId = (this.mediaWindow.id*10 + r);
                
                this.youTubeURL = (aUrl[r].match(/www.youtube-nocookie.com/g)!== null);
                
                var par=aUrl[r].match(/\&.*\;/g);
                
                var cleanedUrl = aUrl[r];
                var tit = "";
                if( par ){
                    cleanedUrl = aUrl[r].replace( par[0], "");
                    tit = par[0].substring( 3, par[0].length-1);
                    
                    if( tit.length > maxTitle ) {
                        tit = tit.substring(0, maxTitle) + '...';
                    }
                }
                
                var dv = document.createElement('div');
                dv.className='media-content';
                this.mediaWindow.dataDiv.appendChild(dv);
                
                if( this.youTubeURL ) {
                    embed = '<iframe id="e'+ mId +
                                '" src="'+cleanedUrl+'?rel=0&amp;showinfo=0&amp;enablejsapi=1" frameborder="0" allowfullscreen="allowfullscreen" ></iframe>';
                } else {
                    embed = '<embed id="e'+ mId +'" src="'+cleanedUrl+'" "></embed>';
                } 
                
                dv.innerHTML = embed;
                this.embed = document.getElementById( 'e' + mId );

                this.embed.style.width = '100%';
                this.embed.style.height = this.youTubeURL? '100%' : 'auto';
                
                this.tabs['w'+mId] = {div:dv, tit:tit, u2be: this.youTubeURL};
                
                if( aUrl.length > 1 ) {
                    var el = document.createElement('input');
                    el.id = 'w'+mId;
                    el.type = 'radio';
                    el.name = 'mediaControl' + this.mediaWindow.id;
                    el.className  = 'tab-selector-' + r;
                    this.tabDiv.appendChild(el);
                    var el = document.createElement('label');
                    el.htmlFor = 'w'+mId;
                    el.className  = 'media-tab-label-' + r;
                    el.innerHTML = '#'+(r+1);
                    this.tabDiv.appendChild(el);
                }
            }
            
            this.showTab = function( id ) {
                this.pause();
                for( var m in this.tabs ) {
                    this.tabs[m].div.className = 'media-content';
                    if(!id) { // mostra o primeiro
                        id = m;
                        var chk = document.getElementById(id);
                        if(chk) chk.checked = true;
                    } 
                }
                this.tabs[id].div.className = 'media-visible';
                this.currTab = this.tabs[id];
                
                this.mediaWindow.dataDiv.style.overflow = this.currTab.u2be? 'hidden':'auto';
                this.mediaWindow.setSubTitle( this.currTab.tit? '- ' + this.currTab.tit: "" );
                //this.currTab.div.addEventListener('click', function() {alert(that.currTab.tit);} );
                var iframe = this.currTab.div.getElementsByTagName("iframe")[0];
                this.mediaWindow.dataDiv.addEventListener('focus', function() {alert(that.currTab.tit);} );
                
                
            };

            if( aUrl.length > 1 ) {
                // tab control
                var radios = document.getElementsByName( 'mediaControl'+ this.mediaWindow.id );

                for( var r=0; r < radios.length; r ++ ) {
                   radios[r].addEventListener('change', function() { 
                      that.showTab( this.id ); 
                   });
                }
            }
            
            that.showTab(); // mostra a primeira aba

        }
        
        if(this.showMediaButton)
            this.showMediaButton.style.display = (!this.useSiteProperties || SITE.properties.mediaDiv.visible )? 'none' : 'inline';

        this.mediaWindow.setVisible( !this.useSiteProperties || SITE.properties.mediaDiv.visible );
        
        if( !this.useSiteProperties || SITE.properties.mediaDiv.visible ) {
            this.resize();
            this.posiciona();
        } else {
            this.pause();
        }
    } else {
        this.pause();
        this.mediaWindow.setVisible(false);
        if(this.showMediaButton)
            this.showMediaButton.style.display = 'none';
    }
};

// posiciona a janela de mídia, se disponível
SITE.Media.prototype.posiciona = function () {

    if( ( this.useSiteProperties && ! SITE.properties.mediaDiv.visible )
        || this.mediaWindow.topDiv.style.display === 'none' ) 
            return;
    
    var w = window.innerWidth;
    
    var k = this.mediaWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    var xi = x;
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    if( x !== xi && this.useSiteProperties ) {
        SITE.properties.mediaDiv.left = k.style.left = x+"px";
        SITE.SaveProperties();
    }
};

SITE.Media.prototype.resize = function() {
    var d = this.mediaWindow.menuDiv.clientHeight + (this.mediaWindow.bottomBar? this.mediaWindow.bottomBar.clientHeight : 0 );
    this.mediaWindow.dataDiv.style.width = this.mediaWindow.topDiv.clientWidth + 'px';
    this.mediaWindow.dataDiv.style.height = (this.mediaWindow.topDiv.clientHeight - d ) + 'px';

    if( this.currTab.u2be ) {
        var h = (this.mediaWindow.topDiv.clientWidth*this.proportion);
        this.mediaWindow.dataDiv.style.height =  h + 'px';
        this.mediaWindow.topDiv.style.height = (h + d ) + 'px';
    }
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.lastStaffGroup = -1; // também auxilia no controle de scroll
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
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
    this.media = new SITE.Media( this.mapDiv, interfaceParams.btShowMedia, { resize: false, useSiteProperties: true} ); 
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
        return;
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
        case 'JUMPS':
            this.showHelp('HelpTitle', 'JUMPS', '/diatonic-map/html5/sinaisRepeticao.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'ABCX':
            this.showHelp('HelpTitle', 'ABCX', '/diatonic-map/html5/formatoABCX.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'ESTUDIO':
            this.showHelp('HelpTitle', 'ESTUDIO', '/diatonic-map/html5/estudioABCX.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TABS':
            this.showHelp('HelpTitle', 'TABS', '/diatonic-map/html5/tablatura.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TABSTRANSPORTADA':
            this.showHelp('HelpTitle', 'TABSTRANSPORTADA', '/diatonic-map/html5/tablaturaTransportada.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'MAPS':
            this.showHelp('HelpTitle', 'MAPS', '/diatonic-map/html5/mapas.pt_BR.html', { width: '1024', height: '600' } );
            break;
        case 'TUTORIAL':
            this.showHelp('HelpTitle', 'TUTORIAL', '/diatonic-map/html5/tutoriais.pt_BR.html', { width: '1024', height: '600', print:false } );
            break;
        case 'ABOUT':
            this.showHelp('AboutTitle', '', '/diatonic-map/html5/about.pt_BR.html', { width: '800', print:false } );
            break;
        case 'GAITA_MINUANO_GC':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
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

    this.renderedTune.title = 
           FILEMANAGER.loadLocal('property.' + this.accordion.getId() + '.songs.title')
        || this.accordion.loaded.getFirstSong();

    this.loadABCList(this.renderedTune.tab);
    
    this.showTab('songsTab');
    loader.stop();

};

SITE.Mapa.prototype.printPartiture = function (button, event) {
    var currentABC = this.getActiveTab();
    event.preventDefault();
    button.blur();
    if(  currentABC.div.innerHTML )  {
        SITE.ga('send', 'event', 'Mapa5', 'print', currentABC.title);
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
               ,showMapBtn: 'a2pShowMapBtn'
               ,showEditorBtn: 'a2pShowEditorBtn'
               ,printBtn:'a2pPrintBtn'
               ,saveBtn:'a2pSaveBtn'
               ,updateBtn:'a2pForceRefresh'
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
               ,showEditorBtn: 't2pShowEditorBtn'
               ,printBtn:'t2pPrintBtn'
               ,saveBtn:'t2pSaveBtn'
               ,updateBtn:'t2pForceRefresh'
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
               ,printBtn:'printBtn2'
               ,saveBtn:'saveBtn'
               ,forceRefresh:'forceRefresh'
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
                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML =  '<i class="ico-pause"></i>';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(currentABC.abc.midi, type, value ) ) {
                SITE.ga('send', 'event', 'Mapa5', 'didactic-play', currentABC.title);
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

            if(! first ) {
                // marca a primeira das novas canções para ser selecionada
                this.renderedTune.title = tunebook.tunes[t].title;
                first = true;
            }
            
            SITE.ga('send', 'event', 'Mapa5', 'load', tunebook.tunes[t].title);
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
    var self = this;
    var a = action.split('-');
    var type = a[0];
    var i = parseInt(a[1]);
    var tab = self.getActiveTab();
    var title = this.accordion.loaded[type].sortedIndex[i];
    if( tab.title !== title && tab.menu.selectItem( tab.ddmId, action ) ) {
        tab.title = title;
        tab.text = this.accordion.loaded.getAbcText( tab.tab, tab.title );
        tab.menu.setSubMenuTitle( tab.ddmId, (tab.title.length>43 ? tab.title.substr(0,40) + "..." : tab.title) );
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
        , {listener:this, method: 'showABC', translate:false }
        , [{title: '...', ddmId: tab.ddmId, itens: []}]
    );
    
    var achou = false;
    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        var m = tab.menu.addItemSubMenu( tab.ddmId, title +'|'+type+'-'+i);
        if(title === tab.title ) {
            achou = true;
            tab.menu.setSubMenuTitle( tab.ddmId, title );
            tab.menu.selectItem(tab.ddmId, m);
            tab.text = this.accordion.loaded.getAbcText(type, title);
        }    
    }
    if( !achou && items.length > 0 ) {
        var title = items[0];
        tab.menu.setSubMenuTitle( tab.ddmId, title );
        tab.menu.selectItem(tab.ddmId, type+'-0');
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
        SITE.translator.loadLanguage( this.settings.lang, function () { SITE.translator.translate(); } );  
    }
    
    if( this.settings.pianoSound.checked  !== SITE.properties.options.pianoSound ) {
        SITE.properties.options.pianoSound = this.settings.pianoSound.checked;
        SITE.ga('send', 'event', 'Configuration', 'changeInstrument', SITE.properties.options.pianoSound?'piano':'accordion');
        this.defineInstrument();
    }
    
    this.media.show(this.getActiveTab());

    if (this.studio) {
        this.studio.setAutoRefresh(SITE.properties.options.autoRefresh);
        this.studio.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    if (this.tab2part) {
        this.tab2part.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
    }
    if (this.part2tab) {
        this.part2tab.warningsDiv.style.display = SITE.properties.options.showWarnings ? 'block' : 'none';
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

    divsToHide.forEach( function( div ) {
        $(div).hide();
    });
    
    this.changePageOrientation(landscape? 'landscape': 'portrait');
    
    dv.style.display = 'block';
    dv.innerHTML = html;
    window.setTimeout(function(){
        window.print();
        dv.style.display = 'none';

        divsToHide.forEach( function( div ) {
            $(div).show();
        });
    }, 100 );
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

SITE.Mapa.prototype.translate = function() {
    
  this.accordion.keyboard.legenda.setText( true, SITE.translator.getResource('pull'), SITE.translator.getResource('push') );
  this.showAccordionName();
  
  document.title = SITE.translator.getResource("title");  
  
  DR.setDescription();
  
  document.getElementById("toolsBtn").innerHTML = '<i class="ico-wrench"></i>&#160;'+SITE.translator.getResource("toolsBtn");
  document.getElementById("printBtn2").innerHTML = '<i class="ico-print"></i>&#160;'+SITE.translator.getResource("printBtn");
  document.getElementById("pdfBtn").innerHTML = '<i class="ico-print"></i>&#160;'+SITE.translator.getResource("pdfBtn");
  document.getElementById("message").alt = SITE.translator.getResource("message");
  
  document.getElementById("octaveUpBtn").title = SITE.translator.getResource("octave");
  document.getElementById("octaveUpBtn").innerHTML = '<i class="ico-octave-up"></i>&#160;'+SITE.translator.getResource("octave");
  document.getElementById("octaveDwBtn").title = SITE.translator.getResource("octave");
  document.getElementById("octaveDwBtn").innerHTML = '<i class="ico--octave-down"></i>&#160;'+SITE.translator.getResource("octave");
  document.getElementById("printBtn").innerHTML = '<i class="ico-print"></i>&#160;'+SITE.translator.getResource("printBtn");
  document.getElementById("saveBtn").innerHTML = '<i class="ico-download"></i>&#160;'+SITE.translator.getResource("saveBtn");
  document.getElementById("forceRefresh").innerHTML = SITE.translator.getResource("forceRefresh");
  document.getElementById("forceRefresh2").innerHTML = SITE.translator.getResource("forceRefresh");
  document.getElementById("gotoMeasureBtn").value = SITE.translator.getResource("goto");
  document.getElementById("untilMeasureBtn").value = SITE.translator.getResource("until");
  
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
        this.helpWindow.dataDiv.className+=" customScrollBar";
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
                loader.stop();
                this.contentDocument.body.className+="customScrollBar";
                var header = this.contentDocument.getElementById('helpHeader');
                var container = this.contentDocument.getElementById('helpContainer');
                if( header ) header.style.display = 'none';
                if( container ) {
                    container.style.top = '0';
                    container.style.border = '1px solid rgba(255, 153, 34, 0.2)';
                }
            });    
        } else { // auto determina a altura
            that.iframe.addEventListener("load", function () { 
                this.contentDocument.body.style.overflow ="hidden";
                var info = this.contentDocument.getElementById('siteVerI');
                if( info ) info.innerHTML=SITE.siteVersion;
                that.iframe.style.height = this.contentDocument.body.clientHeight+"px";
                that.helpWindow.topDiv.style.opacity = "1";
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
        if( container )
            this.printPreview( container.innerHTML, ["#topBar","#mapaDiv"], false );
    }
//    console.log( action );
};

// Esta rotina foi criada como forma de verificar todos warnings de compilacao do repertório
SITE.Mapa.prototype.debugRepertorio = function( ) {
    
    for (var title in this.accordion.loaded.songs.items ) {

        waterbug.log(title);
        
        this.abcParser.parse( this.accordion.loaded.songs.items[title] );

        var w = this.abcParser.getWarnings() || [];
        var l = w.length;
        
        for (var j=0; j<w.length; j++) {
            waterbug.logError( '   ' + w[j]);
        }

        if ( this.midiParser ) {
            this.midiParser.parse( this.abcParser.getTune(), this.accordion.loadedKeyboard );
            var w = this.midiParser.getWarnings();
            l += w.length;
            for (var j=0; j<w.length; j++) {
                waterbug.logError( '   ' + w[j]);
            }
        }
        
        waterbug.log(l > 0 ? '': '--> OK' );
        waterbug.log( '' );
    }
    
    waterbug.show();    
};        

if (!window.SITE)
    window.SITE = {};

SITE.Estudio = function (mapa, interfaceParams, playerParams) {
    
    this.mapa = mapa;
    
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
       ,{   draggable:SITE.properties.studio.editor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'EstudioEditorTitle'
           ,compileOnChange: SITE.properties.options.autoRefresh
        }
    );
    this.editorWindow.setVisible(false);

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
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'controlDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.studioControlDiv).innerHTML;
    document.getElementById(interfaceParams.studioControlDiv).innerHTML = "";
   
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", interfaceParams.studioCanvasDiv );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv customScrollBar" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    this.studioCanvasDiv.appendChild(this.canvasDiv);
    
    this.renderedTune.div = this.canvasDiv;
    
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);
    
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
        this.blur();
        that.showEditor();
    }, false);
    
    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showKeyboard();
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
        SITE.ga('send', 'event', 'Mapa5', 'print', that.renderedTune.title);
        that.mapa.printPreview(that.renderedTune.div.innerHTML, ["#topBar","#studioDiv"], that.renderedTune.abc.formatting.landscape);
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
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.blockEdition(false);
        if(that.currentPlayTimeLabel)
           that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.blockEdition(false);
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
    
    this.mapa.closeMapa();
    
    this.accordion.loadById(accordionId);
    
    this.renderedTune.abc = tab.abc;
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    this.studioCanvasDiv.scrollTop = 0;
    
    
    this.changePlayMode(SITE.properties.studio.mode);
    this.setBassIcon();
    this.setTrebleIcon();
    this.setTimerIcon( 0 );
    
    this.setVisible(true);
    this.setString(tab.text);
    this.fireChanged(0, {force:true} );
    this.Div.setSubTitle( '- ' + this.accordion.getTxtModel() );
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

SITE.Estudio.prototype.closeEstudio = function(save) {
    var loader = this.mapa.startLoader( "CloseStudio" );
    var self = this;
    loader.start(  function() { 
        (save) && SITE.SaveProperties();
        self.setVisible(false);
        self.midiPlayer.stopPlay();
        self.mapa.openMapa( self.getString() );
        loader.stop();
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
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

SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.parseABC(0, true );
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
    
    if( SITE.properties.studio.mode === "normal" ) {
        $("#divDidacticPlayControls" ).hide();
        SITE.properties.studio.mode  = "normal";
        this.modeButton.innerHTML = '<i class="ico-listening" ></i>';
        this.midiPlayer.resetAndamento(SITE.properties.studio.mode);
        $("#divNormalPlayControls" ).fadeIn();
    } else {
        $("#divNormalPlayControls" ).hide();
        SITE.properties.studio.mode  = "learning";
        this.modeButton.innerHTML = '<i class="ico-learning" ></i>';
        this.midiPlayer.resetAndamento(SITE.properties.studio.mode);
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
        this.FClefButton.innerHTML = '<i class="ico-clef-bass" style="opacity:0.5;"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px"></i>';
    }
};

SITE.Estudio.prototype.setTrebleIcon = function() {
    if( SITE.properties.studio.trebleOn ) {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" ></i>';
    } else {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" style="opacity:0.5;"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px"></i>';
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
        this.timerButton.innerHTML = '<i class="ico-timer-00" style="opacity:0.5;"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px"></i>';
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
                SITE.ga('send', 'event', 'Mapa5', 'play', this.renderedTune.title);
                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML = '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            this.midiPlayer.setPlayableClefs( (SITE.properties.studio.trebleOn?"T":"")+(SITE.properties.studio.bassOn?"B":"") );
            SITE.ga('send', 'event', 'Mapa5', 'didactic-play', this.renderedTune.title);
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
        var loader = this.mapa.startLoader( "ModelChanged" );
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
    if( loader ) {
        loader.update( false, '<br>&nbsp;&nbsp;&nbsp;Gerando tablatura...<br><br>' );
        loader.stop();
    }
    delete this.changing;
    
};

SITE.Estudio.prototype.highlight = function(abcelem) {
    if(SITE.properties.studio.keyboard.visible && !this.midiPlayer.playing) {
        if(SITE.properties.studio.editor.visible) {
            this.editorWindow.setSelection(abcelem);
        }    
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
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

SITE.Estudio.prototype.translate = function( ) {
    //this.initEditArea( "editorTextArea" );
}; 
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.PartGen = function( mapa, interfaceParams ) {
    
    this.mapa = mapa;
    
    var that = this;
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.partGenDiv
        , ['help']
        , {translator: SITE.translator, statusbar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'PartGenTitle'}
        , {listener: this, method: 't2pCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    
    var toClub = (interfaceParams.accordion_options.id === 'GAITA_HOHNER_CLUB_IIIM_BR' );
    var fromClub = (interfaceParams.accordion_options.id === 'GAITA_MINUANO_GC' );
    
    var canvas_id = 't2pCanvasDiv';
    var warnings_id = 't2pWarningsDiv';

    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
    this.tabParser = new ABCXJS.Tab2Part(toClub, fromClub, this);
    
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
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'PartGenEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.editorWindow.setVisible(false);
    
    this.editorWindow.container.setButtonVisible( 'OCTAVEUP', false);
    this.editorWindow.container.setButtonVisible( 'OCTAVEDOWN', false);
    this.editorWindow.keySelector.setVisible(false);
    this.editorWindow.showHiddenChars(true);
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 't2pcontrolDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.controlDiv).innerHTML;
    document.getElementById(interfaceParams.controlDiv).innerHTML = "";

    this.media = new SITE.Media( this.Div.dataDiv,  interfaceParams.btShowMedia, { resize: true} ); 

    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        this.Div.dataDiv
       ,[ 'move', 'rotate', 'zoom', 'globe']
       ,{title: '', translator: SITE.translator, statusbar: false
            , top: SITE.properties.partGen.keyboard.top
            , left: SITE.properties.partGen.keyboard.left
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
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);

    this.abcDiv = document.createElement("DIV");
    this.abcDiv.style.display = SITE.properties.partGen.showABCText ? '' : 'none';

    this.ckShowABC = document.getElementById(interfaceParams.ckShowABC);
    this.ckShowABC.checked = SITE.properties.partGen.showABCText;
    
    this.ckConvertToClub = document.getElementById(interfaceParams.ckConvertToClub);
    this.convertToClub = document.getElementById('convertToClub');

    this.ckConvertFromClub = document.getElementById(interfaceParams.ckConvertFromClub);
    this.convertFromClub = document.getElementById('convertFromClub');
        
    //this.ckConvertToClub.checked = SITE.properties.partGen.convertToClub;
    this.ckConvertToClub.checked = false;
    this.convertToClub.style.display = toClub ? 'inline' : 'none';

    //this.ckConvertFromClub.checked = SITE.properties.partGen.convertFromClub;
    this.ckConvertFromClub.checked = false;
    this.convertFromClub.style.display = fromClub ? 'inline' : 'none';
    
    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", 't2pStudioCanvasDiv' );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv customScrollBar" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );
    
    this.studioCanvasDiv.appendChild(this.abcDiv);
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

    this.ckConvertToClub.addEventListener("click", function() {
        SITE.properties.partGen.convertToClub = !!this.checked;
        that.fireChanged();
    }, false);

    this.ckConvertFromClub.addEventListener("click", function() {
        SITE.properties.partGen.convertFromClub = !!this.checked;
        that.fireChanged();
    }, false);

    this.ckShowABC.addEventListener("click", function() {
        SITE.properties.partGen.showABCText = !!this.checked;
        that.abcDiv.style.display = this.checked ? '' : 'none';
    }, false);

    this.printButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.mapa.printPreview(that.renderedTune.div.innerHTML, ["#topBar","#mapaDiv","#partGenDiv"], that.renderedTune.abc.formatting.landscape);
    }, false);

    this.saveButton.addEventListener("click", function() {
        that.salvaPartitura();
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


SITE.PartGen.prototype.setup = function(options) {
    
    this.mapa.closeMapa();
    
    this.accordion.loadById(options.accordionId);
    
    var toClub = (options.accordionId === 'GAITA_HOHNER_CLUB_IIIM_BR' );
    var fromClub = (options.accordionId === 'GAITA_MINUANO_GC' );
    
    this.convertToClub.style.display = toClub ? 'inline' : 'none';
    this.convertFromClub.style.display = fromClub ? 'inline' : 'none';
    
    this.setVisible(true);
    if( this.editorWindow.getString() === "" ) {
        var text = FILEMANAGER.loadLocal("ultimaTablaturaEditada");
        if( ! text ) {
            text = this.getDemoText();
        }
        this.editorWindow.setString(text);
    }
    
    this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    
    this.fireChanged();
    this.editorWindow.restartUndoManager();
    
    this.Div.setSubTitle( '- ' + this.accordion.getTxtModel() );
    
    this.showEditor(SITE.properties.partGen.editor.visible);

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
    var w = (winW - 8 ); 
    
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w,400) +"px";
   
    var w = 0, e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    if(! SITE.properties.showWarnings) {
        w = this.warningsDiv.clientHeight;
    }
    
    if(! SITE.properties.partGen.editor.floating) {
        e = this.editorWindow.container.topDiv.clientHeight+4;
    }

    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";
    
    this.posicionaTeclado();
};

SITE.PartGen.prototype.posicionaTeclado = function() {
    
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


SITE.PartGen.prototype.closePartGen = function(save) {
    var self = this;
    var loader = this.mapa.startLoader( "ClosePartGen" );
    
    loader.start(  function() { 
        var text = self.editorWindow.getString();
        self.setVisible(false);
        self.editorWindow.setString("");
        self.midiPlayer.stopPlay();
        (save) && SITE.SaveProperties();
        if(text !== "" ) 
            FILEMANAGER.saveLocal( 'ultimaTablaturaEditada', text );
        self.mapa.openMapa();
        loader.stop();
    }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
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
           this.fireChanged();
           break;
        case 'DOWNLOAD': 
           this.salvaTablatura();
           break;
        case 'MAXIMIZE': 
            this.editorWindow.maximizeWindow( true, SITE.properties.partGen.editor );
            break;
        case 'RESTORE': 
            this.editorWindow.maximizeWindow( false, SITE.properties.partGen.editor );
            break;
        case 'POPIN':
            this.editorWindow.dockWindow(true, SITE.properties.partGen.editor, 0, 0, "calc(100% - 5px)", "200px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.editorWindow.dockWindow(false, SITE.properties.partGen.editor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.editorWindow.retrieveProps( SITE.properties.partGen.editor );
            break;
        case 'CLOSE':
            this.showEditor(false);
            break;
    }
};

SITE.PartGen.prototype.t2pCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.closePartGen(true);
            break;
        case 'HELP':
            this.mapa.showHelp('HelpTitle', 'PartGenTitle', '/diatonic-map/html5/geradorPartitura.pt_BR.html', { width: '1024', height: '600' } );
    }
};

SITE.PartGen.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};

SITE.PartGen.prototype.fireChanged = function() {
    
    var text = this.editorWindow.getString();
    
    if(text !== "" ) {
    
        FILEMANAGER.saveLocal( 'ultimaTablaturaEditada', text );

        this.renderedTune.text = this.tabParser.parse(
            text
           ,this.accordion.loadedKeyboard
           ,this.ckConvertToClub.checked
           ,this.ckConvertFromClub.checked );

        this.printABC();
        
    } else {
        this.editorWindow.container.setSubTitle( "" );
        this.warningsDiv.innerHTML = "";
        this.abcDiv.innerHTML = "";
        this.renderedTune.div.innerHTML = "";
    }   
};

SITE.PartGen.prototype.printABC = function() {
    
    this.abcDiv.innerHTML = this.renderedTune.text.replace(/\n/g,'\<br\>');
   
    var warns = this.tabParser.getWarnings();
    
    if(warns) {
        this.warningsDiv.innerHTML = warns;
        this.warningsDiv.style.color = 'red';
    } else {
        this.warningsDiv.innerHTML = 'Partitura gerada com sucesso!';
        this.warningsDiv.style.color = 'green';
    }
    
    this.parseABC();
    
    this.renderedTune.printer = new ABCXJS.write.Printer( new SVG.Printer( this.renderedTune.div) );
    
    this.renderedTune.printer.printABC(this.renderedTune.abc);
    this.renderedTune.printer.addSelectListener(this);
    
    this.media.show(this.renderedTune);
    
};

SITE.PartGen.prototype.parseABC = function() {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(this.renderedTune.text, this.parserparams );
    this.renderedTune.abc = abcParser.getTune();
    
    this.renderedTune.title = this.renderedTune.abc.metaText.title ;
    
    if(this.renderedTune.title)
        this.editorWindow.container.setSubTitle('- ' + this.renderedTune.abc.metaText.title );
    else
        this.editorWindow.container.setSubTitle( "" );

    if ( this.midiParser ) {
        this.midiParser.parse( this.renderedTune.abc, this.accordion.loadedKeyboard );
    }
};        

SITE.PartGen.prototype.highlight = function(abcelem) {
    // não é possível, por hora, selecionar o elemento da tablatura a partir da partitura
    //if(SITE.properties.partGen.editor.visible) {
    //    this.editorWindow.setSelection(abcelem);
    //}    
    if(SITE.properties.partGen.keyboard.visible && !this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
    }    
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.PartGen.prototype.unhighlight = function(abcelem) {
    if(SITE.properties.partGen.editor.visible) {
        this.editorWindow.clearSelection(abcelem);
    }    
};

SITE.PartGen.prototype.updateSelection = function (force) {
    return;
    // não é possível, por hora, selecionar o elemento da partitura a partir da tablatura
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

SITE.PartGen.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            var k = this.keyboardWindow.topDiv.style;
            SITE.properties.partGen.keyboard.left = k.left;
            SITE.properties.partGen.keyboard.top = k.top;
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partGen.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.partGen.keyboard.mirror = this.accordion.render_opts.mirror;
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partGen.keyboard.scale = this.accordion.render_opts.scale;
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            SITE.properties.partGen.keyboard.label = this.accordion.render_opts.label;
            break;
        case 'CLOSE':
            this.showKeyboard(false);
            break;
    }
};

SITE.PartGen.prototype.salvaPartitura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.renderedTune.text;
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};

SITE.PartGen.prototype.salvaTablatura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.renderedTune.abc.metaText.title + ".tab";
        var conteudo = this.editorWindow.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};


SITE.PartGen.prototype.blockEdition = function( block ) {
    this.editorWindow.setReadOnly(!block);
    this.editorWindow.container.dispatchAction('READONLY');
    if( block ) {
        this.editorWindow.setEditorHighLightStyle();
    } else {
        this.editorWindow.clearEditorHighLightStyle();
        this.editorWindow.aceEditor.focus();
    }
};

SITE.PartGen.prototype.startPlay = function( type, value ) {
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
                this.playButton.innerHTML =  '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value ) ) {
            }
        }
    }
};

SITE.PartGen.prototype.setScrolling = function(player) {
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

SITE.PartGen.prototype.getDemoText = function() {
    return "\
T:Hino do Grêmio\n\
C:Lupicínio Rodrigues\n\
C:(adapt. Cezar Ferreira)\n\
L:1/8\n\
Q:140\n\
M:4/4\n\
K:C\n\
|: C c       C  c       | G  g  G g | C c       C  c       | G  g G g       |\n\
|: 9 7'  8   6' 8   7'  |           | 9 7'  8   6' 8   7'  |                |\n\
|:                      | 7' 5'   z |                      | 7'   z 9   8'  |\n\
+  2 1.5 0.5 2  1.5 0.5   2  2  2 2   2 1.5 0.5 2  1.5 0.5   2  2 2 1.5 0.5\n\
\n\
| C  z   z   A  z   z   | F   f  F f       | C  g       G  g       | C  c C c :|\n\
| 8'                    |                  | 8'                    | 6'     z :|\n\
|    10  9'  11 9'  11  | 10' 11 z 9   8'  |    11  9'  7' 8'  9   |          :|\n\
+ 2  1.5 0.5 2  1.5 0.5   2   2  2 1.5 0.5   2  1.5 0.5 2  1.5 0.5   2  2 2 2\n";
    
};
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
       ,{   draggable:SITE.properties.partGen.editor.floating
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
    
    this.media = new SITE.Media( this.Div.dataDiv, interfaceParams.btShowMedia, { resize: true} ); 
    
    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        this.Div.dataDiv
       ,[ 'move', 'rotate', 'zoom', 'globe']
       ,{title: '', translator: SITE.translator, statusbar: false
            , top: SITE.properties.partGen.keyboard.top
            , left: SITE.properties.partGen.keyboard.left
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
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", 'a2pStudioCanvasDiv' );
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

    this.printButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.mapa.printPreview(that.renderedTune.div.innerHTML, ["#topBar","#mapaDiv","#partEditDiv"], that.renderedTune.abc.formatting.landscape);
    }, false);

    this.saveButton.addEventListener("click", function() {
        that.salvaPartitura();
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
    
    this.showEditor(SITE.properties.partGen.editor.visible);

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
    
    if(! SITE.properties.partGen.editor.floating) {
        e = this.editorWindow.container.topDiv.clientHeight+4;
    }

    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";
    
    this.posicionaTeclado();
};

SITE.PartEdit.prototype.posicionaTeclado = function() {
    
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

SITE.PartEdit.prototype.showKeyboard = function(show) {
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
            this.editorWindow.maximizeWindow( true, SITE.properties.partGen.editor );
            break;
        case 'RESTORE': 
            this.editorWindow.maximizeWindow( false, SITE.properties.partGen.editor );
            break;
        case 'POPIN':
            this.editorWindow.dockWindow(true, SITE.properties.partGen.editor, 0, 0, "calc(100% - 5px)", "200px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.editorWindow.dockWindow(false, SITE.properties.partGen.editor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.editorWindow.retrieveProps( SITE.properties.partGen.editor );
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
            //this.mapa.showHelp('HelpTitle', 'PartEditTitle', '/diatonic-map/html5/geradorPartitura.pt_BR.html', { width: '1024', height: '600' } );
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
    }   
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

    if(this.renderedTune.title)
        this.editorWindow.container.setSubTitle('- ' + this.renderedTune.abc.metaText.title );
    else
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
    
//    this.abcDiv.innerHTML = this.renderedTune.text.replace(/\n/g,'\<br\>');
//   
//    var warns = this.abcParser.getWarnings();
//    
//    if(warns) {
//        this.warningsDiv.innerHTML = warns;
//        this.warningsDiv.style.color = 'red';
//    } else {
//        this.warningsDiv.innerHTML = 'Partitura gerada com sucesso!';
//        this.warningsDiv.style.color = 'green';
//    }
//    
//    this.parseABC();
    
    this.renderedTune.div.innerHTML = "";
    
    this.renderedTune.printer = new ABCXJS.write.Printer( new SVG.Printer( this.renderedTune.div ) );
    
    this.renderedTune.printer.printABC(this.renderedTune.abc);
    
    this.renderedTune.printer.addSelectListener(this);
    
    this.media.show(this.renderedTune);
    
};

SITE.PartEdit.prototype.highlight = function(abcelem) {
    if(SITE.properties.partGen.editor.visible && !this.midiPlayer.playing) {
        this.editorWindow.setSelection(abcelem);
    }    
    if(SITE.properties.partGen.keyboard.visible && !this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
    }    
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.PartEdit.prototype.unhighlight = function(abcelem) {
    if(SITE.properties.partGen.editor.visible) {
        this.editorWindow.clearSelection(abcelem);
    }    
};

SITE.PartEdit.prototype.updateSelection = function (force) {
    return;
    // não é possível, por hora, selecionar o elemento da partitura a partir da tablatura
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
            SITE.properties.partGen.keyboard.left = k.left;
            SITE.properties.partGen.keyboard.top = k.top;
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partGen.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.partGen.keyboard.mirror = this.accordion.render_opts.mirror;
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.partGen.keyboard.scale = this.accordion.render_opts.scale;
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            SITE.properties.partGen.keyboard.label = this.accordion.render_opts.label;
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
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
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
F:http://flvani.github.io/diatonic-map/img/susannah.tablatura.png\n\
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
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.TabGen = function( mapa, interfaceParams ) {

    var that = this;
    this.mapa = mapa;
    this.accordion = mapa.accordion;
    
    var warnings_id = 'p2tWarningsDiv';

    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.tabGenDiv
        , null // ['help|Ajuda']
        , {translator: SITE.translator,  statusbar: false, draggable: false, top: "3px", left: "1px", 
            width: '100%', height: "100%", title: 'TabGenTitle'}
        , {listener: this, method: 'p2tCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'p2tcontrolDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.controlDiv).innerHTML;
    document.getElementById(interfaceParams.controlDiv).innerHTML = "";
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);
    
    this.abcEditorDiv = document.createElement("DIV");
    this.Div.dataDiv.appendChild(this.abcEditorDiv);

    this.tabEditorDiv = document.createElement("DIV");
    this.Div.dataDiv.appendChild(this.tabEditorDiv);

    this.tabParser = new ABCXJS.Part2Tab();
    
    this.abcEditorWindow = new ABCXJS.edit.EditArea(
        this.abcEditorDiv
       ,{listener : this, method: 'abcEditorCallback' }
       ,{   draggable:SITE.properties.tabGen.abcEditor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'TabGenSourceEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.abcEditorWindow.setVisible(true);
    this.abcEditorWindow.container.setButtonVisible( 'CLOSE', false);
    this.abcEditorWindow.container.setButtonVisible( 'DOWNLOAD', false);
    this.abcEditorWindow.container.setButtonVisible( 'OCTAVEUP', false);
    this.abcEditorWindow.container.setButtonVisible( 'OCTAVEDOWN', false);
    this.abcEditorWindow.keySelector.setVisible(false);

    this.tabEditorWindow = new ABCXJS.edit.EditArea(
        this.tabEditorDiv
       ,{listener : this, method: 'tabEditorCallback' }
       ,{   draggable:SITE.properties.tabGen.tabEditor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'TabGenTargetEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.tabEditorWindow.setVisible(true);
    this.tabEditorWindow.container.setButtonVisible( 'CLOSE', false);
    this.tabEditorWindow.container.setButtonVisible( 'DOWNLOAD', false);
    this.tabEditorWindow.container.setButtonVisible( 'OCTAVEUP', false);
    this.tabEditorWindow.container.setButtonVisible( 'OCTAVEDOWN', false);
    this.tabEditorWindow.container.setButtonVisible( 'REFRESH', false);
    this.tabEditorWindow.keySelector.setVisible(false);
    
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);
    this.openButton = document.getElementById(interfaceParams.openBtn);
    
    this.updateButton.addEventListener("click", function() {
        that.fireChanged();
    }, false);
    
    this.saveButton.addEventListener("click", function() {
        that.salvaTablatura();
    }, false);
    
    this.openButton.addEventListener("click", function() {
        var text = that.tabEditorWindow.getString();
        that.setVisible(false);
        SITE.SaveProperties();
        if(text !== "" ) {
            FILEMANAGER.saveLocal( 'ultimaTablaturaEditada', text );
            that.mapa.menu.dispatchAction('menuRepertorio','TAB2PART');
        }    
    }, false);
    
};

SITE.TabGen.prototype.setup = function(abcText) {
    
    this.mapa.closeMapa();
    
    this.setVisible(true);
    this.abcEditorWindow.setString(abcText);
        this.abcEditorWindow.container.dispatchAction('READONLY');
    
    if(SITE.properties.tabGen.abcEditor.floating) {
        if( SITE.properties.tabGen.abcEditor.maximized ) {
            this.abcEditorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.abcEditorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.abcEditorWindow.container.dispatchAction('POPIN');
    }
    
    this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    this.fireChanged();
    
    if(SITE.properties.tabGen.tabEditor.floating) {
        if( SITE.properties.tabGen.tabEditor.maximized ) {
            this.tabEditorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.tabEditorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.tabEditorWindow.container.dispatchAction('POPIN');
    }
    
    this.tabEditorWindow.restartUndoManager();
    this.resize();
};

SITE.TabGen.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};
    
SITE.TabGen.prototype.fireChanged = function() {
    this.title = "";
    var abcText = this.tabParser.parse(this.abcEditorWindow.getString(), this.accordion.loadedKeyboard );
    this.title = this.tabParser.title;
    this.printTablature(abcText);
};

SITE.TabGen.prototype.salvaTablatura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.title + ".tab";
        var conteudo = this.tabEditorWindow.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};

SITE.TabGen.prototype.printTablature = function(abcText) {
    
    this.tabEditorWindow.setString(abcText);
    
    var warns = this.tabParser.getWarnings();
    
    if(warns) {
        this.warningsDiv.innerHTML = warns;
        this.warningsDiv.style.color = 'red';
    } else {
        this.warningsDiv.innerHTML = 'Tablatura extraída com sucesso!';
        this.warningsDiv.style.color = 'green';
    }
};

SITE.TabGen.prototype.resize = function( ) {
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
};

SITE.TabGen.prototype.updateSelection = function (force) {
    return;
    // não é possível, por hora, selecionar o elemento da partitura a partir da tablatura
};

SITE.TabGen.prototype.p2tCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.setVisible(false);
            SITE.SaveProperties();
            this.mapa.openMapa();
            break;
    }
};

SITE.TabGen.prototype.tabEditorCallback = function (action) {
    switch(action) {
        case 'REFRESH': 
           this.fireChanged();
           break;
        case 'MAXIMIZE': 
            this.tabEditorWindow.maximizeWindow( true, SITE.properties.tabGen.tabEditor );
            break;
        case 'RESTORE': 
            this.tabEditorWindow.maximizeWindow( false, SITE.properties.tabGen.tabEditor );
            break;
        case 'POPIN':
            this.tabEditorWindow.dockWindow(true, SITE.properties.tabGen.tabEditor, 0, 0, "calc(100% - 5px)", "400px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.tabEditorWindow.dockWindow(false, SITE.properties.tabGen.tabEditor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.tabEditorWindow.retrieveProps( SITE.properties.tabGen.tabEditor );
            break;
    }
};

SITE.TabGen.prototype.abcEditorCallback = function (action) {
    switch(action) {
        case 'REFRESH': 
           this.fireChanged();
           break;
        case 'MAXIMIZE': 
            this.abcEditorWindow.maximizeWindow( true, SITE.properties.tabGen.abcEditor );
            break;
        case 'RESTORE': 
            this.abcEditorWindow.maximizeWindow( false, SITE.properties.tabGen.abcEditor );
            break;
        case 'POPIN':
            this.abcEditorWindow.dockWindow(true, SITE.properties.tabGen.abcEditor, 0, 0, "calc(100% - 5px)", "400px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.abcEditorWindow.dockWindow(false, SITE.properties.tabGen.abcEditor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.abcEditorWindow.retrieveProps( SITE.properties.tabGen.abcEditor );
            break;
    }
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

ABCXJS.Tab2PartLine = function () {
    this.basses = [];
    this.treble = "";
    this.tablature = "";
};

ABCXJS.Tab2Part = function (toClub, fromClub ) {
    
    this.toClub = toClub || false;
    this.fromClub = fromClub || false;
    
    this.ties = [];
    this.keyAcidentals = [];
    this.barAccidentals = [];
    this.barBassAccidentals = [];
    
    this.startSyms = "|/+%";
    this.barSyms = ":]|[";
    this.spaces = "-.\ \t";

    this.bassOctave = 2;
    this.init();
    
    this.addWarning = function ( msg ) {
        this.warnings.push(msg);
    };
    
    this.getWarnings = function () {
        return this.warnings.join('<br>');
    };
};

ABCXJS.Tab2Part.prototype.init = function () {
    this.tabText;
    this.tabLines;
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = "";
    this.barEnding = false;
    this.trebleStaffs = { open: null, close: null};
    this.parsedLines = [];
    this.currLine = 0;
    this.abcText = "";
    this.updateBarNumberOnNextNote = false;
    this.alertedBarNumber = 0;
    this.currBar = 0;
    this.currStaff = -1;   
    
    this.warnings = [];
};

ABCXJS.Tab2Part.prototype.parse = function (text, keyboard, toClub, fromClub ) {
    this.init();
    this.tabText   = text;
    this.tabLines  = this.extractLines();
    this.keyboard  = keyboard;
    this.hasErrors = false;
    this.toClub = toClub;
    this.fromClub = fromClub;
    
    this.addLine('%%barnumbers 1');
    this.addLine('%%papersize A4');

    while((!this.hasErrors) && this.currLine < this.tabLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
    
    if( ! this.hasErrors ) {
        //adicionar vozes treble
        this.addLine( 'V:1 treble' );
        var t= "";
        this.parsedLines.forEach( function(item) {
           t += item.treble  + '\n';   
        });
        this.addLine( t.slice(0,-1) );

        //adicionar vozes bass
        this.addLine( 'V:2 bass' );
        var t= "";
        this.parsedLines.forEach( function(item) {
           t += item.basses[0]  + '\n';   
        });
        this.addLine( t.slice(0,-1) );

        //adicionar accordionTab
        this.addLine( 'V:3 accordionTab' );

         t= "";
        this.parsedLines.forEach( function(item) {
           t += item.tablature  + '\n';   
        });
        this.addLine( t.slice(0,-1) );
    }
    
    
    return this.abcText;
};

ABCXJS.Tab2Part.prototype.extractLines = function () {
    var v = this.tabText.split('\n');
    v.forEach( function(linha, i) { 
        var l = linha.split('%');
        v[i] = l[0].trim(); 
    } );
    return v;
};

ABCXJS.Tab2Part.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.tabLines[this.currLine].match(/^([ACFKLMNTQZ]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        var key = this.tabLines[this.currLine].match(/^([ACFKLMNTQZ]\:)/g);
        switch( key[0] ) {
            case 'K:': 
                var k = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                if( this.toClub ) {
                    switch( k ) {
                        case 'G': k = 'C'; break;
                        case 'Am': k = 'Dm'; break;
                        case 'C': k = 'F';
                    }
                } else if ( this.fromClub ) {
                    switch( k ) {
                        case 'C': k = 'G'; break;
                        case 'Dm': k = 'Am'; break;
                        case 'F': k = 'C';
                    }
                }
                header[0] = 'K:' + k;
                this.keyAcidentals = ABCXJS.parse.parseKeyVoice.standardKey(k);
                break;
        }
        this.addLine( header[0] );
    } else {
       this.parseStaff();
    }
};

ABCXJS.Tab2Part.prototype.skipEmptyLines = function () {
    while(this.currLine < this.tabLines.length) {
        if(  this.tabLines[this.currLine].charAt(0) !== '%' && this.tabLines[this.currLine].match(/^[\s\r\t]*$/) === null ) {
           return true;
        };
        this.currLine++;
    }
    return false;
};

ABCXJS.Tab2Part.prototype.addLine = function (ll) {
    this.abcText += ll + '\n';
};

ABCXJS.Tab2Part.prototype.parseStaff = function () {
    var staffs = this.idStaff();
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    var cnt = 1000; // limite de saida para o caso de erro de alinhamento do texto
    while( st > 0 && --cnt ) {
        
        this.posiciona(staffs);
        
        st = this.read(staffs);

        switch(st){
            case 1: // incluir a barra na tablatura
                this.addBar(staffs, staffs[0].token.str );
                break;
            case 2:
                this.addNotes(staffs);
                break;
        }
    } 
    if( ! cnt ) {
        this.addWarning('Não pude processar tablatura após 1000 ciclos. Possivel desalinhamento de texto.');
        this.hasErrors = true;
    }
};

ABCXJS.Tab2Part.prototype.addBar = function (staffs, bar ) {
    var startTreble = true;
    
    // neste caso, todas as vozes da staff são "bar", mesmo que algumas já terminaram 
    this.addTabElem(bar + ' ');
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st !== 'closed') {
            if(staffs[i].bass) {
                this.addBassElem(staffs[i].idBass, bar + ' ');
            } else {
                if( startTreble ) {
                    this.addTrebleElem(bar + ' ');
                    startTreble = false;
                }    
            }
            this.setStaffState(staffs[i]);
        }
    }
};

ABCXJS.Tab2Part.prototype.addNotes = function(staffs) {
    var str;
    var opening = true;
    
    var startTreble = true;
    var hasTreble = false;
    for( var i = 0; startTreble && i < staffs.length; i ++ ) {
        if(staffs[i].st === 'processing' && !staffs[i].bass ){
            opening = staffs[i].open;
            startTreble = false;
            hasTreble = true;
        }
    } 
    
    if( ! hasTreble  ) {
        if( this.alertedBarNumber !== staffs[0].token.barNumber ) {
            this.addWarning( 'Compasso '+staffs[0].token.barNumber+': Pelo menos uma pausa deveria ser adicionada à melodia!.');
            this.alertedBarNumber = staffs[0].token.barNumber;
        }    
    }    
    
    startTreble = true;
    //flavio - tratar duas notas ou mais de cada vez 
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st === 'processing' ) {
            if(staffs[i].bass ){ // para os baixos, sempre espero uma nota simples (sem colchetes)
                var note = this.handleBassNote(staffs[i].token.str);
                if( staffs[i].token.added && note.pitch !== "z" ) {
                    str = ">";
                } else {
                    staffs[i].token.added = true; 
                    str = note.pitch;
                }
                this.addTabElem(str);
                if( staffs[i].token.afinal ) {
                    var bas = this.checkBass(note.pitch, opening);
                    if(!bas){
                        if( this.alertedBarNumber !== staffs[i].token.barNumber ) {
                            this.addWarning("Compasso "+staffs[i].token.barNumber+": Baixo não encontrado ou não compatível com o movimento do fole.");
                            this.alertedBarNumber = staffs[i].token.barNumber;
                        }    
                    }
                    this.addBassElem(staffs[i].idBass, staffs[i], bas );
                    this.setStaffState(staffs[i]);
                }
            } else {
                if(startTreble){
                    this.addTabElem(opening?"-":"+");
                    startTreble = false;
                }
                str = "";
                for(var j = 0; j < staffs[i].token.aStr.length; j ++ ) {
                    if( staffs[i].token.added && staffs[i].token.aStr[j] !== "z" ) {
                        str += ">";
                    } else {
                        str += this.toHex(staffs[i].token.aStr[j]);
                    }
                }  
                staffs[i].token.added = true; 
                if(staffs[i].token.aStr.length > 1) {
                    str = '['+str+']';
                }
                
                if( (opening && staffs[i].open) || (!opening && !staffs[i].open) ) {
                    
                    if( this.ties.length > 0 )  {
                        var t = this.ties.pop();
                        if( t !== str ) {
                            this.ties.push(t);
                        } else {
                            str = "";
                            for(var j = 0; j < staffs[i].token.aStr.length; j ++ ) {
                                  str += ">";
                            }  
                            if(staffs[i].token.aStr.length > 1) {
                                str = '['+str+']';
                            }
                        }
                    }  else {

                        if(staffs[i].token.lastChar.indexOf( '-' )>=0) {
                            //staffs[i].token.lastChar = '';
                            this.ties.push(str);
                        }
                    }  
                    this.addTabElem(str);
                    if(  (this.trebleStaffs.open && this.trebleStaffs.open.token.afinal) 
                            || (this.trebleStaffs.close && this.trebleStaffs.close.token.afinal)){
                        this.addTrebleElem(staffs[i]);
                        if( this.trebleStaffs.open ) {
                            this.setStaffState(this.trebleStaffs.open);
                            this.trebleStaffs.open.token.afinal = true;
                        }
                        if( this.trebleStaffs.close ) {
                            this.setStaffState(this.trebleStaffs.close);
                            this.trebleStaffs.close.token.afinal = true;
                        }

                    }
                } else {
                    if( this.alertedBarNumber !== staffs[i].token.barNumber ) {
                        this.addWarning( 'Compasso '+staffs[i].token.barNumber+': Não é possível ter ambos (abrindo e fechando) movimento de fole.');
                        this.alertedBarNumber = staffs[i].token.barNumber;
                    }    
                } 
            }
        }
    }
    
    if( this.columnDuration && this.columnDuration.length ) {
        this.addTabElem(this.columnDuration);
    }
    
    this.addTabElem(' ');
   
};

ABCXJS.Tab2Part.prototype.addTabElem = function (el) {
    this.parsedLines[this.currStaff].tablature += el;
};

ABCXJS.Tab2Part.prototype.handleBassNote = function (note) {
    var isChord = false, isMinor = false, isRest = false;
    if( "@XxZz".indexOf( note.charAt(0)) > 0  ){
       isRest = true ;
    }
    
    if( note.charAt(note.length-1) === 'm' ){
        isMinor = true;
        note = note.slice(0,-1);
    }
    if( note === note.toLowerCase() ) {
        isChord = true;
    }
    
    return {pitch:note, isRest: isRest, isMinor:isMinor, isChord:isChord};
};

ABCXJS.Tab2Part.prototype.addBassElem = function (idx, el, bas ) {
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].basses[idx] += el;
    } else {
        if( el.hasToken && el.token.afinal ) {
            var note = this.handleBassNote(el.token.str);
            var str;
            
            if( note.isRest ) {
               str = note.pitch;
            } else if( note.isChord ) {
               str = this.getChord(note.pitch, (bas.isMinor !==undefined? bas.isMinor : note.isMinor ) );
            } else {
                str = this.getTabNote(note.pitch, this.bassOctave, true );
            }
            
            str += (el.token.duration!==1? el.token.duration:"") 
                    + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                        + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");
            
            this.parsedLines[this.currStaff].basses[idx] += str;
        }
    }
};

ABCXJS.Tab2Part.prototype.addTrebleElem = function (el) {
    var str;
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].treble += el;
    } else {
        str = this.getPitch(el);
        
        str += (el.token.duration!==1? el.token.duration:"") 
                + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                    + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");

        this.parsedLines[this.currStaff].treble += str;
    }
};

ABCXJS.Tab2Part.prototype.getPitch = function (el) {
    var pp = "";
    for( var i = 0; i < el.token.aStr.length; i++ ) {
        var p = el.token.aStr[i];
        if (p !== 'z') {
            var b = this.getButton(p);
            if (b) {
                var n = el.open ? b.openNote : b.closeNote;
                p = this.getTabNote(n.key, n.octave, false);
            }
        }
        pp += p;
    }
    
    return el.token.aStr.length > 1 ? '['+pp+']' : pp;
};

ABCXJS.Tab2Part.prototype.getChord = function ( pitch, isMinor ) {
    var p = ABCXJS.parse.normalizeAcc(pitch.toUpperCase());
    var base = ABCXJS.parse.key2number[p];
    
    if( !(base >= 0)  ) {
        throw new Error("Acorde não identificado: " + p);
    }
    
    var n2 = base + (isMinor?3:4);
    var n3 = base + 7;
    var oct = this.bassOctave + 1; // flavio (base > 4 ? 0 : 1);
    
    return '[' + this.getTabNote( ABCXJS.parse.number2keysharp[base%12], oct, true ) 
                   + this.getTabNote( ABCXJS.parse.number2keysharp[n2%12], oct+Math.trunc(n2/12), true ) 
                       + this.getTabNote( ABCXJS.parse.number2keysharp[n3%12], oct+Math.trunc(n3/12), true ) + ']';

};

ABCXJS.Tab2Part.prototype.getTabNote = function (note, octave, bass) {

    var noteAcc = note.match(/[♯♭]/g);
    var n = noteAcc ? note.charAt(0) : note;
    var keyAcc = this.getKeyAccOffset(n);
    
    if (noteAcc && keyAcc === null ) {
        var newNote, noteAcc2, n2, keyAcc2, base = ABCXJS.parse.key2number[note];
        if( noteAcc[0] === '♯' ) {
            newNote = ABCXJS.parse.number2keyflat[base%12];
        } else {
            newNote = ABCXJS.parse.number2keysharp[base%12];
        }
        noteAcc2 = newNote.match(/[♯♭]/g);
        n2 = newNote.charAt(0);
        keyAcc2 = this.getKeyAccOffset(n2);
        
        if( keyAcc2 ) {
            note = newNote;
            n = n2;
            keyAcc = keyAcc2;
            noteAcc = noteAcc2;
        }
    }
    
    if (noteAcc) {
        if ((noteAcc[0] === '♯' && keyAcc === 'sharp') || (noteAcc[0] === '♭' && keyAcc === 'flat')) {
            // anula o acidente  - n já está correto
        } else {
            n = ((noteAcc[0] === '♯')?'^':'_') + n; //mantem o acidente da nota, convertendo para abc
        }
    } else if (keyAcc) {
        n = '=' + n; // naturaliza esta nota
    }
    
    if(bass){
        if(noteAcc) {
            if( this.barBassAccidentals[ n ] ) {
                if(this.barBassAccidentals[ n ] === noteAcc[0]){
                    n = n.charAt(1);
                }
            } else {
                this.barBassAccidentals[ n.charAt(1) ] = noteAcc[0];
            } 
        } else {
            if( this.barBassAccidentals[ n ] ) {
                n = '=' + n; // naturaliza esta nota
            } 
        }
    } else {
        if(noteAcc) {
            if( this.barAccidentals[ n ] ) {
                if(this.barAccidentals[ n ] === noteAcc[0]){
                    n = n.charAt(1);
                }
            } else {
                this.barAccidentals[ n.charAt(1) ] = noteAcc[0];
            } 
        } else {
            if( this.barAccidentals[ n ] ) {
                n = '=' + n; // naturaliza esta nota
            } 
        }
    }

    var ret = n;
    if (octave < 4) {
        ret = n + Array(5 - octave).join(",");
    } else if (octave === 5) {
        ret = n.toLowerCase();
    } else if (octave > 5) {
        ret = n.toLowerCase() + Array(octave - 4).join("'");
    }
    return ret;
};

ABCXJS.Tab2Part.prototype.setStaffState = function ( staff ) {
    staff.hasToken = false;
    staff.st = (staff.linhas[0].pos < this.tabLines[staff.linhas[0].l].length ? 'waiting for data' : 'closed');
};

ABCXJS.Tab2Part.prototype.idStaff = function () {
    // remover comentarios
    var p = [], i = -1, open = true, cntBasses = -1, maior=0, maiorLinha=0;
    
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = null;
    this.trebleStaffs = { open: null, close: null};
    
    this.parsedLines[++this.currStaff] = new ABCXJS.Tab2PartLine();
    
    while(this.currLine < this.tabLines.length &&
            this.tabLines[this.currLine].trim().length && 
                this.startSyms.indexOf(this.tabLines[this.currLine].charAt(0)) >= 0 ) {
        var valid = true;
        switch( this.tabLines[this.currLine].charAt(0) ) {
            case '|':
                if( this.tabLines[this.currLine].match(/[ABCDFEGabcdefg]/) ){
                   p[++i] = { hasToken:false, bass:true, idBass: ++cntBasses, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   this.parsedLines[this.currStaff].basses[cntBasses]="";
                } else {
                   open = !open;
                   p[++i] = { hasToken:false, bass:false, open: open,  linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   if(open) {
                      this.trebleStaffs.open = p[i];
                   } else {
                      this.trebleStaffs.close = p[i];
                   }    
                }
                break;
            case '/':
                p[i].linhas.push({l:this.currLine, pos:0});
                break;
            case '+':
                valid = false;
                this.durationLine = this.currLine;
                break;
            case '%':
                valid = false;
                // ignora comentario
                break;
                
        }
        if(valid && maior < this.tabLines[this.currLine].length ) {
            maior = this.tabLines[this.currLine].length;
            maiorLinha = this.currLine;
        }
        
        this.currLine++;
    }
    
    // verifica o alinhamento das barras
    var k=0, l;
    while((l=(this.tabLines[maiorLinha].substr(k+1).indexOf("|")))>0) {
        k += l+1;
        for( var j = 0;  j < p.length;  j++ ) {
            var staff = p[j];
            for( var i = 0; i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( l.length > k && l.charAt(k) !== "|" ){
                    this.addWarning( 'Possível falta de sincronismo na pauta '+(this.currStaff+1)+', linha '+(j+1)+', coluna '+(k+1)+'. Barras desalinhadas.');
                }
            }
        }
    }
    
    return p;
};

ABCXJS.Tab2Part.prototype.posiciona = function(staffs) {
    var found = false;
    var qtd = 0;
    
    this.startColumn = this.endColumn;
    this.barEnding = false;
    
    // procura a primeira coluna vazia
    while( ! found ) {
        found = true;
        for( var j = 0;  found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn < l.length && this.spaces.indexOf( l.charAt(this.endColumn) ) < 0 ){
                    found = false;
                    this.endColumn ++;
                }
            }
        }
    }
    
    // procura a primeira coluna não-vazia
    this.endColumn ++;
    found = false;
    while( ! found  ) {
        for( var j = 0;  !found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; !found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn >= l.length || this.spaces.indexOf( l.charAt(this.endColumn) ) < 0 ){
                    if(l.charAt(this.endColumn) && this.barSyms.indexOf( l.charAt(this.endColumn) ) >= 0){
                        this.barEnding = true;
                    }
                    found = true;
                }
            }
        }
        if(!found){
            this.endColumn ++;
        }
    }
    
    if( this.durationLine && this.durationLine >= 0 ) {
        var dur = this.tabLines[this.durationLine].substr( this.startColumn,this.endColumn-this.startColumn).trim();
        this.columnDuration = dur.length > 0 ? dur : "";
    }
    
};

ABCXJS.Tab2Part.prototype.read = function(staffs) {
    var st = 0, ret = 0;
    for( var j = 0; j < staffs.length; j ++ ) {
        var source = staffs[j];

        switch( source.st ) {
            case "waiting for data":
                source.token = this.getToken(source);
                if( source.hasToken) {
                    source.st = (source.token.type === "bar") ? "waiting end of interval" : "processing";
                    ret = (source.token.type === "bar") ? 1 : 2;
                } else {
                    ret = 2;
                }    
                break;
            case "waiting end of interval":
                ret = 1;
                break;
            case "closed":
                ret = 0;
                break;
            case "processing":
                this.updateToken(source);
                ret = 2;
                break;
        }
        
        st = Math.max(ret, st);
    }
    
    return st;
};

ABCXJS.Tab2Part.prototype.getToken = function(staff) {
    var syms = "():|[]/";
    var qtd = staff.linhas.length;
    var afinal = false;
    var type = null;
    var lastChar = "";
    var tokens = [];
    var strToken = "";
    
    this.skipSyms(staff, this.spaces ); 
    
    for( var i = 0; i < qtd; i ++ ) {
        var token = "";
        var ll = staff.linhas[i];
        var found = false;
        while (ll.pos < Math.min( this.tabLines[ll.l].length, this.endColumn) && ! found ) {
            var c = this.tabLines[ll.l].charAt(ll.pos);
            if(  c !== ' ' && c !== '.' &&  c !== '-'  ) {
                token += c;
                ll.pos++;
            } else {
                if(syms.indexOf( token.charAt(0) ) >= 0 ) {
                   for( var j = 1; j < qtd; j ++ ) {
                     staff.linhas[j].pos  = ll.pos;
                   }
                   qtd = 1; // força a saida processando so a primeira linha
                } else {
                    lastChar += c;
                }
                found=true;
            }
        }
        if( token.trim().length > 0 ) {
            // gerar partitura convertendo para clubBR
            if( this.toClub && syms.indexOf( token.charAt(0) ) < 0  && token !== 'z' ) {
                if( staff.bass ) {
                    // flavio - transpose bass
                    switch(token) {
                        case 'C': token = 'F'; break;
                        case 'c': token = 'f'; break;
                        case 'D': token = 'G'; break;
                        case 'd': token = 'g'; break;
                        case 'E': token = 'A'; break;
                        case 'e': token = 'a'; break;
                        case 'F': token = 'B♭'; break;
                        case 'f': token = 'b♭'; break;
                        case 'G': token = 'C'; break;
                        case 'g': token = 'c'; break;
                        case 'A': token = 'D'; break;
                        case 'a': token = 'd'; break;
                    }
                } else {
                    //move para o botão imediatamente abaixo
                    var x = token.match(/^[0-9]*/g);
                    var a = token.replace( x[0], '' );
                    token = (parseInt(x[0])+1) + a;
                }
            }
            if( this.fromClub && syms.indexOf( token.charAt(0) ) < 0 && token !== 'z' ) {
                if( staff.bass ) {
                    // flavio - transpose bass
                    switch(token) {
                        case 'A': token = 'E'; break;
                        case 'a': token = 'e';  break;
                        case 'B♭': token = 'F'; break;
                        case 'b♭': token = 'f'; break;
                        case 'C': token = 'G'; break;
                        case 'c': token = 'g'; break;
                        case 'D': token = 'A'; break;
                        case 'd': token = 'a'; break;
                        case 'F': token = 'C'; break;
                        case 'f': token = 'c'; break;
                        case 'G': token = 'D'; break;
                        case 'g': token = 'd'; break;
                    }
                } else {
                    //move para o botão imediatamente abaixo
                    var x = token.match(/^[0-9]*/g);
                    var a = token.replace( x[0], '' );
                    token = (parseInt(x[0])-1) + a;
                }
            }
            
            tokens.push( token );
            strToken += token;
        }
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || this.spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            afinal = true;
        }
    }
    staff.hasToken = strToken.trim().length !== 0;
    //determina o tipo de token
    if( staff.hasToken  ) {
        if( syms.indexOf( strToken.charAt(0) )>= 0 ) {
            if(strToken.charAt(0)=== '(' || strToken.charAt(0)=== ')' ) {
                type='triplet';
            } else {
                type='bar';
                this.barAccidentals = [];
                this.barBassAccidentals = [];
                this.updateBarNumberOnNextNote = true;
            }
        } else {
            type = 'note';
            strToken = this.normalizeAcc(strToken);
            if( this.updateBarNumberOnNextNote ) {
                this.updateBarNumberOnNextNote = false;
                this.currBar ++;
            }
            
            if(tokens.length > 1) {
                strToken = '['+strToken+']';
            }
        }
    }   
    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseFloat(this.columnDuration);
    }
    
    return { str: strToken, aStr: tokens, duration: dur, barNumber: this.currBar, type:type, afinal: afinal, added: false, lastChar: lastChar };
};

ABCXJS.Tab2Part.prototype.normalizeAcc = function(str) {
    var ret = str.charAt(0);
    if(str.length > 1) {
        ret += str.substr(1).replace(new RegExp('#', 'g'),'♯').replace(new RegExp('b', 'g'),'♭');
    }
    return ret;
};

ABCXJS.Tab2Part.prototype.updateToken = function(staff) {
    var afinal = false;
    var qtd = staff.linhas.length;
    for( var i = 0; i < qtd; i ++ ) {
        var ll = staff.linhas[i];
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || this.spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            afinal = true;
        }
    }    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseFloat(this.columnDuration);
    }
    staff.token.duration += dur;
    
    if( afinal ){
        staff.token.afinal = true;
    }
};

ABCXJS.Tab2Part.prototype.skipSyms = function( staff, syms ) {
    for( var i = 0; i < staff.linhas.length; i ++ ) {
        while (staff.linhas[i].pos < 
                Math.min( this.tabLines[staff.linhas[i].l].length, this.endColumn)
                  && syms.indexOf(this.tabLines[staff.linhas[i].l].charAt(staff.linhas[i].pos)) >= 0) {
            staff.linhas[i].pos++ ;
        }
    }
};

ABCXJS.Tab2Part.prototype.getButton = function( b ) {
    if( b === 'x' || b ===  ' ' || b ===  '' || !this.keyboard ) return null;
    var kb = this.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};

ABCXJS.Tab2Part.prototype.checkBass = function( b, opening ) {
    if( b === '-->' || !this.keyboard ) return false;
    if( b === 'z' ) return true;
    var kb = this.keyboard;
    var nota = kb.parseNote(b, true );
    for( var j = kb.keyMap.length; j > kb.keyMap.length - 2; j-- ) {
        for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
            var tecla = kb.keyMap[j-1][i];
            if( (opening && tecla.openNote.key === nota.key)
                || (!opening && tecla.closeNote.key === nota.key) ) {
                return opening ? tecla.openNote: tecla.closeNote.key;      
            } 
        }   
    }
    return false;
};

ABCXJS.Tab2Part.prototype.toHex = function( s ) {
    
    if( s === 'z' || s === '>') return s;
    
    var p = s.indexOf( '\'' );
    var s1 = s.substr( 0, p );
    var s2 = s.substr( p );

    return ( p < 0 ) ? parseInt(s).toString(16) : parseInt(s1).toString(16) + s2;
};

ABCXJS.Tab2Part.prototype.getKeyAccOffset = function(note)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < this.keyAcidentals.length; a ++) {
      if( this.keyAcidentals[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.keyAcidentals[a].acc;
      }
  }
  return null;    
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function toDecimalNote(str) {
    var r;
    switch (str) {
        case '>':
            r = ' '; // flavio
            break;
        case 'z':
            r = 'z';
            break;
        default:
            r = parseInt(str, 16);
    }
    return r;
};

function regexp_match(str,re) {
    var m, n=[];

    while ((m = re.exec(str)) !== null) {
        n.push(m);
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
    }
    return n;
}
;

// left padding s with c to a total of n chars
function lpad(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s = c + s;
  }
  return s;
}
 
// right padding s with c to a total of n chars
function rpad(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}
 
if (!window.ABCXJS)
    window.ABCXJS = {};

ABCXJS.Part2TabLine = function () {
    this.basses = "";
    this.sparring = "";
    this.close = [""];
    this.open = [""];
    this.duration ="";
    this.pos = 0;
};

ABCXJS.Part2Tab = function () {
    
    this.validBars = { 
          "|"   : "bar_thin"
        , "||"  : "bar_thin_thin"
        , "[|"  : "bar_thick_thin"
        , "|]"  : "bar_thin_thick"
        , ":|:" : "bar_dbl_repeat"
        , ":||:": "bar_dbl_repeat"
        , "::"  : "bar_dbl_repeat" 
        , "|:"  : "bar_left_repeat"
        , "||:" : "bar_left_repeat"
        , "[|:" : "bar_left_repeat"
        , ":|"  : "bar_right_repeat"
        , ":||" : "bar_right_repeat"
        , ":|]" : "bar_right_repeat"
    };
    
    this.validBasses = 'abcdefgABCDEFGz>';
    this.startSyms = "[|:";
    this.spaces = "\ \t";
    
    this.init();
    
    this.addWarning = function ( msg ) {
        this.warnings.push(msg);
    };
    
    this.getWarnings = function () {
        return this.warnings.join('<br>');
    };
};

ABCXJS.Part2Tab.prototype.init = function () {
    this.partText;
    this.partLines;
    this.parsedLines = [];
    this.currLine = 0;
    this.tabText = "";
    this.currBar = 0;
    this.warnings = [];
    this.inTab = false;
};

ABCXJS.Part2Tab.prototype.parse = function (text, keyboard ) {
    this.init();
    this.partText   = text;
    this.partLines  = this.extractLines();
    this.keyboard  = keyboard;
    this.hasErrors = false;
    this.title = undefined;
    
    while((!this.hasErrors) && this.currLine < this.partLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
    
    return this.tabText;
};

ABCXJS.Part2Tab.prototype.extractLines = function () {
    var v = this.partText.split('\n');
    v.forEach( function(linha, i) { 
        var l = linha.split('%');
        v[i] = l[0].trim(); 
    } );
    return v;
};

ABCXJS.Part2Tab.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.partLines[this.currLine].match(/^([ACFKLMNTQVZ]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        var key = this.partLines[this.currLine].match(/^([ACFKLMNTQVZ]\:)/g);
        switch( key[0] ) {
            case 'V:': 
                 var x = header[0].match(/accordionTab/g);
                 if( x !== null ) {
                    this.inTab = true;
                 }
                 break;
            case 'T:': 
                if(!this.title)
                    this.title = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                 break;
            case 'K:': 
                var k = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                header[0] = 'K:' + k;
                this.keyAcidentals = ABCXJS.parse.parseKeyVoice.standardKey(k);
                break;
        }
        if(key[0] !== 'V:' )  {
           this.addLine( header[0] );
        }  
    } else {
        if( this.inTab ) {
           var tabL =this.parseTab(); 
           this.addLine( tabL.basses);
           for( var r =0; r <tabL.close.length; r++){
               this.addLine( tabL.close[r]);
           }
           for( var r =0; r <tabL.open.length; r++){
               this.addLine( tabL.open[r]);
           }
           this.addLine( tabL.duration+'\n');
        }
    }
};

ABCXJS.Part2Tab.prototype.parseTab = function () {
    var line = { str:this.partLines[this.currLine], posi:0, pos:0, tokenType:1,currToken:''};
    var tabline = new ABCXJS.Part2TabLine();
    
    if( line.length === 0 ) {
        this.hasErrors = true;
        return;
    }
    
    var cnt = 1000; // limite de saida para o caso de erro de alinhamento do texto
    while( line.tokenType > 0 && --cnt ) {
        
        this.getToken(line);

        switch(line.tokenType){
            case 1: // bar
                this.addBar(tabline, line.currToken);
                break;
            case 2: // note
                this.addNotes(tabline, line);
                break;
        }
    } 
    
    if( line.tokenType < 0 ) {
        this.addWarning('Encontrados simbolos inválidos na linha ('+this.currLine+','+line.posi+') .');
        this.hasErrors = true;
    }
    if( ! cnt ) {
        this.addWarning('Não pude processar tablatura após 1000 ciclos. Possivel desalinhamento de texto.');
        this.hasErrors = true;
    }
    return tabline;
};

ABCXJS.Part2Tab.prototype.addBar = function (tabline, token) {
    
    var l = token.length;
    
    tabline.basses += token + ' ';
    for(var r=0; r < tabline.close.length; r++){
        tabline.close[r] += token + ' ';
    }
    for(var r=0; r < tabline.open.length; r++){
        tabline.open[r] += token + ' ';
    }
    
    if(tabline.pos===0){
        tabline.sparring += '/' + rpad( ' ', ' ', l);
        tabline.duration = '+'  + rpad( ' ', ' ', l);
    } else {
        tabline.sparring += token + ' ';
        tabline.duration += rpad( ' ', ' ', l+1);
    }
    
    tabline.pos +=( l+1);
    
};

ABCXJS.Part2Tab.prototype.addNotes = function(tabline, line) {
    
    var parsedNotes = line.parsedNotes;
//    if( parsedNotes.empty ){
//      var x =1;  
//    };
    
    if( parsedNotes.empty &&  (line.parsedNotes.bas.trim().length === 0 || line.parsedNotes.currBar !== line.lastParsedNotes.currBar )) {
        line.lastParsedNotes.currBar = line.parsedNotes.currBar;
        var lastNotes = line.lastParsedNotes.notes;
        if(parsedNotes.closing) {
            var i = tabline.close[0].lastIndexOf( lastNotes[0] ) + line.lastParsedNotes.maxL;
            for(var r=0; r < tabline.close.length; r++){
               var str = tabline.close[r];
                if(r<parsedNotes.notes.length) {
                    var n = str.lastIndexOf(lastNotes[r]);
                    tabline.close[r] = str.slice(0, n) + str.slice(n).replace(lastNotes[r],lastNotes[r]+'-');
                } else {
                    tabline.close[r] = str.slice(0, i) +' '+ str.slice(i); 
                }
            }
            for(var r=0; r < tabline.open.length; r++){
                var str = tabline.open[r];
                tabline.open[r] = str.slice(0, i) +' '+ str.slice(i); 
            }
        } else {
            var i = tabline.open[0].lastIndexOf( lastNotes[0] ) + line.lastParsedNotes.maxL;
            for(var r=0; r < tabline.open.length; r++){
               var str = tabline.open[r];
                if(r<parsedNotes.notes.length) {
                    var n = str.lastIndexOf(lastNotes[r]);
                    tabline.open[r] = str.slice(0, n) + str.slice(n).replace(lastNotes[r],lastNotes[r]+'-');
                } else {
                    tabline.open[r] = str.slice(0, i) +' '+ str.slice(i); 
                }
            }
            for(var r=0; r < tabline.close.length; r++){
                 var str = tabline.close[r];
                tabline.close[r] = str.slice(0, i) +' '+ str.slice(i); 
            }
        }
        tabline.duration = tabline.duration.slice(0, i) +' '+ tabline.duration.slice(i); 
        tabline.sparring = tabline.sparring.slice(0, i) +' '+ tabline.sparring.slice(i); 
        tabline.basses = tabline.basses.slice(0, i) +' '+ tabline.basses.slice(i); 
        line.parsedNotes = window.ABCXJS.parse.clone(line.lastParsedNotes);
        parsedNotes.notes = lastNotes;
        parsedNotes.maxL = Math.max( parsedNotes.maxL, line.lastParsedNotes.maxL );
    }
    
    var l = parsedNotes.maxL+1;
    
    tabline.basses += parsedNotes.bas+ rpad( ' ', ' ', l-parsedNotes.bas.length);
    
    if( parsedNotes.closing) {
        while (tabline.close.length < parsedNotes.notes.length) {
           tabline.close.push(window.ABCXJS.parse.clone(tabline.sparring) );
        }
        for(var r=0; r < tabline.close.length; r++){
            if(r<parsedNotes.notes.length) {
                tabline.close[r] += parsedNotes.notes[r] + rpad( ' ', ' ', l-parsedNotes.notes[r].length);
            } else {
                tabline.close[r] += rpad( ' ', ' ', l);
            }
        }
        for(var r=0; r < tabline.open.length; r++){
            tabline.open[r] += rpad( ' ', ' ', l);
        }
        
    }    else {
        while (tabline.open.length < parsedNotes.notes.length) {
           tabline.open.push(window.ABCXJS.parse.clone(tabline.sparring) );
        }
        for(var r=0; r < tabline.open.length; r++){
            if(r<parsedNotes.notes.length) {
                tabline.open[r] += parsedNotes.notes[r] + rpad( ' ', ' ', l-parsedNotes.notes[r].length);
            } else {
                tabline.open[r] += rpad( ' ', ' ', l);
            }
        }
        for(var r=0; r < tabline.close.length; r++){
            tabline.close[r] += rpad( ' ', ' ', l);
        }
        
    }
    tabline.sparring += rpad( ' ', ' ', l);
    
    if( parsedNotes.duration === "1" ||  parsedNotes.duration === "") {
        tabline.duration += rpad( ' ', ' ', l);
    } else {
        tabline.duration += parsedNotes.duration + rpad( ' ', ' ', l-parsedNotes.duration.length);
    }
    tabline.pos += l;
};

ABCXJS.Part2Tab.prototype.getNotes = function (strBass, strNote, closing) {
    var t, n = [], d, nn, b, l = 0;

    //parse do baixo
    b = strBass.match(/(A|B|C|D|E|F|G|z|>)[(♭|♯)]{0,1}/gi);
    if (b.length < 1) {
        return null;
    } else {
         b[0] = b[0]=== '>' ? ' ': b[0]; // flavio
        l = Math.max(l, b[0].length);
    }

    //multiplas notas?
    t = regexp_match(strNote, /\[(.*?)\](\d{0,1}[\.|\/]{0,1}\d{0,2})/gi);
    if (t.length === 1) {
        d = t[0][2];
        l = Math.max(l, d.length);

        nn = regexp_match(t[0][1], /(\>|z|[a-f]|[0-9])(\'{0,})/gi);
        nn.forEach(function (e) {
            var v = toDecimalNote(e[1]) + e[2];
            n.push(v);
            l = Math.max(l, v.length);
        });

    } else {
        //nota única e duração
        t = regexp_match(strNote, /(\>|z|[a-f]|[0-9])(\'{0,})(\d{0,1}[\.|\/]{0,1}\d{0,2})/gi);
        if (t.length === 1) {

            n.push(toDecimalNote(t[0][1]) + t[0][2]);
            l = Math.max(l, n[0].length);
            d = t[0][3];
            l = Math.max(l, d.length);
        } else {
            return null;
        }
    }
    
    var pn = {bas: b[0], notes: n, duration: d, closing: closing, maxL: l, currBar: this.currBar, empty:false };
    var checkEmpty = ' '; //pn.bas;
    pn.notes.forEach( function(e) { checkEmpty+=e;});
    if( checkEmpty.trim().length === 0 ) {
       pn.empty = true; 
    }
    
    return pn;
};

ABCXJS.Part2Tab.prototype.parseNotes = function( token) {
    var v,notes;
    if( token.indexOf('+')>0){
        v= token.split('+');
       notes=this.getNotes(v[0],v[1], true);
    } else {
        v= token.split('-');
        notes=this.getNotes(v[0],v[1], false );
    }
    return notes;
};

ABCXJS.Part2Tab.prototype.getToken = function(line) {
    var found = false;
    var c = '';
    
    this.skipSyms(line, this.spaces );
    
    line.currToken = '';
    line.tokenType = 0;
    line.posi = line.pos;
    
    while (  line.pos < line.str.length && ! found ) {
        c = line.str.charAt(line.pos);
        
        if(c===' ')  {
            found=true; continue;
        }
        
        if( line.tokenType === 0 ) {
            if( this.validBars[ c ]  ) {
                line.tokenType = 1; // bar
            } else if(this.validBasses.indexOf( c )>=0)  {
                line.tokenType = 2; // note
            } else if(this.startSyms.indexOf( c )<0)  {
                line.tokenType = -1;
            }
        } else {
            switch(line.tokenType) {
                case 1:
                    if(!c.match(/(\||\d|\:|\])/g)) {
                        found=true; continue;
                    }
                    break;
                case 2:
                    if(c.match(/(\||\:)/g)){
                        found=true; continue;
                    }
                    break;
            }
        }
        line.currToken += c;
        line.pos ++;
        if( line.tokenType === 1 ) {
            this.currBar++;
        }
    }   
    
    if(found && line.tokenType===2) {
        if( line.parsedNotes !== undefined && ! line.parsedNotes.empty ) {
            line.lastParsedNotes = line.parsedNotes;
        }
        line.parsedNotes = this.parseNotes( line.currToken ) ;
        if( line.parsedNotes === null ) {
            line.tokenType=-1;
        }
    }
};

ABCXJS.Part2Tab.prototype.skipSyms = function( linha, syms ) {
    while (linha.pos < linha.str.length
              && syms.indexOf(linha.str.charAt(linha.pos)) >= 0) {
        linha.pos++ ;
    }
};

ABCXJS.Part2Tab.prototype.skipEmptyLines = function () {
    while(this.currLine < this.partLines.length) {
        if(  this.partLines[this.currLine].charAt(0) !== '%' && this.partLines[this.currLine].match(/^[\s\r\t]*$/) === null ) {
           return true;
        };
        this.currLine++;
    }
    return false;
};

ABCXJS.Part2Tab.prototype.addLine = function (ll) {
    this.tabText += ll + '\n';
};
