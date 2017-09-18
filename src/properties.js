/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SITE)
    window.SITE = {};

SITE.ga = function ( p1, p2, p3, p4, p5  ){
    if( ga && SITE.getVersion('mainSITE', '' ) !== 'debug' ) {
        ga( p1, p2, p3, p4, p5 );
    } else {
        console.log('Funcao ga não definida.');
    }
};

SITE.getDate = function (){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    return yyyy*10000+mm*100+dd;
};

SITE.getVersion = function(tag, label) {
    var str = document.getElementById(tag).src;
    var res = str.match(/\_[0-9]*\.[0-9]*/g);
    return res ? label+res[0].substr(1) : 'debug';
};

SITE.LoadProperties = function() {
    
    //FILEMANAGER.removeLocal('diatonic-map.site.properties' ); // usdo para forçar reset da propriedades
    
    SITE.properties = JSON.parse( FILEMANAGER.loadLocal('diatonic-map.site.properties' ) ); 
    
    var ver = SITE.getVersion('mainSITE', '' );
    
    if( ! SITE.properties )
        SITE.ResetProperties();
    else if( ver !== 'debug' && ( ! SITE.properties.version || parseFloat( SITE.properties.version ) < parseFloat( ver ) )  ){
        SITE.properties.version = ver;
        if(SITE.properties.version === '5.06') {
            SITE.properties.options.language = 'pt_BR' ;
            SITE.properties.options.showWarnings = false;
            SITE.properties.options.showConsole = false;
            SITE.properties.options.pianoSound = false;
        }
        SITE.SaveProperties();
    }
};

SITE.SaveProperties = function() {
    FILEMANAGER.saveLocal('diatonic-map.site.properties', JSON.stringify(SITE.properties));
};

SITE.ResetProperties = function() {
    
    var language = window.navigator.userLanguage || window.navigator.language;
    
    SITE.properties = {};
    
    SITE.properties.version = SITE.getVersion('mainSITE', '' );
    
    SITE.properties.colors = {
         useTransparency: true
        ,highLight: 'red'
        ,fill: 'white'
        ,background: 'none'
        ,close: '#ff3a3a'
        ,open: '#ffba3b'
    };

    SITE.properties.options = {
         language: 'pt_BR'
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
