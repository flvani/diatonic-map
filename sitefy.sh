#!/bin/sh


FILES="./privacy ./privacidade ./app ./site ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
       ./css ./html ./src ./languages ./diatonic ./file ./practices ./repertorio ./songs ./abcxjs ./jslib ./jquery \
       ./.htaccess ./index.html ./mapa-debug.html ./app.html ./app-debug.html"

for f in $FILES
do
	echo "Processing $f"
    rm -r ../site-hostinger/$f
    cp -pr $f ../site-hostinger/
done
