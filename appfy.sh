#!/bin/sh

v_abcx=6.18
v_app=2.1.18
assets_folder="/home/flavio/Projetos/diatonic-app/app/src/main/assets"

FILES="\
./app.html ./app/libapp_${v_app}-min.js ./app/libapp_${v_app}-min.css \
./abcxjs/abcxjs_${v_abcx}-min.js ./diatonic/diatonic_${v_abcx}-min.js \
./file/filemanager_${v_abcx}-min.js ./css/modal.css ./css/styles4abcx_${v_abcx}-min.css \
./jquery/jquery-3.6.0.min.js ./jslib/MIDI_5.25-min.js \
./jslib/proto_noconflict.js ./jslib/html5kellycolorpicker.min.js ./jslib/waterbug.js"

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
