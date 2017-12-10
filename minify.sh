#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.y), $1 provided"
echo "Concatenating all files..."

cat src/properties.js src/translate.js src/media.js src/mapa.js src/estudio.js  > tmp\site-part.js
cat tmp\site-part.js src/partgen.js src/partedit.js src/tabgen.js src/t2p_parser.js src/p2t_parser.js src/repertorio.js > tmp/site.js

cat css/help.css css/media.css css/mapa.css css/studio.css > tmp/site.css

cp tmp/site.css site/site_$1.css
cp tmp/site.js  site/site_$1.js

echo "Compressing Site $1..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o  site/site_$1-min.js tmp/site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o  site/site_$1-min.css tmp/site.css
