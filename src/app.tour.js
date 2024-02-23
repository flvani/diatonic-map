var g_enjoyhint_opts
var g_enjoyhint_script_steps

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

    g_enjoyhint_script_steps = [
                    
        {
            'next #appTitle' : "Let's learn about the main features of this App?<br>"+
            "<text class='enjoy_hint_note_text'>Note: You can always restart this tour by clicking <i class='ico-menu'></i> on left-top corner of the App.</text>",
            "nextButton" : { text: SITE.translator.getResource('Start') },
            /*top: 75, bottom: -10, left:10, right: 10*/
        },
        {
            'next #topSettings' : 'Use the Settings menu to change stuff such as the language <br>or to use piano sounds and more.',
                shape : 'circle',
                radius: 36,
        },
        {
            'next #menuGaitas' : 'Checkout the accordion listbox <br>and choose the one of your prefference.'
        },
        {
            'next #menuSongs' : "Choose an available song from the list.<br>"+
                "<text class='enjoy_hint_note_text'>Note: Only this time, I'll choose you a song<br>for a better demonstration.</text>"
        },
        {
            'click #openBtn' : "Now, click the \""+SITE.translator.getResource('Open') +"\" button to start learning!",
            showSkip: false,
            top: -7, bottom: -4, left: -7, 
            /*scrollAnimationSpeed : 300,*/
            onBeforeStart:function(){ 
                myApp.changeAccordion({accordionId:'GAITA_HOHNER_CORONA_GCF'}); 
                myApp.showABC( 'songs#6011' );
            },
        },
        {
            'next #controlDiv' : "Now, let's know the facilities on the menu bar",
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
            'next .ico-keyboard' : "This button shows/hides the keyboard layout. "+
                    "<text class='enjoy_hint_note_text1'>Try it now!</text>",
                shape : 'circle',
                radius: 22,
        },
        {
            'next #keyboardExtraBtnDiv' : "The keyboard itself also has some useful controls:<br>"+
                    "<div style='text-align:left; margin-left:3em'>"+
                    "<text class='enjoy_hint_note_text2'><i class='ico-rotate' ></i> - </text><text class='enjoy_hint_note_text3'>Mirrors the keyboard's buttons (vertical flip);</text><br>"+
                    "<text class='enjoy_hint_note_text2'><i class='ico-world' ></i> - </text><text class='enjoy_hint_note_text3'>Changes the note names notation; and</text><br>"+
                    "<text class='enjoy_hint_note_text2'><i class='ico-open-right'></i> - </text><text class='enjoy_hint_note_text3'>Shitfs the keyboard side: left/right.</text><div>",
            onBeforeStart:function(){ 
                myApp.appView.showKeyboard(true); 
            },
            top: 10, bottom: 14, left: 7, right: 30,
            disableSelector: true
        },
        {
            'next .ico-printer' : 'Shows a print preview for the current song.',
                shape : 'circle',
                radius: 22,
                disableSelector: true,
        },
        {
            'next .ico-tabformat' : "Switches between two different formats for tablature numbering. <text class='enjoy_hint_note_text1'>Try it now!</text>",
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-alien-fingering2' : "This button shows/hides the tablature fingering (if present). <text class='enjoy_hint_note_text1'>Try it now!</text>",
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-letter-l' : "This button shows/hides the song lyrics (if present). <text class='enjoy_hint_note_text1'>Try it now!</text>",
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-treble' : 'This button mutes/unmutes the sound of the melody during the MIDI execution.',
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-clef-bass' : 'This button mutes/unmutes the sound of the bass rhythm during the MIDI execution.',
                shape : 'circle',
                radius: 22
        },
        {
            'next .ico-timer-00' : 'This button enables/disables a short timer before start playing.',
                shape : 'circle',
                radius: 22
        },
        {
            'next #tempoBtnId' : 'This slide the button to controls the "Tempo" (velocity) of the MIDI execution.',
            top: -2, bottom: -4, left: 2, right: 2
        },
        {
            'next #modeBtn': "This button switches between the normal execution mode and the learning mode:<br>"+
            "<text class='enjoy_hint_note_text2'><i class='ico-listening'></i>&nbsp;Normal Mode:&nbsp;</text>"+
                "<text class='enjoy_hint_note_text3'>Comprises a simple Play/Pause <i class='ico-play'></i>/<i class='ico-pause'></i> and Stop <i class='ico-stop'></i><br>set of buttons to execute the partiture;</text><br>" +
            "<text class='enjoy_hint_note_text2'><i class='ico-learning'></i>&nbsp;Learning Mode:&nbsp;</text>"+
                "<text class='enjoy_hint_note_text3'>This mode adds a set of handful options<br>to use while you are studying the partiture.<br>"+
                "<text class='enjoy_hint_note_text'>Note: Next, I will adjust the \"Learning Mode\" for the final part of the demonstration.</text>",
                shape : 'circle',
                radius: 24
        },
        {
            'next #stepBtn' : 'In the \"Learning Mode\", this plays one note at time, in a step-by-step fashion.',
                onBeforeStart:function(){
                    myApp.appView.changePlayMode('learning');
                },
                shape : 'circle',
                radius: 22
        },
        {
            'next #stepMeasureBtn' : 'This plays the current measure until its end.',
                shape : 'circle',
                radius: 22
        },
        {
            'next .input-group' : 
            'Use these text boxes to limit a set of numbered measures.<br>'+
            'If you only fill in the first field, then the chosen measure will be repeated.<br>'+
            'However, by filling both with appropriate numbers, the interval will be repeated.',
            top: 0, bottom: 10,
            disableSelector: true
        },
        {
            'next #repeatBtn' : 'This button will apply and execute the repetition you configured in the previous fields.',
                shape : 'circle',
                radius: 22
        },
        {
            'next #clearBtn' : 'This stops any playback in progress and places the MIDI cursor at the starting point.',
                shape : 'circle',
                radius: 22
        },
        {
            'next #buttonShowMedia' : 'This opens a window linked to Youtube video lessons (if present).',
                shape : 'circle',
                radius: 22
        },
        {
            'next #outerCanvasDiv' : 
                "<div class='enjoy_hint_backgr'>"+
                "This is the final product of this app: a partiture with tablature.<br>"+
                "To learn more about this tablature for accordions methodology, please, take a look at:<br>"+ 
                "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br/tablature</text><br>"+
                "You can also checkout the website version:<br>"+
                "<text class='enjoy_hint_note_link'>https://diatonicmap.com.br</text><br>"+
                "<text class='enjoy_hint_note_rodape'>Enjoy all the convenience of a bigger screen, with the same repertoire and many extra editing features!</text>"+
                "</div>",
                onBeforeStart:function(){ 
                    myApp.appView.media.callback( 'CLOSE' ); 
                    myApp.appView.changePlayMode('normal');
                },
                disableSelector: true,
                shape : 'circle',
                radius: 280
        },
        {
            'click .ico-home' : 
                "<div class='enjoy_hint_backgr'>"+
                "Finally, click <i class='ico-home'> to go back to the initial page and finish this tour.<br>"+
                "Thank you for following this until here and I hope you enjoy this app.<br>"+
                "You can reach me at <text class='enjoy_hint_note_link'>flavio.vani@gmail.com</text><br>"+
                "<text class='enjoy_hint_note_rodape'>Your comments/suggestions/compliments or criticisms are welcome!</text><br>"+
                "</div>",
                showSkip: false,
                showPrev: false,
                shape : 'circle',
                radius: 26
        },
    ];
}
