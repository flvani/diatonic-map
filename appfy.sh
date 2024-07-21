#!/bin/sh

v_abcx=6.45
v_app=2.24.6
assets_folder="/home/flavio/Projetos/diatonic-app/app/src/main/assets"

FILES="\
    ./app.html ./lib/libapp_${v_app}-min.js ./lib/libapp_${v_app}-min.css \
    ./abcxjs/abcxjs_${v_abcx}-min.js ./diatonic/diatonic_${v_abcx}-min.js \
    ./file/filemanager_${v_abcx}-min.js ./css/modal.css ./css/styles4abcx_${v_abcx}-min.css \
    ./jslib/jquery-3.7.1.min.js ./jslib/MIDI_5.25-min.js \
    ./jslib/enjoyhint.min.js jslib/jquery-scrollto-2.1.3.min.js jslib/kinetic-v5.1.0.js css/enjoyhint.css\
    ./jslib/proto_noconflict.js ./jslib/html5kellycolorpicker.min.js ./jslib/waterbug.js"

FOLDERS="\
    ./accordions ./chords ./practices ./fontsGoogle ./fontsIco ./images \
    ./languages ./privacy ./soundfont ./html"

rm -rf $assets_folder/*
mkdir -p $assets_folder/songs
#mkdir -p $assets_folder/abcxjs
#mkdir -p $assets_folder/diatonic
#mkdir -p $assets_folder/file
#mkdir -p $assets_folder/css

cp -pr songs/*repertorio.abcx $assets_folder/songs/

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
