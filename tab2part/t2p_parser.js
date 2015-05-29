/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

ABCXJS.Tab2PartLine = function () {
   this.basses = [];
   this.treble = "";
   this.tablature = "";
};

ABCXJS.Tab2Part = function () {
    this.startSyms = "|/+%";
    this.barSyms = ":]|[";
    this.bassOctave =  2;
    this.init();
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
    this.currBar = 1;
    this.currStaff = -1;    
};

ABCXJS.Tab2Part.prototype.parse = function (text) {
    this.init();
    this.tabText  = text;
    this.tabLines = this.extractLines();

    while(this.currLine < this.tabLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
    
    //adicionar vozes treble, bass
    
    //adicionar accordionTab
    this.addLine( 'V:3 accordionTab' );
    
    var t= "";
    this.parsedLines.forEach( function(item) {
       t += item.tablature  + '\n';   
    });
    this.addLine( t.slice(0,-1) );
    
    return this.abcText;
};

ABCXJS.Tab2Part.prototype.extractLines = function () {
    var v = this.tabText.split('\n');
    v.forEach( function(linha, i) { v[i] = linha.trim(); } );
    return v;
    
};

ABCXJS.Tab2Part.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.tabLines[this.currLine].match(/^([CKLMT]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        this.addLine( header[0] );
    } else {
       this.parseStaff();
    }
};

ABCXJS.Tab2Part.prototype.skipEmptyLines = function () {
    while(this.currLine < this.tabLines.length) {
        if(  this.tabLines[this.currLine].charAt(0) !== '%' && this.tabLines[this.currLine].match(/^[\s\r\t]*$/) === null ) {
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
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    while( st > 0 ) {
        
        this.posiciona(staffs);
        
        st = this.read(staffs);

        switch(st){
            case 1: // incluir a barra na tablatura
                this.addBar(staffs, staffs[0].token.str );
                break;
            case 2:
                this.addNotes(staffs);
                break;
        }
    } 
};

ABCXJS.Tab2Part.prototype.addBar = function (staffs, bar ) {
    var cntBasses = 0, startTreble = true;
    
    // neste caso, todas as vozes da staff são "bar", mesmo que algumas já terminaram 
    this.addTabElem(bar + ' ');
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st !== 'closed') {
            if(staffs[i].bass) {
                this.addBassElem(cntBasses++, bar + ' ');
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

ABCXJS.Tab2Part.prototype.addNotes = function(staffs) {
    var cntBasses = 0, startTreble = true;
    var opening = true;
    var str;
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st === 'processing' ) {
            if( staffs[i].token.added ) {
                str = ">";
            } else {
                staffs[i].token.added = true; 
                str = staffs[i].token.str;
            }
            if(staffs[i].bass ){
                var note = this.handleTabElem(str);
                str = note.pitch;
                this.addTabElem(str);
                    verificar porque o token nunca é final quando desalinhado
                
                if( staffs[i].token.final ) {
                    this.addBassElem(cntBasses++, staffs[i]);
                    this.setStaffState(staffs[i]);
                }
            } else {
                if(startTreble){
                    opening = staffs[i].open;
                    startTreble = false;
                    this.addTabElem(opening?"-":"+");
                }
                if( (opening && staffs[i].open) || (!opening && !staffs[i].open) ) {
                    this.addTrebleElem(staffs[i]);
                    this.addTabElem(str);
                } else {
                    // não posso ter ambos (open e close)
                } 
            }
        }
    }
    if( this.trebleStaffs.open && this.trebleStaffs.close && 
            (this.trebleStaffs.open.token.final || this.trebleStaffs.close.token.final)){
        this.trebleStaffs.open.token.final = true;
        this.trebleStaffs.close.token.final = true;
        this.setStaffState(this.trebleStaffs.open);
        this.setStaffState(this.trebleStaffs.close);
        
    }
    if( this.columnDuration && this.columnDuration.length ) {
        this.addTabElem(this.columnDuration);
    }
    
    this.addTabElem(' ');
   
};

ABCXJS.Tab2Part.prototype.addTabElem = function (el) {
    this.parsedLines[this.currStaff].tablature += el;
    
};

ABCXJS.Tab2Part.prototype.handleTabElem = function (note) {
    var isChord = false, isMinor = false;
    if( "-m".indexOf( note.charAt(note.length-1)) > 0 ){
        isMinor = true;
        note = note.slice(0,-1);
    }
    if( note === note.toLowerCase() ) {
        isChord = true;
    }
    
    return {pitch:note, isMinor:isMinor, isChord:isChord};
};

ABCXJS.Tab2Part.prototype.addBassElem = function (idx, el) {
    var note, str;
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].basses[idx] += el;
    } else {
        if( el.hasToken && el.token.final ) {
            note = this.handleTabElem(el.token.str);
            
            if( note.isChord ) {
               str = this.getChord(note.pitch, note.isMinor );
            } else {
                str = this.getTabNote( ABCXJS.parse.normalizeAcc(note.pitch), this.bassOctave );
            }
            
            this.parsedLines[this.currStaff].basses[idx] += str;
        }
    }
};

ABCXJS.Tab2Part.prototype.addTrebleElem = function (el) {
    if(typeof( el ) === 'string' ) {
        this.parsedLines[this.currStaff].treble += el;
    } else {
        if( el.hasToken && el.token.final ) {
            this.parsedLines[this.currStaff].treble += el.token.str;
        }
    }
};

ABCXJS.Tab2Part.prototype.getChord = function ( pitch, isMinor ) {
    var p = ABCXJS.parse.normalizeAcc(pitch.toUpperCase());
    var base = ABCXJS.parse.key2number[p];
    
    if( !(base >= 0)  ) {
        throw new Error("Acorde não identificado: " + p);
    }
    
    var n2 = base + (isMinor?3:4);
    var n3 = base + 7;
    var oct = this.bassOctave + (base > 4 ? 0 : 1);
    
    
    return '[' + this.getTabNote( ABCXJS.parse.number2keysharp[base%12], oct ) 
                    + this.getTabNote( ABCXJS.parse.number2keysharp[n2%12], oct+Math.trunc(n2/12) ) 
                        + this.getTabNote( ABCXJS.parse.number2keysharp[n3%12], oct+Math.trunc(n3/12) ) + ']';

};

ABCXJS.Tab2Part.prototype.getTabNote = function ( note, octave ) {
  var n = note.replace( '♯', '' );
  var n = (n !== note ) ? '^' + n: n;
  var ret = n;
  
  if( octave <  4 ) {
      ret = n + Array(5-octave).join(",");
  } else if( octave === 5 ) {
      ret = n.toLowerCase();
  } else if( octave >  5 ) {
      ret = n.toLowerCase() + Array(octave-4).join("'");
  }
  return ret;
};

ABCXJS.Tab2Part.prototype.setStaffState = function ( staff ) {
    staff.hasToken = false;
    staff.st = (staff.linhas[0].pos < this.tabLines[staff.linhas[0].l].length ? 'waiting for data' : 'closed');
};

ABCXJS.Tab2Part.prototype.idStaff = function () {
    var p = [], i = -1, open = true, cntBasses = -1;
    
    this.endColumn = 0;
    this.startColumn = null;
    this.durationLine = null;
    this.columnDuration = null;
    this.trebleStaffs = { open: null, close: null};
    
    this.parsedLines[++this.currStaff] = new ABCXJS.Tab2PartLine();
    
    while(this.currLine < this.tabLines.length &&
            this.tabLines[this.currLine].trim().length && 
                this.startSyms.indexOf(this.tabLines[this.currLine].charAt(0)) >= 0 ) {
        switch( this.tabLines[this.currLine].charAt(0) ) {
            case '|':
                if( this.tabLines[this.currLine].match(/[ABCDFEGabcdefg]/) ){
                   p[++i] = { hasToken:false, bass:true, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
                   this.parsedLines[this.currStaff].basses[++cntBasses]="";
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
                this.durationLine = this.currLine;
                break;
            case '%':
                // ignora comentario
                break;
                
        }
        this.currLine++;
    }
    return p;
};

ABCXJS.Tab2Part.prototype.posiciona = function(staffs) {
    var found = false;
    var syms= ' \t';
    var qtd = 0;
    
    this.startColumn = this.endColumn;
    this.barEnding = false;
    
    // procura a primeira coluna vazia
    var cnt = 10000;
    while( ! found && --cnt ) {
        found = true;
        for( var j = 0;  found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn < l.length && syms.indexOf( l.charAt(this.endColumn) ) < 0 ){
                    found = false;
                    this.endColumn ++;
                }
            }
        }
    }
    
    if( ! cnt ) {
        throw new Error( 'Não pude processar tablatura: Posiciona Loop 1, start:'+this.startColumn+', end:'+this.endColumn+'.');
    }
    
    // procura a primeira coluna não-vazia
    this.endColumn ++;
    found = false;
    var cnt = 10000;
    while( ! found && --cnt ) {
        for( var j = 0;  !found && j < staffs.length;  j++ ) {
            var staff = staffs[j];
            qtd += staff.linhas.length;
            for( var i = 0; !found && i < staff.linhas.length; i ++ ) {
                var l = this.tabLines[staff.linhas[i].l];
                if( this.endColumn >= l.length || syms.indexOf( l.charAt(this.endColumn) ) < 0 ){
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
    if( ! cnt ) {
        throw new Error( 'Não pude processar tablatura: Posiciona Loop 2, start:'+this.startColumn+', end:'+this.endColumn+'.');
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
    var token = "";
    var syms = "():|[]";
    var spaces = " \t";
    var qtd = staff.linhas.length;
    var final = false;
    var type = null;
    
    this.skipSyms(staff, spaces ); 
    
    for( var i = 0; i < qtd; i ++ ) {
        var ll = staff.linhas[i];
        var found = false;
        while (ll.pos < Math.min( this.tabLines[ll.l].length, this.endColumn) && ! found ) {
            var c = this.tabLines[ll.l].charAt(ll.pos);
            if(  c !== ' ' ) {
                token += c;
                ll.pos++;
            } else {
                if(syms.indexOf( token.charAt(0) ) >= 0 ) {
                   qtd = 1; // força a saida processando so a primeira linha
                }
                found=true;
            }
        }
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
            final = true;
        }
    }
    staff.hasToken = token.trim().length !== 0;
    //determina o tipo de token
    if( staff.hasToken  ) {
        if( syms.indexOf( token.charAt(0) )>= 0 ) {
            if(token.charAt(0)=== '(' || token.charAt(0)=== ')' ) {
                type='triplet';
            } else {
                type='bar';
            }
        } else {
            type = 'note';
            if(qtd>1) {
                token = '['+token+']';
            }
        }
    }    
    
    var dur = 1;
    if( this.columnDuration && this.columnDuration.length ) {
        dur = parseInt(this.columnDuration);
    }
    
    return { str: token, duration: dur, barNumber: this.currBar, type:type, final: final, added: false };
};

ABCXJS.Tab2Part.prototype.updateToken = function(staff) {
    var final = false;
    var spaces = " \t";
    var qtd = staff.linhas.length;
    for( var i = 0; i < qtd; i ++ ) {
        var ll = staff.linhas[i];
        if( this.barEnding || ll.pos >= this.tabLines[ll.l].length || spaces.indexOf( this.tabLines[ll.l].charAt(this.endColumn)) < 0 ) {
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

ABCXJS.Tab2Part.prototype.skipSyms = function( staff, syms ) {
    for( var i = 0; i < staff.linhas.length; i ++ ) {
        while (staff.linhas[i].pos < 
                Math.min( this.tabLines[staff.linhas[i].l].length, this.endColumn)
                  && syms.indexOf(this.tabLines[staff.linhas[i].l].charAt(staff.linhas[i].pos)) >= 0) {
            staff.linhas[i].pos++ ;
        }
    }
};

ABCXJS.Tab2Part.prototype.addNotesUnused = function(staffs) {
    
    var minDur = 100;
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if( staffs[i].st === 'processing' && staffs[i].wi.duration && staffs[i].wi.duration > 0  
                && staffs[i].wi.duration*(staffs[i].triplet?this.multiplier:1) < minDur ) {
            minDur = staffs[i].wi.duration*(staffs[i].triplet?this.multiplier:1);
        }
    }
    ;
    var wf = { el_type: 'note', duration: Number((minDur/this.multiplier).toFixed(5)), startChar: 0, endChar: 0, pitches:[], bassNote: [] }; // wf - final working item
    
    for( var i = 0; i < staffs.length; i ++ ) {
        if(staffs[i].st !== 'processing' ) continue;
        var elem = staffs[i].wi;
        if( elem.rest ) {
            switch (elem.rest.type) {
                case "rest":
                    if( staffs[i].bass ) 
                        wf.bassNote[wf.bassNote.length] = ABCXJS.parse.clone(elem.rest);
                    else    
                        wf.pitches[wf.pitches.length] = ABCXJS.parse.clone(elem.rest);
                    break;
                case "invisible":
                case "spacer":
                    break;
            }        
        }else if( elem.pitches ) {
            ABCXJS.write.sortPitch(elem.pitches);
            if( staffs[i].bass ) {
                //todo: tratar adequadamente os acordes
                var isChord = elem.pitches.length>1;
                elem.pitches.splice(1, elem.pitches.length - 1);
                elem.pitches[0].chord=isChord;
                wf.bassNote[wf.bassNote.length] = ABCXJS.parse.clone(elem.pitches[0]);
            } else {
                for( var j = 0; j < elem.pitches.length; j ++  ) {
                    wf.pitches[wf.pitches.length] = ABCXJS.parse.clone(elem.pitches[j]);
                }
            }
        }
        
        this.setTies(staffs[i]);
        
        if( staffs[i].wi.duration ) {
            staffs[i].wi.duration -= minDur/(staffs[i].triplet?this.multiplier:1);
            if( staffs[i].wi.duration <= 0.0001 ) {
               staffs[i].st = 'waiting for data';
            } else {
                if(staffs[i].wi.pitches) {
                    for( var j = 0; j < staffs[i].wi.pitches.length; j ++  ) {
                        staffs[i].wi.pitches[j].inTie = true;
                    }
                }
            }
        }
    }
    
    for( var i = 0; i < staffs.length; i ++ ) {
        var elem = staffs[i];
        if( elem.wi.endTriplet){
            this.endTriplet = true;
            elem.triplet = false;
            this.multiplier = 1;
        }
    }    
    
    //trata intervalo vazio (quando há pausa em todas as vozes e não são visíveis)
    if(wf.pitches.length === 0 && wf.bassNote.length === 0 )
        wf.pitches[0] = {type:'rest'}; 
    
    return wf;
    
};
