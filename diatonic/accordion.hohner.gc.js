/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

window.DIATONIC.tmp = {keys: {}, basses: {}, keysLayout: [], chords: [], scales: [], songs:[] };

DIATONIC.tmp.keys = {
   close: [["B2", "D3", "G3", "B3", "D4", "G4", "B4", "D5", "G5", "B5", "D6"], ["E3", "G3", "C4", "E4", "G4", "C5", "E5", "G5", "C6", "E6"]]
  , open: [["D3", "F♯3", "A3", "C4", "E4", "F♯4", "A4", "C5", "E5", "F♯5", "A5"], ["G3", "B3", "D4", "F4", "G4", "B4", "D5", "F5", "G5", "B5"]]
};

DIATONIC.tmp.basses = {
   close: [["e2", "E2", "f1", "F1"], ["g1", "G1", "c2", "C2"]]
  , open: [["a1:m", "A1", "f1", "F1"], ["d2", "D2", "g1", "G1"]]
};

DIATONIC.tmp.keysLayout = [0, 0.5];

DIATONIC.tmp.songs = [
     'songs/mercedita.abcx'
    ,'songs/primeira.valsinha.abcx'
    ,'songs/hino.do.gremio.abcx'
    ,'songs/valsa.sertaneja.abcx'
    ,'songs/jai.vu.le.loup.abcx'
];

DIATONIC.tmp.chords = [
     'chords/acordes.abcx'
    ,'chords/didatica.abcx'
];

DIATONIC.tmp.practices = [
     'practices/exercicio4.abcx'
    ,'practices/exercicio2.abcx'
    ,'practices/exercicio3.abcx'
    ,'practices/exercicio1.abcx'
];

DIATONIC.map.models[DIATONIC.map.models.length] = new DIATONIC.map.Accordion(
        'GAITA_HOHNER_GC'
        , 'Hohner/Hëring - 21/8 botões'
        , ["G", "C"]
        , [1, 4]
        , {keys: DIATONIC.tmp.keys, basses: DIATONIC.tmp.basses, layout: DIATONIC.tmp.keysLayout}
        , DIATONIC.tmp.chords
        , DIATONIC.tmp.practices
        , DIATONIC.tmp.songs
        , 'img/Hohner Beija-Flor.gif'
        );

delete DIATONIC.tmp;

