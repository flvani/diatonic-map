/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.TabGen = function( mapa, interfaceParams ) {

    var that = this;
    this.mapa = mapa;
    this.accordion = mapa.accordion;
    this.parserparams = mapa.parserparams;

    
    var warnings_id = 'p2tWarningsDiv';

    this.Div = new DRAGGABLE.ui.Window( 
          interfaceParams.tabGenDiv
        , null // ['help|Ajuda']
        , {translator: SITE.translator,  statusbar: false, draggable: false, top: "3px", left: "1px", 
            width: '100%', height: "100%", title: 'TabGenTitle'}
        , {listener: this, method: 'p2tCallback'}
    );
    
    this.Div.setVisible(true);
    this.Div.dataDiv.style.overflow = 'hidden';
    
    this.controlDiv = document.createElement("DIV");
    this.controlDiv.setAttribute("id", 'p2tcontrolDiv' );
    this.controlDiv.setAttribute("class", 'controlDiv btn-group' );
    this.Div.dataDiv.appendChild(this.controlDiv);
    
    this.controlDiv.innerHTML = document.getElementById(interfaceParams.controlDiv).innerHTML;
    document.getElementById(interfaceParams.controlDiv).innerHTML = "";
    
    this.warningsDiv = document.createElement("DIV");
    this.warningsDiv.setAttribute("id", warnings_id);
    this.warningsDiv.setAttribute("class", "warningsDiv" );
    this.Div.dataDiv.appendChild(this.warningsDiv);
    
    this.abcEditorDiv = document.createElement("DIV");
    this.Div.dataDiv.appendChild(this.abcEditorDiv);

    this.tabEditorDiv = document.createElement("DIV");
    this.Div.dataDiv.appendChild(this.tabEditorDiv);

    this.tabParser = new ABCXJS.Part2Tab();
    
    this.abcEditorWindow = new ABCXJS.edit.EditArea(
        this.abcEditorDiv
       ,{listener : this, method: 'abcEditorCallback' }
       ,{   draggable:SITE.properties.tabGen.abcEditor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'TabGenSourceEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.abcEditorWindow.setVisible(true);
    this.abcEditorWindow.container.setButtonVisible( 'CLOSE', false);
    this.abcEditorWindow.container.setButtonVisible( 'DOWNLOAD', false);
    this.abcEditorWindow.container.setButtonVisible( 'OCTAVEUP', false);
    this.abcEditorWindow.container.setButtonVisible( 'OCTAVEDOWN', false);
    this.abcEditorWindow.keySelector.setVisible(false);

    this.tabEditorWindow = new ABCXJS.edit.EditArea(
        this.tabEditorDiv
       ,{listener : this, method: 'tabEditorCallback' }
       ,{   draggable:SITE.properties.tabGen.tabEditor.floating
           ,toolbar: true, statusbar:true, translator: SITE.translator
           ,title: 'TabGenTargetEditorTitle'
           ,compileOnChange: false /*SITE.properties.options.autoRefresh*/
        }
    );
    this.tabEditorWindow.setVisible(true);
    this.tabEditorWindow.container.setButtonVisible( 'CLOSE', false);
    this.tabEditorWindow.container.setButtonVisible( 'DOWNLOAD', false);
    this.tabEditorWindow.container.setButtonVisible( 'OCTAVEUP', false);
    this.tabEditorWindow.container.setButtonVisible( 'OCTAVEDOWN', false);
    this.tabEditorWindow.container.setButtonVisible( 'REFRESH', false);
    this.tabEditorWindow.keySelector.setVisible(false);
    
    this.updateButton = document.getElementById(interfaceParams.updateBtn);
    this.openButton = document.getElementById(interfaceParams.openBtn);
    this.saveButton = document.getElementById(interfaceParams.saveBtn);
    
    this.updateButton.addEventListener("click", function() {
        that.fireChanged();
    }, false);
    
    this.saveButton.addEventListener("click", function() {
        that.salvaTablatura();
    }, false);
    
    this.openButton.addEventListener("click", function() {
        var text = that.tabEditorWindow.getString();
        that.setVisible(false);
        SITE.SaveProperties();
        if(text !== "" ) {
            FILEMANAGER.saveLocal( 'ultimaTablaturaEditada', text );
            that.mapa.menu.dispatchAction('menuRepertorio','TAB2PART');
        }    
    }, false);
    
};

SITE.TabGen.prototype.setup = function(abcText) {
    
    this.mapa.closeMapa();
    
    this.setVisible(true);
    this.abcEditorWindow.setString(abcText);
    this.abcEditorWindow.container.dispatchAction('READONLY');
    
    if(SITE.properties.tabGen.abcEditor.floating) {
        if( SITE.properties.tabGen.abcEditor.maximized ) {
            this.abcEditorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.abcEditorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.abcEditorWindow.container.dispatchAction('POPIN');
    }
    
    this.warningsDiv.style.display =  SITE.properties.options.showWarnings? 'block':'none';
    this.fireChanged();
    
    if(SITE.properties.tabGen.tabEditor.floating) {
        if( SITE.properties.tabGen.tabEditor.maximized ) {
            this.tabEditorWindow.container.dispatchAction('MAXIMIZE');
        } else {
            this.tabEditorWindow.container.dispatchAction('POPOUT');
        }
    } else {
        this.tabEditorWindow.container.dispatchAction('POPIN');
    }
    
    this.tabEditorWindow.container.dispatchAction('READONLY');
    this.tabEditorWindow.restartUndoManager();
    this.resize();
};

SITE.TabGen.prototype.setVisible = function(  visible ) {
    this.Div.parent.style.display = visible?'block':'none';
};
    
SITE.TabGen.prototype.fireChanged = function() {
    this.title = "";
    var abcText = this.tabParser.parse(this.abcEditorWindow.getString(), this.accordion.loadedKeyboard );
    this.title = this.tabParser.title;
    this.printTablature(abcText);
};

SITE.TabGen.prototype.salvaTablatura = function() {
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        var name = this.title + ".tab";
        var conteudo = this.tabEditorWindow.getString();
        FILEMANAGER.download(name, conteudo);
    } else {
        alert(SITE.translator.getResource("err_saving"));
    }
};

SITE.TabGen.prototype.printTablature = function(abcText) {
    
    this.tabEditorWindow.setString(abcText);
    
    var warns = this.tabParser.getWarnings();
    
    if(warns) {
        this.warningsDiv.innerHTML = warns;
        this.warningsDiv.style.color = 'red';
    } else {
        this.warningsDiv.innerHTML = 'Tablatura extraída com sucesso!';
        this.warningsDiv.style.color = 'green';
    }
};

SITE.TabGen.prototype.resize = function( ) {
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    // -paddingTop 78
    var h = (winH -78 - 10 ); 
    var w = (winW - 8 ); 
    
    this.Div.topDiv.style.left = "3px";
    this.Div.topDiv.style.top = "82px";
    this.Div.topDiv.style.height = Math.max(h,200) +"px";
    this.Div.topDiv.style.width = Math.max(w,400) +"px";
    
};

SITE.TabGen.prototype.updateSelection = function (force) {
    return;
    // não é possível, por hora, selecionar o elemento da partitura a partir da tablatura
};

SITE.TabGen.prototype.p2tCallback = function( e ) {
    switch(e) {
        case 'CLOSE':
            this.setVisible(false);
            SITE.SaveProperties();
            this.mapa.openMapa();
            break;
    }
};

SITE.TabGen.prototype.tabEditorCallback = function (action) {
    switch(action) {
        case 'REFRESH': 
           this.fireChanged();
           break;
        case 'MAXIMIZE': 
            this.tabEditorWindow.maximizeWindow( true, SITE.properties.tabGen.tabEditor );
            break;
        case 'RESTORE': 
            this.tabEditorWindow.maximizeWindow( false, SITE.properties.tabGen.tabEditor );
            break;
        case 'POPIN':
            this.tabEditorWindow.dockWindow(true, SITE.properties.tabGen.tabEditor, 0, 0, "calc(100% - 5px)", "400px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.tabEditorWindow.dockWindow(false, SITE.properties.tabGen.tabEditor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.tabEditorWindow.retrieveProps( SITE.properties.tabGen.tabEditor );
            break;
    }
};

SITE.TabGen.prototype.abcEditorCallback = function (action) {
    switch(action) {
        case 'REFRESH': 
           this.fireChanged();
           break;
        case 'MAXIMIZE': 
            this.abcEditorWindow.maximizeWindow( true, SITE.properties.tabGen.abcEditor );
            break;
        case 'RESTORE': 
            this.abcEditorWindow.maximizeWindow( false, SITE.properties.tabGen.abcEditor );
            break;
        case 'POPIN':
            this.abcEditorWindow.dockWindow(true, SITE.properties.tabGen.abcEditor, 0, 0, "calc(100% - 5px)", "400px"  );
            this.resize();
            break;
        case 'POPOUT':
            this.abcEditorWindow.dockWindow(false, SITE.properties.tabGen.abcEditor );
            this.resize();
            break;
        case 'RESIZE':
        case 'MOVE':
            this.abcEditorWindow.retrieveProps( SITE.properties.tabGen.abcEditor );
            break;
    }
};
