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
    if( msg.substr( 27, 11 ) === 'CONCERTINA_' ) return;
    waterbug.log( msg );
    (SITE.properties.options.showConsole) && waterbug.show();
};
