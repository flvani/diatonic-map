#!/bin/sh

# die () {
#     echo >&2 "$@"
#     exit 1
# }

# [ "$#" -eq 2 ] || die "Informe como argumentos, 
#    - o número de versão do Site, no formato (x.y)
#    - o número de versão do App, no formato (x.y.z)"

# echo $vsite | grep -E -q '^[1-9]\.[0-9]+$' || die "Site Version number argument required (x.y), $vsite provided"
# echo $vapp | grep -E -q '^[0-9]\.[0-9]+\.[0-9]+$' || die "App Version number argument required (x.y.z), $vapp provided"

vsite=6.29
vapp=2.24.6

echo "Concatenating all files..."

# ./minify.repertorio.sh
echo "Ignorando a concatenação dos arquivos de repertório..."


echo "Concatenating site files..."
cat src/properties.js src/translate.js src/media.js src/modal.js src/mapa.js src/estudio.js > tmp/site-part.js
cat tmp/site-part.js src/partgen.js src/partedit.js src/tabgen.js src/t2p_parser.js src/p2t_parser.js src/repertorio.js src/mapa.tour.js > tmp/site.js

cat css/policy-terms.css css/enjoyhint.extras.css css/media.css css/mapa.css > tmp/site.css

cp tmp/site.css lib/site_$vsite.css
cp tmp/site.js  lib/site_$vsite.js

echo "Concatenating app files..."
cat src/properties.js src/translate.js src/media.js src/modal.js src/appview.js src/app.js src/app.tour.js > tmp/libapp.js

cat css/policy-terms.css css/enjoyhint.extras.css css/media.css css/app.css > tmp/libapp.css

cp tmp/libapp.css lib/libapp_$vapp.css
cp tmp/libapp.js  lib/libapp_$vapp.js

echo "Compressing Site $vsite..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  lib/site_$vsite-min.js tmp/site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  lib/site_$vsite-min.css tmp/site.css

echo "Compressing Lib App $vapp..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  lib/libapp_$vapp-min.js tmp/libapp.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.8.jar  --line-break 7000 -o  lib/libapp_$vapp-min.css tmp/libapp.css
