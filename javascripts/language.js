/* 
 * Internationalization's implementation
 */

if (!window.DR) // possible languages
    window.DR = {pt_BR: 0, en_US: 1, de_DE: 2, es_ES: 3, fr_FR: 4, it_IT: 5, ru_RU: 6}; 

// initialize the translator
DR.initializeTranslator = function ( strResources ) {
    
    DR.agents = []; // items registered for translation
    DR.resource =  {}; // translation resources
    
    // initial/current language
    var lang = FILEMANAGER.loadLocal( 'property.language');
    DR.language = (lang? parseInt(lang):DR.pt_BR);
   
    // create the translatable resources
    DR.createResources(strResources);

    // create and select the menu option for the inicial language
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

    //document.getElementById('btn_idioma').innerHTML = DR.resource["DR_image"][DR.language];
    DR.showSelectedOption();

    for (var i = 0; i < DR.agents.length; i++) {
        var agent = DR.agents[i];
        if (typeof (agent) === 'object') {
            agent.translate();
        } else {
            var res = document.getElementById(agent);
            if (res.title) {
                res.title = DR.resource[agent][DR.language];
            } else if (res.value) {
                res.value = DR.resource[agent][DR.language];
            } else {
                res.innerHTML = DR.resource[agent][DR.language];
            }
        }
    }
};

// create the menu item
DR.createMenuOption = function( id, langName ) {
    var v = DR[id];

    DR.resource["DR_image"][v] = '<img src="img/'+id+'.png" width="32" height="32" alt="'+langName+'" title="'+langName+'" >';

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
  return DR.resource[res][DR.language]?DR.resource[res][DR.language]:DR.resource[res][DR.pt_BR];
};

//create the initial resources (brazilian portuguese)
DR.createResources = function (strResources) {
    //some of the translation resources need to be manually adjusted as they are not simply HTML elements
    DR.resource["DR_image"] = []; // create DR_image empty array;
    DR.resource["DR_title"] = [document.title];
    DR.resource["DR_description"] = [document.getElementById('DR_description').content];
    DR.resource["DR_push"]  = ['Fecha'];
    DR.resource["DR_pull"]  = ['Abre'];
    DR.resource["DR_pause"] = ['Pausar'];
    DR.resource["DR_wait"] = ['Aguarde...'];
    DR.resource["DR_debug"] = ['Depurar'];
    DR.resource["DR_octave"] = ['Oitava'];
    DR.resource["DR_goto"] = ['Ir para...'];
    DR.resource["DR_didactic"] = ['Modo didático'];
    DR.resource["modeBtn"] = ['Modo Normal'];
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
    
    var res = document.getElementById(id);

    if (typeof (id) === 'string') {
        if (res.title) {
            DR.resource[id] = [res.title];
        } else if (res.value) {
            DR.resource[id] = [res.value];
        } else {
            DR.resource[id] = [res.innerHTML];
        }
        DR.register(id);
    }
};

// do the items registration
DR.register = function (res) {
    DR.agents.push(res);
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
                  if(DR.resource[res])
                      DR.resource[res][lang] = text;
                  else
                      console.log(res); // resource does not exist in the system
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
