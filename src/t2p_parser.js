/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

ABCXJS.Tab2PartLine = function () {
    this.basses = [];
    this.treble = "";
    this.tablature = "";
    this.fingeringLine = "";
};

ABCXJS.Tab2Part = function (toClub, fromClub ) {
    
    this.toClub = toClub || false;
    this.fromClub = fromClub || false;
    
    this.ties = [];
    this.keyAcidentals = [];
    this.barAccidentals = [];
    this.barBassAccidentals = [];
    
    this.startSyms = "]|/+%f";
    this.barSyms = ":]|[";
    this.spaces = "-.\ \t";

    this.bassOctave = 2;
    this.inTriplet = false;
    this.init();
    
    this.addWarning = function ( msg ) {
        this.warnings.push(msg);
    };
    
    this.getWarnings = function () {
        return this.warnings.join('<br>');
    };
};

ABCXJS.Tab2Part.prototype.init = function () {
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

ABCXJS.Tab2Part.prototype.parse = function (text, keyboard, toClub, fromClub ) {
    this.init();
    this.tabText   = text;
    this.tabLines  = this.extractLines();
    this.keyboard  = keyboard;
    this.hasErrors = false;
    this.toClub = toClub;
    this.fromClub = fromClub;
    
    this.directives = { 
         landscape:     '%landscape'  
        ,stretchlast:   '%stretchlast'  
        ,pagenumbering: '%pagenumbering'  
        ,staffsep:      '%staffsep 20'  
        ,barsperstaff:  '%barsperstaff 6'  
        ,papersize:     '%%papersize A4'  
        ,barnumbers:    '%%barnumbers 0'
    };
    
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
           if( item.fingeringLine ) {
               t += item.fingeringLine  + '\n';   
           }
        });
        this.addLine( t.slice(0,-1) );

        if( this.hasBass ) {
            //adicionar vozes bass
            this.addLine( 'V:2 bass' );
            var t= "";
            this.parsedLines.forEach( function(item) {
            t += item.basses[0]  + '\n';   
            });
            this.addLine( t.slice(0,-1) );
        }

        //adicionar accordionTab
        this.addLine( 'V:3 accordionTab' );

         t= "";
        this.parsedLines.forEach( function(item) {
           t += item.tablature  + '\n';   
        });
        this.addLine( t.slice(0,-1) );
    }
    
    
    // se restaram diretivas nesta lista
    for (var d in this.directives) {
        this.abcText = this.directives[d] + '\n' + this.abcText;
    }
    
    return this.abcText;
};

ABCXJS.Tab2Part.prototype.extractLines = function () {
    var v = this.tabText.split('\n');
    v.forEach( function(linha, i) { 
        if( linha.charAt(0) !== '%' ) {
            var l = linha.split('%');
            v[i] = l[0].trim(); 
        }
    } );
    return v;
};

ABCXJS.Tab2Part.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.tabLines[this.currLine].match(/^([ACRFKLMNTQZX]\:*[^\r\n\t\%]*)/g);
    var commentOrDirective = this.tabLines[this.currLine].match(/^\%/);
    
    if( commentOrDirective ) {
        var found = false;
        for (var d in this.directives) {
            if( this.tabLines[this.currLine].includes( d ) ) {
                this.directives[d] = this.tabLines[this.currLine];
                found = true;
                break;
            }
        }
        if (!found) {
            this.addLine( this.tabLines[this.currLine] );
        }
        
    } else if ( header ) {
        var key = this.tabLines[this.currLine].match(/^([ACRFKLMNTQZX]\:)/g);
        switch( key[0] ) {
            case 'K:': 
                var k = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                if( this.toClub ) {
                    switch( k ) {
                        case 'G': k = 'C'; break;
                        case 'Am': k = 'Dm'; break;
                        case 'C': k = 'F';
                    }
                } else if ( this.fromClub ) {
                    switch( k ) {
                        case 'C': k = 'G'; break;
                        case 'Dm': k = 'Am'; break;
                        case 'F': k = 'C';
                    }
                }
                header[0] = 'K:' + k;
                this.keyAcidentals = ABCXJS.parse.parseKeyVoice.standardKey(k);
                break;
        }
        this.addLine( header[0] );
    } else {
       this.parseStaff();
    }
};

ABCXJS.Tab2Part.prototype.skipEmptyLines = function () {
    while(this.currLine < this.tabLines.length) {
        if(  /*this.tabLines[this.currLine].charAt(0) !== '%' && */ this.tabLines[this.currLine].match(/^[\n\r\t]*$/) === null ) {
           return true;
        };
        this.currLine++;
    }
    return false;
};

ABCXJS.Tab2Part.prototype.addLine = function (ll) {
    this.abcText += ll + '\n';
};

ABCXJS.Tab2Part.prototype.parseStaff = function () {
    var staffs = this.idStaff();
    
    if(!staffs){
        this.addWarning('Linha Ínvalida: ['+(this.currLine+1)+'] --> "' + this.tabLines[this.currLine] + '"' );
        this.hasErrors = true;
        return;
    }
    
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    var cnt = 1000; // limite de saida para o caso de erro de alinhamento do texto
    while( st > 0 && --cnt ) {
        
        this.posiciona(staffs);
        
        st = this.read(staffs);

        switch(st){
            case 1: // incluir a barra na tablatura
                this.addBar(staffs, staffs[0].token.str );
                break;
            case 2:
                if(staffs[0].token.type==='triplet'){
                    this.addTriplet(staffs, staffs[0].token.str);
                } else {
                    this.addNotes(staffs);
                }
                break;
        }
    } 
    if( ! cnt ) {
        this.addWarning('Não pude processar tablatura após 1000 ciclos. Possivel desalinhamento de texto.');
        this.hasErrors = true;
    }
};

ABCXJS.Tab2Part.prototype.addBar = function (staffs, bar ) {
    var startTreble = true;
    
    //tratar a gambiarra que inventei de começar linhas de baixo com ']'
    if( bar.charAt(0) === ']' ) {
        bar = '|' + bar.slice(1);
    }

    // neste caso, todas as vozes da staff são "bar", mesmo que algumas já terminaram 
    this.addTabElem(bar + ' ');
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st !== 'closed') {
            if(staffs[i].bass) {
                this.addBassElem(staffs[i].idBass, bar + ' ');
            } else {
                if( startTreble ) {
                    this.addTrebleElem(bar + ' ');
                    startTreble = false;
                }    
            }
            this.setStaffState(staffs[i]);
        }
    }
};

ABCXJS.Tab2Part.prototype.addTriplet = function ( staffs, triplet ) {
    
    if( triplet.charAt(0) === '(' ) {
        this.addTrebleElem(triplet + ' ' );
    }
    
    this.addTabElem(triplet + ' ' );
    
    for( var i = 0; i < staffs.length; i ++ ) {
        this.setStaffState(staffs[i]);
    }
    
};

ABCXJS.Tab2Part.prototype.addNotes = function(staffs) {
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
                if( staffs[i].token.afinal ) {
                    var bas = this.checkBass(note.pitch, opening);
                    if(!bas){
                        if( this.alertedBarNumber !== staffs[i].token.barNumber ) {
                            this.addWarning("Compasso "+staffs[i].token.barNumber+": Baixo não encontrado ou não compatível com o movimento do fole.");
                            this.alertedBarNumber = staffs[i].token.barNumber;
                        }    
                    }
                    this.addBassElem(staffs[i].idBass, staffs[i], bas );
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
                    
                    if( this.ties.length > 0 )  {
                        var t = this.ties.pop();
                        if( t !== str ) {
                            this.ties.push(t);
                        } else {
                            str = "";
                            for(var j = 0; j < staffs[i].token.aStr.length; j ++ ) {
                                  str += ">";
                            }  
                            if(staffs[i].token.aStr.length > 1) {
                                str = '['+str+']';
                            }
                        }
                    }  else {

                        if(staffs[i].token.lastChar.indexOf( '-' )>=0) {
                            //staffs[i].token.lastChar = '';
                            this.ties.push(str);
                        }
                    }  
                    this.addTabElem(str);
                    if(  (this.trebleStaffs.open && this.trebleStaffs.open.token.afinal) 
                            || (this.trebleStaffs.close && this.trebleStaffs.close.token.afinal)){
                        this.addTrebleElem(staffs[i]);
                        if( this.trebleStaffs.open ) {
                            this.setStaffState(this.trebleStaffs.open);
                            this.trebleStaffs.open.token.afinal = true;
                        }
                        if( this.trebleStaffs.close ) {
                            this.setStaffState(this.trebleStaffs.close);
                            this.trebleStaffs.close.token.afinal = true;
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
        this.addTabElem(parseFloat(this.columnDuration));
    }
    
    this.addTabElem(' ');
   
};

ABCXJS.Tab2Part.prototype.addTabElem = function (el) {
    this.parsedLines[this.currStaff].tablature += el;
};

ABCXJS.Tab2Part.prototype.handleBassNote = function (note) {
    var isChord = false, isMinor = false, isRest = false;
    if( "@XxZz".indexOf( note.charAt(0)) > 0  ){
       isRest = true ;
    }
    
    if( note.charAt(note.length-1) === 'm' ){
        isMinor = true;
        //note = note.slice(0,-1);
    }
    if( note === note.toLowerCase() ) {
        isChord = true;
    }
    
    return {pitch:note, isRest: isRest, isMinor:isMinor, isChord:isChord};
};

ABCXJS.Tab2Part.prototype.addBassElem = function (idx, el, bas ) {
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].basses[idx] += el;
    } else {
        if( el.hasToken && el.token.afinal ) {
            var note = this.handleBassNote(el.token.str);
            var str;
            
            if( note.isRest ) {
               str = note.pitch;
            } else if( note.isChord ) {
               str = this.getChord(note.pitch, (bas.isMinor !==undefined? bas.isMinor : note.isMinor ) );
            } else {
                str = this.getTabNote(note.pitch, this.bassOctave, true );
            }
            
            str += this.handleDuration(el.token.duration*(this.inTriplet?2/3:1))
                    + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                        + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");
            
            this.parsedLines[this.currStaff].basses[idx] += str;
        }
    }
};

ABCXJS.Tab2Part.prototype.addTrebleElem = function (el) {
    var str;
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].treble += el;
    } else {
        str = this.getPitch(el);
        
        str += this.handleDuration(el.token.duration)
                + (el.token.lastChar.indexOf( '-' ) >=0 ?"-":"")
                    + (el.token.lastChar.indexOf( '.' ) >=0 ?"":" ");

        this.parsedLines[this.currStaff].treble += str;
    }
};

ABCXJS.Tab2Part.prototype.handleDuration = function (nDur) {
    var cDur = ""; // para duration == 1 a saída é vazia.
    if ( nDur !== 1 ) { // diferente de 1
        cDur = "" + nDur;
        if( nDur % 1 !== 0  ) { // não inteiro 
            var resto = ""+(nDur-nDur%0.001); 
            switch( resto ) {
               case '1.499': cDur = '3/2'; break;
               case '0.666': cDur = '2/3'; break;
               case '0.499': cDur =  '/2'; break;
               case '0.333': cDur =  '/3'; break;
               case '0.249': cDur =  '/4'; break;
               case '0.166': cDur =  '/6'; break;
               case '0.124': cDur =  '/8'; break;
            }
        }
    }
    return cDur; 
};

ABCXJS.Tab2Part.prototype.getPitch = function (el) {
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

ABCXJS.Tab2Part.prototype.getChord = function ( pitch, isMinor ) {
    var p = ABCXJS.parse.normalizeAcc(pitch.toUpperCase().replace('M',''));
    var base = ABCXJS.parse.key2number[p];
    
    if( !(base >= 0)  ) {
        throw new Error("Acorde não identificado: " + p);
    }
    
    var n2 = base + (isMinor?3:4);
    var n3 = base + 7;
    var oct = this.bassOctave + 1; // flavio (base > 4 ? 0 : 1);
    
    return '[' + this.getTabNote( ABCXJS.parse.number2keysharp[base%12], oct, true ) 
                   + this.getTabNote( ABCXJS.parse.number2keysharp[n2%12], oct+Math.trunc(n2/12), true ) 
                       + this.getTabNote( ABCXJS.parse.number2keysharp[n3%12], oct+Math.trunc(n3/12), true ) + ']';

};

ABCXJS.Tab2Part.prototype.getTabNote = function (note, octave, bass) {

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

ABCXJS.Tab2Part.prototype.setStaffState = function ( staff ) {
    staff.hasToken = false;
    staff.st = (staff.linhas[0].pos < this.tabLines[staff.linhas[0].l].length ? 'waiting for data' : 'closed');
};

ABCXJS.Tab2Part.prototype.idStaff = function () {
    // remover comentarios
    var p = [], i = -1, open = true, cntBasses = -1, maior=0, maiorLinha=0;
    
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = null;
    this.trebleStaffs = { open: null, close: null};
    this.hasBass = false;
    
    this.parsedLines[++this.currStaff] = new ABCXJS.Tab2PartLine();

    // vou mudar o comportamento: terei linhas de baixo que podem ser explicitamente declaradas
    // ou podem ser inferidas se tiverem os simbolos dos baixos 
    while(this.currLine < this.tabLines.length &&
            this.tabLines[this.currLine].trim().length && 
                this.startSyms.indexOf(this.tabLines[this.currLine].charAt(0)) >= 0 ) {
        var valid = true;
        switch( this.tabLines[this.currLine].charAt(0) ) {
            case ']': // linha explicitamente declarada como baixo
                p[++i] = { hasToken:false, bass:true, idBass: ++cntBasses, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                this.parsedLines[this.currStaff].basses[cntBasses]="";
                this.hasBass = true;
                break;
            case '|':
                if( this.tabLines[this.currLine].match(/[ABCDFEGabcdefg]/) ){
                   p[++i] = { hasToken:false, bass:true, idBass: ++cntBasses, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   this.parsedLines[this.currStaff].basses[cntBasses]="";
                    this.hasBass = true;
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
            case 'f':
                valid = false;
                this.parsedLines[this.currStaff].fingeringLine = this.tabLines[this.currLine];
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
    
    if(p.length===0) {
        return null;
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

ABCXJS.Tab2Part.prototype.posiciona = function(staffs) {
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
    while( ! found  ) {
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

ABCXJS.Tab2Part.prototype.read = function(staffs) {
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

ABCXJS.Tab2Part.prototype.getToken = function(staff) {
    var syms = "():|[]/";
    var qtd = staff.linhas.length;
    var afinal = false;
    var type = null;
    var lastChar = "";
    var tokens = [];
    var strToken = "";
    
    this.skipSyms(staff, this.spaces ); 
    
    for( var i = 0; i < qtd; i ++ ) {
        var token = "";
        var ll = staff.linhas[i];
        var found = false;
        while (ll.pos < Math.min( this.tabLines[ll.l].length, this.endColumn) && ! found ) {
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
                        case 'a': token = 'd'; break;
                        case 'am': token = 'dm'; break;
                    }
                } else {
                    //move para o botão imediatamente abaixo
                    var x = token.match(/^[0-9]*/g);
                    var a = token.replace( x[0], '' );
                    token = (parseInt(x[0])+1) + a;
                }
            }
            if( this.fromClub && syms.indexOf( token.charAt(0) ) < 0 && token !== 'z' ) {
                if( staff.bass ) {
                    // flavio - transpose bass
                    switch(token) {
                        case 'A': token = 'E'; break;
                        case 'a': token = 'e';  break;
                        case 'B♭': token = 'F'; break;
                        case 'b♭': token = 'f'; break;
                        case 'C': token = 'G'; break;
                        case 'c': token = 'g'; break;
                        case 'D': token = 'A'; break;
                        case 'd': token = 'a'; break;
                        case 'dm': token = 'am'; break;
                        case 'F': token = 'C'; break;
                        case 'f': token = 'c'; break;
                        case 'G': token = 'D'; break;
                        case 'g': token = 'd'; break;
                    }
                } else {
                    //move para o botão imediatamente abaixo
                    var x = token.match(/^[0-9]*/g);
                    var a = token.replace( x[0], '' );
                    token = (parseInt(x[0])-1) + a;
                }
            }
            
            tokens.push( token );
            strToken += token;
        }
        
        var endingChar = this.tabLines[ll.l].charAt(this.endColumn);
        var endInSpace = this.spaces.indexOf( endingChar ) >= 0;
        
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || !endInSpace ) {
            afinal = true;
        }
    }
    staff.hasToken = strToken.trim().length !== 0;
    
    //determina o tipo de token
    if( staff.hasToken  ) {
        if( syms.indexOf( strToken.charAt(0) )>= 0 ) {
            if(strToken.charAt(0)=== '(' || strToken.charAt(0)=== ')' ) {
                type='triplet';
                this.inTriplet = (strToken.charAt(0)=== '(' );
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
        dur = parseFloat(this.columnDuration);
    }

    return { str: strToken, aStr: tokens, duration: dur, barNumber: this.currBar, type:type, afinal: afinal, added: false, lastChar: lastChar };
};

ABCXJS.Tab2Part.prototype.normalizeAcc = function(str) {
    var ret = str.charAt(0);
    if(str.length > 1) {
        ret += str.substr(1).replace(new RegExp('#', 'g'),'♯').replace(new RegExp('b', 'g'),'♭');
    }
    return ret;
};

ABCXJS.Tab2Part.prototype.updateToken = function(staff) {
    var afinal = false;
    var qtd = staff.linhas.length;
    for( var i = 0; i < qtd; i ++ ) {
        var ll = staff.linhas[i];
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || this.spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            afinal = true;
        }
    }    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseFloat(this.columnDuration);
    }
    staff.token.duration += dur;
    
    if( afinal ){
        staff.token.afinal = true;
    }
};

ABCXJS.Tab2Part.prototype.skipSyms = function( staff, syms ) {
    for( var i = 0; i < staff.linhas.length; i ++ ) {
        while (staff.linhas[i].pos < 
                Math.min( this.tabLines[staff.linhas[i].l].length, this.endColumn)
                  && syms.indexOf(this.tabLines[staff.linhas[i].l].charAt(staff.linhas[i].pos)) >= 0) {
            staff.linhas[i].pos++ ;
        }
    }
};

ABCXJS.Tab2Part.prototype.getButton = function( b ) {
    if( b === 'x' || b ===  ' ' || b ===  '' || !this.keyboard ) return null;
    var kb = this.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};

ABCXJS.Tab2Part.prototype.checkBass = function( b, opening ) {
    if( b === '-->' || !this.keyboard ) return false;
    if( b === 'z' ) return true;
    var kb = this.keyboard;
    var nota = kb.parseNote(b.replace("m", ":m"), true );
    for( var j = kb.keyMap.length; j > kb.keyMap.length - 2; j-- ) {
        for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
            var tecla = kb.keyMap[j-1][i];
            if( (opening && tecla.openNote.key === nota.key && nota.isMinor === tecla.openNote.isMinor )
                || (!opening && tecla.closeNote.key === nota.key && nota.isMinor === tecla.closeNote.isMinor ) ) {
                return opening ? tecla.openNote: tecla.closeNote.key;      
            } 
        }   
    }
    return false;
//            if(tecla.closeNote.key === nota.key  && nota.isMinor === tecla.closeNote.isMinor ) return tecla;
//            if(tecla.openNote.key === nota.key && nota.isMinor === tecla.openNote.isMinor ) return tecla;
    
};

ABCXJS.Tab2Part.prototype.toHex = function( s ) {
    
    if( s === 'z' || s === '>') return s;
    
    var p = s.indexOf( '\'' );
    var s1 = s.substr( 0, p );
    var s2 = s.substr( p );

    return ( p < 0 ) ? parseInt(s).toString(16) : parseInt(s1).toString(16) + s2;
};

ABCXJS.Tab2Part.prototype.getKeyAccOffset = function(note)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < this.keyAcidentals.length; a ++) {
      if( this.keyAcidentals[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.keyAcidentals[a].acc;
      }
  }
  return null;    
};
