#!/bin/sh

assets_folder="./site.x10"

FILES="app|* mapa|* lib|* ace4abcx|* css|* fontsGoogle|* fontsIco|* html|* 
       accordions|* songs|*.abcx chords|* practices|* tabs|* images|*.* images/accordions|*.* 
       abcxjs|* diatonic|* file|* jslib|*
       languages|* privacy|* privacy/terms|* privacy/about|* src|* soundfont|* repertorio|* tablature|*
       .|.htaccess .|app.html .|app-debug.html .|index.html .|mapa.html .|mapa-debug.html"

#mkdir -p $assets_folder/songs 
#cp -pr songs/*repertorio.abcx $assets_folder/songs/

#rm -rf $assets_folder/*

for f in $FILES
do
    dire=$( echo $f | awk -F"|" '{print $1}' )
    file=$( echo $f | awk -F"|" '{print $2}' )

	echo "Processing $dire/$file";

    if  [ -d $dire ];  then
       ( ! [ -e $assets_folder/$dire ] ) &&  mkdir -p $assets_folder/$dire
        cp -pu $dire/$file $assets_folder/$dire/
    fi
done

cd $assets_folder
zip -r ../site.x10.zip  . -x .$assets_folder/.git/**\*
cd - 

#ftp 
ftp ftp://phvjtadr:senha@diatonicmap.com.br << EOF!
cd /tmp
bin
put site.x10.zip
EOF!


