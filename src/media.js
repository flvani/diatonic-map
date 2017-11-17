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
            var d = this.mediaWindow.menuDiv.clientHeight + (this.mediaWindow.bottomBar? this.mediaWindow.bottomBar.clientHeight : 0 );
            this.mediaWindow.dataDiv.style.width = this.mediaWindow.topDiv.clientWidth + 'px';
            this.mediaWindow.dataDiv.style.height = (this.mediaWindow.topDiv.clientHeight - d ) + 'px';
            
            if(this.youTubeURL) {
                var h = (this.mediaWindow.topDiv.clientWidth*this.proportion);
                //this.embed.style.height = h + 'px';
                this.mediaWindow.dataDiv.style.height =  h + 'px';
                this.mediaWindow.topDiv.style.height = (h + d ) + 'px';
            }
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
    var iframe = this.currTab.getElementsByTagName("iframe")[0];
    if(!iframe) return;
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo", "args":""}', '*');            
    //iframe.postMessage('{"event":"command","func":"playVideo", "args":""}', '*');            
};

SITE.Media.prototype.show = function(tab) {
    
    var that = this;
    
    var url, embed;
   
    var contentPane = this.mediaWindow.dataDiv;
    
    if(tab.abc && tab.abc.metaText.url ) {
        url = tab.abc.metaText.url;
    } 
    
    if(url) {
    
        if( url  !== this.url ) {
            this.url = url;
            
            if( window.innerWidth > 1500 )  {
                SITE.properties.mediaDiv.width = 600;
                SITE.properties.mediaDiv.height = SITE.properties.mediaDiv.width * this.proportion;
            }
            
            contentPane.style.width = SITE.properties.mediaDiv.width + 'px'; 
            contentPane.style.height = SITE.properties.mediaDiv.height + 'px';
            
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
            
            for( var r = 0; r < aUrl.length; r ++ ) {
                var mId = (this.mediaWindow.id*10 + r);
                
                this.youTubeURL = (aUrl[r].match(/www.youtube-nocookie.com/g)!== null);
                
                var dv = document.createElement('div');
                dv.className='media-content';
                contentPane.appendChild(dv);
                
                if( this.youTubeURL ) {
                    embed = '<iframe id="e'+ mId +
                                '" src="'+aUrl[r]+'?rel=0&amp;showinfo=0&amp;enablejsapi=1" frameborder="0" allowfullscreen="allowfullscreen" ></iframe>';
                    contentPane.style.overflow = 'hidden';
                } else {
                    embed = '<embed id="e'+ mId +'" src="'+aUrl[r]+'" "></embed>';
                    contentPane.style.overflow = 'auto';
                } 

                dv.innerHTML = embed;
                this.embed = document.getElementById( 'e' + mId );

                this.embed.style.width = '100%';
                this.embed.style.height = this.youTubeURL? '100%' : 'auto';
                //this.embed.style.height = this.youTubeURL? SITE.properties.mediaDiv.height + 'px' : 'auto';
                
                this.tabs['w'+mId] = dv;
                var el = document.createElement('input');
                el.id = 'w'+mId;
                el.type = 'radio';
                el.name = 'mediaControl';
                el.className  = 'tab-selector-' + r;
                this.tabDiv.appendChild(el);
                var el = document.createElement('label');
                el.htmlFor = 'w'+mId;
                el.className  = 'media-tab-label-' + r;
                el.innerHTML = 'v'+(r+1);
                this.tabDiv.appendChild(el);
            }
            
            if(this.showMediaButton)
                this.showMediaButton.style.display = (!this.useSiteProperties || SITE.properties.mediaDiv.visible )? 'none' : 'inline';
            
            // tab control
            var radios = document.getElementsByName( 'mediaControl' );
            
            this.showTab = function( id ) {
                this.pause();
                for( var m in this.tabs ) {
                    this.tabs[m].className = 'media-content';
                    if(!id) { // mostra o primeiro
                        id = m;
                        document.getElementById(id).checked = true;
                    } 
                }
                this.tabs[id].className = 'media-visible';
                this.currTab = this.tabs[id];
            };

            for( var r=0; r < radios.length; r ++ ) {
               radios[r].addEventListener('change', function() { 
                  that.showTab( this.id ); 
               });
            }

            //this.mediaWindow.c1 = document.getElementById( 'w'+this.mediaWindow.id+'c1');
            this.mediaWindow.setVisible( !this.useSiteProperties || SITE.properties.mediaDiv.visible );
            that.showTab(); // mostra a primeira aba
        }
        
        if( !this.useSiteProperties || SITE.properties.mediaDiv.visible ) {
            // ajusta o altura quando a janela está visisivel
            this.mediaWindow.topDiv.style.height = SITE.properties.mediaDiv.height 
                                                + this.mediaWindow.menuDiv.clientHeight
                                                + (this.mediaWindow.bottomBar? this.mediaWindow.bottomBar.clientHeight : 0 ) + 'px';
                                        
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
