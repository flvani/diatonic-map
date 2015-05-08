/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.PartGen = function( interfaceParams ) {

    var that = this;

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
        "T:Missioneiro\nC:Tio Bilia\nM:2/4\nL:1/16\nK:G\n" +
        "| - -  -  -  | C        c  C     c     | G        g  G     g     | G        g  G     g     | " + "\n" +
        "| - 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' |                         |                         | " + "\n" +
        "|            |                         | 5' 5' 6' 4' 5' 5' 6' 4' | 5' 5' 6' 4' 5' 5' 6' 4' | " + "\n" 
    ;
            
    this.parse(this.textarea.value)
};

SITE.PartGen.prototype.parse = function(text) {
   var lines = this.extractLines(text);
   
   for( var l = 0; l < lines.length; l++ ){
       this.parseLine(l,lines);
   }
};

SITE.PartGen.prototype.extractLines = function(text) {
    return text.split('\n');
};
