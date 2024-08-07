/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.color = {};
DIATONIC.map.color.fill = 'none';
DIATONIC.map.color.background = 'none';
DIATONIC.map.color.open = '#00ff00';
DIATONIC.map.color.close = '#00b2ee';

DIATONIC.map.loadAccordionMaps = function ( files, opts, cb )  {
    
    if( ! DIATONIC.map.accordionMaps )
        DIATONIC.map.accordionMaps = [];
    
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++ ) {
        toLoad ++;
        FILEMANAGER.register('MAP');

        $.getJSON( files[f], {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('MAP', true);
                DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap(data, false, opts) );
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('MAP', false);
                var err = textStatus + ", " + error;
                waterbug.log( "Accordion Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --; 
                if( toLoad === 0 ) {
                    DIATONIC.map.sortAccordions();
                    cb && cb();
                }
            });
    }
};

DIATONIC.map.sortAccordions = function () {
    DIATONIC.map.accordionMaps.sort( function(a,b) { 
        return parseInt(a.menuOrder) - parseInt(b.menuOrder);
    });
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.AccordionMap = function (res, local, opts) {
    this.id = res.id;
    this.menuOrder = res.menuOrder;
    this.model = res.model;
    this.tuning = res.tuning;
    this.buttons = res.buttons;
    this.image = res.image || 'images/accordions/accordion.default.gif';
    this.keyboard = new DIATONIC.map.Keyboard( res.keyboard, res.pedal, opts );
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

DIATONIC.map.AccordionMap.prototype.getId = function () {
    return this.id;
};

DIATONIC.map.AccordionMap.prototype.getFullName = function () {
    return this.getTxtModel() + " " + this.getTxtTuning() + " - " + this.getTxtNumButtons();
};

DIATONIC.map.AccordionMap.prototype.getTxtModel = function () {
    return this.model;
};

DIATONIC.map.AccordionMap.prototype.getTxtNumButtons = function() {
    var a = this.buttons;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' + a[c] + str_label;
    }
    return a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getTxtTuning = function() {
    var a = this.tuning;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' +  a[c] + str_label;
    }
    return  a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getPathToImage = function () {
    return this.image;
};

DIATONIC.map.AccordionMap.prototype.getAbcText = function (type, title) {
    return this[type].items[title];
};

DIATONIC.map.AccordionMap.prototype.setSong = function (name, content, addSort) {
    this.songs.items[name] = content;
    if( addSort ) this.songs.sortedIndex.push( name );
};

DIATONIC.map.AccordionMap.prototype.getFirstSong = function () {
    var ret = this.songs.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstPractice = function () {
    var ret = this.practices.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstChord = function () {
    var ret = this.chords.sortedIndex[0] || "";
    return ret;
};


//DIATONIC.map.AccordionMap.prototype.getChord = function (name) {
//
//DIATONIC.map.AccordionMap.prototype.getChord = function (name) {
//    return this.chords.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.setChord = function (name,content, addSort) {
//    this.chords.items[name] = content;
//    if(addSort) this.chords.sortedIndex.push( name );
//};
//
//DIATONIC.map.AccordionMap.prototype.getSong = function (name) {
//    return this.songs.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.getPractice = function (name) {
//    return this.practices.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.setPractice = function (name,content, addSort) {
//    this.practices.items[name] = content;
//    if(addSort) this.practices.sortedIndex.push( name );
//};

DIATONIC.map.AccordionMap.prototype.loadABCX = function(pathList, cb ) {
    var toLoad = 0;
    var path;
    var objRet = { items:{}, ids: {}, details:{}, sortedIndex: [] };
    for (var s = 0; s < pathList.length; s++) {
        toLoad ++;
        FILEMANAGER.register('ABCX');
        path = pathList[s];
        $.get( path )
            .done( function( data ) {
                FILEMANAGER.deregister('ABCX', true);
                var tunebook = new ABCXJS.TuneBook(data);
                for (var t = 0; t < tunebook.tunes.length; t ++)  {
                    var tune = tunebook.tunes[t];
                    var id = tune.id;
                    var hidden = false;
                    if( id.toLowerCase().charAt(0) === 'h' ) {
                        id = id.substr(1);
                        hidden = true;
                    }
                    
                    objRet.ids[id] = tune.title;
                    objRet.items[tune.title] = tune.abc;
                    objRet.details[tune.title] = { composer: tune.composer, id: id, hidden: hidden  };
                    objRet.sortedIndex.push( tune.title );
                }    
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('ABCX', false);
                var err = textStatus + ", " + error;
                if( data && data.responseText !== undefined )
                    waterbug.log( "ABCX Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
                else
                    waterbug.log( "ABCX Load Failed:\nLoading: " + path + "...\nError:\n " + err );
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

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Keyboard = function (keyMap, pedalInfo, opts) {

    this.pedalInfo = pedalInfo;
    this.layout = keyMap.layout;
    this.keys = keyMap.keys;
    this.basses = keyMap.basses;
    this.noteToButtonsOpen = {};
    this.noteToButtonsClose = {};
    this.legenda = {};
    this.baseLine = {}; // linha decorativa
    this.opts = opts || {};
    this.divs = { container: null, pane: null, imagem: null, extras: null, rotateBtnExtra: null, globeBtnExtra: null, openBtnRight: null}

    // gaitas que terao a opcao para tablatura numerica portuguesa
    this.rowsNumbered  = false;
    this.numerica = keyMap.numerica || null;
    this.pautaNumerica = 0;
    this.pautaNumericaMini = true;
    this.pautaNumericaFormato = null;

    this.limits = { minX: 10000, minY: 10000, maxX: 0, maxY: 0 };

    this.radius = 26;
    this.size = this.radius * 2 + 4;

    this.setup(keyMap);
};

DIATONIC.map.Keyboard.prototype.setup = function (keyMap) {

    var x, y, yi;

    var nIlheiras = keyMap.keys.open.length;
    var nIlheirasBaixo = keyMap.basses.open.length;

    this.keyMap = new Array();
    this.modifiedItems = new Array();

    // ilheiras da mao direita
    var maiorIlheira = 0;
    for (i = 0; i < nIlheiras; i++) {
        this.keyMap[i] = new Array(keyMap.keys.open[i].length);
        maiorIlheira = Math.max(keyMap.keys.open[i].length, maiorIlheira);
    }

    // ilheiras da mao esquerda
    var maiorIlheiraBaixo = keyMap.basses.open[0].length;
    for (i = nIlheiras; i < nIlheiras + nIlheirasBaixo; i++) {
        this.keyMap[i] = new Array(keyMap.basses.open[i - nIlheiras].length);
    }
    if (this.opts.isApp)
        this.width = (nIlheiras + nIlheirasBaixo) * (this.size) + 21 + 3; // printApp
    else
        this.width = (nIlheiras + nIlheirasBaixo) * (this.size) + this.size + 3;

    this.height = (maiorIlheira) * (this.size) + 3;

    var bassY = (maiorIlheiraBaixo === 4 ? 4 : 3) * this.size;
    bassY += (maiorIlheira - 11) / 2 * this.size; // move meio botão baixo nas gaitas com mais botões

    var openRow, closeRow, bass, noteVal;

    for (var j = 0; j < this.keyMap.length; j++) {

        if (j < nIlheiras) {
            x = (j + 0.5) * (this.size);
            yi = this.getLayout(j) * this.size;
            openRow = keyMap.keys.open[j];
            closeRow = keyMap.keys.close[j];
            bass = false;
        } else {
            if (this.opts.isApp)
                x = (j + 0.5) * (this.size) + 21; // printApp
            else
                x = (j + 0.5) * (this.size) + this.size;
            yi = bassY;
            openRow = keyMap.basses.open[j - nIlheiras];
            closeRow = keyMap.basses.close[j - nIlheiras];
            bass = true;
        }

        for (var i = 0; i < this.keyMap[j].length; i++) {

            y = yi + (i + 0.5) * this.size;

            this.limits.minX = Math.min(this.limits.minX, x);
            this.limits.minY = Math.min(this.limits.minY, y);
            this.limits.maxX = Math.max(this.limits.maxX, x);
            this.limits.maxY = Math.max(this.limits.maxY, y);

            var btn = new DIATONIC.map.Button(this, x - this.radius, y - this.radius, { radius: this.radius, isPedal: this.isPedal(i, j) });

            btn.tabButton = (i + 1) + Array(j + 1).join("'");
            btn.openNote = this.parseNote(openRow[i], bass);
            btn.closeNote = this.parseNote(closeRow[i], bass);

            noteVal = this.getNoteVal(btn.openNote);
            if (!this.noteToButtonsOpen[noteVal]) this.noteToButtonsOpen[noteVal] = [];
            this.noteToButtonsOpen[noteVal].push(btn.tabButton);

            noteVal = this.getNoteVal(btn.closeNote);
            if (!this.noteToButtonsClose[noteVal]) this.noteToButtonsClose[noteVal] = [];
            this.noteToButtonsClose[noteVal].push(btn.tabButton);

            this.keyMap[j][i] = btn;
        }
    }
    // posiciona linha decorativa
    if (this.opts.isApp)
        x = (nIlheiras) * (this.size) + 12 //printApp
    else
        x = (nIlheiras) * (this.size) + this.size / 2;

    y = bassY - (0.5 * this.size);

    this.baseLine = { x: x, yi: y, yf: y + ((maiorIlheiraBaixo + 1) * this.size) };

    // adiciona o botão de legenda
    var raio = 40;
    this.legenda = new DIATONIC.map.Button(this, this.limits.maxX - (raio + this.radius), this.limits.minY + raio, { radius: raio, borderWidth: 2 });
};

DIATONIC.map.Keyboard.prototype.reprint = function () {
    if (this.reprintData !== undefined)
        this.print(this.reprintData.Div, this.reprintData.Accordion);
}

DIATONIC.map.Keyboard.prototype.print = function (div, accordion) {
    this.reprintData = { Div: div, Accordion: accordion }

    var sz;
    var render_opts = accordion.render_opts;
    var translator = accordion.translator 

    var estilo =
   '.keyboardPane {\n\
        padding:4px;\n\
        background-color:none;\n\
    }\n\
    .blegenda,\n\
    .button {\n\
        font-family: sans-serif, arial;\n\
        text-anchor: middle;\n\
        font-size: 16px;\n\
        font-weight: bold;\n\
        text-shadow: 0.5px 0.5px #ddd, -0.5px -0.5px 0 #ddd, 0.5px -0.5px 0 #ddd, -0.5px 0.5px 0 #ddd;\n\
    }\n\
    .keyboard-imagem {\n\
        position: absolute;\n\
        display: none;\n\
        border-radius: 50%;\n\
        background: rgba(100, 100, 100, 0.5);\n\
        box-shadow: 0 0 15px 15px rgba(100, 100, 100, 0.5);\n\
        height: 80px;\n\
        width: 80px;\n\
    }\n\
    .keyboard-imagem img {\n\
        border: none;\n\
        margin-top: -5px;\n\
        margin-left: -10px;\n\
        height: 100px;\n\
        width: 100px;\n\
    }\n\
    .keyboard-extras {\n\
        position: absolute;\n\
        display: none;\n\
        margin-top: 2px;\n\
        margin-left: 5px;\n\
        font-family: "abcx";\n\
        height: 40px;\n\
        width: fit-content;\n\
        font-size: 16px;\n\
        margin: 0;\n\
        padding: 1px;\n\
        pointer-events: auto;\n\
        background-color: none;\n\
    }\n\
    .keyboard-extras label,\n\
    .keyboard-extras button {\n\
        position: relative;\n\
        display: block;\n\
        float: left;\n\
        text-align: left;\n\
        font-family: Milonga, Arial;\n\
        font-weight: normal;\n\
        font-size: 32px;\n\
        line-height: 32px;\n\
        height: 44px;\n\
        width: auto;\n\
        text-shadow: 2px 1px 2px rgba(50, 50, 50, 0.8);\n\
        left: 0;\n\
        margin: 0;\n\
        margin-left: 4px;\n\
        padding: 4px;\n\
        outline: none !important;\n\
        border: none;\n\
        color: #ff9922;\n\
        color: red;\n\
        background-color: transparent;\n\
        border-radius: 50%;\n\
    }\n\
    .keyboard-extras button:hover {\n\
        height: 44px;\n\
        background: lavender;\n\
        cursor: pointer;\n\
    }\n\
    .buttonN {\n\
        font-family: sans-serif, arial;\n\
        text-anchor: middle;\n\
        font-size: 24px;\n\
        font-weight: bold;\n\
        text-shadow: 0.5px 0.5px #ddd, -0.5px -0.5px 0 #ddd, 0.5px -0.5px 0 #ddd, -0.5px 0.5px 0 #ddd;\n\
    }\n\
    .buttonNMini {\n\
        font-family: "AllertaStencil", "RobotoItalic";\n\
        text-anchor: middle;\n\
        font-size: 11px;\n\
        font-weight: normal;\n\
    }\n\
    .blegenda {\n\
        font-weight: normal;\n\
        font-size: 12px;\n\
    }';

    //  text-shadow: 0.5px 0.5px #ddd, -0.5px -0.5px 0 #ddd, 0.5px -0.5px 0 #ddd, -0.5px 0.5px 0 #ddd;\n\

    div.innerHTML = "";
    this.divs.container = div;

    var keyboardPane = document.createElement("div");
    keyboardPane.setAttribute("id", 'keyboardPaneDiv');
    keyboardPane.setAttribute("class", 'keyboardPane');
    this.divs.pane = keyboardPane;
    div.appendChild(keyboardPane);

    var keyboardImagem = document.createElement("div");
    keyboardImagem.setAttribute("id", 'keyboardImagemDiv');
    keyboardImagem.setAttribute("class", 'keyboard-imagem');
    this.divs.imagem = keyboardImagem;
    div.appendChild(keyboardImagem);

    this.divs.imagem.innerHTML = 
        '<img src="'+accordion.loaded.image+'" title="' +
            accordion.getFullName() + ' ' + SITE.translator.getResource('keys') + '">';
    this.divs.imagem.style.scale = render_opts.scale;

    var keyboardExtraBtn = document.createElement("div");
    keyboardExtraBtn.setAttribute("id", 'keyboardExtraBtnDiv');
    keyboardExtraBtn.setAttribute("class", 'keyboard-extras');
    this.divs.extras = keyboardExtraBtn;
    div.appendChild(keyboardExtraBtn);

    this.divs.extras.innerHTML = 
       '<button id="rotateBtnExtra" data-translate="rotate" ><i class="ico-rotate" ></i></button>\
        <button id="globeBtnExtra"  data-translate="globe" ><i class="ico-world" ></i></button>\
        <button id="openBtnRight"  data-translate="PrefsPropsCKkeyboardAlignRight" style="display:none;"><i class="ico-open-right"></i></button>'
    this.divs.extras.style.scale = render_opts.scale;

    this.divs.rotateBtnExtra = document.getElementById("rotateBtnExtra");
    this.divs.globeBtnExtra = document.getElementById("globeBtnExtra");
    this.divs.openBtnRight = document.getElementById("openBtnRight");

    this.paper = new    SVG.Printer(keyboardPane);
    this.paper.initDoc('keyb', 'Diatonic Map Keyboard', estilo, render_opts);
    this.paper.initPage(render_opts.scale);

    var legenda_opts = ABCXJS.parse.clone(render_opts);
    legenda_opts.kls = 'blegenda';
    legenda_opts.klsN = 'buttonN';
    legenda_opts.klsNMini = 'buttonNMini';
    legenda_opts.pautaNumerica = false;
    this.legenda.draw('l00', this.paper, this.limits, legenda_opts);

    var delta = this.opts.isApp ? 7 : 10;

    if (render_opts.transpose) {
        sz = { w: this.height, h: this.width };
        var mirr = render_opts.mirror ? this.baseLine.x : this.limits.maxX - (this.baseLine.x - this.limits.minX) + 2;
        for (var x = mirr - delta; x <= mirr + delta; x += delta) {
            this.drawLine(this.baseLine.yi, x, this.baseLine.yf, x);
        }
        if(render_opts.mirror){ //2
            this.divs.extras.style.top = '';
            this.divs.extras.style.left = '1px';
            this.divs.extras.style.bottom = 61.0*render_opts.scale+"px";
            this.divs.extras.style.width = 40.0*render_opts.scale+"px";
            this.divs.extras.style.right = '';
            this.divs.imagem.style.top = '';
            this.divs.imagem.style.left = '';
            this.divs.imagem.style.bottom = 25.0*render_opts.scale+"px";
            this.divs.imagem.style.right = 25.0*render_opts.scale+"px";
        } else { //4
            this.divs.extras.style.top = '1px';
            this.divs.extras.style.left = '1px';
            this.divs.extras.style.width = 40.0*render_opts.scale+"px";
            this.divs.extras.style.bottom = '';
            this.divs.extras.style.right = '';
            this.divs.imagem.style.top = 25.0*render_opts.scale+"px";
            this.divs.imagem.style.left = '';
            this.divs.imagem.style.bottom = '';
            this.divs.imagem.style.right = 25.0*render_opts.scale+"px";
        }
    } else {
        sz = { w: this.width, h: this.height };
        var mirr = render_opts.mirror ? this.limits.maxX - (this.baseLine.x - this.limits.minX) + 2 : this.baseLine.x;
        for (var x = mirr - delta; x <= mirr + delta; x += delta) {
            this.drawLine(x, this.baseLine.yi, x, this.baseLine.yf);
        }
        if(render_opts.mirror){ //1
            this.divs.extras.style.top = '1px';
            this.divs.extras.style.left = '1px';
            this.divs.extras.style.bottom = '';
            this.divs.extras.style.right = '';
            this.divs.imagem.style.top = '';
            this.divs.imagem.style.left = 25.0*render_opts.scale+"px";
            this.divs.imagem.style.bottom = 25.0*render_opts.scale+"px";
            this.divs.imagem.style.right = '';
        } else { //3
            this.divs.extras.style.top = '1px';
            this.divs.extras.style.left = '';
            this.divs.extras.style.bottom = '';
            this.divs.extras.style.right = '1px';
            this.divs.imagem.style.top = '';
            this.divs.imagem.style.left = '';
            this.divs.imagem.style.bottom = 25.0*render_opts.scale+"px";
            this.divs.imagem.style.right = 25.0*render_opts.scale+"px";
        }
    }

    var btn_opt = ABCXJS.parse.clone(render_opts);
    btn_opt.kls = 'button';
    btn_opt.klsN = 'buttonN';
    btn_opt.klsNMini = 'buttonNMini';

    btn_opt.pautaNumerica = (this.pautaNumerica > 0);
    btn_opt.pautaNumericaMini = this.pautaNumericaMini;

    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].draw('b' + j + i, this.paper, this.limits, btn_opt);
        }
    }

    this.paper.endPage(sz);
    this.paper.endDoc();

    //substraia 8 devido o padding da classe keyboardpane
    this.divs.pane.style.height = this.divs.pane.clientHeight - 8 + "px";
    this.divs.container.style.height = this.divs.pane.clientHeight + "px"; 

    //binds SVG elements
    this.legenda.setSVG(render_opts.label, { pull: 'Pull', push: 'Push', translator: translator });
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].setSVG(render_opts.label, { formatoNumerico: this.pautaNumericaFormato, mini: this.pautaNumericaMini });
        }
    }
};

DIATONIC.map.Keyboard.prototype.setTabFormat = function (val) {

    // val varia de 0 a 5, sendo que:
    //  0 e 1 são formatos não numéricos (formato 0);
    //  2 e 3 numérica ciclica (formato 1)
    //  4 e 5 numérica continua (formato 2)
    var impar = val % 2;
    var formato = ( val - ( impar ) ) / 2;

    switch( formato ) {
        case 0:
            SITE.properties.options.tabShowOnlyNumbers = false;
            this.rowsNumbered = SITE.properties.options.rowsNumbered = ( impar === 1 );
            this.pautaNumerica = 0;
            this.pautaNumericaMini = true;
            break;
        default:
            SITE.properties.options.tabShowOnlyNumbers = (impar===1);
            this.rowsNumbered = SITE.properties.options.rowsNumbered = false;
            if (this.numerica) {
                this.pautaNumerica = formato;
                this.pautaNumericaFormato = this.numerica[formato - 1];
                this.pautaNumericaMini = !SITE.properties.options.tabShowOnlyNumbers;
            } else {
                this.pautaNumerica = 0;
                this.pautaNumericaMini = true;
                this.pautaNumericaFormato = null;
            }
            break;
    }


    //SITE.properties.options.tabFormat = 1
    //SITE.properties.options.tabShowOnlyNumbers= false;
    //SITE.properties.options.rowsNumbered = false;


}

DIATONIC.map.Keyboard.prototype.drawLine = function (xi, yi, xf, yf) {
    this.paper.printLine(xi, yi, xf, yf);
};


DIATONIC.map.Keyboard.prototype.getButtons = function (note) {
    var noteVal = this.getNoteVal(note);
    return {
        open: this.noteToButtonsOpen[noteVal]
        , close: this.noteToButtonsClose[noteVal]
    };
};

DIATONIC.map.Keyboard.prototype.getNoteVal = function (note) {
    //noteVal sera um numero. 
    //Notas serão = key + octave * 12 (to avoid #/b problem)
    //Baixos serão = 0 a 11
    //Acordes Maiores de -12 a -1
    //Acordes menores de -24 a -13
    //Acordes Maiores com sétima de -36 a -25
    //Acordes Menores com sétima de -48 a -37
    let delta  = 0;
    if (note.isBass && note.isChord ) {
        delta = -12;
        if(note.isMinor) delta -= 12;
        if(note.isSetima) delta -= 24;
    }

    return ABCXJS.parse.key2number[note.key.toUpperCase()] + (note.isBass ? delta : note.octave * 12);
};

DIATONIC.map.Keyboard.prototype.getLayout = function (r) {
    return this.layout[r] || 0;
};

DIATONIC.map.Keyboard.prototype.showImagem = function (show) {
    this.divs.imagem.style.display = show? 'block' : 'none';
};

DIATONIC.map.Keyboard.prototype.showExtras = function (show) {
    this.divs.extras.style.display = show? 'inline' : 'none';
};

DIATONIC.map.Keyboard.prototype.showExtrasOpen = function (show) {
    this.divs.openBtnRight.style.display = show? 'block' : 'none';
};


DIATONIC.map.Keyboard.prototype.isPedal = function (i, j) {
    return (this.pedalInfo[1] === (i + 1)) && (this.pedalInfo[0] === (j + 1));
};

DIATONIC.map.Keyboard.prototype.parseNote = function (txtNota, isBass) {

    var nota = { key: undefined, value: undefined, octave: 4, isBass: false, isChord: false, isMinor: false, isSetima: false };

    var s = txtNota;
    var minor = s.indexOf('m')>=0;
    var sept = s.indexOf('7')>=0;
    var k = s.charAt(s.length - 1);

    if(isBass){
        s = s.replace(':','');
        if(minor) s = s.replace('m','');
        if(sept) s = s.replace('7','');
        nota.isBass = isBass;
        nota.isChord = (s === s.toLowerCase());
        nota.isMinor = minor;
        nota.isSetima = sept;
        k = s.charAt(s.length - 1);
    }

    nota.key = parseInt(k) ? s.replace(k, '') : s;

    { // tratar o conceito de variantes de botões - para diferenciar quando há dois baixos iguais no mesmo movimento de fole.
        nota.variant = this.getVariant(nota.key.charAt(nota.key.length - 1))

        // se existe uma variante, remove da chave, mantendo apenas no metadado.
        if (nota.variant > 0) {
            nota.key = nota.key.substring(0, nota.key.length - 1);
        }
    }

    nota.octave = parseInt(k) ? parseInt(k) : 4;
    nota.value = ABCXJS.parse.key2number[nota.key.toUpperCase()];

    //nota.complement = s[1] ? s[1] : "";
    //  if( nota.key.indexOf( '♯' ) >= 0 || nota.key.indexOf( '♭' ) >= 0 ) {
    //      if(nota.key.indexOf( '♯' ) >= 0) {
    //            window.ABCXJS.parse.number2key[nota.value] = window.ABCXJS.parse.number2keysharp[nota.value];
    //            window.ABCXJS.parse.number2key_br[nota.value] = window.ABCXJS.parse.number2keysharp_br[nota.value];
    //      } else {
    //            window.ABCXJS.parse.number2key[nota.value] = window.ABCXJS.parse.number2keyflat[nota.value];
    //            window.ABCXJS.parse.number2key_br[nota.value] = window.ABCXJS.parse.number2keyflat_br[nota.value];
    //      }
    //  }

    if (typeof (nota.value) === "undefined") {
        // para debug veja this.abctune.lines[this.line].staffs[this.staff].voices[this.voice][this.pos]
        throw new Error('Nota inválida: ' + txtNota);
    };

    return nota;
};

DIATONIC.map.Keyboard.prototype.getVariant = function (v) {
    switch (v) {
        case '¹': return 1;
        case '²': return 2;
        case '³': return 3;
        default: return 0;
    }
}

DIATONIC.map.Keyboard.prototype.redraw = function (render_opts) {
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            if (this.pautaNumericaMini || !this.keyMap[j][i].isNumerica)
                this.keyMap[j][i].setText(render_opts.label);
        }
    }
};

DIATONIC.map.Keyboard.prototype.clear = function (full) {
    full = true; // modificação em andamento
    if (full) {
        for (var j = 0; j < this.keyMap.length; j++) {
            for (var i = 0; i < this.keyMap[j].length; i++) {
                this.keyMap[j][i].clear();
            }
        }
    } else {
        for (var i = 0; i < this.modifiedItems.length; i++) {
            this.modifiedItems[i].clear();
        }
    }
    this.modifiedItems = new Array();
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Button = function( kb, x, y, options ) {

    var opt = options || {};
    
    this.kb = kb;
    this.x = x;
    this.y = y;
    
    this.openNote = null;
    this.closeNote = null;
    this.tabButton = null;
    
    this.SVG  = {gid: 0}; // futuro identificador
    
    this.radius = opt.radius;
    this.isPedal  = opt.isPedal || false;
    this.borderWidth = opt.borderWidth || (this.isPedal?2:1);
    this.borderColor = opt.borderColor || (this.isPedal?'red':'black');

};

DIATONIC.map.Button.prototype.draw = function( id, printer, limits, options ) {
    
    var currX, currY;

    if( options.transpose ) {
        //horizontal
        currX = this.y;
        currY = options.mirror ? this.x : limits.maxX - this.radius*2 - (this.x - limits.minX);
    } else {
        //vertical
        currX = options.mirror ? limits.maxX - this.radius*2 - (this.x - limits.minX): this.x;
        currY = this.y;
    }
    
    options = options || {};
    options.radius = this.radius;
    options.borderColor = this.borderColor;
    options.borderWidth = this.borderWidth;
    options.fillColor = (options.kls && options.kls === 'blegenda'? 'none' : DIATONIC.map.color.fill );
    options.openColor = (options.kls && options.kls === 'blegenda'? DIATONIC.map.color.open : 'none' );
    options.closeColor = (options.kls && options.kls === 'blegenda'? DIATONIC.map.color.close : 'none' );
    
    if(this.closeNote && this.closeNote.isBass)
        options.pautaNumerica = false;

    this.isNumerica = options.pautaNumerica; 

    this.SVG.gid = printer.printButton( id, currX, currY, options );

};

DIATONIC.map.Button.prototype.clear = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.clear(); }, delay*1000);
        return;
    }    
    this.SVG.closeArc.style.setProperty( 'fill', 'none' );
    this.SVG.openArc.style.setProperty( 'fill', 'none' );
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setOpen();}, delay*1000 );
        return;
    } 
    this.SVG.openArc.style.setProperty( 'fill', DIATONIC.map.color.open );
};

DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setClose();}, delay*1000);
        return;
    } 
    this.SVG.closeArc.style.setProperty( 'fill', DIATONIC.map.color.close );
};

DIATONIC.map.Button.prototype.setSVG = function( showLabel, opts ) {
    var b = this.SVG;
    var n = 0;
    var pull = opts.pull || null;
    var push = opts.push || null;
    var translator = opts.translator || null ;
    var formato = opts.formatoNumerico || null;
    var isMini = opts.mini;

    this.SVG.button = document.getElementById(b.gid);
    this.SVG.openArc = document.getElementById(b.gid + '_ao');
    this.SVG.closeArc = document.getElementById(b.gid + '_ac');
    this.SVG.openText = document.getElementById(b.gid+'_to');
    this.SVG.closeText = document.getElementById(b.gid+'_tc');
    this.SVG.numericText = document.getElementById(b.gid + '_tn');
    this.SVG.numericTextMini = document.getElementById(b.gid + '_tm');

    if( this.isNumerica ){
        if (formato.overrides[this.tabButton]) {
            n = formato.overrides[this.tabButton];
        } else {
            var i = parseInt(this.tabButton);
            var j = (this.tabButton.match(/'/g) || []).length
            n = i + formato.rule[j];
        }
        if (isMini)
            this.SVG.numericTextMini.textContent = n;
        else
            this.SVG.numericText.textContent = n;
    }

    if ( !this.isNumerica || isMini ) {
        if( translator ) {
            this.SVG.openText.setAttribute( 'data-translate', pull );
            this.SVG.closeText.setAttribute( 'data-translate', push );
            this.setText(showLabel, translator.getResource(pull), translator.getResource(push) ); 
        } else {
            this.setText(showLabel, pull, push ); 
        }
    }
}

DIATONIC.map.Button.prototype.setText = function( showLabel, open, close ) {
    if(this.SVG.openText) {
        this.SVG.openText.textContent = open ? open : this.getLabel( this.openNote, showLabel );
        this.SVG.closeText.textContent = close ? close : this.getLabel( this.closeNote, showLabel );
    }    
};

DIATONIC.map.Button.prototype.getLabel = function(nota, showLabel) {
    var l = nota.key;
    
    if (showLabel) {
        l = l.toUpperCase() + '';
        l = ABCXJS.parse.key2br[l].toUpperCase();
    }
    
    if ( nota.isChord ) {
       l = l.toLowerCase() + '';
    }    
    
    if( nota.isMinor ) {
        l+='-';
    }
    if( nota.isSetima ) {
        l+='7';
    }
    return l;
};

