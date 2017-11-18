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

