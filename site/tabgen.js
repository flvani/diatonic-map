/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.TabGen = function( interfaceParams ) {

    var that = this;

    this.tab = { text:null, abc:null, title:null, div:null };
    
    this.mapVisible = false;

    this.tabParser = new ABCXJS.Part2Tab();
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
//    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    
//    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);

    // player control
//    this.playButton = document.getElementById(interfaceParams.playBtn);
//    this.stopButton = document.getElementById(interfaceParams.stopBtn);
//    this.currentPlayTimeLabel = document.getElementById(interfaceParams.currentPlayTimeLabel);
    
    this.ckShowWarns = document.getElementById(interfaceParams.ckShowWarns);
    //this.ckShowABC = document.getElementById(interfaceParams.ckShowABC);
    //this.ckConvertToClub = document.getElementById(interfaceParams.ckConvertToClub);
    //this.convertToClub = document.getElementById('convertToClub');
    
    //this.ckConvertToClub.checked = toClub;
    //this.convertToClub.style.display = toClub ? 'inline' : 'none';

    this.ckShowWarns.addEventListener("click", function() {
        var divWarn = document.getElementById("t2pWarningsDiv");
        if( this.checked ) {
            divWarn.style.display = 'inline';
        } else {
            divWarn.style.display = 'none';
        }
    }, false);

//    this.ckShowABC.addEventListener("click", function() {
//        var divABC = document.getElementById("t2pABCDiv");
//        if( this.checked ) {
//            divABC.style.display = 'inline';
//        } else {
//            divABC.style.display = 'none';
//        }
//    }, false);

//    this.ckConvertToClub.addEventListener("click", function() {
//        that.update();
//    }, false);

    this.textarea = document.getElementById(interfaceParams.textarea);

//    this.printButton.addEventListener("click", function() {
//        that.printPreview(that.tab.div.innerHTML, ["#divTitulo","#t2pDiv"]);
//    }, false);

//    this.saveButton.addEventListener("click", function() {
//        that.salvaPartitura();
//    }, false);
    
    this.showMapButton.addEventListener("click", function() {
        that.showMap();
    }, false);
    
    this.updateButton.addEventListener("click", function() {
        that.update();
    }, false);
    
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling(player);
    };

    this.playerCallBackOnPlay = function( player ) {
        var strTime = player.getTime().cTime;
        if(that.gotoMeasureButton)
            that.gotoMeasureButton.value = player.currentMeasure;
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = strTime;
    };

    this.playerCallBackOnEnd = function( player ) {
        var warns = that.midiPlayer.getWarnings();
        that.playButton.title = DR.getResource("playBtn");
        that.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
        that.tab.abc.midi.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        if( warns ) {
            var wd =  document.getElementById("t2pWarningsDiv");
            var txt = "";
            warns.forEach(function(msg){ txt += msg + '<br>'; });
            wd.style.color = 'blue';
            wd.innerHTML = '<hr>'+txt+'<hr>';
        }
    };

//    this.playButton.addEventListener("click", function() {
//        that.startPlay( 'normal' );
//    }, false);
//
//    this.stopButton.addEventListener("click", function() {
//        that.midiPlayer.stopPlay();
//    }, false);
    

    // inicio do setup do mapa    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );

    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );
    
    this.editorWindow = interfaceParams.editorWindow;
    this.keyboardWindow = interfaceParams.keyboardWindow;
    
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    document.getElementById("t2pSpanAccordeon").innerHTML = ' (' + this.accordion.getTxtModel() + ')'; 
    
    this.textarea.value = document.getElementById("lixo").value;
    
    this.resize();
    this.update();
    
};

SITE.TabGen.prototype.update = function() {
    var abcText = this.tabParser.parse(this.textarea.value, this.accordion.getKeyboard() );
    this.printABC( abcText );
};

SITE.TabGen.prototype.printABC = function(abcText) {
    this.tab.text = abcText;
    var divWarn = document.getElementById("t2pWarningsDiv");
    var divABC = document.getElementById("t2pABCDiv");
    
    divABC.innerHTML ='<textarea class="sourceTextarea" style="height:90%;">' +  this.tab.text + '</textarea>'; // .replace(/\n/g,'\<br\>');
   
    var warns = this.tabParser.getWarnings();
    if(warns) {
        divWarn.innerHTML = warns;
        divWarn.style.color = 'red';
    } else {
        divWarn.innerHTML = 'Tablatura extraída com sucesso!';
        divWarn.style.color = 'green';
    }
};

SITE.TabGen.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.getKeyboard() );
    }
};        

SITE.TabGen.prototype.resize = function( ) {
    var t = document.getElementById( 't2pTextarea');
    var m = document.getElementById( 't2pMenu');
    var h = document.getElementById( 't2pHeader');
    var o = document.getElementById( 't2pContentDiv');
    var i = document.getElementById( 't2pStudioCanvasDiv');

    t.style.width = parseInt(m.clientWidth) - 24 + "px";
    i.style.height = (o.clientHeight - h.clientHeight - m.clientHeight - 10) + "px";
};

SITE.TabGen.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    this.keyboardWindow.topDiv.style.display = 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('t2p_I_showMap').setAttribute('class', 'icon-folder-close' );
};

SITE.TabGen.prototype.showMap = function() {
    this.mapVisible = ! this.mapVisible;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    if(this.mapVisible) {
        this.keyboardWindow.topDiv.style.display = 'inline';
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('t2p_I_showMap').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideMap();
    }
};

SITE.TabGen.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            break;
        case 'MINUS':
            this.hideMap();
            break;
        case 'RETWEET':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM-IN':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            break;
        default:
            alert(e);
    }
};

SITE.TabGen.prototype.salvaPartitura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.tab.abc.metaText.title + ".abcx";
        var conteudo = this.tab.text;
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};

SITE.TabGen.prototype.printPreview = function (html, divsToHide) {
    var bg = document.body.style.backgroundColor;
    var dv = document.getElementById('t2pPrintPreviewDiv');
    
    divsToHide.forEach( function( div ) {
        $(div).hide();
    });
    $("#t2pPrintPreviewDiv").show();
    
    dv.innerHTML = html;
    
    document.body.style.paddingTop = '0px';
    document.body.style.backgroundColor = '#fff';
    window.print();
    document.body.style.backgroundColor = bg;
    document.body.style.paddingTop = '50px';
    
    $("#t2pPrintPreviewDiv").hide();
    divsToHide.forEach( function( div ) {
        $(div).show();
    });

};

SITE.TabGen.prototype.startPlay = function( type, value ) {
    if( this.midiPlayer.playing) {
        
        this.ypos = 1000;
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.tab.abc.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&#160;<i class="icon-pause"></i>&#160;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.tab.abc.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};

SITE.TabGen.prototype.setScrolling = function(y, channel) {
//    if( !this.tuneContainerDiv || channel > 0 ) return;
//    if( y !== this.ypos ) {
//        this.ypos = y;
//        this.tuneContainerDiv.scrollTop = this.ypos - 40;    
//    }
};
