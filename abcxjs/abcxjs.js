//    abc_tunebook.js: splits a string representing ABC Music Notation into individual tunes.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global document, Raphael */
/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

(function() {
ABCXJS.numberOfTunes = function(abc) {
	var tunes = abc.split("\nX:");
	var num = tunes.length;
	if (num === 0) num = 1;
	return num;
};

ABCXJS.TuneBook = function(book) {
	var This = this;
	var directives = "";
	book = window.ABCXJS.parse.strip(book);
	var tunes = book.split("\nX:");
	for (var i = 1; i < tunes.length; i++)	// Put back the X: that we lost when splitting the tunes.
		tunes[i] = "X:" + tunes[i];
	// Keep track of the character position each tune starts with.
	var pos = 0;
	This.tunes = [];
	window.ABCXJS.parse.each(tunes, function(tune) {
		This.tunes.push({ abc: tune, startPos: pos});
		pos += tune.length;
	});
	if (This.tunes.length > 1 && !window.ABCXJS.parse.startsWith(This.tunes[0].abc, 'X:')) {	// If there is only one tune, the X: might be missing, otherwise assume the top of the file is "intertune"
		// There could be file-wide directives in this, if so, we need to insert it into each tune. We can probably get away with
		// just looking for file-wide directives here (before the first tune) and inserting them at the bottom of each tune, since
		// the tune is parsed all at once. The directives will be seen before the printer begins processing.
		var dir = This.tunes.shift();
		var arrDir = dir.abc.split('\n');
		window.ABCXJS.parse.each(arrDir, function(line) {
			if (window.ABCXJS.parse.startsWith(line, '%%'))
				directives += line + '\n';
		});
	}
	This.header = directives;

	// Now, the tune ends at a blank line, so truncate it if needed. There may be "intertune" stuff.
	window.ABCXJS.parse.each(This.tunes, function(tune) {
		var end = tune.abc.indexOf('\n\n');
		if (end > 0)
			tune.abc = tune.abc.substring(0, end);
		tune.pure = tune.abc;
		tune.abc = directives + tune.abc;

		// for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n
		var title = tune.pure.split("T:");
		if (title.length > 1) {
			title = title[1].split("\n");
			tune.title = title[0].replace(/^\s+|\s+$/g, '');;
		} else
			tune.title = "";

		// for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n
		var comps = tune.pure.split("C:");
                tune.composer = "";
                for( var c = 1; c <  comps.length; c ++ ) {
                    var aux = comps[c].split("\n");
                    tune.composer += (c>1?'<br>':'') + aux[0].replace(/^\s+|\s+$/g, '');
		} 

		// for the user's convenience, parse and store the id separately. The id is between the first X: and the next \n
		var id = tune.pure.substring(2,tune.pure.indexOf("\n"));
		tune.id = id.replace(/^\s+|\s+$/g, '');
	});
};

ABCXJS.TuneBook.prototype.getTuneById = function (id) {
	for (var i = 0; i < this.tunes.length; i++) {
		if (this.tunes[i].id === id)
			return this.tunes[i];
	}
	return null;
};

ABCXJS.TuneBook.prototype.getTuneByTitle = function (title) {
	for (var i = 0; i < this.tunes.length; i++) {
		if (this.tunes[i].title === title)
			return this.tunes[i];
	}
	return null;
};

function renderEngine(callback, output, abc, parserParams, renderParams) {
	var isArray = function(testObject) {
		return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
	};

	// check and normalize input parameters
	if (output === undefined || abc === undefined)
		return;
	if (!isArray(output))
		output = [ output ];
	if (parserParams === undefined)
		parserParams = {};
	if (renderParams === undefined)
		renderParams = {};
	var currentTune = renderParams.startingTune ? renderParams.startingTune : 0;

	// parse the abc string
	var book = new ABCXJS.TuneBook(abc);
	var abcParser = new window.ABCXJS.parse.Parse();

	// output each tune, if it exists. Otherwise clear the div.
	for (var i = 0; i < output.length; i++) {
		var div = output[i];
		if (typeof(div) === "string")
			div = document.getElementById(div);
		if (div) {
			div.innerHTML = "";
			if (currentTune < book.tunes.length) {
				abcParser.parse(book.tunes[currentTune].abc, parserParams);
				var tune = abcParser.getTune();
				callback(div, tune);
			}
		}
		currentTune++;
	}
}

})();
//    abc_tune.js: a computer usable internal structure representing one tune.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.data)
    window.ABCXJS.data = {};

// This is the data for a single ABC tune. It is created and populated by the window.ABCXJS.parse.Parse class.
window.ABCXJS.data.Tune = function() {
    // The structure consists of a hash with the following two items:
    // metaText: a hash of {key, value}, where key is one of: title, author, rhythm, source, transcription, unalignedWords, etc...
    // tempo: { noteLength: number (e.g. .125), bpm: number }
    // lines: an array of elements, or one of the following:
    //      STAFFS: array of elements
    //      SUBTITLE: string - flavio removed this kind of line (it is now one of the staff's attributes)
    //
    // TODO: actually, the start and end char should modify each part of the note type
    // The elements all have a type field and a start and end char
    // field. The rest of the fields depend on the type and are listed below:
    // REST: duration=1,2,4,8; chord: string
    // NOTE: accidental=none,dbl_flat,flat,natural,sharp,dbl_sharp
    //		pitch: "C" is 0. The numbers refer to the pitch letter.
    //		duration: .5 (sixteenth), .75 (dotted sixteenth), 1 (eighth), 1.5 (dotted eighth)
    //			2 (quarter), 3 (dotted quarter), 4 (half), 6 (dotted half) 8 (whole)
    //		chord: { name:chord, position: one of 'default', 'above', 'below' }
    //		end_beam = true or undefined if this is the last note in a beam.
    //		lyric: array of { syllable: xxx, divider: one of " -_" }
    //		startTie = true|undefined
    //		endTie = true|undefined
    //		startTriplet = {num <- the number to print, notes <- total elements} 
    //		endTriplet = true|undefined (the last note of the triplet)
    // TODO: actually, decoration should be an array.
    //		decoration: upbow, downbow, accent
    // BAR: type=bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat
    //	number: 1 or 2: if it is the start of a first or second ending
    // CLEF: type=treble,bass,accordionTab
    // KEY-SIG:
    //		accidentals[]: { acc:sharp|dblsharp|natural|flat|dblflat,  note:a|b|c|d|e|f|g }
    // METER: type: common_time,cut_time,specified
    //		if specified, { num: 99, den: 99 }
    
    this.reset = function() {
        this.metaText = {};
        this.formatting = {};
        this.lines = [];
        this.media = "screen";
        this.version = "1.0.1";
        this.subtitle = "";
        this.tabStaffPos = -1;
        this.hasTablature = false;
        this.staffNum = 0;
        this.voiceNum = 0;
        this.lineNum = 0;
    };
    
    this.setFormat = function(vars) {
        var ph, pw;
        var ss = vars.staffsep|| 0;
        var ps = (vars.papersize || 'a4').toLowerCase();
        var ls = vars.landscape || false;
        var pn = vars.pagenumbering || false;
        
        // inicialmente se usava 72dpi. 
        // atualmente qualquer impressora, imprime no mínimo em 300dpi
        // como é apenas um número, vou garantir que a largura de tela de pelo menos 1024 pontos
        // considerada a largura do papel a4, menos 1cm de margem em cada lado
        var dpi = 136.8508560545; //72;
        
        var defaultMargin = 1; // cm
        var defaultMarginDPI = defaultMargin / 2.54 * dpi; // (1cm / 1 inch * dots.per.inch)
                
        switch (ps) {
            case "letter":
                ph = 11 * dpi;
                pw = 8.5 * dpi;
                break;
            case "legal":
                ph = 14 * dpi;
                pw = 8.5 * dpi;
                break;
            case "screen":
                ph = 16 * dpi;
                pw = 8 * dpi;
                break;
            case "a4":
            default:    
                ph = 11.69 * dpi;
                pw = 8.27 * dpi;
                break;
        }
        
        if (ls) { // landscape
            var x = ph;
            ph = pw;
            pw = x;
        }
        
        // para garantir que a largura da estaff nunca seja maior que a proporcao gerada por pageratio (para não forçara impressora a reduzir a impressao)
        // também garante um zoom de 20% na impressão em landscape, reduzindo o largura útil e forçando a impressora a imprimir com zoom
        this.formatting.usablewidth = (pw-(2*defaultMarginDPI)) * (ls? 0.82 : 1);

        // para estimar o comprimento da página
        this.formatting.pageratio = (ph-(2*defaultMarginDPI))/(pw-(2*defaultMarginDPI));
        
        
        if (!this.formatting.landscape)         this.formatting.landscape = ls;
        if (!this.formatting.papersize)         this.formatting.papersize = ps.toLowerCase();
        if (!this.formatting.defaultMargin)     this.formatting.defaultMargin = ''+defaultMargin+'cm';
        if (!this.formatting.pagewidth)         this.formatting.pagewidth = pw;
        if (!this.formatting.pageheight)        this.formatting.pageheight = ph;
        if (!this.formatting.pagenumbering)     this.formatting.pagenumbering = pn;
        if (!this.formatting.staffsep)          this.formatting.staffsep = ss;
        if (!this.formatting.barsperstaff)      this.formatting.barsperstaff = vars.barsperstaff;
        if (!this.formatting.staffwidth)        this.formatting.staffwidth = this.formatting.usablewidth;
        if (!this.formatting.tabInferenceOpts ) this.formatting.tabInferenceOpts = +1.0;
        if (!this.formatting.restsInTab )       this.formatting.restsInTab = false;
        if (!this.formatting.hideFingering )    this.formatting.hideFingering = false;
        
    };
    
    this.handleBarsPerStaff = function() {
        function splitBar(left, right) {
            
            // divide as decorações de jump
            if( left.jumpDecoration ) {
                var jd = window.ABCXJS.parse.clone(left.jumpDecoration);
                delete left.jumpDecoration;
                delete right.jumpDecoration;
                for(var j=0; j< jd.length; j ++ ) {
                    if( (".coda.fine.dacapo.dacoda.dasegno.").indexOf('.'+jd[j].type+'.') >= 0 ) {
                        left.jumpDecoration = left.jumpDecoration || [];
                        left.jumpDecoration.push( jd[j] ); 
                    } else {
                        right.jumpDecoration = right.jumpDecoration || [];
                        right.jumpDecoration.push( jd[j] ); 
                        
                    }
                }
            }    
                
            // todos os jumpInfo ficam a esquerda do split
            // exceto segno todos os jumpPoint ficam a esquerda do split
            if(  left.jumpPoint && left.jumpPoint.type === 'segno'  ) {
                delete left.jumpInfo;
            }
            // todos os jumpInfo ficam a esquerda do split
            if(  right.jumpInfo ) {
                delete right.jumpInfo;
            }
            // exceto segno todos os jumpPoint ficam a esquerda do split
            if(  right.jumpPoint &&  right.jumpPoint.type !== 'segno'  ) {
                delete right.jumpInfo;
            }
            
            
            delete left.startEnding;
            delete left.barNumber;
            delete left.barNumberVisible;
            switch( left.type ) {
                case 'bar_dbl_repeat': 
                case 'bar_right_repeat': 
                   left.type = 'bar_right_repeat';
                   break;
                case 'bar_thin': 
                case 'bar_left_repeat':
                  left.type = 'bar_thin'; 
            }
            
            delete right.endEnding;
            delete right.endDrawEnding;
            switch( right.type ) {
                case 'bar_dbl_repeat': 
                case 'bar_left_repeat': 
                   right.type = 'bar_left_repeat';
                   break;
                case 'bar_thin': 
                case 'bar_right_repeat':
                  right.type = 'bar_thin'; 
            }
        };
        
        function joinBar(left, right) {
            if(right === undefined ) {
                return;
            }
            
            // flavio - não verificado
            if(right.jumpPoint) {
                left.jumpPoint = right.jumpPoint;
            }
            
            // flavio - não verificado
            if(right.jumpInfo) {
                left.jumpInfo = right.jumpInfo;
            }
            
            if( right.jumpDecoration ) {
                for(var j=0; j< right.jumpDecoration.length; j ++ ) {
                    left.jumpDecoration = left.jumpDecoration || [];
                    left.jumpDecoration.push( right.jumpDecoration[j] ); 
                }
            }
            
            if(right.startEnding){
                left.startEnding = right.startEnding;
            }
            
            if(right.barNumber){
                left.barNumber = right.barNumber;
                left.barNumberVisible = right.barNumberVisible;
            }

            if( left.type === 'bar_right_repeat' ) {
                left.type  = right.type === 'bar_left_repeat'?'bar_dbl_repeat':'bar_right_repeat';
            } else {
                left.type  = right.type === 'bar_left_repeat'?'bar_left_repeat':'bar_thin';
            }
        };

        
        if (!this.formatting.barsperstaff) return;
        
        var limite = this.formatting.barsperstaff + 1; // assumir n compassos === n + 1 bars
        var split_pos = 0, original_bar;
        var nextline = 0;
                
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                nextline = (this.lines[i+1]=== undefined || this.lines[i+1].staffs !== undefined)? i+1 : i+2; // assume que não há duas linhas newpage em seguida
                for (var s = 0; s < this.lines[i].staffs.length; s++) {
                    for (var v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                        var barNumThisLine = 0;
                        for (var n = 0; n < this.lines[i].staffs[s].voices[v].length; n++) {
                            if(this.lines[i].staffs[s].voices[v][n].el_type === 'bar') {
                               barNumThisLine ++;
                               if(limite===barNumThisLine) {
                                   split_pos = n;
                                   original_bar = this.lines[i].staffs[s].voices[v][n].type;
                               }
                            }
                            if( n === this.lines[i].staffs[s].voices[v].length-1 && barNumThisLine < limite && i < this.lines.length - 1){
                                //fim da voz, quantidade de compassos inferior ao limite e existe linhas baixo = unir com a linha de baixo
                                var cp = JSON.parse(JSON.stringify(this.lines[nextline]));
                                this.lines.splice(nextline,1);
                                for (var ss = 0; ss < this.lines[i].staffs.length; ss++) {
                                    for (var vv = 0; vv < this.lines[i].staffs[ss].voices.length; vv++){
                                        var section1 = this.lines[i].staffs[ss].voices[vv];
                                        var section2 = cp.staffs[ss].voices[vv].splice(1);
                                        joinBar(section1[section1.length-1], cp.staffs[ss].voices[vv][0] );
                                        this.lines[i].staffs[ss].voices[vv] = section1.concat(section2);
                                        
                                        //trata lyricsRows, garantido que a maior quantidade prevaleça na linha previa
                                        try {
                                            var mlr = Math.max( this.lines[i].staffs[ss].lyricsRows, this.lines[nextline].staffs[ss].lyricsRows );
                                            this.lines[i].staffs[ss].lyricsRows = mlr;
                                        }catch(e){
                                          
                                        }
                                    }
                                }
                            }
                        }    
                        var excesso = barNumThisLine - limite;
                        var ultimaLinha = (i === this.lines.length - 1 );

                        // move o excesso para a proxima linha.
                        // no caso da última linha, só se sobrar mais de 1 compasso.
                        if( (!ultimaLinha && excesso > 0 ) || ( ultimaLinha && excesso > 1 )) {
                            // se necessário cria uma nova linha.
                            if ( ultimaLinha ) {
                                var cp = JSON.parse(JSON.stringify(this.lines[i]));
                                this.lines.push(window.ABCXJS.parse.clone(cp));
                                for (var ss = 0; ss < this.lines[i + 1].staffs.length; ss++) {
                                    for (var vv = 0; vv < this.lines[i + 1].staffs[ss].voices.length; vv++)
                                        this.lines[nextline].staffs[ss].voices[vv] = [];
                                }
                            }

                            var section1 = this.lines[i].staffs[s].voices[v].slice(0, split_pos+1);
                            var section2 = this.lines[i].staffs[s].voices[v].slice(split_pos);
                            var section3 = this.lines[nextline].staffs[s].voices[v].slice(1);
                            
                            section2[0] = window.ABCXJS.parse.clone(section2[0]);

                            splitBar( section1[section1.length-1], section2[0] );
                            joinBar( section2[section2.length-1], this.lines[nextline].staffs[s].voices[v][0] );

                            this.lines[i].staffs[s].voices[v] = section1;
                            this.lines[nextline].staffs[s].voices[v] = section2.concat(section3);
                            
                            //trata lyricsRows, garantido que a maior quantidade prevaleça na nova linha
                            var mlr = Math.max( this.lines[i].staffs[s].lyricsRows, this.lines[nextline].staffs[s].lyricsRows );
                            this.lines[nextline].staffs[s].lyricsRows = mlr;

                        }
                    }
                }
            }
        }
    };
    
    this.checkJumpMarkers = function (addWarning) {
        // esta rotina:
        //   cria uma estrutura de auxilio para midi parser
        //   ajuda no layout dos jump markers que devem impressos na última pauta de cada staff
        //   verifica a conformidade das barras de compasso da primeira voz com as demais;
        //
        // Note: deveria ser chamada somente depois de handleBarsPerStaff que pode alterar os arrays gerados no parse.
        
        // identifica as vozes varrendo a primeira linha com staffs
        var vozes = [];
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                for (var s = 0; s < this.lines[i].staffs.length; s++) {
                    for (var v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                        vozes.push( {el:0, sf: s, vc: v });
                    }
                }
                break;
            }
        }
        
        // voz referencial        
        var v0 = vozes[0]; // primeira
        var vn = vozes[vozes.length-1]; // última
        
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {

                for( var r = 0; r < vozes.length; r++){
                    vozes[r].el = 0; // sempre recomeçar a varredura dos elementos em cada nova linha
                }

                // talvez por conta da auto atualização isso acconteca - verificar problemas mais adiante
                if(!this.lines[i].staffs[v0.sf] || !this.lines[i].staffs[vn.sf] ) continue;
                
                this.lines[i].staffs[v0.sf].voices[v0.vc].firstVoice = true;
                this.lines[i].staffs[vn.sf].voices[vn.vc].lastVoice = true;
                
                if( vozes.length < 2 ) continue; // apenas marca a única voz como primeira e última, em cada linha
                
                var a0 = this.lines[i].staffs[v0.sf].voices[v0.vc];
                
                while( v0.el < a0.length ) {
                    
                    while( v0.el < a0.length && a0[v0.el].el_type !== 'bar' ) {
                        v0.el++;
                    }

                    if( ! a0[v0.el] || a0[v0.el].el_type !== 'bar' ) break;

                    var bar = a0[v0.el];
                    v0.el++; 

                    for( var v = 1; v < vozes.length; v++ ) {
                        var vi = vozes[v];
                        var ai = this.lines[i].staffs[vi.sf].voices[vi.vc];
                        
                        while( vi.el < ai.length && ai[vi.el].el_type !== 'bar' ) {
                            vi.el++;
                        }
                        if( ! ai[vi.el] || ai[vi.el].el_type !== 'bar' ) {
                            addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Numero de barras diferente da primeira voz');
                        } else {

                            var bari = ai[vi.el];
                            vi.el++;

                            if( bar.type !== bari.type  || bar.repeat !== bari.repeat )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando tipo de barra de compasso '+bar.barNumber+'.');
                                bari.type = bar.type;
                                bari.repeat = bar.repeat;
                            }

                            if( bar.startEnding && bar.startEnding !== bari.startEnding )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando ending do compasso '+bar.barNumber+'.');
                                bari.startEnding = bar.startEnding;
                            }
                            
                            if( bar.endEnding && bar.endEnding !== bari.endEnding )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando ending do compasso '+bar.barNumber+'.');
                                bari.endEnding = bar.endEnding;
                            }
                            
                            // todas as vozes terão a mesma informação de jump
                            bari.jumpPoint = bar.jumpPoint;
                            bari.jumpInfo = bar.jumpInfo;
                            bari.jumpDecoration = bar.jumpDecoration;
                        }
                    }
                }
            }
        }

    };


    this.cleanUp = function() {
        
        function cleanUpSlursInLine(line) {
            var currSlur = [];
            var x;

            var addEndSlur = function(obj, num, chordPos) {
                if (currSlur[chordPos] === undefined) {
                    // There isn't an exact match for note position, but we'll take any other open slur.
                    for (x = 0; x < currSlur.length; x++) {
                        if (currSlur[x] !== undefined) {
                            chordPos = x;
                            break;
                        }
                    }
                    if (currSlur[chordPos] === undefined) {
                        var offNum = chordPos * 100;
                        window.ABCXJS.parse.each(obj.endSlur, function(x) {
                            if (offNum === x)
                                --offNum;
                        });
                        currSlur[chordPos] = [offNum];
                    }
                }
                var slurNum;
                for (var i = 0; i < num; i++) {
                    slurNum = currSlur[chordPos].pop();
                    obj.endSlur.push(slurNum);
                }
                if (currSlur[chordPos].length === 0)
                    delete currSlur[chordPos];
                return slurNum;
            };

            var addStartSlur = function(obj, num, chordPos, usedNums) {
                obj.startSlur = [];
                if (currSlur[chordPos] === undefined) {
                    currSlur[chordPos] = [];
                }
                var nextNum = chordPos * 100 + 1;
                for (var i = 0; i < num; i++) {
                    if (usedNums) {
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                    }
                    window.ABCXJS.parse.each(currSlur[chordPos], function(x) {
                        if (nextNum === x)
                            ++nextNum;
                    });
                    window.ABCXJS.parse.each(currSlur[chordPos], function(x) {
                        if (nextNum === x)
                            ++nextNum;
                    });

                    currSlur[chordPos].push(nextNum);
                    obj.startSlur.push({label: nextNum});
                        
                    nextNum++;
                }
            };

            for (var i = 0; i < line.length; i++) {
                var el = line[i];
                if (el.el_type === 'note') {
                    if (el.gracenotes) {
                        for (var g = 0; g < el.gracenotes.length; g++) {
                            if (el.gracenotes[g].endSlur) {
                                var gg = el.gracenotes[g].endSlur;
                                el.gracenotes[g].endSlur = [];
                                for (var ggg = 0; ggg < gg; ggg++)
                                    addEndSlur(el.gracenotes[g], 1, 20);
                            }
                            if (el.gracenotes[g].startSlur) {
                                x = el.gracenotes[g].startSlur;
                                addStartSlur(el.gracenotes[g], x, 20);
                            }
                        }
                    }
                    if (el.endSlur) {
                        x = el.endSlur;
                        el.endSlur = [];
                        addEndSlur(el, x, 0);
                    }
                    if (el.startSlur) {
                        x = el.startSlur;
                        addStartSlur(el, x, 0);
                    }
                    if (el.pitches) {
                        var usedNums = [];
                        for (var p = 0; p < el.pitches.length; p++) {
                            if (el.pitches[p].endSlur) {
                                var k = el.pitches[p].endSlur;
                                el.pitches[p].endSlur = [];
                                for (var j = 0; j < k; j++) {
                                    var slurNum = addEndSlur(el.pitches[p], 1, p + 1);
                                    usedNums.push(slurNum);
                                }
                            }
                        }
                        for (p = 0; p < el.pitches.length; p++) {
                            if (el.pitches[p].startSlur) {
                                x = el.pitches[p].startSlur;
                                addStartSlur(el.pitches[p], x, p + 1, usedNums);
                            }
                        }
                        // Correct for the weird gracenote case where ({g}a) should match.
                        // The end slur was already assigned to the note, and needs to be moved to the first note of the graces.
                        if (el.gracenotes && el.pitches[0].endSlur && el.pitches[0].endSlur[0] === 100 && el.pitches[0].startSlur) {
                            if (el.gracenotes[0].endSlur)
                                el.gracenotes[0].endSlur.push(el.pitches[0].startSlur[0].label);
                            else
                                el.gracenotes[0].endSlur = [el.pitches[0].startSlur[0].label];
                            if (el.pitches[0].endSlur.length === 1)
                                delete el.pitches[0].endSlur;
                            else if (el.pitches[0].endSlur[0] === 100)
                                el.pitches[0].endSlur.shift();
                            else if (el.pitches[0].endSlur[el.pitches[0].endSlur.length - 1] === 100)
                                el.pitches[0].endSlur.pop();
                            if (currSlur[1].length === 1)
                                delete currSlur[1];
                            else
                                currSlur[1].pop();
                        }
                    }
                }
            }
        }

        // TODO-PER: This could be done faster as we go instead of as the last step.
        function fixClefPlacement(el) {
            window.ABCXJS.parse.parseKeyVoice.fixClef(el);
        }
        
        this.closeLine();	// Close the last line.

        // Remove any blank lines
        var anyDeleted = false;
        var i, s, v;
        for (i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                var hasAny = false;
                for (s = 0; s < this.lines[i].staffs.length; s++) {
                    if (this.lines[i].staffs[s] === undefined) {
                        anyDeleted = true;
                        this.lines[i].staffs[s] = null;
                    } else {
                        delete this.lines[i].staffs[s].workingClef; // not necessary anymore
                        for (v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                            if (this.lines[i].staffs[s].voices[v] === undefined)
                                this.lines[i].staffs[s].voices[v] = [];	// TODO-PER: There was a part missing in the abc music. How should we recover?
                            else
                            if (this.containsNotes(this.lines[i].staffs[s].voices[v]))
                                hasAny = true;
                        }
                    }
                }
                if (!hasAny) {
                    this.lines[i] = null;
                    anyDeleted = true;
                }
            }
        }
        
        if (anyDeleted) {
            this.lines = window.ABCXJS.parse.compact(this.lines);
            window.ABCXJS.parse.each(this.lines, function(line) {
                if (line.staffs)
                    line.staffs = window.ABCXJS.parse.compact(line.staffs);
            });
        }
        
        for (this.lineNum = 0; this.lineNum < this.lines.length; this.lineNum++) {
            if (this.lines[this.lineNum].staffs)
                for (this.staffNum = 0; this.staffNum < this.lines[this.lineNum].staffs.length; this.staffNum++) {
                    if (this.lines[this.lineNum].staffs[this.staffNum].clef)
                        fixClefPlacement(this.lines[this.lineNum].staffs[this.staffNum].clef);
                    for (this.voiceNum = 0; this.voiceNum < this.lines[this.lineNum].staffs[this.staffNum].voices.length; this.voiceNum++) {
                        cleanUpSlursInLine(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]);
                        for (var j = 0; j < this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum].length; j++)
                            if (this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][j].el_type === 'clef')
                                fixClefPlacement(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][j]);
                    }
                }
        }

        // Remove temporary variables that the outside doesn't need to know about
        delete this.staffNum;
        delete this.voiceNum;
        delete this.lineNum;
        delete this.vskipPending;
        
    };

    this.getLastNote = function() {
        if (this.lines[this.lineNum] && this.lines[this.lineNum].staffs && this.lines[this.lineNum].staffs[this.staffNum] &&
                this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]) {
            for (var i = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum].length - 1; i >= 0; i--) {
                var el = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][i];
                if (el.el_type === 'note') {
                    return el;
                }
            }
        }
        return null;
    };

    this.addTieToLastNote = function() {
        // TODO-PER: if this is a chord, which note?
        var el = this.getLastNote();
        if (el && el.pitches && el.pitches.length > 0) {
            el.pitches[0].startTie = {};
            return true;
        }
        return false;
    };

    this.getDuration = function(el) {
         return el.duration?el.duration:0;
    };

    this.closeLine = function() {
        if (this.potentialStartBeam && this.potentialEndBeam) {
            this.potentialStartBeam.startBeam = true;
            this.potentialEndBeam.endBeam = true;
        }
        delete this.potentialStartBeam;
        delete this.potentialEndBeam;
    };

    this.addPosition = function(line, startChar, endChar, hashParams, currentVoice) {
        if( ABCXJS.math.isNumber(line) &&
            ABCXJS.math.isNumber(startChar) &&
            ABCXJS.math.isNumber(endChar) ) {
            hashParams.position = { anchor: {line: line, ch: startChar}, head: {line: line,ch: endChar} };     
        }
        if( currentVoice && currentVoice.staffNum === 0 && currentVoice.index === 0 ) {
            hashParams.position.selectable=true;
        }
    };
    
    this.appendElement = function(type, line, startChar, endChar, hashParams, currentVoice)
    {
        var This = this;
        var pushNote = function(hp) {
            if (hp.pitches !== undefined) {
                var mid = This.lines[This.lineNum].staffs[This.staffNum].workingClef.verticalPos;
                window.ABCXJS.parse.each(hp.pitches, function(p) {
                    p.verticalPos = p.pitch - mid;
                });
            }
            if (hp.gracenotes !== undefined) {
                var mid2 = This.lines[This.lineNum].staffs[This.staffNum].workingClef.verticalPos;
                window.ABCXJS.parse.each(hp.gracenotes, function(p) {
                    p.verticalPos = p.pitch - mid2;
                });
            }
            This.lines[This.lineNum].staffs[This.staffNum].voices[This.voiceNum].push(hp);
        };
        
        hashParams.el_type = type;
        
        this.addPosition(line, startChar, endChar, hashParams, currentVoice);
        
        var endBeamHere = function() {
            This.potentialStartBeam.startBeam = true;
            hashParams.endBeam = true;
            delete This.potentialStartBeam;
            delete This.potentialEndBeam;
        };
        var endBeamLast = function() {
            if (This.potentialStartBeam !== undefined && This.potentialEndBeam !== undefined) {	// Do we have a set of notes to beam?
                This.potentialStartBeam.startBeam = true;
                This.potentialEndBeam.endBeam = true;
            }
            delete This.potentialStartBeam;
            delete This.potentialEndBeam;
        };
        if (type === 'note') { // && (hashParams.rest !== undefined || hashParams.end_beam === undefined)) {
            // Now, add the startBeam and endBeam where it is needed.
            // end_beam is already set on the places where there is a forced end_beam. We'll remove that here after using that info.
            // this.potentialStartBeam either points to null or the start beam.
            // this.potentialEndBeam either points to null or the start beam.
            // If we have a beam break (note is longer than a quarter, or an end_beam is on this element), then set the beam if we have one.
            // reset the variables for the next notes.
            var dur = This.getDuration(hashParams);
            if (dur >= 0.25) {	// The beam ends on the note before this.
                endBeamLast();
            } else if (hashParams.force_end_beam_last && This.potentialStartBeam !== undefined) {
                endBeamLast();
            } else if (hashParams.end_beam && This.potentialStartBeam !== undefined) {	// the beam is forced to end on this note, probably because of a space in the ABC
                if (hashParams.rest === undefined)
                    endBeamHere();
                else
                    endBeamLast();
            } else if (hashParams.rest === undefined) {	// this a short note and we aren't about to end the beam
                if (This.potentialStartBeam === undefined) {	// We aren't collecting notes for a beam, so start here.
                    if (!hashParams.end_beam) {
                        This.potentialStartBeam = hashParams;
                        delete This.potentialEndBeam;
                    }
                } else {
                    This.potentialEndBeam = hashParams;	// Continue the beaming, look for the end next note.
                }
            }
        } else {	// It's not a note, so there definitely isn't beaming after it.
            endBeamLast();
        }
        delete hashParams.end_beam;	// We don't want this temporary variable hanging around.
        delete hashParams.force_end_beam_last;	// We don't want this temporary variable hanging around.
        pushNote(hashParams);
    };

    this.appendStartingElement = function(type, line, startChar, endChar, hashParams2)
    {
        // If we're in the middle of beaming, then end the beam.
        this.closeLine();

        // We only ever want implied naturals the first time.
        var impliedNaturals;
        if (type === 'key') {
            impliedNaturals = hashParams2.impliedNaturals;
            delete hashParams2.impliedNaturals;
        }

        // Clone the object because it will be sticking around for the next line and we don't want the extra fields in it.
        var hashParams = window.ABCXJS.parse.clone(hashParams2);

        // If this is a clef type, then we replace the working clef on the line. This is kept separate from
        // the clef in case there is an inline clef field. We need to know what the current position for
        // the note is.
        if (type === 'clef') {
            this.lines[this.lineNum].staffs[this.staffNum].workingClef = hashParams;
            if(hashParams.type === 'accordionTab') {
                this.hasTablature = true;
                this.tabStaffPos = this.staffNum;
            }
        }    

        // If this is the first item in this staff, then we might have to initialize the staff, first.
        if (this.lines[this.lineNum].staffs.length <= this.staffNum) {
            waterbug.log( 'o que é isso?');
            waterbug.show();
            this.lines[this.lineNum].staffs[this.staffNum] = {};
            this.lines[this.lineNum].staffs[this.staffNum].clef = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].clef);
            this.lines[this.lineNum].staffs[this.staffNum].key = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].key);
            this.lines[this.lineNum].staffs[this.staffNum].meter = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].meter);
            this.lines[this.lineNum].staffs[this.staffNum].workingClef = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].workingClef);
            this.lines[this.lineNum].staffs[this.staffNum].voices = [];
            this.lines[this.lineNum].staffs[this.staffNum].stem = [];
        }

        // These elements should not be added twice, so if the element exists on this line without a note or bar before it, just replace the staff version.
        var voice = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum];
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' || voice[i].el_type === 'bar') {
                hashParams.el_type = type;
                this.addPosition(line, startChar, endChar, hashParams);
                if (impliedNaturals)
                    hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
                voice.push(hashParams);
                return;
            }
            if (voice[i].el_type === type) {
                hashParams.el_type = type;
                this.addPosition(line, startChar, endChar, hashParams);
                if (impliedNaturals)
                    hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
                voice[i] = hashParams;
                return;
            }
        }
        // We didn't see either that type or a note, so replace the element to the staff.
        this.lines[this.lineNum].staffs[this.staffNum][type] = hashParams2;
    };

    this.getNumLines = function() {
        return this.lines.length;
    };

    this.pushLine = function(hash) {
        if (this.vskipPending) {
            hash.vskip = this.vskipPending;
            delete this.vskipPending;
        }
        this.lines.push(hash);
    };

    this.addSubtitle = function(str) {
        this.subtitle = str;
    };

    this.addSpacing = function(num) {
        this.vskipPending = num;
    };

    this.addNewPage = function(num) {
        this.pushLine({newpage: num});
    };

    this.addSeparator = function(spaceAbove, spaceBelow, lineLength) {
        this.pushLine({separator: {spaceAbove: spaceAbove, spaceBelow: spaceBelow, lineLength: lineLength}});
    };

    this.addText = function(str) {
        this.pushLine({text: str});
    };

    this.addCentered = function(str) {
        this.pushLine({text: [{text: str, center: true}]});
    };

    this.containsNotes = function(voice) {
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' || voice[i].el_type === 'bar')
                return true;
        }
        return false;
    };

    this.containsNotesStrict = function(voice) {
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' && voice[i].rest === undefined)
                return true;
        }
        return false;
    };

    this.startNewLine = function(params) {
        // If the pointed to line doesn't exist, just create that. 
        // If the line does exist, but doesn't have any music on it, just use it.
        // If it does exist and has music, then increment the line number. 
        // If the new element doesn't exist, create it.
        var This = this;
        this.closeLine();	// Close the previous line.
        var createVoice = function(params) {
            This.lines[This.lineNum].staffs[This.staffNum].voices[This.voiceNum] = [];
            if (This.isFirstLine(This.lineNum)) {
                
                if (params.stem) 
                    This.lines[This.lineNum].staffs[This.staffNum].stem[This.voiceNum] = params.stem;
                
                if (params.name) {
                    if (!This.lines[This.lineNum].staffs[This.staffNum].title)
                        This.lines[This.lineNum].staffs[This.staffNum].title = [];
                    This.lines[This.lineNum].staffs[This.staffNum].title[This.voiceNum] = params.name;
                }
            } else {
                
                This.lines[This.lineNum].staffs[This.staffNum].stem[This.voiceNum] = This.lines[0].staffs[This.staffNum].stem[This.voiceNum];
                
                if (params.subname) {
                    if (!This.lines[This.lineNum].staffs[This.staffNum].title)
                        This.lines[This.lineNum].staffs[This.staffNum].title = [];
                    This.lines[This.lineNum].staffs[This.staffNum].title[This.voiceNum] = params.subname;
                }
            }
            
            if (params.style)
                This.appendElement('style', null, null, null, {head: params.style});
            
            if (params.scale)
                This.appendElement('scale', null, null, null, {size: params.scale});
        };
        var createStaff = function(params) {
            if (params.transpose)
                params.clef.transpose = params.transpose;
            This.lines[This.lineNum].staffs[This.staffNum] =
                    {voices: [], stem: [], clef: params.clef, key: params.key, workingClef: params.clef, subtitle: params.subtitle, lyricsRows: 0};
            if (params.vocalfont)
                This.lines[This.lineNum].staffs[This.staffNum].vocalfont = params.vocalfont;
            if (params.bracket)
                This.lines[This.lineNum].staffs[This.staffNum].bracket = params.bracket;
            if (params.brace)
                This.lines[This.lineNum].staffs[This.staffNum].brace = params.brace;
            if (params.connectBarLines)
                This.lines[This.lineNum].staffs[This.staffNum].connectBarLines = params.connectBarLines;
            if(params.clef.type === 'accordionTab') {
                This.hasTablature = true;
                This.tabStaffPos = This.staffNum;
            }
            // Some stuff just happens for the first voice
            createVoice(params);
            if (params.part)
                This.appendElement('part', null, null, null, {title: params.part}); // flavio anulou
            if (params.meter !== undefined)
                This.lines[This.lineNum].staffs[This.staffNum].meter = params.meter;
        };
        var createLine = function(params) {
            This.lines[This.lineNum] = {staffs: []};
            createStaff(params);
        };
        if (this.lines[this.lineNum] === undefined)
            createLine(params);
        else if (this.lines[this.lineNum].staffs === undefined) {
            this.lineNum++;
            this.startNewLine(params);
        } else if (this.lines[this.lineNum].staffs[this.staffNum] === undefined)
            createStaff(params);
        else if (this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum] === undefined)
            createVoice(params);
        else if (!this.containsNotes(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]))
            return;
        else {
            this.lineNum++;
            this.startNewLine(params);
        }
    };

    this.hasBeginMusic = function() {
        return this.lines.length > 0;
    };

    this.isFirstLine = function(index) {
        for (var i = index - 1; i >= 0; i--) {
            if (this.lines[i].staffs !== undefined)
                return false;
        }
        return true;
    };

    this.getCurrentStaff = function() {
        if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum] !== undefined)
            return this.lines[this.lineNum].staffs[this.staffNum];
        else
            return null;
    };

    this.getCurrentVoice = function() {
        if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum] !== undefined)
            return this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum];
        else
            return null;
    };

    this.setCurrentVoice = function(staffNum, voiceNum) {
        this.staffNum = staffNum || 0;
        this.voiceNum = voiceNum || 0;
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs) {
                if (this.lines[i].staffs[staffNum] === undefined || this.lines[i].staffs[staffNum].voices[voiceNum] === undefined ||
                        !this.containsNotes(this.lines[i].staffs[staffNum].voices[voiceNum])) {
                    this.lineNum = i;
                    return;
                }
            }
        }
        this.lineNum = i;
    };

    this.addMetaText = function(key, value) {
        if (this.metaText[key] === undefined)
            this.metaText[key] = value;
        else
            this.metaText[key] += "\n" + value;
    };

    this.addMetaTextArray = function(key, value) {
        if (this.metaText[key] === undefined)
            this.metaText[key] = [value];
        else
            this.metaText[key].push(value);
    };
    this.addMetaTextObj = function(key, value) {
        this.metaText[key] = value;
    };
    
    this.reset();

};
//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.math = {};
    
window.ABCXJS.math.isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};    

if (!window.ABCXJS.parse)
	window.ABCXJS.misc = {};
    
window.ABCXJS.misc.isOpera = function() { // Opera 8.0+
    return ( (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 );
};

window.ABCXJS.misc.isChrome= function() {
    return (!!window.chrome && !!window.chrome.webstore);
};

window.ABCXJS.misc.isChromium= function() { // Chrome 1+
    var test1 =  (( !!window.chrome && !ABCXJS.misc.isOpera() ) > 0 ); 
   
    if(!test1) return false;
    
    for (var i=0; i<navigator.plugins.length; i++)
        if (navigator.plugins[i].name === 'Chrome PDF Viewer') return false;
    
    return true;
};

window.ABCXJS.misc.isFirefox = function() { // Firefox 1+ 
    return ( typeof InstallTrigger !== 'undefined' );  
};

window.ABCXJS.misc.isSafari = function() { // Safari 3.0+
    return ( /constructor/i.test(window.HTMLElement) || (function (p) { 
        return p.toString() === "[object SafariRemoteNotification]"; } )
            (!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)) 
    ); 
};

window.ABCXJS.misc.isIE = function() {
    
    if( /* @ cc_on ! @ */ false || !! document.documentMode ) { // Internet Explorer 6-11
      return true; 
    }

    if( navigator.appName.indexOf("Internet Explorer")!==-1 ){ // Yeah, he's using IE
       return true;
    }
    return false;
};    

window.ABCXJS.misc.isEdge = function() {
    return (!ABCXJS.misc.isIE() && !!window.StyleMedia); // Edge 20+
};


if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

// implemented below a more secure form o copy
window.ABCXJS.parse.clone = function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = window.ABCXJS.parse.clone(obj[i]);
        }
        return copy;
    }
    
    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = window.ABCXJS.parse.clone(obj[attr]);
        }
        return copy;
    }
    
    throw new Error("Unable to copy obj! Its type isn't supported.");
};


window.ABCXJS.parse.getBarLine = function(line, i) {
    var ii = i;
    var dd = 2; // conta repeticoes ao acrescentar múltiplos ":" à esquerda da barra
    switch (line.charAt(i)) {
        case ']':
            ++i;
            switch (line.charAt(i)) {
                case '|': return {len: 2, token: "bar_thick_thin"};
                case '[':
                    ++i;
                    if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
                        return {len: 2, token: "bar_invisible"};
                    return {len: 1, warn: "Unknown bar symbol"};
                default:
                    return {len: 1, token: "bar_invisible"};
            }
            break;
        case ':':
            ++i;
            while(line.charAt(i)===':') {++i; dd++;}
            switch (line.charAt(i)) {
                case '|':	// :|
                    ++i;
                    switch (line.charAt(i)) {
                        case ']':	// :|]
                            ++i;
                            switch (line.charAt(i)) {
                                case '|':	// :|]|
                                    ++i;
                                    if (line.charAt(i) === ':') {
                                        while(line.charAt(i)===':') {++i;}
                                        return {len: i-ii, token: "bar_dbl_repeat", repeat: dd};
                                    }
                                    return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                                default:
                                    return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                            }
                            break;
                        case ':':	// :|:
                            while(line.charAt(i)===':') {++i;}
                            return {len: i-ii, token: "bar_dbl_repeat", repeat: dd };
                        case '|':	// :||
                            ++i;
                            if (line.charAt(i) === ':') { //:||:
                                while(line.charAt(i)===':') {++i;}
                                return {len: i-ii, token: "bar_dbl_repeat", repeat: dd};
                            }
                            return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                        default:
                            return {len: i-ii, token: "bar_right_repeat", repeat: dd };
                    }
                    break;
                default:
                    return {len: i-ii, token: "bar_dbl_repeat"};
            }
            break;
        case '[':	// [
            ++i;
            if (line.charAt(i) === '|') {	// [|
                ++i;
                switch (line.charAt(i)) {
                    case ':': // [|:
                       while(line.charAt(i)===':') {++i;}
                       return {len: i-ii, token: "bar_left_repeat"};
                    case ']': return {len: 3, token: "bar_invisible"};
                    default: return {len: 2, token: "bar_thick_thin"};
                }
            } else {
                if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
                    return {len: 1, token: "bar_invisible"};
                return {len: 0};
            }
            break;
        case '|':	// |
            ++i;
            switch (line.charAt(i)) {
                case ']': return {len: 2, token: "bar_thin_thick"};
                case '|': // ||
                    ++i;
                    if (line.charAt(i) === ':') { // ||:
                        while(line.charAt(i)===':') {++i;}
                        return {len: i-ii, token: "bar_left_repeat"};
                    }
                    return {len: 2, token: "bar_thin_thin"};
                case ':':	// |:
                    while(line.charAt(i)===':') {++i;}
                    return { len: i-ii, token: "bar_left_repeat"};
                default: return {len: 1, token: "bar_thin"};
            }
            break;
    }
    return {len: 0};
};


window.ABCXJS.parse.normalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])#/g,'$1♯').replace(/([ABCDEFG])b/g,'$1♭');
};

window.ABCXJS.parse.denormalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])♯/g,'$1#').replace(/([ABCDEFG])♭/g,'$1b');
};


window.ABCXJS.parse.gsub = function(source, pattern, replacement) {
	return source.split(pattern).join(replacement);
};

window.ABCXJS.parse.strip = function(str) {
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

window.ABCXJS.parse.startsWith = function(str, pattern) {
	return str.indexOf(pattern) === 0;
};

window.ABCXJS.parse.endsWith = function(str, pattern) {
	var d = str.length - pattern.length;
	return d >= 0 && str.lastIndexOf(pattern) === d;
};

window.ABCXJS.parse.each = function(arr, iterator, context) {
	for (var i = 0, length = arr.length; i < length; i++)
	  iterator.apply(context, [arr[i],i]);
};

window.ABCXJS.parse.last = function(arr) {
	if (arr.length === 0)
		return null;
	return arr[arr.length-1];
};

window.ABCXJS.parse.compact = function(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			output.push(arr[i]);
	}
	return output;
};

window.ABCXJS.parse.detect = function(arr, iterator) {
	for (var i = 0; i < arr.length; i++) {
		if (iterator(arr[i]))
			return true;
	}
	return false;
};

window.ABCXJS.parse.pitches = 
    { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6, 
        c: 7, d: 8, e: 9, f: 10, g: 11, a: 12, b: 13 };

window.ABCXJS.parse.key2br = 
    {"C":"Dó", "C♯":"Dó♯", "D♭":"Ré♭", "D":"Ré", "D♯":"Ré♯", "E♭":"Mi♭", "E":"Mi", 
     "F":"Fá" ,"F♯":"Fá♯" ,"G♭":"Sol♭", "G":"Sol", "G♯":"Sol♯" ,"A♭":"Lá♭", "A":"Lá", "A♯":"Lá♯", "B♭":"Si♭", "B":"Si" };

window.ABCXJS.parse.key2number = 
    {"C":0, "C♯":1, "D♭":1, "D":2, "D♯":3, "E♭":3, "E":4, 
     "F":5 ,"F♯":6 ,"G♭":6, "G":7, "G♯":8 ,"A♭":8, "A":9, "A♯":10, "B♭":10, "B":11 };

window.ABCXJS.parse.number2keyflat  = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
window.ABCXJS.parse.number2keysharp = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
window.ABCXJS.parse.number2key      = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];

/*
window.ABCXJS.parse.number2keyflat_br  = ["Dó", "Ré♭", "Ré", "Mi♭", "Mi", "Fá", "Sol♭", "Sol", "Lá♭",  "Lá", "Si♭", "Si"];
window.ABCXJS.parse.number2keysharp_br = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯",  "Sol", "Sol♯", "Lá", "Lá♯", "Si"];
window.ABCXJS.parse.number2key_br      = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯",  "Sol", "Sol♯", "Lá", "Si♭", "Si"];
*/

window.ABCXJS.parse.number2staff   = 
    [    
         {note:"C", acc:""}
        ,{note:"D", acc:"flat"} 
        ,{note:"D", acc:""}
        ,{note:"E", acc:"flat"} 
        ,{note:"E", acc:""} 
        ,{note:"F", acc:""}
        ,{note:"G", acc:"flat"} 
        ,{note:"G", acc:""} 
        ,{note:"A", acc:"flat"} 
        ,{note:"A", acc:""} 
        ,{note:"B", acc:"flat"} 
        ,{note:"B", acc:""}
    ];

window.ABCXJS.parse.number2staffSharp   = 
    [    
        {note:"C", acc:""}
       ,{note:"C", acc:"sharp"}
       ,{note:"D", acc:""} 
       ,{note:"D", acc:"sharp"}
       ,{note:"E", acc:""} 
       ,{note:"F", acc:""} 
       ,{note:"F", acc:"sharp"}
       ,{note:"G", acc:""} 
       ,{note:"G", acc:"sharp"} 
       ,{note:"A", acc:""} 
       ,{note:"A", acc:"sharp"} 
       ,{note:"B", acc:""} 
    ];

window.ABCXJS.parse.stringify = function(objeto) {

    var cache = [];
    var ret = JSON.stringify(objeto, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    return ret;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * TODO:
 * implementar macros como esta m: ~C1 = C,, [C,E,G,] [C,E,G,]
 * 
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.Parse = function(transposer_, accordion_) {

    this.tieCnt = 1;
    this.slurCnt = 1;
    
    var legalAccents = 
    [
        "trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent",
        "fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge",
        "open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase",
        "segno", "coda", "fine", "dacapo", "dasegno", "dacoda", "dcalfine", "dcalcoda", "dsalfine", "dsalcoda",
        "crescendo(", "crescendo)", "diminuendo(", "diminuendo)",
        "p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp", "fff", "ffff", "sfz", "repeatbar", "repeatbar2", "slide",
        "upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4",
        "turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato",
        "style=normal", "style=harmonic", "style=rhythm", "style=x"
    ];
    
    var accentPsuedonyms = [
        ["D.C.", "dacapo"], ["D.S.", "dasegno"],
        ["<", "accent"],[">", "accent"], ["tr", "trill"], 
        ["<(", "crescendo("], ["<)", "crescendo)"],
        [">(", "diminuendo("], [">)", "diminuendo)"], 
        ["plus", "+"], ["emphasis", "accent"]
    ];
    
//   segno    - barra anterior - em cima - ponto de retorno
//   coda     - barra anterior - em cima - ponto de retorno
//   
//   fine     - barra posterior - em cima - ponto de parada
//   dacoda   - barra posterior - em cima - salta ao coda (se existir e flag dacoda)
//   dasegno  - barra posterior - em cima - salta ao segno (se existir) - flag dasegno  
//   dacapo   - barra posterior - em cima - volta ao começo - flag dacapo
//   
//   dcalfine - barra anterior - em baixo - ao final do compasso volta ao começo - flag fine
//   dcalcoda - barra anterior - em baixo - ao final do compasso volta ao começo - flag dacoda
//   dsalfine - barra anterior - em baixo - ao final do compasso volta ao ponto de retorno (se existir) - flag fine
//   dsalcoda - barra anterior - em baixo - ao final do compasso volta ao ponto de retorno (se existir) - flag dacoda

    var jumpMarkers  = {
         segno:    {decorationNextBar:false, jumpNextBar: false, upper:true  } // desenhado na barra prévia,  efetivo na barra prévia
        ,coda:     {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,fine:     {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dacoda:   {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dacapo:   {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dasegno:  {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dcalfine: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dcalcoda: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dsalfine: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dsalcoda: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
    };
    

    if (transposer_)
        this.transposer = transposer_;
    
    if (accordion_)
        this.accordion = accordion_;

    var tune;
    var tokenizer;
    var header;
    var strTune = '';

    this.getTune = function() {
        return tune;
    };
    this.getStrTune = function() {
        return strTune;
    };

    var multilineVars = {
        reset: function() {
            for (var property in this) {
                if (this.hasOwnProperty(property) && typeof this[property] !== "function") {
                    delete this[property];
                }
            }
            this.iChar = 0;
            this.key = {accidentals: [], root: 'none', acc: '', mode: ''};
            this.meter = {type: 'specified', value: [{num: '4', den: '4'}]};	// if no meter is specified, there is an implied one.
            this.origMeter = {type: 'specified', value: [{num: '4', den: '4'}]};	// this is for new voices that are created after we set the meter.
            this.hasMainTitle = false;
            this.default_length = 0.125;
            this.clef = {type: 'treble', verticalPos: 0};
            this.subtitle = "";
            this.next_note_duration = 0;
            this.start_new_line = true;
            this.is_in_header = true;
            this.is_in_history = false;
            this.partForNextLine = "";
            this.havent_set_length = true;
            this.voices = {};
            this.staves = [];
            this.macros = {};
            //this.currBarNumber = 1;
            //this.currTabBarNumber = 1;
            this.inTextBlock = false;
            this.inPsBlock = false;
            this.ignoredDecorations = [];
            this.textBlock = "";
            this.score_is_present = false;	// Can't have original V: lines when there is the score directive
            this.currentVoice = undefined ; // { index:0, staffNum:0, currBarNumber: 1}; 

        }
    };

    this.getMultilineVars = function() {
        return multilineVars;
    };

    var addWarning = function(str) {
        if (!multilineVars.warnings)
            multilineVars.warnings = [];
        multilineVars.warnings.push(str);
    };

    var encode = function(str) {
        var ret = window.ABCXJS.parse.gsub(str, '\x12', ' ');
        ret = window.ABCXJS.parse.gsub(ret, '&', '&amp;');
        ret = window.ABCXJS.parse.gsub(ret, '<', '&lt;');
        return window.ABCXJS.parse.gsub(ret, '>', '&gt;');
    };

    var warn = function(str, line, col_num) {
        var bad_char = line.charAt(col_num);
        if (bad_char === ' ')
            bad_char = "SPACE";
        var clean_line = encode(line.substring(0, col_num)) +
                '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
                encode(line.substring(col_num + 1));
        addWarning("Music Line:" + tune.getNumLines() + ":" + (col_num + 1) + ': ' + str + ":  " + clean_line);
    };
    
    this.getWarnings = function() {
        return multilineVars.warnings;
    };
    
    this.addTuneElement = function(type, startOfLine, xi, xf, elem, line) {
        switch(type) {
            case 'bar':
                multilineVars.measureNotEmpty = false;
                
                if(multilineVars.addJumpPointNextBar) {
                    elem.jumpPoint = ABCXJS.parse.clone( multilineVars.addJumpPointNextBar );
                    delete multilineVars.addJumpPointNextBar;
                }
                if(multilineVars.addJumpInfoNextBar) {
                    elem.jumpInfo = ABCXJS.parse.clone( multilineVars.addJumpInfoNextBar );
                    delete multilineVars.addJumpInfoNextBar;
                }
                if(multilineVars.addJumpDecorationNextBar) {
                    elem.jumpDecoration = ABCXJS.parse.clone( multilineVars.addJumpDecorationNextBar );
                    delete multilineVars.addJumpDecorationNextBar;
                }
                
                //restart bar accidentals
                multilineVars.barAccidentals = [];  
                
                //records the last bar elem
                multilineVars.lastBarElem = elem;
                break;
            case 'note':
                multilineVars.measureNotEmpty = true;
                
                // coloca informação de numeracao na previa barra de compasso, já que o compasso não está vazio 
                if (multilineVars.barNumOnNextNote ) {
                    var mc = multilineVars.currentVoice; 
                    if(multilineVars.lastBarElem) {
                        multilineVars.lastBarElem.barNumber = multilineVars.barNumOnNextNote;
                        multilineVars.lastBarElem.barNumberVisible = ( multilineVars.barNumOnNextNoteVisible && ( mc === undefined || (mc.staffNum === 0 && mc.index === 0 )));
                    }
                    
                    multilineVars.barNumOnNextNote = null;
                    multilineVars.barNumOnNextNoteVisible = null;
                }
               
                if( elem.pitches )  {
                    elem.pitches.forEach( function( p ) { 
                        if(p.accidental === undefined && multilineVars.barAccidentals[p.pitch]!==undefined ) {
                            p.barAccidental = multilineVars.barAccidentals[p.pitch]; // apenas um marcador para instruir o tratamento de slur e tie abaixo
                        }
                    });
                }
                break;
        }
        try {
            this.handleTie( elem );
            this.handleSlur( elem, line, xi );
            tune.appendElement(type, multilineVars.currTexLineNum, xi, xf, elem, multilineVars.currentVoice); // flavio -startOfLine
        } catch(e) {
             warn("Unknown character ignored", line, xi);
        }
    };
    

    this.handleTie = function(elem) {
        var self = this;
        if( ! elem.pitches ) return;
        if( this.anyTieEnd(elem) )  {
            var tieCnt = this.tieCnt;
            var startEl = this.aTies.pop();
            if( startEl && startEl.pitches ) {
                startEl.pitches.forEach( function( startPitch ) {
                    if(elem.pitches) { 
                        elem.pitches.forEach( function( pitch ) { 
                            if(self.equalsPitch( pitch, startPitch )  ) {
                                
                                if(! startPitch.tie) {
                                    startPitch.tie = {};
                                }
                                // para ligaduras encadeadas ja existira obj tie
                                startPitch.tie.id_start = tieCnt;
                                
                                pitch.tie =  { id_end: tieCnt };
                                tieCnt ++;
                            }
                        });
                    }
                });
            }
            this.tieCnt = tieCnt;
        }
        if( this.anyTieStart(elem) )  {
            if( !this.aTies ) this.aTies = [];
            this.aTies.push(elem);
        }
    };
    
    this.handleSlur = function(elem, line, i) {
        var self = this;
        if( !elem.pitches ) return;
        var ss = this.anySlurEnd(elem);
        while( ss )  {
            var tieCnt = this.tieCnt;
            var el = this.aSlurs.pop();
            if( el === undefined ) {
                //throw "Slur not open";
                warn("Slur not open", line, i);
                return;
            }
            if(el.qtd > 1 ) {
                el.qtd--;
                this.aSlurs.push(el);
            }
            var startEl = el.el;
            if( startEl && startEl.pitches ) {
                startEl.pitches.forEach( function( startPitch ) {
                    if(elem.pitches) { 
                        elem.pitches.forEach( function( pitch ) { 
                            if( self.equalsPitch( pitch, startPitch )  ) {
                                
                                if(startPitch.tie) {
                                    startPitch.tie.id_start = tieCnt;
                                } else 
                                    startPitch.tie = { id_start: tieCnt, slur:true };
                                if(pitch.tie) {
                                    startPitch.tie.id_end = tieCnt;
                                } else
                                    pitch.tie =  { id_end: tieCnt, slur:true };
                                    
                                tieCnt ++;
                            }
                        });
                    }
                });
            }
            this.tieCnt = tieCnt;
            ss--;
        }
        ss = this.anySlurStart(elem);
        if( ss )  {
            if( !this.aSlurs ) this.aSlurs = [];
            this.aSlurs.push( { el: elem, qtd:ss, cnt: ++this.slurCnt });
        }
    };
    
    this.anySlurEnd = function(elem) {
        var found = 0;
        if( elem.endSlur ) return elem.endSlur;
        if( elem.pitches ) {
            elem.pitches.forEach( function( pitch ) {
                if( pitch.endSlur ) found = pitch.endSlur;
            });
        }
        return found;
    };
    
    this.equalsPitch = function(p1, p2) {
        var p1acc='natural', p2acc = 'natural';
        if( p1.accidental !== undefined ) {
            p1acc= p1.accidental;
        } else if ( p1.barAccidental !== undefined ) {
            p1acc= p1.barAccidental;
        } 
        if( p2.accidental !== undefined ) {
            p2acc= p2.accidental;
        } else if ( p2.barAccidental !== undefined ) {
            p2acc= p2.barAccidental;
        } 
        
        return ( p1.pitch === p2.pitch && p1acc === p2acc );
        
    };
    
    this.anySlurStart = function(elem) {
        var found = 0;
        if( elem.startSlur ) return elem.startSlur;
        if( elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if(pitch.startSlur ) found = pitch.startSlur;
            });
        }
        return found;
    };
    
    this.anyTieEnd = function(elem) {
        var found = false;
        if( elem.endTie ) return true;
        if(elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if( pitch.endTie ) found = true;;
            });
        }
        return found;
    };
    
    this.anyTieStart = function(elem) {
        var found = false;
        if( elem.startTie ) return true;
        if(elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if(pitch.startTie ) found = true;
            });
        }
        return found;
    };
    
    var letter_to_chord = function(line, i)
    {
        if (line.charAt(i) === '"')
        {
            var chord = tokenizer.getBrackettedSubstring(line, i, 5);
            if (!chord[2])
                warn("Missing the closing quote while parsing the chord symbol", line, i);
            // If it starts with ^, then the chord appears above.
            // If it starts with _ then the chord appears below.
            // (note that the 2.0 draft standard defines them as not chords, but annotations and also defines @.)
            if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '^') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'above';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '_') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'below';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '<') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'left';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '>') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'right';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '@') {
                // @-15,5.7
                chord[1] = chord[1].substring(1);
                var x = tokenizer.getFloat(chord[1]);
                if (x.digits === 0)
                    warn("Missing first position in absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(x.digits);
                if (chord[1][0] !== ',')
                    warn("Missing comma absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(1);
                var y = tokenizer.getFloat(chord[1]);
                if (y.digits === 0)
                    warn("Missing second position in absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(y.digits);
                var ws = tokenizer.skipWhiteSpace(chord[1]);
                chord[1] = chord[1].substring(ws);
                chord[2] = null;
                chord[3] = {x: x.value, y: y.value};
            } else {
                //chord[1] = chord[1].replace(/([ABCDEFG])b/g, "$1?");
                //chord[1] = chord[1].replace(/([ABCDEFG])#/g, "$1?");
                chord[1] = ABCXJS.parse.normalizeAcc(chord[1]);
                chord[2] = 'default';
            }
            return chord;
        }
        return [0, ""];
    };

    var letter_to_accent = function(line, i)
    {
        var macro = multilineVars.macros[line.charAt(i)];

        if (macro !== undefined) {
            if (macro.charAt(0) === '!' || macro.charAt(0) === '+')
                macro = macro.substring(1);
            if (macro.charAt(macro.length - 1) === '!' || macro.charAt(macro.length - 1) === '+')
                macro = macro.substring(0, macro.length - 1);
            if (window.ABCXJS.parse.detect(legalAccents, function(acc) {
                return (macro === acc);
            }))
                return [1, macro];
            else {
                if (!window.ABCXJS.parse.detect(multilineVars.ignoredDecorations, function(dec) {
                    return (macro === dec);
                }))
                    warn("Unknown macro: " + macro, line, i);
                return [1, ''];
            }
        }
        switch (line.charAt(i))
        {
            case '.':
                return [1, 'staccato'];
            case 'u':
                return [1, 'upbow'];
            case 'v':
                return [1, 'downbow'];
            case '~':
                return [1, 'irishroll'];
            case 'H':
                return [1, 'fermata'];
            case 'J':
                return [1, 'slide'];
            case 'L':
                return [1, 'accent'];
            case 'M':
                return [1, 'mordent'];
            case 'O':
                return[1, 'coda'];
            case 'P':
                return[1, 'pralltriller'];
            case 'R':
                return [1, 'roll'];
            case 'S':
                return [1, 'segno'];
            case 'T':
                return [1, 'trill'];
            case '!':
            case '+':
               var ret = tokenizer.getBrackettedSubstring(line, i, 5);
                // Be sure that the accent is recognizable.
                if (ret[1].length > 0 && (ret[1].charAt(0) === '^' || ret[1].charAt(0) === '_'))
                    ret[1] = ret[1].substring(1);	// TODO-PER: The test files have indicators forcing the ornament to the top or bottom, but that isn't in the standard. We'll just ignore them.
                
                if (window.ABCXJS.parse.detect(legalAccents, function(acc) {
                    return (ret[1] === acc);
                }))
                    return ret;

                if (window.ABCXJS.parse.detect(accentPsuedonyms, function(acc) {
                    if (ret[1] === acc[0]) {
                        ret[1] = acc[1];
                        return true;
                    } else
                        return false;
                }))
                    return ret;

                // We didn't find the accent in the list, so consume the space, but don't return an accent.
                // Although it is possible that ! was used as a line break, so accept that.
                if (line.charAt(i) === '!' && (ret[0] === 1 /* flavio || line.charAt(i + ret[0] - 1) !== '!') */ ) )
                    return [1, null];
                
                warn("Unknown decoration: " + ret[1], line, i);
                ret[1] = "";
                return ret;
        }
        return [0, 0];
    };

    var letter_to_spacer = function(line, i)
    {
        var start = i;
        while (tokenizer.isWhiteSpace(line.charAt(i)))
            i++;
        return [i - start];
    };

    // returns the class of the bar line
    // the number of the repeat
    // and the number of characters used up
    // if 0 is returned, then the next element was not a bar line
    var letter_to_bar = function(line, curr_pos)
    {
        var ret = tokenizer.getBarLine(line, curr_pos);
        if (ret.len === 0)
            return [0, ""];
        if (ret.warn) {
            warn(ret.warn, line, curr_pos);
            return [ret.len, ""];
        }

        // Now see if this is a repeated ending
        // A repeated ending is all of the characters 1,2,3,4,5,6,7,8,9,0,-, and comma
        // It can also optionally start with '[', which is ignored.
        // Also, it can have white space before the '['.
        for (var ws = 0; ws < line.length; ws++)
            if (line.charAt(curr_pos + ret.len + ws) !== ' ')
                break;
        var orig_bar_len = ret.len;
        if (line.charAt(curr_pos + ret.len + ws) === '[') {
            ret.len += ws + 1;
        }

        // It can also be a quoted string. It is unclear whether that construct requires '[', but it seems like it would. otherwise it would be confused with a regular chord.
        if (line.charAt(curr_pos + ret.len) === '"' && line.charAt(curr_pos + ret.len - 1) === '[') {
            var ending = tokenizer.getBrackettedSubstring(line, curr_pos + ret.len, 5);
            return [ret.len + ending[0], ret.token, ret.repeat, ending[1]];
        }
        var retRep = tokenizer.getTokenOf(line.substring(curr_pos + ret.len), "1234567890-,");
        if (retRep.len === 0 || retRep.token[0] === '-')
            return [orig_bar_len, ret.token, ret.repeat];

        return [ret.len + retRep.len, ret.token, ret.repeat, retRep.token];
    };

    var letter_to_open_slurs_and_triplets = function(line, i) {
        // consume spaces, and look for all the open parens. If there is a number after the open paren,
        // that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
        var ret = {};
        var start = i;
        while (line.charAt(i) === '(' || tokenizer.isWhiteSpace(line.charAt(i))) {
            if (line.charAt(i) === '(') {
                if (i + 1 < line.length && (line.charAt(i + 1) >= '2' && line.charAt(i + 1) <= '9')) {
                    if (ret.triplet !== undefined)
                        warn("Can't nest triplets", line, i);
                    else {
                        ret.triplet = line.charAt(i + 1) - '0';
                        if (i + 2 < line.length && line.charAt(i + 2) === ':') {
                            // We are expecting "(p:q:r" or "(p:q" or "(p::r" we are only interested in the first number (p) and the number of notes (r)
                            // if r is missing, then it is equal to p.
                            if (i + 3 < line.length && line.charAt(i + 3) === ':') {
                                if (i + 4 < line.length && (line.charAt(i + 4) >= '1' && line.charAt(i + 4) <= '9')) {
                                    ret.num_notes = line.charAt(i + 4) - '0';
                                    i += 3;
                                } else
                                    warn("expected number after the two colons after the triplet to mark the duration", line, i);
                            } else if (i + 3 < line.length && (line.charAt(i + 3) >= '1' && line.charAt(i + 3) <= '9')) {
                                // ignore this middle number
                                if (i + 4 < line.length && line.charAt(i + 4) === ':') {
                                    if (i + 5 < line.length && (line.charAt(i + 5) >= '1' && line.charAt(i + 5) <= '9')) {
                                        ret.num_notes = line.charAt(i + 5) - '0';
                                        i += 4;
                                    }
                                } else {
                                    ret.num_notes = ret.triplet;
                                    i += 3;
                                }
                            } else
                                warn("expected number after the triplet to mark the duration", line, i);
                        }
                    }
                    i++;
                }
                else {
                    if (ret.startSlur === undefined)
                        ret.startSlur = 1;
                    else
                        ret.startSlur++;
                }
            }
            i++;
        }
        ret.consumed = i - start;
        return ret;
    };

    var addWords = function(staff, line, words, fingers) {
//        este bloco parece não fazer sentido        
//        if (!line) {
//            warn("Can't add words before the first line of music", words, 0);
//            return;
//        }
        words = window.ABCXJS.parse.strip(words);
        if (words.charAt(words.length - 1) !== '-')
            words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
        var word_list = [];
        staff.lyricsRows++;
        // first make a list of words from the string we are passed. A word is divided on either a space or dash.
        var last_divider = 0;
        var replace = false;
        var addWord = function(i) {
            var word = window.ABCXJS.parse.strip(words.substring(last_divider, i));
            
            if( fingers && word.trim() !== "" && ".1.2.3.4.5.23.24.25.34.35.45.234.345.2345.*.".indexOf("."+word.trim()+".") < 0 ) {
                warn( "Alien fingering detected", words, i-word.trim().length );
            }
            
            last_divider = i + 1;
            if (word.length > 0) {
                if (replace)
                    word = window.ABCXJS.parse.gsub(word, '~', ' ');
                var div = words.charAt(i);
                if (div !== '_' && div !== '-')
                    div = ' ';
                word_list.push({syllable: tokenizer.translateString(word), divider: div});
                replace = false;
                return true;
            }
            return false;
        };
        for (var i = 0; i < words.length; i++) {
            switch (words.charAt(i)) {
                case ' ':
                case '\x12':
                    addWord(i);
                    break;
                case '-':
                    if (!addWord(i) && word_list.length > 0) {
                        window.ABCXJS.parse.last(word_list).divider = '-';
                        word_list.push({skip: true, to: 'next'});
                    }
                    break;
                case '_':
                    addWord(i);
                    word_list.push({skip: true, to: 'slur'});
                    break;
                case '*':
                    addWord(i);
                    word_list.push({skip: true, to: 'next'});
                    break;
                case '|':
                    addWord(i);
                    word_list.push({skip: true, to: 'bar'});
                    break;
                case '~':
                    replace = true;
                    break;
            }
        }

        var inSlur = false;
        window.ABCXJS.parse.each(line, function(el) {
            if (word_list.length !== 0) {
                if (word_list[0].skip) {
                    switch (word_list[0].to) {
                        case 'next':
                            if (el.el_type === 'note' && el.pitches !== null && !inSlur)
                                word_list.shift();
                            break;
                        case 'slur':
                            if (el.el_type === 'note' && el.pitches !== null)
                                word_list.shift();
                            break;
                        case 'bar':
                            if (el.el_type === 'bar')
                                word_list.shift();
                            break;
                    }
                } else {
                    if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
                        var word = word_list.shift();
                        if( fingers ) {
                            if (el.fingering === undefined)
                                el.fingering = [word];
                            else
                                el.fingering.push(word);
                        } else {
                            if (el.lyric === undefined)
                                el.lyric = [word];
                            else
                                el.lyric.push(word);
                            
                        }
                    }
                }
            }
        });
    };

    var addSymbols = function(line, words) {
        // TODO-PER: Currently copied from w: line. This needs to be read as symbols instead.
        if (!line) {
            warn("Can't add symbols before the first line of mulsic", line, 0);
            return;
        }
        words = window.ABCXJS.parse.strip(words);
        if (words.charAt(words.length - 1) !== '-')
            words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
        var word_list = [];
        // first make a list of words from the string we are passed. A word is divided on either a space or dash.
        var last_divider = 0;
        var replace = false;
        var addWord = function(i) {
            var word = window.ABCXJS.parse.strip(words.substring(last_divider, i));
            last_divider = i + 1;
            if (word.length > 0) {
                if (replace)
                    word = window.ABCXJS.parse.gsub(word, '~', ' ');
                var div = words.charAt(i);
                if (div !== '_' && div !== '-')
                    div = ' ';
                word_list.push({syllable: tokenizer.translateString(word), divider: div});
                replace = false;
                return true;
            }
            return false;
        };
        for (var i = 0; i < words.length; i++) {
            switch (words.charAt(i)) {
                case ' ':
                case '\x12':
                    addWord(i);
                    break;
                case '-':
                    if (!addWord(i) && word_list.length > 0) {
                        window.ABCXJS.parse.last(word_list).divider = '-';
                        word_list.push({skip: true, to: 'next'});
                    }
                    break;
                case '_':
                    addWord(i);
                    word_list.push({skip: true, to: 'slur'});
                    break;
                case '*':
                    addWord(i);
                    word_list.push({skip: true, to: 'next'});
                    break;
                case '|':
                    addWord(i);
                    word_list.push({skip: true, to: 'bar'});
                    break;
                case '~':
                    replace = true;
                    break;
            }
        }

        var inSlur = false;
        window.ABCXJS.each(line, function(el) {
            if (word_list.length !== 0) {
                if (word_list[0].skip) {
                    switch (word_list[0].to) {
                        case 'next':
                            if (el.el_type === 'note' && el.pitches !== null && !inSlur)
                                word_list.shift();
                            break;
                        case 'slur':
                            if (el.el_type === 'note' && el.pitches !== null)
                                word_list.shift();
                            break;
                        case 'bar':
                            if (el.el_type === 'bar')
                                word_list.shift();
                            break;
                    }
                } else {
                    if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
                        var lyric = word_list.shift();
                        if (el.lyric === undefined)
                            el.lyric = [lyric];
                        else
                            el.lyric.push(lyric);
                    }
                }
            }
        });
    };

    var getBrokenRhythm = function(line, index) {
        switch (line.charAt(index)) {
            case '>':
                if (index < line.length - 1 && line.charAt(index + 1) === '>')	// double >>
                    return [2, 1.75, 0.25];
                else
                    return [1, 1.5, 0.5];
                break;
            case '<':
                if (index < line.length - 1 && line.charAt(index + 1) === '<')	// double <<
                    return [2, 0.25, 1.75];
                else
                    return [1, 0.5, 1.5];
                break;
        }
        return null;
    };

    // TODO-PER: make this a method in el.
    // Flavio - 0.25 inclusive.
    var addEndBeam = function(el) {
        if (el.duration !== undefined && el.duration <= 0.25)
            el.end_beam = true;
        return el;
    };

    var pitches = ABCXJS.parse.pitches;
    var rests = {x: 'invisible', y: 'spacer', z: 'rest', Z: 'multimeasure'};
    var getCoreNote = function(line, index, el, canHaveBrokenRhythm) {
        //var el = { startChar: index };
        var isComplete = function(state) {
            return (state === 'octave' || state === 'duration' || state === 'Zduration' || state === 'broken_rhythm' || state === 'end_slur');
        };
        var state = 'startSlur';
        var durationSetByPreviousNote = false;
        while (1) {
            switch (line.charAt(index)) {
                case '(':
                    if (state === 'startSlur') {
                        if (el.startSlur === undefined)
                            el.startSlur = 1;
                        else
                            el.startSlur++;
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ')':
                    if (isComplete(state)) {
                        if (el.endSlur === undefined)
                            el.endSlur = 1;
                        else
                            el.endSlur++;
                    } else
                        return null;
                    break;
                case '^':
                    if (state === 'startSlur') {
                        el.accidental = 'sharp';
                        state = 'sharp2';
                    }
                    else if (state === 'sharp2') {
                        el.accidental = 'dblsharp';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '_':
                    if (state === 'startSlur') {
                        el.accidental = 'flat';
                        state = 'flat2';
                    }
                    else if (state === 'flat2') {
                        el.accidental = 'dblflat';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '=':
                    if (state === 'startSlur') {
                        el.accidental = 'natural';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case 'A':
                case 'B':
                case 'C':
                case 'D':
                case 'E':
                case 'F':
                case 'G':
                case 'a':
                case 'b':
                case 'c':
                case 'd':
                case 'e':
                case 'f':
                case 'g':
                    if (state === 'startSlur' || state === 'sharp2' || state === 'flat2' || state === 'pitch') {
                        el.pitch = pitches[line.charAt(index)];
                        state = 'octave';
                        // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
                        if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
                            el.duration = multilineVars.next_note_duration;
                            multilineVars.next_note_duration = 0;
                            durationSetByPreviousNote = true;
                        } else
                            el.duration = multilineVars.default_length;
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ',':
                    if (state === 'octave') {
                        el.pitch -= 7;
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '\'':
                    if (state === 'octave') {
                        el.pitch += 7;
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case 'x':
                case 'y':
                case 'z':
                case 'Z':
                    if (state === 'startSlur') {
                        el.rest = {type: rests[line.charAt(index)]};
                        // There shouldn't be some of the properties that notes have. If some sneak in due to bad syntax in the abc file,
                        // just nix them here.
                        delete el.accidental;
                        delete el.startSlur;
                        delete el.startTie;
                        delete el.endSlur;
                        delete el.endTie;
                        delete el.end_beam;
                        delete el.grace_notes;
                        // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
                        if (el.rest.type === 'multimeasure') {
                            el.duration = 1;
                            state = 'Zduration';
                        } else {
                            if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
                                el.duration = multilineVars.next_note_duration;
                                multilineVars.next_note_duration = 0;
                                durationSetByPreviousNote = true;
                            } else
                                el.duration = multilineVars.default_length;
                            state = 'duration';
                        }
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                case '/':
                case '.':
                    if (state === 'octave' || state === 'duration') {
                        var fraction = tokenizer.getFraction(line, index);
                        if (!durationSetByPreviousNote)
                            el.duration = el.duration * fraction.value;
                        // TODO-PER: We can test the returned duration here and give a warning if it isn't the one expected.
                        el.endChar = fraction.index;
                        while (fraction.index < line.length && (tokenizer.isWhiteSpace(line.charAt(fraction.index)) || line.charAt(fraction.index) === '-')) {
                            if (line.charAt(fraction.index) === '-')
                                el.startTie = {};
                            else
                                el = addEndBeam(el);
                            fraction.index++;
                        }
                        index = fraction.index - 1;
                        state = 'broken_rhythm';
                    } else if (state === 'sharp2') {
                        el.accidental = 'quartersharp';
                        state = 'pitch';
                    } else if (state === 'flat2') {
                        el.accidental = 'quarterflat';
                        state = 'pitch';
                    } else if (state === 'Zduration') {
                        var num = tokenizer.getNumber(line, index);
                        el.duration = num.num;
                        el.endChar = num.index;
                        return el;
                    } else
                        return null;
                    break;
                case '-':
                    if (state === 'startSlur') {
                        // This is the first character, so it must have been meant for the previous note. Correct that here.
                        tune.addTieToLastNote();
                        el.endTie = true;
                    } else if (state === 'octave' || state === 'duration' || state === 'end_slur') {
                        el.startTie = {};
                        if (!durationSetByPreviousNote && canHaveBrokenRhythm)
                            state = 'broken_rhythm';
                        else {
                            // Peek ahead to the next character. If it is a space, then we have an end beam.
                            if (tokenizer.isWhiteSpace(line.charAt(index + 1)))
                                addEndBeam(el);
                            el.endChar = index + 1;
                            return el;
                        }
                    } else if (state === 'broken_rhythm') {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ' ':
                case '\t':
                    if (isComplete(state)) {
                        el.end_beam = true;
                        // look ahead to see if there is a tie
                        do {
                            if (line.charAt(index) === '-')
                                el.startTie = {};
                            index++;
                        } while (index < line.length && (tokenizer.isWhiteSpace(line.charAt(index)) || line.charAt(index) === '-'));
                        el.endChar = index;
                        if (!durationSetByPreviousNote && canHaveBrokenRhythm && (line.charAt(index) === '<' || line.charAt(index) === '>')) {	// TODO-PER: Don't need the test for < and >, but that makes the endChar work out for the regression test.
                            index--;
                            state = 'broken_rhythm';
                        } else
                            return el;
                    }
                    else
                        return null;
                    break;
                case '>':
                case '<':
                    if (isComplete(state)) {
                        if (canHaveBrokenRhythm) {
                            var br2 = getBrokenRhythm(line, index);
                            index += br2[0] - 1;	// index gets incremented below, so we'll let that happen
                            multilineVars.next_note_duration = br2[2] * el.duration;
                            el.duration = br2[1] * el.duration;
                            state = 'end_slur';
                        } else {
                            el.endChar = index;
                            return el;
                        }
                    } else
                        return null;
                    break;
                default:
                    if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    return null;
            }
            index++;
            if (index === line.length) {
                if (isComplete(state)) {
                    el.endChar = index;
                    return el;
                }
                else
                    return null;
            }
        }
        return null;
    };

    function startNewLine() {
        var params = {startChar: -1, endChar: -1};
        if (multilineVars.partForNextLine.length)
            params.part = multilineVars.partForNextLine;
        
        var mc = multilineVars.currentVoice;
        
        params.clef = window.ABCXJS.parse.clone( mc && mc.clef !== undefined ? mc.clef : multilineVars.clef);
        
        params.key = window.ABCXJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
        
        window.ABCXJS.parse.parseKeyVoice.addPosToKey(params.clef, params.key);
        if (multilineVars.meter !== null) {
            if (multilineVars.currentVoice) {
                window.ABCXJS.parse.each(multilineVars.staves, function(st) {
                    st.meter = multilineVars.meter;
                });
                params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
                multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
            } else
                params.meter = multilineVars.meter;
            multilineVars.meter = null;
        } else if (multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].meter) {
            // Make sure that each voice gets the meter marking.
            params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
            multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
        }
        if (multilineVars.currentVoice && multilineVars.currentVoice.name)
            params.name = multilineVars.currentVoice.name;
        if (multilineVars.vocalfont)
            params.vocalfont = multilineVars.vocalfont;
        if (multilineVars.style)
            params.style = multilineVars.style;
        if (multilineVars.currentVoice) {
            var staff = multilineVars.staves[multilineVars.currentVoice.staffNum];
            if (staff.brace)
                params.brace = staff.brace;
            if (staff.bracket)
                params.bracket = staff.bracket;
            if (staff.connectBarLines)
                params.connectBarLines = staff.connectBarLines;
            if (staff.name)
                params.name = staff.name[multilineVars.currentVoice.index];
            if (staff.subname)
                params.subname = staff.subname[multilineVars.currentVoice.index];
            if (multilineVars.subtitle) {
                params.subtitle = multilineVars.subtitle;
                multilineVars.subtitle = "";
            }
            if (multilineVars.currentVoice.stem)
                params.stem = multilineVars.currentVoice.stem;
            if (multilineVars.currentVoice.scale)
                params.scale = multilineVars.currentVoice.scale;
            if (multilineVars.currentVoice.style)
                params.style = multilineVars.currentVoice.style;
            if (multilineVars.currentVoice.transpose)
                params.transpose = multilineVars.currentVoice.transpose;
        }
        tune.startNewLine(params);

        multilineVars.partForNextLine = "";
        var mc = multilineVars.currentVoice;
        if( mc ) {
            if ( multilineVars.measureNotEmpty ) mc.currBarNumber++;
            multilineVars.barNumOnNextNote = mc.currBarNumber;
            
            if (multilineVars.barNumbers === 1 || ( multilineVars.barNumbers === 0 && multilineVars.barsperstaff === undefined && mc.currBarNumber > 1 ))
                multilineVars.barNumOnNextNoteVisible = true;
        }
    }
    
    var handleTriplet = function ( el, parsingTriplet ) {
        var m = 0;
        
        if( el.pitches ) {
            for(var ii=0; ii < el.pitches.length; ++ii ) m += el.pitches[ii].pitch;
            parsingTriplet.triplet.avgPitch += (m/el.pitches.length);
        } else {
            parsingTriplet.triplet.avgPitch += 6.0;
        }
        
        parsingTriplet.notesLeft--;
        
        if (parsingTriplet.notesLeft === 0) {
            el.endTriplet = true;
            parsingTriplet.triplet.avgPitch = (parsingTriplet.triplet.avgPitch/parsingTriplet.triplet.notes);
            parsingTriplet.triplet = false;
        }
    };
    

    var letter_to_grace = function(line, i) {
        // Grace notes are an array of: startslur, note, endslur, space; where note is accidental, pitch, duration
        if (line.charAt(i) === '{') {
            // fetch the gracenotes string and consume that into the array
            var gra = tokenizer.getBrackettedSubstring(line, i, 1, '}');
            if (!gra[2])
                warn("Missing the closing '}' while parsing grace note", line, i);
            // If there is a slur after the grace construction, then move it to the last note inside the grace construction
            if (line[i + gra[0]] === ')') {
                gra[0]++;
                gra[1] += ')';
            }

            var gracenotes = [];
            var ii = 0;
            var inTie = false;
            while (ii < gra[1].length) {
                var acciaccatura = false;
                if (gra[1].charAt(ii) === '/') {
                    acciaccatura = true;
                    ii++;
                }
                var note = getCoreNote(gra[1], ii, {}, false);
                if (note !== null) {
                    if (acciaccatura)
                        note.acciaccatura = true;
                    gracenotes.push(note);

                    if (inTie) {
                        note.endTie = true;
                        inTie = false;
                    }
                    if (note.startTie)
                        inTie = true;

                    ii = note.endChar;
                    delete note.endChar;
                }
                else {
                    // We shouldn't get anything but notes or a space here, so report an error
                    if (gra[1].charAt(ii) === ' ') {
                        if (gracenotes.length > 0)
                            gracenotes[gracenotes.length - 1].end_beam = true;
                    } else
                        warn("Unknown character '" + gra[1].charAt(ii) + "' while parsing grace note", line, i);
                    ii++;
                }
            }
            if (gracenotes.length)
                return [gra[0], gracenotes];
        }
        return [0];
    };
    
    //
    // Parse line of music
    //
    // This is a stream of <(bar-marking|header|note-group)...> in any order, with optional spaces between each element
    // core-note is <open-slur, accidental, pitch:required, octave, duration, close-slur&|tie> with no spaces within that
    // chord is <open-bracket:required, core-note:required... close-bracket:required duration> with no spaces within that
    // grace-notes is <open-brace:required, (open-slur|core-note:required|close-slur)..., close-brace:required> spaces are allowed
    // note-group is <grace-notes, chord symbols&|decorations..., grace-notes, slur&|triplet, chord|core-note, end-slur|tie> spaces are allowed between items
    // bar-marking is <ampersand> or <chord symbols&|decorations..., bar:required> spaces allowed
    // header is <open-bracket:required, K|M|L|V:required, colon:required, field:required, close-bracket:required> spaces can occur between the colon, in the field, and before the close bracket
    // header can also be the only thing on a line. This is true even if it is a continuation line. In this case the brackets are not required.
    // a space is a back-tick, a space, or a tab. If it is a back-tick, then there is no end-beam.

    // Line preprocessing: anything after a % is ignored (the double %% should have been taken care of before this)
    // Then, all leading and trailing spaces are ignored.
    // If there was a line continuation, the \n was replaced by a \r and the \ was replaced by a space. This allows the construct
    // of having a header mid-line conceptually, but actually be at the start of the line. This is equivolent to putting the header in [ ].

    // TODO-PER: How to handle ! for line break?
    // TODO-PER: dots before bar, dots before slur
    // TODO-PER: U: redefinable symbols.

    // Ambiguous symbols:
    // "[" can be the start of a chord, the start of a header element or part of a bar line.
    // --- if it is immediately followed by "|", it is a bar line
    // --- if it is immediately followed by K: L: M: V: it is a header (note: there are other headers mentioned in the standard, but I'm not sure how they would be used.)
    // --- otherwise it is the beginning of a chord
    // "(" can be the start of a slur or a triplet
    // --- if it is followed by a number from 2-9, then it is a triplet
    // --- otherwise it is a slur
    // "]"
    // --- if there is a chord open, then this is the close
    // --- if it is after a [|, then it is an invisible bar line
    // --- otherwise, it is par of a bar
    // "." can be a bar modifier or a slur modifier, or a decoration
    // --- if it comes immediately before a bar, it is a bar modifier
    // --- if it comes immediately before a slur, it is a slur modifier
    // --- otherwise it is a decoration for the next note.
    // number:
    // --- if it is after a bar, with no space, it is an ending marker
    // --- if it is after a ( with no space, it is a triplet count
    // --- if it is after a pitch or octave or slash, then it is a duration

    // Unambiguous symbols (except inside quoted strings):
    // vertical-bar, colon: part of a bar
    // ABCDEFGabcdefg: pitch
    // xyzZ: rest
    // comma, prime: octave
    // close-paren: end-slur
    // hyphen: tie
    // tilde, v, u, bang, plus, THLMPSO: decoration
    // carat, underscore, equal: accidental
    // ampersand: time reset
    // open-curly, close-curly: grace notes
    // double-quote: chord symbol
    // less-than, greater-than, slash: duration
    // back-tick, space, tab: space
    var nonDecorations = "ABCDEFGabcdefgxyzZ[]|^_{";	// use this to prescreen so we don't have to look for a decoration at every note.

    this.handleJump = function (name, jump, line, i) {
        if( jump.decorationNextBar ) {
            if( ! multilineVars.addJumpDecorationNextBar ) {
                multilineVars.addJumpDecorationNextBar = [];
            }
            multilineVars.addJumpDecorationNextBar.push({ type: name, upper: jump.upper });
        } else {
            if( multilineVars.lastBarElem ) {
                if( ! multilineVars.lastBarElem.jumpDecoration ) {
                    multilineVars.lastBarElem.jumpDecoration = [];
                }
                multilineVars.lastBarElem.jumpDecoration.push( { type: name, upper: jump.upper } ) ;
            } else {
                warn("Ignoring jump decoration marker before the first bar.", line, i);
            }
        }
        
        if( ('.segno.coda.fine.').indexOf(name) > 0 ) {
            if( jump.jumpNextBar ) {
                if( multilineVars.addJumpPointNextBar ) {
                    warn("Overriding previous jump point", line, i);
                }
                multilineVars.addJumpPointNextBar = { type: name };
            } else {
                if( multilineVars.lastBarElem ) {
                    if( multilineVars.lastBarElem.jumpPoint ) {
                        warn("Overriding previous jump point", line, i);
                    }
                    multilineVars.lastBarElem.jumpPoint = { type: name };
                } else {
                    warn("Ignoring jump point marker before the first bar.", line, i);
                }
            }
        } else {
            if( jump.jumpNextBar ) {
                if( multilineVars.addJumpInfoNextBar ) {
                    warn("Overriding previous jump information", line, i);
                }
                multilineVars.addJumpInfoNextBar = { type: name };
            } else {
                if( multilineVars.lastBarElem ) {
                    if( multilineVars.lastBarElem.jumpInfo ) {
                        warn("Overriding previous jump information", line, i);
                    }
                    multilineVars.lastBarElem.jumpInfo = { type: name };
                } else {
                    warn("Ignoring jump info marker before the first bar.", line, i);
                }
            }
        }
    };
    
    this.parseRegularMusicLine = function(line) {
        
        if( ! multilineVars.voices[0] ) {
            // se nenhuma voz foi declarada, força uma voz zero 
            if(!multilineVars.clef) {
                multilineVars.clef = {type:'treble', verticalPos:0};
            }
            multilineVars.voices[0] = {clef: multilineVars.clef, index:0, staffNum:0, currBarNumber:1 };
            multilineVars.staves[0] = {clef: multilineVars.clef, index:0, meter: null, numVoices:1, inTie:[false], inTieChord:[false], inEnding:[false] };
            multilineVars.currentVoice = multilineVars.voices[0];
            
        }
        
        multilineVars.barAccidentals = [];
        
        header.resolveTempo();
        
        multilineVars.is_in_header = false;	// We should have gotten a key header by now, but just in case, this is definitely out of the header.

        var i = 0;
        var startOfLine = multilineVars.iChar;
        
        // see if there is nothing but a comment on this line. If so, just ignore it. A full line comment is optional white space followed by %
        while (tokenizer.isWhiteSpace(line.charAt(i)) && i < line.length)
            i++;
        if (i === line.length || line.charAt(i) === '%')
            return;

        // Start with the standard staff, clef and key symbols on each line
        var delayStartNewLine = multilineVars.start_new_line;
        
        multilineVars.start_new_line = (multilineVars.continueall === undefined);
        
        var parsingTriplet = { notesLeft:0, triplet: false };
        
        // See if the line starts with a header field
        var retHeader = header.letter_to_body_header(line, i);
        if (retHeader[0] > 0) {
            i += retHeader[0];
            // TODO-PER: Handle inline headers
        }
        var el = {};

        while (i < line.length)
        {
            var startI = i;
            if (line.charAt(i) === '%')
                break;

            var retInlineHeader = header.letter_to_inline_header(line, i);
            if (retInlineHeader[0] > 0) {
                i += retInlineHeader[0];
            } else {
                // Wait until here to actually start the line because we know we're past the inline statements.
                if (delayStartNewLine) {
                    startNewLine();
                    delayStartNewLine = false;
                }

                // We need to decide if the following characters are a bar-marking or a note-group.
                // Unfortunately, that is ambiguous. Both can contain chord symbols and decorations.
                // If there is a grace note either before or after the chord symbols and decorations, then it is definitely a note-group.
                // If there is a bar marker, it is definitely a bar-marking.
                // If there is either a core-note or chord, it is definitely a note-group.
                // So, loop while we find grace-notes, chords-symbols, or decorations. 
                // [It is an error to have more than one grace-note group in a row; the others can be multiple]
                // Then, if there is a grace-note, we know where to go.
                // Else see if we have a chord, core-note, slur, triplet, or bar.

                var ret;
                while (1) {
                    ret = tokenizer.eatWhiteSpace(line, i);
                    if (ret > 0) {
                        i += ret;
                    }
                    if (i > 0 && line.charAt(i - 1) === '\x12') {
                        // there is one case where a line continuation isn't the same as being on the same line, and that is if the next character after it is a header.
                        ret = header.letter_to_body_header(line, i);
                        if (ret[0] > 0) {
                            // TODO: insert header here
                            i = ret[0];
                            multilineVars.start_new_line = false;
                        }
                    }
                    // gather all the grace notes, chord symbols and decorations
                    ret = letter_to_spacer(line, i);
                    if (ret[0] > 0) {
                        i += ret[0];
                    }

                    ret = letter_to_chord(line, i);
                    if (ret[0] > 0) {
                        // There could be more than one chord here if they have different positions.
                        // If two chords have the same position, then connect them with newline.
                        if (!el.chord)
                            el.chord = [];
                        var chordName = tokenizer.translateString(ret[1]);
                        chordName = chordName.replace(/;/g, "\n");
                        var addedChord = false;
                        for (var ci = 0; ci < el.chord.length; ci++) {
                            if (el.chord[ci].position === ret[2]) {
                                addedChord = true;
                                el.chord[ci].name += "\n" + chordName;
                            }
                        }
                        if (addedChord === false) {
                            if (ret[2] === null && ret[3])
                                el.chord.push({name: chordName, rel_position: ret[3]});
                            else
                                el.chord.push({name: chordName, position: ret[2]});
                        }

                        i += ret[0];
                        var ii = tokenizer.skipWhiteSpace(line.substring(i));
                        if (ii > 0)
                            el.force_end_beam_last = true;
                        i += ii;
                    } else {
                        if (nonDecorations.indexOf(line.charAt(i)) === -1)
                            ret = letter_to_accent(line, i);
                        else
                            ret = [0];
                        if (ret[0] > 0) {
                            if (ret[1] === null) {
                                if (i + 1 < line.length)
                                    startNewLine();	// There was a ! in the middle of the line. Start a new line if there is anything after it.
                            } else if (ret[1].length > 0) {
                                var jump = jumpMarkers[ ret[1] ];
                                if( jump ) {
                                    this.handleJump(ret[1], jump, line, i ); 
                                } else {
                                    if (el.decoration === undefined)
                                        el.decoration = [];
                                    el.decoration.push(ret[1]);
                                }
                            }
                            i += ret[0];
                        } else {
                            ret = letter_to_grace(line, i);
                            // TODO-PER: Be sure there aren't already grace notes defined. That is an error.
                            if (ret[0] > 0) {
                                el.gracenotes = ret[1];
                                i += ret[0];
                            } else
                                break;
                        }
                    }
                }

                ret = letter_to_bar(line, i);
                if (ret[0] > 0) {
                    // This is definitely a bar
                    if (el.gracenotes !== undefined) {
                        // Attach the grace note to an invisible note
                        el.rest = {type: 'spacer'};
                        el.duration = 0.125; // TODO-PER: I don't think the duration of this matters much, but figure out if it does.
                        this.addTuneElement('note', startOfLine, i, i + ret[0], el);
                        el = {};
                    }
                    var bar = {type: ret[1], repeat: ret[2]};
                    if (bar.type.length === 0)
                        warn("Unknown bar type", line, i);
                    else {
                        if (multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] ) {
                            bar.endDrawEnding = true;
                            if(  bar.type !== 'bar_thin') {
                                bar.endEnding = true;
                                multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] = false;
                            }
                        }
                        if (ret[3]) {
                            bar.startEnding = ret[3];
                            if (multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index]) {
                                bar.endDrawEnding = true;
                                bar.endEnding = true;
                            }
                            multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] = true;
                        }
                        if (el.decoration !== undefined)
                            bar.decoration = el.decoration;
                        if (el.chord !== undefined)
                            bar.chord = el.chord;
                        var mc = multilineVars.currentVoice; 
                        if (bar.type !== 'bar_invisible' 
                                && multilineVars.measureNotEmpty 
                                /*&& ( mc === undefined || ( mc.staffNum === 0 && mc.index === 0) )*/ ) {
                            mc.currBarNumber++;
                            multilineVars.barNumOnNextNote = mc.currBarNumber;
                            if 
                            (
                                (multilineVars.barNumbers && (mc.currBarNumber % multilineVars.barNumbers === 0))
                            || 
                                (multilineVars.barsperstaff !== undefined && mc.currBarNumber && ((mc.currBarNumber-1) % multilineVars.barsperstaff) === 0) 
                            ) 
                                multilineVars.barNumOnNextNoteVisible = true;
                        }
                        this.addTuneElement('bar', startOfLine, i, i + ret[0], bar);
                        el = {};
                    }
                    i += ret[0];
                } else if (line[i] === '&') {	// backtrack to beginning of measure
                    warn("Overlay not yet supported", line, i);
                    i++;

                } else {
                    // This is definitely a note group
                    //
                    // Look for as many open slurs and triplets as there are. (Note: only the first triplet is valid.)
                    ret = letter_to_open_slurs_and_triplets(line, i);
                    if (ret.consumed > 0) {
                        if (ret.startSlur !== undefined) 
                            el.startSlur = ret.startSlur;
                        if (ret.triplet !== undefined) {
                            if (parsingTriplet.notesLeft > 0)
                                warn("Can't nest triplets", line, i);
                            else {
                                parsingTriplet.notesLeft = ret.num_notes === undefined ? ret.triplet : ret.num_notes;
                                parsingTriplet.triplet = {num: ret.triplet, notes: parsingTriplet.notesLeft, avgPitch: 0};
                                el.startTriplet = parsingTriplet.triplet;
                            }
                        }
                        i += ret.consumed;
                    }

                    // handle chords.
                    if (line.charAt(i) === '[') {
                        i++;
                        var chordDuration = null;

                        var done = false;
                        while (!done) {
                            var chordNote = getCoreNote(line, i, {}, false);
                            if (chordNote !== null ) { 
                                if (chordNote.end_beam) {
                                    el.end_beam = true;
                                    delete chordNote.end_beam;
                                }
                                if( chordNote.rest) {
                                  //warn("Rests among notes are not considered in chords", line, i);
                                }  else {
                                    if (el.pitches === undefined) {
                                        el.duration = chordNote.duration;
                                        el.pitches = [chordNote];
                                    } else	// Just ignore the note lengths of all but the first note. The standard isn't clear here, but this seems less confusing.
                                        el.pitches.push(chordNote);

                                    if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length]) {
                                        chordNote.endTie = true;
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length] = undefined;
                                    }
                                    if (chordNote.startTie)
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length] = true;

                                }
                                i = chordNote.endChar;
                                delete chordNote.endChar;
                                delete chordNote.duration;
                            } else if (line.charAt(i) === ' ') {
                                // Spaces are not allowed in chords, but we can recover from it by ignoring it.
                                warn("Spaces are not allowed in chords", line, i);
                                i++;
                            } else {
                                if (i < line.length && line.charAt(i) === ']') {
                                    // consume the close bracket
                                    i++;

                                    if (multilineVars.next_note_duration !== 0) {
                                        el.duration = el.duration * multilineVars.next_note_duration;
                                        //  window.ABCXJS.parse.each(el.pitches, function(p) {
                                        //      p.duration = p.duration * multilineVars.next_note_duration;
                                        //  });
                                        multilineVars.next_note_duration = 0;
                                    }

                                    if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index]) {
                                        window.ABCXJS.parse.each(el.pitches, function(pitch) {
                                            pitch.endTie = true;
                                        });
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = false;
                                    }

                                    if (parsingTriplet.notesLeft > 0) {
                                        handleTriplet( el, parsingTriplet );
                                    }

                                    var postChordDone = false;
                                    while (i < line.length && !postChordDone) {
                                        switch (line.charAt(i)) {
                                            case ' ':
                                            case '\t':
                                                addEndBeam(el);
                                                break;
                                            case ')':
                                                if (el.endSlur === undefined)
                                                    el.endSlur = 1;
                                                else
                                                    el.endSlur++;
                                                //window.ABCXJS.parse.each(el.pitches, function(pitch) { if (pitch.endSlur === undefined) pitch.endSlur = 1; else pitch.endSlur++; });
                                                break;
                                            case '-':
                                                window.ABCXJS.parse.each(el.pitches, function(pitch) {
                                                    pitch.startTie = {};
                                                });
                                                multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                                                break;
                                            case '>':
                                            case '<':
                                                var br2 = getBrokenRhythm(line, i);
                                                i += br2[0] - 1;	// index gets incremented below, so we'll let that happen
                                                multilineVars.next_note_duration = br2[2];
                                                chordDuration = br2[1];
                                                break;
                                            case '1':
                                            case '2':
                                            case '3':
                                            case '4':
                                            case '5':
                                            case '6':
                                            case '7':
                                            case '8':
                                            case '9':
                                            case '0':
                                            case '/':
                                            case '.':
                                                var fraction = tokenizer.getFraction(line, i);
                                                chordDuration = fraction.value;
                                                i = fraction.index;
                                                // flavio - garantindo que o final do acorde seja bem tratado
                                                if( line.charAt(i).match(/[-\s\)]/g) )
                                                    i--; // Subtracting one because one is automatically added below
                                                //if (line.charAt(i) === '-' || line.charAt(i) === ')')
                                                //    i--; // Subtracting one because one is automatically added below
                                                 else 
                                                    postChordDone = true;
                                                break;
                                            default:
                                                postChordDone = true;
                                                break;
                                        }
                                        if (!postChordDone) {
                                            i++;
                                        }
                                    }
                                } else
                                    warn("Expected ']' to end the chords", line, i);

                                if (el.pitches !== undefined) {
                                    if (chordDuration !== null) {
                                        el.duration = el.duration * chordDuration;
                                        //window.ABCXJS.parse.each(el.pitches, function(p) {
                                        //    p.duration = p.duration * chordDuration;
                                        //});
                                    }
                                    this.addTuneElement('note', startOfLine, startI, i, el);
                                    el = {};
                                }
                                done = true;
                            }
                        }

                    } else {
                        // Single pitch
                        var el2 = {};
                        var core = getCoreNote(line, i, el2, true);
                        if (el2.endTie !== undefined) 
                            multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                        if (core !== null) {
                            if (core.pitch !== undefined) {
                                el.pitches = [{}];
                                // TODO-PER: straighten this out so there is not so much copying: getCoreNote shouldn't change e'
                                el.pitches[0].pitch = core.pitch;
                                if (core.accidental !== undefined) {
                                    el.pitches[0].accidental = core.accidental;
                                    multilineVars.barAccidentals[core.pitch] = core.accidental;
                                }    
                                if (core.endSlur !== undefined)
                                    el.pitches[0].endSlur = core.endSlur;
                                if (core.endTie !== undefined)
                                    el.pitches[0].endTie = core.endTie;
                                if (core.startSlur !== undefined)
                                    el.pitches[0].startSlur = core.startSlur;
                                if (el.startSlur !== undefined)
                                    el.pitches[0].startSlur = el.startSlur;
                                if (core.startTie !== undefined)
                                    el.pitches[0].startTie = core.startTie;
                                if (el.startTie !== undefined)
                                    el.pitches[0].startTie = el.startTie;
                            } else {
                                el.rest = core.rest;
                                if (core.endSlur !== undefined)
                                    el.endSlur = core.endSlur;
                                if (core.endTie !== undefined)
                                    el.rest.endTie = core.endTie;
                                if (core.startSlur !== undefined)
                                    el.startSlur = core.startSlur;
                                //if (el.startSlur !== undefined) el.startSlur = el.startSlur;
                                if (core.startTie !== undefined)
                                    el.rest.startTie = core.startTie;
                                if (el.startTie !== undefined)
                                    el.rest.startTie = el.startTie;
                            }

                            if (core.chord !== undefined)
                                el.chord = core.chord;
                            if (core.duration !== undefined)
                                el.duration = core.duration;
                            if (core.decoration !== undefined)
                                el.decoration = core.decoration;
                            if (core.graceNotes !== undefined)
                                el.graceNotes = core.graceNotes;
                            delete el.startSlur;
                            if(multilineVars.staves.length){
                                if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index]) {
                                    if (el.pitches !== undefined)
                                        el.pitches[0].endTie = true;
                                    else
                                        el.rest.endTie = true;
                                    multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = false;
                                }
                                if (core.startTie || el.startTie)
                                    multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                            }    
                            i = core.endChar;

                            if (parsingTriplet.notesLeft > 0) {
                                handleTriplet( el, parsingTriplet );
                            }
                            
                            if (core.end_beam)
                                addEndBeam(el);

                            this.addTuneElement('note', startOfLine, startI, i, el, line);
                            el = {};
                        }
                    }

                    if (i === startI) {	// don't know what this is, so ignore it.
                        if (line.charAt(i) !== ' ' && line.charAt(i) !== '`')
                            warn("Unknown character ignored", line, i);
                            //warn("Unknown character ignored (" + line.charCodeAt(i) + ")", line, i);
                        i++;
                    }
                }
            }
        }
    };

    this.parseLine = function(line, lineNumber) {
        var ret = header.parseHeader(line, lineNumber);
        if (ret.regular) {
            // TODO: verificar porque no parabens crioulo a voz v3 nao tem clef definida
            if (multilineVars.clef && multilineVars.clef.type === "accordionTab") {
                //var startOfLine = this.getMultilineVars().iChar;
                if (this.accordion) {
                    if( this.transposer && this.transposer.offSet !== 0) {
                        this.transposer.deleteTabLine(lineNumber);
                    } else {
                        var voice = this.accordion.parseTabVoice(ret.str, this.getMultilineVars(), this.getTune());
                        if (voice.length > 0) {
                            startNewLine();
                            for (var i = 0; i < voice.length; i++) {
                                tune.appendElement(voice[i].el_type, multilineVars.currTexLineNum, voice[i].startChar, voice[i].endChar, voice[i], multilineVars.currentVoice); // flavio - startOfline
                            }
                        }
                    }
                } else {
                    addWarning("+Warn: Cannot parse tablature line: no accordion defined!");
                }
            } else {
                if (this.transposer && this.transposer.offSet !== 0) {
                    ret.str = this.transposer.transposeRegularMusicLine(line, lineNumber, multilineVars);
                }
                this.parseRegularMusicLine(ret.str);
            }
        }
        if (ret.newline && multilineVars.continueall === undefined)
            startNewLine();
        if (ret.fingering)
            addWords(tune.getCurrentStaff(), tune.getCurrentVoice(), line.substring(2), true);
        if (ret.words)
            addWords(tune.getCurrentStaff(), tune.getCurrentVoice(), line.substring(2), false);
        if (ret.symbols)
            addSymbols(tune.getCurrentVoice(), line.substring(2));
        if (ret.recurse)
            this.parseLine(ret.str);
    };

    this.strTuneHouseKeeping = function() {
        // Take care of whatever line endings come our way
        strTune = window.ABCXJS.parse.gsub(strTune, '\r\n', '\n');
        strTune = window.ABCXJS.parse.gsub(strTune, '\r', '\n');
        strTune += strTune.charAt(strTune.length-1) === '\n' ? '' : '\n';
        strTune = strTune.replace(/\n\\.*\n/g, "\n");	// get rid of latex commands.
        
        var continuationReplacement = function(all, backslash, comment) {
            var spaces = "                                                                                                                                                                                                     ";
            var padding = comment ? spaces.substring(0, comment.length) : "";
            return backslash + " \x12" + padding;
        };
        
        strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	// take care of line continuations right away, but keep the same number of characters
        var lines = strTune.split('\n');
        
        while( window.ABCXJS.parse.last(lines).length === 0 )	// remove the blank lines at the end.
            lines.pop();
        
        return lines;

    };
    
//    this.joinStrings = function(original, newLines) {
//        while( original.charAt(original.length-1) === '\n' ) {
//            original = original.substr(0,original.length-1);
//        }
//        while( newLines.charAt(newLines.length-1) === '\n' ) {
//            newLines = newLines.substr(0,newLines.length-1);
//        }
//        return original + newLines + '\n';
//    };
    

    this.parse = function(tuneTxt, switches) {
        // the switches are optional and cause a difference in the way the tune is parsed.
        // switches.header_only : stop parsing when the header is finished
        // switches.stop_on_warning : stop at the first warning encountered.
        // switches.print: format for the page instead of the browser.
        //window.ABCXJS.parse.transpose = transpose;
        
        strTune = tuneTxt;
        
        tune = new window.ABCXJS.data.Tune();
        tokenizer = new window.ABCXJS.parse.tokenizer();
        header = new window.ABCXJS.parse.ParseHeader(tokenizer, warn, multilineVars, tune, this.transposer);

        //tune.reset();
        
        if (switches && switches.print)
            tune.media = 'print';
        multilineVars.reset();
        header.reset(tokenizer, warn, multilineVars, tune);

        var lines = this.strTuneHouseKeeping();
        try {
            for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {
                multilineVars.currTexLineNum = lineNumber;
                var line = lines[lineNumber];
                if (switches) {
                    if (switches.header_only && multilineVars.is_in_header === false)
                        throw "normal_abort";
                    if (switches.stop_on_warning && multilineVars.warnings)
                        throw "normal_abort";
                }
                if (multilineVars.is_in_history) {
                    if (line.charAt(1) === ':') {
                        multilineVars.is_in_history = false;
                        this.parseLine(line);
                    } else
                        tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line)));
                } else if (multilineVars.inTextBlock) {
                    if (window.ABCXJS.parse.startsWith(line, "%%endtext")) {
                        tune.addText(multilineVars.textBlock);
                        multilineVars.inTextBlock = false;
                    }
                    else {
                        if (window.ABCXJS.parse.startsWith(line, "%%"))
                            multilineVars.textBlock += ' ' + line.substring(2);
                        else
                            multilineVars.textBlock += ' ' + line;
                    }
                } else if (multilineVars.inPsBlock) {
                    if (window.ABCXJS.parse.startsWith(line, "%%endps")) {
                        // Just ignore postscript
                        multilineVars.inPsBlock = false;
                    }
                    else
                        multilineVars.textBlock += ' ' + line;
                } else
                    this.parseLine(line, lineNumber);
                multilineVars.iChar += line.length + 1;
            }
            
            if( this.transposer && this.transposer.offSet !== 0 ) {
                // substitui strTune com os valores transpostos
                strTune = this.transposer.updateEditor( lines );
            }
            
            if (tune.hasTablature) {
                // necessário inferir a tablatura
                if (tune.lines[0].staffs[tune.tabStaffPos].voices[0].length === 0) {
                    // para a tablatura de accordion, sempre se esperam 3 vozes (staffs): uma para melodia, uma para o baixo e a terceira para a tablatura
                    // opcionalmente, a linha de baixo, não precisa existir
                    (tune.tabStaffPos === 0) && addWarning("AccordionTab não deve ser a primeira voz!");
                    for (var t = 1; t < tune.lines.length; t++) {
                        //se for necessário inferir a tablatura, garante que todas as linhas tenham uma staff apropriada
                        if (tune.lines[t].staffs && !tune.lines[t].staffs[tune.tabStaffPos]) {
                            tune.lines[t].staffs[tune.tabStaffPos] = window.ABCXJS.parse.clone(tune.lines[0].staffs[tune.tabStaffPos]);
                            tune.lines[t].staffs[tune.tabStaffPos].meter = null;
                            tune.lines[t].staffs[tune.tabStaffPos].subtitle = "";
                        }
                    }
                    if (this.accordion) {
                        
                        //inferir a nova tablatura
                        this.accordion.inferTablature(tune, multilineVars, addWarning );
                        
                        // obtem possiveis linhas inferidas para tablatura
                        strTune += this.accordion.getTabLines();
                        
                    } else {
                        addWarning("Impossível inferir a tablatura: acordeon não definido!");
                    }
                } else {
                    // como parse da tablatura foi feito, incluir possiveis warnings
                    if(multilineVars.InvalidBass) {
                        addWarning("Baixo incompatível com movimento do fole no(s) compasso(s): "+ multilineVars.InvalidBass.substring(1,multilineVars.InvalidBass.length-1) +".");
                        delete multilineVars.InvalidBass;
                    } 
                    if(multilineVars.missingNotes) {
                        addWarning("Notas não encontradas no(s) compasso(s): "+ multilineVars.missingNotes.substring(1,multilineVars.missingNotes.length-1) +".");
                        delete multilineVars.missingNotes;
                    } 
                    
                }
            }
            
            tune.setFormat(multilineVars);
            
            tune.handleBarsPerStaff();
            
            tune.checkJumpMarkers(addWarning);

            tune.cleanUp();
            
        } catch (err) {
            if (err !== "normal_abort")
                throw err;
        }
    };
};
/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

window.ABCXJS.parse.parseDirective = {};

(function() {
	var tokenizer;
	var warn;
	var multilineVars;
	var tune;
	window.ABCXJS.parse.parseDirective.initialize = function(tokenizer_, warn_, multilineVars_, tune_) {
		tokenizer = tokenizer_;
		warn = warn_;
		multilineVars = multilineVars_;
		tune = tune_;
	};

	window.ABCXJS.parse.parseDirective.parseFontChangeLine = function(textstr) {
		var textParts = textstr.split('$');
		if (textParts.length > 1 && multilineVars.setfont) {
			var textarr = [ { text: textParts[0] }];
			for (var i = 1; i < textParts.length; i++) {
				if (textParts[i].charAt(0) === '0')
					textarr.push({ text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '1' && multilineVars.setfont[1])
					textarr.push({font: multilineVars.setfont[1], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '2' && multilineVars.setfont[2])
					textarr.push({font: multilineVars.setfont[2], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '3' && multilineVars.setfont[3])
					textarr.push({font: multilineVars.setfont[3], text: textParts[i].substring(1) });
				else if (textParts[i].charAt(0) === '4' && multilineVars.setfont[4])
					textarr.push({font: multilineVars.setfont[4], text: textParts[i].substring(1) });
				else
					textarr[textarr.length-1].text += '$' + textParts[i];
			}
			if (textarr.length > 1)
				return textarr;
		}
		return textstr;
	};

	window.ABCXJS.parse.parseDirective.addDirective = function(str) {
		var getRequiredMeasurement = function(cmd, tokens) {
			var points = tokenizer.getMeasurement(tokens);
			if (points.used === 0 || tokens.length !== 0)
				return { error: "Directive \"" + cmd + "\" requires a measurement as a parameter."};
			return points.value;
		};
		var oneParameterMeasurement = function(cmd, tokens) {
			var points = tokenizer.getMeasurement(tokens);
			if (points.used === 0 || tokens.length !== 0)
				return "Directive \"" + cmd + "\" requires a measurement as a parameter.";
			tune.formatting[cmd] = points.value;
			return null;
		};
		var getFontParameter = function(tokens) {
			var font = {};
			var token = window.ABCXJS.parse.last(tokens);
			if (token.type === 'number') {
				font.size = parseInt(token.token);
				tokens.pop();
			}
			if (tokens.length > 0) {
				var scratch = "";
				window.ABCXJS.parse.each(tokens, function(tok) {
					if (tok.token !== '-') {
						if (scratch.length > 0) scratch += ' ';
						scratch += tok.token;
					}
				});
				font.font = scratch;
			}
			return font;
		};
		var getChangingFont = function(cmd, tokens) {
			if (tokens.length === 0)
				return "Directive \"" + cmd + "\" requires a font as a parameter.";
			multilineVars[cmd] = getFontParameter(tokens);
			return null;
		};
		var getGlobalFont = function(cmd, tokens) {
			if (tokens.length === 0)
				return "Directive \"" + cmd + "\" requires a font as a parameter.";
			tune.formatting[cmd] = getFontParameter(tokens);
			return null;
		};

		var addMultilineVar = function(key, cmd, tokens, min, max) {
			if (tokens.length !== 1 || tokens[0].type !== 'number')
				return "Directive \"" + cmd + "\" requires a number as a parameter.";
			var i = tokens[0].intt;
			if (min !== undefined && i < min)
				return "Directive \"" + cmd + "\" requires a number greater than or equal to " + min + " as a parameter.";
			if (max !== undefined && i > max)
				return "Directive \"" + cmd + "\" requires a number less than or equal to " + max + " as a parameter.";
			multilineVars[key] = i;
			return null;
		};

		var addMultilineVarBool = function(key, cmd, tokens) {
			var str = addMultilineVar(key, cmd, tokens, 0, 1);
			if (str !== null) return str;
			multilineVars[key] = (multilineVars[key] === 1);
			return null;
		};

		var tokens = tokenizer.tokenize(str, 0, str.length);	// 3 or more % in a row, or just spaces after %% is just a comment
		if (tokens.length === 0 || tokens[0].type !== 'alpha') return null;
		var restOfString = str.substring(str.indexOf(tokens[0].token)+tokens[0].token.length);
		restOfString = tokenizer.stripComment(restOfString);
		var cmd = tokens.shift().token.toLowerCase();
		var num;
		var scratch = "";
		switch (cmd)
		{
			// The following directives were added to abc_parser_lint, but haven't been implemented here.
			// Most of them are direct translations from the directives that will be parsed in. See abcm2ps's format.txt for info on each of these.
			//					alignbars: { type: "number", optional: true },
			//					aligncomposer: { type: "string", Enum: [ 'left', 'center','right' ], optional: true },
			//					annotationfont: fontType,
			//					bstemdown: { type: "boolean", optional: true },
			//					continueall: { type: "boolean", optional: true },
			//					dynalign: { type: "boolean", optional: true },
			//					exprabove: { type: "boolean", optional: true },
			//					exprbelow: { type: "boolean", optional: true },
			//					flatbeams: { type: "boolean", optional: true },
			//					footer: { type: "string", optional: true },
			//					footerfont: fontType,
			//					gchordbox: { type: "boolean", optional: true },
			//					graceslurs: { type: "boolean", optional: true },
			//					gracespacebefore: { type: "number", optional: true },
			//					gracespaceinside: { type: "number", optional: true },
			//					gracespaceafter: { type: "number", optional: true },
			//					header: { type: "string", optional: true },
			//					headerfont: fontType,
			//					historyfont: fontType,
			//					infofont: fontType,
			//					infospace: { type: "number", optional: true },
			//					lineskipfac: { type: "number", optional: true },
			//					maxshrink: { type: "number", optional: true },
			//					maxstaffsep: { type: "number", optional: true },
			//					maxsysstaffsep: { type: "number", optional: true },
			//					measurebox: { type: "boolean", optional: true },
			//					measurefont: fontType,
			//					notespacingfactor: { type: "number", optional: true },
			//					parskipfac: { type: "number", optional: true },
			//					partsbox: { type: "boolean", optional: true },
			//					repeatfont: fontType,
			//					rightmargin: { type: "number", optional: true },
			//					slurheight: { type: "number", optional: true },
			//					splittune: { type: "boolean", optional: true },
			//					squarebreve: { type: "boolean", optional: true },
			//					stemheight: { type: "number", optional: true },
			//					straightflags: { type: "boolean", optional: true },
			//					stretchstaff: { type: "boolean", optional: true },
			//					textfont: fontType,
			//					titleformat: { type: "string", optional: true },
			//					vocalabove: { type: "boolean", optional: true },
			//					vocalfont: fontType,
			//					wordsfont: fontType,
                        
			case "bagpipes":tune.formatting.bagpipes = true;break;
                        case "hidefingering": tune.formatting.hideFingering = true; break;
                        case "restsintab": tune.formatting.restsInTab = true; break;
			case "slurgraces":tune.formatting.slurgraces = true;break;
			case "stretchlast":tune.formatting.stretchlast = true;break;
			case "titleleft":tune.formatting.titleleft = true;break;
			case "measurebox":tune.formatting.measurebox = true;break;

                        case "landscape":multilineVars.landscape = true;break;
			case "papersize":multilineVars.papersize = restOfString;break;
			case "titlecaps":multilineVars.titlecaps = true;break;

			case "botmargin":
			case "botspace":
			case "composerspace":
			case "indent":
			case "leftmargin":
			case "linesep":
			case "musicspace":
			case "partsspace":
			case "pageheight":
			case "pagewidth":
			case "rightmargin":
			case "staffsep":
			case "staffwidth":
			case "subtitlespace":
			case "sysstaffsep":
			case "systemsep":
			case "textspace":
			case "titlespace":
			case "topmargin":
			case "topspace":
			case "vocalspace":
			case "wordsspace":
				return oneParameterMeasurement(cmd, tokens);
			case "vskip":
				var vskip = getRequiredMeasurement(cmd, tokens);
				if (vskip.error)
					return vskip.error;
				tune.addSpacing(vskip);
				return null;
			case "tabinferenceopts":
				scratch = "";
				window.ABCXJS.parse.each(tokens, function(tok) {
					scratch += tok.token;
				});
				num = parseFloat(scratch);
				if (isNaN(num) || num === 0)
					return "Directive \"" + cmd + "\" requires positive or negativenumber a number as a parameter.";
				tune.formatting.tabInferenceOpts = num;
				break;
			case "scale":
				scratch = "";
				window.ABCXJS.parse.each(tokens, function(tok) {
					scratch += tok.token;
				});
				num = parseFloat(scratch);
				if (isNaN(num) || num === 0)
					return "Directive \"" + cmd + "\" requires a number as a parameter.";
				tune.formatting.scale = num;
				break;
			case "sep":
				if (tokens.length === 0)
					tune.addSeparator();
				else {
					var points = tokenizer.getMeasurement(tokens);
					if (points.used === 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var spaceAbove = points.value;

					points = tokenizer.getMeasurement(tokens);
					if (points.used === 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var spaceBelow = points.value;

					points = tokenizer.getMeasurement(tokens);
					if (points.used === 0 || tokens.length !== 0)
						return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
					var lenLine = points.value;
					tune.addSeparator(spaceAbove, spaceBelow, lenLine);
				}
				break;
			case "barsperstaff":
				scratch = addMultilineVar('barsperstaff', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "staffnonote":
				scratch = addMultilineVarBool('staffnonote', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "printtempo":
				scratch = addMultilineVarBool('printTempo', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
                                                       case "pagenumbering":
				multilineVars.pagenumbering = true;
				break;
			case "measurenb":
			case "barnumbers":
				scratch = addMultilineVar('barNumbers', cmd, tokens);
				if (scratch !== null) return scratch;
				break;
			case "begintext":
				multilineVars.inTextBlock = true;
				break;
			case "continueall":
				multilineVars.continueall = true;
				break;
			case "beginps":
				multilineVars.inPsBlock = true;
				warn("Postscript ignored", str, 0);
				break;
			case "deco":
				if (restOfString.length > 0)
					multilineVars.ignoredDecorations.push(restOfString.substring(0, restOfString.indexOf(' ')));
				warn("Decoration redefinition ignored", str, 0);
				break;
			case "text":
				var textstr = tokenizer.translateString(restOfString);
				tune.addText(window.ABCXJS.parse.parseDirective.parseFontChangeLine(textstr));
				break;
			case "center":
				var centerstr = tokenizer.translateString(restOfString);
				tune.addCentered(window.ABCXJS.parse.parseDirective.parseFontChangeLine(centerstr));
				break;
			case "font":
				// don't need to do anything for this; it is a useless directive
				break;
			case "setfont":
				var sfTokens = tokenizer.tokenize(restOfString, 0, restOfString.length);
				var sfDone = false;
				if (sfTokens.length >= 4) {
					if (sfTokens[0].token === '-' && sfTokens[1].type === 'number') {
						var sfNum = parseInt(sfTokens[1].token);
						if (sfNum >= 1 && sfNum <= 4) {
							if (!multilineVars.setfont)
								multilineVars.setfont = [];
							var sfSize = sfTokens.pop();
							if (sfSize.type === 'number') {
								sfSize = parseInt(sfSize.token);
								var sfFontName = '';
								for (var sfi = 2; sfi < sfTokens.length; sfi++)
									sfFontName += sfTokens[sfi].token;
								multilineVars.setfont[sfNum] = { font: sfFontName, size: sfSize };
								sfDone = true;
							}
						}
					}
				}
				if (!sfDone)
					return "Bad parameters: " + cmd;
				break;
			case "gchordfont":
			case "partsfont":
			case "vocalfont":
			case "textfont":
				return getChangingFont(cmd, tokens);
			case "barlabelfont":
			case "barnumberfont":
			case "composerfont":
			case "subtitlefont":
			case "tempofont":
			case "titlefont":
			case "voicefont":
				return getGlobalFont(cmd, tokens);
			case "barnumfont":
				return getGlobalFont("barnumberfont", tokens);
			case "staves":
			case "score":
				multilineVars.score_is_present = true;
				var addVoice = function(id, newStaff, bracket, brace, continueBar) {
					if (newStaff || multilineVars.staves.length === 0) {
						multilineVars.staves.push({index: multilineVars.staves.length, numVoices: 0, inEnding : [], inTie : [], inTieChord : [] });
					}
					var staff = window.ABCXJS.parse.last(multilineVars.staves);
					if (bracket !== undefined) staff.bracket = bracket;
					if (brace !== undefined) staff.brace = brace;
					if (continueBar) staff.connectBarLines = 'end';
					if (multilineVars.voices[id] === undefined) {
                                                staff.inEnding[staff.numVoices] = false;
                                                staff.inTie[staff.numVoices] = false;
                                                staff.inTieChord[staff.numVoices] ={};
						multilineVars.voices[id] = {staffNum: staff.index, index: staff.numVoices, currBarNumber:1};
						staff.numVoices++;
					}
				};

				var openParen = false;
				var openBracket = false;
				var openBrace = false;
				var justOpenParen = false;
				var justOpenBracket = false;
				var justOpenBrace = false;
				var continueBar = false;
				var lastVoice;
				var addContinueBar = function() {
					continueBar = true;
					if (lastVoice) {
						var ty = 'start';
						if (lastVoice.staffNum > 0) {
							if (multilineVars.staves[lastVoice.staffNum-1].connectBarLines === 'start' ||
								multilineVars.staves[lastVoice.staffNum-1].connectBarLines === 'continue')
								ty = 'continue';
						}
						multilineVars.staves[lastVoice.staffNum].connectBarLines = ty;
					}
				};
				while (tokens.length) {
					var t = tokens.shift();
					switch (t.token) {
						case '(':
							if (openParen) warn("Can't nest parenthesis in %%score", str, t.start);
							else {openParen = true;justOpenParen = true;}
							break;
						case ')':
							if (!openParen || justOpenParen) warn("Unexpected close parenthesis in %%score", str, t.start);
							else openParen = false;
							break;
						case '[':
							if (openBracket) warn("Can't nest brackets in %%score", str, t.start);
							else {openBracket = true;justOpenBracket = true;}
							break;
						case ']':
							if (!openBracket || justOpenBracket) warn("Unexpected close bracket in %%score", str, t.start);
							else {openBracket = false;multilineVars.staves[lastVoice.staffNum].bracket = 'end';}
							break;
						case '{':
							if (openBrace ) warn("Can't nest braces in %%score", str, t.start);
							else {openBrace = true;justOpenBrace = true;}
							break;
						case '}':
							if (!openBrace || justOpenBrace) warn("Unexpected close brace in %%score", str, t.start);
							else {openBrace = false;multilineVars.staves[lastVoice.staffNum].brace = 'end';}
							break;
						case '|':
							addContinueBar();
							break;
						default:
							var vc = "";
							while (t.type === 'alpha' || t.type === 'number') {
								vc += t.token;
								if (t.continueId)
									t = tokens.shift();
								else
									break;
							}
							var newStaff = !openParen || justOpenParen;
							var bracket = justOpenBracket ? 'start' : openBracket ? 'continue' : undefined;
							var brace = justOpenBrace ? 'start' : openBrace ? 'continue' : undefined;
							addVoice(vc, newStaff, bracket, brace, continueBar);
							justOpenParen = false;
							justOpenBracket = false;
							justOpenBrace = false;
							continueBar = false;
							lastVoice = multilineVars.voices[vc];
							if (cmd === 'staves')
								addContinueBar();
							break;
					}
				}
				break;

			case "newpage":
				var pgNum = tokenizer.getInt(restOfString);
				tune.addNewPage(pgNum.digits === 0 ? -1 : pgNum.value);
				break;

			case "abc-copyright":
			case "abc-creator":
			case "abc-version":
			case "abc-charset":
			case "abc-edited-by":
				tune.addMetaText(cmd, restOfString);
				break;
			case "header":
			case "footer":
				var footerStr = tokenizer.getMeat(restOfString, 0, restOfString.length);
				footerStr = restOfString.substring(footerStr.start, footerStr.end);
				if (footerStr.charAt(0) === '"' && footerStr.charAt(footerStr.length-1) === '"' )
					footerStr = footerStr.substring(1, footerStr.length-2);
				var footerArr = footerStr.split('\t');
				var footer = {};
				if (footerArr.length === 1)
					footer = { left: "", center: footerArr[0], right: "" };
				else if (footerArr.length === 2)
					footer = { left: footerArr[0], center: footerArr[1], right: "" };
				else
					footer = { left: footerArr[0], center: footerArr[1], right: footerArr[2] };
				 if (footerArr.length > 3)
					 warn("Too many tabs in "+cmd+": "+footerArr.length+" found.", restOfString, 0);

				tune.addMetaTextObj(cmd, footer);
				break;

			case "midi":
				var midi = tokenizer.tokenize(restOfString, 0, restOfString.length);
				if (midi.length > 0 && midi[0].token === '=')
					midi.shift();
				if (midi.length === 0)
					warn("Expected midi command", restOfString, 0);
				else {
	//				var midiCmd = restOfString.split(' ')[0];
	//				var midiParam = restOfString.substring(midiCmd.length+1);
					var getNextMidiParam =  function(midiToks) {
						if (midiToks.length > 0) {
							var t = midiToks.shift();
							var p = t.token;
							if (t.type === "number")
								p = t.intt;
							return p;
						}
						else
							return null;
					};
					// TODO-PER: make sure the command is legal
					if (tune.formatting[cmd] === undefined)
						tune.formatting[cmd] = {};
					var midi_cmd = midi.shift().token;
					var midi_param = true;
					if (midi_cmd === 'program') {
						var p1 = getNextMidiParam(midi);
						if (p1) {
							var p2 = getNextMidiParam(midi);
							// NOTE: The program number has an off by one error in ABC, so we add one here.
							if (p2)
								midi_param = { channel: p1, program: p2};
							else
								midi_param = { program: p1};
						}
					} else {
						// TODO-PER: handle the params for all MIDI commands
						var p = getNextMidiParam(midi);
						if (p !== null)
							midi_param = p;
					}
					tune.formatting[cmd][midi_cmd] = midi_param;
					// TODO-PER: save all the parameters, not just the first.
				}
	//%%MIDI barlines: deactivates %%nobarlines.
	//%%MIDI bassprog n
	//%%MIDI bassvol n
	//%%MIDI beat ⟨int1⟩ ⟨int2⟩ ⟨int3⟩ ⟨int4⟩: controls the volumes of the notes in a measure. The first note in a bar has volume ⟨int1⟩; other ‘strong’ notes have volume ⟨int2⟩ and all the rest have volume ⟨int3⟩. These values must be in the range 0–127. The parameter ⟨int4⟩ determines which notes are ‘strong’. If the time signature is x/y, then each note is given a position number k = 0, 1, 2. . . x-1 within each bar. If k is a multiple of ⟨int4⟩, then the note is ‘strong’.
	//%%MIDI beataccents: reverts to normally emphasised notes. See also %%MIDI nobeat-
	//%%MIDI beatmod ⟨int⟩: increments the velocities as defined by %%MIDI beat
	//%%MIDI beatstring ⟨string⟩: similar to %%MIDI beat, but indicated with an fmp string.
	//%%MIDI c ⟨int⟩: specifies the MIDI pitch which corresponds to	. The default is 60.
	//%%MIDI channel ⟨int⟩: selects the melody channel ⟨int⟩ (1–16).
	//%%MIDI chordattack ⟨int⟩: delays the start of chord notes by ⟨int⟩ MIDI units.
	//%%MIDI chordname ⟨string int1 int2 int3 int4 int5 int6⟩: defines new chords or re-defines existing ones as was seen in Section 12.8.
	//%%MIDI chordprog 20 % Church organ
	//%%MIDI chordvol ⟨int⟩: sets the volume (velocity) of the chord notes to ⟨int⟩ (0–127).
	//%%MIDI control ⟨bass/chord⟩ ⟨int1 int2⟩: generates a MIDI control event. If %%control is followed by ⟨bass⟩ or ⟨chord⟩, the event apply to the bass or chord channel, otherwise it will be applied to the melody channel. ⟨int1⟩ is the MIDI control number (0–127) and ⟨int2⟩ the value (0–127).
	//%%MIDI deltaloudness⟨int⟩: bydefault,!crescendo!and!dimuendo!modifythebe- at variables ⟨vol1⟩ ⟨vol2⟩ ⟨vol3⟩ 15 volume units. This command allows the user to change this default.
	//%%MIDI drone ⟨int1 int2 int3 int4 int5⟩: specifies a two-note drone accompaniment. ⟨int1⟩ is the drone MIDI instrument, ⟨int2⟩ the MIDI pitch 1, ⟨int3⟩ the MIDI pitch 2, ⟨int4⟩ the MIDI volume 1, ⟨int5⟩ the MIDI volume 2. Default values are 70 45 33 80 80.
	//%%MIDI droneoff: turns the drone accompaniment off.
	//%%MIDI droneon: turns the drone accompaniment on.
	//%%MIDI drum string [drum programs] [drum velocities]
	//%%MIDI drumbars ⟨int⟩: specifies the number of bars over which a drum pattern string is spread. Default is 1.
	//%%MIDI drummap ⟨str⟩ ⟨int⟩: associates the note ⟨str⟩ (in ABC notation) to the a percussion instrument, as listed in Section H.2.
	//%%MIDI drumoff turns drum accompaniment off.
	//%%MIDI drumon turns drum accompaniment on.
	//%%MIDI fermatafixed: expands a !fermata! by one unit length; that is, GC3 becomes
	//%%MIDI fermataproportional: doubles the length of a note preceded by !fermata!;
	//%%MIDI gchord string
	//%%MIDI gchord str
	//%%MIDI gchordon
	//%%MIDI gchordoff
	//%%MIDI grace ⟨float⟩: sets the fraction of the next note that grace notes will take up. ⟨float⟩ must be a fraction such as 1/6.
	//%%MIDI gracedivider ⟨int⟩: sets the grace note length as 1/⟨int⟩th of the following note.
	//%%MIDI makechordchannels⟨int⟩: thisisaverycomplexcommandusedinchordscon-
	//%%MIDI nobarlines
	//%%MIDI nobeataccents: forces the ⟨int2⟩ volume (see %%MIDI beat) for each note in a bar, regardless of their position.
	//%%MIDI noportamento: turns off the portamento controller on the current channel.
	//%%MIDI pitchbend [bass/chord] <high byte> <low byte>
	//%%MIDI program 2 75
	//%%MIDI portamento ⟨int⟩: turns on the portamento controller on the current channel and set it to ⟨int⟩. Experts only.
	//%%MIDI randomchordattack: delays the start of chord notes by a random number of MIDI units.
	//%%MIDI ratio n m
	//%%MIDI rtranspose ⟨int1⟩: transposes relatively to a prior %%transpose command by ⟨int1⟩ semitones; the total transposition will be ⟨int1 + int2⟩ semitones.
	//%%MIDI temperament ⟨int1⟩ ⟨int2⟩: TO BE WRITTEN
	//%%MIDI temperamentlinear ⟨float1 float2⟩: changes the temperament of the scale. ⟨fl- oat1⟩ specifies the size of an octave in cents of a semitone, or 1/1200 of an octave. ⟨float2⟩ specifies in the size of a fifth (normally 700 cents).
	//%%MIDI temperamentnormal: restores normal temperament.
	//%%MIDI transpose n
	//%%MIDI voice [<ID>] [instrument=<integer> [bank=<integer>]] [mute]
				break;

			case "playtempo":
			case "auquality":
			case "continuous":
			case "nobarcheck":
				// TODO-PER: Actually handle the parameters of these
				tune.formatting[cmd] = restOfString;
				break;
			default:
				return "Unknown directive: " + cmd;
		}
		return null;
	};

})();
//    abc_parse_header.js: parses a the header fields from a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

window.ABCXJS.parse.ParseHeader = function(tokenizer, warn, multilineVars, tune, transposer) {
	this.reset = function(tokenizer, warn, multilineVars, tune) {
		window.ABCXJS.parse.parseKeyVoice.initialize(tokenizer, warn, multilineVars, tune);
		window.ABCXJS.parse.parseDirective.initialize(tokenizer, warn, multilineVars, tune);
	};
	this.reset(tokenizer, warn, multilineVars, tune);

	this.setTitle = function(title) {
		if (multilineVars.hasMainTitle) {
                  multilineVars.subtitle = tokenizer.translateString(tokenizer.stripComment(title));
		  tune.addSubtitle(multilineVars.subtitle);	// display secondary title
                } else {
		  tune.addMetaText("title", tokenizer.translateString(tokenizer.theReverser(tokenizer.stripComment(title))));
		  multilineVars.hasMainTitle = true;
		}
	};

	this.setMeter = function(line) {
		line = tokenizer.stripComment(line);
		if (line === 'C') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'common_time'};
		} else if (line === 'C|') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'cut_time'};
		} else if (line === 'o') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_perfectum'};
		} else if (line === 'c') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_imperfectum'};
		} else if (line === 'o.') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_perfectum_prolatio'};
		} else if (line === 'c.') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return {type: 'tempus_imperfectum_prolatio'};
		} else if (line.length === 0 || line.toLowerCase() === 'none') {
			if (multilineVars.havent_set_length === true)
				multilineVars.default_length = 0.125;
			return null;
		}
		else
		{
			var tokens = tokenizer.tokenize(line, 0, line.length);
			// the form is [open_paren] decimal [ plus|dot decimal ]... [close_paren] slash decimal [plus same_as_before]
			try {
				var parseNum = function() {
					// handles this much: [open_paren] decimal [ plus|dot decimal ]... [close_paren]
					var ret = {value: 0, num: ""};

					var tok = tokens.shift();
					if (tok.token === '(')
						tok = tokens.shift();
					while (1) {
						if (tok.type !== 'number') throw "Expected top number of meter";
						ret.value += parseInt(tok.token);
						ret.num += tok.token;
						if (tokens.length === 0 || tokens[0].token === '/') return ret;
						tok = tokens.shift();
						if (tok.token === ')') {
							if (tokens.length === 0 || tokens[0].token === '/') return ret;
							throw "Unexpected paren in meter";
						}
						if (tok.token !== '.' && tok.token !== '+') throw "Expected top number of meter";
						ret.num += tok.token;
						if (tokens.length === 0) throw "Expected top number of meter";
						tok = tokens.shift();
					}
					return ret;	// just to suppress warning
				};

				var parseFraction = function() {
					// handles this much: parseNum slash decimal
					var ret = parseNum();
					if (tokens.length === 0) return ret;
					var tok = tokens.shift();
					if (tok.token !== '/') throw "Expected slash in meter";
					tok = tokens.shift();
					if (tok.type !== 'number') throw "Expected bottom number of meter";
					ret.den = tok.token;
					ret.value = ret.value / parseInt(ret.den);
					return ret;
				};

				if (tokens.length === 0) throw "Expected meter definition in M: line";
				var meter = {type: 'specified', value: [ ]};
				var totalLength = 0;
				while (1) {
					var ret = parseFraction();
					totalLength += ret.value;
					var mv = { num: ret.num };
					if (ret.den !== undefined)
						mv.den = ret.den;
					meter.value.push(mv);
					if (tokens.length === 0) break;
					//var tok = tokens.shift();
					//if (tok.token !== '+') throw "Extra characters in M: line";
				}

				if (multilineVars.havent_set_length === true) {
					multilineVars.default_length = totalLength < 0.75 ? 0.0625 : 0.125;
				}
				return meter;
			} catch (e) {
				warn(e, line, 0);
			}
		}
		return null;
	};

	this.calcTempo = function(relTempo) {
		var dur = 1/4;
		if (multilineVars.meter && multilineVars.meter.type === 'specified') {
			dur = 1 / parseInt(multilineVars.meter.value[0].den);
		} else if (multilineVars.origMeter && multilineVars.origMeter.type === 'specified') {
			dur = 1 / parseInt(multilineVars.origMeter.value[0].den);
		}
		//var dur = multilineVars.default_length ? multilineVars.default_length : 1;
		for (var i = 0; i < relTempo.duration; i++)
			relTempo.duration[i] = dur * relTempo.duration[i];
		return relTempo;
	};

	this.resolveTempo = function() {
            if (multilineVars.tempo) {	// If there's a tempo waiting to be resolved
                this.calcTempo(multilineVars.tempo);
                tune.metaText.tempo = multilineVars.tempo;
                delete multilineVars.tempo;
            }
	};

	this.addUserDefinition = function(line, start, end) {
		var equals = line.indexOf('=', start);
		if (equals === -1) {
			warn("Need an = in a macro definition", line, start);
			return;
		}

		var before = window.ABCXJS.parse.strip(line.substring(start, equals));
		var after = window.ABCXJS.parse.strip(line.substring(equals+1));

		if (before.length !== 1) {
			warn("Macro definitions can only be one character", line, start);
			return;
		}
		var legalChars = "HIJKLMNOPQRSTUVWXYhijklmnopqrstuvw~";
		if (legalChars.indexOf(before) === -1) {
			warn("Macro definitions must be H-Y, h-w, or tilde", line, start);
			return;
		}
		if (after.length === 0) {
			warn("Missing macro definition", line, start);
			return;
		}
		if (multilineVars.macros === undefined)
			multilineVars.macros = {};
		multilineVars.macros[before] = after;
	};

	this.setDefaultLength = function(line, start, end) {
		var len = window.ABCXJS.parse.gsub(line.substring(start, end), " ", "");
		var len_arr = len.split('/');
		if (len_arr.length === 2) {
			var n = parseInt(len_arr[0]);
			var d = parseInt(len_arr[1]);
			if (d > 0) {
				multilineVars.default_length = n / d;	// a whole note is 1
				multilineVars.havent_set_length = false;
			}
		}
	};

	this.setTempo = function(line, start, end) {
		//Q - tempo; can be used to specify the notes per minute, e.g. If
		//the meter denominator is a 4 note then Q:120 or Q:C=120
		//is 120 quarter notes per minute. Similarly  Q:C3=40 would be 40
		//dotted half notes per minute. An absolute tempo may also be
		//set, e.g. Q:1/8=120 is 120 eighth notes per minute,
		//irrespective of the meter's denominator.
		//
		// This is either a number, "C=number", "Cnumber=number", or fraction [fraction...]=number
		// It depends on the M: field, which may either not be present, or may appear after this.
		// If M: is not present, an eighth note is used.
		// That means that this field can't be calculated until the end, if it is the first three types, since we don't know if we'll see an M: field.
		// So, if it is the fourth type, set it here, otherwise, save the info in the multilineVars.
		// The temporary variables we keep are the duration and the bpm. In the first two forms, the duration is 1.
		// In addition, a quoted string may both precede and follow. If a quoted string is present, then the duration part is optional.
		try {
			var tokens = tokenizer.tokenize(line, start, end);

			if (tokens.length === 0) throw "Missing parameter in Q: field";

			var tempo = {};
			var delaySet = true;
			var token = tokens.shift();
			if (token.type === 'quote') {
				tempo.preString = token.token;
				token = tokens.shift();
				if (tokens.length === 0) {	// It's ok to just get a string for the tempo
					return {type: 'immediate', tempo: tempo};
				}
			}
			if (token.type === 'alpha' && token.token === 'C')	 { // either type 2 or type 3
				if (tokens.length === 0) throw "Missing tempo after C in Q: field";
				token = tokens.shift();
				if (token.type === 'punct' && token.token === '=') {
					// This is a type 2 format. The duration is an implied 1
					if (tokens.length === 0) throw "Missing tempo after = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected number after = in Q: field";
					tempo.duration = [1];
					tempo.bpm = parseInt(token.token);
				} else if (token.type === 'number') {
					// This is a type 3 format.
					tempo.duration = [parseInt(token.token)];
					if (tokens.length === 0) throw "Missing = after duration in Q: field";
					token = tokens.shift();
					if (token.type !== 'punct' || token.token !== '=') throw "Expected = after duration in Q: field";
					if (tokens.length === 0) throw "Missing tempo after = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected number after = in Q: field";
					tempo.bpm = parseInt(token.token);
				} else throw "Expected number or equal after C in Q: field";

			} else if (token.type === 'number') {	// either type 1 or type 4
				var num = parseInt(token.token);
				if (tokens.length === 0 || tokens[0].type === 'quote') {
					// This is type 1
					tempo.duration = [1];
					tempo.bpm = num;
				} else {	// This is type 4
					delaySet = false;
					token = tokens.shift();
					if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected fraction in Q: field";
					var den = parseInt(token.token);
					tempo.duration = [num/den];
					// We got the first fraction, keep getting more as long as we find them.
					while (tokens.length > 0  && tokens[0].token !== '=' && tokens[0].type !== 'quote') {
						token = tokens.shift();
						if (token.type !== 'number') throw "Expected fraction in Q: field";
						num = parseInt(token.token);
						token = tokens.shift();
						if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
						token = tokens.shift();
						if (token.type !== 'number') throw "Expected fraction in Q: field";
						den = parseInt(token.token);
						tempo.duration.push(num/den);
					}
					token = tokens.shift();
					if (token.type !== 'punct' && token.token !== '=') throw "Expected = in Q: field";
					token = tokens.shift();
					if (token.type !== 'number') throw "Expected tempo in Q: field";
					tempo.bpm = parseInt(token.token);
				}
			} else throw "Unknown value in Q: field";
			if (tokens.length !== 0) {
				token = tokens.shift();
				if (token.type === 'quote') {
					tempo.postString = token.token;
					token = tokens.shift();
				}
				if (tokens.length !== 0) throw "Unexpected string at end of Q: field";
			}
			if (multilineVars.printTempo === false)
				tempo.suppress = true;
			return {type: delaySet?'delaySet':'immediate', tempo: tempo};
		} catch (msg) {
			warn(msg, line, start);
			return {type: 'none'};
		}
	};

	this.letter_to_inline_header = function(line, i)
	{
		var ws = tokenizer.eatWhiteSpace(line, i);
		i +=ws;
		if (line.length >= i+5 && line.charAt(i) === '[' && line.charAt(i+2) === ':') {
			var e = line.indexOf(']', i);
			switch(line.substring(i, i+3))
			{
				case "[I:":
					var err = window.ABCXJS.parse.parseDirective.addDirective(line.substring(i+3, e));
					if (err) warn(err, line, i);
					return [ e-i+1+ws ];
				case "[M:":
					var meter = this.setMeter(line.substring(i+3, e));
					if (tune.hasBeginMusic() && meter)
						tune.appendStartingElement('meter', multilineVars.currTexLineNum, -1, -1, meter);
					else
						multilineVars.meter = meter;
					return [ e-i+1+ws ];
				case "[K:":
                                        // parseKey não precisa conhecer o transposer porque a string da linha já foi transposta integralmente antes deste ponto.
					var result = window.ABCXJS.parse.parseKeyVoice.parseKey(line.substring(i+3, e) ); // flavio
					if (result.foundClef && tune.hasBeginMusic())
						tune.appendStartingElement('clef', multilineVars.currTexLineNum, -1, -1, multilineVars.clef);
					if (result.foundKey && tune.hasBeginMusic())
						tune.appendStartingElement('key', multilineVars.currTexLineNum, -1, -1, window.ABCXJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
					return [ e-i+1+ws ];
				case "[P:":
					tune.appendElement('part', multilineVars.currTexLineNum, -1, -1, {title: line.substring(i+3, e)});
					return [ e-i+1+ws ];
				case "[L:":
					this.setDefaultLength(line, i+3, e);
					return [ e-i+1+ws ];
				case "[Q:":
					if (e > 0) {
						var tempo = this.setTempo(line, i+3, e);
						if (tempo.type === 'delaySet') tune.appendElement('tempo', multilineVars.currTexLineNum, -1, -1, this.calcTempo(tempo.tempo));
						else if (tempo.type === 'immediate') tune.appendElement('tempo', multilineVars.currTexLineNum, -1, -1, tempo.tempo);
						return [ e-i+1+ws, line.charAt(i+1), line.substring(i+3, e)];
					}
					break;
				case "[V:":
					if (e > 0) {
						window.ABCXJS.parse.parseKeyVoice.parseVoice(line, i+3, e);
						//startNewLine();
						return [ e-i+1+ws, line.charAt(i+1), line.substring(i+3, e)];
					}
					break;

				default:
					// TODO: complain about unhandled header
			}
		}
		return [ 0 ];
	};

	this.letter_to_body_header = function(line, i)
	{
		if (line.length >= i+3) {
			switch(line.substring(i, i+2))
			{
				case "I:":
					var err = window.ABCXJS.parse.parseDirective.addDirective(line.substring(i+2));
					if (err) warn(err, line, i);
					return [ line.length ];
				case "M:":
					var meter = this.setMeter(line.substring(i+2));
					if (tune.hasBeginMusic() && meter)
						tune.appendStartingElement('meter', multilineVars.currTexLineNum, -1, -1, meter);
					return [ line.length ];
				case "K:":
					var result = window.ABCXJS.parse.parseKeyVoice.parseKey(line.substring(i+2), transposer);
					if (result.foundClef && tune.hasBeginMusic())
						tune.appendStartingElement('clef', multilineVars.currTexLineNum, -1, -1, multilineVars.clef);
					if (result.foundKey && tune.hasBeginMusic())
						tune.appendStartingElement('key', multilineVars.currTexLineNum, -1, -1, window.ABCXJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
					return [ line.length ];
				case "P:":
					if (tune.hasBeginMusic())
						tune.appendElement('part', multilineVars.currTexLineNum, -1, -1, {title: line.substring(i+2)});
					return [ line.length ];
				case "L:":
					this.setDefaultLength(line, i+2, line.length);
					return [ line.length ];
				case "Q:":
					var e = line.indexOf('\x12', i+2);
					if (e === -1) e = line.length;
					var tempo = this.setTempo(line, i+2, e);
					if (tempo.type === 'delaySet') tune.appendElement('tempo', multilineVars.currTexLineNum, -1, -1, this.calcTempo(tempo.tempo));
					else if (tempo.type === 'immediate') tune.appendElement('tempo', multilineVars.currTexLineNum, -1, -1, tempo.tempo);
				return [ e, line.charAt(i), window.ABCXJS.parse.strip(line.substring(i+2))];
				case "V:":
					window.ABCXJS.parse.parseKeyVoice.parseVoice(line, 2, line.length);
//						startNewLine();
					return [ line.length, line.charAt(i), window.ABCXJS.parse(line.substring(i+2))];
				default:
					// TODO: complain about unhandled header
			}
		}
		return [ 0 ];
	};

	var metaTextHeaders = {
		A: 'author',
		B: 'book',
		C: 'composer',
		D: 'discography',
		F: 'url',
		G: 'group',
		I: 'instruction',
		N: 'notes',
		O: 'origin',
		R: 'rhythm',
		S: 'source',
		W: 'unalignedWords',
		Z: 'transcription',
                X: 'pieceId'
	};

	this.parseHeader = function(line, lineNumber ) {
		if (window.ABCXJS.parse.startsWith(line, '%%')) {
			var err = window.ABCXJS.parse.parseDirective.addDirective(line.substring(2));
			if (err) warn(err, line, 2);
			return {};
		}
		line = tokenizer.stripComment(line);
		if (line.length === 0)
			return {};

		if (line.length >= 2) {
			if (line.charAt(1) === ':') {
				var nextLine = "";
				if (line.indexOf('\x12') >= 0 && line.charAt(0) !== 'w') {	// w: is the only header field that can have a continuation.
					nextLine = line.substring(line.indexOf('\x12')+1);
					line = line.substring(0, line.indexOf('\x12'));	//This handles a continuation mark on a header field
				}
				var field = metaTextHeaders[line.charAt(0)];
				if (field !== undefined) {
					if (field === 'unalignedWords')
						tune.addMetaTextArray(field, window.ABCXJS.parse.parseDirective.parseFontChangeLine(tokenizer.translateString(tokenizer.stripComment(line.substring(2)))));
					else
						tune.addMetaText(field, tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
					return {};
				} else {
					switch(line.charAt(0))
					{
						case  'H':
							tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
							multilineVars.is_in_history = true;
							break;
						case  'K':
							// since the key is the last thing that can happen in the header, we can resolve the tempo now
							this.resolveTempo();
							var result = window.ABCXJS.parse.parseKeyVoice.parseKey( line.substring(2), transposer, line, lineNumber );
							if (!multilineVars.is_in_header && tune.hasBeginMusic()) {
								if (result.foundClef) {
									tune.appendStartingElement('clef', multilineVars.currTexLineNum, -1, -1, multilineVars.clef);
                                                                    }        
								if (result.foundKey)
									tune.appendStartingElement('key', multilineVars.currTexLineNum, -1, -1, window.ABCXJS.parse.parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
							}
							multilineVars.is_in_header = false;	// The first key signifies the end of the header.
							break;
						case  'L':
							this.setDefaultLength(line, 2, line.length);
							break;
						case  'M':
							multilineVars.origMeter = multilineVars.meter = this.setMeter(line.substring(2));
							break;
						case  'P':
							// TODO-PER: There is more to do with parts, but the writer doesn't care.
							if (multilineVars.is_in_header)
								tune.addMetaText("partOrder", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
							else
								multilineVars.partForNextLine = tokenizer.translateString(tokenizer.stripComment(line.substring(2)));
							break;
						case  'Q':
							var tempo = this.setTempo(line, 2, line.length);
							if (tempo.type === 'delaySet') multilineVars.tempo = tempo.tempo;
							else if (tempo.type === 'immediate') tune.metaText.tempo = tempo.tempo;
							break;
						case  'T':
							this.setTitle(line.substring(2));
							break;
						case 'U':
							this.addUserDefinition(line, 2, line.length);
							break;
						case  'V':
							window.ABCXJS.parse.parseKeyVoice.parseVoice(line, 2, line.length);
							if (!multilineVars.is_in_header)
								return {newline: true};
							break;
						case  's':
							return {symbols: true};
						case  'f':
							return {fingering: true};
						case  'w':
							return {words: true};
						case 'E':
						case 'm':
							warn("Ignored header", line, 0);
							break;
						default:
							// It wasn't a recognized header value, so parse it as music.
							if (nextLine.length)
								nextLine = "\x12" + nextLine;
							//parseRegularMusicLine(line+nextLine);
							//nextLine = "";
							return {regular: true, str: line+nextLine};
					}
				}
				if (nextLine.length > 0)
					return {recurse: true, str: nextLine};
				return {};
			}
		}

		// If we got this far, we have a regular line of mulsic
		return {regular: true, str: line};
	};
};
/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

window.ABCXJS.parse.parseKeyVoice = {};

(function() {
	var tokenizer;
	var warn;
	var multilineVars;
	var tune;
	window.ABCXJS.parse.parseKeyVoice.initialize = function(tokenizer_, warn_, multilineVars_, tune_) {
		tokenizer = tokenizer_;
		warn = warn_;
		multilineVars = multilineVars_;
		tune = tune_;
	};

	window.ABCXJS.parse.parseKeyVoice.standardKey = function(keyName) {
            
		var key1sharp = {acc: 'sharp', note: 'f'};
		var key2sharp = {acc: 'sharp', note: 'c'};
		var key3sharp = {acc: 'sharp', note: 'g'};
		var key4sharp = {acc: 'sharp', note: 'd'};
		var key5sharp = {acc: 'sharp', note: 'A'};
		var key6sharp = {acc: 'sharp', note: 'e'};
		var key7sharp = {acc: 'sharp', note: 'B'};
		var key1flat = {acc: 'flat', note: 'B'};
		var key2flat = {acc: 'flat', note: 'e'};
		var key3flat = {acc: 'flat', note: 'A'};
		var key4flat = {acc: 'flat', note: 'd'};
		var key5flat = {acc: 'flat', note: 'G'};
		var key6flat = {acc: 'flat', note: 'c'};
		var key7flat = {acc: 'flat', note: 'F'};

		var keys = {
			'C#': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'A#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'G#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'D#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'E#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'F#Lyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],
			'B#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ],

			'F#': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'D#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'C#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'G#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'A#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'BLyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],
			'E#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp ],

			'B': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'G#m': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'F#Mix': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'C#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'D#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'ELyd': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],
			'A#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp ],

			'E': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'C#m': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'BMix': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'F#Dor': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'G#Phr': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'ALyd': [ key1sharp, key2sharp, key3sharp, key4sharp ],
			'D#Loc': [ key1sharp, key2sharp, key3sharp, key4sharp ],

			'A': [ key1sharp, key2sharp, key3sharp ],
			'F#m': [ key1sharp, key2sharp, key3sharp ],
			'EMix': [ key1sharp, key2sharp, key3sharp ],
			'BDor': [ key1sharp, key2sharp, key3sharp ],
			'C#Phr': [ key1sharp, key2sharp, key3sharp ],
			'DLyd': [ key1sharp, key2sharp, key3sharp ],
			'G#Loc': [ key1sharp, key2sharp, key3sharp ],

			'D': [ key1sharp, key2sharp ],
			'Bm': [ key1sharp, key2sharp ],
			'AMix': [ key1sharp, key2sharp ],
			'EDor': [ key1sharp, key2sharp ],
			'F#Phr': [ key1sharp, key2sharp ],
			'GLyd': [ key1sharp, key2sharp ],
			'C#Loc': [ key1sharp, key2sharp ],

			'G': [ key1sharp ],
			'Em': [ key1sharp ],
			'DMix': [ key1sharp ],
			'ADor': [ key1sharp ],
			'BPhr': [ key1sharp ],
			'CLyd': [ key1sharp ],
			'F#Loc': [ key1sharp ],

			'C': [],
			'Am': [],
			'GMix': [],
			'DDor': [],
			'EPhr': [],
			'FLyd': [],
			'BLoc': [],

			'F': [ key1flat ],
			'Dm': [ key1flat ],
			'CMix': [ key1flat ],
			'GDor': [ key1flat ],
			'APhr': [ key1flat ],
			'BbLyd': [ key1flat ],
			'ELoc': [ key1flat ],

			'Bb': [ key1flat, key2flat ],
			'Gm': [ key1flat, key2flat ],
			'FMix': [ key1flat, key2flat ],
			'CDor': [ key1flat, key2flat ],
			'DPhr': [ key1flat, key2flat ],
			'EbLyd': [ key1flat, key2flat ],
			'ALoc': [ key1flat, key2flat ],

			'Eb': [ key1flat, key2flat, key3flat ],
			'Cm': [ key1flat, key2flat, key3flat ],
			'BbMix': [ key1flat, key2flat, key3flat ],
			'FDor': [ key1flat, key2flat, key3flat ],
			'GPhr': [ key1flat, key2flat, key3flat ],
			'AbLyd': [ key1flat, key2flat, key3flat ],
			'DLoc': [ key1flat, key2flat, key3flat ],

			'Ab': [ key1flat, key2flat, key3flat, key4flat ],
			'Fm': [ key1flat, key2flat, key3flat, key4flat ],
			'EbMix': [ key1flat, key2flat, key3flat, key4flat ],
			'BbDor': [ key1flat, key2flat, key3flat, key4flat ],
			'CPhr': [ key1flat, key2flat, key3flat, key4flat ],
			'DbLyd': [ key1flat, key2flat, key3flat, key4flat ],
			'GLoc': [ key1flat, key2flat, key3flat, key4flat ],

			'Db': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'Bbm': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'AbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'EbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'FPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'GbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat ],
			'CLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat ],

			'Gb': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'Ebm': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'DbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'AbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'BbPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'CbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],
			'FLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat ],

			'Cb': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'Abm': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'GbMix': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'DbDor': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'EbPhr': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'FbLyd': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],
			'BbLoc': [ key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat ],

			// The following are not in the 2.0 spec, but seem normal enough.
			// TODO-PER: These SOUND the same as what's written, but they aren't right
			'A#': [ key1flat, key2flat ],
			'B#': [],
			'D#': [ key1flat, key2flat, key3flat ],
			'E#': [ key1flat ],
			'G#': [ key1flat, key2flat, key3flat, key4flat ],
			'Gbm': [ key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp ]
		};

		return keys[keyName];
	};

	var clefLines = {
		'accordionTab': { clef: 'accordionTab', pitch: 7.5, mid: 0 },
		'treble': { clef: 'treble', pitch: 4, mid: 0 },
		'treble+8': { clef: 'treble+8', pitch: 4, mid: 0 },
		'treble-8': { clef: 'treble-8', pitch: 4, mid: 0 },
		'treble1': { clef: 'treble', pitch: 2, mid: 2 },
		'treble2': { clef: 'treble', pitch: 4, mid: 0 },
		'treble3': { clef: 'treble', pitch: 6, mid: -2 },
		'treble4': { clef: 'treble', pitch: 8, mid: -4 },
		'treble5': { clef: 'treble', pitch: 10, mid: -6 },
		'perc': { clef: 'perc', pitch: 6, mid: 0 },
		'none': { clef: 'none', mid: 0 },
		'bass': { clef: 'bass', pitch: 8, mid: -12 },
		'bass+8': { clef: 'bass+8', pitch: 8, mid: -12 },
		'bass-8': { clef: 'bass-8', pitch: 8, mid: -12 },
		'bass+16': { clef: 'bass', pitch: 8, mid: -12 },
		'bass-16': { clef: 'bass', pitch: 8, mid: -12 },
		'bass1': { clef: 'bass', pitch: 2, mid: -6 },
		'bass2': { clef: 'bass', pitch: 4, mid: -8 },
		'bass3': { clef: 'bass', pitch: 6, mid: -10 },
		'bass4': { clef: 'bass', pitch: 8, mid: -12 },
		'bass5': { clef: 'bass', pitch: 10, mid: -14 },
		'tenor': { clef: 'alto', pitch: 8, mid: -8 },
		'tenor1': { clef: 'alto', pitch: 2, mid: -2 },
		'tenor2': { clef: 'alto', pitch: 4, mid: -4 },
		'tenor3': { clef: 'alto', pitch: 6, mid: -6 },
		'tenor4': { clef: 'alto', pitch: 8, mid: -8 },
		'tenor5': { clef: 'alto', pitch: 10, mid: -10 },
		'alto': { clef: 'alto', pitch: 6, mid: -6 },
		'alto1': { clef: 'alto', pitch: 2, mid: -2 },
		'alto2': { clef: 'alto', pitch: 4, mid: -4 },
		'alto3': { clef: 'alto', pitch: 6, mid: -6 },
		'alto4': { clef: 'alto', pitch: 8, mid: -8 },
		'alto5': { clef: 'alto', pitch: 10, mid: -10 },
		'alto+8': { clef: 'alto+8', pitch: 6, mid: -6 },
		'alto-8': { clef: 'alto-8', pitch: 6, mid: -6 }
	};

	var calcMiddle = function(clef, oct) {
		var value = clefLines[clef];
		var mid = value ? value.mid : 0;
		return mid+oct;
	};

	window.ABCXJS.parse.parseKeyVoice.fixClef = function(clef) {
		var value = clefLines[clef.type];
		if (value) {
			clef.clefPos = value.pitch;
			clef.type = value.clef;
		}
	};

	window.ABCXJS.parse.parseKeyVoice.deepCopyKey = function(key) {
		var ret = { accidentals: [], root: key.root, acc: key.acc, mode: key.mode };
		window.ABCXJS.parse.each(key.accidentals, function(k) {
		ret.accidentals.push(window.ABCXJS.parse.clone(k));
		});
		return ret;
	};

	var pitches = {A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11};

	window.ABCXJS.parse.parseKeyVoice.addPosToKey = function(clef, key) {
		// Shift the key signature from the treble positions to whatever position is needed for the clef.
		// This may put the key signature unnaturally high or low, so if it does, then shift it.
		var mid = clef.verticalPos;
		window.ABCXJS.parse.each(key.accidentals, function(acc) {
			var pitch = pitches[acc.note];
			pitch = pitch - mid;
			acc.verticalPos = pitch;
		});
		if (key.impliedNaturals)
			window.ABCXJS.parse.each(key.impliedNaturals, function(acc) {
				var pitch = pitches[acc.note];
				pitch = pitch - mid;
				acc.verticalPos = pitch;
			});

		if (mid < -10) {
			window.ABCXJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos -= 7;
				if (acc.verticalPos >= 11 || (acc.verticalPos === 10 && acc.acc === 'flat'))
					acc.verticalPos -= 7;
				if (acc.note === 'A' && acc.acc === 'sharp' )
					acc.verticalPos -=7;
				if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat' )
					acc.verticalPos -=7;
			});
			if (key.impliedNaturals)
				window.ABCXJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos -= 7;
					if (acc.verticalPos >= 11 || (acc.verticalPos === 10 && acc.acc === 'flat'))
						acc.verticalPos -= 7;
					if (acc.note === 'A' && acc.acc === 'sharp' )
						acc.verticalPos -=7;
					if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat' )
						acc.verticalPos -=7;
				});
		} else if (mid < -4) {
			window.ABCXJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos -= 7;
				if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp' )
					acc.verticalPos -=7;
			});
			if (key.impliedNaturals)
				window.ABCXJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos -= 7;
					if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp' )
						acc.verticalPos -=7;
				});
		} else if (mid >= 7) {
			window.ABCXJS.parse.each(key.accidentals, function(acc) {
				acc.verticalPos += 7;
			});
			if (key.impliedNaturals)
				window.ABCXJS.parse.each(key.impliedNaturals, function(acc) {
					acc.verticalPos += 7;
				});
		}
	};

	window.ABCXJS.parse.parseKeyVoice.fixKey = function(clef, key) {
		var fixedKey = window.ABCXJS.parse.clone(key);
		window.ABCXJS.parse.parseKeyVoice.addPosToKey(clef, fixedKey);
		return fixedKey;
	};

	var parseMiddle = function(str) {
	  var mid = pitches[str.charAt(0)];
		for (var i = 1; i < str.length; i++) {
			if (str.charAt(i) === ',') mid -= 7;
			else if (str.charAt(i) === ',') mid += 7;
			else break;
		}
		return { mid: mid - 6, str: str.substring(i) };	// We get the note in the middle of the staff. We want the note that appears as the first ledger line below the staff.
	};

	var normalizeAccidentals = function(accs) {
		for (var i = 0; i < accs.length; i++) {
			if (accs[i].note === 'b')
				accs[i].note = 'B';
			else if (accs[i].note === 'a')
				accs[i].note = 'A';
			else if (accs[i].note === 'F')
				accs[i].note = 'f';
			else if (accs[i].note === 'E')
				accs[i].note = 'e';
			else if (accs[i].note === 'D')
				accs[i].note = 'd';
			else if (accs[i].note === 'C')
				accs[i].note = 'c';
			else if (accs[i].note === 'G' && accs[i].acc === 'sharp')
				accs[i].note = 'g';
			else if (accs[i].note === 'g' && accs[i].acc === 'flat')
				accs[i].note = 'G';
		}
	};

	window.ABCXJS.parse.parseKeyVoice.parseKey = function( str, transposer, line, lineNumber )
	{
		// returns:
		//		{ foundClef: true, foundKey: true }
		// Side effects:
		//		calls warn() when there is a syntax error
		//		sets these members of multilineVars:
		//			clef
		//			key
		//			style
		//
		// The format is:
		// K: [<key>] [<modifiers>*]
		// modifiers are any of the following in any order:
		//  [<clef>] [middle=<pitch>] [transpose=[-]<number>] [stafflines=<number>] [staffscale=<number>][style=<style>]
		// key is none|HP|Hp|<specified_key>
		// clef is [clef=] [<clef type>] [<line number>] [+8|-8]
		// specified_key is <pitch>[#|b][mode(first three chars are significant)][accidentals*]
		if (str.length === 0) {
			// an empty K: field is the same as K:none
			str = 'none';
		}
		var tokens = tokenizer.tokenize(str, 0, str.length);
		var ret = {};

		// first the key
		switch (tokens[0].token) {
			case 'HP':
				window.ABCXJS.parse.parseDirective.addDirective("bagpipes");
				multilineVars.key = { root: "HP", accidentals: [], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			case 'Hp':
				window.ABCXJS.parse.parseDirective.addDirective("bagpipes");
				multilineVars.key = { root: "Hp", accidentals: [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			case 'none':
				// we got the none key - that's the same as C to us
				multilineVars.key = { root: "none", accidentals: [], acc: "", mode: "" };
				ret.foundKey = true;
				tokens.shift();
				break;
			default:
                                if( transposer ) {
                                    tokens = transposer.transposeKey( str, line, lineNumber );
                                }    
                                
				var retPitch = tokenizer.getKeyPitch(tokens[0].token);
				if (retPitch.len > 0) {
					ret.foundKey = true;
					var acc = "";
					var mode = "";
					// The accidental and mode might be attached to the pitch, so we might want to just remove the first character.
					if (tokens[0].token.length > 1)
						tokens[0].token = tokens[0].token.substring(1);
					else
						tokens.shift();
					var key = retPitch.token;
					// We got a pitch to start with, so we might also have an accidental and a mode
					if (tokens.length > 0) {
						var retAcc = tokenizer.getSharpFlat(tokens[0].token);
						if (retAcc.len > 0) {
							if (tokens[0].token.length > 1)
								tokens[0].token = tokens[0].token.substring(1);
							else
								tokens.shift();
							key += retAcc.token;
							acc = retAcc.token;
						}
						if (tokens.length > 0) {
							var retMode = tokenizer.getMode(tokens[0].token);
							if (retMode.len > 0) {
								tokens.shift();
								key += retMode.token;
								mode = retMode.token;
							}
						}
					}
					// We need to do a deep copy because we are going to modify it
					var oldKey = window.ABCXJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
					multilineVars.key = window.ABCXJS.parse.parseKeyVoice.deepCopyKey({accidentals: window.ABCXJS.parse.parseKeyVoice.standardKey(key)});
					multilineVars.key.root = retPitch.token;
					multilineVars.key.acc = acc;
					multilineVars.key.mode = mode;
					if (oldKey) {
						// Add natural in all places that the old key had an accidental.
						var kk;
						for (var k = 0; k < multilineVars.key.accidentals.length; k++) {
							for (kk = 0; kk < oldKey.accidentals.length; kk++) {
								if (oldKey.accidentals[kk].note && multilineVars.key.accidentals[k].note.toLowerCase() === oldKey.accidentals[kk].note.toLowerCase())
									oldKey.accidentals[kk].note = null;
							}
						}
						for (kk = 0; kk < oldKey.accidentals.length; kk++) {
							if (oldKey.accidentals[kk].note) {
								if (!multilineVars.key.impliedNaturals)
									multilineVars.key.impliedNaturals = [];
								multilineVars.key.impliedNaturals.push({ acc: 'natural', note: oldKey.accidentals[kk].note });
							}
						}
					}
				}
				break;
		}

		// There are two special cases of deprecated syntax. Ignore them if they occur
		if (tokens.length === 0) return ret;
		if (tokens[0].token === 'exp') tokens.shift();
		if (tokens.length === 0) return ret;
		if (tokens[0].token === 'oct') tokens.shift();

		// now see if there are extra accidentals
		if (tokens.length === 0) return ret;
		var accs = tokenizer.getKeyAccidentals2(tokens);
		if (accs.warn)
			warn(accs.warn, str, 0);
		// If we have extra accidentals, first replace ones that are of the same pitch before adding them to the end.
		if (accs.accs) {
			if (!ret.foundKey) {		// if there are only extra accidentals, make sure this is set.
				ret.foundKey = true;
				multilineVars.key = { root: "none", acc: "", mode: "", accidentals: [] };
			}
			normalizeAccidentals(accs.accs);
			for (var i = 0; i < accs.accs.length; i++) {
				var found = false;
				for (var j = 0; j < multilineVars.key.accidentals.length && !found; j++) {
					if (multilineVars.key.accidentals[j].note === accs.accs[i].note) {
						found = true;
						multilineVars.key.accidentals[j].acc = accs.accs[i].acc;
					}
				}
				if (!found) {
					multilineVars.key.accidentals.push(accs.accs[i]);
					if (multilineVars.key.impliedNaturals) {
						for (var kkk = 0; kkk < multilineVars.key.impliedNaturals.length; kkk++) {
							if (multilineVars.key.impliedNaturals[kkk].note === accs.accs[i].note)
								multilineVars.key.impliedNaturals.splice(kkk, 1);
						}
					}
				}
			}
		}

		// Now see if any optional parameters are present. They have the form "key=value", except that "clef=" is optional
		var token;
		while (tokens.length > 0) {
			switch (tokens[0].token) {
				case "m":
				case "middle":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after middle", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after middle", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after middle=", str, 0); return ret; }
					var pitch = tokenizer.getPitchFromTokens(tokens);
					if (pitch.warn)
						warn(pitch.warn, str, 0);
					if (pitch.position)
						multilineVars.clef.verticalPos = pitch.position - 6;	// we get the position from the middle line, but want to offset it to the first ledger line.
					break;
				case "transpose":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after transpose", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after transpose", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after transpose=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after transpose", str, tokens[0].start); break; }
					multilineVars.clef.transpose = tokens[0].intt;
					tokens.shift();
					break;
				case "stafflines":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after stafflines", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after stafflines", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after stafflines=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after stafflines", str, tokens[0].start); break; }
					multilineVars.clef.stafflines = tokens[0].intt;
					tokens.shift();
					break;
				case "staffscale":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after staffscale", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after staffscale", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after staffscale=", str, 0); return ret; }
					if (tokens[0].type !== 'number') { warn("Expected number after staffscale", str, tokens[0].start); break; }
					multilineVars.clef.staffscale = tokens[0].floatt;
					tokens.shift();
					break;
				case "style":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after style", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after style", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after style=", str, 0); return ret; }
					switch (tokens[0].token) {
						case "normal":
						case "harmonic":
						case "rhythm":
						case "x":
							multilineVars.style = tokens[0].token;
							tokens.shift();
							break;
						default:
							warn("error parsing style element: " + tokens[0].token, str, tokens[0].start);
							break;
					}
					break;
				case "clef":
					tokens.shift();
					if (tokens.length === 0) { warn("Expected = after clef", str, 0); return ret; }
					token = tokens.shift();
					if (token.token !== "=") { warn("Expected = after clef", str, token.start); break; }
					if (tokens.length === 0) { warn("Expected parameter after clef=", str, 0); return ret; }
					//break; yes, we want to fall through. That allows "clef=" to be optional.
				case "treble":
                                case "accordionTab":
				case "bass":
				case "alto":
				case "tenor":
				case "perc":
					// clef is [clef=] [clef type] [line number] [+8|-8]
					var clef = tokens.shift();
					switch (clef.token) {
						case 'treble':
						case 'tenor':
						case 'alto':
						case 'bass':
						case 'perc':
						case 'none':
							break;
                                                case 'accordionTab': clef.token = 'accordionTab'; break;						case 'C': clef.token = 'alto'; break;
						case 'F': clef.token = 'bass'; break;
						case 'G': clef.token = 'treble'; break;
						case 'c': clef.token = 'alto'; break;
						case 'f': clef.token = 'bass'; break;
						case 'g': clef.token = 'treble'; break;
						default:
							warn("Expected clef name. Found " + clef.token, str, clef.start);
							break;
					}
					if (tokens.length > 0 && tokens[0].type === 'number') {
						clef.token += tokens[0].token;
						tokens.shift();
					}
					if (tokens.length > 1 && (tokens[0].token === '-' || tokens[0].token === '+') && tokens[1].token === '8') {
						clef.token += tokens[0].token + tokens[1].token;
						tokens.shift();
						tokens.shift();
					}
					multilineVars.clef = {type: clef.token, verticalPos: calcMiddle(clef.token, 0)};
					ret.foundClef = true;
					break;
				default:
					warn("Unknown parameter: " + tokens[0].token, str, tokens[0].start);
					tokens.shift();
			}
		}
		return ret;
	};

	var setCurrentVoice = function(id) {
		multilineVars.currentVoice = multilineVars.voices[id];
                //multilineVars.clef = multilineVars.currentVoice.clef;
		tune.setCurrentVoice(multilineVars.currentVoice.staffNum, multilineVars.currentVoice.index);
	};

	window.ABCXJS.parse.parseKeyVoice.parseVoice = function(line, i, e) {
		//First truncate the string to the first non-space character after V: through either the
		//end of the line or a % character. Then remove trailing spaces, too.
		var ret = tokenizer.getMeat(line, i, e);
		var start = ret.start;
		var end = ret.end;
		//The first thing on the line is the ID. It can be any non-space string and terminates at the
		//first space.
		var id = tokenizer.getToken(line, start, end);
		if (id.length === 0) {
			warn("Expected a voice id", line, start);
			return;
		}
		var isNew = false;
		if (multilineVars.voices[id] === undefined) {
                    multilineVars.voices[id] = {currBarNumber:1};
                    isNew = true;
                    if (multilineVars.score_is_present && id.toLowerCase().substr(0,3) !== "tab")
                            warn("Can't have an unknown V: id when the %score directive is present", line, start);
                }
//		} else {
//                    //multilineVars.clef = multilineVars.staves[ multilineVars.voices[id].staffNum].clef;
//                    multilineVars.clef = multilineVars.voices[id].clef;
//                }
		start += id.length;
		start += tokenizer.eatWhiteSpace(line, start);

		var staffInfo = {startStaff: isNew};
		var addNextTokenToStaffInfo = function(name) {
			var attr = tokenizer.getVoiceToken(line, start, end);
			if (attr.warn !== undefined)
				warn("Expected value for " + name + " in voice: " + attr.warn, line, start);
			else if (attr.token.length === 0 && line.charAt(start) !== '"')
				warn("Expected value for " + name + " in voice", line, start);
			else
				staffInfo[name] = attr.token;
			start += attr.len;
		};
		var addNextTokenToVoiceInfo = function(id, name, type) {
			var attr = tokenizer.getVoiceToken(line, start, end);
			if (attr.warn !== undefined)
				warn("Expected value for " + name + " in voice: " + attr.warn, line, start);
			else if (attr.token.length === 0 && line.charAt(start) !== '"')
				warn("Expected value for " + name + " in voice", line, start);
			else {
				if (type === 'number')
					attr.token = parseFloat(attr.token);
				multilineVars.voices[id][name] = attr.token;
			}
			start += attr.len;
		};

		//Then the following items can occur in any order:
		while (start < end) {
			var token = tokenizer.getVoiceToken(line, start, end);
			start += token.len;

			if (token.warn) {
				warn("Error parsing voice: " + token.warn, line, start);
			} else {
				var attr = null;
				switch (token.token) {
					case 'clef':
					case 'cl':
						addNextTokenToStaffInfo('clef');
						// TODO-PER: check for a legal clef; do octavizing
						var oct = 0;    
	//							for (var ii = 0; ii < staffInfo.clef.length; ii++) {
	//								if (staffInfo.clef[ii] === ',') oct -= 7;
	//								else if (staffInfo.clef[ii] === "'") oct += 7;
	//							}
						if (staffInfo.clef !== undefined) {
                                                    staffInfo.clef = staffInfo.clef.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp
                                                    if (staffInfo.clef.indexOf('+16') !== -1) {
                                                        oct += 14;
                                                        staffInfo.clef = staffInfo.clef.replace('+16', '');
                                                    }
                                                    staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct);
                                                    multilineVars.clef = {type: staffInfo.clef, verticalPos: staffInfo.verticalPos};
                                                    multilineVars.voices[id].clef = {type: staffInfo.clef, verticalPos: staffInfo.verticalPos};
                                                    //multilineVars.currentVoice.clef = multilineVars.voices[id].clef; 
                                                    
						}
						break;
                                        case 'accordionTab':
					case 'treble':
					case 'bass':
					case 'tenor':
					case 'alto':
					case 'none':
					case 'treble\'':
					case 'bass\'':
					case 'tenor\'':
					case 'alto\'':
					case 'none\'':
					case 'treble\'\'':
					case 'bass\'\'':
					case 'tenor\'\'':
					case 'alto\'\'':
					case 'none\'\'':
					case 'treble,':
					case 'bass,':
					case 'tenor,':
					case 'alto,':
					case 'none,':
					case 'treble,,':
					case 'bass,,':
					case 'tenor,,':
					case 'alto,,':
					case 'none,,':
						// TODO-PER: handle the octave indicators on the clef by changing the middle property
						var oct2 = 0;
						staffInfo.clef = token.token.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp
						staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct2);
                                                multilineVars.clef = {type: staffInfo.clef, verticalPos: staffInfo.verticalPos};
                                                multilineVars.voices[id].clef = multilineVars.clef; 
						break;
					case 'staves':
					case 'stave':
					case 'stv':
						addNextTokenToStaffInfo('staves');
						break;
					case 'brace':
					case 'brc':
						addNextTokenToStaffInfo('brace');
						break;
					case 'bracket':
					case 'brk':
						addNextTokenToStaffInfo('bracket');
						break;
					case 'name':
					case 'nm':
						addNextTokenToStaffInfo('name');
						break;
					case 'subname':
					case 'sname':
					case 'snm':
						addNextTokenToStaffInfo('subname');
						break;
					case 'merge':
						staffInfo.startStaff = false;
						break;
					case 'stem':
					case 'stems':
						attr = tokenizer.getVoiceToken(line, start, end);
						if (attr.warn !== undefined)
							warn("Expected value for stems in voice: " + attr.warn, line, start);
						else if (attr.token === 'up' || attr.token === 'down')
							multilineVars.voices[id].stem = attr.token;
						else
							warn("Expected up or down for voice stem", line, start);
						start += attr.len;
						break;
					case 'up':
					case 'down':
						multilineVars.voices[id].stem = token.token;
						break;
					case 'middle':
					case 'm':
						addNextTokenToStaffInfo('verticalPos');
						staffInfo.verticalPos = parseMiddle(staffInfo.verticalPos).mid;
						break;
					case 'gchords':
					case 'gch':
						multilineVars.voices[id].suppressChords = true;
						break;
					case 'space':
					case 'spc':
						addNextTokenToStaffInfo('spacing');
						break;
					case 'scale':
						addNextTokenToVoiceInfo(id, 'scale', 'number');
						break;
					case 'transpose':
						addNextTokenToVoiceInfo(id, 'transpose', 'number');
						break;
                                        default:
                                                warn("Error parsing voice. Unknown token: " + token.token, line, start);

				}
			}
			start += tokenizer.eatWhiteSpace(line, start);
		}

		// now we've filled up staffInfo, figure out what to do with this voice
		// TODO-PER: It is unclear from the standard and the examples what to do with brace, bracket, and staves, so they are ignored for now.
		if (staffInfo.startStaff || multilineVars.staves.length === 0) {
			multilineVars.staves.push({index: multilineVars.staves.length, meter: multilineVars.origMeter, inEnding : [false], inTie : [false], inTieChord : [{}] });
			if (!multilineVars.score_is_present)
				multilineVars.staves[multilineVars.staves.length-1].numVoices = 0;
		}
		if (multilineVars.voices[id].staffNum === undefined) {
			// store where to write this for quick access later.
			multilineVars.voices[id].staffNum = multilineVars.staves.length-1;
			var vi = 0;
			for(var v in multilineVars.voices) {
				if(multilineVars.voices.hasOwnProperty(v)) {
					if (multilineVars.voices[v].staffNum === multilineVars.voices[id].staffNum)
						vi++;
				}
			}
			multilineVars.voices[id].index = vi-1;
		}
		var s = multilineVars.staves[multilineVars.voices[id].staffNum];
		if (!multilineVars.score_is_present)
			s.numVoices++;
		if (staffInfo.clef) s.clef = {type: staffInfo.clef, verticalPos: staffInfo.verticalPos};
		if (staffInfo.spacing) s.spacing_below_offset = staffInfo.spacing;
		if (staffInfo.verticalPos) s.verticalPos = staffInfo.verticalPos;

		if (staffInfo.name) {if (s.name) s.name.push(staffInfo.name); else s.name = [ staffInfo.name ];}
		if (staffInfo.subname) {if (s.subname) s.subname.push(staffInfo.subname); else s.subname = [ staffInfo.subname ];}

		setCurrentVoice(id);
	};

})();

//    abc_tokenizer.js: tokenizes an ABC Music Notation string to support abc_parse.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

// this is a series of functions that get a particular element out of the passed stream.
// the return is the number of characters consumed, so 0 means that the element wasn't found.
// also returned is the element found. This may be a different length because spaces may be consumed that aren't part of the string.
// The return structure for most calls is { len: num_chars_consumed, token: str }
window.ABCXJS.parse.tokenizer = function() {
	this.skipWhiteSpace = function(str) {
		for (var i = 0; i < str.length; i++) {
		  if (!this.isWhiteSpace(str.charAt(i)))
				return i;
		}
		return str.length;	// It must have been all white space
	};
	var finished = function(str, i) {
		return i >= str.length;
	};
	this.eatWhiteSpace = function(line, index) {
		for (var i = index; i < line.length; i++) {
		  if (!this.isWhiteSpace(line.charAt(i)))
				return i-index;
		}
		return i-index;
	};

	// This just gets the basic pitch letter, ignoring leading spaces, and normalizing it to a capital
	this.getKeyPitch = function(str) {
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		switch (str.charAt(i)) {
			case 'A':return {len: i+1, token: 'A'};
			case 'B':return {len: i+1, token: 'B'};
			case 'C':return {len: i+1, token: 'C'};
			case 'D':return {len: i+1, token: 'D'};
			case 'E':return {len: i+1, token: 'E'};
			case 'F':return {len: i+1, token: 'F'};
			case 'G':return {len: i+1, token: 'G'};
		}
		return {len: 0};
	};

	// This just gets the basic accidental, ignoring leading spaces, and only the ones that appear in a key
	this.getSharpFlat = function(str) {
		if (str === 'bass')
			return {len: 0};
		switch (str.charAt(0)) {
			case '#':return {len: 1, token: '#'};
			case 'b':return {len: 1, token: 'b'};
		}
		return {len: 0};
	};

	this.getMode = function(str) {
		var skipAlpha = function(str, start) {
			// This returns the index of the next non-alphabetic char, or the entire length of the string if not found.
		  while (start < str.length && ((str.charAt(start) >= 'a' && str.charAt(start) <= 'z') || (str.charAt(start) >= 'A' && str.charAt(start) <= 'Z')))
				start++;
			return start;
		};

		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		var firstThree = str.substring(i,i+3).toLowerCase();
		if (firstThree.length > 1 && firstThree.charAt(1) === ' ' || firstThree.charAt(1) === '^' || firstThree.charAt(1) === '_' || firstThree.charAt(1) === '=') firstThree = firstThree.charAt(0);	// This will handle the case of 'm'
		switch (firstThree) {
			case 'mix':return {len: skipAlpha(str, i), token: 'Mix'};
			case 'dor':return {len: skipAlpha(str, i), token: 'Dor'};
			case 'phr':return {len: skipAlpha(str, i), token: 'Phr'};
			case 'lyd':return {len: skipAlpha(str, i), token: 'Lyd'};
			case 'loc':return {len: skipAlpha(str, i), token: 'Loc'};
			case 'aeo':return {len: skipAlpha(str, i), token: 'm'};
			case 'maj':return {len: skipAlpha(str, i), token: ''};
			case 'ion':return {len: skipAlpha(str, i), token: ''};
			case 'min':return {len: skipAlpha(str, i), token: 'm'};
			case 'm':return {len: skipAlpha(str, i), token: 'm'};
		}
		return {len: 0};
	};

	this.getClef = function(str, bExplicitOnly) {
		var strOrig = str;
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		// The word 'clef' is optional, but if it appears, a clef MUST appear
		var needsClef = false;
		var strClef = str.substring(i);
		if (window.ABCXJS.parse.startsWith(strClef, 'clef=')) {
			needsClef = true;
			strClef = strClef.substring(5);
			i += 5;
		}
		if (strClef.length === 0 && needsClef)
			return {len: i+5, warn: "No clef specified: " + strOrig};

		var j = this.skipWhiteSpace(strClef);
		if (finished(strClef, j))
			return {len: 0};
		if (j > 0) {
			i += j;
			strClef = strClef.substring(j);
		}
		var name = null;
		if (window.ABCXJS.parse.startsWith(strClef, 'treble'))
			name = 'treble';
		else if (window.ABCXJS.parse.startsWith(strClef, 'bass3'))
			name = 'bass3';
		else if (window.ABCXJS.parse.startsWith(strClef, 'bass'))
			name = 'bass';
		else if (window.ABCXJS.parse.startsWith(strClef, 'tenor'))
			name = 'tenor';
		else if (window.ABCXJS.parse.startsWith(strClef, 'alto2'))
			name = 'alto2';
		else if (window.ABCXJS.parse.startsWith(strClef, 'alto1'))
			name = 'alto1';
		else if (window.ABCXJS.parse.startsWith(strClef, 'alto'))
			name = 'alto';
		else if (!bExplicitOnly && (needsClef && window.ABCXJS.parse.startsWith(strClef, 'none')))
			name = 'none';
		else if (window.ABCXJS.parse.startsWith(strClef, 'perc'))
			name = 'perc';
		else if (!bExplicitOnly && (needsClef && window.ABCXJS.parse.startsWith(strClef, 'C')))
			name = 'tenor';
		else if (!bExplicitOnly && (needsClef && window.ABCXJS.parse.startsWith(strClef, 'F')))
			name = 'bass';
		else if (!bExplicitOnly && (needsClef && window.ABCXJS.parse.startsWith(strClef, 'G')))
			name = 'treble';
		else
			return {len: i+5, warn: "Unknown clef specified: " + strOrig};

		strClef = strClef.substring(name.length);
		j = this.isMatch(strClef, '+8');
		if (j > 0)
			name += "+8";
		else {
			j = this.isMatch(strClef, '-8');
			if (j > 0)
				name += "-8";
		}
		return {len: i+name.length, token: name, explicit: needsClef};
	};

	// This returns one of the legal bar lines
	// This is called alot and there is no obvious tokenable items, so this is broken apart.
    this.getBarLine = function(line, i ){
		//var bn = this.getBarLine_original(line, i);
		var bn = ABCXJS.parse.getBarLine(line, i);  

		// originalmente não havia informação sobre quantidade de repeticoes
		if( ! bn.repeat ) {
           bn.repeat = 1;
		}

		return bn;

	}
/*
	this.getBarLine_original = function(line, i) {
		switch (line.charAt(i)) {
			case ']':
				++i;
				switch (line.charAt(i)) {
					case '|': return {len: 2, token: "bar_thick_thin"};
					case '[':
						++i;
						if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
							return {len: 2, token: "bar_invisible"};
						return {len: 1, warn: "Unknown bar symbol"};
					default:
						return {len: 1, token: "bar_invisible"};
				}
				break;
			case ':':
				++i;
				switch (line.charAt(i)) {
					case ':': return {len: 2, token: "bar_dbl_repeat"};
					case '|':	// :|
						++i;
						switch (line.charAt(i)) {
							case ']':	// :|]
								++i;
								switch (line.charAt(i)) {
									case '|':	// :|]|
										++i;
										if (line.charAt(i) === ':')  return {len: 5, token: "bar_dbl_repeat"};
										return {len: 3, token: "bar_right_repeat"};
									default:
										return {len: 3, token: "bar_right_repeat"};
								}
								break;
							case ':':	// :|:
								return {len: 3, token: "bar_dbl_repeat"};
							case '|':	// :||
								++i;
								if (line.charAt(i) === ':')  return {len: 4, token: "bar_dbl_repeat"};
								return {len: 3, token: "bar_right_repeat"};
							default:
								return {len: 2, token: "bar_right_repeat"};
						}
						break;
					default:
						return {len: 1, warn: "Unknown bar symbol"};
				}
				break;
			case '[':	// [
				++i;
				if (line.charAt(i) === '|') {	// [|
					++i;
					switch (line.charAt(i)) {
						case ':': return {len: 3, token: "bar_left_repeat"};
						case ']': return {len: 3, token: "bar_invisible"};
						default: return {len: 2, token: "bar_thick_thin"};
					}
				} else {
					if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
						return {len: 1, token: "bar_invisible"};
					return {len: 0};
				}
				break;
			case '|':	// |
				++i;
				switch (line.charAt(i)) {
					case ']': return {len: 2, token: "bar_thin_thick"};
					case '|': // ||
						++i;
						if (line.charAt(i) === ':') return {len: 3, token: "bar_left_repeat"};
						return {len: 2, token: "bar_thin_thin"};
					case ':':	// |:
						var colons = 0;
						while (line.charAt(i+colons) === ':') colons++;
						return { len: 1+colons, token: "bar_left_repeat"};
					default: return {len: 1, token: "bar_thin"};
				}
				break;
		}
		return {len: 0};
	};
*/

	// this returns all the characters in the string that match one of the characters in the legalChars string
	this.getTokenOf = function(str, legalChars) {
		for (var i = 0; i < str.length; i++) {
			if (legalChars.indexOf(str.charAt(i)) < 0)
				return {len: i, token: str.substring(0, i)};
		}
		return {len: i, token: str};
	};

	this.getToken = function(str, start, end) {
		// This returns the next set of chars that doesn't contain spaces
		var i = start;
		while (i < end && !this.isWhiteSpace(str.charAt(i)))
			i++;
		return str.substring(start, i);
	};

	// This just sees if the next token is the word passed in, with possible leading spaces
	this.isMatch = function(str, match) {
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return 0;
		if (window.ABCXJS.parse.startsWith(str.substring(i), match))
			return i+match.length;
		return 0;
	};

	this.getPitchFromTokens = function(tokens) {
		var ret = { };
		var pitches = ABCXJS.parse.pitches;
		ret.position = pitches[tokens[0].token];
		if (ret.position === undefined)
			return { warn: "Pitch expected. Found: " + tokens[0].token };
		tokens.shift();
		while (tokens.length) {
			switch (tokens[0].token) {
				case ',': ret.position -= 7; tokens.shift(); break;
				case '\'': ret.position += 7; tokens.shift(); break;
				default: return ret;
			}
		}
		return ret;
	};

	this.getKeyAccidentals2 = function(tokens) {
		var accs;
		// find and strip off all accidentals in the token list
		while (tokens.length > 0) {
			var acc;
			if (tokens[0].token === '^') {
				acc = 'sharp';
				tokens.shift();
				if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
				switch (tokens[0].token) {
					case '^': acc = 'dblsharp'; tokens.shift(); break;
					case '/': acc = 'quartersharp'; tokens.shift(); break;
				}
			} else if (tokens[0].token === '=') {
				acc = 'natural';
				tokens.shift();
			} else if (tokens[0].token === '_') {
				acc = 'flat';
				tokens.shift();
				if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
				switch (tokens[0].token) {
					case '_': acc = 'dblflat'; tokens.shift(); break;
					case '/': acc = 'quarterflat'; tokens.shift(); break;
				}
			} else {
				// Not an accidental, we'll assume that a later parse will recognize it.
				return { accs: accs };
			}
			if (tokens.length === 0) return {accs: accs, warn: 'Expected note name after ' + acc};
			switch (tokens[0].token.charAt(0))
			{
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case 'E':
				case 'F':
				case 'G':
					if (accs === undefined)
						accs = [];
					accs.push({ acc: acc, note: tokens[0].token.charAt(0) });
					if (tokens[0].token.length === 1)
						tokens.shift();
					else
						tokens[0].token = tokens[0].token.substring(1);
					break;
				default:
					return {accs: accs, warn: 'Expected note name after ' + acc + ' Found: ' + tokens[0].token };
			}
		}
		return { accs: accs };
	};

	// This gets an accidental marking for the key signature. It has the accidental then the pitch letter.
	this.getKeyAccidental = function(str) {
		var accTranslation = {
			'^': 'sharp',
			'^^': 'dblsharp',
			'=': 'natural',
			'_': 'flat',
			'__': 'dblflat',
			'_/': 'quarterflat',
			'^/': 'quartersharp'
		};
		var i = this.skipWhiteSpace(str);
		if (finished(str, i))
			return {len: 0};
		var acc = null;
		switch (str.charAt(i))
		{
			case '^':
			case '_':
			case '=':
				acc = str.charAt(i);
				break;
			default:return {len: 0};
		}
		i++;
		if (finished(str, i))
			return {len: 1, warn: 'Expected note name after accidental'};
		switch (str.charAt(i))
		{
			case 'a':
			case 'b':
			case 'c':
			case 'd':
			case 'e':
			case 'f':
			case 'g':
			case 'A':
			case 'B':
			case 'C':
			case 'D':
			case 'E':
			case 'F':
			case 'G':
				return {len: i+1, token: {acc: accTranslation[acc], note: str.charAt(i)}};
			case '^':
			case '_':
			case '/':
				acc += str.charAt(i);
				i++;
				if (finished(str, i))
					return {len: 2, warn: 'Expected note name after accidental'};
				switch (str.charAt(i))
				{
					case 'a':
					case 'b':
					case 'c':
					case 'd':
					case 'e':
					case 'f':
					case 'g':
					case 'A':
					case 'B':
					case 'C':
					case 'D':
					case 'E':
					case 'F':
					case 'G':
						return {len: i+1, token: {acc: accTranslation[acc], note: str.charAt(i)}};
					default:
						return {len: 2, warn: 'Expected note name after accidental'};
				}
				break;
			default:
				return {len: 1, warn: 'Expected note name after accidental'};
		}
	};

	this.isWhiteSpace = function(ch) {
		return ch === ' ' || ch === '\t' || ch === '\x12';
	};

	this.getMeat = function(line, start, end) {
		// This removes any comments starting with '%' and trims the ends of the string so that there are no leading or trailing spaces.
		// it returns just the start and end characters that contain the meat.
		var comment = line.indexOf('%', start);
		if (comment >= 0 && comment < end)
			end = comment;
		while (start < end && (line.charAt(start) === ' ' || line.charAt(start) === '\t' || line.charAt(start) === '\x12'))
			start++;
		while (start < end && (line.charAt(end-1) === ' ' || line.charAt(end-1) === '\t' || line.charAt(end-1) === '\x12'))
			end--;
		return {start: start, end: end};
	};

	var isLetter = function(ch) {
		return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
	};

	var isNumber = function(ch) {
		return (ch >= '0' && ch <= '9');
	};

	this.tokenize = function(line, start, end) {
		// this returns all the tokens inside the passed string. A token is a punctuation mark, a string of digits, a string of letters.
		//  Quoted strings are one token.
		//  If there is a minus sign next to a number, then it is included in the number.
		// If there is a period immediately after a number, with a number immediately following, then a float is returned.
		// The type of token is returned: quote, alpha, number, punct
		var ret = this.getMeat(line, start, end);
		start = ret.start;
		end = ret.end;
		var tokens = [];
		var i;
		while (start < end) {
			if (line.charAt(start) === '"') {
				i = start+1;
				while (i < end && line.charAt(i) !== '"') i++;
				tokens.push({ type: 'quote', token: line.substring(start+1, i), start: start+1, end: i});
				i++;
			} else if (isLetter(line.charAt(start))) {
				i = start+1;
				while (i < end && isLetter(line.charAt(i))) i++;
				tokens.push({ type: 'alpha', token: line.substring(start, i), continueId: isNumber(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (line.charAt(start) === '.' && isNumber(line.charAt(i+1))) {
				i = start+1;
				var int2 = null;
				var float2 = null;
				while (i < end && isNumber(line.charAt(i))) i++;

				float2 = parseFloat(line.substring(start, i));
				tokens.push({ type: 'number', token: line.substring(start, i), intt: int2, floatt: float2, continueId: isLetter(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (isNumber(line.charAt(start)) || (line.charAt(start) === '-' && isNumber(line.charAt(i+1)))) {
				i = start+1;
				var intt = null;
				var floatt = null;
				while (i < end && isNumber(line.charAt(i))) i++;
				if (line.charAt(i) === '.' && isNumber(line.charAt(i+1))) {
					i++;
					while (i < end && isNumber(line.charAt(i))) i++;
				} else
					intt = parseInt(line.substring(start, i));

				floatt = parseFloat(line.substring(start, i));
				tokens.push({ type: 'number', token: line.substring(start, i), intt: intt, floatt: floatt, continueId: isLetter(line.charAt(i)), start: start, end: i});
				start = i + 1;
			} else if (line.charAt(start) === ' ' || line.charAt(start) === '\t') {
				i = start+1;
			} else {
				tokens.push({ type: 'punct', token: line.charAt(start), start: start, end: start+1});
				i = start+1;
			}
			start = i;
		}
		return tokens;
	};

	this.getVoiceToken = function(line, start, end) {
		// This finds the next token. A token is delimited by a space or an equal sign. If it starts with a quote, then the portion between the quotes is returned.
		var i = start;
		while (i < end && this.isWhiteSpace(line.charAt(i)) || line.charAt(i) === '=')
			i++;

		if (line.charAt(i) === '"') {
			var close = line.indexOf('"', i+1);
			if (close === -1 || close >= end)
				return {len: 1, err: "Missing close quote"};
			return {len: close-start+1, token: this.translateString(line.substring(i+1, close))};
		} else {
			var ii = i;
			while (ii < end && !this.isWhiteSpace(line.charAt(ii)) && line.charAt(ii) !== '=')
				ii++;
			return {len: ii-start+1, token: line.substring(i, ii)};
		}
	};

	var charMap = {
		"`a": 'à', "'a": "á", "^a": "â", "~a": "ã", "\"a": "ä", "oa": "å", "=a": "ā", "ua": "ă", ";a": "ą",
		"`e": 'è', "'e": "é", "^e": "ê", "\"e": "ë", "=e": "ē", "ue": "ĕ", ";e": "ę", ".e": "ė",
		"`i": 'ì', "'i": "í", "^i": "î", "\"i": "ï", "=i": "ī", "ui": "ĭ", ";i": "į",
		"`o": 'ò', "'o": "ó", "^o": "ô", "~o": "õ", "\"o": "ö", "=o": "ō", "uo": "ŏ", "/o": "ø",
		"`u": 'ù', "'u": "ú", "^u": "û", "~u": "ũ", "\"u": "ü", "ou": "ů", "=u": "ū", "uu": "ŭ", ";u": "ų",
		"`A": 'À', "'A": "Á", "^A": "Â", "~A": "Ã", "\"A": "Ä", "oA": "Å", "=A": "Ā", "uA": "Ă", ";A": "Ą",
		"`E": 'È', "'E": "É", "^E": "Ê", "\"E": "Ë", "=E": "Ē", "uE": "Ĕ", ";E": "Ę", ".E": "Ė",
		"`I": 'Ì', "'I": "Í", "^I": "Î", "~I": "Ĩ", "\"I": "Ï", "=I": "Ī", "uI": "Ĭ", ";I": "Į", ".I": "İ",
		"`O": 'Ò', "'O": "Ó", "^O": "Ô", "~O": "Õ", "\"O": "Ö", "=O": "Ō", "uO": "Ŏ", "/O": "Ø",
		"`U": 'Ù', "'U": "Ú", "^U": "Û", "~U": "Ũ", "\"U": "Ü", "oU": "Ů", "=U": "Ū", "uU": "Ŭ", ";U": "Ų",
		"ae": "æ", "AE": "Æ", "oe": "œ", "OE": "Œ", "ss": "ß",
		"'c": "ć", "^c": "ĉ", "uc": "č", "cc": "ç", ".c": "ċ", "cC": "Ç", "'C": "Ć", "^C": "Ĉ", "uC": "Č", ".C": "Ċ",
		"~n": "ñ",
		"=s": "š", "vs": "š",
		"vz": 'ž'

// More chars: Ñ Ĳ ĳ Ď ď Đ đ Ĝ ĝ Ğ ğ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń ń Ņ ņ Ň ň ŉ Ŋ ŋ   Ŕ ŕ Ŗ ŗ Ř ř Ś ś Ŝ ŝ Ş ş Š Ţ ţ Ť ť Ŧ ŧ Ŵ ŵ Ŷ ŷ Ÿ ÿ Ÿ Ź ź Ż ż Ž 
	};
	var charMap1 = {
		"#": "♯",
		"b": "♭",
		"=": "♮"
	};
	var charMap2 = {
		"201": "♯",
		"202": "♭",
		"203": "♮",
		"241": "¡",
		"242": "¢", "252": "a", "262": "2", "272": "o", "302": "Â", "312": "Ê", "322": "Ò", "332": "Ú", "342": "â", "352": "ê", "362": "ò", "372": "ú",
		"243": "£", "253": "«", "263": "3", "273": "»", "303": "Ã", "313": "Ë", "323": "Ó", "333": "Û", "343": "ã", "353": "ë", "363": "ó", "373": "û",
		"244": "¤", "254": "¬", "264": "  ́", "274": "1⁄4", "304": "Ä", "314": "Ì", "324": "Ô", "334": "Ü", "344": "ä", "354": "ì", "364": "ô", "374": "ü",
		"245": "¥", "255": "-", "265": "μ", "275": "1⁄2", "305": "Å", "315": "Í", "325": "Õ", "335": "Ý",  "345": "å", "355": "í", "365": "õ", "375": "ý",
		"246": "¦", "256": "®", "266": "¶", "276": "3⁄4", "306": "Æ", "316": "Î", "326": "Ö", "336": "Þ", "346": "æ", "356": "î", "366": "ö", "376": "þ",
		"247": "§", "257": " ̄", "267": "·", "277": "¿", "307": "Ç", "317": "Ï", "327": "×", "337": "ß", "347": "ç", "357": "ï", "367": "÷", "377": "ÿ",
		"250": " ̈", "260": "°", "270": " ̧", "300": "À", "310": "È", "320": "Ð", "330": "Ø", "340": "à", "350": "è", "360": "ð", "370": "ø",
		"251": "©", "261": "±", "271": "1", "301": "Á", "311": "É", "321": "Ñ", "331": "Ù", "341": "á", "351": "é", "361": "ñ", "371": "ù" };
	this.translateString = function(str) {
		var arr = str.split('\\');
		if (arr.length === 1) return str;
		var out = null;
		window.ABCXJS.parse.each(arr, function(s) {
			if (out === null)
				out = s;
			else {
				var c = charMap[s.substring(0, 2)];
				if (c !== undefined)
					out += c + s.substring(2);
				else {
					c = charMap2[s.substring(0, 3)];
					if (c !== undefined)
						out += c + s.substring(3);
					else {
						c = charMap1[s.substring(0, 1)];
						if (c !== undefined)
							out += c + s.substring(1);
						else
							out += "\\" + s;
					}
				}
			}
		});
		return out;
	};
	this.getNumber = function(line, index) {
		var num = 0;
		while (index < line.length) {
			switch (line.charAt(index)) {
				case '0':num = num*10;index++;break;
				case '1':num = num*10+1;index++;break;
				case '2':num = num*10+2;index++;break;
				case '3':num = num*10+3;index++;break;
				case '4':num = num*10+4;index++;break;
				case '5':num = num*10+5;index++;break;
				case '6':num = num*10+6;index++;break;
				case '7':num = num*10+7;index++;break;
				case '8':num = num*10+8;index++;break;
				case '9':num = num*10+9;index++;break;
				default:
					return {num: num, index: index};
			}
		}
		return {num: num, index: index};
	};

	this.getFraction = function(line, index) {
		var num = 1;
		var den = 1;
		if (line.charAt(index) !== '/' && line.charAt(index) !== '.') {
			var ret = this.getNumber(line, index);
			num = ret.num;
			index = ret.index;
		}
		if (line.charAt(index) === '.') {
			index++;
			var ret = this.getNumber(line, index);
			var frac = ret.num;
			index = ret.index;
                        num = parseFloat(num+'.'+frac);
                    
                }
		if (line.charAt(index) === '/') {
			index++;
			if (line.charAt(index) === '/') {
				var div = 0.5;
				while (line.charAt(index++) === '/')
					div = div /2;
				return {value: num * div, index: index-1};
			} else {
				var iSave = index;
				var ret2 = this.getNumber(line, index);
				if (ret2.num === 0 && iSave === index)	// If we didn't use any characters, it is an implied 2
					ret2.num = 2;
				if (ret2.num !== 0)
					den = ret2.num;
				index = ret2.index;
			}
		}

		return {value: num/den, index: index};
	};

	this.theReverser = function(str) {
		if (window.ABCXJS.parse.endsWith(str, ", The"))
			return "The " + str.substring(0, str.length-5);
		if (window.ABCXJS.parse.endsWith(str, ", A"))
			return "A " + str.substring(0, str.length-3);
		return str;
	};

	this.stripComment = function(str) {
		var i = str.indexOf('%');
		if (i >= 0)
			return window.ABCXJS.parse.strip(str.substring(0, i));
		return window.ABCXJS.parse.strip(str);
	};

	this.getInt = function(str) {
		// This parses the beginning of the string for a number and returns { value: num, digits: num }
		// If digits is 0, then the string didn't point to a number.
		var x = parseInt(str);
		if (isNaN(x))
			return {digits: 0};
		var s = "" + x;
		var i = str.indexOf(s);	// This is to account for leading spaces
		return {value: x, digits: i+s.length};
	};

	this.getFloat = function(str) {
		// This parses the beginning of the string for a number and returns { value: num, digits: num }
		// If digits is 0, then the string didn't point to a number.
		var x = parseFloat(str);
		if (isNaN(x))
			return {digits: 0};
		var s = "" + x;
		var i = str.indexOf(s);	// This is to account for leading spaces
		return {value: x, digits: i+s.length};
	};

	this.getMeasurement = function(tokens) {
		if (tokens.length === 0) return { used: 0 };
		var used = 1;
		var num = '';
		if (tokens[0].token === '-') {
			tokens.shift();
			num = '-';
			used++;
		}
		else if (tokens[0].type !== 'number') return { used: 0 };
		num += tokens.shift().token;
		if (tokens.length === 0) return { used: 1, value: parseInt(num) };
		var x = tokens.shift();
		if (x.token === '.') {
			used++;
			if (tokens.length === 0) return { used: used, value: parseInt(num) };
			if (tokens[0].type === 'number') {
				x = tokens.shift();
				num = num + '.' + x.token;
				used++;
				if (tokens.length === 0) return { used: used, value: parseFloat(num) };
			}
			x = tokens.shift();
		}
		switch (x.token) {
			case 'pt': return { used: used+1, value: parseFloat(num) };
			case 'cm': return { used: used+1, value: parseFloat(num)/2.54*72 };
			case 'in': return { used: used+1, value: parseFloat(num)*72 };
			default: tokens.unshift(x); return { used: used, value: parseFloat(num) };
		}
		return { used: 0 };
	};
	var substInChord = function(str)
	{
		while ( str.indexOf("\\n") !== -1)
		{
			str = str.replace("\\n", "\n");
		}
		return str;
	};
	this.getBrackettedSubstring = function(line, i, maxErrorChars, _matchChar)
	{
            // This extracts the sub string by looking at the first character and searching for that
            // character later in the line (or search for the optional _matchChar).
            // For instance, if the first character is a quote it will look for
            // the end quote. If the end of the line is reached, then only up to the default number
            // of characters are returned, so that a missing end quote won't eat up the entire line.
            // It returns the substring and the number of characters consumed.
            // The number of characters consumed is normally two more than the size of the substring,
            // but in the error case it might not be.
            var matchChar = _matchChar || line.charAt(i);
            var nextPos = line.substr( i+1 ).indexOf(matchChar);
            if( nextPos === -1) {
                if( line.charAt( i+1 ) ===  ' ' ) // entendido como break line
                    return  [1, "", false, 0];
                else {
                    // procura o primeiro espaço em branco após matchChar
                    var nextPos = line.substr( i+1 ).indexOf(' ');
                    if( nextPos === -1) {
                        // we hit the end of line, so we'll just pick an arbitrary num of chars so the line doesn't disappear.
			nextPos = i+maxErrorChars>line.length-1?line.length-1:i+maxErrorChars;
			return [nextPos-i+1, substInChord(line.substring(i+1, nextPos)), false];
                    }
                }
                
            }
            
            var str = line.substr(i+1, nextPos ).split(":");
            return [nextPos+2, str[0], true, str[1]===undefined?0:str[1] ];

//		var pos = i+1;
//		while ((pos < line.length) && (line.charAt(pos) !== matchChar))
//			++pos;
//		if (line.charAt(pos) === matchChar)
//			return [pos-i+1,substInChord(line.substring(i+1, pos)), true];
//		else	// we hit the end of line, so we'll just pick an arbitrary num of chars so the line doesn't disappear.
//		{
//			pos = i+maxErrorChars;
//			if (pos > line.length-1)
//				pos = line.length-1;
//			return [pos-i+1, substInChord(line.substring(i+1, pos)), false];
//		}
	};
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.Transposer = function ( offSet ) {
    
    this.pitches           = ABCXJS.parse.pitches;
    
    this.tokenizer         = new ABCXJS.parse.tokenizer();
    
    this.reset( offSet );
    
};

window.ABCXJS.parse.Transposer.prototype.reset = function( offSet ) {
    this.offSet          = offSet;
    this.currKey         = [];
    this.newKeyAcc       = [];
    this.oldKeyAcc       = [];
    this.changedLines    = [];
    this.deletedLines    = [];
    this.newX            =  0;
    this.workingX        =  0;
    this.workingLine     = -1;
    this.workingLineIdx  = -1;
};

window.ABCXJS.parse.Transposer.prototype.numberToStaff = function(number, newKacc) {
    var s ;
    if(newKacc.length > 0 && newKacc[0].acc === 'flat')
        s = ABCXJS.parse.number2staff[number];
    else
        s = ABCXJS.parse.number2staffSharp[number];
    
    // octave can be altered below
    s.octVar = 0;
    
    if(s.acc === "" && ("EFBC").indexOf(s.note) >= 0 ) {
        var o ;
        switch(s.note) {
            case 'E':
                //procurar Fflat
                o = {note:'F',acc:'flat', octVar:0};
                break;
            case 'F':
                //procurar Esharp
                o = {note:'E',acc:'sharp', octVar:0};
                break;
            case 'B':
                //procurar Cflat
                o = {note:'C',acc:'flat', octVar:1};
                break;
            case 'C':
                //procurar Bsharp
                o = {note:'B',acc:'sharp', octVar:-1};
                break;
        }
        for( var a = 0; a < newKacc.length; a ++ ) {
            if( newKacc[a].note.toUpperCase() === o.note && newKacc[a].acc === o.acc ){
                s = o;
                break;
            }
        }
    }
    return s;
};

window.ABCXJS.parse.Transposer.prototype.transposeRegularMusicLine = function(line, lineNumber, multilineVars) {

    var index = 0;
    var found = false;
    var inside = false;
    var state = 0;
    var lastState = 0;
    var xi = -1;
    var xf = -1;
    var accSyms = "^_=";  // state 1
    var pitSyms = "ABCDEFGabcdefg"; // state 2
    var octSyms = ",\'"; // state 3
    var exclusionSyms = '"!+'; 
    
    this.workingLine = line;
    this.vars = multilineVars;
    this.isBass = (this.vars.currentVoice.clef.type==='bass') || false;
    this.isChord = false;
    this.workingLineIdx = this.changedLines.length;
    this.changedLines[ this.workingLineIdx ] = { line:lineNumber, text: line };
    this.workingX = 0;
    this.newX =0;
    this.baraccidentals = [];
    this.baraccidentalsNew = [];
    
    while (index < line.length) {
        found = false;
        inside = false;
        lastState = 0;
        while (index < line.length && !found && line.charAt(index) !== '%') {
            
            // ignora o conteúdo de accents
            if( !inside && exclusionSyms.indexOf(line.charAt(index)) >= 0 ) {
                var nextPos = line.substr( index+1 ).indexOf(line.charAt(index));
                if( nextPos < 0 ) {
                    index = line.length;
                } else {
                    if(line.charAt(index)==='"') {
                        this.transposeChord( index+1, nextPos ); 
                    }    
                    index += nextPos + 2;
                }
                continue;
            }
            
            if(line.charAt(index) === '|'){
                this.baraccidentals = [];
                this.baraccidentalsNew = [];
            }
            
            state = 
              accSyms.indexOf(line.charAt(index)) >= 0 ? 1 : 
              pitSyms.indexOf(line.charAt(index)) >= 0 ? 2 :
              octSyms.indexOf(line.charAt(index)) >= 0 ? 3 : 0;
            
            if( ( state < lastState && inside ) || (lastState === 2 && state === 2 && inside ) ) {
               found = true;
               xf = index;
            } else if( state > lastState && !inside) {
              inside = true;
              xi = index;
            }
            
            lastState = state;
            state = 0;
            
            if (found) {
              this.transposeNote(xi, xf - xi);
            } else {
                if( line.charAt(index) === '[' ) {
                    index = this.checkForInlineFields( index );
                } else {
                    if(line.charAt(index) === ']' ) {
                        this.isChord = false;
                        delete this.lastPitch ;
                    }
                    index++;
                }
            }   
            
        }
        
        if(inside && !found) {
            this.transposeNote(xi, index - xi);
        }
        
        if(line.charAt(index) === '%' ){
            index = line.length;
        }
      
    }
    return this.changedLines[ this.workingLineIdx ].text;
};

window.ABCXJS.parse.Transposer.prototype.checkForInlineFields = function ( index ) {
    var c = this.workingLine.substring(index);
    var rex = c.match(/^\[([IKLMmNPQRrUV]\:.*?)\]/g);
    var newidx = index;
    if(rex) {
        var key = rex[0].substr(1,rex[0].length-2).split(":");
        switch(key[0]) {
            case 'K': //Será que deveria me preocupar em colocar em cNewKey informação da armadura daqui para frente?
               this.transposeChord(index+3,key[1].length);
               newidx+=rex[0].length;
               break;
            case 'V':
               this.updateVoiceInfo(key[1]);
               newidx+=rex[0].length;
               break;
            default:
               newidx+=rex[0].length;
        }
    } else {
        this.isChord = 1;
        newidx+=1;
    }
    return newidx;
};

window.ABCXJS.parse.Transposer.prototype.updateVoiceInfo = function ( id ) {
    this.vars.currentVoice = this.vars.voices[id] ;
    this.isBass = (this.vars.currentVoice.clef.type==='bass') || false;
    
};

window.ABCXJS.parse.Transposer.prototype.transposeChord = function ( xi, size ) {
    
    var c = this.denormalizeAcc(this.workingLine.substring(xi,xi+size));
    var rex = c.match(/([ABCDEFG][#b]*[M+m°]*[0-9]*(\/[ABCDEFG0-9])*)/g);
    
    if( Math.abs(this.offSet)%12 === 0 || !rex || c!==rex[0]  ) return ;
    
    var newStr = c;
    
    rex = c.match(/([ABCDEFG].*(\/[ABCDEFG]).*)/g);
    c = rex===null? [c] : c.split('/');
    
    for( var t = 0; t < c.length; t++) {
        
        var cKey = this.parseKey( c[t] );
        var newKey = this.keyToNumber( cKey );
        var cNewKey = this.denormalizeAcc( this.numberToKey(newKey + this.offSet, this.offSet ));

        newStr  = newStr.replace(cKey, cNewKey );
    }
    this.updateWorkingLine( newStr, xi, size/*, cNewKey.length*/ );
    //this.workingLine = this.workingLine.substr(0, xi) + cNewKey + this.workingLine.substr(xi+size);
};

window.ABCXJS.parse.Transposer.prototype.transposeNote = function(xi, size )
{
    var abcNote = this.workingLine.substr(xi, size);
    var elem = this.makeElem(abcNote);
    var pitch = elem.pitch;
    var oct = this.extractStaffOctave(pitch);
    var crom = this.staffNoteToCromatic(this.extractStaffNote(pitch));

    var txtAcc = elem.accidental;
    var dAcc = this.getAccOffset(txtAcc);
    
    if(elem.accidental) {
        this.baraccidentals[pitch] = dAcc;
    }

    var dKi = this.getKeyAccOffset(this.numberToKey(crom, this.offSet), this.oldKeyAcc);

    var newNote = 0;
    if (this.baraccidentals[pitch] !== undefined) {
        newNote = crom + this.baraccidentals[pitch] + this.offSet;
    } else { // use normal accidentals
        newNote = crom + dKi + this.offSet;
    }

    var newOct = this.extractCromaticOctave(newNote);
    var newNote = this.extractCromaticNote(newNote);

    var newStaff = this.numberToStaff(newNote, this.newKeyAcc);
    var dKf = this.getKeyAccOffset(newStaff.note, this.newKeyAcc);
    
    var deltaOctave = newOct + newStaff.octVar; 
    
    if( this.isBass ) {
        if ( this.isChord && this.isChord > 1 ) {
            var p = this.getPitch(newStaff.note, oct + deltaOctave );

            if( this.offset > 0 ) {
                if( p < elem.pitch ) deltaOctave++;
            } else {
                if( p > elem.pitch ) deltaOctave--;
            }
            p = this.getPitch(newStaff.note, oct + deltaOctave );
            if(p < this.lastPitch ){
                // assumir que o acorde é cadastrado em ordem crescente e
                // se ao final da conversão de uma nota do acorde, esta for menor que a prévia, somar uma oitava. 
                deltaOctave++;
            }
        } else {
            deltaOctave = 0;
        }
        this.isChord && this.isChord ++; 
    }


    this.lastPitch = pitch = this.getPitch(newStaff.note, oct + deltaOctave );
    dAcc = this.getAccOffset(newStaff.acc);

    var newElem = {};
    newElem.pitch = pitch;
    if(newStaff.acc !== '' ) newElem.accidental = newStaff.acc;
    
    // se a nota sair com um acidente (inclusive natural) registrar acidente na barra para o pitch.
    var dBarAcc = this.getAccOffset( this.baraccidentalsNew[newElem.pitch] );
    if(dAcc === 0) {
        if( dBarAcc && dBarAcc !==0 || dKf !== 0) {
          newElem.accidental = 'natural';
        }
    } else {
        if( dBarAcc && dBarAcc !== 0 ) {
           if(dBarAcc === dAcc ) delete newElem.accidental;
        } else if(dKf !== 0) {
           if(dKf === dAcc ) delete newElem.accidental;
        }
    }
    
    if( newElem.accidental ) {
      this.baraccidentalsNew[newElem.pitch] = newElem.accidental;
    }

    oct = this.extractStaffOctave(pitch);
    var key = this.numberToKey(this.staffNoteToCromatic(this.extractStaffNote(pitch)), this.offSet);
    txtAcc = newElem.accidental;
    abcNote = this.getAbcNote(key, txtAcc, oct);
    this.updateWorkingLine( abcNote, xi, size/*, abcNote.length */);
    return newElem;
};

window.ABCXJS.parse.Transposer.prototype.updateWorkingLine = function( newText, xi, size/*, newSize*/ ) {
    var p0 = this.changedLines[this.workingLineIdx].text.substr(0, this.newX);
    var p1 = this.workingLine.substr(this.workingX, xi - this.workingX);
    var p2 = this.workingLine.substr(xi + size);
    this.workingX = xi + size;
    this.changedLines[this.workingLineIdx].text = p0 + p1 + newText;
    this.newX = this.changedLines[this.workingLineIdx].text.length;
    this.changedLines[this.workingLineIdx].text += p2;
};

window.ABCXJS.parse.Transposer.prototype.getAbcNote = function( key, txtAcc, oct) {
   var cOct = "";
   if( oct >= 5 ) {
       key = key.toLowerCase();  
       cOct = Array(oct-4).join("'");
   }  else {
       key = key.toUpperCase();  
       cOct = Array(4-(oct-1)).join(",");
   }
   return this.accNameToABC(txtAcc) + key + cOct;
};

window.ABCXJS.parse.Transposer.prototype.transposeKey = function ( str, line, lineNumber ) {

    var cKey = this.parseKey( str );
    
    this.currKey[this.currKey.length] = cKey;
    
    if( Math.abs(this.offSet)%12 === 0 || ! cKey ) return this.tokenizer.tokenize(str, 0, str.length);
    
    var newKey = this.keyToNumber( cKey );
    var cNewKey = this.denormalizeAcc( this.numberToKey(newKey + this.offSet, this.offSet ));
    
    this.currKey[this.currKey.length-1] = cNewKey;

    var newStr  = str.replace(cKey, cNewKey );
    var newLine = line.substr( 0, line.indexOf(str) ) + newStr;
    
    this.changedLines[ this.changedLines.length ] = { line:lineNumber, text: newLine };

    this.oldKeyAcc = ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(str));
    this.newKeyAcc = ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(newStr));
    
    return this.tokenizer.tokenize(newStr, 0, newStr.length);
};

window.ABCXJS.parse.Transposer.prototype.parseKey = function ( str ) {
    var cKey = null;
    var tokens = this.tokenizer.tokenize(str, 0, str.length);
    var retPitch = this.tokenizer.getKeyPitch(tokens[0].token);

    if (retPitch.len > 0) {
        // The accidental and mode might be attached to the pitch, so we might want to just remove the first character.
        cKey = retPitch.token;
        if (tokens[0].token.length > 1)
            tokens[0].token = tokens[0].token.substring(1);
        else
            tokens.shift();
        // We got a pitch to start with, so we might also have an accidental and a mode
        if (tokens.length > 0) {
            var retAcc = this.tokenizer.getSharpFlat(tokens[0].token);
            if (retAcc.len > 0) {
                cKey += retAcc.token;
            }
        }
    }
    
    return cKey;
};


window.ABCXJS.parse.Transposer.prototype.deleteTabLine = function ( n ) {
    this.deletedLines[n] = true;
};

window.ABCXJS.parse.Transposer.prototype.updateEditor = function ( lines ) {
    
    for( i = 0; i < this.changedLines.length; i++ ){
        lines[this.changedLines[i].line] = this.changedLines[i].text;
    }
    
    var newStr = lines[0]; // supoe q a linha zero nunca sera apagada
    
    for( var i = 1; i < lines.length; i++ ){
        if( ! this.deletedLines[i] ) {
            newStr += '\n' + lines[i];
        }
    }
    this.deletedLines = [];
    this.changedLines = [];
    return newStr+'\n';
};

window.ABCXJS.parse.Transposer.prototype.getKeyVoice = function ( idx ) {
return (this.currKey[idx]?this.currKey[idx]:"C");
};

window.ABCXJS.parse.Transposer.prototype.normalizeAcc = function ( cKey ) {
    return ABCXJS.parse.normalizeAcc(cKey);
};

window.ABCXJS.parse.Transposer.prototype.denormalizeAcc = function ( cKey ) {
    return ABCXJS.parse.denormalizeAcc(cKey);
};

window.ABCXJS.parse.Transposer.prototype.getKeyAccOffset = function(note, keyAcc)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < keyAcc.length; a ++) {
      if( keyAcc[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.getAccOffset(keyAcc[a].acc);
      }
  }
  return 0;    
};
               
window.ABCXJS.parse.Transposer.prototype.staffNoteToCromatic = function (note) {
  return note*2 + (note>2?-1:0);
};

//window.ABCXJS.parse.Transposer.prototype.cromaticToStaffNote = function (note) {
//  return (note>5?note+1:note)/2;
//};

window.ABCXJS.parse.Transposer.prototype.extractStaffNote = function(pitch) {
    pitch = pitch % 7;
    return pitch<0? pitch+=7:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticOctave = function(pitch) {
    return Math.floor(pitch/12) ;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticNote = function(pitch) {
    pitch = pitch % 12;
    return pitch<0? pitch+=12:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractStaffOctave = function(pitch) {
    return Math.floor((28 + pitch) / 7);
};

window.ABCXJS.parse.Transposer.prototype.numberToKey = function(number, offset) {
    var r = number;
    r %= ABCXJS.parse.number2keysharp.length;
    
    if( r < 0 ) r += ABCXJS.parse.number2keysharp.length;
    
    if( offset > 0 ) {
        r = ABCXJS.parse.number2keysharp[r];
    } else {
        r = ABCXJS.parse.number2keyflat[r];
    }
    return r;
};

window.ABCXJS.parse.Transposer.prototype.keyToNumber = function(key) {
    key = this.normalizeAcc(key);
    return ABCXJS.parse.key2number[key];
};

window.ABCXJS.parse.Transposer.prototype.getAccOffset = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accNameToABC = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = "^^";
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = '^';
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = "=";
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = '_';
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = '__';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accAbcToName = function(abc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (abc) {
        case '^^':
            ret = "dblsharp";
            break;
        case '^':
            ret = 'sharp';
            break;
        case '=':
            ret = "natural";
            break;
        case '_':
            ret = 'flat';
            break;
        case '__':
            ret = 'dblflat';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.getAccName = function(offset)
{
    var names = ['dblflat','flat','natural','sharp','dblsharp'];
    return names[offset+2];
};

window.ABCXJS.parse.Transposer.prototype.getPitch = function( staff, octave) {
   return this.pitches[staff] + (octave - 4) * 7; 
};

window.ABCXJS.parse.Transposer.prototype.makeElem = function(abcNote){
   var pitSyms = "ABCDEFGabcdefg"; // 2
   var i = 0;
   while( pitSyms.indexOf(abcNote.charAt(i)) === -1 ) {
       i++;
   }
   var acc = this.accAbcToName(abcNote.substr(0,i));
   var pitch = this.pitches[abcNote.charAt(i)];
   while( i < abcNote.length ) {
      switch ( abcNote.charAt(i) ) {
          case "'": pitch +=7; break;
          case "," : pitch -=7; break;
      }
      i++;
   }
   return ( acc ? { pitch: pitch, accidental: acc } : { pitch: pitch } );
};
/*global window, ABCXJS */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.write)
	window.ABCXJS.write = {};

ABCXJS.write.Glyphs = function () {
    var glyphs = {
          'n.0': {d: [["M", 4.83, -14.97], ["c", 0.33, -0.03, 1.11, 0, 1.47, 0.06], ["c", 1.68, 0.36, 2.97, 1.59, 3.78, 3.6], ["c", 1.2, 2.97, 0.81, 6.96, -0.9, 9.27], ["c", -0.78, 1.08, -1.71, 1.71, -2.91, 1.95], ["c", -0.45, 0.09, -1.32, 0.09, -1.77, 0], ["c", -0.81, -0.18, -1.47, -0.51, -2.07, -1.02], ["c", -2.34, -2.07, -3.15, -6.72, -1.74, -10.2], ["c", 0.87, -2.16, 2.28, -3.42, 4.14, -3.66], ["z"], ["m", 1.11, 0.87], ["c", -0.21, -0.06, -0.69, -0.09, -0.87, -0.06], ["c", -0.54, 0.12, -0.87, 0.42, -1.17, 0.99], ["c", -0.36, 0.66, -0.51, 1.56, -0.6, 3], ["c", -0.03, 0.75, -0.03, 4.59, -0, 5.31], ["c", 0.09, 1.5, 0.27, 2.4, 0.6, 3.06], ["c", 0.24, 0.48, 0.57, 0.78, 0.96, 0.9], ["c", 0.27, 0.09, 0.78, 0.09, 1.05, -0], ["c", 0.39, -0.12, 0.72, -0.42, 0.96, -0.9], ["c", 0.33, -0.66, 0.51, -1.56, 0.6, -3.06], ["c", 0.03, -0.72, 0.03, -4.56, -0, -5.31], ["c", -0.09, -1.47, -0.27, -2.37, -0.6, -3.03], ["c", -0.24, -0.48, -0.54, -0.78, -0.93, -0.9], ["z"]], w: 10.78, h: 14.959}
        , 'n.1': {d: [["M", 3.30, -15.06], ["c", 0.06, -0.06, 0.21, -0.03, 0.66, 0.15], ["c", 0.81, 0.39, 1.08, 0.39, 1.83, 0.03], ["c", 0.21, -0.09, 0.39, -0.15, 0.42, -0.15], ["c", 0.12, 0, 0.21, 0.09, 0.27, 0.21], ["c", 0.06, 0.12, 0.06, 0.33, 0.06, 5.94], ["c", 0, 3.93, 0, 5.85, 0.03, 6.03], ["c", 0.06, 0.36, 0.15, 0.69, 0.27, 0.96], ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3], ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24], ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ["c", -0.42, -0, -0.69, -0.03, -2.1, -0.24], ["c", -0.9, -0.15, -1.77, -0.15, -2.67, -0], ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24], ["c", -0.39, -0, -0.42, -0, -0.48, -0.06], ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3], ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ["c", 0.12, -0.27, 0.21, -0.6, 0.27, -0.96], ["c", 0.03, -0.18, 0.03, -1.59, 0.03, -4.29], ["c", 0, -3.87, 0, -4.05, -0.06, -4.14], ["c", -0.09, -0.15, -0.18, -0.24, -0.39, -0.24], ["c", -0.12, -0, -0.15, 0.03, -0.21, 0.06], ["c", -0.03, 0.06, -0.45, 0.99, -0.96, 2.13], ["c", -0.48, 1.14, -0.9, 2.1, -0.93, 2.16], ["c", -0.06, 0.15, -0.21, 0.24, -0.33, 0.24], ["c", -0.24, 0, -0.42, -0.18, -0.42, -0.39], ["c", 0, -0.06, 3.27, -7.62, 3.33, -7.74], ["z"]], w: 8.94, h: 15.058}
        , 'n.2': {d: [["M", 4.23, -14.97], ["c", 0.57, -0.06, 1.68, 0, 2.34, 0.18], ["c", 0.69, 0.18, 1.5, 0.54, 2.01, 0.9], ["c", 1.35, 0.96, 1.95, 2.25, 1.77, 3.81], ["c", -0.15, 1.35, -0.66, 2.34, -1.68, 3.15], ["c", -0.6, 0.48, -1.44, 0.93, -3.12, 1.65], ["c", -1.32, 0.57, -1.8, 0.81, -2.37, 1.14], ["c", -0.57, 0.33, -0.57, 0.33, -0.24, 0.27], ["c", 0.39, -0.09, 1.26, -0.09, 1.68, 0], ["c", 0.72, 0.15, 1.41, 0.45, 2.1, 0.9], ["c", 0.99, 0.63, 1.86, 0.87, 2.55, 0.75], ["c", 0.24, -0.06, 0.42, -0.15, 0.57, -0.3], ["c", 0.12, -0.09, 0.3, -0.42, 0.3, -0.51], ["c", 0, -0.09, 0.12, -0.21, 0.24, -0.24], ["c", 0.18, -0.03, 0.39, 0.12, 0.39, 0.3], ["c", 0, 0.12, -0.15, 0.57, -0.3, 0.87], ["c", -0.54, 1.02, -1.56, 1.74, -2.79, 2.01], ["c", -0.42, 0.09, -1.23, 0.09, -1.62, 0.03], ["c", -0.81, -0.18, -1.32, -0.45, -2.01, -1.11], ["c", -0.45, -0.45, -0.63, -0.57, -0.96, -0.69], ["c", -0.84, -0.27, -1.89, 0.12, -2.25, 0.9], ["c", -0.12, 0.21, -0.21, 0.54, -0.21, 0.72], ["c", 0, 0.12, -0.12, 0.21, -0.27, 0.24], ["c", -0.15, 0, -0.27, -0.03, -0.33, -0.15], ["c", -0.09, -0.21, 0.09, -1.08, 0.33, -1.71], ["c", 0.24, -0.66, 0.66, -1.26, 1.29, -1.89], ["c", 0.45, -0.45, 0.9, -0.81, 1.92, -1.56], ["c", 1.29, -0.93, 1.89, -1.44, 2.34, -1.98], ["c", 0.87, -1.05, 1.26, -2.19, 1.2, -3.63], ["c", -0.06, -1.29, -0.39, -2.31, -0.96, -2.91], ["c", -0.36, -0.33, -0.72, -0.51, -1.17, -0.54], ["c", -0.84, -0.03, -1.53, 0.42, -1.59, 1.05], ["c", -0.03, 0.33, 0.12, 0.6, 0.57, 1.14], ["c", 0.45, 0.54, 0.54, 0.87, 0.42, 1.41], ["c", -0.15, 0.63, -0.54, 1.11, -1.08, 1.38], ["c", -0.63, 0.33, -1.2, 0.33, -1.83, 0], ["c", -0.24, -0.12, -0.33, -0.18, -0.54, -0.39], ["c", -0.18, -0.18, -0.27, -0.3, -0.36, -0.51], ["c", -0.24, -0.45, -0.27, -0.84, -0.21, -1.38], ["c", 0.12, -0.75, 0.45, -1.41, 1.02, -1.98], ["c", 0.72, -0.72, 1.74, -1.17, 2.85, -1.32], ["z"]], w: 10.764, h: 14.993}
        , 'n.3': {d: [["M", 3.78, -14.97], ["c", 0.3, -0.03, 1.41, 0, 1.83, 0.06], ["c", 2.22, 0.3, 3.51, 1.32, 3.72, 2.91], ["c", 0.03, 0.33, 0.03, 1.26, -0.03, 1.65], ["c", -0.12, 0.84, -0.48, 1.47, -1.05, 1.77], ["c", -0.27, 0.15, -0.36, 0.24, -0.45, 0.39], ["c", -0.09, 0.21, -0.09, 0.36, 0, 0.57], ["c", 0.09, 0.15, 0.18, 0.24, 0.51, 0.39], ["c", 0.75, 0.42, 1.23, 1.14, 1.41, 2.13], ["c", 0.06, 0.42, 0.06, 1.35, 0, 1.71], ["c", -0.18, 0.81, -0.48, 1.38, -1.02, 1.95], ["c", -0.75, 0.72, -1.8, 1.2, -3.18, 1.38], ["c", -0.42, 0.06, -1.56, 0.06, -1.95, 0], ["c", -1.89, -0.33, -3.18, -1.29, -3.51, -2.64], ["c", -0.03, -0.12, -0.03, -0.33, -0.03, -0.6], ["c", 0, -0.36, 0, -0.42, 0.06, -0.63], ["c", 0.12, -0.3, 0.27, -0.51, 0.51, -0.75], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, 0, 0.39, 0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2], ["c", 0, 0.21, 0, 0.27, -0.06, 0.42], ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ["c", -0.51, 0.36, -0.63, 0.54, -0.6, 0.87], ["c", 0.06, 0.54, 0.54, 0.9, 1.38, 0.99], ["c", 0.36, 0.06, 0.72, 0.03, 0.96, -0.06], ["c", 0.81, -0.27, 1.29, -1.23, 1.44, -2.79], ["c", 0.03, -0.45, 0.03, -1.95, -0.03, -2.37], ["c", -0.09, -0.75, -0.33, -1.23, -0.75, -1.44], ["c", -0.33, -0.18, -0.45, -0.18, -1.98, -0.18], ["c", -1.35, 0, -1.41, 0, -1.5, -0.06], ["c", -0.18, -0.12, -0.24, -0.39, -0.12, -0.6], ["c", 0.12, -0.15, 0.15, -0.15, 1.68, -0.15], ["c", 1.5, 0, 1.62, 0, 1.89, -0.15], ["c", 0.18, -0.09, 0.42, -0.36, 0.54, -0.57], ["c", 0.18, -0.42, 0.27, -0.9, 0.3, -1.95], ["c", 0.03, -1.2, -0.06, -1.8, -0.36, -2.37], ["c", -0.24, -0.48, -0.63, -0.81, -1.14, -0.96], ["c", -0.3, -0.06, -1.08, -0.06, -1.38, 0.03], ["c", -0.6, 0.15, -0.9, 0.42, -0.96, 0.84], ["c", -0.03, 0.3, 0.06, 0.45, 0.63, 0.84], ["c", 0.33, 0.24, 0.42, 0.39, 0.45, 0.63], ["c", 0.03, 0.72, -0.57, 1.5, -1.32, 1.65], ["c", -1.05, 0.27, -2.1, -0.57, -2.1, -1.65], ["c", 0, -0.45, 0.15, -0.96, 0.39, -1.38], ["c", 0.12, -0.21, 0.54, -0.63, 0.81, -0.81], ["c", 0.57, -0.42, 1.38, -0.69, 2.25, -0.81], ["z"]], w: 9.735, h: 14.967}
        , 'n.4': {d: [["M", 8.64, -14.94], ["c", 0.27, -0.09, 0.42, -0.12, 0.54, -0.03], ["c", 0.09, 0.06, 0.15, 0.21, 0.15, 0.3], ["c", -0.03, 0.06, -1.92, 2.31, -4.23, 5.04], ["c", -2.31, 2.73, -4.23, 4.98, -4.26, 5.01], ["c", -0.03, 0.06, 0.12, 0.06, 2.55, 0.06], ["l", 2.61, 0], ["l", 0, -2.37], ["c", 0, -2.19, 0.03, -2.37, 0.06, -2.46], ["c", 0.03, -0.06, 0.21, -0.18, 0.57, -0.42], ["c", 1.08, -0.72, 1.38, -1.08, 1.86, -2.16], ["c", 0.12, -0.3, 0.24, -0.54, 0.27, -0.57], ["c", 0.12, -0.12, 0.39, -0.06, 0.45, 0.12], ["c", 0.06, 0.09, 0.06, 0.57, 0.06, 3.96], ["l", 0, 3.9], ["l", 1.08, 0], ["c", 1.05, 0, 1.11, 0, 1.2, 0.06], ["c", 0.24, 0.15, 0.24, 0.54, 0, 0.69], ["c", -0.09, 0.06, -0.15, 0.06, -1.2, 0.06], ["l", -1.08, 0], ["l", 0, 0.33], ["c", 0, 0.57, 0.09, 1.11, 0.3, 1.53], ["c", 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ["c", 0.3, 0.03, 0.39, 0.09, 0.39, 0.3], ["c", 0, 0.15, -0.03, 0.18, -0.09, 0.24], ["c", -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ["c", -0.42, 0, -0.69, -0.03, -2.1, -0.24], ["c", -0.9, -0.15, -1.77, -0.15, -2.67, 0], ["c", -1.41, 0.21, -1.68, 0.24, -2.1, 0.24], ["c", -0.39, 0, -0.42, 0, -0.48, -0.06], ["c", -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ["c", 0, -0.21, 0.06, -0.27, 0.36, -0.3], ["c", 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ["c", 0.21, -0.42, 0.3, -0.96, 0.3, -1.53], ["l", 0, -0.33], ["l", -2.7, 0], ["c", -2.91, 0, -2.85, 0, -3.09, -0.15], ["c", -0.18, -0.12, -0.3, -0.39, -0.27, -0.54], ["c", 0.03, -0.06, 0.18, -0.24, 0.33, -0.45], ["c", 0.75, -0.9, 1.59, -2.07, 2.13, -3.03], ["c", 0.33, -0.54, 0.84, -1.62, 1.05, -2.16], ["c", 0.57, -1.41, 0.84, -2.64, 0.9, -4.05], ["c", 0.03, -0.63, 0.06, -0.72, 0.24, -0.81], ["l", 0.12, -0.06], ["l", 0.45, 0.12], ["c", 0.66, 0.18, 1.02, 0.24, 1.47, 0.27], ["c", 0.6, 0.03, 1.23, -0.09, 2.01, -0.33], ["z"]], w: 11.795, h: 14.994}
        , 'n.5': {d: [["M", 1.02, -14.94], ["c", 0.12, -0.09, 0.03, -0.09, 1.08, 0.06], ["c", 2.49, 0.36, 4.35, 0.36, 6.96, -0.06], ["c", 0.57, -0.09, 0.66, -0.06, 0.81, 0.06], ["c", 0.15, 0.18, 0.12, 0.24, -0.15, 0.51], ["c", -1.29, 1.26, -3.24, 2.04, -5.58, 2.31], ["c", -0.6, 0.09, -1.2, 0.12, -1.71, 0.12], ["c", -0.39, 0, -0.45, 0, -0.57, 0.06], ["c", -0.09, 0.06, -0.15, 0.12, -0.21, 0.21], ["l", -0.06, 0.12], ["l", 0, 1.65], ["l", 0, 1.65], ["l", 0.21, -0.21], ["c", 0.66, -0.57, 1.41, -0.96, 2.19, -1.14], ["c", 0.33, -0.06, 1.41, -0.06, 1.95, 0], ["c", 2.61, 0.36, 4.02, 1.74, 4.26, 4.14], ["c", 0.03, 0.45, 0.03, 1.08, -0.03, 1.44], ["c", -0.18, 1.02, -0.78, 2.01, -1.59, 2.7], ["c", -0.72, 0.57, -1.62, 1.02, -2.49, 1.2], ["c", -1.38, 0.27, -3.03, 0.06, -4.2, -0.54], ["c", -1.08, -0.54, -1.71, -1.32, -1.86, -2.28], ["c", -0.09, -0.69, 0.09, -1.29, 0.57, -1.74], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, 0, 0.39, 0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.36, 0.33, 0.57, 0.75, 0.6, 1.2], ["c", 0, 0.21, 0, 0.27, -0.06, 0.42], ["c", -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ["c", -0.18, 0.12, -0.36, 0.3, -0.42, 0.33], ["c", -0.36, 0.42, -0.18, 0.99, 0.36, 1.26], ["c", 0.51, 0.27, 1.47, 0.36, 2.01, 0.27], ["c", 0.93, -0.21, 1.47, -1.17, 1.65, -2.91], ["c", 0.06, -0.45, 0.06, -1.89, 0, -2.31], ["c", -0.15, -1.2, -0.51, -2.1, -1.05, -2.55], ["c", -0.21, -0.18, -0.54, -0.36, -0.81, -0.39], ["c", -0.3, -0.06, -0.84, -0.03, -1.26, 0.06], ["c", -0.93, 0.18, -1.65, 0.6, -2.16, 1.2], ["c", -0.15, 0.21, -0.27, 0.3, -0.39, 0.3], ["c", -0.15, 0, -0.3, -0.09, -0.36, -0.18], ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.66], ["c", 0, -3.39, 0, -3.57, 0.06, -3.66], ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.18], ["z"]], w: 10.212, h: 14.997}
        , 'n.6': {d: [["M", 4.98, -14.97], ["c", 0.36, -0.03, 1.2, 0, 1.59, 0.06], ["c", 0.9, 0.15, 1.68, 0.51, 2.25, 1.05], ["c", 0.57, 0.51, 0.87, 1.23, 0.84, 1.98], ["c", -0.03, 0.51, -0.21, 0.9, -0.6, 1.26], ["c", -0.24, 0.24, -0.45, 0.39, -0.75, 0.51], ["c", -0.21, 0.06, -0.27, 0.06, -0.6, 0.06], ["c", -0.33, 0, -0.39, 0, -0.6, -0.06], ["c", -0.3, -0.12, -0.51, -0.27, -0.75, -0.51], ["c", -0.39, -0.36, -0.57, -0.78, -0.57, -1.26], ["c", 0, -0.27, 0, -0.3, 0.09, -0.42], ["c", 0.03, -0.09, 0.18, -0.21, 0.3, -0.3], ["c", 0.12, -0.09, 0.3, -0.21, 0.39, -0.27], ["c", 0.09, -0.06, 0.21, -0.18, 0.27, -0.24], ["c", 0.06, -0.12, 0.09, -0.15, 0.09, -0.33], ["c", 0, -0.18, -0.03, -0.24, -0.09, -0.36], ["c", -0.24, -0.39, -0.75, -0.6, -1.38, -0.57], ["c", -0.54, 0.03, -0.9, 0.18, -1.23, 0.48], ["c", -0.81, 0.72, -1.08, 2.16, -0.96, 5.37], ["l", 0, 0.63], ["l", 0.3, -0.12], ["c", 0.78, -0.27, 1.29, -0.33, 2.1, -0.27], ["c", 1.47, 0.12, 2.49, 0.54, 3.27, 1.29], ["c", 0.48, 0.51, 0.81, 1.11, 0.96, 1.89], ["c", 0.06, 0.27, 0.06, 0.42, 0.06, 0.93], ["c", 0, 0.54, 0, 0.69, -0.06, 0.96], ["c", -0.15, 0.78, -0.48, 1.38, -0.96, 1.89], ["c", -0.54, 0.51, -1.17, 0.87, -1.98, 1.08], ["c", -1.14, 0.3, -2.4, 0.33, -3.24, 0.03], ["c", -1.5, -0.48, -2.64, -1.89, -3.27, -4.02], ["c", -0.36, -1.23, -0.51, -2.82, -0.42, -4.08], ["c", 0.3, -3.66, 2.28, -6.3, 4.95, -6.66], ["z"], ["m", 0.66, 7.41], ["c", -0.27, -0.09, -0.81, -0.12, -1.08, -0.06], ["c", -0.72, 0.18, -1.08, 0.69, -1.23, 1.71], ["c", -0.06, 0.54, -0.06, 3, 0, 3.54], ["c", 0.18, 1.26, 0.72, 1.77, 1.8, 1.74], ["c", 0.39, -0.03, 0.63, -0.09, 0.9, -0.27], ["c", 0.66, -0.42, 0.9, -1.32, 0.9, -3.24], ["c", 0, -2.22, -0.36, -3.12, -1.29, -3.42], ["z"]], w: 9.956, h: 14.982}
        , 'n.7': {d: [["M", 0.21, -14.97], ["c", 0.21, -0.06, 0.45, 0, 0.54, 0.15], ["c", 0.06, 0.09, 0.06, 0.15, 0.06, 0.39], ["c", 0, 0.24, 0, 0.33, 0.06, 0.42], ["c", 0.06, 0.12, 0.21, 0.24, 0.27, 0.24], ["c", 0.03, 0, 0.12, -0.12, 0.24, -0.21], ["c", 0.96, -1.2, 2.58, -1.35, 3.99, -0.42], ["c", 0.15, 0.12, 0.42, 0.3, 0.54, 0.45], ["c", 0.48, 0.39, 0.81, 0.57, 1.29, 0.6], ["c", 0.69, 0.03, 1.5, -0.3, 2.13, -0.87], ["c", 0.09, -0.09, 0.27, -0.3, 0.39, -0.45], ["c", 0.12, -0.15, 0.24, -0.27, 0.3, -0.3], ["c", 0.18, -0.06, 0.39, 0.03, 0.51, 0.21], ["c", 0.06, 0.18, 0.06, 0.24, -0.27, 0.72], ["c", -0.18, 0.24, -0.54, 0.78, -0.78, 1.17], ["c", -2.37, 3.54, -3.54, 6.27, -3.87, 9], ["c", -0.03, 0.33, -0.03, 0.66, -0.03, 1.26], ["c", 0, 0.9, 0, 1.08, 0.15, 1.89], ["c", 0.06, 0.45, 0.06, 0.48, 0.03, 0.6], ["c", -0.06, 0.09, -0.21, 0.21, -0.3, 0.21], ["c", -0.03, 0, -0.27, -0.06, -0.54, -0.15], ["c", -0.84, -0.27, -1.11, -0.3, -1.65, -0.3], ["c", -0.57, 0, -0.84, 0.03, -1.56, 0.27], ["c", -0.6, 0.18, -0.69, 0.21, -0.81, 0.15], ["c", -0.12, -0.06, -0.21, -0.18, -0.21, -0.3], ["c", 0, -0.15, 0.6, -1.44, 1.2, -2.61], ["c", 1.14, -2.22, 2.73, -4.68, 5.1, -8.01], ["c", 0.21, -0.27, 0.36, -0.48, 0.33, -0.48], ["c", 0, 0, -0.12, 0.06, -0.27, 0.12], ["c", -0.54, 0.3, -0.99, 0.39, -1.56, 0.39], ["c", -0.75, 0.03, -1.2, -0.18, -1.83, -0.75], ["c", -0.99, -0.9, -1.83, -1.17, -2.31, -0.72], ["c", -0.18, 0.15, -0.36, 0.51, -0.45, 0.84], ["c", -0.06, 0.24, -0.06, 0.33, -0.09, 1.98], ["c", 0, 1.62, -0.03, 1.74, -0.06, 1.8], ["c", -0.15, 0.24, -0.54, 0.24, -0.69, 0], ["c", -0.06, -0.09, -0.06, -0.15, -0.06, -3.57], ["c", 0, -3.42, 0, -3.48, 0.06, -3.57], ["c", 0.03, -0.06, 0.09, -0.12, 0.15, -0.15], ["z"]], w: 10.561, h: 15.093}
        , 'n.8': {d: [["M", 4.98, -14.97], ["c", 0.33, -0.03, 1.02, -0.03, 1.32, 0], ["c", 1.32, 0.12, 2.49, 0.6, 3.21, 1.32], ["c", 0.39, 0.39, 0.66, 0.81, 0.78, 1.29], ["c", 0.09, 0.36, 0.09, 1.08, 0, 1.44], ["c", -0.21, 0.84, -0.66, 1.59, -1.59, 2.55], ["l", -0.3, 0.3], ["l", 0.27, 0.18], ["c", 1.47, 0.93, 2.31, 2.31, 2.25, 3.75], ["c", -0.03, 0.75, -0.24, 1.35, -0.63, 1.95], ["c", -0.45, 0.66, -1.02, 1.14, -1.83, 1.53], ["c", -1.8, 0.87, -4.2, 0.87, -6, 0.03], ["c", -1.62, -0.78, -2.52, -2.16, -2.46, -3.66], ["c", 0.06, -0.99, 0.54, -1.77, 1.8, -2.97], ["c", 0.54, -0.51, 0.54, -0.54, 0.48, -0.57], ["c", -0.39, -0.27, -0.96, -0.78, -1.2, -1.14], ["c", -0.75, -1.11, -0.87, -2.4, -0.3, -3.6], ["c", 0.69, -1.35, 2.25, -2.25, 4.2, -2.4], ["z"], ["m", 1.53, 0.69], ["c", -0.42, -0.09, -1.11, -0.12, -1.38, -0.06], ["c", -0.3, 0.06, -0.6, 0.18, -0.81, 0.3], ["c", -0.21, 0.12, -0.6, 0.51, -0.72, 0.72], ["c", -0.51, 0.87, -0.42, 1.89, 0.21, 2.52], ["c", 0.21, 0.21, 0.36, 0.3, 1.95, 1.23], ["c", 0.96, 0.54, 1.74, 0.99, 1.77, 1.02], ["c", 0.09, 0, 0.63, -0.6, 0.99, -1.11], ["c", 0.21, -0.36, 0.48, -0.87, 0.57, -1.23], ["c", 0.06, -0.24, 0.06, -0.36, 0.06, -0.72], ["c", 0, -0.45, -0.03, -0.66, -0.15, -0.99], ["c", -0.39, -0.81, -1.29, -1.44, -2.49, -1.68], ["z"], ["m", -1.44, 8.07], ["l", -1.89, -1.08], ["c", -0.03, 0, -0.18, 0.15, -0.39, 0.33], ["c", -1.2, 1.08, -1.65, 1.95, -1.59, 3], ["c", 0.09, 1.59, 1.35, 2.85, 3.21, 3.24], ["c", 0.33, 0.06, 0.45, 0.06, 0.93, 0.06], ["c", 0.63, -0, 0.81, -0.03, 1.29, -0.27], ["c", 0.9, -0.42, 1.47, -1.41, 1.41, -2.4], ["c", -0.06, -0.66, -0.39, -1.29, -0.9, -1.65], ["c", -0.12, -0.09, -1.05, -0.63, -2.07, -1.23], ["z"]], w: 10.926, h: 14.989}
        , 'n.9': {d: [["M", 4.23, -14.97], ["c", 0.42, -0.03, 1.29, 0, 1.62, 0.06], ["c", 0.51, 0.12, 0.93, 0.3, 1.38, 0.57], ["c", 1.53, 1.02, 2.52, 3.24, 2.73, 5.94], ["c", 0.18, 2.55, -0.48, 4.98, -1.83, 6.57], ["c", -1.05, 1.26, -2.4, 1.89, -3.93, 1.83], ["c", -1.23, -0.06, -2.31, -0.45, -3.03, -1.14], ["c", -0.57, -0.51, -0.87, -1.23, -0.84, -1.98], ["c", 0.03, -0.51, 0.21, -0.9, 0.6, -1.26], ["c", 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ["c", 0.21, -0.06, 0.27, -0.06, 0.6, -0.06], ["c", 0.33, -0, 0.39, -0, 0.6, 0.06], ["c", 0.3, 0.12, 0.51, 0.27, 0.75, 0.51], ["c", 0.39, 0.36, 0.57, 0.78, 0.57, 1.26], ["c", 0, 0.27, 0, 0.3, -0.09, 0.42], ["c", -0.03, 0.09, -0.18, 0.21, -0.3, 0.3], ["c", -0.12, 0.09, -0.3, 0.21, -0.39, 0.27], ["c", -0.09, 0.06, -0.21, 0.18, -0.27, 0.24], ["c", -0.06, 0.12, -0.06, 0.15, -0.06, 0.33], ["c", 0, 0.18, 0, 0.24, 0.06, 0.36], ["c", 0.24, 0.39, 0.75, 0.6, 1.38, 0.57], ["c", 0.54, -0.03, 0.9, -0.18, 1.23, -0.48], ["c", 0.81, -0.72, 1.08, -2.16, 0.96, -5.37], ["l", 0, -0.63], ["l", -0.3, 0.12], ["c", -0.78, 0.27, -1.29, 0.33, -2.1, 0.27], ["c", -1.47, -0.12, -2.49, -0.54, -3.27, -1.29], ["c", -0.48, -0.51, -0.81, -1.11, -0.96, -1.89], ["c", -0.06, -0.27, -0.06, -0.42, -0.06, -0.96], ["c", 0, -0.51, 0, -0.66, 0.06, -0.93], ["c", 0.15, -0.78, 0.48, -1.38, 0.96, -1.89], ["c", 0.15, -0.12, 0.33, -0.27, 0.42, -0.36], ["c", 0.69, -0.51, 1.62, -0.81, 2.76, -0.93], ["z"], ["m", 1.17, 0.66], ["c", -0.21, -0.06, -0.57, -0.06, -0.81, -0.03], ["c", -0.78, 0.12, -1.26, 0.69, -1.41, 1.74], ["c", -0.12, 0.63, -0.15, 1.95, -0.09, 2.79], ["c", 0.12, 1.71, 0.63, 2.4, 1.77, 2.46], ["c", 1.08, 0.03, 1.62, -0.48, 1.8, -1.74], ["c", 0.06, -0.54, 0.06, -3, 0, -3.54], ["c", -0.15, -1.05, -0.51, -1.53, -1.26, -1.68], ["z"]], w: 9.959, h: 14.986}
        , 'f': {d: [["M", 9.93, -14.28], ["c", 1.53, -0.18, 2.88, 0.45, 3.12, 1.5], ["c", 0.12, 0.51, 0, 1.32, -0.27, 1.86], ["c", -0.15, 0.3, -0.42, 0.57, -0.63, 0.69], ["c", -0.69, 0.36, -1.56, 0.03, -1.83, -0.69], ["c", -0.09, -0.24, -0.09, -0.69, 0, -0.87], ["c", 0.06, -0.12, 0.21, -0.24, 0.45, -0.42], ["c", 0.42, -0.24, 0.57, -0.45, 0.6, -0.72], ["c", 0.03, -0.33, -0.09, -0.39, -0.63, -0.42], ["c", -0.3, 0, -0.45, 0, -0.6, 0.03], ["c", -0.81, 0.21, -1.35, 0.93, -1.74, 2.46], ["c", -0.06, 0.27, -0.48, 2.25, -0.48, 2.31], ["c", 0, 0.03, 0.39, 0.03, 0.9, 0.03], ["c", 0.72, 0, 0.9, 0, 0.99, 0.06], ["c", 0.42, 0.15, 0.45, 0.72, 0.03, 0.9], ["c", -0.12, 0.06, -0.24, 0.06, -1.17, 0.06], ["l", -1.05, 0], ["l", -0.78, 2.55], ["c", -0.45, 1.41, -0.87, 2.79, -0.96, 3.06], ["c", -0.87, 2.37, -2.37, 4.74, -3.78, 5.91], ["c", -1.05, 0.9, -2.04, 1.23, -3.09, 1.08], ["c", -1.11, -0.18, -1.89, -0.78, -2.04, -1.59], ["c", -0.12, -0.66, 0.15, -1.71, 0.54, -2.19], ["c", 0.69, -0.75, 1.86, -0.54, 2.22, 0.39], ["c", 0.06, 0.15, 0.09, 0.27, 0.09, 0.48], ["c", -0, 0.24, -0.03, 0.27, -0.12, 0.42], ["c", -0.03, 0.09, -0.15, 0.18, -0.27, 0.27], ["c", -0.09, 0.06, -0.27, 0.21, -0.36, 0.27], ["c", -0.24, 0.18, -0.36, 0.36, -0.39, 0.6], ["c", -0.03, 0.33, 0.09, 0.39, 0.63, 0.42], ["c", 0.42, 0, 0.63, -0.03, 0.9, -0.15], ["c", 0.6, -0.3, 0.96, -0.96, 1.38, -2.64], ["c", 0.09, -0.42, 0.63, -2.55, 1.17, -4.77], ["l", 1.02, -4.08], ["c", -0, -0.03, -0.36, -0.03, -0.81, -0.03], ["c", -0.72, 0, -0.81, 0, -0.93, -0.06], ["c", -0.42, -0.18, -0.39, -0.75, 0.03, -0.9], ["c", 0.09, -0.06, 0.27, -0.06, 1.05, -0.06], ["l", 0.96, 0], ["l", 0, -0.09], ["c", 0.06, -0.18, 0.3, -0.72, 0.51, -1.17], ["c", 1.2, -2.46, 3.3, -4.23, 5.34, -4.5], ["z"]], w: 16.155, h: 19.445}
        , 'm': {d: [["M", 2.79, -8.91], ["c", 0.09, 0, 0.3, -0.03, 0.45, -0.03], ["c", 0.24, 0.03, 0.3, 0.03, 0.45, 0.12], ["c", 0.36, 0.15, 0.63, 0.54, 0.75, 1.02], ["l", 0.03, 0.21], ["l", 0.33, -0.3], ["c", 0.69, -0.69, 1.38, -1.02, 2.07, -1.02], ["c", 0.27, 0, 0.33, 0, 0.48, 0.06], ["c", 0.21, 0.09, 0.48, 0.36, 0.63, 0.6], ["c", 0.03, 0.09, 0.12, 0.27, 0.18, 0.42], ["c", 0.03, 0.15, 0.09, 0.27, 0.12, 0.27], ["c", 0, 0, 0.09, -0.09, 0.18, -0.21], ["c", 0.33, -0.39, 0.87, -0.81, 1.29, -0.99], ["c", 0.78, -0.33, 1.47, -0.21, 2.01, 0.33], ["c", 0.3, 0.33, 0.48, 0.69, 0.6, 1.14], ["c", 0.09, 0.42, 0.06, 0.54, -0.54, 3.06], ["c", -0.33, 1.29, -0.57, 2.4, -0.57, 2.43], ["c", 0, 0.12, 0.09, 0.21, 0.21, 0.21], ["c", 0.24, -0, 0.75, -0.3, 1.2, -0.72], ["c", 0.45, -0.39, 0.6, -0.45, 0.78, -0.27], ["c", 0.18, 0.18, 0.09, 0.36, -0.45, 0.87], ["c", -1.05, 0.96, -1.83, 1.47, -2.58, 1.71], ["c", -0.93, 0.33, -1.53, 0.21, -1.8, -0.33], ["c", -0.06, -0.15, -0.06, -0.21, -0.06, -0.45], ["c", 0, -0.24, 0.03, -0.48, 0.6, -2.82], ["c", 0.42, -1.71, 0.6, -2.64, 0.63, -2.79], ["c", 0.03, -0.57, -0.3, -0.75, -0.84, -0.48], ["c", -0.24, 0.12, -0.54, 0.39, -0.66, 0.63], ["c", -0.03, 0.09, -0.42, 1.38, -0.9, 3], ["c", -0.9, 3.15, -0.84, 3, -1.14, 3.15], ["l", -0.15, 0.09], ["l", -0.78, 0], ["c", -0.6, 0, -0.78, 0, -0.84, -0.06], ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ["c", 0, -0.03, 0.36, -1.38, 0.84, -2.97], ["c", 0.57, -2.04, 0.81, -2.97, 0.84, -3.12], ["c", 0.03, -0.54, -0.3, -0.72, -0.84, -0.45], ["c", -0.24, 0.12, -0.57, 0.42, -0.66, 0.63], ["c", -0.06, 0.09, -0.51, 1.44, -1.05, 2.97], ["c", -0.51, 1.56, -0.99, 2.85, -0.99, 2.91], ["c", -0.06, 0.12, -0.21, 0.24, -0.36, 0.3], ["c", -0.12, 0.06, -0.21, 0.06, -0.9, 0.06], ["c", -0.6, 0, -0.78, 0, -0.84, -0.06], ["c", -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ["c", 0, -0.03, 0.45, -1.38, 0.99, -2.97], ["c", 1.05, -3.18, 1.05, -3.18, 0.93, -3.45], ["c", -0.12, -0.27, -0.39, -0.3, -0.72, -0.15], ["c", -0.54, 0.27, -1.14, 1.17, -1.56, 2.4], ["c", -0.06, 0.15, -0.15, 0.3, -0.18, 0.36], ["c", -0.21, 0.21, -0.57, 0.27, -0.72, 0.09], ["c", -0.09, -0.09, -0.06, -0.21, 0.06, -0.63], ["c", 0.48, -1.26, 1.26, -2.46, 2.01, -3.21], ["c", 0.57, -0.54, 1.2, -0.87, 1.83, -1.02], ["z"]], w: 14.687, h: 9.126}
        , 'p': {d: [["M", 1.92, -8.7], ["c", 0.27, -0.09, 0.81, -0.06, 1.11, 0.03], ["c", 0.54, 0.18, 0.93, 0.51, 1.17, 0.99], ["c", 0.09, 0.15, 0.15, 0.33, 0.18, 0.36], ["l", -0, 0.12], ["l", 0.3, -0.27], ["c", 0.66, -0.6, 1.35, -1.02, 2.13, -1.2], ["c", 0.21, -0.06, 0.33, -0.06, 0.78, -0.06], ["c", 0.45, 0, 0.51, 0, 0.84, 0.09], ["c", 1.29, 0.33, 2.07, 1.32, 2.25, 2.79], ["c", 0.09, 0.81, -0.09, 2.01, -0.45, 2.79], ["c", -0.54, 1.26, -1.86, 2.55, -3.18, 3.03], ["c", -0.45, 0.18, -0.81, 0.24, -1.29, 0.24], ["c", -0.69, -0.03, -1.35, -0.18, -1.86, -0.45], ["c", -0.3, -0.15, -0.51, -0.18, -0.69, -0.09], ["c", -0.09, 0.03, -0.18, 0.09, -0.18, 0.12], ["c", -0.09, 0.12, -1.05, 2.94, -1.05, 3.06], ["c", 0, 0.24, 0.18, 0.48, 0.51, 0.63], ["c", 0.18, 0.06, 0.54, 0.15, 0.75, 0.15], ["c", 0.21, 0, 0.36, 0.06, 0.42, 0.18], ["c", 0.12, 0.18, 0.06, 0.42, -0.12, 0.54], ["c", -0.09, 0.03, -0.15, 0.03, -0.78, 0], ["c", -1.98, -0.15, -3.81, -0.15, -5.79, 0], ["c", -0.63, 0.03, -0.69, 0.03, -0.78, 0], ["c", -0.24, -0.15, -0.24, -0.57, 0.03, -0.66], ["c", 0.06, -0.03, 0.48, -0.09, 0.99, -0.12], ["c", 0.87, -0.06, 1.11, -0.09, 1.35, -0.21], ["c", 0.18, -0.06, 0.33, -0.18, 0.39, -0.3], ["c", 0.06, -0.12, 3.24, -9.42, 3.27, -9.6], ["c", 0.06, -0.33, 0.03, -0.57, -0.15, -0.69], ["c", -0.09, -0.06, -0.12, -0.06, -0.3, -0.06], ["c", -0.69, 0.06, -1.53, 1.02, -2.28, 2.61], ["c", -0.09, 0.21, -0.21, 0.45, -0.27, 0.51], ["c", -0.09, 0.12, -0.33, 0.24, -0.48, 0.24], ["c", -0.18, 0, -0.36, -0.15, -0.36, -0.3], ["c", 0, -0.24, 0.78, -1.83, 1.26, -2.55], ["c", 0.72, -1.11, 1.47, -1.74, 2.28, -1.92], ["z"], ["m", 5.37, 1.47], ["c", -0.27, -0.12, -0.75, -0.03, -1.14, 0.21], ["c", -0.75, 0.48, -1.47, 1.68, -1.89, 3.15], ["c", -0.45, 1.47, -0.42, 2.34, 0, 2.7], ["c", 0.45, 0.39, 1.26, 0.21, 1.83, -0.36], ["c", 0.51, -0.51, 0.99, -1.68, 1.38, -3.27], ["c", 0.3, -1.17, 0.33, -1.74, 0.15, -2.13], ["c", -0.09, -0.15, -0.15, -0.21, -0.33, -0.3], ["z"]], w: 14.689, h: 13.127}
        , 'r': {d: [["M", 6.33, -9.12], ["c", 0.27, -0.03, 0.93, 0, 1.2, 0.06], ["c", 0.84, 0.21, 1.23, 0.81, 1.02, 1.53], ["c", -0.24, 0.75, -0.9, 1.17, -1.56, 0.96], ["c", -0.33, -0.09, -0.51, -0.3, -0.66, -0.75], ["c", -0.03, -0.12, -0.09, -0.24, -0.12, -0.3], ["c", -0.09, -0.15, -0.3, -0.24, -0.48, -0.24], ["c", -0.57, 0, -1.38, 0.54, -1.65, 1.08], ["c", -0.06, 0.15, -0.33, 1.17, -0.9, 3.27], ["c", -0.57, 2.31, -0.81, 3.12, -0.87, 3.21], ["c", -0.03, 0.06, -0.12, 0.15, -0.18, 0.21], ["l", -0.12, 0.06], ["l", -0.81, 0.03], ["c", -0.69, 0, -0.81, 0, -0.9, -0.03], ["c", -0.09, -0.06, -0.18, -0.21, -0.18, -0.3], ["c", 0, -0.06, 0.39, -1.62, 0.9, -3.51], ["c", 0.84, -3.24, 0.87, -3.45, 0.87, -3.72], ["c", 0, -0.21, 0, -0.27, -0.03, -0.36], ["c", -0.12, -0.15, -0.21, -0.24, -0.42, -0.24], ["c", -0.24, 0, -0.45, 0.15, -0.78, 0.42], ["c", -0.33, 0.36, -0.45, 0.54, -0.72, 1.14], ["c", -0.03, 0.12, -0.21, 0.24, -0.36, 0.27], ["c", -0.12, 0, -0.15, 0, -0.24, -0.06], ["c", -0.18, -0.12, -0.18, -0.21, -0.06, -0.54], ["c", 0.21, -0.57, 0.42, -0.93, 0.78, -1.32], ["c", 0.54, -0.51, 1.2, -0.81, 1.95, -0.87], ["c", 0.81, -0.03, 1.53, 0.3, 1.92, 0.87], ["l", 0.12, 0.18], ["l", 0.09, -0.09], ["c", 0.57, -0.45, 1.41, -0.84, 2.19, -0.96], ["z"]], w: 9.41, h: 9.132}
        , 's': {d: [["M", 4.47, -8.73], ["c", 0.09, 0, 0.36, -0.03, 0.57, -0.03], ["c", 0.75, 0.03, 1.29, 0.24, 1.71, 0.63], ["c", 0.51, 0.54, 0.66, 1.26, 0.36, 1.83], ["c", -0.24, 0.42, -0.63, 0.57, -1.11, 0.42], ["c", -0.33, -0.09, -0.6, -0.36, -0.6, -0.57], ["c", 0, -0.03, 0.06, -0.21, 0.15, -0.39], ["c", 0.12, -0.21, 0.15, -0.33, 0.18, -0.48], ["c", 0, -0.24, -0.06, -0.48, -0.15, -0.6], ["c", -0.15, -0.21, -0.42, -0.24, -0.75, -0.15], ["c", -0.27, 0.06, -0.48, 0.18, -0.69, 0.36], ["c", -0.39, 0.39, -0.51, 0.96, -0.33, 1.38], ["c", 0.09, 0.21, 0.42, 0.51, 0.78, 0.72], ["c", 1.11, 0.69, 1.59, 1.11, 1.89, 1.68], ["c", 0.21, 0.39, 0.24, 0.78, 0.15, 1.29], ["c", -0.18, 1.2, -1.17, 2.16, -2.52, 2.52], ["c", -1.02, 0.24, -1.95, 0.12, -2.7, -0.42], ["c", -0.72, -0.51, -0.99, -1.47, -0.6, -2.19], ["c", 0.24, -0.48, 0.72, -0.63, 1.17, -0.42], ["c", 0.33, 0.18, 0.54, 0.45, 0.57, 0.81], ["c", 0, 0.21, -0.03, 0.3, -0.33, 0.51], ["c", -0.33, 0.24, -0.39, 0.42, -0.27, 0.69], ["c", 0.06, 0.15, 0.21, 0.27, 0.45, 0.33], ["c", 0.3, 0.09, 0.87, 0.09, 1.2, -0], ["c", 0.75, -0.21, 1.23, -0.72, 1.29, -1.35], ["c", 0.03, -0.42, -0.15, -0.81, -0.54, -1.2], ["c", -0.24, -0.24, -0.48, -0.42, -1.41, -1.02], ["c", -0.69, -0.42, -1.05, -0.93, -1.05, -1.47], ["c", 0, -0.39, 0.12, -0.87, 0.3, -1.23], ["c", 0.27, -0.57, 0.78, -1.05, 1.38, -1.35], ["c", 0.24, -0.12, 0.63, -0.27, 0.9, -0.3], ["z"]], w: 6.632, h: 8.758}
        , 'z': {d: [["M", 2.64, -7.95], ["c", 0.36, -0.09, 0.81, -0.03, 1.71, 0.27], ["c", 0.78, 0.21, 0.96, 0.27, 1.74, 0.3], ["c", 0.87, 0.06, 1.02, 0.03, 1.38, -0.21], ["c", 0.21, -0.15, 0.33, -0.15, 0.48, -0.06], ["c", 0.15, 0.09, 0.21, 0.3, 0.15, 0.45], ["c", -0.03, 0.06, -1.26, 1.26, -2.76, 2.67], ["l", -2.73, 2.55], ["l", 0.54, 0.03], ["c", 0.54, 0.03, 0.72, 0.03, 2.01, 0.15], ["c", 0.36, 0.03, 0.9, 0.06, 1.2, 0.09], ["c", 0.66, 0, 0.81, -0.03, 1.02, -0.24], ["c", 0.3, -0.3, 0.39, -0.72, 0.27, -1.23], ["c", -0.06, -0.27, -0.06, -0.27, -0.03, -0.39], ["c", 0.15, -0.3, 0.54, -0.27, 0.69, 0.03], ["c", 0.15, 0.33, 0.27, 1.02, 0.27, 1.5], ["c", 0, 1.47, -1.11, 2.7, -2.52, 2.79], ["c", -0.57, 0.03, -1.02, -0.09, -2.01, -0.51], ["c", -1.02, -0.42, -1.23, -0.48, -2.13, -0.54], ["c", -0.81, -0.06, -0.96, -0.03, -1.26, 0.18], ["c", -0.12, 0.06, -0.24, 0.12, -0.27, 0.12], ["c", -0.27, 0, -0.45, -0.3, -0.36, -0.51], ["c", 0.03, -0.06, 1.32, -1.32, 2.91, -2.79], ["l", 2.88, -2.73], ["c", -0.03, 0, -0.21, 0.03, -0.42, 0.06], ["c", -0.21, 0.03, -0.78, 0.09, -1.23, 0.12], ["c", -1.11, 0.12, -1.23, 0.15, -1.95, 0.27], ["c", -0.72, 0.15, -1.17, 0.18, -1.29, 0.09], ["c", -0.27, -0.18, -0.21, -0.75, 0.12, -1.26], ["c", 0.39, -0.6, 0.93, -1.02, 1.59, -1.2], ["z"]], w: 8.573, h: 8.743}
        , '+': {d: [["M", 3.48, -11.19], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", 0, 1.29], ["l", 0, 1.29], ["l", 1.29, 0], ["c", 1.23, 0, 1.29, 0, 1.41, 0.06], ["c", 0.06, 0.03, 0.15, 0.09, 0.18, 0.12], ["c", 0.12, 0.09, 0.21, 0.33, 0.21, 0.48], ["c", 0, 0.15, -0.09, 0.39, -0.21, 0.48], ["c", -0.03, 0.03, -0.12, 0.09, -0.18, 0.12], ["c", -0.12, 0.06, -0.18, 0.06, -1.41, 0.06], ["l", -1.29, 0], ["l", 0, 1.29], ["c", 0, 1.23, 0, 1.29, -0.06, 1.41], ["c", -0.09, 0.18, -0.15, 0.24, -0.3, 0.33], ["c", -0.21, 0.09, -0.39, 0.09, -0.57, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.41], ["l", 0, -1.29], ["l", -1.29, 0], ["c", -1.23, 0, -1.29, 0, -1.41, -0.06], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.09, -0.36, 0, -0.54], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["l", 0.15, -0.06], ["l", 1.26, 0], ["l", 1.29, 0], ["l", 0, -1.29], ["c", 0, -1.23, 0, -1.29, 0.06, -1.41], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 7.507, h: 7.515}
        , ',': {d: [["M", 1.32, -3.36], ["c", 0.57, -0.15, 1.17, 0.03, 1.59, 0.45], ["c", 0.45, 0.45, 0.6, 0.96, 0.51, 1.89], ["c", -0.09, 1.23, -0.42, 2.46, -0.99, 3.93], ["c", -0.3, 0.72, -0.72, 1.62, -0.78, 1.68], ["c", -0.18, 0.21, -0.51, 0.18, -0.66, -0.06], ["c", -0.03, -0.06, -0.06, -0.15, -0.06, -0.18], ["c", 0, -0.06, 0.12, -0.33, 0.24, -0.63], ["c", 0.84, -1.8, 1.02, -2.61, 0.69, -3.24], ["c", -0.12, -0.24, -0.27, -0.36, -0.75, -0.6], ["c", -0.36, -0.15, -0.42, -0.21, -0.6, -0.39], ["c", -0.69, -0.69, -0.69, -1.71, 0, -2.4], ["c", 0.21, -0.21, 0.51, -0.39, 0.81, -0.45], ["z"]], w: 3.452, h: 8.143}
        , '-': {d: [["M", 0.18, -5.34], ["c", 0.09, -0.06, 0.15, -0.06, 2.31, -0.06], ["c", 2.46, 0, 2.37, 0, 2.46, 0.21], ["c", 0.12, 0.21, 0.03, 0.42, -0.15, 0.54], ["c", -0.09, 0.06, -0.15, 0.06, -2.28, 0.06], ["c", -2.16, 0, -2.22, 0, -2.31, -0.06], ["c", -0.27, -0.15, -0.27, -0.54, -0.03, -0.69], ["z"]], w: 5.001, h: 0.81}
        , '.': {d: [["M", 1.32, -3.36], ["c", 1.05, -0.27, 2.1, 0.57, 2.1, 1.65], ["c", 0, 1.08, -1.05, 1.92, -2.1, 1.65], ["c", -0.9, -0.21, -1.5, -1.14, -1.26, -2.04], ["c", 0.12, -0.63, 0.63, -1.11, 1.26, -1.26], ["z"]], w: 3.413, h: 3.402}
        , 'accidentals.nat': {d: [["M", 0.204, -11.4], ["c", 0.24, -0.06, 0.78, 0, 0.99, 0.15], ["c", 0.03, 0.03, 0.03, 0.48, 0, 2.61], ["c", -0.03, 1.44, -0.03, 2.61, -0.03, 2.61], ["c", 0, 0.03, 0.75, -0.09, 1.68, -0.24], ["c", 0.96, -0.18, 1.71, -0.27, 1.74, -0.27], ["c", 0.15, 0.03, 0.27, 0.15, 0.36, 0.3], ["l", 0.06, 0.12], ["l", 0.09, 8.67], ["c", 0.09, 6.96, 0.12, 8.67, 0.09, 8.67], ["c", -0.03, 0.03, -0.12, 0.06, -0.21, 0.09], ["c", -0.24, 0.09, -0.72, 0.09, -0.96, 0], ["c", -0.09, -0.03, -0.18, -0.06, -0.21, -0.09], ["c", -0.03, -0.03, -0.03, -0.48, 0, -2.61], ["c", 0.03, -1.44, 0.03, -2.61, 0.03, -2.61], ["c", 0, -0.03, -0.75, 0.09, -1.68, 0.24], ["c", -0.96, 0.18, -1.71, 0.27, -1.74, 0.27], ["c", -0.15, -0.03, -0.27, -0.15, -0.36, -0.3], ["l", -0.06, -0.15], ["l", -0.09, -7.53], ["c", -0.06, -4.14, -0.09, -8.04, -0.12, -8.67], ["l", 0, -1.11], ["l", 0.15, -0.06], ["c", 0.09, -0.03, 0.21, -0.06, 0.27, -0.09], ["z"], ["m", 3.75, 8.4], ["c", 0, -0.33, 0, -0.42, -0.03, -0.42], ["c", -0.12, 0, -2.79, 0.45, -2.79, 0.48], ["c", -0.03, 0, -0.09, 6.3, -0.09, 6.33], ["c", 0.03, 0, 2.79, -0.45, 2.82, -0.48], ["c", 0, 0, 0.09, -4.53, 0.09, -5.91], ["z"]], w: 5.411, h: 22.8}
        , 'accidentals.sharp': {d: [["M", 5.73, -11.19], ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.31], ["c", 0, 1.23, 0, 2.22, 0.03, 2.22], ["c", 0, -0, 0.27, -0.12, 0.6, -0.24], ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ["c", 0, 1.02, 0, 1.11, -0.06, 1.2], ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ["l", -0.75, 0.33], ["l", -0.03, 2.43], ["c", 0, 1.32, 0, 2.43, 0.03, 2.43], ["c", 0, -0, 0.27, -0.12, 0.6, -0.24], ["c", 0.69, -0.27, 0.78, -0.3, 0.96, -0.15], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ["c", 0, 1.02, 0, 1.11, -0.06, 1.2], ["c", -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ["c", -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ["l", -0.75, 0.33], ["l", -0.03, 2.52], ["c", 0, 2.28, -0.03, 2.55, -0.06, 2.64], ["c", -0.21, 0.36, -0.72, 0.36, -0.93, -0], ["c", -0.03, -0.09, -0.06, -0.33, -0.06, -2.43], ["l", 0, -2.31], ["l", -1.29, 0.51], ["l", -1.26, 0.51], ["l", 0, 2.43], ["c", 0, 2.58, 0, 2.52, -0.15, 2.67], ["c", -0.06, 0.09, -0.27, 0.18, -0.36, 0.18], ["c", -0.12, -0, -0.33, -0.09, -0.39, -0.18], ["c", -0.15, -0.15, -0.15, -0.09, -0.15, -2.43], ["c", 0, -1.23, 0, -2.22, -0.03, -2.22], ["c", 0, -0, -0.27, 0.12, -0.6, 0.24], ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ["c", 0, -1.02, 0, -1.11, 0.06, -1.2], ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ["l", 0.78, -0.33], ["l", 0, -2.43], ["c", 0, -1.32, 0, -2.43, -0.03, -2.43], ["c", 0, -0, -0.27, 0.12, -0.6, 0.24], ["c", -0.69, 0.27, -0.78, 0.3, -0.96, 0.15], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ["c", 0, -1.02, 0, -1.11, 0.06, -1.2], ["c", 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ["c", 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ["l", 0.78, -0.33], ["l", 0, -2.52], ["c", 0, -2.28, 0.03, -2.55, 0.06, -2.64], ["c", 0.21, -0.36, 0.72, -0.36, 0.93, 0], ["c", 0.03, 0.09, 0.06, 0.33, 0.06, 2.43], ["l", 0.03, 2.31], ["l", 1.26, -0.51], ["l", 1.26, -0.51], ["l", 0, -2.43], ["c", 0, -2.28, 0, -2.43, 0.06, -2.55], ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ["z"], ["m", -0.33, 10.65], ["l", 0, -2.43], ["l", -1.29, 0.51], ["l", -1.26, 0.51], ["l", 0, 2.46], ["l", 0, 2.43], ["l", 0.09, -0.03], ["c", 0.06, -0.03, 0.63, -0.27, 1.29, -0.51], ["l", 1.17, -0.48], ["l", 0, -2.46], ["z"]], w: 8.25, h: 22.462}
        , 'accidentals.flat': {d: [["M", -0.36, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ["c", -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ["c", 0, 0.03, 0.12, -0.03, 0.24, -0.12], ["c", 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ["c", 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ["c", 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ["c", 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ["c", -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ["c", -1.14, 0.78, -1.44, 1.02, -1.8, 1.44], ["c", -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ["c", -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ["c", -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ["l", 0, -0.78], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", 3.18, 11.01], ["c", -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ["c", -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.87], ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9], ["l", 0.03, 0.12], ["l", 0.45, -0.39], ["c", 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ["c", 0.3, -0.42, 0.6, -0.99, 0.72, -1.41], ["c", 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ["c", -0.15, -0.3, -0.33, -0.51, -0.6, -0.63], ["z"]], w: 6.75, h: 18.801}
        , 'accidentals.halfsharp': {d: [["M", 2.43, -10.05], ["c", 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ["c", 0.06, 0.12, 0.06, 0.21, 0.06, 2.01], ["c", 0, 1.05, 0, 1.89, 0.03, 1.89], ["l", 0.72, -0.48], ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23], ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ["l", -0.99, 0.66], ["l", 0, 2.37], ["c", 0, 1.32, 0, 2.37, 0.03, 2.37], ["l", 0.72, -0.48], ["c", 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ["c", 0.15, 0, 0.18, 0.03, 0.27, 0.09], ["c", 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ["c", 0, 1.11, -0.03, 1.14, -0.09, 1.23], ["c", -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ["l", -0.99, 0.66], ["l", 0, 2.25], ["c", 0, 1.95, 0, 2.28, -0.06, 2.37], ["c", -0.06, 0.12, -0.12, 0.21, -0.24, 0.27], ["c", -0.27, 0.12, -0.54, 0.03, -0.69, -0.24], ["c", -0.06, -0.12, -0.06, -0.21, -0.06, -2.01], ["c", 0, -1.05, 0, -1.89, -0.03, -1.89], ["l", -0.72, 0.48], ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ["c", -0.15, 0, -0.18, 0, -0.27, -0.06], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23], ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ["l", 0.99, -0.66], ["l", 0, -2.37], ["c", 0, -1.32, 0, -2.37, -0.03, -2.37], ["l", -0.72, 0.48], ["c", -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ["c", -0.15, 0, -0.18, 0, -0.27, -0.06], ["c", -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ["c", 0, -1.11, 0.03, -1.14, 0.09, -1.23], ["c", 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ["l", 0.99, -0.66], ["l", 0, -2.25], ["c", 0, -2.13, 0, -2.28, 0.06, -2.4], ["c", 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ["z"]], w: 5.25, h: 20.174}
        , 'accidentals.dblsharp': {d: [["M", -0.186, -3.96], ["c", 0.06, -0.03, 0.12, -0.06, 0.15, -0.06], ["c", 0.09, 0, 2.76, 0.27, 2.79, 0.3], ["c", 0.12, 0.03, 0.15, 0.12, 0.15, 0.51], ["c", 0.06, 0.96, 0.24, 1.59, 0.57, 2.1], ["c", 0.06, 0.09, 0.15, 0.21, 0.18, 0.24], ["l", 0.09, 0.06], ["l", 0.09, -0.06], ["c", 0.03, -0.03, 0.12, -0.15, 0.18, -0.24], ["c", 0.33, -0.51, 0.51, -1.14, 0.57, -2.1], ["c", 0, -0.39, 0.03, -0.45, 0.12, -0.51], ["c", 0.03, 0, 0.66, -0.09, 1.44, -0.15], ["c", 1.47, -0.15, 1.5, -0.15, 1.56, -0.03], ["c", 0.03, 0.06, 0, 0.42, -0.09, 1.44], ["c", -0.09, 0.72, -0.15, 1.35, -0.15, 1.38], ["c", 0, 0.03, -0.03, 0.09, -0.06, 0.12], ["c", -0.06, 0.06, -0.12, 0.09, -0.51, 0.09], ["c", -1.08, 0.06, -1.8, 0.3, -2.28, 0.75], ["l", -0.12, 0.09], ["l", 0.09, 0.09], ["c", 0.12, 0.15, 0.39, 0.33, 0.63, 0.45], ["c", 0.42, 0.18, 0.96, 0.27, 1.68, 0.33], ["c", 0.39, -0, 0.45, 0.03, 0.51, 0.09], ["c", 0.03, 0.03, 0.06, 0.09, 0.06, 0.12], ["c", 0, 0.03, 0.06, 0.66, 0.15, 1.38], ["c", 0.09, 1.02, 0.12, 1.38, 0.09, 1.44], ["c", -0.06, 0.12, -0.09, 0.12, -1.56, -0.03], ["c", -0.78, -0.06, -1.41, -0.15, -1.44, -0.15], ["c", -0.09, -0.06, -0.12, -0.12, -0.12, -0.54], ["c", -0.06, -0.93, -0.24, -1.56, -0.57, -2.07], ["c", -0.06, -0.09, -0.15, -0.21, -0.18, -0.24], ["l", -0.09, -0.06], ["l", -0.09, 0.06], ["c", -0.03, 0.03, -0.12, 0.15, -0.18, 0.24], ["c", -0.33, 0.51, -0.51, 1.14, -0.57, 2.07], ["c", 0, 0.42, -0.03, 0.48, -0.12, 0.54], ["c", -0.03, 0, -0.66, 0.09, -1.44, 0.15], ["c", -1.47, 0.15, -1.5, 0.15, -1.56, 0.03], ["c", -0.03, -0.06, 0, -0.42, 0.09, -1.44], ["c", 0.09, -0.72, 0.15, -1.35, 0.15, -1.38], ["c", 0, -0.03, 0.03, -0.09, 0.06, -0.12], ["c", 0.06, -0.06, 0.12, -0.09, 0.51, -0.09], ["c", 0.72, -0.06, 1.26, -0.15, 1.68, -0.33], ["c", 0.24, -0.12, 0.51, -0.3, 0.63, -0.45], ["l", 0.09, -0.09], ["l", -0.12, -0.09], ["c", -0.48, -0.45, -1.2, -0.69, -2.28, -0.75], ["c", -0.39, 0, -0.45, -0.03, -0.51, -0.09], ["c", -0.03, -0.03, -0.06, -0.09, -0.06, -0.12], ["c", 0, -0.03, -0.06, -0.63, -0.12, -1.38], ["c", -0.09, -0.72, -0.15, -1.35, -0.15, -1.38], ["z"]], w: 7.961, h: 7.977}
        , 'accidentals.halfflat': {d: [["M", 4.83, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.6, -0.12, 9.06], ["c", -0.09, 5.55, -0.15, 9.06, -0.18, 9.12], ["c", -0.03, 0.09, -0.09, 0.18, -0.15, 0.27], ["c", -0.24, 0.21, -0.54, 0.24, -0.81, 0.06], ["c", -0.06, -0.03, -0.27, -0.24, -0.45, -0.42], ["c", -0.36, -0.42, -0.66, -0.66, -1.8, -1.44], ["c", -1.23, -0.84, -1.83, -1.32, -2.25, -1.77], ["c", -0.66, -0.78, -0.96, -1.56, -0.93, -2.46], ["c", 0.09, -1.41, 1.11, -2.58, 2.4, -2.79], ["c", 0.3, -0.06, 0.84, -0.03, 1.23, 0.06], ["c", 0.54, 0.12, 1.08, 0.33, 1.53, 0.63], ["c", 0.12, 0.09, 0.24, 0.15, 0.24, 0.12], ["c", 0, 0, -0.12, -8.37, -0.18, -9.75], ["l", 0, -0.66], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", -1.65, 10.95], ["c", -0.6, -0.18, -1.08, 0.09, -1.38, 0.69], ["c", -0.27, 0.6, -0.36, 1.38, -0.18, 2.07], ["c", 0.12, 0.42, 0.42, 0.99, 0.72, 1.41], ["c", 0.3, 0.42, 0.93, 1.05, 1.56, 1.59], ["l", 0.48, 0.39], ["l", 0, -0.12], ["c", 0.03, -0.09, 0.03, -0.48, 0.06, -0.9], ["c", 0.03, -0.57, 0.03, -1.08, 0, -2.22], ["c", -0.03, -1.62, -0.03, -1.62, -0.24, -2.07], ["c", -0.21, -0.42, -0.6, -0.75, -1.02, -0.84], ["z"]], w: 6.728, h: 18.801}
        , 'accidentals.dblflat': {d: [["M", -0.36, -14.07], ["c", 0.33, -0.06, 0.87, 0, 1.08, 0.15], ["c", 0.06, 0.03, 0.06, 0.33, -0.03, 4.89], ["c", -0.06, 2.67, -0.09, 5.01, -0.09, 5.22], ["l", 0, 0.36], ["l", 0.15, -0.15], ["c", 0.36, -0.3, 0.75, -0.51, 1.2, -0.63], ["c", 0.33, -0.09, 0.96, -0.09, 1.26, -0.03], ["c", 0.27, 0.09, 0.63, 0.27, 0.87, 0.45], ["l", 0.21, 0.15], ["l", 0, -0.27], ["c", 0, -0.15, -0.03, -2.43, -0.09, -5.1], ["c", -0.09, -4.56, -0.09, -4.86, -0.03, -4.89], ["c", 0.15, -0.12, 0.39, -0.15, 0.72, -0.15], ["c", 0.3, 0, 0.54, 0.03, 0.69, 0.15], ["c", 0.06, 0.03, 0.06, 0.33, -0.03, 4.95], ["c", -0.06, 2.7, -0.09, 5.04, -0.09, 5.22], ["l", 0.03, 0.3], ["l", 0.21, -0.15], ["c", 0.69, -0.48, 1.44, -0.69, 2.28, -0.69], ["c", 0.51, 0, 0.78, 0.03, 1.2, 0.21], ["c", 1.32, 0.63, 2.01, 2.28, 1.53, 3.69], ["c", -0.21, 0.57, -0.51, 1.02, -1.05, 1.56], ["c", -0.42, 0.42, -0.81, 0.72, -1.92, 1.5], ["c", -1.26, 0.87, -1.5, 1.08, -1.86, 1.5], ["c", -0.39, 0.45, -0.54, 0.54, -0.81, 0.51], ["c", -0.18, 0, -0.21, 0, -0.33, -0.06], ["l", -0.21, -0.21], ["l", -0.06, -0.12], ["l", -0.03, -0.99], ["c", -0.03, -0.54, -0.03, -1.29, -0.06, -1.68], ["l", 0, -0.69], ["l", -0.21, 0.24], ["c", -0.36, 0.42, -0.75, 0.75, -1.8, 1.62], ["c", -1.02, 0.84, -1.2, 0.99, -1.44, 1.38], ["c", -0.36, 0.51, -0.54, 0.6, -0.9, 0.51], ["c", -0.15, -0.03, -0.39, -0.27, -0.42, -0.42], ["c", -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ["c", -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ["l", 0, -0.78], ["l", 0.12, -0.06], ["c", 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ["z"], ["m", 2.52, 10.98], ["c", -0.18, -0.09, -0.48, -0.12, -0.66, -0.06], ["c", -0.39, 0.15, -0.69, 0.54, -0.84, 1.14], ["c", -0.06, 0.24, -0.06, 0.39, -0.09, 1.74], ["c", -0.03, 1.44, 0, 2.73, 0.06, 3.18], ["l", 0.03, 0.15], ["l", 0.27, -0.27], ["c", 0.93, -0.96, 1.5, -1.95, 1.74, -3.06], ["c", 0.06, -0.27, 0.06, -0.39, 0.06, -0.96], ["c", 0, -0.54, 0, -0.69, -0.06, -0.93], ["c", -0.09, -0.51, -0.27, -0.81, -0.51, -0.93], ["z"], ["m", 5.43, 0], ["c", -0.18, -0.09, -0.51, -0.12, -0.72, -0.06], ["c", -0.54, 0.12, -0.96, 0.63, -1.17, 1.26], ["c", -0.06, 0.3, -0.12, 2.88, -0.06, 3.9], ["c", 0.03, 0.42, 0.03, 0.81, 0.06, 0.9], ["l", 0.03, 0.12], ["l", 0.36, -0.3], ["c", 0.42, -0.36, 1.02, -0.96, 1.29, -1.29], ["c", 0.36, -0.45, 0.66, -0.99, 0.81, -1.41], ["c", 0.42, -1.23, 0.15, -2.76, -0.6, -3.12], ["z"]], w: 11.613, h: 18.804}
        , 'clefs.C': {d: [["M", 0.06, -14.94], ["l", 0.09, -0.06], ["l", 1.92, 0], ["l", 1.92, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 14.85], ["l", 0, 14.82], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.92, 0], ["l", -1.92, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -14.82], ["l", 0, -14.85], ["z"], ["m", 5.37, 0], ["c", 0.09, -0.06, 0.09, -0.06, 0.57, -0.06], ["c", 0.45, 0, 0.45, 0, 0.54, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.14], ["l", 0, 7.11], ["l", 0.09, -0.06], ["c", 0.18, -0.18, 0.72, -0.84, 0.96, -1.2], ["c", 0.3, -0.45, 0.66, -1.17, 0.84, -1.65], ["c", 0.36, -0.9, 0.57, -1.83, 0.6, -2.79], ["c", 0.03, -0.48, 0.03, -0.54, 0.09, -0.63], ["c", 0.12, -0.18, 0.36, -0.21, 0.54, -0.12], ["c", 0.18, 0.09, 0.21, 0.15, 0.24, 0.66], ["c", 0.06, 0.87, 0.21, 1.56, 0.57, 2.22], ["c", 0.51, 1.02, 1.26, 1.68, 2.22, 1.92], ["c", 0.21, 0.06, 0.33, 0.06, 0.78, 0.06], ["c", 0.45, -0, 0.57, -0, 0.84, -0.06], ["c", 0.45, -0.12, 0.81, -0.33, 1.08, -0.6], ["c", 0.57, -0.57, 0.87, -1.41, 0.99, -2.88], ["c", 0.06, -0.54, 0.06, -3, 0, -3.57], ["c", -0.21, -2.58, -0.84, -3.87, -2.16, -4.5], ["c", -0.48, -0.21, -1.17, -0.36, -1.77, -0.36], ["c", -0.69, 0, -1.29, 0.27, -1.5, 0.72], ["c", -0.06, 0.15, -0.06, 0.21, -0.06, 0.42], ["c", 0, 0.24, 0, 0.3, 0.06, 0.45], ["c", 0.12, 0.24, 0.24, 0.39, 0.63, 0.66], ["c", 0.42, 0.3, 0.57, 0.48, 0.69, 0.72], ["c", 0.06, 0.15, 0.06, 0.21, 0.06, 0.48], ["c", 0, 0.39, -0.03, 0.63, -0.21, 0.96], ["c", -0.3, 0.6, -0.87, 1.08, -1.5, 1.26], ["c", -0.27, 0.06, -0.87, 0.06, -1.14, 0], ["c", -0.78, -0.24, -1.44, -0.87, -1.65, -1.68], ["c", -0.12, -0.42, -0.09, -1.17, 0.09, -1.71], ["c", 0.51, -1.65, 1.98, -2.82, 3.81, -3.09], ["c", 0.84, -0.09, 2.46, 0.03, 3.51, 0.27], ["c", 2.22, 0.57, 3.69, 1.8, 4.44, 3.75], ["c", 0.36, 0.93, 0.57, 2.13, 0.57, 3.36], ["c", -0, 1.44, -0.48, 2.73, -1.38, 3.81], ["c", -1.26, 1.5, -3.27, 2.43, -5.28, 2.43], ["c", -0.48, -0, -0.51, -0, -0.75, -0.09], ["c", -0.15, -0.03, -0.48, -0.21, -0.78, -0.36], ["c", -0.69, -0.36, -0.87, -0.42, -1.26, -0.42], ["c", -0.27, -0, -0.3, -0, -0.51, 0.09], ["c", -0.57, 0.3, -0.81, 0.9, -0.81, 2.1], ["c", -0, 1.23, 0.24, 1.83, 0.81, 2.13], ["c", 0.21, 0.09, 0.24, 0.09, 0.51, 0.09], ["c", 0.39, -0, 0.57, -0.06, 1.26, -0.42], ["c", 0.3, -0.15, 0.63, -0.33, 0.78, -0.36], ["c", 0.24, -0.09, 0.27, -0.09, 0.75, -0.09], ["c", 2.01, -0, 4.02, 0.93, 5.28, 2.4], ["c", 0.9, 1.11, 1.38, 2.4, 1.38, 3.84], ["c", -0, 1.5, -0.3, 2.88, -0.84, 3.96], ["c", -0.78, 1.59, -2.19, 2.64, -4.17, 3.15], ["c", -1.05, 0.24, -2.67, 0.36, -3.51, 0.27], ["c", -1.83, -0.27, -3.3, -1.44, -3.81, -3.09], ["c", -0.18, -0.54, -0.21, -1.29, -0.09, -1.74], ["c", 0.15, -0.6, 0.63, -1.2, 1.23, -1.47], ["c", 0.36, -0.18, 0.57, -0.21, 0.99, -0.21], ["c", 0.42, 0, 0.63, 0.03, 1.02, 0.21], ["c", 0.42, 0.21, 0.84, 0.63, 1.05, 1.05], ["c", 0.18, 0.36, 0.21, 0.6, 0.21, 0.96], ["c", -0, 0.3, -0, 0.36, -0.06, 0.51], ["c", -0.12, 0.24, -0.27, 0.42, -0.69, 0.72], ["c", -0.57, 0.42, -0.69, 0.63, -0.69, 1.08], ["c", -0, 0.24, -0, 0.3, 0.06, 0.45], ["c", 0.12, 0.21, 0.3, 0.39, 0.57, 0.54], ["c", 0.42, 0.18, 0.87, 0.21, 1.53, 0.15], ["c", 1.08, -0.15, 1.8, -0.57, 2.34, -1.32], ["c", 0.54, -0.75, 0.84, -1.83, 0.99, -3.51], ["c", 0.06, -0.57, 0.06, -3.03, -0, -3.57], ["c", -0.12, -1.47, -0.42, -2.31, -0.99, -2.88], ["c", -0.27, -0.27, -0.63, -0.48, -1.08, -0.6], ["c", -0.27, -0.06, -0.39, -0.06, -0.84, -0.06], ["c", -0.45, 0, -0.57, 0, -0.78, 0.06], ["c", -1.14, 0.27, -2.01, 1.17, -2.46, 2.49], ["c", -0.21, 0.57, -0.3, 0.99, -0.33, 1.65], ["c", -0.03, 0.51, -0.06, 0.57, -0.24, 0.66], ["c", -0.12, 0.06, -0.27, 0.06, -0.39, 0], ["c", -0.21, -0.09, -0.21, -0.15, -0.24, -0.75], ["c", -0.09, -1.92, -0.78, -3.72, -2.01, -5.19], ["c", -0.18, -0.21, -0.36, -0.42, -0.39, -0.45], ["l", -0.09, -0.06], ["l", -0, 7.11], ["l", -0, 7.14], ["l", -0.06, 0.09], ["c", -0.09, 0.06, -0.09, 0.06, -0.54, 0.06], ["c", -0.48, 0, -0.48, 0, -0.57, -0.06], ["l", -0.06, -0.09], ["l", -0, -14.82], ["l", -0, -14.85], ["z"]], w: 20.31, h: 29.97}
        , 'clefs.F': {d: [["M", 6.3, -7.8], ["c", 0.36, -0.03, 1.65, 0, 2.13, 0.03], ["c", 3.6, 0.42, 6.03, 2.1, 6.93, 4.86], ["c", 0.27, 0.84, 0.36, 1.5, 0.36, 2.58], ["c", 0, 0.9, -0.03, 1.35, -0.18, 2.16], ["c", -0.78, 3.78, -3.54, 7.08, -8.37, 9.96], ["c", -1.74, 1.05, -3.87, 2.13, -6.18, 3.12], ["c", -0.39, 0.18, -0.75, 0.33, -0.81, 0.36], ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33], ["c", 0, -0.15, 0.06, -0.21, 0.51, -0.48], ["c", 3, -1.77, 5.13, -3.21, 6.84, -4.74], ["c", 0.51, -0.45, 1.59, -1.5, 1.95, -1.95], ["c", 1.89, -2.19, 2.88, -4.32, 3.15, -6.78], ["c", 0.06, -0.42, 0.06, -1.77, 0, -2.19], ["c", -0.24, -2.01, -0.93, -3.63, -2.04, -4.71], ["c", -0.63, -0.63, -1.29, -1.02, -2.07, -1.2], ["c", -1.62, -0.39, -3.36, 0.15, -4.56, 1.44], ["c", -0.54, 0.6, -1.05, 1.47, -1.32, 2.22], ["l", -0.09, 0.21], ["l", 0.24, -0.12], ["c", 0.39, -0.21, 0.63, -0.24, 1.11, -0.24], ["c", 0.3, 0, 0.45, 0, 0.66, 0.06], ["c", 1.92, 0.48, 2.85, 2.55, 1.95, 4.38], ["c", -0.45, 0.99, -1.41, 1.62, -2.46, 1.71], ["c", -1.47, 0.09, -2.91, -0.87, -3.39, -2.25], ["c", -0.18, -0.57, -0.21, -1.32, -0.03, -2.28], ["c", 0.39, -2.25, 1.83, -4.2, 3.81, -5.19], ["c", 0.69, -0.36, 1.59, -0.6, 2.37, -0.69], ["z"], ["m", 11.58, 2.52], ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14], ["c", 0.3, 1.17, -0.72, 2.19, -1.89, 1.89], ["c", -0.99, -0.21, -1.5, -1.32, -1.02, -2.25], ["c", 0.18, -0.39, 0.6, -0.69, 1.02, -0.78], ["z"], ["m", 0, 7.5], ["c", 0.84, -0.21, 1.71, 0.3, 1.89, 1.14], ["c", 0.21, 0.87, -0.3, 1.71, -1.14, 1.89], ["c", -0.87, 0.21, -1.71, -0.3, -1.89, -1.14], ["c", -0.21, -0.84, 0.3, -1.71, 1.14, -1.89], ["z"]], w: 20.153, h: 23.142}
        , 'clefs.G': {d: [["M", 9.69, -37.41], ["c", 0.09, -0.09, 0.24, -0.06, 0.36, 0], ["c", 0.12, 0.09, 0.57, 0.6, 0.96, 1.11], ["c", 1.77, 2.34, 3.21, 5.85, 3.57, 8.73], ["c", 0.21, 1.56, 0.03, 3.27, -0.45, 4.86], ["c", -0.69, 2.31, -1.92, 4.47, -4.23, 7.44], ["c", -0.3, 0.39, -0.57, 0.72, -0.6, 0.75], ["c", -0.03, 0.06, 0, 0.15, 0.18, 0.78], ["c", 0.54, 1.68, 1.38, 4.44, 1.68, 5.49], ["l", 0.09, 0.42], ["l", 0.39, -0], ["c", 1.47, 0.09, 2.76, 0.51, 3.96, 1.29], ["c", 1.83, 1.23, 3.06, 3.21, 3.39, 5.52], ["c", 0.09, 0.45, 0.12, 1.29, 0.06, 1.74], ["c", -0.09, 1.02, -0.33, 1.83, -0.75, 2.73], ["c", -0.84, 1.71, -2.28, 3.06, -4.02, 3.72], ["l", -0.33, 0.12], ["l", 0.03, 1.26], ["c", 0, 1.74, -0.06, 3.63, -0.21, 4.62], ["c", -0.45, 3.06, -2.19, 5.49, -4.47, 6.21], ["c", -0.57, 0.18, -0.9, 0.21, -1.59, 0.21], ["c", -0.69, -0, -1.02, -0.03, -1.65, -0.21], ["c", -1.14, -0.27, -2.13, -0.84, -2.94, -1.65], ["c", -0.99, -0.99, -1.56, -2.16, -1.71, -3.54], ["c", -0.09, -0.81, 0.06, -1.53, 0.45, -2.13], ["c", 0.63, -0.99, 1.83, -1.56, 3, -1.53], ["c", 1.5, 0.09, 2.64, 1.32, 2.73, 2.94], ["c", 0.06, 1.47, -0.93, 2.7, -2.37, 2.97], ["c", -0.45, 0.06, -0.84, 0.03, -1.29, -0.09], ["l", -0.21, -0.09], ["l", 0.09, 0.12], ["c", 0.39, 0.54, 0.78, 0.93, 1.32, 1.26], ["c", 1.35, 0.87, 3.06, 1.02, 4.35, 0.36], ["c", 1.44, -0.72, 2.52, -2.28, 2.97, -4.35], ["c", 0.15, -0.66, 0.24, -1.5, 0.3, -3.03], ["c", 0.03, -0.84, 0.03, -2.94, -0, -3], ["c", -0.03, -0, -0.18, -0, -0.36, 0.03], ["c", -0.66, 0.12, -0.99, 0.12, -1.83, 0.12], ["c", -1.05, -0, -1.71, -0.06, -2.61, -0.3], ["c", -4.02, -0.99, -7.11, -4.35, -7.8, -8.46], ["c", -0.12, -0.66, -0.12, -0.99, -0.12, -1.83], ["c", -0, -0.84, -0, -1.14, 0.15, -1.92], ["c", 0.36, -2.28, 1.41, -4.62, 3.3, -7.29], ["l", 2.79, -3.6], ["c", 0.54, -0.66, 0.96, -1.2, 0.96, -1.23], ["c", -0, -0.03, -0.09, -0.33, -0.18, -0.69], ["c", -0.96, -3.21, -1.41, -5.28, -1.59, -7.68], ["c", -0.12, -1.38, -0.15, -3.09, -0.06, -3.96], ["c", 0.33, -2.67, 1.38, -5.07, 3.12, -7.08], ["c", 0.36, -0.42, 0.99, -1.05, 1.17, -1.14], ["z"], ["m", 2.01, 4.71], ["c", -0.15, -0.3, -0.3, -0.54, -0.3, -0.54], ["c", -0.03, 0, -0.18, 0.09, -0.3, 0.21], ["c", -2.4, 1.74, -3.87, 4.2, -4.26, 7.11], ["c", -0.06, 0.54, -0.06, 1.41, -0.03, 1.89], ["c", 0.09, 1.29, 0.48, 3.12, 1.08, 5.22], ["c", 0.15, 0.42, 0.24, 0.78, 0.24, 0.81], ["c", 0, 0.03, 0.84, -1.11, 1.23, -1.68], ["c", 1.89, -2.73, 2.88, -5.07, 3.15, -7.53], ["c", 0.09, -0.57, 0.12, -1.74, 0.06, -2.37], ["c", -0.09, -1.23, -0.27, -1.92, -0.87, -3.12], ["z"], ["m", -2.94, 20.7], ["c", -0.21, -0.72, -0.39, -1.32, -0.42, -1.32], ["c", 0, 0, -1.2, 1.47, -1.86, 2.37], ["c", -2.79, 3.63, -4.02, 6.3, -4.35, 9.3], ["c", -0.03, 0.21, -0.03, 0.69, -0.03, 1.08], ["c", 0, 0.69, 0, 0.75, 0.06, 1.11], ["c", 0.12, 0.54, 0.27, 0.99, 0.51, 1.47], ["c", 0.69, 1.38, 1.83, 2.55, 3.42, 3.42], ["c", 0.96, 0.54, 2.07, 0.9, 3.21, 1.08], ["c", 0.78, 0.12, 2.04, 0.12, 2.94, -0.03], ["c", 0.51, -0.06, 0.45, -0.03, 0.42, -0.3], ["c", -0.24, -3.33, -0.72, -6.33, -1.62, -10.08], ["c", -0.09, -0.39, -0.18, -0.75, -0.18, -0.78], ["c", -0.03, -0.03, -0.42, -0, -0.81, 0.09], ["c", -0.9, 0.18, -1.65, 0.57, -2.22, 1.14], ["c", -0.72, 0.72, -1.08, 1.65, -1.05, 2.64], ["c", 0.06, 0.96, 0.48, 1.83, 1.23, 2.58], ["c", 0.36, 0.36, 0.72, 0.63, 1.17, 0.9], ["c", 0.33, 0.18, 0.36, 0.21, 0.42, 0.33], ["c", 0.18, 0.42, -0.18, 0.9, -0.6, 0.87], ["c", -0.18, -0.03, -0.84, -0.36, -1.26, -0.63], ["c", -0.78, -0.51, -1.38, -1.11, -1.86, -1.83], ["c", -1.77, -2.7, -0.99, -6.42, 1.71, -8.19], ["c", 0.3, -0.21, 0.81, -0.48, 1.17, -0.63], ["c", 0.3, -0.09, 1.02, -0.3, 1.14, -0.3], ["c", 0.06, -0, 0.09, -0, 0.09, -0.03], ["c", 0.03, -0.03, -0.51, -1.92, -1.23, -4.26], ["z"], ["m", 3.78, 7.41], ["c", -0.18, -0.03, -0.36, -0.06, -0.39, -0.06], ["c", -0.03, 0, 0, 0.21, 0.18, 1.02], ["c", 0.75, 3.18, 1.26, 6.3, 1.5, 9.09], ["c", 0.06, 0.72, 0, 0.69, 0.51, 0.42], ["c", 0.78, -0.36, 1.44, -0.96, 1.98, -1.77], ["c", 1.08, -1.62, 1.2, -3.69, 0.3, -5.55], ["c", -0.81, -1.62, -2.31, -2.79, -4.08, -3.15], ["z"]], w: 19.051, h: 57.057}
        , 'clefs.perc': {d: [["M", 5.07, -7.44], ["l", 0.09, -0.06], ["l", 1.53, 0], ["l", 1.53, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.35], ["l", 0, 7.32], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.53, -0], ["l", -1.53, -0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -7.32], ["l", 0, -7.35], ["z"], ["m", 6.63, 0], ["l", 0.09, -0.06], ["l", 1.53, 0], ["l", 1.53, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 7.35], ["l", 0, 7.32], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -1.53, -0], ["l", -1.53, -0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -7.32], ["l", 0, -7.35], ["z"]], w: 9.99, h: 14.97}
        , 'clefs.tab': {d: [["M", 26.88, -28.88], ["c", 0.32, -0.12, 0.88, 0.12, 1.04, 0.48], ["c", 0.12, 0.28, 0.12, 0.32, -0.24, 0.72], ["c", -1.04, 1.08, -2.48, 1.92, -3.92, 2.28], ["c", -1.16, 0.32, -2.28, 0.32, -3.4, 0.04], ["l", -0.08, -0.04], ["l", -0.24, 1.32], ["c", -0.44, 2.64, -1, 5.68, -1.28, 6.72], ["c", -0.56, 2.2, -1.68, 4.24, -3.04, 5.52], ["c", -0.76, 0.76, -1.56, 1.2, -2.48, 1.44], ["c", -0.24, 0.08, -0.44, 0.08, -0.88, 0.08], ["c", -0.72, 0, -1.04, -0.04, -1.64, -0.36], ["c", -0.52, -0.24, -0.88, -0.52, -1.84, -1.32], ["c", -0.4, -0.32, -0.88, -0.68, -1, -0.76], ["c", -0.28, -0.2, -0.36, -0.32, -0.32, -0.6], ["c", 0.08, -0.36, 0.48, -0.8, 0.8, -0.88], ["c", 0.24, -0.04, 0.44, 0.08, 1.2, 0.76], ["c", 0.64, 0.56, 0.96, 0.76, 1.24, 0.92], ["c", 0.88, 0.44, 1.84, 0.28, 2.6, -0.48], ["c", 0.84, -0.8, 1.4, -2.16, 1.64, -4], ["c", 0.04, -0.24, 0.12, -0.88, 0.12, -1.48], ["c", 0.12, -2.08, 0.44, -5.08, 0.76, -7.32], ["c", 0.08, -0.44, 0.12, -0.84, 0.12, -0.84], ["c", -0.04, -0.04, -1.08, -0.16, -1.36, -0.16], ["c", -0.76, 0, -1.76, 0.16, -2.4, 0.44], ["c", -1.16, 0.4, -1.8, 1.04, -2, 1.88], ["c", -0.24, 0.84, 0.12, 1.68, 0.88, 2.2], ["c", 0.16, 0.08, 0.2, 0.16, 0.24, 0.32], ["c", 0.12, 0.36, 0.08, 0.76, -0.12, 1], ["c", -0.04, 0.08, -0.16, 0.12, -0.36, 0.2], ["c", -0.96, 0.28, -1.92, 0.2, -2.8, -0.24], ["c", -0.72, -0.36, -1.28, -0.88, -1.6, -1.52], ["c", -0.52, -1, -0.44, -2.32, 0.2, -3.36], ["c", 0.36, -0.56, 1.12, -1.24, 1.88, -1.64], ["c", 1.56, -0.76, 3.84, -1.2, 6.4, -1.2], ["c", 0.92, 0, 1.04, 0, 1.44, 0.08], ["c", 0.6, 0.12, 1.48, 0.4, 2.76, 0.8], ["c", 1.96, 0.64, 2.44, 0.76, 3.4, 0.72], ["c", 1.36, -0.08, 2.72, -0.6, 3.92, -1.48], ["c", 0.16, -0.12, 0.32, -0.24, 0.36, -0.24], ["z"], ["m", -7.84, 17.4], ["c", 0.28, -0.04, 1.08, 0, 1.44, 0.08], ["c", 0.64, 0.16, 1.2, 0.56, 1.32, 0.92], ["c", 0.04, 0.12, 0.04, 0.2, 0, 0.36], ["c", 0, 0.12, -0.04, 0.76, -0.08, 1.44], ["c", -0.12, 2.92, -0.32, 7.68, -0.52, 11.04], ["c", -0.08, 2.04, -0.08, 2.36, 0.04, 2.68], ["c", 0.12, 0.24, 0.2, 0.32, 0.4, 0.4], ["c", 0.32, 0.16, 0.72, 0.08, 1.64, -0.36], ["c", 0.76, -0.36, 0.88, -0.4, 1, -0.32], ["c", 0.12, 0.08, 0.24, 0.4, 0.24, 0.6], ["c", 0, 0.44, -0.2, 0.68, -0.6, 0.84], ["c", -0.16, 0.04, -0.52, 0.2, -0.8, 0.36], ["c", -1.56, 0.8, -1.84, 0.92, -2.4, 0.96], ["c", -0.6, 0.04, -1.04, -0.12, -1.44, -0.52], ["c", -0.52, -0.56, -0.88, -1.6, -1.36, -4.16], ["c", -0.32, -1.64, -0.48, -2.76, -0.72, -5], ["l", 0, -0.24], ["l", -0.48, 0.6], ["c", -0.8, 1, -1.76, 2.12, -2.6, 3], ["c", -0.2, 0.24, -0.36, 0.4, -0.36, 0.44], ["c", 0, 0, 0.08, 0.12, 0.2, 0.24], ["c", 0.32, 0.44, 0.8, 0.76, 1.4, 0.92], ["c", 0.24, 0.08, 0.4, 0.08, 0.92, 0.08], ["l", 0.64, 0.04], ["l", 0.08, 0.16], ["c", 0.2, 0.36, 0.04, 0.96, -0.28, 1.2], ["c", -0.24, 0.16, -1.24, 0.36, -1.88, 0.36], ["c", -1.12, 0, -2.12, -0.4, -2.64, -1.12], ["l", -0.16, -0.2], ["l", -0.6, 0.56], ["c", -1.32, 1.16, -2.04, 1.76, -2.88, 2.32], ["c", -1.04, 0.68, -2, 1.12, -2.8, 1.24], ["c", -0.92, 0.16, -1.6, 0.04, -2.6, -0.56], ["c", -0.28, -0.16, -0.68, -0.36, -0.88, -0.48], ["c", -0.32, -0.16, -0.4, -0.24, -0.44, -0.32], ["c", -0.16, -0.36, 0.2, -1.04, 0.6, -1.24], ["c", 0.32, -0.16, 0.44, -0.12, 1.2, 0.24], ["c", 0.8, 0.4, 1.12, 0.52, 1.6, 0.48], ["c", 1.16, -0.12, 2.36, -0.92, 4.32, -3.08], ["c", 3.56, -3.8, 6.12, -7.92, 7.6, -12.2], ["c", 0.2, -0.6, 0.32, -0.84, 0.56, -1.08], ["c", 0.28, -0.32, 0.8, -0.6, 1.32, -0.68], ["z"], ["m", -5.32, 21.4], ["c", 0.24, 0, 0.92, -0.04, 1.56, 0], ["c", 4.36, 0.04, 7.16, 1, 8, 2.76], ["c", 0.6, 1.32, 0.16, 3.2, -1.08, 4.56], ["c", -0.32, 0.36, -0.76, 0.76, -1.12, 1], ["c", -0.12, 0.08, -0.24, 0.12, -0.24, 0.16], ["c", 0, 0, 0.24, 0.04, 0.56, 0.12], ["c", 1.64, 0.4, 2.68, 1.08, 3.16, 2.12], ["c", 0.36, 0.72, 0.4, 1.76, 0.12, 2.8], ["c", -0.16, 0.48, -0.6, 1.4, -0.92, 1.8], ["c", -1.16, 1.56, -2.8, 2.56, -4.72, 3], ["c", -0.48, 0.08, -0.64, 0.08, -1.28, 0.08], ["c", -0.6, 0, -0.88, 0, -1.12, -0.04], ["c", -1.12, -0.24, -1.96, -0.68, -2.76, -1.48], ["c", -0.44, -0.44, -0.6, -0.68, -0.6, -0.84], ["c", 0, -0.08, 0.04, -0.2, 0.08, -0.32], ["c", 0.24, -0.44, 0.92, -0.8, 1.24, -0.64], ["c", 0.04, 0.04, 0.2, 0.16, 0.36, 0.32], ["c", 0.52, 0.56, 1.32, 0.76, 2.16, 0.6], ["c", 1.4, -0.28, 2.64, -1.36, 3.08, -2.68], ["c", 0.64, -2.04, -0.64, -3.4, -3.44, -3.56], ["c", -0.28, 0, -0.48, -0.04, -0.56, -0.08], ["c", -0.2, -0.12, -0.28, -0.68, -0.08, -1.04], ["c", 0.16, -0.36, 0.32, -0.44, 0.8, -0.48], ["c", 0.76, -0.08, 1.48, -0.56, 2, -1.32], ["c", 0.64, -0.96, 0.72, -2.12, 0.24, -3.08], ["c", -0.16, -0.28, -0.6, -0.72, -0.92, -0.92], ["c", -0.44, -0.28, -1.24, -0.6, -1.8, -0.68], ["l", -0.16, -0.04], ["l", -0.08, 0.64], ["c", -0.72, 3.92, -1.52, 8.32, -1.72, 9], ["c", -0.44, 1.8, -1.24, 3.48, -2.2, 4.8], ["c", -0.4, 0.48, -1.08, 1.2, -1.52, 1.52], ["c", -0.4, 0.32, -1.12, 0.64, -1.52, 0.76], ["c", -0.44, 0.12, -1.28, 0.12, -1.68, 0.04], ["c", -0.6, -0.16, -1.16, -0.52, -2.04, -1.28], ["c", -0.32, -0.2, -0.68, -0.52, -0.84, -0.64], ["c", -0.4, -0.28, -0.44, -0.44, -0.28, -0.84], ["c", 0.16, -0.24, 0.36, -0.48, 0.56, -0.6], ["c", 0.36, -0.16, 0.48, -0.12, 1.16, 0.44], ["c", 1.04, 0.8, 1.44, 1, 2.2, 0.96], ["c", 0.6, -0.04, 1.08, -0.28, 1.56, -0.72], ["c", 1.16, -1.2, 1.84, -3.8, 1.84, -7.16], ["c", 0, -0.8, 0.04, -1.48, 0.16, -2.72], ["c", 0.08, -0.92, 0.32, -2.68, 0.44, -3.44], ["c", 0.08, -0.32, 0.08, -0.56, 0.08, -0.56], ["c", 0, 0, -0.16, 0.04, -0.28, 0.12], ["c", -1.92, 0.76, -2.88, 2.2, -2.32, 3.4], ["c", 0.12, 0.2, 0.24, 0.32, 0.36, 0.44], ["c", 0.32, 0.28, 0.4, 0.36, 0.44, 0.52], ["c", 0.08, 0.32, 0, 0.84, -0.2, 1.04], ["c", -0.12, 0.16, -0.72, 0.28, -1.28, 0.32], ["c", -1.36, 0.04, -2.68, -0.64, -3.24, -1.76], ["c", -0.28, -0.6, -0.36, -1.2, -0.2, -1.92], ["c", 0.08, -0.36, 0.28, -0.88, 0.52, -1.24], ["c", 1.16, -1.72, 4, -2.96, 7.52, -3.24], ["z"]], w: 26.191, h: 57.767}
        , 'dots.dot': {d: [["M", 1.32, -1.68], ["c", 0.09, -0.03, 0.27, -0.06, 0.39, -0.06], ["c", 0.96, 0, 1.74, 0.78, 1.74, 1.71], ["c", 0, 0.96, -0.78, 1.74, -1.71, 1.74], ["c", -0.96, 0, -1.74, -0.78, -1.74, -1.71], ["c", 0, -0.78, 0.54, -1.5, 1.32, -1.68], ["z"]], w: 3.45, h: 3.45}
        , 'flags.d8th': {d: [["M", 5.67, -21.63], ["c", 0.24, -0.12, 0.54, -0.06, 0.69, 0.15], ["c", 0.06, 0.06, 0.21, 0.36, 0.39, 0.66], ["c", 0.84, 1.77, 1.26, 3.36, 1.32, 5.1], ["c", 0.03, 1.29, -0.21, 2.37, -0.81, 3.63], ["c", -0.6, 1.23, -1.26, 2.13, -3.21, 4.38], ["c", -1.35, 1.53, -1.86, 2.19, -2.4, 2.97], ["c", -0.63, 0.93, -1.11, 1.92, -1.38, 2.79], ["c", -0.15, 0.54, -0.27, 1.35, -0.27, 1.8], ["l", 0, 0.15], ["l", -0.21, -0], ["l", -0.21, -0], ["l", 0, -3.75], ["l", 0, -3.75], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0.48, -0.3], ["c", 1.83, -1.11, 3.12, -2.1, 4.17, -3.12], ["c", 0.78, -0.81, 1.32, -1.53, 1.71, -2.31], ["c", 0.45, -0.93, 0.6, -1.74, 0.51, -2.88], ["c", -0.12, -1.56, -0.63, -3.18, -1.47, -4.68], ["c", -0.12, -0.21, -0.15, -0.33, -0.06, -0.51], ["c", 0.06, -0.15, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 8.492, h: 21.691}
        , 'flags.d16th': {d: [["M", 6.84, -22.53], ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ["c", 0.15, 0.15, 0.33, 0.87, 0.45, 1.56], ["c", 0.06, 0.33, 0.06, 1.35, 0, 1.65], ["c", -0.06, 0.33, -0.15, 0.78, -0.27, 1.11], ["c", -0.12, 0.33, -0.45, 0.96, -0.66, 1.32], ["l", -0.18, 0.27], ["l", 0.09, 0.18], ["c", 0.48, 1.02, 0.72, 2.25, 0.69, 3.3], ["c", -0.06, 1.23, -0.42, 2.28, -1.26, 3.45], ["c", -0.57, 0.87, -0.99, 1.32, -3, 3.39], ["c", -1.56, 1.56, -2.22, 2.4, -2.76, 3.45], ["c", -0.42, 0.84, -0.66, 1.8, -0.66, 2.55], ["l", 0, 0.15], ["l", -0.21, -0], ["l", -0.21, -0], ["l", 0, -7.5], ["l", 0, -7.5], ["l", 0.21, -0], ["l", 0.21, -0], ["l", 0, 1.14], ["l", 0, 1.11], ["l", 0.27, -0.15], ["c", 1.11, -0.57, 1.77, -0.99, 2.52, -1.47], ["c", 2.37, -1.56, 3.69, -3.15, 4.05, -4.83], ["c", 0.03, -0.18, 0.03, -0.39, 0.03, -0.78], ["c", 0, -0.6, -0.03, -0.93, -0.24, -1.5], ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.63, 7.5], ["c", -0.06, -0.18, -0.15, -0.36, -0.15, -0.36], ["c", -0.03, 0, -0.03, 0.03, -0.06, 0.06], ["c", -0.06, 0.12, -0.96, 1.02, -1.95, 1.98], ["c", -0.63, 0.57, -1.26, 1.17, -1.44, 1.35], ["c", -1.53, 1.62, -2.28, 2.85, -2.55, 4.32], ["c", -0.03, 0.18, -0.03, 0.54, -0.06, 0.99], ["l", 0, 0.69], ["l", 0.18, -0.09], ["c", 0.93, -0.54, 2.1, -1.29, 2.82, -1.83], ["c", 0.69, -0.51, 1.02, -0.81, 1.53, -1.29], ["c", 1.86, -1.89, 2.37, -3.66, 1.68, -5.82], ["z"]], w: 8.475, h: 22.591}
        , 'flags.d32nd': {d: [["M", 6.794, -29.13], ["c", 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ["c", 0.12, 0.12, 0.27, 0.63, 0.36, 1.11], ["c", 0.33, 1.59, 0.06, 3.06, -0.81, 4.47], ["l", -0.18, 0.27], ["l", 0.09, 0.15], ["c", 0.12, 0.24, 0.33, 0.69, 0.45, 1.05], ["c", 0.63, 1.83, 0.45, 3.57, -0.57, 5.22], ["l", -0.18, 0.3], ["l", 0.15, 0.27], ["c", 0.42, 0.87, 0.6, 1.71, 0.57, 2.61], ["c", -0.06, 1.29, -0.48, 2.46, -1.35, 3.78], ["c", -0.54, 0.81, -0.93, 1.29, -2.46, 3], ["c", -0.51, 0.54, -1.05, 1.17, -1.26, 1.41], ["c", -1.56, 1.86, -2.25, 3.36, -2.37, 5.01], ["l", 0, 0.33], ["l", -0.21, -0], ["l", -0.21, -0], ["l", 0, -11.25], ["l", 0, -11.25], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 1.35], ["l", 0.03, 1.35], ["l", 0.78, -0.39], ["c", 1.38, -0.69, 2.34, -1.26, 3.24, -1.92], ["c", 1.38, -1.02, 2.28, -2.13, 2.64, -3.21], ["c", 0.15, -0.48, 0.18, -0.72, 0.18, -1.29], ["c", 0, -0.57, -0.06, -0.9, -0.24, -1.47], ["c", -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.63, 7.2], ["c", -0.09, -0.18, -0.12, -0.21, -0.12, -0.15], ["c", -0.03, 0.09, -1.02, 1.08, -2.04, 2.04], ["c", -1.17, 1.08, -1.65, 1.56, -2.07, 2.04], ["c", -0.84, 0.96, -1.38, 1.86, -1.68, 2.76], ["c", -0.21, 0.57, -0.27, 0.99, -0.3, 1.65], ["l", 0, 0.54], ["l", 0.66, -0.33], ["c", 3.57, -1.86, 5.49, -3.69, 5.94, -5.7], ["c", 0.06, -0.39, 0.06, -1.2, -0.03, -1.65], ["c", -0.06, -0.39, -0.24, -0.9, -0.36, -1.2], ["z"], ["m", -0.06, 7.2], ["c", -0.06, -0.15, -0.12, -0.33, -0.15, -0.45], ["l", -0.06, -0.18], ["l", -0.18, 0.21], ["l", -1.83, 1.83], ["c", -0.87, 0.9, -1.77, 1.8, -1.95, 2.01], ["c", -1.08, 1.29, -1.62, 2.31, -1.89, 3.51], ["c", -0.06, 0.3, -0.06, 0.51, -0.09, 0.93], ["l", 0, 0.57], ["l", 0.09, -0.06], ["c", 0.75, -0.45, 1.89, -1.26, 2.52, -1.74], ["c", 0.81, -0.66, 1.74, -1.53, 2.22, -2.16], ["c", 1.26, -1.53, 1.68, -3.06, 1.32, -4.47], ["z"]], w: 8.475, h: 29.191}
        , 'flags.d64th': {d: [["M", 7.08, -32.88], ["c", 0.3, -0.12, 0.66, -0.03, 0.78, 0.24], ["c", 0.18, 0.33, 0.27, 2.1, 0.15, 2.64], ["c", -0.09, 0.39, -0.21, 0.78, -0.39, 1.08], ["l", -0.15, 0.3], ["l", 0.09, 0.27], ["c", 0.03, 0.12, 0.09, 0.45, 0.12, 0.69], ["c", 0.27, 1.44, 0.18, 2.55, -0.3, 3.6], ["l", -0.12, 0.33], ["l", 0.06, 0.42], ["c", 0.27, 1.35, 0.33, 2.82, 0.21, 3.63], ["c", -0.12, 0.6, -0.3, 1.23, -0.57, 1.8], ["l", -0.15, 0.27], ["l", 0.03, 0.42], ["c", 0.06, 1.02, 0.06, 2.7, 0.03, 3.06], ["c", -0.15, 1.47, -0.66, 2.76, -1.74, 4.41], ["c", -0.45, 0.69, -0.75, 1.11, -1.74, 2.37], ["c", -1.05, 1.38, -1.5, 1.98, -1.95, 2.73], ["c", -0.93, 1.5, -1.38, 2.82, -1.44, 4.2], ["l", 0, 0.42], ["l", -0.21, -0], ["l", -0.21, -0], ["l", 0, -15], ["l", 0, -15], ["l", 0.21, -0], ["l", 0.21, -0], ["l", 0, 1.86], ["l", 0, 1.89], ["c", 0, -0, 0.21, -0.03, 0.45, -0.09], ["c", 2.22, -0.39, 4.08, -1.11, 5.19, -2.01], ["c", 0.63, -0.54, 1.02, -1.14, 1.2, -1.8], ["c", 0.06, -0.3, 0.06, -1.14, -0.03, -1.65], ["c", -0.03, -0.18, -0.06, -0.39, -0.09, -0.48], ["c", -0.03, -0.24, 0.12, -0.48, 0.36, -0.6], ["z"], ["m", -0.45, 6.15], ["c", -0.03, -0.18, -0.06, -0.42, -0.06, -0.54], ["l", -0.03, -0.18], ["l", -0.33, 0.3], ["c", -0.42, 0.36, -0.87, 0.72, -1.68, 1.29], ["c", -1.98, 1.38, -2.25, 1.59, -2.85, 2.16], ["c", -0.75, 0.69, -1.23, 1.44, -1.47, 2.19], ["c", -0.15, 0.45, -0.18, 0.63, -0.21, 1.35], ["l", 0, 0.66], ["l", 0.39, -0.18], ["c", 1.83, -0.9, 3.45, -1.95, 4.47, -2.91], ["c", 0.93, -0.9, 1.53, -1.83, 1.74, -2.82], ["c", 0.06, -0.33, 0.06, -0.87, 0.03, -1.32], ["z"], ["m", -0.27, 4.86], ["c", -0.03, -0.21, -0.06, -0.36, -0.06, -0.36], ["c", 0, -0.03, -0.12, 0.09, -0.24, 0.24], ["c", -0.39, 0.48, -0.99, 1.08, -2.16, 2.19], ["c", -1.47, 1.38, -1.92, 1.83, -2.46, 2.49], ["c", -0.66, 0.87, -1.08, 1.74, -1.29, 2.58], ["c", -0.09, 0.42, -0.15, 0.87, -0.15, 1.44], ["l", 0, 0.54], ["l", 0.48, -0.33], ["c", 1.5, -1.02, 2.58, -1.89, 3.51, -2.82], ["c", 1.47, -1.47, 2.25, -2.85, 2.4, -4.26], ["c", 0.03, -0.39, 0.03, -1.17, -0.03, -1.71], ["z"], ["m", -0.66, 7.68], ["c", 0.03, -0.15, 0.03, -0.6, 0.03, -0.99], ["l", 0, -0.72], ["l", -0.27, 0.33], ["l", -1.74, 1.98], ["c", -1.77, 1.92, -2.43, 2.76, -2.97, 3.9], ["c", -0.51, 1.02, -0.72, 1.77, -0.75, 2.91], ["c", 0, 0.63, 0, 0.63, 0.06, 0.6], ["c", 0.03, -0.03, 0.3, -0.27, 0.63, -0.54], ["c", 0.66, -0.6, 1.86, -1.8, 2.31, -2.31], ["c", 1.65, -1.89, 2.52, -3.54, 2.7, -5.16], ["z"]], w: 8.485, h: 32.932}
        , 'flags.dgrace': {d: [["M", -6.06, -15.93], ["c", 0.18, -0.09, 0.33, -0.12, 0.48, -0.06], ["c", 0.18, 0.09, 14.01, 8.04, 14.1, 8.1], ["c", 0.12, 0.12, 0.18, 0.33, 0.18, 0.51], ["c", -0.03, 0.21, -0.15, 0.39, -0.36, 0.48], ["c", -0.18, 0.09, -0.33, 0.12, -0.48, 0.06], ["c", -0.18, -0.09, -14.01, -8.04, -14.1, -8.1], ["c", -0.12, -0.12, -0.18, -0.33, -0.18, -0.51], ["c", 0.03, -0.21, 0.15, -0.39, 0.36, -0.48], ["z"]], w: 15.12, h: 9.212}
        , 'flags.u8th': {d: [["M", -0.42, 3.75], ["l", 0, -3.75], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.18], ["c", 0, 0.3, 0.06, 0.84, 0.12, 1.23], ["c", 0.24, 1.53, 0.9, 3.12, 2.13, 5.16], ["l", 0.99, 1.59], ["c", 0.87, 1.44, 1.38, 2.34, 1.77, 3.09], ["c", 0.81, 1.68, 1.2, 3.06, 1.26, 4.53], ["c", 0.03, 1.53, -0.21, 3.27, -0.75, 5.01], ["c", -0.21, 0.69, -0.51, 1.5, -0.6, 1.59], ["c", -0.09, 0.12, -0.27, 0.21, -0.42, 0.21], ["c", -0.15, 0, -0.42, -0.12, -0.51, -0.21], ["c", -0.15, -0.18, -0.18, -0.42, -0.09, -0.66], ["c", 0.15, -0.33, 0.45, -1.2, 0.57, -1.62], ["c", 0.42, -1.38, 0.6, -2.58, 0.6, -3.9], ["c", 0, -0.66, 0, -0.81, -0.06, -1.11], ["c", -0.39, -2.07, -1.8, -4.26, -4.59, -7.14], ["l", -0.42, -0.45], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -3.75], ["z"]], w: 6.692, h: 22.59}
        , 'flags.u16th': {d: [["M", -0.42, 7.5], ["l", 0, -7.5], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.39], ["c", 0.06, 1.08, 0.39, 2.19, 0.99, 3.39], ["c", 0.45, 0.9, 0.87, 1.59, 1.95, 3.12], ["c", 1.29, 1.86, 1.77, 2.64, 2.22, 3.57], ["c", 0.45, 0.93, 0.72, 1.8, 0.87, 2.64], ["c", 0.06, 0.51, 0.06, 1.5, 0, 1.92], ["c", -0.12, 0.6, -0.3, 1.2, -0.54, 1.71], ["l", -0.09, 0.24], ["l", 0.18, 0.45], ["c", 0.51, 1.2, 0.72, 2.22, 0.69, 3.42], ["c", -0.06, 1.53, -0.39, 3.03, -0.99, 4.53], ["c", -0.3, 0.75, -0.36, 0.81, -0.57, 0.9], ["c", -0.15, 0.09, -0.33, 0.06, -0.48, -0], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.12, -0.75], ["c", 0.66, -1.41, 1.02, -2.88, 1.08, -4.32], ["c", 0, -0.6, -0.03, -1.05, -0.18, -1.59], ["c", -0.3, -1.2, -0.99, -2.4, -2.25, -3.87], ["c", -0.42, -0.48, -1.53, -1.62, -2.19, -2.22], ["l", -0.45, -0.42], ["l", -0.03, 1.11], ["l", 0, 1.11], ["l", -0.21, -0], ["l", -0.21, -0], ["l", 0, -7.5], ["z"], ["m", 1.65, 0.09], ["c", -0.3, -0.3, -0.69, -0.72, -0.9, -0.87], ["l", -0.33, -0.33], ["l", 0, 0.15], ["c", 0, 0.3, 0.06, 0.81, 0.15, 1.26], ["c", 0.27, 1.29, 0.87, 2.61, 2.04, 4.29], ["c", 0.15, 0.24, 0.6, 0.87, 0.96, 1.38], ["l", 1.08, 1.53], ["l", 0.42, 0.63], ["c", 0.03, 0, 0.12, -0.36, 0.21, -0.72], ["c", 0.06, -0.33, 0.06, -1.2, 0, -1.62], ["c", -0.33, -1.71, -1.44, -3.48, -3.63, -5.7], ["z"]], w: 6.693, h: 26.337}
        , 'flags.u32nd': {d: [["M", -0.42, 11.247], ["l", 0, -11.25], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.36], ["c", 0.09, 1.68, 0.69, 3.27, 2.07, 5.46], ["l", 0.87, 1.35], ["c", 1.02, 1.62, 1.47, 2.37, 1.86, 3.18], ["c", 0.48, 1.02, 0.78, 1.92, 0.93, 2.88], ["c", 0.06, 0.48, 0.06, 1.5, 0, 1.89], ["c", -0.09, 0.42, -0.21, 0.87, -0.36, 1.26], ["l", -0.12, 0.3], ["l", 0.15, 0.39], ["c", 0.69, 1.56, 0.84, 2.88, 0.54, 4.38], ["c", -0.09, 0.45, -0.27, 1.08, -0.45, 1.47], ["l", -0.12, 0.24], ["l", 0.18, 0.36], ["c", 0.33, 0.72, 0.57, 1.56, 0.69, 2.34], ["c", 0.12, 1.02, -0.06, 2.52, -0.42, 3.84], ["c", -0.27, 0.93, -0.75, 2.13, -0.93, 2.31], ["c", -0.18, 0.15, -0.45, 0.18, -0.66, 0.09], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.06, -0.6], ["c", 0.21, -0.36, 0.42, -0.9, 0.57, -1.38], ["c", 0.51, -1.41, 0.69, -3.06, 0.48, -4.08], ["c", -0.15, -0.81, -0.57, -1.68, -1.2, -2.55], ["c", -0.72, -0.99, -1.83, -2.13, -3.3, -3.33], ["l", -0.48, -0.42], ["l", -0.03, 1.53], ["l", 0, 1.56], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -11.25], ["z"], ["m", 1.26, -3.96], ["c", -0.27, -0.3, -0.54, -0.6, -0.66, -0.72], ["l", -0.18, -0.21], ["l", 0, 0.42], ["c", 0.06, 0.87, 0.24, 1.74, 0.66, 2.67], ["c", 0.36, 0.87, 0.96, 1.86, 1.92, 3.18], ["c", 0.21, 0.33, 0.63, 0.87, 0.87, 1.23], ["c", 0.27, 0.39, 0.6, 0.84, 0.75, 1.08], ["l", 0.27, 0.39], ["l", 0.03, -0.12], ["c", 0.12, -0.45, 0.15, -1.05, 0.09, -1.59], ["c", -0.27, -1.86, -1.38, -3.78, -3.75, -6.33], ["z"], ["m", -0.27, 6.09], ["c", -0.27, -0.21, -0.48, -0.42, -0.51, -0.45], ["c", -0.06, -0.03, -0.06, -0.03, -0.06, 0.21], ["c", 0, 0.9, 0.3, 2.04, 0.81, 3.09], ["c", 0.48, 1.02, 0.96, 1.77, 2.37, 3.63], ["c", 0.6, 0.78, 1.05, 1.44, 1.29, 1.77], ["c", 0.06, 0.12, 0.15, 0.21, 0.15, 0.18], ["c", 0.03, -0.03, 0.18, -0.57, 0.24, -0.87], ["c", 0.06, -0.45, 0.06, -1.32, -0.03, -1.74], ["c", -0.09, -0.48, -0.24, -0.9, -0.51, -1.44], ["c", -0.66, -1.35, -1.83, -2.7, -3.75, -4.38], ["z"]], w: 6.697, h: 32.145}
        , 'flags.u64th': {d: [["M", -0.42, 15], ["l", 0, -15], ["l", 0.21, 0], ["l", 0.21, 0], ["l", 0, 0.36], ["c", 0.06, 1.2, 0.39, 2.37, 1.02, 3.66], ["c", 0.39, 0.81, 0.84, 1.56, 1.8, 3.09], ["c", 0.81, 1.26, 1.05, 1.68, 1.35, 2.22], ["c", 0.87, 1.5, 1.35, 2.79, 1.56, 4.08], ["c", 0.06, 0.54, 0.06, 1.56, -0.03, 2.04], ["c", -0.09, 0.48, -0.21, 0.99, -0.36, 1.35], ["l", -0.12, 0.27], ["l", 0.12, 0.27], ["c", 0.09, 0.15, 0.21, 0.45, 0.27, 0.66], ["c", 0.69, 1.89, 0.63, 3.66, -0.18, 5.46], ["l", -0.18, 0.39], ["l", 0.15, 0.33], ["c", 0.3, 0.66, 0.51, 1.44, 0.63, 2.1], ["c", 0.06, 0.48, 0.06, 1.35, 0, 1.71], ["c", -0.15, 0.57, -0.42, 1.2, -0.78, 1.68], ["l", -0.21, 0.27], ["l", 0.18, 0.33], ["c", 0.57, 1.05, 0.93, 2.13, 1.02, 3.18], ["c", 0.06, 0.72, 0, 1.83, -0.21, 2.79], ["c", -0.18, 1.02, -0.63, 2.34, -1.02, 3.09], ["c", -0.15, 0.33, -0.48, 0.45, -0.78, 0.3], ["c", -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.3, 0.03, -0.54], ["c", 0.75, -1.5, 1.23, -3.45, 1.17, -4.89], ["c", -0.06, -1.02, -0.42, -2.01, -1.17, -3.15], ["c", -0.48, -0.72, -1.02, -1.35, -1.89, -2.22], ["c", -0.57, -0.57, -1.56, -1.5, -1.92, -1.77], ["l", -0.12, -0.09], ["l", 0, 1.68], ["l", 0, 1.68], ["l", -0.21, 0], ["l", -0.21, 0], ["l", 0, -15], ["z"], ["m", 0.93, -8.07], ["c", -0.27, -0.3, -0.48, -0.54, -0.51, -0.54], ["c", -0, 0, -0, 0.69, 0.03, 1.02], ["c", 0.15, 1.47, 0.75, 2.94, 2.04, 4.83], ["l", 1.08, 1.53], ["c", 0.39, 0.57, 0.84, 1.2, 0.99, 1.44], ["c", 0.15, 0.24, 0.3, 0.45, 0.3, 0.45], ["c", -0, 0, 0.03, -0.09, 0.06, -0.21], ["c", 0.36, -1.59, -0.15, -3.33, -1.47, -5.4], ["c", -0.63, -0.93, -1.35, -1.83, -2.52, -3.12], ["z"], ["m", 0.06, 6.72], ["c", -0.24, -0.21, -0.48, -0.42, -0.51, -0.45], ["l", -0.06, -0.06], ["l", 0, 0.33], ["c", 0, 1.2, 0.3, 2.34, 0.93, 3.6], ["c", 0.45, 0.9, 0.96, 1.68, 2.25, 3.51], ["c", 0.39, 0.54, 0.84, 1.17, 1.02, 1.44], ["c", 0.21, 0.33, 0.33, 0.51, 0.33, 0.48], ["c", 0.06, -0.09, 0.21, -0.63, 0.3, -0.99], ["c", 0.06, -0.33, 0.06, -0.45, 0.06, -0.96], ["c", -0, -0.6, -0.03, -0.84, -0.18, -1.35], ["c", -0.3, -1.08, -1.02, -2.28, -2.13, -3.57], ["c", -0.39, -0.45, -1.44, -1.47, -2.01, -1.98], ["z"], ["m", 0, 6.72], ["c", -0.24, -0.21, -0.48, -0.39, -0.51, -0.42], ["l", -0.06, -0.06], ["l", 0, 0.33], ["c", 0, 1.41, 0.45, 2.82, 1.38, 4.35], ["c", 0.42, 0.72, 0.72, 1.14, 1.86, 2.73], ["c", 0.36, 0.45, 0.75, 0.99, 0.87, 1.2], ["c", 0.15, 0.21, 0.3, 0.36, 0.3, 0.36], ["c", 0.06, 0, 0.3, -0.48, 0.39, -0.75], ["c", 0.09, -0.36, 0.12, -0.63, 0.12, -1.05], ["c", -0.06, -1.05, -0.45, -2.04, -1.2, -3.18], ["c", -0.57, -0.87, -1.11, -1.53, -2.07, -2.49], ["c", -0.36, -0.33, -0.84, -0.78, -1.08, -1.02], ["z"]], w: 6.682, h: 39.694}
        , 'flags.ugrace': {d: [["M", 6.03, 6.93], ["c", 0.15, -0.09, 0.33, -0.06, 0.51, 0], ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33], ["c", 0.09, 0.18, 0.06, 0.39, -0.03, 0.54], ["c", -0.06, 0.15, -10.89, 8.88, -11.07, 8.97], ["c", -0.15, 0.09, -0.33, 0.06, -0.48, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.06, -0.39, 0.03, -0.54], ["c", 0.06, -0.15, 10.89, -8.88, 11.07, -8.97], ["z"]], w: 12.019, h: 9.954}
        , 'noteheads.dbl': {d: [["M", -0.69, -4.02], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["c", 0.06, 0.15, 0.06, 0.18, 0.06, 1.41], ["l", -0, 1.23], ["l", 0.12, -0.18], ["c", 0.72, -1.26, 2.64, -2.31, 4.86, -2.64], ["c", 0.81, -0.15, 1.11, -0.15, 2.13, -0.15], ["c", 0.99, 0, 1.29, 0, 2.1, 0.15], ["c", 0.75, 0.12, 1.38, 0.27, 2.04, 0.54], ["c", 1.35, 0.51, 2.34, 1.26, 2.82, 2.1], ["l", 0.12, 0.18], ["l", 0, -1.23], ["c", 0, -1.2, 0, -1.26, 0.06, -1.38], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", 0, 3.54], ["l", 0, 3.54], ["l", -0.06, 0.15], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.06, -0.12, -0.06, -0.18, -0.06, -1.38], ["l", 0, -1.23], ["l", -0.12, 0.18], ["c", -0.48, 0.84, -1.47, 1.59, -2.82, 2.1], ["c", -0.84, 0.33, -1.71, 0.54, -2.85, 0.66], ["c", -0.45, 0.06, -2.16, 0.06, -2.61, 0], ["c", -1.14, -0.12, -2.01, -0.33, -2.85, -0.66], ["c", -1.35, -0.51, -2.34, -1.26, -2.82, -2.1], ["l", -0.12, -0.18], ["l", 0, 1.23], ["c", 0, 1.23, 0, 1.26, -0.06, 1.38], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["l", -0.06, -0.15], ["l", 0, -3.54], ["c", 0, -3.48, 0, -3.54, 0.06, -3.66], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"], ["m", 7.71, 0.63], ["c", -0.36, -0.06, -0.9, -0.06, -1.14, 0], ["c", -0.3, 0.03, -0.66, 0.24, -0.87, 0.42], ["c", -0.6, 0.54, -0.9, 1.62, -0.75, 2.82], ["c", 0.12, 0.93, 0.51, 1.68, 1.11, 2.31], ["c", 0.75, 0.72, 1.83, 1.2, 2.85, 1.26], ["c", 1.05, 0.06, 1.83, -0.54, 2.1, -1.65], ["c", 0.21, -0.9, 0.12, -1.95, -0.24, -2.82], ["c", -0.36, -0.81, -1.08, -1.53, -1.95, -1.95], ["c", -0.3, -0.15, -0.78, -0.3, -1.11, -0.39], ["z"]], w: 16.83, h: 8.145}
        , 'noteheads.whole': {d: [["M", 6.51, -4.05], ["c", 0.51, -0.03, 2.01, 0, 2.52, 0.03], ["c", 1.41, 0.18, 2.64, 0.51, 3.72, 1.08], ["c", 1.2, 0.63, 1.95, 1.41, 2.19, 2.31], ["c", 0.09, 0.33, 0.09, 0.9, -0, 1.23], ["c", -0.24, 0.9, -0.99, 1.68, -2.19, 2.31], ["c", -1.08, 0.57, -2.28, 0.9, -3.75, 1.08], ["c", -0.66, 0.06, -2.31, 0.06, -2.97, 0], ["c", -1.47, -0.18, -2.67, -0.51, -3.75, -1.08], ["c", -1.2, -0.63, -1.95, -1.41, -2.19, -2.31], ["c", -0.09, -0.33, -0.09, -0.9, -0, -1.23], ["c", 0.24, -0.9, 0.99, -1.68, 2.19, -2.31], ["c", 1.2, -0.63, 2.61, -0.99, 4.23, -1.11], ["z"], ["m", 0.57, 0.66], ["c", -0.87, -0.15, -1.53, 0, -2.04, 0.51], ["c", -0.15, 0.15, -0.24, 0.27, -0.33, 0.48], ["c", -0.24, 0.51, -0.36, 1.08, -0.33, 1.77], ["c", 0.03, 0.69, 0.18, 1.26, 0.42, 1.77], ["c", 0.6, 1.17, 1.74, 1.98, 3.18, 2.22], ["c", 1.11, 0.21, 1.95, -0.15, 2.34, -0.99], ["c", 0.24, -0.51, 0.36, -1.08, 0.33, -1.8], ["c", -0.06, -1.11, -0.45, -2.04, -1.17, -2.76], ["c", -0.63, -0.63, -1.47, -1.05, -2.4, -1.2], ["z"]], w: 14.985, h: 8.097}
        , 'noteheads.half': {d: [["M", 7.44, -4.05], ["c", 0.06, -0.03, 0.27, -0.03, 0.48, -0.03], ["c", 1.05, 0, 1.71, 0.24, 2.1, 0.81], ["c", 0.42, 0.6, 0.45, 1.35, 0.18, 2.4], ["c", -0.42, 1.59, -1.14, 2.73, -2.16, 3.39], ["c", -1.41, 0.93, -3.18, 1.44, -5.4, 1.53], ["c", -1.17, 0.03, -1.89, -0.21, -2.28, -0.81], ["c", -0.42, -0.6, -0.45, -1.35, -0.18, -2.4], ["c", 0.42, -1.59, 1.14, -2.73, 2.16, -3.39], ["c", 0.63, -0.42, 1.23, -0.72, 1.98, -0.96], ["c", 0.9, -0.3, 1.65, -0.42, 3.12, -0.54], ["z"], ["m", 1.29, 0.87], ["c", -0.27, -0.09, -0.63, -0.12, -0.9, -0.03], ["c", -0.72, 0.24, -1.53, 0.69, -3.27, 1.8], ["c", -2.34, 1.5, -3.3, 2.25, -3.57, 2.79], ["c", -0.36, 0.72, -0.06, 1.5, 0.66, 1.77], ["c", 0.24, 0.12, 0.69, 0.09, 0.99, 0], ["c", 0.84, -0.3, 1.92, -0.93, 4.14, -2.37], ["c", 1.62, -1.08, 2.37, -1.71, 2.61, -2.19], ["c", 0.36, -0.72, 0.06, -1.5, -0.66, -1.77], ["z"]], w: 10.37, h: 8.132}
        , 'noteheads.quarter': {d: [["M", 6.09, -4.05], ["c", 0.36, -0.03, 1.2, 0, 1.53, 0.06], ["c", 1.17, 0.24, 1.89, 0.84, 2.16, 1.83], ["c", 0.06, 0.18, 0.06, 0.3, 0.06, 0.66], ["c", 0, 0.45, 0, 0.63, -0.15, 1.08], ["c", -0.66, 2.04, -3.06, 3.93, -5.52, 4.38], ["c", -0.54, 0.09, -1.44, 0.09, -1.83, 0.03], ["c", -1.23, -0.27, -1.98, -0.87, -2.25, -1.86], ["c", -0.06, -0.18, -0.06, -0.3, -0.06, -0.66], ["c", 0, -0.45, 0, -0.63, 0.15, -1.08], ["c", 0.24, -0.78, 0.75, -1.53, 1.44, -2.22], ["c", 1.2, -1.2, 2.85, -2.01, 4.47, -2.22], ["z"]], w: 9.81, h: 8.094}
        , 'rests.whole': {d: [["M", 0.06, 0.03], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.49, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 2.19], ["l", 0, 2.19], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -5.49, 0], ["l", -5.46, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -2.19], ["l", 0, -2.19], ["z"]], w: 11.25, h: 4.68}
        , 'rests.half': {d: [["M", 0.06, -4.62], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.49, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 2.19], ["l", 0, 2.19], ["l", -0.06, 0.09], ["l", -0.09, 0.06], ["l", -5.49, 0], ["l", -5.46, 0], ["l", -0.09, -0.06], ["l", -0.06, -0.09], ["l", 0, -2.19], ["l", 0, -2.19], ["z"]], w: 11.25, h: 4.68}
        , 'rests.quarter': {d: [["M", 1.89, -11.82], ["c", 0.12, -0.06, 0.24, -0.06, 0.36, -0.03], ["c", 0.09, 0.06, 4.74, 5.58, 4.86, 5.82], ["c", 0.21, 0.39, 0.15, 0.78, -0.15, 1.26], ["c", -0.24, 0.33, -0.72, 0.81, -1.62, 1.56], ["c", -0.45, 0.36, -0.87, 0.75, -0.96, 0.84], ["c", -0.93, 0.99, -1.14, 2.49, -0.6, 3.63], ["c", 0.18, 0.39, 0.27, 0.48, 1.32, 1.68], ["c", 1.92, 2.25, 1.83, 2.16, 1.83, 2.34], ["c", -0, 0.18, -0.18, 0.36, -0.36, 0.39], ["c", -0.15, -0, -0.27, -0.06, -0.48, -0.27], ["c", -0.75, -0.75, -2.46, -1.29, -3.39, -1.08], ["c", -0.45, 0.09, -0.69, 0.27, -0.9, 0.69], ["c", -0.12, 0.3, -0.21, 0.66, -0.24, 1.14], ["c", -0.03, 0.66, 0.09, 1.35, 0.3, 2.01], ["c", 0.15, 0.42, 0.24, 0.66, 0.45, 0.96], ["c", 0.18, 0.24, 0.18, 0.33, 0.03, 0.42], ["c", -0.12, 0.06, -0.18, 0.03, -0.45, -0.3], ["c", -1.08, -1.38, -2.07, -3.36, -2.4, -4.83], ["c", -0.27, -1.05, -0.15, -1.77, 0.27, -2.07], ["c", 0.21, -0.12, 0.42, -0.15, 0.87, -0.15], ["c", 0.87, 0.06, 2.1, 0.39, 3.3, 0.9], ["l", 0.39, 0.18], ["l", -1.65, -1.95], ["c", -2.52, -2.97, -2.61, -3.09, -2.7, -3.27], ["c", -0.09, -0.24, -0.12, -0.48, -0.03, -0.75], ["c", 0.15, -0.48, 0.57, -0.96, 1.83, -2.01], ["c", 0.45, -0.36, 0.84, -0.72, 0.93, -0.78], ["c", 0.69, -0.75, 1.02, -1.8, 0.9, -2.79], ["c", -0.06, -0.33, -0.21, -0.84, -0.39, -1.11], ["c", -0.09, -0.15, -0.45, -0.6, -0.81, -1.05], ["c", -0.36, -0.42, -0.69, -0.81, -0.72, -0.87], ["c", -0.09, -0.18, -0, -0.42, 0.21, -0.51], ["z"]], w: 7.888, h: 21.435}
        , 'rests.8th': {d: [["M", 1.68, -6.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.12, 0, 0.18, 0, 0.33, -0.09], ["c", 0.39, -0.18, 1.32, -1.29, 1.68, -1.98], ["c", 0.09, -0.21, 0.24, -0.3, 0.39, -0.3], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.27, 1.11, -1.86, 6.42], ["c", -1.02, 3.48, -1.89, 6.39, -1.92, 6.42], ["c", 0, 0.03, -0.12, 0.12, -0.24, 0.15], ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.15, -0.57, 1.68, -4.92], ["c", 0.96, -2.67, 1.74, -4.89, 1.71, -4.89], ["l", -0.51, 0.15], ["c", -1.08, 0.36, -1.74, 0.48, -2.55, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 7.534, h: 13.883}
        , 'rests.16th': {d: [["M", 3.33, -6.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.15, 0.39, 0.57, 0.57, 0.87, 0.42], ["c", 0.39, -0.18, 1.2, -1.23, 1.62, -2.07], ["c", 0.06, -0.15, 0.24, -0.24, 0.36, -0.24], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.45, 1.86, -2.67, 10.17], ["c", -1.5, 5.55, -2.73, 10.14, -2.76, 10.17], ["c", -0.03, 0.03, -0.12, 0.12, -0.24, 0.15], ["c", -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.12, -0.57, 1.44, -4.92], ["c", 0.81, -2.67, 1.47, -4.86, 1.47, -4.89], ["c", -0.03, 0, -0.27, 0.06, -0.54, 0.15], ["c", -1.08, 0.36, -1.77, 0.48, -2.58, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ["c", 0.12, 0, 0.18, 0, 0.33, -0.09], ["c", 0.33, -0.15, 1.02, -0.93, 1.41, -1.59], ["c", 0.12, -0.21, 0.18, -0.39, 0.39, -1.08], ["c", 0.66, -2.1, 1.17, -3.84, 1.17, -3.87], ["c", 0, 0, -0.21, 0.06, -0.42, 0.15], ["c", -0.51, 0.15, -1.2, 0.33, -1.68, 0.42], ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 9.724, h: 21.383}
        , 'rests.32nd': {d: [["M", 4.23, -13.62], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.12, 0, 0.18, 0, 0.27, -0.06], ["c", 0.33, -0.21, 0.99, -1.11, 1.44, -1.98], ["c", 0.09, -0.24, 0.21, -0.33, 0.39, -0.33], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.57, 2.67, -3.21, 13.89], ["c", -1.8, 7.62, -3.3, 13.89, -3.3, 13.92], ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ["c", -0.24, -0, -0.3, -0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.09, -0.57, 1.23, -4.92], ["c", 0.69, -2.67, 1.26, -4.86, 1.29, -4.89], ["c", 0, -0.03, -0.12, -0.03, -0.48, 0.12], ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.12, 0.09, 0.3, 0.18, 0.48, 0.21], ["c", 0.12, -0, 0.18, -0, 0.3, -0.09], ["c", 0.42, -0.21, 1.29, -1.29, 1.56, -1.89], ["c", 0.03, -0.12, 1.23, -4.59, 1.23, -4.65], ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12], ["c", -0.63, 0.18, -1.2, 0.36, -1.74, 0.45], ["c", -0.39, 0.06, -0.54, 0.06, -1.02, 0.06], ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.18, 0.18, 0.51, 0.27, 0.72, 0.15], ["c", 0.3, -0.12, 0.69, -0.57, 1.08, -1.17], ["c", 0.42, -0.6, 0.39, -0.51, 1.05, -3.03], ["c", 0.33, -1.26, 0.6, -2.31, 0.6, -2.34], ["c", 0, -0, -0.21, 0.03, -0.45, 0.12], ["c", -0.57, 0.18, -1.14, 0.33, -1.62, 0.42], ["c", -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 11.373, h: 28.883}
        , 'rests.64th': {d: [["M", 5.13, -13.62], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.21, 0.54, 0.3, 0.75, 0.18], ["c", 0.24, -0.12, 0.63, -0.66, 1.08, -1.56], ["c", 0.33, -0.66, 0.39, -0.72, 0.6, -0.72], ["c", 0.12, 0, 0.27, 0.09, 0.33, 0.18], ["c", 0.03, 0.06, -0.69, 3.66, -3.54, 17.64], ["c", -1.95, 9.66, -3.57, 17.61, -3.57, 17.64], ["c", -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ["c", -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ["c", -0.24, 0, -0.3, 0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.06, -0.57, 1.05, -4.95], ["c", 0.6, -2.7, 1.08, -4.89, 1.08, -4.92], ["c", 0, 0, -0.24, 0.06, -0.51, 0.15], ["c", -0.66, 0.24, -1.2, 0.36, -1.77, 0.48], ["c", -0.42, 0.06, -0.57, 0.06, -1.05, 0.06], ["c", -0.69, 0, -0.87, -0.03, -1.35, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ["c", 0.3, 0.33, 0.42, 0.6, 0.6, 1.38], ["c", 0.09, 0.45, 0.21, 0.78, 0.33, 0.9], ["c", 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ["c", 0.21, 0.03, 0.39, -0.09, 0.72, -0.42], ["c", 0.45, -0.45, 1.02, -1.26, 1.17, -1.65], ["c", 0.03, -0.09, 0.27, -1.14, 0.54, -2.34], ["c", 0.27, -1.2, 0.48, -2.19, 0.51, -2.22], ["c", 0, -0.03, -0.09, -0.03, -0.48, 0.12], ["c", -1.17, 0.39, -2.22, 0.57, -3, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.15, 0.39, 0.57, 0.57, 0.9, 0.42], ["c", 0.36, -0.18, 1.2, -1.26, 1.47, -1.89], ["c", 0.03, -0.09, 0.3, -1.2, 0.57, -2.43], ["l", 0.51, -2.28], ["l", -0.54, 0.18], ["c", -1.11, 0.36, -1.8, 0.48, -2.61, 0.48], ["c", -0.66, 0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.21, 0.21, 0.54, 0.3, 0.75, 0.18], ["c", 0.36, -0.18, 0.93, -0.93, 1.29, -1.68], ["c", 0.12, -0.24, 0.18, -0.48, 0.63, -2.55], ["l", 0.51, -2.31], ["c", 0, -0.03, -0.18, 0.03, -0.39, 0.12], ["c", -1.14, 0.36, -2.1, 0.54, -2.82, 0.51], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 12.453, h: 36.383}
        , 'rests.128th': {d: [["M", 6.03, -21.12], ["c", 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.21, 0, 0.33, -0.06, 0.54, -0.36], ["c", 0.15, -0.21, 0.54, -0.93, 0.78, -1.47], ["c", 0.15, -0.33, 0.18, -0.39, 0.3, -0.48], ["c", 0.18, -0.09, 0.45, 0, 0.51, 0.15], ["c", 0.03, 0.09, -7.11, 42.75, -7.17, 42.84], ["c", -0.03, 0.03, -0.15, 0.09, -0.24, 0.15], ["c", -0.18, 0.06, -0.24, 0.06, -0.45, 0.06], ["c", -0.24, -0, -0.3, -0, -0.48, -0.06], ["c", -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ["c", -0.06, -0.03, 0.03, -0.57, 0.84, -4.98], ["c", 0.51, -2.7, 0.93, -4.92, 0.9, -4.92], ["c", 0, -0, -0.15, 0.06, -0.36, 0.12], ["c", -0.78, 0.27, -1.62, 0.48, -2.31, 0.57], ["c", -0.15, 0.03, -0.54, 0.03, -0.81, 0.03], ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.63, 0.48], ["c", 0.12, -0, 0.18, -0, 0.3, -0.09], ["c", 0.42, -0.21, 1.14, -1.11, 1.5, -1.83], ["c", 0.12, -0.27, 0.12, -0.27, 0.54, -2.52], ["c", 0.24, -1.23, 0.42, -2.25, 0.39, -2.25], ["c", 0, -0, -0.24, 0.06, -0.51, 0.18], ["c", -1.26, 0.39, -2.25, 0.57, -3.06, 0.54], ["c", -0.42, -0.03, -0.75, -0.12, -1.11, -0.3], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.21, 0.51, 0.3, 0.75, 0.18], ["c", 0.36, -0.15, 1.05, -0.99, 1.41, -1.77], ["l", 0.15, -0.3], ["l", 0.42, -2.25], ["c", 0.21, -1.26, 0.42, -2.28, 0.39, -2.28], ["l", -0.51, 0.15], ["c", -1.11, 0.39, -1.89, 0.51, -2.7, 0.51], ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ["c", 0.18, 0.18, 0.48, 0.27, 0.72, 0.21], ["c", 0.33, -0.12, 1.14, -1.26, 1.41, -1.95], ["c", 0, -0.09, 0.21, -1.11, 0.45, -2.34], ["c", 0.21, -1.2, 0.39, -2.22, 0.39, -2.28], ["c", 0.03, -0.03, 0, -0.03, -0.45, 0.12], ["c", -0.57, 0.18, -1.2, 0.33, -1.71, 0.42], ["c", -0.3, 0.06, -0.51, 0.06, -0.93, 0.06], ["c", -0.66, -0, -0.84, -0.03, -1.32, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ["c", 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ["c", 0.27, 0.3, 0.39, 0.54, 0.57, 1.26], ["c", 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ["c", 0.12, 0.27, 0.33, 0.45, 0.6, 0.48], ["c", 0.18, -0, 0.36, -0.09, 0.57, -0.33], ["c", 0.33, -0.36, 0.78, -1.14, 0.93, -1.56], ["c", 0.03, -0.12, 0.24, -1.2, 0.45, -2.4], ["c", 0.24, -1.2, 0.42, -2.22, 0.42, -2.28], ["c", 0.03, -0.03, 0, -0.03, -0.39, 0.09], ["c", -1.05, 0.36, -1.8, 0.48, -2.58, 0.48], ["c", -0.63, -0, -0.84, -0.03, -1.29, -0.27], ["c", -1.32, -0.63, -1.77, -2.16, -1.02, -3.3], ["c", 0.33, -0.45, 0.84, -0.81, 1.38, -0.9], ["z"]], w: 12.992, h: 43.883}
        , 'scripts.lbrace': {d:[["M", -20, -515], ["v", -2],["c", 35, -16, 53, -48, 53, -91],["c", 0, -34, -11, -84, -35, -150],["c", -13, -41, -18, -76, -18, -109], ["c", 0, -69, 29, -121, 87, -160], ["c", -44, 35, -63, 77, -63, 125], ["c", 0, 26, 8, 56, 21, 91], ["c", 27, 71, 37, 130, 37, 174], ["c", 0, 62, -26, 105, -77, 121], ["c", 52, 16, 77, 63, 77, 126], ["c", 0, 46, -10, 102, -37, 172], ["c", -13, 35, -21, 68, -21, 94], ["c", 0, 48, 19, 89, 63, 124], ["c", -58, -39, -87, -91, -87, -160], ["c", 0, -33, 5, -68, 18, -109], ["c", 24, -66, 35, -116, 35, -150], ["c", 0, -44, -18, -80, -53, -96], ["z"]], w:40, h:1027 }
        , 'scripts.ufermata': {d: [["M", -0.75, -10.77], ["c", 0.12, 0, 0.45, -0.03, 0.69, -0.03], ["c", 2.91, -0.03, 5.55, 1.53, 7.41, 4.35], ["c", 1.17, 1.71, 1.95, 3.72, 2.43, 6.03], ["c", 0.12, 0.51, 0.12, 0.57, 0.03, 0.69], ["c", -0.12, 0.21, -0.48, 0.27, -0.69, 0.12], ["c", -0.12, -0.09, -0.18, -0.24, -0.27, -0.69], ["c", -0.78, -3.63, -3.42, -6.54, -6.78, -7.38], ["c", -0.78, -0.21, -1.2, -0.24, -2.07, -0.24], ["c", -0.63, -0, -0.84, -0, -1.2, 0.06], ["c", -1.83, 0.27, -3.42, 1.08, -4.8, 2.37], ["c", -1.41, 1.35, -2.4, 3.21, -2.85, 5.19], ["c", -0.09, 0.45, -0.15, 0.6, -0.27, 0.69], ["c", -0.21, 0.15, -0.57, 0.09, -0.69, -0.12], ["c", -0.09, -0.12, -0.09, -0.18, 0.03, -0.69], ["c", 0.33, -1.62, 0.78, -3, 1.47, -4.38], ["c", 1.77, -3.54, 4.44, -5.67, 7.56, -5.97], ["z"], ["m", 0.33, 7.47], ["c", 1.38, -0.3, 2.58, 0.9, 2.31, 2.25], ["c", -0.15, 0.72, -0.78, 1.35, -1.47, 1.5], ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ["z"]], w: 19.748, h: 11.289}
        , 'scripts.dfermata': {d: [["M", -9.63, -0.42], ["c", 0.15, -0.09, 0.36, -0.06, 0.51, 0.03], ["c", 0.12, 0.09, 0.18, 0.24, 0.27, 0.66], ["c", 0.78, 3.66, 3.42, 6.57, 6.78, 7.41], ["c", 0.78, 0.21, 1.2, 0.24, 2.07, 0.24], ["c", 0.63, -0, 0.84, -0, 1.2, -0.06], ["c", 1.83, -0.27, 3.42, -1.08, 4.8, -2.37], ["c", 1.41, -1.35, 2.4, -3.21, 2.85, -5.22], ["c", 0.09, -0.42, 0.15, -0.57, 0.27, -0.66], ["c", 0.21, -0.15, 0.57, -0.09, 0.69, 0.12], ["c", 0.09, 0.12, 0.09, 0.18, -0.03, 0.69], ["c", -0.33, 1.62, -0.78, 3, -1.47, 4.38], ["c", -1.92, 3.84, -4.89, 6, -8.31, 6], ["c", -3.42, 0, -6.39, -2.16, -8.31, -6], ["c", -0.48, -0.96, -0.84, -1.92, -1.14, -2.97], ["c", -0.18, -0.69, -0.42, -1.74, -0.42, -1.92], ["c", 0, -0.12, 0.09, -0.27, 0.24, -0.33], ["z"], ["m", 9.21, 0], ["c", 1.2, -0.27, 2.34, 0.63, 2.34, 1.86], ["c", -0, 0.9, -0.66, 1.68, -1.5, 1.89], ["c", -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ["c", 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ["z"]], w: 19.744, h: 11.274}
        , 'scripts.sforzato': {d: [["M", -6.45, -3.69], ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ["c", 0.06, 0, 2.85, 0.72, 6.24, 1.59], ["l", 6.33, 1.65], ["c", 0.33, 0.06, 0.45, 0.21, 0.45, 0.51], ["c", 0, 0.3, -0.12, 0.45, -0.45, 0.51], ["l", -6.33, 1.65], ["c", -3.39, 0.87, -6.18, 1.59, -6.21, 1.59], ["c", -0.21, -0, -0.48, -0.24, -0.51, -0.45], ["c", 0, -0.15, 0.06, -0.36, 0.18, -0.45], ["c", 0.09, -0.06, 0.87, -0.27, 3.84, -1.05], ["c", 2.04, -0.54, 3.84, -0.99, 4.02, -1.02], ["c", 0.15, -0.06, 1.14, -0.24, 2.22, -0.42], ["c", 1.05, -0.18, 1.92, -0.36, 1.92, -0.36], ["c", 0, -0, -0.87, -0.18, -1.92, -0.36], ["c", -1.08, -0.18, -2.07, -0.36, -2.22, -0.42], ["c", -0.18, -0.03, -1.98, -0.48, -4.02, -1.02], ["c", -2.97, -0.78, -3.75, -0.99, -3.84, -1.05], ["c", -0.12, -0.09, -0.18, -0.3, -0.18, -0.45], ["c", 0.03, -0.15, 0.15, -0.3, 0.3, -0.39], ["z"]], w: 13.5, h: 7.5}
        , 'scripts.staccato': {d: [["M", -0.36, -1.47], ["c", 0.93, -0.21, 1.86, 0.51, 1.86, 1.47], ["c", -0, 0.93, -0.87, 1.65, -1.8, 1.47], ["c", -0.54, -0.12, -1.02, -0.57, -1.14, -1.08], ["c", -0.21, -0.81, 0.27, -1.65, 1.08, -1.86], ["z"]], w: 2.989, h: 3.004}
        , 'scripts.tenuto': {d: [["M", -4.2, -0.48], ["l", 0.12, -0.06], ["l", 4.08, 0], ["l", 4.08, 0], ["l", 0.12, 0.06], ["c", 0.39, 0.21, 0.39, 0.75, 0, 0.96], ["l", -0.12, 0.06], ["l", -4.08, 0], ["l", -4.08, 0], ["l", -0.12, -0.06], ["c", -0.39, -0.21, -0.39, -0.75, 0, -0.96], ["z"]], w: 8.985, h: 1.08}
        , 'scripts.umarcato': {d: [["M", -0.15, -8.19], ["c", 0.15, -0.12, 0.36, -0.03, 0.45, 0.15], ["c", 0.21, 0.42, 3.45, 7.65, 3.45, 7.71], ["c", -0, 0.12, -0.12, 0.27, -0.21, 0.3], ["c", -0.03, 0.03, -0.51, 0.03, -1.14, 0.03], ["c", -1.05, 0, -1.08, 0, -1.17, -0.06], ["c", -0.09, -0.06, -0.24, -0.36, -1.17, -2.4], ["c", -0.57, -1.29, -1.05, -2.34, -1.08, -2.34], ["c", -0, -0.03, -0.51, 1.02, -1.08, 2.34], ["c", -0.93, 2.07, -1.08, 2.34, -1.14, 2.4], ["c", -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ["c", -0.15, 0, -0.33, -0.18, -0.33, -0.33], ["c", -0, -0.06, 3.24, -7.32, 3.45, -7.71], ["c", 0.03, -0.06, 0.09, -0.15, 0.15, -0.15], ["z"]], w: 7.5, h: 8.245}
        , 'scripts.dmarcato': {d: [["M", -3.57, 0.03], ["c", 0.03, 0, 0.57, -0.03, 1.17, -0.03], ["c", 1.05, 0, 1.08, 0, 1.17, 0.06], ["c", 0.09, 0.06, 0.24, 0.36, 1.17, 2.4], ["c", 0.57, 1.29, 1.05, 2.34, 1.08, 2.34], ["c", 0, 0.03, 0.51, -1.02, 1.08, -2.34], ["c", 0.93, -2.07, 1.08, -2.34, 1.14, -2.4], ["c", 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ["c", 0.15, 0, 0.33, 0.18, 0.33, 0.33], ["c", 0, 0.09, -3.45, 7.74, -3.54, 7.83], ["c", -0.12, 0.12, -0.3, 0.12, -0.42, 0], ["c", -0.09, -0.09, -3.54, -7.74, -3.54, -7.83], ["c", 0, -0.09, 0.12, -0.27, 0.18, -0.3], ["z"]], w: 7.5, h: 8.25}
        , 'scripts.stopped': {d: [["M", -0.27, -4.08], ["c", 0.18, -0.09, 0.36, -0.09, 0.54, 0], ["c", 0.18, 0.09, 0.24, 0.15, 0.33, 0.3], ["l", 0.06, 0.15], ["l", -0, 1.5], ["l", -0, 1.47], ["l", 1.47, 0], ["l", 1.5, 0], ["l", 0.15, 0.06], ["c", 0.15, 0.09, 0.21, 0.15, 0.3, 0.33], ["c", 0.09, 0.18, 0.09, 0.36, -0, 0.54], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.12, 0.06, -0.18, 0.06, -1.62, 0.06], ["l", -1.47, 0], ["l", -0, 1.47], ["l", -0, 1.47], ["l", -0.06, 0.15], ["c", -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ["c", -0.18, 0.09, -0.36, 0.09, -0.54, 0], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["l", -0.06, -0.15], ["l", -0, -1.47], ["l", -0, -1.47], ["l", -1.47, 0], ["c", -1.44, 0, -1.5, 0, -1.62, -0.06], ["c", -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ["c", -0.09, -0.18, -0.09, -0.36, -0, -0.54], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["l", 0.15, -0.06], ["l", 1.47, 0], ["l", 1.47, 0], ["l", -0, -1.47], ["c", -0, -1.44, -0, -1.5, 0.06, -1.62], ["c", 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ["z"]], w: 8.295, h: 8.295}
        , 'scripts.upbow': {d: [["M", -4.65, -15.54], ["c", 0.12, -0.09, 0.36, -0.06, 0.48, 0.03], ["c", 0.03, 0.03, 0.09, 0.09, 0.12, 0.15], ["c", 0.03, 0.06, 0.66, 2.13, 1.41, 4.62], ["c", 1.35, 4.41, 1.38, 4.56, 2.01, 6.96], ["l", 0.63, 2.46], ["l", 0.63, -2.46], ["c", 0.63, -2.4, 0.66, -2.55, 2.01, -6.96], ["c", 0.75, -2.49, 1.38, -4.56, 1.41, -4.62], ["c", 0.06, -0.15, 0.18, -0.21, 0.36, -0.24], ["c", 0.15, 0, 0.3, 0.06, 0.39, 0.18], ["c", 0.15, 0.21, 0.24, -0.18, -2.1, 7.56], ["c", -1.2, 3.96, -2.22, 7.32, -2.25, 7.41], ["c", 0, 0.12, -0.06, 0.27, -0.09, 0.3], ["c", -0.12, 0.21, -0.6, 0.21, -0.72, 0], ["c", -0.03, -0.03, -0.09, -0.18, -0.09, -0.3], ["c", -0.03, -0.09, -1.05, -3.45, -2.25, -7.41], ["c", -2.34, -7.74, -2.25, -7.35, -2.1, -7.56], ["c", 0.03, -0.03, 0.09, -0.09, 0.15, -0.12], ["z"]], w: 9.73, h: 15.608}
        , 'scripts.downbow': {d: [["M", -5.55, -9.93], ["l", 0.09, -0.06], ["l", 5.46, 0], ["l", 5.46, 0], ["l", 0.09, 0.06], ["l", 0.06, 0.09], ["l", 0, 4.77], ["c", 0, 5.28, 0, 4.89, -0.18, 5.01], ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -2.97], ["l", 0, -2.85], ["l", -4.83, 0], ["l", -4.83, 0], ["l", 0, 2.85], ["c", 0, 2.79, 0, 2.88, -0.06, 2.97], ["c", -0.15, 0.24, -0.51, 0.24, -0.66, 0], ["c", -0.06, -0.09, -0.06, -0.21, -0.06, -4.89], ["l", 0, -4.77], ["z"]], w: 11.22, h: 9.992}
        , 'scripts.turn': {d: [["M", -4.77, -3.9], ["c", 0.36, -0.06, 1.05, -0.06, 1.44, 0.03], ["c", 0.78, 0.15, 1.5, 0.51, 2.34, 1.14], ["c", 0.6, 0.45, 1.05, 0.87, 2.22, 2.01], ["c", 1.11, 1.08, 1.62, 1.5, 2.22, 1.86], ["c", 0.6, 0.36, 1.32, 0.57, 1.92, 0.57], ["c", 0.9, -0, 1.71, -0.57, 1.89, -1.35], ["c", 0.24, -0.93, -0.39, -1.89, -1.35, -2.1], ["l", -0.15, -0.06], ["l", -0.09, 0.15], ["c", -0.03, 0.09, -0.15, 0.24, -0.24, 0.33], ["c", -0.72, 0.72, -2.04, 0.54, -2.49, -0.36], ["c", -0.48, -0.93, 0.03, -1.86, 1.17, -2.19], ["c", 0.3, -0.09, 1.02, -0.09, 1.35, -0], ["c", 0.99, 0.27, 1.74, 0.87, 2.25, 1.83], ["c", 0.69, 1.41, 0.63, 3, -0.21, 4.26], ["c", -0.21, 0.3, -0.69, 0.81, -0.99, 1.02], ["c", -0.3, 0.21, -0.84, 0.45, -1.17, 0.54], ["c", -1.23, 0.36, -2.49, 0.15, -3.72, -0.6], ["c", -0.75, -0.48, -1.41, -1.02, -2.85, -2.46], ["c", -1.11, -1.08, -1.62, -1.5, -2.22, -1.86], ["c", -0.6, -0.36, -1.32, -0.57, -1.92, -0.57], ["c", -0.9, 0, -1.71, 0.57, -1.89, 1.35], ["c", -0.24, 0.93, 0.39, 1.89, 1.35, 2.1], ["l", 0.15, 0.06], ["l", 0.09, -0.15], ["c", 0.03, -0.09, 0.15, -0.24, 0.24, -0.33], ["c", 0.72, -0.72, 2.04, -0.54, 2.49, 0.36], ["c", 0.48, 0.93, -0.03, 1.86, -1.17, 2.19], ["c", -0.3, 0.09, -1.02, 0.09, -1.35, 0], ["c", -0.99, -0.27, -1.74, -0.87, -2.25, -1.83], ["c", -0.69, -1.41, -0.63, -3, 0.21, -4.26], ["c", 0.21, -0.3, 0.69, -0.81, 0.99, -1.02], ["c", 0.48, -0.33, 1.11, -0.57, 1.74, -0.66], ["z"]], w: 16.366, h: 7.893}
        , 'scripts.trill': {d: [["M", -0.51, -16.02], ["c", 0.12, -0.09, 0.21, -0.18, 0.21, -0.18], ["l", -0.81, 4.02], ["l", -0.81, 4.02], ["c", 0.03, 0, 0.51, -0.27, 1.08, -0.6], ["c", 0.6, -0.3, 1.14, -0.63, 1.26, -0.66], ["c", 1.14, -0.54, 2.31, -0.6, 3.09, -0.18], ["c", 0.27, 0.15, 0.54, 0.36, 0.6, 0.51], ["l", 0.06, 0.12], ["l", 0.21, -0.21], ["c", 0.9, -0.81, 2.22, -0.99, 3.12, -0.42], ["c", 0.6, 0.42, 0.9, 1.14, 0.78, 2.07], ["c", -0.15, 1.29, -1.05, 2.31, -1.95, 2.25], ["c", -0.48, -0.03, -0.78, -0.3, -0.96, -0.81], ["c", -0.09, -0.27, -0.09, -0.9, -0.03, -1.2], ["c", 0.21, -0.75, 0.81, -1.23, 1.59, -1.32], ["l", 0.24, -0.03], ["l", -0.09, -0.12], ["c", -0.51, -0.66, -1.62, -0.63, -2.31, 0.03], ["c", -0.39, 0.42, -0.3, 0.09, -1.23, 4.77], ["l", -0.81, 4.14], ["c", -0.03, 0, -0.12, -0.03, -0.21, -0.09], ["c", -0.33, -0.15, -0.54, -0.18, -0.99, -0.18], ["c", -0.42, 0, -0.66, 0.03, -1.05, 0.18], ["c", -0.12, 0.06, -0.21, 0.09, -0.21, 0.09], ["c", 0, -0.03, 0.36, -1.86, 0.81, -4.11], ["c", 0.9, -4.47, 0.87, -4.26, 0.69, -4.53], ["c", -0.21, -0.36, -0.66, -0.51, -1.17, -0.36], ["c", -0.15, 0.06, -2.22, 1.14, -2.58, 1.38], ["c", -0.12, 0.09, -0.12, 0.09, -0.21, 0.6], ["l", -0.09, 0.51], ["l", 0.21, 0.24], ["c", 0.63, 0.75, 1.02, 1.47, 1.2, 2.19], ["c", 0.06, 0.27, 0.06, 0.36, 0.06, 0.81], ["c", 0, 0.42, 0, 0.54, -0.06, 0.78], ["c", -0.15, 0.54, -0.33, 0.93, -0.63, 1.35], ["c", -0.18, 0.24, -0.57, 0.63, -0.81, 0.78], ["c", -0.24, 0.15, -0.63, 0.36, -0.84, 0.42], ["c", -0.27, 0.06, -0.66, 0.06, -0.87, 0.03], ["c", -0.81, -0.18, -1.32, -1.05, -1.38, -2.46], ["c", -0.03, -0.6, 0.03, -0.99, 0.33, -2.46], ["c", 0.21, -1.08, 0.24, -1.32, 0.21, -1.29], ["c", -1.2, 0.48, -2.4, 0.75, -3.21, 0.72], ["c", -0.69, -0.06, -1.17, -0.3, -1.41, -0.72], ["c", -0.39, -0.75, -0.12, -1.8, 0.66, -2.46], ["c", 0.24, -0.18, 0.69, -0.42, 1.02, -0.51], ["c", 0.69, -0.18, 1.53, -0.15, 2.31, 0.09], ["c", 0.3, 0.09, 0.75, 0.3, 0.99, 0.45], ["c", 0.12, 0.09, 0.15, 0.09, 0.15, 0.03], ["c", 0.03, -0.03, 0.33, -1.59, 0.72, -3.45], ["c", 0.36, -1.86, 0.66, -3.42, 0.69, -3.45], ["c", 0, -0.03, 0.03, -0.03, 0.21, 0.03], ["c", 0.21, 0.06, 0.27, 0.06, 0.48, 0.06], ["c", 0.42, -0.03, 0.78, -0.18, 1.26, -0.48], ["c", 0.15, -0.12, 0.36, -0.27, 0.48, -0.39], ["z"], ["m", -5.73, 7.68], ["c", -0.27, -0.03, -0.96, -0.06, -1.2, -0.03], ["c", -0.81, 0.12, -1.35, 0.57, -1.5, 1.2], ["c", -0.18, 0.66, 0.12, 1.14, 0.75, 1.29], ["c", 0.66, 0.12, 1.92, -0.12, 3.18, -0.66], ["l", 0.33, -0.15], ["l", 0.09, -0.39], ["c", 0.06, -0.21, 0.09, -0.42, 0.09, -0.45], ["c", 0, -0.03, -0.45, -0.3, -0.75, -0.45], ["c", -0.27, -0.15, -0.66, -0.27, -0.99, -0.36], ["z"], ["m", 4.29, 3.63], ["c", -0.24, -0.39, -0.51, -0.75, -0.51, -0.69], ["c", -0.06, 0.12, -0.39, 1.92, -0.45, 2.28], ["c", -0.09, 0.54, -0.12, 1.14, -0.06, 1.38], ["c", 0.06, 0.42, 0.21, 0.6, 0.51, 0.57], ["c", 0.39, -0.06, 0.75, -0.48, 0.93, -1.14], ["c", 0.09, -0.33, 0.09, -1.05, -0, -1.38], ["c", -0.09, -0.39, -0.24, -0.69, -0.42, -1.02], ["z"]], w: 17.963, h: 16.49}
        , 'scripts.segno': {d: [["M", -1, -11.22], ["c", 0.78, -0.09, 1.59, 0.03, 2.31, 0.42], ["c", 1.2, 0.6, 2.01, 1.71, 2.31, 3.09], ["c", 0.09, 0.42, 0.09, 1.2, 0.03, 1.5], ["c", -0.15, 0.45, -0.39, 0.81, -0.66, 0.93], ["c", -0.33, 0.18, -0.84, 0.21, -1.23, 0.15], ["c", -0.81, -0.18, -1.32, -0.93, -1.26, -1.89], ["c", 0.03, -0.36, 0.09, -0.57, 0.24, -0.9], ["c", 0.15, -0.33, 0.45, -0.6, 0.72, -0.75], ["c", 0.12, -0.06, 0.18, -0.09, 0.18, -0.12], ["c", 0, -0.03, -0.03, -0.15, -0.09, -0.24], ["c", -0.18, -0.45, -0.54, -0.87, -0.96, -1.08], ["c", -1.11, -0.57, -2.34, -0.18, -2.88, 0.9], ["c", -0.24, 0.51, -0.33, 1.11, -0.24, 1.83], ["c", 0.27, 1.92, 1.5, 3.54, 3.93, 5.13], ["c", 0.48, 0.33, 1.26, 0.78, 1.29, 0.78], ["c", 0.03, 0, 1.35, -2.19, 2.94, -4.89], ["l", 2.88, -4.89], ["l", 0.84, 0], ["l", 0.87, 0], ["l", -0.03, 0.06], ["c", -0.15, 0.21, -6.15, 10.41, -6.15, 10.44], ["c", 0, 0, 0.21, 0.15, 0.48, 0.27], ["c", 2.61, 1.47, 4.35, 3.03, 5.13, 4.65], ["c", 1.14, 2.34, 0.51, 5.07, -1.44, 6.39], ["c", -0.66, 0.42, -1.32, 0.63, -2.13, 0.69], ["c", -2.01, 0.09, -3.81, -1.41, -4.26, -3.54], ["c", -0.09, -0.42, -0.09, -1.2, -0.03, -1.5], ["c", 0.15, -0.45, 0.39, -0.81, 0.66, -0.93], ["c", 0.33, -0.18, 0.84, -0.21, 1.23, -0.15], ["c", 0.81, 0.18, 1.32, 0.93, 1.26, 1.89], ["c", -0.03, 0.36, -0.09, 0.57, -0.24, 0.9], ["c", -0.15, 0.33, -0.45, 0.6, -0.72, 0.75], ["c", -0.12, 0.06, -0.18, 0.09, -0.18, 0.12], ["c", 0, 0.03, 0.03, 0.15, 0.09, 0.24], ["c", 0.18, 0.45, 0.54, 0.87, 0.96, 1.08], ["c", 1.11, 0.57, 2.34, 0.18, 2.88, -0.9], ["c", 0.24, -0.51, 0.33, -1.11, 0.24, -1.83], ["c", -0.27, -1.92, -1.5, -3.54, -3.93, -5.13], ["c", -0.48, -0.33, -1.26, -0.78, -1.29, -0.78], ["c", -0.03, 0, -1.35, 2.19, -2.91, 4.89], ["l", -2.88, 4.89], ["l", -0.87, 0], ["l", -0.87, 0], ["l", 0.03, -0.06], ["c", 0.15, -0.21, 6.15, -10.41, 6.15, -10.44], ["c", 0, 0, -0.21, -0.15, -0.48, -0.3], ["c", -2.61, -1.44, -4.35, -3, -5.13, -4.62], ["c", -0.9, -1.89, -0.72, -4.02, 0.48, -5.52], ["c", 0.69, -0.84, 1.68, -1.41, 2.73, -1.53], ["z"], ["m", 8.76, 9.09], ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75], ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39], ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ["c", -0.21, 0, -0.27, 0, -0.39, -0.06], ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75], ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84], ["z"], ["m", -10.53, 2.61], ["c", 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ["c", 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ["c", 0.09, 0.18, 0.09, 0.57, 0, 0.75], ["c", -0.09, 0.18, -0.21, 0.3, -0.36, 0.39], ["c", -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ["c", -0.21, 0, -0.27, 0, -0.39, -0.06], ["c", -0.3, -0.15, -0.48, -0.45, -0.48, -0.75], ["c", 0, -0.39, 0.24, -0.72, 0.63, -0.84], ["z"]], w: 15, h: 22.504}
        , 'scripts.coda': {d: [["M", -0.21, -13], ["c", 0.18, -0.12, 0.42, -0.06, 0.54, 0.12], ["c", 0.06, 0.09, 0.06, 0.18, 0.06, 1.5], ["l", 0, 1.38], ["l", 0.18, 0], ["c", 0.39, 0.06, 0.96, 0.24, 1.38, 0.48], ["c", 1.68, 0.93, 2.82, 3.24, 3.03, 6.12], ["c", 0.03, 0.24, 0.03, 0.45, 0.03, 0.45], ["c", 0, 0.03, 0.6, 0.03, 1.35, 0.03], ["c", 1.5, 0, 1.47, 0, 1.59, 0.18], ["c", 0.09, 0.12, 0.09, 0.3, -0, 0.42], ["c", -0.12, 0.18, -0.09, 0.18, -1.59, 0.18], ["c", -0.75, 0, -1.35, 0, -1.35, 0.03], ["c", -0, 0, -0, 0.21, -0.03, 0.42], ["c", -0.24, 3.15, -1.53, 5.58, -3.45, 6.36], ["c", -0.27, 0.12, -0.72, 0.24, -0.96, 0.27], ["l", -0.18, -0], ["l", -0, 1.38], ["c", -0, 1.32, -0, 1.41, -0.06, 1.5], ["c", -0.15, 0.24, -0.51, 0.24, -0.66, -0], ["c", -0.06, -0.09, -0.06, -0.18, -0.06, -1.5], ["l", -0, -1.38], ["l", -0.18, -0], ["c", -0.39, -0.06, -0.96, -0.24, -1.38, -0.48], ["c", -1.68, -0.93, -2.82, -3.24, -3.03, -6.15], ["c", -0.03, -0.21, -0.03, -0.42, -0.03, -0.42], ["c", 0, -0.03, -0.6, -0.03, -1.35, -0.03], ["c", -1.5, -0, -1.47, -0, -1.59, -0.18], ["c", -0.09, -0.12, -0.09, -0.3, 0, -0.42], ["c", 0.12, -0.18, 0.09, -0.18, 1.59, -0.18], ["c", 0.75, -0, 1.35, -0, 1.35, -0.03], ["c", 0, -0, 0, -0.21, 0.03, -0.45], ["c", 0.24, -3.12, 1.53, -5.55, 3.45, -6.33], ["c", 0.27, -0.12, 0.72, -0.24, 0.96, -0.27], ["l", 0.18, -0], ["l", 0, -1.38], ["c", 0, -1.53, 0, -1.5, 0.18, -1.62], ["z"], ["m", -0.18, 6.93], ["c", 0, -2.97, 0, -3.15, -0.06, -3.15], ["c", -0.09, 0, -0.51, 0.15, -0.66, 0.21], ["c", -0.87, 0.51, -1.38, 1.62, -1.56, 3.51], ["c", -0.06, 0.54, -0.12, 1.59, -0.12, 2.16], ["l", 0, 0.42], ["l", 1.2, 0], ["l", 1.2, 0], ["l", 0, -3.15], ["z"], ["m", 1.17, -3.06], ["c", -0.09, -0.03, -0.21, -0.06, -0.27, -0.09], ["l", -0.12, 0], ["l", 0, 3.15], ["l", 0, 3.15], ["l", 1.2, 0], ["l", 1.2, 0], ["l", 0, -0.81], ["c", -0.06, -2.4, -0.33, -3.69, -0.93, -4.59], ["c", -0.27, -0.39, -0.66, -0.69, -1.08, -0.81], ["z"], ["m", -1.17, 10.14], ["l", 0, -3.15], ["l", -1.2, -0], ["l", -1.2, -0], ["l", 0, 0.81], ["c", 0.03, 0.96, 0.06, 1.47, 0.15, 2.13], ["c", 0.24, 2.04, 0.96, 3.12, 2.13, 3.36], ["l", 0.12, -0], ["l", 0, -3.15], ["z"], ["m", 3.18, -2.34], ["l", 0, -0.81], ["l", -1.2, 0], ["l", -1.2, 0], ["l", 0, 3.15], ["l", 0, 3.15], ["l", 0.12, 0], ["c", 1.17, -0.24, 1.89, -1.32, 2.13, -3.36], ["c", 0.09, -0.66, 0.12, -1.17, 0.15, -2.13], ["z"]], w: 16.035, h: 21.062}
        , 'scripts.comma': {d: [["M", 1.14, -4.62], ["c", 0.3, -0.12, 0.69, -0.03, 0.93, 0.15], ["c", 0.12, 0.12, 0.36, 0.45, 0.51, 0.78], ["c", 0.9, 1.77, 0.54, 4.05, -1.08, 6.75], ["c", -0.36, 0.63, -0.87, 1.38, -0.96, 1.44], ["c", -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ["c", -0.09, -0.18, -0.09, -0.3, 0.12, -0.6], ["c", 0.96, -1.44, 1.44, -2.97, 1.38, -4.35], ["c", -0.06, -0.93, -0.3, -1.68, -0.78, -2.46], ["c", -0.27, -0.39, -0.33, -0.63, -0.24, -0.96], ["c", 0.09, -0.27, 0.36, -0.54, 0.66, -0.63], ["z"]], w: 3.042, h: 9.237}
        , 'scripts.roll': {d: [["M", 1.95, -6], ["c", 0.21, -0.09, 0.36, -0.09, 0.57, 0], ["c", 0.39, 0.15, 0.63, 0.39, 1.47, 1.35], ["c", 0.66, 0.75, 0.78, 0.87, 1.08, 1.05], ["c", 0.75, 0.45, 1.65, 0.42, 2.4, -0.06], ["c", 0.12, -0.09, 0.27, -0.27, 0.54, -0.6], ["c", 0.42, -0.54, 0.51, -0.63, 0.69, -0.63], ["c", 0.09, 0, 0.3, 0.12, 0.36, 0.21], ["c", 0.09, 0.12, 0.12, 0.3, 0.03, 0.42], ["c", -0.06, 0.12, -3.15, 3.9, -3.3, 4.08], ["c", -0.06, 0.06, -0.18, 0.12, -0.27, 0.18], ["c", -0.27, 0.12, -0.6, 0.06, -0.99, -0.27], ["c", -0.27, -0.21, -0.42, -0.39, -1.08, -1.14], ["c", -0.63, -0.72, -0.81, -0.9, -1.17, -1.08], ["c", -0.36, -0.18, -0.57, -0.21, -0.99, -0.21], ["c", -0.39, 0, -0.63, 0.03, -0.93, 0.18], ["c", -0.36, 0.15, -0.51, 0.27, -0.9, 0.81], ["c", -0.24, 0.27, -0.45, 0.51, -0.48, 0.54], ["c", -0.12, 0.09, -0.27, 0.06, -0.39, 0], ["c", -0.24, -0.15, -0.33, -0.39, -0.21, -0.6], ["c", 0.09, -0.12, 3.18, -3.87, 3.33, -4.02], ["c", 0.06, -0.06, 0.18, -0.15, 0.24, -0.21], ["z"]], w: 10.817, h: 6.125}
        , 'scripts.prall': {d: [["M", -4.38, -3.69], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["c", 0.03, -0, 0.57, -0.84, 1.23, -1.83], ["c", 1.14, -1.68, 1.23, -1.83, 1.35, -1.89], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["l", 0.48, -0.69], ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9], ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6], ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37], ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["c", -0.03, 0, -0.57, 0.84, -1.23, 1.83], ["c", -1.14, 1.68, -1.23, 1.83, -1.35, 1.89], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["l", -0.48, 0.69], ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9], ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6], ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37], ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28], ["z"]], w: 15.011, h: 7.5}
        , 'scripts.mordent': {d: [["M", -0.21, -4.95], ["c", 0.27, -0.15, 0.63, 0, 0.75, 0.27], ["c", 0.06, 0.12, 0.06, 0.24, 0.06, 1.44], ["l", 0, 1.29], ["l", 0.57, -0.84], ["c", 0.51, -0.75, 0.57, -0.84, 0.69, -0.9], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["l", 0.48, -0.69], ["c", 0.51, -0.78, 0.54, -0.84, 0.69, -0.9], ["c", 0.42, -0.18, 0.87, 0.15, 0.81, 0.6], ["c", -0.03, 0.12, -0.3, 0.51, -1.5, 2.37], ["c", -1.38, 2.07, -1.5, 2.22, -1.62, 2.28], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.83, -1.89], ["c", -0.81, -0.99, -1.5, -1.8, -1.53, -1.86], ["c", -0.06, -0.03, -0.06, -0.03, -0.12, 0.03], ["c", -0.06, 0.06, -0.06, 0.15, -0.06, 2.28], ["c", -0, 1.95, -0, 2.25, -0.06, 2.34], ["c", -0.18, 0.45, -0.81, 0.48, -1.05, 0.03], ["c", -0.03, -0.06, -0.06, -0.24, -0.06, -1.41], ["l", -0, -1.35], ["l", -0.57, 0.84], ["c", -0.54, 0.78, -0.6, 0.87, -0.72, 0.93], ["c", -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ["c", -0.3, 0, -0.27, 0.03, -1.89, -1.95], ["l", -1.53, -1.83], ["l", -0.48, 0.69], ["c", -0.51, 0.78, -0.54, 0.84, -0.69, 0.9], ["c", -0.42, 0.18, -0.87, -0.15, -0.81, -0.6], ["c", 0.03, -0.12, 0.3, -0.51, 1.5, -2.37], ["c", 1.38, -2.07, 1.5, -2.22, 1.62, -2.28], ["c", 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ["c", 0.3, 0, 0.27, -0.03, 1.89, 1.95], ["l", 1.53, 1.83], ["c", 0.03, -0, 0.06, -0.06, 0.09, -0.09], ["c", 0.06, -0.12, 0.06, -0.15, 0.06, -2.28], ["c", -0, -1.92, -0, -2.22, 0.06, -2.31], ["c", 0.06, -0.15, 0.15, -0.24, 0.3, -0.3], ["z"]], w: 15.011, h: 10.012}
        , 'timesig.common': {d: [["M", 6.66, -7.826], ["c", 0.72, -0.06, 1.41, -0.03, 1.98, 0.09], ["c", 1.2, 0.27, 2.34, 0.96, 3.09, 1.92], ["c", 0.63, 0.81, 1.08, 1.86, 1.14, 2.73], ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09], ["c", -0.33, -0, -0.42, -0, -0.63, -0.06], ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2], ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9], ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ["l", 0.45, 0], ["c", 0.06, 0.03, 0.09, 0.03, 0.09, 0], ["c", 0, 0, -0.09, -0.12, -0.24, -0.27], ["c", -1.02, -1.11, -2.55, -1.68, -4.08, -1.5], ["c", -1.29, 0.15, -2.04, 0.69, -2.4, 1.74], ["c", -0.36, 0.93, -0.42, 1.89, -0.42, 5.37], ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77], ["c", 0.24, 1.08, 0.63, 1.68, 1.41, 2.07], ["c", 0.81, 0.39, 2.16, 0.45, 3.18, 0.09], ["c", 1.29, -0.45, 2.37, -1.53, 3.03, -2.97], ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39], ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ["c", -0.06, 0.39, -0.42, 1.38, -0.69, 1.89], ["c", -0.96, 1.8, -2.49, 2.94, -4.23, 3.18], ["c", -0.99, 0.12, -2.58, -0.06, -3.63, -0.45], ["c", -0.96, -0.36, -1.71, -0.84, -2.4, -1.5], ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56], ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61], ["c", 0.24, -1.95, 0.9, -3.45, 2.01, -4.56], ["c", 0.69, -0.66, 1.44, -1.11, 2.37, -1.47], ["c", 0.63, -0.24, 1.47, -0.42, 2.22, -0.48], ["z"]], w: 13.038, h: 15.697}
        , 'timesig.cut': {d: [["M", 6.24, -10.44], ["c", 0.09, -0.06, 0.09, -0.06, 0.48, -0.06], ["c", 0.36, 0, 0.36, 0, 0.45, 0.06], ["l", 0.06, 0.09], ["l", 0, 1.23], ["l", 0, 1.26], ["l", 0.27, 0], ["c", 1.26, 0, 2.49, 0.45, 3.48, 1.29], ["c", 1.05, 0.87, 1.8, 2.28, 1.89, 3.48], ["c", 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ["c", -0.24, 0.09, -0.3, 0.09, -0.63, 0.09], ["c", -0.33, -0, -0.42, -0, -0.63, -0.06], ["c", -0.66, -0.24, -1.14, -0.63, -1.41, -1.2], ["c", -0.15, -0.3, -0.21, -0.51, -0.24, -0.9], ["c", -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ["c", 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ["l", 0.45, -0], ["c", 0.06, 0.03, 0.09, 0.03, 0.09, -0], ["c", 0, -0.03, -0.45, -0.51, -0.66, -0.69], ["c", -0.87, -0.69, -1.83, -1.05, -2.94, -1.11], ["l", -0.42, 0], ["l", 0, 7.17], ["l", 0, 7.14], ["l", 0.42, 0], ["c", 0.69, -0.03, 1.23, -0.18, 1.86, -0.51], ["c", 1.05, -0.51, 1.89, -1.47, 2.46, -2.7], ["c", 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ["c", 0.09, -0.24, 0.15, -0.36, 0.3, -0.39], ["c", 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ["c", -0.03, 0.24, -0.21, 0.78, -0.39, 1.2], ["c", -0.96, 2.37, -2.94, 3.9, -5.13, 3.9], ["l", -0.3, 0], ["l", 0, 1.26], ["l", 0, 1.23], ["l", -0.06, 0.09], ["c", -0.09, 0.06, -0.09, 0.06, -0.45, 0.06], ["c", -0.39, 0, -0.39, 0, -0.48, -0.06], ["l", -0.06, -0.09], ["l", 0, -1.29], ["l", 0, -1.29], ["l", -0.21, -0.03], ["c", -1.23, -0.21, -2.31, -0.63, -3.21, -1.29], ["c", -0.15, -0.09, -0.45, -0.36, -0.66, -0.57], ["c", -1.11, -1.11, -1.8, -2.61, -2.04, -4.56], ["c", -0.06, -0.6, -0.06, -2.01, 0, -2.61], ["c", 0.24, -1.95, 0.93, -3.45, 2.04, -4.59], ["c", 0.42, -0.39, 0.78, -0.66, 1.26, -0.93], ["c", 0.75, -0.45, 1.65, -0.75, 2.61, -0.9], ["l", 0.21, -0.03], ["l", 0, -1.29], ["l", 0, -1.29], ["z"], ["m", -0.06, 10.44], ["c", 0, -5.58, 0, -6.99, -0.03, -6.99], ["c", -0.15, 0, -0.63, 0.27, -0.87, 0.45], ["c", -0.45, 0.36, -0.75, 0.93, -0.93, 1.77], ["c", -0.18, 0.81, -0.24, 1.8, -0.24, 4.74], ["c", 0, 2.97, 0.06, 3.96, 0.24, 4.77], ["c", 0.24, 1.08, 0.66, 1.68, 1.41, 2.07], ["c", 0.12, 0.06, 0.3, 0.12, 0.33, 0.15], ["l", 0.09, 0], ["l", 0, -6.96], ["z"]], w: 13.038, h: 20.97}
	, 'it.l':{d:[["M", 3.889, -4.778], ["c", -0.167, 1.167, -1.111, 2.833, -0.167, 3.5], ["c", 1, -0.278, 1.556, -0.833, 2.445, -1.278], ["l", -0, 0.389], ["c", -1.611, 1, -2.111, 1.945, -3.778, 2.445], ["c", -0.444, -0.112, -0.778, -0.945, -0.611, -1.612], ["l", 2.667, -10.111], ["c", 1.055, -1, 2.166, -2.5, 4.222, -2], ["l", -0.834, 1.056], ["c", -3.055, -0.778, -2.555, 3.111, -3.388, 5.389], ["c", -0.389, 1.111, -0.389, 1.166, -0.556, 2.222], ["z"]],w:6.933,h:13.822}
	, 'it.f':{d:[["M", 4.333, -6.833], ["c", 0.722, -3.778, 2.222, -7, 6.5, -6.667], ["l", -0.944, 1.111], ["c", -3.5, -1.111, -3.167, 3.167, -4.112, 5.556], ["c", 0.834, -0, 1.723, -0.111, 2.445, -0], ["c", -0.5, 0.611, -1.389, 0.722, -2.611, 0.611], ["c", -1.278, 4.056, -1.722, 8.945, -5.111, 10.889], ["c", -0.556, 0.333, -1.667, 0.333, -2.5, 0.167], ["c", 0.5, -0.667, 0.722, -1.5, 2, -1.167], ["c", 3.722, -0.778, 2.611, -6.389, 4.166, -9.889], ["l", -2.666, 0], ["c", 0.666, -0.444, 1.666, -0.833, 2.833, -0.611], ["z"]],w:12.833,h:18.467}
	, 'it.F':{d:[["M", 14.667, -12.389], ["c", -0.167, 0.778, -1.056, 1.111, -1.444, 1.444], ["l", -3.223, -0.055], ["l", -1.277, 5.167], ["l", 3.166, -0], ["c", -0.611, 0.777, -2, 0.777, -3.389, 0.777], ["c", -0.777, 4, -2.444, 7.556, -7.277, 7.278], ["c", 0.444, -0.667, 0.555, -1.444, 2.055, -1.278], ["c", 3.333, 0.334, 2.833, -3.444, 3.778, -5.889], ["l", -0.5, 0], ["c", 1.333, -1.388, 1.333, -4.055, 2, -6.055], ["c", -3.167, -0.667, -4.833, 2.055, -3.611, 4.833], ["l", -1.667, 0.778], ["c", -1.111, -3.944, 1.778, -6.333, 5.945, -6.333], ["c", 2, -0, 4.222, 0.333, 5.444, -0.667], ["z"]],w:13.444,h:14.626}
	, 'it.i':{d:[["M", 5.444, -12.333], ["l", 0.722, 1.389], ["c", -0.444, 0.333, -0.944, 0.611, -1.333, 1.055], ["c", -0.167, -0.444, -1.167, -1.277, -0.445, -1.555], ["z"], ["m", -0.389, 4.333], ["l", -1.389, 6.167], ["c", 0.334, 1.389, 1.778, -0.278, 2.556, -0.5], ["c", -0.056, 1.111, -1.278, 1, -1.778, 1.667], ["c", -0.833, 0.444, -1.222, 0.833, -1.944, 0.944], ["c", -0.445, -0.055, -0.556, -0.722, -0.445, -1.167], ["c", 0.167, -1.777, 1, -3.333, 1.278, -5.333], ["c", -0.278, -0.778, -1.167, 0.111, -1.722, 0.333], ["l", 0.055, -0.555], ["c", 1.167, -0.722, 2.111, -1.556, 3.167, -1.778], ["c", 0.167, 0, 0.222, 0.111, 0.222, 0.222], ["z"]],w:4.611,h:12.611}
	, 'it.n':{d:[["M", 6.556, 0.333], ["c", -0.889, -2.222, 1, -4.389, 0.944, -6.778], ["c", -0.388, -0.611, -1, 0.278, -1.555, 0.445], ["c", -0.5, 0.333, -0.556, 0.333, -1.5, 0.944], ["l", -1.167, 4.667], ["l", -1.5, 0.611], ["c", 0.5, -2.111, 1.334, -4.389, 1.611, -6.611], ["c", -0.333, -0.667, -1.166, 0.166, -1.777, 0.333], ["c", 0.5, -1.444, 2.166, -1.5, 3.277, -2.167], ["c", 0.667, 0.334, -0.222, 1.612, -0.222, 2.334], ["c", 1, -0.611, 2.667, -1.889, 4.222, -2.334], ["c", 0.334, 0, 0.445, 0.278, 0.334, 0.5], ["c", -0.278, 1.612, -1.167, 3.945, -1.445, 5.834], ["c", 0.111, 1, 1, 0.222, 1.445, -0], ["c", 0.444, -0.222, 0.444, -0.222, 1.166, -0.667], ["c", -0.555, 1.611, -2.722, 2.056, -3.833, 2.889], ["z"]],w:8.778,h:8.556}
	, 'it.e':{d:[["M", 4.389, -0.889], ["c", 1.389, 0, 2.056, -0.889, 3.222, -1.833], ["l", 0, 0.555], ["c", -1.611, 1.611, -3, 2.445, -4.222, 2.445], ["c", -1.111, -0, -1.722, -0.778, -1.667, -1.945], ["c", 0.167, -3.444, 1.389, -6.555, 4.556, -6.555], ["c", 0.667, -0, 1.167, 0.389, 1.111, 1.111], ["c", -0.222, 2.389, -2.722, 3, -4.167, 4.278], ["c", -0.055, 1.055, 0.223, 1.944, 1.167, 1.944], ["z"], ["m", 1.556, -5.667], ["c", 0.111, -0.833, -0.667, -1.055, -1.167, -0.555], ["c", -0.778, 0.833, -1.333, 2.111, -1.5, 3.555], ["c", 1.222, -0.889, 2.5, -1.222, 2.667, -3], ["z"]],w:5.892,h:8.5}
	, 'it.D':{d:[["M", 15.167, -8.056], ["c", -0.278, 6.778, -5.611, 8.667, -13.444, 8.056], ["l", 0.944, -0.945], ["c", 2.722, -0.055, 2.944, -1.833, 3.5, -4.111], ["l", 1.5, -5.944], ["c", -2.944, 0.222, -4.889, 2, -4.167, 5.166], ["l", -1.666, 0.778], ["c", -0.778, -3.778, 2.333, -6.111, 6.166, -6.611], ["l", 1.445, -0.611], ["l", -0.167, 0.555], ["c", 2.945, 0.056, 6, 0.945, 5.889, 3.667], ["z"], ["m", -7.833, 7.167], ["c", 4.5, 0.222, 6.111, -2.778, 6.111, -6.778], ["c", -0, -2.5, -1.611, -3.5, -4.334, -3.445], ["l", -2.166, 7.778], ["c", -0.611, 0.945, -1.222, 1.556, -2.167, 2.334], ["z"]],w:13.456,h:12.386}
	, 'it.d':{d:[["M", 2.222, 0.111], ["c", -1.389, -3.444, 1.167, -8.611, 5.056, -8.222], ["c", 0.444, -1.5, 0.666, -3, 1.833, -3.834], ["c", 1.167, -0.833, 1.833, -1.833, 3.444, -1.5], ["c", -0.333, 0.612, -0.611, 1.389, -1.611, 0.945], ["c", -2.666, 0.889, -2.111, 5.778, -3.222, 8.444], ["c", -0.056, 0.889, -0.778, 2.278, -0.167, 2.889], ["c", 0.723, -0.222, 1.556, -1, 2.389, -1.444], ["c", -0.555, 1.666, -2.555, 2, -3.778, 2.889], ["c", -0.722, -0.111, -0.444, -1.223, -0.333, -2.056], ["c", -1, 0.611, -2.278, 1.722, -3.333, 2.056], ["c", -0.111, -0, -0.167, -0.056, -0.278, -0.167], ["z"], ["m", 3.722, -7.389], ["c", -1.5, -0.278, -2.778, 3.333, -2.778, 5.333], ["c", 0, 1.667, 1.223, 0.5, 1.834, 0.112], ["l", 1, -0.723], ["l", 0.944, -4.166], ["c", -0.333, -0.389, -0.5, -0.445, -1, -0.556], ["z"]],w:10.716,h:13.788}
	, 'it.a':{d:[["M", 7.833, -1.444], ["c", 0.889, -0.167, 1.278, -0.833, 2, -1.167], ["c", -0.5, 1.778, -2.444, 2.056, -3.667, 2.889], ["c", -0.722, -0.333, -0.055, -1.333, 0, -2.222], ["c", -1.222, 0.722, -2.222, 1.667, -3.611, 2.222], ["c", -2.166, -3, 0.5, -9.5, 5.5, -8.444], ["c", 0.389, 0.055, 0.834, 0.111, 1.334, 0.222], ["c", -1.223, 1.389, -1.334, 4, -1.778, 6.111], ["c", -0, 0.278, 0.055, 0.389, 0.222, 0.389], ["z"], ["m", -0.444, -5.611], ["c", -3.223, -1.222, -3.889, 2.167, -4.112, 4.778], ["c", 0.389, 2.222, 2, -0, 3.056, -0.445], ["z"]],w:8.037,h:8.559}
	, 'it.C':{d:[["M", 3.389, -2.556], ["c", -0.167, 4.167, 5, 3.389, 7.167, 1.278], ["l", -0.111, 0.611], ["c", -2.167, 2, -8.889, 3.889, -8.667, -1.167], ["c", 0.222, -5.333, 3.5, -10, 8.555, -10], ["c", 1.5, 0, 2.167, 0.667, 2.389, 2], ["l", -1.5, 1.278], ["c", -0.111, -1.389, -0.555, -2.333, -1.944, -2.333], ["c", -3.833, -0, -5.722, 4.166, -5.889, 8.333], ["z"]],w:10.95,h:13.236}
	, 'it.c':{d:[["M", 3.278, -2.389], ["c", -0.056, 0.889, 0.389, 1.5, 1.167, 1.5], ["c", 0.611, 0, 1.666, -0.556, 3.222, -1.667], ["l", -0.056, 0.667], ["c", -1.389, 0.944, -2.722, 2, -4.444, 2.167], ["c", -2.945, -0.778, -0.833, -6.5, 0.833, -7.278], ["c", 0.778, -0.389, 1.278, -1.111, 2.278, -1.222], ["c", 0.778, -0.111, 1.333, 0.889, 1.111, 1.611], ["l", -1.167, 0.666], ["c", -0.111, -0.666, -0.222, -1.222, -0.833, -1.222], ["c", -1.389, 0.056, -2.055, 3, -2.111, 4.778], ["z"]],w:5.971,h:8.509}
	, 'it.p':{d:[["M", 9.667, -6.667], ["c", 0, 3.778, -2, 7.111, -6.167, 6.722], ["l", -0.944, 4.278], ["l", 2.222, 0.111], ["c", -0.778, 0.945, -3.222, 0.333, -4.944, 0.445], ["c", 0.333, -0.334, 0.611, -0.723, 1.333, -0.667], ["l", 2.333, -10.167], ["c", -0.111, -1.166, -1.333, -0.166, -1.833, 0], ["c", 0.5, -1.333, 2.278, -1.611, 3.389, -2.278], ["c", 0.667, 0.223, -0.111, 1.334, -0.111, 2.056], ["c", 1.278, -0.944, 4.722, -3.722, 4.722, -0.5], ["z"], ["m", -1.444, 0.889], ["c", -0, -2.333, -2.612, -0.167, -3.445, 0.444], ["l", -0.944, 4], ["c", 2.722, 1.723, 4.389, -1.833, 4.389, -4.444], ["z"]],w:9.833,h:13.204}
	, 'it.o':{d:[["M", 1.722, -1.722], ["c", 0.111, -3.722, 2.278, -6.056, 5.444, -6.5], ["c", 1.112, -0.167, 1.834, 0.722, 1.834, 1.833], ["c", -0.222, 3.778, -2.056, 6, -5.556, 6.667], ["c", -1, -0.056, -1.722, -0.833, -1.722, -2], ["z"], ["m", 2.889, 1.056], ["c", 2.222, -0, 3.333, -3.834, 2.5, -6.112], ["c", -0.222, -0.333, -0.556, -0.5, -1, -0.5], ["c", -1.945, 0, -2.833, 2.556, -2.833, 4.723], ["c", -0, 1, 0.444, 1.889, 1.333, 1.889], ["z"]],w:7.278,h:8.52}
	, 'it.S':{d:[["M", 9, -3.611], ["c", 0, 4, -6.111, 6.722, -9, 3.667], ["c", 0.444, -0.778, 0.5, -1.834, 1.222, -2.334], ["c", 0.167, 1.778, 1.278, 2.778, 3, 2.778], ["c", 1.778, 0, 3.222, -1.055, 3.222, -2.944], ["c", 0, -2.611, -3.277, -2.389, -3.277, -5], ["c", -0, -2.389, 2, -4.278, 4.389, -4.278], ["c", 1.055, -0, 1.666, 0.555, 1.777, 1.667], ["l", -1.333, 0.888], ["c", -0.222, -1.111, -0.278, -1.611, -1.333, -1.611], ["c", -1.334, 0, -2.167, 1.056, -2.167, 2.445], ["c", 0, 2.5, 3.5, 2.222, 3.5, 4.722], ["z"]],w:10.333,h:13.089}
	, 'it.s':{d:[["M", 2.278, 0.278], ["c", -1, 0, -1.556, -0.778, -1.444, -1.944], ["l", 1.388, -0.889], ["c", 0, 1.111, 0.278, 2, 1.167, 2], ["c", 0.945, -0.167, 1.722, -0.723, 1.667, -1.889], ["c", -0.445, -1.056, -2.222, -1.278, -2.222, -2.722], ["c", -0, -2, 3.055, -4.056, 4.722, -2.389], ["l", -0.945, 1.055], ["c", -0.555, -1.166, -2.555, -0.889, -2.5, 0.5], ["c", 0, 1.611, 2.334, 1.278, 2.223, 2.945], ["c", -0.167, 1.944, -1.889, 3.333, -4.056, 3.333], ["z"]],w:6.736,h:8.445}
	, 'it.punto':{d:[["M", 3.056, 0.167], ["c", -0.333, -0.611, -1.389, -1.556, -0.333, -1.944], ["l", 0.889, -0.778], ["c", 0.388, 0.722, 1.444, 1.611, 0.277, 2.111], ["c", -0.277, 0.167, -0.5, 0.444, -0.833, 0.611], ["z"]],w:2.157,h:2.722}   };


    this.getSymbolPathTxt = function (symb) {
        if (!glyphs[symb])
            return null;
        return this.stringify(glyphs[symb].d);
    };

    this.printSymbol = function (x, y, symb, paper) {
        if (!glyphs[symb])
            return null;
        var pathArray = this.pathClone(glyphs[symb].d);
        pathArray[0][1] += x;
        pathArray[0][2] += y;
        var path = paper.path().attr({path: pathArray, stroke: "none", fill: "#000000"});

        return path;//.translate(x,y);
    };

    this.getSymbolWidth = function (symbol) {
        var s = symbol.replace('graceheads','noteheads').replace('graceflags','flags'); // fixme:corrigir isso
        
        if (glyphs[s])
            return glyphs[s].w;
        return 0;
    };

    this.getSymbolHeight = function (symbol) {
        if (glyphs[symbol])
            return glyphs[symbol].h;
        return 0;
    };

    this.getSymbolAlign = function (symbol) {
        if (symbol.substring(0, 7) === "scripts" &&
                symbol !== "scripts.roll") {
            return "center";
        }
        return "left";
    };

    this.pathClone = function (pathArray) {
        var res = [];
        for (var i = 0, ii = pathArray.length; i < ii; i++) {
            res[i] = [];
            for (var j = 0, jj = pathArray[i].length; j < jj; j++) {
                res[i][j] = pathArray[i][j];
            }
        }
        return res;
    };

    this.stringify = function (pathArray) {
        var res = "";
        for (var i = 0, ii = pathArray.length; i < ii; i++) {
            if (i > 0 && (i%3===0) && !(pathArray[i].length === 1 && pathArray[i][0] === "z")) {
                res += '\n';
            }
            res += pathArray[i][0] + pathArray[i].slice(1).join(' ');
        }
        return res;
    };


    this.pathScale = function (pathArray, kx, ky) {
        for (var i = 0, ii = pathArray.length; i < ii; i++) {
            var p = pathArray[i];
            var j, jj;
            for (j = 1, jj = p.length; j < jj; j++) {
                p[j] *= (j % 2) ? kx : ky;
            }
        }
    };

    this.getYCorr = function (symbol) {
        switch (symbol) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "+":
                return -3;
            case "timesig.common":
            case "timesig.cut":
                return -1;
            case "flags.d32nd":
                return -1;
            case "flags.d64th":
                return -2;
            case "flags.u32nd":
                return 1;
            case "flags.u64th":
                return 3;
            case "rests.whole":
                return 1;
            case "rests.half":
                return -1;
            case "rests.8th":
                return -1;
            case "rests.quarter":
                return -2;
            case "rests.16th":
                return -1;
            case "rests.32nd":
                return -1;
            case "rests.64th":
                return -1;
            default:
                return 0;
        }
    };
};
//    abc_graphelements.js: All the drawable and layoutable datastructures to be printed by ABCXJS.write.Printer
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window, ABCXJS */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.write)
    window.ABCXJS.write = {};

ABCXJS.write.StaffGroupElement = function() {
    this.voices = [];
};

ABCXJS.write.StaffGroupElement.prototype.addVoice = function( voice ) {
    this.voices[this.voices.length] = voice;
};

ABCXJS.write.StaffGroupElement.prototype.finished = function() {
    for (var i = 0; i < this.voices.length; i++) {
        if (!this.voices[i].layoutEnded())
            return false;
    }
    return true;
};

ABCXJS.write.StaffGroupElement.prototype.layout = function(spacing, printer, debug) {
    this.spacingunits = 0; // number of times we will have ended up using the spacing distance (as opposed to fixed width distances)
    this.minspace = 1000; // a big number to start off with - used to find out what the smallest space between two notes is -- GD 2014.1.7
    var x = printer.paddingleft;

    // find out how much space will be taken up by voice headers
    var voiceheaderw = 0;
    for (var i = 0; i < this.voices.length; i++) {
        if (this.voices[i].header) {
            //FLAVIO fixme: obter a largura real do texto - text.getBBox().width
            voiceheaderw = Math.max(voiceheaderw, this.voices[i].header.length *5+10);
        }
    }
    x += voiceheaderw + (voiceheaderw? printer.paddingleft:0); // 10% of 0 is 0
    this.startx = x;

    var currentduration = 0;
    if (debug)
        waterbug.log("init layout");
    for (i = 0; i < this.voices.length; i++) {
        this.voices[i].beginLayout(x);
        for (b = 0; b < this.voices[i].beams.length; b++) {
            for (be = 0; be < this.voices[i].beams[b].elems.length; be++) {
                var elem = this.voices[i].beams[b].elems[be];
                this.voices[i].stave.highest = Math.max(elem.top, this.voices[i].stave.highest);
                this.voices[i].stave.lowest = Math.min(elem.bottom-2, this.voices[i].stave.lowest);
            }
        }
    }

    var c = 0;
    while (!this.finished()) {
        
        if( c++ > 1000 ) {
            alert( 'não termina!' );
        }
        
        // find first duration level to be laid out among candidates across voices

        currentduration = null; // candidate smallest duration level
        for (i = 0; i < this.voices.length; i++) {
            if (!this.voices[i].layoutEnded() && (!currentduration || this.voices[i].getDurationIndex() < currentduration))
                currentduration = this.voices[i].getDurationIndex();
        }
        if (debug)
            waterbug.log("currentduration: ", currentduration);


        // isolate voices at current duration level
        var currentvoices = [];
        var othervoices = [];
        for (i = 0; i < this.voices.length; i++) {
            if (this.voices[i].getDurationIndex() !== currentduration) {
                othervoices.push(this.voices[i]);
                //waterbug.log("out: voice ",i);
            } else {
                currentvoices.push(this.voices[i]);
                if (debug)
                    waterbug.log("in: voice ", i);
            }
        }

        // among the current duration level find the one which needs starting furthest right
        var spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
        var spacingduration = 0;
        for (i = 0; i < currentvoices.length; i++) {
            if (currentvoices[i].getNextX() > x) {
                x = currentvoices[i].getNextX();
                var sd = currentvoices[i].spacingduration;
                spacingunit = currentvoices[i].getSpacingUnits();
                // arredonda para zero os numeros muito pequenos - evita erros de NaN em operações posteriores
                spacingduration = Math.abs(sd) < 0.001 ? Math.round(sd) : sd;
            }
        }
        this.spacingunits += spacingunit;
        this.minspace = Math.min(this.minspace, spacingunit);

        for (i = 0; i < currentvoices.length; i++) {
            var voicechildx = currentvoices[i].layoutOneItem(x, spacing );
            var dx = voicechildx - x;
            if (dx > 0) {
                x = voicechildx; //update x
                for (var j = 0; j < i; j++) { // shift over all previously laid out elements
                    currentvoices[j].shiftRight(dx);
                }
            }
        }

        // remove the value of already counted spacing units in other voices (e.g. if a voice had planned to use up 5 spacing units but is not in line to be laid out at this duration level - where we've used 2 spacing units - then we must use up 3 spacing units, not 5)
        for (i = 0; i < othervoices.length; i++) {
            othervoices[i].spacingduration -= spacingduration;
            othervoices[i].updateNextX(x, spacing); // adjust other voices expectations
        }

        // update indexes of currently laid out elems
        for (i = 0; i < currentvoices.length; i++) {
            var voice = currentvoices[i];
            voice.updateIndices();
        }
    } // finished laying out


    // find the greatest remaining x as a base for the width
    for (i = 0; i < this.voices.length; i++) {
        if (this.voices[i].getNextX() > x) {
            x = this.voices[i].getNextX();
            spacingunit = this.voices[i].getSpacingUnits();
        }
    }
    this.spacingunits += spacingunit;
    this.w = x;

    for (i = 0; i < this.voices.length; i++) {
        this.voices[i].w = this.w;
    }
};

ABCXJS.write.StaffGroupElement.prototype.calcShiftAbove = function(voz) {
  var abv = Math.max( voz.stave.highest, ABCXJS.write.spacing.TOPNOTE) - ABCXJS.write.spacing.TOPNOTE;
  return (abv+2) * ABCXJS.write.spacing.STEP;
};

ABCXJS.write.StaffGroupElement.prototype.calcHeight = function(voz) {
    // calculo da altura da pauta + uma pequena folga
    var h = (2+voz.stave.highest-voz.stave.lowest) * ABCXJS.write.spacing.STEP;
    // inclui espaço para as linhas de texto
    h += 14 * voz.stave.lyricsRows;
    return h;
};

ABCXJS.write.StaffGroupElement.prototype.draw = function(printer, groupNumber) {
    
    var height = 0;
    var shiftabove = 0;
    var y =  printer.y;
    var yi = printer.y;
    
    // posiciona cada pauta do grupo e determina a altura final da impressão
    for (var i = 0; i < this.voices.length; i++) {

        var h = 0;
        
        if( this.voices[i].stave.lyricsRows === 0 )
            this.voices[i].stave.lowest -=2;
        
        shiftabove = this.calcShiftAbove( this.voices[i] );
        
        if( this.voices[i].duplicate ) {
            
            var above = this.voices[i-1].stave.y - this.voices[i-1].stave.top;
            var lastH = this.voices[i-1].stave.bottom - this.voices[i-1].stave.top;

            this.voices[i].stave.top = this.voices[i-1].stave.top;
            
            if( shiftabove > above ) {
                this.voices[i-1].stave.y += (shiftabove-above);
            }

            this.voices[i].stave.y = this.voices[i-1].stave.y;
            
            var x = Math.min(this.voices[i].stave.lowest,this.voices[i-1].stave.lowest);
            this.voices[i].stave.lowest = x;
            this.voices[i-1].stave.lowest = x;

            var x = Math.max(this.voices[i].stave.highest,this.voices[i-1].stave.highest);
            this.voices[i].stave.highest = x;
            this.voices[i-1].stave.highest = x;
            
            h = this.calcHeight(this.voices[i]);

            if( h > lastH ) {
                height += (h-lastH);
                y += (h-lastH);
            }
            
            this.voices[i-1].stave.bottom = y;
            this.voices[i].stave.bottom = y;
           
        } else {
            
            if (groupNumber > 0 && i === 0 && this.voices[i].stave.subtitle) {
                y += 5 ;
            }

            h = this.calcHeight(this.voices[i]);

            this.voices[i].stave.top = y;
            this.voices[i].stave.y = y + shiftabove;

            height += h;
            y += h;
            
            this.voices[i].stave.bottom = y;
        }
    }
    
    // verifica se deve iniciar nova pagina
    var nexty = printer.y + height + printer.staffsep ; 
    if( nexty >= printer.estimatedPageLength )  {
        printer.skipPage();
    } else  if (groupNumber > 0) {
     // ou espaco entre os grupos de pautas
      printer.y += printer.staffsep; 
    }
    
    var delta = printer.y - yi; 

    // ajusta a grupo para a nova posição
    if( delta !== 0 ) {
        for (var i = 0; i < this.voices.length; i++) {
            this.voices[i].stave.bottom += delta;
            this.voices[i].stave.top += delta;
            this.voices[i].stave.y += delta;
        }    
    }
    
    // imprime a pauta
    for (i = 0; i < this.voices.length; i++) {
        if (this.voices[i].stave.numLines === 0 || this.voices[i].duplicate)
            continue;
        printer.y = this.voices[i].stave.y;
        if( typeof(debug) !== 'undefined' && debug ) {
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.y, "#ff0000"); 
          printer.printDebugMsg( this.startx-5, this.voices[i].stave.y, 'y' );
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.top, "#00ff00"); 
          printer.printDebugMsg( this.startx-5, this.voices[i].stave.top, 'top' );
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.bottom, "#00ff00"); 
          printer.printDebugMsg( this.startx+50, this.voices[i].stave.bottom, 'bottom' );
          printer.printDebugLine(this.startx, this.w, printer.calcY(this.voices[i].stave.highest), "#0000ff"); 
          printer.printDebugMsg( this.w-50, printer.calcY(this.voices[i].stave.highest), 'highest' );
          printer.printDebugLine(this.startx, this.w, printer.calcY(this.voices[i].stave.lowest), "#0000ff"); 
          printer.printDebugMsg( this.w-50, printer.calcY(this.voices[i].stave.lowest), 'lowest' );
        }  
        printer.printStave(this.startx, this.w-1, this.voices[i].stave);
    }
    
    for (i = 0; i < this.voices.length; i++) {
        if (groupNumber > 0 && i === 0 && this.voices[i].stave.subtitle) {
            printer.y = this.voices[i].stave.top - 18;
            printer.printSubtitleLine(this.voices[i].stave.subtitle);
        }
        this.voices[i].draw(printer);
    }

    if (this.voices.length > 0) {
        var top = this.voices[0].stave.y;
        var clef = this.voices[this.voices.length - 1].stave.clef.type;
        var bottom = printer.calcY(clef==="accordionTab"?0:2);
        printer.printBar(this.startx, 0.6, top, bottom, false);
        printer.printBar(this.w-1, 0.6, top, bottom, false);
        if (this.voices.length > 1)  {
            printer.paper.printBrace(this.startx-10, top-10, bottom+10);  
        }
    }
    // registra a posição do staffgroup e sua altura para uso posterior, fazendo scroll durante a execução do MIDI.
    this.top = yi+delta +printer.totalY;
    this.height = height;
    
    // nova posição da impressora
    printer.y = yi+ delta + height; 
    
};

ABCXJS.write.VoiceElement = function(voicenumber, staffnumber, abcstaff) {
    this.children = [];
    this.beams = [];
    this.otherchildren = []; // ties, slurs, triplets
    this.w = 0;
    this.duplicate = false;
    this.voicenumber = voicenumber; //number of the voice on a given stave (not staffgroup)
    this.staffnumber = staffnumber; // number of the staff in the staffgroup
    this.voicetotal = abcstaff.voices.length;
    this.stem = abcstaff.stem[voicenumber];
    this.stave = {
        y: 0
       ,top: 0
       ,bottom: 0
       ,clef: abcstaff.clef
       ,subtitle: abcstaff.subtitle
       ,lyricsRows: abcstaff.lyricsRows
       ,lowest: (abcstaff.clef.type === "accordionTab" ) ? -2 : 0
       ,highest: (abcstaff.clef.type === "accordionTab" ) ? 21.5 : 10
       ,numLines: (abcstaff.clef.type === "accordionTab" ) ? 4 : abcstaff.clef.staffLines || 5
    };
};

ABCXJS.write.VoiceElement.prototype.addChild = function(child) {
    this.children[this.children.length] = child;
};

ABCXJS.write.VoiceElement.prototype.addOther = function(child) {
    if (child instanceof ABCXJS.write.BeamElem) {
        this.beams.push(child);
    } else {
        this.otherchildren.push(child);
    }
};

ABCXJS.write.VoiceElement.prototype.updateIndices = function() {
    if (!this.layoutEnded()) {
        this.durationindex += this.children[this.i].duration;
        if (this.children[this.i].duration === 0)
            this.durationindex = Math.round(this.durationindex * 64) / 64; // everytime we meet a barline, do rounding to nearest 64th
        this.i++;
    }
};

ABCXJS.write.VoiceElement.prototype.layoutEnded = function() {
    return (this.i >= this.children.length);
};

ABCXJS.write.VoiceElement.prototype.getDurationIndex = function() {
    return this.durationindex - (this.children[this.i] && (this.children[this.i].duration > 0) ? 0 : 0.0000005); // if the ith element doesn't have a duration (is not a note), its duration index is fractionally before. This enables CLEF KEYSIG TIMESIG PART, etc. to be laid out before we get to the first note of other voices
};

// number of spacing units expected for next positioning
ABCXJS.write.VoiceElement.prototype.getSpacingUnits = function() {
    return (this.minx < this.nextx) ? Math.sqrt(this.spacingduration * 8) : 0; // we haven't used any spacing units if we end up using minx
};

//
ABCXJS.write.VoiceElement.prototype.getNextX = function() {
    return Math.max(this.minx, this.nextx);
};

ABCXJS.write.VoiceElement.prototype.beginLayout = function(startx) {
    this.i = 0;
    this.durationindex = 0;
    this.ii = this.children.length;
    this.startx = startx;
    this.minx = startx; // furthest left to where negatively positioned elements are allowed to go
    this.nextx = startx; // x position where the next element of this voice should be placed assuming no other voices and no fixed width constraints
    this.spacingduration = 0; // duration left to be laid out in current iteration (omitting additional spacing due to other aspects, such as bars, dots, sharps and flats)
};

// Try to layout the element at index this.i
// x - position to try to layout the element at
// spacing - base spacing
// can't call this function more than once per iteration
ABCXJS.write.VoiceElement.prototype.layoutOneItem = function(x, spacing) {
    var child = this.children[this.i];
    if (!child)
        return 0;
    var er = x - this.minx; // available extrawidth to the left
    if (er < child.getExtraWidth()) { // shift right by needed amount
        x += child.getExtraWidth() - er;
    }
    child.x = x; // place child at x

    this.spacingduration = child.duration;
    //update minx
    this.minx = x + child.getMinWidth(); // add necessary layout space
    if (this.i !== this.ii - 1)
        this.minx += child.minspacing; // add minimumspacing except on last elem

    this.updateNextX(x, spacing);

    // contribute to staff y position
    this.stave.highest = Math.max(child.top, this.stave.highest);
    this.stave.lowest = Math.min(child.bottom, this.stave.lowest);

    return x; // where we end up having placed the child
};

// call when spacingduration has been updated
ABCXJS.write.VoiceElement.prototype.updateNextX = function(x, spacing) {
    var temp = x + (spacing * Math.sqrt(this.spacingduration * 8));
    // isso resolve um problema que apareceu no chrome 71.0.3578.98, mas não sei o impacto de retornar 0.
    this.nextx = isNaN(temp)? 0: temp;
};

ABCXJS.write.VoiceElement.prototype.shiftRight = function(dx) {
    var child = this.children[this.i];
    if (!child)
        return;
    child.x += dx;
    this.minx += dx;
    this.nextx += dx;
};

ABCXJS.write.VoiceElement.prototype.draw = function(printer) {
    var ve = this;
    var width = ve.w - 1;
    printer.y = ve.stave.y;
    
    if (this.header) { // print voice name
        var headerY = (ve.stave.clef.type!=='accordionTab'? printer.calcY(6) : ve.stave.y ) +3;
        var headerX = printer.paddingleft;
        printer.printText(headerX, headerY,  this.header, 'abc_voice_header', 'start' );
    }
    
    // beams must be drawn first for proper printing of triplets, slurs and ties.
    for (var i = 0; i < this.beams.length; i++) {
        this.beams[i].draw(printer ); 
    };

    // bars, notes, stems, etc
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(printer, ve.stave);
    }
    
    // tie arcs, endings, decorations, etc..
    for (var i = 0; i < this.otherchildren.length; i++) {
        this.otherchildren[i].draw(printer, ve.startx + 10, width, ve.stave, ve.staffnumber, ve.voicenumber );
    };

};

// duration - actual musical duration - different from notehead duration in triplets. 
// refer to abcelem to get the notehead duration
// minspacing - spacing which must be taken on top of the width defined by the duration
ABCXJS.write.AbsoluteElement = function(abcelem, duration, minspacing) {
    this.abcelem = abcelem;
    this.duration = duration;
    this.minspacing = minspacing || 0;
    this.x = 0;
    this.children = [];
    this.heads = [];
    this.extra = [];
    this.extraw = 0;
    this.decs = [];
    this.w = 0;
    this.right = [];
    this.invisible = false;
    this.bottom = 7;
    this.top = 7;
};

ABCXJS.write.AbsoluteElement.prototype.getMinWidth = function() {
    // absolute space taken to the right of the note
    return this.w;
};

ABCXJS.write.AbsoluteElement.prototype.getExtraWidth = function() {
    // space needed to the left of the note
    return -this.extraw;
};

ABCXJS.write.AbsoluteElement.prototype.addExtra = function(extra) {
    if (extra.dx < this.extraw)
        this.extraw = extra.dx;
    this.extra[this.extra.length] = extra;
    this.addChild(extra);
};

ABCXJS.write.AbsoluteElement.prototype.addHead = function(head) {
    if (head.dx < this.extraw)
        this.extraw = head.dx;
    this.heads[this.heads.length] = head;
    this.addRight(head);
};

ABCXJS.write.AbsoluteElement.prototype.addRight = function(right) {
    if (right.dx + right.w > this.w)
        this.w = right.dx + right.w;
    this.right[this.right.length] = right;
    this.addChild(right);
};

ABCXJS.write.AbsoluteElement.prototype.addChild = function(child) {
    child.parent = this;
    this.children[this.children.length] = child;
    this.pushTop(child.top);
    this.pushBottom(child.bottom);
};

ABCXJS.write.AbsoluteElement.prototype.pushTop = function(top) {
    this.top = Math.max(top, this.top);
};

ABCXJS.write.AbsoluteElement.prototype.pushBottom = function(bottom) {
    this.bottom = Math.min(bottom, this.bottom);
};

ABCXJS.write.AbsoluteElement.prototype.draw = function(printer, staveInfo ) {
    
    if (this.invisible) return;

    var l = 0;
    
    this.elemset = {};// printer.paper.set();
    
    // imprimir primeiro ledger e mante-los fora do grupo de selecionaveis
    for (var i = 0; i < this.children.length; i++) {
        //this.elemset.push(this.children[i].draw(printer, this.x, staveInfo ));
        if ( this.children[i].type === 'ledger' || this.children[i].type === 'part' ) {
            this.children[i].draw(printer, this.x, staveInfo );
        } else {
            l++; // count notes, bars, etc
        }
    }
    
    if( l > 0 ){
        printer.beginGroup(this);
    }
    
    for (var i = 0; i < this.children.length; i++) {
        if ( this.children[i].type !== 'ledger' && this.children[i].type !== 'part' ) {
            this.children[i].draw(printer, this.x, staveInfo );
        }
    }
    
    if( l > 0 ){
        printer.endGroup();
    }
    
    this.abcelem.parent = this; 
    this.abcelem.parent.staffGroup = printer.staffgroups.length; // indica em qual staff group este abc elem vai estar
                                                                 // lembrando que o staffgroup sera incluido mais adiante.
    
};
/*
var svgns = "http://www.w3.org/2000/svg";
for (var x = 0; x < 5000; x += 50) {
    for (var y = 0; y < 3000; y += 50) {
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttributeNS(null, 'x', x);
        rect.setAttributeNS(null, 'y', y);
        rect.setAttributeNS(null, 'height', '50');
        rect.setAttributeNS(null, 'width', '50');
        rect.setAttributeNS(null, 'fill', '#'+Math.round(0xffffff * Math.random()).toString(16));
        document.getElementById('svgOne').appendChild(rect);

  var translate = d3.transform(d3.select(this.parentNode).attr("transform")).translate;
        var dataset = [1,2,3,4]                                    // HERE
        vis.selectAll("line")                                      // HERE
            .data(dataset)                                 // HERE
            .enter()                                       // HERE
            .append("line")                                // HERE
            .attr("x1", translate[0])                            // HERE'S THE PROBLEM FOR PERRY
            .attr("y1", translate[1])   

 */

ABCXJS.write.AbsoluteElement.prototype.setMouse = function(printer) {
    var self = this;
    this.svgElem = document.getElementById(self.gid);
    
    if(ABCXJS.write.color.useTransparency) {
        try {
            var svgns = "http://www.w3.org/2000/svg";

            var bounds = this.svgElem.getBBox();
            var rect = document.createElementNS(svgns, 'rect');
                rect.setAttributeNS(null, 'x', bounds.x.toFixed(1)-1);
                rect.setAttributeNS(null, 'y', bounds.y.toFixed(1)-1);
                rect.setAttributeNS(null, 'height', bounds.height.toFixed(1)+2);
                rect.setAttributeNS(null, 'width', bounds.width.toFixed(1)+2);
                rect.setAttributeNS(null, 'fill', 'none' );

            this.svgElem.appendChild(rect);
            this.svgArea = rect;
        } catch( e ) {
            // Firefox dies if svgElem is not Visible
        }
    }    
    
    this.svgElem.onmouseover =  function() {self.highlight(true);};
    this.svgElem.onmouseout =  function() {self.unhighlight(true);};
    this.svgElem.onclick =  function() {printer.notifyClearNSelect(self, true);};
 };

ABCXJS.write.AbsoluteElement.prototype.highlight = function(keepState) {
    if(!this.svgElem) return;
    if(keepState) this.svgElem.prevFill = this.svgElem.style.fill;
    this.svgElem.style.setProperty( 'fill', ABCXJS.write.color.highLight );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill', ABCXJS.write.color.highLight );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill-opacity', '0.15' );
};

ABCXJS.write.AbsoluteElement.prototype.unhighlight = function(keepState) {
    if(!this.svgElem) return;
    var fill = (keepState && this.svgElem.prevFill ) ? this.svgElem.prevFill : ABCXJS.write.color.unhighLight;
    this.svgElem.style.setProperty( 'fill', fill );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill-opacity', '0' );
};


ABCXJS.write.RelativeElement = function(c, dx, w, pitch, opt) {
    opt = opt || {};
    this.x = 0;
    this.c = c;      // character or path or string
    this.dx = dx;    // relative x position
    this.w = w;      // minimum width taken up by this element (can include gratuitous space)
    this.pitch = pitch; // relative y position by pitch
    this.type = opt.type || "symbol"; // cheap types.
    this.pitch2 = opt.pitch2;
    this.linewidth = opt.linewidth;
    this.attributes = opt.attributes; // only present on textual elements
    this.top = pitch + ((opt.extreme === "above") ? 7 : 0);
    this.bottom = pitch - ((opt.extreme === "below") ? 7 : 0);
};

ABCXJS.write.RelativeElement.prototype.draw = function(printer, x, staveInfo ) {

    this.x = x + this.dx;

    switch (this.type) {
      
        case "symbol":
            if (this.c === null)
                return null;
            this.graphelem = printer.printSymbol(this.x, this.pitch, this.c);
            break;
        case "debug":
            this.graphelem = printer.printDebugMsg(this.x, staveInfo.highest+2, this.c);
            break;
        case "fingering":
            this.graphelem = printer.printFingering(this.x, staveInfo, this.c);
            break;
        case "lyrics":
            this.graphelem = printer.printLyrics(this.x, staveInfo, this.c);
            break;
        case "barnumber":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_ending', 'middle');
            break
        case "part":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_subtitle');
            break;
        case "text":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_text');
            break;
        case "tabText":
            this.graphelem = printer.printTabText(this.x, this.pitch, this.c);
            break;
        case "tabText2":
            this.graphelem = printer.printTabText2(this.x, this.pitch, this.c);
            break;
        case "tabText3":
            this.graphelem = printer.printTabText3(this.x, this.pitch, this.c);
            break;
        case "bar":
            this.graphelem = printer.printBar(this.x, this.linewidth, printer.calcY(this.pitch), printer.calcY(this.pitch2), true);
            break;
        case "stem":
            this.drawStem(printer);
            //this.graphelem = printer.printStem(this.x, this.linewidth, printer.calcY(this.pitch), printer.calcY(this.pitch2));
            break;
        case "ledger":
            this.graphelem = printer.printLedger(this.x, this.x + this.w, this.pitch);
            break;
    }
    
    return this.graphelem;
};

ABCXJS.write.RelativeElement.prototype.drawStem = function( printer ) {
    var beam = this.parent.beam;
    var abcelem = this.parent.abcelem;
    if( beam ) { // under the beam, calculate new size for the stem
        if (abcelem.rest) return;
        var i = this.parent.beamId; 
        var furthesthead = beam.elems[i].heads[(beam.asc) ? 0 : beam.elems[i].heads.length - 1];
        var ovaldelta = (beam.isgrace) ? 1 / 3 : 1 / 5;
        var pitch = furthesthead.pitch + ((beam.asc) ? ovaldelta : -ovaldelta);
        var y = printer.calcY(pitch);
        var x = furthesthead.x + ((beam.asc) ? furthesthead.w : 0);
        var bary = beam.getBarYAt(x);
        var dx = (beam.asc) ? -0.6 : 0.6;
        printer.printStem(x, dx, y, bary);        
    } else {
        this.graphelem = printer.printStem(this.x, 0.6*this.linewidth/*fixme: mudar linew para 0.6*/, printer.calcY(this.pitch), printer.calcY(this.pitch2));
    }
};

ABCXJS.write.TieElem = function(anchor1, anchor2, above, forceandshift) {
    this.anchor1 = anchor1; // must have a .x and a .pitch, and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)
    this.above = above; // true if the arc curves above
    this.force = forceandshift; // force the arc curve, regardless of beaming if true
    // move by +7 "up" by -7 if "down"
};

ABCXJS.write.TieElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {

    var startpitch;
    var endpitch;

    if (this.startlimitelem) {
        linestartx = this.startlimitelem.x + this.startlimitelem.w;
    }

    if (this.endlimitelem) {
        lineendx = this.endlimitelem.x;
    }
    // PER: We might have to override the natural slur direction if the first and last notes are not in the
    // save direction. We always put the slur up in this case. The one case that works out wrong is that we always
    // want the slur to be up when the last note is stem down. We can tell the stem direction if the top is
    // equal to the pitch: if so, there is no stem above it.
    if (!this.force && this.anchor2 && this.anchor2.pitch === this.anchor2.top)
        this.above = true;

    if (this.anchor1) {
        linestartx = this.anchor1.x;
        startpitch = this.above ? this.anchor1.highestVert : this.anchor1.pitch;
        if (!this.anchor2) {
            endpitch = this.above ? this.anchor1.highestVert : this.anchor1.pitch;
        }
    }

    if (this.anchor2) {
        lineendx = this.anchor2.x;
        endpitch = this.above ? this.anchor2.highestVert : this.anchor2.pitch;
        if (!this.anchor1) {
            startpitch = this.above ? this.anchor2.highestVert : this.anchor2.pitch;
        }
    }

    printer.printTieArc(linestartx, lineendx, startpitch, endpitch, this.above);

};

ABCXJS.write.DynamicDecoration = function(anchor, dec) {
    this.anchor = anchor;
    this.dec = dec;
};

ABCXJS.write.DynamicDecoration.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    var ypos = staveInfo.lowest-1;
    for( var r=0; r < this.dec.length; r ++ ) {
        printer.printSymbol(this.anchor.x+r*10, ypos, this.dec[r]);
    }    
};

ABCXJS.write.EndingElem = function(text, anchor1, anchor2) {
    this.text = text; // text to be displayed top left
    this.anchor1 = anchor1; // must have a .x property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
};

ABCXJS.write.EndingElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo, staffnumber, voicenumber) {
    if(staffnumber > 0  || voicenumber > 0)  return;

    var y = printer.calcY(staveInfo.highest + 5); // fixme: era 4

    if (this.anchor1) {
        linestartx = this.anchor1.x + this.anchor1.w;
        printer.paper.printLine( linestartx, y, linestartx, y + 10 );
        printer.paper.text( linestartx + 3, y + 9, this.text, 'abc_ending', 'start' );
    }

    if (this.anchor2) {
        lineendx = this.anchor2.x;
    }   
    
    printer.paper.printLine(linestartx, y, lineendx-5, y);  
};

ABCXJS.write.CrescendoElem = function(anchor1, anchor2, dir) {
    this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
    this.dir = dir; // either "<" or ">"
};

ABCXJS.write.CrescendoElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    var ypos = printer.calcY(staveInfo.lowest - 1);

    if (this.dir === "<") {
        printer.paper.printLine(this.anchor1.x, ypos, this.anchor2.x, ypos-4);
        printer.paper.printLine(this.anchor1.x, ypos, this.anchor2.x, ypos+4);
    } else {
        printer.paper.printLine(this.anchor1.x, ypos-4, this.anchor2.x, ypos);
        printer.paper.printLine(this.anchor1.x, ypos+4, this.anchor2.x, ypos);
    }
};

ABCXJS.write.TripletElem = function(tripletInfo, anchor1, anchor2, stemDir ) {
    this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
    this.forceUp = stemDir==='up';
    this.forceDown = stemDir==='down';
    this.number = tripletInfo.num;
    this.qtd_notes = tripletInfo.notes;
    this.avgPitch = tripletInfo.avgPitch;
    this.minPitch = 100;
    this.maxPitch = -100;
    this.asc = ! ( (this.forceUp || this.avgPitch <= 6 ) && (!this.forceDown) ); // hardcoded 6 is B
    this.multiplier = tripletInfo.num === 2 ? 1.5 : (tripletInfo.num-1)/tripletInfo.num;
    
};

ABCXJS.write.TripletElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    
    if (this.anchor1 && this.anchor2) {

        var maxslant = (this.qtd_notes? this.qtd_notes: this.number) / 2;
        var slant = this.anchor1.parent.abcelem.averagepitch - this.anchor2.parent.abcelem.averagepitch;
        var isFlat = true;
        
        if (isFlat ) {
            slant = 0;
        } else  {
            slant = Math.min(slant,maxslant);
            slant = Math.max(slant,-maxslant);
        }

        var ypos = Math.max( this.forceUp ? this.maxPitch+9 : (this.maxPitch >= 10 ? this.maxPitch + 3 : 13), 13) ;
        var starty = printer.calcY(ypos + Math.floor(slant / 2));
        var endy = printer.calcY(ypos + Math.floor(-slant / 2));

        if (this.anchor1.parent.beam &&
                this.anchor1.parent.beam === this.anchor2.parent.beam) {
            var beam = this.anchor1.parent.beam;
            this.asc = beam.asc;
            ypos = beam.pos;
        } else {
            var y = printer.calcY(ypos);
            var linestartx = this.anchor1.x -2;
            var lineendx = this.anchor2.x + this.anchor2.w;
            
            //printer.paper.printLine(linestartx, starty+ (!this.asc? 0 : -5), linestartx, starty + (!this.asc? 5 : 0) );
            //printer.paper.printLine(lineendx, endy+ (!this.asc? 0 : -5), lineendx, endy + (!this.asc? 5 : 0));

            printer.paper.printLine(linestartx, starty+ (true? 0 : -5), linestartx, starty + (true? 5 : 0) );
            printer.paper.printLine(lineendx, endy+ (true? 0 : -5), lineendx, endy + (true? 5 : 0));
            
            
            //printer.paper.printLine(linestartx, y, (linestartx + lineendx) / 2 - 5, y);
            //printer.paper.printLine((linestartx + lineendx) / 2 + 5, y, lineendx, y);
            
            printer.paper.printBeam( linestartx, starty, (linestartx + lineendx) / 2 - 5, y, (linestartx + lineendx) / 2 - 5, y+1, linestartx, starty+1 );
            printer.paper.printBeam( (linestartx + lineendx) / 2 + 5, y, lineendx, endy, lineendx, endy+1, (linestartx + lineendx) / 2 + 5, y+1 );
        }
        
        var ydelta = ypos + (beam ? ( this.asc ? 2 : -3.5 ) : -1 );
        var xdelta = ( this.anchor1.x + this.anchor2.x + this.anchor1.w + (beam && this.asc ? this.anchor2.w : 0 ) - 2 ) / 2;
        
        printer.printText( xdelta, ydelta, this.number, 'abc_ending', "middle");

    } else {
        waterbug.log( 'Incomplete triplet' );
    }
};

ABCXJS.write.BeamElem = function(type, flat) {
    this.isflat = (flat);
    this.isgrace = (type && type === "grace");
    this.forceup = (type && type === "up");
    this.forcedown = (type && type === "down");
    this.elems = []; // all the ABCXJS.write.AbsoluteElements
    this.total = 0;
    this.dy = (this.asc) ? ABCXJS.write.spacing.STEP * 1.2 : -ABCXJS.write.spacing.STEP * 1.2;
    if (this.isgrace)
        this.dy = this.dy * 0.4;
    this.allrests = true;
};

ABCXJS.write.BeamElem.prototype.add = function(abselem) {
    var pitch = abselem.abcelem.averagepitch;
    if (pitch === undefined)
        return; // don't include elements like spacers in beams
    this.allrests = this.allrests && abselem.abcelem.rest;
    abselem.beam = this;
    this.elems.push(abselem);
    //var pitch = abselem.abcelem.averagepitch;
    this.total += pitch; // TODO CHORD (get pitches from abselem.heads)
    if (!this.min || abselem.abcelem.minpitch < this.min) {
        this.min = abselem.abcelem.minpitch;
    }
    if (!this.max || abselem.abcelem.maxpitch > this.max) {
        this.max = abselem.abcelem.maxpitch;
    }
};

ABCXJS.write.BeamElem.prototype.average = function() {
    try {
        return this.total / this.elems.length;
    } catch (e) {
        return 0;
    }
};

ABCXJS.write.BeamElem.prototype.calcDir = function() {
    var average = this.average();
    this.asc = (this.forceup || this.isgrace || average < 6) && (!this.forcedown); // hardcoded 6 is B
    return this.asc;
};

ABCXJS.write.BeamElem.prototype.getBarYAt = function(x) {
    return this.starty + (this.endy - this.starty) / (this.endx - this.startx) * (x - this.startx);
};

ABCXJS.write.BeamElem.prototype.draw = function(printer) {

    if (this.elems.length === 0 || this.allrests)
        return;
    
    var average = this.average();
    var barpos = (this.isgrace) ? 5 : 7;
    this.calcDir();

    //PER: I just bumped up the minimum height for notes with descending stems to clear a rest in the middle of them.
    var barminpos = this.asc ? 5 : 8;	
    
    this.pos = Math.round(this.asc ? Math.max(average + barpos, this.max + barminpos) : Math.min(average - barpos, this.min - barminpos));
    
    var maxslant = this.elems.length / 2;
    var slant = this.elems[0].abcelem.averagepitch - this.elems[this.elems.length - 1].abcelem.averagepitch;
    
    if (this.isflat ) {
        slant = 0;
    } else  {
        slant = Math.min(slant,maxslant);
        slant = Math.max(slant,-maxslant);
    }

    this.starty = printer.calcY(this.pos + Math.floor(slant / 2));
    this.endy = printer.calcY(this.pos + Math.floor(-slant / 2));
   
    var starthead = this.elems[0].heads[(this.asc) ? 0 : this.elems[0].heads.length - 1];
    var endhead = this.elems[this.elems.length - 1].heads[(this.asc) ? 0 : this.elems[this.elems.length - 1].heads.length - 1];
    this.startx = this.elems[0].x;
    
    if (this.asc)
        this.startx += starthead.w - 0.6;
    
    this.endx = this.elems[this.elems.length - 1].x;
    
    if (this.asc)
        this.endx += endhead.w;

    // PER: if the notes are too high or too low, make the beam go down to the middle
    if ( (this.asc && this.pos < 6) || (!this.asc && this.pos > 6) ){
        this.pos = 6;
        this.starty = printer.calcY(this.pos);
        this.endy = printer.calcY(this.pos);
    }
    
    printer.paper.printBeam(
        this.startx, this.starty
       ,this.startx, (this.starty + this.dy) 
       ,this.endx, (this.endy + this.dy)
       ,this.endx, this.endy
       
    );

    
    this.drawAuxBeams(printer);
};

ABCXJS.write.BeamElem.prototype.drawAuxBeams = function(printer) {
    var auxbeams = [];  // auxbeam will be {x, y, durlog, single} auxbeam[0] should match with durlog=-4 (16th) (j=-4-durlog)
    for (var i = 0, ii = this.elems.length; i < ii; i++) {
        if (this.elems[i].abcelem.rest) continue;
        var furthesthead = this.elems[i].heads[(this.asc) ? 0 : this.elems[i].heads.length - 1];
        var x = this.elems[i].x + ((this.asc) ? furthesthead.w : 0);
        var bary = this.getBarYAt(x);

        var sy = (this.asc) ? 1.5 * ABCXJS.write.spacing.STEP : -1.5 * ABCXJS.write.spacing.STEP;
        if (this.isgrace)
            sy = sy * 2 / 3;
        for (var durlog = ABCXJS.write.getDurlog(this.elems[i].abcelem.duration); durlog < -3; durlog++) { // get the duration via abcelem because of triplets
            if (auxbeams[-4 - durlog]) {
                auxbeams[-4 - durlog].single = false;
            } else {
                auxbeams[-4 - durlog] = {x: x + ((this.asc) ? -0.6 : 0), y: bary + sy * (-4 - durlog + 1),
                    durlog: durlog, single: true};
            }
        }

        for (var j = auxbeams.length - 1; j >= 0; j--) {
            if (i === ii - 1 || ABCXJS.write.getDurlog(this.elems[i + 1].abcelem.duration) > (-j - 4)) {

                var auxbeamendx = x;
                var auxbeamendy = bary + sy * (j + 1);


                if (auxbeams[j].single) {
                    auxbeamendx = (i === 0) ? x + 5 : x - 5;
                    auxbeamendy = this.getBarYAt(auxbeamendx) + sy * (j + 1);
                }
                // TODO I think they are drawn from front to back, hence the small x difference with the main beam
                printer.paper.printBeam(auxbeams[j].x,auxbeams[j].y, auxbeamendx,auxbeamendy,auxbeamendx,(auxbeamendy + this.dy), auxbeams[j].x,(auxbeams[j].y + this.dy));
                auxbeams = auxbeams.slice(0, j);
            }
        }
    }
};
//    abc_layout.js: Creates a data structure suitable for printing a line of abc
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window, ABCXJS */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.write)
    window.ABCXJS.write = {};
    
window.ABCXJS.write.chartable = {rest:{0:"rests.whole", 1:"rests.half", 2:"rests.quarter", 3:"rests.8th", 4: "rests.16th",5: "rests.32nd", 6: "rests.64th", 7: "rests.128th"},
		   note:{"-1": "noteheads.dbl", 0:"noteheads.whole", 1:"noteheads.half", 2:"noteheads.quarter", 3:"noteheads.quarter", 4:"noteheads.quarter", 5:"noteheads.quarter", 6:"noteheads.quarter"},
		   uflags:{3:"flags.u8th", 4:"flags.u16th", 5:"flags.u32nd", 6:"flags.u64th"},
		   dflags:{3:"flags.d8th", 4:"flags.d16th", 5:"flags.d32nd", 6:"flags.d64th"}};

ABCXJS.write.getDuration = function(elem) {
  var d = 0;
  if (elem.duration) {
    d = elem.duration;
  }
  return d;
};

ABCXJS.write.getDurlog = function(duration) {
    // TODO-PER: This is a hack to prevent a Chrome lockup. Duration should have been defined already,
    // but there's definitely a case where it isn't. [Probably something to do with triplets.]
    if (duration === undefined) {
        return 0;
    }
    return Math.floor(Math.log(duration)/Math.log(2));
};

ABCXJS.write.Layout = function(printer, bagpipes ) {
  this.isBagpipes = bagpipes;
  this.slurs = {};
  this.ties = [];
  this.slursbyvoice = {};
  this.tiesbyvoice = {};
  this.endingsbyvoice = {};
  this.staffgroup = {};
  this.tune = {};
  this.tuneCurrLine = 0;
  this.tuneCurrStaff = 0; // current staff number
  this.tuneCurrVoice = 0; // current voice number on current staff
  this.tripletmultiplier = 1;
  this.printer = printer;	// TODO-PER: this is a hack to get access, but it tightens the coupling.
  this.accordion = printer.accordion;
  this.glyphs = printer.glyphs;
};

ABCXJS.write.Layout.prototype.getCurrentVoiceId = function() {
  return "s"+this.tuneCurrStaff+"v"+this.tuneCurrVoice;
};

ABCXJS.write.Layout.prototype.pushCrossLineElems = function() {
  this.slursbyvoice[this.getCurrentVoiceId()] = this.slurs;
  this.tiesbyvoice[this.getCurrentVoiceId()] = this.ties;
  this.endingsbyvoice[this.getCurrentVoiceId()] = this.partstartelem;
};

ABCXJS.write.Layout.prototype.popCrossLineElems = function() {
  this.slurs = this.slursbyvoice[this.getCurrentVoiceId()] || {};
  this.ties = this.tiesbyvoice[this.getCurrentVoiceId()] || [];
  this.partstartelem = this.endingsbyvoice[this.getCurrentVoiceId()];
};

ABCXJS.write.Layout.prototype.getElem = function() {
    if (this.currVoice.length <= this.pos)
        return null;
    return this.currVoice[this.pos];
};

ABCXJS.write.Layout.prototype.getNextElem = function() {
    if (this.currVoice.length <= this.pos + 1)
        return null;
    return this.currVoice[this.pos + 1];
};

ABCXJS.write.Layout.prototype.isFirstVoice = function() {
    return this.currVoice.firstVoice || false;
};

ABCXJS.write.Layout.prototype.isLastVoice = function() {
    return this.currVoice.lastVoice || false;
};

ABCXJS.write.Layout.prototype.layoutABCLine = function( abctune, line, width ) {

    this.tune = abctune;
    this.tuneCurrLine = line;
    this.staffgroup = new ABCXJS.write.StaffGroupElement();
    this.width = width;

    for (this.tuneCurrStaff = 0; this.tuneCurrStaff < this.tune.lines[this.tuneCurrLine].staffs.length; this.tuneCurrStaff++) {
        var abcstaff = this.tune.lines[this.tuneCurrLine].staffs[this.tuneCurrStaff];
        var header = "";
        
        if(!abcstaff) continue ;
        
        if (abcstaff.bracket)
            header += "bracket " + abcstaff.bracket + " ";
        if (abcstaff.brace)
            header += "brace " + abcstaff.brace + " ";

        for (this.tuneCurrVoice = 0; this.tuneCurrVoice < abcstaff.voices.length; this.tuneCurrVoice++) {
            this.currVoice = abcstaff.voices[this.tuneCurrVoice];
            this.voice = new ABCXJS.write.VoiceElement( this.tuneCurrVoice, this.tuneCurrStaff, abcstaff );
            
            if (this.tuneCurrVoice === 0) {
                this.voice.barfrom = (abcstaff.connectBarLines === "start" || abcstaff.connectBarLines === "continue");
                this.voice.barto = (abcstaff.connectBarLines === "continue" || abcstaff.connectBarLines === "end");
            } else {
                this.voice.duplicate = true; // barlines and other duplicate info need not be printed
            }

            if (abcstaff.clef.type !== "accordionTab") {
                this.voice.addChild(this.printClef(abcstaff.clef));
                (abcstaff.key) && this.voice.addChild(this.printKeySignature(abcstaff.key));
                (abcstaff.meter) && this.voice.addChild(this.printTimeSignature(abcstaff.meter));
                this.printABCVoice();
            } else {
                var p = new ABCXJS.tablature.Layout(this.tuneCurrVoice, this.tuneCurrStaff, abcstaff, this.glyphs, this.tune.formatting.restsInTab );
                this.voice = p.printTABVoice(this.layoutJumpDecorationItem);
            }
            
            if (abcstaff.title && abcstaff.title[this.tuneCurrVoice])
                this.voice.header = abcstaff.title[this.tuneCurrVoice];
            
            this.staffgroup.addVoice(this.voice);
        }
    }
    this.layoutStaffGroup();
    
    return this.staffgroup;
};

ABCXJS.write.Layout.prototype.layoutJumpDecorationItem = function(jumpDecorationItem, pitch) {
    switch (jumpDecorationItem.type) {
        case "coda":     return new ABCXJS.write.RelativeElement("scripts.coda", 0, 0, pitch + 1); 
        case "segno":    return new ABCXJS.write.RelativeElement("scripts.segno", 0, 0, pitch + 1); 
        case "fine":     return new ABCXJS.write.RelativeElement("it.Fine", -34, 34, pitch);
        case "dacapo":   return new ABCXJS.write.RelativeElement("it.DC", -30, 30, pitch);
        case "dacoda":   return new ABCXJS.write.RelativeElement("it.DaCoda", -30, 30, pitch);
        case "dasegno":  return new ABCXJS.write.RelativeElement("it.DaSegno", -32, 32, pitch);
        case "dcalfine": return new ABCXJS.write.RelativeElement("it.DCalFine", 25, -25, pitch);
        case "dcalcoda": return new ABCXJS.write.RelativeElement("it.DCalCoda", 25, -25, pitch);
        case "dsalfine": return new ABCXJS.write.RelativeElement("it.DSalFine", 25, -25, pitch);
        case "dsalcoda": return new ABCXJS.write.RelativeElement("it.DSalCoda", 25, -25, pitch);
    }
        
    return null;
};

ABCXJS.write.Layout.prototype.layoutStaffGroup = function() {
    var newspace = ABCXJS.write.spacing.SPACEX;

    for (var it = 0; it < 3; it++) { // TODO shouldn't need this triple pass any more
        this.staffgroup.layout(newspace, this.printer, false);
        if (this.tuneCurrLine && this.tuneCurrLine === this.tune.lines.length - 1 &&
                this.staffgroup.w / this.width < 0.66 && !this.tune.formatting.stretchlast)
            break; // don't stretch last line too much unless it is 1st
        var relspace = this.staffgroup.spacingunits * newspace;
        var constspace = this.staffgroup.w - relspace;
        if (this.staffgroup.spacingunits > 0) {
            newspace = (this.printer.width - constspace) / this.staffgroup.spacingunits;
            if (newspace * this.staffgroup.minspace > 50) {
                newspace = 50 / this.staffgroup.minspace;
            }
        }
    }
};

ABCXJS.write.Layout.prototype.printABCVoice = function() {
  this.popCrossLineElems();
  this.stemdir = (this.isBagpipes)? "down" : this.voice.stem;
  if (this.partstartelem) {
    this.partstartelem = new ABCXJS.write.EndingElem("", null, null);
    this.voice.addOther(this.partstartelem);
  }
  for (var slur in this.slurs) {
    if (this.slurs.hasOwnProperty(slur)) {
      this.slurs[slur]= new ABCXJS.write.TieElem(null, null, this.slurs[slur].above, this.slurs[slur].force);
	this.voice.addOther(this.slurs[slur]);
    }
  }
  for (var i=0; i<this.ties.length; i++) {
    this.ties[i]=new ABCXJS.write.TieElem(null, null, this.ties[i].above, this.ties[i].force);
    this.voice.addOther(this.ties[i]);
  }

  for (this.pos=0; this.pos<this.currVoice.length; this.pos++) {
    var abselems = this.printABCElement();
    for (i=0; i<abselems.length; i++) {
      this.voice.addChild(abselems[i]);
    }
  }
  this.pushCrossLineElems();
};

// return an array of ABCXJS.write.AbsoluteElement
ABCXJS.write.Layout.prototype.printABCElement = function() {
  var elemset = [];
  var elem = this.getElem();
  
  switch (elem.el_type) {
  case "note":
    elemset = this.printBeam();
    break;
  case "bar":
    elemset[0] = this.printBarLine(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "meter":
    elemset[0] = this.printTimeSignature(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "clef":
    elemset[0] = this.printClef(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  case "key":
    elemset[0] = this.printKeySignature(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
//  case "stem":
//    alert( 'não deveria passar aqui') ;
//    //this.stemdir=elem.direction;
//    break;
  case "part":
    var abselem = new ABCXJS.write.AbsoluteElement(elem,0,0);
    abselem.addChild(new ABCXJS.write.RelativeElement(elem.title, 0, 0, 18.5, {type:"part" })); 
    elemset[0] = abselem;
    break;
  default: 
    var abselem2 = new ABCXJS.write.AbsoluteElement(elem,0,0);
    abselem2.addChild(new ABCXJS.write.RelativeElement("element type "+elem.el_type, 0, 0, 0, {type:"debug"}));
    elemset[0] = abselem2;
  }

  return elemset;
};

ABCXJS.write.Layout.prototype.printBeam = function() {
    var abselemset = [];

    if (this.getElem().startBeam && !this.getElem().endBeam) {
        
        var beamelem = new ABCXJS.write.BeamElem(this.stemdir);
        // PER: need two passes: the first one decides if the stems are up or down.
        // TODO-PER: This could be more efficient.
        var oldPos = this.pos;
        var abselem;
        while (this.getElem()) {
            abselem = this.printNote(this.getElem(), true, true);
            beamelem.add(abselem);
            if (this.getElem().endBeam)
                break;
            this.pos++;
        }
        var dir = beamelem.calcDir();
        this.pos = oldPos;

        beamelem = new ABCXJS.write.BeamElem(dir ? "up" : "down");
        //this.voice.addChild(beamelem);
        var oldDir = this.stemdir;
        this.stemdir = dir ? "up" : "down";
        var beamId =0;
        while (this.getElem()) {
            abselem = this.printNote(this.getElem(),true);
            abselem.beamId = beamId++;
            abselemset.push(abselem);
            beamelem.add(abselem);
            if (this.getElem().endBeam) {
                break;
            }
            this.pos++;
        }
        this.stemdir = oldDir;
        this.voice.addOther(beamelem);
    } else {
        abselemset[0] = this.printNote(this.getElem());
    }
    return abselemset;
};

ABCXJS.write.Layout.prototype.printNote = function(elem, nostem, dontDraw) { //stem presence: true for drawing stemless notehead
    var notehead = null;
    var grace = null;
    this.roomtaken = 0; // room needed to the left of the note
    this.roomtakenright = 0; // room needed to the right of the note
    var dotshiftx = 0; // room taken by chords with displaced noteheads which cause dots to shift
    var c = "";
    var flag = null;
    var additionalLedgers = []; // PER: handle the case of [bc'], where the b doesn't have a ledger line

    var p, i, pp;
    var width, p1, p2, dx;

    var duration = ABCXJS.write.getDuration(elem);
    
    //PER: zero duration will draw a quarter note head.
    if (duration === 0) {
        duration = 0.25;
        nostem = true;
    }   
    
    var durlog = Math.floor(Math.log(duration) / Math.log(2));  //TODO use getDurlog
    var dot = 0;

    for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2)
        ;

    if (elem.startTriplet) {
        
        if( ! this.stemdir ) {
            this.clearStem = true;
            this.stemdir = elem.startTriplet.avgPitch < 6? 'up' : 'down';
        }
            
        this.triplet = new ABCXJS.write.TripletElem( elem.startTriplet, null, null, this.stemdir ); 
        this.tripletmultiplier = this.triplet.multiplier;
    }

    var abselem = new ABCXJS.write.AbsoluteElement(elem, duration * this.tripletmultiplier, 1);


    if (elem.rest) {
        var restpitch = 7;
        if (this.stemdir === "down")
            restpitch = 3;
        if (this.stemdir === "up")
            restpitch = 11;
        switch (elem.rest.type) {
            case "rest":
                c = ABCXJS.write.chartable.rest[-durlog];
                elem.averagepitch = restpitch;
                elem.minpitch = restpitch;
                elem.maxpitch = restpitch;
                break;
            case "invisible":
            case "spacer":
                c = "";
        }
        if (!dontDraw)
            notehead = this.printNoteHead(abselem, c, {verticalPos: restpitch}, null, 0, -this.roomtaken, null, dot, 0, 1);
        if (notehead)
            abselem.addHead(notehead);
        this.roomtaken += this.accidentalshiftx;
        this.roomtakenright = Math.max(this.roomtakenright, this.dotshiftx);

    } else {
        ABCXJS.write.sortPitch(elem.pitches);

        // determine averagepitch, minpitch, maxpitch and stem direction
        var sum = 0;
        for (p = 0, pp = elem.pitches.length; p < pp; p++) {
            sum += elem.pitches[p].verticalPos;
            //tentativa de garantir que as notas da ligadura usem hastes na mesma direcao
            if(elem.pitches[p].startTie) {
                this.lastTie = "up";
            }
            //tentativa de garantir que as notas da ligadura usem hastes na mesma direcao
            if(elem.pitches[p].endTie) {
                this.useLastTie = true;
            }
        }
        elem.averagepitch = sum / elem.pitches.length;
        elem.minpitch = elem.pitches[0].verticalPos;
        elem.maxpitch = elem.pitches[elem.pitches.length - 1].verticalPos;
        var dir = this.stemdir? this.stemdir : ((elem.averagepitch >= 6) ? "down" : "up");

        //tentativa de garantir que as notas da ligadura usem hastes na mesma direcao
        if(this.useLastTie) {
            dir = this.lastTie ?  this.lastTie : dir;
            delete this.useLastTie;
            delete this.lastTie;
        }
        
        //tentativa de garantir que as notas da ligadura usem hastes na mesma direcao
        if(this.lastTie) {
            this.lastTie=dir;
        }

        // determine elements of chords which should be shifted
        for (p = (dir === "down") ? elem.pitches.length - 2 : 1; (dir === "down") ? p >= 0 : p < elem.pitches.length; p = (dir === "down") ? p - 1 : p + 1) {
            var prev = elem.pitches[(dir === "down") ? p + 1 : p - 1];
            var curr = elem.pitches[p];
            var delta = (dir === "down") ? prev.pitch - curr.pitch : curr.pitch - prev.pitch;
            if (delta <= 1 && !prev.printer_shift) {
                curr.printer_shift = (delta) ? "different" : "same";
                if (curr.verticalPos > 11 || curr.verticalPos < 1) {	// PER: add extra ledger line
                    additionalLedgers.push(curr.verticalPos - (curr.verticalPos % 2));
                }
                if (dir === "down") {
                    this.roomtaken = this.glyphs.getSymbolWidth(ABCXJS.write.chartable.note[-durlog]) + 2;
                } else {
                    dotshiftx = this.glyphs.getSymbolWidth(ABCXJS.write.chartable.note[-durlog]) + 2;
                }
            }
        }

        // The accidentalSlot will hold a list of all the accidentals on this chord. Each element is a vertical place,
        // and contains a pitch, which is the last pitch that contains an accidental in that slot. The slots are numbered
        // from closest to the note to farther left. We only need to know the last accidental we placed because
        // we know that the pitches are sorted by now.
        this.accidentalSlot = [];

        for (p = 0; p < elem.pitches.length; p++) {

            // vou retirar apenas flags
            if (/*flavio*/ nostem || (dir === "down" && p !== 0) || (dir === "up" && p !== pp - 1)) { // not the stemmed elem of the chord
                flag = null;
            } else {
                flag = ABCXJS.write.chartable[(dir === "down") ? "dflags" : "uflags"][-durlog];
            }
            
            c = ABCXJS.write.chartable.note[-durlog];

            // The highest position for the sake of placing slurs is itself if the slur is internal. It is the highest position possible if the slur is for the whole chord.
            // If the note is the only one in the chord, then any slur it has counts as if it were on the whole chord.
            elem.pitches[p].highestVert = elem.pitches[p].verticalPos;
            var isTopWhenStemIsDown = (this.stemdir === "up" || dir === "up") && p === 0;
            var isBottomWhenStemIsUp = (this.stemdir === "down" || dir === "down") && p === pp - 1;
            if (!dontDraw && (isTopWhenStemIsDown || isBottomWhenStemIsUp)) { // place to put slurs if not already on pitches

                if (elem.startSlur || pp === 1) {
                    elem.pitches[p].highestVert = elem.pitches[pp - 1].verticalPos;
                    if (this.stemdir === "up" || dir === "up")
                        elem.pitches[p].highestVert += 6;	// If the stem is up, then compensate for the length of the stem
                }
                if (elem.startSlur) {
                    if (!elem.pitches[p].startSlur)
                        elem.pitches[p].startSlur = []; //TODO possibly redundant, provided array is not optional
                    for (i = 0; i < elem.startSlur.length; i++) {
                        elem.pitches[p].startSlur.push(elem.startSlur[i]);
                    }
                }

                if (!dontDraw && elem.endSlur) {
                    elem.pitches[p].highestVert = elem.pitches[pp - 1].verticalPos;
                    if (this.stemdir === "up" || dir === "up")
                        elem.pitches[p].highestVert += 6;	// If the stem is up, then compensate for the length of the stem
                    if (!elem.pitches[p].endSlur)
                        elem.pitches[p].endSlur = [];  //TODO possibly redundant, provided array is not optional
                    for (i = 0; i < elem.endSlur.length; i++) {
                        elem.pitches[p].endSlur.push(elem.endSlur[i]);
                    }
                }
            }

            if (!dontDraw)
                notehead = this.printNoteHead(abselem, c, elem.pitches[p], dir, 0, -this.roomtaken, flag, dot, dotshiftx, 1);
            if (notehead)
                abselem.addHead(notehead);
            this.roomtaken += this.accidentalshiftx;
            this.roomtakenright = Math.max(this.roomtakenright, this.dotshiftx);
        }

        // draw stem from the furthest note to a pitch above/below the stemmed note
        if ( /* ! nostem flavio && */ durlog <= -1 ) {
            p1 = (dir === "down") ? elem.minpitch - 7 : elem.minpitch + 1 / 3;
            // PER added stemdir test to make the line meet the note.
            if (p1 > 6 && !this.stemdir)
                p1 = 6;
            p2 = (dir === "down") ? elem.maxpitch - 1 / 3 : elem.maxpitch + 7;
            // PER added stemdir test to make the line meet the note.
            if (p2 < 6 && !this.stemdir)
                p2 = 6;
            dx = (dir === "down" || abselem.heads.length === 0) ? 0 : abselem.heads[0].w;
            width = (dir === "down") ? 1 : -1;
            abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, p1, {"type": "stem", "pitch2": p2, linewidth: width}));
        }
    }

    if (elem.lyric !== undefined) {
        var lyricStr = "";
        var maxLen = 0;
        window.ABCXJS.parse.each(elem.lyric, function(ly) {
            lyricStr += "\n" + ly.syllable + ly.divider ;
            maxLen = Math.max( maxLen, (ly.syllable + ly.divider).length );
        });
        if (elem.fingering === undefined || this.tune.formatting.hideFingering) 
            lyricStr = lyricStr.substr(1); // remove the first linefeed
        abselem.addRight(new ABCXJS.write.RelativeElement(lyricStr, 0, maxLen * 5, 0, {type: "lyrics"}));
    }
    
    if (elem.fingering !== undefined  && !this.tune.formatting.hideFingering) {
        var lyricStr = "";
        var maxLen = 0;
        window.ABCXJS.parse.each(elem.fingering, function(ly) {
            lyricStr += "\n" + ly.syllable + ly.divider ;
            maxLen = Math.max( maxLen, (ly.syllable + ly.divider).length*1.3 );
        });
        lyricStr = lyricStr.substr(1); // remove the first linefeed
        abselem.addRight(new ABCXJS.write.RelativeElement(lyricStr, 0, maxLen * 5, 0, {type: "fingering"}));
    }

    if (!dontDraw && elem.gracenotes !== undefined) {
        var gracescale = 3 / 5;
        var gracebeam = null;
        if (elem.gracenotes.length > 1) {
            gracebeam = new ABCXJS.write.BeamElem("grace", this.isBagpipes);
        }

        var graceoffsets = [];
        for (i = elem.gracenotes.length - 1; i >= 0; i--) { // figure out where to place each gracenote
            this.roomtaken += 10;
            graceoffsets[i] = this.roomtaken;
            if (elem.gracenotes[i].accidental) {
                this.roomtaken += 7;
            }
        }

        for (i = 0; i < elem.gracenotes.length; i++) {
            var gracepitch = elem.gracenotes[i].verticalPos;

            flag = (gracebeam) ? null : 'grace'+ABCXJS.write.chartable.uflags[(this.isBagpipes) ? 5 : 3];
            grace = this.printNoteHead(abselem, "graceheads.quarter", elem.gracenotes[i], "up", -graceoffsets[i], -graceoffsets[i], flag, 0, 0, gracescale);
            abselem.addExtra(grace);
            // PER: added acciaccatura slash
            if (elem.gracenotes[i].acciaccatura) {
                var pos = elem.gracenotes[i].verticalPos + 7 * gracescale;	// the same formula that determines the flag position.
                var dAcciaccatura = gracebeam ? 5 : 6;	// just an offset to make it line up correctly.
                abselem.addRight(new ABCXJS.write.RelativeElement("flags.ugrace", -graceoffsets[i] + dAcciaccatura, 0, pos));
            }
            if (gracebeam) { // give the beam the necessary info
                var pseudoabselem = {heads: [grace],
                    abcelem: {averagepitch: gracepitch, minpitch: gracepitch, maxpitch: gracepitch},
                    duration: (this.isBagpipes) ? 1 / 32 : 1 / 16};
                gracebeam.add(pseudoabselem);
            } else { // draw the stem
                p1 = gracepitch + 1 / 3 * gracescale;
                p2 = gracepitch + 7 * gracescale;
                dx = grace.dx + grace.w;
                width = -0.6;
                abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, p1, {"type": "stem", "pitch2": p2, linewidth: width}));
            }

            if (i === 0 && !this.isBagpipes && !(elem.rest && (elem.rest.type === "spacer" || elem.rest.type === "invisible")))
                this.voice.addOther(new ABCXJS.write.TieElem(grace, notehead, false, true));
        }

        if (gracebeam) {
            this.voice.addOther(gracebeam);
        }
    }

    if (!dontDraw && elem.decoration) {
        var addMark = this.printDecoration(elem.decoration, elem.maxpitch, (notehead) ? notehead.w : 0, abselem, this.roomtaken, dir, elem.minpitch);
        if (addMark) {
            abselem.klass = "mark";
        }
    }

    // ledger lines
    for (i = elem.maxpitch; i > 11; i--) {
        if (i % 2 === 0 && !elem.rest) {
            abselem.addChild(new ABCXJS.write.RelativeElement(null, -2, this.glyphs.getSymbolWidth(c) + 4, i, {type: "ledger"}));
        }
    }

    for (i = elem.minpitch; i < 1; i++) {
        if (i % 2 === 0 && !elem.rest) {
            abselem.addChild(new ABCXJS.write.RelativeElement(null, -2, this.glyphs.getSymbolWidth(c) + 4, i, {type: "ledger"}));
        }
    }

    for (i = 0; i < additionalLedgers.length; i++) { // PER: draw additional ledgers
        var ofs = this.glyphs.getSymbolWidth(c);
        if (dir === 'down')
            ofs = -ofs;
        abselem.addChild(new ABCXJS.write.RelativeElement(null, ofs - 2, this.glyphs.getSymbolWidth(c) + 4, additionalLedgers[i], {type: "ledger"}));
    }

    if (elem.chord !== undefined) { //16 -> high E.
        for (i = 0; i < elem.chord.length; i++) {
            var x = 0;
            var y = 16;
            switch (elem.chord[i].position) {
                case "left":
                    this.roomtaken += 7;
                    x = -this.roomtaken;	// TODO-PER: This is just a guess from trial and error
                    y = elem.averagepitch;
                    abselem.addExtra(new ABCXJS.write.RelativeElement(elem.chord[i].name, x, this.glyphs.getSymbolWidth(elem.chord[i].name[0]) + 4, y, {type: "text"}));
                    break;
                case "right":
                    this.roomtakenright += 4;
                    x = this.roomtakenright;// TODO-PER: This is just a guess from trial and error
                    y = elem.averagepitch;
                    abselem.addRight(new ABCXJS.write.RelativeElement(elem.chord[i].name, x, this.glyphs.getSymbolWidth(elem.chord[i].name[0]) + 4, y, {type: "text"}));
                    break;
                case "below":
                    y = elem.minpitch - 4;
                    if (y > -3)
                        y = -3;
                    var eachLine = elem.chord[i].name.split("\n");
                    for (var ii = 0; ii < eachLine.length; ii++) {
                        abselem.addChild(new ABCXJS.write.RelativeElement(eachLine[ii], x, 0, y, {type: "text"}));
                        y -= 3;	// TODO-PER: This should actually be based on the font height.
                    }
                    break;
                default:
                    if (elem.chord[i].rel_position)
                        abselem.addChild(new ABCXJS.write.RelativeElement(elem.chord[i].name, x + elem.chord[i].rel_position.x, 0, elem.minpitch + elem.chord[i].rel_position.y / ABCXJS.write.spacing.STEP, {type: "text"}));
                    else
                        abselem.addChild(new ABCXJS.write.RelativeElement(elem.chord[i].name, x, 0, y, {type: "text"}));
            }
        }
    }

    /* flavio - handle triplets only when drawing - else no notehead */
    if( !dontDraw ) {
        
        if( elem.startTriplet ) {
            this.triplet.anchor1 = notehead;
            this.voice.addOther(this.triplet);
        } 
        
        // procura nas notas minimas e máximas do triplet
        if ( this.triplet ) {
            this.triplet.minPitch = Math.min( this.triplet.minPitch, notehead.parent.abcelem.minpitch );
            this.triplet.maxPitch = Math.max( this.triplet.maxPitch, notehead.parent.abcelem.maxpitch );
        }
        
        if ( this.triplet && elem.endTriplet ) {
            this.triplet.anchor2 = notehead;
            this.triplet = null;
            this.tripletmultiplier = 1;
            if( this.clearStem ) {
                this.stemdir = null;
                delete this.clearStem;
            }
        }
    }

    return abselem;
};


ABCXJS.write.sortPitch = function(elem) {
  var sorted;
  do {
    sorted = true;
    for (var p = 0; p<elem.length-1; p++) {
      if (elem[p].pitch>elem[p+1].pitch) {
	sorted = false;
	var tmp = elem[p];
	elem[p] = elem[p+1];
	elem[p+1] = tmp;
      }     
    }
  } while (!sorted);
};


ABCXJS.write.Layout.prototype.printNoteHead = function(abselem, c, pitchelem, dir, headx, extrax, flag, dot, dotshiftx, scale) {

  // TODO scale the dot as well
  var pitch = pitchelem.verticalPos;
  var notehead;
  var i;
  this.accidentalshiftx = 0;
  this.dotshiftx = 0;
  if (c === undefined)
    abselem.addChild(new ABCXJS.write.RelativeElement("pitch is undefined", 0, 0, 0, {type:"debug"}));
  else if (c==="") {
    notehead = new ABCXJS.write.RelativeElement(null, 0, 0, pitch);
  } else {
    var shiftheadx = headx;
    if (pitchelem.printer_shift) {
      var adjust = (pitchelem.printer_shift==="same")?1:0;
      shiftheadx = (dir==="down")?-this.glyphs.getSymbolWidth(c)*scale+adjust:this.glyphs.getSymbolWidth(c)*scale-adjust;
    }
    //fixme: tratar adequadamente a escala - provavel problema com gracenotes
    notehead = new ABCXJS.write.RelativeElement(c, shiftheadx, this.glyphs.getSymbolWidth(c)*scale, pitch, {scalex:scale, scaley: scale, extreme: ((dir==="down")?"below":"above")});
    if (flag) {
      var pos = pitch+((dir==="down")?-7:7)*scale;
      if (scale===1 && (dir==="down")?(pos>6):(pos<6)) pos=6;
      var xdelta = (dir==="down")?headx:headx+notehead.w-0.6;
      abselem.addRight(new ABCXJS.write.RelativeElement(flag, xdelta, this.glyphs.getSymbolWidth(flag)*scale, pos, {scalex:scale, scaley: scale}));
    }
    this.dotshiftx = notehead.w+dotshiftx-2+5*dot;
    for (;dot>0;dot--) {
      var dotadjusty = (1-Math.abs(pitch)%2); //PER: take abs value of the pitch. And the shift still happens on ledger lines.
      abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", notehead.w+dotshiftx-2+5*dot, this.glyphs.getSymbolWidth("dots.dot"), pitch+dotadjusty));
    }
  }
	if (notehead)
		notehead.highestVert = pitchelem.highestVert;
  
  if (pitchelem.accidental) {
    var symb; 
    switch (pitchelem.accidental) {
    case "quartersharp":
      symb = "accidentals.halfsharp";
	break;
    case "dblsharp":
      symb = "accidentals.dblsharp";
      break;
    case "sharp":
      symb = "accidentals.sharp";
      break;
    case "quarterflat":
      symb = "accidentals.halfflat";
      break;
    case "flat":
      symb = "accidentals.flat";
      break;
    case "dblflat":
      symb = "accidentals.dblflat";
      break;
    case "natural":
      symb = "accidentals.nat";
    }
	  // if a note is at least a sixth away, it can share a slot with another accidental
	  var accSlotFound = false;
	  var accPlace = extrax;
	  for (var j = 0; j < this.accidentalSlot.length; j++) {
		  if (pitch - this.accidentalSlot[j][0] >= 6) {
			  this.accidentalSlot[j][0] = pitch;
			  accPlace = this.accidentalSlot[j][1];
			  accSlotFound = true;
			  break;
		  }
	  }
	  if  (accSlotFound === false) {
		  accPlace -= (this.glyphs.getSymbolWidth(symb)*scale+2);
		  this.accidentalSlot.push([pitch,accPlace]);
		  this.accidentalshiftx = (this.glyphs.getSymbolWidth(symb)*scale+2);
	  }
    //fixme: verificar se há problemas com a escala aqui também      
    abselem.addExtra(new ABCXJS.write.RelativeElement(symb, accPlace, this.glyphs.getSymbolWidth(symb), pitch));
  }
  
  if (pitchelem.endTie) {
    if (this.ties[0]) {
      this.ties[0].anchor2=notehead;
      this.ties = this.ties.slice(1,this.ties.length);
    }
  }
  
  if (pitchelem.startTie) {
    //PER: bug fix: var tie = new ABCXJS.write.TieElem(notehead, null, (this.stemdir=="up" || dir=="down") && this.stemdir!="down",(this.stemdir=="down" || this.stemdir=="up"));
    var tie = new ABCXJS.write.TieElem(notehead, null, (this.stemdir==="down" || dir==="down") && this.stemdir!=="up",(this.stemdir==="down" || this.stemdir==="up"));
    this.ties[this.ties.length]=tie;
    this.voice.addOther(tie);
  }

  if (pitchelem.endSlur) {
    for (i=0; i<pitchelem.endSlur.length; i++) {
      var slurid = pitchelem.endSlur[i];
      var slur;
      if (this.slurs[slurid]) {
	slur = this.slurs[slurid].anchor2=notehead;
	delete this.slurs[slurid];
      } else {
	slur = new ABCXJS.write.TieElem(null, notehead, dir==="down",(this.stemdir==="up" || dir==="down") && this.stemdir!=="down", this.stemdir);
	this.voice.addOther(slur);
      }
      if (this.startlimitelem) {
	slur.startlimitelem = this.startlimitelem;
      }
    }
  }
  
  if (pitchelem.startSlur) {
    for (i=0; i<pitchelem.startSlur.length; i++) {
      var slurid = pitchelem.startSlur[i].label;
      //PER: bug fix: var slur = new ABCXJS.write.TieElem(notehead, null, (this.stemdir=="up" || dir=="down") && this.stemdir!="down", this.stemdir);
      var slur = new ABCXJS.write.TieElem(notehead, null, (this.stemdir==="down" || dir==="down") && this.stemdir!=="up", false);
      this.slurs[slurid]=slur;
      this.voice.addOther(slur);
    }
  }
  
  return notehead;

};

ABCXJS.write.Layout.prototype.printDecoration = function(decoration, pitch, width, abselem, roomtaken, dir, minPitch) {
    var dec;
    var compoundDec;	// PER: for decorations with two symbols
    var diminuendo;
    var crescendo;
    var unknowndecs = [];
    var yslot = (pitch > 9) ? pitch + 3 : 12;
    var ypos;
    //var dir = (this.stemdir==="down" || pitch>=6) && this.stemdir!=="up";
    var below = false;	// PER: whether decoration goes above or below.
    var yslotB = -6; // neste ponto min-Y era sempre -2 - min-Y foi eliminado this.min-Y - 4; // (pitch<1) ? pitch-9 : -6;
    var i;
    roomtaken = roomtaken || 0;
    if (pitch === 5)
        yslot = 14; // avoid upstem of the A
    var addMark = false; // PER: to allow the user to add a class whereever

    for (i = 0; i < decoration.length; i++) { // treat staccato and tenuto first (may need to shift other markers) //TODO, same with tenuto?
        if (decoration[i] === "staccato" || decoration[i] === "tenuto") {
            var symbol = "scripts." + decoration[i];
            ypos = (dir === "down") ? pitch + 2 : minPitch - 2;
            // don't place on a stave line. The stave lines are 2,4,6,8,10
            switch (ypos) {
                case 2:
                case 4:
                case 6:
                case 8:
                case 10:
                    if (dir === "up")
                        ypos--;
                    else
                        ypos++;
                    break;
            }
            if (pitch > 9)
                yslot++; // take up some room of those that are above
            var deltax = width / 2;
            if (this.glyphs.getSymbolAlign(symbol) !== "center") {
                deltax -= (this.glyphs.getSymbolWidth(dec) / 2);
            }
            abselem.addChild(new ABCXJS.write.RelativeElement(symbol, deltax, this.glyphs.getSymbolWidth(symbol), ypos));
        }
        if (decoration[i] === "slide" && abselem.heads[0]) {
            ypos = abselem.heads[0].pitch;
            var blank1 = new ABCXJS.write.RelativeElement("", -roomtaken - 15, 0, ypos - 1);
            var blank2 = new ABCXJS.write.RelativeElement("", -roomtaken - 5, 0, ypos + 1);
            abselem.addChild(blank1);
            abselem.addChild(blank2);
            this.voice.addOther(new ABCXJS.write.TieElem(blank1, blank2, false));
        }
    }

    for (i = 0; i < decoration.length; i++) {
        below = false;
        switch (decoration[i]) {
            case "trill":
                dec = "scripts.trill";
                break;
            case "roll":
                dec = "scripts.roll";
                break; //TODO put abc2ps roll in here
            case "irishroll":
                dec = "scripts.roll";
                break;
            case "marcato":
                dec = "scripts.umarcato";
                break;
            case "marcato2":
                dec = "scriopts.dmarcato";
                break;//other marcato
            case "turn":
                dec = "scripts.turn";
                break;
            case "uppermordent":
                dec = "scripts.prall";
                break;
            case "mordent":
            case "lowermordent":
                dec = "scripts.mordent";
                break;
            case "staccato":
            case "tenuto":
            case "slide":
                continue;
            case "downbow":
                dec = "scripts.downbow";
                break;
            case "upbow":
                dec = "scripts.upbow";
                break;
            case "fermata":
                dec = "scripts.ufermata";
                break;
            case "invertedfermata":
                below = true;
                dec = "scripts.dfermata";
                break;
            case "breath":
                dec = ",";
                break;
            case "accent":
                dec = "scripts.sforzato";
                break;
            case "umarcato":
                dec = "scripts.umarcato";
                break;
            case "/":
                compoundDec = ["flags.ugrace", 1];
                continue;	// PER: added new decorations
            case "//":
                compoundDec = ["flags.ugrace", 2];
                continue;
            case "///":
                compoundDec = ["flags.ugrace", 3];
                continue;
            case "////":
                compoundDec = ["flags.ugrace", 4];
                continue;
            case "p":
            case "mp":
            case "pp":
            case "ppp":
            case "pppp":
            case "f":
            case "ff":
            case "fff":
            case "ffff":
            case "sfz":
            case "mf":
                var ddelem = new ABCXJS.write.DynamicDecoration(abselem, decoration[i]);
                this.voice.addOther(ddelem);
                continue;
            case "mark":
                addMark = true;
                continue;
            case "diminuendo(":
                ABCXJS.write.Layout.prototype.startDiminuendoX = abselem;
                diminuendo = undefined;
                continue;
            case "diminuendo)":
                diminuendo = {start: ABCXJS.write.Layout.prototype.startDiminuendoX, stop: abselem};
                ABCXJS.write.Layout.prototype.startDiminuendoX = undefined;
                continue;
            case "crescendo(":
                ABCXJS.write.Layout.prototype.startCrescendoX = abselem;
                crescendo = undefined;
                continue;
            case "crescendo)":
                crescendo = {start: ABCXJS.write.Layout.prototype.startCrescendoX, stop: abselem};
                ABCXJS.write.Layout.prototype.startCrescendoX = undefined;
                continue;
            default:
                unknowndecs[unknowndecs.length] = decoration[i];
                continue;
        }
        if (below) {
            ypos = yslotB;
            yslotB -= 4;
        } else {
            ypos = yslot;
            yslot += 3;
        }
        var deltax = width / 2;
        if (this.glyphs.getSymbolAlign(dec) !== "center") {
            deltax -= (this.glyphs.getSymbolWidth(dec) / 2);
        }
        abselem.addChild(new ABCXJS.write.RelativeElement(dec, deltax, this.glyphs.getSymbolWidth(dec), ypos));
    }
    if (compoundDec) {	// PER: added new decorations
        ypos = (dir === 'down') ? pitch + 1 : pitch + 9;
        deltax = width / 2;
        deltax += (dir === 'down') ? -5 : 3;
        for (var xx = 0; xx < compoundDec[1]; xx++) {
            ypos -= 1;
            abselem.addChild(new ABCXJS.write.RelativeElement(compoundDec[0], deltax, this.glyphs.getSymbolWidth(compoundDec[0]), ypos));
        }
    }
    if (diminuendo) {
        var delem = new ABCXJS.write.CrescendoElem(diminuendo.start, diminuendo.stop, ">");
        this.voice.addOther(delem);
    }
    if (crescendo) {
        var celem = new ABCXJS.write.CrescendoElem(crescendo.start, crescendo.stop, "<");
        this.voice.addOther(celem);
    }
    if (unknowndecs.length > 0)
        abselem.addChild(new ABCXJS.write.RelativeElement(unknowndecs.join(','), 0, 0, 19, {type: "text"}));
    return addMark;
};

ABCXJS.write.Layout.prototype.printBarLine = function (elem) {
// bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat

    var topbar = 10;
    var yDot = 5;

    var abselem = new ABCXJS.write.AbsoluteElement(elem, 0, 10);
    var anchor = null; // place to attach part lines
    var dx = 0;

    var firstdots = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var firstthin = (elem.type !== "bar_left_repeat" && elem.type !== "bar_thick_thin" && elem.type !== "bar_invisible");
    var thick = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" || elem.type === "bar_left_repeat" ||
            elem.type === "bar_thin_thick" || elem.type === "bar_thick_thin");
    var secondthin = (elem.type === "bar_left_repeat" || elem.type === "bar_thick_thin" || elem.type === "bar_thin_thin" || elem.type === "bar_dbl_repeat");
    var seconddots = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat");

    var anyJumpDecoUpper = false; // indica a presença de decorações na parte superior - inibe a impressão do barnumber

    // limit positioning of slurs
    if (firstdots || seconddots) {
        for (var slur in this.slurs) {
            if (this.slurs.hasOwnProperty(slur)) {
                this.slurs[slur].endlimitelem = abselem;
            }
        }
        this.startlimitelem = abselem;
    }

    if (firstdots) {
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
        dx += 6; //2 hardcoded, twice;
    }

    if (firstthin) {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 2, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
        if( elem.repeat > 2 && this.tuneCurrStaff == 0) {
            abselem.addChild(new ABCXJS.write.RelativeElement(elem.repeat+"x", 0, -5, 12, {type: "part"}));
            anyJumpDecoUpper = true;
        }
    }

    if (elem.type === "bar_invisible") {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 2, {"type": "none", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
    }

    if (elem.decoration) {
        this.printDecoration(elem.decoration, 12, (thick) ? 3 : 1, abselem, 0, "down", 2);
    }

    if (thick) {
        dx += 4; //3 hardcoded;    
        anchor = new ABCXJS.write.RelativeElement(null, dx, 4, 2, {"type": "bar", "pitch2": topbar, linewidth: 4});
        abselem.addRight(anchor);
        dx += 5;
    }

    if (elem.jumpDecoration) {
        for(var j=0; j< elem.jumpDecoration.length; j++ ) {
            if(( elem.jumpDecoration[j].upper && this.isFirstVoice() ) || ( !elem.jumpDecoration[j].upper && this.isLastVoice() ) ) {
                var pitch = elem.jumpDecoration[j].upper ? 12 : -3;
                anyJumpDecoUpper = (anyJumpDecoUpper||elem.jumpDecoration[j].upper);
                switch (elem.jumpDecoration[j].type) {
                    case "coda":     
                    case "segno":    
                    case "fine":     
                    case "dcalfine": 
                    case "dcalcoda": 
                    case "dsalfine": 
                    case "dsalcoda": 
                        abselem.addRight( this.layoutJumpDecorationItem(elem.jumpDecoration[j], pitch) );
                        break;
                    case "dacapo":   
                    case "dasegno":  
                    case "dacoda":   
                        abselem.addExtra( this.layoutJumpDecorationItem(elem.jumpDecoration[j], pitch) );
                        break;
                }
            }
        }
    
    }
    
    if (elem.barNumber && elem.barNumberVisible && !anyJumpDecoUpper) {
        // quando não há jumpDecorations na parte superiror da pauta, o barnumber pode ser escrito sem sobreposição
        abselem.addChild(new ABCXJS.write.RelativeElement(elem.barNumber, 0, 0, 12, {type: "barnumber"}));
    }

    if (this.partstartelem && elem.endDrawEnding) {
        this.partstartelem.anchor2 = anchor;
        this.partstartelem = null;
    }

    if (secondthin) {
        dx += 3; //3 hardcoded;
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 2, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor); // 3 is hardcoded
    }

    if (seconddots) {
        dx += 3; //3 hardcoded;
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
    } // 2 is hardcoded

    if (elem.startEnding) {
        this.partstartelem = new ABCXJS.write.EndingElem(elem.startEnding, anchor, null);
        this.voice.addOther(this.partstartelem);
    }

    return abselem;

};

ABCXJS.write.Layout.prototype.printClef = function(elem) {
  var clef = "clefs.G";
  var octave = 0;
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,10);
  
  switch (elem.type) {
  case "treble": break;
  case "tenor": clef="clefs.C"; break;
  case "alto": clef="clefs.C"; break;
  case "bass": clef="clefs.F"; break;
  case 'treble+8': octave = 1; break;
  case 'tenor+8':clef="clefs.C"; octave = 1; break;
  case 'bass+8': clef="clefs.F"; octave = 1; break;
  case 'alto+8': clef="clefs.C"; octave = 1; break;
  case 'treble-8': octave = -1; break;
  case 'tenor-8':clef="clefs.C"; octave = -1; break;
  case 'bass-8': clef="clefs.F"; octave = -1; break;
  case 'alto-8': clef="clefs.C"; octave = -1; break;
  case "accordionTab": clef="clefs.tab"; break;
  case 'none': clef=""; break;
  case 'perc': clef="clefs.perc"; break;
  default: abselem.addChild(new ABCXJS.write.RelativeElement("clef="+elem.type, 0, 0, 0, {type:"debug"}));
  }
  
  var dx =10;
  if (clef!=="") {
    abselem.addRight(new ABCXJS.write.RelativeElement(clef, dx, this.glyphs.getSymbolWidth(clef), elem.clefPos)); 
  }
  if (octave!==0) {
    // fixme: ajustar a escala da oitava  
    var scale= 2/3;
    var adjustspacing = (this.glyphs.getSymbolWidth(clef)-this.glyphs.getSymbolWidth("8"))/2;
    abselem.addRight(new ABCXJS.write.RelativeElement("8", dx+adjustspacing, this.glyphs.getSymbolWidth("8"), (octave>0)?16:-2));
  }
  return abselem;
};

ABCXJS.write.Layout.prototype.printKeySignature = function(elem) {
    var abselem = new ABCXJS.write.AbsoluteElement(elem,0,10);
    var dx = 0;
    if ( elem.accidentals) {
        ABCXJS.parse.each(elem.accidentals, function(acc) {
            var symbol = (acc.acc === "sharp") ? "accidentals.sharp" : (acc.acc === "natural") ? "accidentals.nat" : "accidentals.flat";
            abselem.addRight(new ABCXJS.write.RelativeElement(symbol, dx, this.glyphs.getSymbolWidth(symbol), acc.verticalPos));
            dx += this.glyphs.getSymbolWidth(symbol)+2;
        }, this);
    }
    this.startlimitelem = abselem; // limit ties here
    return abselem;
};

ABCXJS.write.Layout.prototype.printTimeSignature= function(elem) {
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,20);
  if (elem.type === "specified") {
    //TODO make the alignment for time signatures centered
    for (var i = 0; i < elem.value.length; i++) {
      if (i !== 0)
        abselem.addRight(new ABCXJS.write.RelativeElement("+", i*20-9, this.glyphs.getSymbolWidth("+"), 7));
      var num = "n."+ elem.value[i].num;
      if (elem.value[i].den) {
        var den = "n."+ elem.value[i].den;
        abselem.addRight(new ABCXJS.write.RelativeElement(num, i*20, this.glyphs.getSymbolWidth(num)*num.length, 6));
        abselem.addRight(new ABCXJS.write.RelativeElement(den, i*20, this.glyphs.getSymbolWidth(den)*den.length, 2));
      } else {
        abselem.addRight(new ABCXJS.write.RelativeElement(num, i*20, this.glyphs.getSymbolWidth(num)*num.length, 4));
      }
    }
  } else if (elem.type === "common_time") {
    abselem.addRight(new ABCXJS.write.RelativeElement("timesig.common", 0, this.glyphs.getSymbolWidth("timesig.common"), 7));
    
  } else if (elem.type === "cut_time") {
    abselem.addRight(new ABCXJS.write.RelativeElement("timesig.cut", 0, this.glyphs.getSymbolWidth("timesig.cut"), 7));
  }
  this.startlimitelem = abselem; // limit ties here
  return abselem;
};
//    abc_write.js: Prints an abc file parsed by abc_parse.js
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


/*global window, ABCXJS, Math */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.write)
	window.ABCXJS.write = {};

ABCXJS.write.spacing = {};
ABCXJS.write.spacing.FONTEM = 360;
ABCXJS.write.spacing.FONTSIZE = 30;
ABCXJS.write.spacing.STEP = ABCXJS.write.spacing.FONTSIZE*(93)/720;
ABCXJS.write.spacing.SPACEX = 30;
ABCXJS.write.spacing.TOPNOTE = 10; 

ABCXJS.write.color = {};
ABCXJS.write.color.highLight = "#5151ff";
ABCXJS.write.color.highLight = "#ff0000";
ABCXJS.write.color.unhighLight = 'black';
ABCXJS.write.color.useTransparency = true;

//--------------------------------------------------------------------PRINTER

ABCXJS.write.Printer = function (paper, params) {

    params = params || {};
    this.y = 0;
    this.pageNumber = 1;
    this.estimatedPageLength = 0;
    this.paper = paper;
    this.glyphs = new ABCXJS.write.Glyphs();
    this.listeners = [];
    this.selected = [];
    this.scale = params.scale || 1;
    this.paddingtop = params.paddingtop || 15;
    this.paddingbottom = params.paddingbottom || 15;
    this.paddingleft = params.paddingleft || 15;
    this.paddingright = params.paddingright || 30;
    this.editable = params.editable || false;
    this.staffgroups = [];

};

ABCXJS.write.Printer.prototype.printABC = function (abctunes, options) {
    if (abctunes[0] === undefined) {
        abctunes = [abctunes];
    }
    this.y = 0;
    this.totalY = 0; // screen position of an element

    for (var i = 0; i < abctunes.length; i++) {
        this.printTune(abctunes[i], options);
    }

};

ABCXJS.write.Printer.prototype.printTune = function(abctune, options) {
    
    if( abctune.lines.length === 0 ) return;

    this.currentTune = abctune; // substituir toda ocorrencia de abctune por this.currentTune
    
    options = options || {};
    options.color = options.color ||'black';
    options.backgroundColor = options.backgroundColor ||'none';
    
    ABCXJS.write.color.unhighLight = options.color;
    
    var estilo = 
'\n\
   .abc_link { font-weight: normal;  text-decoration: none; }\n\
   .abc_link:hover { stroke: blue;  font-weight: normal;  text-decoration: none; }\n\
   .abc_title {\n\
        font-size: 18px;\n\
        font-weight: bold;\n\
        font-family: Merienda, serif;\n\
    }\n\
    \n\
    .abc_subtitle {\n\
        font-size: 16px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_author {\n\
        font-size: 14px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_rhythm {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_voice_header {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_tempo {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_text {\n\
        font-size: 12px;\n\
        font-family: arial, serif;\n\
    }\n\
    \n\
    .abc_lyrics {\n\
        font-size: 13px;\n\
        font-family: Merienda, serif;\n\
        font-weight: normal;\n\
    }\n\
    \n\
    .abc_ending {\n\
        font-size: 10px;\n\
        font-family: Merienda, serif;\n\
    }\n\
    \n\
    .abc_tabtext\n\
    ,.abc_tabtext2\n\
    ,.abc_tabtext3 {\n\
        font-family: arial;\n\
        font-weight: bold;\n\
        text-anchor:middle;\n\
        font-size: 14px;\n\
    }\n\
    .abc_tabtext2 {\n\
        font-size: 12px;\n\
    }\n\
    \n\
    .abc_tabtext3 {\n\
        font-size: 10px;\n\
    }';
    
    var svg_title = 'Partitura ' + abctune.metaText.title + ' criada por ABCXJS.';
    
    if( abctune.midi) {
        abctune.midi.printer = this;
    }
    this.pageratio = abctune.formatting.pageratio;
    this.pagenumbering = abctune.formatting.pagenumbering;
    this.staffsep = abctune.formatting.staffsep ||  ABCXJS.write.spacing.STEP*8;
    this.paddingtop = abctune.formatting.landscape? 15 : 15;
    this.scale = abctune.formatting.scale ? abctune.formatting.scale: this.scale;
    this.width = Math.min( abctune.formatting.staffwidth, abctune.formatting.usablewidth) - this.paddingright;
    this.maxwidth = this.width;
    
    this.y = this.paddingtop;
    this.totalY = 0;
    
    this.layouter = new ABCXJS.write.Layout( this, abctune.formatting.bagpipes );
    
    this.calcPageLength();
    
    this.paper.initDoc( 'tune', svg_title, estilo, options );
    this.paper.initPage( this.scale );

    if (abctune.metaText.title) {
        this.paper.text(this.width/2, this.y+5, abctune.metaText.title, "abc_title", "middle" );
        this.y += 20;
    }    

    if (abctune.lines[0].staffs[0].subtitle) {
        this.printSubtitleLine(abctune.lines[0].staffs[0].subtitle);
    }
    
    var composerLine = "";
    
    if (abctune.metaText.composer)
        composerLine += abctune.metaText.composer;
    if (abctune.metaText.origin)
        composerLine += ' (' + abctune.metaText.origin + ')';
    if (abctune.metaText.author) 
        composerLine += (composerLine.length> 0?'\n':'') + abctune.metaText.author;

    if (composerLine.length > 0) {
        var n = composerLine.split('\n').length;
        var dy = (n>1?(n>2?0:5):30);
        this.paper.text(this.width, dy, composerLine, 'abc_author', 'end' );
    } 
    
    var xtempo ;
    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        xtempo = this.printTempo(this.paddingleft*2, abctune.metaText.tempo );
    }
    if (abctune.metaText.rhythm) {
        this.paper.text( xtempo || this.paddingleft*3+5, this.y, abctune.metaText.rhythm, 'abc_rhythm', 'start');
    }
    
    this.y += 20;

    // impressão dos grupos de pautas
    for (var line = 0; line < abctune.lines.length; line++) {
        var abcline = abctune.lines[line];
        if(abcline.newpage) {
            this.skipPage();
            continue;
        }
        if(abcline.staffs) {
            var staffgroup =  this.layouter.layoutABCLine(abctune, line, this.width);
            staffgroup.draw( this, line );
            this.staffgroups.push(staffgroup);
            this.maxwidth = Math.max(staffgroup.w, this.maxwidth);
            this.calcPageLength();
        }
    }

    var extraText1 = "", extraText2 = "",  height = 0, h1=0, h2=0;
    
    if (abctune.metaText.unalignedWords) {
        for (var j = 0; j < abctune.metaText.unalignedWords.length; j++) {
            if (typeof abctune.metaText.unalignedWords[j] === 'string') {
                extraText1 += abctune.metaText.unalignedWords[j] + "\n";
                h1 ++;
            }
        }
    }
    if (abctune.metaText.book) {
         h2 ++;
         extraText2 += "Livro: " + abctune.metaText.book + "\n";
    }    
    if (abctune.metaText.source) {
         h2 ++;
        extraText2+= "Fonte: " + abctune.metaText.source + "\n";
    }    
    if (abctune.metaText.discography) {
         h2 ++;
        extraText2 += "Discografia: " + abctune.metaText.discography + "\n";
    }    
    if (abctune.metaText.notes) {
         h2 ++;
        extraText2 += abctune.metaText.notes + "\n";
    }    
    if (abctune.metaText.transcription) {
         h2 ++;
        extraText2 += "Transcrito por " + abctune.metaText.transcription + "\n";
    }    
    if (abctune.metaText.history) {
         h2 ++;
        extraText2+= "Histórico: " + abctune.metaText.history + "\n";
    }    
    
    if(h1> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h1*1.5*16; 
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.printExtraText( extraText1, this.paddingleft+50);
        this.y += height; 
    }

    if(h2> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h2*1.5*16;
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.printExtraText( extraText2, this.paddingleft);
        this.y += height; 
    }
    
//    for(var r=0; r < 10; r++) // para debug: testar a posição do número ao final da página
//        this.skipPage();
    
    this.skipPage(true); 
    
    this.paper.endDoc(abctune);
    
    this.formatPage();
    
    //binds SVG elements
    var lines = abctune.lines;
    for(var l=0; l<lines.length;l++){
        for(var s=0; lines[l].staffs && s <lines[l].staffs.length;s++){
            for(var v=0; v <lines[l].staffs[s].voices.length;v++){
                for(var a=0; a <lines[l].staffs[s].voices[v].length;a++){
                   var abs = lines[l].staffs[s].voices[v][a].parent;
                   if( !abs || !abs.gid ) continue;
                   abs.setMouse(this);
                }
            }
        }
    }
    
    this.paper.topDiv.style.width = "" +  (this.maxwidth + this.paddingright) + "px";

};

ABCXJS.write.Printer.prototype.printTempo = function (x, tempo) {
    
    this.y -= 5;

    var tempopitch = 5;
    
    this.paper.beginGroup();

    if (tempo.preString) {
        this.paper.text(x, this.calcY(tempopitch-0.8), tempo.preString, 'abc_tempo', 'start');
        //fixme: obter a largura do texto
        //x += (text.getBBox().width + 20*printer.scale);
        x += tempo.preString.length*5 + 5;
    }

    if (tempo.duration) {
        var temposcale = 0.9;
        var duration = tempo.duration[0]; // TODO when multiple durations
        var abselem = new ABCXJS.write.AbsoluteElement(tempo, duration, 1);
        var durlog = ABCXJS.write.getDurlog(duration);
        var dot = 0;
        for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2);
        var c = ABCXJS.write.chartable.note[-durlog];
        var flag = ABCXJS.write.chartable.uflags[-durlog];
        var temponote = this.layouter.printNoteHead( abselem, c, {verticalPos:tempopitch}, "up", 0, 0, flag, dot, 0, temposcale );
        abselem.addHead(temponote);
        if (duration < 1) {
            var dx = 9.5;
            var width = -0.6;
            abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, tempopitch, {type:"stem", pitch2:tempopitch+6, linewidth:width}));
        }
        abselem.x = x+4;
        abselem.draw(this, null);

        x += (abselem.w+dx );
        var tempostr = "= " + tempo.bpm;
        this.paper.text(x, this.calcY(tempopitch-0.8), tempostr, 'abc_tempo', 'start');
        //fixme: obter a largura do texto // text.getBBox().width + 10*printer.scale;
        x += tempostr.length*5 + 5;
    }

    if (tempo.postString) {
        this.paper.text( x, this.calcY(tempopitch-0.8), tempo.postString, 'abc_tempo', 'start');
    }
    this.paper.endGroup();

    this.y += 5;
    return abselem.x + abselem.w +4;
};


ABCXJS.write.Printer.prototype.printSymbol = function (x, offset, symbol ) {
    if (!symbol) return null;
    try {
        this.paper.printSymbol(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), symbol);
    } catch(e){
        this.paper.text(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), e );
    }
};

ABCXJS.write.Printer.prototype.printTieArc = function(x1, x2, pitch1, pitch2, above) {

  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  this.paper.printTieArc(x1,y1,x2,y2,above);
};

ABCXJS.write.Printer.prototype.printStave = function (startx, endx, staff ) {
    if(staff.numLines === 4) {
      // startx+1 e endx-1 pq a rotina faz um deslocamento contrario para desenhar o ledger
      this.printLedger(startx+1,endx-1, 19.5); 
      
      // imprimo duas linhas para efeito
      this.paper.printStaveLine(startx,endx,this.calcY(15)-0.5 ); 
      this.paper.printStaveLine(startx,endx,this.calcY(15) ); 
      
      this.printLedger(startx+1,endx-1, 7.5 ); 
      
      this.paper.printStaveLine(startx,endx,this.calcY(0)); 
    } else {
      for (var i = 0; i < staff.numLines; i++) {
        this.paper.printStaveLine(startx,endx,this.calcY((i+1)*2));
      }
    }
};

ABCXJS.write.Printer.prototype.printDebugLine = function (x1,x2, y, fill ) {
   this.paper.printStaveLine(x1,x2, y, fill ) ; 
};

ABCXJS.write.Printer.prototype.printLedger = function (x1, x2, pitch) {
    this.paper.printLedger(x1-1, this.calcY(pitch), x2+1, this.calcY(pitch) );
};

ABCXJS.write.Printer.prototype.printText = function (x, offset, text, kls, anchor ) {
    anchor = anchor || "start";
    kls = kls || "abc_text";
    this.paper.text(x, this.calcY(offset), text, kls, anchor);
};

ABCXJS.write.Printer.prototype.printTabText = function (x, offset, text, klass) {
    klass = klass || 'abc_tabtext';
    this.paper.tabText(x, this.calcY(offset)+5, text, klass, 'middle');
};

ABCXJS.write.Printer.prototype.printTabText2 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext2');
};

ABCXJS.write.Printer.prototype.printTabText3 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext3');
};

ABCXJS.write.Printer.prototype.printBar = function (x, dx, y1, y2, real) {
    this.paper.printBar(x, dx, y1, y2, real);
};

ABCXJS.write.Printer.prototype.printStem = function (x, dx, y1, y2) {
    this.paper.printStem(x, dx, y1, y2);
};
ABCXJS.write.Printer.prototype.printDebugMsg = function(x, y, msg ) {
  return this.paper.text(x, y, msg, 'abc_ending', 'start');
};

ABCXJS.write.Printer.prototype.printLyrics = function(x, staveInfo, msg) {
    var y = this.calcY(staveInfo.lowest-(staveInfo.lyricsRows>1?0:3.7));
    
    // para manter alinhado, quando uma das linhas for vazia, imprimo 3 pontos
    var i = msg.indexOf( "\n " );
    if( i >= 0) msg = msg.substr(0, i) + "\n...";
    
    this.paper.text(x, y, msg, 'abc_lyrics', 'start');
    
};

ABCXJS.write.Printer.prototype.printFingering = function(x, staveInfo, msg) {
    var y = this.calcY(staveInfo.lowest);
    try {
        this.paper.printSymbol(x-3, y, 'cn.'+msg.trim());
    } catch(e){
        this.paper.text(x, y+12, msg.trim(), 'abc_lyrics', 'start');        
    }
};

ABCXJS.write.Printer.prototype.addSelectListener = function (listener) {
  this.listeners[this.listeners.length] = listener;
};

//// notify all listeners que o modelo mudou
//ABCXJS.write.Printer.prototype.notifyChange = function () {
//  for (var i=0; i<this.listeners.length;i++) {
//    this.listeners[i].modelChanged && this.listeners[i].modelChanged();
//  }
//};

// notify all listeners that a graphical element has been selected
ABCXJS.write.Printer.prototype.notifySelect = function (abselem, keepState) {
  this.selected[this.selected.length]=abselem;
  abselem.highlight(keepState);
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].highlight && this.listeners[i].highlight(abselem.abcelem);
  }
};

// notify all listeners that a graphical element has been deselected
ABCXJS.write.Printer.prototype.notifyClear = function (abselem) {
  abselem.unhighlight();
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].unhighlight && this.listeners[i].unhighlight(abselem.abcelem);
  }
};

// notify all listeners that a graphical element has been selected (should clear any previous selection)
ABCXJS.write.Printer.prototype.notifyClearNSelect = function (abselem, keepState) {
  this.clearSelection();
  this.notifySelect(abselem,keepState);
};

ABCXJS.write.Printer.prototype.clearSelection = function () {
  for (var i=0;i<this.selected.length;i++) {
    this.notifyClear( this.selected[i] );
  }
  this.selected = [];
};

ABCXJS.write.Printer.prototype.rangeHighlight = function(sel) {
    
    this.clearSelection();
    
    if( sel.length === 1 && sel[0].start.row === sel[0].end.row && sel[0].start.column === sel[0].end.column ) {
        return;
    }
    
    for (var line=0;line<this.staffgroups.length; line++) {
	var voices = this.staffgroups[line].voices;
	for (var voice=0;voice<voices.length;voice++) {
	    var elems = voices[voice].children;
	    for (var elem=0; elem<elems.length; elem++) {
		// Elementos estão confinados somente em uma linha
                if(! elems[elem].abcelem.position ) continue;
                var elLine = elems[elem].abcelem.position.anchor.line;
		var elStart = elems[elem].abcelem.position.anchor.ch;
		var elEnd = elems[elem].abcelem.position.head.ch;
                for(var s = 0; s < sel.length; s ++) {
                    try {
                        if( elLine >= sel[s].start.row && elLine <= sel[s].end.row ) {

                            if (  ( elLine === sel[s].start.row && elEnd < sel[s].start.column ) ||
                                  ( elLine === sel[s].end.row && elStart > sel[s].end.column   ) ) {
                                continue; //elemento fora do range
                            } else {
                                this.selected.push(elems[elem]);
                                elems[elem].highlight();
                                break;
                            }
                        }
                    } catch(e) {
                        
                    }
                }
	    }
	}
    }
    return this.selected;
};

ABCXJS.write.Printer.prototype.beginGroup = function (abselem) {
    abselem.gid = this.paper.beginGroup(abselem.abcelem.el_type); // associa o elemento absoluto com o futuro elemento sgv selecionavel
};

ABCXJS.write.Printer.prototype.endGroup = function () {
  
  this.paper.endGroup();
  return;
  
};

ABCXJS.write.Printer.prototype.calcY = function(ofs) {
  return this.y+((ABCXJS.write.spacing.TOPNOTE-ofs)*ABCXJS.write.spacing.STEP); // flavio
};

ABCXJS.write.Printer.prototype.calcPageLength = function() {
    if( this.currentTune.formatting.papersize === 'screen' ) 
        this.estimatedPageLength =  1e6; // no page breaks
    else
        this.estimatedPageLength = ((this.maxwidth+this.paddingright)*this.pageratio - this.paddingbottom)/this.scale;
};

ABCXJS.write.Printer.prototype.printPageNumber = function() {
    
    this.y = this.estimatedPageLength;
    
    if (this.pagenumbering) {
         this.paper.text(this.maxwidth+this.paddingright, this.y, "- " + this.pageNumber + " -", 'abc_tempo', 'end');
    }
};

ABCXJS.write.Printer.prototype.skipPage = function(lastPage) {
    
    // se não for a última página ou possui mais de uma página
    if( ! lastPage || this.pageNumber > 1) {
        this.printPageNumber();
    }
    
    this.totalY += this.y;
    
    this.paper.endPage({w: (this.maxwidth + this.paddingright) , h: this.y });
    
    if( ! lastPage ) {
        this.y = this.paddingtop;
        this.pageNumber++;
        this.paper.initPage( this.scale );
    }
};

ABCXJS.write.Printer.prototype.formatPage = function() {
    //prepara a página para impressão de acordo com os parâmetros da canção.
    var orientation = this.currentTune.formatting.landscape?'landscape':'portrait';
    var style = document.getElementById('page_format');
    
    var formato = 
'   @page {\n\
        margin: '+this.currentTune.formatting.defaultMargin+'; size: '+this.currentTune.formatting.papersize+' ' + orientation + ';\n\
    }\n' ; //+ pgnumber;
    
    if( ! style ) {
        style = document.createElement('style');
        style.setAttribute( "id", "page_format" ); 
        document.head.appendChild(style);
    }
    
    style.innerHTML = formato;

};

ABCXJS.write.Printer.prototype.printExtraText = function(text, x) {
    var t = this.paper.text(x, this.y , text, 'abc_title', 'start');
    var height ;//= t.getBBox().height;
    if (!height)  height = 25 ; //fixme: obter a altura do texto
    return height;
};

ABCXJS.write.Printer.prototype.printSubtitleLine = function(subtitle) {
    this.paper.text(this.width/2, this.y+2, subtitle, 'abc_subtitle', 'middle');
};
    /**
 * sprintf() for JavaScript v.0.4
 *
 * Copyright (c) 2007 Alexandru Marasteanu <http://alexei.417.ro/>
 * Thanks to David Baird (unit test and patch).
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */

//function str_repeat(i, m) { for (var o = []; m > 0; o[--m] = i); return(o.join('')); }

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.write)
	window.ABCXJS.write = {};

ABCXJS.write.sprintf = function() {
  var i = 0, a, f = arguments[i++], o = [], m, p, c, x;
  while (f) {
    if (m = /^[^\x25]+/.exec(f)) o.push(m[0]);
    else if (m = /^\x25{2}/.exec(f)) o.push('%');
    else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
      if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) throw("Too few arguments.");
      if (/[^s]/.test(m[7]) && (typeof(a) != 'number'))
        throw("Expecting number but found " + typeof(a));
      switch (m[7]) {
        case 'b': a = a.toString(2); break;
        case 'c': a = String.fromCharCode(a); break;
        case 'd': a = parseInt(a); break;
        case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
        case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
        case 'o': a = a.toString(8); break;
        case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
        case 'u': a = Math.abs(a); break;
        case 'x': a = a.toString(16); break;
        case 'X': a = a.toString(16).toUpperCase(); break;
      }
      a = (/[def]/.test(m[7]) && m[2] && a > 0 ? '+' + a : a);
      c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
      x = m[5] - String(a).length;
      p = m[5] ? str_repeat(c, x) : '';
      o.push(m[4] ? a + p : p + a);
    }
    else throw ("Huh ?!");
    f = f.substring(m[0].length);
  }
  return o.join('');
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
    Created on : 27/04/2016, 10:55:16
    Author     : flavio.vani@gmail.com
*/

/*

Main document structure:

<div style"..." >

    Header:
     Contains a title, the style definitions for the entire document and the defined symbols.
    <svg id="tune" ... >
        <title>Música criada por ABCXJS.</title><style type="text/css">
        <style type="text/css">
            @media print {
                div.nobrk {page-break-inside: avoid} 
                div.newpage {page-break-before: always} 
            }    
        </style>
        <defs>
        </defs>
    </svg>

    Page1:
      Class nobrk, an optional group to control aspects like scaling and the content of the page 
    <div class="nobrk" >
        <svg id="page1"  ... >
            <g id="gpage1" ... ></g>
        </svg>
    </div>

    Page2 and subsequents:
      Class newpage, an optional group to control aspects like scaling and the content of the page 
    <div class="newpage" >
        <svg id="page2"  ...>
            <g id="gpage2" ... ></g>
        </svg>
    </div>

</div>
*/

if (!window.SVG)
    window.SVG = {};

if (! window.SVG.misc )
    window.SVG.misc = { printerId: 0 };

if (! window.SVG.Printer )
    window.SVG.Printer = {};

SVG.Printer = function ( d ) {
    this.topDiv = d;
    this.scale = 1;
    this.gid=0;
    this.printerId = ++SVG.misc.printerId;
   
    this.title;
    this.styles = '';
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    
    this.glyphs = new SVG.Glyphs();
    
    this.initDoc();
    
    this.svgHead = function( id, kls, size ) {
        
        var w = size? size.w*this.scale + 'px' : '0';
        var h = size? size.h*this.scale + 'px' : '0';
        var d = size? '' : 'display: none; ';
        
//        // not in use
//        id = id? 'id="'+id+'"' : '' ;
//        kls = kls? 'class="'+kls+'"' : '' ;
        
        return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="'+d+'width:'+w+'; height: '+h+';" >\n';
    };
};

SVG.Printer.prototype.initDoc = function( docId, title, add_styles, options ) {
    options = options || {};
    this.docId = docId || 'dcto';
    this.title = title || '';
    this.backgroundColor = options.backgroundColor || 'none';
    this.color = options.color || 'black';
    this.baseColor = options.baseColor || 'black';
    this.scale = 1.0;
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = -1;
    this.gid=0;
    this.styles = 
'<style type="text/css">\n\
    @media print {\n\
        div.nobrk {page-break-inside: avoid}\n\
        div.newpage {page-break-before: always}\n\
    }\n'+(add_styles||'')+'\n</style>\n';
    
//<![CDATA[\n\
//]]>\n
    
};

SVG.Printer.prototype.endDoc = function( ) {

    var output = '<div style="display:block; margin:0; padding: 0; width: fit-content; background-color:'+this.backgroundColor+'; ">\n' + this.svgHead( this.docId );
    
    output += '<title>'+this.title+'</title>\n';
    output += this.styles;
    
    if(this.defines.length > 0 ) {
        output += '<defs>'+this.defines+'</defs>\n';
    }
    
    output += '</svg>\n';
    
    for( var p=0; p <=  this.currentPage; p++ ) {
        output += '<div class="'+(p>0?'newpage':'nobrk')+'">'+this.svg_pages[p]+'</div>\n';  
    }
    
    output +='</div>';
    
    this.topDiv.innerHTML = output;

};

SVG.Printer.prototype.initPage = function( scl ) {
    this.scale = scl || this.scale;
    this.currentPage++;
    this.svg_pages[this.currentPage] = '';
    var g = 'g' + this.docId + (this.currentPage+1);
    if( this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '<g id="'+g+'" transform="scale( '+ this.scale +')">';
    }
};

SVG.Printer.prototype.endPage = function( size ) {
    if( this.scale && this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '</g>';
    }
    var pg = this.docId + (this.currentPage+1);
    this.svg_pages[this.currentPage] = this.svgHead( pg, this.currentPage < 1 ? 'nobrk':'newpage', size ) + this.svg_pages[this.currentPage] + '</svg>\n';
};

SVG.Printer.prototype.beginGroup = function (el_type) {
    var id = 'p'+this.printerId+'g'+(++this.gid); 
    var kls = ' style="fill:'+this.color+'; stroke:none;" ' ;
    this.svg_pages[this.currentPage] += '<g id="'+id+'"'+kls+'>\n';  
    return id;
};

SVG.Printer.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
};

SVG.Printer.prototype.setDefine = function (s) {
    var p =  this.glyphs.getDefinition(s);
    
    if(p.length === 0 ) return false;
    
    if(!this.defined_glyph[s]) {
        this.defines += p;
        this.defined_glyph[s] = true;
    }
    return true;
};

SVG.Printer.prototype.printLine = function (x,y,dx,dy) {
    if( x === dx ) {
        dx = ABCXJS.misc.isIE() ? 1: 0.6;
        dy -=  y;
    }
    if( y === dy ) {
        dy = ABCXJS.misc.isIE() ? 1: 0.6;
        dx -=  x;
    }
    var pathString = ABCXJS.write.sprintf('<rect style="fill:'+this.color+';"  x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printLedger = function (x,y,dx,dy) {
    var pathString = ABCXJS.write.sprintf('<path style="stroke:'+this.baseColor+'; fill: white; stroke-width:0.6; stroke-dasharray: 1 1;" d="M %.1f %.1f h%.1f"/>\n', x, y, dx-x);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBeam = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    
//    this.svg_pages[this.currentPage] += ABCXJS.write.sprintf(
//        '<path style="fill:'+this.color + '; stroke:none;" ' +
//        'd="M %.1f %.1f L %.1f %.1f L %.1f %.1f L %.1f %.1f Z" />\n'
//        , x1, y1, x2, y2, x3, y3, x4, y4);
        
// Por algum motivo o path acima apresenta vazamento do preenchimento em algumas escalas de zoom.
// Resolvi usando um path diferente (e não muito eficiente para desenhar o beam
        
    this.svg_pages[this.currentPage] += ABCXJS.write.sprintf(
        '<path style="stroke:none; fill:'+ this.color + ';" ' +
        'd="M %.1f %.1f L %.1f %.1f L %.1f %.1f Z L %.1f %.1f L %.1f %.1f Z" />\n'
        , x1, y1, x2, y2, x3, y3, x3, y3, x4, y4 );
};

SVG.Printer.prototype.printStaveLine = function (x1, x2, y, debug) {
    var color = debug? debug : this.baseColor;
    var dy =0.6;   
    var pathString = ABCXJS.write.sprintf('<rect style="stroke:none; fill: %s;" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', 
                                                color, x1, y, Math.abs(x2-x1), dy );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBar = function (x, dx, y1, y2, real) {
    
    var x2 = x+dx;
    var kls = real?'':'style="stroke:none; fill:'+this.baseColor+'"';
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect '+kls+' x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};


SVG.Printer.prototype.printTieArc = function (x1,y1,x2,y2,up) {
    
    //unit direction vector
    var dx = x2-x1;
    var dy = y2-y1;
    var norm= Math.sqrt(dx*dx+dy*dy);
    var ux = dx/norm;
    var uy = dy/norm;

    var flatten = norm/3.5;
    var curve = (up?-1:1)*Math.min(25, Math.max(4, flatten));

    var controlx1 = x1+flatten*ux-curve*uy;
    var controly1 = y1+flatten*uy+curve*ux;
    var controlx2 = x2-flatten*ux-curve*uy;
    var controly2 = y2-flatten*uy+curve*ux;
    var thickness = 2;
    
    var pathString = ABCXJS.write.sprintf('<path style="fill:'+this.color+'; stroke-width:0.6px; stroke:none;" d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f z"/>\n', 
                            x1, y1,
                            controlx1, controly1, controlx2, controly2, x2, y2, 
                            controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1 );
    
    this.svg_pages[this.currentPage] += pathString;
};
    
SVG.Printer.prototype.printBrace = function (x, y1, y2) {
    var sz = Math.abs(y1-y2); // altura esperada
    var scale = sz / 1027; // altura real do simbolo
    this.setDefine('scripts.lbrace');
    var pathString = ABCXJS.write.sprintf('<use style="fill:'+this.baseColor+'" x="0" y="0" xlink:href="#scripts.lbrace" transform="translate(%.1f %.1f) scale(0.13 %.5f)" />\n', x, y2, scale );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printSymbol = function (x, y, symbol) {
    if (this.setDefine(symbol)) {
        var pathString = ABCXJS.write.sprintf('<use x="%.1f" y="%.1f" xlink:href="#%s" />\n', x, y, symbol );
        this.svg_pages[this.currentPage] += pathString;
    } else {
        throw 'Undefined: ' + symbol;
    }
};

SVG.Printer.prototype.tabText = function( x, y, str, clss, anch ) {
    
   if( str === 'scripts.rarrow') {
       //fixme: deveria mudar o tipe de tabtext para symbol, adequadamente
       this.printSymbol(x, y, str );
       return;
   }
   
   str = ""+str;
   if( str.length===0) return;
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<text class="'+clss+'" x="'+x+'" y="'+y+'" >'+str+'</text>\n';
};

SVG.Printer.prototype.text = function( x, y, str, clss, anch ) {
   var t; 
   var estilo = clss === 'abc_lyrics' ? '' : 'style="stroke:none; fill: '+this.color+';"' ;
   
   str = ""+str;
   if( str.length===0) return;
   
   t = str.split('\n');
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<g class="'+clss+'" '+estilo+' transform="translate('+x+' '+y+')">\n';
    if(t.length < 2) {
       this.svg_pages[this.currentPage] += '<text text-anchor="'+anch+'" x="0" y="0" >'+t[0]+'</text>\n';
    } else {
       this.svg_pages[this.currentPage] += '<text text-anchor="'+anch+'" x="0" y="0">\n';
       for(var i = 0; i < t.length; i++ )
           this.svg_pages[this.currentPage] += '<tspan x="0" dy="1.2em" >'+(t[i].length===0 ? '&nbsp;' : t[i])+'</tspan>\n';
       this.svg_pages[this.currentPage] += '</text>\n';
    }
    this.svg_pages[this.currentPage] += '</g>\n';
};

SVG.Printer.prototype.printButton = function (id, x, y, options) {
    
    var scale = options.radius/26; // 26 é o raio inicial do botão
    var gid = 'p'+this.printerId+id;
    var estilo = 'stroke:'+options.borderColor+'; stroke-width:'+options.borderWidth+'px; fill: none;';

    var pathString = ABCXJS.write.sprintf( '<g id="%s" transform="translate(%.1f %.1f) scale(%.5f)">\n\
        <circle cx="28" cy="28" r="26" style="stroke:none; fill: %s;" ></circle>\n\
        <path id="%s_ac" style="stroke: none; fill: %s;" d="M 2 34 a26 26 0 0 1 52 -12"></path>\n\
        <path id="%s_ao" style="stroke: none; fill: %s;" d="M 54 22 a26 26 0 0 1 -52 12"></path>\n\
        <circle style="'+estilo+'" cx="28" cy="28" r="26"></circle>\n\
        <path style="'+estilo+'" d="m 2 34 l 52 -12" ></path>\n\
        <text id="%s_tc" class="%s" style="stroke:none; fill: black;" x="27" y="22" >...</text>\n\
        <text id="%s_to" class="%s" style="stroke:none; fill: black;" x="27" y="44" >...</text>\n</g>\n',
        gid, x, y, scale, options.fillColor, gid, options.closeColor, gid, options.openColor, gid, options.kls, gid, options.kls );
        
    this.svg_pages[this.currentPage] += pathString;
    return gid;

};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SVG)
    window.SVG = {};

if (!window.SVG.Glyphs )
    window.SVG.Glyphs = {};

SVG.Glyphs = function () {
    
    var abc_glyphs = new ABCXJS.write.Glyphs();
    var cn_const_scale = '0.06';

    var glyphs = { // the @@ will be replaced by the abc_glyph contents.
       "cn.1": '<path id="cn.1" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M150.026,80.39h-22.84c-6.91,0-10.933,7.044-10.933,13.158c0,5.936,3.209,13.158,10.933,13.158 h7.259v85.36c0,8.734,6.257,13.605,13.176,13.605s13.185-4.881,13.185-13.605V92.771C160.798,85.789,156.945,80.39,150.026,80.39z"/>'
      ,"cn.2": '<path id="cn.2" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M173.232,180.205h-32.038 c15.661-18.459,40.852-39.753,40.852-63.736c0-21.91-16.564-35.882-39.216-35.882c-22.661,0-43.847,17.977-43.847,39.717 c0,6.731,4.604,12.586,13.445,12.586c17.691,0,8.108-28.498,29.294-28.498c7.554,0,13.266,6.204,13.266,13.284 c0,6.204-3.138,11.558-6.454,16.046c-13.999,18.969-30.581,34.496-45.867,51.579c-1.841,2.065-4.246,5.176-4.246,8.796 c0,7.938,6.266,11.38,14.365,11.38h61.528c6.999,0,13.266-4.568,13.266-12.497C187.58,185.05,181.331,180.205,173.232,180.205z"/>'
      ,"cn.23": '<path id="cn.23" transform="scale('+cn_const_scale+')" \nd="M 244.597 167.084 C 244.597 187.457 226.665 204.611 203.513 204.611 C 179.386 204.611 164.386 186.107 164.386 172.689 C 164.386 166.065 171.064 161.309 176.937 161.309 C 188.022 161.309 185.411 181.181 203.835 181.181 C 212.31 181.181 219.166 174.387 219.166 165.385 C 219.166 141.616 191.446 159.101 191.446 139.068 C 191.446 121.235 214.598 133.294 214.598 114.441 C 214.598 107.995 210.2 103.07 202.861 103.07 C 187.378 103.07 189.497 119.706 178.412 119.706 C 171.725 119.706 167.81 113.43 167.81 107.146 C 167.81 93.907 185.259 79.631 203.352 79.631 C 226.827 79.631 238.081 97.474 238.081 110.713 C 238.081 121.413 233.683 130.754 224.717 136.69 C 236.445 142.303 244.598 153.674 244.597 167.084 M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 154.528 189.927 C 154.528 197.856 148.261 202.424 141.262 202.424 L 79.734 202.424 C 71.635 202.424 65.369 198.982 65.369 191.044 C 65.369 187.424 67.774 184.313 69.615 182.248 C 84.901 165.165 101.483 149.638 115.482 130.669 C 118.798 126.181 121.936 120.827 121.936 114.623 C 121.936 107.543 116.224 101.339 108.67 101.339 C 87.484 101.339 97.067 129.837 79.376 129.837 C 70.535 129.837 65.931 123.982 65.931 117.251 C 65.931 95.511 87.117 77.534 109.778 77.534 C 132.43 77.534 148.994 91.506 148.994 113.416 C 148.994 137.399 123.803 158.693 108.142 177.152 L 140.18 177.152 C 148.279 177.152 154.528 181.997 154.528 189.927 Z"/>'
      ,"cn.234": '<path id="cn.234" transform="scale('+cn_const_scale+')" \nd="M 259.702 172.031 C 259.702 192.404 241.77 209.558 218.618 209.558 C 194.491 209.558 179.491 191.054 179.491 177.636 C 179.491 171.012 186.169 166.256 192.042 166.256 C 203.127 166.256 200.516 186.128 218.94 186.128 C 227.415 186.128 234.271 179.334 234.271 170.332 C 234.271 146.563 206.551 164.048 206.551 144.015 C 206.551 126.182 229.703 138.241 229.703 119.388 C 229.703 112.942 225.305 108.017 217.966 108.017 C 202.483 108.017 204.602 124.653 193.517 124.653 C 186.83 124.653 182.915 118.377 182.915 112.093 C 182.915 98.854 200.364 84.578 218.457 84.578 C 241.932 84.578 253.186 102.421 253.186 115.66 C 253.186 126.36 248.788 135.701 239.822 141.637 C 251.55 147.25 259.703 158.621 259.702 172.031 M 168.58 194.874 C 168.58 202.803 162.313 207.371 155.314 207.371 L 93.786 207.371 C 85.687 207.371 79.421 203.929 79.421 195.991 C 79.421 192.371 81.826 189.26 83.667 187.195 C 98.953 170.112 115.535 154.585 129.534 135.616 C 132.85 131.128 135.988 125.774 135.988 119.57 C 135.988 112.49 130.276 106.286 122.722 106.286 C 101.536 106.286 111.119 134.784 93.428 134.784 C 84.587 134.784 79.983 128.929 79.983 122.198 C 79.983 100.458 101.169 82.481 123.83 82.481 C 146.482 82.481 163.046 96.453 163.046 118.363 C 163.046 142.346 137.855 163.64 122.194 182.099 L 154.232 182.099 C 162.331 182.099 168.58 186.944 168.58 194.874 M 143.027 288.948 C 64.04 288.948 0 224.917 0 145.921 C 0 66.934 64.04 2.894 143.027 2.894 C 169.792 2.894 194.84 10.246 216.261 23.04 C 238.668 8.467 265.412 0 294.132 0 C 373.119 0 437.159 64.04 437.159 143.027 C 437.159 222.023 373.119 286.054 294.132 286.054 C 267.369 286.054 242.322 278.703 220.9 265.909 C 198.492 280.482 171.748 288.948 143.027 288.948 Z M 216.017 55.488 C 196.068 39.366 170.675 29.712 143.027 29.712 C 78.844 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 78.844 262.13 143.027 262.13 C 171.975 262.13 198.449 251.547 218.793 234.039 C 219.116 234.43 219.441 234.82 219.768 235.208 C 220.231 234.629 220.689 234.047 221.143 233.462 C 241.093 249.582 266.484 259.236 294.132 259.236 C 358.315 259.236 410.341 207.21 410.341 143.027 C 410.341 78.844 358.315 26.818 294.132 26.818 C 265.184 26.818 238.71 37.401 218.366 54.909 C 218.043 54.518 217.719 54.129 217.392 53.742 C 216.929 54.321 216.471 54.902 216.017 55.488 M 354.44 159.87 L 349.398 159.87 L 349.398 107.263 C 349.398 91.673 341.004 85.326 330.465 85.326 C 321.016 85.326 315.93 88.419 311.934 95.266 L 271.234 164.831 C 270.143 166.538 268.686 168.603 268.686 172.376 C 268.686 176.828 272.503 182.486 281.406 182.486 L 325.199 182.486 L 325.199 197.048 C 325.199 206.139 327.049 210.412 336.319 210.412 C 345.589 210.412 349.397 206.13 349.397 197.048 L 349.397 182.486 L 354.439 182.486 C 361.528 182.486 367.159 178.034 367.159 171.169 C 367.16 164.321 361.529 159.87 354.44 159.87 Z M 325.754 159.87 L 300.858 159.87 L 325.387 112.054 L 325.754 112.054 L 325.754 159.87 Z"/>'
      ,"cn.2345": '<path id="cn.2345" transform="scale('+cn_const_scale+')" \nd="M 208.702 167.302 C 208.702 187.675 190.77 204.829 167.618 204.829 C 143.491 204.829 128.491 186.325 128.491 172.907 C 128.491 166.283 135.169 161.527 141.042 161.527 C 152.127 161.527 149.516 181.399 167.94 181.399 C 176.415 181.399 183.271 174.605 183.271 165.603 C 183.271 141.834 155.551 159.319 155.551 139.286 C 155.551 121.453 178.703 133.512 178.703 114.659 C 178.703 108.213 174.305 103.288 166.966 103.288 C 151.483 103.288 153.602 119.924 142.517 119.924 C 135.83 119.924 131.915 113.648 131.915 107.364 C 131.915 94.125 149.364 79.849 167.457 79.849 C 190.932 79.849 202.186 97.692 202.186 110.931 C 202.186 121.631 197.788 130.972 188.822 136.908 C 200.55 142.521 208.703 153.892 208.702 167.302 M 444.58 144.08 C 444.58 223.076 375.277 286.054 296.29 286.054 C 269.744 286.054 244.886 278.821 223.58 266.219 C 201.27 280.602 174.701 288.948 146.185 288.948 C 67.198 288.948 0 224.917 0 145.921 C 0 66.934 67.198 2.894 146.185 2.894 C 172.733 2.894 197.592 10.127 218.897 22.73 C 241.207 8.347 267.775 0 296.29 0 C 375.277 0 444.58 65.093 444.58 144.08 Z M 223.301 233.462 C 243.251 249.582 268.642 259.236 296.29 259.236 C 360.473 259.236 417.762 208.263 417.762 144.08 C 417.762 79.897 360.473 26.818 296.29 26.818 C 267.342 26.818 240.868 37.401 220.524 54.909 C 220.371 54.724 220.217 54.539 220.063 54.354 C 219.765 54.73 219.469 55.108 219.175 55.488 C 199.226 39.366 173.833 29.712 146.185 29.712 C 82.002 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 82.002 262.13 146.185 262.13 C 175.133 262.13 201.607 251.547 221.951 234.039 C 222.105 234.225 222.259 234.411 222.413 234.596 C 222.711 234.219 223.007 233.841 223.301 233.462 M 296.44 153.141 L 291.398 153.141 L 291.398 100.534 C 291.398 84.944 283.004 78.597 272.465 78.597 C 263.016 78.597 257.93 81.69 253.934 88.537 L 213.234 158.102 C 212.143 159.809 210.686 161.874 210.686 165.647 C 210.686 170.099 214.503 175.757 223.406 175.757 L 267.199 175.757 L 267.199 190.319 C 267.199 199.41 269.049 203.683 278.319 203.683 C 287.589 203.683 291.397 199.401 291.397 190.319 L 291.397 175.757 L 296.439 175.757 C 303.528 175.757 309.159 171.305 309.159 164.44 C 309.16 157.592 303.529 153.141 296.44 153.141 Z M 267.754 153.141 L 242.858 153.141 L 267.387 105.325 L 267.754 105.325 L 267.754 153.141 M 395.591 156.989 C 395.591 185.862 378.633 204.885 346.774 204.885 C 333.696 204.885 306.253 196.929 306.253 181.715 C 306.253 175.324 311.956 169.96 318.768 169.96 C 326.134 169.96 334.984 181.018 347.329 181.018 C 360.219 181.018 366.852 169.272 366.852 158.375 C 366.852 147.997 360.585 140.917 349.161 140.917 C 338.47 140.917 336.816 146.62 327.421 146.62 C 320.243 146.62 316.56 141.435 316.56 138.494 C 316.56 136.25 316.926 134.516 317.114 132.621 L 321.718 96.14 C 323.371 82.651 327.251 79.71 336.083 79.71 L 380.484 79.71 C 388.95 79.71 393.929 84.376 393.929 90.598 C 393.929 102.532 384.355 103.569 381.039 103.569 L 346.409 103.569 L 343.647 121.894 C 348.063 121.045 352.845 120.178 357.458 120.178 C 379.752 120.178 395.592 136.769 395.591 156.989 M 130.344 188.824 C 130.344 196.753 124.077 201.321 117.078 201.321 L 55.55 201.321 C 47.451 201.321 41.185 197.879 41.185 189.941 C 41.185 186.321 43.59 183.21 45.431 181.145 C 60.717 164.062 77.299 148.535 91.298 129.566 C 94.614 125.078 97.752 119.724 97.752 113.52 C 97.752 106.44 92.04 100.236 84.486 100.236 C 63.3 100.236 72.883 128.734 55.192 128.734 C 46.351 128.734 41.747 122.879 41.747 116.148 C 41.747 94.408 62.933 76.431 85.594 76.431 C 108.246 76.431 124.81 90.403 124.81 112.313 C 124.81 136.296 99.619 157.59 83.958 176.049 L 115.996 176.049 C 124.095 176.049 130.344 180.894 130.344 188.824 Z"/>'
      ,"cn.24": '<path id="cn.24" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 156.87 187.139 C 156.87 195.068 150.603 199.636 143.604 199.636 L 82.076 199.636 C 73.977 199.636 67.711 196.194 67.711 188.256 C 67.711 184.636 70.116 181.525 71.957 179.46 C 87.243 162.377 103.825 146.85 117.824 127.881 C 121.14 123.393 124.278 118.039 124.278 111.835 C 124.278 104.755 118.566 98.551 111.012 98.551 C 89.826 98.551 99.409 127.049 81.718 127.049 C 72.877 127.049 68.273 121.194 68.273 114.463 C 68.273 92.723 89.459 74.746 112.12 74.746 C 134.772 74.746 151.336 88.718 151.336 110.628 C 151.336 134.611 126.145 155.905 110.484 174.364 L 142.522 174.364 C 150.621 174.364 156.87 179.209 156.87 187.139 M 242.361 149.977 L 237.319 149.977 L 237.319 97.37 C 237.319 81.78 228.925 75.433 218.386 75.433 C 208.937 75.433 203.851 78.526 199.855 85.373 L 159.155 154.938 C 158.064 156.645 156.607 158.71 156.607 162.483 C 156.607 166.935 160.424 172.593 169.327 172.593 L 213.12 172.593 L 213.12 187.155 C 213.12 196.246 214.97 200.519 224.24 200.519 C 233.51 200.519 237.318 196.237 237.318 187.155 L 237.318 172.593 L 242.36 172.593 C 249.449 172.593 255.08 168.141 255.08 161.276 C 255.081 154.428 249.45 149.977 242.361 149.977 Z M 213.675 149.977 L 188.779 149.977 L 213.308 102.161 L 213.675 102.161 L 213.675 149.977 Z"/>'
      ,"cn.25": '<path id="cn.25" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 154.049 186.195 C 154.049 194.124 147.782 198.692 140.783 198.692 L 79.255 198.692 C 71.156 198.692 64.89 195.25 64.89 187.312 C 64.89 183.692 67.295 180.581 69.136 178.516 C 84.422 161.433 101.004 145.906 115.003 126.937 C 118.319 122.449 121.457 117.095 121.457 110.891 C 121.457 103.811 115.745 97.607 108.191 97.607 C 87.005 97.607 96.588 126.105 78.897 126.105 C 70.056 126.105 65.452 120.25 65.452 113.519 C 65.452 91.779 86.638 73.802 109.299 73.802 C 131.951 73.802 148.515 87.774 148.515 109.684 C 148.515 133.667 123.324 154.961 107.663 173.42 L 139.701 173.42 C 147.8 173.42 154.049 178.265 154.049 186.195 M 253.691 159.249 C 253.691 188.122 236.733 207.145 204.874 207.145 C 191.796 207.145 164.353 199.189 164.353 183.975 C 164.353 177.584 170.056 172.22 176.868 172.22 C 184.234 172.22 193.084 183.278 205.429 183.278 C 218.319 183.278 224.952 171.532 224.952 160.635 C 224.952 150.257 218.685 143.177 207.261 143.177 C 196.57 143.177 194.916 148.88 185.521 148.88 C 178.343 148.88 174.66 143.695 174.66 140.754 C 174.66 138.51 175.026 136.776 175.214 134.881 L 179.818 98.4 C 181.471 84.911 185.351 81.97 194.183 81.97 L 238.584 81.97 C 247.05 81.97 252.029 86.636 252.029 92.858 C 252.029 104.792 242.455 105.829 239.139 105.829 L 204.509 105.829 L 201.747 124.154 C 206.163 123.305 210.945 122.438 215.558 122.438 C 237.852 122.438 253.692 139.029 253.691 159.249 Z"/>'
      ,"cn.3": '<path id="cn.3" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M167.717,137.637 c8.966-5.936,13.364-15.277,13.364-25.977c0-13.239-11.254-31.082-34.729-31.082c-18.093,0-35.542,14.276-35.542,27.515 c0,6.284,3.915,12.56,10.602,12.56c11.085,0,8.966-16.636,24.449-16.636c7.339,0,11.737,4.925,11.737,11.371 c0,18.853-23.152,6.794-23.152,24.627c0,20.033,27.72,2.548,27.72,26.317c0,9.002-6.856,15.796-15.331,15.796 c-18.424,0-15.813-19.872-26.898-19.872c-5.873,0-12.551,4.756-12.551,11.38c0,13.418,15,31.922,39.127,31.922 c23.152,0,41.084-17.154,41.084-37.527C187.598,154.621,179.445,143.25,167.717,137.637z"/>'
      ,"cn.34": '<path id="cn.34" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 146.304 166.911 C 146.304 187.284 128.372 204.438 105.22 204.438 C 81.093 204.438 66.093 185.934 66.093 172.516 C 66.093 165.892 72.771 161.136 78.644 161.136 C 89.729 161.136 87.118 181.008 105.542 181.008 C 114.017 181.008 120.873 174.214 120.873 165.212 C 120.873 141.443 93.153 158.928 93.153 138.895 C 93.153 121.062 116.305 133.121 116.305 114.268 C 116.305 107.822 111.907 102.897 104.568 102.897 C 89.085 102.897 91.204 119.533 80.119 119.533 C 73.432 119.533 69.517 113.257 69.517 106.973 C 69.517 93.734 86.966 79.458 105.059 79.458 C 128.534 79.458 139.788 97.301 139.788 110.54 C 139.788 121.24 135.39 130.581 126.424 136.517 C 138.152 142.13 146.305 153.501 146.304 166.911 M 244.084 155.896 L 239.042 155.896 L 239.042 103.289 C 239.042 87.699 230.648 81.352 220.109 81.352 C 210.66 81.352 205.574 84.445 201.578 91.292 L 160.878 160.857 C 159.787 162.564 158.33 164.629 158.33 168.402 C 158.33 172.854 162.147 178.512 171.05 178.512 L 214.843 178.512 L 214.843 193.074 C 214.843 202.165 216.693 206.438 225.963 206.438 C 235.233 206.438 239.041 202.156 239.041 193.074 L 239.041 178.512 L 244.083 178.512 C 251.172 178.512 256.803 174.06 256.803 167.195 C 256.804 160.347 251.173 155.896 244.084 155.896 Z M 215.398 155.896 L 190.502 155.896 L 215.031 108.08 L 215.398 108.08 L 215.398 155.896 Z"/>'
      ,"cn.345": '<path id="cn.345" transform="scale('+cn_const_scale+')" \nd="M 158.702 167.031 C 158.702 187.404 140.77 204.558 117.618 204.558 C 93.491 204.558 78.491 186.054 78.491 172.636 C 78.491 166.012 85.169 161.256 91.042 161.256 C 102.127 161.256 99.516 181.128 117.94 181.128 C 126.415 181.128 133.271 174.334 133.271 165.332 C 133.271 141.563 105.551 159.048 105.551 139.015 C 105.551 121.182 128.703 133.241 128.703 114.388 C 128.703 107.942 124.305 103.017 116.966 103.017 C 101.483 103.017 103.602 119.653 92.517 119.653 C 85.83 119.653 81.915 113.377 81.915 107.093 C 81.915 93.854 99.364 79.578 117.457 79.578 C 140.932 79.578 152.186 97.421 152.186 110.66 C 152.186 121.36 147.788 130.701 138.822 136.637 C 150.55 142.25 158.703 153.621 158.702 167.031 M 436.159 143.027 C 436.159 222.023 372.119 286.054 293.132 286.054 C 266.586 286.054 241.728 278.821 220.422 266.219 C 198.112 280.602 171.543 288.948 143.027 288.948 C 64.04 288.948 0 224.917 0 145.921 C 0 66.934 64.04 2.894 143.027 2.894 C 169.575 2.894 194.434 10.127 215.739 22.73 C 238.049 8.347 264.617 0 293.132 0 C 372.119 0 436.159 64.04 436.159 143.027 Z M 220.143 233.462 C 240.093 249.582 265.484 259.236 293.132 259.236 C 357.315 259.236 409.341 207.21 409.341 143.027 C 409.341 78.844 357.315 26.818 293.132 26.818 C 264.184 26.818 237.71 37.401 217.366 54.909 C 217.213 54.724 217.059 54.539 216.905 54.354 C 216.607 54.73 216.311 55.108 216.017 55.488 C 196.068 39.366 170.675 29.712 143.027 29.712 C 78.844 29.712 26.818 81.738 26.818 145.921 C 26.818 210.104 78.844 262.13 143.027 262.13 C 171.975 262.13 198.449 251.547 218.793 234.039 C 218.947 234.225 219.101 234.411 219.255 234.596 C 219.553 234.219 219.849 233.841 220.143 233.462 M 250.44 152.87 L 245.398 152.87 L 245.398 100.263 C 245.398 84.673 237.004 78.326 226.465 78.326 C 217.016 78.326 211.93 81.419 207.934 88.266 L 167.234 157.831 C 166.143 159.538 164.686 161.603 164.686 165.376 C 164.686 169.828 168.503 175.486 177.406 175.486 L 221.199 175.486 L 221.199 190.048 C 221.199 199.139 223.049 203.412 232.319 203.412 C 241.589 203.412 245.397 199.13 245.397 190.048 L 245.397 175.486 L 250.439 175.486 C 257.528 175.486 263.159 171.034 263.159 164.169 C 263.16 157.321 257.529 152.87 250.44 152.87 Z M 221.754 152.87 L 196.858 152.87 L 221.387 105.054 L 221.754 105.054 L 221.754 152.87 M 362.591 156.718 C 362.591 185.591 345.633 204.614 313.774 204.614 C 300.696 204.614 273.253 196.658 273.253 181.444 C 273.253 175.053 278.956 169.689 285.768 169.689 C 293.134 169.689 301.984 180.747 314.329 180.747 C 327.219 180.747 333.852 169.001 333.852 158.104 C 333.852 147.726 327.585 140.646 316.161 140.646 C 305.47 140.646 303.816 146.349 294.421 146.349 C 287.243 146.349 283.56 141.164 283.56 138.223 C 283.56 135.979 283.926 134.245 284.114 132.35 L 288.718 95.869 C 290.371 82.38 294.251 79.439 303.083 79.439 L 347.484 79.439 C 355.95 79.439 360.929 84.105 360.929 90.327 C 360.929 102.261 351.355 103.298 348.039 103.298 L 313.409 103.298 L 310.647 121.623 C 315.063 120.774 319.845 119.907 324.458 119.907 C 346.752 119.907 362.592 136.498 362.591 156.718 Z"/>'
      ,"cn.35": '<path id="cn.35" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 250.888 154.38 C 250.888 183.253 233.93 202.276 202.071 202.276 C 188.993 202.276 161.55 194.32 161.55 179.106 C 161.55 172.715 167.253 167.351 174.065 167.351 C 181.431 167.351 190.281 178.409 202.626 178.409 C 215.516 178.409 222.149 166.663 222.149 155.766 C 222.149 145.388 215.882 138.308 204.458 138.308 C 193.767 138.308 192.113 144.011 182.718 144.011 C 175.54 144.011 171.857 138.826 171.857 135.885 C 171.857 133.641 172.223 131.907 172.411 130.012 L 177.015 93.531 C 178.668 80.042 182.548 77.101 191.38 77.101 L 235.781 77.101 C 244.247 77.101 249.226 81.767 249.226 87.989 C 249.226 99.923 239.652 100.96 236.336 100.96 L 201.706 100.96 L 198.944 119.285 C 203.36 118.436 208.142 117.569 212.755 117.569 C 235.049 117.569 250.889 134.16 250.888 154.38 M 149.904 161.495 C 149.904 181.868 131.972 199.022 108.82 199.022 C 84.693 199.022 69.693 180.518 69.693 167.1 C 69.693 160.476 76.371 155.72 82.244 155.72 C 93.329 155.72 90.718 175.592 109.142 175.592 C 117.617 175.592 124.473 168.798 124.473 159.796 C 124.473 136.027 96.753 153.512 96.753 133.479 C 96.753 115.646 119.905 127.705 119.905 108.852 C 119.905 102.406 115.507 97.481 108.168 97.481 C 92.685 97.481 94.804 114.117 83.719 114.117 C 77.032 114.117 73.117 107.841 73.117 101.557 C 73.117 88.318 90.566 74.042 108.659 74.042 C 132.134 74.042 143.388 91.885 143.388 105.124 C 143.388 115.824 138.99 125.165 130.024 131.101 C 141.752 136.714 149.905 148.085 149.904 161.495 Z"/>'
      ,"cn.4": '<path id="cn.4" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M175.065,155.122h-5.042v-52.607 c0-15.59-8.394-21.937-18.933-21.937c-9.449,0-14.535,3.093-18.531,9.94l-40.7,69.565c-1.091,1.707-2.548,3.772-2.548,7.545 c0,4.452,3.817,10.11,12.72,10.11h43.793V192.3c0,9.091,1.85,13.364,11.12,13.364s13.078-4.282,13.078-13.364v-14.562h5.042 c7.089,0,12.72-4.452,12.72-11.317C187.785,159.573,182.154,155.122,175.065,155.122z M146.379,155.122h-24.896l24.529-47.816 h0.367V155.122z"/>'
      ,"cn.45": '<path id="cn.45" transform="scale('+cn_const_scale+')" \nd="M 320.896 143.027 C 320.896 222.023 273.867 286.054 215.862 286.054 C 196.449 286.054 178.266 278.882 162.664 266.379 C 146.219 280.664 126.658 288.948 105.668 288.948 C 47.313 288.948 0 224.917 0 145.921 C 0 66.934 47.313 2.894 105.668 2.894 C 125.204 2.894 143.5 10.069 159.199 22.579 C 175.547 8.288 194.994 0 215.862 0 C 273.867 0 320.896 64.04 320.896 143.027 Z M 162.261 233.462 C 176.911 249.582 195.558 259.236 215.862 259.236 C 262.996 259.236 301.202 207.21 301.202 143.027 C 301.202 78.844 262.996 26.818 215.862 26.818 C 194.603 26.818 175.161 37.401 160.221 54.909 C 160.171 54.826 160.121 54.744 160.07 54.661 C 159.91 54.936 159.751 55.212 159.593 55.488 C 144.855 39.366 126.095 29.712 105.668 29.712 C 58.25 29.712 19.813 81.738 19.813 145.921 C 19.813 210.104 58.25 262.13 105.668 262.13 C 127.055 262.13 146.614 251.547 161.644 234.039 C 161.693 234.12 161.742 234.2 161.792 234.28 C 161.949 234.008 162.105 233.736 162.261 233.462 M 147.276 152.9 L 142.234 152.9 L 142.234 100.293 C 142.234 84.703 133.84 78.356 123.301 78.356 C 113.852 78.356 108.766 81.449 104.77 88.296 L 64.07 157.861 C 62.979 159.568 61.522 161.633 61.522 165.406 C 61.522 169.858 65.339 175.516 74.242 175.516 L 118.035 175.516 L 118.035 190.078 C 118.035 199.169 119.885 203.442 129.155 203.442 C 138.425 203.442 142.233 199.16 142.233 190.078 L 142.233 175.516 L 147.275 175.516 C 154.364 175.516 159.995 171.064 159.995 164.199 C 159.996 157.351 154.365 152.9 147.276 152.9 Z M 118.59 152.9 L 93.694 152.9 L 118.223 105.084 L 118.59 105.084 L 118.59 152.9 M 256.743 156.906 C 256.743 185.779 239.785 204.802 207.926 204.802 C 194.848 204.802 167.405 196.846 167.405 181.632 C 167.405 175.241 173.108 169.877 179.92 169.877 C 187.286 169.877 196.136 180.935 208.481 180.935 C 221.371 180.935 228.004 169.189 228.004 158.292 C 228.004 147.914 221.737 140.834 210.313 140.834 C 199.622 140.834 197.968 146.537 188.573 146.537 C 181.395 146.537 177.712 141.352 177.712 138.411 C 177.712 136.167 178.078 134.433 178.266 132.538 L 182.87 96.057 C 184.523 82.568 188.403 79.627 197.235 79.627 L 241.636 79.627 C 250.102 79.627 255.081 84.293 255.081 90.515 C 255.081 102.449 245.507 103.486 242.191 103.486 L 207.561 103.486 L 204.799 121.811 C 209.215 120.962 213.997 120.095 218.61 120.095 C 240.904 120.095 256.744 136.686 256.743 156.906 Z"/>'
      ,"cn.5": '<path id="cn.5" transform="scale('+cn_const_scale+')" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M149.678,120.849 c-4.613,0-9.395,0.867-13.811,1.716l2.762-18.325h34.63c3.316,0,12.89-1.037,12.89-12.971c0-6.222-4.979-10.888-13.445-10.888 h-44.401c-8.832,0-12.712,2.941-14.365,16.43l-4.604,36.481c-0.188,1.895-0.554,3.629-0.554,5.873 c0,2.941,3.683,8.126,10.861,8.126c9.395,0,11.049-5.703,21.74-5.703c11.424,0,17.691,7.08,17.691,17.458 c0,10.897-6.633,22.643-19.523,22.643c-12.345,0-21.195-11.058-28.561-11.058c-6.812,0-12.515,5.364-12.515,11.755 c0,15.214,27.443,23.17,40.521,23.17c31.859,0,48.817-19.023,48.817-47.896C187.812,137.44,171.972,120.849,149.678,120.849z"/>'
      ,"n.0": '<path id="n.0" transform="scale(0.95)" \nd="@@"/>'
      ,"n.1": '<path id="n.1" transform="scale(0.95)" \nd="@@"/>'
      ,"n.2": '<path id="n.2" transform="scale(0.95)" \nd="@@"/>'
      ,"n.3": '<path id="n.3" transform="scale(0.95)" \nd="@@"/>'
      ,"n.4": '<path id="n.4" transform="scale(0.95)" \nd="@@"/>'
      ,"n.5": '<path id="n.5" transform="scale(0.95)" \nd="@@"/>'
      ,"n.6": '<path id="n.6" transform="scale(0.95)" \nd="@@"/>'
      ,"n.7": '<path id="n.7" transform="scale(0.95)" \nd="@@"/>'
      ,"n.8": '<path id="n.8" transform="scale(0.95)" \nd="@@"/>'
      ,"n.9": '<path id="n.9" transform="scale(0.95)" \nd="@@"/>'
      ,"f": '<path id="n.f" transform="scale(0.95)" \nd="@@"/>'
      ,"m": '<path id="n.m" transform="scale(0.95)" \nd="@@"/>'
      ,"p": '<path id="n.p" transform="scale(0.95)" \nd="@@"/>'
      ,"r": '<path id="n.r" transform="scale(0.95)" \nd="@@"/>'
      ,"s": '<path id="n.s" transform="scale(0.95)" \nd="@@"/>'
      ,"z": '<path id="n.z" transform="scale(0.95)" \nd="@@"/>'
      ,"+": '<path id="+" transform="scale(0.95)" \nd="@@"/>'
      ,",": '<path id="," transform="scale(0.95)" \nd="@@"/>'
      ,"-": '<path id="-" transform="scale(0.95)" \nd="@@"/>'
      ,".": '<path id="." transform="scale(0.95)" \nd="@@"/>'
      ,"accidentals.nat": '<path id="accidentals.nat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.sharp": '<path id="accidentals.sharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.flat": '<path id="accidentals.flat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfsharp": '<path id="accidentals.halfsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblsharp": '<path id="accidentals.dblsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfflat": '<path id="accidentals.halfflat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblflat": '<path id="accidentals.dblflat" transform="scale(0.8)" \nd="@@"/>'
      ,"clefs.C": '<path id="clefs.C" \nd="@@"/>'
      ,"clefs.F": '<path id="clefs.F" \nd="@@"/>'
      ,"clefs.G": '<path id="clefs.G" \nd="@@"/>'
      ,"clefs.perc": '<path id="clefs.perc" \nd="@@"/>'
      ,"clefs.tab": '<path id="clefs.tab" transform="scale(0.9)" \nd="@@"/>'
      ,"dots.dot": '<path id="dots.dot" \nd="@@"/>'
      ,"flags.d8th": '<path id="flags.d8th" \nd="@@"/>'
      ,"flags.d16th": '<path id="flags.d16th" \nd="@@"/>'
      ,"flags.d32nd": '<path id="flags.d32nd" \nd="@@"/>'
      ,"flags.d64th": '<path id="flags.d64th" \nd="@@"/>'
      ,"flags.dgrace": '<path id="flags.dgrace" \nd="@@"/>'
      ,"flags.u8th": '<path id="flags.u8th" \nd="@@"/>'
      ,"flags.u16th": '<path id="flags.u16th" \nd="@@"/>'
      ,"flags.u32nd": '<path id="flags.u32nd" \nd="@@"/>'
      ,"flags.u64th": '<path id="flags.u64th" \nd="@@"/>'
      ,"flags.ugrace": '<path id="flags.ugrace" \nd="@@"/>'
      ,"graceheads.quarter": '<g id="graceheads.quarter" transform="scale(0.6)" ><use xlink:href="#noteheads.quarter" /></g>'
      ,"graceflags.d8th": '<g id="graceflags.d8th" transform="scale(0.6)" ><use xlink:href="#flags.d8th" /></g>'
      ,"graceflags.u8th": '<g id="graceflags.u8th" transform="scale(0.6)" ><use xlink:href="#flags.u8th" /></g>'
      ,"noteheads.quarter": '<path id="noteheads.quarter" \nd="@@"/>'
      ,"noteheads.whole": '<path id="noteheads.whole" \nd="@@"/>'
      ,"notehesad.dbl": '<path id="noteheads.dbl" \nd="@@"/>'
      ,"noteheads.half": '<path id="noteheads.half" \nd="@@"/>'
      ,"rests.whole": '<path id="rests.whole" \nd="@@"/>'
      ,"rests.half": '<path id="rests.half" \nd="@@"/>'
      ,"rests.quarter": '<path id="rests.quarter" \nd="@@"/>'
      ,"rests.8th": '<path id="rests.8th" \nd="@@"/>'
      ,"rests.16th": '<path id="rests.16th" \nd="@@"/>'
      ,"rests.32nd": '<path id="rests.32nd" \nd="@@"/>'
      ,"rests.64th": '<path id="rests.64th" \nd="@@"/>'
      ,"rests.128th": '<path id="rests.128th" \nd="@@"/>'
      ,"scripts.rarrow": '<path id="scripts.rarrow" \nd="M -6 -5 h 8 v -3 l 4 4 l -4 4 v -3 h -8 z"/>'
      ,"scripts.tabrest": '<path id="scripts.tabrest" \nd="M -5 5 h 10 v 2 h -10 z"/>'
      ,"scripts.lbrace": '<path id="scripts.lbrace" \nd="@@"/>'
      ,"scripts.ufermata": '<path id="scripts.ufermata" \nd="@@"/>'
      ,"scripts.dfermata": '<path id="scripts.dfermata" \nd="@@"/>'
      ,"scripts.sforzato": '<path id="scripts.sforzato" \nd="@@"/>'
      ,"scripts.staccato": '<path id="scripts.staccato" \nd="@@"/>'
      ,"scripts.tenuto": '<path id="scripts.tenuto" \nd="@@"/>'
      ,"scripts.umarcato": '<path id="scripts.umarcato" \nd="@@"/>'
      ,"scripts.dmarcato": '<path id="scripts.dmarcato" \nd="@@"/>'
      ,"scripts.stopped": '<path id="scripts.stopped" \nd="@@"/>'
      ,"scripts.upbow": '<path id="scripts.upbow" \nd="@@"/>'
      ,"scripts.downbow": '<path id="scripts.downbow" \nd="@@"/>'
      ,"scripts.turn": '<path id="scripts.turn" \nd="@@"/>'
      ,"scripts.trill": '<path id="scripts.trill" \nd="@@"/>'
      ,"scripts.segno": '<path id="scripts.segno" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.coda": '<path id="scripts.coda" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.comma": '<path id="scripts.comma" \nd="@@"/>'
      ,"scripts.roll": '<path id="scripts.roll" \nd="@@"/>'
      ,"scripts.prall": '<path id="scripts.prall" \nd="@@"/>'
      ,"scripts.mordent": '<path id="scripts.mordent" \nd="@@"/>'
      ,"timesig.common": '<path id="timesig.common" \nd="@@"/>'
      ,"timesig.cut": '<path id="timesig.cut" \nd="@@"/>'
      ,"it.punto": '<path id="it.punto" \nd="@@"/>'
      ,"it.l": '<path id="it.l" \nd="@@"/>'
      ,"it.f": '<path id="it.f" \nd="@@"/>'
      ,"it.F": '<path id="it.F" \nd="@@"/>'
      ,"it.i": '<path id="it.i" \nd="@@"/>'
      ,"it.n": '<path id="it.n" \nd="@@"/>'
      ,"it.e": '<path id="it.e" \nd="@@"/>'
      ,"it.D": '<path id="it.D" \nd="@@"/>'
      ,"it.d": '<path id="it.d" \nd="@@"/>'
      ,"it.a": '<path id="it.a" \nd="@@"/>'
      ,"it.C": '<path id="it.C" \nd="@@"/>'
      ,"it.c": '<path id="it.c" \nd="@@"/>'
      ,"it.p": '<path id="it.p" \nd="@@"/>'
      ,"it.o": '<path id="it.o" \nd="@@"/>'
      ,"it.S": '<path id="it.S" \nd="@@"/>'
      ,"it.s": '<path id="it.s" \nd="@@"/>'
      ,"it.Fine": '<g id="it.Fine" ><use xlink:href="#it.F" x="0" y="3" /><use xlink:href="#it.i" x="12" y="3" /><use xlink:href="#it.n" x="17.5" y="3" /><use xlink:href="#it.e" x="27" y="3" /></g>'
      ,"it.Coda": '<g id="it.Coda" ><use xlink:href="#it.C" x="0" y="3" /><use xlink:href="#it.o" x="12" y="3" /><use xlink:href="#it.d" x="20" y="3" /><use xlink:href="#it.a" x="30" y="3" /></g>'
      ,"it.Da": '<g id="it.Da"><use xlink:href="#it.D" x="0" y="3" /><use xlink:href="#it.a" x="14" y="3" /></g>'
      ,"it.DaCoda": '<g id="it.DaCoda"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.coda" x="32" y="0" /></g>'
      ,"it.DaSegno": '<g id="it.DaSegno"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.segno" x="32" y="-3" /></g>'
      ,"it.DC": '<g id="it.DC"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.C" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.DS": '<g id="it.DS"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.S" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.al": '<g id="it.al"><use xlink:href="#it.a" x="0" y="2" /><use xlink:href="#it.l" x="10" y="2" /></g>'
      ,"it.DCalFine": '<g id="it.DCalFine"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DCalCoda": '<g id="it.DCalCoda"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
      ,"it.DSalFine": '<g id="it.DSalFine"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DSalCoda": '<g id="it.DSalCoda"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
    };
    
    this.getDefinition = function (gl) {
        
        
        var g = glyphs[gl];
        
        if (!g) {
            return "";
        }
        
        // expande path se houver, buscando a definicao do original do ABCJS.
        g = g.replace('@@', abc_glyphs.getSymbolPathTxt(gl) );
        
        var i = 0, j = 0;

        while (i>=0) {
            i = g.indexOf('xlink:href="#', j );
            if (i < 0) continue;
            i += 13;
            j = g.indexOf('"', i);
            g += this.getDefinition(g.slice(i, j));
        }

        return '\n' +  g;
    };
};
/* abc_selectors.js
   Implenta alguns objetos para controle de tela, tais como o um seletor de acordeons e um seletor de tonalidades
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.AccordionSelector = function (id, divId, callBack, extraItems ) {
    
    this.extraItems = extraItems || [];
    this.ddmId = id;
    
    if (divId instanceof DRAGGABLE.ui.DropdownMenu) {
        this.menu = divId;   
    } else {
        this.menu = new DRAGGABLE.ui.DropdownMenu(
               divId
            ,  callBack
            ,  [{title: 'Acordeons', ddmId: this.ddmId, itens: []}]
        );
    }
    
    // tratar os casos os o listener não possui um acordeon definido
    if (callBack && callBack.listener && callBack.listener.accordion) {
        this.accordion = callBack.listener.accordion;
    }
};
    
ABCXJS.edit.AccordionSelector.prototype.populate = function(changeTitle, selectId ) {
    var m, selectItem, title;

    this.menu.emptySubMenu( this.ddmId );    
    
    for (var i = 0; i < this.accordion.accordions.length; i++) {
        m = this.menu.addItemSubMenu( 
            this.ddmId, 
            this.accordion.accordions[i].getFullName() + '|' 
                + this.accordion.accordions[i].getId() );
        
        // identifica o item a ser selecionado
        if( typeof selectId === "undefined"  ) {
            if( this.accordion.getId() === this.accordion.accordions[i].getId() ) {
                selectItem = m;
                title = this.accordion.getFullName();
            }
        } else {
            if( selectId === this.accordion.accordions[i].getId() ) {
                selectItem = m;
                title = this.accordion.accordions[i].getFullName();
            }
        }
    }
    
    // adiciona os itens extra
    for (var i = 0; i < this.extraItems.length; i++) {
        var m = this.menu.addItemSubMenu( this.ddmId, this.extraItems[i] );
    }
    
    if(changeTitle && title )
        this.menu.setSubMenuTitle(this.ddmId, title );
    
    if( selectItem )
        this.menu.selectItem(this.ddmId, selectItem );
    
};

ABCXJS.edit.KeySelector = function(id, divId, callBack ) {
    
    this.ddmId = id;
    if (divId instanceof DRAGGABLE.ui.DropdownMenu) {
        this.menu = divId;   
    } else {
        this.menu = new DRAGGABLE.ui.DropdownMenu(
               divId
            ,  callBack
            ,  [{title: 'Keys', ddmId: this.ddmId, itens: []}]
        );
    }
};

ABCXJS.edit.KeySelector.prototype.setVisible = function (visible) {
    this.menu.setVisible(visible);
};

ABCXJS.edit.KeySelector.prototype.populate = function(offSet) {
    var cromaticSize = 12;
    this.menu.emptySubMenu( this.ddmId );    
    
    for (var i = +(cromaticSize+offSet-1); i > -(cromaticSize-offSet); i--) {
        var opt; 
        if(i > offSet) 
            opt = ABCXJS.parse.number2keysharp[(i+cromaticSize)%cromaticSize] ;
        else
            opt = ABCXJS.parse.number2keyflat[(i+cromaticSize)%cromaticSize] ;
        
        var e = this.menu.addItemSubMenu( this.ddmId, opt + '|' + (i-offSet) );
        
        if( i === offSet ) {
            this.menu.setSubMenuTitle( this.ddmId, opt );
            this.menu.selectItem( this.ddmId, e );
        }
      
    }
};

// EditArea is an example of using a ace editor as the control that is shown to the user. As long as
// the same interface is used, ABCXJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(editor_id, listener)REA
//		This contains the id of a textarea control that will be used.
// - addChangeListener(listener)
//		A callback class that contains the entry point fireChanged()
// - getSelection()
//		returns the object { start: , end: } with the current selection in characters
// - clearSelection(abcelem)
//		limpa seleção do elemento no texto abc.
// - setSelection(abcelem)
//		seleciona elemento no texto abc.
// - getString()
//		returns the ABC text that is currently displayed.
// - setString(str)
//		sets the ABC text that is currently displayed, and resets the initialText variable
// - string initialText
//		Contains the starting text. This can be compared against the current text to see if anything changed.
//

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.EditArea = function (editor_id, callback, options ) {
    
    var self = this;
    
    options = options? options : {};
    
    this.parentCallback = callback;
    this.callback = { listener: this, method: 'editareaCallback' };
    
    this.container = {};
    
    var aToolBotoes = [ 
         'gutter'
        ,'download'
        ,'undoall'
        ,'undo'
        ,'redo'
        ,'redoall'
        ,'refresh'
        ,'findNreplace'
        ,'fontSize'
        ,'DROPDOWN|selKey'
        ,'octavedown'
        ,'octaveup'
        ,'lighton'
        ,'readonly' 
    ] ;
    
    options.draggable = typeof( options.draggable ) === 'undefined'? true: options.draggable;
    this.draggagle = options.draggable;
    this.compileOnChange = typeof( options.compileOnChange ) === 'undefined'? false: options.compileOnChange;
    this.maximized = typeof( options.maximized ) === 'undefined'? false: options.maximized;
    this.translator = options.translator ? options.translator : null;
    
    var topDiv;
    
    if(typeof editor_id === 'string'  )
        topDiv = document.getElementById( editor_id );
    else 
        topDiv = editor_id;
    
    if(!topDiv) {
        alert( 'this.container: elemento "'+editor_id+'" não encontrado.');
    }
    
    this.container = new DRAGGABLE.ui.Window( 
          topDiv
        , [ 'move', 'popin', 'popout' , 'restore', 'maximize' ]
        , options
        , this.callback
        , aToolBotoes
    );
    
    this.keySelector = new ABCXJS.edit.KeySelector( 
        'selKey', this.container.menu['selKey'], this.callback );

    this.setFloating(this.draggable);
    
    this.currrentFontSize = '15px';
    this.aceEditor = ace.edit(this.container.dataDiv);
    this.aceEditor.setOptions( {highlightActiveLine: true, selectionStyle: "text", cursorStyle: "smooth"/*, maxLines: Infinity*/ } );
    this.aceEditor.setOptions( {fontFamily: "'DejaVuSansMono','Monospace'", fontSize: this.currrentFontSize, fontWeight: "normal" });
    this.aceEditor.setOptions( {tabSize: 4, useSoftTabs: false, showInvisibles: false });
    this.aceEditor.renderer.setOptions( {highlightGutterLine: true, showPrintMargin: false, showFoldWidgets: false } );
    this.aceEditor.session.setNewLineMode('unix');
    this.aceEditor.$blockScrolling = Infinity;
    this.Range = require("ace/range").Range;
    this.gutterVisible = true;
    this.readOnly = false;
    this.showHiddenChar = false;
    this.syntaxHighLightVisible = true;
    this.selectionEnabled = true;

    this.restartUndoManager();
    this.createStyleSheet();
    
    this.aceEditor.on("focus", function() { 
        self.aceEditor.focus(); 
        self.container.focus(); 
    });
    
    this.aceEditor.on("blur", function() { 
        self.aceEditor.blur(); 
        self.container.blur(); 
    });

    if(callback.listener)
        this.addChangeListener(callback.listener);
};

ABCXJS.edit.EditArea.prototype.setCompileOnChange = function ( value ) {
    this.compileOnChange = value;
};

ABCXJS.edit.EditArea.prototype.setMaximized = function ( value ) {
    this.maximized = value;
    this.container.draggable = ! value;
    this.container.setButtonVisible( 'maximize', this.draggable && !this.maximized);
    this.container.setButtonVisible( 'restore', this.draggable && this.maximized);
};

ABCXJS.edit.EditArea.prototype.setFloating = function ( floating ) {
    this.draggable = floating;
    
    this.container.setButtonVisible( 'popout', !this.draggable);
    this.container.setButtonVisible( 'popin', this.draggable );
    this.container.setButtonVisible( 'maximize', this.draggable && !this.maximized);
    this.container.setButtonVisible( 'restore', this.draggable && this.maximized);
    this.container.setButtonVisible( 'move', this.draggable );
    
    this.container.setFloating(floating);
    
};

ABCXJS.edit.EditArea.prototype.editareaCallback = function ( action, elem, searchTerm, replaceTerm, matchCase, wholeWord ) {
    this.container.setStatusMessage( "" );
    switch(action) {
        case 'UNDO': 
            this.undoManager.hasUndo() && this.undoManager.undo(false);
            break;
        case 'REDO': 
            this.undoManager.hasRedo() && this.undoManager.redo(false);
            break;
        case 'UNDOALL': 
            while( this.undoManager.hasUndo() )
                this.undoManager.undo(false);
            break;
        case 'REDOALL': 
            while( this.undoManager.hasRedo() )
                this.undoManager.redo(false);
            break;
        case 'FONTSIZE': 
            switch(this.currrentFontSize) {
                case '15px': this.currrentFontSize = '18px'; break;
                case '18px': this.currrentFontSize = '22px'; break;
                case '22px': this.currrentFontSize = '15px'; break;
            }
            this.aceEditor.setOptions( { fontSize: this.currrentFontSize });
            break;
        case 'FINDNREPLACE': 
            this.alert = new DRAGGABLE.ui.ReplaceDialog( this.container, {translator: this.translator}  );
            break;
        case 'DO-SEARCH': 
            if( searchTerm === "") {
                this.container.setStatusMessage( this.translator.getResource( 'search_field_empty' ) );
                break;
            }
            this.searchRange = this.aceEditor.find(searchTerm, {
                wrap: true,
                caseSensitive: matchCase, 
                wholeWord: wholeWord,
                regExp: false,
                preventScroll: true // do not change selection
            });
            if(this.searchRange) {
                this.aceEditor.selection.setRange(this.searchRange);
            } else {
                this.container.setStatusMessage( this.translator.getResource( 'not_found' ) );
            }   
            break;
        case 'DO-REPLACE': 
            if( searchTerm === "") {
                this.container.setStatusMessage( this.translator.getResource( 'search_field_empty' ) );
                break;
            }
            if( ! this.searchRange ) {
                this.searchRange = this.aceEditor.find(searchTerm, {
                    wrap: true,
                    caseSensitive: matchCase, 
                    wholeWord: wholeWord,
                    regExp: false,
                    preventScroll: true // do not change selection
                });
                if(this.searchRange) {
                    this.aceEditor.selection.setRange(this.searchRange);
                } else {
                    this.container.setStatusMessage( this.translator.getResource( 'not_found' ) );
                    break;
                }   
            } 
            this.aceEditor.session.replace(this.searchRange, replaceTerm );
            
            this.searchRange = this.aceEditor.find(searchTerm, {
                wrap: true,
                caseSensitive: matchCase, 
                wholeWord: wholeWord,
                regExp: false,
                preventScroll: true // do not change selection
            });
            
            if(this.searchRange) {
                this.aceEditor.selection.setRange(this.searchRange);
            }    
            
            break;
        case 'DO-REPLACEALL': 
            if( searchTerm === "") {
                this.container.setStatusMessage( this.translator.getResource( 'search_field_empty' ) );
                break;
            }
            this.searchRange = true;
            var c = 0;
            while(this.searchRange) {
                this.searchRange = this.aceEditor.find(searchTerm, {
                    wrap: true,
                    caseSensitive: matchCase, 
                    wholeWord: wholeWord,
                    regExp: false,
                    preventScroll: true // do not change selection
                });
                if(this.searchRange) {
                    this.aceEditor.session.replace(this.searchRange, replaceTerm );
                    c ++;
                } else {
                    if( c === 0  ) {
                        this.container.setStatusMessage( this.translator.getResource( 'not_found' ) );
                    } else {
                        this.container.setStatusMessage( c + ' ' + this.translator.getResource( 'occurrence_replaced' ) );
                    }
                }
            }
            break;
        case 'GUTTER': // liga/desliga a numeracao de linhas
            this.setGutter();
            break;
        case 'READONLY': // habilita/bloqueia a edição
            this.setReadOnly();
            var i = elem.getElementsByTagName("i")[0];
            i.className = (this.readOnly? "ico-lock ico-black ico-large" : "ico-lock-open ico-black ico-large" );
            break;
        case 'LIGHTON': // liga/desliga realce de sintaxe
            this.setSyntaxHighLight();
            var i = elem.getElementsByTagName("i")[0];
            i.className = (this.syntaxHighLightVisible? "ico-lightbulb-on ico-black ico-large" : "ico-lightbulb-off ico-black ico-large" );
            break;
        case 'HIDDENCHAR':
            this.showHiddenChars();
            break;
        case 'RESIZE':
            this.resize();
            this.parentCallback.listener[this.parentCallback.method](action, elem);
            break;
        default:
            this.parentCallback.listener[this.parentCallback.method](action, elem);
    }
    this.aceEditor.focus();

};

// Este css é usado apenas quando o playback da partitura está funcionando
// e então a cor de realce é no edidor fica igual a cor de destaque da partitura.
ABCXJS.edit.EditArea.prototype.createStyleSheet = function () {
    this.style = document.createElement('style');
    this.style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(this.style);        
};

ABCXJS.edit.EditArea.prototype.setEditorHighLightStyle = function () {
    this.style.innerHTML = '.ABCXHighLight { background-color: '+ABCXJS.write.color.highLight+' !important; opacity: 0.15; }';
};

ABCXJS.edit.EditArea.prototype.clearEditorHighLightStyle = function () {
    this.style.innerHTML = '.ABCXHighLight { }';
};

ABCXJS.edit.EditArea.prototype.showHiddenChars = function (showHiddenChar) {
    if(typeof showHiddenChar === 'boolean') {
        this.showHiddenChar = showHiddenChar;
    } else {
        this.showHiddenChar = !this.showHiddenChar;
    }
    
    
    this.aceEditor.setOption("showInvisibles", this.showHiddenChar);
};

ABCXJS.edit.EditArea.prototype.setGutter = function (visible) {
    if(typeof visible === 'boolean') {
        this.gutterVisible = visible;
    } else {
        this.gutterVisible = ! this.gutterVisible;
    }
    this.aceEditor.renderer.setShowGutter(this.gutterVisible);
};

ABCXJS.edit.EditArea.prototype.setReadOnly = function (readOnly) {
    
    if(typeof readOnly === 'boolean') {
        this.readOnly = readOnly;
    } else {
        this.readOnly = !this.readOnly;
    }
    
    this.aceEditor.setOptions({
        readOnly: this.readOnly,
        highlightActiveLine: !this.readOnly,
        highlightGutterLine: !this.readOnly
    });
    
    this.aceEditor.textInput.getElement().disabled=this.readOnly;  
};

ABCXJS.edit.EditArea.prototype.setSyntaxHighLight = function (visible) {
    if(typeof visible === 'boolean') {
        this.syntaxHighLightVisible = visible;
    } else {
        this.syntaxHighLightVisible = ! this.syntaxHighLightVisible;
    }
    this.aceEditor.getSession().setMode( this.syntaxHighLightVisible?'ace/mode/abcx':'ace/mode/text');
};

ABCXJS.edit.EditArea.prototype.setStatusBarVisible = function (visible) {
    this.container.setStatusBarVisible(visible);
    this.resize();
};

ABCXJS.edit.EditArea.prototype.setToolBarVisible = function (visible) {
    this.container.setToolBarVisible(visible);
    this.resize();
};

ABCXJS.edit.EditArea.prototype.setVisible = function (visible) {
    this.container.setVisible(visible);
};

ABCXJS.edit.EditArea.prototype.resize = function () {
    this.container.resize();
    this.aceEditor.resize();
};

ABCXJS.edit.EditArea.prototype.setOptions = function (editorOptions, rendererOptions ) {
    if(editorOptions) {
        this.aceEditor.setOptions( editorOptions );
    }
    if(rendererOptions) {
        this.aceEditor.renderer.setOptions( rendererOptions );
    }
};

ABCXJS.edit.EditArea.prototype.addChangeListener = function (listener) {
    var that = this;
    
    that.aceEditor.textInput.getElement().addEventListener('keyup', function () {
        if(that.timerId1) clearTimeout(that.timerId1);
        that.timerId1 = setTimeout(function () { listener.updateSelection(); }, 100);	
    });
   
    that.aceEditor.on('dblclick', function () {
        if(that.timerId2) clearTimeout(that.timerId2);
        that.timerId2 = setTimeout(function () { listener.updateSelection(); }, 100);	
    });
    
    that.aceEditor.on('mousedown', function () {
        that.aceEditor.on('mouseup', function () {
            if(that.timerId3) clearTimeout(that.timerId3);
            that.timerId3 = setTimeout(function () { listener.updateSelection(); }, 100);	
        });
    });
    
    that.aceEditor.on('change', function () {
        
        var text  = that.aceEditor.getValue();
        
        if( that.compileOnChange && text !== that.initialText ) {
            that.initialText = text;
            if(that.timerId4) clearTimeout(that.timerId4);
            that.timerId4 = setTimeout(function () { listener.fireChanged( 0, {force:false, showProgress:false} ); }, 300);	
        }
    });
};

ABCXJS.edit.EditArea.prototype.getString = function() {
  return this.aceEditor.getValue(); 
};

ABCXJS.edit.EditArea.prototype.setString = function ( str ) {
    if( str === this.aceEditor.getValue() ) return;
    var cursorPosition = this.aceEditor.getCursorPosition();
    this.aceEditor.setValue(str);
    this.aceEditor.clearSelection();
    this.initialText = this.getString();
    this.aceEditor.moveCursorToPosition(cursorPosition); 
    
};

ABCXJS.edit.EditArea.prototype.restartUndoManager = function ( ) {
    this.aceEditor.getSession().setUndoManager(new ace.UndoManager());
    this.undoManager = this.aceEditor.getSession().getUndoManager();
};

ABCXJS.edit.EditArea.prototype.getSelection = function() {
    return this.aceEditor.selection.getAllRanges();
};

ABCXJS.edit.EditArea.prototype.setSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        this.searchRange = null;
        var range = new this.Range(
            abcelem.position.anchor.line, abcelem.position.anchor.ch, 
            abcelem.position.head.line, abcelem.position.head.ch
        );

        this.aceEditor.selection.addRange(range);
        
        if(abcelem.position.selectable || !this.selectionEnabled)
            this.aceEditor.renderer.scrollCursorIntoView(range.end, 1 );
    }   
};

ABCXJS.edit.EditArea.prototype.clearSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        
        var range = new this.Range(
            abcelem.position.anchor.line, abcelem.position.anchor.ch, 
            abcelem.position.head.line, abcelem.position.head.ch
        );

        this.aceEditor.selection.clearRange(range); 
    }
};

ABCXJS.edit.EditArea.prototype.clearSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        
        var range = new this.Range(
            abcelem.position.anchor.line, abcelem.position.anchor.ch, 
            abcelem.position.head.line, abcelem.position.head.ch
        );

        this.aceEditor.selection.clearRange(range); 
    }
};

ABCXJS.edit.EditArea.prototype.maximizeWindow = function( maximize, props ) {

    this.setMaximized(maximize);
    props.maximized = maximize;
    
    if( maximize ) {
        this.container.move(0,0);
        this.container.setSize( "100%", "calc( 100% - 7px)" );
    } else {
        var k = this.container.topDiv.style;
        k.left = props.left;
        k.top = props.top;
        k.width = props.width;
        k.height = props.height;
    }
    this.resize();
};

ABCXJS.edit.EditArea.prototype.dockWindow = function(dock, props, x, y, w, h ) {
    
    props.floating = !dock;
    this.setFloating(props.floating);
    this.setToolBarVisible(props.floating);
    this.setStatusBarVisible(props.floating);
        
    if( props.floating ) {
        this.maximizeWindow(props.maximized, props);
    } else {
        this.container.move(x,y);
        this.container.setSize( w, h);
        this.resize();
    } 
};

ABCXJS.edit.EditArea.prototype.retrieveProps = function( props ) {
    if(props.floating && !props.maximized){
        var k = this.container.topDiv.style;
        props.left = k.left;
        props.top = k.top;
        props.width = k.width;
        props.height = k.height;
    }
};
if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

window.ABCXJS.midi.keyToNote = {}; // C8  == 108
window.ABCXJS.midi.minNote = 0x15; //  A0 = first note
window.ABCXJS.midi.maxNote = 0x6C; //  C8 = last note

// popular array keyToNote com o valor midi de cada nota nomeada
for (var n = window.ABCXJS.midi.minNote; n <= window.ABCXJS.midi.maxNote; n++) {
    var octave = (n - 12) / 12 >> 0;
    var name = ABCXJS.parse.number2keysharp[n % 12] + octave;
    ABCXJS.midi.keyToNote[name] = n;
    name = ABCXJS.parse.number2keyflat[n % 12] + octave;
    ABCXJS.midi.keyToNote[name] = n;
}
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - BUG: não há mais informação sobre o início de cada compasso.
 *   - implementar: segno, coda, capo e fine
 *     Nota: aparentemente o ABC não implementa simbolos como D.S al fine
 *   - Ok - imprimir endings somente no compasso onde ocorrem
 *   - Ok - tratar endings em compassos com repeat bar (tratar adequadamente endings/skippings)
 *   - Ok - tratar notas longas - tanto quganto possível, as notas longas serão reiniciadas
 *          porém a qualidade não é boa pois o reinício é perceptível
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Parse = function( options ) {
    options = options || {};
    this.vars = { warnings: [] };
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    
    this.wholeNote = 32;
    this.minNote = 1 / this.wholeNote;
    this.oneMinute = 60000;
    
    this.reset();
    
    this.addWarning = function(str) {
        this.vars.warnings.push(str);
    };
    
    this.getWarnings = function() {
        return this.vars.warnings;    
    };
};

ABCXJS.midi.Parse.prototype.reset = function() {
    
    this.vars = { warnings: [] };
    this.globalJumps = [];
    
    this.addingBarNumbers = -1;
    this.channel = -1;
    this.timecount = 0;
    this.playlistpos = 0;
    this.maxPass = 2;
    this.countBar = 0;
    this.next = null;
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    
    
    this.multiplier = 1;
    this.alertedMin = false;
    
    this.startTieInterval = [];
    this.lastTabElem = [];
    this.baraccidentals = [];
    this.parsedElements = [];
    
    this.pass = [];
    
    this.midiTune = { 
        tempo: this.oneMinute/640 // duração de cada intervalo em mili
       ,playlist: [] // nova strutura, usando 2 elementos de array por intervalo de tempo (um para ends e outro para starts) 
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

ABCXJS.midi.Parse.prototype.parse = function(tune, keyboard) {
    
    var self = this;
    var currBar = 0; // marcador do compasso corrente - não conta os compassos repetidos por ritornellos

    this.reset();

    this.abctune = tune;
    
    this.transposeTab = 0;
    if(tune.hasTablature){
        this.transposeTab = tune.lines[0].staffs[tune.tabStaffPos].clef.transpose || 0;
    }
    
    this.midiTune.keyboard = keyboard;

    if ( tune.metaText && tune.metaText.tempo) {
        var bpm = tune.metaText.tempo.bpm || 80;
        var duration = tune.metaText.tempo.duration[0] || 0.25;
        this.midiTune.tempo = this.oneMinute / (bpm * duration * this.wholeNote);
    }

    //faz o parse dos elementos abcx 
    this.staffcount = 1;
    for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
        this.voicecount = 1;
        for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
            this.startTrack();
            for (this.line = 0; !this.endTrack && this.line < this.abctune.lines.length; this.line++) {
                if ( this.getStaff() ) {
                    this.pos = 0;
                    if(!this.capo){
                        this.capo = this.restart = this.getMark();
                    }    
                    this.next = null;
                    this.staffcount = this.getLine().staffs.length;
                    this.voicecount = this.getStaff().voices.length;
                    this.setKeySignature(this.getStaff().key);
                    while (!this.endTrack && this.pos < this.getVoice().length ) {
                        var elem = this.getElem();

                        switch (elem.el_type) {
                            case "note":
                                if( this.skipping ) break;
                                if (this.getStaff().clef.type !== "accordionTab") {
                                  this.writeNote(elem);
                                } else {
                                  this.selectButtons(elem);
                                }
                                break;
                            case "key":
                                if( this.skipping ) break;
                                this.setKeySignature(elem);
                                break;
                            case "bar":
                                if(!this.handleBar(elem)) {
                                    return null;
                                }
                                break;
                            case "meter":
                            case "clef":
                                break;
                            default:
                        }
                        if (this.next) {
                            this.line = this.next.line;
                            this.staff = this.next.staff;
                            this.voice = this.next.voice;
                            this.pos = this.next.pos;
                            this.next = null;
                        } else {
                            this.pos++;
                        }
                    }
                }
            }
        }
    }
    
    if(this.lookingForCoda ){
        this.addWarning('Simbolo não encontrado: "Coda"!');
    }
    
    //cria a playlist a partir dos elementos obtidos acima  
    this.parsedElements.forEach( function( item, time ) {
        
        if( item.end.pitches.length + item.end.abcelems.length /* fka + item.end.buttons.length > 0*/ ) {
            self.midiTune.playlist.push( {item: item.end, time: time, start: false } );
        }
        
        if( item.start.pitches.length + item.start.abcelems.length + item.start.buttons.length > 0 ) {
            var pl = {item: null, time: time, start: true };
            if( item.start.barNumber ) {
                this.lastBar = null; // identifica o compasso onde os botões da tablatura não condizem com a partitura
                if( item.start.barNumber > currBar ) {
                    currBar = this.lastBar = item.start.barNumber;
                    self.midiTune.measures[currBar] = self.midiTune.playlist.length;
                }
                pl.barNumber = item.start.barNumber;
            } 
            delete item.start.barNumber;
            self.handleButtons(item.start.pitches, item.start.buttons );
            delete item.start.buttons; 
            pl.item = item.start;
            self.midiTune.playlist.push( pl );
        }
    });
    
    
    tune.midi = this.midiTune;
    
    return this.midiTune;
};

ABCXJS.midi.Parse.prototype.handleButtons = function(pitches, buttons ) {
    var note, midipitch, key, pitch;
    var self = this;
    buttons.forEach( function( item ) {
        if(!item.button.button) {
            //waterbug.log( 'ABCXJS.midi.Parse.prototype.handleButtons: botão não encontrado.');
            return;
        }
        if( item.button.closing )  {
            note = ABCXJS.parse.clone(item.button.button.closeNote);
        } else {
            note = ABCXJS.parse.clone(item.button.button.openNote);
        }
        if(note.isBass) {
            if(note.isChord){
                key = note.key.toUpperCase();
            } else{
                key = note.key;
            }
        } else {
            
            if( self.transposeTab ) {
                switch(self.transposeTab){
                    case 8: note.octave --; break;
                    case -8: note.octave ++; break;
                    default:
                        this.addWarning('Possível transpor a tablatura uma oitava acima ou abaixo +/-8. Ignorando transpose.') ;
                }
            }
            
            midipitch = 12 + 12 * note.octave + ABCXJS.parse.key2number[ note.key ];
        }
        
        // TODO:  no caso dos baixos, quando houver o baixo e o acorde simultaneamente
        // preciso garantir que estou atribuindo o botão à nota certa, visto que  podem ter tempos diferentes
        // por hora, procuro a primeira nota que corresponda e não esteja com botão associado (! pitches[r].button)
        var hasBass=false, hasTreble=false;
        for( var r = 0; r < pitches.length; r ++ ) {
            if(note.isBass && pitches[r].midipitch.clef === 'bass') {
                pitch = pitches[r].midipitch.midipitch % 12;
                hasBass=true;
                if( pitch === ABCXJS.parse.key2number[ key ] && ! pitches[r].button ){
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            } else if(!note.isBass && pitches[r].midipitch.clef !== 'bass') { 
                hasTreble=true;
                if( pitches[r].midipitch.midipitch === midipitch ) {
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            }
        }
        if(this.lastBar && ((note.isBass && hasBass) || (!note.isBass && hasTreble /* flavio && this.lastBar */))) {
            var b = item.button.button;
            self.addWarning( 'Compasso '+this.lastBar+': Botao '+b.tabButton+' ('+b.closeNote.key+'/'+b.openNote.key+') não corresponde a nenhuma nota em execução.');
        }    
    });
};
            
ABCXJS.midi.Parse.prototype.writeNote = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet.num === 2) ? 3 / 2 : (elem.startTriplet.num - 1) / elem.startTriplet.num;
    }

    var mididuration = this.checkMinNote(elem.duration * this.wholeNote * this.multiplier);

    if (elem.pitches) {
        var midipitch;
        for (var i = 0; i < elem.pitches.length; i++) {
            var note = elem.pitches[i];
            var pitch = note.pitch;
            if (note.accidental) {
                // change that pitch (not other octaves) for the rest of the bar
                this.baraccidentals[pitch] = this.getAccOffset(note.accidental);
            }

            midipitch = 60 + 12 * this.extractOctave(pitch) + this.scale[this.extractNote(pitch)];

            if (this.baraccidentals[pitch] !== undefined) {
                midipitch += this.baraccidentals[pitch];
            } else { // use normal accidentals
                midipitch += this.accidentals[this.extractNote(pitch)];
            }

            if (note.tie) {
                this.handleTie( elem, note, midipitch, mididuration );
            } else {
                if (this.startTieInterval[midipitch] && this.startTieInterval[midipitch][0]) {
                    // ligadura do tipo slur - nota contida
                    this.addWarning( 'Linha '+(elem.line+1)+': Nota sendo ignorada porque já está contida na ligadura!' );
                    // apenas informa o inicio e o fim do elemento na playlist (sem som)
                    this.addStart( this.timecount, null, elem, null );
                    this.addEnd( this.timecount + mididuration, null, elem );
                } else { // o básico - inicia e termina a nota
                    var mp = {channel: this.channel, midipitch: midipitch, mididuration: mididuration};
                    // elemento completo + som: inicia e termina no seu próprio tempo
                    this.addStart( this.timecount, mp, elem, null );
                    this.addEnd( this.timecount + mididuration, mp, elem );
                }
            }
        }
    } else {
        // rest
        this.addStart( this.timecount, null, elem, null );
        this.addEnd( this.timecount + mididuration, null, elem );
        
    }

    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
};

ABCXJS.midi.Parse.prototype.handleTie = function ( elem, note, midipitch, mididuration ) {
    
    if (note.tie && note.tie.id_end) { // termina
        
        var startInterval = this.startTieInterval[midipitch];
        
        if( note.tie.id_start ) { // termina ligadura e recomeça
            //inclui o inicio do elemento (sem som na playlist), mas não o seu fim
            this.addStart( this.timecount, null, elem, null );
            // guarda junto com o elemento que iniciou a ligadura, também, este elemento
            startInterval.otrElems.push( elem );
            
         }  else {
            
            // adiciona o ínicio e o fim do último elemento da ligadura, sem som
            this.addStart( this.timecount, null, elem, null );
            this.addEnd( this.timecount+mididuration, null, elem );
            
            if(!startInterval ) {
               this.addWarning( 'Verifique as ligaduras: possivel ligacao de notas com alturas diferentes');
               return;
            }
            
            // para todos os elementos intermediários, adiciona o fim sem som
            for(var i=0; i < startInterval.otrElems.length; i++ ) {
                this.addEnd( this.timecount+mididuration, null, startInterval.otrElems[i] );
            }
            
            // trata a duração total da ligadura
            var duration = this.timecount-startInterval.startTime + mididuration;
            // atualiza a informação de tempo do elemento inicial
            startInterval.midipitch.mididuration = duration;
            // insere o final do som e do elemento inicial da ligadura
            this.addEnd( this.timecount+mididuration, startInterval.midipitch, startInterval.elem  );
            
            // zera a informação de ligadura para esta nota
            this.startTieInterval[midipitch] = null;
            
        }
    } else if (note.tie && note.tie.id_start ) { // só inicia
        var mp = {channel:this.channel, midipitch:midipitch, mididuration: mididuration};
        // informa o inicio do midi (e elemento) na playlist, mas nao o seu final 
        this.addStart( this.timecount, mp, elem, null );
        // registra dados do elemento que iniciou a ligadura 
        this.startTieInterval[midipitch] = { elem:elem, startTime: this.timecount, midipitch:mp, otrElems:[] };
    } 
};

ABCXJS.midi.Parse.prototype.clearTies = function() {
    // esta função é usada em caso de ritornellos em que haja alguma ligadura em aberto.
    var self = this;
    self.startTieInterval.forEach( function ( obj, index ) {
        if( ! obj ) return; 
        self.addEnd( self.timecount, obj.midipitch, obj.elem ); 
        self.startTieInterval[index] = null;
    });
};

ABCXJS.midi.Parse.prototype.setTimeCount = function(dur) {
    this.timecount += dur;
    // corrigir erro de arredondamento
    if( this.timecount%1.0 > 0.9999 ) {
        this.timecount = Math.round( this.timecount );
    }
};

ABCXJS.midi.Parse.prototype.checkMinNote = function(dur) {
    if( dur < 0.99 ) {
        dur = 1;
        if( !this.alertedMin ) {
            this.addWarning( 'Nota(s) com duração menor que o mínimo suportado: 1/' + this.wholeNote + '.');
            this.alertedMin = true;
        }    
    }
    
    return dur;
    
};

ABCXJS.midi.Parse.prototype.selectButtons = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet.num === 2) ? 3 / 2 : (elem.startTriplet.num - 1) / elem.startTriplet.num;
    }
    
    var mididuration = elem.duration * this.wholeNote * this.multiplier;
    
    if (elem.pitches) {
        
        var button;
        var bassCounter = 0; // gato para resolver o problema de agora ter um ou dois botões de baixos
        for (var i = 0; i < elem.pitches.length; i++) {
            var tie = false;
            if (elem.pitches[i].bass ) 
                bassCounter++;
            
            if (elem.pitches[i].type === "rest") 
                continue;
            
            if (elem.pitches[i].bass) {
                if (elem.pitches[i].c === 'scripts.rarrow') {
                    button = this.lastTabElem[i];
                    elem.pitches[i].lastButton = (button? button.tabButton: 'x');
                    tie = true;
                } else {
                    button = this.getBassButton(elem.bellows, elem.pitches[i].c);
                    this.lastTabElem[i] = button;
                }
            } else {
                if ( elem.pitches[i].c === 'scripts.rarrow') {
                    button = this.lastTabElem[10+i-bassCounter];
                    elem.pitches[i].lastButton = (button? button.tabButton: 'x');
                    tie = true;
                } else {
                    button = this.getButton(elem.pitches[i].c);
                    this.lastTabElem[10+i-bassCounter] = button;
                }
            }
            if( ! tie ) {
                this.addStart( this.timecount, null, null, { button: button, closing: (elem.bellows === '+'), duration: elem.duration } );
            }    
        }
    }
    
    this.addStart( this.timecount, null, elem, null );
    this.addEnd( this.timecount+mididuration, null, elem );
    
    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
    
};

// Esta função é fundamental pois controla todo o fluxo de execução das notas do MIDI
ABCXJS.midi.Parse.prototype.handleBar = function (elem) {
    
    this.countBar++; // para impedir loop infinito em caso de erro
    if(this.countBar > 10000) {
      this.addWarning('Impossível gerar o MIDI para esta partitura após 10.000 ciclos.') ;
      return false;
    }
    
    this.maxPass = elem.repeat;

    if( elem.barNumber ) {
        this.addBarNumber = elem.barNumber; 
    }
    
    this.baraccidentals = [];
    
    if( this.lookingForCoda ) {
        if( !elem.jumpInfo || elem.jumpInfo.type!=='coda' ) {
            return true;
        } else {
            this.codaPoint = this.getMark(); 
            this.lookingForCoda = false;
            this.skipping = false;
        }
    }
    
    //implementa jump ao final do compasso
    //if(this.nextBarJump ) {
    //    this.next = this.nextBarJump;
    //    delete this.nextBarJump;
    //}

    var pass = this.setPass();
    
    if(elem.type === "bar_left_repeat") {
        this.restart = this.getMark();   
    } 
    
    if (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" ) {
        if( pass < this.maxPass ) {
            delete this.currEnding; // apaga qualquer ending em ação
            this.clearTies(); // limpa ties
            this.next = this.restart;// vai repetir
            return true;
        } else {
            if( elem.type === "bar_dbl_repeat" ) {
                // não vai repetir e, além de tudo, é um novo restart
                this.restart = this.getMark();   
            }
        }
    }
    
   // encerra uma chave de finalização
    if (elem.endEnding) {
        delete this.currEnding;
    }

   // inicia uma chave de finalização e faz o parse da quantidade repetições necessarias
   // a chave de finalização imediatamente  após um bloco de repetição ter sido terminado será ignorada
   // e enquanto o bloco estiver sendo repetido, também
    if (elem.startEnding ) {
        var a = elem.startEnding.split('-');
        this.currEnding = {};
        this.currEnding.min = parseInt(a[0]);
        this.currEnding.max = a.length > 1 ? parseInt(a[1]) : this.currEnding.min;
        this.currEnding.measuresInEnding = [];
        this.maxPass = Math.max(this.currEnding.max, 2);
        
        // casa "2" não precisa de semantica
        // rever isso: não precisa de semântica se a casa dois vier depois de um 
        // simbolo de repetição, seja um ritornello ou qualquer outro.
        // pergunta: casa 2 sem sinal de repetição faz sentido?
        if(this.currEnding.min > 1) delete this.currEnding;  
    }
    
    if(this.currEnding) {
        // registra os compassos debaixo deste ending
        this.currEnding.measuresInEnding.push( this.getMark() ); 
    }
    
    this.skipping = (this.currEnding && ( pass < this.currEnding.min || pass > this.currEnding.max) ) || false;

    if(elem.jumpPoint ) {
        
        switch (elem.jumpPoint.type) {
            case "coda":     
                this.codaPoint = this.getMark(); 
                break;
            case "segno":    
                this.segnoPoint = this.getMark(); 
                break;
            case "fine":     
                if(this.fineFlagged) {
                    this.endTrack = true;
                    return true;
                } 
                break;
        }
    }
    
    if(elem.jumpInfo ) {
        switch (elem.jumpInfo.type) {
            case "dacapo":   
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.resetPass();
                } 
                break;
            case "dasegno":
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.daSegnoFlagged = true;
                        this.resetPass();
                    }
                } else {
                    this.addWarning( 'Ignorando Da segno!');
                }
                break;
            case "dcalfine": 
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.fineFlagged = true;
                    this.resetPass();
                } 
                break;
            case "dsalfine": 
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.fineFlagged = true;
                        this.daSegnoFlagged = true;
                        this.resetPass();
                    }
                } else {
                    this.addWarning( 'Ignorando Da segno al fine!');
                }
                break;
            case "dacoda":
                if( this.codaPoint ){
                    if(pass >= this.maxPass || this.daCodaFlagged){
                        this.next = this.codaPoint;
                        this.daCodaFlagged = false;
                        this.resetPass();
                    }
                } else if(this.daCodaFlagged) {
                    this.lookingForCoda = true;
                    this.skipping = true;
                }
                break;
            case "dsalcoda": 
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.daSegnoFlagged = true;
                        this.daCodaFlagged = true;
                        this.resetPass();

                    }
                } else {
                    this.addWarning( 'Ignorando "D.S. al coda"!');
                }
                break;
            case "dcalcoda": 
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.daCodaFlagged = true;
                    this.resetPass();
                } 
                break;
        }
    }
    return true;
};

ABCXJS.midi.Parse.prototype.getParsedElement = function(time) {
    if( ! this.parsedElements[time] ) {
        this.parsedElements[time] = {
            start:{pitches:[], abcelems:[], buttons:[], barNumber: null}
            ,end:{pitches:[], abcelems:[]}
        };
    }
    return this.parsedElements[time];
};

ABCXJS.midi.Parse.prototype.addStart = function( time, midipitch, abcelem, button ) {
    var delay = (time%1.0);
    time -= delay;
    
    var pE = this.getParsedElement(time);
    
    if( abcelem ) {
        pE.start.abcelems.push({abcelem:abcelem,channel:this.channel, delay:delay});
        
        // a ideia é: a primeira voz que chegar com o barNumber 1, será a única considera para numerar os compassos
        // assim depois que a var addingBarNumbers for inicializada, somente nrs. de compasso restantes daquela voz serão incluidos
        if( this.addBarNumber && ( ( this.addBarNumber === 1 && this.addingBarNumbers < 0 ) || this.addingBarNumbers === ((this.staff+1)*10 + this.voice ) ) ) {
            pE.start.barNumber = this.addBarNumber;
            this.addingBarNumbers = ((this.staff+1)*10 + this.voice );
            delete this.addBarNumber;
        }
    }    
    if( midipitch ) {
        midipitch.clef = this.getStaff().clef.type;
        pE.start.pitches.push( {midipitch: midipitch, delay:delay} );
    }
    if( button ) {
        pE.start.buttons.push({button:button, abcelem:abcelem, delay:delay});
    }
};

ABCXJS.midi.Parse.prototype.addEnd = function( time, midipitch, abcelem/*, button*/ ) {
    var delay = (time%1);
    time -= delay;
    var pE = this.getParsedElement(time);
    if( abcelem   ) pE.end.abcelems.push({abcelem:abcelem, delay:delay});
    if( midipitch ) pE.end.pitches.push({midipitch: midipitch, delay:delay});
};

ABCXJS.midi.Parse.prototype.getMark = function() {
    return {line: this.line, staff: this.staff,
        voice: this.voice, pos: this.pos};
};

ABCXJS.midi.Parse.prototype.getMarkString = function(mark) {
    mark = mark || this;
    return "line" + mark.line + "staff" + mark.staff +
           "voice" + mark.voice + "pos" + mark.pos;
};

ABCXJS.midi.Parse.prototype.getMarkValue = function(mark) {
    mark = mark || this;
    return (mark.line+1) *1e6 + mark.staff *1e4 + mark.voice *1e2 + mark.pos;
};

ABCXJS.midi.Parse.prototype.setPass = function(mark) {
    var compasso = this.getMarkValue(mark);
    //registra e retorna o número de vezes que já passou por compasso.
    //a cada (salto D.C., D.S., dacoda) deve-se zerar a contagem
    if( this.pass[compasso]){
        this.pass[compasso] = this.pass[compasso]+1;
    } else {
        this.pass[compasso] = 1;
    }
    return this.pass[compasso];
};

ABCXJS.midi.Parse.prototype.resetPass = function() {
    //limpa contadores de passagem, mas caso em ending, preserva a contagem de passagem dos compassos debaixo do ending corrente  
    this.pass = [];
    var self = this;
    if( this.currEnding ) {
        this.currEnding.measuresInEnding.forEach( function( item, index ) {
            self.setPass(item);
        });
    }
    //this.currEnding && this.setPass(); 
};

ABCXJS.midi.Parse.prototype.hasTablature = function() {
    return this.abctune.hasTablature;
};

ABCXJS.midi.Parse.prototype.getLine = function() {
    return this.abctune.lines[this.line];
};

ABCXJS.midi.Parse.prototype.getStaff = function() {
    var l = this.getLine();
    if ( !l.staffs ) return undefined;
    return l.staffs[this.staff];
};

ABCXJS.midi.Parse.prototype.getVoice = function() {
    return this.getStaff().voices[this.voice];
};

ABCXJS.midi.Parse.prototype.getElem = function() {
    return this.getVoice()[this.pos];
};

ABCXJS.midi.Parse.prototype.startTrack = function() {
    this.channel ++;
    this.timecount = 0;
    this.playlistpos = 0;
    this.maxPass = 2;
    this.countBar = 0;
    
    this.next = null;
    
    this.pass = [];
    
    this.endTrack = false;    
    
    //delete this.nextBarJump;
    delete this.codaFlagged;
    delete this.fineFlagged;
    delete this.daSegnoFlagged;
    delete this.daCapoFlagged;
    delete this.capo;
    delete this.daCodaFlagged;
    delete this.lookingForCoda;
    delete this.segnoPoint;
    delete this.codaPoint;
};

ABCXJS.midi.Parse.prototype.getAccOffset = function(txtAcc) {
// a partir do nome do acidente, retorna o offset no modelo cromatico
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

ABCXJS.midi.Parse.prototype.setKeySignature = function(elem) {
    this.accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (this.abctune.formatting.bagpipes) {
        elem.accidentals = [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
    }
    if (!elem.accidentals)  return;
    
    window.ABCXJS.parse.each(elem.accidentals, function(acc) {
        var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ? 0 : -1;
        var lowercase = acc.note.toLowerCase();
        var note = this.extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
        this.accidentals[note] += d;
    }, this);

};

ABCXJS.midi.Parse.prototype.extractNote = function(pitch) {
    pitch = pitch % 7;
    return (pitch < 0)? pitch+7 : pitch;
};

ABCXJS.midi.Parse.prototype.extractOctave = function(pitch) {
    return Math.floor(pitch / 7);
};

ABCXJS.midi.Parse.prototype.setSelection = function(tabElem) {
    
    if(! tabElem.bellows) return;
    
    for( var p=0; p < tabElem.pitches.length; p ++ ) {
        
        var pitch = tabElem.pitches[p];
        
        if( pitch.type === 'rest' ) continue;
        
        var button;
        var tabButton = pitch.c === 'scripts.rarrow'? pitch.lastButton : pitch.c;
        
        
        //quando o baixo não está "in Tie", label do botão é uma letra (G, g, etc)
        //de outra forma o label é número do botão (1, 1', 1'', etc)
        if(pitch.bass && pitch.c !== 'scripts.rarrow')
            // quando label é uma letra
            button = this.getBassButton(tabElem.bellows, tabButton);
        else
            // quando label é número do botão
            button = this.getButton(tabButton);
        
        if(button) {
            if(tabElem.bellows === '-') {
                button.setOpen();
            } else {
                button.setClose();
            }
        }
    }
};

ABCXJS.midi.Parse.prototype.getBassButton = function( bellows, b ) {
    if( b === 'x' ||  !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    
    // há uma pequena conversão: na tablatura registramos os acordes menores com "m"
    // no mapeamento da gaita, escrevemos a1:m, por exemplo.
    // então trocar "m" por ":m"
    var nota = kb.parseNote(b.replace( "m", ":m" ), true );
    
    for( var j = kb.keyMap.length; j > kb.keyMap.length - 2; j-- ) {
      for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
          var tecla = kb.keyMap[j-1][i];
          if(bellows === '+') {
            if(tecla.closeNote.key === nota.key  && nota.isMinor === tecla.closeNote.isMinor ) return tecla;
          } else {  
            if(tecla.openNote.key === nota.key && nota.isMinor === tecla.openNote.isMinor ) return tecla;
          }
      }   
    }
    return null;
};

ABCXJS.midi.Parse.prototype.getButton = function( b ) {
    if( b === 'x' || !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Player = function( options ) {
    
    this.reset(options);
   
    this.playableClefs = "TB"; // indica que baixo (B) e melodia (T) serao executadas.
    this.ticksPerInterval = 1;
    
    this.callbackOnStart = null;
    this.callbackOnEnd = null;
    this.callbackOnPlay = null;
    this.callbackOnScroll = null;
    this.callbackOnChangeBar = null;
    
};

ABCXJS.midi.Player.prototype.setPlayableClefs = function(letters) {
    this.playableClefs = letters;
};

ABCXJS.midi.Player.prototype.playClef = function(letter) {
    return this.playableClefs.indexOf( letter.toUpperCase() )>=0;
};

ABCXJS.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.playlist = [];
    this.playInterval = null;
    this.currentAndamento = 1;
    
    this.onError = null;
    this.warnings = [];
    
    this.printer = {};
    this.currentTime = 0;
    this.currentMeasure = 1;
    
    this.currAbsElem = null;   
};

ABCXJS.midi.Player.prototype.addWarning = function(str) {
    this.warnings.push(str);
};

ABCXJS.midi.Player.prototype.getWarnings = function() {
    return this.warnings.length>0?this.warnings:null;    
};

ABCXJS.midi.Player.prototype.defineCallbackOnStart = function( cb ) {
    this.callbackOnStart = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnEnd = function( cb ) {
    this.callbackOnEnd = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnPlay = function( cb ) {
    this.callbackOnPlay = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnScroll = function( cb ) {
    this.callbackOnScroll = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnChangeBar = function( cb ) {
    this.callbackOnChangeBar = cb;
};

ABCXJS.midi.Player.prototype.setAndamento = function(value) {
    var that = this;
    // aceita valores entre 10% e 200% do valor original
    if(value < 10 ) value = 10;
    if(value > 200 ) value = 200;
    
    if( this.playing ) {
        // newAndamento funciona como um flag para a rotina que 
        this.newAndamento = value/100.0; 
    } else {
        try{
            that.currentAndamento = value/100.0; 
            that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
        } catch(e){
        };
    }
};

ABCXJS.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
    if( this.callbackOnEnd ) this.callbackOnEnd(this);
    return this.getWarnings();
};

ABCXJS.midi.Player.prototype.pausePlay = function(nonStop) {
    if(!(false||nonStop)) MIDI.stopAllNotes();
    window.clearInterval(this.playInterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.doResume = function(nonStop) {
    MIDI.stopAllNotes();
    // to be compliant with autoplay-policy-changes #webaudio
    MIDI.resume();
    // não pergunte pq: no IOS tenho que tocar uma nota para garantir que não começe com pausa.
    MIDI.noteOn(0, 40, 1, 0);
    MIDI.noteOff(0, 40, 0.01);
    MIDI.noteOn(1, 40, 1, 0);
    MIDI.noteOff(1, 40, 0.01);
    MIDI.noteOn(2, 40, 1, 0);
    MIDI.noteOff(2, 40, 0.01);
};

ABCXJS.midi.Player.prototype.startPlay = function(what) {

    if(this.playing || !what ) return false;
    
    if(this.currentTime === 0 ) {
        this.doResume();
    }
     
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.type     = null; // definido somente para o modo didatico

    this.playing = true;
    this.onError = null;
  
    var self = this;
    
    //this.doPlay();
    this.playInterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.clearDidacticPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.pausePlay(true);
};

ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value, valueF ) {

    if(this.playing) return false;

    if(this.currentTime === 0 ) {
        this.doResume();
    }
     
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.measures = what.measures;
    this.type     = type;
    
    this.playing  = true;
    this.onError  = null;
    
    var criteria = null;
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            what.printer.clearSelection();
            what.keyboard.clear(true);
            if(!that.playlist[that.i]) return false;
            that.initTime = that.playlist[that.i].time;
            criteria = function () { 
                return that.initTime === that.playlist[that.i].time;
            };
            break;
        case 'goto':   //goto-measure or goto-interval
        case 'repeat': // repeat-measure or repeat-interval
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.endMeasure = parseInt(valueF)? parseInt(valueF): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(that.measures[that.currentMeasure] !== undefined ) {
                //flavio - era assim that.i = that.currentMeasure === 1 ? 0 : that.measures[that.currentMeasure];
                that.i = that.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return (that.initMeasure <= that.currentMeasure) && (that.currentMeasure <= that.endMeasure);
                };
            } else {
               waterbug.log('goto-measure or repeat-measure:  measure \''+value+'\' not found!');
               this.pausePlay(true);
               return;
            }   
            break;
        case 'measure': // play-measure
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(that.measures[that.currentMeasure] !== undefined ) {
                //flavio - era assim that.i = that.currentMeasure === 1 ? 0 : that.measures[that.currentMeasure];
                that.i = that.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return that.initMeasure === that.currentMeasure;
                };
            } else {
               waterbug.log('play-measure: measure \''+value+'\' not found!');
               this.pausePlay(true);
               return false;
            }   
            break;
    }
  
    this.playInterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, this.tempo);
    return true;
};

ABCXJS.midi.Player.prototype.handleBar = function() {
    if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
        this.currentMeasure = this.playlist[this.i].barNumber;
        if( this.callbackOnChangeBar ) {
            this.callbackOnChangeBar(this);
        }
    }    
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }
    
    while (!this.onError && this.playlist[this.i] &&
           (this.playlist[this.i].time*(1/this.currentAndamento)) <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();
    }
    if (!this.onError && this.playlist[this.i]) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.stopPlay();
    }
};

ABCXJS.midi.Player.prototype.doDidacticPlay = function(criteria) {
    var that = this;
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }

    while (!this.onError && this.playlist[this.i] && criteria() &&
    (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();

        if( this.type == 'repeat' ) { // loop until external event
            if(!this.onError && !( this.playlist[this.i] && criteria() ) ) {
                this.currentMeasure = this.initMeasure;
                this.i = this.measures[this.currentMeasure];
                this.currentTime = this.playlist[this.i].time*(1/this.currentAndamento);
                this.currentTime += this.ticksPerInterval;
            }
        }
    }

    if(this.onError) {
        this.stopPlay();
    } else if( this.playlist[this.i] && criteria() ) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.pausePlay(true);
    }
};

ABCXJS.midi.Player.prototype.executa = function(pl) {
    
    var self = this;
    var loudness = 128;
    var delay = 0;
    var aqui;

    try {
        
        if( this.newAndamento ) {
            try{
                this.currentAndamento = this.newAndamento; 
                this.currentTime = this.playlist[this.i].time*(1/this.currentAndamento);
                delete this.newAndamento;
            } catch(e){
            };
        }
        
        if( pl.start ) {
            
            pl.item.pitches.forEach( function( elem ) {
                
                delay = self.calcTempo( elem.delay );
                
                if(  self.playClef( elem.midipitch.clef.charAt(0) ) ) {
                    MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, delay);
                    var k = 2.38, t = k, resto = self.calcTempo( elem.midipitch.mididuration ) - k;

                    // a nota midi dura k segundos (k), então notas mais longas são reiniciadas quantas vezes forem necessárias
                    while( resto > 0 ) {
                        MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch,  t+delay);
                        MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, t+delay);
                        t += k;
                        resto -= k;
                    }
                }
                
                if( !debug && elem.button && elem.button.button && elem.button.button.SVG && elem.button.button.SVG.button !==null) {
                    aqui=1;

                    if(elem.button.closing) {
                        elem.button.button.setClose(delay);
                    }else{
                        elem.button.button.setOpen(delay);
                    }
                    aqui=2;
                    if( self.type !== 'note' ) {
                        
                        var andamento = (1/self.currentAndamento);
                        //limpa o botão uma fração de tempo antes do fim da nota para dar ideia visual de botão pressionado/liberado antes da proxima nota
                        var delta = Math.max(elem.midipitch.mididuration * 0.1, 0.5);
                        
                        elem.button.button.clear( self.calcTempo( (elem.midipitch.mididuration-delta)*andamento ) + delay );
                    }    
                    aqui=3;
               }
                
            });
            
            var ja = '.'; // controla quais elementos absolutos foram marcados para highlight no mesmo item da playlist - evita dupla seleção do mesmo item
            pl.item.abcelems.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                aqui=4;
                self.currAbsElem = elem.abcelem.parent;
                if( self.callbackOnScroll ) {
                    self.callbackOnScroll(self);
                }
                aqui=5;
                if( ja.indexOf('.'+self.currAbsElem.gid+'.') < 0 ) {
                    // absElem ainda não sofreu highlight
                    ja += self.currAbsElem.gid+'.';
                    self.highlight(self.currAbsElem , true, delay);
                }
            });
            
        } else {
            pl.item.pitches.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch, delay);
            });
            var ja = '.'; // controla quais elementos absolutos foram marcados para unhighlight no mesmo item da playlist - evita dupla seleção do mesmo item
            pl.item.abcelems.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                if( ja.indexOf('.'+elem.abcelem.parent+'.') < 0 ) {
                    // absElem ainda não sofreu unhighlight
                    ja += elem.abcelem.parent.gid+'.';
                    self.highlight(elem.abcelem.parent, false, delay);
                }
            });
        }
    } catch( err ) {
        this.onError = { erro: err.message, idx: this.i, item: pl };
        this.addWarning( 'PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '. DebugPoint: ' + aqui );
    }
};

ABCXJS.midi.Player.prototype.calcTempo = function( val ) {
  return  val * this.tempo / 1000;   
};

ABCXJS.midi.Player.prototype.highlight = function( abselem, select, delay ) {
    if(debug || !this.printer ) return;
    var that = this;
    
    if(delay) {
        window.setTimeout(function(){ that.highlight(abselem, select); }, delay*1000);
        return;
    }   
    
    if(select) {
       that.printer.notifySelect(abselem);
    } else {
       that.printer.notifyClear(abselem);
    }
};


ABCXJS.midi.Player.prototype.getTime = function() {
    var pad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    
    var time = 0;
    
    if( this.playlist && this.playlist[this.i] ) {
        time = this.playlist[this.i].time*this.tempo*(1/this.currentAndamento);
    } else {
        this.addWarning( 'PlayList['+this.i+'] não existe. DebugPoint: midi.Player.getTime' );
    }
    
    var secs  = Math.floor(time/1000);
    var ms    = Math.floor((time - secs*1000)/10);
    var mins  = Math.floor(secs/60);
    var secs  = secs - mins*60;
    var cTime  = pad(mins,2) + ':' + pad(secs,2) + '.' + pad(ms,2);
    return {cTime: cTime, time: time };
};
/*!
 * perfect-scrollbar v1.3.0
 * (c) 2017 Hyunje Jun
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PerfectScrollbar = factory());
}(this, (function () { 'use strict';

function get(element) {
  return getComputedStyle(element);
}

function set(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val + "px";
    }
    element.style[key] = val;
  }
  return element;
}

function div(className) {
  var div = document.createElement('div');
  div.className = className;
  return div;
}

var elMatches =
  typeof Element !== 'undefined' &&
  (Element.prototype.matches ||
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.msMatchesSelector);

function matches(element, query) {
  if (!elMatches) {
    throw new Error('No element matching method supported');
  }

  return elMatches.call(element, query);
}

function remove(element) {
  if (element.remove) {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

function queryChildren(element, selector) {
  return Array.prototype.filter.call(element.children, function (child) { return matches(child, selector); }
  );
}

var cls = {
  main: 'ps',
  element: {
    thumb: function (x) { return ("ps__thumb-" + x); },
    rail: function (x) { return ("ps__rail-" + x); },
    consuming: 'ps__child--consume'
  },
  state: {
    focus: 'ps--focus',
    active: function (x) { return ("ps--active-" + x); },
    scrolling: function (x) { return ("ps--scrolling-" + x); }
  }
};

/*
 * Helper methods
 */
var scrollingClassTimeout = { x: null, y: null };

function addScrollingClass(i, x) {
  var classList = i.element.classList;
  var className = cls.state.scrolling(x);

  if (classList.contains(className)) {
    clearTimeout(scrollingClassTimeout[x]);
  } else {
    classList.add(className);
  }
}

function removeScrollingClass(i, x) {
  scrollingClassTimeout[x] = setTimeout(
    function () { return i.isAlive && i.element.classList.remove(cls.state.scrolling(x)); },
    i.settings.scrollingThreshold
  );
}

function setScrollingClassInstantly(i, x) {
  addScrollingClass(i, x);
  removeScrollingClass(i, x);
}

var EventElement = function EventElement(element) {
  this.element = element;
  this.handlers = {};
};

var prototypeAccessors = { isEmpty: { configurable: true } };

EventElement.prototype.bind = function bind (eventName, handler) {
  if (typeof this.handlers[eventName] === 'undefined') {
    this.handlers[eventName] = [];
  }
  this.handlers[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function unbind (eventName, target) {
    var this$1 = this;

  this.handlers[eventName] = this.handlers[eventName].filter(function (handler) {
    if (target && handler !== target) {
      return true;
    }
    this$1.element.removeEventListener(eventName, handler, false);
    return false;
  });
};

EventElement.prototype.unbindAll = function unbindAll () {
    var this$1 = this;

  for (var name in this$1.handlers) {
    this$1.unbind(name);
  }
};

prototypeAccessors.isEmpty.get = function () {
    var this$1 = this;

  return Object.keys(this.handlers).every(
    function (key) { return this$1.handlers[key].length === 0; }
  );
};

Object.defineProperties( EventElement.prototype, prototypeAccessors );

var EventManager = function EventManager() {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function eventElement (element) {
  var ee = this.eventElements.filter(function (ee) { return ee.element === element; })[0];
  if (!ee) {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function bind (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function unbind (element, eventName, handler) {
  var ee = this.eventElement(element);
  ee.unbind(eventName, handler);

  if (ee.isEmpty) {
    // remove
    this.eventElements.splice(this.eventElements.indexOf(ee), 1);
  }
};

EventManager.prototype.unbindAll = function unbindAll () {
  this.eventElements.forEach(function (e) { return e.unbindAll(); });
  this.eventElements = [];
};

EventManager.prototype.once = function once (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (evt) {
    ee.unbind(eventName, onceHandler);
    handler(evt);
  };
  ee.bind(eventName, onceHandler);
};

function createEvent(name) {
  if (typeof window.CustomEvent === 'function') {
    return new CustomEvent(name);
  } else {
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, false, false, undefined);
    return evt;
  }
}

var processScrollDiff = function(
  i,
  axis,
  diff,
  useScrollingClass,
  forceFireReachEvent
) {
  if ( useScrollingClass === void 0 ) useScrollingClass = true;
  if ( forceFireReachEvent === void 0 ) forceFireReachEvent = false;

  var fields;
  if (axis === 'top') {
    fields = [
      'contentHeight',
      'containerHeight',
      'scrollTop',
      'y',
      'up',
      'down' ];
  } else if (axis === 'left') {
    fields = [
      'contentWidth',
      'containerWidth',
      'scrollLeft',
      'x',
      'left',
      'right' ];
  } else {
    throw new Error('A proper axis should be provided');
  }

  processScrollDiff$1(i, diff, fields, useScrollingClass, forceFireReachEvent);
};

function processScrollDiff$1(
  i,
  diff,
  ref,
  useScrollingClass,
  forceFireReachEvent
) {
  var contentHeight = ref[0];
  var containerHeight = ref[1];
  var scrollTop = ref[2];
  var y = ref[3];
  var up = ref[4];
  var down = ref[5];
  if ( useScrollingClass === void 0 ) useScrollingClass = true;
  if ( forceFireReachEvent === void 0 ) forceFireReachEvent = false;

  var element = i.element;

  // reset reach
  i.reach[y] = null;

  // 1 for subpixel rounding
  if (element[scrollTop] < 1) {
    i.reach[y] = 'start';
  }

  // 1 for subpixel rounding
  if (element[scrollTop] > i[contentHeight] - i[containerHeight] - 1) {
    i.reach[y] = 'end';
  }

  if (diff) {
    element.dispatchEvent(createEvent(("ps-scroll-" + y)));

    if (diff < 0) {
      element.dispatchEvent(createEvent(("ps-scroll-" + up)));
    } else if (diff > 0) {
      element.dispatchEvent(createEvent(("ps-scroll-" + down)));
    }

    if (useScrollingClass) {
      setScrollingClassInstantly(i, y);
    }
  }

  if (i.reach[y] && (diff || forceFireReachEvent)) {
    element.dispatchEvent(createEvent(("ps-" + y + "-reach-" + (i.reach[y]))));
  }
}

function toInt(x) {
  return parseInt(x, 10) || 0;
}

function isEditable(el) {
  return (
    matches(el, 'input,[contenteditable]') ||
    matches(el, 'select,[contenteditable]') ||
    matches(el, 'textarea,[contenteditable]') ||
    matches(el, 'button,[contenteditable]')
  );
}

function outerWidth(element) {
  var styles = get(element);
  return (
    toInt(styles.width) +
    toInt(styles.paddingLeft) +
    toInt(styles.paddingRight) +
    toInt(styles.borderLeftWidth) +
    toInt(styles.borderRightWidth)
  );
}

var env = {
  isWebKit:
    typeof document !== 'undefined' &&
    'WebkitAppearance' in document.documentElement.style,
  supportsTouch:
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)),
  supportsIePointer:
    typeof navigator !== 'undefined' && navigator.msMaxTouchPoints,
  isChrome:
    typeof navigator !== 'undefined' &&
    /Chrome/i.test(navigator && navigator.userAgent)
};

var updateGeometry = function(i) {
  var element = i.element;

  i.containerWidth = element.clientWidth;
  i.containerHeight = element.clientHeight;
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  if (!element.contains(i.scrollbarXRail)) {
    // clean up and append
    queryChildren(element, cls.element.rail('x')).forEach(function (el) { return remove(el); }
    );
    element.appendChild(i.scrollbarXRail);
  }
  if (!element.contains(i.scrollbarYRail)) {
    // clean up and append
    queryChildren(element, cls.element.rail('y')).forEach(function (el) { return remove(el); }
    );
    element.appendChild(i.scrollbarYRail);
  }

  if (
    !i.settings.suppressScrollX &&
    i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth
  ) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(
      i,
      toInt(i.railXWidth * i.containerWidth / i.contentWidth)
    );
    i.scrollbarXLeft = toInt(
      (i.negativeScrollAdjustment + element.scrollLeft) *
        (i.railXWidth - i.scrollbarXWidth) /
        (i.contentWidth - i.containerWidth)
    );
  } else {
    i.scrollbarXActive = false;
  }

  if (
    !i.settings.suppressScrollY &&
    i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight
  ) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(
      i,
      toInt(i.railYHeight * i.containerHeight / i.contentHeight)
    );
    i.scrollbarYTop = toInt(
      element.scrollTop *
        (i.railYHeight - i.scrollbarYHeight) /
        (i.contentHeight - i.containerHeight)
    );
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  if (i.scrollbarXActive) {
    element.classList.add(cls.state.active('x'));
  } else {
    element.classList.remove(cls.state.active('x'));
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    element.scrollLeft = 0;
  }
  if (i.scrollbarYActive) {
    element.classList.add(cls.state.active('y'));
  } else {
    element.classList.remove(cls.state.active('y'));
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    element.scrollTop = 0;
  }
};

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = { width: i.railXWidth };
  if (i.isRtl) {
    xRailOffset.left =
      i.negativeScrollAdjustment +
      element.scrollLeft +
      i.containerWidth -
      i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + element.scrollTop;
  }
  set(i.scrollbarXRail, xRailOffset);

  var yRailOffset = { top: element.scrollTop, height: i.railYHeight };
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right =
        i.contentWidth -
        (i.negativeScrollAdjustment + element.scrollLeft) -
        i.scrollbarYRight -
        i.scrollbarYOuterWidth;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left =
        i.negativeScrollAdjustment +
        element.scrollLeft +
        i.containerWidth * 2 -
        i.contentWidth -
        i.scrollbarYLeft -
        i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  set(i.scrollbarYRail, yRailOffset);

  set(i.scrollbarX, {
    left: i.scrollbarXLeft,
    width: i.scrollbarXWidth - i.railBorderXWidth
  });
  set(i.scrollbarY, {
    top: i.scrollbarYTop,
    height: i.scrollbarYHeight - i.railBorderYWidth
  });
}

var clickRail = function(i) {
  i.event.bind(i.scrollbarY, 'click', function (e) { e.preventDefault(); return e.stopPropagation();  });
  i.event.bind(i.scrollbarYRail, 'click', function (e) { e.preventDefault(); return e.stopPropagation();  });
  i.event.bind(i.scrollbarY, 'mousedown', function (e) { e.preventDefault(); return e.stopPropagation();  });
  i.event.bind(i.scrollbarYRail, 'mousedown', function (e) {
    var positionTop =
      e.pageY -
      window.pageYOffset -
      i.scrollbarYRail.getBoundingClientRect().top;
    var direction = positionTop > i.scrollbarYTop ? 1 : -1;

    i.element.scrollTop += direction * i.containerHeight;
    updateGeometry(i);

    e.preventDefault();
    e.stopPropagation();
  });

  i.event.bind(i.scrollbarX, 'mousedown', function (e) { e.preventDefault(); return e.stopPropagation(); });
  i.event.bind(i.scrollbarXRail, 'mousedown', function (e) {
    var positionLeft =
      e.pageX -
      window.pageXOffset -
      i.scrollbarXRail.getBoundingClientRect().left;
    var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;

    i.element.scrollLeft += direction * i.containerWidth;
    updateGeometry(i);

    e.preventDefault();
    e.stopPropagation();
  });
};

var dragThumb = function(i) {
  bindMouseScrollHandler(i, [
    'containerWidth',
    'contentWidth',
    'pageX',
    'railXWidth',
    'scrollbarX',
    'scrollbarXWidth',
    'scrollLeft',
    'x' ]);
  bindMouseScrollHandler(i, [
    'containerHeight',
    'contentHeight',
    'pageY',
    'railYHeight',
    'scrollbarY',
    'scrollbarYHeight',
    'scrollTop',
    'y' ]);
};

function bindMouseScrollHandler(
  i,
  ref
) {
  var containerHeight = ref[0];
  var contentHeight = ref[1];
  var pageY = ref[2];
  var railYHeight = ref[3];
  var scrollbarY = ref[4];
  var scrollbarYHeight = ref[5];
  var scrollTop = ref[6];
  var y = ref[7];

  var element = i.element;

  var startingScrollTop = null;
  var startingMousePageY = null;
  var scrollBy = null;

  function mouseMoveHandler(e) {
    element[scrollTop] =
      startingScrollTop + scrollBy * (e[pageY] - startingMousePageY);
    addScrollingClass(i, y);
    updateGeometry(i);

    e.stopPropagation();
    e.preventDefault();
  }

  function mouseUpHandler(e) {
    removeScrollingClass(i, y);
    e.stopPropagation();
    e.preventDefault();
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  }

  i.event.bind(i[scrollbarY], 'mousedown', function (e) {
    startingScrollTop = element[scrollTop];
    startingMousePageY = e[pageY];
    scrollBy =
      (i[contentHeight] - i[containerHeight]) /
      (i[railYHeight] - i[scrollbarYHeight]);

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

var keyboard = function(i) {
  var element = i.element;

  var elementHovered = function () { return matches(element, ':hover'); };
  var scrollbarFocused = function () { return matches(i.scrollbarX, ':focus') || matches(i.scrollbarY, ':focus'); };

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if (
        (scrollTop === 0 && deltaY > 0) ||
        (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)
      ) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if (
        (scrollLeft === 0 && deltaX < 0) ||
        (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)
      ) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if (
      (e.isDefaultPrevented && e.isDefaultPrevented()) ||
      e.defaultPrevented
    ) {
      return;
    }

    if (!elementHovered() && !scrollbarFocused()) {
      return;
    }

    var activeElement = document.activeElement
      ? document.activeElement
      : i.ownerDocument.activeElement;
    if (activeElement) {
      if (activeElement.tagName === 'IFRAME') {
        activeElement = activeElement.contentDocument.activeElement;
      } else {
        // go deeper if element is a webcomponent
        while (activeElement.shadowRoot) {
          activeElement = activeElement.shadowRoot.activeElement;
        }
      }
      if (isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
      case 37: // left
        if (e.metaKey) {
          deltaX = -i.contentWidth;
        } else if (e.altKey) {
          deltaX = -i.containerWidth;
        } else {
          deltaX = -30;
        }
        break;
      case 38: // up
        if (e.metaKey) {
          deltaY = i.contentHeight;
        } else if (e.altKey) {
          deltaY = i.containerHeight;
        } else {
          deltaY = 30;
        }
        break;
      case 39: // right
        if (e.metaKey) {
          deltaX = i.contentWidth;
        } else if (e.altKey) {
          deltaX = i.containerWidth;
        } else {
          deltaX = 30;
        }
        break;
      case 40: // down
        if (e.metaKey) {
          deltaY = -i.contentHeight;
        } else if (e.altKey) {
          deltaY = -i.containerHeight;
        } else {
          deltaY = -30;
        }
        break;
      case 32: // space bar
        if (e.shiftKey) {
          deltaY = i.containerHeight;
        } else {
          deltaY = -i.containerHeight;
        }
        break;
      case 33: // page up
        deltaY = i.containerHeight;
        break;
      case 34: // page down
        deltaY = -i.containerHeight;
        break;
      case 36: // home
        deltaY = i.contentHeight;
        break;
      case 35: // end
        deltaY = -i.contentHeight;
        break;
      default:
        return;
    }

    if (i.settings.suppressScrollX && deltaX !== 0) {
      return;
    }
    if (i.settings.suppressScrollY && deltaY !== 0) {
      return;
    }

    element.scrollTop -= deltaY;
    element.scrollLeft += deltaX;
    updateGeometry(i);

    if (shouldPreventDefault(deltaX, deltaY)) {
      e.preventDefault();
    }
  });
};

var wheel = function(i) {
  var element = i.element;

  function shouldPreventDefault(deltaX, deltaY) {
    var isTop = element.scrollTop === 0;
    var isBottom =
      element.scrollTop + element.offsetHeight === element.scrollHeight;
    var isLeft = element.scrollLeft === 0;
    var isRight =
      element.scrollLeft + element.offsetWidth === element.offsetWidth;

    var hitsBound;

    // pick axis with primary direction
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      hitsBound = isTop || isBottom;
    } else {
      hitsBound = isLeft || isRight;
    }

    return hitsBound ? !i.settings.wheelPropagation : true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === 'undefined' || typeof deltaY === 'undefined') {
      // OS X Safari
      deltaX = -1 * e.wheelDeltaX / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY /* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    if (e.shiftKey) {
      // reverse axis with shift key
      return [-deltaY, -deltaX];
    }
    return [deltaX, deltaY];
  }

  function shouldBeConsumedByChild(target, deltaX, deltaY) {
    // FIXME: this is a workaround for <select> issue in FF and IE #571
    if (!env.isWebKit && element.querySelector('select:focus')) {
      return true;
    }

    if (!element.contains(target)) {
      return false;
    }

    var cursor = target;

    while (cursor && cursor !== element) {
      if (cursor.classList.contains(cls.element.consuming)) {
        return true;
      }

      var style = get(cursor);
      var overflow = [style.overflow, style.overflowX, style.overflowY].join(
        ''
      );

      // if scrollable
      if (overflow.match(/(scroll|auto)/)) {
        var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
        if (maxScrollTop > 0) {
          if (
            !(cursor.scrollTop === 0 && deltaY > 0) &&
            !(cursor.scrollTop === maxScrollTop && deltaY < 0)
          ) {
            return true;
          }
        }
        var maxScrollLeft = cursor.scrollLeft - cursor.clientWidth;
        if (maxScrollLeft > 0) {
          if (
            !(cursor.scrollLeft === 0 && deltaX < 0) &&
            !(cursor.scrollLeft === maxScrollLeft && deltaX > 0)
          ) {
            return true;
          }
        }
      }

      cursor = cursor.parentNode;
    }

    return false;
  }

  function mousewheelHandler(e) {
    var ref = getDeltaFromEvent(e);
    var deltaX = ref[0];
    var deltaY = ref[1];

    if (shouldBeConsumedByChild(e.target, deltaX, deltaY)) {
      return;
    }

    var shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      element.scrollTop -= deltaY * i.settings.wheelSpeed;
      element.scrollLeft += deltaX * i.settings.wheelSpeed;
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        element.scrollTop -= deltaY * i.settings.wheelSpeed;
      } else {
        element.scrollTop += deltaX * i.settings.wheelSpeed;
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        element.scrollLeft += deltaX * i.settings.wheelSpeed;
      } else {
        element.scrollLeft -= deltaY * i.settings.wheelSpeed;
      }
      shouldPrevent = true;
    }
    
    updateGeometry(i);

    shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent && !e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== 'undefined') {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== 'undefined') {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
};

var touch = function(i) {
  if (!env.supportsTouch && !env.supportsIePointer) {
    return;
  }

  var element = i.element;

  function shouldPrevent(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (
        (deltaY < 0 && scrollTop === i.contentHeight - i.containerHeight) ||
        (deltaY > 0 && scrollTop === 0)
      ) {
        // set prevent for mobile Chrome refresh
        return window.scrollY === 0 && deltaY > 0 && env.isChrome;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (
        (deltaX < 0 && scrollLeft === i.contentWidth - i.containerWidth) ||
        (deltaX > 0 && scrollLeft === 0)
      ) {
        return true;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    element.scrollTop -= differenceY;
    element.scrollLeft -= differenceX;

    updateGeometry(i);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }

  function shouldHandle(e) {
    if (e.pointerType && e.pointerType === 'pen' && e.buttons === 0) {
      return false;
    }
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (
      e.pointerType &&
      e.pointerType !== 'mouse' &&
      e.pointerType !== e.MSPOINTER_TYPE_MOUSE
    ) {
      return true;
    }
    return false;
  }

  function touchStart(e) {
    if (!shouldHandle(e)) {
      return;
    }

    var touch = getTouch(e);

    startOffset.pageX = touch.pageX;
    startOffset.pageY = touch.pageY;

    startTime = new Date().getTime();

    if (easingLoop !== null) {
      clearInterval(easingLoop);
    }
  }

  function shouldBeConsumedByChild(target, deltaX, deltaY) {
    if (!element.contains(target)) {
      return false;
    }

    var cursor = target;

    while (cursor && cursor !== element) {
      if (cursor.classList.contains(cls.element.consuming)) {
        return true;
      }

      var style = get(cursor);
      var overflow = [style.overflow, style.overflowX, style.overflowY].join(
        ''
      );

      // if scrollable
      if (overflow.match(/(scroll|auto)/)) {
        var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
        if (maxScrollTop > 0) {
          if (
            !(cursor.scrollTop === 0 && deltaY > 0) &&
            !(cursor.scrollTop === maxScrollTop && deltaY < 0)
          ) {
            return true;
          }
        }
        var maxScrollLeft = cursor.scrollLeft - cursor.clientWidth;
        if (maxScrollLeft > 0) {
          if (
            !(cursor.scrollLeft === 0 && deltaX < 0) &&
            !(cursor.scrollLeft === maxScrollLeft && deltaX > 0)
          ) {
            return true;
          }
        }
      }

      cursor = cursor.parentNode;
    }

    return false;
  }

  function touchMove(e) {
    if (shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = { pageX: touch.pageX, pageY: touch.pageY };

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      if (shouldBeConsumedByChild(e.target, differenceX, differenceY)) {
        return;
      }

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = new Date().getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPrevent(differenceX, differenceY)) {
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (i.settings.swipeEasing) {
      clearInterval(easingLoop);
      easingLoop = setInterval(function() {
        if (i.isInitialized) {
          clearInterval(easingLoop);
          return;
        }

        if (!speed.x && !speed.y) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (env.supportsTouch) {
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  } else if (env.supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
};

var defaultSettings = function () { return ({
  handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollingThreshold: 1000,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  suppressScrollX: false,
  suppressScrollY: false,
  swipeEasing: true,
  useBothWheelAxes: false,
  wheelPropagation: false,
  wheelSpeed: 1
}); };

var handlers = {
  'click-rail': clickRail,
  'drag-thumb': dragThumb,
  keyboard: keyboard,
  wheel: wheel,
  touch: touch
};

var PerfectScrollbar = function PerfectScrollbar(element, userSettings) {
  var this$1 = this;
  if ( userSettings === void 0 ) userSettings = {};

  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  if (!element || !element.nodeName) {
    throw new Error('no element is specified to initialize PerfectScrollbar');
  }

  this.element = element;

  element.classList.add(cls.main);

  this.settings = defaultSettings();
  for (var key in userSettings) {
    this$1.settings[key] = userSettings[key];
  }

  this.containerWidth = null;
  this.containerHeight = null;
  this.contentWidth = null;
  this.contentHeight = null;

  var focus = function () { return element.classList.add(cls.state.focus); };
  var blur = function () { return element.classList.remove(cls.state.focus); };

  this.isRtl = get(element).direction === 'rtl';
  this.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  this.negativeScrollAdjustment = this.isNegativeScroll
    ? element.scrollWidth - element.clientWidth
    : 0;
  this.event = new EventManager();
  this.ownerDocument = element.ownerDocument || document;

  this.scrollbarXRail = div(cls.element.rail('x'));
  element.appendChild(this.scrollbarXRail);
  
  if( this.settings["margin"] ) {
      this.scrollbarXRail.style.margin = this.settings["margin"];
  }
  
  this.scrollbarX = div(cls.element.thumb('x'));
  this.scrollbarXRail.appendChild(this.scrollbarX);
  this.scrollbarX.setAttribute('tabindex', 0);
  this.event.bind(this.scrollbarX, 'focus', focus);
  this.event.bind(this.scrollbarX, 'blur', blur);
  this.scrollbarXActive = null;
  this.scrollbarXWidth = null;
  this.scrollbarXLeft = null;
  var railXStyle = get(this.scrollbarXRail);
  this.scrollbarXBottom = parseInt(railXStyle.bottom, 10);
  if (isNaN(this.scrollbarXBottom)) {
    this.isScrollbarXUsingBottom = false;
    this.scrollbarXTop = toInt(railXStyle.top);
  } else {
    this.isScrollbarXUsingBottom = true;
  }
  this.railBorderXWidth =
    toInt(railXStyle.borderLeftWidth) + toInt(railXStyle.borderRightWidth);
  // Set rail to display:block to calculate margins
  set(this.scrollbarXRail, { display: 'block' });
  this.railXMarginWidth =
    toInt(railXStyle.marginLeft) + toInt(railXStyle.marginRight);
  set(this.scrollbarXRail, { display: '' });
  this.railXWidth = null;
  this.railXRatio = null;

  this.scrollbarYRail = div(cls.element.rail('y'));
  element.appendChild(this.scrollbarYRail);
  
  if( this.settings["margin"] ) {
      this.scrollbarYRail.style.margin = this.settings["margin"];
  }
  
  this.scrollbarY = div(cls.element.thumb('y'));
  this.scrollbarYRail.appendChild(this.scrollbarY);
  this.scrollbarY.setAttribute('tabindex', 0);
  this.event.bind(this.scrollbarY, 'focus', focus);
  this.event.bind(this.scrollbarY, 'blur', blur);
  this.scrollbarYActive = null;
  this.scrollbarYHeight = null;
  this.scrollbarYTop = null;
  var railYStyle = get(this.scrollbarYRail);
  this.scrollbarYRight = parseInt(railYStyle.right, 10);
  if (isNaN(this.scrollbarYRight)) {
    this.isScrollbarYUsingRight = false;
    this.scrollbarYLeft = toInt(railYStyle.left);
  } else {
    this.isScrollbarYUsingRight = true;
  }
  this.scrollbarYOuterWidth = this.isRtl ? outerWidth(this.scrollbarY) : null;
  this.railBorderYWidth =
    toInt(railYStyle.borderTopWidth) + toInt(railYStyle.borderBottomWidth);
  set(this.scrollbarYRail, { display: 'block' });
  this.railYMarginHeight =
    toInt(railYStyle.marginTop) + toInt(railYStyle.marginBottom);
  set(this.scrollbarYRail, { display: '' });
  this.railYHeight = null;
  this.railYRatio = null;

  this.reach = {
    x:
      element.scrollLeft <= 0
        ? 'start'
        : element.scrollLeft >= this.contentWidth - this.containerWidth
          ? 'end'
          : null,
    y:
      element.scrollTop <= 0
        ? 'start'
        : element.scrollTop >= this.contentHeight - this.containerHeight
          ? 'end'
          : null
  };

  this.isAlive = true;

  this.settings.handlers.forEach(function (handlerName) { return handlers[handlerName](this$1); });

  this.lastScrollTop = element.scrollTop; // for onScroll only
  this.lastScrollLeft = element.scrollLeft; // for onScroll only
  this.event.bind(this.element, 'scroll', function (e) { return this$1.onScroll(e); });
  updateGeometry(this);
};

PerfectScrollbar.prototype.hideX = function  () {
    this.element.classList.remove(cls.state.active('x'));
};
PerfectScrollbar.prototype.showX = function  () {
    this.element.classList.add(cls.state.active('x'));
};

PerfectScrollbar.prototype.hideY = function  () {
    this.element.classList.remove(cls.state.active('y'));
};
PerfectScrollbar.prototype.showY = function  () {
    this.element.classList.add(cls.state.active('y'));
};

PerfectScrollbar.prototype.update = function  () {
  if (!this.isAlive /*|| this.settings['aceOn']*/ ) {
    return;
  }

  // Recalcuate negative scrollLeft adjustment
  this.negativeScrollAdjustment = this.isNegativeScroll
    ? this.element.scrollWidth - this.element.clientWidth
    : 0;

  // Recalculate rail margins
  set(this.scrollbarXRail, { display: 'block' });
  set(this.scrollbarYRail, { display: 'block' });
  this.railXMarginWidth =
    toInt(get(this.scrollbarXRail).marginLeft) +
    toInt(get(this.scrollbarXRail).marginRight);
  this.railYMarginHeight =
    toInt(get(this.scrollbarYRail).marginTop) +
    toInt(get(this.scrollbarYRail).marginBottom);

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  set(this.scrollbarXRail, { display: 'none' });
  set(this.scrollbarYRail, { display: 'none' });

  updateGeometry(this);

  processScrollDiff(this, 'top', 0, false, true);
  processScrollDiff(this, 'left', 0, false, true);

  set(this.scrollbarXRail, { display: '' });
  set(this.scrollbarYRail, { display: '' });
};

PerfectScrollbar.prototype.onScroll = function onScroll (e) {
  if (!this.isAlive ) {
    return;
  }
  
  updateGeometry(this);
  processScrollDiff(this, 'top', this.element.scrollTop - this.lastScrollTop);
  processScrollDiff(
    this,
    'left',
    this.element.scrollLeft - this.lastScrollLeft
  );

  this.lastScrollTop = this.element.scrollTop;
  this.lastScrollLeft = this.element.scrollLeft;
};

PerfectScrollbar.prototype.destroy = function destroy () {
  if (!this.isAlive) {
    return;
  }

  this.event.unbindAll();
  remove(this.scrollbarX);
  remove(this.scrollbarY);
  remove(this.scrollbarXRail);
  remove(this.scrollbarYRail);
  this.removePsClasses();

  // unset elements
  this.element = null;
  this.scrollbarX = null;
  this.scrollbarY = null;
  this.scrollbarXRail = null;
  this.scrollbarYRail = null;

  this.isAlive = false;
};

PerfectScrollbar.prototype.removePsClasses = function removePsClasses () {
  this.element.className = this.element.className
    .split(' ')
    .filter(function (name) { return !name.match(/^ps([-_].+|)$/); })
    .join(' ');
};

return PerfectScrollbar;

})));
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
  * Implements: 
*   - DRAGGABLE.ui.Window
*   - DRAGGABLE.ui.PushButton
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Window = function( parent, aButtons, options, callback, aToolBarButtons ) {
    
    var self = this;
    var opts = options || {};

    this.id = ++ DRAGGABLE.ui.windowId;
    
    this.title = opts.title || '';
    this.top = opts.top || 0;
    this.left = opts.left || 0;
    this.width = opts.width || '';
    this.height = opts.height || '';
    this.minWidth = opts.minWidth ||  160;
    this.minHeight = opts.minHeight ||  (24+(aToolBarButtons?76:0));
    this.hasStatusBar = opts.statusbar || false;
    this.alternativeResize = opts.alternativeResize || false;
    this.translator = opts.translator || null;
    this.zIndex  = opts.zIndex? opts.zIndex : 100;
    this.draggable = typeof opts.draggable !== 'undefined' ? opts.draggable : true;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" + (this.draggable? "" : " noShadow") ); 
    this.topDiv = div;
    
    this.topDiv.style.zIndex = this.zIndex;
    
    if(!parent) {
        document.body.appendChild(this.topDiv);
    } else {
        if(typeof parent === 'string') {
            this.parent = document.getElementById(parent);
        } else {
            this.parent = parent;
        }
        this.parent.appendChild(this.topDiv);
    }
    
    if( ! this.draggable ) {
        this.topDiv.style.position = "relative";
        this.topDiv.style.margin = "1px";
    } else {
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1;
        this.minLeft = 1;
    }
    
    if(callback) {
        this.defineCallback(callback);
    }
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = this.top;
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = this.left;
    if(this.topDiv.style.height === "" ) this.topDiv.style.height = this.height;
    if(this.topDiv.style.width === "" ) this.topDiv.style.width = this.width;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu gradiente" ); 
    this.topDiv.appendChild( div );
    this.menuDiv = div;

    if( aToolBarButtons ) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "dToolBar" +  this.id ); 
        div.setAttribute("class", "draggableToolBar" ); 
        this.topDiv.appendChild( div );
        this.toolBar = div;
    }
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    if(this.alternativeResize) {
        this.hasStatusBar = false;
        this.topDiv.style.overflow = 'visible';
        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableAlternativeResize" ); 
        this.topDiv.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/corner_resize.gif">';

    } else if( this.hasStatusBar ) {
        
        this.dataDiv.setAttribute("class", "draggableData withStatusBar" ); ;
        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatus" + this.id ); 
        div.setAttribute("class", "draggableStatus" ); 
        this.topDiv.appendChild( div );
        this.bottomBar = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusMsgLine" + this.id ); 
        div.setAttribute("class", "draggableStatusMsgLine" ); 
        this.bottomBar.appendChild( div );
        this.messageLine = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableStatusResize" ); 
        this.bottomBar.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
    }
    
    this.calcMinHeight = function () {
        this.minHeight = (this.menuDiv ? this.menuDiv.clientHeight : 0 ) 
           + (this.toolBar && this.toolBar.style.display !== 'none' ? this.toolBar.clientHeight : 0 ) 
           + (this.bottomBar && this.bottomBar.style.display !== 'none' ? this.bottomBar.clientHeight+3 : 0 );
    };
    
    if( this.alternativeResize || this.hasStatusBar ) {

        this.divResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            var touches = e.changedTouches;
            var p = {x: e.clientX, y: e.clientY};

            if (touches) {
                var l = touches.length - 1;
                p.x = touches[l].clientX;
                p.y = touches[l].clientY;
            }
            e.preventDefault();
            
            self.calcMinHeight();
            
            var w = (self.topDiv.clientWidth + p.x - self.x);
            var h = (self.topDiv.clientHeight + p.y - self.y);
            self.topDiv.style.width = ( w < self.minWidth ? self.minWidth : w ) + 'px';
            self.topDiv.style.height = ( h < self.minHeight ? self.minHeight : h ) + 'px';

            self.x = p.x;
            self.y = p.y;
            self.eventsCentral('RESIZE');
        };

        this.mouseEndResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            window.removeEventListener('mouseup', self.mouseEndResize, false);
            window.removeEventListener('touchend', self.mouseEndResize, false);
            window.removeEventListener('touchmove', self.divResize, false);
            window.removeEventListener('touchleave', self.divResize, false);
            window.removeEventListener('mousemove', self.divResize, false);
            window.removeEventListener('mouseout', self.divResize, false);
            self.dataDiv.style.pointerEvents = "auto";
            self.eventsCentral('RESIZE');
        };

        this.mouseResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.dataDiv.style.pointerEvents = "none";
            window.addEventListener('mouseup', self.mouseEndResize, false);
            window.addEventListener('touchend', self.mouseEndResize, false);
            window.addEventListener('touchmove', self.divResize, false);
            window.addEventListener('touchleave', self.divResize, false);
            window.addEventListener('mousemove', self.divResize, false);
            window.addEventListener('mouseout', self.divResize, false);
            self.x = e.clientX;
            self.y = e.clientY;
        };

        this.resizeCorner.addEventListener( 'mouseover', function() { self.resizeCorner.style.cursor='nwse-resize'; }, false);
        this.resizeCorner.addEventListener( 'mousedown', this.mouseResize, false);
        this.resizeCorner.addEventListener('touchstart', this.mouseResize, false);
    }
    
    this.divMove = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var touches = e.changedTouches;
        var p = {x: e.clientX, y: e.clientY};

        if (touches) {
            var l = touches.length - 1;
            p.x = touches[l].clientX;
            p.y = touches[l].clientY;
        }
        e.preventDefault();
        var y = ((p.y - self.y) + parseInt(self.topDiv.style.top));
        var x = ((p.x - self.x) + parseInt(self.topDiv.style.left));
        self.topDiv.style.top = (self.minTop && y < self.minTop ? self.minTop: y) + "px"; //hardcoded top of window
        self.topDiv.style.left = (self.minLeft && x < self.minLeft ? self.minLeft: x) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseEndMove = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('mouseup', self.mouseEndMove, false);
        window.removeEventListener('touchend', self.mouseEndMove, false);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('touchleave', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        self.eventsCentral('MOVE');
    };
    
    this.mouseMove = function (e) {
//        e.preventDefault();
//        e.stopPropagation();
//        if(!self.draggable) return;

        if(!self.draggable) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
       
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('mouseup', self.mouseEndMove, false);
        window.addEventListener('touchend', self.mouseEndMove, false);
        window.addEventListener('touchmove', self.divMove, false);
        window.addEventListener('touchleave', self.divMove, false);
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.clientX;
        self.y = e.clientY;
    };

    this.close = function(e) {
        self.topDiv.style.display='none';
    };
    
    this.focus = function(e) {
        if(self.draggable)
            self.topDiv.style.zIndex = self.zIndex+1000;
        //waterbug.log(self.topDiv.id + ' ' + self.topDiv.style.zIndex);
        //waterbug.show();
    };
    
    this.blur = function(e) {
        self.topDiv.style.zIndex = self.zIndex;
        //waterbug.log(self.topDiv.id + ' ' + self.topDiv.style.zIndex);
        //waterbug.show();
    };
    
    this.addButtons( this.id, aButtons );
    this.addToolButtons( this.id, aToolBarButtons );
    this.addTitle( this.id, this.title );
    
    this.topDiv.tabIndex = this.id;

    this.topDiv.addEventListener( 'focus', function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.focus();
    }, false );
    
    this.topDiv.addEventListener( 'blur', function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.blur();
    }, false );
    
};

DRAGGABLE.ui.Window.prototype.formatStyleParam = function ( p ) {
    p = (isNaN(p)===false) ? ''+p : p;
    return (p === ''+parseInt(p)? p + 'px' : p );
};

DRAGGABLE.ui.Window.prototype.move = function( left, top ) {
    this.topDiv.style.left = this.formatStyleParam( left );
    this.topDiv.style.top = this.formatStyleParam( top );
};

DRAGGABLE.ui.Window.prototype.setSize = function( width, height ) {
    this.topDiv.style.width = this.formatStyleParam( width ); 
    this.topDiv.style.height = this.formatStyleParam( height ); 
};


DRAGGABLE.ui.Window.prototype.setVisible = function( visible ) {
    this.topDiv.style.display=(visible? 'block':'none');
    (visible) && this.focus();

};

DRAGGABLE.ui.Window.prototype.setToolBarVisible = function (visible) {
    if( this.toolBar ) {
        this.toolBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setStatusBarVisible = function (visible) {
    if( this.bottomBar ) {
        this.bottomBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setStatusMessage = function (msg) {
    if(this.messageLine)
        this.messageLine.innerHTML = msg;
};        

DRAGGABLE.ui.Window.prototype.setButtonVisible = function( action, visible ) {
    var b = this.actionList[action.toUpperCase()];
    if( b ) {
        b.style.display = visible? '' : 'none';
    }
};

DRAGGABLE.ui.Window.prototype.setFloating = function (floating) {
    this.draggable = floating;
    
    if( this.draggable ) {
        if( this.alternativeResize )
            this.resizeCorner.style.display = 'block';
        
        this.topDiv.className = "draggableWindow";
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1; // ver isso
        this.minLeft = 1; // ver isso
        this.focus();
    } else {
        if( this.alternativeResize )
            this.resizeCorner.style.display='none';
        
        this.topDiv.className = "draggableWindow noShadow";
        this.topDiv.style.position = "relative";
        this.topDiv.style.margin = "1px";
        this.blur();
    }
};

DRAGGABLE.ui.Window.prototype.resize = function() {
    this.calcMinHeight();
    this.dataDiv.style.height =  (this.topDiv.clientHeight - this.minHeight) + 'px';
};

DRAGGABLE.ui.Window.prototype.defineCallback = function( cb ) {
    this.callback = cb;
};

DRAGGABLE.ui.Window.prototype.eventsCentral = function (action, elem) {
    if (this.callback) {
        this.callback.listener[this.callback.method]( action, elem);
    } else {
        if (action === 'CLOSE') {
            this.close();
        }
    }
};

DRAGGABLE.ui.Window.prototype.setTitle = function( title, translator ) {
    var translated_title = "";
    if( translator && title !== "" ) {
        translated_title = translator.getResource(title);
        this.titleSpan.setAttribute('data-translate', title);
    } else {
        this.titleSpan.removeAttribute('data-translate');
        translated_title = (title? title : translated_title);
    }
    this.titleSpan.innerHTML = translated_title;
};

DRAGGABLE.ui.Window.prototype.setSubTitle = function( title, translator ) {
    var translated_title = "";
    if( translator && title !== "" ) {
        var t = translator.getResource(title);
        translated_title = (t? '- ' + t : translated_title); 
        this.subTitleSpan.setAttribute('data-translate', title);
    } else {
        this.subTitleSpan.removeAttribute('data-translate');
        translated_title = (title? title : translated_title);
    }
    this.subTitleSpan.innerHTML = translated_title;
};

DRAGGABLE.ui.Window.prototype.addTitle = function( id, title  ) {
    var self = this, translated_title, spn = "";
    
    var div = document.createElement("DIV");
    div.setAttribute("class", "dTitle" ); 
    
    if( title && this.translator ) {
        translated_title = this.translator.getResource(title);
        spn = 'data-translate="'+title+'"';
    }
    
    div.innerHTML = '<span id="dSpanTitle'+id+'" '+spn+' style="padding-left: 6px; float:left; white-space: nowrap;">'+(translated_title?translated_title:title)+'</span>'+
                        '<span id="dSpanSubTitle'+id+'" style="padding-left: 6px; float:left; white-space: nowrap;"></span>';
    
    self.menuDiv.appendChild(div);
    
    self.titleSpan = document.getElementById("dSpanTitle"+id);
    self.subTitleSpan = document.getElementById("dSpanSubTitle"+id);
    
    if(self.draggable && self.menuDiv) {
        self.menuDiv.addEventListener( 'mouseover', function() { self.menuDiv.style.cursor='move'; }, false);
    }
    self.menuDiv.addEventListener( 'mousedown', self.mouseMove, false);
    self.menuDiv.addEventListener('touchstart', self.mouseMove, false);
    
};

DRAGGABLE.ui.Window.prototype.addButtons = function( id,  aButtons ) {
    var defaultButtons = ['close'];
    var self = this;
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'world', ZOOM:'zoom-in', HELP:'circle-question', 
                        POPIN: 'popin', POPOUT: 'popout', RESTORE:'restore', MAXIMIZE:'full-screen', APPLY:'tick', PRINT:'printer'  };
    
    if(aButtons)
        defaultButtons = defaultButtons.concat(aButtons);
    
    defaultButtons.forEach( function (label) {
        
        label = label.split('|');
        
        var spn = "";
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var ico = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
        var translateId = label.length > 1 ? label[1] : label[0];
        
        if( self.translator ) {
            rotulo = self.translator.getResource(translateId);
            spn = 'data-translate="'+translateId+'"';
        }
        
        var html = '<i class="'+ ico +' ico-white" title="'+ rotulo +'" '+spn+' ></i>';
        
        var div = document.createElement("DIV");
        div.setAttribute("id", 'd'+ action +'Button'+id ); 
        div.setAttribute("class", "dButton" ); 
        div.innerHTML = action === 'MOVE' ? html : '<a href="">'+html+'</a>' ;
        
        self.addAction( action, div, self );
        self.menuDiv.appendChild(div);
        
    });
};

DRAGGABLE.ui.Window.prototype.addAction = function( action, div, self ) {
        
    if(! this.actionList ) {
        this.actionList = {};
    }
    
    this.actionList[action] = div; // salva a lista de acões 
    
    if( action === 'MOVE' ) return; // apenas registra na lista de ações 
    
    var f = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        self.eventsCentral(action, div);
    };
    
    div.addEventListener( 'click', f, false);
    div.addEventListener( 'touchstart', f, false);
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
};

DRAGGABLE.ui.Window.prototype.dispatchAction = function( action ) {
    this.eventsCentral(action, this.actionList[action] );
};

DRAGGABLE.ui.Window.prototype.addToolButtons = function( id,  aButtons ) {
    if(!aButtons) return;
    var self = this;
    
    var buttonMap = { 
        GUTTER:'list-numbered', REFRESH:'bolt', DOWNLOAD:'download', FONTSIZE: 'fontsize', 
        DROPDOWN:'open-down', OCTAVEDOWN:'octave-down', OCTAVEUP:'octave-up', 
        FINDNREPLACE:'find-and-replace', 
        UNDO:'undo', UNDOALL:'undo-all', REDO:'redo', REDOALL:'redo-all', LIGHTON:'lightbulb-on', READONLY:'lock-open' };
    
    aButtons.forEach( function (label) {
        
        label = label.split('|');
        
        var spn = "";
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var translateId = label.length > 1 ? label[1] : label[0];
        
        
        if( self.translator ) {
            rotulo = self.translator.getResource(translateId);
            spn = 'data-translate="'+translateId+'"';
        }
        
        var div = document.createElement("DIV");
        div.id =  'd'+ action +'Button'+id ; 
        self.toolBar.appendChild(div);
        
        if( action === 'DROPDOWN' ) {
            // flavio - verificar as implicações de não usar tradução aqui
            div.className = "dButton topMenu";
            
            if( typeof self.menu === "undefined" ) {
                self.menu = {};
            }
                    
            var ddmId = label[1];
            self.menu[ddmId] = new DRAGGABLE.ui.DropdownMenu(
                 div
                ,self.callback
                ,[{title: '...', ddmId: ddmId, tip: rotulo, itens: []}]
            );
    
        } else {
            
            var icon = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
            
            div.className = "dButton";
            div.innerHTML = '<a href="" ><i class="'+ icon +' ico-black ico-large" title="'+ rotulo +'" '+spn+' ></i></a>';
            self.addAction( action, div, self );
            
        }
    });
};

DRAGGABLE.ui.Window.prototype.addPushButtons = function( aButtons ) {
    for( var p = 0; p < aButtons.length; p ++ ) {
        var ico, claz;
        var part = aButtons[p].split('|');
        var button = document.getElementById(part[0]);
        
        var action = part[1].split('-');

        switch( action[action.length-1].toUpperCase() ) {
            case 'SEARCH': 
                ico = 'ico-search';  
                claz = 'pushbutton';  
                break;
            case 'REPLACE': 
                ico = 'ico-redo';  
                claz = 'pushbutton';  
                break;
            case 'REPLACEALL': 
                ico = 'ico-redo-all';  
                claz = 'pushbutton';  
                break;
            case 'YES': 
            case 'APPLY': 
                ico = 'ico-circle-tick';  
                claz = 'pushbutton';  
                break;
            case 'RESET': 
                ico = 'ico-circle-r';     
                claz = 'pushbutton';  
                break;
            case 'NO': 
            case 'CLOSE': 
            case 'CANCEL':
                ico = 'ico-circle-error'; 
                claz = 'pushbutton cancel'; 
                break;
        }
        
        new DRAGGABLE.ui.PushButton(button, claz, ico, part[1], part[2], this );
        
    }
};


DRAGGABLE.ui.PushButton = function( item, claz, ico, act, text, janela) {
    var spn = "";
    var translateId = text ? text : act;
    this.item = item;
    this.item.className = claz;
    
    if( janela.translator ) {
        text = janela.translator.getResource(translateId);
        spn = 'data-translate="'+translateId+'"';
    }

    this.item.innerHTML = '<i class="'+ico+'" ></i><span '+spn+'>'+text+'</span></div>' ;
    
    this.item.addEventListener('click', function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        janela.eventsCentral(act.toUpperCase(), item);
    }, false );
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Implements: 
*   - DRAGGABLE.ui.DropdownMenu
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.DropdownMenu = function (topDiv, options, menu) {
    var self = this;
    var opts = options || {};
    this.headers = {};
    
    this.id = ++ DRAGGABLE.ui.menuId;
    
    this.Lastkey = { time: 0, key: 0, label: "" }; // controla última pesquisa feita no menu.

    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.listener = opts.listener || null;
    this.method = opts.method || null;
    this.translate = opts.translate || false;
    
    if (!this.container) {
        waterbug.log('Elemento ' + topDiv + ' não existe!');
        return;
    } else {
        this.container.innerHTML = "";
    }
    
    for ( var m = 0; m < menu.length; m++ ) {
        
        var ddmId = menu[m].ddmId || ('ddm' +this.id +m );
        
        var e1 = document.createElement("div");
        e1.setAttribute( "class", 'dropdown' );
        this.container.appendChild(e1);
        
        var e2 = document.createElement("input");
        e2.setAttribute( "type", "checkbox" );
        e1.appendChild(e2);
        this.headers[ddmId] = { div: null, chk: e2, btn: null, list: null, actionList: {}, labelList: {} };
        
        e2 = document.createElement("button");
        
        if( menu[m].tip ) {
            e2.setAttribute( "data-translate", ddmId );
            e2.setAttribute( "title", menu[m].tip );
        }
        
        e2.setAttribute( "data-ddm", ddmId );
        var spn = this.translate ? '<span data-translate="'+ddmId+'" >' :'<span>';
        e2.innerHTML = spn + (menu[m].title || '' ) + '</span>' + '&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        
        e2.addEventListener( 'click', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, false);
        
        e2.addEventListener( 'touchstart', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, false);
 
        e2.addEventListener("keydown",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
        });
            
        e2.addEventListener("keyup",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
            var ddm = this.getAttribute("data-ddm");
            switch( e.keyCode ) {
                case 27:
                    if(DRAGGABLE.ui.oneTimeCloseFunction) {
                        DRAGGABLE.ui.oneTimeCloseFunction();
                    }
                    break;
                case 13:
                    if( DRAGGABLE.ui.lastOpen && self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) {
                       //alert(DRAGGABLE.ui.lastOpen+','+self.headers[DRAGGABLE.ui.lastOpen].highlightItem);
                       self.eventsCentral( DRAGGABLE.ui.lastOpen, self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) ;  
                    }
                    break;
                case 33: // PgUp
                case 34: // PgDn
                    var cnt = 7;
                    while( self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 33 ) && cnt > 0 )  cnt --;  
                    break;
                case 36: // Home
                case 35: // End
                    while( self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 36 ) ) ;  
                    break;
                case 38: // Up
                case 40: // Down
                    if( DRAGGABLE.ui.lastOpen )
                        self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 38 ) ;  
                    break;
                case 37: // Left
                case 39: // Right
                    if( DRAGGABLE.ui.lastOpen )
                        self.openMenu(DRAGGABLE.ui.lastOpen, e.keyCode === 37 ); 
                    break;
                default:
                    if(e.keyCode >=65 && e.keyCode <=122  ) {
                        self.searchInMenu(DRAGGABLE.ui.lastOpen, e.keyCode ); 
                    }
                    break;    
            }
        });
        
        e1.appendChild(e2);
        this.headers[ddmId].btn = e2;
        
        var e3 = document.createElement("div");
        e3.setAttribute( "class", "dropdown-menu ps--active-y" );
        e3.setAttribute( "data-toggle", "toggle-menu" );
        e1.appendChild(e3);

        this.sbar = new PerfectScrollbar( e3, {
             handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch']
            ,wheelSpeed: 1
            ,wheelPropagation: false
            ,suppressScrollX: true
            ,minScrollbarLength: 100
            ,swipeEasing: true
            ,scrollingThreshold: 500
            ,margin: "4px 0 2px 0"
        });
        
        this.headers[ddmId].div = e3;
        
        e3.addEventListener( 'transitionend', function(e) {
            var v = this.scrollTop;
            this.scrollTop=10000;
            this.scrollTop=v;
            self.sbar.update();
        }, false);

        var e4 = document.createElement("ul");
        e3.appendChild(e4);
        this.headers[ddmId].list = e4;
        
        for ( var i = 0; i < menu[m].itens.length; i++ ) {
            this.addItemSubMenu(ddmId, menu[m].itens[i]);
        }
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.dispatchAction = function( ddm, action ) {
    this.headers[ddm].actionList[action].getElementsByTagName('a')[0].click();
};

DRAGGABLE.ui.DropdownMenu.prototype.setVisible = function (visible) {
    this.container.style.display = visible? '' : 'none' ;
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubMenu = function (ddm) {
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return false;
    }
    return this.headers[ddm];
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubItem = function (ddm, item) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    var toSel = item;
    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    return (toSel ?  toSel: false );
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubItem = function (ddm, action) {
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = 'none';
    item.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubItem = function (ddm, action) {
    
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = '';
    item.style.opacity = '';
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = 'none';
    this.headers[ddm].btn.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = '';
    this.headers[ddm].btn.style.opacity = '';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    this.headers[ddm].list.innerHTML = "";
    
};

DRAGGABLE.ui.DropdownMenu.prototype.openMenu = function (ddm, previous ) {
    var toSel, next = false, prev;
    for( var item in this.headers ) {
        if(next) {
            toSel = item;
            break;
        }
        if( !previous && item === ddm) {
            next = true;
        } else if (previous && prev && item === ddm ){
            toSel = prev;
            break;
        }
        prev = item;
    }
    if( ! toSel ) return false;
    this.eventsCentral(toSel);
    
};

DRAGGABLE.ui.DropdownMenu.prototype.searchInMenu = function (ddm, key ) {

    if( this.headers[ddm] === undefined ) return;

    var toSel = "";
    var acts = this.headers[ddm].labelList;
    var chr = String.fromCharCode(key).toUpperCase();
    var agora = new Date().getTime();
    var validade  = 3000; // 3 segundos

    // tecla repetida, dentro da validade, então busque o próximo da mesma letra inicial
    var findNext = ( this.Lastkey.key === key && this.Lastkey.time > ( agora - validade ) );

    if( findNext ) {
        var next = false;
        for( var item in acts ) {
            if(  next ) {
                if( item.startsWith(chr) ) {
                    toSel = item;
                    break;
                }
            } else if( this.headers[ddm].highlightItem && item === this.Lastkey.label ) {
                next = true;
            }
        }
    } else {
        var previo = "";
        //tenta encontrar um que comece com a letra procurada
        for( var item in acts ) {
            if( previo === "" ) previo = item; // registra o primeiro item para usar abaixo
            if( item.startsWith(chr) ){
               toSel = item;
               break;
            }
        }
        //se não encontrar, para no último menor que a letra procurada
        if( toSel === "" ) {
            for( var item in acts ) {
                if( item.charAt(0) >= chr ){
                    toSel = previo;
                    break;
                }
                previo = item;
            }
        }
    }

    if( toSel !== "" ) {
        this.highlightItem(ddm, this.headers[ddm].labelList[toSel]);
        this.Lastkey = { time: agora, key: key, label: toSel }
    }

};


DRAGGABLE.ui.DropdownMenu.prototype.unhighlightItem = function (menu) {
    var acts = menu.actionlList;

    for( var item in acts ) {
         menu.actionList[item].className = '';
    }

    if( menu.highlightItem && (!menu.selectedItem || menu.selectedItem !== menu.actionList[menu.highlightItem]) ) {
        menu.actionList[menu.highlightItem].className = '';
        delete menu.highlightItem;
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.highlightItem = function (ddm, up) {
    // up can be true or false (indicating direction) or it can be a string indicating an item
    var toSel = up, next = false, prev;
    var menu = this.headers[ddm];
    var acts = menu.actionList;
    if( typeof up === "boolean" ) {
        toSel = false;
        for( var item in acts ) {
            if(  acts[item].style.pointerEvents === 'none' ){
                continue;
            }
            if( (! menu.highlightItem) || next ) {
                toSel = item;
                break;
            } else if( !up && menu.highlightItem && menu.highlightItem === item ) {
                next = true;
            } else if (up && prev && menu.highlightItem && menu.highlightItem === item ){
                toSel = prev;
                break;
            }
            prev = item;
        }
    }
    
    if(!toSel) return false;
    
    // sempre limpa e registra o item que seria destacado, mesmo que não veja a marcar (item já selecionado).
    this.unhighlightItem( menu );
    menu.highlightItem = toSel;
    
    if( !menu.selectedItem || menu.selectedItem !== acts[menu.highlightItem] ) {
        acts[toSel].className = 'hover';
    }
        
    if( acts[toSel].offsetTop+acts[toSel].clientHeight >=  menu.div.scrollTop + menu.div.clientHeight ) {
        menu.div.scrollTop = acts[toSel].offsetTop+(1.9*acts[toSel].clientHeight)-menu.div.clientHeight;
    }
    if( acts[toSel].offsetTop <  menu.div.scrollTop ) {
        menu.div.scrollTop = acts[toSel].offsetTop;
    }    
    return true;
};

DRAGGABLE.ui.DropdownMenu.prototype.selectItem = function (ddm, item) {
    var toSel = item;

    var menu = this.headers[ddm];
    this.unhighlightItem( menu );

    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    if( ! toSel ) return false;
    
    if( this.headers[ddm].selectedItem ) {
        this.headers[ddm].selectedItem.className = '';
    }
    
    toSel.className = 'selected';
    this.headers[ddm].selectedItem = toSel;
    return toSel;
};
    
DRAGGABLE.ui.DropdownMenu.prototype.setSubMenuTitle = function (ddm, newTitle) {
    
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    var title = newTitle;
    if(  typeof title !== "string" ) {
        title = newTitle.getElementsByTagName('a')[0].innerHTML;
    } 
    
    if( ! title ) {
        waterbug.log( 'Título não encontrado!' );
        return false;
    }
        
    this.headers[ddm].btn.innerHTML = (title || '' ) +'&#160;<i class="ico-open-down" data-toggle="toggle"></i>';
    
};
    
DRAGGABLE.ui.DropdownMenu.prototype.addItemSubMenu = function (ddm, newItem, pos) {
    
    var self = this, e4;
    var tags = newItem.split('|'); 
    
    if( ! self.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    if( tags[0].substring(0, 3) ===  '---' ) {
        e4 = document.createElement("hr");
    } else {
        e4 = document.createElement("li"); 
        var action = tags.length > 1 ? tags[1] : tags[0];
        e4.setAttribute( "id",  action );
        
        var e5 = document.createElement("a");
        var spn = this.translate ? '<span data-translate="'+action+'" >' :'<span>';
        
        e5.innerHTML = spn + tags[0] + '</span>';
        e4.appendChild(e5);
        
        this.addAction( ddm, action, e4, this, tags[0]);
        
    }
    
    if(pos>=0) {
        self.headers[ddm].list.insertBefore(e4, self.headers[ddm].list.children[pos]);
    } else {
        self.headers[ddm].list.appendChild(e4);
    }  
    
    // added element
    return e4;
};

DRAGGABLE.ui.DropdownMenu.prototype.setListener = function (listener, method) {
    this.listener = listener || null;
    this.method = method || 'callback';
};

DRAGGABLE.ui.DropdownMenu.prototype.eventsCentral = function (ddm, event) {
    var self = this;
    var e = this.headers[ddm];
    e.chk.checked = ! e.chk.checked;
      
    // close any previously opened menu
    if(DRAGGABLE.ui.oneTimeCloseFunction) {
        DRAGGABLE.ui.oneTimeCloseFunction();
    }

    if( e.chk.checked ) {
        DRAGGABLE.ui.oneTimeCloseFunction = function () { 
            e.chk.checked = false; 
            DRAGGABLE.ui.lastOpen = null;
            self.unhighlightItem( e );
            document.removeEventListener('click', DRAGGABLE.ui.oneTimeCloseFunction, false );
            DRAGGABLE.ui.oneTimeCloseFunction = null;
        };

        document.addEventListener( 'click', DRAGGABLE.ui.oneTimeCloseFunction  );
        DRAGGABLE.ui.lastOpen = ddm;

        if( e.selectedItem )
             e.div.scrollTop = e.selectedItem.offsetTop-115;
    }
    
    if(event && this.listener){
        this.listener[this.method](event);
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.addAction = function( ddm, action, div, self, label ) {
    
    self.headers[ddm].actionList[action]=div; 
    self.headers[ddm].labelList[label]=action; 
    
    div.setAttribute( "data-ddm", ddm );
    div.setAttribute( "data-value", action );
    
    div.addEventListener( 'click', function (e) {
       e.preventDefault(); 
       e.stopPropagation(); 
       self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
    }, false);
    
    var swiping = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        self.mouseMovido = true;
        var newY = e.changedTouches[0].pageY;
        var delta = self.startY - newY;
        
        var m = self.headers[ddm].div; 
        
        if( Math.abs(delta) > 10) {
           var v = m.scrollTop + delta;
           if( v < 0 )
               m.scrollTop = 0;
           else if ( v > ( m.scrollHeight - m.ClientHeight ) ) {
               m.scrollTop = ( m.scrollHeight - m.ClientHeight );
           } else {
               m.scrollTop = v;
           }
           self.startY = newY;
           self.moved = true;
        }
    };
    
    div.addEventListener( 'touchstart', function (e) {
       self.startY = e.changedTouches[0].pageY;
       self.moved = false;
       div.addEventListener( 'touchmove', swiping, false );
       e.preventDefault(); 
       e.stopPropagation(); 
    }, false);
    
    div.addEventListener( 'touchend', function (e) {
        
        div.removeEventListener( 'touchmove', swiping, false );
        
        swiping(e);
        
        if(! self.moved ) {
            e.preventDefault(); 
            e.stopPropagation(); 
            self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
        }
        
    }, false);
    
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
    div.addEventListener( 'mouseout', function(e)  { e.preventDefault(); e.stopPropagation(); }, false); 
    
    div.addEventListener( 'mouseover', function(e) { 
        e.preventDefault(); 
        e.stopPropagation(); 
        if( self.mouseMovido ) 
           self.highlightItem(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
        self.mouseMovido = false;
    }, false);
    
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Implements: 
*   - DRAGGABLE.ui.Alert
*   - DRAGGABLE.ui.ReplaceDialog
*   - DRAGGABLE.ui.ColorPicker
*   
 */

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };

DRAGGABLE.ui.Alert = function( parent, action, text, description, options ) {
    
    var x, y, w, h, callback;
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.callback = { listener: this, method: 'alertCallback' };
    
    if(!parent) {
        
        this.parentCallback = null;
        
        // redimensiona a workspace
        var winH = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;

        var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;
        
        x = winW/2-350;
        y = winH/2-150;
        
    } else {
        this.parentCallback = parent.callback;
        x = parent.topDiv.offsetLeft + 50;
        y = parent.topDiv.offsetTop + 50;
    }
    
    var w = ( action ? "500px" : "700px" );
    var h = "auto";
    
    x = options.x !== undefined ? options.x : x;
    y = options.y !== undefined ? options.y : y;
    w = options.w !== undefined ? options.w : w;
    h = options.h !== undefined ? options.h : h;
    
    this.container = new DRAGGABLE.ui.Window(
          null
        , null
        , {title: 'AlertTitle', translator: this.translator, statusbar: false, top: y+"px", left: x+"px", width: w, height: h, zIndex: 300}
        , this.callback
    );
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-circle-'+(action? 'question' : 'exclamation')+'"></i></div>\n\
        <div class="text-group'+(action? '' : ' wide')+'">\n\
            <div class="title">'+text+'</div>\n\
            <div class="description">'+description+'</div>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Alert"></div>\n\
            <div id="botao2Alert"></div>\n\
        </div>\n\
    </div>';
    
    if( action ) {
    
        this.container.addPushButtons([
            'botao1Alert|'+action+'-YES|yes',
            'botao2Alert|'+action+'-NO|no'
        ]);

    } else {
        
        this.container.addPushButtons([
            'botao1Alert|CLOSE|ok'
        ]);
        
    }   
    this.modalPane = document.getElementById('modalPane');
    
    if( ! this.modalPane ) {
        
        var div = document.createElement("DIV");
        div.id = 'modalPane';
        div.style = "position:absolute; z-index:250; background-color:black; opacity:0.4; top:0; left:0; bottom:0; right:0; pointer-events: block; display:none;";
        document.body.appendChild(div);
        this.modalPane = div;
        
    }    
    
    this.modalPane.style.display = 'block';
        
    this.container.setVisible(true);

};

DRAGGABLE.ui.Alert.prototype.close = function( ) {
    this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.Alert.prototype.alertCallback = function ( action, elem ) {
    switch(action) {
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            if( this.parentCallback )
                this.parentCallback.listener[this.parentCallback.method](action, elem);
    }
};

DRAGGABLE.ui.ReplaceDialog = function( parent, options ) {
    
    var x, y, st = "Localizar:", rt = "Substituir por:", cs = 'Diferenciar maiúsculas e minúsculas', ww = 'Pesquisar palavras inteiras';
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.parentCallback = parent.callback;
    this.callback = { listener: this, method: 'dialogCallback' };
    x = Math.min( parent.dataDiv.clientWidth/2 - 250, 200);
    y = 20;
    
    this.container = new DRAGGABLE.ui.Window(
          parent.dataDiv
        , null
        , {title: 'ReplaceDialogTitle', translator: this.translator, statusbar: false, top: y+"px", left: x+"px", width: "500px", height:"auto", zIndex: 300}
        , this.callback
    );
    
    if( this.translator ) {
        st = this.translator.getResource( "searchTerm" );
        rt = this.translator.getResource( "replaceTerm" );
        cs = this.translator.getResource( "match_case" );
        ww = this.translator.getResource( "whole_word" );
    }
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-find-and-replace"></i></div>\n\
        <div class="text-group">\n\
            <br><span data-translate="searchTerm">'+st+'</span><br><input id="searchTerm" type="text" value=""></input>\n\
            <br><input id="chk_match_case" type="checkbox"><span data-translate="match_case">'+cs+'</span>\n\
            <br><input id="chk_whole_word" type="checkbox"><span data-translate="whole_word">'+ww+'</span>\n\
            <br><br><span data-translate="replaceTerm">'+rt+'</span><br><input id="replaceTerm" type="text" value=""></input>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Replace"></div>\n\
            <div id="botao2Replace"></div>\n\
            <div id="botao3Replace"></div>\n\
            <div id="botao4Replace"></div>\n\
        </div>\n\
    </div>';
    
    this.container.addPushButtons([
        'botao1Replace|search',
        'botao2Replace|replace',
        'botao3Replace|replaceall',
        'botao4Replace|cancel'
    ]);

    this.searchTerm = document.getElementById("searchTerm");
    this.replaceTerm = document.getElementById("replaceTerm");
    this.chkMatchCase = document.getElementById("chk_match_case");
    this.chkWholeWord  = document.getElementById("chk_whole_word");       
    
    this.container.setVisible(true);

};

DRAGGABLE.ui.ReplaceDialog.prototype.close = function( ) {
    //this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.ReplaceDialog.prototype.dialogCallback = function ( action, elem ) {
    switch(action) {
        case 'MOVE': 
           break;
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            this.parentCallback.listener[this.parentCallback.method]('DO-'+action, elem, this.searchTerm.value, this.replaceTerm.value, this.chkMatchCase.checked, this.chkWholeWord.checked );
    }
};

DRAGGABLE.ui.ColorPicker = function( itens, options ) {
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.container = new DRAGGABLE.ui.Window( 
          null
        , [ 'apply|select' ]
        , { title: 'PickerTitle', translator: this.translator, draggable:true, width: "auto", height: "auto", zIndex:"200" }
        , {listener : this, method: 'pickerCallBack' }
    );

    this.container.dataDiv.innerHTML = '\
<div class="picker-group">\
    <canvas id="colorPickerCanvas"></canvas><br>\
    <input id="originalColor"></input>\
    <input id="newColor"></input>\
</div>';
   
    this.originalColor = document.getElementById( 'originalColor' );
    this.newColor = document.getElementById( 'newColor' );
    
    this.cp = new KellyColorPicker({
        place : 'colorPickerCanvas', 
        size : 190, 
        input : 'newColor'  
    });
    
    var self = this;
    
    for( var i = 0; i < itens.length; i++ ) {
        document.getElementById(itens[i]).addEventListener('click', function( e ) { self.activate(this); e.stopPropagation(); } );
    }
};

DRAGGABLE.ui.ColorPicker.prototype.pickerCallBack = function( action, elem ) {
    switch(action) {
        case 'MOVE': 
            break;
        case 'APPLY': 
            this.item.style.backgroundColor = this.item.value = this.newColor.value;
            this.close();
            break;
        case 'CLOSE': 
           this.item.style.backgroundColor = this.item.value = this.originalColor.value;
           this.close();
   }
};

DRAGGABLE.ui.ColorPicker.prototype.close = function( ) {
    this.container.setVisible(false);
};

DRAGGABLE.ui.ColorPicker.prototype.activate = function( parent ) {
    var self = this;
    
    var oneTimeCloseFunction = function () { 
        self.close(); 
        this.removeEventListener('click', oneTimeCloseFunction, false );
    };
    
    document.addEventListener( 'click', oneTimeCloseFunction  );
    
    this.item = parent;
    this.container.topDiv.addEventListener( 'click', function (e) { e.stopPropagation(); } );
    
    this.newColor.value = this.originalColor.value = this.item.value;
    this.originalColor.style.backgroundColor = this.item.value;
    this.cp.setColorByHex(this.item.value);
    
    var bounds = this.item.getBoundingClientRect();
    
    this.container.topDiv.style.top = ( bounds.top + bounds.height/2  -120 ) + "px";
    this.container.topDiv.style.left = bounds.left + bounds.width + 5 + "px";
    this.container.setVisible(true);
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Slider = function (topDiv, opts ) {

   //min, max, start, step, pcolor, pbgcolor, callback ) {
    
    var self = this;
    var leftInterval, rightInterval;
    var mozStyle, webkStyle, btStyle;
    var color = opts.color || 'black';
    var bgcolor = opts.bgcolor || 'gray';
    var speed = opts.speed || 100;
    var callback = opts.callback;
    var rules = [];
    
    // identifica elementos de CSS padrão que podem ser alterados
    for( var i in document.styleSheets ) {
        if(document.styleSheets[i].href && document.styleSheets[i].href.includes('styles4abcx')){
            rules=document.styleSheets[i].cssRules? document.styleSheets[i].cssRules: document.styleSheets[i].rules;
            break;
        }
    }

    for (var r=0; r < rules.length; r++){
        if(rules[r].selectorText===".slidebuttonDiv:hover") 
            btStyle=rules[r].style;
        if(rules[r].selectorText===".slider::-webkit-slider-thumb") 
            webkStyle=rules[r].style;
        if(rules[r].selectorText===".slider::-moz-range-thumb") 
            mozStyle=rules[r].style;
    }
    
    if(btStyle) 
        btStyle.backgroundColor = color;
    
    if(webkStyle) 
        webkStyle.backgroundColor = color;
    
    if( mozStyle )
        mozStyle.backgroundColor = color;
    
    
    this.step = opts.step || 1;
    this.id = ++ DRAGGABLE.ui.slideId;
    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.container.className = "slidecontainer";
    this.container.id = "slider" + this.id;
    
    var d1 = document.createElement('div');
    d1.className = "layer1";
    d1.style.backgroundColor = bgcolor;
    this.container.appendChild(d1);
    
    var d2 = document.createElement('div');
    d2.className = "layer2";    
    this.container.appendChild(d2);
    
    this.label = document.createElement('label');
    d1.appendChild(this.label);
    this.label.className = "slidelabel";
    
    this.slider = document.createElement('input');
    
    this.leftButton = document.createElement('div');
    var llabel = document.createElement('label');
    this.leftButton.appendChild(llabel);
    d2.appendChild(this.leftButton);
    this.leftButton.className = 'slidebuttonDiv';
    llabel.className = 'slidebutton rev180dg';
    llabel.innerHTML = '<i class="ico-open-right" data-toggle="toggle"></i>';
    
    var l = document.createElement('div');
    l.appendChild(this.slider);
    d2.appendChild(l);
    
    this.rightButton = document.createElement('div');
    var rlabel = document.createElement('label');
    this.rightButton.appendChild(rlabel);
    d2.appendChild(this.rightButton);
    this.rightButton.className = 'slidebuttonDiv';
    rlabel.className = 'slidebutton normal';
    rlabel.innerHTML = '<i class="ico-open-right" data-toggle="toggle"></i>';
    
    this.slider.type="range";
    this.slider.className = "slider";
    this.slider.min = opts.min || 0;
    this.slider.max = opts.max || 100;
    this.slider.value = opts.start || 100;
    this.slider.step = 1;
    self.label.innerHTML = (opts.start || 100) + '%';
    
    var setV = function (v, call) {
        self.slider.value = v;
        self.label.innerHTML = self.slider.value+"%";
        (call) && (callback) && callback(v);
    };
    
    this.slider.oninput = function(e) {
        self.slider.step = self.step;
        setV(parseInt(this.value), true);
        e.stopPropagation();
        e.preventDefault();
        self.slider.step = 1;
    };
    
    this.leftButton.onclick = function(e) {
        setV(parseInt(self.slider.value)-1, true);
        e.stopPropagation();
        e.preventDefault();
    };
    this.leftButton.onmousedown = function(e) {
        leftInterval = setInterval( function() {
            setV(parseInt(self.slider.value)-1);
        }, speed);
        e.stopPropagation();
        e.preventDefault();
    };
    
    this.leftButton.onmouseup = function(e) {
        clearInterval(leftInterval);    
        (callback) && callback(self.slider.value);
    };
    this.leftButton.onmouout = function(e) {
        clearInterval(leftInterval);    
        (callback) && callback(self.slider.value);
    };
    
    this.rightButton.onclick = function(e) {
        setV(parseInt(self.slider.value)+1, true);
        e.stopPropagation();
        e.preventDefault();
    };
    
    this.rightButton.onmousedown = function(e) {
        rightInterval = setInterval( function() {
            setV(parseInt(self.slider.value)+1);
        }, speed);
        e.stopPropagation();
        e.preventDefault();
    };
    
    this.rightButton.onmouseup = function(e) {
        clearInterval(rightInterval);    
        (callback) && callback(self.slider.value);
    };
    this.rightButton.onmouseout = function(e) {
        clearInterval(rightInterval);    
        (callback) && callback(self.slider.value);
    };
    
};

DRAGGABLE.ui.Slider.prototype.enable = function( ) {
    this.container.style.pointerEvents = 'all';
    this.container.style.backgroundColor = 'transparent';
    this.container.style.opacity = '1';
};

DRAGGABLE.ui.Slider.prototype.disable = function( ) {
    this.container.style.pointerEvents = 'none';
    this.container.style.backgroundColor = 'gray';
    this.container.style.opacity = '0.3';
};

DRAGGABLE.ui.Slider.prototype.getValue = function( ) {
    return this.slider.value;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};

ABCXJS.tablature.Accordion = function( params ) {
    
    this.loaded       = undefined;
    this.tabLines     = [];
    this.accordions   = params.accordionMaps || [] ;
    this.translator   = params.translator || null;
    this.transposer   = new window.ABCXJS.parse.Transposer();
    
    if( this.accordions.length === 0 ) {
        throw new Error( 'No accordionMap found!');
    }
    
    this.render_opts = {};
    this.setRenderOptions( params.render_keyboard_opts, true );

//    this.render_opts =  params.render_keyboard_opts;
    
    if( params.id )
        this.loadById( params.id );
    else
        this.load( 0 );
    
};

ABCXJS.tablature.Accordion.prototype.setRenderOptions = function ( options, initial ) {
    
    var opt = options || {};

    this.render_opts.transpose = (typeof opt.transpose === 'undefined'? (initial? false : this.render_opts.transpose ): opt.transpose) ;
    this.render_opts.mirror = (typeof opt.mirror === 'undefined'? (initial? false : this.render_opts.mirror ): opt.mirror) ;
    this.render_opts.draggable = (typeof opt.draggable === 'undefined'? (initial? false : this.render_opts.draggable ): opt.draggable) ;
    this.render_opts.show = (typeof opt.show === 'undefined'? (initial? false : this.render_opts.show ): opt.show) ;
    this.render_opts.label = (typeof opt.label === 'undefined'? (initial? false : this.render_opts.label ): opt.label) ;
    
    this.render_opts.scale = (typeof opt.scale === 'undefined'? (initial? 1 : this.render_opts.scale ): opt.scale) ;
    
    if( ! initial ) {
        DIATONIC.map.color.fill = (typeof opt.fillColor === 'undefined'? DIATONIC.map.color.fill : opt.fillColor) ;
        DIATONIC.map.color.background = (typeof opt.backgroundColor === 'undefined'? DIATONIC.map.color.background : opt.backgroundColor) ;
        DIATONIC.map.color.open = (typeof opt.openColor === 'undefined'? DIATONIC.map.color.open : opt.openColor) ;
        DIATONIC.map.color.close = (typeof opt.closeColor === 'undefined'? DIATONIC.map.color.close : opt.closeColor) ;
    }    
};


ABCXJS.tablature.Accordion.prototype.loadById = function (id) {
    for (var g = 0; g < this.accordions.length; g ++)
        if (this.accordions[g].id === id) {
            return this.load(g);
        }
        waterbug.log( 'Accordion not found. Loading the first one.');
        return this.load(0);
};

ABCXJS.tablature.Accordion.prototype.load = function (sel) {
    this.loaded = this.accordions[sel];
    this.loadedKeyboard = this.loaded.keyboard;
    return this.loaded;
};

ABCXJS.tablature.Accordion.prototype.accordionExists = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) ret  = true;
    }
    return ret;
};

ABCXJS.tablature.Accordion.prototype.accordionIsCurrent = function(id) {
    return (this.accordions.loaded && this.accordions.loaded.id === id);
};

ABCXJS.tablature.Accordion.prototype.clearKeyboard = function(full) {
    this.loadedKeyboard.clear(full);
};

ABCXJS.tablature.Accordion.prototype.changeNotation = function() {
    this.render_opts.label = ! this.render_opts.label;
    this.loadedKeyboard.redraw(this.render_opts);
};

ABCXJS.tablature.Accordion.prototype.rotateKeyboard = function(div_id) {
    var o = this.render_opts;
    
    if( o.transpose ) {
        o.mirror=!o.mirror;
    }
    
    o.transpose=!o.transpose;
    
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.scaleKeyboard = function(div_id) {
    if( this.render_opts.scale < 1.2 ) {
        this.render_opts.scale += 0.2;
    } else {
        this.render_opts.scale = 0.8;
    }
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.printKeyboard = function(div_id, options) {
    
    this.setRenderOptions( options );
    
    var div =( typeof(div_id) === "string" ? document.getElementById(div_id) : div_id );

    if( this.render_opts.show ) {
        div.style.display="inline-block";
        this.loadedKeyboard.print(div,this.render_opts, this.translator);
    } else {
        div.style.display="none";
    }
};

ABCXJS.tablature.Accordion.prototype.getId = function () {
    return this.loaded.getId();
};
ABCXJS.tablature.Accordion.prototype.getFullName = function () {
    return this.loaded.getFullName();
};

ABCXJS.tablature.Accordion.prototype.getTxtModel = function () {
    return this.loaded.getTxtModel();
};

ABCXJS.tablature.Accordion.prototype.getTxtNumButtons = function () {
    return this.loaded.getTxtNumButtons();
};

ABCXJS.tablature.Accordion.prototype.getTxtTuning = function () {
    return this.loaded.getTxtTuning();
};


ABCXJS.tablature.Accordion.prototype.getNoteName = function( item, keyAcc, barAcc, bass ) {
    
    // mapeia 
    //  de: nota da pauta + acidentes (tanto da clave, quanto locais)
    //  para: valor da nota cromatica (com oitava)

    var n = this.transposer.staffNoteToCromatic(this.transposer.extractStaffNote(item.pitch));
    var oitava = this.transposer.extractStaffOctave(item.pitch);
    var staffNote = this.transposer.numberToKey(n);
    
    if(item.accidental) {
        barAcc[item.pitch] = this.transposer.getAccOffset(item.accidental);
        n += barAcc[item.pitch];
    } else {
        if(typeof(barAcc[item.pitch]) !== "undefined") {
          n += barAcc[item.pitch];
        } else {
          n += this.transposer.getKeyAccOffset(staffNote, keyAcc);
        }
    }
    
    oitava   += (n < 0 ? -1 : (n > 11 ? 1 : 0 ));
    n         = (n < 0 ? 12+n : (n > 11 ? n%12 : n ) );
    
    var key   = this.transposer.numberToKey(n);
    var value = n;
    
    if (item.chord) key = key.toLowerCase();    
    
    return { key: key, octave:oitava, isBass:bass, isChord: item.chord, isMinor: item.minor, value:value };
};

ABCXJS.tablature.Accordion.prototype.inferTablature = function(tune, vars, addWarning ) {

    var inferer = new ABCXJS.tablature.Infer( this, tune, vars );
    
    vars.missingButtons = {};
    vars.invalidBasses = '';
    
    for (var t = 0; t < tune.lines.length; t++) {
       if (tune.lines[t].staffs ) {
          var voice = inferer.inferTabVoice( t );
          if (voice.length > 0) {
              tune.lines[t].staffs[tune.tabStaffPos].voices[0] = voice;
          }
       }  
    }
    
    if(vars.invalidBasses.length > 0){
        addWarning('Baixo incompatível com o movimento do fole no(s) compasso(s): ' + vars.invalidBasses.substring(1,vars.invalidBasses.length-1) + '.' ) ;
    }
    
    if(vars.missingButtons){
        for( var m in vars.missingButtons ) {
            addWarning('Nota "' + m + '" não disponível no(s) compasso(s): ' + vars.missingButtons[m].join(", ") + '.' ) ;
        }
    }
    
    delete vars.missingButtons;
    delete vars.invalidBasses;
   
    
};

ABCXJS.tablature.Accordion.prototype.parseTabVoice = function(str, vars ) {
    var p = new ABCXJS.tablature.Parse( this,  str, vars);
    return p.parseTabVoice();
};

ABCXJS.tablature.Accordion.prototype.setTabLine = function (line) {
    this.tabLines[this.tabLines.length] = line.trim();
};

ABCXJS.tablature.Accordion.prototype.getTabLines = function () {
    var ret = "";
    if(this.tabLines.length === 0) return ret;
    for(var l = 0; l < this.tabLines.length; l ++ ) {
        if(this.tabLines[l].length>0){
            ret += this.tabLines[l]+"\n";
        }
    }
    this.tabLines = [];
    return ret;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 * - Verificar porque no caso de slur a ordem dos elementos não está sendo respeitada
*/

/*
 
            Definição da sintaxe para tablatura
        
           " |: G+5'2g-6>-5 | G-3'2d-5d-[678]1/2 | G+5d-5d-> | G-xd-5d-6 | +{786'}2 | +11/2 | c+ac+b |"
        
           Linha de tablatura ::= { <comentario> | <barra> | <coluna> }*
        
           comentario := "%[texto]"

           barra ::=  "|", "||", ":|", "|:", ":|:", ":||:", "::", ":||", ":||", "[|", "|]", "|[|", "|]|" [endings]
        
           coluna ::=  ["("<triplet>][<bassNote>]<bellows><note>[<duration>] [")"] 
        
           bassNote ::=  { "abcdefgABCDEFG>xz" }*
          
           bellows ::= "-"|"+" 
        
           note ::= <button>[<row>] | chord 
        
           chord ::= "[" {<button>[<row>]}* "]" 
        
           button ::=  {hexDigit} | "x" | "z" | ">"
        
           row ::= { "'" }*

           duration ::=  number|fracao 

 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};

ABCXJS.tablature.Parse = function( accordion, str, vars ) {
    this.accordion = accordion;
    this.invalid = false;
    this.finished = false;
    this.line = str;
    this.vars = vars || {} ;
    this.bassNoteSyms = "abcdefgABCDEFG>xz";
    this.trebNoteSyms = "0123456789abcdefABCDEF>xz";
    this.durSyms = "0123456789/.";
    this.belSyms = "+-";
    this.barSyms = ":]|[";
    this.accSyms = "♭♯m"; // neste caso, "m" representa o acorde-baixo-menor
    this.i = 0;
    this.xi = 0;
    this.offset = 8.9;
    
    this.warn = function(str) {
        var bad_char = this.line.charAt(this.i);
        if (bad_char === ' ')
            bad_char = "SPACE";
        var clean_line = this.encode(this.line.substring(0, this.i)) +
                '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
                this.encode(this.line.substring(this.i + 1));
        this.addWarning("Music Line:" + /*line*/ 0 + ":" + /*column*/(this.i + 1) + ': ' + str + ": " + clean_line);
    };
    
    this.addWarning = function(str) {
        if (!this.vars.warnings) this.vars.warnings = [];
        this.vars.warnings.push(str);
    };

    this.encode = function(str) {
        var ret = window.ABCXJS.parse.gsub(str, '\x12', ' ');
        ret = window.ABCXJS.parse.gsub(ret, '&', '&amp;');
        ret = window.ABCXJS.parse.gsub(ret, '<', '&lt;');
        return window.ABCXJS.parse.gsub(ret, '>', '&gt;');
    };

};

ABCXJS.tablature.Parse.prototype.parseTabVoice = function ( ) {
    var voice = [];
    this.i = 0;
    var token = {el_type: "unrecognized"};

    while (this.i < this.line.length && !this.finished) {
        token = this.getToken();
        switch (token.el_type) {
            case "bar":
                token.startChar = this.xi;
                token.endChar = this.i-1;
                if (!this.invalid)
                    voice[voice.length] = token;
                this.vars.lastBarElem = token;
                break;
            case "note":
                if(this.vars.lastBarElem && this.vars.lastBarElem.barNumber === undefined)
                    this.vars.lastBarElem.barNumber = this.vars.currentVoice.currBarNumber ++;
                if (!this.invalid)
                    voice[voice.length] = this.formatChild(token);
                break;
            case "comment":
            case "unrecognized":
            default:
                break;
        }
    }
    return voice;
};

ABCXJS.tablature.Parse.prototype.formatChild = function (token) {
    var child = {
        el_type: token.el_type
        , startChar: this.xi
        , endChar: this.i-1
        , pitches: []
        , duration: token.duration * this.vars.default_length
        , bellows: token.bellows
    };

    var pitchBase = 18;
    var tt = "tabText";

    if (token.bassNote.length > 1) {
        pitchBase = 21.3;
        tt = "tabText2";
    }
    
    
    for (var b = 0; b < token.bassNote.length; ++b) {

        if (token.bassNote[b] === "x") {
            this.registerMissingNote( this.vars.lastBarElem.barNumber );
        }
        
        if( ! this.checkBassButton(token.bellows, token.bassNote[b]) ) {
            this.registerInvalidBass( this.vars.lastBarElem.barNumber );
        }

        if (token.bassNote[b] === "z") {
            child.pitches[b] = {bass: true, type: "rest", c: 'scripts.tabrest', pitch: 0.7 + pitchBase - (b * 3)};
        } else {
            child.pitches[b] = {bass: true, type: tt, c: this.getTabSymbol(token.bassNote[b]), pitch: pitchBase - (b * 3) - 0.5};
        }
    }

    var qtd = token.buttons.length;

    for (var i = 0; i < token.buttons.length; i++) {
        var n = child.pitches.length;

        if (token.buttons[i] === "x") {
            this.registerMissingNote( this.vars.lastBarElem.barNumber );
        }

        if (token.buttons[i] === "z")
            child.pitches[n] = {type: "rest", c: "scripts.tabrest", pitch: token.bellows === "+" ? 13.2 : 13.2 - this.offset};
        else {
            var offset = (qtd >= 3 ? -(this.offset - (2.8 * (qtd - 2))) : -this.offset);
            var p = (qtd === 1 ? 11.7 : 13.4 - (i * 2.8)) + (token.bellows === "+" ? 0 : offset);
            child.pitches[n] = {c: this.getTabSymbol(token.buttons[i]), type: "tabText" + (qtd > 1 ? "2" : ""), pitch: p};
        }

    }

    if (token.startTriplet) {
        child.startTriplet = token.startTriplet;
    }

    if (token.endTriplet) {
        child.endTriplet = token.endTriplet;
    }


    return child;
};

ABCXJS.tablature.Parse.prototype.getTabSymbol = function(text) {
    switch(text) {
        case '>': return 'scripts.rarrow';
        default: return text;
    }
};

ABCXJS.tablature.Parse.prototype.getToken = function() {
    this.invalid = false;
    this.parseMultiCharToken( ' \t' );
    this.xi = this.i;
    switch(this.line.charAt(this.i)) {
        case '%':
          this.finished = true;  
          return { el_type:"comment",  token: this.line.substr( this.i+1 ) };
        case '|':
        case ':':
          return this.getBarLine();
          
        case '[': // se o proximo caracter não for um pipe, deve ser tratado como uma coluna de notas
          if( this.line.charAt(this.i+1) === '|' ) {
            return this.getBarLine();
          }
        default:    
          return this.getColumn();
    }
   
};

ABCXJS.tablature.Parse.prototype.parseMultiCharToken = function( syms ) {
    while (this.i < this.line.length && syms.indexOf(this.line.charAt(this.i)) >= 0) {
        this.i++;
    }
};

ABCXJS.tablature.Parse.prototype.getBarLine = function() {
  var endings  =   '1234567890,'; // due syntax conflict I will not consider the  dash '-'.
  var validBars = { 
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
  
  if(this.triplet) {
    this.triplet = false;
    this.warn( "Expected triplet end but found " + this.line.charAt(this.i) );
  }

  var token = { el_type:"bar", type:"bar", token: undefined };
  var p = this.i;
  
  this.parseMultiCharToken(this.barSyms);
  
  token.token = this.line.substr( p, this.i-p );
  this.finished =  this.i >= this.line.length;

  //tratar multiplos ":" -- para efeito de tipo de barra, somente um ":" de cada lado é considerado
  var i = 0; f = token.token.length;
  while( token.token.charAt(i) === ':') ++i;
  while( token.token.charAt(f-1) === ':') --f;

  token.repeat = (i>f) ? 2 : i + 1;
  token.type = validBars[(i>f)?token.token:token.token.substring(i-1,f+1)];

  this.invalid = !token.type;

  if(! this.invalid) {
    this.parseMultiCharToken( ' \t' );
    if (this.vars.inEnding ) {
            token.endDrawEnding = true;
            if( token.type !== 'bar_thin') {
                token.endEnding = true;
                this.vars.inEnding = false;
            }    
    }
    if( (! this.finished ) && endings.indexOf(this.line.charAt(this.i))>=0) {
        token.startEnding = this.line.charAt(this.i);
        if (this.vars.inEnding) {
            token.endDrawEnding = true;
            token.endEnding = true;
        }    
        this.vars.inEnding = true;
        this.i++;
    }
  }
  return token;
};

ABCXJS.tablature.Parse.prototype.getColumn = function() {
    var token = {el_type: "note", type: "note", bassNote: undefined, bellows: "", buttons: [], duration: 1};
    token.bassNote = [];
    
    if(this.line.charAt(this.i) === "(") {
        var t = this.getTripletDef();
        if( t ) {
            token.startTriplet = t;
            this.triplet = true;
        }
    }
    
    while (this.belSyms.indexOf(this.line.charAt(this.i)) < 0 ) {
      token.bassNote[token.bassNote.length] = this.getBassNote();
    }
    
    token.bellows = this.getBelows();
    token.buttons = this.getNote();
    token.duration = this.getDuration();

    
    if( this.isTripletEnd() ) {
        token.endTriplet = true;
    }
    
    this.finished = this.i >= this.line.length;
    return token;

};

ABCXJS.tablature.Parse.prototype.checkBassButton = function( bellows, b ) {
    var kb = this.accordion.loadedKeyboard;
    
    if( !kb  || b === undefined || ('.>.x.z.').indexOf(b) > 0 ) return true;
    
    // há uma pequena conversão: na tablatura registramos os acordes menores com "m"
    // no mapeamento da gaita, escrevemos a1:m, por exemplo.
    // então trocar "m" por ":m"
    var nota = kb.parseNote(b.replace( "m", ":m" ), true );
    for( var j = kb.keyMap.length; j > kb.keyMap.length - 2; j-- ) {
      for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
          var tecla = kb.keyMap[j-1][i];
          if(bellows === '+') {
            if(tecla.closeNote.key === nota.key ) return tecla;
          } else {  
            if(tecla.openNote.key === nota.key ) return tecla;
          }
      }   
    }
    return false;
};


ABCXJS.tablature.Parse.prototype.getTripletDef = function() {
    
    var i = ++this.i;
    
    while ( this.i < this.line.length && this.bassNoteSyms.indexOf(this.line.charAt(this.i)) < 0  && this.belSyms.indexOf(this.line.charAt(this.i)) < 0 ) {
      this.i++;
    }
    
    if( this.i >= this.line.length ) {
        this.warn( "Triplet definition not found at " + this.line.substr(i) );
        return null;
    }
    
    var t =  this.line.substr(i, this.i-i).trim();
    
    //validate the triplet expression
    var e = /\[([0-9])(:{1,2}([0-9]){0,1})*\]/;
    var r = ('['+t+']').match(e);
    
   if( !r || !r[1] ) {
        this.warn( "Invalid triplet definition at " + this.line.substr(i) );
        return null;
    }
    
    return { num: r[1], notes: r[3] ? r[3] : r[1] };
    
};

ABCXJS.tablature.Parse.prototype.isTripletEnd = function() {
    this.parseMultiCharToken( ' \t' );
    if( this.line.charAt(this.i) === ')' ) {
        this.i++;
        if( this.triplet ) {
            this.triplet = false;
            return true;
        } else {
            this.warn( "Found triplet end with no beginning." + this.line.substr(this.i-1) );
            return false;
        }
    }
    return false;
};


ABCXJS.tablature.Parse.prototype.getBassNote = function() {
  var note = "";
  if( this.bassNoteSyms.indexOf(this.line.charAt(this.i)) < 0 ) {
    this.warn( "Expected Bass Note but found " + this.line.charAt(this.i) );
    this.i++;
  } else {
    note = this.line.charAt(this.i);
    this.i++;
    if( this.accSyms.indexOf(this.line.charAt(this.i)) >= 0 ) {
      note += this.line.charAt(this.i);
      this.i++;
    }
  }
  return note;
};

ABCXJS.tablature.Parse.prototype.getDuration = function() {
    var dur = 1;
    var p = this.i;

    this.parseMultiCharToken(this.durSyms);
    
    if (p !== this.i) {
        dur = this.line.substr(p, this.i - p);
        if (isNaN(eval(dur))) {
          this.warn( "Expected numeric or fractional note duration, but found " + dur);
        } else {
            dur = eval(dur);
        }
    }
    return dur;
};

ABCXJS.tablature.Parse.prototype.getBelows = function() {
    if(this.belSyms.indexOf(this.line.charAt(this.i)) < 0 ) {
       this.warn( "Expected belows information, but found " + this.line.charAt(this.i) );
       this.invalid = true;
       return '+';
    } else {
        this.i++;
        return this.line.charAt(this.i-1);
    }
};

ABCXJS.tablature.Parse.prototype.getNote = function() {
  var b = [];
  switch( this.line.charAt(this.i) ) {
      case '[':
         this.i++;
         b = this.getChord();
         break;
      default: 
         b[b.length] = this.getButton();
  }
  return b;
};

ABCXJS.tablature.Parse.prototype.getChord = function( token ) {
    var b = [];
    while (this.i < this.line.length && this.line.charAt(this.i) !== ']' ) {
        b[b.length] = this.getButton();
    }
    if( this.line.charAt(this.i) !== ']' ) {
       this.warn( "Expected end of chord - ']'");
       this.invalid = true;
    } else {
        this.i++;
    }
    return b;
};

ABCXJS.tablature.Parse.prototype.getButton = function() {
    var c = "x";
    var row = "";
    
    if(this.trebNoteSyms.indexOf(this.line.charAt(this.i)) < 0 ) {
       this.warn( "Expected button number, but found " + this.line.charAt(this.i));
    } else {
        c = this.line.charAt(this.i);
        switch(c) {
            case '>':
            case 'x':
            case 'z':
               break;
            default:   
                c = isNaN(parseInt(c, 16))? 'x': parseInt(c, 16).toString();
        }
    }
    this.i++;
    
    var p = this.i;

    this.parseMultiCharToken("'");
    
    if (p !== this.i) 
        row = this.line.substr(p, this.i - p);
        
    return c + row;
};

ABCXJS.tablature.Parse.prototype.registerMissingNote = function(barNumber) {
    if( ! this.vars.missingNotes )  this.vars.missingNotes = ',';
    
    if( this.vars.missingNotes.indexOf( ''+barNumber ) < 0 ) {
        this.vars.missingNotes += barNumber + ',';
    }
};

ABCXJS.tablature.Parse.prototype.registerInvalidBass = function(barNumber) {
    if( ! this.vars.InvalidBass )  this.vars.InvalidBass = ',';
    
    if( this.vars.InvalidBass.indexOf( ''+barNumber ) < 0 ) {
        this.vars.InvalidBass += barNumber + ',';
    }
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - Verificar currInterval e suas implicações quando se está no último compasso
 *   - Tratar adequadamente os acordes de baixo
 *   - OK Tratar inversões de fole e inTie 
 *   - OK Bug quando ligaduras de expressão estão presentes
 *   - OK inverter o movimento do fole baseado no tempo do compasso
 *   - OK tratar ligaduras de expressão (como se fossem ligaduras de articulacao)
 *   - OK acertar a posição dos elementos de pausa (quando presentes na tablatura)
 *   - OK garantir que não ocorra erro quando as pausas não forem incluídas na tablatura, mas a pausa é a única nota do intervalo.
 *
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};
    
ABCXJS.tablature.Infer = function( accordion, tune, vars ) {
    this.offset = 8.9;
    this.multiplier = 1;
    this.accordion = accordion;
    this.vars = vars || {} ;
    this.tune = tune;

    // esta variavel conta o tempo ante de propor a inversão do fole 
    // em geral o count=1 equivale ao tempo de um compasso.
    // não esta no reset para que entre as linhas o contador seja mantido
    this.count = 0; 
    
    // valor inicial do movimento do fole
    this.closing = this.tune.formatting.tabInferenceOpts > 0 ? true : false;

    // limite para inversão o movimento do fole - baseado no tempo de um compasso
    if( this.tune.lines &&
        this.tune.lines[0].staffs &&      
        this.tune.lines[0].staffs[0].meter &&
        this.tune.lines[0].staffs[0].meter.type === 'specified' ) {
        var ritmo = this.tune.lines[0].staffs[0].meter.value[0];
        this.limit = ritmo.num / ritmo.den;
    } else {
      this.limit = 1; 
    }
    
    // por default inverte o fole a cada compasso. pode ser modificado pela diretiva.
    this.limit = this.limit * Math.abs(this.tune.formatting.tabInferenceOpts);
    
    this.reset();
    
    this.transposeTab = tune.lines[0].staffs[tune.tabStaffPos].clef.transpose || 0;
    
    this.addWarning = function(str) {
        if (!this.vars.warnings) this.vars.warnings = [];
        this.vars.warnings.push(str);
    };
    
    this.barTypes = { 
        "bar"              :  "|"
      , "bar_thin"         :  "|"
      , "bar_thin_thin"    : "||"
      , "bar_thick_thin"   : "[|"
      , "bar_thin_thick"   : "|]"
      , "bar_dbl_repeat"   : ":|:"
      , "bar_left_repeat"  :  "|:"
      , "bar_right_repeat" : ":|"
    };
    
};

ABCXJS.tablature.Infer.prototype.reset = function() {
    this.tuneCurrLine = 0;
    this.voice = [];
    this.bassBarAcc = [];
    this.trebBarAcc = [];
    this.producedLine = "";
    this.lastButton = -1;
    this.currInterval = 1;
    this.alertedMissSync = false;
    
};

ABCXJS.tablature.Infer.prototype.inferTabVoice = function(line) {
    
    if( this.tune.tabStaffPos < 1 || ! this.tune.lines[line].staffs ) 
        return; // we expect to find at least the melody line above tablature, otherwise, we cannot infer it.
    
    this.reset();
    this.tuneCurrLine = line;
    
    var voices = [];
     
    var trebStaff  = this.tune.lines[this.tuneCurrLine].staffs[0];
    var trebVoices = trebStaff.voices;
    this.accTrebKey = trebStaff.key.accidentals;
    for( var i = 0; i < trebVoices.length; i ++ ) {
        voices.push( { voz:trebVoices[i], pos:-1, st:'waiting for data', bass:false, wi: {}, ties:[]} ); // wi - work item
    }
    
    if( this.tune.tabStaffPos === 2 ) {
        var bassStaff  = this.tune.lines[this.tuneCurrLine].staffs[1];
        if(bassStaff) { 
            var bassVoices = bassStaff.voices;
            this.accBassKey = bassStaff.key.accidentals;
            for( var i = 0; i < bassVoices.length; i ++ ) {
                voices.push({ voz:bassVoices[i], pos:-1, st:'waiting for data', bass:true, wi: {}, ties:[] } ); // wi - work item
            }
        } else {
            this.addWarning('Possível falta da definição da linha de baixos.') ;
        }
    }  
    
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    while( st > 0 ) {
        
        st = 0; // 0 para garantir a saida, caso não haja nada para ler

        for( var j = 0; j < voices.length; j ++ ) {
            st = Math.max(this.read( voices, j ), st);
        }

        for( var j = 0; j < voices.length-1; j ++ ) {
            if( voices[j].st !== voices[j+1].st && ! this.alertedMissSync) {
                this.addWarning('Possível falta de sincronismo no compasso ' + this.currInterval + '.' ) ;
                j = voices.length;
                this.alertedMissSync = true;
            }
        }

        switch(st){
            case 1: // incluir a barra na tablatura
                // neste caso, todas as vozes são "bar", mesmo que algumas já terminaram 
                var i = 0;
                while ( i < voices.length) {
                    if(voices[i].wi.el_type && voices[i].wi.el_type === "bar" )     {
                        this.addTABChild(ABCXJS.parse.clone(voices[i].wi),line);
                        i = voices.length;
                    } else {
                        i++;
                    }
                }

                for( var i = 0; i < voices.length; i ++ ) {
                    if(voices[i].st !== 'closed')
                      voices[i].st = 'waiting for data';
                }
                this.bassBarAcc = [];
                this.trebBarAcc = [];

                break;
            case 2:
                this.addTABChild(this.extraiIntervalo(voices), line);
                break;
        }
    } 
    
    this.accordion.setTabLine(this.producedLine);
    this.vars.iChar += this.producedLine.length; // atualiza a posição onde vai começar a nova linha da tablatura
    
    return this.voice;
};

ABCXJS.tablature.Infer.prototype.read = function(p_source, item) {
    var source = p_source[item];
    switch( source.st ) {
        case "waiting for data":
            source.pos ++;
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
    // toda chave estranha às notas deve ser ignorada aqui
    while( source.voz[source.pos] &&  source.pos < source.voz.length 
            && (source.voz[source.pos].direction || source.voz[source.pos].title || source.voz[source.pos].root) ) {
        if(source.voz[source.pos].el_type === 'key') {
            if(source.bass) {
              this.accBassKey = source.voz[source.pos].accidentals;
            } else {
              this.accTrebKey = source.voz[source.pos].accidentals;
            }
        }
        source.pos ++;
    }
    
    if( source.pos < source.voz.length ) {
        source.wi = ABCXJS.parse.clone(source.voz[source.pos]);
        if( source.wi.barNumber && source.wi.barNumber !== this.currInterval && item === 0 ) {
            this.currInterval = source.wi.barNumber;
        }
        
        if( source.wi.startTriplet){
            source.triplet = true;
            this.startTriplet = source.wi.startTriplet;
            this.multiplier = this.startTriplet.num===2?1.5:(this.startTriplet.num-1)/this.startTriplet.num;
        }
        
        this.checkTies(source);
        source.st = (source.wi.el_type && source.wi.el_type === "bar") ? "waiting end of interval" : "processing";
        return (source.wi.el_type && source.wi.el_type === "bar") ? 1 : 2;
    } else {
        source.st = "closed";
        return 0;
    }
       
};

ABCXJS.tablature.Infer.prototype.extraiIntervalo = function(voices) {
    var minDur = 100;
    
    for( var i = 0; i < voices.length; i ++ ) {
        if( voices[i].st === 'processing' && voices[i].wi.duration && voices[i].wi.duration > 0  
                && voices[i].wi.duration*(voices[i].triplet?this.multiplier:1) < minDur ) {
            minDur = voices[i].wi.duration*(voices[i].triplet?this.multiplier:1);
        }
    }
    ;
    var wf = { el_type: 'note', duration: Number((minDur/this.multiplier).toFixed(5)), startChar: 0, endChar: 0, line:0, pitches:[], bassNote: [] }; // wf - final working item
    
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
                var v = [];
                for( var j = 0; j < elem.pitches.length; j ++  ) {
                  var note = this.accordion.getNoteName(elem.pitches[j], this.accBassKey, this.bassBarAcc, true);
                  v[j] = note.value + note.octave*12;
                }
                var b = this.determineBassChord( v );
                if( b.isChord ) {
                    elem.pitches[0].pitch =  elem.pitches[b.inversion].pitch;
                    elem.pitches[0].verticalPos =  elem.pitches[b.inversion].verticalPos;
                    elem.pitches[0].chord = b.isChord;
                    elem.pitches[0].minor = b.isMinor;
                    elem.pitches.splice(1, elem.pitches.length - 1);
                }
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
        if( elem.wi.endTriplet && voices[i].wi.duration <= 0.0001 ){
            this.endTriplet = true;
            elem.triplet = false;
            this.multiplier = 1;
        }
    }    
        
    //trata intervalo vazio (quando há pausa em todas as vozes e não são visíveis)
    if(wf.pitches.length === 0 && wf.bassNote.length === 0 ) {
        wf.pitches[0] = {type:'rest', c:'scripts.tabrest'}; 
    }
    return wf;
    
};

ABCXJS.tablature.Infer.prototype.determineBassChord = function(deltas) {
  var ret = {isChord:false, isMinor:false, inversion:0};
  
  //Considerando a formação de acordes, com relação ao intervalo de semitons, podemos dizer que:
  // Um acorde maior é formado por sua tonica (0) + a terça maior (+4 semitons) + a quinta justa (+3 semitons),
  // assim o acorde Dó maior, C-E-G é 043. Dó menor, C-Eb-G será 034
  // as inversões (1) G-c-e e (2) E-G-c e também podem ser representadas por estes mnemonicos
  var aDeltas = {
     '043': { isMinor: false, inversion:0 } 
    ,'034': { isMinor: true,  inversion:0 } 
    ,'035': { isMinor: false, inversion:2 } 
    ,'045': { isMinor: true,  inversion:2 } 
    ,'054': { isMinor: false, inversion:1 } 
    ,'053': { isMinor: true,  inversion:1 } 
  };
  
  switch(deltas.length) {
      case 1: 
          break;
      case 2: 
          this.addWarning('Acorde não reconhecido: ' + '0' + (deltas[1]-deltas[0]) + '.');
          break;
      case 3:
          var map = '0' + (deltas[1]-deltas[0]) + (deltas[2]-deltas[1]);
          try{
              ret = {isChord:true, isMinor:aDeltas[map].isMinor, inversion:aDeltas[map].inversion};
          } catch(e) {
            this.addWarning('Acorde não reconhecido: ' + map + '.');
          }
          break;
      default:
          this.addWarning('Acorde com mais de 3 notas não é suportado.');
          break;
  }
  
  return ret;
};


ABCXJS.tablature.Infer.prototype.setTies = function(voice) {
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            if( voice.wi.pitches[j].tie ) {
                if(voice.wi.pitches[j].tie.id_end){
                    voice.ties[voice.wi.pitches[j].tie.id_end] = false;
                }
                if(voice.wi.pitches[j].tie.id_start){
                    voice.ties[voice.wi.pitches[j].tie.id_start] = 100+voice.wi.pitches[j].pitch;
                }
            }
        }
    }
};

ABCXJS.tablature.Infer.prototype.checkTies = function(voice) {
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var i = 1; i < voice.ties.length; i ++ ) {
            var found = false;
            for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
                found = found || (100+voice.wi.pitches[j].pitch === voice.ties[i]);
            }      
            if(!found && voice.ties[i] ) {
                voice.wi.pitches.push({pitch: voice.ties[i], verticalPos: voice.ties[i], inTie:true});
            }    
        }
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            if(voice.wi.pitches[j].tie){
                if(voice.wi.pitches[j].tie.id_end) {
                    voice.wi.pitches[j].inTie = true;
                } 
            }      
        }       
    }    
};

ABCXJS.tablature.Infer.prototype.addTABChild = function(token, line ) {
    var xi = this.producedLine.length; // posição atual a linha de tabladura

    if (token.el_type !== "note") {
        var xf = 0;
        if( this.barTypes[token.type] ){
            xf = this.registerLine((token.repeat>2?":".repeat(token.repeat-2):"")+this.barTypes[token.type] + 
                    (token.startEnding?token.startEnding:"") + " ");
        } else {
            throw new Error( 'ABCXJS.tablature.Infer.prototype.addTABChild(token_type): ' + token.type );
        }
        this.add(token, xi, xf - 1, line );
        return;
    }
    
    var child = {
         el_type: token.el_type 
        ,startChar: 0
        ,endChar: 0
        ,line: 0
        ,pitches: []
        ,duration: token.duration
        ,bellows: ""
    };

    var bass = token.bassNote.length>0;
    var column = token.pitches;
    var allOpen = true;
    var allClose = true;
    var baixoClose = true;
    var baixoOpen = true;
    var inTie = false;

    var qtd = column.length;
    
    if( this.startTriplet ) {
        child.startTriplet = this.startTriplet;
        this.startTriplet = false;
        this.registerLine( '(' + child.startTriplet.num + '::' + child.startTriplet.notes + ' ' );
    }
    
    if( this.endTriplet ) {
        child.endTriplet = true;
        this.endTriplet = false;
    }
    
    // inicialmente as notas estão na posição "fechando". Se precisar alterar para "abrindo" este é offset da altura
    var offset = (qtd>=3?-(this.offset-(2.8*(qtd-2))):-this.offset);

    var pitchBase = 18;
    var tt = "tabText";

    if(token.bassNote.length>1) {
       pitchBase = 21.3;
       tt = "tabText2";
       ABCXJS.write.sortPitch(token.bassNote);
    }
    
    for (var b = 0; b < token.bassNote.length; ++b) {
        inTie = (token.bassNote[b].inTie|| inTie);
        switch(token.bassNote[b].type) {
            case 'rest':
            case 'invisible':
            case 'spacer':
                child.pitches[b] = {bass: true, type: token.bassNote[b].type, c: 'scripts.tabrest', pitch: 0.7 + pitchBase - (b * 3)};
                this.registerLine('z');
                break;
            default:
                var item = { bass:true, type: tt, c: "", pitch: pitchBase - (b * 3) - 0.5, inTie: token.bassNote[b].inTie || false };
                var note = this.accordion.getNoteName(token.bassNote[b], this.accBassKey, this.bassBarAcc, true);
                item.buttons = this.accordion.loadedKeyboard.getButtons(note);
                baixoOpen  = baixoOpen  ? typeof (item.buttons.open) !== "undefined" : false;
                baixoClose = baixoClose ? typeof (item.buttons.close) !== "undefined" : false;
                item.note = note.key + (note.isMinor?"m":"");
                item.c =  (item.buttons.close || item.buttons.open) ? ( item.inTie ?  'scripts.rarrow': item.note ) :  'x';
                child.pitches[b] = item;
                this.registerLine(child.pitches[b].c === 'scripts.rarrow' ? '>' : child.pitches[b].c);
                
        }
    }

    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        inTie = (item.inTie || inTie);
        switch(item.type) {
            case 'invisible':
            case 'spacer':
            case 'rest':
                item.c = 'scripts.tabrest';
                item.pitch = 13.2;
                break
            default:
                var note = this.accordion.getNoteName(item, this.accTrebKey, this.trebBarAcc, false);
                
                if( this.transposeTab ) {
                    switch(this.transposeTab){
                        case 8: note.octave ++; break;
                        case -8: note.octave --; break;
                        default:
                            this.addWarning('Possível transpor a tablatura uma oitava acima ou abaixo +/-8. Ignorando transpose.') ;
                    }
                }
                
                item.buttons = this.accordion.loadedKeyboard.getButtons(note);
                item.note = note.key + note.octave;
                item.c =  (item.buttons.close || item.buttons.open) ? ( item.inTie ?  'scripts.rarrow': item.note ) :  'x';
                item.pitch = (qtd === 1 ? 11.7 : 13.4 -( c * 2.8));
                item.type = "tabText" + (qtd > 1 ? 2 : "");

                allOpen = allOpen ? typeof (item.buttons.open) !== "undefined" : false;
                allClose = allClose ? typeof (item.buttons.close) !== "undefined" : false;
        }
        
        child.pitches[child.pitches.length] = item;
    }
    
    if( inTie ) {
        // inversão impossível
        this.count += child.duration;
    } else {
        // verifica tudo: baixo e melodia
        if ((this.closing && baixoClose && allClose) || (!this.closing && baixoOpen && allOpen)) {
            // manteve o rumo, mas verifica o fole, virando se necessario (e possivel)
            if ( this.count < this.limit) {
                this.count += child.duration;
            } else {
                // neste caso só muda se é possível manter baixo e melodia    
                if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
                    this.count = child.duration;
                    this.closing = !this.closing;
                } else {
                    this.count += child.duration;
                }
            }
        } else if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
            //mudou o rumo, mantendo baixo e melodia
            this.count = child.duration;
            this.closing = !this.closing;
        } else {
            // não tem teclas de melodia e baixo simultaneamente: privilegia o baixo, se houver.
            if ((this.closing && ((bass && baixoClose) || allClose)) || (!this.closing && ((bass && baixoOpen) || allOpen))) {
                this.count += child.duration;
            } else if ((!this.closing && ((bass && baixoClose) || allClose)) || (this.closing && ((bass && baixoOpen) || allOpen))) {
                if (  this.count < this.limit) {
                    this.count += child.duration;
                } else {
                    // neste caso só muda se é possível manter baixo ou melodia    
                    if ((!this.closing && (bass && baixoClose) && allClose) || (this.closing && (bass && baixoOpen) && allOpen)) {
                        this.count = child.duration;
                        this.closing = !this.closing;
                    } else {
                        this.count += child.duration;
                    }
                }
            }
        }
    }
    
    // seria a melhor hora para indicar baixo incompativel?
    if ( (baixoClose || baixoOpen) && ( (this.closing && !baixoClose)  || (!this.closing && !baixoOpen) ) ) {
        this.registerInvalidBass();
    }

    child.bellows = this.closing ? "+" : "-";
    this.registerLine(child.bellows);
    this.registerLine(qtd > 1 ? "[" : "");

    // segunda passada: altera o que será exibido, conforme definições da primeira passada
    column = child.pitches;
    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        if (!item.bass) {
            if (!this.closing)
                item.pitch += offset;
            switch(item.type) {
                case 'rest':
                case 'invisible':
                case 'spacer':
                    this.registerLine('z');
                    break;
                default:
                    // esse código pode ser melhorado. Nota não encontrada já foi definida previmente 
                    if ( item.inTie  ) {
                        this.registerLine((item.buttons.close || item.buttons.open)? '>': 'x' );
                    } else {
                        item.c = this.elegeBotao(this.closing ? item.buttons.close : item.buttons.open);
                        this.registerLine(this.button2Hex(item.c));
                        if( item.c === 'x'){
                            this.registerMissingButton(item);
                       }
                    }
            }
        } else {
            if( item.c === 'x') {
                this.registerMissingButton(item);
            }
        }
    }
    var dur = child.duration / this.vars.default_length;
    var xf = this.registerLine((qtd > 1 ? "]" : "") + (dur !== 1 ? dur.toString() : "") + " ");
    
    if( child.endTriplet ) {
        this.registerLine( ') ' );
    }
    
    this.add(child, xi, xf-1, line);
};

ABCXJS.tablature.Infer.prototype.registerInvalidBass = function() {
    var barNumber = parseInt(this.currInterval);
    if( ! this.vars.invalidBasses )  this.vars.invalidBasses = ',';
    
    if( this.vars.invalidBasses.indexOf( ','+barNumber+',' ) < 0 ) {
        this.vars.invalidBasses += barNumber + ',';
    }
};

ABCXJS.tablature.Infer.prototype.registerMissingButton = function(item) {
    if( ! this.vars.missingButtons[item.note] )  
        this.vars.missingButtons[item.note] = [];
    var bar = parseInt(this.currInterval);
    for( var i=0; i < this.vars.missingButtons[item.note].length; i++) {
        if ( this.vars.missingButtons[item.note][i] === bar ) return; // already listed
    }
    this.vars.missingButtons[item.note].push(bar);
};

ABCXJS.tablature.Infer.prototype.registerLine = function(appendStr) {
  this.producedLine += appendStr;
  return this.producedLine.length;
};

ABCXJS.tablature.Infer.prototype.add = function(child, xi, xf, line) {
    
    if( ABCXJS.math.isNumber(line) &&
        ABCXJS.math.isNumber(xi) &&
        ABCXJS.math.isNumber(xf) ) {
        child.position = { anchor: {line: line, ch: xi}, head: {line: line, ch: xf} };     
    }
    
    this.voice.push(child);
};

ABCXJS.tablature.Infer.prototype.button2Hex = function( b ) {
    if(b === 'x') return b;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var n = b.substr(0, p);
    return (+n).toString(16) + b.substr(p);
};

// tenta encontrar o botão mais próximo do último
ABCXJS.tablature.Infer.prototype.elegeBotao = function( array ) {
    if(typeof(array) === "undefined" ) return "x";

    var b     = array[0];
    var v,l,i = b.indexOf("'");
    
    if( i >= 0 ) {
        v = b.substr(0, i);
        l = b.length - i;
    } else {
        v = parseInt(b);
        l = 0;
    }
    
    var min  = Math.abs((l>1?v+12:v)-this.lastButton);
    
    for( var a = 1; a < array.length; a ++ ) {
        i = array[a].indexOf("'");

        if( i >= 0 ) {
            v = array[a].substr(0, i);
            l = array[a].length - i;
        } else {
            v = parseInt(array[a]);
            l = 0;
        }
        
        if( Math.abs((l>1?v+12:v)-this.lastButton) < min ) {
           b = array[a];
           min = Math.abs((l>1?v+12:v)-this.lastButton);
        }
    }
    this.lastButton = parseInt(isNaN(b.substr(0,2))? b.substr(0,1): b.substr(0,2));
    return b;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};
    
ABCXJS.tablature.Layout = function( tuneCurrVoice, tuneCurrStaff, abcstaff, glyphs, restsInTab  ) {
   this.pos = 0;
   this.voice = {};
   this.currvoice = [];
   this.tuneCurrVoice = tuneCurrVoice;
   this.tuneCurrStaff = tuneCurrStaff;
   this.abcstaff = abcstaff;
   this.glyphs = glyphs;
   this.restsInTab = restsInTab;
   this.tripletmultiplier = 1;
};

ABCXJS.tablature.Layout.prototype.getElem = function() {
    if (this.currVoice.length <= this.pos)
        return null;
    return this.currVoice[this.pos];
};

ABCXJS.tablature.Layout.prototype.isFirstVoice = function() {
    return this.currVoice.firstVoice || false;
};

ABCXJS.tablature.Layout.prototype.isLastVoice = function() {
    return this.currVoice.lastVoice || false;
};

ABCXJS.tablature.Layout.prototype.printTABVoice = function(layoutJumpDecorationItem) {
    this.layoutJumpDecorationItem = layoutJumpDecorationItem;
    this.currVoice = this.abcstaff.voices[this.tuneCurrVoice];
    this.voice = new ABCXJS.write.VoiceElement(this.tuneCurrVoice, this.tuneCurrStaff, this.abcstaff);

    this.voice.addChild(this.printClef(this.abcstaff.clef));
    this.voice.addChild(new ABCXJS.write.AbsoluteElement(this.abcstaff.key, 0, 10));
    (this.abcstaff.meter) && this.voice.addChild(this.printTablatureSignature(this.abcstaff.meter));
    for (this.pos = 0; this.pos < this.currVoice.length; this.pos++) {
        var abselems = this.printTABElement();
        for (i = 0; i < abselems.length; i++) {
            this.voice.addChild(abselems[i]);
        }
    }
    return this.voice;
};

// return an array of ABCXJS.write.AbsoluteElement
ABCXJS.tablature.Layout.prototype.printTABElement = function() {
  var elemset = [];
  var elem = this.getElem();
  
  switch (elem.el_type) {
  case "note":
    elemset[0] = this.printTabNote(elem);
    break;
  case "bar":
    elemset[0] = this.printBarLine(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  default: 
    var abselem = new ABCXJS.write.AbsoluteElement(elem,0,0);
    abselem.addChild(new ABCXJS.write.RelativeElement("element type "+elem.el_type, 0, 0, 0, {type:"debug"}));
    elemset[0] = abselem;
  }

  return elemset;
};

ABCXJS.tablature.Layout.prototype.printTabNote = function(elem) {
    var p, pp;
    
    if (elem.startTriplet)  {
        this.tripletmultiplier = elem.startTriplet.num === 2 ? 1.5 : (elem.startTriplet.num-1)/elem.startTriplet.num;
    }
    
    var duration = ABCXJS.write.getDuration(elem);
    if (duration === 0) {
        duration = 0.25;
    }   // PER: zero duration will draw a quarter note head.
    var durlog = ABCXJS.write.getDurlog(duration);
    var abselem = new ABCXJS.write.AbsoluteElement(elem, duration*this.tripletmultiplier, 1);

    // determine averagepitch, minpitch, maxpitch and stem direction
    var sum = 0;
    var allRests = true;
    
    for (p = 0, pp = elem.pitches.length; p < pp; p++) {
        sum += elem.pitches[p].verticalPos;
        allRests = (elem.pitches[p].type === 'rest' && allRests);
    }

    elem.averagepitch = sum / elem.pitches.length;
    elem.minpitch = elem.pitches[0].verticalPos;
    elem.maxpitch = elem.pitches[elem.pitches.length - 1].verticalPos;

    for (p = 0; p < elem.pitches.length; p++) {
        var curr = elem.pitches[p];
        var rel = new ABCXJS.write.RelativeElement(null, 0, 0, curr.pitch);
        if (curr.type === "rest" ) {
            rel.type = "symbol";
            if(this.restsInTab || (allRests && p === (elem.pitches.length-1))) {
                rel.c = 'scripts.tabrest';
            } else {
                rel.c = '';
            }
        } else {
            rel.c = curr.c.replace('m', '-');
            rel.note = curr.note;
            rel.type = curr.type;
        }
        abselem.addHead(rel);
    }
    
    if( elem.endTriplet ) {
        this.tripletmultiplier =1;
    }

    return abselem;
};

ABCXJS.tablature.Layout.prototype.printClef = function(elem) {
  var clef = "clefs.tab";
  var dx = 8;
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,10);
  abselem.addRight(new ABCXJS.write.RelativeElement(clef, dx, this.glyphs.getSymbolWidth(clef), elem.clefPos)); 
  return abselem;
};

ABCXJS.tablature.Layout.prototype.printTablatureSignature= function(elem) {
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,20);
  var dx = 2;
  
  abselem.addRight(new ABCXJS.write.RelativeElement('Bass', dx, 15, 17.5, {type:"tabText"} ) );
  abselem.addRight(new ABCXJS.write.RelativeElement('>><<', dx, 15, 10.8, {type:"tabText"} ) );
  abselem.addRight(new ABCXJS.write.RelativeElement('<<>>', dx, 15,  3.7, {type:"tabText"} ) );
  
  this.startlimitelem = abselem; // limit ties here
  return abselem;
};

ABCXJS.tablature.Layout.prototype.printBarLine = function (elem) {
// bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat

    var topbar = 19.5;
    var yDot = 10.5;

    var abselem = new ABCXJS.write.AbsoluteElement(elem, 0, 10);
    var anchor = null; // place to attach part lines
    var dx = 0;


    var firstdots = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var firstthin = (elem.type !== "bar_left_repeat" && elem.type !== "bar_thick_thin" && elem.type !== "bar_invisible");
    var thick = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" || elem.type === "bar_left_repeat" ||
            elem.type === "bar_thin_thick" || elem.type === "bar_thick_thin");
    var secondthin = (elem.type === "bar_left_repeat" || elem.type === "bar_thick_thin" || elem.type === "bar_thin_thin" || elem.type === "bar_dbl_repeat");
    var seconddots = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat");

    // limit positioning of slurs
    if (firstdots || seconddots) {
        for (var slur in this.slurs) {
            if (this.slurs.hasOwnProperty(slur)) {
                this.slurs[slur].endlimitelem = abselem;
            }
        }
        this.startlimitelem = abselem;
    }

    if (firstdots) {
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
        dx += 6; //2 hardcoded, twice;
    }

    if (firstthin) {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
    }

    if (elem.type === "bar_invisible" || elem.endDrawEnding) {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "none", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
    }

    if (elem.decoration) {
        // não há decorations na tablatura
        //this.printDecoration(elem.decoration, 12, (thick)?3:1, abselem, 0, "down", 2);
    }
    
    if (elem.jumpDecoration) {
        for(var j=0; j< elem.jumpDecoration.length; j++ ) {
            if(( elem.jumpDecoration[j].upper && this.isFirstVoice() ) || ( !elem.jumpDecoration[j].upper && this.isLastVoice() ) ) {
                var pitch = elem.jumpDecoration[j].upper ? 12 : -4;
                abselem.addRight( this.layoutJumpDecorationItem(elem.jumpDecoration[j], pitch) );
            }
        }
    }
                
    if (thick) {
        dx += 4; //3 hardcoded;    
        anchor = new ABCXJS.write.RelativeElement(null, dx, 4, 0, {"type": "bar", "pitch2": topbar, linewidth: 4});
        abselem.addRight(anchor);
        dx += 5;
    }

    if (this.partstartelem && elem.endDrawEnding) {
        if (elem.endDrawEnding)
            this.partstartelem.anchor2 = anchor;
        if (elem.endEnding)
            this.partstartelem = null;
    }

    if (secondthin) {
        dx += 3; //3 hardcoded;
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor); // 3 is hardcoded
    }

    if (seconddots) {
        dx += 3; //3 hardcoded;
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
    } // 2 is hardcoded

    if (elem.startEnding) {
        this.partstartelem = new ABCXJS.write.EndingElem(elem.startEnding, anchor, null);
        this.voice.addOther(this.partstartelem);
    }

    return abselem;

};
