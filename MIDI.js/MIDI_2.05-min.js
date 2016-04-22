if(typeof(MIDI)==="undefined"){var MIDI={}}(function(){var b={};var c=0;var a=function(f){c++;var d=new Audio();var e=f.split(";")[0];d.id="audio";d.setAttribute("preload","auto");d.setAttribute("audiobuffer",true);d.addEventListener("error",function(){b[e]=false;c--},false);d.addEventListener("canplaythrough",function(){b[e]=true;c--},false);d.src="data:"+f;document.body.appendChild(d)};MIDI.audioDetect=function(i){if(typeof(Audio)==="undefined"){return i({})}var f=new Audio();if(typeof(f.canPlayType)==="undefined"){return i(b)}var h=f.canPlayType('audio/ogg; codecs="vorbis"');h=(h==="probably"||h==="maybe");var e=f.canPlayType("audio/mpeg");e=(e==="probably"||e==="maybe");if(!h&&!e){i(b);return}if(h){a("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=")}if(e){a("audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")}var g=(new Date()).getTime();var d=window.setInterval(function(){var j=(new Date()).getTime();var k=j-g>5000;if(!c||k){window.clearInterval(d);i(b)}},1)}})();if(typeof(MIDI)==="undefined"){var MIDI={}}if(typeof(MIDI.Soundfont)==="undefined"){MIDI.Soundfont={}}(function(){var e=false;MIDI.loadPlugin=function(h){if(typeof(h)==="function"){h={callback:h}}var g=h.instruments||h.instrument||"acoustic_grand_piano";if(typeof(g)!=="object"){g=[g]}for(var j=0;j<g.length;j++){var i=g[j];if(typeof(i)==="number"){g[j]=MIDI.GeneralMIDI.byId[i]}}MIDI.soundfontUrl=h.soundfontUrl||MIDI.soundfontUrl||"./soundfont/";MIDI.audioDetect(function(l){var m="";if(d[h.api]){m=h.api}else{if(d[window.location.hash.substr(1)]){m=window.location.hash.substr(1)}else{if(e&&navigator.requestMIDIAccess){m="webmidi"}else{if(window.AudioContext){m="webaudio"}else{if(window.Audio){m="audiotag"}else{m="flash"}}}}}if(!c[m]){return}if(h.targetFormat){var k=h.targetFormat}else{var k=l["audio/ogg"]?"ogg":"mp3"}MIDI.lang=m;MIDI.supports=l;c[m](k,g,h)})};var c={};c.webmidi=function(i,g,h){if(MIDI.loader){MIDI.loader.message("Web MIDI API...")}MIDI.WebMIDI.connect(h)};c.flash=function(i,g,h){if(MIDI.loader){MIDI.loader.message("Flash API...")}DOMLoader.script.add({src:h.soundManagerUrl||"./inc/SoundManager2/script/soundmanager2.js",verify:"SoundManager",callback:function(){MIDI.Flash.connect(g,h)}})};c.audiotag=function(j,h,i){if(MIDI.loader){MIDI.loader.message("HTML5 Audio API...")}var g=a({items:h,getNext:function(k){DOMLoader.sendRequest({url:MIDI.soundfontUrl+k+"-"+j+".js",onprogress:f,onload:function(l){b(l.responseText);if(MIDI.loader){MIDI.loader.update(null,"Downloading",100)}g.getNext()}})},onComplete:function(){MIDI.AudioTag.connect(i)}})};c.webaudio=function(j,h,i){if(MIDI.loader){MIDI.loader.message("Web Audio API...")}var g=a({items:h,getNext:function(k){DOMLoader.sendRequest({url:MIDI.soundfontUrl+k+"-"+j+".js",onprogress:f,onload:function(l){b(l.responseText);if(MIDI.loader){MIDI.loader.update(null,"Downloading...",100)}g.getNext()}})},onComplete:function(){MIDI.WebAudio.connect(i)}})};var d={webmidi:true,webaudio:true,audiotag:true,flash:true};var b=function(h){var g=document.createElement("script");g.language="javascript";g.type="text/javascript";g.text=h;document.body.appendChild(g)};var f=function(h){if(!this.totalSize){if(this.getResponseHeader("Content-Length-Raw")){this.totalSize=parseInt(this.getResponseHeader("Content-Length-Raw"))}else{this.totalSize=h.total}}var g=this.totalSize?Math.round(h.loaded/this.totalSize*100):"";if(MIDI.loader){MIDI.loader.update(null,"Downloading...",g)}};var a=function(h){var g={};g.queue=[];for(var i in h.items){if(h.items.hasOwnProperty(i)){g.queue.push(h.items[i])}}g.getNext=function(){if(!g.queue.length){return h.onComplete()
}h.getNext(g.queue.shift())};setTimeout(g.getNext,1);return g}})();if(typeof(MIDI)==="undefined"){var MIDI={}}if(typeof(MIDI.Player)==="undefined"){MIDI.Player={}}(function(){var g=MIDI.Player;g.callback=undefined;g.currentTime=0;g.endTime=0;g.restart=0;g.playing=false;g.timeWarp=1;g.start=g.resume=function(){if(g.currentTime<-1){g.currentTime=-1}e(g.currentTime)};g.pause=function(){var l=g.restart;d();g.restart=l};g.stop=function(){d();g.restart=0;g.currentTime=0};g.addListener=function(l){j=l};g.removeListener=function(){j=undefined};g.clearAnimation=function(){if(g.interval){window.clearInterval(g.interval)}};g.setAnimation=function(n){var q=(typeof(n)==="function")?n:n.callback;var m=n.interval||30;var p=0;var o=0;var l=0;g.clearAnimation();g.interval=window.setInterval(function(){if(g.endTime===0){return}if(g.playing){p=(l===g.currentTime)?o-(new Date).getTime():0;if(g.currentTime===0){p=0}else{p=g.currentTime-p}if(l!==g.currentTime){o=(new Date).getTime();l=g.currentTime}}else{p=g.currentTime}var r=g.endTime;var w=p/r;var v=p/1000;var s=v/60;var x=v-(s*60);var u=s*60+x;var t=(r/1000);if(t-u<-1){return}q({now:u,end:t,events:c})},m)};g.loadMidiFile=function(){g.replayer=new Replayer(MidiFile(g.currentData),g.timeWarp);g.data=g.replayer.getData();g.endTime=f()};g.loadFile=function(m,o){g.stop();if(m.indexOf("base64,")!==-1){var n=window.atob(m.split(",")[1]);g.currentData=n;g.loadMidiFile();if(o){o(n)}return}var l=new XMLHttpRequest();l.open("GET",m);l.overrideMimeType("text/plain; charset=x-user-defined");l.onreadystatechange=function(){if(this.readyState===4&&this.status===200){var r=this.responseText||"";var q=[];var v=r.length;var p=String.fromCharCode;for(var u=0;u<v;u++){q[u]=p(r.charCodeAt(u)&255)}var s=q.join("");g.currentData=s;g.loadMidiFile();if(o){o(s)}}};l.send()};var k=[];var a;var b=0;var c={};var j=undefined;var i=function(q,m,p,r,o,n){var l=window.setTimeout(function(){var s={channel:q,note:m,now:p,end:g.endTime,message:o,velocity:n};if(o===128){delete c[m]}else{c[m]=s}if(j){j(s)}g.currentTime=p;if(g.currentTime===a&&a<g.endTime){e(a,true)}},p-r);return l};var h=function(){if(MIDI.lang==="WebAudioAPI"){return MIDI.Player.ctx}else{if(!g.ctx){g.ctx={currentTime:0}}}return g.ctx};var f=function(){var o=g.data;var m=o.length;var l=0.5;for(var p=0;p<m;p++){l+=o[p][1]}return l};var e=function(m,q){if(!g.replayer){return}if(!q){if(typeof(m)==="undefined"){m=g.restart}if(g.playing){d()}g.playing=true;g.data=g.replayer.getData();g.endTime=f()}var v;var r=0;var s=0;var t=g.data;var w=h();var o=t.length;a=0.5;b=w.currentTime;for(var p=0;p<o&&s<100;p++){a+=t[p][1];if(a<m){r=a;continue}m=a-r;var l=t[p][0].event;if(l.type!=="channel"){continue}var u=l.channel;switch(l.subtype){case"noteOn":if(MIDI.channels[u].mute){break}v=l.noteNumber-(g.MIDIOffset||0);k.push({event:l,source:MIDI.noteOn(u,l.noteNumber,l.velocity,m/1000+w.currentTime),interval:i(u,v,a,r,144,l.velocity)});s++;break;case"noteOff":if(MIDI.channels[u].mute){break}v=l.noteNumber-(g.MIDIOffset||0);k.push({event:l,source:MIDI.noteOff(u,l.noteNumber,m/1000+w.currentTime),interval:i(u,v,a,r,128)});break;default:break}}};var d=function(){var l=h();g.playing=false;g.restart+=(l.currentTime-b)*1000;while(k.length){var n=k.pop();window.clearInterval(n.interval);if(!n.source){continue}if(typeof(n.source)==="number"){window.clearTimeout(n.source)}else{n.source.disconnect(0)}}for(var m in c){var n=c[m];if(c[m].message===144&&j){j({channel:n.channel,note:n.note,now:n.now,end:n.end,message:128,velocity:n.velocity})}}c={}}})();if(typeof(MIDI)==="undefined"){var MIDI={}}(function(){var a=function(b){MIDI.api=b.api;MIDI.setVolume=b.setVolume;MIDI.programChange=b.programChange;MIDI.noteOn=b.noteOn;MIDI.noteOff=b.noteOff;MIDI.chordOn=b.chordOn;MIDI.chordOff=b.chordOff;MIDI.stopAllNotes=b.stopAllNotes;MIDI.getInput=b.getInput;MIDI.getOutputs=b.getOutputs};(function(){var e=null;var d=null;var b=[];var c=MIDI.WebMIDI={api:"webmidi"};c.setVolume=function(g,f){d.send([176+g,7,f])};c.programChange=function(g,f){d.send([192+g,f])};c.noteOn=function(i,g,h,f){d.send([144+i,g,h],f*1000)};c.noteOff=function(h,g,f){d.send([128+h,g,0],f*1000)};c.chordOn=function(i,j,h,f){for(var k=0;k<j.length;k++){var g=j[k];d.send([144+i,g,h],f*1000)}};c.chordOff=function(h,i,f){for(var j=0;j<i.length;j++){var g=i[j];d.send([128+h,g,0],f*1000)}};c.stopAllNotes=function(){for(var f=0;f<16;f++){d.send([176+f,123,0])}};c.getInput=function(){return e.getInputs()};c.getOutputs=function(){return e.getOutputs()};c.connect=function(f){a(c);navigator.requestMIDIAccess().then(function(g){e=g;d=e.outputs()[0];if(f.callback){f.callback()}},function(g){if(window.AudioContext){f.api="webaudio"}else{if(window.Audio){f.api="audiotag"}else{f.api="flash"}}MIDI.loadPlugin(f)})}})();if(window.AudioContext){(function(){var h=window.AudioContext;var c=MIDI.WebAudio={api:"webaudio"};var b;var d={};var g=127;var f={};var e=function(r,q,n,o,p){var l=MIDI.GeneralMIDI.byName[r];var i=l.number;var j=q[n];if(!MIDI.Soundfont[r][j]){return p(r)}var m=MIDI.Soundfont[r][j].split(",")[1];var k=Base64Binary.decodeArrayBuffer(m);b.decodeAudioData(k,function(s){var u=j;while(u.length<3){u+="&#160;"}if(typeof(MIDI.loader)!=="undefined"){MIDI.loader.update(null,l.instrument+"<br/>Processing: "+(n/87*100>>0)+"%<br/>"+u)}s.id=j;o[n]=s;if(o.length===q.length){while(o.length){s=o.pop();if(!s){continue}var t=MIDI.keyToNote[s.id];f[i+""+t]=s}p(r)}})};c.setVolume=function(j,i){g=i};c.programChange=function(j,i){MIDI.channels[j].instrument=i};c.noteOn=function(m,k,l,i){if(!MIDI.channels[m]){return}var j=MIDI.channels[m].instrument;if(!f[j+""+k]){return}if(i<b.currentTime){i+=b.currentTime}var o=b.createBufferSource();d[m+""+k]=o;o.buffer=f[j+""+k];o.connect(b.destination);if(b.createGain){o.gainNode=b.createGain()}else{o.gainNode=b.createGainNode()}var n=(l/127)*(g/127)*2-1;o.gainNode.connect(b.destination);o.gainNode.gain.value=Math.max(-1,n);o.connect(o.gainNode);if(o.noteOn){o.noteOn(i||0)}else{o.start(i||0)}return o};c.noteOff=function(k,j,i){i=i||0;if(i<b.currentTime){i+=b.currentTime}var m=d[k+""+j];if(!m){return}if(m.gainNode){var l=m.gainNode.gain;l.linearRampToValueAtTime(l.value,i);l.linearRampToValueAtTime(-1,i+0.2)}if(m.noteOff){m.noteOff(i+0.3)}else{m.stop(i+0.3)}delete d[k+""+j]};c.chordOn=function(o,p,m,j){var i={},k;for(var q=0,l=p.length;q<l;q++){i[k=p[q]]=c.noteOn(o,k,m,j)}return i};c.chordOff=function(m,o,j){var i={},k;for(var p=0,l=o.length;p<l;p++){i[k=o[p]]=c.noteOff(m,k,j)}return i};c.stopAllNotes=function(){for(var j in d){var i=0;if(i<b.currentTime){i+=b.currentTime}d[j].gainNode.gain.linearRampToValueAtTime(1,i);d[j].gainNode.gain.linearRampToValueAtTime(0,i+0.2);if(j.noteOff){d[j].noteOff(i+0.3)}else{d[j].stop(i+0.3)}delete d[j]}};c.connect=function(n){a(c);MIDI.Player.ctx=b=new h();var q=[];var j=MIDI.keyToNote;for(var p in j){q.push(p)}var o=[];var k={};var l=function(s){delete k[s];for(var i in k){break}if(!i){n.callback()}};for(var r in MIDI.Soundfont){k[r]=true;
for(var m=0;m<q.length;m++){e(r,q,m,o,l)}}}})()}if(window.Audio){(function(){var k=MIDI.AudioTag={api:"audiotag"};var d={};var e=127;var j=-1;var f=[];var c=[];var g={};for(var b=0;b<12;b++){f[b]=new Audio()}var i=function(q,o){if(!MIDI.channels[q]){return}var n=MIDI.channels[q].instrument;var m=MIDI.GeneralMIDI.byId[n].id;var o=g[o];if(!o){return}var l=m+""+o.id;var r=(j+1)%f.length;var p=f[r];c[r]=l;p.src=MIDI.Soundfont[m][o.id];p.volume=e/127;p.play();j=r};var h=function(r,q){if(!MIDI.channels[r]){return}var p=MIDI.channels[r].instrument;var o=MIDI.GeneralMIDI.byId[p].id;var q=g[q];if(!q){return}var m=o+""+q.id;for(var n=0;n<f.length;n++){var s=(n+j+1)%f.length;var l=c[s];if(l&&l==m){f[s].pause();c[s]=null;return}}};k.programChange=function(m,l){MIDI.channels[m].instrument=l};k.setVolume=function(l,m){e=m};k.noteOn=function(o,m,n,l){var p=d[m];if(!g[p]){return}if(l){return window.setTimeout(function(){i(o,p)},l*1000)}else{i(o,p)}};k.noteOff=function(n,m,l){var o=d[m];if(!g[o]){return}if(l){return setTimeout(function(){h(n,o)},l*1000)}else{h(n,o)}};k.chordOn=function(p,q,o,m){for(var l=0;l<q.length;l++){var s=q[l];var r=d[s];if(!g[r]){continue}if(m){return window.setTimeout(function(){i(p,r)},m*1000)}else{i(p,r)}}};k.chordOff=function(o,p,m){for(var l=0;l<p.length;l++){var r=p[l];var q=d[r];if(!g[q]){continue}if(m){return window.setTimeout(function(){h(o,q)},m*1000)}else{h(o,q)}}};k.stopAllNotes=function(){for(var m=0,l=f.length;m<l;m++){f[m].pause()}};k.connect=function(l){for(var m in MIDI.keyToNote){d[MIDI.keyToNote[m]]=m;g[m]={id:m}}a(k);if(l.callback){l.callback()}}})()}(function(){var b=MIDI.Flash={api:"flash"};var d={};var c={};b.programChange=function(f,e){MIDI.channels[f].instrument=e};b.setVolume=function(f,e){};b.noteOn=function(i,g,h,e){if(!MIDI.channels[i]){return}var f=MIDI.channels[i].instrument;var j=MIDI.GeneralMIDI.byId[f].number;g=j+""+d[g];if(!c[g]){return}if(e){return window.setTimeout(function(){c[g].play({volume:h*2})},e*1000)}else{c[g].play({volume:h*2})}};b.noteOff=function(g,f,e){};b.chordOn=function(j,h,g,i){if(!MIDI.channels[j]){return}var m=MIDI.channels[j].instrument;var e=MIDI.GeneralMIDI.byId[m].number;for(var l in h){var f=h[l];var k=e+""+d[f];if(c[k]){c[k].play({volume:g*2})}}};b.chordOff=function(f,g,e){};b.stopAllNotes=function(){};b.connect=function(e,f){soundManager.flashVersion=9;soundManager.useHTML5Audio=true;soundManager.url=f.soundManagerSwfUrl||"../inc/SoundManager2/swf/";soundManager.useHighPerformance=true;soundManager.wmode="transparent";soundManager.flashPollingInterval=1;soundManager.debugMode=false;soundManager.onload=function(){var r=function(t,v,u){var i=MIDI.GeneralMIDI.byName[t];var j=i.number;c[j+""+v]=soundManager.createSound({id:v,url:MIDI.soundfontUrl+t+"-mp3/"+v+".mp3",multiShot:true,autoLoad:true,onload:u})};var p=[];var l=88;var q=e.length*l;for(var o=0;o<e.length;o++){var s=e[o];var m=function(){p.push(this.sID);if(typeof(MIDI.loader)==="undefined"){return}MIDI.loader.update(null,"Processing: "+this.sID)};for(var n=0;n<l;n++){var h=d[n+21];r(s,h,m)}}a(b);var k=window.setInterval(function(){if(p.length<q){return}window.clearInterval(k);if(f.callback){f.callback()}},25)};soundManager.onerror=function(){};for(var g in MIDI.keyToNote){d[MIDI.keyToNote[g]]=g}}})();MIDI.GeneralMIDI=(function(e){var h=function(k){return k.replace(/[^a-z0-9 ]/gi,"").replace(/[ ]/g,"_").toLowerCase()};var g={byName:{},byId:{},byCategory:{}};for(var i in e){var f=e[i];for(var c=0,b=f.length;c<b;c++){var j=f[c];if(!j){continue}var d=parseInt(j.substr(0,j.indexOf(" ")),10);j=j.replace(d+" ","");g.byId[--d]=g.byName[h(j)]=g.byCategory[h(i)]={id:h(j),instrument:j,number:d,category:i}}}return g})({Piano:["1 Acoustic Grand Piano","2 Bright Acoustic Piano","3 Electric Grand Piano","4 Honky-tonk Piano","5 Electric Piano 1","6 Electric Piano 2","7 Harpsichord","8 Clavinet"],"Chromatic Percussion":["9 Celesta","10 Glockenspiel","11 Music Box","12 Vibraphone","13 Marimba","14 Xylophone","15 Tubular Bells","16 Dulcimer"],Organ:["17 Drawbar Organ","18 Percussive Organ","19 Rock Organ","20 Church Organ","21 Reed Organ","22 Accordion","23 Harmonica","24 Tango Accordion"],Guitar:["25 Acoustic Guitar (nylon)","26 Acoustic Guitar (steel)","27 Electric Guitar (jazz)","28 Electric Guitar (clean)","29 Electric Guitar (muted)","30 Overdriven Guitar","31 Distortion Guitar","32 Guitar Harmonics"],Bass:["33 Acoustic Bass","34 Electric Bass (finger)","35 Electric Bass (pick)","36 Fretless Bass","37 Slap Bass 1","38 Slap Bass 2","39 Synth Bass 1","40 Synth Bass 2"],Strings:["41 Violin","42 Viola","43 Cello","44 Contrabass","45 Tremolo Strings","46 Pizzicato Strings","47 Orchestral Harp","48 Timpani"],Ensemble:["49 String Ensemble 1","50 String Ensemble 2","51 Synth Strings 1","52 Synth Strings 2","53 Choir Aahs","54 Voice Oohs","55 Synth Choir","56 Orchestra Hit"],Brass:["57 Trumpet","58 Trombone","59 Tuba","60 Muted Trumpet","61 French Horn","62 Brass Section","63 Synth Brass 1","64 Synth Brass 2"],Reed:["65 Soprano Sax","66 Alto Sax","67 Tenor Sax","68 Baritone Sax","69 Oboe","70 English Horn","71 Bassoon","72 Clarinet"],Pipe:["73 Piccolo","74 Flute","75 Recorder","76 Pan Flute","77 Blown Bottle","78 Shakuhachi","79 Whistle","80 Ocarina"],"Synth Lead":["81 Lead 1 (square)","82 Lead 2 (sawtooth)","83 Lead 3 (calliope)","84 Lead 4 (chiff)","85 Lead 5 (charang)","86 Lead 6 (voice)","87 Lead 7 (fifths)","88 Lead 8 (bass + lead)"],"Synth Pad":["89 Pad 1 (new age)","90 Pad 2 (warm)","91 Pad 3 (polysynth)","92 Pad 4 (choir)","93 Pad 5 (bowed)","94 Pad 6 (metallic)","95 Pad 7 (halo)","96 Pad 8 (sweep)"],"Synth Effects":["97 FX 1 (rain)","98 FX 2 (soundtrack)","99 FX 3 (crystal)","100 FX 4 (atmosphere)","101 FX 5 (brightness)","102 FX 6 (goblins)","103 FX 7 (echoes)","104 FX 8 (sci-fi)"],Ethnic:["105 Sitar","106 Banjo","107 Shamisen","108 Koto","109 Kalimba","110 Bagpipe","111 Fiddle","112 Shanai"],Percussive:["113 Tinkle Bell","114 Agogo","115 Steel Drums","116 Woodblock","117 Taiko Drum","118 Melodic Tom","119 Synth Drum"],"Sound effects":["120 Reverse Cymbal","121 Guitar Fret Noise","122 Breath Noise","123 Seashore","124 Bird Tweet","125 Telephone Ring","126 Helicopter","127 Applause","128 Gunshot"]});MIDI.channels=(function(){var b={};for(var c=0;c<16;c++){b[c]={instrument:0,mute:false,mono:false,omni:false,solo:false}}return b})();MIDI.pianoKeyOffset=21;MIDI.keyToNote={};MIDI.noteToKey={};(function(){var f=21;var b=108;var c=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];for(var g=f;g<=b;g++){var e=(g-12)/12>>0;var d=c[g%12]+e;MIDI.keyToNote[d]=g;MIDI.noteToKey[g]=d}})()})();if(typeof(widgets)==="undefined"){var widgets={}}(function(){var e=Math.PI;var f=!document.createElement("canvas").getContext;var d=400;var a={id:"loader",bars:12,radius:0,lineWidth:20,lineHeight:70,timeout:0,display:true};widgets.Loader=function(y){if(f){return}var l=this;if(typeof(y)==="string"){y={message:y}}if(typeof(y)==="boolean"){y={display:false}}if(typeof(y)==="undefined"){y={}
}y.container=y.container||document.body;if(!y.container){return}for(var z in a){if(typeof(y[z])==="undefined"){y[z]=a[z]}}var i=document.getElementById(y.id);if(!i){var n=document.createElement("div");var t=document.createElement("span");t.className="message";n.appendChild(t);n.className=a.id;n.id=y.id+"Div";n.style.cssText=b("opacity",d);this.span=t;this.div=n;var i=document.createElement("canvas");document.body.appendChild(i);i.id=y.id;i.style.cssText="opacity: 1; position: absolute; z-index: 10000;";n.appendChild(i);y.container.appendChild(n)}else{this.span=i.parentNode.getElementsByTagName("span")[0];this.div=document.getElementById(y.id+"Div")}var x=y.delay;var q=y.bars;var j=y.radius;var u=y.lineHeight+20;var o=u*2+y.radius*2;var m=c(y.container);var r=m.width-o;var p=m.height-o;var w=window.devicePixelRatio||1;i.width=o*w;i.height=o*w;var g=0;var s=i.getContext("2d");s.globalCompositeOperation="lighter";s.shadowOffsetX=1;s.shadowOffsetY=1;s.shadowBlur=1;s.shadowColor="rgba(0, 0, 0, 0.5)";this.messages={};this.message=function(A,B){if(!this.interval){return this.start(B,A)}return this.add({message:A,onstart:B})};this.update=function(D,C,B){if(!D){for(var D in this.messages){}}if(!D){return this.message(C)}var A=this.messages[D];A.message=C;if(typeof(B)==="number"){A.span.innerHTML=B+"%"}if(C.substr(-3)==="..."){A._message=C.substr(0,C.length-3);A.messageAnimate=[".&#160;&#160;","..&#160;","..."].reverse()}else{A._message=C;A.messageAnimate=false}A.element.innerHTML=C};this.add=function(F){if(typeof(F)==="string"){F={message:F}}var A=y.background?y.background:"rgba(0,0,0,0.65)";this.span.style.cssText="background: "+A+";";this.div.style.cssText=b("opacity",d);if(this.stopPropagation){this.div.style.cssText+="background: rgba(0,0,0,0.25);"}else{this.div.style.cssText+="pointer-events: none;"}i.parentNode.style.opacity=1;i.parentNode.style.display="block";if(y.background){this.div.style.background=y.backgrond}var E=(new Date()).getTime();var D=Math.abs(E*Math.random()>>0);var I=F.message;var B=document.createElement("div");B.style.cssText=b("opacity",500);var G=document.createElement("span");G.style.cssText="float: right; width: 50px;";var C=document.createElement("span");C.innerHTML=I;B.appendChild(C);B.appendChild(G);var H=this.messages[D]={seed:D,container:B,element:C,span:G,message:I,timeout:(F.timeout||y.timeout)*1000,timestamp:E,getProgress:F.getProgress};this.span.appendChild(B);this.span.style.display="block";this.update(H.seed,I);if(F.onstart){window.setTimeout(F.onstart,50)}this.center();if(!this.interval){if(!F.delay){h()}window.clearInterval(this.interval);this.interval=window.setInterval(h,30)}return D};this.remove=function(A){g+=0.07;var D=(new Date()).getTime();if(typeof(A)==="object"){A=A.join(":")}if(A){A=":"+A+":"}for(var B in this.messages){var C=this.messages[B];if(!A||A.indexOf(":"+C.seed+":")!==-1){delete this.messages[C.seed];C.container.style.color="#99ff88";k(C);if(C.getProgress){C.span.innerHTML="100%"}}}};this.start=function(B,A){if(!(A||y.message)){return}return this.add({message:A||y.message,onstart:B})};this.stop=function(){this.remove();window.clearInterval(this.interval);delete this.interval;if(y.oncomplete){y.oncomplete()}if(i&&i.style){this.div.style.cssText+="pointer-events: none;";window.setTimeout(function(){l.div.style.opacity=0},1);window.setTimeout(function(){if(l.interval){return}l.stopPropagation=false;i.parentNode.style.display="none";s.clearRect(0,0,o,o)},d*1000)}};this.center=function(){var B=c(y.container);var C=B.width-o;var A=B.height-o;i.style.left=(C/2)+"px";i.style.top=(A/2)+"px";i.style.width=(o)+"px";i.style.height=(o)+"px";l.span.style.top=(A/2+o-10)+"px"};var v=document.createElement("style");v.innerHTML=".loader { color: #fff; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }.loader span.message { font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0; right: 0; }.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }.loader span.message div:last-child { border-bottom: none; }";document.head.appendChild(v);var k=function(A){window.setTimeout(function(){A.container.style.opacity=0},1);window.setTimeout(function(){A.container.parentNode.removeChild(A.container)},250)};var h=function(){var K=(new Date()).getTime();for(var N in l.messages){var Q=l.messages[N];var A=g/0.07>>0;if(A%5===0&&Q.getProgress){if(Q.timeout&&Q.timestamp&&K-Q.timestamp>Q.timeout){l.remove(Q.seed);continue}var B=Q.getProgress();if(B>=100){l.remove(Q.seed);continue}Q.span.innerHTML=(B>>0)+"%"}if(A%10===0){if(Q.messageAnimate){var E=Q.messageAnimate.length;var G=A/10%E;var P=Q._message+Q.messageAnimate[G];Q.element.innerHTML=P}}}if(!N){l.stop()}s.save();s.clearRect(0,0,o*w,o*w);s.scale(w,w);s.translate(o/2,o/2);var D=360-360/q;for(var I=0;I<q;I++){var H=(I/q*2*e)+g;s.save();s.translate(j*Math.sin(-H),j*Math.cos(-H));s.rotate(H);var M=-y.lineWidth/2;var L=0;var C=y.lineWidth;var O=y.lineHeight;var F=C/2;s.beginPath();s.moveTo(M+F,L);s.lineTo(M+C-F,L);s.quadraticCurveTo(M+C,L,M+C,L+F);s.lineTo(M+C,L+O-F);s.quadraticCurveTo(M+C,L+O,M+C-F,L+O);s.lineTo(M+F,L+O);s.quadraticCurveTo(M,L+O,M,L+O-F);s.lineTo(M,L+F);s.quadraticCurveTo(M,L,M+F,L);var J=((I/(q-1))*D);s.fillStyle="hsla("+J+", 100%, 50%, 0.85)";s.fill();s.restore()}s.restore();g+=0.07};if(y.display===false){return this}this.start();return this};var b=function(h,g){return"		-webkit-transition-property: "+h+";		-webkit-transition-duration: "+g+"ms;		-moz-transition-property: "+h+";		-moz-transition-duration: "+g+"ms;		-o-transition-property: "+h+";		-o-transition-duration: "+g+"ms;		-ms-transition-property: "+h+";		-ms-transition-duration: "+g+"ms;"};var c=function(h){if(window.innerWidth&&window.innerHeight){var i=window.innerWidth;var g=window.innerHeight}else{if(document.compatMode==="CSS1Compat"&&document.documentElement&&document.documentElement.offsetWidth){var i=document.documentElement.offsetWidth;var g=document.documentElement.offsetHeight}else{if(document.body&&document.body.offsetWidth){var i=document.body.offsetWidth;var g=document.body.offsetHeight}}}if(h){var i=h.offsetWidth}return{width:i,height:g}}})();if(typeof(DOMLoader)==="undefined"){var DOMLoader={}}if(typeof(XMLHttpRequest)==="undefined"){var XMLHttpRequest;(function(){var b=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var a=0;a<b.length;a++){try{b[a]()}catch(c){continue}break}XMLHttpRequest=b[a]})()}if(typeof((new XMLHttpRequest()).responseText)==="undefined"){var IEBinaryToArray_ByteStr_Script="<!-- IEBinaryToArray_ByteStr -->\r\n<script type='text/vbscript'>\r\nFunction IEBinaryToArray_ByteStr(Binary)\r\n   IEBinaryToArray_ByteStr = CStr(Binary)\r\nEnd Function\r\nFunction IEBinaryToArray_ByteStr_Last(Binary)\r\n   Dim lastIndex\r\n   lastIndex = LenB(Binary)\r\n   if lastIndex mod 2 Then\r\n       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n   Else\r\n       IEBinaryToArray_ByteStr_Last = \"\"\r\n   End If\r\nEnd Function\r\n<\/script>\r\n";
document.write(IEBinaryToArray_ByteStr_Script);DOMLoader.sendRequest=function(a){function c(k){var d={};for(var h=0;h<256;h++){for(var g=0;g<256;g++){d[String.fromCharCode(h+g*256)]=String.fromCharCode(h)+String.fromCharCode(g)}}var e=IEBinaryToArray_ByteStr(k);var f=IEBinaryToArray_ByteStr_Last(k);return e.replace(/[\s\S]/g,function(i){return d[i]})+f}var b=XMLHttpRequest();b.open("GET",a.url,true);if(a.responseType){b.responseType=a.responseType}if(a.onerror){b.onerror=a.onerror}if(a.onprogress){b.onprogress=a.onprogress}b.onreadystatechange=function(d){if(b.readyState===4){if(b.status===200){b.responseText=c(b.responseBody)}else{b=false}if(a.onload){a.onload(b)}}};b.setRequestHeader("Accept-Charset","x-user-defined");b.send(null);return b}}else{DOMLoader.sendRequest=function(a){var b=new XMLHttpRequest();b.open(a.data?"POST":"GET",a.url,true);if(b.overrideMimeType){b.overrideMimeType("text/plain; charset=x-user-defined")}if(a.data){b.setRequestHeader("Content-type","application/x-www-form-urlencoded")}if(a.responseType){b.responseType=a.responseType}if(a.onerror){b.onerror=a.onerror}if(a.onprogress){b.onprogress=a.onprogress}b.onreadystatechange=function(c){if(b.readyState===4){if(b.status!==200&&b.status!=304){if(a.onerror){a.onerror(c,false)}return}if(a.onload){a.onload(b)}}};b.send(a.data);return b}}(function(c){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.btoa||(c.btoa=function b(f){f=escape(f);var d="";var n,l,j="";var m,k,h,g="";var e=0;do{n=f.charCodeAt(e++);l=f.charCodeAt(e++);j=f.charCodeAt(e++);m=n>>2;k=((n&3)<<4)|(l>>4);h=((l&15)<<2)|(j>>6);g=j&63;if(isNaN(l)){h=g=64}else{if(isNaN(j)){g=64}}d=d+a.charAt(m)+a.charAt(k)+a.charAt(h)+a.charAt(g);n=l=j="";m=k=h=g=""}while(e<f.length);return d});c.atob||(c.atob=function(g){var e="";var o,m,k="";var n,l,j,h="";var f=0;var d=/[^A-Za-z0-9\+\/\=]/g;if(d.exec(g)){alert("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.")}g=g.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{n=a.indexOf(g.charAt(f++));l=a.indexOf(g.charAt(f++));j=a.indexOf(g.charAt(f++));h=a.indexOf(g.charAt(f++));o=(n<<2)|(l>>4);m=((l&15)<<4)|(j>>2);k=((j&3)<<6)|h;e=e+String.fromCharCode(o);if(j!=64){e=e+String.fromCharCode(m)}if(h!=64){e=e+String.fromCharCode(k)}o=m=k="";n=l=j=h=""}while(f<g.length);return unescape(e)})}(this));var Base64Binary={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",decodeArrayBuffer:function(b){var a=Math.ceil((3*b.length)/4);var c=new ArrayBuffer(a);this.decode(b,c);return c},decode:function(g,f){var d=this._keyStr.indexOf(g.charAt(g.length-1));var b=this._keyStr.indexOf(g.charAt(g.length-1));var q=Math.ceil((3*g.length)/4);if(d==64){q--}if(b==64){q--}var e;var p,n,l;var o,m,k,h;var c=0;var a=0;if(f){e=new Uint8Array(f)}else{e=new Uint8Array(q)}g=g.replace(/[^A-Za-z0-9\+\/\=]/g,"");for(c=0;c<q;c+=3){o=this._keyStr.indexOf(g.charAt(a++));m=this._keyStr.indexOf(g.charAt(a++));k=this._keyStr.indexOf(g.charAt(a++));h=this._keyStr.indexOf(g.charAt(a++));p=(o<<2)|(m>>4);n=((m&15)<<4)|(k>>2);l=((k&3)<<6)|h;e[c]=p;if(k!=64){e[c+1]=n}if(h!=64){e[c+2]=l}}return e}};