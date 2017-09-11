/* 
 * Internationalization's implementation
 */

if (!window.DR) // possible languages
    window.DR = {pt_BR: 0, en_US: 1, de_DE: 2, es_ES: 3, fr_FR: 4, it_IT: 5, ru_RU: 6}; 

// initialize the translator
DR.initializeTranslator = function ( strResources ) {
    
    DR.agents = []; // items registered for translation
    DR.extras = {};
    DR.resource = {}; // translation resources
    
    // initial/current language
    var lang = FILEMANAGER.loadLocal( 'property.language');
    DR.language = (lang? parseInt(lang):DR.pt_BR);
   
    // create the translatable resources
    DR.createResources(strResources);

    // create and select the menu option for the inicial language
    $('#opcoes_idioma').empty();
    DR.createMenuOption("pt_BR", "Português do Brasil" );

    //load each avaliable languague resource file
    DR.loadLang(
        [ 
            "languages/en_US.lang"
           ,"languages/de_DE.lang"
           //,languages/es_ES.lang"
           //,languages/it_IT.lang"
           //,languages/fr_FR.lang"
           //,languages/ru_RU.lang"         
        ]
        , DR.firstTranslation 
    );
        
};

//called if the initial language is other than Portuguese
DR.firstTranslation = function () {
    if(DR.language !== DR.pt_BR && DR.resource['DR_appName'][DR.language]) {
       DR.translate(DR.language);
    }
};

// do the translation
DR.translate = function (id) {
    
    DR.language = id;
    
    FILEMANAGER.saveLocal( 'property.language', id);

    DR.showSelectedOption();

    for (var i = 0; i < DR.agents.length; i++) {
        var agent = DR.agents[i];
//        if(agent==="dSpanTranslatableTitle1") {
//            console.log('achei');
//        }
        if (typeof (agent) === 'object') {
            agent.translate();
        } else {
            
            var items = ABCXJS.parse.clone( DR.extras[agent] );
            if(items) {
                items.push(agent);
            } else {
                items = [agent];
            }
            
            items.forEach( function(extra) {
                var res = document.getElementById(extra);
                if(res) {
                    var r;
                    try {
                        r = DR.resource[agent][DR.language];
                    } catch( e ) {
                        r = DR.resource[agent][0];
                    }
                    if (res.title) {
                        res.title = DR.resource[agent][DR.language];
                    } else if (res.value) {
                        res.value = DR.resource[agent][DR.language];
                    } else {
                        res.innerHTML = DR.resource[agent][DR.language];
                    }
                } else {
                   // console.log('Not found: ' + extra );
                }
            });
        }
    }
};

// create the menu item
DR.createMenuOption = function( id, langName ) {
    var v = DR[id];

    DR.resource["DR_image"][v] = '<img src="img/'+id+'.png" width="32" height="32" alt="'+langName+'" title="'+langName+'" />';

    $('#opcoes_idioma')
            .append('<li><a style="padding: 2px; width: 34px;" onclick="DR.translate(DR.'+id+');">'
                +DR.resource["DR_image"][v]+'</a></li>');
};

// show the current language 
DR.showSelectedOption = function () {
    document.getElementById('btn_idioma').innerHTML = DR.resource["DR_image"][DR.language];
};

//returns the resource value in the current idiom
DR.getResource = function(res) {
  try {
    return DR.resource[res][DR.language]?DR.resource[res][DR.language]:DR.resource[res][DR.pt_BR];
  } catch (e) {
      console.log('getResource: resource \''+res+'\' not found.');
  }
};

DR.setDescription = function () {
    var metas = document.getElementsByTagName("meta");

    for (var i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("name") && metas[i].getAttribute("name") === "description") {
            metas[i].setAttribute("content", DR.getResource("DR_description") );
            i = metas.length;
        }
    }
};

DR.getDescription = function () {
    var metas = document.getElementsByTagName("meta");

    for (var i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("name") && metas[i].getAttribute("name") === "description") {
            return metas[i].getAttribute("content");
        }
    }
    return "";
};


//create the initial resources (brazilian portuguese)
DR.createResources = function (strResources) {
    //some of the translation resources need to be manually adjusted as they are not simply HTML elements
    DR.resource["DR_image"] = []; // create DR_image empty array;
    DR.resource["DR_title"] = [document.title];
    DR.resource["DR_description"] = this.getDescription();
    DR.resource["DR_push"]  = ['Fecha'];
    DR.resource["DR_pull"]  = ['Abre'];
    DR.resource["DR_pause"] = ['Pausar'];
    DR.resource["DR_wait"] = ['Aguarde...'];
    DR.resource["DR_debug"] = ['Depurar'];
    DR.resource["DR_octave"] = ['Oitava'];
    DR.resource["DR_goto"] = ['Ir para...'];
    DR.resource["DR_until"] = ['até...'];
    DR.resource["DR_err_saving"] = ['Impossível salvar'];
    DR.resource["DR_keys"] = ['botões'];
    DR.resource["DR_save_map"] = ['Salvar mapa corrente'];
    DR.resource["DR_load_map"] = ['Carregar mapa do disco local'];
    
    // all others are automatically created
    for( var r = 0; r < strResources.length; r ++ ) {
        DR.createResource(strResources[r]);
    }
    //var lang = JSON.stringify( DR.resource );
};    

DR.createResource = function (id) {
    
    var seq = id.match(/([0-9])*$/g);
    var radical = id;
    seq = seq[0];
    
    if(seq) {
        radical = id.replace(seq,"");
    }    
    var res = document.getElementById(id);

    if( res === null ) {
        console.log( 'createResource: resource \''+id+'\' undefined!');
        return;
    }
    if (typeof (id) === 'string') {
        if(!DR.resource[radical]){
            DR.addAgent(radical);
            DR.resource[radical] = [];
        }
        var val;
        if (res.title) {
            val = [res.title];
        } else if (res.value) {
            val = [res.value];
        } else {
            val = [res.innerHTML];
        }
        DR.resource[radical][DR.pt_BR] = val;
        DR.addExtra(radical, seq, id);
    }
};

DR.forcedResource = function (radical, val, seq, id) {
    if(!DR.resource[radical]){
        DR.addAgent(radical);
        DR.resource[radical] = [];
    }
    DR.resource[radical][DR.pt_BR] = val;
    DR.addExtra(radical, seq, id);
};

DR.addAgent = function (radical) {
    DR.agents.push(radical);
};

DR.addExtra = function (radical, seq, id) {
    if(seq) {
        if(!DR.extras[radical]) {
            DR.extras[radical] = [];
        }
        DR.extras[radical].push(id);
    }
};

//load the language resource files
DR.loadLang = function(files, cb ){
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++) {
        toLoad ++;
        FILEMANAGER.register('LANG');
        $.getJSON( files[f], {  format: "json"  })
          .done(function( data ) {
              FILEMANAGER.deregister('LANG', true);
              DR.createMenuOption(data.id, data.langName);
              for(var res in data.resources ) {
                  var lang = DR[data.id];
                  var text = data.resources[res];
                  if(!DR.resource[res]) {
                      //console.log("resource \'"+res+"\' does not exist in the system."); 
                      DR.addAgent(res);
                      DR.resource[res] = [];
                  }    
                  DR.resource[res][lang] = text;
              }
             })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('LANG', false);
                var err = textStatus + ", " + error;
                console.log( "Language Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --;
                if( toLoad === 0 && cb ) cb();
            });
    }
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DRAGGABLE)
    window.DRAGGABLE= {};

DRAGGABLE.Div = function(id, topDiv, title, aButtons, callBack, translate ) {
    var self = this;
    this.translate = false;
    this.topDiv = document.getElementById(topDiv);
    
    if(!this.topDiv) {
        // criar uma div
        return;
    }    
    
    if( translate && DR ) {
        this.translate = function() {
        };
        DR.addAgent(this);
    }
    
    this.id = id;
    
    self.topDiv.style.position = "fixed";
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = "100px";
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = "100px";
    
    this.marginTop  = this.topDiv.offsetTop - parseInt(this.topDiv.style.top) ;
    this.marginLeft = this.topDiv.offsetLeft - parseInt(this.topDiv.style.left);
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu" ); 
    div.innerHTML = this.addButtons(this.id, aButtons, callBack ) + this.addTitle(this.id, title );
    this.topDiv.appendChild( div );
    this.menuDiv = div;
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    this.titleSpan = document.getElementById("dSpanTitle"+this.id);
    this.moveButton = document.getElementById("dMenu"+this.id);
    this.closeButton = document.getElementById("dMINUSButton"+this.id);
    

    /*
	el.addEventListener('touchstart', touchEvent.startEv, false);
	el.addEventListener('mousedown', touchEvent.startEv, false);

	// TouchMove or MouseMove
	el.addEventListener('touchmove', touchEvent.moveEv, false);
	el.addEventListener('mousemove', touchEvent.moveEv, false);

	// TouchEnd or MouseUp
	el.addEventListener('touchend', touchEvent.endEv, false);
	el.addEventListener('mouseup', touchEvent.endEv, false);
    
    */
    
    this.stopMouse = function (e) {
        e.stopPropagation();
        //e.preventDefault();
    };
    
    this.divMove = function (e) {
        self.stopMouse(e);
        var touches = e.changedTouches;
        var p = {x: e.clientX, y: e.clientY};

        if (touches) {
            var l = touches.length - 1;
            p.x = touches[l].clientX;
            p.y = touches[l].clientY;
        }
        e.preventDefault();
        var y = ((p.y - self.y) + parseInt(self.topDiv.style.top));
        self.topDiv.style.top = (y < 43 ? 43 : y) + "px"; //hardcoded top of window
        self.topDiv.style.left = ((p.x - self.x) + parseInt(self.topDiv.style.left)) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseUp = function (e) {
        self.stopMouse(e);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        if(callBack) {
            window[callBack]('MOVE');
        }
    };

    this.mouseDown = function (e) {
        window.addEventListener('mouseup', self.mouseUp, false);
        window.addEventListener('touchend', self.mouseUp, false);
        self.stopMouse(e);
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('touchmove', self.divMove, false);
        window.addEventListener('touchleave', self.divMove, false);
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.clientX;
        self.y = e.clientY;
    };
    
    //TODO: tratar todos os botões da janela com stopMouse
    this.closeButton.addEventListener( 'mousedown', this.stopMouse, false);
    this.closeButton.addEventListener( 'touchstart', this.stopMouse, false);
    this.moveButton.addEventListener( 'mousedown', this.mouseDown, false);
    this.moveButton.addEventListener('touchstart', this.mouseDown, false);
    
    this.close = function(e) {
        self.topDiv.style.display='none';
    };
    
    if(!callBack) {
        this.closeButton.addEventListener( 'click', this.close, false);
    }
    
};

DRAGGABLE.Div.prototype.setTitle = function( title ) {
    this.titleSpan.innerHTML = title;
};

DRAGGABLE.Div.prototype.addTitle = function( id, title  ) {
    if( this.translate ) {
        DR.forcedResource("dSpanTranslatableTitle"+id, title); 
    }
    return '<div class="dTitle"><span id="dSpanTranslatableTitle'+id+'" style="padding-left: 5px;">'+title+'</span><span id="dSpanTitle'+id+'" style="padding-left: 5px;"></span></div>';
};

DRAGGABLE.Div.prototype.addButtons = function( id,  aButtons, callBack ) {
    var defaultButtons = ['minus|Fechar'];
    var txt = "";
    var self = this;
    var txtCallback;
    
    if(aButtons)
        defaultButtons = defaultButtons.concat(aButtons);
    
    defaultButtons.forEach( function (label) {
        label = label.split('|');
        label[1]  = label.length > 1 ? label[1] : "";
        
        if( self.translate ) {
            DR.forcedResource('d'+label[0].toUpperCase() +'ButtonA', label[1], id, 'd'+label[0].toUpperCase() +'ButtonA'+id); 
        }
        if( callBack ) {
            txtCallback = callBack+'(\''+label[0].toUpperCase()+'\');';
        }

        txt += '<div id="d'+label[0].toUpperCase() +'Button'+id+
                '" class="dButton"><a href="#" id="d'+label[0].toUpperCase() +'ButtonA'+id+'" title="'+label[1]+
                '" onclick="'+txtCallback+'"><i class="icon-'
                +label[0].toLowerCase()+' icon-white"></i></a></div>';
    });
    return txt;
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *      Ok - definir callback on end midi    
 *      Ok - Acertar casa 2 no xote laranjeira    
 *  
 */

if (!window.SITE)
    window.SITE = {};

SITE.Mapa = function( interfaceParams, tabParams, playerParams ) {

    var that = this;
    this.ypos = 0; // esta variável é usada para ajustar o scroll durante a execução do midi
    this.lastStaffGroup = -1; // também auxilia no controle de scroll
    this.currentTab = '';
    this.currentABC = null;
    
    this.mediaWidth = 300;
    this.mediaHeight = this.mediaWidth * 0.55666667;
    
    this.studio = tabParams.studio;
    
    // tab control
    this.renderedTune = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    this.renderedChord = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    this.renderedPractice = {text:undefined, abc:undefined, title:undefined, div:undefined, selector:undefined};
    
    this.renderedTune.div = document.getElementById(tabParams.songDiv);
    this.renderedTune.parms = tabParams.songSelectorParms;
    this.renderedTune.selector = document.getElementById(this.renderedTune.parms.div);
    this.renderedPractice.div = document.getElementById(tabParams.practiceDiv);
    this.renderedPractice.parms = tabParams.practiceSelectorParms;
    this.renderedPractice.selector = document.getElementById(this.renderedPractice.parms.div);
    this.renderedChord.div = document.getElementById(tabParams.chordDiv);
    this.renderedChord.parms = tabParams.chordSelectorParms;
    this.renderedChord.selector = document.getElementById(this.renderedChord.parms.div);
    
    // player control
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.currentPlayTimeLabel = document.getElementById(playerParams.currentPlayTimeLabel);

    // screen control
    this.checkboxEspelho = document.getElementById(interfaceParams.ckMirror);
    this.checkboxHorizontal = document.getElementById(interfaceParams.ckHorizontal);
    this.checkboxPiano = document.getElementById(interfaceParams.ckPiano);
    this.buttonChangeNotation = document.getElementById(interfaceParams.btChangeNotation);
    this.checkboxAcordeon = document.getElementById(interfaceParams.ckAccordion);
    
    this.tuneContainerDiv = document.getElementById(interfaceParams.tuneContainerDiv);
    this.gaitaNamePlaceHolder = document.getElementById(interfaceParams.accordionNamePlaceHolder);
    this.gaitaImagePlaceHolder = document.getElementById(interfaceParams.accordionImagePlaceHolder);

    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.toolsButton = document.getElementById(interfaceParams.toolsBtn);
   
    this.printButton.addEventListener("touchstart", function(evt) {
        evt.preventDefault();
        this.blur();
        if(  that.currentABC.div.innerHTML && that.studio )  {
            ga('send', 'event', 'Mapa', 'print', that.currentABC.title);
            that.studio.printPreview(that.currentABC.div.innerHTML, ["#divTitulo","#mapContainerDiv"], that.currentABC.abc.formatting.landscape );
        }
    }, false);
    
    this.printButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        if(  that.currentABC.div.innerHTML && that.studio )  {
            ga('send', 'event', 'Mapa', 'print', that.currentABC.title);
            that.studio.printPreview(that.currentABC.div.innerHTML, ["#divTitulo","#mapContainerDiv"], that.currentABC.abc.formatting.landscape );
        }
        
    }, false);

    this.toolsButton.addEventListener("touchstart", function(evt) {
        evt.preventDefault();
        this.blur();
        if( that.currentABC.div.innerHTML && that.studio ) {
            ga('send', 'event', 'Mapa', 'tools', that.currentABC.title);
            that.showStudio();
        }
    }, false);

    this.toolsButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        if( that.currentABC.div.innerHTML && that.studio ) {
            ga('send', 'event', 'Mapa', 'tools', that.currentABC.title);
            that.showStudio();
        }
        
    }, false);

    this.buttonChangeNotation.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        that.accordion.changeNotation();
    }, false );
    
    this.checkboxHorizontal.addEventListener('click', function(evt) {
        evt.preventDefault();
        that.accordion.layoutKeyboard( {transpose: this.checked }, that.keyboardDiv );
    }, false );

    this.checkboxEspelho.addEventListener('click', function(evt) {
        evt.preventDefault();
        that.accordion.layoutKeyboard( {mirror: this.checked }, that.keyboardDiv );
    }, false );
   
    this.playerCallBackOnScroll = function( player ) {
        that.setScrolling( player );
    };

    this.playerCallBackOnPlay = function( player ) {
        var strTime = player.getTime().cTime;
        if(that.gotoMeasureButton)
            that.gotoMeasureButton.value = player.currentMeasure;
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = strTime;
    };

    this.playerCallBackOnEnd = function( player ) {
        var warns = that.midiPlayer.getWarnings();
        that.playButton.title = DR.getResource("playBtn");
        that.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
        that.currentABC.abc.midi.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        if(that.currentPlayTimeLabel)
            that.currentPlayTimeLabel.innerHTML = "00:00.00";
        if( warns ) {
            var wd =  document.getElementById("warningsDiv");
            var txt = "";
            warns.forEach(function(msg){ txt += msg + '<br/>'; });
            wd.style.color = 'blue';
            wd.innerHTML = '<hr/>'+txt+'<hr/>';
        }
    };

    this.playButton.addEventListener("click", function(evt) {
       evt.preventDefault();
       that.startPlay( 'normal' );
    }, false);

    this.stopButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        that.midiPlayer.stopPlay();
    }, false);
    
    // inicio do setup do mapa    
    this.midiParser = new ABCXJS.midi.Parse();
    this.midiPlayer = new ABCXJS.midi.Player(this);
    this.midiPlayer.defineCallbackOnPlay( that.playerCallBackOnPlay );
    this.midiPlayer.defineCallbackOnEnd( that.playerCallBackOnEnd );
    this.midiPlayer.defineCallbackOnScroll( that.playerCallBackOnScroll );

    this.accordion = new window.ABCXJS.tablature.Accordion( interfaceParams.accordion_options );
    this.keyboardDiv = interfaceParams.keyboardDiv;
    this.loadAccordionList();
    this.showAccordionName();
    this.showAccordionImage();
    this.loadOriginalRepertoire();
    
    DR.addAgent( this ); // register for translate
    
    this.accordion.printKeyboard(this.keyboardDiv, {fillColor:'white'});

    // posiciona a janela de mídia, se disponível
    var m = document.getElementById("mediaDiv");
    if (m) {
        var props = FILEMANAGER.loadLocal('property.mediaDiv.settings');

        if (props) {
            props = props.split('|');
            m.style.top = props[0];
            m.style.left = props[1];
        }
    }
    
    this.resize();
};

SITE.Mapa.prototype.setup = function (tabParams) {

    var gaita = this.accordion.loadById(tabParams.accordionId);

    if (!gaita) {
        console.log('Gaita não encontrada!');
        return;
    }

    if (!gaita.localResource) { // não salva informação para acordeão local
        FILEMANAGER.saveLocal('property.accordion', gaita.getId());
    }

    this.showAccordionName();
    this.showAccordionImage();
    this.midiPlayer.reset();

    this.loadOriginalRepertoire(tabParams);
    
    this.accordion.printKeyboard(this.keyboardDiv);
    this.resize();

};

SITE.Mapa.prototype.resize = function( ) {

   // redimensiona a tela partitura
    var h = document.getElementById( 'div_principal');
    var o = document.getElementById( 'mapContainerDiv');
    var i = document.getElementById( 'tuneContainerDiv');

    i.style.height = (o.clientHeight - h.clientHeight  - 50 - 16) + "px"; // 16 é o padding
    
   // posiciona a janela de midia
   this.posicionaMidia();

};

SITE.Mapa.prototype.loadOriginalRepertoire = function (tabParams) {
    var self = this;
    var loader = this.startLoader( "LoadRepertoire" );
    loader.start(  function() { self.loadOriginalRepertoire2(tabParams,loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};
    
SITE.Mapa.prototype.loadOriginalRepertoire2 = function (tabParams, loader) {
    tabParams = tabParams || {};

    this.renderedPractice.title = tabParams.practiceTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.practice.title')
        || this.getSelectedAccordion().getFirstPractice();

    this.loadABCList('practice');
    this.renderTAB( this.currentTab === "tabPractices", 'practice' );

    this.renderedChord.title = tabParams.chordTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.chord.title')
        || this.getSelectedAccordion().getFirstChord();

    this.loadABCList('chord');
    this.renderTAB( this.currentTab === "tabChords", 'chord' );

    this.renderedTune.title = tabParams.songTitle
        || FILEMANAGER.loadLocal('property.' + this.getSelectedAccordion().getId() + '.song.title')
        || this.getSelectedAccordion().getFirstSong();

    this.loadABCList('song');
    this.renderTAB( this.currentTab === "tabTunes", 'song' );
    
    loader.stop();

};
SITE.Mapa.prototype.showStudio = function () {
    var self = this;
    var loader = this.startLoader( "Studio" );
    loader.start(  function() { self.showStudio2(loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );

};
SITE.Mapa.prototype.showStudio2 = function (loader) {
    
    this.midiPlayer.stopPlay();
    
    $("#mapContainerDiv").hide();
    document.getElementById("divMenuAccordions").style.pointerEvents = 'none';
    document.getElementById("divMenuRepertoire").style.pointerEvents = 'none';
    document.getElementById("DR_accordions").style.color = 'gray';
    document.getElementById("DR_repertoire").style.color = 'gray';
    $("#studioDiv").show();
    this.studio.visible = true;
    this.studio.setup(this.currentABC, this.getSelectedAccordion().getId() );
    this.setupProps();
    loader.stop();
};

SITE.Mapa.prototype.setupProps = function () {
    var props = FILEMANAGER.loadLocal('property.studio.settings');
    //props = null; // debug
   
    if( props ) {
        props = props.split('|');
        this.studio.textVisible                      = (props[0] === 'true');
        this.studio.editorVisible                    = (props[1] === 'true');
        this.studio.mapVisible                       = (props[2] === 'true');
        this.studio.editorWindow.topDiv.style.top    = props[3]; 
        this.studio.editorWindow.topDiv.style.left   = props[4]; 
        this.studio.keyboardWindow.topDiv.style.top  = props[5]; 
        this.studio.keyboardWindow.topDiv.style.left = props[6]; 
        this.studio.accordion.render_keyboard_opts.scale = parseFloat(props[7]);
        this.studio.accordion.render_keyboard_opts.mirror  = (props[8] === 'true');
        this.studio.accordion.render_keyboard_opts.transpose = (props[9] === 'true');
        this.studio.accordion.render_keyboard_opts.label = (props[10] === 'true');
        
        this.studio.textVisible    = ! this.studio.textVisible;
        this.studio.editorVisible  = ! this.studio.editorVisible;
        this.studio.mapVisible     = ! this.studio.mapVisible;
        this.studio.showABCXText();
        this.studio.showEditor();
        this.studio.showMap();
    }
};

SITE.Mapa.prototype.restoreStudio = function () {
    this.studio.textVisible = true;
    this.studio.editorVisible = false;
    this.studio.mapVisible = false;
    this.studio.editorWindow.topDiv.style.top = "120px";
    this.studio.editorWindow.topDiv.style.left = "40px";
    this.studio.keyboardWindow.topDiv.style.top = "120px";
    this.studio.keyboardWindow.topDiv.style.left = "900px";
    this.studio.accordion.render_keyboard_opts.scale = 0.8;
    this.studio.accordion.render_keyboard_opts.mirror = false;
    this.studio.accordion.render_keyboard_opts.transpose = false;
    this.studio.accordion.render_keyboard_opts.label = false;
    
    FILEMANAGER.saveLocal( 'property.studio.settings', 
        this.studio.textVisible 
        + '|' + this.studio.editorVisible 
        + '|' + this.studio.mapVisible 
        + '|' + this.studio.editorWindow.topDiv.style.top
        + '|' + this.studio.editorWindow.topDiv.style.left
        + '|' + this.studio.keyboardWindow.topDiv.style.top
        + '|' + this.studio.keyboardWindow.topDiv.style.left
        + '|' + this.studio.accordion.render_keyboard_opts.scale
        + '|' + this.studio.accordion.render_keyboard_opts.mirror
        + '|' + this.studio.accordion.render_keyboard_opts.transpose
        + '|' + this.studio.accordion.render_keyboard_opts.label
        );

    this.setupProps();
};

SITE.Mapa.prototype.closeStudio = function () {
    var self = this;
    var loader = this.startLoader( "Studio" );
    loader.start(  function() { self.closeStudio2(loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};
    
SITE.Mapa.prototype.closeStudio2 = function (loader) {
    
    this.studio.midiPlayer.stopPlay();
    
    FILEMANAGER.saveLocal( 'property.studio.settings', 
        this.studio.textVisible 
        + '|' + this.studio.editorVisible 
        + '|' + this.studio.mapVisible 
        + '|' + this.studio.editorWindow.topDiv.style.top
        + '|' + this.studio.editorWindow.topDiv.style.left
        + '|' + this.studio.keyboardWindow.topDiv.style.top
        + '|' + this.studio.keyboardWindow.topDiv.style.left
        + '|' + this.studio.accordion.render_keyboard_opts.scale
        + '|' + this.studio.accordion.render_keyboard_opts.mirror
        + '|' + this.studio.accordion.render_keyboard_opts.transpose
        + '|' + this.studio.accordion.render_keyboard_opts.label
        );

    $("#studioDiv").fadeOut();
    this.studio.visible = false;
    document.getElementById("divMenuAccordions").style.pointerEvents = 'auto';
    document.getElementById("divMenuRepertoire").style.pointerEvents = 'auto';
    document.getElementById("DR_accordions").style.color = 'inherit';
    document.getElementById("DR_repertoire").style.color = 'inherit';
    $("#mapContainerDiv").fadeIn();
    this.printTab();
    this.resize();
    loader.stop();
};

SITE.Mapa.prototype.startPlay = function( type, value ) {
    this.ypos = this.tuneContainerDiv.scrollTop;
    this.lastStaffGroup = -1; 

    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        if(type==="normal") {
            if( this.midiPlayer.startPlay(this.currentABC.abc.midi) ) {
                ga('send', 'event', 'Mapa', 'play', this.currentABC.title);
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&#160;<i class="icon-pause"></i>&#160;';
            }
        } else {
            if( this.midiPlayer.startDidacticPlay(this.currentABC.abc.midi, type, value ) ) {
                ga('send', 'event', 'Mapa', 'didactic-play', this.currentABC.title);
            }
        }
    }
};

SITE.Mapa.prototype.setScrolling = function(player) {
    if( !this.tuneContainerDiv || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.tuneContainerDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        this.ypos = top;
        this.tuneContainerDiv.scrollTop = this.ypos;    
    }

};

SITE.Mapa.prototype.rotateKeyboard = function() {
    this.accordion.rotateKeyboard();
};

SITE.Mapa.prototype.scaleKeyboard = function() {
    this.accordion.scaleKeyboard();
};

SITE.Mapa.prototype.loadAccordionList  = function() {
    var accordions = this.accordion.accordions;
    var ord = [];
    for (var c=0; c < accordions.length; c++) {
       ord.push( [ parseInt( accordions[c].menuOrder ), accordions[c].getFullName() , accordions[c].getId() ] );
    }

    ord.sort(function(a, b) {
        return b - a;
    });

    $('#opcoes_gaita').empty();

    for (var c=0; c < ord.length; c++) {
        $('#opcoes_gaita').append('<li><a href="#" id="pop_gaita_' +
            c  +'" onclick="setupGaita(\''+ ord[c][2] +'\')">' + ord[c][1] + ' ' + DR.getResource('DR_keys')  + '</a></li>');
    }

    $('#opcoes_gaita')
        .append('<hr style="height: 3px; margin: 5px;" />')
        .append('<li><a id="extra1" href="#" onclick="saveMap();">' + DR.getResource('DR_save_map') + '</a></li>')
        .append('<li><a id="extra2" href="#" onclick="document.getElementById(\'fileLoadMap\').click();">' + DR.getResource('DR_load_map') + '</a></li>');
};

SITE.Mapa.prototype.salvaRepertorio = function() {
    if ( FILEMANAGER.requiredFeaturesAvailable() ) {
        var accordion = this.getSelectedAccordion();
        var name = accordion.getId().toLowerCase() + ".repertorio.abcx";
        var conteudo = "";
        for( var title in accordion.songs.items) {
          conteudo += accordion.songs.items[title] + '\n\n';
        }
        FILEMANAGER.download( name, conteudo );    
    } else {
        alert( DR.getResource("DR_err_saving"));
    }    
};

SITE.Mapa.prototype.save = function() {
    var accordion = this.getSelectedAccordion();
    var txtAccordion = 
            '{\n'+
            '   "id":'+JSON.stringify(accordion.id)+'\n'+
            '  ,"menuOrder":'+JSON.stringify(accordion.menuOrder+100)+'\n'+
            '  ,"model":'+JSON.stringify(accordion.model)+'\n'+
            '  ,"tuning":'+JSON.stringify(accordion.tuning)+'\n'+
            '  ,"buttons":'+JSON.stringify(accordion.buttons)+'\n'+
            '  ,"pedal":'+JSON.stringify(accordion.keyboard.pedalInfo)+'\n'+
            '  ,"keyboard":\n'+
            '  {\n'+
            '     "layout":'+JSON.stringify(accordion.keyboard.layout)+'\n'+
            '     ,"keys":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.keys.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.keys.open)+'\n'+
            '     }\n'+
            '     ,"basses":\n'+
            '     {\n'+
            '        "close":'+JSON.stringify(accordion.keyboard.basses.close)+'\n'+
            '       ,"open":'+JSON.stringify(accordion.keyboard.basses.open)+'\n'+
            '     }\n'+
            '  }\n'+
            '}\n';
    
    FILEMANAGER.download( accordion.getId().toLowerCase() + '.accordion', txtAccordion );
};

SITE.Mapa.prototype.load = function(files) {
    
    var newAccordion, newAccordionJSON, newImage;
    var newTunes = "", newChords = "", newPractices = "";
    
    for(var f = 0; f < files.length; f++ ){
        if( files[f].type === 'image' ) {
           newImage = files[f].content;
        } else {
             switch(files[f].extension.toLowerCase()) {
                 case 'accordion':
                    newAccordionJSON = JSON.parse( files[f].content );
                    break;
                 case 'tunes':
                    newTunes = files[f].content;
                    break;
                 case 'chords':
                    newChords = files[f].content;
                    break;
                 case 'practices':
                    newPractices = files[f].content;
                    break;
             }
        }
    }
            
    newAccordionJSON.image = newImage || 'img/accordion.default.gif';
    
    if( ! this.accordionExists(newAccordionJSON.id) ) {
        newAccordion = new DIATONIC.map.AccordionMap( newAccordionJSON, true );
        
        DIATONIC.map.accordionMaps.push( newAccordion );
        this.loadAccordionList();
        //this.editor.accordionSelector.updateAccordionList();
    }   
    
    if( ! this.accordionIsCurrent(newAccordionJSON.id) ) {
        this.setup({accordionId:newAccordionJSON.id});
    }   
    
    var accordion = this.getSelectedAccordion();
    
    if( newTunes ) {
        var tunebook = new ABCXJS.TuneBook(newTunes);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.songs.sortedIndex.sort();
        this.renderedTune.title = accordion.getFirstSong();
        this.loadABCList('song');
        this.renderTAB( this.currentTab === "tabTunes", 'song' );
    }
    if( newChords ) {
        var tunebook = new ABCXJS.TuneBook(newChords);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.chords.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.chords.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.chords.sortedIndex.sort();
        this.renderedChord.title = accordion.getFirstChord();;
        this.loadABCList('chord');
        this.renderTAB( this.currentTab === "tabChords", 'chord' );
    }
    if( newPractices ) {
        var tunebook = new ABCXJS.TuneBook(newPractices);
        for (var t = 0; t < tunebook.tunes.length; t++) {
            accordion.practices.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
            accordion.practices.sortedIndex.push(tunebook.tunes[t].title);
        }    
        accordion.practices.sortedIndex.sort();
        this.renderedPractice.title = accordion.getFirstPractice();
        this.loadABCList('practice');
        this.renderTAB( this.currentTab === "tabPractices", 'practice' );
    }
};

SITE.Mapa.prototype.carregaRepertorio = function(original, files) {
    var that = this;
    var accordion = that.getSelectedAccordion();
    if (original) {
        if( accordion.localResource ) {
            console.log( 'Can\'t reload repertoire for local accordion!');
            return;
        }
        accordion.songs = accordion.loadABCX( accordion.songPathList, function() {  // devido à falta de sincronismo, preciso usar o call back;
            that.renderedTune.title = accordion.getFirstSong();
            that.loadABCList('song');
            that.renderTAB( that.currentTab === "tabTunes", 'song' );
            
        });
    } else {
        accordion.songs = { items:{}, sortedIndex: [] };
        for (var s = 0; s < files.length; s++) {
            // /* Debug Repertório */ var warnings = [];
            // /* Debug Repertório */ var abcParser = new ABCXJS.parse.Parse( null, this.accordion );
            var tunebook = new ABCXJS.TuneBook(files[s].content);
            
            for (var t = 0; t < tunebook.tunes.length; t++) {
                accordion.songs.items[tunebook.tunes[t].title] = tunebook.tunes[t].abc;
                // /* Debug Repertório */ warnings.push('\n' + tunebook.tunes[t].title + '\n');
                // /* Debug Repertório */ this.debugRepertorio(abcParser, warnings, tunebook.tunes[t].abc) ;
                accordion.songs.sortedIndex.push(tunebook.tunes[t].title);
                ga('send', 'event', 'Mapa', 'load', tunebook.tunes[t].title);

            }    
        }
        
        // /* Debug Repertório */ for (var j=0; j<warnings.length; j++) {
        // /* Debug Repertório */    console.log(warnings[j]);
        // /* Debug Repertório */ }
        
        accordion.songs.sortedIndex.sort();
        that.renderedTune.title = accordion.getFirstSong();
        that.loadABCList('song');
        that.renderTAB( this.currentTab === "tabTunes", 'song' );
    }
};


// Esta rotina foi criada como forma de verificar todos warnings de compilacao do repertório
SITE.Mapa.prototype.debugRepertorio = function( abcParser, warnings, abc ) {
    
    abcParser.parse( abc );
    
    var w = abcParser.getWarnings() || [];
    for (var j=0; j<w.length; j++) {
       warnings.push(w[j]);
    }
    
    if ( this.midiParser ) {
        this.midiParser.parse( abcParser.getTune(), this.accordion.getKeyboard() );
        var w= this.midiParser.getWarnings();
        for (var j=0; j<w.length; j++) {
           warnings.push(w[j]);
        }
    }
};        

SITE.Mapa.prototype.showAccordionImage = function() {
  this.gaitaImagePlaceHolder.innerHTML = '<img src="'+this.getSelectedAccordion().getPathToImage()
        +'" alt="'+this.getSelectedAccordion().getFullName() + ' ' + DR.getResource('DR_keys') + '" style="height:200px; width:200px;" />';
};

SITE.Mapa.prototype.showAccordionName = function() {
  this.gaitaNamePlaceHolder.innerHTML = this.getSelectedAccordion().getFullName() + ' ' + DR.getResource('DR_keys');
};

SITE.Mapa.prototype.defineActiveTab = function( which ) {
    this.currentTab = which;
    this.midiPlayer.reset();
    this.accordion.clearKeyboard(true);

    if(this.currentABC)
        this.currentABC.selector.style.display  = 'none';
    switch (this.currentTab) {
        case "tabTunes":
            this.currentABC = this.renderedTune;
            break;
        case "tabChords":
            this.currentABC = this.renderedChord;
            break;
        case "tabPractices":
            this.currentABC = this.renderedPractice;
            break;
    }
    this.currentABC.selector.style.display  = 'inline';
    if(this.currentABC.abc) {
        this.showMedia(this.currentABC.abc.metaText.url);
    } else {
        this.showMedia();
    } 
    
};

SITE.Mapa.prototype.printTab = function( ) {
    var accordion = this.getSelectedAccordion();
    this.accordion.printKeyboard(this.keyboardDiv);
    
    var t = this.studio.editArea.getString();
    if( t === this.currentABC.text ) 
        return;
    
    this.currentABC.text = t;

    switch (this.currentTab) {
        case "tabTunes":
            accordion.setSong(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'song' );
            break;
        case "tabChords":
            accordion.setChord(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'chord' );
            break;
        case "tabPractices":
            accordion.setPractice(this.currentABC.title, this.currentABC.text );
            this.renderTAB(true, 'practice' );
            break;
    }
};

SITE.Mapa.prototype.accordionExists = function(id) {
    return this.accordion.accordionExists(id);
};

SITE.Mapa.prototype.accordionIsCurrent = function(id) {
    return this.accordion.accordionIsCurrent(id);
};

SITE.Mapa.prototype.getSelectedAccordion = function() {
    return this.accordion.accordions[this.accordion.selected];
};

SITE.Mapa.prototype.showABC = function(type, i) {
    var self = this;
    var loader = this.startLoader( "TABLoader" + type );
    loader.start(  function() { self.showABC2(type, i, loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};

SITE.Mapa.prototype.showABC2 = function(type, i, loader ) {
    var tab;
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            tab.title = this.getSelectedAccordion().songs.sortedIndex[i];
            break;
        case 'practice':
            tab = this.renderedPractice;
            tab.title = this.getSelectedAccordion().practices.sortedIndex[i];
            break;
        case 'chord':
            tab = this.renderedChord;
            tab.title = this.getSelectedAccordion().chords.sortedIndex[i];
            break;
    };
    
    FILEMANAGER.saveLocal( 'property.'+this.getSelectedAccordion().getId()+'.'+type+'.title', tab.title );
    document.getElementById( tab.parms.span ).innerHTML = (tab.title.length>43 ? tab.title.substr(0,40) + "..." : tab.title);
    this.renderTAB( true, type );
    this.tuneContainerDiv.scrollTop = 0;    
    
    loader.stop();
};

SITE.Mapa.prototype.loadABCList = function(type) {
    var tab;
    var items;
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            items = this.getSelectedAccordion().songs.sortedIndex;
            break;
        case 'practice':
            tab = this.renderedPractice;
            items = this.getSelectedAccordion().practices.sortedIndex;
            break;
        case 'chord':
            tab = this.renderedChord;
            items = this.getSelectedAccordion().chords.sortedIndex;
            break;
    };
    
    tab.abc = tab.text = undefined;
    tab.div.innerHTML = "";
    
    $('#' + tab.parms.ul ).empty();
    $('#' + tab.parms.span ).empty();

    for( var i = 0; i < items.length; i++) {
        
        var title = items[i];
        if(title === tab.title ) {
            document.getElementById(tab.parms.span).innerHTML = (title.length>43 ? title.substr(0,40) + "..." : title);
        }    
        
        $('#' + tab.parms.ul ).append(
            '<li ><a href="#" id="' + type + i +'" onclick="showABC(\''+ type +'\',\''+ i +'\')">' + 
            (title.length>43 ? title.substr(0,40) + "..." : title)  + '</a></li>'
        );
    }   
};

SITE.Mapa.prototype.renderTAB = function(alreadyOnPage, type, params) {
    var tab;
    
    switch( type ) {
        case 'song':
            tab = this.renderedTune;
            tab.text = this.getSelectedAccordion().getSong(tab.title);
            break;
        case 'practice':
            tab = this.renderedPractice;
            tab.text = this.getSelectedAccordion().getPractice(tab.title);
            break;
        case 'chord':
            tab = this.renderedChord;
            tab.text = this.getSelectedAccordion().getChord(tab.title);
            break;
    };
    
    if (tab.title === "" || tab.text === undefined ) {
        tab.text = undefined;
        tab.title === "";
        this.showMedia();
        return;
    }
    
    this.parseABC(tab);
    
    var paper = new SVG.Printer( tab.div );
    tab.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    
    $("#" + tab.div.id).fadeIn();
    //tab.printer.printTune( tab.abc, {color:'black', backgroundColor:'#ffd' } ); 
    tab.printer.printTune( tab.abc ); 
    tab.printer.addSelectListener(this);
    this.accordion.clearKeyboard(true);

    
    $("#" + tab.div.id).hide();
    if (alreadyOnPage) {
        $("#" + tab.div.id).fadeIn();
        this.showMedia(tab.abc.metaText.url);
    }
};

SITE.Mapa.prototype.highlight = function(abcelem) {
    if(!this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
//        if(abcelem.bellows)
//            this.selectButton(abcelem);
    }    
};

//SITE.Mapa.prototype.selectButton = function(elem) {
//    for( var p=0; p < elem.pitches.length; p ++ ) {
//        var pitch = elem.pitches[p];
//        
//        if( pitch.type === 'rest' ) continue;
//        
//        var button;
//        var tabButton = pitch.c === 'scripts.rarrow'? pitch.lastButton : pitch.c;
//        
//        
//        //quando o baixo não está "in Tie", label do botão é uma letra (G, g, etc)
//        //de outra forma o label é número do botão (1, 1', 1'', etc)
//        if(pitch.bass && pitch.c !== 'scripts.rarrow')
//            // quando label é uma letra
//            button = this.midiParser.getBassButton(elem.bellows, tabButton);
//        else
//            // quando label é número do botão
//            button = this.midiParser.getButton(tabButton);
//        
//        if(button) {
//            if(elem.bellows === '-') {
//                button.setOpen();
//            } else {
//                button.setClose();
//            }
//        }
//    }
//};
//

SITE.Mapa.prototype.mediaCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            var m = document.getElementById("mediaDiv");
            FILEMANAGER.saveLocal( 'property.mediaDiv.settings',  m.style.top  + '|' + m.style.left );
            break;
        case 'MINUS':
            this.showMedia();
            break;
    }
    return false;
};

SITE.Mapa.prototype.showMedia = function(url) {
    if(url) {
        if( window.innerWidth > 1500 )  {
            this.mediaWidth = 500;
            this.mediaHeight = this.mediaWidth * 0.55666667;
        }
        var  embbed = '<iframe width="'+this.mediaWidth+'" height="'+this.mediaHeight+'" src="'+url+'?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen="allowfullscreen"></iframe>';
        $("#mediaDiv").find("[id^='draggableData']").html(embbed);
        $('#mediaDiv').fadeIn('slow');
        this.posicionaMidia();
    } else {
        $('#mediaDiv').fadeOut('slow');
        $("#mediaDiv").find("[id^='draggableData']").html("");
    }
};

SITE.Mapa.prototype.posicionaMidia = function () {
    
    var m = document.getElementById("mediaDiv");

    if( m.style.display === 'none') return;

    var w = window.innerWidth;
    var x = parseInt(m.style.left.replace('px', ''));
    
    if( x + this.mediaWidth > w ) {
        x = (w - (this.mediaWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    m.style.left = x+"px";
};

SITE.Mapa.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};

SITE.Mapa.prototype.parseABC = function(tab) {
    var transposer = null;
    var abcParser = new ABCXJS.parse.Parse( transposer, this.accordion );
    
    abcParser.parse(tab.text, this.parserparams );
    tab.abc = abcParser.getTune();

    if ( this.midiParser ) {
        this.midiParser.parse( tab.abc, this.accordion.getKeyboard() );
    }
};        

SITE.Mapa.prototype.translate = function() {
    
  this.getSelectedAccordion().keyboard.legenda.setText( true, DR.getResource('DR_pull'), DR.getResource('DR_push') );
  this.showAccordionName();
  
  document.title = DR.getResource("DR_title");  
  
  
  DR.setDescription();
  
  document.getElementById("toolsBtn").innerHTML = '<i class="icon-wrench"></i>&#160;'+DR.getResource("toolsBtn");
  document.getElementById("printBtn2").innerHTML = '<i class="icon-print"></i>&#160;'+DR.getResource("printBtn");
  document.getElementById("pdfBtn").innerHTML = '<i class="icon-print"></i>&#160;'+DR.getResource("pdfBtn");
  document.getElementById("DR_message").alt = DR.getResource("DR_message");
  
  document.getElementById("octaveUpBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveUpBtn").innerHTML = '<i class="icon-arrow-up"></i>&#160;'+DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").title = DR.getResource("DR_octave");
  document.getElementById("octaveDwBtn").innerHTML = '<i class="icon-arrow-down"></i>&#160;'+DR.getResource("DR_octave");
  document.getElementById("printBtn").innerHTML = '<i class="icon-print"></i>&#160;'+DR.getResource("printBtn");
  document.getElementById("saveBtn").innerHTML = '<i class="icon-download-alt"></i>&#160;'+DR.getResource("saveBtn");
  document.getElementById("forceRefresh").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("forceRefresh2").innerHTML = DR.getResource("forceRefresh");
  document.getElementById("gotoMeasureBtn").value = DR.getResource("DR_goto");
  document.getElementById("untilMeasureBtn").value = DR.getResource("DR_until");
  
  this.loadAccordionList();

};

if (!window.SITE)
    window.SITE = {};

SITE.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

SITE.EditArea.prototype.addSelectionListener = function (listener) {
    this.textarea.onmousemove = function (ev) {
        if (this.isDragging) {
            listener.updateSelection();
        }    
    };
};

SITE.EditArea.prototype.addChangeListener = function (listener) {
    this.textarea.onkeyup = function () {
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onmousedown = function () {
        this.isDragging = true;
        listener.updateSelection();
    };
    this.textarea.onmouseup = function () {
        this.isDragging = false;
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
    this.textarea.onchange = function () {
        if(listener.forceRefreshCheckbox && listener.forceRefreshCheckbox.checked)
            listener.fireChanged();
        else
            listener.updateSelection();
    };
};

SITE.EditArea.prototype.setSelection = function  (start, end, line) {
    this.textarea.setSelectionRange(start, end);
    (line) && this.scrollTo(line);
    this.textarea.focus();
};

SITE.EditArea.prototype.scrollTo = function(line)
{
  line = line || 0;
  var lineHeight = this.textarea.clientHeight / this.textarea.rows;
  var jump = (line - 1) * lineHeight;
  this.textarea.scrollTop = jump;
};

SITE.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

SITE.EditArea.prototype.setString = function(str) {
  this.initialText = str;
  this.textarea.value = str;
  this.textarea.selectionStart = 0;  
  this.textarea.selectionEnd = 0;  
};

SITE.EditArea.prototype.getElem = function() {
  return this.textarea;
};

SITE.KeySelector = function(id) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }
};

SITE.KeySelector.prototype.populate = function(offSet) {
    
    while( this.selector.options.length > 0 ) {
        this.selector.remove(0);
    }            
        
    for (var i = this.cromaticLength+offSet; i >= -this.cromaticLength+2+offSet; i--) {
        var opt = document.createElement('option');
        if(i-1 > offSet) 
            opt.innerHTML = ABCXJS.parse.number2keysharp[(i+this.cromaticLength-1)%this.cromaticLength] ;
        else
            opt.innerHTML = ABCXJS.parse.number2keyflat[(i+this.cromaticLength-1)%this.cromaticLength] ;
        opt.value = (i+this.cromaticLength-1);
        this.selector.appendChild(opt);
    }
    this.oldValue = offSet+this.cromaticLength;
    this.selector.value = offSet+this.cromaticLength;
};

SITE.KeySelector.prototype.set = function(value) {
    this.populate(value);
};

SITE.KeySelector.prototype.addChangeListener = function (editor) {
    this.selector.onchange = function () {
        editor.editorChanged(this.value - editor.keySelector.oldValue, "force");
    };
};

SITE.Estudio = function (interfaceParams, editorParams, playerParams) {
    this.ypos = 0; // controle de scroll
    this.lastStaffGroup = -1; // controle de scroll
    this.lastYpos = 0; // controle de scroll
    var that = this;
    this.visible = false;
    
    this.oldAbcText = null;
    this.warnings = [];
    this.currentMode = "normal"; 
    this.editorVisible = false;
    this.mapVisible = false;
    this.textVisible = true;
    this.editorWindow = editorParams.editorWindow;
    this.keyboardWindow = editorParams.keyboardWindow;
    this.playTreble = true;
    this.playBass = true;
    this.timerOn = false;
    this.clefsToPlay = (this.playTreble?"T":"")+(this.playBass?"B":"");
    
    this.studioCanvasDiv = document.getElementById( 'studioCanvasDiv');

    
    this.setupEditor();
    
    this.renderedTune = {text: undefined, abc: undefined, title: undefined, div: undefined, selector: undefined};
    
    if (typeof editorParams.textArea === "string") {
        this.editArea = new SITE.EditArea(editorParams.textArea);
    } else {
        this.editArea = editorParams.textArea;
    }
    
    this.editArea.addSelectionListener(this);
    this.editArea.addChangeListener(this);
    
    if (editorParams.generate_tablature) {
        if (editorParams.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(editorParams.accordion_options);

            if (editorParams.accordionNameSpan) {
                this.accordionNameSpan = document.getElementById(editorParams.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getFullName();
            }
        } else {
            throw new Error('Tablatura para ' + editorParams.generate_tablature + ' não suportada!');
        }
    }
    if (editorParams.canvas_id) {
        this.renderedTune.div = document.getElementById(editorParams.canvas_id);
    } else if (editorParams.paper_id) {
        this.renderedTune.div = document.getElementById(editorParams.paper_id);
    } else {
        this.renderedTune.div = document.createElement("DIV");
        this.editArea.getElem().parentNode.insertBefore(this.renderedTune.div, this.editArea.getElem());
    }

    if (editorParams.generate_warnings) {
        if (editorParams.warnings_id) {
            this.warningsdiv = document.getElementById(editorParams.warnings_id);
        } else {
            this.warningsdiv = this.renderedTune.div;
        }
    }
    
    if( editorParams.onchange ) {
        this.onchangeCallback = editorParams.onchange;
    }
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    this.forceRefreshButton = document.getElementById(interfaceParams.forceRefresh);
    this.forceRefreshCheckbox = document.getElementById(interfaceParams.forceRefreshCheckbox);
    this.printButton = document.getElementById(interfaceParams.printBtn);
    this.showMapButton = document.getElementById(interfaceParams.showMapBtn);
    this.showEditorButton = document.getElementById(interfaceParams.showEditorBtn);
    this.showTextButton = document.getElementById(interfaceParams.showTextBtn);

    // player control
    this.modeButton = document.getElementById(playerParams.modeBtn);
    this.timerButton = document.getElementById(playerParams.timerBtn);
    this.FClefButton = document.getElementById(playerParams.FClefBtn);
    this.GClefButton = document.getElementById(playerParams.GClefBtn);
    this.playButton = document.getElementById(playerParams.playBtn);
    this.stopButton = document.getElementById(playerParams.stopBtn);
    this.gotoMeasureButton = document.getElementById(playerParams.gotoMeasureBtn);
    this.untilMeasureButton = document.getElementById(playerParams.untilMeasureBtn);
    this.currentPlayTimeLabel = document.getElementById(playerParams.currentPlayTimeLabel);
    this.stepButton = document.getElementById(playerParams.stepBtn);
    this.stepMeasureButton = document.getElementById(playerParams.stepMeasureBtn);
    this.repeatButton = document.getElementById(playerParams.repeatBtn);
    this.clearButton = document.getElementById(playerParams.clearBtn);
    this.tempoButton = document.getElementById(playerParams.tempoBtn);
    
    this.forceRefreshButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.fireChanged(0, "force");
    }, false);
    
    this.saveButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.salvaMusica();
    }, false);

    this.showMapButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showMap();
    }, false);
    
    this.showTextButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.showABCXText();
    }, false);
    
    if( !(ABCXJS.misc.isChrome()||ABCXJS.misc.isChromium()) ) {
        this.showEditorButton.style.pointerEvents = 'none';
        this.showEditorButton.style.color = 'gray';
    } else {
        this.showEditorButton.addEventListener("click", function (evt) {
            evt.preventDefault();
            that.showEditor();
        }, false);
    }

    this.printButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        ga('send', 'event', 'Estúdio', 'print', that.renderedTune.title);
        that.printPreview(that.renderedTune.div.innerHTML, ["#divTitulo","#studioDiv"], that.renderedTune.abc.formatting.landscape);
        return;

    }, false);

    this.modeButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        that.changePlayMode();
    }, false);

    this.timerButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        that.timerOn = ! that.timerOn;
        that.setTimerIcon(that.timerOn, 0);
    }, false);
    
    this.FClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if( that.playBass) {
            this.innerHTML = '<img src="img/clave.fa.off.png" alt="" width="20" height="20">';
        } else {
            this.innerHTML = '<img src="img/clave.fa.on.png" alt="" width="20" height="20">';
        }
        that.playBass = ! that.playBass;
        that.clefsToPlay = (that.playTreble?"T":"")+(that.playBass?"B":"");
}, false);

    this.GClefButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        this.blur();
        if( that.playTreble) {
            this.innerHTML = '<img src="img/clave.sol.off.png" alt="" width="20" height="20">';
        } else {
            this.innerHTML = '<img src="img/clave.sol.on.png" alt="" width="20" height="20">';
        }
        that.playTreble = ! that.playTreble;
        that.clefsToPlay = (that.playTreble?"T":"")+(that.playBass?"B":"");
    }, false);

    this.playButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('normal');
    }, false);

    this.stopButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.midiPlayer.stopPlay();
    }, false);

    this.clearButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.renderedTune.printer.clearSelection();
        that.accordion.clearKeyboard(true);
        that.currentPlayTimeLabel.innerHTML = "00:00.00";
        that.midiPlayer.stopPlay();
    }, false);


    this.stepButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('note');
    }, false);

    this.stepMeasureButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        that.startPlay('measure');
    }, false);

    this.repeatButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.startPlay('repeat', that.gotoMeasureButton.value, that.untilMeasureButton.value );
    }, false);

    this.tempoButton.addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        var andamento = that.midiPlayer.adjustAndamento();
        switch (andamento) {
            case 1:
                that.tempoButton.innerHTML = '<b>&#160;1&#160;<b>';
                break;
            case 1 / 2:
                that.tempoButton.innerHTML = '<b>&#160;&#189;&#160;<b>';
                break;
            case 1 / 4:
                that.tempoButton.innerHTML = '<b>&#160;&#188;&#160;<b>';
                break;
        }
    }, false);


    this.gotoMeasureButton.addEventListener("keypress", function (evt) {
        //evt.preventDefault();
        if (evt.keyCode === 13) {
            that.startPlay('goto', this.value, that.untilMeasureButton.value);
        }
    }, false);

    this.gotoMeasureButton.addEventListener("focus", function (evt) {
        //evt.preventDefault();
        if (this.value === DR.getResource("DR_goto")) {
            this.value = "";
        }
    }, false);

    this.gotoMeasureButton.addEventListener("blur", function (evt) {
        //evt.preventDefault();
        if (this.value === "") {
            this.value = DR.getResource("DR_goto");
        }
    }, false);
    
    this.untilMeasureButton.addEventListener("keypress", function (evt) {
        //evt.preventDefault();
        if (evt.keyCode === 13) {
            that.startPlay('goto', that.gotoMeasureButton.value, this.value);
        }
    }, false);

    this.untilMeasureButton.addEventListener("focus", function (evt) {
        //evt.preventDefault();
        if (this.value === DR.getResource("DR_until")) {
            this.value = "";
        }
    }, false);

    this.untilMeasureButton.addEventListener("blur", function (evt) {
        //evt.preventDefault();
        if (this.value === "") {
            this.value = DR.getResource("DR_until");
        }
    }, false);
    
    
    if (editorParams.generate_midi) {
        
        this.playerCallBackOnScroll = function( player ) {
            that.setScrolling(player);
        };

        this.playerCallBackOnPlay = function( player ) {
            var strTime = player.getTime().cTime;
            if(that.gotoMeasureButton && ! parseInt(that.untilMeasureButton.value))
                that.gotoMeasureButton.value = player.currentMeasure;
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = strTime;
            
            that.midiPlayer.setPlayableClefs( that.clefsToPlay );

        };

        this.playerCallBackOnEnd = function( player ) {
            var warns = that.midiPlayer.getWarnings();
            that.playButton.title = DR.getResource("playBtn");
            that.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
            that.renderedTune.printer.clearSelection();
            that.accordion.clearKeyboard(true);
            if(that.currentPlayTimeLabel)
                that.currentPlayTimeLabel.innerHTML = "00:00.00";
            if( warns ) {
                var wd =  document.getElementById("warningsDiv");
                var txt = "";
                warns.forEach(function(msg){ txt += msg + '<br/>'; });
                wd.style.color = 'blue';
                wd.innerHTML = '<hr/>'+txt+'<hr/>';
            }
        };
        
        this.midiParser = new ABCXJS.midi.Parse();
        this.midiPlayer = new ABCXJS.midi.Player(this);
        this.midiPlayer.defineCallbackOnPlay( this.playerCallBackOnPlay );
        this.midiPlayer.defineCallbackOnEnd( this.playerCallBackOnEnd );
        this.midiPlayer.defineCallbackOnScroll( this.playerCallBackOnScroll );
    }
    
    DR.addAgent( this ); // register for translate

};

SITE.Estudio.prototype.setScrolling = function(player) {
    if( !this.studioCanvasDiv || player.currAbsElem.staffGroup === this.lastStaffGroup ) return;
    
    this.lastStaffGroup = player.currAbsElem.staffGroup;
    
    var fixedTop = player.printer.staffgroups[0].top;
    var vp = this.studioCanvasDiv.clientHeight - fixedTop;
    var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
    var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

    if( bottom > vp+this.ypos || this.ypos > top-fixedTop ) {
        
        this.ypos = top;
        this.studioCanvasDiv.scrollTop = this.ypos;    
    }

};


SITE.Estudio.prototype.translate = function( ) {
    this.initEditArea( "editorTextArea" );
}; 

SITE.Estudio.prototype.keyboardCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            break;
        case 'MINUS':
            this.hideMap();
            break;
        case 'RETWEET':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM-IN':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            break;
        default:
            alert(e);
    }
};

SITE.Estudio.prototype.changePageOrientation = function (orientation) {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = '@page {margin: 1cm; size: ' + orientation + '}';

};

SITE.Estudio.prototype.printPreview = function (html, divsToHide, landscape ) {
    var bg = document.body.style.backgroundColor;
    var pt = document.body.style.paddingTop;
    var dv = document.getElementById('printPreviewDiv');
    
    divsToHide.forEach( function( div ) {
        $(div).hide();
    });
    
   this.changePageOrientation(landscape? 'landscape': 'portrait');
    
    dv.style.display = 'inline';
    dv.innerHTML = html;
    document.body.style.paddingTop = '0px';
    document.body.style.backgroundColor = '#fff';
    window.print();
    document.body.style.backgroundColor = bg;
    document.body.style.paddingTop = pt;
   dv.style.display = 'none';
    
    divsToHide.forEach( function( div ) {
        $(div).show();
    });

};


SITE.Estudio.prototype.salvaMusica = function () {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        this.parseABC(0);
        var name = this.renderedTune.abc.metaText.title + ".abcx";
        var conteudo = this.editArea.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(DR.getResource("DR_err_saving"));
    }
};
    
SITE.Estudio.prototype.hideMap = function() {
    this.mapVisible = false;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    this.keyboardWindow.topDiv.style.display = 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
    document.getElementById('I_showMap').setAttribute('class', 'icon-folder-close' );
};

SITE.Estudio.prototype.showMap = function() {
    this.mapVisible = ! this.mapVisible;
    this.accordion.render_keyboard_opts.show = this.mapVisible;
    if(this.mapVisible) {
        this.keyboardWindow.topDiv.style.display = 'inline';
        this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
        document.getElementById('I_showMap').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideMap();
    }
};

SITE.Estudio.prototype.showABCXText = function () {
    this.textVisible = !this.textVisible;
    if (this.textVisible) {
        this.editArea.textarea.style.display = 'inline';
        document.getElementById('I_showText').setAttribute('class','icon-folder-open');
    } else {
        this.editArea.textarea.style.display = 'none';
        document.getElementById('I_showText').setAttribute('class','icon-folder-close');
    }
    this.resize();
};

SITE.Estudio.prototype.hideEditor = function() {
    document.getElementById('I_showEditor').setAttribute('class', 'icon-folder-close' );
    this.editorWindow.topDiv.style.display = 'none';
    this.editorVisible = false;
    var finalText = editAreaLoader.getValue("editorTextArea");
    document.getElementById( 'textareaABC').readOnly = false;
    if(this.editArea.getString() !== finalText ) {
        this.editArea.setString( finalText );
        this.fireChanged(0, 'force');
    }
};

SITE.Estudio.prototype.showEditor = function() {
    this.editorVisible = ! this.editorVisible;
    if(this.editorVisible) {
        document.getElementById( 'textareaABC').readOnly = true;
        editAreaLoader.setValue("editorTextArea", this.editArea.getString() );
        editAreaLoader.setSelectionRange("editorTextArea", 0, 0);
        this.editorWindow.topDiv.style.display = 'inline';
        this.initEditArea( "editorTextArea" );
        document.getElementById('I_showEditor').setAttribute('class', 'icon-folder-open' );
    } else {
        this.hideEditor();
    }
};

SITE.Estudio.prototype.setupEditor = function() {
    var that = this;
    var ks = "selKey";
    this.editorWindow.dataDiv.innerHTML =     
        '<textarea id="editorTextArea" cols="10" rows="25"></textarea>'
        + '<div style="width: 100%; padding:2px; margin-left:2px;" >'
        +    '<select id="'+ks+'" ></select>'
        +    '<button id="octaveUpBtn" class="btn" title="+ Oitava" onclick="" ><i class="icon-arrow-up"></i>&#160;Oitava</button>'
        +    '<button id="octaveDwBtn" class="btn" title="- Oitava" onclick="" ><i class="icon-arrow-down"></i>&#160;Oitava</button>'
        +    '<button id="forceRefresh2" class="btn" title="Atualizar" onclick="" >Atualizar</button>'
        + '</div>';
                            

    this.initEditArea( "editorTextArea", 850, 478 );
    
    this.keySelector = new SITE.KeySelector(ks);
    this.keySelector.addChangeListener(this);
    
    document.getElementById('octaveUpBtn').addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.editorChanged(12, "force");
    }, false);
    
    document.getElementById('octaveDwBtn').addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.editorChanged(-12, "force");
    }, false);
    
    document.getElementById('forceRefresh2').addEventListener("click", function (evt) {
        evt.preventDefault();
        this.blur();
        that.editorChanged(0, "force");
    }, false);

   DR.forcedResource('forceRefresh', 'Atualizar', '2', 'forceRefresh2');

};

SITE.Estudio.prototype.editorCallback = function( e ) {
    switch(e) {
        case 'MOVE':
            //var k = this.keyboardWindow.topDiv;
            //FILEMANAGER.saveLocal( 'property.keyboardDiv.settings',  k.style.top  + '|' + k.style.left );
            break;
        case 'MINUS':
            this.hideEditor();
            break;
        case 'ZOOM-IN':
        case 'RETWEET':
        default:
            alert(e);
    }
    return false;
};

SITE.Estudio.prototype.initEditArea = function( id, w, h) {
    var o = {
        id: id	// id of the textarea to transform	
       ,start_highlight: true
       ,allow_toggle: false
       ,syntax: "abc"	
       ,toolbar: "search, |, undo, redo, |, highlight , reset_highlight "
       ,allow_resize: "both"
       ,is_multi_files: false
       ,show_line_colors: true
       ,replace_tab_by_spaces: 4
    };   
    
    switch(DR.language){
        case DR.pt_BR: o.language = 'pt'; break;
        case DR.en_US: o.language = 'en'; break;
        case DR.de_DE: o.language = 'de'; break;
    }
    
    if(w && h)  {
        o.min_width = w;
        o.min_height = h;
    } else {    
        var e = document.getElementById("frame_"+id);
        if( this.editorVisible && o.language !== this.editorCurrLang && e) {
            o.min_width =  e.clientWidth;
            o.min_height = e.clientHeight;
        } else {
            return ; // não é necessário inicializar ou não é seguro
        }
    }
        
    editAreaLoader.init(o);
    this.editorCurrLang = o.language;
};

SITE.Estudio.prototype.changePlayMode = function() {
    if( this.currentMode === "normal" ) {
        $("#divNormalPlayControls" ).hide();
        this.currentMode  = "learning";
        this.modeButton.innerHTML = '<img src="img/learning5.png" alt="" width="20" height="20">';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divDidacticPlayControls" ).fadeIn();
    } else {
        $("#divDidacticPlayControls" ).hide();
        this.currentMode  = "normal";
        this.modeButton.innerHTML = '<img src="img/listening3.png" alt="" width="20" height="20">';
        this.midiPlayer.resetAndamento(this.currentMode);
        $("#divNormalPlayControls" ).fadeIn();
    }
};

SITE.Estudio.prototype.posicionaTeclado = function( ) {
    var w = window.innerWidth;
    
    var k = this.keyboardWindow.topDiv;
    var x = parseInt(k.style.left.replace('px', ''));
    
    if( x + k.offsetWidth > w ) {
        x = (w - (k.offsetWidth + 50));
    }
    
    if(x < 0) x = 10;
    
    k.style.left = x+"px";
};

SITE.Estudio.prototype.resize = function( ) {
    
    var m = document.getElementById( 'studioMenu');
    var h = document.getElementById( 'studioHeader');

    var t = document.getElementById( 'textareaABC');
    t.style.width = parseInt(m.clientWidth) - 24 + "px";
    
    var s = document.getElementById( 'studioDiv');
    var o = document.getElementById( 'studioContentDiv');
    
    o.style.height = (window.innerHeight -50 /*topdiv*/ - 17) + "px";

    this.studioCanvasDiv.style.height = (o.clientHeight - h.clientHeight - m.clientHeight - 2) + "px";
    this.studioCanvasDiv.style.width = s.style.width;
    
   // posiciona a janela de teclado
   this.posicionaTeclado();
   
};

SITE.Estudio.prototype.startPlay = function( type, value, valueF ) {
    this.ypos = this.studioCanvasDiv.scrollTop;
    this.lastStaffGroup = -1;
    
    if( this.midiPlayer.playing) {
        
        if (type === "normal" ) {
            this.playButton.title = DR.getResource("playBtn");
            this.playButton.innerHTML = '&#160;<i class="icon-play"></i>&#160;';
            this.midiPlayer.pausePlay();
        } else {
            this.midiPlayer.pausePlay(true);
        }    
        
    } else {
        this.accordion.clearKeyboard();
        this.StartPlayWithTimer(this.renderedTune.abc.midi, type, value, valueF, this.timerOn ? 10: 0 );
        
    }
};

SITE.Estudio.prototype.setTimerIcon = function( timerOn, value ) {
    value = value || 0;
    var ico = 'off';
    if( timerOn ) {
        switch( value ) {
            case 0:  ico = 'on'; break;
            case 1:  ico = '0.00'; break;
            case 2: ico = '0.33'; break;
            case 3: ico = '0.66'; break;
            case 6: ico = '2'; break;
            case 9: ico = '3'; break;
            default: ico = '';
        }
    }
    if( ico !== ''  ) {
        if( ico !== 'on' && ico !== 'off') {
            MIDI.noteOn(0,  90, 100, 0 );
            MIDI.noteOff(0, 90, value > 3 ? 0.10 : 0.05  );
        }
        this.timerButton.innerHTML = '<img id="timerBtnImg" src="img/timer.'+ico+'.png" alt="" width="25" height="20"/>';
    }
};

SITE.Estudio.prototype.StartPlayWithTimer = function(midi, type, value, valueF, counter ) {
     var that = this;
    
    if( type !== 'note' && this.timerOn && counter > 0 ) {
        that.setTimerIcon( that.timerOn, counter );
        counter -= 1;
        window.setTimeout(function(){that.StartPlayWithTimer(midi, type, value, valueF, counter); }, 1000.0/3 );
    } else {
        that.setTimerIcon( that.timerOn, 0 );
        if(type==="normal") {
            this.midiPlayer.setPlayableClefs('TB');
            if( this.midiPlayer.startPlay(this.renderedTune.abc.midi) ) {
                ga('send', 'event', 'Estúdio', 'play', this.renderedTune.title);
                this.playButton.title = DR.getResource("DR_pause");
                this.playButton.innerHTML = '&#160;<i class="icon-pause"></i>&#160;';
            }
        } else {
            this.midiPlayer.setPlayableClefs( this.clefsToPlay );
            ga('send', 'event', 'Estúdio', 'didactic-play', this.renderedTune.title);
            this.midiPlayer.startDidacticPlay(this.renderedTune.abc.midi, type, value, valueF );
        }
    }
};


SITE.Estudio.prototype.parseABC = function(transpose) {
    
    this.warnings = [];
    
    if(typeof transpose !== "undefined") {
        if( this.transposer )
          this.transposer.reset(transpose);
        else
          this.transposer = new ABCXJS.parse.Transposer( transpose );
    }
    
    var abcParser = new ABCXJS.parse.Parse( this.transposer, this.accordion );
    
    abcParser.parse(this.editArea.getString(), this.parserparams );
    
    this.renderedTune.abc = abcParser.getTune();
    this.renderedTune.text = abcParser.getStrTune();
    
    // transposição e geracao de tablatura podem ter alterado o texto ABC
    this.editArea.setString( this.renderedTune.text );
    
    if( this.transposer && this.keySelector ) {
        this.keySelector.set( this.transposer.keyToNumber( this.transposer.getKeyVoice(0) ) );       
    }
    
    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
        this.warnings.push(warnings[j]);
    }
    
    if ( this.midiParser ) {
        this.midiParser.parse( this.renderedTune.abc, this.accordion.getKeyboard() );
        var warnings = this.midiParser.getWarnings();
        for (var j=0; j<warnings.length; j++) {
           this.warnings.push(warnings[j]);
        }
    }
    
    return this.renderedTune.abc;
    
};        

SITE.Estudio.prototype.highlight = function(abcelem) {
    if(this.textVisible) {
        this.editArea.setSelection(abcelem.startChar, abcelem.endChar, abcelem.line);
    }    
    if(this.mapVisible && !this.midiPlayer.playing) {
        this.accordion.clearKeyboard(true);
        this.midiParser.setSelection(abcelem);
//        if(abcelem.bellows)
//            this.selectButton(abcelem);
    }    
    if((ABCXJS.misc.isChrome()||ABCXJS.misc.isChromium()) && this.editorVisible) {
        editAreaLoader.setSelectionRange("editorTextArea", abcelem.startChar, abcelem.endChar, abcelem.line);
    }    
};

//SITE.Estudio.prototype.selectButton = function(elem) {
//    for( var p=0; p < elem.pitches.length; p ++ ) {
//        var pitch = elem.pitches[p];
//        
//        if( pitch.type === 'rest' ) continue;
//        
//        var button;
//        var tabButton = pitch.c === 'scripts.rarrow'? pitch.lastButton : pitch.c;
//        
//        
//        //quando o baixo não está "in Tie", label do botão é uma letra (G, g, etc)
//        //de outra forma o label é número do botão (1, 1', 1'', etc)
//        if(pitch.bass && pitch.c !== 'scripts.rarrow')
//            // quando label é uma letra
//            button = this.midiParser.getBassButton(elem.bellows, tabButton);
//        else
//            // quando label é número do botão
//            button = this.midiParser.getButton(tabButton);
//        
//        if(button) {
//            if(elem.bellows === '-') {
//                button.setOpen();
//            } else {
//                button.setClose();
//            }
//        }
//    }
//};

SITE.Estudio.prototype.onChange = function() {
    this.studioCanvasDiv.scrollTop = this.lastYpos;
    this.resize();

};

SITE.Estudio.prototype.editorChanged = function (transpose, force) {
    this.editorChanging = true;
    this.editArea.setString(editAreaLoader.getValue("editorTextArea"));
    this.fireChanged(transpose, force);
};

SITE.Estudio.prototype.endEditorChanged = function () {
    if(!this.editorChanging) return;
    editAreaLoader.setValue("editorTextArea", this.editArea.getString());
    editAreaLoader.setSelectionRange("editorTextArea", 0, 0 );
    this.editorChanging = false;
};

SITE.Estudio.prototype.fireChanged = function (transpose, force) {
    var self = this;
    var loader = this.startLoader( "FC" );
    loader.start(  function() { self.fireChanged2(transpose, force, loader); }, '<br/>&#160;&#160;&#160;'+DR.getResource('DR_wait')+'<br/><br/>' );
};

SITE.Estudio.prototype.fireChanged2 = function (transpose, force, loader) {

    if( force || this.oldAbcText !== this.editArea.getString() ) {
        
        this.oldAbcText = this.editArea.getString();
    
        this.lastYpos = this.studioCanvasDiv.scrollTop || 0;               

        if( this.parseABC(transpose) ) {
            this.modelChanged();
        }
    }
    
    this.endEditorChanged(); 
    
    if(loader) {
        loader.stop();
    }    
};

SITE.Estudio.prototype.modelChanged = function() {
    
    this.renderedTune.div.innerHTML = "";
    if (this.renderedTune.abc === undefined) {
        return;
    }

    var paper = new SVG.Printer( this.renderedTune.div );
    this.renderedTune.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    //this.renderedTune.printer.printTune( this.renderedTune.abc, {color:'black', backgroundColor:'#ffd'} );
    this.renderedTune.printer.printTune( this.renderedTune.abc ); 
    
    if (this.warningsdiv) {
        this.warningsdiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsdiv.innerHTML = '<hr/>' + (this.warnings.length > 0 ? this.warnings.join("<br/>") : "No warnings or errors.") + '<hr/>';
    }
    
    this.renderedTune.printer.addSelectListener(this);
    this.updateSelection();
    
    if (this.onchangeCallback) {
        this.onchangeCallback(this);
    }    
    
};

SITE.Estudio.prototype.setup = function(tab, accordionId) {
    this.accordion.loadById(accordionId);
    this.renderedTune.text = tab.text;
    this.renderedTune.title = tab.title;
    this.renderedTune.abc = tab.abc;
    this.editArea.setString(this.renderedTune.text);
    editAreaLoader.setValue("editorTextArea", this.renderedTune.text );
    this.editorWindow.setTitle('-&#160;' + tab.title);
    this.keyboardWindow.setTitle(this.accordion.getTxtTuning() + ' - ' + this.accordion.getTxtNumButtons() );
    document.getElementById("spanStudioAccordeon").innerHTML = ' - ' + this.accordion.getTxtModel(); 
    this.studioCanvasDiv.scrollTop = 0;
    this.fireChanged2(0,'force');
};

SITE.Estudio.prototype.updateSelection = function() {
  try {
    var sel = this.renderedTune.printer.rangeHighlight(this.editArea.textarea.selectionStart, this.editArea.textarea.selectionEnd);
    if(this.mapVisible) {
        this.accordion.clearKeyboard(true);
        for( var i = 0; i < sel.length; i ++  ) {
            if(sel[i].abcelem.bellows)
                this.selectButton(sel[i].abcelem);
        }    
    }
  } catch (e) {} // maybe printer isn't defined yet?
};

SITE.Estudio.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};
