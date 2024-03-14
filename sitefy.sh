#!/bin/sh

assets_folder="../site-hostinger"

FILES="./privacy ./lib ./app ./mapa ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
       ./css ./html ./src ./languages ./diatonic ./file ./practices ./repertorio ./tablature ./abcxjs ./jslib  \
       ./.htaccess ./index.html ./mapa.html ./mapa-debug.html ./app.html ./app-debug.html"

rm -rf $assets_folder/*
mkdir -p $assets_folder/songs 
cp -pr songs/*repertorio.abcx $assets_folder/songs/

for f in $FILES
do
	echo "Processing $f"
    cp -pr $f $assets_folder/
done

zip -r x10.zip  ../$assets_folder -x ../$assets_folder/.git/**\*

#ftp ftp://phvjtadr:Drao1317@ftp.diatonicmap.com.br

