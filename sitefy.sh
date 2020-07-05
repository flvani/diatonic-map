#!/bin/sh

#tar czvf site.tar.gz ./site ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
#                     ./css ./html ./src ./languages ./diatonic ./file ./practices ./songs ./abcxjs ./jslib ./jquery \
#                     ./.htaccess ./mapa.html ./index.html ./mapa-5.00.html ./mapa-debug.html



FILES="./site ./soundfont ./ace4abcx ./fontsGoogle ./fontsIco ./chords ./accordions ./tabs ./images \
       ./css ./html ./src ./languages ./diatonic ./file ./practices ./repertorio ./songs ./abcxjs ./jslib ./jquery \
       ./.htaccess ./mapa.html ./index.html ./mapa-5.00.html ./mapa-debug.html"

for f in $FILES
do
	echo "Processing $f"
    rm -r ../site-hostinger/$f
    cp -pr $f ../site-hostinger/
done