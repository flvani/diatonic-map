/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

ABCXJS.Tab2Part = function () {
    this.abcText;
    this.tabText;
    this.tabLines;
    this.currLine;
    this.currBar;
    this.currStaff;
    this.barSyms = ":]|[";
    this.currColumn = 0; // posicao onde todas linhas da staff tem espaços
    this.barDuration = 0; // conta unidades de tempo a cada novo compasso
    
    this.init();
};
ABCXJS.Tab2Part.prototype.init = function () {
    this.currLine = 0;
    this.abcText = "";
    this.currBar = 1;
    this.currStaff = -1;    
    this.tablature = [];
};

ABCXJS.Tab2Part.prototype.parse = function (text) {
    this.tabText  = text;
    this.tabLines = this.extractLines();

    while(this.currLine < this.tabLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
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
    var voices = this.idStaff();
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    while( st > 0 ) {
        
        st = 0; // 0 para garantir a saida, caso não haja nada para ler

        this.posiciona(voices);
        
        for( var j = 0; j < voices.length; j ++ ) {
            st = Math.max(this.read( voices, j ), st);
        }

//        for( var j = 0; j < voices.length-1; j ++ ) {
//            if( voices[j].st !== voices[j+1].st && ! this.alertedMissSync) {
//                this.addWarning('Possível falta de sincronismo no compasso ' + this.currInterval + '.' ) ;
//                j = voices.length;
//                this.alertedMissSync = true;
//            }
//        }

        switch(st){
            case 1: // incluir a barra na tablatura
                // neste caso, todas as vozes são "bar", mesmo que algumas já terminaram 
                this.tablature[this.currStaff] =+ voices[0].token.str + ' ';
                this.barDuration = 0;

                for( var i = 0; i < voices.length; i ++ ) {
                    if(voices[i].st !== 'closed')
                      voices[i].st = 'waiting for data';
                }
                break;
            case 2:
                this.barDuration++;
                this.addTABChild(this.extraiIntervalo(voices));
                break;
        }
    } 
    
    
};

ABCXJS.Tab2Part.prototype.idStaff = function () {
    var p = [], i = -1, open = true;
    while(this.currLine < this.tabLines.length && (this.tabLines[this.currLine].charAt(0) === '|' || this.tabLines[this.currLine].charAt(0) === '/') ) {
        if( this.tabLines[this.currLine].charAt(0) === '|' ) {
            if( this.tabLines[this.currLine].match(/[ABCDFEGabcdefg]/) ){
               p[++i] = { bass:true, linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
            } else {
               open = !open;
               p[++i] = { bass:false, open: open,  linhas: [{l:this.currLine, pos:0}], st:'waiting for data' };
            }
        } else {
            p[i].linhas.push({l:this.currLine, pos:0});
        }  
        this.currLine++;
    }
    this.currStaff ++;
    this.tablature[this.currStaff] = "";
    return p;
};

ABCXJS.Tab2Part.prototype.posiciona = function(voices) {
    var found = false;
    var syms= ' \t';
    var qtd = 0;
    
    // procura a primeira coluna vazia
    while( ! found ) {
        found = true;
        for( var j = 0;  found && j < voices.length;  j++ ) {
            var voice = voices[j];
            qtd += voice.linhas.length;
            for( var i = 0; found && i < voice.linhas.length; i ++ ) {
                var l = this.tabLines[voice.linhas[i].l];
                if( this.currColumn < l.length && syms.indexOf( l.charAt(this.currColumn) ) < 0 ){
                    found = false;
                    this.currColumn ++;
                }
            }
        }
    }
    // procura a primeira coluna não-vazia
    this.currColumn ++;
    while( ! found ) {
        found = true;
        for( var j = 0;  found && j < voices.length;  j++ ) {
            var voice = voices[j];
            qtd += voice.linhas.length;
            for( var i = 0; found && i < voice.linhas.length; i ++ ) {
                var l = this.tabLines[voice.linhas[i].l];
                if( this.currColumn < l.length && syms.indexOf( l.charAt(this.currColumn) ) >= 0 ){
                    found = false;
                    this.currColumn ++;
                }
            }
        }
    }
    
    
};

ABCXJS.Tab2Part.prototype.read = function(p_source, item) {
    var source = p_source[item];
    switch( source.st ) {
        case "waiting for data":
            source.token = this.getToken(source);
            break;
        case "waiting end of interval":
            return 1;
            break;
        case "closed":
            return 0;
            break;
        case "processing":
            return 2;
            break;
               
    }
    
    if( source.linhas[0].pos < this.tabLines[source.linhas[0].l].length ) {
        if( source.token.type === 'triplet' ){
            alert( 'tratar triplets!');
        }
        //this.checkTies(source);
        source.st = (source.token.type === "bar") ? "waiting end of interval" : "processing";
        return (source.token.type === "bar") ? 1 : 2;
    } else {
        source.st = "closed";
        return 0;
    }
       
};
ABCXJS.Tab2Part.prototype.getToken = function(voice) {
    var token = "";
    var syms = "():|[]";
    var qtd = voice.linhas.length;
    
    this.skipSyms(voice, " \t"); 
    
    for( var i = 0; i < qtd; i ++ ) {
        var found = false;
        var ll = voice.linhas[i];
        while (ll.pos < Math.min( this.tabLines[ll.l].length, this.currColumn) && ! found ) {
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
    }
    //determina o tipo de token
    var type, syms = "():|[]";
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
    
    return { str: token, barNumber: this.currBar, type:type};
};

ABCXJS.Tab2Part.prototype.skipSyms = function( voice, syms ) {
    for( var i = 0; i < voice.linhas.length; i ++ ) {
        while (voice.linhas[i].pos < this.tabLines[voice.linhas[i].l].length && syms.indexOf(this.tabLines[voice.linhas[i].l].charAt(voice.linhas[i].pos)) >= 0) {
            voice.linhas[i].pos++ ;
        }
    }
};


ABCXJS.Tab2Part.prototype.extraiIntervalo = function(voices) {
    var minDur = 100;
    
    for( var i = 0; i < voices.length; i ++ ) {
        if( voices[i].st === 'processing' && voices[i].wi.duration && voices[i].wi.duration > 0  
                && voices[i].wi.duration*(voices[i].triplet?this.multiplier:1) < minDur ) {
            minDur = voices[i].wi.duration*(voices[i].triplet?this.multiplier:1);
        }
    }
    ;
    var wf = { el_type: 'note', duration: Number((minDur/this.multiplier).toFixed(5)), startChar: 0, endChar: 0, pitches:[], bassNote: [] }; // wf - final working item
    
    for( var i = 0; i < voices.length; i ++ ) {
        if(voices[i].st !== 'processing' ) continue;
        var elem = voices[i].wi;
        if( elem.rest ) {
            switch (elem.rest.type) {
                case "rest":
                    if( voices[i].bass ) 
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
            if( voices[i].bass ) {
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
        
        this.setTies(voices[i]);
        
        if( voices[i].wi.duration ) {
            voices[i].wi.duration -= minDur/(voices[i].triplet?this.multiplier:1);
            if( voices[i].wi.duration <= 0.0001 ) {
               voices[i].st = 'waiting for data';
            } else {
                if(voices[i].wi.pitches) {
                    for( var j = 0; j < voices[i].wi.pitches.length; j ++  ) {
                        voices[i].wi.pitches[j].inTie = true;
                    }
                }
            }
        }
    }
    
    for( var i = 0; i < voices.length; i ++ ) {
        var elem = voices[i];
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
