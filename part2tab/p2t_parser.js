/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// left padding s with c to a total of n chars
function lpad(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s = c + s;
  }
  return s;
}
 
// right padding s with c to a total of n chars
function rpad(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}
 
if (!window.ABCXJS)
    window.ABCXJS = {};

ABCXJS.Part2TabLine = function () {
    this.basses = "";
    this.close = [""];
    this.open = [""];
    this.duration ="";
    this.pos = 0;
};

ABCXJS.Part2Tab = function (toClub) {
    
    this.validBars = { 
          "|"   : "bar_thin"
        , "||"  : "bar_thin_thin"
        , "[|"  : "bar_thick_thin"
        , "|]"  : "bar_thin_thick"
        , ":|:" : "bar_dbl_repeat"
        , ":||:": "bar_dbl_repeat"
        , "::"  : "bar_dbl_repeat" 
        , "|:"  : "bar_left_repeat"
        , "||:" : "bar_left_repeat"
        , "[|:" : "bar_left_repeat"
        , ":|"  : "bar_right_repeat"
        , ":||" : "bar_right_repeat"
        , ":|]" : "bar_right_repeat"
    };
    
    
    
    this.toClub = toClub || false;
    
    this.ties = [];
    this.keyAcidentals = [];
    this.barAccidentals = [];
    this.barBassAccidentals = [];
    
    this.validBasses = 'abcdefgABCDEFGz>';
    this.startSyms = "[|:";
    this.barSyms = "[|:]";
    this.spaces = "\ \t";

    this.bassOctave = 2;
    this.init();
    
    this.addWarning = function ( msg ) {
        this.warnings.push(msg);
    };
    
    this.getWarnings = function () {
        return this.warnings.join('<br>');
    };
};

ABCXJS.Part2Tab.prototype.init = function () {
    this.tabText;
    this.tabLines;
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = "";
    this.barEnding = false;
    this.trebleStaffs = { open: null, close: null};
    this.parsedLines = [];
    this.currLine = 0;
    this.abcText = "";
    this.updateBarNumberOnNextNote = false;
    this.alertedBarNumber = 0;
    this.currBar = 0;
    this.currStaff = -1;   
    
    this.warnings = [];
};

ABCXJS.Part2Tab.prototype.parse = function (text, keyboard, toClub ) {
    this.init();
    this.tabText   = text;
    this.tabLines  = this.extractLines();
    this.keyboard  = keyboard;
    this.hasErrors = false;
    this.toClub = toClub;
    
    //this.addLine('%%barnumbers 1');
    //this.addLine('%%papersize A4');

    while((!this.hasErrors) && this.currLine < this.tabLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
    
    if( ! this.hasErrors ) {
        //adicionar vozes treble
        this.addLine( 'V:1 treble' );
        var t= "";
        this.parsedLines.forEach( function(item) {
           t += item.treble  + '\n';   
        });
        this.addLine( t.slice(0,-1) );

        //adicionar vozes bass
        this.addLine( 'V:2 bass' );
        var t= "";
        this.parsedLines.forEach( function(item) {
           t += item.basses[0]  + '\n';   
        });
        this.addLine( t.slice(0,-1) );

        //adicionar accordionTab
        this.addLine( 'V:3 accordionTab' );

         t= "";
        this.parsedLines.forEach( function(item) {
           t += item.tablature  + '\n';   
        });
        this.addLine( t.slice(0,-1) );
    }
    
    
    return this.abcText;
};

ABCXJS.Part2Tab.prototype.extractLines = function () {
    var v = this.tabText.split('\n');
    v.forEach( function(linha, i) { 
        var l = linha.split('%');
        v[i] = l[0].trim(); 
    } );
    return v;
};

ABCXJS.Part2Tab.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.tabLines[this.currLine].match(/^([CKLMTQV]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        var key = this.tabLines[this.currLine].match(/^([CKLMTQV]\:)/g);
        switch( key[0] ) {
            case 'V:': 
                 var x = header[0].match(/accordionTab/g);
                 if( x !== null ) {
                    this.inTab = true;
                 }
                 break;
            case 'K:': 
                var k = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                if( this.toClub ) {
                    switch( k ) {
                        case 'G': k = 'C'; break;
                        case 'Am': k = 'Dm'; break;
                        case 'C': k = 'F';
                    }
                }
                header[0] = 'K:' + k;
                this.keyAcidentals = ABCXJS.parse.parseKeyVoice.standardKey(k);
                break;
        }
        if(key[0] !== 'V:' )  {
           this.addLine( header[0] );
        }  
    } else {
        if( this.inTab ) {
           this.parseTab();
        }
    }
};

ABCXJS.Part2Tab.prototype.skipEmptyLines = function () {
    while(this.currLine < this.tabLines.length) {
        if(  this.tabLines[this.currLine].charAt(0) !== '%' && this.tabLines[this.currLine].match(/^[\s\r\t]*$/) === null ) {
           return true;
        };
        this.currLine++;
    }
    return false;
};

ABCXJS.Part2Tab.prototype.addLine = function (ll) {
    this.abcText += ll + '\n';
};

// new code - below
// new code -  aboj

ABCXJS.Part2Tab.prototype.parseTab = function () {
    var line = { str:this.tabLines[this.currLine], pos:0, tokenType:1,currToken:''};
    
    if( line.length === 0 ) {
        this.hasErrors = true;
        return;
    }
    
    var cnt = 1000; // limite de saida para o caso de erro de alinhamento do texto
    while( line.tokenType > 0 && --cnt ) {
        
        this.getToken(line);

        switch(line.tokenType){
            case 1: // incluir a barra na tablatura
                this.addBar(line.currToken);
                break;
            case 2:
               // this.addNotes(staffs);
                break;
        }
    } 
    
    if( line.tokenType < 0 ) {
        this.addWarning('Encontrados simbolos inválidos na linha ('+this.currLine+','+line.pos+') .');
        this.hasErrors = true;
    }
    if( ! cnt ) {
        this.addWarning('Não pude processar tablatura após 1000 ciclos. Possivel desalinhamento de texto.');
        this.hasErrors = true;
    }
};

ABCXJS.Part2Tab.prototype.addBar = function (token ) {
    var tabline = new ABCXJS.Part2TabLine();
    
    var l = token.length;
    
    tabline.basses += token + ' ';
    tabline.open[0] += token + ' ';
    tabline.close[0] += token + ' ';
    
    if(tabline.pos===0){
      tabline.duration = '+'  + rpad( ' ', ' ', l);
    } else {
      tabline.duration += rpad( ' ', ' ', l+1);
    }
    
    tabline.pos +=( l+1);
    
    
};

ABCXJS.Part2Tab.prototype.addNotes = function(staffs) {
    var str;
    var opening = true;
    
    var startTreble = true;
    var hasTreble = false;
    for( var i = 0; startTreble && i < staffs.length; i ++ ) {
        if(staffs[i].st === 'processing' && !staffs[i].bass ){
            opening = staffs[i].open;
            startTreble = false;
            hasTreble = true;
        }
    } 
    
    if( ! hasTreble  ) {
        if( this.alertedBarNumber !== staffs[0].token.barNumber ) {
            this.addWarning( 'Compasso '+staffs[0].token.barNumber+': Pelo menos uma pausa deveria ser adicionada à melodia!.');
            this.alertedBarNumber = staffs[0].token.barNumber;
        }    
    }    
    
    startTreble = true;
    //flavio - tratar duas notas ou mais de cada vez 
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st === 'processing' ) {
            if(staffs[i].bass ){ // para os baixos, sempre espero uma nota simples (sem colchetes)
                var note = this.handleBassNote(staffs[i].token.str);
                if( staffs[i].token.added && note.pitch !== "z" ) {
                    str = ">";
                } else {
                    staffs[i].token.added = true; 
                    str = note.pitch;
                }
                this.addTabElem(str);
                if( staffs[i].token.final ) {
                    if(!this.checkBass(note.pitch, opening)){
                        if( this.alertedBarNumber !== staffs[i].token.barNumber ) {
                            this.addWarning("Compasso "+staffs[i].token.barNumber+": Baixo não encontrado ou não compatível com o movimento do fole.");
                            this.alertedBarNumber = staffs[i].token.barNumber;
                        }    
                    }
                    this.addBassElem(staffs[i].idBass, staffs[i] );
                    this.setStaffState(staffs[i]);
                }
            } else {
                if(startTreble){
                    this.addTabElem(opening?"-":"+");
                    startTreble = false;
                }
                str = "";
                for(var j = 0; j < staffs[i].token.aStr.length; j ++ ) {
                    if( staffs[i].token.added && staffs[i].token.aStr[j] !== "z" ) {
                        str += ">";
                    } else {
                        str += this.toHex(staffs[i].token.aStr[j]);
                    }
                }  
                staffs[i].token.added = true; 
                if(staffs[i].token.aStr.length > 1) {
                    str = '['+str+']';
                }
                
                if( (opening && staffs[i].open) || (!opening && !staffs[i].open) ) {
                    
                    if( this.ties.length > 0 ) {
                        var t = this.ties.pop();
                        if( t === str ) {
                            str = '>';
                        }   
                    } 

                    if(staffs[i].token.lastChar.indexOf( '-' )>=0){
                        this.ties.push(str);
                    }
                    
                    this.addTabElem(str);
                    if(  (this.trebleStaffs.open && this.trebleStaffs.open.token.final) 
                            || (this.trebleStaffs.close && this.trebleStaffs.close.token.final)){
                        this.addTrebleElem(staffs[i]);
                        if( this.trebleStaffs.open ) {
                            this.setStaffState(this.trebleStaffs.open);
                            this.trebleStaffs.open.token.final = true;
                        }
                        if( this.trebleStaffs.close ) {
                            this.setStaffState(this.trebleStaffs.close);
                            this.trebleStaffs.close.token.final = true;
                        }

                    }
                } else {
                    if( this.alertedBarNumber !== staffs[i].token.barNumber ) {
                        this.addWarning( 'Compasso '+staffs[i].token.barNumber+': Não é possível ter ambos (abrindo e fechando) movimento de fole.');
                        this.alertedBarNumber = staffs[i].token.barNumber;
                    }    
                } 
            }
        }
    }
    
    if( this.columnDuration && this.columnDuration.length ) {
        this.addTabElem(this.columnDuration);
    }
    
    this.addTabElem(' ');
   
};

ABCXJS.Part2Tab.prototype.addTabElem = function (el) {
    this.parsedLines[this.currStaff].tablature += el;
};

ABCXJS.Part2Tab.prototype.handleBassNote = function (note) {
    var isChord = false, isMinor = false, isRest = false;
    if( "@XxZz".indexOf( note.charAt(0)) > 0  ){
       isRest = true ;
    }
    
    if( note.charAt(note.length-1) === 'm' ){
        isMinor = true;
        note = note.slice(0,-1);
    }
    if( note === note.toLowerCase() ) {
        isChord = true;
    }
    
    return {pitch:note, isRest: isRest, isMinor:isMinor, isChord:isChord};
};

ABCXJS.Part2Tab.prototype.addBassElem = function (idx, el ) {
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].basses[idx] += el;
    } else {
        if( el.hasToken && el.token.final ) {
            var note = this.handleBassNote(el.token.str);
            var str;
            
            if( note.isRest ) {
               str = note.pitch;
            } else if( note.isChord ) {
               str = this.getChord(note.pitch, note.isMinor );
            } else {
                str = this.getTabNote(note.pitch, this.bassOctave, true );
            }
            
            str += (el.token.duration!==1? el.token.duration:"") 
                    + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                        + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");
            
            this.parsedLines[this.currStaff].basses[idx] += str;
        }
    }
};

ABCXJS.Part2Tab.prototype.addTrebleElem = function (el) {
    var str;
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].treble += el;
    } else {
        str = this.getPitch(el);
        
        str += (el.token.duration!==1? el.token.duration:"") 
                + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                    + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");

        this.parsedLines[this.currStaff].treble += str;
    }
};

ABCXJS.Part2Tab.prototype.getPitch = function (el) {
    var pp = "";
    for( var i = 0; i < el.token.aStr.length; i++ ) {
        var p = el.token.aStr[i];
        if (p !== 'z') {
            var b = this.getButton(p);
            if (b) {
                var n = el.open ? b.openNote : b.closeNote;
                p = this.getTabNote(n.key, n.octave, false);
            }
        }
        pp += p;
    }
    
    return el.token.aStr.length > 1 ? '['+pp+']' : pp;
};

ABCXJS.Part2Tab.prototype.getChord = function ( pitch, isMinor ) {
    var p = ABCXJS.parse.normalizeAcc(pitch.toUpperCase());
    var base = ABCXJS.parse.key2number[p];
    
    if( !(base >= 0)  ) {
        throw new Error("Acorde não identificado: " + p);
    }
    
    var n2 = base + (isMinor?3:4);
    var n3 = base + 7;
    var oct = this.bassOctave + (base > 4 ? 0 : 1);
    
    return '[' + this.getTabNote( ABCXJS.parse.number2keysharp[base%12], oct, true ) 
                   + this.getTabNote( ABCXJS.parse.number2keysharp[n2%12], oct+Math.trunc(n2/12), true ) 
                       + this.getTabNote( ABCXJS.parse.number2keysharp[n3%12], oct+Math.trunc(n3/12), true ) + ']';

};

ABCXJS.Part2Tab.prototype.getTabNote = function (note, octave, bass) {

    var noteAcc = note.match(/[♯♭]/g);
    var n = noteAcc ? note.charAt(0) : note;
    var keyAcc = this.getKeyAccOffset(n);
    
    if (noteAcc && keyAcc === null ) {
        var newNote, noteAcc2, n2, keyAcc2, base = ABCXJS.parse.key2number[note];
        if( noteAcc[0] === '♯' ) {
            newNote = ABCXJS.parse.number2keyflat[base%12];
        } else {
            newNote = ABCXJS.parse.number2keysharp[base%12];
        }
        noteAcc2 = newNote.match(/[♯♭]/g);
        n2 = newNote.charAt(0);
        keyAcc2 = this.getKeyAccOffset(n2);
        
        if( keyAcc2 ) {
            note = newNote;
            n = n2;
            keyAcc = keyAcc2;
            noteAcc = noteAcc2;
        }
    }
    
    if (noteAcc) {
        if ((noteAcc[0] === '♯' && keyAcc === 'sharp') || (noteAcc[0] === '♭' && keyAcc === 'flat')) {
            // anula o acidente  - n já está correto
        } else {
            n = ((noteAcc[0] === '♯')?'^':'_') + n; //mantem o acidente da nota, convertendo para abc
        }
    } else if (keyAcc) {
        n = '=' + n; // naturaliza esta nota
    }
    
    if(bass){
        if(noteAcc) {
            if( this.barBassAccidentals[ n ] ) {
                if(this.barBassAccidentals[ n ] === noteAcc[0]){
                    n = n.charAt(1);
                }
            } else {
                this.barBassAccidentals[ n.charAt(1) ] = noteAcc[0];
            } 
        } else {
            if( this.barBassAccidentals[ n ] ) {
                n = '=' + n; // naturaliza esta nota
            } 
        }
    } else {
        if(noteAcc) {
            if( this.barAccidentals[ n ] ) {
                if(this.barAccidentals[ n ] === noteAcc[0]){
                    n = n.charAt(1);
                }
            } else {
                this.barAccidentals[ n.charAt(1) ] = noteAcc[0];
            } 
        } else {
            if( this.barAccidentals[ n ] ) {
                n = '=' + n; // naturaliza esta nota
            } 
        }
    }

    var ret = n;
    if (octave < 4) {
        ret = n + Array(5 - octave).join(",");
    } else if (octave === 5) {
        ret = n.toLowerCase();
    } else if (octave > 5) {
        ret = n.toLowerCase() + Array(octave - 4).join("'");
    }
    return ret;
};

ABCXJS.Part2Tab.prototype.setStaffState = function ( staff ) {
    staff.hasToken = false;
    staff.st = (staff.linhas[0].pos < this.tabLines[staff.linhas[0].l].length ? 'waiting for data' : 'closed');
};

ABCXJS.Part2Tab.prototype.idStaff = function () {
    // remover comentarios
    var p = [], i = -1, open = true, cntBasses = -1, maior=0, maiorLinha=0;
    
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = null;
    this.trebleStaffs = { open: null, close: null};
    
    this.parsedLines[++this.currStaff] = new ABCXJS.Part2TabLine();
    
    while(this.currLine < this.tabLines.length &&
            this.tabLines[this.currLine].trim().length && 
                this.startSyms.indexOf(this.tabLines[this.currLine].charAt(0)) >= 0 ) {
        var valid = true;
        switch( this.tabLines[this.currLine].charAt(0) ) {
            case '|':
                if( this.tabLines[this.currLine].match(/[ABCDFEGabcdefg]/) ){
                   p[++i] = { hasToken:false, bass:true, idBass: ++cntBasses, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   this.parsedLines[this.currStaff].basses[cntBasses]="";
                } else {
                   open = !open;
                   p[++i] = { hasToken:false, bass:false, open: open,  linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   if(open) {
                      this.trebleStaffs.open = p[i];
                   } else {
                      this.trebleStaffs.close = p[i];
                   }    
                }
                break;
            case '/':
                p[i].linhas.push({l:this.currLine, pos:0});
                break;
            case '+':
                valid = false;
                this.durationLine = this.currLine;
                break;
            case '%':
                valid = false;
                // ignora comentario
                break;
                
        }
        if(valid && maior < this.tabLines[this.currLine].length ) {
            maior = this.tabLines[this.currLine].length;
            maiorLinha = this.currLine;
        }
        
        this.currLine++;
    }
    
    // verifica o alinhamento das barras
    var k=0, l;
    while((l=(this.tabLines[maiorLinha].substr(k+1).indexOf("|")))>0) {
        k += l+1;
        for( var j = 0;  j < p.length;  j++ ) {
            var staff = p[j];
            for( var i = 0; i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( l.length > k && l.charAt(k) !== "|" ){
                    this.addWarning( 'Possível falta de sincronismo na pauta '+(this.currStaff+1)+', linha '+(j+1)+', coluna '+(k+1)+'. Barras desalinhadas.');
                }
            }
        }
    }
    
    return p;
};

ABCXJS.Part2Tab.prototype.posiciona = function(staffs) {
    var found = false;
    var qtd = 0;
    
    this.startColumn = this.endColumn;
    this.barEnding = false;
    
    // procura a primeira coluna vazia
    while( ! found ) {
        found = true;
        for( var j = 0;  found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn < l.length && this.spaces.indexOf( l.charAt(this.endColumn) ) < 0 ){
                    found = false;
                    this.endColumn ++;
                }
            }
        }
    }
    
    // procura a primeira coluna não-vazia
    this.endColumn ++;
    found = false;
    while( ! found && this.endColumn < staffs.length  ) {
        for( var j = 0;  !found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; !found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn >= l.length || this.spaces.indexOf( l.charAt(this.endColumn) ) < 0 ){
                    if(l.charAt(this.endColumn) && this.barSyms.indexOf( l.charAt(this.endColumn) ) >= 0){
                        this.barEnding = true;
                    }
                    found = true;
                }
            }
        }
        if(!found){
            this.endColumn ++;
        }
    }
    
    if( this.durationLine && this.durationLine >= 0 ) {
        var dur = this.tabLines[this.durationLine].substr( this.startColumn,this.endColumn-this.startColumn).trim();
        this.columnDuration = dur.length > 0 ? dur : "";
    }
    
};

ABCXJS.Part2Tab.prototype.read = function(staffs) {
    var st = 0, ret = 0;
    for( var j = 0; j < staffs.length; j ++ ) {
        var source = staffs[j];

        switch( source.st ) {
            case "waiting for data":
                source.token = this.getToken(source);
                if( source.hasToken) {
                    source.st = (source.token.type === "bar") ? "waiting end of interval" : "processing";
                    ret = (source.token.type === "bar") ? 1 : 2;
                } else {
                    ret = 2;
                }    
                break;
            case "waiting end of interval":
                ret = 1;
                break;
            case "closed":
                ret = 0;
                break;
            case "processing":
                this.updateToken(source);
                ret = 2;
                break;
        }
        
        st = Math.max(ret, st);
    }
    
    return st;
};

ABCXJS.Part2Tab.prototype.getToken = function(line) {
    var found = false;
    var c = '';
    
    this.skipSyms(line, this.spaces );
    
    line.currToken = '';
    line.tokenType = 0;
    
    while (  line.pos < line.str.length && ! found ) {
        c = line.str.charAt(line.pos);
        
        if(c===' ')  {
            found=true; continue;
        }
        
        if( line.tokenType === 0 ) {
            if( this.validBars[ c ]  ) {
                line.tokenType = 1; // bar
            } else if(this.validBasses.indexOf( c )>=0)  {
                line.tokenType = 2; // note
            } else if(this.startSyms.indexOf( c )<0)  {
                line.tokenType = -1;
            }
        } else {
            switch(line.tokenType) {
                case 1:
                    if(!c.match(/(\||\d|\:|\])/g)) {
                        found=true; continue;
                    }
                    break;
                case 2:
                    if(c.match(/(\||\:)/g)){
                        found=true; continue;
                    }
                    break;
            }
        }
        line.currToken += c;
        line.pos ++;
        
    }   
   
    
/*    
    for( var i = line.pos; i < line.str.length; i ++ ) {
            var c = this.tabLines[ll.l].charAt(ll.pos);
            if(  c !== ' ' && c !== '.' &&  c !== '-'  ) {
                token += c;
                ll.pos++;
            } else {
                if(syms.indexOf( token.charAt(0) ) >= 0 ) {
                   for( var j = 1; j < qtd; j ++ ) {
                     staff.linhas[j].pos  = ll.pos;
                   }
                   qtd = 1; // força a saida processando so a primeira linha
                } else {
                    lastChar += c;
                }
                found=true;
            }
        }
        if( token.trim().length > 0 ) {
            // gerar partitura convertendo para clubBR
            if( this.toClub && syms.indexOf( token.charAt(0) ) < 0  && token !== 'z' ) {
                if( staff.bass ) {
                    // flavio - transpose bass
                    switch(token) {
                        case 'C': token = 'F'; break;
                        case 'c': token = 'f'; break;
                        case 'D': token = 'G'; break;
                        case 'd': token = 'g'; break;
                        case 'E': token = 'A'; break;
                        case 'e': token = 'a'; break;
                        case 'F': token = 'B♭'; break;
                        case 'f': token = 'b♭'; break;
                        case 'G': token = 'C'; break;
                        case 'g': token = 'c'; break;
                        case 'A': token = 'D'; break;
                        case 'am': token = 'dm'; break;
                    }
                } else {
                    //move para o botão imediatamente abaixo
                    var x = token.match(/^[0-9]* /g);
                    var a = token.replace( x[0], '' );
                    token = (parseInt(x[0])+1) + a;
                }
            }
            
            tokens.push( token );
            strToken += token;
        }
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || this.spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            final = true;
        }
    }
    staff.hasToken = strToken.trim().length !== 0;
    //determina o tipo de token
    if( staff.hasToken  ) {
        if( syms.indexOf( strToken.charAt(0) )>= 0 ) {
            if(strToken.charAt(0)=== '(' || strToken.charAt(0)=== ')' ) {
                type='triplet';
            } else {
                type='bar';
                this.barAccidentals = [];
                this.barBassAccidentals = [];
                this.updateBarNumberOnNextNote = true;
            }
        } else {
            type = 'note';
            strToken = this.normalizeAcc(strToken);
            if( this.updateBarNumberOnNextNote ) {
                this.updateBarNumberOnNextNote = false;
                this.currBar ++;
            }
            
            if(tokens.length > 1) {
                strToken = '['+strToken+']';
            }
        }
        
        
    }   
    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseInt(this.columnDuration);
    }
    
    return { str: strToken, aStr: tokens, duration: dur, barNumber: this.currBar, type:type, final: final, added: false, lastChar: lastChar };
    
*/

};

ABCXJS.Part2Tab.prototype.normalizeAcc = function(str) {
    var ret = str.charAt(0);
    if(str.length > 1) {
        ret += str.charAt(1).replace(/#/g,'♯').replace(/b/g,'♭');
    }
    return ret;
};

ABCXJS.Part2Tab.prototype.updateToken = function(staff) {
    var final = false;
    var qtd = staff.linhas.length;
    for( var i = 0; i < qtd; i ++ ) {
        var ll = staff.linhas[i];
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || this.spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            final = true;
        }
    }    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseInt(this.columnDuration);
    }
    staff.token.duration += dur;
    
    if( final ){
        staff.token.final = true;
    }
};

ABCXJS.Part2Tab.prototype.skipSyms = function( linha, syms ) {
    while (linha.pos < linha.str.length
              && syms.indexOf(linha.str.charAt(linha.pos)) >= 0) {
        linha.pos++ ;
    }
};

ABCXJS.Part2Tab.prototype.getButton = function( b ) {
    if( b === 'x' || b ===  ' ' || b ===  '' || !this.keyboard ) return null;
    var kb = this.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};

ABCXJS.Part2Tab.prototype.checkBass = function( b, opening ) {
    var found = false;
    if( b === '-->' || !this.keyboard ) return false;
    if( b === 'z' ) return true;
    var kb = this.keyboard;
    var nota = kb.parseNote(b, true );
    for( var j = kb.keyMap.length; !found && j > kb.keyMap.length - 2; j-- ) {
        for( var i = 0; !found && i < kb.keyMap[j-1].length; i++ ) {
            var tecla = kb.keyMap[j-1][i];
            if( (opening && tecla.openNote.key === nota.key)
                || (!opening && tecla.closeNote.key === nota.key) ) {
                found = true;      
            } 
        }   
    }
    return found;
};

ABCXJS.Part2Tab.prototype.toHex = function( s ) {
    
    if( s === 'z' || s === '>') return s;
    
    var p = s.indexOf( '\'' );
    var s1 = s.substr( 0, p );
    var s2 = s.substr( p );

    return ( p < 0 ) ? parseInt(s).toString(16) : parseInt(s1).toString(16) + s2;
};

ABCXJS.Part2Tab.prototype.getKeyAccOffset = function(note)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < this.keyAcidentals.length; a ++) {
      if( this.keyAcidentals[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.keyAcidentals[a].acc;
      }
  }
  return null;    
};
