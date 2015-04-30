/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *      Ok - definir callback on end midi    
 *      Ok - Acertar casa 2 no xote laranjeira    
 *  
 */

if (!window.SITE)
    window.SITE = {};

SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.currentTab = '';
    this.currentABC = null;
    
    this.studio = tabParams.studio;
    
    // tab control
    this.renderedTune = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    this.renderedChord = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    this.renderedPractice = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    
    this.renderedTune.div = document.getElementById(tabParams.songDiv);
    this.renderedTune.parms = tabParams.songSelectorParms;
    this.renderedTune.selector = document.getElementById(this.renderedTune.parms.div);
    this.renderedPractice.div = document.getElementById(tabParams.practiceDiv);
    this.renderedPractice.parms = tabParams.practiceSelectorParms;
    this.renderedPractice.selector = document.getElementById(this.renderedPractice.parms.div);
    this.renderedChord.div = document.getElementById(tabParams.chordDiv);
    this.renderedChord.parms = tabParams.chordSelectorParms;
    this.renderedChord.selector = document.getElementById(this.renderedChord.parms.div);
    
    // player control
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(playerParams.currentPlayTimeLabel);

    // screen control
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.buttonChangeNotation = document.getElementById(interfaceParams.btChangeNotation);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    
    this.tuneContainerDiv = document.getElementById(interfaceParams.tuneContainerDiv);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);

    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.toolsButton = document.getElementById(interfaceParams.toolsBtn);
   
    this.printButton.addEventListener("click", function() {

        if(  that.currentABC.div.innerHTML && that.studio )  {
            that.studio.printPreview(that.currentABC.div.innerHTML, ["#divTitulo","#mapContainerDiv"]);
        }
        
    }, false);

    this.toolsButton.addEventListener("click", function() {
        
        if( that.currentABC.div.innerHTML && that.studio ) {
            that.showStudio();
        }
        
    }, false);

    this.buttonChangeNotation.addEventListener("click", function() {
        that.accordion.changeNotation();
    }, false );
    
    this.checkboxHorizontal.addEventListener('click', function() {
        that.accordion.layoutKeyboard( {transpose: this.checked }, that.keyboardDiv );
    }, false );

    this.checkboxEspelho.addEventListener('click', function() {
        that.accordion.layoutKeyboard( {mirror: this.checked }, that.keyboardDiv );
    }, false );
   
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
        that.currentABC.abc.midi.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        if( warns ) {
            var wd =  document.getElementById("warningsDiv");
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
    this.keyboardDiv = interfaceParams.keyboardDiv;
    this.loadAccordionList();
    this.showAccordionName();
    this.showAccordionImage();
    this.loadOriginalRepertoire();
    
    DR.addAgent( this ); // register for translate
    
    this.accordion.printKeyboard(this.keyboardDiv);
};

SITE.Mapa.prototype.setup = function (tabParams) {

    var gaita = this.accordion.loadById(tabParams.accordionId);

    if (!gaita) {
        console.log('Gaita não encontrada!');
        return;
    }

    if (!gaita.localResource) { // não salva informação para acordeon local
        FILEMANAGER.saveLocal('property.accordion', gaita.getId());
    }

    this.showAccordionName();
    this.showAccordionImage();
    this.midiPlayer.reset();

    this.loadOriginalRepertoire(tabParams);

    return gaita;

};
SITE.Mapa.prototype.loadOriginalRepertoire = function (tabParams) {
    var self = this;
    var loader = this.startLoader( "LoadRepertoire" );
    loader.start(  function() { self.loadOriginalRepertoire2(tabParams,loader); }, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
};
    
SITE.Mapa.prototype.loadOriginalRepertoire2 = function (tabParams, loader) {
    tabParams = tabParams || {};

    this.renderedPractice.title = tabParams.practiceTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.practice.title')
        || this.getSelectedAccordion().getFirstPractice();

    this.loadABCList('practice');
    this.renderTAB( this.currentTab === "tabPractices", 'practice' );

    this.renderedChord.title = tabParams.chordTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.chord.title')
        || this.getSelectedAccordion().getFirstChord();

    this.loadABCList('chord');
    this.renderTAB( this.currentTab === "tabChords", 'chord' );

    this.renderedTune.title = tabParams.songTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.song.title')
        || this.getSelectedAccordion().getFirstSong();

    this.loadABCList('song');
    this.renderTAB( this.currentTab === "tabTunes", 'song' );
    
    loader.stop();

};
SITE.Mapa.prototype.showStudio = function () {
    var self = this;
    var loader = this.startLoader( "Studio" );
    loader.start(  function() { self.showStudio2(loader); }, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );

};
SITE.Mapa.prototype.showStudio2 = function (loader) {
    
    $("#mapContainerDiv").hide();
    document.getElementById("divMenuAccordions").style.pointerEvents = 'none';
    document.getElementById("divMenuRepertoire").style.pointerEvents = 'none';
    document.getElementById("DR_accordions").style.color = 'gray';
    document.getElementById("DR_repertoire").style.color = 'gray';
    $("#studioDiv").show();
    this.studio.setup(this.currentABC, this.getSelectedAccordion().getId());
    this.setupProps();
    loader.stop();
};

SITE.Mapa.prototype.setupProps = function () {
    var props = FILEMANAGER.loadLocal('property.studio.settings');
    //props = null; // debug
   
    if( props ) {
        props = props.split('|');
        this.studio.textVisible                      = (props[0] === 'true');
        this.studio.editorVisible                    = (props[1] === 'true');
        this.studio.mapVisible                       = (props[2] === 'true');
        this.studio.editorWindow.topDiv.style.top    = props[3]; 
        this.studio.editorWindow.topDiv.style.left   = props[4]; 
        this.studio.keyboardWindow.topDiv.style.top  = props[5]; 
        this.studio.keyboardWindow.topDiv.style.left = props[6]; 
        this.studio.accordion.render_keyboard_opts.scale = parseFloat(props[7]);
        this.studio.accordion.render_keyboard_opts.mirror  = (props[8] === 'true');
        this.studio.accordion.render_keyboard_opts.transpose = (props[9] === 'true');
        
        this.studio.textVisible    = ! this.studio.textVisible;
        this.studio.editorVisible  = ! this.studio.editorVisible;
        this.studio.mapVisible     = ! this.studio.mapVisible;
        this.studio.showABCXText();
        this.studio.showEditor();
        this.studio.showMap();
    }
};

SITE.Mapa.prototype.restoreStudio = function () {
    this.studio.textVisible = true;
    this.studio.editorVisible = false;
    this.studio.mapVisible = false
    this.studio.editorWindow.topDiv.style.top = "120px";
    this.studio.editorWindow.topDiv.style.left = "40px";
    this.studio.keyboardWindow.topDiv.style.top = "120px";
    this.studio.keyboardWindow.topDiv.style.left = "900px";
    this.studio.accordion.render_keyboard_opts.scale = 0.8;
    this.studio.accordion.render_keyboard_opts.mirror = false;
    this.studio.accordion.render_keyboard_opts.transpose = false;
    
    FILEMANAGER.saveLocal( 'property.studio.settings', 
        this.studio.textVisible 
        + '|' + this.studio.editorVisible 
        + '|' + this.studio.mapVisible 
        + '|' + this.studio.editorWindow.topDiv.style.top
        + '|' + this.studio.editorWindow.topDiv.style.left
        + '|' + this.studio.keyboardWindow.topDiv.style.top
        + '|' + this.studio.keyboardWindow.topDiv.style.left
        + '|' + this.studio.accordion.render_keyboard_opts.scale
        + '|' + this.studio.accordion.render_keyboard_opts.mirror
        + '|' + this.studio.accordion.render_keyboard_opts.transpose
        );

    this.setupProps();
};

SITE.Mapa.prototype.closeStudio = function () {
    var self = this;
    var loader = this.startLoader( "Studio" );
    loader.start(  function() { self.closeStudio2(loader); }, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
};
    
SITE.Mapa.prototype.closeStudio2 = function (loader) {
    FILEMANAGER.saveLocal( 'property.studio.settings', 
        this.studio.textVisible 
        + '|' + this.studio.editorVisible 
        + '|' + this.studio.mapVisible 
        + '|' + this.studio.editorWindow.topDiv.style.top
        + '|' + this.studio.editorWindow.topDiv.style.left
        + '|' + this.studio.keyboardWindow.topDiv.style.top
        + '|' + this.studio.keyboardWindow.topDiv.style.left
        + '|' + this.studio.accordion.render_keyboard_opts.scale
        + '|' + this.studio.accordion.render_keyboard_opts.mirror
        + '|' + this.studio.accordion.render_keyboard_opts.transpose
        );

    $("#studioDiv").fadeOut();
    document.getElementById("divMenuAccordions").style.pointerEvents = 'auto';
    document.getElementById("divMenuRepertoire").style.pointerEvents = 'auto';
    document.getElementById("DR_accordions").style.color = 'inherit';
    document.getElementById("DR_repertoire").style.color = 'inherit';
    $("#mapContainerDiv").fadeIn();
    this.printTab();
    loader.stop();
};

SITE.Mapa.prototype.startPlay = function( type, value ) {
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
            if( this.midiPlayer.startPlay(this.currentABC.abc.midi) ) {
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
                this.ypos = 1000;
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.currentABC.abc.midi, type, value ) ) {
                this.ypos = 1000;
            }
        }
    }
};

SITE.Mapa.prototype.setScrolling = function(y, channel) {
    if( !this.tuneContainerDiv || channel > 0 ) return;
    if( y !== this.ypos ) {
        this.ypos = y;
        this.tuneContainerDiv.scrollTop = this.ypos - 40;    
    }
};

SITE.Mapa.prototype.rotateKeyboard = function() {
    this.accordion.rotateKeyboard();
};

SITE.Mapa.prototype.scaleKeyboard = function() {
    this.accordion.scaleKeyboard();
};

SITE.Mapa.prototype.loadAccordionList  = function() {
    var accordions = this.accordion.accordions;
    var ord = [];
    for (var c=0; c < accordions.length; c++) {
       ord.push( [ parseInt( accordions[c].menuOrder ), accordions[c].getFullName() , accordions[c].getId() ] );
    }

    ord.sort(function(a, b) {
        return b - a;
    });

    $('#opcoes_gaita').empty();

    for (var c=0; c < ord.length; c++) {
        $('#opcoes_gaita').append('<li><a href="#" id="pop_gaita_' +
            c  +'" onclick="setupGaita(\''+ ord[c][2] +'\')">' + ord[c][1] + ' ' + DR.getResource('DR_keys')  + '</a></li>');
    }

    $('#opcoes_gaita')
        .append('<hr style="height: 3px; margin: 5px;">')
        .append('<li><a id="extra1" href="#" onclick="saveMap();">' + DR.getResource('DR_save_map') + '</a></li>')
        .append('<li><a id="extra2" href="#" onclick="document.getElementById(\'fileLoadMap\').click();">' + DR.getResource('DR_load_map') + '</a></li>');
};

SITE.Mapa.prototype.salvaRepertorio = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var accordion = this.getSelectedAccordion();
        var name = accordion.id + ".abcx";
        var conteudo = "";
        for( var title in accordion.songs.items) {
          conteudo += accordion.songs.items[title] + '\n\n';
        }
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.getResource("DR_err_saving"));
    }    
};

SITE.Mapa.prototype.save = function() {
    var accordion = this.getSelectedAccordion();
    var txtAccordion = 
            '{\n'+
            '   "id":'+JSON.stringify(accordion.id)+'\n'+
            '  ,"menuOrder":'+JSON.stringify(accordion.menuOrder+100)+'\n'+
            '  ,"model":'+JSON.stringify(accordion.model)+'\n'+
            '  ,"tuning":'+JSON.stringify(accordion.tuning)+'\n'+
            '  ,"buttons":'+JSON.stringify(accordion.buttons)+'\n'+
            '  ,"pedal":'+JSON.stringify(accordion.keyboard.pedalInfo)+'\n'+
            '  ,"keyboard":\n'+
            '  {\n'+
            '     "layout":'+JSON.stringify(accordion.keyboard.layout)+'\n'+
            '     ,"keys":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.keys.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.keys.open)+'\n'+
            '     }\n'+
            '     ,"basses":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.basses.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.basses.open)+'\n'+
            '     }\n'+
            '  }\n'+
            '}\n';
    
    FILEMANAGER.download( accordion.getName() + '.accordion', txtAccordion );
};

SITE.Mapa.prototype.load = function(files) {
    
    var newAccordion, newAccordionJSON, newImage;
    var newTunes = "", newChords = "", newPractices = "";
    
    for(var f = 0; f < files.length; f++ ){
        if( files[f].type === 'image' ) {
           newImage = files[f].content;
        } else {
             switch(files[f].extension.toLowerCase()) {
                 case 'accordion':
                    newAccordionJSON = JSON.parse( files[f].content );
                    break;
                 case 'tunes':
                    newTunes = files[f].content;
                    break;
                 case 'chords':
                    newChords = files[f].content;
                    break;
                 case 'practices':
                    newPractices = files[f].content;
                    break;
             }
        }
    }
            
    newAccordionJSON.image = newImage || 'img/accordion.default.gif';
    
    if( ! this.accordionExists(newAccordionJSON.id) ) {
        newAccordion = new DIATONIC.map.AccordionMap( newAccordionJSON, true );
        
        DIATONIC.map.accordionMaps.push( newAccordion );
        this.loadAccordionList();
        //this.editor.accordionSelector.updateAccordionList();
    }   
    
    if( ! this.accordionIsCurrent(newAccordionJSON.id) ) {
        this.setup({accordionId:newAccordionJSON.id});
    }   
    
    var accordion = this.getSelectedAccordion();
    
    if( newTunes ) {
        var tunebook = new ABCXJS.TuneBook(newTunes);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.songs.sortedIndex.sort();
        this.renderedTune.title = accordion.getFirstSong();
        this.loadABCList('song');
        this.renderTAB( this.currentTab === "tabTunes", 'song' );
    }
    if( newChords ) {
        var tunebook = new ABCXJS.TuneBook(newChords);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.chords.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.chords.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.chords.sortedIndex.sort();
        this.renderedChord.title = accordion.getFirstChord();;
        this.loadABCList('chord');
        this.renderTAB( this.currentTab === "tabChords", 'chord' );
    }
    if( newPractices ) {
        var tunebook = new ABCXJS.TuneBook(newPractices);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.practices.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.practices.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.practices.sortedIndex.sort();
        this.renderedPractice.title = accordion.getFirstPractice();
        this.loadABCList('practice');
        this.renderTAB( this.currentTab === "tabPractices", 'practice' );
    }
};

SITE.Mapa.prototype.carregaRepertorio = function(original, files) {
    var that = this;
    var accordion = that.getSelectedAccordion();
    if (original) {
        if( accordion.localResource ) {
            console.log( 'Can\'t reload repertoire for local accordion!');
            return;
        }
        accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  // devido à falta de sincronismo, preciso usar o call back;
            that.renderedTune.title = accordion.getFirstSong();
            that.loadABCList('song');
            that.renderTAB( that.currentTab === "tabTunes", 'song' );
            
        });
    } else {
        accordion.songs = { items:{}, sortedIndex: [] };
        for (var s = 0; s < files.length; s++) {
            var tunebook = new ABCXJS.TuneBook(files[s].content);
            for (var t = 0; t < tunebook.tunes.length; t++) {
                accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
            }    
        }
        accordion.songs.sortedIndex.sort();
        that.renderedTune.title = accordion.getFirstSong();
        that.loadABCList('song');
        that.renderTAB( this.currentTab === "tabTunes", 'song' );
    }
};

SITE.Mapa.prototype.showAccordionImage = function() {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+this.getSelectedAccordion().getPathToImage()
        +'" alt="'+this.getSelectedAccordion().getFullName() + ' ' + DR.getResource('DR_keys') + '" style="height:200px; width:200px;" />';
};

SITE.Mapa.prototype.showAccordionName = function() {
  this.gaitaNamePlaceHolder.innerHTML = this.getSelectedAccordion().getFullName() + ' ' + DR.getResource('DR_keys');
};

SITE.Mapa.prototype.defineActiveTab = function( which ) {
    this.currentTab = which;
    this.midiPlayer.reset();
    if(this.currentABC)
        this.currentABC.selector.style.display  = 'none';
    switch (this.currentTab) {
        case "tabTunes":
            this.currentABC = this.renderedTune;
            break;
        case "tabChords":
            this.currentABC = this.renderedChord;
            break;
        case "tabPractices":
            this.currentABC = this.renderedPractice;
            break;
    }
    this.currentABC.selector.style.display  = 'inline';
};

SITE.Mapa.prototype.printTab = function( ) {
    var accordion = this.getSelectedAccordion();
    this.accordion.printKeyboard(this.keyboardDiv);
    
    var t = this.studio.editArea.getString();
    if( t === this.currentABC.text ) 
        return;
    
    this.currentABC.text = t;

    switch (this.currentTab) {
        case "tabTunes":
            accordion.setSong(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'song' );
            break;
        case "tabChords":
            accordion.setChord(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'chord' );
            break;
        case "tabPractices":
            accordion.setPractice(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'practice' );
            break;
    }
};

SITE.Mapa.prototype.accordionExists = function(id) {
    return this.accordion.accordionExists(id);
};

SITE.Mapa.prototype.accordionIsCurrent = function(id) {
    return this.accordion.accordionIsCurrent(id);
};

SITE.Mapa.prototype.getSelectedAccordion = function() {
    return this.accordion.accordions[this.accordion.selected];
};

SITE.Mapa.prototype.showABC = function(type, i) {
    var self = this;
    var loader = this.startLoader( "TABLoader" + type );
    loader.start(  function() { self.showABC2(type, i, loader); }, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
};

SITE.Mapa.prototype.showABC2 = function(type, i, loader ) {
    var tab;
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            tab.title = this.getSelectedAccordion().songs.sortedIndex[i];
            break;
        case 'practice':
            tab = this.renderedPractice;
            tab.title = this.getSelectedAccordion().practices.sortedIndex[i];
            break;
        case 'chord':
            tab = this.renderedChord;
            tab.title = this.getSelectedAccordion().chords.sortedIndex[i];
            break;
    };
    
    FILEMANAGER.saveLocal( 'property.'+this.getSelectedAccordion().getId()+'.'+type+'.title', tab.title );
    document.getElementById( tab.parms.span ).innerHTML = (tab.title.length>43 ? tab.title.substr(0,40) + "..." : tab.title);
    this.renderTAB( true, type );
    this.tuneContainerDiv.scrollTop = 0;    
    
    loader.stop();
};

SITE.Mapa.prototype.loadABCList = function(type) {
    var tab;
    var items;
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            items = this.getSelectedAccordion().songs.sortedIndex;
            break;
        case 'practice':
            tab = this.renderedPractice;
            items = this.getSelectedAccordion().practices.sortedIndex;
            break;
        case 'chord':
            tab = this.renderedChord;
            items = this.getSelectedAccordion().chords.sortedIndex;
            break;
    };
    
    $('#' + tab.parms.ul ).empty();
    $('#' + tab.parms.span ).empty();

    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        if(title === tab.title ) {
            document.getElementById(tab.parms.span).innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        }    
        
        $('#' + tab.parms.ul ).append(
            '<li ><a href="#" id="' + type + i +'" onclick="showABC(\''+ type +'\',\''+ i +'\')">' + 
            (title.length>43 ? title.substr(0,40) + "..." : title)  + '</a></li>'
        );
    }   
};

SITE.Mapa.prototype.renderTAB = function(alreadyOnPage, type, params) {
    var tab;
    
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            tab.text = this.getSelectedAccordion().getSong(tab.title);
            break;
        case 'practice':
            tab = this.renderedPractice;
            tab.text = this.getSelectedAccordion().getPractice(tab.title);
            break;
        case 'chord':
            tab = this.renderedChord;
            tab.text = this.getSelectedAccordion().getChord(tab.title);
            break;
    };
    
    if (tab.title === "") {
        tab.text = undefined;
        return;
    }
    
    this.parseABC(tab);
    
    tab.div.innerHTML = "";
    var paper = Raphael(tab.div, 700, 200);
    var printer = new ABCXJS.write.Printer(paper, params);
    
    $("#" + tab.div.id).fadeIn();
    printer.printABC(tab.abc);
    $("#" + tab.div.id).hide();
    if (alreadyOnPage)
        $("#" + tab.div.id).fadeIn();
    
    this.showMedia(tab.abc.metaText.url);
};

SITE.Mapa.prototype.showMedia = function(url) {
    if(url) {
        w3.topDiv.style.display = 'none';
        w6.dataDiv.innerHTML = url;
        w6.topDiv.style.display = 'inline';
    } else {
        w6.topDiv.style.display = 'none';
        w3.topDiv.style.display = 'inline';
    }
};

SITE.Mapa.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};

SITE.Mapa.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.getKeyboard() );
    }
};        

SITE.Mapa.prototype.translate = function() {
    
  this.getSelectedAccordion().keyboard.legenda.setTextOpen( DR.getResource('DR_pull') );
  this.getSelectedAccordion().keyboard.legenda.setTextClose( DR.getResource('DR_push') );
  this.showAccordionName();
  
  document.title = DR.getResource("DR_title");  
  
  document.getElementById("DR_description").setAttribute("content",DR.getResource("DR_description"));
  document.getElementById("toolsBtn").innerHTML = '<i class="icon-wrench"></i>&nbsp;'+DR.getResource("toolsBtn");
  document.getElementById("printBtn2").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.getResource("printBtn");
  document.getElementById("pdfBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.getResource("pdfBtn");
  document.getElementById("DR_message").alt = DR.getResource("DR_message");
  
  document.getElementById("octaveUpBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveUpBtn").innerHTML = '<i class="icon-arrow-up"></i>&nbsp;'+DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").innerHTML = '<i class="icon-arrow-down"></i>&nbsp;'+DR.getResource("DR_octave");
  document.getElementById("printBtn").innerHTML = '<i class="icon-print"></i>&nbsp;'+DR.getResource("printBtn");
  document.getElementById("saveBtn").innerHTML = '<i class="icon-download-alt"></i>&nbsp;'+DR.getResource("saveBtn");
  document.getElementById("forceRefresh").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("forceRefresh2").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("gotoMeasureBtn").value = DR.getResource("DR_goto");
  document.getElementById("untilMeasureBtn").value = DR.getResource("DR_until");
  
  this.loadAccordionList();

};
