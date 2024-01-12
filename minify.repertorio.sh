#!/bin/sh

#restaurar um conjunto de arquivos alterados por engano
#for f in songs/minuano/*.abcx; do  git restore $f; fi; done

#remover "BOM mark" e garantir newline ao final do arquivo
#sed -i '1s/^\xEF\xBB\xBF//' orig.txt

echo "Preparando repertorio minuano..."
for f in songs/minuano/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/minuano/*.abcx > songs/minuano.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio club..."
for f in songs/club-br/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/club-br/*.abcx > songs/club-br.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Corona GCF..."
for f in songs/corona-gcf/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/corona-gcf/*.abcx > songs/corona-gcf.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Corona ADG..."
for f in songs/corona-adg/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/corona-adg/*.abcx > songs/corona-adg.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Transportada..."
for f in songs/transportada/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/transportada/*.abcx > songs/transportada.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Dino Baffetti..."
for f in songs/dinobaffetti-32-12/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat songs/dinobaffetti-32-12/*.abcx > songs/dinobaffetti-32-12.repertorio.abcx