#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 2 ] || die "Informe como argumentos, 
   - o número de versão do Site, no formato (x.y)
   - o número de versão do App, no formato (x.y.z)"

echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Site Version number argument required (x.y), $1 provided"
echo $2 | grep -E -q '^[0-9]\.[0-9]+\.[0-9]+$' || die "App Version number argument required (x.y.z), $2 provided"

echo "Concatenating all files..."

//./minify.repertorio.sh
echo "Ignorando a concatenação dos arquivos de repertório..."


echo "Concatenating site files..."
cat src/properties.js src/translate.js src/media.js src/modal.js src/mapa.js src/estudio.js > tmp/site-part.js
cat tmp/site-part.js src/partgen.js src/partedit.js src/tabgen.js src/t2p_parser.js src/p2t_parser.js src/repertorio.js > tmp/site.js

cat css/media.css css/mapa.css > tmp/site.css

cp tmp/site.css site/site_$1.css
cp tmp/site.js  site/site_$1.js

echo "Concatenating app files..."
cat src/properties.js src/translate.js src/media.js src/modal.js src/appview.js src/app.js src/app.tour.js > tmp/libapp.js

cat css/media.css css/app.css > tmp/libapp.css

cp tmp/libapp.css app/libapp_$2.css
cp tmp/libapp.js  app/libapp_$2.js

echo "Compressing Site $1..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  site/site_$1-min.js tmp/site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  site/site_$1-min.css tmp/site.css

echo "Compressing Lib App $2..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  app/libapp_$2-min.js tmp/libapp.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  app/libapp_$2-min.css tmp/libapp.css
