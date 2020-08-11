#!/bin/sh

v_abcx=5.45
v_app=0.3
assets_folder="/home/flavio/Projetos/diatonic-app/app/src/main/assets"

FILES="\
./app.html ./app/libapp_${v_app}-min.js ./app/libapp_${v_app}-min.css ./abcxjs/abcxjs_${v_abcx}-min.js ./diatonic/diatonic_${v_abcx}-min.js \
./file/filemanager_${v_abcx}-min.js ./css/styles4abcx_${v_abcx}-min.css  ./jquery/jquery-1.11.1.min.js ./jslib/MIDI_5.25-min.js ./jslib/proto_noconflict.js \
./jslib/html5kellycolorpicker.min.js"

FOLDERS="./accordions ./chords ./songs ./practices ./fontsGoogle ./fontsIco ./images ./languages ./privacidade ./privacy ./soundfont ./html"

rm -rf $assets_folder/*

for f in $FILES
do
	echo "Processing $f"
    cp --parents $f $assets_folder/
done

for f in $FOLDERS
do
	echo "Processing $f"
    cp -pr $f $assets_folder/
done
