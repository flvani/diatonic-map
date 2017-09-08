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
    
    if( ! options.languages ||  ! Array.isArray(options.languages) ) {
        options.languages  = [];
    }
    options.languages.push('languages/pt_BR.lang');
    
    this.languages = [];
    this.loadLanguages(options.languages, options.callback);
    
};

SITE.Translator.prototype.getLanguage = function(id) {
    
    for( var r = 0; r < this.languages.length; r ++ ) {
        if( this.languages[r].id === id)
            return this.languages[r];
    }
    
    return null;
};

SITE.Translator.prototype.getResource = function(id) {
    var res = this.currentLanguage.resources[id];
    (!res) && this.log( 'Missing translation for "' + id + '" in "' + this.currentLanguage.langName + '".' );
    return res;
};

SITE.Translator.prototype.translate = function(container) {
    
    container = container || document;
    
    var translables = container.querySelectorAll('[data-translate]');
    var translablesArray = Array.prototype.slice.apply(translables);
    
    this.currentLanguage = this.getLanguage(SITE.properties.options.language);
    
    for( var item of translablesArray ) {
        var vlr = this.currentLanguage.resources[item.getAttribute("data-translate")];
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
            this.log( 'Missing translatation for "' +item.getAttribute("data-translate") + '" in "' + this.currentLanguage.langName + '".' );
        }
    }
};    

SITE.Translator.prototype.loadLanguages = function(files, callback) {
    var toLoad = 0;
    var that = this;
    for( var f = 0; f <  files.length; f ++) {
        toLoad ++;
        FILEMANAGER.register('LANG');
        var arq = files[f];
        $.getJSON( arq, {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('LANG', true);
                that.languages.push(data);
                //that.log( data.langName + ": ok..");
             })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('LANG', false);
                that.log( "Language Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + textStatus + ", " + error +'.' );
            })
            .always(function() {
                toLoad --;
                if( toLoad === 0 ) {
                    that.currentLanguage = that.getLanguage(SITE.properties.options.language);
                    that.sortLanguaes();
                    callback && callback();
                }
            });
    }
};

SITE.Translator.prototype.sortLanguaes = function () {
    this.languages.sort( function(a,b) { 
        return parseInt(a.menuOrder) - parseInt(b.menuOrder);
    });
};

SITE.Translator.prototype.menuPopulate = function(menu, ddmId ) {
    var m, toSel;

    menu.emptySubMenu( ddmId );    
    
    for( var r = 0; r < this.languages.length; r ++ ) {
        var id = this.languages[r].id;
        var tt = '<img src="images/'+ id +'.png" />&#160;' + this.languages[r].langName;
        m = menu.addItemSubMenu( ddmId, tt + '|' + id );
        
        if( id === this.currentLanguage.id) {
            toSel = m;
        }
    }
    
    if( toSel )
        menu.setSubMenuTitle( ddmId, menu.selectItem( ddmId, toSel ));
    
};

SITE.Translator.prototype.log = function(msg) {
    if( msg.substr( 27, 6 ) === 'GAITA_' ) return;
    waterbug.log( msg );
    waterbug.show();
};
