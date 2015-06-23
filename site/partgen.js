/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.PartGen = function( interfaceParams ) {

    var that = this;

    var toClub = (interfaceParams.accordion_options.id === 'GAITA_HOHNER_CLUB_IIIM_BR' );
    
    this.tab = { text:null, abc:null, title:null, div:null };
    
    this.mapVisible = false;

    this.tabParser = new ABCXJS.Tab2Part(toClub);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);

    // player control
    this.playButton = document.getElementById(interfaceParams.playBtn);
    this.stopButton = document.getElementById(interfaceParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(interfaceParams.currentPlayTimeLabel);
    
    this.ckShowWarns = document.getElementById(interfaceParams.ckShowWarns);
    this.ckShowABC = document.getElementById(interfaceParams.ckShowABC);
    this.ckConvertToClub = document.getElementById(interfaceParams.ckConvertToClub);
    this.convert2club = document.getElementById('convert2club');
    
    this.ckConvertToClub.checked = toClub;
    this.convert2club.style.display = toClub ? 'inline' : 'none';

    this.ckShowWarns.addEventListener("click", function() {
        var divWarn = document.getElementById("t2pWarningsDiv");
        if( this.checked ) {
            divWarn.style.display = 'inline';
        } else {
            divWarn.style.display = 'none';
        }
    }, false);

    this.ckShowABC.addEventListener("click", function() {
        var divABC = document.getElementById("t2pABCDiv");
        if( this.checked ) {
            divABC.style.display = 'inline';
        } else {
            divABC.style.display = 'none';
        }
    }, false);

    this.ckConvertToClub.addEventListener("click", function() {
        that.update();
    }, false);

    this.textarea = document.getElementById(interfaceParams.textarea);

    this.printButton.addEventListener("click", function() {
        that.printPreview(that.tab.div.innerHTML, ["#divTitulo","#t2pDiv"]);
    }, false);

    this.saveButton.addEventListener("click", function() {
        that.salvaPartitura();
    }, false);
    
    this.showMapButton.addEventListener("click", function() {
        that.showMap();
    }, false);
    
    this.updateButton.addEventListener("click", function() {
        that.update();
    }, false);
    
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling(player.currAbsElem.y, player.currChannel );
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
        that.playButton.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
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

    this.playButton.addEventListener("click", function() {
        that.startPlay( 'normal' );
    }, false);

    this.stopButton.addEventListener("click", function() {
        that.midiPlayer.stopPlay();
    }, false);
    

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
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nQ:80\nK:C\n\n" +
        "|: C.   c     | C.       c  C.    c     |  G.       g  G.    g      | G.       g  G.    g     |" + "\n" +
        "|  z 5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |                           |                         |" + "\n" +
        "|             |                         |  5'.5'.6'.4' 5'.5'.6'.4'- | 4'.5'.6'.4' 5'.5'.6'.4' |" + "\n" + "\n"  +
        "| C.       c  C.    c     | C.       c  C.    c     | G.       g  G.   g    | G.      g  G.   g    | C. c :|" + "\n" +
        "| 5'.5'.6'.4' 5'.5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |                       |                      |       |" + "\n" +
        "|                         |                         | 5'.5'.4'.5  3'.4.2'.3 | 1'.1'.3.1' 2.1'.3.2' | 3'    |" + "\n" +
        "+                                                                                                    3" + "\n" 
    ;
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| C.  c  :|"  + "\n" +
        "| 3'      |"  + "\n" +
        "+ 3       |"  
    ;
    
    this.textarea.value =
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| z          | C        c  C     c     | G     g  G     g      | G        g  G     g     |" + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                       |                         |" + "\n" +
        "|            |                         | 5' 6' 4' 5' 5' 6' 4'- | 4' 5' 6' 4' 5' 5' 6' 4' |" + "\n"
    ;
    
    this.textarea.value = // este exemplo falha em processar as duas vozes do baixo
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| z          | C        c  C     c     | G      g  G     g     | G        g  G     g     |" + "\n" +
        "|            | c                       |                       |                         |" + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                       |                         |" + "\n" +
        "|            |                         | 5'  6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |" + "\n" +
        "/            |                         |                       |                      3' |" + "\n\n" +
        "| z          | C        c  C     c     | G      g  G     g     | G        g  G     g     |" + "\n" +
        "|            | c                       |                       |                         |" + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                       |                         |" + "\n" +
        "|            |                         | 5'  6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |" + "\n" +
        "/            |                         |                       |                      3' |" + "\n" 
    ;
  
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nQ:80\nK:C\n\n" +
        "|: C.   c     | C.       c  C.    c     | G.       g  G.    g     | G.       g  G.    g     |" + "\n" +
        "|  z 5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |                         |                         |" + "\n" +
        "/    4'.5'.3' | 4'.4'.5'.3' 4'.4'.5'.3' |                         |                         |" + "\n" +
        "|             |                         | 5'.5'.6'.4' 5'.5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |" + "\n" + 
        "/             |                         | 4'.4'.5'.3' 4'.4'.5'.3' | 4'.4'.5'.3' 4'.4'.5'.3' |" + "\n" + "\n" 
    ;    
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nQ:80\nK:C\n\n" +
        "|: C. c C. c     |" + "\n" +
        "|  5'   6        |" + "\n" +
        "|                |" + "\n" + "\n" 
    ;    
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| C         am    c     |: D  d  :|"  + "\n" +
        "%| c " + "\n" +
        "|           5' 6' 4' 4' |  8      |"  + "\n" +
        "| 5' 5' 4 3             |     8   |"  + "\n" +
        "+ 3  2                     2  4  "+ "\n" + "\n" +
        "| G        g  G     g     |"  + "\n" +
        "|             5' 5' 6' 4' |"  + "\n" +
        "| 5' 5' 6' 4'             |" 
    ;
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| C          am     A     |: C  d  :|"  + "\n" +
        "| 5' 5' 4 2               |  8      |"  + "\n" +
        "|            5'  6  4' 4' |     8   |"  + "\n" +
        "+                            2  4  "  
    ;
    
    this.textarea.value = 
//        "%elementos são posicionais e separados por espaços.\n" +
//        "%cada elemento tem duracao L.\n" +
//        "%a duração do elemento é computada até encontrar o próximo ou a barra de compasso.\n" +
//        "%.\n" +
//        "%\n" +
//        "%\n" +
//        "%\n" +
//        "%linha começa com '|' e continuação de linha com '/'.\n\n" + 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nQ:80\nK:C\n\n" +
        "|: C.   c     | C.       c  C.    c     | G.       g  G.    g     | G.       g  G.    g     |" + "\n" +
        "|  z 5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |                         |                         |" + "\n" +
        "|             |                         | 5'.5'.6'.4' 5'.5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |" + "\n" + "\n" +
        "| C.       c  C.    c     | C.       c  C.    c     | G.       g  G.   g    | G.      g  G.   g    | C. c :|" + "\n" +
        "| 5'.5'.6'.4' 5'.5'.6'.4' | 5'.5'.6'.4' 5'.5'.6'.4' |                       |                      |       |" + "\n" +
        "|                         |                         | 5'.5'.4'.5  3'.4.2'.3 | 1'.1'.3.1' 2.1'.3.2' | 3'    |" + "\n" +
        "+                                                                                                    3" 
    ;
    
    this.resize();
    this.update();
    
};
SITE.PartGen.prototype.update = function() {
    var abcText = this.tabParser.parse(this.textarea.value, this.accordion.getKeyboard(), this.ckConvertToClub.checked );
    this.printABC( abcText );
};

SITE.PartGen.prototype.printABC = function(abcText) {
    this.tab.text = abcText;
    var divWarn = document.getElementById("t2pWarningsDiv");
    var divABC = document.getElementById("t2pABCDiv");
    
    divABC.innerHTML = this.tab.text.replace(/\n/g,'\<br\>');
   
    var warns = this.tabParser.getWarnings();
    if(warns) {
        divWarn.innerHTML = warns;
        divWarn.style.color = 'red';
    } else {
        divWarn.innerHTML = 'Partitura gerada com sucesso!';
        divWarn.style.color = 'green';
    }
    
    this.tab.div = document.getElementById("t2pCanvasDiv");
    
    this.parseABC(this.tab);
    
    this.tab.div.innerHTML = "";
    var paper = Raphael(this.tab.div, 700, 200);
    var printer = new ABCXJS.write.Printer( paper );
    
    printer.printABC(this.tab.abc);
    
};

SITE.PartGen.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.getKeyboard() );
    }
};        

SITE.PartGen.prototype.resize = function( ) {
    var t = document.getElementById( 't2pTextarea');
    var m = document.getElementById( 't2pMenu');
    var h = document.getElementById( 't2pHeader');
    var o = document.getElementById( 't2pContentDiv');
    var i = document.getElementById( 't2pStudioCanvasDiv');

    t.style.width = parseInt(m.clientWidth) - 24 + "px";
    i.style.height = (o.clientHeight - h.clientHeight - m.clientHeight - 10) + "px";
};

SITE.PartGen.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    this.keyboardWindow.topDiv.style.display = 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('t2p_I_showMap').setAttribute('class', 'icon-folder-close' );
};

SITE.PartGen.prototype.showMap = function() {
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

SITE.PartGen.prototype.keyboardCallback = function( e ) {
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

SITE.PartGen.prototype.salvaPartitura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.tab.abc.metaText.title + ".abcx";
        var conteudo = this.tab.text;
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};

SITE.PartGen.prototype.printPreview = function (html, divsToHide) {
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

SITE.PartGen.prototype.startPlay = function( type, value ) {
    if( this.midiPlayer.playing) {
        
        this.ypos = 1000;
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.tab.abc.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.tab.abc.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};

SITE.PartGen.prototype.setScrolling = function(y, channel) {
//    if( !this.tuneContainerDiv || channel > 0 ) return;
//    if( y !== this.ypos ) {
//        this.ypos = y;
//        this.tuneContainerDiv.scrollTop = this.ypos - 40;    
//    }
};
