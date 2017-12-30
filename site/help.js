/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function printHelp(p) {
    
    if (window.matchMedia) {
        
        var frm = document.getElementById("helpFrame");
        var doc = document.getElementById("helpContainer");
        var hed = document.getElementById("helpHeader");
        var mTop = doc.style.top;
        var bWid = doc.style.borderWidth ;
        var pad = doc.style.padding;
        var fheight = frm.style.height;
        var foverflowY = frm.style.overflowY; 
        hed.style.opacity = 0;
        doc.style.top = '0px';
        doc.style.borderWidth = '0px';
        doc.style.padding = '0px';
        frm.style.height = 'auto';
        frm.style.overflowY = 'hidden';
        
        var printMedia = window.matchMedia('print');
        
        printMedia.addListener(function(pm) {
            if( ! pm.matches ) {
                frm.style.height = fheight;
                frm.style.overflowY = foverflowY;
                doc.style.padding = pad;
                doc.style.top = mTop;
                doc.style.borderWidth = bWid;
                hed.style.opacity = 1;
            }
        });
        
        window.print();
    }    
};

function gotoSite(p) {
   ga('send', 'event', 'Ajuda', 'goto-site', p);
   document.location='..';
};

function resizeHelp() {
    var height = document.documentElement.clientHeight;
    var h = document.getElementById( 'helpHeader');
    var c = document.getElementById( 'helpFrame');

    c.style.height = (height - h.clientHeight) -20 + "px";
};
