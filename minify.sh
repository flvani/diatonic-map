#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.y), $1 provided"
echo "Concatenating all files..."

cat javascripts/language.js draggable/draggable.js site/mapa.js site/estudio.js > tmp/site.js

cat css/draggable.css css/mapa.css css/studio.css > tmp/site.css

echo "Compressing Site $1..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_$1-min.js tmp/site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_$1-min.css tmp/site.css
