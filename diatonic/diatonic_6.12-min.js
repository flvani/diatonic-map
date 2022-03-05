if(!window.DIATONIC){window.DIATONIC={}}if(!window.DIATONIC.map){window.DIATONIC.map={}}DIATONIC.map.color={};DIATONIC.map.color.fill="none";DIATONIC.map.color.background="none";DIATONIC.map.color.open="#00ff00";DIATONIC.map.color.close="#00b2ee";DIATONIC.map.loadAccordionMaps=function(d,c,a){if(!DIATONIC.map.accordionMaps){DIATONIC.map.accordionMaps=[]}var b=0;for(var e=0;e<d.length;e++){b++;FILEMANAGER.register("MAP");$.getJSON(d[e],{format:"json"}).done(function(f){FILEMANAGER.deregister("MAP",true);DIATONIC.map.accordionMaps.push(new DIATONIC.map.AccordionMap(f,false,c))}).fail(function(h,i,f){FILEMANAGER.deregister("MAP",false);var g=i+", "+f;waterbug.log("Accordion Load Failed:\nLoading: "+h.responseText.substr(1,40)+"...\nError:\n "+g)}).always(function(){b--;if(b===0){DIATONIC.map.sortAccordions();a&&a()}})}};DIATONIC.map.sortAccordions=function(){DIATONIC.map.accordionMaps.sort(function(d,c){return parseInt(d.menuOrder)-parseInt(c.menuOrder)})};if(!window.DIATONIC){window.DIATONIC={}}if(!window.DIATONIC.map){window.DIATONIC.map={}}DIATONIC.map.AccordionMap=function(b,a,c){this.id=b.id;this.menuOrder=b.menuOrder;this.model=b.model;this.tuning=b.tuning;this.buttons=b.buttons;this.image=b.image||"img/accordion.default.gif";this.keyboard=new DIATONIC.map.Keyboard(b.keyboard,b.pedal,c);this.songPathList=b.songPathList;this.practicePathList=b.practicePathList;this.chordPathList=b.chordPathList;this.localResource=a||false;this.songs={items:{},sortedIndex:[]};this.practices={items:{},sortedIndex:[]};this.chords={items:{},sortedIndex:[]};if(!this.localResource){this.songs=this.loadABCX(this.songPathList);this.chords=this.loadABCX(this.chordPathList);this.practices=this.loadABCX(this.practicePathList)}};DIATONIC.map.AccordionMap.prototype.getId=function(){return this.id};DIATONIC.map.AccordionMap.prototype.getFullName=function(){return this.getTxtModel()+" "+this.getTxtTuning()+" - "+this.getTxtNumButtons()};DIATONIC.map.AccordionMap.prototype.getTxtModel=function(){return this.model};DIATONIC.map.AccordionMap.prototype.getTxtNumButtons=function(){var b=this.buttons;var e="";for(var d=b.length-1;d>0;d--){e="/"+b[d]+e}return b[0]+e};DIATONIC.map.AccordionMap.prototype.getTxtTuning=function(){var b=this.tuning;var e="";for(var d=b.length-1;d>0;d--){e="/"+b[d]+e}return b[0]+e};DIATONIC.map.AccordionMap.prototype.getPathToImage=function(){return this.image};DIATONIC.map.AccordionMap.prototype.getAbcText=function(a,b){return this[a].items[b]};DIATONIC.map.AccordionMap.prototype.setSong=function(a,b,c){this.songs.items[a]=b;if(c){this.songs.sortedIndex.push(a)}};DIATONIC.map.AccordionMap.prototype.getFirstSong=function(){var a=this.songs.sortedIndex[0]||"";return a};DIATONIC.map.AccordionMap.prototype.getFirstPractice=function(){var a=this.practices.sortedIndex[0]||"";return a};DIATONIC.map.AccordionMap.prototype.getFirstChord=function(){var a=this.chords.sortedIndex[0]||"";return a};DIATONIC.map.AccordionMap.prototype.loadABCX=function(f,a){var d=0;var e;var c={items:{},ids:{},details:{},sortedIndex:[]};for(var b=0;b<f.length;b++){d++;FILEMANAGER.register("ABCX");e=f[b];$.get(e).done(function(j){FILEMANAGER.deregister("ABCX",true);var k=new ABCXJS.TuneBook(j);for(var g=0;g<k.tunes.length;g++){var h=k.tunes[g];var l=h.id;var i=false;if(l.toLowerCase().charAt(0)==="h"){l=l.substr(1);i=true}c.ids[l]=h.title;c.items[h.title]=h.abc;c.details[h.title]={composer:h.composer,id:l,hidden:i};c.sortedIndex.push(h.title)}}).fail(function(i,j,g){FILEMANAGER.deregister("ABCX",false);var h=j+", "+g;if(i&&i.responseText!==undefined){waterbug.log("ABCX Load Failed:\nLoading: "+i.responseText.substr(1,40)+"...\nError:\n "+h)}else{waterbug.log("ABCX Load Failed:\nLoading: "+e+"...\nError:\n "+h)}}).always(function(){d--;if(d===0){c.sortedIndex.sort();if(a){a()}}})}return c};if(!window.DIATONIC){window.DIATONIC={}}if(!window.DIATONIC.map){window.DIATONIC.map={}}DIATONIC.map.Keyboard=function(c,a,b){this.pedalInfo=a;this.layout=c.layout;this.keys=c.keys;this.basses=c.basses;this.noteToButtonsOpen={};this.noteToButtonsClose={};this.legenda={};this.baseLine={};this.opts=b||{};this.numerica=c.numerica||null;this.pautaNumerica=0;this.pautaNumericaMini=true;this.pautaNumericaFormato=null;this.limits={minX:10000,minY:10000,maxX:0,maxY:0};this.radius=26;this.size=this.radius*2+4;this.setup(c)};DIATONIC.map.Keyboard.prototype.setup=function(n){var r,p,e;var q=n.keys.open.length;var o=n.basses.open.length;this.keyMap=new Array();this.modifiedItems=new Array();var a=0;for(g=0;g<q;g++){this.keyMap[g]=new Array(n.keys.open[g].length);a=Math.max(n.keys.open[g].length,a)}var k=n.basses.open[0].length;for(g=q;g<q+o;g++){this.keyMap[g]=new Array(n.basses.open[g-q].length)}if(this.opts.isApp){this.width=(q+o)*(this.size)+21+3}else{this.width=(q+o)*(this.size)+this.size+3}this.height=(a)*(this.size)+3;var d=(k===4?4:3)*this.size;d+=(a-11)/2*this.size;var c,m,l,h;for(var f=0;f<this.keyMap.length;f++){if(f<q){r=(f+0.5)*(this.size);e=this.getLayout(f)*this.size;c=n.keys.open[f];m=n.keys.close[f];l=false}else{if(this.opts.isApp){r=(f+0.5)*(this.size)+21}else{r=(f+0.5)*(this.size)+this.size}e=d;c=n.basses.open[f-q];m=n.basses.close[f-q];l=true}for(var g=0;g<this.keyMap[f].length;g++){p=e+(g+0.5)*this.size;this.limits.minX=Math.min(this.limits.minX,r);this.limits.minY=Math.min(this.limits.minY,p);this.limits.maxX=Math.max(this.limits.maxX,r);this.limits.maxY=Math.max(this.limits.maxY,p);var b=new DIATONIC.map.Button(this,r-this.radius,p-this.radius,{radius:this.radius,isPedal:this.isPedal(g,f)});b.tabButton=(g+1)+Array(f+1).join("'");b.openNote=this.parseNote(c[g],l);b.closeNote=this.parseNote(m[g],l);h=this.getNoteVal(b.openNote);if(!this.noteToButtonsOpen[h]){this.noteToButtonsOpen[h]=[]}this.noteToButtonsOpen[h].push(b.tabButton);h=this.getNoteVal(b.closeNote);if(!this.noteToButtonsClose[h]){this.noteToButtonsClose[h]=[]}this.noteToButtonsClose[h].push(b.tabButton);this.keyMap[f][g]=b}}if(this.opts.isApp){r=(q)*(this.size)+12}else{r=(q)*(this.size)+this.size/2}p=d-(0.5*this.size);this.baseLine={x:r,yi:p,yf:p+((k+1)*this.size)};var s=40;this.legenda=new DIATONIC.map.Button(this,this.limits.maxX-(s+this.radius),this.limits.minY+s,{radius:s,borderWidth:2})};DIATONIC.map.Keyboard.prototype.reprint=function(){if(this.reprintData!==undefined){this.print(this.reprintData.Div,this.reprintData.Render_opts,this.reprintData.Translator)}};DIATONIC.map.Keyboard.prototype.print=function(b,o,g){this.reprintData={Div:b,Render_opts:o,Translator:g};var k;var c='   .keyboardPane {\n        padding:4px;\n        background-color:none;\n    }\n    .blegenda,\n    .button {\n        font-family: sans-serif, arial;\n        text-anchor: middle;\n        font-size: 16px;\n        font-weight: bold;\n        text-shadow: 0.5px 0.5px #ddd, -0.5px -0.5px 0 #ddd, 0.5px -0.5px 0 #ddd, -0.5px 0.5px 0 #ddd;\n    }\n    .buttonN {\n        font-family: sans-serif, arial;\n        text-anchor: middle;\n        font-size: 24px;\n        font-weight: bold;\n        text-shadow: 0.5px 0.5px #ddd, -0.5px -0.5px 0 #ddd, 0.5px -0.5px 0 #ddd, -0.5px 0.5px 0 #ddd;\n    }\n    .buttonNMini {\n        font-family: "AllertaStencil", "RobotoItalic";\n        text-anchor: middle;\n        font-size: 11px;\n        font-weight: normal;\n    }\n    .blegenda {\n        font-weight: normal;\n        font-size: 12px;\n    }';
var a=document.createElement("div");a.setAttribute("class","keyboardPane");b.innerHTML="";b.appendChild(a);this.paper=new SVG.Printer(a);this.paper.initDoc("keyb","Diatonic Map Keyboard",c,o);this.paper.initPage(o.scale);var d=ABCXJS.parse.clone(o);d.kls="blegenda";d.klsN="buttonN";d.klsNMini="buttonNMini";d.pautaNumerica=false;this.legenda.draw("l00",this.paper,this.limits,d);var n=this.opts.isApp?7:10;if(o.transpose){k={w:this.height,h:this.width};var m=o.mirror?this.baseLine.x:this.limits.maxX-(this.baseLine.x-this.limits.minX)+2;for(var l=m-n;l<=m+n;l+=n){this.drawLine(this.baseLine.yi,l,this.baseLine.yf,l)}}else{k={w:this.width,h:this.height};var m=o.mirror?this.limits.maxX-(this.baseLine.x-this.limits.minX)+2:this.baseLine.x;for(var l=m-n;l<=m+n;l+=n){this.drawLine(l,this.baseLine.yi,l,this.baseLine.yf)}}var h=ABCXJS.parse.clone(o);h.kls="button";h.klsN="buttonN";h.klsNMini="buttonNMini";h.pautaNumerica=(this.pautaNumerica>0);h.pautaNumericaMini=this.pautaNumericaMini;for(var e=0;e<this.keyMap.length;e++){for(var f=0;f<this.keyMap[e].length;f++){this.keyMap[e][f].draw("b"+e+f,this.paper,this.limits,h)}}this.paper.endPage(k);this.paper.endDoc();this.legenda.setSVG(o.label,{pull:"Pull",push:"Push",translator:g});for(var e=0;e<this.keyMap.length;e++){for(var f=0;f<this.keyMap[e].length;f++){this.keyMap[e][f].setSVG(o.label,{formatoNumerico:this.pautaNumericaFormato,mini:this.pautaNumericaMini})}}};DIATONIC.map.Keyboard.prototype.setFormatoTab=function(b,a){if(b&&this.numerica){this.pautaNumerica=b;this.pautaNumericaFormato=this.numerica[b-1];this.pautaNumericaMini=a}else{this.pautaNumerica=0;this.pautaNumericaMini=true}};DIATONIC.map.Keyboard.prototype.drawLine=function(a,b,c,d){this.paper.printLine(a,b,c,d)};DIATONIC.map.Keyboard.prototype.getButtons=function(b){var a=this.getNoteVal(b);return{open:this.noteToButtonsOpen[a],close:this.noteToButtonsClose[a]}};DIATONIC.map.Keyboard.prototype.getNoteVal=function(a){return ABCXJS.parse.key2number[a.key.toUpperCase()]+(a.isBass?(a.isChord?(a.isMinor?-24:-12):0):a.octave*12)};DIATONIC.map.Keyboard.prototype.getLayout=function(a){return this.layout[a]||0};DIATONIC.map.Keyboard.prototype.isPedal=function(b,a){return(this.pedalInfo[1]===(b+1))&&(this.pedalInfo[0]===(a+1))};DIATONIC.map.Keyboard.prototype.parseNote=function(e,c){var d={};var b=e.split(":");var a=b[0].charAt(b[0].length-1);d.key=parseInt(a)?b[0].replace(a,""):b[0];d.variant=this.getVariant(d.key.charAt(d.key.length-1));if(d.variant>0){d.key=d.key.substring(0,d.key.length-1)}d.octave=parseInt(a)?parseInt(a):4;d.complement=b[1]?b[1]:"";d.value=ABCXJS.parse.key2number[d.key.toUpperCase()];d.isChord=(d.key===d.key.toLowerCase());d.isBass=c;d.isMinor=d.complement.substr(0,2).indexOf("m")>=0;d.isSetima=d.complement.substr(0,2).indexOf("7")>=0;if(typeof(d.value)==="undefined"){throw new Error("Nota inválida: "+e)}return d};DIATONIC.map.Keyboard.prototype.getVariant=function(a){switch(a){case"¹":return 1;case"²":return 2;case"³":return 3;default:return 0}};DIATONIC.map.Keyboard.prototype.redraw=function(c){for(var a=0;a<this.keyMap.length;a++){for(var b=0;b<this.keyMap[a].length;b++){if(this.pautaNumericaMini||!this.keyMap[a][b].isNumerica){this.keyMap[a][b].setText(c.label)}}}};DIATONIC.map.Keyboard.prototype.clear=function(c){c=true;if(c){for(var a=0;a<this.keyMap.length;a++){for(var b=0;b<this.keyMap[a].length;b++){this.keyMap[a][b].clear()}}}else{for(var b=0;b<this.modifiedItems.length;b++){this.modifiedItems[b].clear()}}this.modifiedItems=new Array()};if(!window.DIATONIC){window.DIATONIC={}}if(!window.DIATONIC.map){window.DIATONIC.map={}}DIATONIC.map.Button=function(d,a,e,b){var c=b||{};this.kb=d;this.x=a;this.y=e;this.openNote=null;this.closeNote=null;this.tabButton=null;this.SVG={gid:0};this.radius=c.radius;this.isPedal=c.isPedal||false;this.borderWidth=c.borderWidth||(this.isPedal?2:1);this.borderColor=c.borderColor||(this.isPedal?"red":"black")};DIATONIC.map.Button.prototype.draw=function(f,e,d,c){var b,a;if(c.transpose){b=this.y;a=c.mirror?this.x:d.maxX-this.radius*2-(this.x-d.minX)}else{b=c.mirror?d.maxX-this.radius*2-(this.x-d.minX):this.x;a=this.y}c=c||{};c.radius=this.radius;c.borderColor=this.borderColor;c.borderWidth=this.borderWidth;c.fillColor=(c.kls&&c.kls==="blegenda"?"none":DIATONIC.map.color.fill);c.openColor=(c.kls&&c.kls==="blegenda"?DIATONIC.map.color.open:"none");c.closeColor=(c.kls&&c.kls==="blegenda"?DIATONIC.map.color.close:"none");if(this.closeNote&&this.closeNote.isBass){c.pautaNumerica=false}this.isNumerica=c.pautaNumerica;this.SVG.gid=e.printButton(f,b,a,c)};DIATONIC.map.Button.prototype.clear=function(a){if(!this.SVG.button){return}var b=this;if(a){window.setTimeout(function(){b.clear()},a*1000);return}this.SVG.closeArc.style.setProperty("fill","none");this.SVG.openArc.style.setProperty("fill","none")};DIATONIC.map.Button.prototype.setOpen=function(a){if(!this.SVG.button){return}var b=this;if(a){window.setTimeout(function(){b.setOpen()},a*1000);return}this.SVG.openArc.style.setProperty("fill",DIATONIC.map.color.open)};DIATONIC.map.Button.prototype.setClose=function(a){if(!this.SVG.button){return}var b=this;if(a){window.setTimeout(function(){b.setClose()},a*1000);return}this.SVG.closeArc.style.setProperty("fill",DIATONIC.map.color.close)};DIATONIC.map.Button.prototype.setSVG=function(g,a){var l=this.SVG;var d=0;var o=a.pull||null;var k=a.push||null;var h=a.translator||null;var m=a.formatoNumerico||null;var c=a.mini;this.SVG.button=document.getElementById(l.gid);this.SVG.openArc=document.getElementById(l.gid+"_ao");this.SVG.closeArc=document.getElementById(l.gid+"_ac");this.SVG.openText=document.getElementById(l.gid+"_to");this.SVG.closeText=document.getElementById(l.gid+"_tc");this.SVG.numericText=document.getElementById(l.gid+"_tn");this.SVG.numericTextMini=document.getElementById(l.gid+"_tm");if(this.isNumerica){if(m.overrides[this.tabButton]){d=m.overrides[this.tabButton]}else{var f=parseInt(this.tabButton);var e=(this.tabButton.match(/'/g)||[]).length;d=f+m.rule[e]}if(c){this.SVG.numericTextMini.textContent=d}else{this.SVG.numericText.textContent=d}}if(!this.isNumerica||c){if(h){this.SVG.openText.setAttribute("data-translate",o);this.SVG.closeText.setAttribute("data-translate",k);this.setText(g,h.getResource(o),h.getResource(k))}else{this.setText(g,o,k)}}};DIATONIC.map.Button.prototype.setText=function(a,b,c){if(this.SVG.openText){this.SVG.openText.textContent=b?b:this.getLabel(this.openNote,a);this.SVG.closeText.textContent=c?c:this.getLabel(this.closeNote,a)}};DIATONIC.map.Button.prototype.getLabel=function(c,b){var a=c.key;if(b){a=a.toUpperCase()+"";a=ABCXJS.parse.key2br[a].toUpperCase()}if(c.isChord){a=a.toLowerCase()+""}if(c.isMinor){a+="-"}return a};