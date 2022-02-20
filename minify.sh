#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 2 ] || die "Call with a site version number and app version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Site Version number argument required (x.y), $1 provided"
echo $2 | grep -E -q '^[0-9]\.[0-9]\.[0-9]+$' || die "App Version number argument required (x.y.z), $2 provided"
echo "Concatenating all files..."

#restaurar um conjunto de arquivos alterados por engano
#for f in songs/minuano/*.abcx; do  git restore $f; fi; done

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio minuano..."
for f in songs/minuano/*.abcx; do sed -i $'s/^\uFEFF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/minuano/*.abcx > songs/minuano.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio club..."
for f in songs/club-br/*.abcx; do sed -i $'s/^\uFEFF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/club-br/*.abcx > songs/club-br.repertorio.abcx

echo "Concatenating site files..."
cat src/properties.js src/translate.js src/media.js src/mapa.js src/estudio.js  > tmp/site-part.js
cat tmp/site-part.js src/partgen.js src/partedit.js src/tabgen.js src/t2p_parser.js src/p2t_parser.js src/repertorio.js > tmp/site.js

cat css/media.css css/mapa.css > tmp/site.css

cp tmp/site.css site/site_$1.css
cp tmp/site.js  site/site_$1.js

echo "Concatenating app files..."
cat src/properties.js src/translate.js src/media.js src/appview.js src/app.js  > tmp/libapp.js

#tirei css/modal.css 
cat css/media.css css/app.css > tmp/libapp.css

cp tmp/libapp.css app/libapp_$2.css
cp tmp/libapp.js  app/libapp_$2.js

echo "Compressing Site $1..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  site/site_$1-min.js tmp/site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  site/site_$1-min.css tmp/site.css

echo "Compressing Lib App $2..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  app/libapp_$2-min.js tmp/libapp.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  app/libapp_$2-min.css tmp/libapp.css
