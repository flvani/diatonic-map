
@echo "Concatenating all files..."
@echo .

@IF [%1]==[] echo Informe o numero da versao. Formato x.xx
@IF [%1]==[] goto :fim

copy /b/y languages\language.js+site\mapa.js+site\estudio.js tmp\site-part.js
copy /b/y tmp\site-part.js+tab2part\t2p_parser.js+part2tab\p2t_parser.js tmp\site.js

copy /b/y css\help.css+css\mapa.css+css\studio.css tmp\site.css

@set versao=%1

copy /b/y tmp\site.css site_%versao%.css
copy /b/y tmp\site.js site_%versao%.js


@echo Compressing Site %versao% ...
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_%versao%-min.js tmp\site.js
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o site_%versao%-min.css tmp\site.css

:fim