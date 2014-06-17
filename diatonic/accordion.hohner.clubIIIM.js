/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {models: []};

window.DIATONIC.tmp = {keys: {}, basses: {}, keysLayout: [], chords: [], practices: [], songs:[] };

DIATONIC.tmp.keys = {
    close: [["F♯3", "E3", "G3", "C4", "E4", "G4", "C5", "E5", "G5", "C6", "E6", "G6"], ["F3", "A3", "C4", "F4", "A4", "C5", "F5", "A5", "C6", "F6", "A6"], ["E♭4", "B♭4", "F♯4", "E♭5", "D5", "F♯5", "E♭6"]]
   , open: [["G♯3", "G3", "B3", "D4", "F4", "A4", "B4", "D5", "F5", "A5", "B5", "C6"], ["B♭3", "C4", "E4", "G4", "B♭4", "C5", "E5", "G5", "B♭5", "D6", "E6"], ["C♯4", "F♯4", "G♯4", "C♯5", "E♭5", "G♯5", "C♯6"]]
};

DIATONIC.tmp.basses = {
    close: [["a1", "A1", "e♭1", "E♭1"], ["c2", "C2", "f1", "F1"]]
   , open: [["d2:m", "D2", "b♭1", "B♭1"], ["g1", "G1", "c2", "C2"]]
};

DIATONIC.tmp.keysLayout = [0, 0.5, 3];


DIATONIC.map.models[DIATONIC.map.models.length] = new DIATONIC.map.Accordion(
        "GAITA_HOHNER_CLUB_IIIM"
        , 'Hohner Club IIIM - 30/8 botões'
        , ["C", "F"]
        , [1, 5]
        , {keys: DIATONIC.tmp.keys, basses: DIATONIC.tmp.basses, layout: DIATONIC.tmp.keysLayout}
        , DIATONIC.tmp.chords
        , DIATONIC.tmp.practices
        , DIATONIC.tmp.songs
        , 'img/Hohner.Club IIIM.gif'
        );
    
delete DIATONIC.tmp;
