/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
          
if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

window.dataLayer = window.dataLayer || [];

SITE.askHelp = function () {
    if( !SITE.properties.options.doNotAskHelp && SITE.properties.options.language === 'ru_RU' ){
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
                    'event_category': 'Configuration'  
                   ,'event_label': SITE.properties.options.doNotAskHelp? 'Refused': 'JustClosed'
                });
        
             }, false);
        }
    }
}

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

    SITE.askHelp();
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
