
@echo "Concatenating all files..."
@echo .

@IF [%1]==[] echo Informe o numero da versao. Formato x.xx
@IF [%1]==[] goto :fim

copy /b/y javascripts\language.js+draggable\draggable.js+site\mapa.js+site\estudio.js tmp\site.js
copy /b/y css\draggable.css+css\mapa.css+css\studio.css tmp\site.css

@set versao=%1

@echo Compressing Site %versao% ...
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_%versao%-min.js tmp\site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_%versao%-min.css tmp\site.css

:fim