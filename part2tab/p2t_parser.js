/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function toDecimalNote(str) {
    var r;
    switch (str) {
        case '>':
            r = ' '; // flavio
            break;
        case 'z':
            r = 'z';
            break;
        default:
            r = parseInt(str, 16);
    }
    return r;
};

function regexp_match(str,re) {
    var m, n=[];

    while ((m = re.exec(str)) !== null) {
        n.push(m);
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
    }
    return n;
}
;

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
    this.sparring = "";
    this.close = [""];
    this.open = [""];
    this.duration ="";
    this.pos = 0;
};

ABCXJS.Part2Tab = function () {
    
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
    
    this.validBasses = 'abcdefgABCDEFGz>';
    this.startSyms = "[|:";
    this.spaces = "\ \t";
    
    this.init();
    
    this.addWarning = function ( msg ) {
        this.warnings.push(msg);
    };
    
    this.getWarnings = function () {
        return this.warnings.join('<br>');
    };
};

ABCXJS.Part2Tab.prototype.init = function () {
    this.partText;
    this.partLines;
    this.parsedLines = [];
    this.currLine = 0;
    this.tabText = "";
    this.currBar = 0;
    this.warnings = [];
    this.inTab = false;
};

ABCXJS.Part2Tab.prototype.parse = function (text, keyboard ) {
    this.init();
    this.partText   = text;
    this.partLines  = this.extractLines();
    this.keyboard  = keyboard;
    this.hasErrors = false;
    
    while((!this.hasErrors) && this.currLine < this.partLines.length) {
        if( this.skipEmptyLines() ) {
            this.parseLine();
            this.currLine++;
        }
    }
    
    return this.tabText;
};

ABCXJS.Part2Tab.prototype.extractLines = function () {
    var v = this.partText.split('\n');
    v.forEach( function(linha, i) { 
        var l = linha.split('%');
        v[i] = l[0].trim(); 
    } );
    return v;
};

ABCXJS.Part2Tab.prototype.parseLine = function () {
    //var header = lines[l].match(/^([CKLMT]\:*[^\r\n\t]*)/g); - assim não remove comentarios
    var header = this.partLines[this.currLine].match(/^([CKLMTQV]\:*[^\r\n\t\%]*)/g);
    
    if( header ) {
        var key = this.partLines[this.currLine].match(/^([CKLMTQV]\:)/g);
        switch( key[0] ) {
            case 'V:': 
                 var x = header[0].match(/accordionTab/g);
                 if( x !== null ) {
                    this.inTab = true;
                 }
                 break;
            case 'K:': 
                var k = ABCXJS.parse.denormalizeAcc(header[0].trim().substr(2));
                header[0] = 'K:' + k;
                this.keyAcidentals = ABCXJS.parse.parseKeyVoice.standardKey(k);
                break;
        }
        if(key[0] !== 'V:' )  {
           this.addLine( header[0] );
        }  
    } else {
        if( this.inTab ) {
           var tabL =this.parseTab(); 
           this.addLine( tabL.basses);
           for( var r =0; r <tabL.close.length; r++){
               this.addLine( tabL.close[r]);
           }
           for( var r =0; r <tabL.open.length; r++){
               this.addLine( tabL.open[r]);
           }
           this.addLine( tabL.duration+'\n');
        }
    }
};

ABCXJS.Part2Tab.prototype.parseTab = function () {
    var line = { str:this.partLines[this.currLine], posi:0, pos:0, tokenType:1,currToken:''};
    var tabline = new ABCXJS.Part2TabLine();
    
    if( line.length === 0 ) {
        this.hasErrors = true;
        return;
    }
    
    var cnt = 1000; // limite de saida para o caso de erro de alinhamento do texto
    while( line.tokenType > 0 && --cnt ) {
        
        this.getToken(line);

        switch(line.tokenType){
            case 1: // bar
                this.addBar(tabline, line.currToken);
                break;
            case 2: // note
                this.addNotes(tabline, line);
                break;
        }
    } 
    
    if( line.tokenType < 0 ) {
        this.addWarning('Encontrados simbolos inválidos na linha ('+this.currLine+','+line.posi+') .');
        this.hasErrors = true;
    }
    if( ! cnt ) {
        this.addWarning('Não pude processar tablatura após 1000 ciclos. Possivel desalinhamento de texto.');
        this.hasErrors = true;
    }
    return tabline;
};

ABCXJS.Part2Tab.prototype.addBar = function (tabline, token) {
    
    var l = token.length;
    
    tabline.basses += token + ' ';
    for(var r=0; r < tabline.close.length; r++){
        tabline.close[r] += token + ' ';
    }
    for(var r=0; r < tabline.open.length; r++){
        tabline.open[r] += token + ' ';
    }
    
    if(tabline.pos===0){
        tabline.sparring += '/' + rpad( ' ', ' ', l);
        tabline.duration = '+'  + rpad( ' ', ' ', l);
    } else {
        tabline.sparring += token + ' ';
        tabline.duration += rpad( ' ', ' ', l+1);
    }
    
    tabline.pos +=( l+1);
    
};

ABCXJS.Part2Tab.prototype.addNotes = function(tabline, line) {
    
    var parsedNotes = line.parsedNotes;
//    if( parsedNotes.empty ){
//      var x =1;  
//    };
    
    if( parsedNotes.empty &&  (line.parsedNotes.bas.trim().length === 0 || line.parsedNotes.currBar !== line.lastParsedNotes.currBar )) {
        line.lastParsedNotes.currBar = line.parsedNotes.currBar;
        var lastNotes = line.lastParsedNotes.notes;
        if(parsedNotes.closing) {
            var i = tabline.close[0].lastIndexOf( lastNotes[0] ) + line.lastParsedNotes.maxL;
            for(var r=0; r < tabline.close.length; r++){
               var str = tabline.close[r];
                if(r<parsedNotes.notes.length) {
                    var n = str.lastIndexOf(lastNotes[r]);
                    tabline.close[r] = str.slice(0, n) + str.slice(n).replace(lastNotes[r],lastNotes[r]+'-');
                } else {
                    tabline.close[r] = str.slice(0, i) +' '+ str.slice(i); 
                }
            }
            for(var r=0; r < tabline.open.length; r++){
                var str = tabline.open[r];
                tabline.open[r] = str.slice(0, i) +' '+ str.slice(i); 
            }
        } else {
            var i = tabline.open[0].lastIndexOf( lastNotes[0] ) + line.lastParsedNotes.maxL;
            for(var r=0; r < tabline.open.length; r++){
               var str = tabline.open[r];
                if(r<parsedNotes.notes.length) {
                    var n = str.lastIndexOf(lastNotes[r]);
                    tabline.open[r] = str.slice(0, n) + str.slice(n).replace(lastNotes[r],lastNotes[r]+'-');
                } else {
                    tabline.open[r] = str.slice(0, i) +' '+ str.slice(i); 
                }
            }
            for(var r=0; r < tabline.close.length; r++){
                 var str = tabline.close[r];
                tabline.close[r] = str.slice(0, i) +' '+ str.slice(i); 
            }
        }
        tabline.duration = tabline.duration.slice(0, i) +' '+ tabline.duration.slice(i); 
        tabline.sparring = tabline.sparring.slice(0, i) +' '+ tabline.sparring.slice(i); 
        tabline.basses = tabline.basses.slice(0, i) +' '+ tabline.basses.slice(i); 
        line.parsedNotes = window.ABCXJS.parse.clone(line.lastParsedNotes);
        parsedNotes.notes = lastNotes;
        parsedNotes.maxL = Math.max( parsedNotes.maxL, line.lastParsedNotes.maxL );
    }
    
    var l = parsedNotes.maxL+1;
    
    tabline.basses += parsedNotes.bas+ rpad( ' ', ' ', l-parsedNotes.bas.length);
    
    if( parsedNotes.closing) {
        while (tabline.close.length < parsedNotes.notes.length) {
           tabline.close.push(window.ABCXJS.parse.clone(tabline.sparring) );
        }
        for(var r=0; r < tabline.close.length; r++){
            if(r<parsedNotes.notes.length) {
                tabline.close[r] += parsedNotes.notes[r] + rpad( ' ', ' ', l-parsedNotes.notes[r].length);
            } else {
                tabline.close[r] += rpad( ' ', ' ', l);
            }
        }
        for(var r=0; r < tabline.open.length; r++){
            tabline.open[r] += rpad( ' ', ' ', l);
        }
        
    }    else {
        while (tabline.open.length < parsedNotes.notes.length) {
           tabline.open.push(window.ABCXJS.parse.clone(tabline.sparring) );
        }
        for(var r=0; r < tabline.open.length; r++){
            if(r<parsedNotes.notes.length) {
                tabline.open[r] += parsedNotes.notes[r] + rpad( ' ', ' ', l-parsedNotes.notes[r].length);
            } else {
                tabline.open[r] += rpad( ' ', ' ', l);
            }
        }
        for(var r=0; r < tabline.close.length; r++){
            tabline.close[r] += rpad( ' ', ' ', l);
        }
        
    }
    tabline.sparring += rpad( ' ', ' ', l);
    
    if( parsedNotes.duration === "1" ||  parsedNotes.duration === "") {
        tabline.duration += rpad( ' ', ' ', l);
    } else {
        tabline.duration += parsedNotes.duration + rpad( ' ', ' ', l-parsedNotes.duration.length);
    }
    tabline.pos += l;
};

ABCXJS.Part2Tab.prototype.getNotes = function (strBass, strNote, closing) {
    var t, n = [], d, nn, b, l = 0;

    //parse do baixo
    b = strBass.match(/(A|B|C|D|E|F|G|z|>)[(♭|♯)]{0,1}/gi);
    if (b.length < 1) {
        return null;
    } else {
         b[0] = b[0]=== '>' ? ' ': b[0]; // flavio
        l = Math.max(l, b[0].length);
    }

    //multiplas notas?
    t = regexp_match(strNote, /\[(.*?)\](\d{0,1}[\.|\/]{0,1}\d{0,2})/gi);
    if (t.length === 1) {
        d = t[0][2];
        l = Math.max(l, d.length);

        nn = regexp_match(t[0][1], /(\>|z|[a-f]|[0-9])(\'{0,})/gi);
        nn.forEach(function (e) {
            var v = toDecimalNote(e[1]) + e[2];
            n.push(v);
            l = Math.max(l, v.length);
        });

    } else {
        //nota única e duração
        t = regexp_match(strNote, /(\>|z|[a-f]|[0-9])(\'{0,})(\d{0,1}[\.|\/]{0,1}\d{0,2})/gi);
        if (t.length === 1) {

            n.push(toDecimalNote(t[0][1]) + t[0][2]);
            l = Math.max(l, n[0].length);
            d = t[0][3];
            l = Math.max(l, d.length);
        } else {
            return null;
        }
    }
    
    var pn = {bas: b[0], notes: n, duration: d, closing: closing, maxL: l, currBar: this.currBar, empty:false };
    var checkEmpty = ' '; //pn.bas;
    pn.notes.forEach( function(e) { checkEmpty+=e;});
    if( checkEmpty.trim().length === 0 ) {
       pn.empty = true; 
    }
    
    return pn;
};

ABCXJS.Part2Tab.prototype.parseNotes = function( token) {
    var v,notes;
    if( token.indexOf('+')>0){
        v= token.split('+');
       notes=this.getNotes(v[0],v[1], true);
    } else {
        v= token.split('-');
        notes=this.getNotes(v[0],v[1], false );
    }
    return notes;
};

ABCXJS.Part2Tab.prototype.getToken = function(line) {
    var found = false;
    var c = '';
    
    this.skipSyms(line, this.spaces );
    
    line.currToken = '';
    line.tokenType = 0;
    line.posi = line.pos;
    
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
        if( line.tokenType === 1 ) {
            this.currBar++;
        }
    }   
    
    if(found && line.tokenType===2) {
        if( line.parsedNotes !== undefined && ! line.parsedNotes.empty ) {
            line.lastParsedNotes = line.parsedNotes;
        }
        line.parsedNotes = this.parseNotes( line.currToken ) ;
        if( line.parsedNotes === null ) {
            line.tokenType=-1;
        }
    }
};

ABCXJS.Part2Tab.prototype.skipSyms = function( linha, syms ) {
    while (linha.pos < linha.str.length
              && syms.indexOf(linha.str.charAt(linha.pos)) >= 0) {
        linha.pos++ ;
    }
};

ABCXJS.Part2Tab.prototype.skipEmptyLines = function () {
    while(this.currLine < this.partLines.length) {
        if(  this.partLines[this.currLine].charAt(0) !== '%' && this.partLines[this.currLine].match(/^[\s\r\t]*$/) === null ) {
           return true;
        };
        this.currLine++;
    }
    return false;
};

ABCXJS.Part2Tab.prototype.addLine = function (ll) {
    this.tabText += ll + '\n';
};
