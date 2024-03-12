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
            "nextButton" : { text: SITE.translator.getResource('Start') },
            /*top: 75, bottom: -10, left:10, right: 10*/
        },
        {
            'next #topSettings' : g_enjoyhint_text[ge_lang][2],
                shape : 'circle',
                radius: 36,
        },
        {
            'next #menuGaitas' : g_enjoyhint_text[ge_lang][3],
        },
        {
            'next #menuSongs' : g_enjoyhint_text[ge_lang][4],
        },
        {
            'click #openBtn' : g_enjoyhint_text[ge_lang][5],
            showSkip: false,
            top: -7, bottom: -4, left: -7, 
            /*scrollAnimationSpeed : 300,*/
            onBeforeStart:function(){ 
                myApp.changeAccordion({accordionId:'GAITA_HOHNER_CORONA_GCF'}); 
                myApp.showABC( 'songs#6011' );
            },
        },
        {
            'next #controlDiv' : g_enjoyhint_text[ge_lang][6],
            closeButton : {className: 'myClose'},
            "nextButton" : { text: SITE.translator.getResource('Start') },
            showPrev: false,
            disableSelector: true,
            /*top: 50, */ bottom: 7, left: 5, right: 10,
            onBeforeStart:function(){ 
                myApp.appView.media.callback( 'CLOSE' ); 
                myApp.appView.changePlayMode('normal');
            },
        },
        {
            'next .ico-keyboard' : g_enjoyhint_text[ge_lang][7],
                shape : 'circle',
                radius: 22,
        },
        {
            'next #keyboardExtraBtnDiv' : g_enjoyhint_text[ge_lang][8],
            onBeforeStart:function(){ 
                myApp.appView.showKeyboard(true); 
            },
            /*top: 10, bottom: 14, left: 7, right: 30,*/
            disableSelector: true
        },
        {
            'next .ico-printer' : g_enjoyhint_text[ge_lang][9],
                shape : 'circle',
                radius: 22,
                disableSelector: true,
        },
        {
            'next .ico-tabformat' : g_enjoyhint_text[ge_lang][10],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-alien-fingering2' : g_enjoyhint_text[ge_lang][11],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-letter-l' : g_enjoyhint_text[ge_lang][12],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-treble' : g_enjoyhint_text[ge_lang][13],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-bass' : g_enjoyhint_text[ge_lang][14],
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-timer-00' : g_enjoyhint_text[ge_lang][15],
                shape : 'circle',
                radius: 22
        },
        {
            'next #tempoBtnId' : g_enjoyhint_text[ge_lang][16],
            top: -2, bottom: -4, left: 2, right: 2
        },
        {
            'next #modeBtn': g_enjoyhint_text[ge_lang][17],
                shape : 'circle',
                radius: 24
        },
        {
            'next #stepBtn' : g_enjoyhint_text[ge_lang][18],
                onBeforeStart:function(){
                    myApp.appView.changePlayMode('learning');
                },
                shape : 'circle',
                radius: 22
        },
        {
            'next #stepMeasureBtn' : g_enjoyhint_text[ge_lang][19],
                shape : 'circle',
                radius: 22
        },
        {
            'next .input-group' : g_enjoyhint_text[ge_lang][20],
            top: 0, bottom: 10,
            disableSelector: true
        },
        {
            'next #repeatBtn' : g_enjoyhint_text[ge_lang][21],
                shape : 'circle',
                radius: 22
        },
        {
            'next #clearBtn' : g_enjoyhint_text[ge_lang][22],
                shape : 'circle',
                radius: 22
        },
        {
            'next #buttonShowMedia' : g_enjoyhint_text[ge_lang][23],
                shape : 'circle',
                radius: 22
        },
        {
            'next #outerCanvasDiv' : g_enjoyhint_text[ge_lang][24],
                scrollAnimationSpeed : 2500,
                onBeforeStart:function(){ 
                    myApp.appView.media.callback( 'CLOSE' ); 
                    myApp.appView.changePlayMode('normal');
                },
                disableSelector: true,
                shape : 'circle',
                radius: 280
        },
        {
            'click .ico-home' : g_enjoyhint_text[ge_lang][25],
                scrollAnimationSpeed : 2500,
                "skipButton" : { text: SITE.translator.getResource('Finish') },
                shape : 'circle',
                radius: 26
        },
    ];
}

g_enjoyhint_text[pt_BR] = [ 'dummy',

//1
    "Vamos conhecer as principais funcionalidades deste Aplicativo?<br>"+
    "<text class='hint_laranja'>Observação: Você sempre poderá reiniciar este tour clicando em <i class='ico-menu'></i> no canto superior esquerdo do aplicativo.</text>"

,//2
    "Use o menu \"Ajustes\" para mudar coisas, tais como, o idioma <br>ou usar sons de piano acústico e outras mais."

,//3
    "Confira a caixa de listagem de acordeões<br>e escolha um de sua preferência."

,//4
    "Escolha, também, uma das músicas disponíveis na lista.<br>"+
        "<text class='hint_laranja'>Observação: Só desta vez, eu escolherei, por você, uma música para<br>"+
        "melhor demonstrar as funcionalidades da próxima página.</text>"

,//5
    "Agora, clique no botão \"Abrir\" para começar a aprender!"

,//6
    "Pronto para conhecer as facilidades da barra de menu?"

,//7
    "Este botão mostra/oculta o layout do teclado. "+
        "<text class='hint_tryit'>Experimente agora!</text>"
,//8

"O teclado em si também possui alguns controles úteis:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='hint_azul'><i class='ico-rotate' ></i> - </text>"+
            "<text class='hint_verde'>Espelha os botões do teclado (flip vertical);</text><br>"+
        "<text class='hint_azul'><i class='ico-world' ></i> - </text>"+
            "<text class='hint_verde'>Altera a notação dos nomes das notas; e</text><br>"+
        "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Alterna o lado do teclado: esquerda/direita.</text>"+
    "<div>"

,//9
    "Mostra uma prévia da impressão da música atual."

,//10
    "Altera entre as diferentes representações da tablatura. Atualmente há 3 formatos distintos.&nbsp;"+
        "<text class='hint_tryit'>Experimente agora!</text><br>"+
        "<text class='hint_laranja'>Observação: Maiores detalhes podem ser vistos na página \"https://diatonicmap.com.br/tablature\"</text>"

,//11
    "Este botão mostra/oculta os dedilhados da tablatura (se presentes). <text class='hint_tryit'>Experimente agora!</text>"

,//12
    "Este botão mostra/oculta a letra da música (se houver). <text class='hint_tryit'>Experimente agora!</text>"

,//13
    'Este botão ativa/desativa o som da melodia durante a execução MIDI.'

,//14
    'Este botão ativa/desativa o som do ritmo baixo durante a execução MIDI.'

,//15
    'Este botão ativa/desativa um breve temporizador antes de começar a execução.'
,//16
    "Deslize este botão para controlar o \"Andamento\" (velocidade) da execução MIDI."
,//17
    "Este botão alterna entre o modo de execução normal e o modo de aprendizagem:<br>"+
    "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Modo Normal:&nbsp;</text>"+
        "<text class='hint_verde'>Compreende um conjunto simples de botões<br>play/pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
        " e stop <i class='ico-stop'></i> para permitir a execução da partitura;</text><br>" +
    "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Modo de aprendizagem:&nbsp;</text>"+
        "<text class='hint_verde'>Este modo adiciona um conjunto de opções<br>para usar enquanto você estiver estudando a partitura.<br>"+
    "<text class='hint_laranja'>Observação: A seguir, ajustarei o \"Modo de aprendizagem\" para a parte final da demonstração.</text>"
,//18
    "No \"Modo de Aprendizagem\", este botão executa uma nota por vez, em um estilo \"passo-a-passo\"."
,//19
    "Este botão reproduz um compasso por vez ou compasso atual até o seu fim."
,//20
    'Use estas caixas de texto para limitar um conjunto de compassos numerados.<br>'+
    'Se você preencher apenas o primeiro campo, a compasso escolhido será repetido.<br>'+
    'No entanto, ao preencher ambos com números apropriados, o intervalo de compassos será repetido.'

,//21
    'Este botão aplicará e executará a repetição que você configurou nos campos anteriores.'

,//22
    'Este botão interrompe qualquer reprodução em andamento e coloca o cursor MIDI na posição inicial.'

,//23
    'Este botão abre uma janela vinculada às videoaulas do Youtube (se existirem).'

,//24
    "<div class='enjoy_hint_backgr'>"+
        "Este é o produto final deste aplicativo: uma partitura com tablatura.<br>"+
        "Para saber mais sobre esta metodologia de tablaturas para acordeão, dê uma olhada em:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
        "Você também pode conferir a versão para website do aplicativo:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
        "<text class='hint_black'>Aproveite toda a comodidade de uma tela maior, com o mesmo repertório e muitos recursos extras de edição!</text>"+
    "</div>"

,//25
    "<div class='enjoy_hint_backgr'>"+
        "Finalmente, clique em <i class='ico-home'> para voltar à página inicial e finalizar este tour.<br>"+
        "Obrigado por ter acompanhado este tutorial até aqui e espero que você goste deste aplicativo.<br>"+
        "Você pode entrar em contato comigo pelo e-mail <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
        "<text class='hint_black'>Seus comentários/sugestões/elogios ou críticas são bem-vindos!</text><br>"+
    "</div>"

];

g_enjoyhint_text[es_ES] = [ 'dummy',

//1
    "¿Conozcamos las características principales de esta Aplicación?<br>"+
    "<text class='hint_laranja'>Nota: siempre puedes reiniciar este tour haciendo clic en <i class='ico-menu'></i><br>"+
    "en la esquina superior izquierda de la aplicación.</text>"

,//dos
    "Utilice el menú \"Ajustes\" para cambiar cosas como el idioma<br>o usar sonidos de piano acústico y más."

,//3
    "Consulta el cuadro de lista de acordeones<br>y elige uno que te guste."

,//4
    "Elige también una de las canciones disponibles en la lista.<br>"+
        "<text class='hint_laranja'>Nota: Sólo por esta vez, elegiré para ti una canción para<br>"+
        " mejor demonstrar las funciones en la página siguiente.</text>"

,//5
    "¡Ahora, haz clic en el botón \"Abrir\" para comenzar a aprender!"

,//6
    "Listo para conocer las características de la barra de menú?"

,//7
    "Este botón muestra/oculta la distribución del teclado. "+
        "<text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//8
    "El teclado en sí también tiene algunos controles útiles:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='hint_azul'><i class='ico-rotate'></i> - </text>"+
            "<text class='hint_verde'>Refleja los botones del teclado (volteo vertical);</text><br>"+
        "<text class='hint_azul'><i class='ico-world'></i>- </text>"+
            "<text class='hint_verde'>Cambia la notación de los nombres de las notas; y</text><br>"+
        "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Cambia el lado del teclado: izquierda/derecha.</text>"+
    "<div>"

,//9
    "Muestra una vista previa de impresión de la canción actual."

,//10
    "Cambia entre las diferentes representaciones de tablatura. Actualmente hay 3 formatos diferentes."+
        "<text class='hint_tryit'>¡Pruébalo ahora!</text><br>"+
        "<text class='hint_laranja'>Nota: Más detalles se pueden ver en la página \"https://diatonicmap.com.br/tablature\"</text>"

,//11
    "Este botón muestra/oculta las digitaciones de la tablatura (si están presentes). <text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//12
    "Este botón muestra/oculta la letra de la canción (si está presente). <text class='hint_tryit'>¡Pruébalo ahora!</text>"

,//13
    'Este botón activa o desactiva el sonido de la melodía durante la reproducción MIDI.'

,//14
    'Este botón activa o desactiva el sonido del ritmo del bajo durante la reproducción MIDI.'

,//15
     'Este botón activa/desactiva un breve temporizador antes de que comience la ejecución.'
,//dieciséis
     "Deslice ésta perilla para controlar el \"Tempo\" (velocidad) de la reproducción MIDI."
,//17
     "Este botón alterna entre el modo de ejecución normal y el modo de aprendizaje:<br>"+
     "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Modo normal:&nbsp;</text>"+
         "<text class='hint_verde'>Consta de un conjunto simple de botones<br>reproducir/pausa <i class='ico-play'></i>/<i class='ico-pause'></i> "+
         " y detenga <i class='ico-stop'></i> para permitir que se reproduzca la partitura;</text><br>" +
     "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Modo de aprendizaje:&nbsp;</text>"+
         "<text class='hint_verde'>Este modo agrega un conjunto de opciones<br>para usar mientras estudias la partitura.<br>"+
     "<text class='hint_laranja'>Nota: A continuación, ajustaré el \"Modo de aprendizaje\" para la parte final de la demostración.</text>"
,//18
     "En \"Modo de aprendizaje\", este botón reproduce una nota a la vez, en un estilo \"paso-a-paso\"."
,//19
     "Este botón reproduce un compás a la vez o el compás actual hasta su final."
,//20
     "Utilice estos cuadros de texto para limitar un conjunto de compases numerados.<br>"+
     "Si sólo rellenas el primer campo, se repetirá el compás elegido.<br>"+
     "Sin embargo, al completar ambos con los números apropiados, se repetirá la gama de compases."

,//21
     'Este botón aplicará y ejecutará la repetición que configuró en los campos anteriores.'

,//22
     'Este botón detiene cualquier reproducción en curso y coloca el cursor MIDI en la posición inicial.'

,//23
     "Este botón abre una ventana vinculada a lecciones en vídeo de YouTube (si estan presentes)."

,//24
     "<div class='enjoy_hint_backgr'>"+
         "Este es el producto final de esta aplicación: una partitura con tablatura.<br>"+
         "Para aprender más sobre esta metodología de tablaturas de acordeón, echa un vistazo a:<br>"+
             "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
         "También puedes consultar la versión del sitio web de la aplicación:<br>"+
             "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
         "<text class='hint_black'>¡Disfruta de toda la comodidad de una pantalla más grande, con el mismo repertorio y muchas funciones de edición adicionales!</text>"+
     "</div>"

,//25
     "<div class='enjoy_hint_backgr'>"+
         "Finalmente, haga clic en <i class='ico-home'> para regresar a la página de inicio y finalizar este tour.<br>"+
         "Gracias por seguir este tutorial hasta ahora y espero que disfrutes esta aplicación.<br>"+
         "Puedes contactarme en <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
         "<text class='enjoy_hint_note_footrodape'>¡Tus comentarios/sugerencias/elogios o críticas son bienvenidos!</text><br>"+
     "</div>"
];

g_enjoyhint_text[en_US] = [ 'dummy',
//1
    "Let's learn about the main features of this App?<br>"+
        "<text class='hint_laranja'>Note: You can always restart this tour by clicking <i class='ico-menu'></i> on left-top corner of the App.</text>"

,//2    
    "Use the \"Settings\" menu to change stuff such as the language <br>or to use piano sounds and more."

,//3    
    "Checkout the accordion listbox <br>and choose the one of your prefference."

,//4    
    "Also, choose an available song from the list.<br>"+
        "<text class='hint_laranja'>Note: Only this time, I'll choose you a song<br>for a better demonstration.</text>"

,//5    
    "Now, click the \"Open\" button to start learning!"

,//6    
    "Are you ready to know the facilities on the menu bar?"

,//7    
    "This button shows/hides the keyboard layout. "+
        "<text class='hint_tryit'>Try it now!</text>"

,//8
    "The keyboard itself also has some useful controls:<br>"+
        "<div style='text-align:left; margin-left:3em'>"+
            "<text class='hint_azul'><i class='ico-rotate' ></i> - </text>"+
                "<text class='hint_verde'>Mirrors the keyboard's buttons (vertical flip);</text><br>"+
            "<text class='hint_azul'><i class='ico-world' ></i> - </text>"+
                "<text class='hint_verde'>Changes the note names notation; and</text><br>"+
            "<text class='hint_azul'><i class='ico-open-right'></i> - </text>"+
            "<text class='hint_verde'>Shifts the keyboard side: left/right.</text>"+
        "<div>"

,//9
    'Shows a print preview for the current song.'

,//10    
    "Switches between the different tablature representations. Currently there are 3 different formats.&nbsp;"+
        "<text class='hint_tryit'>Try it now!</text><br>"+
        "<text class='hint_laranja'>Note: More details can be seen on the page \"https://diatonicmap.com.br/tablature\"</text>"
,//11    
    "This button shows/hides the tablature fingering (if present). <text class='hint_tryit'>Try it now!</text>"

,//12    
    "This button shows/hides the song lyrics (if present). <text class='hint_tryit'>Try it now!</text>"

,//13    
    'This button mutes/unmutes the sound of the melody during the MIDI execution.'

,//14    
    'This button mutes/unmutes the sound of the bass rhythm during the MIDI execution.'

,//15    
    'This button enables/disables a short timer before start playing.'

,//16    
    'This slide the button to controls the "Tempo" (velocity) of the MIDI execution.'

,//17    
    "This button switches between the normal execution mode and the learning mode:<br>"+
    "<text class='hint_azul'><i class='ico-listening'></i>&nbsp;Normal Mode:&nbsp;</text>"+
        "<text class='hint_verde'>Comprises a simple Play/Pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
        " and Stop <i class='ico-stop'></i><br>set of buttons to execute the partiture;</text><br>" +
    "<text class='hint_azul'><i class='ico-learning'></i>&nbsp;Learning Mode:&nbsp;</text>"+
        "<text class='hint_verde'>This mode adds a set of handful options<br>to use while you are studying the partiture.<br>"+
    "<text class='hint_laranja'>Note: Next, I will adjust the \"Learning Mode\" for the final part of the demonstration.</text>"

,//18    
    'In the \"Learning Mode\", this plays one note at time, in a step-by-step fashion.'

,//19    
    'This button plays one measure at a time or the current one until its end.'

,//20    
    'Use these text boxes to limit a set of numbered measures.<br>'+
    'If you only fill in the first field, then the chosen measure will be repeated.<br>'+
    'However, by filling both with appropriate numbers, the interval will be repeated.'

,//21    
    'This button will apply and execute the repetition you configured in the previous fields.'

,//22    
    'This stops any playback in progress and places the MIDI cursor at the starting point.'

,//23    
    'This opens a window linked to Youtube video lessons (if present).'

,//24    
    "<div class='enjoy_hint_backgr'>"+
        "This is the final product of this app: a partiture with tablature.<br>"+
        "To learn more about this tablature for accordions methodology, please, take a look at:<br>"+ 
            "<text class='hint_link'>https://diatonicmap.com.br/tablature</text><br>"+
        "You can also checkout the website version:<br>"+
            "<text class='hint_link'>https://diatonicmap.com.br</text><br>"+
        "<text class='hint_black'>Enjoy all the convenience of a bigger screen, with the same repertoire and many extra editing features!</text>"+
    "</div>"

,//25    
    "<div class='enjoy_hint_backgr'>"+
    "Finally, click <i class='ico-home'> to go back to the initial page and finish this tour.<br>"+
    "Thank you for following this until here and I hope you enjoy this app.<br>"+
    "You can reach me at <text class='hint_link'>flavio.vani@gmail.com</text><br>"+
    "<text class='hint_black'>Your comments/suggestions/compliments or criticisms are welcome!</text><br>"+
    "</div>"

];

