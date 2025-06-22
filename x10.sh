#!/bin/sh

source ./publicar

assets_folder="./site.x10"

FILES="app|* mapa|* lib|* ace4abcx|* css|* fontsGoogle|* fontsIco|* html|* .well-known|*
       accordions|* songs|*.abcx chords|* practices|* tabs|* images|*.* images/accordions|*.* 
       abcxjs|* diatonic|* file|* jslib|*
       languages|* privacy|* privacy/terms|* privacy/about|* src|* soundfont|* repertorio|* tablature|*
       .|.htaccess .|app.html .|app-debug.html .|index.html .|mapa.html .|mapa-debug.html .|robots.txt"

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

export HOST='diatonicmap.com.br'
export USER='flvani@diatonicmap.x10.mx'

if [ -z "$HOST" ] || [ -z "$USER" ] || [ -z "$PASSWD" ]; then
    echo "Informe valores para as tres variávieis HOST, USER e PASSWD"
else
    cd $assets_folder
    ln -s privacy privacidade
    zip -r ../site.x10.zip  . -x .$assets_folder/.git/**\*
    cd - 

    ftp -nv $HOST<<EOF!
    quote USER $USER
    quote PASS $PASSWD
    binary
    put site.x10.zip
    quit
EOF!
fi

