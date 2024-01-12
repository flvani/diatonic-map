#!/bin/sh


FILES="./privacy ./privacidade ./app ./site ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
       ./css ./html ./src ./languages ./diatonic ./file ./practices ./repertorio ./abcxjs ./jslib ./jquery \
       ./.htaccess ./index.html ./mapa-debug.html ./app.html ./app-debug.html"

for f in $FILES
do
	echo "Processing $f"
    rm -r ../site-hostinger/$f
    cp -pr $f ../site-hostinger/
done

mkdir -p ../site-hostinger/songs 
rm ../site-hostinger/songs/*
cp -pr songs/*repertorio.abcx ../site-hostinger/songs/