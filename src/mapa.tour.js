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
            /*top: 75, bottom: -10, left:10, right: 10*/
        },
        {
            'next #topSettings' : g_enjoyhint_text[ge_lang][2],
                closeButton : {className: 'myClose'},
                shape : 'circle',
                radius: 36,

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
            'next #buttonTools' : g_enjoyhint_text[ge_lang][11],
                closeButton : {className: 'myClose'},
                left:3, bottom: 5,
                disableSelector: true,
        },
        {
            'next #buttonPrinter' : g_enjoyhint_text[ge_lang][12],
                closeButton : {className: 'myClose'},
                left:3, bottom: 5,
                disableSelector: true,
        },
        {
            'next #buttonPlay' : g_enjoyhint_text[ge_lang][13],
                closeButton : {className: 'myClose'},
                right: -100, left:3, bottom: 5,

        },
        {
            'next #buttonShowMedia' : g_enjoyhint_text[ge_lang][14],
                closeButton : {className: 'myClose'},
                 left:3, bottom: 5,
        },
        {
            'next #downloadApp' : g_enjoyhint_text[ge_lang][15],
                closeButton : {className: 'myClose'},
                bottom: 5,
        }
    ];
}

g_enjoyhint_text[pt_BR] = [ 'dummy',

//1
    "Vamos conhecer as principais funcionalidades do Mapa?<br>"+
    "<text class='enjoy_hint_note_text'>Observação: Você sempre poderá reiniciar este tour clicando em <i class='ico-cogs'></i> no canto superior direito da tela.</text>"

,//2
    "Use o menu \"Configurações\" para mudar coisas, tais como, o idioma <br>ou usar sons de piano acústico e muito mais."

,//3
    "Confira a caixa de listagem de acordeões<br>e escolha um de sua preferência."+
        "<text class='enjoy_hint_note_text'>Observação: De forma mais avançada, é possível também salvar um mapa e/ou carregar seu próprio Mapa de teclado.</text>"
,//4
    "O menu \"Repertório\" permite, entre outras coisas, acesso ao índice de repertório, carregar uma partitura pessoal em formato ABC ou restaurar o repertório original de um acordeão."+
        "<text class='enjoy_hint_note_text'>Observação: De forma mais avançada, é possível extrair uma tablatura, edita-la e gerar uma partitura.</text>"
,//5
    "O menu \"Informações\" contém alguma documentação sobre o Mapa, bem como sobre a teoria por trás das tablaturas."
,//6
    "Altera a notação dos nomes das notas."+
        "<text class='enjoy_hint_note_text1'>Experimente agora!</text>"
,//7
    "Altera entre as diferentes representação da tablaura."+
        "<text class='enjoy_hint_note_text1'>Experimente agora!</text>"
,//7
    "Permite selecionar entre as abas \"Acordes\", \"Exercícios\" e \"Músicas\"."+
        "<text class='enjoy_hint_note_text1'>Experimente agora!</text>"+
            "<text class='enjoy_hint_note_text'>Observação: Nem todos os acordeões possuem exemplos de acorde e exercícios.</text>"
,//10
    "Escolha, também, uma das músicas disponíveis na lista.<br>"+
        "<text class='enjoy_hint_note_text'>Observação: Só desta vez, eu escolherei, por você, uma música para<br>"+
        "melhor demonstrar as funcionalidades da próxima página.</text>"

,//5
    "Agora, clique no botão \"Abrir\" para começar a aprender!"

,//6
    "Pronto para conhecer as facilidades da barra de menu?"

,//7
    "Este botão mostra/oculta o layout do teclado. "+
        "<text class='enjoy_hint_note_text1'>Experimente agora!</text>"
,//8

"O teclado em si também possui alguns controles úteis:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-rotate' ></i> - </text>"+
            "<text class='enjoy_hint_note_text3'>Espelha os botões do teclado (flip vertical);</text><br>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-world' ></i> - </text>"+
            "<text class='enjoy_hint_note_text3'>Altera a notação dos nomes das notas; e</text><br>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-open-right'></i> - </text>"+
            "<text class='enjoy_hint_note_text3'>Alterna o lado do teclado: esquerda/direita.</text>"+
    "<div>"

,//9
    "Mostra uma prévia da impressão da música atual."

,//10
    "Alterna entre dois formatos diferentes para numeração de tablaturas. <text class='enjoy_hint_note_text1'>Experimente agora!</text>"

,//11
    "Este botão mostra/oculta os dedilhados da tablatura (se presentes). <text class='enjoy_hint_note_text1'>Experimente agora!</text>"

,//12
    "Este botão mostra/oculta a letra da música (se houver). <text class='enjoy_hint_note_text1'>Experimente agora!</text>"

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
    "<text class='enjoy_hint_note_text2'><i class='ico-listening'></i>&nbsp;Modo Normal:&nbsp;</text>"+
        "<text class='enjoy_hint_note_text3'>Compreende um conjunto simples de botões<br>play/pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
        " e stop <i class='ico-stop'></i> para permitir a execução da partitura;</text><br>" +
    "<text class='enjoy_hint_note_text2'><i class='ico-learning'></i>&nbsp;Modo de aprendizagem:&nbsp;</text>"+
        "<text class='enjoy_hint_note_text3'>Este modo adiciona um conjunto de opções<br>para usar enquanto você estiver estudando a partitura.<br>"+
    "<text class='enjoy_hint_note_text'>Observação: A seguir, ajustarei o \"Modo de aprendizagem\" para a parte final da demonstração.</text>"
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
            "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br/tablature</text><br>"+
        "Você também pode conferir a versão para website do aplicativo:<br>"+
            "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br</text><br>"+
        "<text class='enjoy_hint_note_rodape'>Aproveite toda a comodidade de uma tela maior, com o mesmo repertório e muitos recursos extras de edição!</text>"+
    "</div>"

,//25
    "<div class='enjoy_hint_backgr'>"+
        "Finalmente, clique em <i class='ico-home'> para voltar à página inicial e finalizar este tour.<br>"+
        "Obrigado por ter acompanhado este tutorial até aqui e espero que você goste deste aplicativo.<br>"+
        "Você pode entrar em contato comigo pelo e-mail <text class='enjoy_hint_note_link'>flavio.vani@gmail.com</text><br>"+
        "<text class='enjoy_hint_note_rodape'>Seus comentários/sugestões/elogios ou críticas são bem-vindos!</text><br>"+
    "</div>"

];

g_enjoyhint_text[es_ES] = [ 'dummy',

//1
    "¿Conozcamos las características principales de esta Aplicación?<br>"+
    "<text class='enjoy_hint_note_text'>Nota: siempre puedes reiniciar este tour haciendo clic en <i class='ico-cogs'></i><br>"+
    "en la esquina superior izquierda de la aplicación.</text>"

,//dos
    "Utilice el menú \"Configuración\" para cambiar cosas como el idioma<br>o usar sonidos de piano acústico y más."

,//3
    "Consulta el cuadro de lista de acordeones<br>y elige uno que te guste."

,//4
    "Elige también una de las canciones disponibles en la lista.<br>"+
        "<text class='enjoy_hint_note_text'>Nota: Sólo por esta vez, elegiré para ti una canción para<br>"+
        " mejor demonstrar las funciones en la página siguiente.</text>"

,//5
    "¡Ahora, haz clic en el botón \"Abrir\" para comenzar a aprender!"

,//6
    "Listo para conocer las características de la barra de menú?"

,//7
    "Este botón muestra/oculta la distribución del teclado. "+
        "<text class='enjoy_hint_note_text1'>¡Pruébalo ahora!</text>"

,//8
    "El teclado en sí también tiene algunos controles útiles:<br>"+
    "<div style='text-align:left; margin-left:3em'>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-rotate'></i> - </text>"+
            "<text class='enjoy_hint_note_text3'>Refleja los botones del teclado (volteo vertical);</text><br>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-world'></i>- </text>"+
            "<text class='enjoy_hint_note_text3'>Cambia la notación de los nombres de las notas; y</text><br>"+
        "<text class='enjoy_hint_note_text2'><i class='ico-open-right'></i> - </text>"+
            "<text class='enjoy_hint_note_text3'>Cambia el lado del teclado: izquierda/derecha.</text>"+
    "<div>"

,//9
    "Muestra una vista previa de impresión de la canción actual."

,//10
    "Cambie entre dos formatos diferentes para la numeración de la tablatura. <text class='enjoy_hint_note_text1'>¡Pruébelo ahora!</text>"

,//11
    "Este botón muestra/oculta las digitaciones de la tablatura (si están presentes). <text class='enjoy_hint_note_text1'>¡Pruébalo ahora!</text>"

,//12
    "Este botón muestra/oculta la letra de la canción (si está presente). <text class='enjoy_hint_note_text1'>¡Pruébalo ahora!</text>"

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
     "<text class='enjoy_hint_note_text2'><i class='ico-listening'></i>&nbsp;Modo normal:&nbsp;</text>"+
         "<text class='enjoy_hint_note_text3'>Consta de un conjunto simple de botones<br>reproducir/pausa <i class='ico-play'></i>/<i class='ico-pause'></i> "+
         " y detenga <i class='ico-stop'></i> para permitir que se reproduzca la partitura;</text><br>" +
     "<text class='enjoy_hint_note_text2'><i class='ico-learning'></i>&nbsp;Modo de aprendizaje:&nbsp;</text>"+
         "<text class='enjoy_hint_note_text3'>Este modo agrega un conjunto de opciones<br>para usar mientras estudias la partitura.<br>"+
     "<text class='enjoy_hint_note_text'>Nota: A continuación, ajustaré el \"Modo de aprendizaje\" para la parte final de la demostración.</text>"
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
             "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br/tablature</text><br>"+
         "También puedes consultar la versión del sitio web de la aplicación:<br>"+
             "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br</text><br>"+
         "<text class='enjoy_hint_note_rodape'>¡Disfruta de toda la comodidad de una pantalla más grande, con el mismo repertorio y muchas funciones de edición adicionales!</text>"+
     "</div>"

,//25
     "<div class='enjoy_hint_backgr'>"+
         "Finalmente, haga clic en <i class='ico-home'> para regresar a la página de inicio y finalizar este tour.<br>"+
         "Gracias por seguir este tutorial hasta ahora y espero que disfrutes esta aplicación.<br>"+
         "Puedes contactarme en <text class='enjoy_hint_note_link'>flavio.vani@gmail.com</text><br>"+
         "<text class='enjoy_hint_note_footrodape'>¡Tus comentarios/sugerencias/elogios o críticas son bienvenidos!</text><br>"+
     "</div>"
];

g_enjoyhint_text[en_US] = [ 'dummy',
    //1
        "Let's learn about the main features of this App?<br>"+
        "<text class='enjoy_hint_note_text'>Note: You can always restart this tour by clicking <i class='ico-cogs'></i> on left-top corner of the App.</text>"

    ,//2    
        "Use the \"Settings\" menu to change stuff such as the language <br>or to use piano sounds and more."

    ,//3    
        "Checkout the accordion listbox <br>and choose the one of your prefference."

    ,//4    
        "Also, choose an available song from the list.<br>"+
            "<text class='enjoy_hint_note_text'>Note: Only this time, I'll choose you a song<br>for a better demonstration.</text>"

    ,//5    
        "Now, click the \"Open\" button to start learning!"

    ,//6    
        "Are you ready to know the facilities on the menu bar?"

    ,//7    
        "This button shows/hides the keyboard layout. "+
            "<text class='enjoy_hint_note_text1'>Try it now!</text>"

    ,//8
        "The keyboard itself also has some useful controls:<br>"+
            "<div style='text-align:left; margin-left:3em'>"+
                "<text class='enjoy_hint_note_text2'><i class='ico-rotate' ></i> - </text>"+
                    "<text class='enjoy_hint_note_text3'>Mirrors the keyboard's buttons (vertical flip);</text><br>"+
                "<text class='enjoy_hint_note_text2'><i class='ico-world' ></i> - </text>"+
                    "<text class='enjoy_hint_note_text3'>Changes the note names notation; and</text><br>"+
                "<text class='enjoy_hint_note_text2'><i class='ico-open-right'></i> - </text>"+
                "<text class='enjoy_hint_note_text3'>Shifts the keyboard side: left/right.</text>"+
            "<div>"

    ,//9
        'Shows a print preview for the current song.'

    ,//10    
        "Switches among different formats for tablature numbering. <text class='enjoy_hint_note_text1'>Try it now!</text><br><br>"+
            "São três formatos distintos, cada um com duas variantes:<br>Formato alemão, numérico ciclíco e numérico contínuo.<br><br>"+
            "<text class='enjoy_hint_note_text'>Note: Maiores detalhes você encontra no site.</text>"+
            "<!--div style='text-align:left; margin-left:3em'>"+
                "<text class='enjoy_hint_note_text2'>Formato alemão: </text>"+
                    "<text class='enjoy_hint_note_text3'>Os botões em cada ilheira são numeraods de 1 a n, e a ilheira é marcada com apóstrofes ou números; </text><br>"+
                "<text class='enjoy_hint_note_text2'>Numérica cíclica: </text>"+
                    "<text class='enjoy_hint_note_text3'>Os botões em cada ilheira são numerados em uma dezena diferente; e</text><br>"+
                "<text class='enjoy_hint_note_text2'>Numérica contínua:</text>"+
                "<text class='enjoy_hint_note_text3'>Os botões são numerados sequencialmente, de 1 a n.</text>"+
                "<text class='enjoy_hint_note_text'>Note: Maiores detalhes você encontra no site.</text>"+
                    "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br/tablature</text>"+
            "<div -->"

    ,//11    
        "This button shows/hides the tablature fingering (if present). <text class='enjoy_hint_note_text1'>Try it now!</text>"

    ,//12    
        "This button shows/hides the song lyrics (if present). <text class='enjoy_hint_note_text1'>Try it now!</text>"

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
        "<text class='enjoy_hint_note_text2'><i class='ico-listening'></i>&nbsp;Normal Mode:&nbsp;</text>"+
            "<text class='enjoy_hint_note_text3'>Comprises a simple Play/Pause <i class='ico-play'></i>/<i class='ico-pause'></i>"+
            " and Stop <i class='ico-stop'></i><br>set of buttons to execute the partiture;</text><br>" +
        "<text class='enjoy_hint_note_text2'><i class='ico-learning'></i>&nbsp;Learning Mode:&nbsp;</text>"+
            "<text class='enjoy_hint_note_text3'>This mode adds a set of handful options<br>to use while you are studying the partiture.<br>"+
        "<text class='enjoy_hint_note_text'>Note: Next, I will adjust the \"Learning Mode\" for the final part of the demonstration.</text>"

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
                "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br/tablature</text><br>"+
            "You can also checkout the website version:<br>"+
                "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br</text><br>"+
            "<text class='enjoy_hint_note_rodape'>Enjoy all the convenience of a bigger screen, with the same repertoire and many extra editing features!</text>"+
        "</div>"

    ,//25    
        "<div class='enjoy_hint_backgr'>"+
        "Finally, click <i class='ico-home'> to go back to the initial page and finish this tour.<br>"+
        "Thank you for following this until here and I hope you enjoy this app.<br>"+
        "You can reach me at <text class='enjoy_hint_note_link'>flavio.vani@gmail.com</text><br>"+
        "<text class='enjoy_hint_note_rodape'>Your comments/suggestions/compliments or criticisms are welcome!</text><br>"+
        "</div>"
    
];

