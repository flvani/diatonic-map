/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.PartGen = function( interfaceParams ) {

    var     that = this;

    this.tabParser = new ABCXJS.Tab2Part();
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.updateButton = document.getElementById(interfaceParams.updateBtn);
    
    this.textarea = document.getElementById(interfaceParams.textarea);
   
    this.printButton.addEventListener("click", function() {
    
    }, false);

    this.saveButton.addEventListener("click", function() {
        
    }, false);
    
    this.updateButton.addEventListener("click", function() {
        that.update();
    }, false);

    // inicio do setup do mapa    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );

    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );
    
    this.editorWindow = interfaceParams.editorWindow;
    this.keyboardWindow = interfaceParams.keyboardWindow;
    
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    document.getElementById("t2pSpanAccordeon").innerHTML = ' (' + this.accordion.getTxtModel() + ')'; 
    
    this.textarea.value = 
        "%elementos são posicionais e separados por espaços.\n" +
        "%cada elemento tem duracao L.\n" +
        "%ausência de conteúdo é marcada hífen '-'.\n" +
        "%a duração do elemento é computada até encontrar o próximo ou a barra de compasso.\n" +
        "%ties são marcadas com sinal de maior '>'.\n" +
        "%ritornellos são marcados com ':'.\n" +
        "%linha começa com '|' e continuação de linha com '/'.\n\n" + 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| z -  -  -  | C        c  C     c     | G        g  G     g     | G        g  G     g     | " + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                         |                         | " + "\n" +
        "|            |                         | 5' 5' 6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' | " + "\n" 
    ;
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| z          | C        c  C     c     | G        g  G     g     | G        g  G     g     |" + "\n" +
        "|            | c                       |                         |                         |" + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                         |                         |" + "\n" +
        "|            |                         | 5' >  6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |" + "\n" +
        "/            |                         |                         |                      3' |" + "\n\n" +
        "| z          | C        c  C     c     | G        g  G     g     | G        g  G     g     |" + "\n" +
        "|            | c                       |                         |                         |" + "\n" +
        "| z 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                         |                         |" + "\n" +
        "|            |                         | 5' >  6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |" + "\n" +
        "/            |                         |                         |                      3' |" + "\n" 
    ;
    
    this.textarea.value = 
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n\n" +
        "| C         am     c     |: D  d  :|"  + "\n" +
        "| c " + "\n" +
        "|           5' 6' 4' 4' |  8      |"  + "\n" +
        "| 5' 5' 4 3             |     8   |"  + "\n" +
        "+ 3  2                     2  4  "+ "\n" + "\n" +
        "| G        g  G     g     |"  + "\n" +
        "|             5' 5' 6' 4' |"  + "\n" +
        "| 5' 5' 6' 4'             |" 
    ;
    
    this.update();
    
};
SITE.PartGen.prototype.update = function() {
    var     abcText;
    var abcText = this.tabParser.parse(this.textarea.value);
    this.printABC( abcText );
};

SITE.PartGen.prototype.printABC = function(abcText) {
    var tab = {text:abcText, abc:null, title:null, div:null };
    
    tab.div = document.getElementById("t2p_canvasDiv");
    
    this.parseABC(tab);
    
    tab.div.innerHTML = "";
    var paper = Raphael(tab.div, 700, 200);
    var printer = new ABCXJS.write.Printer( paper );
    
    printer.printABC(tab.abc);
    
    
};

SITE.PartGen.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.getKeyboard() );
    }
};        

