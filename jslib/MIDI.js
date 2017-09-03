/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

_Debug = false;

function debugToTitle(msg) {
    var title = document.getElementById("title");
     title.innerHTML += '<br/>' + msg;
}
/**
 * @license -------------------------------------------------------------------
 *   module: WebAudioShim - Fix naming issues for WebAudioAPI supports
 *      src: https://github.com/Dinahmoe/webaudioshim
 *   author: Dinahmoe AB
 * -------------------------------------------------------------------
 * Copyright (c) 2012 DinahMoe AB
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || null;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null;

(function (Context) {
	var isFunction = function (f) {
		return Object.prototype.toString.call(f) === "[object Function]" ||
			Object.prototype.toString.call(f) === "[object AudioContextConstructor]";
	};
	var contextMethods = [
		["createGainNode", "createGain"],
		["createDelayNode", "createDelay"],
		["createJavaScriptNode", "createScriptProcessor"]
	];
	///
	var proto;
	var instance;
	var sourceProto;
	///
	if (!isFunction(Context)) {
		return;
	}
	instance = new Context();
	if (!instance.destination || !instance.sampleRate) {
		return;
	}
	proto = Context.prototype;
	sourceProto = Object.getPrototypeOf(instance.createBufferSource());

	if (!isFunction(sourceProto.start)) {
		if (isFunction(sourceProto.noteOn)) {
			sourceProto.start = function (when, offset, duration) {
				switch (arguments.length) {
					case 0:
						throw new Error("Not enough arguments.");
					case 1:
						this.noteOn(when);
						break;
					case 2:
						if (this.buffer) {
							this.noteGrainOn(when, offset, this.buffer.duration - offset);
						} else {
							throw new Error("Missing AudioBuffer");
						}
						break;
					case 3:
						this.noteGrainOn(when, offset, duration);
				}
			};
		}
	}

	if (!isFunction(sourceProto.noteOn)) {
		sourceProto.noteOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.noteGrainOn)) {
		sourceProto.noteGrainOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.stop)) {
		sourceProto.stop = sourceProto.noteOff;
	}

	if (!isFunction(sourceProto.noteOff)) {
		sourceProto.noteOff = sourceProto.stop;
	}

	contextMethods.forEach(function (names) {
		var name1;
		var name2;
		while (names.length) {
			name1 = names.pop();
			if (isFunction(this[name1])) {
				this[names.pop()] = this[name1];
			} else {
				name2 = names.pop();
				this[name1] = this[name2];
			}
		}
	}, proto);
})(window.AudioContext);/*
	-------------------------------------
	MIDI.audioDetect : 0.3
	-------------------------------------
	https://github.com/mudcube/MIDI.js
	-------------------------------------
	Probably, Maybe, No... Absolutely!
	-------------------------------------
	Test to see what types of <audio> MIME types are playable by the browser.
	-------------------------------------
*/
if (!window.MIDI)
    window.MIDI = {};

//if (typeof(MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var supports = {};	
var pending = 0;
var canPlayThrough = function (src) {
    try {
	pending ++;
        var body = document.body;
	var audio = new Audio();
	var mime = src.split(";")[0];
	audio.id = "audio";
	audio.setAttribute("preload", "auto");
	audio.setAttribute("audiobuffer", true);
        supports[mime] = null;
	audio.addEventListener("error", function() {
                body.removeChild(audio);
		supports[mime] = false;
		pending --;
	}, false);
	audio.addEventListener("canplaythrough", function() {
		supports[mime] = true;
		pending --;
	}, false);
	audio.src = "data:" + src;
	body.appendChild(audio);
    } catch(e) {
    }
};

MIDI.audioDetect = function(callback) {

	// check whether <audio> tag is supported
	if (typeof(Audio) === "undefined") return callback({});
	// check whether canPlayType is supported
	var audio = new Audio();
	if (typeof(audio.canPlayType) === "undefined") return callback(supports);
	// see what we can learn from the browser
	var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
	vorbis = (vorbis === "probably" || vorbis === "maybe");
	var mpeg = audio.canPlayType('audio/mpeg');
	mpeg = (mpeg === "probably" || mpeg === "maybe");
	// maybe nothing is supported
	if (!vorbis && !mpeg) {
            
		callback(supports);
		return;
	}
	// or maybe something is supported
	if (vorbis) canPlayThrough("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=");
	if (mpeg) canPlayThrough("audio/mp3;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
 	// lets find out!
	var time = (new Date()).getTime(); 
	var interval = window.setInterval(function() {
		var now = (new Date()).getTime();
		var maxExecution = now - time > 5000;
		if (!pending || maxExecution) {
			window.clearInterval(interval);
			callback(supports);
		}
	}, 1);
};

})();/*
	-----------------------------------------------------------
	MIDI.loadPlugin : 0.1.2 : 01/22/2014
	-----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	-----------------------------------------------------------
	MIDI.loadPlugin({
		targetFormat: "mp3", // optionally can force to use MP3 (for instance on mobile networks)
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
		callback: function() { }
	});
*/

if (!window.MIDI)
    window.MIDI = {};


//if (typeof (MIDI) === "undefined") var MIDI = {};

if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

var USE_JAZZMIDI = false; // Turn on to support JazzMIDI Plugin

MIDI.getPercent = function(event) {
    if (!this.totalSize) {
        if (this.getResponseHeader && this.getResponseHeader("Content-Length-Raw")) {
            this.totalSize = parseInt(this.getResponseHeader("Content-Length-Raw"));
        } else {
            this.totalSize = event.total;
        }
    }
    ///
    return !this.totalSize ? 0 : Math.round(event.loaded / this.totalSize * 100);
};

MIDI.loadPlugin = function(conf) {
    
    
	if (typeof(conf) === "function") conf = {
		callback: conf
	};
        
	/// Get the instrument name.
	var instruments = conf.instruments || conf.instrument || "accordion";
	if (typeof(instruments) !== "object") instruments = [ instruments ];
        
        MIDI.clientOnProgress = conf.onprogress;
        MIDI.jobsTotal = (2*instruments.length);
        MIDI.jobsDone = 0;
        
	for (var n = 0; n < instruments.length; n ++) {
		var instrument = instruments[n];
		if (typeof(instrument) === "number") {
			instruments[n] = MIDI.GeneralMIDI.byId[instrument];
		}
	};
	///
	MIDI.soundfontUrl = conf.soundfontUrl || MIDI.soundfontUrl || "./soundfont/";
        
	/// Detect the best type of audio to use.
	MIDI.audioDetect(function(types) {
            
		var api = "";
		// use the most appropriate plugin if not specified
		if (apis[conf.api]) {
			api = conf.api;
		} else if (apis[window.location.hash.substr(1)]) {
			api = window.location.hash.substr(1);
		} else if (USE_JAZZMIDI && navigator.requestMIDIAccess) {
			api = "webmidi";
		} else if (window.AudioContext || window.webkitAudioContext) { // Chrome
			api = "webaudio";
		} else if (window.Audio) { // Firefox
			api = "audiotag";
		} else { // Internet Explorer
			api = "flash";
		}
                
		///
		if (!connect[api]) return;
                
		// use audio/ogg when supported
                var filetype = types["audio/ogg"] ? "ogg" : "mp3";
                
		if (conf.targetFormat) {
                    filetype = conf.targetFormat;
		}
                
		// load the specified plugin
		MIDI.lang = api;
		MIDI.supports = types;
                MIDI.audioformat = filetype;
		connect[api](filetype, instruments, conf);
	});
};

///

var connect = {};

connect.webmidi = function(filetype, instruments, conf) {
    
	if (MIDI.loader) MIDI.loader.message("Web MIDI API...");
        
	MIDI.WebMIDI.connect(conf);
        
};

connect.flash = function(filetype, instruments, conf) {
    
	// fairly quick, but requires loading of individual MP3s (more http requests).
	if (MIDI.loader) MIDI.loader.message("Flash API...");
        
	DOMLoader.script.add({
		src: conf.soundManagerUrl || "./inc/SoundManager2/script/soundmanager2.js",
		verify: "SoundManager",
		callback: function () {
			MIDI.Flash.connect(instruments, conf);
		}
	});
};

connect.audiotag = function(filetype, instruments, conf) {
    
	// works ok, kinda like a drunken tuna fish, across the board.
        if (MIDI.loader) MIDI.loader.message("HTML5 Audio API...");
        
        var onload = defaultOnLoad;
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
                            DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
				onprogress: defaultOnProgress,
				onload: function (response) {
					addSoundfont(response.responseText);
                                        onload();
					queue.getNext();
				}
                            });
		},
		onComplete: function() {
			MIDI.AudioTag.connect(conf);
		}
	});
};

connect.webaudio = function(filetype, instruments, conf) {
    
	// works awesome! safari, chrome and firefox support.
	if (MIDI.loader) MIDI.loader.message("Web Audio API...");
         
        var onload = defaultOnLoad;
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
				onprogress: defaultOnProgress,
				onload: function(response) {
					addSoundfont(response.responseText);
                                        onload();
					queue.getNext();
				}
			});
		},
		onComplete: function() {
                    MIDI.WebAudio.connect(conf);
		}
	});
};

/// Helpers

var apis = {
	"webmidi": true,
	"webaudio": true,
	"audiotag": true,
	"flash": true
};

var addSoundfont = function(text) {
	var script = document.createElement("script");
	script.language = "javascript";
	script.type = "text/javascript";
	script.text = text;
	document.body.appendChild(script);
};



var defaultOnProgress = function( event ) {
    if( MIDI.clientOnProgress ) {
        MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, MIDI.getPercent(event) );
    } else {
        MIDI.loader && MIDI.loader.update(null, "Downloading...", MIDI.getPercent(event));
    }
};

var defaultOnLoad = function( event ) {
    if( MIDI.clientOnProgress ) {
        MIDI.jobsDone++;
        MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, 0 );
    } else {
        MIDI.loader && MIDI.loader.update(null, "Downloading", 100);
    }    
};

var createQueue = function(conf) {
	var self = {};
	self.queue = [];
	for (var key in conf.items) {
		if (conf.items.hasOwnProperty(key)) {
			self.queue.push(conf.items[key]);
		}
	}
	self.getNext = function() {
		if (!self.queue.length) return conf.onComplete();
		conf.getNext(self.queue.shift());
	};
	setTimeout(self.getNext, 1);
	return self;
};

})();/*
	--------------------------------------------
	MIDI.Plugin : 0.3.2 : 2013/01/26
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	--------------------------------------------
	Technologies:
		MIDI.WebMIDI
		MIDI.WebAudio
		MIDI.Flash
		MIDI.AudioTag
	--------------------------------------------
	Helpers:
		MIDI.GeneralMIDI
		MIDI.channels
		MIDI.keyToNote
		MIDI.noteToKey
*/

if (!window.MIDI)
    window.MIDI = {};
    
//if (typeof (MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var setPlugin = function(root) {
	MIDI.api = root.api;
	MIDI.setVolume = root.setVolume;
	MIDI.programChange = root.programChange;
	MIDI.noteOn = root.noteOn;
	MIDI.noteOff = root.noteOff;
	MIDI.chordOn = root.chordOn;
	MIDI.chordOff = root.chordOff;
	MIDI.stopAllNotes = root.stopAllNotes;
	MIDI.getInput = root.getInput;
	MIDI.getOutputs = root.getOutputs;
};

/*
	--------------------------------------------
	Web MIDI API - Native Soundbank
	--------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
	--------------------------------------------
*/

(function () {
	var plugin = null;
	var output = null;
	var channels = [];
	var root = MIDI.WebMIDI = {
		api: "webmidi"
	};
	root.setVolume = function (channel, volume) { // set channel volume
		output.send([0xB0 + channel, 0x07, volume]);
	};

	root.programChange = function (channel, program) { // change channel instrument
		output.send([0xC0 + channel, program]);
	};

	root.noteOn = function (channel, note, velocity, delay) {
		output.send([0x90 + channel, note, velocity], delay * 1000);
	};

	root.noteOff = function (channel, note, delay) {
		output.send([0x80 + channel, note, 0], delay * 1000);
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x90 + channel, note, velocity], delay * 1000);
		}
	};
	
	root.chordOff = function (channel, chord, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x80 + channel, note, 0], delay * 1000);
		}
	};
	
	root.stopAllNotes = function () {
		for (var channel = 0; channel < 16; channel ++) {
			output.send([0xB0 + channel, 0x7B, 0]);
		}
	};

	root.getInput = function () {
		return plugin.getInputs();
	};
	
	root.getOutputs = function () {
		return plugin.getOutputs();
	};

	root.connect = function (conf) {
		setPlugin(root);
        navigator.requestMIDIAccess().then(function (access) {
			plugin = access;
			output = plugin.outputs()[0];
			if (conf.callback) conf.callback();
		}, function (err) { // well at least we tried!
			if (window.AudioContext ) { // Chrome
				conf.api = "webaudio";
			} else if (window.Audio) { // Firefox
				conf.api = "audiotag";
			} else { // Internet Explorer
				conf.api = "flash";
			}
			MIDI.loadPlugin(conf);
		});
	};
})();

/*
	--------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	--------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
	--------------------------------------------
*/

if (window.AudioContext || window.webkitAudioContext) (function () {

	var AudioContext = window.AudioContext;
	var root = MIDI.WebAudio = {
		api: "webaudio"
	};
	var ctx;
	var sources = {};
	var masterVolume = 127;
	var audioBuffers = {};
        
        var defaultOnProgress = function( percent, instrument, msg ) {
            if ( MIDI.clientOnProgress ) {
                MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, percent );
            } else {
                MIDI.loader && MIDI.loader.update( null, instrument + "<br/>Processing: " + percent + "%<br/>" + msg);
            }
        };        
        
	var audioLoader = function (instrument, urlList, index, bufferList, callback, pend ) {
            
            var synth = MIDI.GeneralMIDI.byName[instrument];
            var instrumentId = synth.number;
            var onProgress = defaultOnProgress;

            var url = urlList[index];
            
            if (!MIDI.Soundfont[instrument][url]) { // missing soundfont
                return callback(instrument);
            }

            var base64 = MIDI.Soundfont[instrument][url].split(",")[1];
            var buffer = Base64Binary.decodeArrayBuffer(base64);
            ctx.decodeAudioData(
                 buffer
                ,function (buffer) {
                
                    pend[instrument].pend--;
                    pend[instrument].done++;

                    var msg = url;
                    var percDone = pend[instrument].done / urlList.length * 100 >> 0;

                    while (msg.length < 3) msg += "&#160;";

                    onProgress(percDone, synth.instrument, msg);

                    buffer.id = url;
                    bufferList[index] = buffer;

                    if (pend[instrument].done === urlList.length ) {
                        while (bufferList.length) {
                            buffer = bufferList.pop();
                            if (!buffer) continue;
                            var nodeId = MIDI.keyToNote[buffer.id];
                            audioBuffers[instrumentId + "" + nodeId] = buffer;
                        }
                        callback(instrument);

                    }
                }
                ,function() { 
                    console.log( 'Error loading' || url ); 
                }
            );
	};

	root.setVolume = function (channel, volume) {
		masterVolume = volume;
	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.noteOn = function (channel, note, velocity, delay) {
		/// check whether the note exists
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		if (!audioBuffers[instrument + "" + note]) return;
		/// convert relative delay to absolute delay
		if (delay < ctx.currentTime) delay += ctx.currentTime;
		/// crate audio buffer
		var source = ctx.createBufferSource();
		sources[channel + "" + note] = source;
		source.buffer = audioBuffers[instrument + "" + note];
		source.connect(ctx.destination);
		///
		if (ctx.createGain) { // firefox
			source.gainNode = ctx.createGain();
		} else { // chrome
			source.gainNode = ctx.createGainNode();
		}
		var value = (velocity / 127) * (masterVolume / 127) * 2 - 1;
		source.gainNode.connect(ctx.destination);
		source.gainNode.gain.value = Math.max(-1, value);
		source.connect(source.gainNode);
		if (source.noteOn) { // old api
			source.noteOn(delay || 0);
		} else { // new api
			source.start(delay || 0);
		}
		return source;
	};

	root.noteOff = function (channel, note, delay) {
		delay = delay || 0;
		if (delay < ctx.currentTime) delay += ctx.currentTime;
		var source = sources[channel + "" + note];
		if (!source) return;
		if (source.gainNode) {
			// @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as 
			// a 'release' parameter for ADSR like time settings."
			// add { "metadata": { release: 0.3 } } to soundfont files
			var gain = source.gainNode.gain;
			gain.linearRampToValueAtTime(gain.value, delay);
			gain.linearRampToValueAtTime(-1, delay + 0.2);
		}
		if (source.noteOff) { // old api
			source.noteOff(delay + 0.3);
		} else {
			source.stop(delay + 0.3);
		}
		///
		delete sources[channel + "" + note];
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOn(channel, note, velocity, delay);
		}
		return ret;
	};

	root.chordOff = function (channel, chord, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOff(channel, note, delay);
		}
		return ret;
	};

    root.stopAllNotes = function () {
        for (var source in sources) {
            var delay = 0;
            if (delay < ctx.currentTime) delay += ctx.currentTime;
            // @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as
            // a 'release' parameter for ADSR like time settings."
            // add { "metadata": { release: 0.3 } } to soundfont files
            sources[source].gainNode.gain.linearRampToValueAtTime(1, delay);
            sources[source].gainNode.gain.linearRampToValueAtTime(0, delay + 0.2);
            if (source.noteOff) { // old api
              sources[source].noteOff(delay + 0.3);
            } else { // new api
              sources[source].stop(delay + 0.3);
            }
            delete sources[source];
        }
    };

    root.connect = function (conf) {
        setPlugin(root);
        
        ctx = new AudioContext();
        
        if ( MIDI.Player ) MIDI.Player.ctx = ctx;
        
        var urlList = [];
        var keyToNote = MIDI.keyToNote;
        for (var key in keyToNote) urlList.push(key);
        var bufferList = [];
        var pending = {};
        var oncomplete = function(instrument) {
            delete pending[instrument];
            if(MIDI.clientOnProgress) {
                MIDI.jobsDone ++;
                MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, 0 );
            }
            for (var key in pending) break;
            if (!key) conf.callback(); 
        };
        for (var instrument in MIDI.Soundfont) {
            pending[instrument] = { pend: 0, done: 0};
            for (var i = 0; i < urlList.length; i++) {
                pending[instrument].pend ++;
                audioLoader(instrument, urlList, i, bufferList, oncomplete, pending);
            }
        }
    };
})();

/*
	--------------------------------------------
	AudioTag <audio> - OGG or MPEG Soundbank
	--------------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
	--------------------------------------------
*/

if (window.Audio) (function () {

	var root = MIDI.AudioTag = {
		api: "audiotag"
	};
	var note2id = {};
	var volume = 127; // floating point 
	var channel_nid = -1; // current channel
	var channels = []; // the audio channels
	var channelInstrumentNoteIds = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
	var notes = {}; // the piano keys
	for (var nid = 0; nid < 12; nid++) {
		channels[nid] = new Audio();
	}

	var playChannel = function (channel, note) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var instrumentId = MIDI.GeneralMIDI.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;
		var nid = (channel_nid + 1) % channels.length;
		var audio = channels[nid];
		channelInstrumentNoteIds[ nid ] = instrumentNoteId;
		audio.src = MIDI.Soundfont[instrumentId][note.id];
		audio.volume = volume / 127;
		audio.play();
		channel_nid = nid;
	};

	var stopChannel = function (channel, note) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var instrumentId = MIDI.GeneralMIDI.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;

		for(var i=0;i<channels.length;i++){
			var nid = (i + channel_nid + 1) % channels.length;
			var cId = channelInstrumentNoteIds[nid];

			if(cId && cId == instrumentNoteId){
				channels[nid].pause();
				channelInstrumentNoteIds[nid] = null;
				return;
			}
		}
	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.setVolume = function (channel, n) {
		volume = n; //- should be channel specific volume
	};

	root.noteOn = function (channel, note, velocity, delay) {
		var id = note2id[note];
		if (!notes[id]) return;
		if (delay) {
			return window.setTimeout(function () {
				playChannel(channel, id);
			}, delay * 1000);
		} else {
			playChannel(channel, id);
		}
	};
	
	root.noteOff = function (channel, note, delay) {
		var id = note2id[note];
		if (!notes[id]) return;
		if (delay) {
			return setTimeout(function() {
				stopChannel(channel, id);
			}, delay * 1000)
		} else {
			stopChannel(channel, id);
		}
	};
	
	root.chordOn = function (channel, chord, velocity, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = note2id[n];
			if (!notes[id]) continue;
			if (delay) {
				return window.setTimeout(function () {
					playChannel(channel, id);
				}, delay * 1000);
			} else {
				playChannel(channel, id);
			}
		}
	};
	
	root.chordOff = function (channel, chord, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = note2id[n];
			if (!notes[id]) continue;
			if (delay) {
				return window.setTimeout(function () {
					stopChannel(channel, id);
				}, delay * 1000);
			} else {
				stopChannel(channel, id);
			}
		}
	};
	
	root.stopAllNotes = function () {
		for (var nid = 0, length = channels.length; nid < length; nid++) {
			channels[nid].pause();
		}
	};
	
	root.connect = function (conf) {
		for (var key in MIDI.keyToNote) {
			note2id[MIDI.keyToNote[key]] = key;
			notes[key] = {
				id: key
			};
		}
		setPlugin(root);
		///
		if (conf.callback) conf.callback();
	};
})();

/*
	--------------------------------------------
	Flash - MP3 Soundbank
	--------------------------------------------
	http://www.schillmania.com/projects/soundmanager2/
	--------------------------------------------
*/
	
(function () {

	var root = MIDI.Flash = {
		api: "flash"
	};
	var noteReverse = {};
	var notes = {};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.setVolume = function (channel, note) {

	};

	root.noteOn = function (channel, note, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GeneralMIDI.byId[instrument].number;
		note = id + "" + noteReverse[note];
		if (!notes[note]) return;
		if (delay) {
			return window.setTimeout(function() { 
				notes[note].play({ volume: velocity * 2 });
			}, delay * 1000);
		} else {
			notes[note].play({ volume: velocity * 2 });
		}
	};

	root.noteOff = function (channel, note, delay) {

	};

	root.chordOn = function (channel, chord, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GeneralMIDI.byId[instrument].number;
		for (var key in chord) {
			var n = chord[key];
			var note = id + "" + noteReverse[n];
			if (notes[note]) {
				notes[note].play({ volume: velocity * 2 });
			}
		}
	};

	root.chordOff = function (channel, chord, delay) {

	};

	root.stopAllNotes = function () {

	};

	root.connect = function (instruments, conf) {
		soundManager.flashVersion = 9;
		soundManager.useHTML5Audio = true;
		soundManager.url = conf.soundManagerSwfUrl || '../inc/SoundManager2/swf/';
		soundManager.useHighPerformance = true;
		soundManager.wmode = 'transparent';
		soundManager.flashPollingInterval = 1;
		soundManager.debugMode = false;
		soundManager.onload = function () {
			var createBuffer = function(instrument, id, onload) {
				var synth = MIDI.GeneralMIDI.byName[instrument];
				var instrumentId = synth.number;
				notes[instrumentId+""+id] = soundManager.createSound({
					id: id,
					url: MIDI.soundfontUrl + instrument + "-mp3/" + id + ".mp3",
					multiShot: true,
					autoLoad: true,
					onload: onload
				});			
			};
			var loaded = [];
			var samplesPerInstrument = 88;
			var samplesToLoad = instruments.length * samplesPerInstrument;
				
			for (var i = 0; i < instruments.length; i++) {
				var instrument = instruments[i];
				var onload = function () {
					loaded.push(this.sID);
					if (typeof (MIDI.loader) === "undefined") return;
					MIDI.loader.update(null, "Processing: " + this.sID);
				};
				for (var j = 0; j < samplesPerInstrument; j++) {
					var id = noteReverse[j + 21];
					createBuffer(instrument, id, onload);
				}
			}
			///
			setPlugin(root);
			//
			var interval = window.setInterval(function () {
				if (loaded.length < samplesToLoad) return;
				window.clearInterval(interval);
				if (conf.callback) conf.callback();
			}, 25);
		};
		soundManager.onerror = function () {

		};
		for (var key in MIDI.keyToNote) {
			noteReverse[MIDI.keyToNote[key]] = key;
		}
	};
})();

/*
	helper functions
*/

// instrument-tracker
MIDI.GeneralMIDI = (function (arr) {
	var clean = function(v) {
		return v.replace(/[^a-z0-9 ]/gi, "").replace(/[ ]/g, "_").toLowerCase();
	};
	var ret = {
		byName: {},
		byId: {},
		byCategory: {}
	};
	for (var key in arr) {
		var list = arr[key];
		for (var n = 0, length = list.length; n < length; n++) {
			var instrument = list[n];
			if (!instrument) continue;
			var num = parseInt(instrument.substr(0, instrument.indexOf(" ")), 10);
			instrument = instrument.replace(num + " ", "");
			ret.byId[--num] = 
			ret.byName[clean(instrument)] = 
			ret.byCategory[clean(key)] = {
				id: clean(instrument),
				instrument: instrument,
				number: num,
				category: key
			};
		}
	}
	return ret;
})({
	'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
	'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
	'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
	'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
	'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
	'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
	'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
	'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
	'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
	'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
	'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
	'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
	'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
	'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
	'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
	'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
});

// channel-tracker
MIDI.channels = (function () { // 0 - 15 channels
	var channels = {};
	for (var n = 0; n < 16; n++) {
		channels[n] = { // default values
			instrument: 21, // Accordion
			mute: false,
			mono: false,
			omni: false,
			solo: false
		};
	}
	return channels;
})();

//
MIDI.pianoKeyOffset = 21;

// note conversions
MIDI.keyToNote = {}; // C8  == 108
MIDI.noteToKey = {}; // 108 ==  C8
(function () {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		MIDI.keyToNote[name] = n;
		MIDI.noteToKey[n] = name;
	}
})();

})();/*

	DOMLoader.XMLHttp
	--------------------------
	DOMLoader.sendRequest({
		url: "./dir/something.extension",
		data: "test!",
		onerror: function(event) {
			console.log(event);
		},
		onload: function(response) {
			console.log(response.responseText);
		}, 
		onprogress: function (event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.message("loading: " + percent + "%");
		}
	});
	
*/

if (typeof(DOMLoader) === "undefined") var DOMLoader = {};

// Add XMLHttpRequest when not available

if (typeof (XMLHttpRequest) === "undefined") {
	var XMLHttpRequest;
	(function () { // find equivalent for IE
		var factories = [
		function () {
			return new ActiveXObject("Msxml2.XMLHTTP")
		}, function () {
			return new ActiveXObject("Msxml3.XMLHTTP")
		}, function () {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}];
		for (var i = 0; i < factories.length; i++) {
			try {
				factories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		XMLHttpRequest = factories[i];
	})();
}

if (typeof ((new XMLHttpRequest()).responseText) === "undefined") {
	// http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
    var IEBinaryToArray_ByteStr_Script =
    "<!-- IEBinaryToArray_ByteStr -->\r\n"+
    "<script type='text/vbscript'>\r\n"+
    "Function IEBinaryToArray_ByteStr(Binary)\r\n"+
    "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
    "End Function\r\n"+
    "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
    "   Dim lastIndex\r\n"+
    "   lastIndex = LenB(Binary)\r\n"+
    "   if lastIndex mod 2 Then\r\n"+
    "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
    "   Else\r\n"+
    "       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
    "   End If\r\n"+
    "End Function\r\n"+
    "</script>\r\n";

	// inject VBScript
	document.write(IEBinaryToArray_ByteStr_Script);

	DOMLoader.sendRequest = function(conf) {
		// helper to convert from responseBody to a "responseText" like thing
		function getResponseText(binary) {
			var byteMapping = {};
			for (var i = 0; i < 256; i++) {
				for (var j = 0; j < 256; j++) {
					byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j);
				}
			}
			// call into VBScript utility fns
			var rawBytes = IEBinaryToArray_ByteStr(binary);
			var lastChr = IEBinaryToArray_ByteStr_Last(binary);
			return rawBytes.replace(/[\s\S]/g, function (match) {
				return byteMapping[match];
			}) + lastChr;
		};
		//
		var req = XMLHttpRequest();
		req.open("GET", conf.url, true);
		if (conf.responseType) req.responseType = conf.responseType;
		if (conf.onerror) req.onerror = conf.onerror;
		if (conf.onprogress) req.onprogress = conf.onprogress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status === 200) {
					req.responseText = getResponseText(req.responseBody);
				} else {
					req = false;
				}
				if (conf.onload) conf.onload(req);
			}
		};
		req.setRequestHeader("Accept-Charset", "x-user-defined");
		req.send(null);
		return req;
	}
} else {
	DOMLoader.sendRequest = function(conf) {
		var req = new XMLHttpRequest();
		req.open(conf.data ? "POST" : "GET", conf.url, true);
		if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
		if (conf.data) req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		if (conf.responseType) req.responseType = conf.responseType;
		if (conf.onerror) req.onerror = conf.onerror;
		if (conf.onprogress) req.onprogress = conf.onprogress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status !== 200 && req.status != 304) {
					if (conf.onerror) conf.onerror(event, false);
					return;
				}
				if (conf.onload) {
					conf.onload(req);
				}
			}
		};
		req.send(conf.data);
		return req;
	};
}// http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html

// window.atob and window.btoa

(function (window) {

	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	window.btoa || (window.btoa = function encode64(input) {
		input = escape(input);
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return output;
	});
	
	window.atob || (window.atob = function(input) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		var base64test = /[^A-Za-z0-9\+\/\=]/g;
		if (base64test.exec(input)) {
			alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
		}
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		do {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return unescape(output);
	});

}(this));/*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Daniel Guerrero nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
 
var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = Math.ceil( (3*input.length) / 4.0);
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));		 

		var bytes = Math.ceil( (3*input.length) / 4.0);
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;	
	}
};/* 
	----------------------------------------------------
	Loader.js : 0.4.2 : 2012/11/09
	----------------------------------------------------
	https://github.com/mudcube/Loader.js
	----------------------------------------------------
	/// Simple setup.
	var loader = new widgets.Loader;
	
	/// More complex setup.
	var loader = new widgets.Loader({
		id: "loader",
		bars: 12,
		radius: 0,
		lineWidth: 20,
		lineHeight: 70,
		timeout: 30, // maximum timeout in seconds.
		background: "rgba(0,0,0,0.5)",
		container: document.body,
		oncomplete: function() {
			// call function once loader has completed
		},
		onstart: function() {
			// call function once loader has started	
		}
	});
	
	/// Add a new message to the queue.
	var loaderId = loader.add({
		message: "test",
		getProgress: function() { // sends progress to loader.js
			return progress; // value between 1-100
		}
	});
	
	/// Remove a specific loader message.
	loader.remove(loaderId); 
	
	/// Recenter the loader within container (run onresize)
	loader.center(); 
	
	/// Stop all loader instances.
	loader.stop(); 
*/

if (typeof (widgets) === "undefined") var widgets = {};

(function() { "use strict";

var PI = Math.PI;
var noCanvas = !document.createElement("canvas").getContext;
var fadeOutSpeed = 400;
var defaultConfig = {
	id: "loader",
	bars: 12,
	radius: 0,
	lineWidth: 20,
	lineHeight: 70,
	timeout: 0,
	display: true
};

widgets.Loader = function (configure) {
	if (noCanvas) return;
	var that = this;
	if (typeof (configure) === "string") configure = { message: configure };
	if (typeof (configure) === "boolean") configure = { display: false };
	if (typeof (configure) === "undefined") configure = {};
	configure.container = configure.container || document.body;
	if (!configure.container) return;

	/// Mixin the default configurations.
	for (var key in defaultConfig) {
		if (typeof (configure[key]) === "undefined") {
			configure[key] = defaultConfig[key];
		}
	}

	/// Setup element
	var canvas = document.getElementById(configure.id);
	if (!canvas) {
		var div = document.createElement("div");
    		var span = document.createElement("span");
		span.className = "message";
		div.appendChild(span);
		div.className = defaultConfig.id;
                div.id = configure.id + "Div"
		div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
		this.span = span;
		this.div = div;
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.id = configure.id;
		canvas.style.cssText = "opacity: 1; position: absolute; z-index: 10000;";
		div.appendChild(canvas);
		configure.container.appendChild(div);
	} else {
		this.span = canvas.parentNode.getElementsByTagName("span")[0];
		this.div = document.getElementById(configure.id+"Div");
	}

	/// Configure
	var delay = configure.delay;
	var bars = configure.bars;
	var radius = configure.radius;
	var max = configure.lineHeight + 20;
	var size = max * 2 + configure.radius * 2;
	//var windowSize = getWindowSize(configure.container);
	//var width = windowSize.width - size;
	//var height = windowSize.height - size;
	var deviceRatio = window.devicePixelRatio || 1;
	///
	canvas.width = 300 * deviceRatio;
	canvas.height = 48  * deviceRatio;
	///
	var iteration = 0;
	var ctx = canvas.getContext("2d");
	ctx.globalCompositeOperation = "lighter";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 1;
	ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

	/// Public functions.
	this.messages = {};
	this.message = function (message, onstart) {
		if (!this.interval) return this.start(onstart, message);
		return this.add({
			message: message, 
			onstart: onstart
		});
	};
	
	this.update = function(id, message, percent) {
		if (!id) for (var id in this.messages);
		if (!id) return this.message(message);
		var item = this.messages[id];
		item.message = message;
		if (typeof(percent) === "number") item.span.innerHTML = percent + "%";
		if (message.substr(-3) === "...") { // animated dots
			item._message = message.substr(0, message.length - 3);
			item.messageAnimate = [".&#160;&#160;", "..&#160;", "..."].reverse();
		} else { // normal
			item._message = message;
			item.messageAnimate = false;
		}
		///
		item.element.innerHTML = message;
	};
	
	this.add = function (conf) {
		if (typeof(conf) === "string") conf = { message: conf };
		var background = configure.background ? configure.background : "rgba(0,0,0,0.65)";
		this.span.style.cssText = "background: " + background + ";";
		this.div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
		if (this.stopPropagation) {
			this.div.style.cssText += "background: rgba(0,0,0,0.25);";
		} else {
			this.div.style.cssText += "pointer-events: none;";
		}
		///
		canvas.parentNode.style.opacity = 1;
		canvas.parentNode.style.display = "block";
		if (configure.background) this.div.style.background = configure.backgrond;
		///
		var timestamp = (new Date()).getTime();
		var seed = Math.abs(timestamp * Math.random() >> 0);
		var message = conf.message;
		///
		var container = document.createElement("div");
		container.style.cssText = transitionCSS("opacity", 500);
		var span = document.createElement("span");
		span.style.cssText = "float: right; width: 50px;";
		var node = document.createElement("span");
		node.innerHTML = message;
		///
		container.appendChild(node);
		container.appendChild(span);
		///
		var item = this.messages[seed] = {
			seed: seed,
			container: container,
			element: node,
			span: span,
			message: message,
			timeout: (conf.timeout || configure.timeout) * 1000,
			timestamp: timestamp,
			getProgress: conf.getProgress
		};
		this.span.appendChild(container);
		this.center();
		this.span.style.display = "block";
		this.update(item.seed, message);
		/// Escape event loop.
		if (conf.onstart) {
			window.setTimeout(conf.onstart, 50);
		}
		if (!this.interval) {
			if (!conf.delay) renderAnimation();
			window.clearInterval(this.interval);
			this.interval = window.setInterval(renderAnimation, 30);
		}
		/// Return identifier.
		return seed;
	};
	
	this.remove = function (seed) {
		iteration += 0.07;
		var timestamp = (new Date()).getTime();
		if (typeof(seed) === "object") seed = seed.join(":");
		if (seed) seed = ":" + seed + ":";
		/// Remove element.
		for (var key in this.messages) {
			var item = this.messages[key];
			if (!seed || seed.indexOf(":" + item.seed + ":") !== -1) {
				delete this.messages[item.seed];
				item.container.style.color = "#99ff88";
				removeChild(item);
				if (item.getProgress) item.span.innerHTML = "100%";
			}
		}
	};
	
	this.start = function (onstart, message) {
		if (!(message || configure.message)) return;
		return this.add({
			message: message || configure.message, 
			onstart: onstart
		});
	};
	
	this.stop = function () {
		this.remove();
		window.clearInterval(this.interval);
		delete this.interval;
		if (configure.oncomplete) configure.oncomplete();
		if (canvas && canvas.style) {
			this.div.style.cssText += "pointer-events: none;";
			window.setTimeout(function() {
				that.div.style.opacity = 0;
			}, 1);
			window.setTimeout(function () {
				if (that.interval) return;
				that.stopPropagation = false;
				canvas.parentNode.style.display = "none";
				ctx.clearRect(0, 0, size, size);
			}, fadeOutSpeed * 1000);
		}
	};

	this.center = function() {
            var windowSize = getWindowSize(configure.container);
            var width = windowSize.width - 300;
            var height = windowSize.height - 48;

            this.div.style.left = configure.container.offsetLeft + (width / 2) +  "px";
            this.div.style.top = configure.container.offsetTop + (height / 2) + "px";
            this.div.style.width = 300 + "px";
            this.div.style.height = 48 + "px";

            /// Center the animation within the content.
            //canvas.style.left = (width / 2) + "px";
            //canvas.style.top = (height / 2) + 30 + "px";
            //canvas.style.width = (size) + "px";
            //canvas.style.height = (size) + "px";
            //that.span.style.top = (height / 2 + +30+ size - 10) + "px";
	};
        
        
	var style = document.getElementById('widget_loader');
        
        if( ! style ) {
            style = document.createElement('style');
            style.setAttribute( "id", "widget_loader" ); 
            style.innerHTML = '\
.loader { color: #fff; position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }\
.loader span.message { font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0px; right: 0; }\
.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }\
.loader span.message div:last-child { border-bottom: none; }';
            document.head.appendChild(style);
        }
        
	/// Private functions.
	var removeChild = function(item) {
		window.setTimeout(function() { // timeout in case within same event loop.
			item.container.style.opacity = 0;
		}, 1);
		window.setTimeout(function() { // wait for opacity=0 before removing the element.
			item.container.parentNode.removeChild(item.container);
		}, 250);
	};
	var renderAnimation = function () {
		var timestamp = (new Date()).getTime();
		for (var key in that.messages) {
			var item = that.messages[key];
			var nid = iteration / 0.07 >> 0;
			if (nid % 5 === 0 && item.getProgress) {
				if (item.timeout && item.timestamp && timestamp - item.timestamp > item.timeout) {
					that.remove(item.seed);
					continue;
				}
				var progress = item.getProgress();
				if (progress >= 100) {
					that.remove(item.seed);
					continue;
				}
				item.span.innerHTML = (progress >> 0) + "%";
			}
			if (nid % 10 === 0) {
				if (item.messageAnimate) {
						var length = item.messageAnimate.length;
						var n = nid / 10 % length;
						var text = item._message + item.messageAnimate[n];
						item.element.innerHTML = text;
				}
			}
		}
		if (!key) {
			that.stop();
		}
		//
		ctx.save();
		ctx.clearRect(0, 0, size * deviceRatio, size * deviceRatio);
		ctx.scale(deviceRatio, deviceRatio);
		ctx.translate(size / 2, size / 2);
		var hues = 360 - 360 / bars;
		for (var i = 0; i < bars; i++) {
			var angle = (i / bars * 2 * PI) + iteration;
			ctx.save();
			ctx.translate(radius * Math.sin(-angle), radius * Math.cos(-angle));
			ctx.rotate(angle);
			// round-rect properties
			var x = -configure.lineWidth / 2;
			var y = 0;
			var width = configure.lineWidth;
			var height = configure.lineHeight;
			var curve = width / 2;
			// round-rect path
			ctx.beginPath();
			ctx.moveTo(x + curve, y);
			ctx.lineTo(x + width - curve, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + curve);
			ctx.lineTo(x + width, y + height - curve);
			ctx.quadraticCurveTo(x + width, y + height, x + width - curve, y + height);
			ctx.lineTo(x + curve, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - curve);
			ctx.lineTo(x, y + curve);
			ctx.quadraticCurveTo(x, y, x + curve, y);
			// round-rect fill
			var hue = ((i / (bars - 1)) * hues);
			ctx.fillStyle = "hsla(" + hue + ", 100%, 50%, 0.85)";
			ctx.fill();
			ctx.restore();
		}
		ctx.restore();
		iteration += 0.07;
	};
	//
	if (configure.display === false) return this;
	//
	this.start();
	//
	return this;
};

////

var transitionCSS = function(type, ms) {
    return '\
        -webkit-transition-property: '+type+';\
        -webkit-transition-duration: '+ms+'ms;\
        -moz-transition-property: '+type+';\
        -moz-transition-duration: '+ms+'ms;\
        -o-transition-property: '+type+';\
        -o-transition-duration: '+ms+'ms;\
        -ms-transition-property: '+type+';\
        -ms-transition-duration: '+ms+'ms;';
};

var getWindowSize = function (element) {
    if (element) {
        var width = element.offsetWidth;
        var height = element.offsetHeight;
    } else {
        if (window.innerWidth && window.innerHeight) {
                var width = window.innerWidth;
                var height = window.innerHeight;
        } else if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
                var width = document.documentElement.offsetWidth;
                var height = document.documentElement.offsetHeight;
        } else if (document.body && document.body.offsetWidth) {
                var width = document.body.offsetWidth;
                var height = document.body.offsetHeight;
        }
    }
    return {
        width: width,
        height: height
    };
};

})();
/*
	----------------------------------------------------------
	ui/Timer : 0.1.1 : 2015-03-23 : https://sketch.io
	----------------------------------------------------------
*/

if (typeof sketch === 'undefined') sketch = {};

(function(root) { 'use strict';

root.ui = root.ui || {};
root.ui.Timer = function(opts) {
	opts = opts || {};
	///
	var that = this;
	///
	var size;
	var format;
        var customFormat;
	var container;
	var endValue;
	var value;
	///
	var RAD_DEG = 180.0 / Math.PI; // Radians to Degrees
	var DEG_RAD = 1.0 / RAD_DEG; // Degrees to Radians
        var cor1;
        var cor2;
	///
        var totalSizes = 0;
        ///
	var setParams = function(opts) {
                cor1 = opts.cor1 || '#378cff';
                cor2 = opts.cor2 || '#9cdb7d'; 
		size = opts.size || 120;
		format = opts.format || 'percent';
		container = opts.container || document.body;
		endValue = opts.endValue;
		value = opts.value || 0;
	};
	///
	var getPosition = function() {
		if (format === 'percent') {
			return {
				value: value,
				format: customFormat || 'PERCENT',
				percent: value / 100
			}
		} else if (format === 'time') {
			var elapse = (Date.now() - startTime) / 1000;
			var otime = endValue - elapse;
			var percent = elapse / endValue;
			///
			var time = Math.max(0, Math.round(otime));
			var hours = (time / 3600) >> 0;
			var minutes = ((time - (hours * 3600)) / 60) >> 0;
			var seconds = time - (hours * 3600) - (minutes * 60);
			if (seconds < 10 && minutes) seconds = '0' + seconds;
			///
			if (minutes) {
				return {
					value: minutes,
					format: 'MINUTES',
					percent: percent
				};
			} else {
				return {
					value: seconds,
					format: 'SECONDS',
					percent: percent
				};
			}
		}
	};

	var gradient = ['#9cdb7d', '#99d97f', '#97d782', '#95d684', '#93d487', '#91d38a', '#8fd18c', '#8dcf8f', '#8bce91', '#89cc94', '#87cb97', '#85c999', '#83c89c', '#81c69e', '#7fc4a1', '#7dc3a4', '#7bc1a6', '#79c0a9', '#77beab', '#75bcae', '#73bbb1', '#71b9b3', '#6fb8b6', '#6db6b8', '#6bb5bb', '#69b3be', '#67b1c0', '#65b0c3', '#63aec5', '#61adc8', '#5fabcb', '#5daacd', '#5ba8d0', '#59a6d2', '#57a5d5', '#55a3d8', '#53a2da', '#51a0dd', '#4f9edf', '#4d9de2', '#4b9be5', '#499ae7', '#4798ea', '#4597ec', '#4395ef', '#4193f2', '#3f92f4', '#3d90f7', '#3b8ff9', '#398dfc', '#378cff'];
	///

        var calcGrad = function (cor1, cor2, progresso) {
            var r1 = parseInt( cor1.substr( 1, 2 ), 16 );
            var g1 = parseInt( cor1.substr( 3, 2 ), 16 );
            var b1 = parseInt( cor1.substr( 5, 2 ), 16 );
            var r2 = parseInt( cor2.substr( 1, 2 ), 16 );
            var g2 = parseInt( cor2.substr( 3, 2 ), 16 );
            var b2 = parseInt( cor2.substr( 5, 2 ), 16 );
            
            var r = (Math.round( (r2 - r1) * progresso) + r1).toString(16);
            var g = (Math.round( (g2 - g1) * progresso) + g1).toString(16);
            var b = (Math.round( (b2 - b1) * progresso) + b1).toString(16);
            
            return "#" + r + g + b;
        };

        
	var requestId;
	var pulse = 0;
	var startTime = Date.now(); // 'time' format
	var render = function() {
		var obj = getPosition();
		///
		//ctx.fillStyle = gradient[Math.round((1.0 - obj.percent) * 50)];
                ctx.fillStyle = calcGrad( cor1, cor2, obj.percent );
		///
// 		pulse ++;
		///
		var startAngle = -360 * DEG_RAD;
		var endAngle = obj.percent * 360 * DEG_RAD;
		var outerRadius = size / 2.0 + (pulse % 20);
		var innerRadius = size / 2.0 * 0.61 + (pulse % 20);
		///
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.save();
		///
		ctx.beginPath()
		ctx.arc(outerRadius, outerRadius, outerRadius, startAngle, endAngle, false);
		ctx.arc(outerRadius, outerRadius, innerRadius, endAngle, startAngle, true);
		ctx.globalAlpha = 0.25;
		ctx.fill();
		///
		startAngle += 360 * DEG_RAD;
		///
		ctx.beginPath()
		ctx.arc(outerRadius, outerRadius, outerRadius, startAngle, endAngle, false);
		ctx.arc(outerRadius, outerRadius, innerRadius, endAngle, startAngle, true);
		ctx.globalAlpha = 1.0;
		ctx.fill();
		///
		var ratio = size / 260;
		var fontSize = ratio * 20;
		var fontFamily = '"Trebuchet MS", Arial, Helvetica, sans-serif';
		ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		ctx.fillText(obj.format, outerRadius, outerRadius + ratio * 14);
		///
		var fontSize = ratio * 46;
		ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
		ctx.fillStyle = '#ffffff';
		ctx.fillText(obj.value+'%', outerRadius, outerRadius - ratio * 44);
		ctx.restore();
		///
		if (obj.percent < 1.0) {
                    requestId = requestAnimationFrame(render);
		}
	};
	///
	setParams(opts);
	///
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	///
	var parent = document.createElement('div');
	parent.style.display = 'none';
	parent.className = 'sk-timer';
	parent.appendChild(canvas);
	///
	container.appendChild(parent);
	///
	if (opts.onstart) {
		setTimeout(opts.onstart, 250);
	}

	/* Public 
	---------------------------------------------------------- */
	that.reset = function() {
		setParams(opts);
	};

	that.destroy = function() {
		container.removeChild(canvas);
	};

	that.hidden = false;

	that.hide = function(callback) {
		cancelAnimationFrame(requestId);
		///
		that.hidden = true;
		parent.style.transition = 'opacity .35s';
		parent.style.opacity = 0;
		setTimeout(function() {
			parent.style.display = 'none';
			callback && callback();
		}, 350);
	};

	that.setFormat = function(format) {
		customFormat = format;
	};
        
	that.setValue = function(percent) {
		cancelAnimationFrame(requestId);
		///
		that.hidden = false;
		parent.style.display = 'block';
		parent.style.opacity = 1.0;
		///
		if ((value = Math.ceil(percent)) >= 100) {
			that.hide();
		}
		///
		render();
	};

	addStyleSheet();

	return that;

};

var addStyleSheet = function() {
	if (document.getElementById('sk-timer-stylesheet') == null) {
		var style = document.createElement('style');
		style.id = 'sk-timer-stylesheet';
		style.innerHTML = '.sk-timer {\
				position: absolute;\
				z-index: 1000;\
				top: 0;\
				left: 0;\
				width: 100%;\
				height: 100%;\
			}\
			.sk-timer canvas {\
				border: 3px solid #000;\
				border-radius: 50%;\
				background: #000;\
				margin: auto;\
				position: absolute;\
				top: 0;\
				left: 0;\
				right: 0;\
				bottom: 0;\
			}\
		';
		document.head.appendChild(style);
	}
};

})(sketch);