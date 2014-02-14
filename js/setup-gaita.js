function setupGaita ( nGaita ) {

  // configura e mostra a gaita inicial
  gaita = GAITA.gaitas[nGaita];
  nIlheiras = gaita[c_teclado][c_keys][c_open].length;
  nIlheirasBaixo = gaita[c_teclado][c_bass][c_open] ? gaita[c_teclado][c_bass][c_open].length : 0;
  //gCurrentTone =  parseNote( gaita[c_afinacao][0] ).value;
  gCurrentToneOffset = 0;
  gLayer = new Kinetic.Layer();
  gBackgroundLayer = new Kinetic.Layer();
  bHorizontal = checkboxHorizontal.checked;
  bEspelho = checkboxEspelho.checked;

  // para localizar as notas extremas
  GAITA.minNoteInUse   = GAITA.maxNote;
  GAITA.maxNoteInUse   = GAITA.minNote;

  GAITA.selected = nGaita;
  GAITA.keyboard = new Array();
  GAITA.modifiedItems = new Array();

  // ilheiras da mao direita
  maiorIlheira = 0;
  for (i=0; i<nIlheiras; i++) {
    GAITA.keyboard[i] = new Array( gaita[c_teclado][c_keys][c_open][i].length );
    maiorIlheira = gaita[c_teclado][c_keys][c_open][i].length > maiorIlheira ? gaita[c_teclado][c_keys][c_open][i].length : maiorIlheira;
  }

  // ilheiras da mao esquerda
  maiorIlheiraBaixo = gaita[c_teclado][c_bass][c_open] ? gaita[c_teclado][c_bass][c_open][0].length : 0;
  for (i=nIlheiras; i<nIlheiras+nIlheirasBaixo; i++) {
    GAITA.keyboard[i] = new Array( gaita[c_teclado][c_bass][c_open][i-nIlheiras].length );
  }
 
  nTotIlheiras = nIlheiras+nIlheirasBaixo+2;

  if( bHorizontal ) {
    nHeight = nTotIlheiras*(c_btnSize+c_btnSpace)
    nWidth  = (maiorIlheira+1) *c_btnSize + (maiorIlheira+2) * c_btnSpace       
    bassX   = c_btnSpace*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(c_btnSize+c_btnSpace);
    trebleX = c_btnSpace*4;
    var xi = bassX -1.5 * (c_btnSize+c_btnSpace); 
    if( bEspelho ) {
      var yi = c_btnSpace + (nTotIlheiras-1.5) * (c_btnSize+c_btnSpace);  
    }else {
      var yi = c_btnSpace + (1.5) * (c_btnSize+c_btnSpace);  
    }
  } else {
    nWidth  = nTotIlheiras*(c_btnSize+c_btnSpace)
    nHeight = (maiorIlheira+1) *c_btnSize + (maiorIlheira+2) * c_btnSpace
    bassY   = c_btnSpace*4 + (((maiorIlheira-maiorIlheiraBaixo)/2))*(c_btnSize+c_btnSpace);
    trebleY = c_btnSpace*4;
    var yi = bassY -1.5 * (c_btnSize+c_btnSpace); 
    if( bEspelho ) {
          var xi = c_btnSpace + (1.5) * (c_btnSize+c_btnSpace) ; 
    }else {
          var xi = c_btnSpace + (nTotIlheiras-1.5) * (c_btnSize+c_btnSpace) ; 
    }
  }

  gStage = new Kinetic.Stage({ container: 'keyboard', height: nHeight, width: nWidth });

  { // desenhar o botão com a legenda abre/fecha
    var circle = new Kinetic.Circle({
      x: xi,
      y: yi,
      radius: c_btnSize / 1.5,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      id: 'b_help'
    });

    circlePos = circle.getPosition();
    Dy = (c_btnSize/2 - c_fontSize) / 2;

    var line = new Kinetic.Line({
      points: [circlePos.x-(c_btnSize/1.5), circlePos.y+5,circlePos.x+(c_btnSize/1.5), circlePos.y-4],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    });

    textoOpen  = createKinectText( 'abre ', 0, 100, c_open, circlePos.x+2, circlePos.y + Dy );
    textoClose = createKinectText( 'fecha ', 0, 100, c_close, circlePos.x+2, circlePos.y - c_fontSize - Dy );

    gLayer.add(circle);
    gLayer.add(line);
    gLayer.add(textoOpen.key);
    gLayer.add(textoClose.key);
  }

  for (j=0; j<GAITA.keyboard.length; j++) {

    if( bHorizontal ) {
      if( bEspelho ) {
        if( j < nIlheiras ) {
          var xi = trebleX + (gaita[c_teclado][c_Xpos][j]+0.5) * (c_btnSize+c_btnSpace);
          var yi = c_btnSpace + (j+1) * (c_btnSize+c_btnSpace); 
        }else {
          var xi = bassX + 0.5 * (c_btnSize+c_btnSpace); 
          var yi = c_btnSpace + (j+2) * (c_btnSize+c_btnSpace);  
        }
      } else { 
        if( j < nIlheiras ) {
          var xi = trebleX + (gaita[c_teclado][c_Xpos][j]+0.5) * (c_btnSize+c_btnSpace);
          var yi = c_btnSpace + (nTotIlheiras-j-1) * (c_btnSize+c_btnSpace); 
        }else {
          var xi = bassX + 0.5 * (c_btnSize+c_btnSpace); 
          var yi = c_btnSpace + (nTotIlheiras-j-2) * (c_btnSize+c_btnSpace);  
        }
      }
    } else {
      if( bEspelho ) {
        if( j < nIlheiras ) {
          var xi = c_btnSpace + (nTotIlheiras-j-1) * (c_btnSize+c_btnSpace) ; 
          var yi = trebleY + (gaita[c_teclado][c_Xpos][j]+0.5) * (c_btnSize+c_btnSpace);
        }else {
          var xi = c_btnSpace + (nTotIlheiras-j-2) * (c_btnSize+c_btnSpace) ; 
          var yi = bassY + 0.5 * (c_btnSize+c_btnSpace); 
        }
       } else {
        if( j < nIlheiras ) {
          var xi = c_btnSpace + (j+1) * (c_btnSize+c_btnSpace) ; 
          var yi = trebleY + (gaita[c_teclado][c_Xpos][j]+0.5) * (c_btnSize+c_btnSpace);
        }else {
          var xi = c_btnSpace + (j+2) * (c_btnSize+c_btnSpace) ; 
          var yi = bassY + 0.5 * (c_btnSize+c_btnSpace); 
        }
      }
    }

    for (i=0; i<GAITA.keyboard[j].length; i++) {

      if ( bHorizontal ) {
        var xxi = xi + i*(c_btnSize + c_btnSpace);
        var yyi = yi;
      } else {
        var xxi = xi;
        var yyi = yi + i*(c_btnSize + c_btnSpace);
      }

      var pedal = (i == gaita[c_pedal][1] && j == gaita[c_pedal][0] );
      var circle = new Kinetic.Circle({
        x: xxi,
        y: yyi,
        radius: c_btnSize / 2,
        fill: 'white',
        stroke: (pedal ? 'red' : 'black' ),
        strokeWidth: (pedal ? 2 : 1 ),
        id: 'b_'+ j +'_' + i,
      });

      circlePos = circle.getPosition();
      Dy = (c_btnSize/2 - c_fontSize) / 2;

      var line = new Kinetic.Line({
        points: [circlePos.x-(c_btnSize/2), circlePos.y+5,circlePos.x+(c_btnSize/2), circlePos.y-4],
        stroke: (pedal ? 'red' : 'black' ),
        strokeWidth: (pedal ? 2 : 1 ),
        lineCap: 'round',
        lineJoin: 'round'
      });

      GAITA.keyboard[j][i] = {};
      GAITA.keyboard[j][i].btn = circle;
 
      if(j<nIlheiras) {
        GAITA.keyboard[j][i].notaOpen  = parseNote( gaita[c_teclado][c_keys][c_open ][j][i], false );
        GAITA.keyboard[j][i].notaClose = parseNote( gaita[c_teclado][c_keys][c_close][j][i], false );
      } else {
        GAITA.keyboard[j][i].notaOpen  = parseNote( gaita[c_teclado][c_bass][c_open ][j-nIlheiras][i], true );
        GAITA.keyboard[j][i].notaClose = parseNote( gaita[c_teclado][c_bass][c_close][j-nIlheiras][i], true );
      }

      GAITA.keyboard[j][i].notaOpen.labels  = createKinectText( '', j, i, c_open, circlePos.x, circlePos.y + Dy );
      GAITA.keyboard[j][i].notaClose.labels = createKinectText( '', j, i, c_close, circlePos.x, circlePos.y - c_fontSize - Dy );

      GAITA.minNoteInUse = GAITA.keyboard[j][i].notaOpen.value  < GAITA.minNoteInUse ? GAITA.keyboard[j][i].notaOpen.value  : GAITA.minNoteInUse;
      GAITA.minNoteInUse = GAITA.keyboard[j][i].notaClose.value < GAITA.minNoteInUse ? GAITA.keyboard[j][i].notaClose.value : GAITA.minNoteInUse;
      GAITA.maxNoteInUse = GAITA.keyboard[j][i].notaOpen.value+12  > GAITA.maxNoteInUse ? GAITA.keyboard[j][i].notaOpen.value+12  : GAITA.maxNoteInUse;
      GAITA.maxNoteInUse = GAITA.keyboard[j][i].notaClose.value+12 > GAITA.maxNoteInUse ? GAITA.keyboard[j][i].notaClose.value+12 : GAITA.maxNoteInUse;

      if (typeof (GAITA.keyboard[j][i].notaClose.key) === "undefined" ) alert( j + ' ' + i );
      setButtonText( GAITA.keyboard[j][i] );

      gLayer.add(circle);
      gLayer.add(line);

      gLayer.add(GAITA.keyboard[j][i].notaOpen.labels.key);
      gLayer.add(GAITA.keyboard[j][i].notaOpen.labels.compl);
      gLayer.add(GAITA.keyboard[j][i].notaOpen.labels.octave);
      gLayer.add(GAITA.keyboard[j][i].notaClose.labels.key);
      gLayer.add(GAITA.keyboard[j][i].notaClose.labels.compl);
      gLayer.add(GAITA.keyboard[j][i].notaClose.labels.octave);

    } 
  }
/*
  imageObj = new Image();
  imageObj.onload = function() {
    gCanvasBackgroundImage = new Kinetic.Image({ x: 0, y: 0, image: imageObj, width: nWidth, height: nHeight });
    gBackgroundLayer.add(gCanvasBackgroundImage);
    gStage.add(gBackgroundLayer);
  }

  imageObj.src = 'img/fole.3.png';
*/

  gStage.add(gLayer);

  // mostra o nome e imagem da gaita
  document.getElementById("a_nome_gaita").innerHTML = gaita[c_nome];
  //document.getElementById("div_nome_gaita").innerHTML = '<b>&nbsp;'+gaita[c_nome]+'</b>';
  document.getElementById("div_imagem_gaita").innerHTML = '<img src="'+gaita[c_imagem]+'" />';

  mostraAfinacao();

  carregaTabelaEscalas( nGaita );
  carregaTabelaAcordes( nGaita );
    
}
