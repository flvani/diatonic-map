/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SITE)
    window.SITE = { gtagInitiated : false, root: '/mapa' };

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
    }, SITE.properties.options.tabFormat);
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
            console.log(title);

            abcParser.parse( this.accordion.loaded.songs.items[title] );

            var w = abcParser.getWarnings() || [];
            var l = w.length;

            for (var j=0; j<w.length; j++) {
                waterbug.logError( '   ' + w[j]);
                console.log( '   ' + w[j]);
            }

            var tune = abcParser.getTune();

            midiParser.parse( tune, this.accordion.loadedKeyboard );
            var w = midiParser.getWarnings();
            l += w.length;
            for (var j=0; j<w.length; j++) {
                waterbug.logError( '   ' + w[j]);
                console.log( '   ' + w[j]);
            }

            waterbug.log(l > 0 ? '': '--> OK' );
            console.log(l > 0 ? '': '--> OK' );
            waterbug.log( '' );
            console.log('');
        }
    }
    
    waterbug.show();    
    
};        

// gerar repertório indexado
SITE.Repertorio.prototype.geraIndex = function( map ) {

    var lista  = null;
    var tipo   = 'geral';
    var repertorio = { geral: [], transportada: [], corona: [], portuguesa: [] };
    
    for(var a = 0; a < this.accordion.accordions.length; a ++ ) {
        this.accordion.load( a );
        //var abcParser = new ABCXJS.parse.Parse( null, accordion );

        tipo   = 'geral';
        
        switch(this.accordion.loaded.id) {
            case 'GAITA_HOHNER_CLUB_IIIM_BR':
                tipo = 'club';
            case 'GAITA_MINUANO_GC':
                lista = repertorio.geral;
                break;
            case 'GAITA_HOHNER_CORONA_GCF':
                tipo = 'gcf';
            case 'GAITA_HOHNER_CORONA_ADG':
                lista = repertorio.corona;
                break;
            case 'CONCERTINA_PORTUGUESA':
                lista = repertorio.portuguesa;
                break;
            case 'GAITA_MINUANO_BC_TRANSPORTADA':
                lista = repertorio.transportada;
                break;
        }
         
        for (var t in this.accordion.loaded.songs.items ) {
            
            if( this.accordion.loaded.songs.details[t].hidden ) {
                continue; //não mostra itens hidden
            }

            var title = t.replace( '(corona)', '' )
                            .replace( '(club)', '' )
                            .replace( '(transportada)', '' )
                            .replace( '(portuguesa)', '' ).trim();
                    
            var composer = this.accordion.loaded.songs.details[t].composer;
            var id = this.accordion.loaded.songs.details[t].id;

            switch(tipo){
                case 'club':
                case 'gcf':
                    var idx = -1, l = 0;
                    while( idx === -1 && l < lista.length  ) {
                        if( lista[l].title === title ) idx = l;
                        l ++;
                    }
                    if( idx !== -1 ) {
                        lista[idx].outro = id;
                    } else {
                        lista.push ( {title:title, composer:composer, geral: 0, outro: id } );
                    }
                    break;
                case 'geral':
                    lista.push ( {title:title, composer:composer, geral: id, outro: 0 } );
                
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
    repertorio.portuguesa.sort( ordenador );    

    var h = '\
<html>\n\
    <head>\n\
        <title>Mapa para Acordões Diatônicos - Repertório Indexado</title>\n\
        <meta charset="UTF-8">\n\
        <meta name="robots" content="index,follow">\n\
        <meta name="revisit-after" content="7 days">\n\
        <meta name="keywords" content="diatonic accordion, notation, learning, practice, repertoire, abc tunes, midi, tablature \
acordeão diatônico, gaita de oito baixos, gaita ponto, notação musical, aprendizagem, prática, repertorio, notação abc, tablatura ">\n\
        <style>\n\
            h1 {font-family: Arial; font-size: 40px; line-height:10x; margin:3px; }\n\
            h2 {font-family: Arial; font-size: 30px; line-height:10x; margin:3px; }\n\
            h3 {font-family: Arial; font-size: 20px; line-height:10x; margin:3px; }\n\
            p {font-family: Arial; font-size: 15px; line-height:10x; margin:3px; margin-bottom: 10px; }\n\
            .credit {font-style: italic; }\n\
            .destaque {font-style: italic; font-weight: bold;}\n\
            table.interna {border-collapse: collapse; width:calc(100% - 10px); min-width:'+(map?450:650)+'px; max-width:1024px; margin:3px; }\n\
            table.interna tr {font-family: Arial; background: #dfdfdf;}\n\
            table.interna tr:nth-child(even) { background-color:  #c0c0c0; }\n\
            table.interna th {background: blue; color: white; text-align: left; padding: 3px;}\n\
            table.interna td {text-align: left; padding: 3px;}\n\
            table.interna img { width: 40px;}\n\
            table.interna .center {text-align: center;}\n\
            table.interna .title {font-weight:bold;}\n\
            table.interna .composer {font-style:italic;}\n\
            table.interna .abc_link { color: black; text-decoration: none; } \n\
            table.interna .abc_link:hover {  color: blue;   text-decoration: none; }\n\
        </style>\n\
    </head>\n\
<body>\n\
<br>\n';
                    
if( ! map ) {
h += '\
<h1>Mapa para Acordões Diatônicos</h1>\n\
<p class="credit">Desenvolvido por: <span class="destaque">Flávio Vani</span>\n\
<br>Coordenação musical: <span class="destaque">prof. Cezar Ferreira</span></p>\n\
<p>Esta página apresenta, em ordem alfabética, todo o repertório do site. O site é composto de partituras para acordeão diatônico com \n\
tablaturas.</p>\n\
<p><span class="destaque">Nota: </span>Clique no checkmark verde (à direita) para abrir o site na partitura com o acordeão selecionado.</p>\n\
';
}

h += '<h2>Repertório Geral</h2>\n\
<h3>Tablaturas para acordeão G/C e/ou Club IIIM</h3>\n\
<table class="interna"><tr><th>Título</th>'+(map?'':'<th>Autor(es)</th>')+'<th class="center">G/C</th><th class="center">C/F  Club(br)</th></tr>\n\
';
    
    for( var r = 0; r < repertorio.geral.length; r ++ ) {
        idx=r+1;
        h += '<tr>'
                +'<td class="title" >'+idx+'.&nbsp;'+repertorio.geral[r].title+'</td>'
                + (map? '\n': '<td class="composer" >'+repertorio.geral[r].composer+'</td>\n' )
                +'<td class="center">' + this.makeAnchor( map, 'GAITA_MINUANO_GC', repertorio.geral[r].geral  ) 
                +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_HOHNER_CLUB_IIIM_BR', repertorio.geral[r].outro ) 
                +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br><h2>Transportada</h2>\n\
<h3>Tablaturas para acordeão Transportado</h3>\n\
<table class="interna"><tr><th>Título</th>'+(map?'':'<th>Autor(es)</th>')+'<th class="center">B/C</th></tr>\n\
';
                    
    for( var r = 0; r < repertorio.transportada.length; r ++ ) {
        h += '<tr>'
            +'<td class="title" >'+repertorio.transportada[r].title+'</td>'
            + (map? '\n': '<td class="composer" >'+repertorio.transportada[r].composer+'</td>\n')
            +'<td class="center">' + this.makeAnchor( map, 'GAITA_MINUANO_BC_TRANSPORTADA', repertorio.transportada[r].geral ) 
            +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br><h2>Portuguesa</h2>\n\
<h3>Tablaturas para Concertina Portuguesa em sistema diatônico italiano </h3>\n\
<table class="interna"><tr><th>Título</th>'+(map?'':'<th>Autor(es)</th>')+'<th class="center">G/C/F</th></tr>\n\
';
                    
    for( var r = 0; r < repertorio.portuguesa.length; r ++ ) {
        h += '<tr>'
            +'<td class="title" >'+repertorio.portuguesa[r].title+'</td>'
            + (map? '\n': '<td class="composer" >'+repertorio.portuguesa[r].composer+'</td>\n')
            +'<td class="center">' + this.makeAnchor( map, 'CONCERTINA_PORTUGUESA', repertorio.portuguesa[r].geral ) 
            +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br><h2>Corona</h2>\n\
<h3>Tablaturas para acordeões Corona Series A/D/G e/ou G/F/C</h3>\n\
<table class="interna"><tr><th>Título</th>'+(map?'':'<th>Autor(es)</th>')+'<th class="center">A/D/G</th><th class="center">G/C/F</th></tr>\n\
';
    
    for( var r = 0; r < repertorio.corona.length; r ++ ) {
        idx=r+1;
        h += '<tr>'
                +'<td class="title" >'+idx+'.&nbsp;'+repertorio.corona[r].title+'</td>'
                + (map? '\n': '<td class="composer" >'+repertorio.corona[r].composer+'</td>\n' )
                +'<td class="center">' + this.makeAnchor( map, 'GAITA_HOHNER_CORONA_ADG', repertorio.corona[r].geral  ) 
                +'</td>\n<td class="center">' + this.makeAnchor( map, 'GAITA_HOHNER_CORONA_GCF', repertorio.corona[r].outro ) 
                +'</td></tr>\n';
    }
    
    h += '\
</table>\n\
<br>\n\
</body>\n\
</html>\n\
';

    if( map ){
        var novo = ! this.win;
        if( novo ) {
            this.win = new DRAGGABLE.ui.Window( 
                  map.mapDiv
                , null
                , {translator: SITE.translator, statusbar: false, draggable: true, 
                    top: "10px", left: "800px", width: 'auto', height: "80%", title: 'IDXREPERTOIRE'}
                , null 
            );
            this.win.dataDiv.className = "draggableData";
        }
        this.win.setVisible(true);
        
        this.win.dataDiv.innerHTML = h;
        
        var ps = new PerfectScrollbar( this.win.dataDiv, {
            handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
            wheelSpeed: 1,
            wheelPropagation: false,
            suppressScrollX: false,
            minScrollbarLength: 100,
            swipeEasing: true,
            scrollingThreshold: 500
        });
      
        
        if(novo) {
            
            var x = window.innerWidth - this.win.topDiv.clientWidth - 12;
            this.win.topDiv.style.left = (x<0?0:x) + 'px';
            
        }
        
        this.bindSongs(this.win.dataDiv, map );
        
    } else {
        FILEMANAGER.download( 'repertorio.indexado.pt_BR.html', h );
    }
};        

SITE.Repertorio.prototype.makeAnchor = function( map, accordionId, songId  ) {
    var path = '/';
    var anchor = '<img alt="nao" src="/images/nao.png" >';
    if( songId > 0 ) {
        if( map ) {
            anchor = '<img alt="sim" src="/images/sim.png" data-song="'+accordionId+'#'+songId+'" >';
        } else {
            anchor = '<a href="'+path+'?accordion='+accordionId+'&id='
                        +songId+'"><img alt="sim" src="/images/sim.png" ></a>';
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
