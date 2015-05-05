/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * SOME example calls
 
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
         reader : new FileReader()
        ,files : []
        ,currName : null
        ,currExtension: 'abc'
        ,type: 'text'
        ,toLoad : 0
    };
    
    FILEMANAGER.reader.onload = function(progressEvent) {
       FILEMANAGER.loaded ++;
       FILEMANAGER.now = true;
       FILEMANAGER.files.push( {
            fileName: FILEMANAGER.currName
           ,extension: FILEMANAGER.currExtension
           ,type: FILEMANAGER.type
           ,content: progressEvent.target.result
       });
    };

}

FILEMANAGER.managedResources = {};
FILEMANAGER.timeouts = 0;
FILEMANAGER.errors = "";
FILEMANAGER.success = "";

FILEMANAGER.register = function (res) {
    if(FILEMANAGER.managedResources[res]) {
       FILEMANAGER.managedResources[res].qtde ++; 
    } else {
       FILEMANAGER.managedResources[res] = {qtde:1, succ:0, fail:0}; 
    }
};

FILEMANAGER.deregister = function (res, succ) {
    if(FILEMANAGER.managedResources[res]) {
       if(succ) {
            FILEMANAGER.managedResources[res].succ ++;
       } else {
            FILEMANAGER.managedResources[res].fail ++; 
       }
    }
};

// returns -1 (wait), 0 (success) and 1 (fail)
FILEMANAGER.checkResources = function () {
  var ret = 0;
  for( var s in FILEMANAGER.managedResources ) {
      var r = FILEMANAGER.managedResources[s];
      if( r.qtde > 0 && (r.succ+r.fail) < r.qtde && FILEMANAGER.timeouts < 20 ) {
          FILEMANAGER.timeouts++;
          return -1;
      }
  }
  for( var s in FILEMANAGER.managedResources ) {
      var r = FILEMANAGER.managedResources[s];
      if( r.qtde > 0 && ( r.fail > 0 || ((r.succ+r.fail) < r.qtde) ) ) {
          FILEMANAGER.errors += 'Recurso ' + s + ' teve problemas ao carregar ('+ r.qtde +'/'+ r.succ +'/'+ r.fail +').\n';
          ret = 1;
      } else {
          FILEMANAGER.success += 'Recurso ' + s + ': '+ r.qtde +' ok...\n';
      }
  }
  return ret;
  
};

FILEMANAGER.loadLocalFiles = function(evt, cb) {

    var files = evt.target.files; // FileList object
    
    FILEMANAGER.now = true;
    FILEMANAGER.loaded = 0;
    FILEMANAGER.files = [];
    FILEMANAGER.interval = window.setInterval(function() {FILEMANAGER.doLoad(cb, files);},100);
};

FILEMANAGER.doLoad = function(cb, files) {
    if( FILEMANAGER.loaded === files.length ) {
      window.clearInterval(FILEMANAGER.interval);
      cb();        
    } else {
        if(FILEMANAGER.now) {
            FILEMANAGER.currName = files[FILEMANAGER.loaded].name;
            var p = files[FILEMANAGER.loaded].name.split(".");
            FILEMANAGER.currExtension = p[p.length-1];
            if(files[FILEMANAGER.loaded].type.substr(0,5) === "image" ) {
              FILEMANAGER.reader.readAsDataURL(files[FILEMANAGER.loaded]);
              FILEMANAGER.type = 'image';
            } else {
              FILEMANAGER.reader.readAsText(files[FILEMANAGER.loaded]);
              FILEMANAGER.type = 'text';
            }
            FILEMANAGER.now = false;
        }   
    }
};

FILEMANAGER.download = function(name, data) {
    var click = function(node) {
        var ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return node.dispatchEvent(ev);
    };
    var link = function(data, name) {
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
