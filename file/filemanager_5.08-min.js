if(!window.FILEMANAGER){window.FILEMANAGER={reader:new FileReader(),files:[],currName:null,currExtension:"abcx",type:"text"};FILEMANAGER.reader.onload=function(a){FILEMANAGER.loaded++;FILEMANAGER.now=true;FILEMANAGER.files.push({fileName:FILEMANAGER.currName,extension:FILEMANAGER.currExtension,type:FILEMANAGER.type,content:a.target.result})}}FILEMANAGER.managedResources={};FILEMANAGER.total=0;FILEMANAGER.loaded=0;FILEMANAGER.timeouts=0;FILEMANAGER.timeoutInterval=50;FILEMANAGER.maxTimeouts=400;FILEMANAGER.errors="";FILEMANAGER.success="";FILEMANAGER.register=function(a){FILEMANAGER.total++;if(FILEMANAGER.managedResources[a]){FILEMANAGER.managedResources[a].qtde++}else{FILEMANAGER.managedResources[a]={qtde:1,succ:0,fail:0}}};FILEMANAGER.deregister=function(b,a){if(FILEMANAGER.managedResources[b]){if(a){FILEMANAGER.loaded++;FILEMANAGER.managedResources[b].succ++}else{FILEMANAGER.managedResources[b].fail++}}};FILEMANAGER.getPercent=function(){return FILEMANAGER.total?FILEMANAGER.loaded/FILEMANAGER.total*100:0};FILEMANAGER.checkResources=function(){var a=0;for(var b in FILEMANAGER.managedResources){var c=FILEMANAGER.managedResources[b];if(c.qtde>0&&(c.succ+c.fail)<c.qtde&&FILEMANAGER.timeouts<FILEMANAGER.maxTimeouts){FILEMANAGER.timeouts++;return -1}}for(var b in FILEMANAGER.managedResources){var c=FILEMANAGER.managedResources[b];if(c.qtde>0&&(c.fail>0||((c.succ+c.fail)<c.qtde))){FILEMANAGER.errors+="\tRecurso "+b+" teve problemas ao carregar ("+c.qtde+"/"+c.succ+"/"+c.fail+").\n";a=1}else{FILEMANAGER.success+="\tRecurso "+b+": "+c.qtde+" ok...\n"}}return a};FILEMANAGER.waitResources=function(a){switch(FILEMANAGER.checkResources()){case -1:a.onProgress&&a.onProgress({perc:FILEMANAGER.getPercent()});window.setTimeout(function(){FILEMANAGER.waitResources(a)},FILEMANAGER.timeoutInterval);break;case 1:a.onLoad&&a.onLoad(false);break;case 0:a.onProgress&&a.onProgress({perc:FILEMANAGER.getPercent(),timeouts:FILEMANAGER.timeouts,success:FILEMANAGER.success});a.onLoad&&a.onLoad(true)}};FILEMANAGER.loadLocalFiles=function(b,a){var c=b.target.files;FILEMANAGER.now=true;FILEMANAGER.loaded=0;FILEMANAGER.files=[];FILEMANAGER.interval=window.setInterval(function(){FILEMANAGER.doLoad(a,c)},100)};FILEMANAGER.doLoad=function(a,b){if(FILEMANAGER.loaded===b.length){window.clearInterval(FILEMANAGER.interval);a()}else{if(FILEMANAGER.now){FILEMANAGER.currName=b[FILEMANAGER.loaded].name;var c=b[FILEMANAGER.loaded].name.split(".");FILEMANAGER.currExtension=c[c.length-1];if(b[FILEMANAGER.loaded].type.substr(0,5)==="image"){FILEMANAGER.reader.readAsDataURL(b[FILEMANAGER.loaded]);FILEMANAGER.type="image"}else{FILEMANAGER.reader.readAsText(b[FILEMANAGER.loaded]);FILEMANAGER.type="text"}FILEMANAGER.now=false}}};FILEMANAGER.download=function(a,d){var c=function(f){var e=document.createEvent("MouseEvents");e.initMouseEvent("click",true,false,self,0,0,0,0,0,false,false,false,false,0,null);return f.dispatchEvent(e)};var b=function(g,f){var h=new Blob([g],{type:"text/plain"});var e=document.createElement("a");e.download=f;e.href=window.URL.createObjectURL(h);e.dataset.downloadurl=["text/plain",e.download,e.href].join(":");e.draggable=true;e.classList.add("dragout");return e};c(b(d,a))};FILEMANAGER.requiredFeaturesAvailable=function(){if(window.File&&window.FileReader&&window.FileList&&window.Blob){return true}else{return false}};FILEMANAGER.html5StorageSupport=function(){try{return"localStorage" in window&&window.localStorage!==null}catch(a){return false}};FILEMANAGER.saveLocal=function(a,b){localStorage.setItem(a,b)};FILEMANAGER.loadLocal=function(a){return localStorage.getItem(a)};FILEMANAGER.removeLocal=function(a){return localStorage.removeItem(a)};