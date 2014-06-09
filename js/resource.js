/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DR)
    window.DR = {pt_BR: 0, en_US: 1};

if (!window.DR.resource)
    window.DR.resource =  { };

DR.language = DR.en_US; 
DR.resources = [];
DR.listeneres = [];

function DR_carregaIdiomas() {
    
    $('#opcoes_idioma').append('<li><a style="padding: 2px; width: 34px;" href="#" id="pt_BR" onclick="DR_setIdioma(DR.pt_BR);"><img src="img/brasil_80x80.png" width="32" height="32"></img></a></li>');
    $('#opcoes_idioma').append('<li><a style="padding: 2px; width: 34px;"href="#" id="us_EN" onclick="DR_setIdioma(DR.en_US);"><img src="img/eua_80x80.png" width="32" height="32"></img></a></li>');

    DR_setIdioma(DR.pt_BR);
 
};


function DR_setIdioma( id ) {
    DR.language = id;
    var ed = document.getElementById( 'btn_idioma' );
    ed.innerHTML = DR.resource["image"][DR.language];
    for( var i = 0; i < DR.resources.length; i++) {
      var res = DR.resources[i];
      if(res.indexOf('Btn') >= 0 )
        document.getElementById( res ).value = DR.resource[res][DR.language]; 
      else
        document.getElementById( res ).innerHTML = DR.resource[res][DR.language]; 
    }
    for( var i = 0; i < DR.listeneres.length; i++) {
      var res = DR.listeneres[i].res;
      var f  = DR.listeneres[i].listener;
      f( DR.resource[res][DR.language] );
    }
};
    
function DR_translate( res, listener ) {
   if(listener) {
         DR.listeneres.push({listener:listener, res:res});
   } else {
        DR.resources.push(res); 
        if(res.indexOf('Btn') >= 0 )
          document.getElementById( res ).value = DR.resource[res][DR.language]; 
        else
          document.getElementById( res ).innerHTML = DR.resource[res][DR.language]; 
   }
};

DR.resource["image"] = ['<img src="img/brasil_80x80.png" width="32" height="32">','<img src="img/eua_80x80.png" width="32" height="32">'];
DR.resource["DR_title"] = ['<h1>Mapa para <span>Acordeons Diatônicos</span></h1>', '<h1><span>Diatonic Accordions\'</span> Map</h1>'];
DR.resource["DR_about"] = ['Sobre', 'About'];
DR.resource["DR_push"]  = ['Fecha', 'Push'];
DR.resource["DR_pull"]  = ['Abre' , 'Pull'];
DR.resource["tabSongs"] = ['Músicas', 'Songs'];
DR.resource["tabAcordes"] = ['Acordes', 'Chords'];
DR.resource["tabExercicios"] = ['Exercícios', 'Practices'];
DR.resource["playBtn"] = ['Executar', 'Play'];
DR.resource["stopBtn"] = ['Parar', 'Stop'];
DR.resource["editorBtn"] = ['Editar', 'Edit'];
DR.resource["didaticoBtn"] = ['Passo a passo', 'Step by step'];
DR.resource["DR_pause"] = ['Pausar', 'Pause'];
DR.resource["DR_chlabel"] = ['Mudar Notação', 'Change Notation'];

