/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * SOME calls examples
 
    if (FILEMANAGER.requiredFeaturesAvailable()) {
        document.getElementById('files').addEventListener('change', fileSelected, false);
    }

    function fileSelected(evt) {
        FILEMANAGER.handleSelectedFiles(evt, function() {
            document.getElementById('texto').name = FILEMANAGER.files[0].fileName;
            document.getElementById('texto').innerHTML = FILEMANAGER.files[0].content;
        });
    };

    saveButton.addEventListener("click", function() {
        if (FILEMANAGER.requiredFeaturesAvailable()) {
            var name = myMap.editor.tunes[0].metaText.title + ".abcx";
            var conteudo = myMap.editor.editarea.getString();
            FILEMANAGER.download(name, conteudo);
        } else {
            alert("Impossível salvar!");
        }
    }, false);

    function saveLocalCanvas() {
        if (FILEMANAGER.html5StorageSupport()) {
            var name = 'texto';
            var conteudo = document.getElementById('texto').value;
            FILEMANAGER.saveLocal(name, conteudo);
        }
    };

    function loadLocalCanvas() {
        if (FILEMANAGER.html5StorageSupport()) {
            var name = 'texto';
            document.getElementById('texto').value = FILEMANAGER.loadLocal(name);
        }
    };
*/


if (! window.FILEMANAGER) {
    
    window.FILEMANAGER = {
        reader : new FileReader(),
        files : [],
        currName : null,
        toLoad : 0
    };
    
    FILEMANAGER.reader.onload = function(progressEvent) {
       FILEMANAGER.toLoad --;
       FILEMANAGER.files.push( {fileName: FILEMANAGER.currName, content: progressEvent.target.result });
    };

}

FILEMANAGER.handleSelectedFiles = function(evt, cb) {

    var files = evt.target.files; // FileList object
    
    FILEMANAGER.files = [];
    
    for (var i = 0; i < files.length; i++) {
        FILEMANAGER.toLoad ++;
        FILEMANAGER.currName = files[i].name;
        FILEMANAGER.reader.readAsText(files[i]);
    }
    
    FILEMANAGER.interval = window.setInterval(function() {FILEMANAGER.waitForLoad(cb);},100);
};

FILEMANAGER.waitForLoad = function(cb) {
    if( FILEMANAGER.toLoad === 0 ) {
      window.clearInterval(FILEMANAGER.interval);
      cb();        
    }
};

FILEMANAGER.download = function(name, data) {
    var click = function(node) {
        var ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return node.dispatchEvent(ev);
    };
    var link = function(data, name) {
        window.URL = window.webkitURL || window.URL;
        var bb = new Blob([data], {type: 'text/plain'});
        
        var a = document.createElement('a');
        a.download = name;
        a.href = window.URL.createObjectURL(bb);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        a.draggable = true; // Don't really need, but good practice.
        a.classList.add('dragout');

        return a;
    };

    click(link(data, name));
};

FILEMANAGER.requiredFeaturesAvailable = function() {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        return true;
    } else {
        //alert('The File APIs are not fully supported in this browser.');
        return false;
    }
};

FILEMANAGER.html5StorageSupport = function() {
    try
    {
        return 'localStorage' in window && window['localStorage'] !== null;
    }
    catch (e)
    {
        return false;
    }
};

FILEMANAGER.saveLocal = function(name, content) {
   localStorage.setItem( name, content );
};

FILEMANAGER.loadLocal = function(name) {
   return localStorage.getItem(name);
};
