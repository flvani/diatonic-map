/* 
 * Internationalization's implementation
 */

if (!window.DR) // possible languages
    window.DR = {pt_BR: 0, en_US: 1, de_DE: 2, es_ES: 3, fr_FR: 4, it_IT: 5, ru_RU: 6}; 

// initialize the translator
DR.initializeTranslator = function ( strResources ) {
    
    DR.agents = []; // items registered for translation
    DR.resource =  {}; // translation resources
    DR.language = DR.pt_BR; // initial/current language
   
    DR.createResources(strResources);
    DR.setMenuOption("pt_BR", "Português do Brasil" );
    DR.showSelectedOption();
    
    DR.loadLang("js/en_US.lang");
    DR.loadLang("js/de_DE.lang");
    //DR.loadLang("js/es_ES.lang");
    //DR.loadLang("js/it_IT.lang");
    //DR.loadLang("js/fr_FR.lang");
    //DR.loadLang("js/ru_RU.lang");
    

};

// do the translation
DR.translate = function (id) {
    
    DR.language = id;

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

DR.setMenuOption = function (id, langName ) {
    var v = DR[id];

    DR.resource["DR_image"][v] = '<img src="img/'+id+'.png" width="32" height="32" alt="'+langName+'" title="'+langName+'" >';

    $('#opcoes_idioma')
            .append('<li><a style="padding: 2px; width: 34px;" onclick="DR.translate(DR.'+id+');">'
                +DR.resource["DR_image"][v]+'</a></li>');
};

DR.showSelectedOption = function (res) {
    document.getElementById('btn_idioma').innerHTML = DR.resource["DR_image"][DR.language];
};


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
    
    // all others are automatically created
    for( var r = 0; r < strResources.length; r ++ ) {
        DR.createResource(strResources[r]);
    }
    
//    DR.resource["DR_appName"] = ['<h1>Mapa para <span>Acordeons Diatônicos</span></h1>'];
//    DR.resource["DR_about"] = ['Sobre'];
//    DR.resource["tabTunes"] = ['Músicas'];
//    DR.resource["tabChords"] = ['Acordes'];
//    DR.resource["tabPractices"] = ['Exercícios'];
//    DR.resource["playBtn"] = ['Executar'];
//    DR.resource["stopBtn"] = ['Parar'];
//    DR.resource["toolsBtn"] = ['Ferramentas'];
//    DR.resource["didaticoBtn"] = ['Passo a passo'];
//    DR.resource["DR_layout"] = ['Layout:'];
//    DR.resource["DR_espelho"] = ['Espelho'];
//    DR.resource["DR_horizontal"] = ['Horizontal'];
//    DR.resource["DR_accordions"] = ['Acordeons'];
//    DR.resource["DR_chlabel"] = ['Mudar Notação'];
//    DR.resource["DR_theory"] = ['Teoria'];
//    DR.resource["octaveUpBtn"] = ['+ Oitava'];
//    DR.resource["octaveDwBtn"] = ['- Oitava'];
//    DR.resource["printBtn"] = ['Ver impressão'];
//    DR.resource["saveBtn"] = ['Salvar local'];
//    DR.resource["closeBtn"] = ['Fechar'];
//    DR.resource["forceRefresh"] = ['Atualizar'];
//    DR.resource["DR_refresh"] = ['Auto atualização'];
//    DR.resource["DR_message"] = ['Deixe uma mensagem'];
//    DR.resource["DR_repertoire"] = ['Repertório'];
//    DR.resource["DR_original"] = ['Restaurar o original'];
//    DR.resource["DR_localLoad"] = ['Carregar do drive local'];
  };

//create the initial resource (brazilian portuguese)
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
DR.loadLang = function(file){
  $.getJSON( file, {  format: "json"  })
    .done(function( data ) {
        DR.setMenuOption(data.id, data.langName);
        for(var res in data.resources ) {
            var lang = DR[data.id];
            var text = data.resources[res];
            if(DR.resource[res])
                DR.resource[res][lang] = text;
            else
                console.log(res);
        }
    });
     //var jsonText = JSON.stringify(LANG);
};

