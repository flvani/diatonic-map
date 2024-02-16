
var g_enjoyhint_opts = {
     "btnNextText": 'Próximo'
    ,"btnPrevText": 'Voltar'
    ,"btnSkipText": 'Dispensar'
    ,backgroundColor: "rgba(0,0,0,0.5)"
    ,onEnd:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties();}
    ,onSkip:function(){SITE.properties.options.guidedTour = true;SITE.SaveProperties(); SITE.myTour.destroy()}
}


/*
Vamos conhecer as principais funcionalidades deste App?
Use o menu Configurações para alterar itens como o idioma ou usar sons de piano e muito mais.
Confira a caixa de listagem do acordeão e escolha o de sua preferência.
Escolha uma música disponível na lista.
Agora, clique no botão "Abrir" para começar a aprender.
*/

var g_enjoyhint_script_steps = [
                
    {
        'next #appTitle' : "Let's learn about the main features of this App?<br>"+
        "<text style='color: #ffa6eb'>If you dismiss the tour will not appear again until you Redefine the options in the Settings menu</text>",
        "nextButton" : { text: "Começar"},
         top: 75, bottom: -10, left:10, right: 10
    },
    {
        'next #topSettings' : 'Use the Settings menu to change stuff such as the language or to use piano sounds and more.',
            shape : 'circle',
            radius: 36,
    },
    {
        'next #menuGaitas' : 'Checkout the accordion listbox and choose the one of your prefference.',
    },
    {
        'next #menuSongs' : 'Choose an availiable song from the list.',
    },
    {
        'click #openBtn' : 'Now, click the "Open" button to start learning.',
        showSkip: false,
         top: -6, bottom: -4, left: -6, 
        scrollAnimationSpeed : 2500,
    },
    {
        'next #controlDiv1' : "Now let's know the facilities on the menu bar",
        "nextButton" : { text: "Começar"},
         showPrev: false,
         top: 50, bottom: 0, left:10, right: -200

    },
    {
        'next .ico-keyboard' : 'Show/Hide the keyboard layout',
            shape : 'circle',
            radius: 22,
            disableSelector: true
    },
    {
        'next .ico-printer' : 'Show a print preview for the partiture/tablature.',
            shape : 'circle',
            radius: 22,
    },
    {
        'next .ico-tabformat' : 'Switch between two different formats for tablature numbering',
            shape : 'circle',
            radius: 22
    },
    {
        'next .ico-alien-fingering2' : 'Show/Hide the fingering (if present)',
            shape : 'circle',
            radius: 22
    },
    {
        'next .ico-letter-l' : 'Show/Hide the lyrics (if present)',
            shape : 'circle',
            radius: 22
    },
    {
        'next .ico-clef-treble' : 'Mute/Unmute the sound of the melody during the Midi execution.',
            shape : 'circle',
            radius: 22
    },
    {
        'next .ico-clef-bass' : 'Mute/Unmute the sound of the bass rhythm during the Midi execution.',
            shape : 'circle',
            radius: 22
    },
    {
        'next .ico-timer-00' : 'Enable/Disable a short timer before start playing',
            shape : 'circle',
            radius: 22
    },
    {
        'next #tempoBtnId' : 'Slide the button to control the Tempo (velocity) of the Midi execution',
         top: -4, bottom: -4
    },
/*    
    {
        'next #playBtn' : 'Play/Pause the current song.',
            shape : 'circle',
            radius: 22
    },
    {
        'next #stopBtn' : 'Stop the current song.',
            shape : 'circle',
            radius: 22
    },
*/    
    {
        'next #modeBtn': "Switch between the normal execution mode and the learning mode:<br>"+
        "<text style='color: #00a6eb'><i class='ico-listening'></i>&nbsp;Normal Mode:&nbsp;</text>"+
            "<text style='color: #2bff3c'>Comprises a simple play <i class='ico-play'></i>/pause <i class='ico-pause'></i>/stop <i class='ico-stop'></i><br>set of buttons to execute the partiture.</text><br>" +
        "<text style='color: #00a6eb'><i class='ico-learning'></i>&nbsp;Learning Mode:&nbsp;</text>"+
            "<text style='color: #2bff3c'>'This mode adds a set of handful options<br>to use while you are studying the partiture.<br>" +
        "<text style='color: #ffa6eb'>Before you continue, please, set the <i class='ico-learning'></i> Learning Mode!&nbsp;</text>",
            shape : 'circle',
            radius: 24
    },
    {
        'next #stepBtn' : 'Play one note at time',
            onBeforeStart:function(){myApp.appView.changePlayMode('learning');},
            shape : 'circle',
            radius: 22
    },
    {
        'next #stepMeasureBtn' : '1 measure',
            shape : 'circle',
            radius: 22
    },
    {
        'next .input-group' : 'xxxx',
         top: -4, bottom: -4
    },
    {
        'next #repeatBtn' : 'repeat interval',
            shape : 'circle',
            radius: 22
    },
    {
        'next #clearBtn' : 'clear',
            shape : 'circle',
            radius: 22
    },
    {
        'next .abc_title' : 'to learn more access <a href="https://diatonicmap.com.br/tablatura.pt_BR.html">https://diatonicmap.com.br/tablatura.pt_BR.html</a>',
        top: 40, bottom: -320, left:-500, right: 0
    },
    {
        'click .ico-home' : 'Back to initial page.',
            shape : 'circle',
            radius: 26,
            "skipButton" : { text: "Encerrar"},
        },
];


