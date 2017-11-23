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
        
    } else  if( ver === 'debug' ) {
        
        SITE.properties.options.showConsole = true;
        
    } else if( ! SITE.properties.version || SITE.properties.version === 'debug' || parseFloat( SITE.properties.version ) < parseFloat( ver )  ) {
        
        SITE.properties.version = ver;

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
        }

        SITE.SaveProperties();
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
    
    SITE.SaveProperties();
    
};
