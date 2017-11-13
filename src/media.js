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
    
    /* EMBRIAO DO QUE SERÁ MEDIA COM MULTIPLAS ABAS */
    
    
//    var a = document.createElement('div');
//    a.style.cssText = 'position:absolute; left:0; top:100%;';
//    a.className='tabs';
//    this.mediaWindow.topDiv.appendChild(a);
//    this.mediaWindow.topDiv.style.overflow = 'visible';
//
//    this.mediaWindow.dataDiv.innerHTML = '\n\
//        <div id="c" class="tv-content customScrollBar">\n\
//            <div class="tv-content-1">\n\
//                <div id="c1" ></div>\n\
//            </div>\n\
//            <div class="tv-content-2" >\n\
//                <div id="c2" ></div>\n\
//            </div>\n\
//            <div class="tv-content-3">\n\
//                <div id="c3"></div>\n\
//            </div>\n\
//        </div>\n\
//';
//    a.innerHTML = '\n\
//        <input id="t1" type="radio" name="mediaControl" class="tab-selector-1" />\n\
//        <label for="t1" class="tab-label-1" >V1</label>\n\
//\n\
//        <input id="t2" type="radio" name="mediaControl" class="tab-selector-2" />\n\
//        <label for="t2" class="tab-label-2" >V2</label>\n\
//\n\
//        <input id="t3" type="radio" name="mediaControl" class="tab-selector-3" />\n\
//        <label for="t3" class="tab-label-3" >v3</label>\n\
//';
//    
//    this.mediaWindow.c1 = document.getElementById( 'c1');
    
};

SITE.Media.prototype.callback = function( e ) {
    switch(e) {
        case 'RESIZE':
            var d = this.mediaWindow.menuDiv.clientHeight + (this.mediaWindow.bottomBar? this.mediaWindow.bottomBar.clientHeight : 0 );
            this.mediaWindow.dataDiv.style.width = this.mediaWindow.topDiv.clientWidth + 'px';
            this.mediaWindow.dataDiv.style.height = (this.mediaWindow.topDiv.clientHeight - d ) + 'px';
            
            if(this.youTubeURL) {
                var h = (this.mediaWindow.topDiv.clientWidth*this.proportion);
                this.embed.style.height = h + 'px';
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
    if(!this.mediaWindow) return;
    var iframe = this.mediaWindow.dataDiv.getElementsByTagName("iframe")[0];
    if(!iframe) return;
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo", "args":""}', '*');            
    //iframe.postMessage('{"event":"command","func":"playVideo", "args":""}', '*');            
};

SITE.Media.prototype.show = function(tab) {
    
    var url, embed;
    
    var contentPane = this.mediaWindow.dataDiv;
    //var contentPane = this.mediaWindow.c1;
    
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

            this.youTubeURL = (url.match(/www.youtube-nocookie.com/g)!== null);
            
            if( this.youTubeURL ) {
                embed = '<iframe id="e'+ this.mediaWindow.id +
                            '" src="'+url+'?rel=0&amp;showinfo=0&amp;enablejsapi=1" frameborder="0" allowfullscreen="allowfullscreen" ></iframe>';
                contentPane.style.overflow = 'hidden';
            } else {
                embed = '<embed id="e'+ this.mediaWindow.id +'" src="'+url+'" "></embed>';
                contentPane.style.overflow = 'auto';
            } 
            
            contentPane.innerHTML = embed;
            this.embed = document.getElementById('e' + this.mediaWindow.id);
            
            this.embed.style.width = '100%';
            this.embed.style.height = this.youTubeURL? SITE.properties.mediaDiv.height + 'px' : 'auto';
            
            
            if(this.showMediaButton)
                this.showMediaButton.style.display = SITE.properties.mediaDiv.visible? 'none' : 'inline';
            
            this.mediaWindow.setVisible( !this.useSiteProperties || SITE.properties.mediaDiv.visible );
            
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
