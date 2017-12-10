/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = {};

SITE.Repertorio = function() {
    this.accordion = new window.ABCXJS.tablature.Accordion({
        accordionMaps: DIATONIC.map.accordionMaps
       ,translator: SITE.translator 
       ,render_keyboard_opts:{
            transpose:true
           ,mirror:false
           ,scale:1
           ,draggable:false
           ,show:true
           ,label:false
       }
    });
};

// Esta rotina foi criada como forma de verificar todos warnings de compilacao do repertório
SITE.Repertorio.prototype.compileAll = function() {

    for(var a = 0; a <this.accordion.accordions.length; a ++ ) {
        this.accordion.load( a );
        var abcParser = new ABCXJS.parse.Parse( null, this.accordion );
        var midiParser = new ABCXJS.midi.Parse();

        waterbug.log(this.accordion.loaded.id);
        
        for (var title in this.accordion.loaded.songs.items ) {

            waterbug.log(title);

            abcParser.parse( this.accordion.loaded.songs.items[title] );

            var w = abcParser.getWarnings() || [];
            var l = w.length;

            for (var j=0; j<w.length; j++) {
                waterbug.logError( '   ' + w[j]);
            }

            var tune = abcParser.getTune();

            midiParser.parse( tune, this.accordion.loadedKeyboard );
            var w = midiParser.getWarnings();
            l += w.length;
            for (var j=0; j<w.length; j++) {
                waterbug.logError( '   ' + w[j]);
            }

            waterbug.log(l > 0 ? '': '--> OK' );
            waterbug.log( '' );
        }
    }
    
    waterbug.show();    
    
};        

// gerar repertório indexado
SITE.Repertorio.prototype.geraIndex = function( map ) {

    var lista  = null;
    var club   = false;
    var repertorio = { geral: [], transportada: [], corona: [] };
    
    for(var a = 0; a < this.accordion.accordions.length; a ++ ) {
        this.accordion.load( a );
        //var abcParser = new ABCXJS.parse.Parse( null, accordion );

        club = false;
        
        switch(this.accordion.loaded.id) {
             case 'GAITA_HOHNER_CLUB_IIIM_BR':
                club = true;
             case 'GAITA_MINUANO_GC':
                lista = repertorio.geral;
                break;
             case 'GAITA_HOHNER_CORONA_II':
                lista = repertorio.corona;
                break;
             case 'GAITA_MINUANO_BC_TRANSPORTADA':
                lista = repertorio.transportada;
                break;
        }
         
        for (var t in this.accordion.loaded.songs.items ) {

            var title = t.replace( '(corona)', '' ).replace( '(club)', '' ).replace( '(transportada)', '' ).trim();
            var composer = this.accordion.loaded.songs.details[t].composer;
            var id = this.accordion.loaded.songs.details[t].id;

            if( ! club ) {
                lista.push ( {title:title, composer:composer, geral: id, club: 0 } );
            } else {
                var idx = -1, l = 0;
                while( idx === -1 && l < lista.length  ) {
                    if( lista[l].title === title ) idx = l;
                    l ++;
                }
                if( idx !== -1 ) {
                    lista[idx].club = id;
                } else {
                    lista.push ( {title:title, composer:composer, geral: 0, club: id } );
                }
            }
        }
    }

    var ordenador = function(a,b) { 
        if (a.title < b.title)
          return -1;
        if ( a.title > b.title)
          return 1;
        return 0; 
    };

    repertorio.geral.sort( ordenador );    
    repertorio.transportada.sort( ordenador );    
    repertorio.corona.sort( ordenador );    

    var h = '\
<html>\n\
    <head>\n\
        <title>Repertório indexado</title>\n\
        <meta charset="UTF-8">\n\
        <meta name="robots" content="index,follow">\n\
        <meta name="revisit-after" content="7 days">\n\
        <meta name="keywords" content="diatonic accordion, notation, learning, practice, repertoire, abc tunes, midi, tablature\n\
acordeão diatônico, gaita de oito baixos, gaita ponto, notação musical, aprendizagem, prática, repertorio, notação abc, tablatura ">\n\
        <style>\n\
            h1 {font-family: Arial; font-size: 30px; line-height:10x; margin:3px; }\n\
            h2 {font-family: Arial; font-size: 20px; line-height:10x; margin:3px; }\n\
            table.interna {border-collapse: collapse; width:650px; margin:3px; }\n\
            table.interna tr {font-family: Arial; background: #dfdfdf;}\n\
            table.interna th {background: blue; color: white; text-align: left; padding: 3px;}\n\
            table.interna td {text-align: left; padding: 3px;}\n\
            table.interna img { width: 40px;}\n\
            table.interna .par {background: #c0c0c0;}\n\
            table.interna .center {text-align: center;}\n\
            table.interna .title {font-weight:bold;}\n\
            table.interna .composer {font-style:italic;}\n\
        </style>\n\
    </head>\n\
<body>\n\
<br>\n\
<h1>Repertório Geral</h1>\n\
<h2>Tablaturas para acordeão G/C e/ou Club IIIM</h2>\n\
<table class="interna"><tr><th>Título</th><th >Autor(es)</th><th class="center">G/C</th><th class="center">C/F  Club(br)</th></tr>\n\
';
    
    for( var r = 0; r < repertorio.geral.length; r ++ ) {
        h += '<tr'+( ( r & 1) ? ' class="par"': '' ) +'>'
                +'<td class="title" >'+repertorio.geral[r].title
                +'</td><td class="composer" >'+repertorio.geral[r].composer
                +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_MINUANO_GC', repertorio.geral[r].geral  ) 
                +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_HOHNER_CLUB_IIIM_BR', repertorio.geral[r].club ) 
                +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br><h1>Transportada</h1>\n\
<h2>Tablaturas para acordeão Transportado</h2>\n\
<table class="interna"><tr><th>Título</th><th>Autor(es)</th><th class="center">B/C</th></tr>\n\
';
                    
    for( var r = 0; r < repertorio.transportada.length; r ++ ) {
        h += '<tr'+( ( r & 1) ? ' class="par"': '' ) +'>'
            +'<td class="title" >'+repertorio.transportada[r].title
            +'</td><td class="composer" >'+repertorio.transportada[r].composer
            +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_MINUANO_BC_TRANSPORTADA', repertorio.transportada[r].geral ) 
            +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br><h1>Corona</h1>\n\
<h2>Tablaturas para acordeão Corona II A/D/G</h2>\n\
<table class="interna"><tr><th>Título</th><th>Autor(es)</th><th class="center">A/D/G</th></tr>\n\
';
                    
    for( var r = 0; r < repertorio.corona.length; r ++ ) {
        h += '<tr'+( ( r & 1) ? ' class="par"': '' ) +'>'
            +'<td class="title" >'+repertorio.corona[r].title
            +'</td><td class="composer" >'+repertorio.corona[r].composer
            +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_HOHNER_CORONA_II', repertorio.corona[r].geral ) 
            +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br>\n\
</body>\n\
</html>\n\
';

    if( map ){
        if( ! this.win ) {
            this.win = new DRAGGABLE.ui.Window( 
                  map.mapDiv
                , null
                , {translator: SITE.translator, statusbar: false, draggable: true, 
                    top: "10px", left: "800px", width: 'auto', height: "80%", title: 'IDXREPERTOIRE'}
                , null 
            );
            this.win.dataDiv.className = "draggableData customScrollBar";
        }
        this.win.setVisible(true);
        this.win.dataDiv.innerHTML = h;
        this.win.topDiv.style.left = (window.innerWidth - this.win.topDiv.clientWidth - 12) + 'px';
        this.bindSongs(this.win.dataDiv, map );
    } else {
        FILEMANAGER.download( 'repertorio.indexado.pt_BR.html', h );
    }
};        

SITE.Repertorio.prototype.makeAnchor = function( map, accordionId, songId  ) {
    var path = '/diatonic-map/';
    var anchor = '<img alt="nao" src="/diatonic-map/images/nao.png" >';
    if( songId > 0 ) {
        if( map ) {
            anchor = '<img alt="sim" src="/diatonic-map/images/sim.png" data-song="'+accordionId+'#'+songId+'" >';
        } else {
            anchor = '<a href="'+path+'?accordion='+accordionId+'&id='
                        +songId+'"><img alt="sim" src="/diatonic-map/images/sim.png" ></a>';
        }
    }
        
    return anchor;
};

SITE.Repertorio.prototype.bindSongs = function( container, map ) { 
    
    var clickMe = function (e, item) {
        e.stopPropagation();
        e.preventDefault();
        var data = item.getAttribute("data-song").split("#");
        map.setup( {accordionId: data[0], songId: data[1] } );
    };
    
    var songs = container.querySelectorAll('[data-song]');
    var songsArray = Array.prototype.slice.apply(songs);
    for( var i=0; i < songsArray.length; i ++ ) {
        var item = songsArray[i];
        item.addEventListener('touchstart', function (e) { clickMe( e, this ); } );
        item.addEventListener('mouseover', function (e) { this.style.cursor='pointer'; } );
        item.addEventListener('click', function (e) { clickMe( e, this ); } );
    }
};
