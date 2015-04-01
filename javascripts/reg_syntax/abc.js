editAreaLoader.load_syntax["abc"] = {
	'DISPLAY_NAME' : 'ABCX'
	,'COMMENT_SINGLE' : {1 : '%' }
	,'COMMENT_MULTI' : {}
	,'QUOTEMARKS' : { 1: '"' }
	,'KEYWORD_CASE_SENSITIVE' : true
	,'KEYWORDS' : {
            'constants' : [
                'accordionTab', 'treble', 'bass', 'tenor', 'alto', 'none' 
               ,'merge', 'up', 'down', 'middle', 'm', 'tab', 'tablatura', 'tablature', 'melodia', 'baixo', 'baixos', 'melody'
            ]
            ,'types' : [
                'types'
//                'A:', 'B:', 'C:', 'D:', 'F:', 'G:',  'H:', 'I:',
//                'K:', 'L:', 'M:', 'N:', '0:', 'P:', 'Q:', 'R:', 'S:',
//                'T:', 'U:', 'V:', 'X:', 'Z:'
                ]
            ,'statements' : [
                'statements'
//                'clef' ,'cl' ,'staves' ,'stave' ,'stv' ,'brace' ,'brc' ,'bracket' ,'brk' ,'name' 
//               ,'nm' ,'subname' ,'sname' ,'snm','stems', 'stem' ,'gchords' ,'gch' ,'space' ,'spc' ,'scale' ,'transpose', 'style'
            ]
            ,'keywords' : [
               '\_' // parece que há um problema em colocar o '_' como operador
            ]
	}
	,'OPERATORS' :[
            '-', '+', '\'', ',', '/', '^','=' 
	]
	,'DELIMITERS' :[
            '(', ')', '[', ']', '{', '}', '|', '!', ':'
	]
	,'REGEXPS' : {
		'directives' : {
			'search' : '()(\%\%[^\r\n]*)()'
			,'class' : 'directives'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'words' : {
			'search' : '()([Ww]\:[^\r\n]*)()'
			,'class' : 'words'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'macros' : {
			'search' : '()([ms]\:[^\r\n]*)()'
			,'class' : 'macros'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'comments' : {
			'search' : '()([r]\:[^\r\n]*)()'
			,'class' : 'comments'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'fields' : {
			'search' : '( |\n|\r|\t)([ABCDEFGHIJKLMNOPQRSTUVXYZ]\:)()'
			,'class' : 'fields'
			,'modifiers' : 'g'
			,'execute' : 'before' // before or after
		}
		,'attributes' : {
			'search' : '( |\n|\r|\t)([^ \r\n\t=]+)(=)'
			,'class' : 'attributes'
			,'modifiers' : 'g'
			,'execute' : 'before' // before or after
		}
	}
	,'STYLES' : {
		'COMMENTS': 'color: #AAAAAA;'
		,'QUOTESMARKS': 'color: #FF0000;'
		,'KEYWORDS' : {
                    'constants' : 'color: #60CA00;'
                    ,'types' : 'color: #60CA00;'
                    ,'statements' : 'color: #60CA00;'
                    ,'keywords' : 'color: #0000FF;'
		}
		,'OPERATORS' : 'color: #0000FF;'
		,'DELIMITERS' : 'color: #FF00FF;'
		,'REGEXPS' : {
                     'attributes': 'color: #0000FF;'
                    ,'fields': 'color: #0000FF;'
                    ,'directives' : 'color: #009900;'
                    ,'macros' : 'color: #FF0000;'
                    ,'wordss' : 'color: #994400;'
                    ,'comments' : 'color: #AAAAAA;'
		}
	}
};
