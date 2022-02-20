/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
          
if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

window.dataLayer = window.dataLayer || [];

SITE.ga = function () {

    if( arguments[0] === 'set' && arguments[1] === 'page_path') {
        SITE.root = arguments[2]
    }
    
    {
        //debug only
        //console.log( 'gtag: ' + arguments[0] +', '+ arguments[1] +', '+  JSON.stringify(arguments[2], null, 4) )
        //return;
    }

    if( gtag && ( window.location.href.indexOf( 'diatonicmap.com.br') >= 0 || window.location.href.indexOf( 'androidplatform') >= 0 )
           && SITE.getVersion('mainSITE', '' ) !== 'debug' 
           && SITE.getVersion('mainSITE', '' ) !== 'unknown' ) {
               
            //console.log("GA desabilitado!");
            if(SITE.debug)
                console.log( 'App is in Debug mode'  )
            else{
                if( !SITE.gtagInitiated ) {
                    gtag('js', new Date());
                    gtag('config', 'UA-62839199-4');
                    SITE.gtagInitiated = true;
                }
                gtag(arguments[0],arguments[1],arguments[2]);
            }
    } else {
        console.log('Funcao gtag não definida.');
    }
};
          
SITE.findGetParameter = function(parameterName) {
    var result = null,
        tmp = [];
    var items = window.location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
};

SITE.getDate = function (){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    return yyyy*10000+mm*100+dd;
};

SITE.getVersion = function(tag, label) {
    var el = document.getElementById(tag);
    if(!el) return 'unknown';
    var res = el.src.match(/\_[0-9]*\.[0-9]*[\.[0-9]*]*/g);
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
    var salvar = false;
    //FILEMANAGER.removeLocal('diatonic-map.site.properties' ); // usdo para forçar reset da propriedades
    
    try{
        SITE.properties = JSON.parse( FILEMANAGER.loadLocal('diatonic-map.site.properties' ) ); 
    } catch(e) {
        waterbug.log( 'Could not load the properties.');
        waterbug.show( 'Could not save the properties');
        SITE.ga( 'event', 'html5storage', { 
            'event_category': 'Error'  
           ,'event_label': 'loadingLocal'
           ,'non_interaction': true
        });
    }
    
    var ver = SITE.getVersion('mainSITE', '' );
    
    if( ! SITE.properties ) {
        
        SITE.ResetProperties();
        
    } else  if( ver === 'debug' ) {
        
        SITE.properties.options.showConsole = true;
        
    } else if( ! SITE.properties.version || SITE.properties.version === 'debug' || parseFloat( SITE.properties.version ) < parseFloat( ver )  ) {
        
        SITE.properties.version = ver;
        salvar = true;
        
    }
    
    if( !SITE.properties.known_languages ) {

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
        SITE.properties.options.autoRefresh = false;
        SITE.properties.options.keyboardRight = false;
        SITE.properties.options.suppressTitles = false;
        
        salvar = true;
        
    }

    if( ! SITE.properties.studio.media ) {
        SITE.properties.studio.media = {
            visible: false
            ,top: "20px"
            ,left: "1200px"
            ,width: 100
            ,height: 200
        };
        SITE.properties.partGen.media = {
            visible: false
            ,top: "20px"
            ,left: "1200px"
            ,width: 100
            ,height: 200
        };
        
        salvar = true;
    }

    if(!SITE.properties.partEdit) {
        SITE.properties.partEdit = {
             media: {
                visible: false
                ,top: "20px"
                ,left: "1200px"
                ,width: 100
                ,height: 200
            } 
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
        
        salvar = true;
    }

    //hardcode - anti-pipoca-roxa
    SITE.properties.options.tabFormat = 0;

    SITE.properties.options.lyrics=true;
    SITE.properties.options.fingering=true;
    SITE.properties.options.rowsNumbered=false;

    if( SITE.properties.options.tabFormat === undefined ) {
        salvar = true;
        SITE.properties.options.tabFormat = 0;
    }
    if( SITE.properties.options.tabShowOnlyNumbers === undefined ) {
        salvar = true;
        SITE.properties.options.tabShowOnlyNumbers=false;
    }
    
    if( salvar ) {
        SITE.SaveProperties();
    }
    
};

SITE.SaveProperties = function() {
    try{
        FILEMANAGER.saveLocal('diatonic-map.site.properties', JSON.stringify(SITE.properties));
    } catch(e) {
        waterbug.log( 'Could not save the properties');
        waterbug.show( 'Could not save the properties');
        SITE.ga( 'event', 'html5storage', { 
            'event_category': 'Error'  
           ,'event_label': 'savingLocal'
           ,'non_interaction': true
        });
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
        ,keyboardRight: false
        ,suppressTitles: false
        ,tabFormat: 0
        ,tabShowOnlyNumbers: false
    };

    SITE.properties.mediaDiv = {
         visible: true
        ,top: "20px"
        ,left: "1200px"
        ,width: 100
        ,height: 200
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

    SITE.properties.partEdit = {
         media: {
            visible: false
            ,top: "20px"
            ,left: "1200px"
            ,width: 100
            ,height: 200
        } 
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
    
    SITE.properties.partGen = {
          showABCText:false
        , convertFromClub:false
        , convertToClub:false
        , media: {
            visible: false
            ,top: "20px"
            ,left: "1200px"
            ,width: 100
            ,height: 200
        } 
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
        , media: {
            visible: false
            ,top: "20px"
            ,left: "1200px"
            ,width: 100
            ,height: 200
        } 
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
    
    FILEMANAGER.saveLocal( 'ultimaTablaturaEditada', '' );
    FILEMANAGER.saveLocal( 'ultimaPartituraEditada', '' );
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
                case 'DIV': 
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
    if( msg.substr( 27, 7 ) === 'CORONA_' ) return;
    if( msg.substr( 27, 7 ) === 'HOHNER_' ) return;
    if( msg.substr( 27, 6 ) === 'GAITA_' ) return;
    if( msg.substr( 27, 11 ) === 'CONCERTINA_' ) return;
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

SITE.Media = function( parent, btShowMedia, props ) {
    var that = this;
    
    this.Div = parent || null;
    this.proportion = 0.55666667;
    this.youTubeURL = false;
    this.properties = props;
    
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
              , alternativeResize: true
              , top: this.properties.top
              , left: this.properties.left } 
          , {listener: this, method: 'callback'}
    );
    
};

SITE.Media.prototype.callback = function( e ) {
    switch(e) {
        case 'RESIZE':
            this.resize();
            var m = this.mediaWindow.dataDiv;
            this.properties.width = m.clientWidth;
            this.properties.height = m.clientHeight;
            SITE.SaveProperties();
            break;
        case 'MOVE':
            var m = this.mediaWindow.topDiv;
            this.properties.top = m.style.top;
            this.properties.left = m.style.left;
            SITE.SaveProperties();
            break;
        case 'OPEN':
            this.properties.visible = true;
            SITE.ga('event', 'page_view', {
                page_title: this.tabTitle
               ,page_path: SITE.root+'/media'
            })        
            SITE.SaveProperties();
            this.mediaWindow.setVisible(true);
            this.resize();
            this.posiciona();
            if(this.showMediaButton)
                this.showMediaButton.style.display = 'none';
            break;
        case 'CLOSE':
            this.pause();
            this.properties.visible = false;
            SITE.SaveProperties();
            if(this.showMediaButton) {
                this.mediaWindow.setVisible(false);
                this.showMediaButton.style.display = 'block';
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
        
        var width = 300;
        var maxTitle=17;
        
        if( url  !== this.url ) {
            this.url = url;
            this.tabTitle = tab.abc.metaText.title;
            if(this.properties.width > 100 ) {
                width = this.properties.width;
                maxTitle = Math.round((width-100)/11); // aproximação
            } else if( window.innerWidth >= 1200 )  {
                width = 600;
                maxTitle=46;
            } else if( window.innerWidth >= 950 ) { 
                width = 400;
                maxTitle=27;
            }
            
            var height = width * this.proportion;
            
            this.mediaWindow.dataDiv.style.width = width + 'px'; 
            this.mediaWindow.topDiv.style.width = width + 'px'; 
            this.mediaWindow.dataDiv.style.height = height + 'px';
            this.mediaWindow.topDiv.style.height = height + 'px'; 
            
            if( ! this.tabDiv ) {
                this.tabDiv = document.createElement('div');
                this.tabDiv.className='media-tabs';
                this.mediaWindow.topDiv.appendChild(this.tabDiv);
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
                this.isPDF = (aUrl[r].match(/.*pdf/)!== null);
                
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
                this.embed.style.height = ( this.youTubeURL? '100%' : (this.isPDF? 'calc(100% - 4px)': 'auto' ) );
                
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
                this.resize();
                
                //this.currTab.div.addEventListener('click', function() {alert(that.currTab.tit);} );
                //var iframe = this.currTab.div.getElementsByTagName("iframe")[0];
                //this.mediaWindow.dataDiv.addEventListener('focus', function() {alert(that.currTab.tit);} );
                
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
            this.showMediaButton.style.display = (this.properties.visible ? 'none' : 'inline');

        this.mediaWindow.setVisible( this.properties.visible );
        
        if( this.properties.visible ) {
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

    if( ! this.mediaWindow.topDiv || this.mediaWindow.topDiv.style.display === 'none' ) 
        return;
    
    //var w = window.innerWidth;
    var w = document.body.clientWidth
            || document.documentElement.clientWidth
            || window.innerWidth;

    // linha acrescentada para tratar layout da app
    w = Math.min(w, this.mediaWindow.parent.clientWidth);
    
    var k = this.mediaWindow.topDiv;

    var x = parseInt(k.style.left.replace('px', ''));
    var xi = x;
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 30));
    }
    
    if(x < 0) x = 10;
    
    if( x !== xi  ) {
        k.style.left = x+"px";
        this.properties.left = x+"px";
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


if (!window.SITE)
    window.SITE = {};

SITE.AppView = function (app, interfaceParams, playerParams) {
    
    var that = this;

    this.app = app;
    this.isApp = true;
    this.parserparams = {};

    this.ypos = 0; // controle de scroll
    this.lastStaffGroup = -1; // controle de scroll
    this.lastYpos = 0; // controle de scroll
    
    var canvas_id = 'canvasDiv';
   //var warnings_id = 'warningsDiv';

    this.warnings = [];
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.studioDiv
        , null
        , {
            translator: SITE.translator, statusbar: false, draggable: false, 
            top: "0", left: "0", width: '100%', height: "100%", title: 'EstudioTitle'
          }
        , {listener: this, method: 'appViewCallBack'}
    );


    this.keyboardWindow = new DRAGGABLE.ui.Window( 
        interfaceParams.keyboardDiv
       ,[  'rotate', 'globe']
       ,{ title: '', translator: SITE.translator, statusbar: false, draggable: false, 
          top: "3px", left: "1px"
        } 
       ,{listener: this, method: 'keyboardCallback'}
    );

    // flavio e a feiura - inicio

        this.keyboardWindow.extras = document.createElement('div');
        this.keyboardWindow.extras.style.display = 'none';
        this.keyboardWindow.extras.innerHTML = 
           '<button id="rotateBtnExtra" data-translate="rotate" ><i class="ico-rotate" ></i></button>\
            <button id="globeBtnExtra"  data-translate="globe" ><i class="ico-world" ></i></button>'
    
        this.keyboardWindow.extras.className = 'keyboard-btn-group';
        this.keyboardWindow.topDiv.appendChild(this.keyboardWindow.extras);
    
        this.rotateBtnExtra = document.getElementById("rotateBtnExtra");
        this.globeBtnExtra = document.getElementById("globeBtnExtra");
    
        this.rotateBtnExtra.addEventListener("click", function (evt) {
            evt.preventDefault();
            that.keyboardCallback('ROTATE');
        }, false);
    
        this.globeBtnExtra.addEventListener("click", function (evt) {
            evt.preventDefault();
            that.keyboardCallback('GLOBE');
        }, false);
        
        this.keyboardWindow.imagem  = document.createElement('div');
        this.keyboardWindow.imagem.style.display = 'none';
        this.keyboardWindow.imagem.style.zIndex = '5000';
        this.keyboardWindow.imagem.className = 'circular';
        this.keyboardWindow.topDiv.appendChild(this.keyboardWindow.imagem );

        SITE.translator.translate( this.keyboardWindow.extras );

    
    // flavio e a feiura - fim

    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';

    if (interfaceParams.generate_tablature) {
        if (interfaceParams.generate_tablature === 'accordion') {
            this.accordion = new window.ABCXJS.tablature.Accordion( 
                  interfaceParams.accordion_options 
                , SITE.properties.options.tabFormat 
                ,!SITE.properties.options.tabShowOnlyNumbers );
            if (interfaceParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(interfaceParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + interfaceParams.generate_tablature + ' não suportada!');
        }
    }

    this.accordion.setRenderOptions({
        draggable: false
       ,show: SITE.properties.studio.keyboard.visible
       ,transpose: SITE.properties.studio.keyboard.transpose
       ,mirror: SITE.properties.studio.keyboard.mirror
       ,scale: 0.85
       ,label: SITE.properties.studio.keyboard.label
    });

    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'controlDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group draggableToolBarApp' );
    
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.studioControlDiv).innerHTML;
    document.getElementById(interfaceParams.studioControlDiv).innerHTML = "";

    this.controlDiv.style.borderBottom = "1px solid rgba(255, 153, 34, 0.4)"
    this.Div.topDiv.style.borderLeft = "1px solid rgba(255, 153, 34, 0.4)"
    
    this.media = new SITE.Media( this.Div.dataDiv, interfaceParams.btShowMedia, SITE.properties.studio.media ); 

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", interfaceParams.studioCanvasDiv );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv" );
   
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", canvas_id);
    this.canvasDiv.setAttribute("class", "canvasDiv" );

    this.studioCanvasDiv.appendChild(this.canvasDiv);
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);
    
    this.renderedTune.div = this.canvasDiv;
   
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
    this.backButton = document.getElementById(interfaceParams.backBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);

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

    this.backButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.app.closeAppView();
    }, false);

    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showKeyboard();
        that.keyboardWindow.resize();
        that.Div.resize();
        that.resize();
    }, false);

    if(!this.isApp){
    
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
        
    }

    this.printButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.printPreview(
            that.renderedTune.div.innerHTML, 
            ["#topBar","#appDiv", "#keyboardDiv", "#studioDiv" ], 
            that.renderedTune.abc.formatting.landscape
        );
    }, false);

    this.lyricsButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if(that.midiPlayer.playing) that.stopPlay();
        //window.setTimeout(function(){
            SITE.properties.options.lyrics = !SITE.properties.options.lyrics;
            that.parserparams.hideLyrics = !SITE.properties.options.lyrics;
            that.setLyricsIcon();
            that.fireChanged(0, {force:true, showProgress:true } );
        //}, 0 );
    }, false);

    this.fingeringButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if(that.midiPlayer.playing) that.midiPlayer.stopPlay();
        //window.setTimeout(function(){
            SITE.properties.options.fingering = !SITE.properties.options.fingering;
            that.parserparams.hideFingering = !SITE.properties.options.fingering;
            that.setFingeringIcon();
            that.fireChanged(0, {force:true, showProgress:true } );
        //}, 0 );
    }, false);

    this.tabformatButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if(that.midiPlayer.playing) that.midiPlayer.stopPlay();
        //window.setTimeout(function(){
            SITE.properties.options.rowsNumbered = !SITE.properties.options.rowsNumbered;
            that.parserparams.ilheirasNumeradas = SITE.properties.options.rowsNumbered;
            that.fireChanged(0, {force:true, showProgress:true } );
        //}, 0 );
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
        window.setTimeout(function(){ that.startPlay( 'normal' );}, 0 );
    }, false);

    this.stopButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        if(that.currentPlayTimeLabel)
           that.currentPlayTimeLabel.innerHTML = "00:00";
        that.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.currentPlayTimeLabel.innerHTML = "00:00";
        that.stopPlay();
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
            min: 25, max: 200, start:100, step:25, speed:100, color: 'white', bgcolor:'red' /*'#ff9922'*/, size:{w:140, h:35, tw:60},
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
    };

    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    this.midiPlayer.defineCallbackOnPlay( this.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( this.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( this.playerCallBackOnScroll );
    
};

SITE.AppView.prototype.setup = function( tab, accordionId) {
    
    this.accordion.loadById(accordionId);
    
    this.renderedTune.abc = tab.abc;
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    
    this.changePlayMode(SITE.properties.studio.mode);
    this.setBassIcon();
    this.setTrebleIcon();
    this.setTimerIcon( 0 );
    
    this.setVisible(true);
    this.setKeyboardDetails();

    this.fireChanged(0, {force:true} );
    this.studioCanvasDiv.scrollTop = 0;

    this.Div.setTitle( tab.title );
    this.Div.setSubTitle( '- ' + this.accordion.getTxtModel() + ' ' +  this.accordion.getTxtTuning() );

    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );

    this.showKeyboard(SITE.properties.studio.keyboard.visible);
    
    this.keyboardWindow.resize();
    this.Div.resize();
    this.resize();

    SITE.translator.translate( this.Div.topDiv );
};

SITE.AppView.prototype.resizeLeft = function( ) {
    
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

    var w = (winW - 2 ); 
    var h = (winH - 4 ); 
    var l = SITE.properties.studio.keyboard.visible? this.keyboardWindow.topDiv.clientWidth+1 : 0;

    this.keyboardWindow.topDiv.style.top=0;
    this.keyboardWindow.topDiv.style.left=0;
    this.keyboardWindow.topDiv.style.height = Math.max(h,200) +"px";

    this.Div.topDiv.style.top=0;
    this.Div.topDiv.style.left= l+"px";
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w-l,400) +"px";
   
    var w = 0, e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";

    this.media.posiciona();
    
    (this.ps) && this.ps.update();
    
};

SITE.AppView.prototype.resizeRight = function( ) {
    
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var w = (winW - 2 ); 
    var h = (winH - 4 ); 
    var l = SITE.properties.studio.keyboard.visible? this.keyboardWindow.topDiv.clientWidth+1 : 0;
        
    this.keyboardWindow.topDiv.style.top=0;
    this.keyboardWindow.topDiv.style.left= (w-l+1)+"px";
    this.keyboardWindow.topDiv.style.height = Math.max(h,200) +"px";

    this.Div.topDiv.style.top=0;
    this.Div.topDiv.style.left=0;
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w-l,400) +"px";
    
    var w = 0, e = 0;
    var c = this.controlDiv.clientHeight;
    var t = this.Div.dataDiv.clientHeight;
    
    this.studioCanvasDiv.style.height = t-(w+e+c+6) +"px";

    this.media.posiciona();
    
    (this.ps) && this.ps.update();
    
};

SITE.AppView.prototype.showKeyboard = function(show) {
    SITE.properties.studio.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.studio.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.studio.keyboard.visible;
    
    if(SITE.properties.studio.keyboard.visible) {
        this.keyboardWindow.setVisible(true);
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        this.showMapButton.innerHTML = '<i class="ico-keyboard" ></i>';
    } else {
        this.accordion.render_opts.show = false;
        this.keyboardWindow.setVisible(false);
        this.showMapButton.innerHTML = '<i class="ico-keyboard" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                                         '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};

SITE.AppView.prototype.setKeyboardDetails = function( ) {

    this.keyboardWindow.imagem.innerHTML = 
        '<img src="'+this.app.accordion.loaded.image+'" title="' +
        this.app.accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '">';

    if( SITE.properties.options.keyboardRight )
        this.resize = this.resizeRight;
    else    
        this.resize = this.resizeLeft;
    
    if( SITE.properties.options.suppressTitles ) {
        this.keyboardWindow.imagem.style.display='inline';
        this.keyboardWindow.extras.style.display='inline';
    } else{
        this.keyboardWindow.imagem.style.display='none';
        this.keyboardWindow.extras.style.display='none';
    }

    this.Div.setMenuVisible(!SITE.properties.options.suppressTitles);
    this.keyboardWindow.setMenuVisible(!SITE.properties.options.suppressTitles);
    this.keyboardMirrorElements()
}

SITE.AppView.prototype.keyboardMirrorElements = function( e ) {

    if (this.keyboardWindow.extras) {
        if(SITE.properties.studio.keyboard.mirror){
            this.keyboardWindow.extras.style.right = '';
            this.keyboardWindow.extras.style.left = '5px';
            this.keyboardWindow.imagem.style.right = '';
            this.keyboardWindow.imagem.style.left = '25px';
        } else{
            this.keyboardWindow.extras.style.right = '5px';
            this.keyboardWindow.extras.style.left = '';
            this.keyboardWindow.imagem.style.right = '25px';
            this.keyboardWindow.imagem.style.left = '';
        }
    }
}

SITE.AppView.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            SITE.properties.studio.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.studio.keyboard.mirror = this.accordion.render_opts.mirror;

            this.keyboardMirrorElements();

            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            SITE.properties.studio.keyboard.label = this.accordion.render_opts.label;
            break;
        case 'CLOSE':
            this.showKeyboard(false);
            this.resize();
            break;
    }
};


SITE.AppView.prototype.appViewCallBack = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.app.closeAppView();
            break;
    }
};
        
SITE.AppView.prototype.stopPlay = function( e ) {
    this.midiPlayer.stopPlay();
};

SITE.AppView.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};

SITE.AppView.prototype.setScrolling = function(player) {
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

SITE.AppView.prototype.changePlayMode = function(mode) {
    
    SITE.properties.studio.mode = mode? mode : 
            (SITE.properties.studio.mode==="normal"? "learning":"normal");
    
    this.midiPlayer.setAndamento( this.slider.getValue() );
    
    if( SITE.properties.studio.mode === "normal" ) {
        $("#divDidacticPlayControls" ).hide();
        SITE.properties.studio.mode  = "normal";
        this.modeButton.innerHTML = '<i class="ico-listening" ></i>';
        $("#divNormalPlayControls" ).fadeIn();
        $("#spanShowMedia" ).fadeIn();
    } else {
        $("#divNormalPlayControls" ).hide();
        SITE.properties.studio.mode  = "learning";
        this.modeButton.innerHTML = '<i class="ico-learning" ></i>';
        $("#divDidacticPlayControls" ).fadeIn();
        $("#spanShowMedia" ).hide();
    }
};

SITE.AppView.prototype.startPlay = function( type, value, valueF ) {
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
        
    } else {
        this.accordion.clearKeyboard();
        
        // esse timeout é só para garantir o tempo para iniciar o play
        window.setTimeout(function(){that.StartPlayWithTimer(that.renderedTune.abc.midi, type, value, valueF, SITE.properties.studio.timerOn ? 10 : 0); }, 0 );
    }
};

SITE.AppView.prototype.setBassIcon = function() {
    if( SITE.properties.studio.bassOn ) {
        this.FClefButton.innerHTML = '<i class="ico-clef-bass" ></i>';
    } else {
        this.FClefButton.innerHTML = '<i class="ico-clef-bass" style="opacity:0.5; filter: grayscale(1);"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px; filter: grayscale(1);"></i>';
    }
};

SITE.AppView.prototype.setTrebleIcon = function() {
    if( SITE.properties.studio.trebleOn ) {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" ></i>';
    } else {
        this.GClefButton.innerHTML = '<i class="ico-clef-treble" style="opacity:0.5; filter: grayscale(1);"></i>'+
                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:3px; filter: grayscale(1);"></i>';
    }
};

SITE.AppView.prototype.setLyricsIcon = function( ) {
    if( SITE.properties.options.lyrics ) {
        this.lyricsButton.innerHTML = '<i class="ico-letter-l" ></i>';
    } else {
        this.lyricsButton.innerHTML = '<i class="ico-letter-l" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};

SITE.AppView.prototype.setFingeringIcon = function( ) {
    if( SITE.properties.options.fingering ) {
        this.fingeringButton.innerHTML = '<i class="ico-alien-fingering" ></i>';
    } else {
        this.fingeringButton.innerHTML = '<i class="ico-alien-fingering" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
};


SITE.AppView.prototype.setTimerIcon = function( value ) {
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
                                          '<i class="ico-forbidden" style="position:absolute;left:4px;top:6px; filter: grayscale(1);"></i>';
    }
};

SITE.AppView.prototype.StartPlayWithTimer = function(midi, type, value, valueF, counter ) {
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
                    'event_category': 'Mapa'  
                   ,'event_label': this.renderedTune.title
                });
         
                this.playButton.title = SITE.translator.getResource("pause");
                this.playButton.innerHTML = '&#160;<i class="ico-pause"></i>&#160;';
            }
        } else {
            this.midiPlayer.setPlayableClefs( (SITE.properties.studio.trebleOn?"T":"")+(SITE.properties.studio.bassOn?"B":"") );
            
            SITE.ga( 'event', 'didactic-play', { 
                'event_category': 'Mapa'  
               ,'event_label': this.renderedTune.title
            });
            
            this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value, valueF );
        }
    }
};

SITE.AppView.prototype.parseABC = function (transpose, force) {

    var text = this.renderedTune.text; // this.getString(); sempre igula

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

SITE.AppView.prototype.onChange = function() {
    this.studioCanvasDiv.scrollTop = this.lastYpos;
    this.resize();
};

SITE.AppView.prototype.fireChanged = function (transpose, _opts) {
    
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

SITE.AppView.prototype.modelChanged = function(showProgress) {
    var self = this;
    if(showProgress) {
        var loader = this.app.startLoader( "ModelChanged" );
        loader.start(  function() { self.onModelChanged(loader); }, '<br>&nbsp;&nbsp;&nbsp;Gerando partitura...<br><br>' );
    } else {
        self.onModelChanged();
    }    
};

SITE.AppView.prototype.onModelChanged = function(loader) {
    
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
    this.renderedTune.printer.printTune( this.renderedTune.abc ); 
    
    //if (this.warningsDiv) {
    //    this.warningsDiv.style.color = this.warnings.length > 0 ? "red" : "green";
    //    this.warningsDiv.innerHTML = (this.warnings.length > 0 ? this.warnings.join("<br/>") : "No warnings or errors.") ;
    //}
    
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

SITE.AppView.prototype.highlight = function(abcelem) {
    if( !this.midiPlayer.playing) {
        if(SITE.properties.studio.keyboard.visible ) {
            this.accordion.clearKeyboard(true);
            this.midiParser.setSelection(abcelem);
        }
/*         if(SITE.properties.studio.editor.visible) {
            this.editorWindow.setSelection(abcelem);
        }   */  
    }    
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
SITE.AppView.prototype.unhighlight = function(abcelem) {
/*     if(SITE.properties.studio.editor.visible) {
        this.editorWindow.clearSelection(abcelem);
    }    
 */};

SITE.AppView.prototype.updateSelection = function (force) {
    var that = this;
    if( force ) {
/*         var selection = that.editorWindow.getSelection();
        try {
            that.renderedTune.printer.rangeHighlight(selection);
        } catch (e) {
        } // maybe printer isn't defined yet?
 */        delete this.updating;
    } else {
        if( this.updating ) return;
        this.updating = true;
        setTimeout( that.updateSelection(true), 300 );
    }
};

SITE.AppView.prototype.printPreview = function (html, divsToHide, landscape ) {
    
    var that = this;

    that.dvPrintPane = document.getElementById('printPreviewDiv');
    that.divsToHide = divsToHide
    that.savedDisplays = {};
    
    divsToHide.forEach( function( div ) {
        var hd = document.getElementById(div.substring(1));
        that.savedDisplays[div.substring(1)] = hd.style.display;
        hd.style.display = "none";
        
    });

    SITE.ga( 'event', 'print', { 
        'event_category': 'Mapa'  
       ,'event_label': this.renderedTune.title
    });

    this.changePageOrientation(landscape? 'landscape': 'portrait');

    that.dvPrintPane.innerHTML = html;
    that.dvPrintPane.style.display = 'block';

    setTimeout( function () { 
        if( window.DiatonicApp ) {
            window.DiatonicApp.printPage(that.renderedTune.title);
       } else {
           window.print();
           that.endPreview();
           //setTimeout( function() {  }, 3000);
       }
    });
};

SITE.AppView.prototype.endPreview = function (html, divsToHide, landscape ) {
    var that = this;

    that.dvPrintPane.style.display = 'none';

    that.divsToHide .forEach( function( div ) {
        var hd = document.getElementById(div.substring(1));
        hd.style.display = that.savedDisplays[div.substring(1)];
    });
}

SITE.AppView.prototype.changePageOrientation = function (orientation) {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = '@page {margin: 1cm; size: ' + orientation + '}';

};

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
    this.appView.stopPlay();
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
