if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

DIATONIC.map.Gaita = function( map, interfaceParams ) {
    
    this.map = map;

    this.accordions = [];
    this.selected = -1;
    
    DR.register( this ); // register for translate
    
    this.songDiv = document.getElementById(interfaceParams.songDiv);
    this.songSelector = document.getElementById(interfaceParams.songSelector);

    this.practiceDiv = document.getElementById(interfaceParams.practiceDiv);
    this.practiceSelector = document.getElementById(interfaceParams.practiceSelector);

    this.chordDiv = document.getElementById(interfaceParams.chordDiv);
    this.chordSelector = document.getElementById(interfaceParams.chordSelector);
    
    this.keyboardContentDiv = document.getElementById(interfaceParams.keyboardContentDiv);
    
    if( DIATONIC.map.accordionMaps ) {
        this.accordions = DIATONIC.map.accordionMaps;
        this.map.carregaListaGaitas(this);
    } else {
        throw new Error( 'No accordion found!' );
        return;
    } 
};

DIATONIC.map.Gaita.prototype.selectAccordion = function(id) {
    this.selected = 0;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) this.selected = a;
    }
    return this.accordions[this.selected];
};

DIATONIC.map.Gaita.prototype.accordionExists = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) ret  = true;
    }
    return ret;
};

DIATONIC.map.Gaita.prototype.accordionCurrent = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id && this.selected === a) ret  = true;
    }
    return ret;
};


DIATONIC.map.Gaita.prototype.getSelectedAccordion = function() {
    return this.accordions[this.selected];
};

DIATONIC.map.Gaita.prototype.setup = function(accordionParams) {

  var gaita = this.selectAccordion(accordionParams.accordionId);
  
  if( ! gaita.localResource) { // não salva informação para acordeon local
    FILEMANAGER.saveLocal( 'property.accordion', accordionParams.accordionId );
  }
  
   this.renderedTune = undefined;
   this.renderedPractice = undefined;
   this.renderedChord = undefined;
  
  //o ideal seria ajustar o acordion do editor e seletor pelo id
  this.map.editor.accordion.render_keyboard_opts.show=true;
  this.map.editor.accordion.load( this.selected );

  this.map.setGaitaName( gaita );
  this.map.setGaitaImage( gaita );
  
  var tit;

  if(!accordionParams.practiceTitle){
    tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.practice.title');
    accordionParams.practiceTitle = tit || this.getSelectedAccordion().getFirstPractice();
  }
  this.loadPracticeList(accordionParams.practiceTitle);
  this.renderPractice( accordionParams.practiceTitle, {}, this.map.currentTab === "tabPractices" );

  if(!accordionParams.chordTitle){
    tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.chord.title');
    accordionParams.chordTitle = tit || this.getSelectedAccordion().getFirstChord();
  }
  this.loadChordList(accordionParams.chordTitle);
  this.renderChord( accordionParams.chordTitle, {}, this.map.currentTab === "tabChords" );

  if(!accordionParams.songTitle){
      tit = FILEMANAGER.loadLocal( 'property.'+this.getSelectedAccordion().getId()+'.song.title');
      accordionParams.songTitle = tit || this.getSelectedAccordion().getFirstSong();
  }
  this.loadSongList(accordionParams.songTitle);
  this.renderTune( accordionParams.songTitle, {}, this.map.currentTab === "tabTunes" );
  
  return gaita;
  
};

DIATONIC.map.Gaita.prototype.translate = function() {
  this.getSelectedAccordion().keyboard.legenda.setTextOpen( DR.getResource('DR_pull') );
  this.getSelectedAccordion().keyboard.legenda.setTextClose( DR.getResource('DR_push') );
  this.map.setGaitaName(this.getSelectedAccordion());
};

DIATONIC.map.Gaita.prototype.selectSong = function(i) {
    var value = this.getSelectedAccordion().songs.sortedIndex[i];
    FILEMANAGER.saveLocal( 'property.'+this.getSelectedAccordion().getId()+'.song.title', value );
    document.getElementById("spanSongs").innerHTML = (value.length>43 ? value.substr(0,40) + "..." : value);
    this.renderTune( value, {}, true );
    this.map.tuneContainerDiv.scrollTop = 0;    
};

DIATONIC.map.Gaita.prototype.loadSongList = function(tt) {
    
    $('#ulSongs').empty();
    $('#spanSongs').empty();

    var items = this.getSelectedAccordion().songs.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        if(title === tt) {
            document.getElementById("spanSongs").innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        }    
        
        $('#ulSongs').append('<li ><a href="#" id="song' +
            i  +'" onclick="showSong(\''+ i +'\')">' + (title.length>43 ? title.substr(0,40) + "..." : title)  + '</a></li>');
        
    }   
};

DIATONIC.map.Gaita.prototype.selectChord = function(i) {
    var value = this.getSelectedAccordion().chords.sortedIndex[i];
    FILEMANAGER.saveLocal( 'property.'+this.getSelectedAccordion().getId()+'.chord.title', value );
    document.getElementById("spanChords").innerHTML = (value.length>43 ? value.substr(0,40) + "..." : value);
    this.renderTune( value, {}, true );
    this.map.tuneContainerDiv.scrollTop = 0;    
};

DIATONIC.map.Gaita.prototype.loadChordList = function(tt) {
    
    $('#ulChords').empty();
    $('#spanChords').empty();

    var items = this.getSelectedAccordion().chords.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        if(title === tt) {
            document.getElementById("spanChords").innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        }    
        
        $('#ulChords').append('<li ><a href="#" id="chord' +
            i  +'" onclick="showChord(\''+ i +'\')">' + (title.length>43 ? title.substr(0,40) + "..." : title)  + '</a></li>');
        
    }   
};

DIATONIC.map.Gaita.prototype.selectPractice = function(i) {
    var value = this.getSelectedAccordion().practices.sortedIndex[i];
    FILEMANAGER.saveLocal( 'property.'+this.getSelectedAccordion().getId()+'.practice.title', value );
    document.getElementById("spanPractices").innerHTML = (value.length>43 ? value.substr(0,40) + "..." : value);
    this.renderPractice( value, {}, true );
    this.map.tuneContainerDiv.scrollTop = 0;    
};

DIATONIC.map.Gaita.prototype.loadPracticeList = function(tt) {
    $('#ulPractices').empty();
    $('#spanPractices').empty();

    var items = this.getSelectedAccordion().practices.sortedIndex;
    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        if(title === tt) {
            document.getElementById("spanPractices").innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        }    
        
        $('#ulPractices').append('<li ><a href="#" id="practice' +
            i  +'" onclick="showPractice(\''+ i +'\')">' + (title.length>43 ? title.substr(0,40) + "..." : title)  + '</a></li>');
        
    }   
    
};

DIATONIC.map.Gaita.prototype.printTune = function(alreadyOnPage, params ) {

    if (this.songPaper) {
        this.songPaper.clear();
        this.songPaper.height = 300;
    } else {
        this.songPaper = Raphael(this.songDiv, 700, 400);
    }

    var loader = this.startLoader("songLoader");
    
    this.map.editor.parseABC(0, "force");
    this.renderedTune.abc = this.map.editor.tunes[0];
    this.songPrinter = new ABCXJS.write.Printer(this.songPaper, params || {});
    $("#" + this.songDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.songPrinter.printABC(this.renderedTune.abc);
    $("#" + this.songDiv.id).hide();
    loader.stop();
    if (alreadyOnPage)
      $("#" + this.songDiv.id).fadeIn();
};

DIATONIC.map.Gaita.prototype.renderTune = function( title, params, alreadyOnPage ) {
  if(this.songPaper) {
    this.songPaper.clear();
    this.songPaper.height = 300;
  } else {
    this.songPaper = Raphael(this.songDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedTune = undefined;
      return;
  }
  this.renderedTune = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getSong(title), "noRefresh" );
  this.printTune(alreadyOnPage, params);
};

DIATONIC.map.Gaita.prototype.printPractice = function(alreadyOnPage, params) {

    if (this.practicePaper) {
        this.practicePaper.clear();
        this.practicePaper.height = 300;
    } else {
        this.practicePaper = Raphael(this.practiceDiv, 700, 400);
    }


    var loader = this.startLoader("practiceLoader");
    this.map.editor.parseABC(0, "force");
    this.renderedPractice.abc = this.map.editor.tunes[0];
    this.practicePrinter = new ABCXJS.write.Printer(this.practicePaper, params || {});

    $("#" + this.practiceDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.practicePrinter.printABC(this.renderedPractice.abc);
    $("#" + this.practiceDiv.id).hide();

    loader.stop();
    if (alreadyOnPage)
      $("#" + this.practiceDiv.id).fadeIn();
};

DIATONIC.map.Gaita.prototype.renderPractice = function( title, params, alreadyOnPage ) {
  if(this.practicePaper) {
    this.practicePaper.clear();
    this.practicePaper.height = 300;
  } else {
    this.practicePaper = Raphael(this.practiceDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedPractice = undefined;
      return;
  }
  this.renderedPractice = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getPractice(title), "noRefresh" );

  this.printPractice(alreadyOnPage, params);

};

DIATONIC.map.Gaita.prototype.printChord = function(alreadyOnPage, params) {

    if (this.chordPaper) {
        this.chordPaper.clear();
        this.chordPaper.height = 300;
    } else {
        this.chordPaper = Raphael(this.chordDiv, 700, 400);
    }

    var loader = this.startLoader("chordLoader");
    this.map.editor.parseABC(0, "force");
    this.renderedChord.abc = this.map.editor.tunes[0];
    this.chordPrinter = new ABCXJS.write.Printer(this.chordPaper, params || {});

    $("#" + this.chordDiv.id).fadeIn();
    loader.update( null, '<br>&nbsp;&nbsp;&nbsp;'+DR.getResource('DR_wait')+'<br><br>' );
    this.chordPrinter.printABC(this.renderedChord.abc);
    $("#" + this.chordDiv.id).hide();
    
    loader.stop();
    if (alreadyOnPage)
      $("#" + this.chordDiv.id).fadeIn();
};

DIATONIC.map.Gaita.prototype.renderChord = function( title, params, alreadyOnPage ) {
  if(this.chordPaper) {
    this.chordPaper.clear();
    this.chordPaper.height = 300;
  } else {
    this.chordPaper = Raphael(this.chordDiv, 700, 400);
  } 
  
  if(title === "" ) {
      this.renderedChord = undefined;
      return;
  }
  this.renderedChord = {abc:undefined, midi:undefined, title:title};
  this.map.editor.setString( this.getSelectedAccordion().getChord(title), "noRefresh" );

  this.printChord(alreadyOnPage,params);

};

DIATONIC.map.Gaita.prototype.startLoader = function(id) {

    var loader = new window.widgets.Loader({
        id: id,
        bars: 0,
        radius: 0,
        lineWidth: 20,
        lineHeight: 70,
        timeout: 1, // maximum timeout in seconds.
        background: "rgba(0,0,0,0.5)",
        container: document.body,
        oncomplete: function() {
            // call function once loader has completed
        },
        onstart: function() {
            // call function once loader has started	
        }
    });
    return loader;
};
