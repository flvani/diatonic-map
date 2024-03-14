/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
          
window.dataLayer = window.dataLayer || [];

if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.checkCookieConsent = function ( ) {

    var coo = document.cookie.match(/(;)?diatonic-policy=([^;]*);?/);
    const isCookieSet = coo ? Boolean( coo[2] || false ) : false;

    // alert(document.cookie);

    var popup = jQuery('.policy-section');

    setTimeout(function () {
        if (!isCookieSet) {
            popup.show(); //exibe alerta depois de 3000 (3 segundos)
        }
    }, 3000);
    jQuery('.policy-section-actions').click(function () {
        document.cookie = 'diatonic-policy=true; path=/; max-age=86400;';
        popup.fadeOut();
    });
}

SITE.clearCookieConsent = function () {
    document.cookie = 'diatonic-policy=; path=/; max-age=86400;';
}

SITE.sizeOfThings = function () {

    SITE.winSize = { w: window.innerWidth, h: window.innerHeight };

    SITE.size = { w: screen.width, h: screen.height };;

    return SITE.size;

};

SITE.ga = function () {

    if( arguments[0] === 'set' && arguments[1] === 'page_path') {
        SITE.root = arguments[2]
    }
    
    {
        //debug only
        //console.log( 'gtag: ' + arguments[0] +', '+ arguments[1] +', '+  JSON.stringify(arguments[2], null, 4) )
        //return;
    }

    if( gtag && ( window.location.href.indexOf( 'diatonicmap') >= 0 || window.location.href.indexOf( 'androidplatform') >= 0 )
           && SITE.getVersion('mainSITE', '' ) !== 'debug' 
           && SITE.getVersion('mainSITE', '' ) !== 'unknown' ) {
               
            //console.log("GA desabilitado!");
            if(SITE.debug)
                console.log( 'App is in Debug mode'  )
            else{
                if( !SITE.gtagInitiated ) {

                    gtag('js', new Date());
                    gtag('config', 'G-3RXNND5N5Y',  { 
                         'page_title'  : SITE.root.includes('app') ? 'Diatonic App' : 'Diatonic Map'
                        ,'page_path'   : SITE.root
                        ,'site_version': SITE.siteVersion
                        ,'abcx_version': SITE.abcxVersion
                        ,'event_category': 'View'
                    });
                    
                    SITE.gtagInitiated = true;
                }
                gtag(arguments[0],arguments[1],arguments[2]);
            }
    } else {
        console.log('Funcao gtag não definida.');
    }
};

SITE.startLoader = function(id, container, start, stop) {

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

SITE.askHelp = function () {
    if( !SITE.properties.options.doNotAskHelp && SITE.App ){
        var d = document.getElementById('askHelpDiv');
        if(d){
            //d.style.display = 'block';
            setTimeout(function f() {
                $('#askHelpDiv').slideDown();    
            }, 2000);
            

            var q = document.getElementById('askHelpBtn');
            var c = document.getElementById('askHelpChk');

            q.addEventListener("click", function(event) {
                d.style.display = 'none';
                SITE.properties.options.doNotAskHelp = c.checked;
                if(SITE.properties.options.doNotAskHelp){
                    SITE.SaveProperties();
                }
                SITE.ga( 'event', 'askedHelp', { 
                    event_category: 'Configuration'  
                   ,event_label: SITE.properties.options.doNotAskHelp? 'Refused': 'JustClosed'
                });
        
             }, false);
        }
    }
}
          
SITE.findGetParameter = function(parameterName) {
    var result = null,
        tmp = [];
    var items = window.location.search.substring(1).split("&");
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
    return res ? label+res[0].substring(1) : 'debug';
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
        if( id.substring(0,2) === language.substring(0,2) ) {
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
        waterbug.show( );
        SITE.ga('event', 'exception', {
            event_category: 'Error',
            description: 'html5storage: Could not load the properties.',
            fatal: false        
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
   
    if( !SITE.properties.known_languages || !SITE.properties.known_languages.ru_RU ) {

        SITE.properties.known_languages = {
             de_DE: { file: 'languages/de_DE.lang', image: "images/de_DE.png", name: 'Deustch' } 
            ,en_US: { file: 'languages/en_US.lang', image: "images/en_US.png", name: 'US English' } 
            ,es_ES: { file: 'languages/es_ES.lang', image: "images/es_ES.png", name: 'Español' } 
            ,fr_FR: { file: 'languages/fr_FR.lang', image: "images/fr_FR.png", name: 'Français' } 
            ,it_IT: { file: 'languages/it_IT.lang', image: "images/it_IT.png", name: 'Italiano' } 
            ,ru_RU: { file: 'languages/ru_RU.lang', image: "images/ru_RU.png", name: 'Русский язык' } 
            ,pt_BR: { file: 'languages/pt_BR.lang', image: "images/pt_BR.png", name: 'Português do Brasil' } 
        };

        SITE.properties.options.language = SITE.getLanguage() ;

        window.myLanguage = SITE.properties.options.language;

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

    SITE.properties.options.lyrics=true;
    SITE.properties.options.fingering=true;

    if( SITE.properties.options.tabFormat === undefined ) {
        salvar = true;
        SITE.properties.options.tabFormat = 0;
    }

    if( SITE.properties.options.guidedTour === undefined ) {
        salvar = true;
        SITE.properties.options.guidedTour=false;
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
        waterbug.show();
        SITE.ga('event', 'exception', {
            event_category: 'Error',
            description: 'html5storage: Could not save the properties',
            fatal: false        
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
        ,ru_RU: { file: 'languages/ru_RU.lang', image: "images/ru_RU.png", name: 'Русский язык' } 
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
    window.SITE = { gtagInitiated : false, root: '/mapa' };

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
    if(!res){
        this.log( 'Missing translation for "' + id + '" in "' + this.language.langName + '".' );
        res = id;
    }
    return res;
};

SITE.Translator.prototype.translate = function(container) {
    
    if(!this.language) return;
    
    container = container || document;
    
    var translables = container.querySelectorAll('[data-translate]');
    var translablesArray = Array.prototype.slice.apply(translables);
    
    for( var i=0; i < translablesArray.length; i ++ ) {
        var item = translablesArray[i];
        var dc = item.getAttribute("data-translate");
        var vlr = this.language.resources[dc];
        if(!vlr){
            if(    dc.startsWith('GAITA_') 
                || dc.startsWith('CORONA_') 
                || dc.startsWith('HOHNER_') 
                || dc.startsWith('CONCERTINA_') 
            ){
                //Nomes de gaitas não são traduzidas nos menus
                continue;
            } 
            // para os demais não encontrados, logamos e continuamos
            this.log( 'Missing translatation for "' + dc + '" in "' + this.language.langName + '".' );
            continue;
            //vlr = item.getAttribute("data-translate");
        }
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
            case 'A': 
                item.href = vlr; 
                break;
            default: 
                item.innerHTML = vlr;
        }
    }
};    

SITE.Translator.prototype.sortLanguages = function () {
    this.languages.sort( function(a,b) { 
        return parseInt(a.menuOrder) - parseInt(b.menuOrder);
    });
};

SITE.Translator.prototype.log = function(msg) {
    console.log(msg);
    /*waterbug.log( msg );
    (SITE.properties.options.showConsole) && waterbug.show();*/
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.Media = function( parent, btShowMedia, props, isApp ) {
    var that = this;
    
    this.Div = parent || null;
    this.proportion = 0.55666667;
    this.youTubeURL = false;
    this.properties = props;
    this.isApp = isApp;
    
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
               ,event_category: 'View'
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
                this.tabDiv.className ='media-tabs' + (this.isApp?' media-tabs-big': '');
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
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.Modal = function ( options ) {

    this.modalWindow = undefined;
    this.iframe = undefined;
    this.container = undefined;

    this.options = options || {};
    this.options.width = typeof this.options.width === 'undefined'? '800' : this.options.width;
    this.options.height = typeof this.options.height === 'undefined'? undefined : this.options.height;
    this.options.print = typeof this.options.print === 'undefined'? true : this.options.print;
    this.options.callback = typeof this.options.callback === 'undefined'? {listener: this, method: 'modalDefaultCallback'} : this.options.callback; 
    this.options.type = typeof this.options.type === 'undefined'? 'modal' : this.options.type; 
    this.options.disableLinks = typeof this.options.disableLinks === 'undefined'? false : this.options.disableLinks; 
}

SITE.Modal.prototype.getContainer = function () {
    return this.container;
}

SITE.Modal.prototype.close = function () {
    this.iframe.setAttribute("data", ""); 
    this.modalWindow.setVisible(false);
}

SITE.Modal.prototype.modalDefaultCallback = function ( action, elem ) {
    if( action === 'CLOSE' ) {
        this.close();
    }
};

SITE.Modal.prototype.checkClustrmaps = function ( ) {
    var that = this;
    var w = that.iframe.contentDocument.getElementById("clustrmaps-widget")
    if(w){
        that.iframe.addEventListener("load", function () {
            if(that.options.disableLinks)
            that.disableLinks(that.iframe.contentDocument);
        });
    } else {
        if(that.options.disableLinks)
        that.disableLinks(that.iframe.contentDocument);
    }
};

SITE.Modal.prototype.disableLinks = function(doc) {

    return false; // agora consigo abrir as paginas externas em outro navegador.

    var anchors = doc.getElementsByTagName("a") ;
    
    for (var i = 0; i < anchors.length; i++) {
        anchors[i].style.pointerEvents = 'none';
    }    
};

SITE.Modal.prototype.show = function (title, subTitle, url, opts ) {
    var that = this;
    var top, height, left, width;

    opts = opts || {};
    this.options.width = typeof opts.width === 'undefined'? this.options.width : opts.width;
    this.options.height = typeof opts.height === 'undefined'? this.options.height: opts.height;
    this.options.print = typeof opts.print === 'undefined'? this.options.print: opts.print;

    if(this.options.type === 'help') {

        var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        var x = winW / 2 - this.options.width / 2;

        top= "150px";
        left= x + "px";
        height= "auto";
        width= "auto";
    } else {
        top= "30px";
        height= "90%";
        left= "60px";
        width="calc(92% - 60px)";
    }

    if( ! this.modalWindow ) {

        this.modalWindow = new DRAGGABLE.ui.Window(
            null
          , ['print|printBtn']
          , {title: '', translator: SITE.translator, draggable: true, statusbar: false, 
                top: top, height: height, left: left, width: width, zIndex: 80}
          , this.options.callback
        );
        this.modalWindow.dataDiv.style.height = "auto";
    }

    this.modalWindow.setTitle(title, SITE.translator);
    this.modalWindow.setSubTitle(subTitle, SITE.translator);
    this.modalWindow.setButtonVisible('PRINT', this.options.print );

    if(this.options.type === 'help'){
        this.modalWindow.dataDiv.innerHTML = '<object id="myFrame" data="' + url + '" type="text/html" ></object>';
    }else{
        this.modalWindow.dataDiv.innerHTML = 
        '<object id="myFrame" data="'+url+'" type="text/html" ></object> \
         <div id="pg" class="pushbutton-group" style="right: 4px; bottom: 4px;" >\
         <div id="btClose"></div>\n\
         </div>';
         this.modalWindow.addPushButtons( [ 'btClose|close' ] );
    }

    SITE.ga('event', 'page_view', {
         page_title: SITE.translator.getResource(subTitle || title)
        ,page_path: SITE.root + '/help'
        ,event_category: 'View'
    })

    var loader = SITE.startLoader( "Modal", this.modalWindow.dataDiv );

    this.iframe = this.modalWindow.dataDiv.getElementsByTagName("object")[0];
    this.modalWindow.setVisible(true);

    if(this.options.type==='help'){

        that.iframe.style.width = that.options.width + "px";
        that.iframe.style.height = (that.options.height ? that.options.height : 400) + "px";
        that.modalWindow.dataDiv.style.overflow = "hidden";
        that.modalWindow.dataDiv.style.opacity = "1";
        
        loader.start(function () {

            if (title === 'AboutTitle' ) { // específico para pagina "about"
    
                var myInterval = window.setInterval(function checkFrameLoaded() {
    
                    var info = that.iframe.contentDocument.getElementById('siteVerI');

                    that.checkClustrmaps();

                    if(info){
    
                        clearInterval(myInterval);

                        info.innerHTML = SITE.siteVersion;
        
                        that.iframe.contentDocument.body.style.overflow = "hidden";
                        that.iframe.style.height = that.iframe.contentDocument.body.clientHeight + "px";
                        that.modalWindow.dataDiv.style.opacity = "1";
        
                        loader.stop();
        
                    }
                }, 300);
    
            } else {
    
                var myInterval = window.setInterval(function checkFrameLoaded() {
                    var header = that.iframe.contentDocument.getElementById('helpHeader');

                    that.checkClustrmaps();
    
                    if (header) {
    
                        clearInterval(myInterval)

                        /* se pensar em implementar janela full para o help, eis o começo
                            that.modalWindow.move(0,80);
                            that.modalWindow.setSize( "calc( 100% - 10px)", "calc( 100% - 90px)" );
                            this.options.height = that.modalWindow.topDiv.clientHeight;
                            that.iframe.style.height = this.options.height + 'px';
                        */
    
                        that.modalWindow.dataDiv.style.opacity = "0";
                        that.container = that.iframe.contentDocument.getElementById('helpContainer');
    
                        var header = that.iframe.contentDocument.getElementById('helpHeader');
                        var frm = that.iframe.contentDocument.getElementById('helpFrame');
    
                        if (header) header.style.display = 'none';
                        if (frm) frm.style.overflow = 'hidden';
    
                        that.iframe.style.height = that.options.height + "px";
    
                        if (that.container) {
                            that.container.style.top = '0';
                            that.container.style.height = (that.options.height - 18) + "px";;
                            that.container.style.overflow = 'hidden';
                            that.container.style.border = '1px solid rgba(255, 153, 34, 0.2)';
                            var v = new PerfectScrollbar(that.container, {
                                handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
                                wheelSpeed: 1,
                                wheelPropagation: false,
                                suppressScrollX: false,
                                minScrollbarLength: 100,
                                swipeEasing: true,
                                scrollingThreshold: 500
                            });
                        }
    
                        that.modalWindow.dataDiv.style.opacity = "1";
                        loader.stop();
                    }
    
                }, 100);
            }
    
        }, '<br/>&#160;&#160;&#160;' + SITE.translator.getResource('wait') + '<br/><br/>');
    
    } else { // modais 

        that.iframe.style.width = "100%";
        that.iframe.style.height = (that.modalWindow.topDiv.clientHeight - 25) + "px";
        that.modalWindow.dataDiv.style.overflow = "hidden";
        that.modalWindow.topDiv.style.opacity = "0";

        loader.start(function () {

            var myInterval = window.setInterval(function checkFrameLoaded() {
    
                var info = true;
                if ( title === 'AboutAppTitle' ) { // específico para pagina "about"
                    var info = that.iframe.contentDocument.getElementById('siteVerI');
                }

                that.container = that.iframe.contentDocument.getElementById('modalContainer');
                
                that.checkClustrmaps();

                if (that.container && info) {
    
                    clearInterval(myInterval);

                    if( typeof info === "object" )
                        info.innerHTML = SITE.siteVersion;
    
                    that.container.style.top = '0';
                    that.container.style.height = (that.modalWindow.dataDiv.clientHeight - 70) + "px"
                    that.container.style.overflow = 'hidden';
                    that.container.style.border = '1px solid rgba(255, 153, 34, 0.2)';
    
                    var v = new PerfectScrollbar(that.container, {
                        handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
                        wheelSpeed: 1,
                        wheelPropagation: false,
                        suppressScrollX: false,
                        minScrollbarLength: 100,
                        swipeEasing: true,
                        scrollingThreshold: 500
                    });

                    that.modalWindow.topDiv.style.opacity = "1";
                    loader.stop();
                }

            }, 300);

        }, '<br/>&#160;&#160;&#160;' + SITE.translator.getResource('wait') + '<br/><br/>');
    }
}
/**
 * RedMi Note 8 Screen size 
 * (portrait)
 *   win size 786 X 1440
 *   screen size 393 X 851
 * (landscape )
 **   win size 1180 X 444
 *   screen size 851 X 393
 
 * 
 */

if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.AppView = function (app, interfaceParams, playerParams) {
    
    var that = this;
    
    this.app = app;
    this.parserparams = {};
    this.kbDivs = {};

    this.ypos = 0; // controle de scroll
    this.lastStaffGroup = -1; // controle de scroll
    this.lastYpos = 0; // controle de scroll
    
    this.warnings = [];
    
    this.renderedTune = {text:undefined, abc:undefined, title:undefined
                         ,tab: undefined, div: undefined ,selector: undefined };
    
    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.studioDiv
        , null
        , {
            translator: SITE.translator, statusbar: false, draggable: false, 
            top: "0", left: "0", width: "100%", height: "100%", title: 'EstudioTitle'
          }
        , {listener: this, method: 'appViewCallBack'}
    );

    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'controlDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group draggableToolBarApp' );
    
    this.Div.dataDiv.appendChild(this.controlDiv);

    this.studioCanvasDiv = document.createElement("DIV");
    this.studioCanvasDiv.setAttribute("id", interfaceParams.studioCanvasDiv );
    this.studioCanvasDiv.setAttribute("class", "studioCanvasDiv" );

    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.setAttribute("id", "canvasDiv");
    this.canvasDiv.setAttribute("class", "canvasDiv" );

    this.outerCanvasDiv = document.createElement("DIV");
    this.outerCanvasDiv.setAttribute("id", "outerCanvasDiv");
    this.outerCanvasDiv.setAttribute("class", "outerCanvasDiv" );
    this.outerCanvasDiv.appendChild(this.canvasDiv);

    this.keyboardDiv = document.createElement("DIV");
    this.keyboardDiv.setAttribute("id", 'keyboardDiv' );
    this.keyboardDiv.setAttribute("class", "keyboardDiv" );

    this.outerKeyboardDiv = document.createElement("DIV");
    this.outerKeyboardDiv.setAttribute("id", 'outerKeyboardDiv' );
    this.outerKeyboardDiv.setAttribute("class", 'outerKeyboardDiv' );
    this.outerKeyboardDiv.appendChild(this.keyboardDiv);

    this.studioCanvasDiv.appendChild(this.outerKeyboardDiv);
    this.studioCanvasDiv.appendChild(this.outerCanvasDiv);
    this.Div.dataDiv.appendChild(this.studioCanvasDiv);

/*
    this.keyboardDiv = new DRAGGABLE.ui.Window( 
        interfaceParams.keyboardDiv
       ,[  'rotate', 'globe']
       ,{ title: '', translator: SITE.translator, statusbar: false, draggable: false, 
          top: "3px", left: "1px"
        } 
       ,{listener: this, method: 'keyboardCallback'}
    );
*/

    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';

    if (interfaceParams.generate_tablature) {
        if (interfaceParams.generate_tablature === 'accordion') {
            this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options, SITE.properties.options.tabFormat ); 

            if (interfaceParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(interfaceParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + interfaceParams.generate_tablature + ' não suportada!');
        }
    }

    var s = 0;


    if ( SITE.size.h >= 500 ) {
        s = 1
    } else if( SITE.size.h >= 432 ) { 
        s = 0.915
    } else if( SITE.size.h >= 412 ) { 
        s = 0.87
    } else if( SITE.size.h >= 393 ) { 
        s = 0.82
    } else if( SITE.size.h >= 360 ) { 
        s = 0.74
    }else{
        s = 0.7
    }

    this.accordion.setRenderOptions({
        draggable: false
       ,show: SITE.properties.studio.keyboard.visible
       ,transpose: SITE.properties.studio.keyboard.transpose
       ,mirror: SITE.properties.studio.keyboard.mirror
       ,scale: s
       ,label: SITE.properties.studio.keyboard.label
    });

    this.controlDiv.innerHTML = document.getElementById(interfaceParams.studioControlDiv).innerHTML;
    document.getElementById(interfaceParams.studioControlDiv).innerHTML = "";

    //this.controlDiv.style.borderBottom = "1px solid rgba(255, 153, 34, 0.4)"
    //this.Div.topDiv.style.borderLeft = "1px solid rgba(255, 153, 34, 0.4)"
    
    this.media = new SITE.Media( this.Div.dataDiv, interfaceParams.btShowMedia, SITE.properties.studio.media, true ); 
    
    this.renderedTune.div = this.canvasDiv;
   
    if(this.ps)
        this.ps.destroy();

    if(this.ps2)
        this.ps2.destroy();
    
    this.ps2 = new PerfectScrollbar( this.outerKeyboardDiv, {
        handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
        wheelSpeed: 1,
        wheelPropagation: false,
        suppressScrollX: true,
        minScrollbarLength: 100,
        swipeEasing: true,
        scrollingThreshold: 500
    });
    
    this.ps = new PerfectScrollbar( this.canvasDiv, {
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
    }, false);

    this.printButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.printPreview(
            that.renderedTune.div.innerHTML, 
            ["#topBar","#appDiv", "#studioDiv" ], 
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
        
        // recicla o formato, incrementando em 1, retorando ao 0 qdo == 5
        SITE.properties.options.tabFormat = ( (SITE.properties.options.tabFormat+1) % 6 );

        that.accordion.setTabFormat(SITE.properties.options.tabFormat);

        that.shouldReprint = true;
        that.showKeyboard(SITE.properties.studio.keyboard.visible);
        that.fireChanged(0, {force:true, showProgress:false } );

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

SITE.AppView.prototype.setup = function( tab, accordionId ) {
    
    this.setVisible(true);

    this.printedKeyboard = false;
    this.accordion.loadById(accordionId);
    
    this.renderedTune.abc = tab.abc;
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    
    this.changePlayMode(SITE.properties.studio.mode);
    this.setBassIcon();
    this.setTrebleIcon();
    this.setTimerIcon( 0 );

    this.Div.setTitle( this.accordion.getFullName() + ' <span data-translate="keys">' + SITE.translator.getResource('keys') + '</span>' );
    this.Div.setSubTitle( '- ' + tab.title );

    SITE.translator.translate( this.Div.topDiv );

    this.Div.setMenuVisible(true);

    this.showKeyboard(SITE.properties.studio.keyboard.visible);
    this.fireChanged(0, {force:true, showProgress:false } );

    this.canvasDiv.scrollTop = 0;

};

SITE.AppView.prototype.showKeyboard = function(show) {
    SITE.properties.studio.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.studio.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.studio.keyboard.visible;
    
    //if ( ! SITE.properties.studio.keyboard.visible && ! this.printedKeyboard ) return;

    if(SITE.properties.studio.keyboard.visible) {
        //this.keyboardDiv.setVisible(true);
        this.outerKeyboardDiv.style.display = 'inline-block';
        if(! this.printedKeyboard) {
            this.printedKeyboard = true;
            this.shouldReprint = false;
            this.accordion.printKeyboard( this.keyboardDiv );
            this.setExtras();
        }
        if( this.shouldReprint ) {
            this.shouldReprint = false;
            this.accordion.loadedKeyboard.reprint();
            that.setExtras();
        }
        this.setRight();
        this.showMapButton.innerHTML = '<i class="ico-keyboard" ></i>';
    } else {
        //this.keyboardDiv.setVisible(false);
        //this.accordion.render_opts.show = false;
        this.outerKeyboardDiv.style.display = 'none';
        this.showMapButton.innerHTML = '<i class="ico-keyboard" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                                         '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
    this.resize();

};

SITE.AppView.prototype.setRight = function() {
    if( SITE.properties.options.keyboardRight ){
        if(this.kbDivs.openBtnRight.classList && !this.kbDivs.openBtnRight.classList.contains('flip-vert') ) {
            this.kbDivs.openBtnRight.classList.add('flip-vert');
        }
        this.outerKeyboardDiv.classList.remove('keyboardDivLeft');
        this.outerCanvasDiv.classList.add('keyboardDivLeft');
    } else {
        if(this.kbDivs.openBtnRight.classList && this.kbDivs.openBtnRight.classList.contains('flip-vert') ) {
            this.kbDivs.openBtnRight.classList.remove('flip-vert');
        }
        this.outerKeyboardDiv.classList.add('keyboardDivLeft');
        this.outerCanvasDiv.classList.remove('keyboardDivLeft');
    }
}

SITE.AppView.prototype.setExtras = function() {

    this.kbDivs = this.accordion.loadedKeyboard.divs;
    that = this;

/*
    if( SITE.properties.options.keyboardRight ){
        this.kbDivs.openBtnRight.classList.add('flip-vert');
    } else {
        this.kbDivs.openBtnRight.classList.remove('flip-vert');
    }
*/

    this.accordion.loadedKeyboard.showImagem(true);
    this.accordion.loadedKeyboard.showExtras(true);
    this.accordion.loadedKeyboard.showExtrasOpen(true);

    this.kbDivs.rotateBtnExtra.addEventListener("click", function (evt) {
        evt.preventDefault();
        that.keyboardCallback('ROTATE');
    }, false);

    this.kbDivs.globeBtnExtra.addEventListener("click", function (evt) {
        evt.preventDefault();
        that.keyboardCallback('GLOBE');
    }, false);

    this.kbDivs.openBtnRight.addEventListener("click", function (evt) {
        evt.preventDefault();
        SITE.properties.options.keyboardRight = !SITE.properties.options.keyboardRight;
        that.showKeyboard(SITE.properties.studio.keyboard.visible);
    }, false);

    SITE.translator.translate( this.kbDivs.extras );
}

SITE.AppView.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardDiv);
            this.accordion.rotateKeyboard(this.keyboardDiv);
            this.setExtras();
            this.setRight();
            SITE.properties.studio.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.studio.keyboard.mirror = this.accordion.render_opts.mirror;
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
    if( !this.canvasDiv || !player.currAbsElem || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.canvasDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top-12;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        
        this.ypos = top;
        this.canvasDiv.scrollTop = this.ypos;    
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
    } else {
        $("#divNormalPlayControls" ).hide();
        SITE.properties.studio.mode  = "learning";
        this.modeButton.innerHTML = '<i class="ico-learning" ></i>';
        $("#divDidacticPlayControls" ).fadeIn();
    }
};

SITE.AppView.prototype.startPlay = function( type, value, valueF ) {
    this.ypos = this.canvasDiv.scrollTop;
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
    this.canvasDiv.scrollTop = this.lastYpos;
};

SITE.AppView.prototype.fireChanged = function (transpose, _opts) {
    
    if( this.changing ) return;
    
    this.lastYpos = this.canvasDiv.scrollTop || 0;               
    
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
        var loader = SITE.startLoader( "ModelChanged" );
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
        event_category: 'Mapa'  
       ,event_label: this.renderedTune.title
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

SITE.AppView.prototype.resize = function( ) {


    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

    var w = (winW - 2 ); 
    var l = SITE.properties.studio.keyboard.visible? this.keyboardDiv.clientWidth : 0;

    this.Div.resize();

    var c = this.controlDiv.clientHeight;
    var d = this.Div.dataDiv.clientHeight;
    var dw = this.Div.dataDiv.clientWidth;

    this.studioCanvasDiv.style.height = Math.max(d,300) +"px";
    this.outerCanvasDiv.style.height = this.studioCanvasDiv.clientHeight-c-15 + "px";
    this.canvasDiv.style.height = this.outerCanvasDiv.clientHeight - 4 + "px";

    this.outerKeyboardDiv.style.height = this.studioCanvasDiv.clientHeight-c-15 + "px";
    
    this.studioCanvasDiv.style.width = Math.max(dw,600) +"px";
    this.canvasDiv.style.width = Math.min(1025,Math.max(w-l-10,100)) +"px";
    this.outerCanvasDiv.style.width = this.canvasDiv.clientWidth+"px"; 

    (this.ps) && this.ps.update();
    (this.ps2) && this.ps2.update();

    this.media.posiciona();
        

}
if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

SITE.App = function( interfaceParams, tabParams, playerParams ) {

    var s = 0;


    if ( SITE.size.h >= 500 ) {
        s = 1
    } else if( SITE.size.h >= 432 ) { 
        s = 1
    } else if( SITE.size.h >= 412 ) { 
        s = 1
    } else if( SITE.size.h >= 393 ) { 
        s = 0.95
    } else if( SITE.size.h >= 360 ) { 
        s = 0.90
    }else{
        s = 0.6
    }

    document.body.style.overflow = 'hidden';
    
    var that = this;

    this.container = document.getElementById('appDiv')
    this.tab = {title:'', text:'', ddmId:'menuSongs', type: 'songs' }
    
    this.modal = new SITE.Modal( { disableLinks: true, print: false, callback:{ listener: this, method: 'closeModal'} } )

    this.Back = [] // define a funcao a ser chamada quando o comando back é acioando no telefone
    
    this.Back.push({listener:this, method:'closeApp'}); 
    
    ABCXJS.write.color.useTransparency = SITE.properties.colors.useTransparency;
    ABCXJS.write.color.highLight = SITE.properties.colors.highLight;
    DIATONIC.map.color.fill = SITE.properties.colors.fill;
    DIATONIC.map.color.background = SITE.properties.colors.background;
    DIATONIC.map.color.close = SITE.properties.colors.close;
    DIATONIC.map.color.open = SITE.properties.colors.open;
    
    this.settingsMenu = document.getElementById(interfaceParams.settingsMenu);

    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options, SITE.properties.options.tabFormat );
    
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

    this.gaitaImagePlaceHolder.style.scale = s;

    this.settingsMenu.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.showSettings();
    }, false );

    this.setVersionLang();

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
        , {listener:this, method: 'showABC', translate: false, label: 'Song' }
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
    
    var type, title;
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
        case 'GAITA_HOHNER_CORONA_BEA':
        case 'GAITA_HOHNER_CORONA_ADG':
        case 'GAITA_HOHNER_CLUB_IIIM_BR':
        case 'GAITA_MINUANO_BC_TRANSPORTADA':
        default: // as gaitas conhecidas e outras carregadas sob demanda
            this.changeAccordion({accordionId:ev});
    }
};

SITE.App.prototype.openAppView = function (button, event) {
    var that = this;

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

    this.Back.push({listener:this, method:'closeAppView'}); 

    if( that.tab.text ) {
        SITE.ga('event', 'page_view', {
            page_title: that.tab.title
           ,page_path: SITE.root+'/'+that.accordion.getId()
           ,event_category: 'View'
        })        

        var loader = SITE.startLoader( "openAppView" );
        loader.start(  function() { 
            that.appView.setup( that.tab, that.accordion.getId() );
            loader.stop();
        }, '<br/>&#160;&#160;&#160;'+SITE.translator.getResource('wait')+'<br/><br/>' );
    }
};

SITE.App.prototype.setVisible = function ( visible ) {
    this.container.style.display = (visible? 'block':'none');
};

SITE.App.prototype.showAccordionImage = function() {
    
  this.gaitaImagePlaceHolder.innerHTML = ' <div class="shadow"></div><img src="'+this.accordion.loaded.image
        +'" alt="'+this.accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '" />';
};

SITE.App.prototype.showAccordionName = function() {
    var t = this.accordion.getFullName() + ' <span data-translate="keys">' + SITE.translator.getResource('keys') + '</span>';
    this.accordionSelector.menu.setSubMenuTitle( this.accordionSelector.ddmId, t );
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

    var that = this;

    var width = 620;
        
    var x = 70;
    
    this.Back.push({listener:this, method:'closeSettings'}); 
   
    if(!this.settings) {
        this.settings = {};
        this.settings.popupWin = new DRAGGABLE.ui.Window( 
              null 
            , null
            , { title: 'PreferencesTitle', translator: SITE.translator, statusbar: false, 
                    top: "40px", left: x+"px", height:'450px',  width: width+'px', zIndex: 70 } 
            , {listener: this, method: 'settingsCallback'}
        );

        SITE.ga('event', 'page_view', {
            page_title: SITE.translator.getResource('PreferencesTitle')
           ,page_path: SITE.root+'/settings'
           ,event_category: 'View'
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
              <tr style="height:20px; display:none;" >\
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
              <!--tr style="height:40px;">\
                <td> </td><td colspan="2"><div id="sldSuppressTitles"></div>\
                <span data-translate="PrefsPropsChkSuppressTitles" >'+SITE.translator.getResource('PrefsPropsChkSuppressTitles')+'</span></td>\
              </tr-->\
              <tr style="display:none;">\
                <td> </td><td colspan="2"><input id="chkWarnings" type="checkbox">&nbsp;\
                <span data-translate="PrefsPropsCKShowWarnings" >'+SITE.translator.getResource('PrefsPropsCKShowWarnings')+'</span></td>\
              </tr>\
              <tr style="display:none;">\
                <td> </td><td colspan="2"><input id="chkAutoRefresh" type="checkbox">&nbsp;\
                <span data-translate="PrefsPropsCKAutoRefresh" >'+SITE.translator.getResource('PrefsPropsCKAutoRefresh')+'</span></td>\
              </tr>\
              <tr style="height:30px; white-space:nowrap; font-family: Merienda;">\
                <td> </td><td colspan="2">\
                <a id="aPolicy"    href="" style="width:25%; display:block; float: left;"><span data-translate="PrivacyTitle">Politica</span></a>\
                </td>\
              </tr>\
              <tr style="height:30px; white-space:nowrap; font-family: Merienda;">\
                <td> </td><td colspan="2">\
                <a id="aTerms" href="" style="width:fit-content; display:block; float: left;"><span data-translate="TermsTitle">Termos</span></a>\
                </td>\
              </tr>\
              <tr style="height:30px; white-space:nowrap; font-family: Merienda;">\
                <td> </td><td colspan="2">\
                <a href="https://diatonicmap.com.br" target="_blank" style="width:25%; display:block; float: left;" >diatonicmap.com.br</a>\
                </td>\
              </tr>\
              </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao0" style="left:-50px;"></div>\n\
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

        this.settings.popupWin.addPushButtons([
            'botao0|tour|Take a tour',
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
            ,  { listener:this, method:'settingsCallback', translate: false }
            ,  [{title: '...', ddmId: 'menuFormato',
                    itens: [
                        '&#160;Modelo Alemão|0TAB',
                        '&#160;Numérica Cíclica|1TAB',
                        '&#160;Numérica Contínua|2TAB' 
                    ]}]
            );


        this.aTerms = document.getElementById("aTerms");
        this.aPolicy = document.getElementById("aPolicy");
    
        this.aPolicy.addEventListener("click", function(evt) {
            evt.preventDefault();
            this.blur();
            that.Back.push({listener:that, method:'closeModal'}); 

            if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
                that.modal.show('PrivacyTitle', '', 'privacy/policy.pt-BR.html');
            } else if( SITE.properties.options.language.toUpperCase().indexOf('ES')>=0 )  {
                that.modal.show('PrivacyTitle', '', 'privacy/policy.es-ES.html');
            } else {
                that.modal.show('PrivacyTitle', '', 'privacy/policy.en-US.html' );
            }

        }, false );
    
        this.aTerms.addEventListener("click", function(evt) {
            evt.preventDefault();
            this.blur();
            that.Back.push({listener:that, method:'closeModal'}); 

            if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
                that.modal.show('TermsTitle', '', 'privacy/terms.pt-BR.html');
            } else if( SITE.properties.options.language.toUpperCase().indexOf('ES')>=0 )  {
                that.modal.show('TermsTitle', '', 'privacy/terms.es-ES.html');
            } else {
                that.modal.show('TermsTitle', '', 'privacy/terms.en-US.html' );
            }

        }, false );

        var impar = (SITE.properties.options.tabFormat % 2 );
        var formato = (SITE.properties.options.tabFormat - impar  ) / 2;

        this.settings.tabFormat = formato;
        this.settings.tabMenu.setSubMenuTitle( 'menuFormato', this.settings.tabMenu.selectItem( 'menuFormato', this.settings.tabFormat.toString()+"TAB" ));
        SITE.properties.options.tabShowOnlyNumbers = (impar===1);

        this.picker = new DRAGGABLE.ui.ColorPicker(['corRealce', 'foleFechando', 'foleAbrindo'], {readonly: false, translator: SITE.translator});
      
        SITE.translator.menuPopulate(this.settings.menu, 'menuIdiomas');
        
        this.settings.lang = SITE.properties.options.language;

        this.settings.corRealce = document.getElementById( 'corRealce');
        this.settings.closeColor = document.getElementById( 'foleFechando');
        this.settings.openColor = document.getElementById( 'foleAbrindo');

        this.settings.showWarnings = document.getElementById( 'chkWarnings');
        this.settings.autoRefresh = document.getElementById( 'chkAutoRefresh');
        
        SITE.translator.translate();
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
        case 'ru_RU':
            this.settings.lang = action;
            this.settings.menu.setSubMenuTitle( 'menuIdiomas', this.settings.menu.selectItem( 'menuIdiomas', action ));
            break;
        case 'MOVE':
            break;
        case 'CLOSE':
        case 'CANCEL':
            this.Back.pop();
            this.picker.close();
            this.settings.popupWin.setVisible(false);
            break;
        case 'APPLY':
            SITE.properties.colors.highLight = this.settings.corRealce.value;
            SITE.properties.colors.close = this.settings.closeColor.value;
            SITE.properties.colors.open = this.settings.openColor.value;

            SITE.properties.colors.useTransparency = this.settings.sldTransparency.getBoolValue();
            SITE.properties.options.tabShowOnlyNumbers = this.settings.sldOnlyNumbers.getBoolValue();
            SITE.properties.options.pianoSound = this.settings.sldPianoSound.getBoolValue();
            SITE.properties.options.language = this.settings.lang;

            SITE.properties.options.showWarnings = this.settings.showWarnings.checked;
            SITE.properties.options.autoRefresh = this.settings.autoRefresh.checked;

            this.Back.pop();
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
                event_category: 'Configuration'  
               ,event_label: SITE.properties.version
            });
            
            this.applySettings();
            break;
        case 'RESET-NO':
        case 'RESET-CANCEL':
            this.alert.close();
            break;
        case 'TOUR':
            this.Back.pop();
            this.picker.close();
            this.settings.popupWin.setVisible(false);
            // run the tour on demand
            initEnjoyVars(); 
            SITE.myTour = new EnjoyHint(g_enjoyhint_opts);
            SITE.myTour.set(g_enjoyhint_script_steps);
            SITE.myTour.resume();
            break;
    }
};

SITE.App.prototype.applySettings = function() {

    //fazer os ajustes quando selecionar o formato de tablatura
    if( parseInt(this.settings.tabFormat) !== SITE.properties.options.tabFormat || 
        this.settings.originalOnlyNumber !== SITE.properties.options.tabShowOnlyNumbers ) 
    {
        SITE.properties.options.tabFormat = parseInt(this.settings.tabFormat);
        this.accordion.setTabFormat(SITE.properties.options.tabFormat)

        if (this.appView) {
            this.appView.accordion.setTabFormat(SITE.properties.options.tabFormat)
        }
    }

    if( this.settings.originalLang !== SITE.properties.options.language ) {
        SITE.ga( 'event', 'changeLang', { 
            event_category: 'Configuration'  
           ,event_label: SITE.properties.options.language
        });
        SITE.translator.loadLanguage( this.settings.lang, function () { SITE.translator.translate(); } );  
        this.setVersionLang();
        //SITE.askHelp();
    }
    
    if( this.settings.originalPianoSound !== SITE.properties.options.pianoSound ) {
        SITE.ga( 'event', 'changeInstrument', { 
            event_category: 'Configuration'  
           ,event_label: SITE.properties.options.pianoSound?'piano':'accordion'
        });
        this.defineInstrument();
    }

    //(this.appView) && this.appView.setKeyboardDetails()
   
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

SITE.App.prototype.setVersionLang = function (  ) {
    var that = this;
    this.aVersion = document.getElementById("aVersion");

    this.aVersion.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.Back.push({listener:that, method:'closeModal'}); 

        if( SITE.properties.options.language.toUpperCase().indexOf('PT')>=0 )  {
            that.modal.show('AboutAppTitle', '', 'privacy/aboutApp.pt-BR.html');
        } else if( SITE.properties.options.language.toUpperCase().indexOf('ES')>=0 )  {
            that.modal.show('AboutAppTitle', '', 'privacy/aboutApp.es-ES.html');
        } else {
            that.modal.show('AboutAppTitle', '', 'privacy/aboutApp.en-US.html' );
        }

    }, false );
};

SITE.App.prototype.closeSettings = function() {
    this.settingsCallback('CLOSE');
};

SITE.App.prototype.closeModal = function( ) {
        this.modal.close();
        this.Back.pop();
};

SITE.App.prototype.closeAppView = function() {
    this.appView.setVisible(false);
    //this.appView.keyboardWindow.setVisible(false);
    this.appView.stopPlay();
    SITE.SaveProperties();
    this.Back.pop();
};


SITE.App.prototype.closeApp = function () {
    window.DiatonicApp && window.DiatonicApp.closeApp();
};

SITE.App.prototype.goBackOrClose = function (  ) {
    var o = this.Back[this.Back.length-1]; 
    return o.listener[o.method] ();
};

SITE.App.prototype.setFocus = function() {
    /*     if(this.appView && window.getComputedStyle(this.appView.Div.parent).display !== 'none') {
            this.appView.editorWindow.aceEditor.focus();
    } */
}
    var g_enjoyhint_opts

const en_US=0;
const pt_BR=1;
const es_ES=2;

var g_enjoyhint_text = [[],[],[]]

// esta função só deve ser chamada depois que a linguagem do site estiver carregada
function initEnjoyVars()
{
    g_enjoyhint_opts = {
         "btnNextText": SITE.translator.getResource('Next')
        ,"btnPrevText": SITE.translator.getResource('Previous')
        ,"btnSkipText": SITE.translator.getResource('Dismiss')
        ,backgroundColor: "rgba(0,0,0,0.6)"
        ,arrowColor: "white"
        ,onEnd:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties(); document.body.style.overflow = "hidden";}
        ,onSkip:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties(); SITE.myTour.destroy(); document.body.style.overflow = "hidden";}
    }

    switch( SITE.properties.options.language ) {
        case 'pt_BR':
            ge_lang = pt_BR;
            break;
        case 'es_ES':
            ge_lang = es_ES;
            break;
        default:
            ge_lang = en_US;
    }

    g_enjoyhint_script_steps = [
                    
        {
            'next #appTitle' :  g_enjoyhint_text[ge_lang][1],
            "nextButton" : { text: SITE.translator.getResource('Start') },
            /*top: 75, bottom: -10, left:10, right: 10*/
        },
        {
            'next #topSettings' : g_enjoyhint_text[ge_lang][2],
                shape : 'circle',
                radius: 36,
        },
        {
            'next #menuGaitas' : g_enjoyhint_text[ge_lang][3],
        },
        {
            'next #menuSongs' : g_enjoyhint_text[ge_lang][4],
        },
        {
            'click #openBtn' : g_enjoyhint_text[ge_lang][5],
            showSkip: false,
            top: -7, bottom: -4, left: -7, 
            /*scrollAnimationSpeed : 300,*/
            onBeforeStart:function(){ 
                myApp.changeAccordion({accordionId:'GAITA_HOHNER_CORONA_GCF'}); 
                myApp.showABC( 'songs#6011' );
            },
        },
        {
            'next #controlDiv' : g_enjoyhint_text[ge_lang][6],
            closeButton : {className: 'myClose'},
            "nextButton" : { text: SITE.translator.getResource('Start') },
            showPrev: false,
            disableSelector: true,
            /*top: 50, */ bottom: 7, left: 5, right: 10,
            onBeforeStart:function(){ 
                myApp.appView.media.callback( 'CLOSE' ); 
                myApp.appView.changePlayMode('normal');
            },
        },
        {
            'next .ico-keyboard' : g_enjoyhint_text[ge_lang][7],
                shape : 'circle',
                radius: 22,
        },
        {
            'next #keyboardExtraBtnDiv' : g_enjoyhint_text[ge_lang][8],
            onBeforeStart:function(){ 
                myApp.appView.showKeyboard(true); 
            },
            /*top: 10, bottom: 14, left: 7, right: 30,*/
            disableSelector: true
        },
        {
            'next .ico-printer' : g_enjoyhint_text[ge_lang][9],
                shape : 'circle',
                radius: 22,
                disableSelector: true,
        },
        {
            'next .ico-tabformat' : g_enjoyhint_text[ge_lang][10],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-alien-fingering2' : g_enjoyhint_text[ge_lang][11],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-letter-l' : g_enjoyhint_text[ge_lang][12],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-treble' : g_enjoyhint_text[ge_lang][13],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-bass' : g_enjoyhint_text[ge_lang][14],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-timer-00' : g_enjoyhint_text[ge_lang][15],
                shape : 'circle',
                radius: 22
        },
        {
            'next #tempoBtnId' : g_enjoyhint_text[ge_lang][16],
            top: -2, bottom: -4, left: 2, right: 2
        },
        {
            'next #modeBtn': g_enjoyhint_text[ge_lang][17],
                shape : 'circle',
                radius: 24
        },
        {
            'next #stepBtn' : g_enjoyhint_text[ge_lang][18],
                onBeforeStart:function(){
                    myApp.appView.changePlayMode('learning');
                },
                shape : 'circle',
                radius: 22
        },
        {
            'next #stepMeasureBtn' : g_enjoyhint_text[ge_lang][19],
                shape : 'circle',
                radius: 22
        },
        {
            'next .input-group' : g_enjoyhint_text[ge_lang][20],
            top: 0, bottom: 10,
            disableSelector: true
        },
        {
            'next #repeatBtn' : g_enjoyhint_text[ge_lang][21],
                shape : 'circle',
                radius: 22
        },
        {
            'next #clearBtn' : g_enjoyhint_text[ge_lang][22],
                shape : 'circle',
                radius: 22
        },
        {
            'next #buttonShowMedia' : g_enjoyhint_text[ge_lang][23],
                shape : 'circle',
                radius: 22
        },
        {
            'next #outerCanvasDiv' : g_enjoyhint_text[ge_lang][24],
                scrollAnimationSpeed : 2500,
                onBeforeStart:function(){ 
                    myApp.appView.media.callback( 'CLOSE' ); 
                    myApp.appView.changePlayMode('normal');
                },
                disableSelector: true,
                shape : 'circle',
                radius: 280
        },
        {
            'click .ico-home' : g_enjoyhint_text[ge_lang][25],
                scrollAnimationSpeed : 2500,
                "skipButton" : { text: SITE.translator.getResource('Finish') },
                shape : 'circle',
                radius: 26
        },
    ];
}

g_enjoyhint_text[pt_BR] = [ 'dummy',

//1
    "Vamos conhecer as principais funcionalidades deste Aplicativo?<br>"+
    "<text class='hint_laranja'>Observação: Você sempre poderá reiniciar este tour clicando em <i class='ico-menu'></i> no canto superior esquerdo do aplicativo.</text>"

,//2
    "Use o menu \"Ajustes\" para mudar coisas, tais como, o idioma <br>ou usar sons de piano acústico e outras mais."

,//3
    "Confira a caixa de listagem de acordeões<br>e escolha um de sua preferência."

,//4
    "Escolha, também, uma das músicas disponíveis na lista.<br>"+
        "<text class='hint_laranja'>Observação: Só desta vez, eu escolherei, por você, uma música para<br>"+
        "melhor demonstrar as funcionalidades da próxima página.</text>"

,//5
    "Agora, clique no botão \"Abrir\" para começar a aprender!"

,//6
    "Pronto para conhecer as facilidades da barra de menu?"

,//7
    "Este botão mostra/oculta o layout do teclado. "+
        "<text class='hint_tryit'>Experimente agora!</text>"
,//8

"O teclado em si também possui alguns controles úteis:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='hint_azul'><i class='ico-rotate' ></i> - </text>"+
            "<text class='hint_verde'>Espelha os botões do teclado (flip vertical);</text><br>"+
        "<text class='hint_azul'><i class='ico-world' ></i> - </text>"+
            "<text class='hint_verde'>Altera a notação dos nomes das notas; e</text><br>"+
        "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Alterna o lado do teclado: esquerda/direita.</text>"+
    "<div>"

,//9
    "Mostra uma prévia da impressão da música atual."

,//10
    "Altera entre as diferentes representações da tablatura. Atualmente há 3 formatos distintos.&nbsp;"+
        "<text class='hint_tryit'>Experimente agora!</text><br>"+
        "<text class='hint_laranja'>Observação: Maiores detalhes podem ser vistos na página \"https://diatonicmap.com.br/tablature\"</text>"

,//11
    "Este botão mostra/oculta os dedilhados da tablatura (se presentes). <text class='hint_tryit'>Experimente agora!</text>"

,//12
    "Este botão mostra/oculta a letra da música (se houver). <text class='hint_tryit'>Experimente agora!</text>"

,//13
    'Este botão ativa/desativa o som da melodia durante a execução MIDI.'

,//14
    'Este botão ativa/desativa o som do ritmo baixo durante a execução MIDI.'

,//15
    'Este botão ativa/desativa um breve temporizador antes de começar a execução.'
,//16
    "Deslize este botão para controlar o \"Andamento\" (velocidade) da execução MIDI."
,//17
    "Este botão alterna entre o modo de execução normal e o modo de aprendizagem:<br>"+
    "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Modo Normal:&nbsp;</text>"+
        "<text class='hint_verde'>Compreende um conjunto simples de botões<br>play/pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
        " e stop <i class='ico-stop'></i> para permitir a execução da partitura;</text><br>" +
    "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Modo de aprendizagem:&nbsp;</text>"+
        "<text class='hint_verde'>Este modo adiciona um conjunto de opções<br>para usar enquanto você estiver estudando a partitura.<br>"+
    "<text class='hint_laranja'>Observação: A seguir, ajustarei o \"Modo de aprendizagem\" para a parte final da demonstração.</text>"
,//18
    "No \"Modo de Aprendizagem\", este botão executa uma nota por vez, em um estilo \"passo-a-passo\"."
,//19
    "Este botão reproduz um compasso por vez ou compasso atual até o seu fim."
,//20
    'Use estas caixas de texto para limitar um conjunto de compassos numerados.<br>'+
    'Se você preencher apenas o primeiro campo, a compasso escolhido será repetido.<br>'+
    'No entanto, ao preencher ambos com números apropriados, o intervalo de compassos será repetido.'

,//21
    'Este botão aplicará e executará a repetição que você configurou nos campos anteriores.'

,//22
    'Este botão interrompe qualquer reprodução em andamento e coloca o cursor MIDI na posição inicial.'

,//23
    'Este botão abre uma janela vinculada às videoaulas do Youtube (se existirem).'

,//24
    "<div class='enjoy_hint_backgr'>"+
        "Este é o produto final deste aplicativo: uma partitura com tablatura.<br>"+
        "Para saber mais sobre esta metodologia de tablaturas para acordeão, dê uma olhada em:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
        "Você também pode conferir a versão para website do aplicativo:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
        "<text class='hint_black'>Aproveite toda a comodidade de uma tela maior, com o mesmo repertório e muitos recursos extras de edição!</text>"+
    "</div>"

,//25
    "<div class='enjoy_hint_backgr'>"+
        "Finalmente, clique em <i class='ico-home'> para voltar à página inicial e finalizar este tour.<br>"+
        "Obrigado por ter acompanhado este tutorial até aqui e espero que você goste deste aplicativo.<br>"+
        "Você pode entrar em contato comigo pelo e-mail <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
        "<text class='hint_black'>Seus comentários/sugestões/elogios ou críticas são bem-vindos!</text><br>"+
    "</div>"

];

g_enjoyhint_text[es_ES] = [ 'dummy',

//1
    "¿Conozcamos las características principales de esta Aplicación?<br>"+
    "<text class='hint_laranja'>Nota: siempre puedes reiniciar este tour haciendo clic en <i class='ico-menu'></i><br>"+
    "en la esquina superior izquierda de la aplicación.</text>"

,//dos
    "Utilice el menú \"Ajustes\" para cambiar cosas como el idioma<br>o usar sonidos de piano acústico y más."

,//3
    "Consulta el cuadro de lista de acordeones<br>y elige uno que te guste."

,//4
    "Elige también una de las canciones disponibles en la lista.<br>"+
        "<text class='hint_laranja'>Nota: Sólo por esta vez, elegiré para ti una canción para<br>"+
        " mejor demonstrar las funciones en la página siguiente.</text>"

,//5
    "¡Ahora, haz clic en el botón \"Abrir\" para comenzar a aprender!"

,//6
    "Listo para conocer las características de la barra de menú?"

,//7
    "Este botón muestra/oculta la distribución del teclado. "+
        "<text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//8
    "El teclado en sí también tiene algunos controles útiles:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='hint_azul'><i class='ico-rotate'></i> - </text>"+
            "<text class='hint_verde'>Refleja los botones del teclado (volteo vertical);</text><br>"+
        "<text class='hint_azul'><i class='ico-world'></i>- </text>"+
            "<text class='hint_verde'>Cambia la notación de los nombres de las notas; y</text><br>"+
        "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Cambia el lado del teclado: izquierda/derecha.</text>"+
    "<div>"

,//9
    "Muestra una vista previa de impresión de la canción actual."

,//10
    "Cambia entre las diferentes representaciones de tablatura. Actualmente hay 3 formatos diferentes."+
        "<text class='hint_tryit'>¡Pruébalo ahora!</text><br>"+
        "<text class='hint_laranja'>Nota: Más detalles se pueden ver en la página \"https://diatonicmap.com.br/tablature\"</text>"

,//11
    "Este botón muestra/oculta las digitaciones de la tablatura (si están presentes). <text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//12
    "Este botón muestra/oculta la letra de la canción (si está presente). <text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//13
    'Este botón activa o desactiva el sonido de la melodía durante la reproducción MIDI.'

,//14
    'Este botón activa o desactiva el sonido del ritmo del bajo durante la reproducción MIDI.'

,//15
     'Este botón activa/desactiva un breve temporizador antes de que comience la ejecución.'
,//dieciséis
     "Deslice ésta perilla para controlar el \"Tempo\" (velocidad) de la reproducción MIDI."
,//17
     "Este botón alterna entre el modo de ejecución normal y el modo de aprendizaje:<br>"+
     "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Modo normal:&nbsp;</text>"+
         "<text class='hint_verde'>Consta de un conjunto simple de botones<br>reproducir/pausa <i class='ico-play'></i>/<i class='ico-pause'></i> "+
         " y detenga <i class='ico-stop'></i> para permitir que se reproduzca la partitura;</text><br>" +
     "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Modo de aprendizaje:&nbsp;</text>"+
         "<text class='hint_verde'>Este modo agrega un conjunto de opciones<br>para usar mientras estudias la partitura.<br>"+
     "<text class='hint_laranja'>Nota: A continuación, ajustaré el \"Modo de aprendizaje\" para la parte final de la demostración.</text>"
,//18
     "En \"Modo de aprendizaje\", este botón reproduce una nota a la vez, en un estilo \"paso-a-paso\"."
,//19
     "Este botón reproduce un compás a la vez o el compás actual hasta su final."
,//20
     "Utilice estos cuadros de texto para limitar un conjunto de compases numerados.<br>"+
     "Si sólo rellenas el primer campo, se repetirá el compás elegido.<br>"+
     "Sin embargo, al completar ambos con los números apropiados, se repetirá la gama de compases."

,//21
     'Este botón aplicará y ejecutará la repetición que configuró en los campos anteriores.'

,//22
     'Este botón detiene cualquier reproducción en curso y coloca el cursor MIDI en la posición inicial.'

,//23
     "Este botón abre una ventana vinculada a lecciones en vídeo de YouTube (si estan presentes)."

,//24
     "<div class='enjoy_hint_backgr'>"+
         "Este es el producto final de esta aplicación: una partitura con tablatura.<br>"+
         "Para aprender más sobre esta metodología de tablaturas de acordeón, echa un vistazo a:<br>"+
             "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
         "También puedes consultar la versión del sitio web de la aplicación:<br>"+
             "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
         "<text class='hint_black'>¡Disfruta de toda la comodidad de una pantalla más grande, con el mismo repertorio y muchas funciones de edición adicionales!</text>"+
     "</div>"

,//25
     "<div class='enjoy_hint_backgr'>"+
         "Finalmente, haga clic en <i class='ico-home'> para regresar a la página de inicio y finalizar este tour.<br>"+
         "Gracias por seguir este tutorial hasta ahora y espero que disfrutes esta aplicación.<br>"+
         "Puedes contactarme en <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
         "<text class='enjoy_hint_note_footrodape'>¡Tus comentarios/sugerencias/elogios o críticas son bienvenidos!</text><br>"+
     "</div>"
];

g_enjoyhint_text[en_US] = [ 'dummy',
//1
    "Let's learn about the main features of this App?<br>"+
        "<text class='hint_laranja'>Note: You can always restart this tour by clicking <i class='ico-menu'></i> on left-top corner of the App.</text>"

,//2    
    "Use the \"Settings\" menu to change stuff such as the language <br>or to use piano sounds and more."

,//3    
    "Checkout the accordion listbox <br>and choose the one of your prefference."

,//4    
    "Also, choose an available song from the list.<br>"+
        "<text class='hint_laranja'>Note: Only this time, I'll choose you a song<br>for a better demonstration.</text>"

,//5    
    "Now, click the \"Open\" button to start learning!"

,//6    
    "Are you ready to know the facilities on the menu bar?"

,//7    
    "This button shows/hides the keyboard layout. "+
        "<text class='hint_tryit'>Try it now!</text>"

,//8
    "The keyboard itself also has some useful controls:<br>"+
        "<div style='text-align:left; margin-left:3em'>"+
            "<text class='hint_azul'><i class='ico-rotate' ></i> - </text>"+
                "<text class='hint_verde'>Mirrors the keyboard's buttons (vertical flip);</text><br>"+
            "<text class='hint_azul'><i class='ico-world' ></i> - </text>"+
                "<text class='hint_verde'>Changes the note names notation; and</text><br>"+
            "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Shifts the keyboard side: left/right.</text>"+
        "<div>"

,//9
    'Shows a print preview for the current song.'

,//10    
    "Switches between the different tablature representations. Currently there are 3 different formats.&nbsp;"+
        "<text class='hint_tryit'>Try it now!</text><br>"+
        "<text class='hint_laranja'>Note: More details can be seen on the page \"https://diatonicmap.com.br/tablature\"</text>"
,//11    
    "This button shows/hides the tablature fingering (if present). <text class='hint_tryit'>Try it now!</text>"

,//12    
    "This button shows/hides the song lyrics (if present). <text class='hint_tryit'>Try it now!</text>"

,//13    
    'This button mutes/unmutes the sound of the melody during the MIDI execution.'

,//14    
    'This button mutes/unmutes the sound of the bass rhythm during the MIDI execution.'

,//15    
    'This button enables/disables a short timer before start playing.'

,//16    
    'This slide the button to controls the "Tempo" (velocity) of the MIDI execution.'

,//17    
    "This button switches between the normal execution mode and the learning mode:<br>"+
    "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Normal Mode:&nbsp;</text>"+
        "<text class='hint_verde'>Comprises a simple Play/Pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
        " and Stop <i class='ico-stop'></i><br>set of buttons to execute the partiture;</text><br>" +
    "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Learning Mode:&nbsp;</text>"+
        "<text class='hint_verde'>This mode adds a set of handful options<br>to use while you are studying the partiture.<br>"+
    "<text class='hint_laranja'>Note: Next, I will adjust the \"Learning Mode\" for the final part of the demonstration.</text>"

,//18    
    'In the \"Learning Mode\", this plays one note at time, in a step-by-step fashion.'

,//19    
    'This button plays one measure at a time or the current one until its end.'

,//20    
    'Use these text boxes to limit a set of numbered measures.<br>'+
    'If you only fill in the first field, then the chosen measure will be repeated.<br>'+
    'However, by filling both with appropriate numbers, the interval will be repeated.'

,//21    
    'This button will apply and execute the repetition you configured in the previous fields.'

,//22    
    'This stops any playback in progress and places the MIDI cursor at the starting point.'

,//23    
    'This opens a window linked to Youtube video lessons (if present).'

,//24    
    "<div class='enjoy_hint_backgr'>"+
        "This is the final product of this app: a partiture with tablature.<br>"+
        "To learn more about this tablature for accordions methodology, please, take a look at:<br>"+ 
            "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
        "You can also checkout the website version:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
        "<text class='hint_black'>Enjoy all the convenience of a bigger screen, with the same repertoire and many extra editing features!</text>"+
    "</div>"

,//25    
    "<div class='enjoy_hint_backgr'>"+
    "Finally, click <i class='ico-home'> to go back to the initial page and finish this tour.<br>"+
    "Thank you for following this until here and I hope you enjoy this app.<br>"+
    "You can reach me at <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
    "<text class='hint_black'>Your comments/suggestions/compliments or criticisms are welcome!</text><br>"+
    "</div>"

];

