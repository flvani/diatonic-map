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

    this.studioCanvasDiv.appendChild(this.keyboardDiv);
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
            this.accordion = new window.ABCXJS.tablature.Accordion( 
                  interfaceParams.accordion_options 
                , SITE.properties.options.tabFormat 
                ,!SITE.properties.options.tabShowOnlyNumbers );
            if (interfaceParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(interfaceParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + interfaceParams.generate_tablature + ' não suportada!');
        }
    }

    this.accordion.setRenderOptions({
        draggable: false
       ,show: SITE.properties.studio.keyboard.visible
       ,transpose: SITE.properties.studio.keyboard.transpose
       ,mirror: SITE.properties.studio.keyboard.mirror
       ,scale: 0.85
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
            ["#topBar","#appDiv", "#keyboardDiv", "#studioDiv" ], 
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
            SITE.properties.options.rowsNumbered = !SITE.properties.options.rowsNumbered;
            that.parserparams.ilheirasNumeradas = SITE.properties.options.rowsNumbered;
            that.fireChanged(0, {force:true, showProgress:true } );
        //}, 0 );
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

    this.accordion.loadById(accordionId);
    
    this.renderedTune.abc = tab.abc;
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    
    this.changePlayMode(SITE.properties.studio.mode);
    this.setBassIcon();
    this.setTrebleIcon();
    this.setTimerIcon( 0 );

    this.Div.setTitle( this.accordion.getTxtModel() + ' ' +  this.accordion.getTxtTuning() );
    this.Div.setSubTitle( '- ' + tab.title );


    SITE.translator.translate( this.Div.topDiv );

    this.Div.setMenuVisible(true);

    this.showKeyboard(SITE.properties.studio.keyboard.visible);
    
    this.fireChanged(0, {force:true} );

    this.outerCanvasDiv.scrollTop = 0;

};

SITE.AppView.prototype.printKeyboard = function() {

    this.accordion.printKeyboard( this.keyboardDiv );
    this.kbDivs = this.accordion.loadedKeyboard.divs;

    if (this.kbDivs && this.kbDivs.extras) {

        that = this;

        this.kbDivs.imagem.style.top = this.kbDivs.pane.clientHeight-100 + "px";
        this.kbDivs.imagem.style.zIndex = '102';
        this.kbDivs.imagem.className = 'circular';
        this.kbDivs.imagem.innerHTML = 
            '<img src="'+this.app.accordion.loaded.image+'" title="' +
        this.app.accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '">';
        this.kbDivs.imagem.style.display = 'block';

        this.kbDivs.extras.innerHTML = 
           '<button id="rotateBtnExtra" data-translate="rotate" ><i class="ico-rotate" ></i></button>\
            <button id="globeBtnExtra"  data-translate="globe" ><i class="ico-world" ></i></button>'
        this.kbDivs.extras.style.top = '1px';
        this.kbDivs.extras.style.left = '1px';
        this.kbDivs.extras.className = 'keyboard-btn-group';
        this.kbDivs.extras.style.zIndex = '102';
        this.kbDivs.extras.style.display = 'inline';

        this.rotateBtnExtra = document.getElementById("rotateBtnExtra");
        this.globeBtnExtra = document.getElementById("globeBtnExtra");

        this.rotateBtnExtra.addEventListener("click", function (evt) {
            evt.preventDefault();
            that.keyboardCallback('ROTATE');
        }, false);

        this.globeBtnExtra.addEventListener("click", function (evt) {
            evt.preventDefault();
            that.keyboardCallback('GLOBE');
        }, false);

        SITE.translator.translate( this.kbDivs.extras );
            
    }

    this.keyboardMirrorElements()

}

SITE.AppView.prototype.keyboardMirrorElements = function( e ) {

    if (this.kbDivs && this.kbDivs.extras) {
        if(SITE.properties.studio.keyboard.mirror){
            this.kbDivs.extras.style.right = '';
            this.kbDivs.extras.style.left = '5px';
            this.kbDivs.imagem.style.right = '';
            this.kbDivs.imagem.style.left = '20px';
        } else{
            this.kbDivs.extras.style.right = '5px';
            this.kbDivs.extras.style.left = '';
            this.kbDivs.imagem.style.right = '20px';
            this.kbDivs.imagem.style.left = '';
        }
    }
}

SITE.AppView.prototype.showKeyboard = function(show) {
    SITE.properties.studio.keyboard.visible = 
            (typeof show === 'undefined'? ! SITE.properties.studio.keyboard.visible : show );
    
    this.accordion.render_opts.show = SITE.properties.studio.keyboard.visible;
    
    if(SITE.properties.studio.keyboard.visible) {
        //this.keyboardDiv.setVisible(true);
        this.keyboardDiv.style.display = 'inline-block';
        this.printKeyboard();
        this.showMapButton.innerHTML = '<i class="ico-keyboard" ></i>';
    } else {
        //this.keyboardDiv.setVisible(false);
        this.accordion.render_opts.show = false;
        this.keyboardDiv.style.display = 'none';
        this.showMapButton.innerHTML = '<i class="ico-keyboard" style="opacity:0.5; filter: grayscale(1);"></i>'+
                                                         '<i class="ico-forbidden" style="position:absolute;left:4px;top:4px; filter: grayscale(1);"></i>';
    }
    this.resize();

};

SITE.AppView.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardDiv);
            this.accordion.rotateKeyboard(this.keyboardDiv);
            SITE.properties.studio.keyboard.transpose = this.accordion.render_opts.transpose;
            SITE.properties.studio.keyboard.mirror = this.accordion.render_opts.mirror;
            this.keyboardMirrorElements();
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
    if( !this.outerCanvasDiv || !player.currAbsElem || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.outerCanvasDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top-12;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        
        this.ypos = top;
        this.outerCanvasDiv.scrollTop = this.ypos;    
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
    this.ypos = this.outerCanvasDiv.scrollTop;
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
    this.outerCanvasDiv.scrollTop = this.lastYpos;
};

SITE.AppView.prototype.fireChanged = function (transpose, _opts) {
    
    if( this.changing ) return;
    
    this.lastYpos = this.outerCanvasDiv.scrollTop || 0;               
    
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


    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

    var w = (winW - 2 ); 
    var h = (winH - 4 ); 
    var l = SITE.properties.studio.keyboard.visible? this.keyboardDiv.clientWidth+1 : 0;

    //this.Div.topDiv.style.height = Math.max(h,300) +"px";
    //this.Div.topDiv.style.width = Math.max(w,570) +"px";

    this.Div.resize();

    var c = this.controlDiv.clientHeight;
    var d = this.Div.dataDiv.clientHeight;
    var dw = this.Div.dataDiv.clientWidth;

    this.studioCanvasDiv.style.height = Math.max(d,300) +"px";
    this.outerCanvasDiv.style.height = this.studioCanvasDiv.clientHeight-c-15 + "px";
    this.canvasDiv.style.height = this.outerCanvasDiv.clientHeight - 4 + "px";

    
    this.studioCanvasDiv.style.width = Math.max(dw,600) +"px";
    this.canvasDiv.style.width = Math.min(1025,Math.max(w-l-10,100)) +"px";
    this.outerCanvasDiv.style.width = this.canvasDiv.clientWidth+4 + "px"; 


//    this.outerCanvasDiv.style.width = this.canvasDiv.clientWidth+4 +"px";
//    this.canvasDiv.style.width = Math.min(1025,Math.max(w-l-10,100)) +"px";


    if(this.kbDivs.container){
        this.kbDivs.container.style.height = this.canvasDiv.clientHeight+4 +"px";

        if( SITE.properties.options.keyboardRight ){
            this.kbDivs.container.style.float = '';
            this.outerCanvasDiv.style.float = 'left';
            this.outerCanvasDiv.classList.remove("boxShadow");
            this.kbDivs.container.classList.add("boxShadow");
        } else {
            this.kbDivs.container.style.float = 'left';
            this.outerCanvasDiv.style.float = '';
            this.outerCanvasDiv.classList.add("boxShadow");
            this.kbDivs.container.classList.remove("boxShadow");
        }
    }

    this.media.posiciona();
        
    (this.ps) && this.ps.update();

}