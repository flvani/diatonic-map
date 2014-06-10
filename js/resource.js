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
DR.agents = [];

function DR_carregaIdiomas() {
    
    $('#opcoes_idioma').append('<li><a style="padding: 2px; width: 34px;" href="#" id="pt_BR" onclick="DR_setIdioma(DR.pt_BR);"><img src="img/brasil_80x80.png" width="32" height="32"></img></a></li>');
    $('#opcoes_idioma').append('<li><a style="padding: 2px; width: 34px;"href="#" id="us_EN" onclick="DR_setIdioma(DR.en_US);"><img src="img/eua_80x80.png" width="32" height="32"></img></a></li>');

    DR_setIdioma(DR.pt_BR);
 
};

function DR_setIdioma(id) {
    DR.language = id;

    var ed = document.getElementById('btn_idioma');
    ed.innerHTML = DR.resource["image"][DR.language];

    for (var i = 0; i < DR.agents.length; i++) {
        var agent = DR.agents[i];
        if (typeof (agent) === 'object') {
            agent.translate();
        } else {
            var res = document.getElementById(agent);
            if (res.value) {
                res.value = DR.resource[agent][DR.language];
            } else {
                res.innerHTML = DR.resource[agent][DR.language];
            }
        }
    }
};

function DR_register(res) {
    DR.agents.push(res);
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
DR.resource["DR_layout"] = ['Layout:', 'Layout:'];
DR.resource["DR_espelho"] = ['Espelho', 'Mirrored'];
DR.resource["DR_horizontal"] = ['Horizontal', 'Horizontal'];
DR.resource["DR_acordeons"] = ['Acordeons', 'Accordions'];
DR.resource["DR_chlabel"] = ['Mudar Notação', 'Change Notation'];
DR.resource["DR_teoria"] = ['Teoria', 'Theory'];
DR.resource["octaveUpBtn"] = ['+ Oitava', '+ Octave'];
DR.resource["octaveDwBtn"] = ['- Oitava', '- Octave'];
DR.resource["printBtn"] = ['Ver impressão', 'Print preview'];
DR.resource["saveBtn"] = ['Salvar local', 'Local save'];
DR.resource["closeBtn"] = ['Fechar', 'Close'];
DR.resource["forceRefresh"] = ['Atualizar', 'Refresh'];
DR.resource["DR_refresh"] = ['Auto atualização', 'Auto refresh'];
DR.resource["DR_debug"] = ['Depurar', 'Debug'];
