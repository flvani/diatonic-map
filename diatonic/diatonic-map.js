/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.accordionMaps = [];

DIATONIC.map.loadAccordionMaps = function ( files, cb )  {
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++ ) {
        toLoad ++;
        FILEMANAGER.register('MAP');

        $.getJSON( files[f], {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('MAP', true);
                DIATONIC.map.accordionMaps.push( new DIATONIC.map.Accordion(data) );
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('MAP', false);
                var err = textStatus + ", " + error;
                console.log( "Accordion Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --;
                if( toLoad === 0 && cb ) cb();
            });
    }
};

DIATONIC.map.Accordion = function (res, local) {
    this.id = res.id;
    this.menuOrder = res.menuOrder;
    this.model = res.model;
    this.tuning = res.tuning;
    this.buttons = res.buttons;
    this.pedal = res.pedal;
    this.image = res.image;
    this.keyboard = res.keyboard;
    this.songPathList = res.songPathList;
    this.practicePathList = res.practicePathList;
    this.chordPathList = res.chordPathList;
    this.localResource = local || false;
    this.songs = { items:{}, sortedIndex: [] };
    this.practices = { items:{}, sortedIndex: [] };
    this.chords = { items:{}, sortedIndex: [] };

    if( ! this.localResource ) {
      this.songs = this.loadABCX( this.songPathList );
      this.chords = this.loadABCX( this.chordPathList );
      this.practices = this.loadABCX( this.practicePathList );
    }
};

DIATONIC.map.Accordion.prototype.getId = function () {
    return this.id;
};

DIATONIC.map.Accordion.prototype.getName = function () {
    return this.getModel() + " " + this.getTxtTuning() + " - " + this.getTxtNumButtons();
};

DIATONIC.map.Accordion.prototype.getModel = function () {
    return this.model;
};

DIATONIC.map.Accordion.prototype.getTxtNumButtons = function() {
    var a = this.buttons;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' + a[c] + str_label;
    }
    return a[0] + str_label;
};

DIATONIC.map.Accordion.prototype.getTxtTuning = function() {
    var a = this.tuning;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' +  a[c] + str_label;
    }
    return  a[0] + str_label;
};

DIATONIC.map.Accordion.prototype.getKeyboard = function () {
    return this.keyboard;
};

DIATONIC.map.Accordion.prototype.getPathToImage = function () {
    return this.image;
};

DIATONIC.map.Accordion.prototype.getNumKeysRows = function () {
    return this.keyboard.keys.open.length;
};

DIATONIC.map.Accordion.prototype.getNumBassesRows = function () {
    return this.keyboard.basses.open.length;
};

DIATONIC.map.Accordion.prototype.getKeysOpenRow = function (r) {
    return this.keyboard.keys.open[r];
};

DIATONIC.map.Accordion.prototype.getKeysCloseRow = function (r) {
    return this.keyboard.keys.close[r];
};

DIATONIC.map.Accordion.prototype.getBassOpenRow = function (r) {
    return this.keyboard.basses.open[r];
};
DIATONIC.map.Accordion.prototype.getBassCloseRow = function (r) {
    return this.keyboard.basses.close[r];
};

DIATONIC.map.Accordion.prototype.getKeysLayout = function (r) {
    return this.keyboard.layout[r] || 0;
};

DIATONIC.map.Accordion.prototype.isPedal = function (i,j) {
    return (this.pedal[1]-1) === i && (this.pedal[0]-1) === j;
};

DIATONIC.map.Accordion.prototype.getChord = function (name) {
    return this.chords.items[name];
};
DIATONIC.map.Accordion.prototype.setChord = function (name,content, addSort) {
    this.chords.items[name] = content;
    if(addSort) this.chords.sortedIndex.push( name );
};

DIATONIC.map.Accordion.prototype.getSong = function (name) {
    return this.songs.items[name];
};
DIATONIC.map.Accordion.prototype.setSong = function (name,content, addSort) {
    this.songs.items[name] = content;
    if(addSort) this.songs.sortedIndex.push( name );
};

DIATONIC.map.Accordion.prototype.getPractice = function (name) {
    return this.practices.items[name];
};
DIATONIC.map.Accordion.prototype.setPractice = function (name,content, addSort) {
    this.practices.items[name] = content;
    if(addSort) this.practices.sortedIndex.push( name );
};

DIATONIC.map.Accordion.prototype.getFirstSong = function () {
    var ret = this.songs.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.Accordion.prototype.getFirstPractice = function () {
    var ret = this.practices.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.Accordion.prototype.getFirstChord = function () {
    var ret = this.chords.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.Accordion.prototype.loadABCX = function(pathList, cb ) {
    var toLoad = 0;
    var path;
    var objRet = { items:{}, sortedIndex: [] };
    for (var s = 0; s < pathList.length; s++) {
        toLoad ++;
        FILEMANAGER.register('ABCX');
        path = pathList[s];
        $.get( path )
            .done( function( data ) {
                FILEMANAGER.deregister('ABCX', true);
                var tunebook = new ABCXJS.TuneBook(data);
                for (var t = 0; t < tunebook.tunes.length; t ++)  {
                    objRet.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                    objRet.sortedIndex.push( tunebook.tunes[t].title );
                }    
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('ABCX', false);
                var err = textStatus + ", " + error;
                console.log( "ABCX Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --;
                if(toLoad === 0 ) { 
                   objRet.sortedIndex.sort();
                   if(cb) cb(); // call back in the last pass
                }
            });
    }
    return objRet;
};
