/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

ABCXJS.Tab2Part = function () {
    var abcText;
    var tabText;
    var tabLines;
    var currLine;
    
    this.init();
};
ABCXJS.Tab2Part.prototype.init = function () {
    currLine = 0;
    abcText = "";
    
    this.newLine = true;
    this.newStaff = true;
    this.newVoice = true;
    this.line = -1;
    this.staff = -1;
    this.voice = -1;
    this.parsedLines = [];
    
};

ABCXJS.Tab2Part.prototype.parse = function (text) {
    tabText  = text;
    tabLines = this.extractLines();

    while(currLine < tabLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            currLine++;
        }
    }
    return abcText;
};

ABCXJS.Tab2Part.prototype.extractLines = function () {
    var v = tabText.split('\n');
    v.forEach( function(linha, i) { v[i] = linha.trim(); } );
    return v;
    
};

ABCXJS.Tab2Part.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = tabLines[currLine].match(/^([CKLMT]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        this.addLine( header[0] );
    } else {
       this.parseStaff();
    }
};

ABCXJS.Tab2Part.prototype.skipEmptyLines = function () {
    while(currLine < tabLines.length) {
        if(  tabLines[currLine].charAt(0) !== '%' && tabLines[currLine].match(/^[\s\r\t]*$/) === null ) {
           return true;
        };
        currLine++;
    }
    return false;
};

ABCXJS.Tab2Part.prototype.addLine = function (ll) {
    abcText += ll + '\n';
};

ABCXJS.Tab2Part.prototype.parseStaff = function () {
    var staff = this.idStaff();
};

ABCXJS.Tab2Part.prototype.idStaff = function () {
    var p = [], i = -1, open = true;
    while(currLine < tabLines.length && (tabLines[currLine].charAt(0) === '|' || tabLines[currLine].charAt(0) === '/') ) {
        if( tabLines[currLine].charAt(0) === '|' ) {
            if( tabLines[currLine].match(/[ABCDFEGabcdefg]/) ){
               p[++i] = { bass:true, linha: currLine, pos:1 };
            } else {
               open = !open;
               p[++i] = { bass:false, open: open,  linha: currLine, pos:1 };
            }
        } else {
            p[++i] = { bass:false, open: open,  linha: currLine, pos:1 };
        }  
        currLine++;
    }
    return p;
};

ABCXJS.Tab2Part.prototype.addVoice = function () {
    if(this.newLine) {
        this.line++;
        this.newLine = false;
        this.parsedLines[this.line].staffs = [];
        this.newStaff = true;
        this.newVoice = true;
        this.staff = -1;
        this.voice = -1;
    }
    if(this.newStaff) {
        this.staff++;
        this.newStaff = false;
        this.parsedLines[this.line].staffs[this.staff].voices = [];
        this.voice = -1;
    }
    if(this.newVoice) {
        this.voice++;
        this.newVoice = false;
        this.parsedLines[this.line].staffs = [this.staff].voices[this.voice]= {};
    }
};

