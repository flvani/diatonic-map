var g_enjoyhint_opts

const en_US=0;
const pt_BR=1;
const es_ES=2;

var g_enjoyhint_text = [[],[],[]]

// esta função só deve ser chamada depois que a linguagem do site estiver carregada
function initEnjoyVars()
{
    g_enjoyhint_opts = {
         "btnNextText": SITE.translator.getResource('Next')
        ,"btnPrevText": SITE.translator.getResource('Previous')
        ,"btnSkipText": SITE.translator.getResource('Dismiss')
        ,backgroundColor: "rgba(0,0,0,0.6)"
        ,arrowColor: "white"
        ,onEnd:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties(); document.body.style.overflow = "hidden";}
        ,onSkip:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties(); SITE.myTour.destroy(); document.body.style.overflow = "hidden";}
    }

    switch( SITE.properties.options.language ) {
        case 'pt_BR':
            ge_lang = pt_BR;
            break;
        case 'es_ES':
            ge_lang = es_ES;
            break;
        default:
            ge_lang = en_US;
    }

    g_enjoyhint_script_steps = [
                    
        {
            'next #appTitle' :  g_enjoyhint_text[ge_lang][1],
                closeButton : {className: 'myClose'},
                nextButton  : { text: SITE.translator.getResource('Start') },
                onBeforeStart:function(){ 
                    myMap.media.callback( 'CLOSE' ); 
                }
        },
        {
            'next #topSettings' : g_enjoyhint_text[ge_lang][2],
                closeButton : {className: 'myClose'},
                shape : 'circle',
                radius: 36,
                onBeforeStart:function(){ 
                    myMap.setup({accordionId:'GAITA_MINUANO_GC'});
                }

        },
        {
            'next #menuGaitas' : g_enjoyhint_text[ge_lang][3],
                closeButton : {className: 'myClose'},
                onBeforeStart:function(){ 
                    myMap.setup({accordionId:'GAITA_MINUANO_GC'});
                    myMap.media.callback( 'CLOSE' ); 
                }
        },
        {
            'next #menuRepertorio' : g_enjoyhint_text[ge_lang][4],
                closeButton : {className: 'myClose'},
        },
        {
            'next #menuInformacoes' : g_enjoyhint_text[ge_lang][5],
                closeButton : {className: 'myClose'},
        },
        {
            'next #buttonChangeNotation' : g_enjoyhint_text[ge_lang][6],
                closeButton : {className: 'myClose'},
        },
        {
            'next #buttonTabFormat' : g_enjoyhint_text[ge_lang][7],
                closeButton : {className: 'myClose'},
        },
        {
            'next #songsTabL' : g_enjoyhint_text[ge_lang][8],
                closeButton : {className: 'myClose'},
                left:-400,
        },
        {
            'next #controlDiv' : g_enjoyhint_text[ge_lang][9],
                    closeButton : {className: 'myClose'},
                    disableSelector: true,
                    onBeforeStart:function(){ 
                    myMap.showTab('songsTab');
                    myMap.showABC( 'songs#1067' );
                    myMap.media.callback( 'CLOSE' ); 
                    //myApp.appView.changePlayMode('normal');
            },
        },
        {
            'next #menuSongs' : g_enjoyhint_text[ge_lang][10],
                closeButton : {className: 'myClose'},
                left:5, bottom: 0,
        },
        {
            'next #buttonPrinter' : g_enjoyhint_text[ge_lang][11],
                closeButton : {className: 'myClose'},
                left:3, bottom: 5,
                disableSelector: true,
        },
        {
            'next #buttonPlay' : g_enjoyhint_text[ge_lang][12],
                closeButton : {className: 'myClose'},
                right: -100, left:3, bottom: 5,

        },
        {
            'next #buttonShowMedia' : g_enjoyhint_text[ge_lang][13],
                closeButton : {className: 'myClose'},
                left:3, bottom: 5,
        },
        {
            'next #buttonTools' : g_enjoyhint_text[ge_lang][14],
                scrollAnimationSpeed : 2500,
                closeButton : {className: 'myClose'},
                left:3, bottom: 5,
                disableSelector: true,
                onBeforeStart:function(){ 
                    myMap.setup({accordionId:'GAITA_MINUANO_GC'});
                    myMap.media.callback( 'CLOSE' ); 
                }
        },
        {
            'click #downloadApp' : g_enjoyhint_text[ge_lang][15],
                closeButton : {className: 'myClose'},
                "skipButton" : { text: SITE.translator.getResource('Finish') },
                bottom: 5,
        }

    ];
}

g_enjoyhint_text[pt_BR] = [ 'dummy',

//1
    "Vamos conhecer as principais funcionalidades do Mapa para Acordeões?<br>"+
    "<text class='hint_laranja'>Observação: Você sempre poderá reiniciar este tour clicando em <i class='ico-cogs'></i> no canto superior direito da tela.</text>"

,//2
    "Use o menu \"Ajustes\" para mudar coisas, tais como, o idioma,<br>usar sons de piano acústico e outras mais."

,//3
    "Confira a caixa de listagem de acordeões<br>e escolha um de sua preferência.<br>"+
        "<text class='hint_laranja'>Observação: Também é possível salvar um mapa e/ou carregar seu próprio Mapa de Acordeão.<br>"+
        "Para saber mais, acesse o menu de Informações.</text>"
,//4
    "O menu \"Repertório\" permite, entre outras coisas, acesso ao índice de músicas,<br>"+
        "carregar uma partitura pessoal em formato ABC ou restaurar o repertório original de um acordeão.<br>"+
        "<text class='hint_laranja'>Observação: Além disso, é possível extrair uma tablatura, edita-la e gerar uma nova partitura.<br>"+
        "Para saber mais, acesse o menu de Informações.</text>"
,//5
    "O menu \"Informações\" contém a documentação sobre o que é um Mapa para Acordeões, bem como sobre a teoria por trás das tablaturas e outras informações úteis"

,//6
    "Altera a apresentação dos nomes das notas musicais.&nbsp;"+
        "<text class='hint_tryit'>Experimente agora!</text>"

,//7
    "Altera entre as diferentes representações da tablatura. Atualmente há 6 modos distintos.&nbsp;"+
        "<text class='hint_tryit'>Experimente agora!</text><br>"+
        "<text class='hint_laranja'>Observação: Maiores detalhes podem ser vistos no menu de Informações.<br>"
,//8
    "Permite selecionar entre as abas \"Acordes\", \"Exercícios\" e \"Músicas\".&nbsp;"+
        "<text class='hint_tryit'>Experimente agora!</text><br>"+
        "<text class='hint_laranja'>Observação: Nem todos os acordeões possuem exemplos de acordes e exercícios.</text>"
,//9
    "Esta é a barra de opções para a partitura. A seguir veremos todas a suas funcionalidades."

,//10
    "Selecione uma canção. Para cada acordeão previamente selecionado acima,<br>"+
        "há um repertório próprio de canções. Verifique a listagem disponível e escolha a sua.<br>"+
        "<text class='hint_laranja'>Observação: Desta vez, vou escolher uma música para continuar a demonstração.</text>"

,//11
    "Mostra uma prévia da impressão da música atual."

,//12
"Aqui, temos os controles básicos de execução de MIDI:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='hint_azul'><i class='ico-play' ></i> - </text>"+
            "<text class='hint_verde'>Executa a música corrente;</text><br>"+
        "<text class='hint_azul'><i class='ico-pause' ></i> - </text>"+
            "<text class='hint_verde'>Pausa a execução; e</text><br>"+
        "<text class='hint_azul'><i class='ico-stop'></i> - </text>"+
            "<text class='hint_verde'>Para a execução e retorna ao início.</text>"+
    "<div>"

,//13
    'Este botão abre uma janela vinculada às videoaulas do Youtube (se existirem).'

,//14
    "<text class='hint_verde'>O botão \"Ferramentas\"<br><br></text>"+
    "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
    "Este botão dá acesso ao \"Estúdio ABCX\".<br>"+
    "Através do estúdio, você pode editar, modificar e transpor a partitura corrente e, depois, salva-la no seu computador para uso posterior.&nbsp;"+
    "Além de toda a parte de edição, existe o modo de aprendizagem, que permite executar a partitura ou parte dela&nbsp;"+
    "de diferentes formas, inclusive, nota-por-nota. É possível executar apenas som da melodia, sem os ouvir baixos, ou executar somente o som dos baixos,&nbsp;"+
    " enquanto treina com a mão direita apenas a melodia no acordeão e muitas outras variações.<br>"+
        "<text class='hint_black'>Observação: Futuramente, o Estúdio terá seu próprio tour. Por hora, o menu Informações traz mais detalhes sobre o seu uso.</text>"+
    "</div>"

,//15
    "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
        "Aqui, encerramos este tour, lembrando que é está disponível para baixar o aplicativo<br>para celulares Android na loja da Google.<br>"+
        "Obrigado por ter acompanhado este tutorial até aqui e espero que você goste deste<br>mapa de referência para acordeões diatônicos.<br>"+
        "Encontre mais recursos acessando o site <text class='hint_link'>https://wwww.diatonicmap.x10.mx</text><br>"+
        "Você pode entrar em contato comigo pelo e-mail <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
        "<text class='hint_black'>Seus comentários/sugestões/elogios ou críticas são sempre bem-vindos!</text><br>"+
    "</div>"

];

g_enjoyhint_text[es_ES] = [ 'dummy',

//1
     "¿Conozcamos las características principales del Mapa para Acordeones?<br>"+
     "<text class='hint_laranja'>Nota: siempre puedes reiniciar este recorrido haciendo clic en <i class='ico-cogs'></i> en la esquina superior derecha de la pantalla.</text>"

,//dos
     "Utilice el menú \"Configuración\" para cambiar cosas como el idioma, usar sonidos de piano acústico y más."

,//3
     "Consulta el cuadro de lista de acordeones<br>y elige uno que te guste.<br>"+
         "<text class='hint_laranja'>Nota: También puedes guardar un mapa y/o cargar tu propio mapa de acordeón.<br>"+
         "Para saber más, acceda al menú Información.</text>"
,//4
     "El menú \"Repertorio\" permite, entre otras cosas, acceder al índice de canciones,<br>"+
         "carga una partitura personal en formato ABC o restaura el repertorio original de un acordeón.<br>"+
         "<text class='hint_laranja'>Nota: Además, es posible extraer una tablatura, editarla y generar una nueva partitura.<br>"+
         "Para saber más, acceda al menú Información.</text>"
,//5
     "El menú \"Información\" contiene documentación sobre qué es un Mapa de Acordeón, así como la teoría detrás de las tablaturas y otra información útil"

,//6
     "Cambia la presentación de los nombres de las notas musicales."+
         "<text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//7
     "Cambia entre las diferentes representaciones de tablatura. Actualmente hay 6 modos diferentes."+
         "<text class='hint_tryit'>¡Pruébalo ahora!</text><br>"+
         "<text class='hint_laranja'>Nota: Se pueden ver más detalles en el menú Información.<br>"
,//8
     "Le permite seleccionar entre las pestañas \"Acordes\", \"Ejercicios\" y \"Canciones\".&nbsp;"+
         "<text class='hint_tryit'>¡Pruébalo ahora!</text><br>"+
         "<text class='hint_laranja'>Nota: No todos los acordeones tienen ejemplos de acordes y ejercicios.</text>"
,//9
     "Esta es la barra de opciones de la partitura. A continuación veremos todas sus características."

,//10
     "Selecciona una canción. Para cada acordeón previamente seleccionado arriba,<br>"+
         "Existe su propio repertorio de canciones. Consulta la lista disponible y elige la tuya.<br>"+
         "<text class='hint_laranja'>Nota: esta vez, voy a elegir una canción para continuar con la demostración.</text>"

,//11
     "Muestra una vista previa de impresión de la canción actual."

,//12
"Aquí tenemos los controles básicos de ejecución MIDI:<br>"+
     "<div style='text-align:left; margin-left:3em'>"+
         "<text class='hint_azul'><i class='ico-play' >>i> - </text>"+
             "<text class='hint_verde'>Reproduce la canción actual;</text><br>"+
         "<text class='hint_azul'><i class='ico-pause' >>i> - </text>"+
             "<text class='hint_verde'>Pausa la ejecución; y</text><br>"+
         "<text class='hint_azul'><i class='ico-stop'></i> - </text>"+
             "<text class='hint_verde'>Detiene la ejecución y regresa al principio.</text>"+
     "<div>"

,//13
     'Este botón abre una ventana vinculada a lecciones en vídeo de YouTube (si existen).'

,//14
     "<text class='hint_verde'>El botón \"Herramientas\"<br><br></text>"+
     "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
     "Este botón da acceso a \"ABCX Studio\".<br>"+
     "A través del estudio, puedes editar, modificar y transponer la partitura actual y luego guardarla en tu computadora para usarla más adelante."+
     "Además de toda la parte de edición, existe el modo de aprendizaje, que te permite interpretar la partitura o parte de ella"+
     "de diferentes maneras, incluso nota por nota. Es posible tocar solo el sonido de la melodía, sin escuchar los bajos, o tocar solo el sonido de los bajos,&nbsp;"+
     " mientras practica con la mano derecha sólo la melodía del acordeón y muchas otras variaciones.<br>"+
         "<text class='hint_black'>Nota: En el futuro, el Estudio tendrá su propio recorrido. Por ahora, el menú Información proporciona más detalles sobre su uso.</text>"+
     "</div>"

,//15
     "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
         "Aquí finalizamos este recorrido, recordando que la aplicación está disponible para descargar para celulares Android desde la tienda de Google.<br>"+
         "Gracias por seguir este tutorial hasta ahora y espero que disfrutes de este<br>mapa de referencia para acordeones diatónicos.<br>"+
         "Encuentre más recursos visitando <text class='hint_link'>https://wwww.diatonicmap.x10.mx</text><br>"+
         "Puedes contactarme en <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
         "<text class='hint_black'>¡Tus comentarios/sugerencias/elogios o críticas siempre son bienvenidos!</text><br>"+
     "</div>"
];

g_enjoyhint_text[en_US] = [ 'dummy',
    //1
     "Let's get to know the main features of the Map for Accordions?<br>"+
     "<text class='hint_laranja'>Note: You can always restart this tour by clicking <i class='ico-cogs'></i> in the top-right corner of the screen.</text>"

,//two
     "Use the \"Settings\" menu to change things such as the language, use acoustic piano sounds and more."

,//3
     "Check out the accordion list box<br>and choose the one you like.<br>"+
         "<text class='hint_laranja'>Note: You can also save a map and/or load your own Accordion Map.<br>"+
         "To find out more, access the Information menu.</text>"
,//4
     "The \"Repertoire\" menu allows, among other things, access to the song index,<br>"+
         "load a personal score in ABC format or restore the original repertoire of an accordion.<br>"+
         "<text class='hint_laranja'>Note: In addition, it is possible to extract a tablature, edit it and generate a new score.<br>"+
         "To find out more, access the Information menu.</text>"
,//5
     "The \"Information\" menu contains documentation on what an Accordion Map is, as well as the theory behind the tablatures and other useful information"

,//6
     "Changes the presentation of the names of musical notes.&nbsp;"+
         "<text class='hint_tryit'>Try it now!</text>"

,//7
     "Switches between the different tablature representations. Currently there are 6 different modes.&nbsp;"+
         "<text class='hint_tryit'>Try it now!</text><br>"+
         "<text class='hint_laranja'>Note: More details can be seen in the Information menu.<br>"
,//8
     "Allows you to select between the \"Chords\", \"Exercises\" and \"Songs\" tabs.&nbsp;"+
         "<text class='hint_tryit'>Try it now!</text><br>"+
         "<text class='hint_laranja'>Note: Not all accordions have example chords and exercises.</text>"
,//9
     "This is the options bar for the score. Below we will see all its features."

,//10
     "Select a song. For each accordion previously selected above,<br>"+
         "there is its own repertoire of songs. Check the available list and choose yours.<br>"+
         "<text class='hint_laranja'>Note: This time, I'm going to choose a song to continue the demo.</text>"

,//11
     "Shows a print preview of the current song."

,//12
"Here we have the basic MIDI execution controls:<br>"+
     "<div style='text-align:left; margin-left:3em'>"+
         "<text class='hint_azul'><i class='ico-play' ></i> - </text>"+
             "<text class='hint_verde'>Plays the current song;</text><br>"+
         "<text class='hint_azul'><i class='ico-pause' ></i> - </text>"+
             "<text class='hint_verde'>Pauses execution; and</text><br>"+
         "<text class='hint_azul'><i class='ico-stop'></i> - </text>"+
             "<text class='hint_verde'>Stops execution and returns to the beginning.</text>"+
     "<div>"

,//13
     'This button opens a window linked to YouTube video lessons (if they exist).'

,//14
     "<text class='hint_verde'>The \"Tools\" button<br><br></text>"+
     "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
     "This button gives access to \"ABCX Studio\".<br>"+
     "Through the studio, you can edit, modify and transpose the current score and then save it on your computer for later use.&nbsp;"+
     "In addition to the entire editing part, there is the learning mode, which allows you to perform the score or part of it&nbsp;"+
     "in different ways, including note-by-note. It is possible to play just the sound of the melody, without hearing the basses, or to play only the sound of the basses,&nbsp;"+
     " while practicing with the right hand only the melody on the accordion and many other variations.<br>"+
         "<text class='hint_black'>Note: In the future, the Studio will have its own tour. For now, the Information menu provides more details about its use.</text>"+
     "</div>"

,//15
     "<div class='enjoy_hint_backgr' style='text-align:left; margin-left:3em'>"+
         "Here, we end this tour, remembering that the application is available to download for Android cell phones from the Google store.<br>"+
         "Thank you for following this tutorial this far and I hope you enjoy this<br>reference map for diatonic accordions.<br>"+
         "Find more resources by visiting <text class='hint_link'>https://wwww.diatonicmap.x10.mx</text><br>"+
         "You can contact me at <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
         "<text class='hint_black'>Your comments/suggestions/compliments or criticism are always welcome!</text><br>"+
     "</div>"    
];

