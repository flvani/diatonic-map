#!/bin/sh

assets_folder="../site-hostinger"

FILES="./privacy ./privacidade ./app ./site ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
       ./css ./html ./src ./languages ./diatonic ./file ./practices ./repertorio ./abcxjs ./jslib ./jquery \
       ./.htaccess ./index.html ./mapa-debug.html ./app.html ./app-debug.html"

rm -rf $assets_folder/*
mkdir -p $assets_folder/songs 
cp -pr songs/*repertorio.abcx $assets_folder/songs/

for f in $FILES
do
	echo "Processing $f"
    cp -pr $f $assets_folder/
done
