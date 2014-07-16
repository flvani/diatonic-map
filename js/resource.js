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
    DR.loadLang("languages/en_US.lang", DR.firstTranslation);
    DR.loadLang("languages/de_DE.lang", DR.firstTranslation);
    
    DR.showSelectedOption();
    //DR.loadLang("js/es_ES.lang");
    //DR.loadLang("js/it_IT.lang");
    //DR.loadLang("js/fr_FR.lang");
    //DR.loadLang("js/ru_RU.lang");

};

DR.firstTranslation = function () {
    if(DR.language !== DR.pt_BR && DR.resource['DR_appName'][DR.language]) {
       DR.translate(DR.language);
    }
};

// do the translation
DR.translate = function (id) {
    
    DR.language = id;
    
    FILEMANAGER.saveLocal( 'property.language', id);

    document.getElementById('btn_idioma').innerHTML = DR.resource["DR_image"][DR.language];

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

//load de language resource file
DR.loadLang = function(file, cb ){
  $.getJSON( file, {  format: "json"  })
    .done(function( data ) {
        DR.createMenuOption(data.id, data.langName);
        for(var res in data.resources ) {
            var lang = DR[data.id];
            var text = data.resources[res];
            if(DR.resource[res])
                DR.resource[res][lang] = text;
            else
                console.log(res);
        }
        if( cb ) cb();
    });
     //var jsonText = JSON.stringify(LANG);
};

