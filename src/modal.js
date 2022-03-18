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

        top= "200px";
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
/*
    SITE.ga('event', 'page_view', {
        page_title: SITE.translator.getResource(subTitle || title)
        , page_path: SITE.root + '/help'
    })
*/
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
