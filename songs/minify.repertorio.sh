#!/bin/sh

#restaurar um conjunto de arquivos alterados por engano
#for f in $songs_folder/minuano/*.abcx; do  git restore $f; fi; done

#remover "BOM mark" e garantir newline ao final do arquivo
#sed -i '1s/^\xEF\xBB\xBF//' orig.txt

songs_folder="."

echo "Preparando repertorio minuano..."
for f in $songs_folder/minuano/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/minuano/*.abcx > $songs_folder/minuano.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio club..."
for f in $songs_folder/club-br/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/club-br/*.abcx > $songs_folder/club-br.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Corona GCF..."
for f in $songs_folder/corona-gcf/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/corona-gcf/*.abcx > $songs_folder/corona-gcf.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Corona ADG..."
for f in $songs_folder/corona-adg/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/corona-adg/*.abcx > $songs_folder/corona-adg.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Corona BEA..."
for f in $songs_folder/corona-bea/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/corona-bea/*.abcx > $songs_folder/corona-bea.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Transportada..."
for f in $songs_folder/transportada/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/transportada/*.abcx > $songs_folder/transportada.repertorio.abcx

#remover "BOM mark" e garantir newline ao final do arquivo
echo "Preparando repertorio Dino Baffetti..."
for f in $songs_folder/dinobaffetti-32-12/*.abcx; do sed -i '1s/^\xEF\xBB\xBF//' $f; if [ "$(tail -c 1 $f)" != "" ]; then echo '' >> $f; fi; done
cat $songs_folder/dinobaffetti-32-12/*.abcx > $songs_folder/dinobaffetti-32-12.repertorio.abcx