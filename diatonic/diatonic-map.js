/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
	window.DIATONIC = {close:0, open:1};

if (!window.DIATONIC.map)
	window.DIATONIC.map = { models: [] };

DIATONIC.map.Accordion = function (id, nome, afinacao, pedal, keyboard, chordPathList, practicePathList, songPathList, image) {
    this.id = id;
    this.name = nome;
    this.afinacao = afinacao;
    this.pedal = pedal;
    this.keyboard = keyboard;
    this.songPathList = songPathList;
    this.practicePathList = practicePathList;
    this.chordPathList = chordPathList;
    this.image = image;
    
    this.loadSongs();
    this.loadChords();
    this.loadPractices();
};

DIATONIC.map.Accordion.prototype.getId = function () {
    return this.id;
};

DIATONIC.map.Accordion.prototype.getName = function () {
    return this.name;
};

DIATONIC.map.Accordion.prototype.getAfinacao = function () {
    return this.afinacao;
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
    return this.pedal[1] === i && this.pedal[0] === j;
};

DIATONIC.map.Accordion.prototype.getChord = function (name) {
    return this.chords.items[name];
};

DIATONIC.map.Accordion.prototype.getSong = function (name) {
    return this.songs.items[name];
};

DIATONIC.map.Accordion.prototype.getPractice = function (name) {
    return this.practices.items[name];
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
DIATONIC.map.Accordion.prototype.loadPractices = function(cb) {
    var that = this;
    var toLoad = 0;
    this.practices = { items:{}, sortedIndex: [] };
    for (var s = 0; s < this.practicePathList.length; s++) {
        toLoad ++;
        $.get(this.practicePathList[s], function(r) {
            var tunebook = new ABCJS.TuneBook(r);
            for (var t = 0; t < tunebook.tunes.length; t ++) {
                that.practices.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                that.practices.sortedIndex.push(tunebook.tunes[t].title);
            }
            toLoad --;
            if(toLoad === 0 ) { 
               that.practices.sortedIndex.sort();
               if(cb) cb(); // call back in the last pass
            }
        });
    }
};

DIATONIC.map.Accordion.prototype.loadChords = function(cb) {
    var that = this;
    var toLoad = 0;
    this.chords = { items:{}, sortedIndex: [] };
    for (var s = 0; s < this.chordPathList.length; s++) {
        toLoad ++;
        $.get(this.chordPathList[s], function(r) {
            var tunebook = new ABCJS.TuneBook(r);
            for (var t = 0; t < tunebook.tunes.length; t ++) {
                that.chords.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                that.chords.sortedIndex.push(tunebook.tunes[t].title);
            }
            toLoad --;
            if(toLoad === 0 ) { 
               that.chords.sortedIndex.sort();
               if(cb) cb(); // call back in the last pass
            }
        });
    }
};

DIATONIC.map.Accordion.prototype.loadSongs = function(cb) {
    var that = this;
    var toLoad = 0;
    that.songs = { items:{}, sortedIndex: [] };
    for (var s = 0; s < that.songPathList.length; s++) {
        toLoad ++;
        $.get(that.songPathList[s], function(r) {
            var tunebook = new ABCJS.TuneBook(r);
            for (var t = 0; t < tunebook.tunes.length; t ++)  {
                that.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                that.songs.sortedIndex.push(tunebook.tunes[t].title);
            }    
            toLoad --;
            if(toLoad === 0 ) { 
               that.songs.sortedIndex.sort();
               if(cb) cb(); // call back in the last pass
            }
        });
    }
};
