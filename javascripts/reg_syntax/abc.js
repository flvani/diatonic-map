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
                'clef' ,'cl' ,'staves' ,'stave' ,'stv' ,'brace' ,'brc' ,'bracket' ,'brk' ,'name' 
               ,'nm' ,'subname' ,'sname' ,'snm','stems', 'stem' ,'gchords' ,'gch' ,'space' ,'spc' ,'scale' ,'transpose', 'style'
            ]
            ,'statements' : [
                'A:', 'B:', 'C:', 'D:', 'F:', 'G:',  'H:', 'I:',
                'K:', 'L:', 'M:', 'N:', '0:', 'P:', 'Q:', 'R:', 'S:',
                'T:', 'U:', 'V:', 'X:', 'Z:'
            ]
            ,'keywords' : [
                '_','^','='
            ]
	}
	,'OPERATORS' :[
            '-', '+', '\'', ',', '/' 
	]
	,'DELIMITERS' :[
            '(', ')', '[', ']', '{', '}', '|', '!', ':'
	]
	,'REGEXPS' : {
		'precompiler' : {
			'search' : '()(\%\%[^\r\n]*)()'
			,'class' : 'directive'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'precompilerstring' : {
			'search' : '()(\[wW]\:[^\r\n]*)()'
			,'class' : 'words'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'macro' : {
			'search' : '()(\[ms]\:[^\r\n]*)()'
			,'class' : 'macro'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
		,'comment' : {
			'search' : '()(\[r]\:[^\r\n]*)()'
			,'class' : 'comment'
			,'modifiers' : 'g'
			,'execute' : 'before'
		}
	}
	,'STYLES' : {
		'COMMENTS': 'color: #AAAAAA;'
		,'QUOTESMARKS': 'color: #FF0000;'
		,'KEYWORDS' : {
                    'constants' : 'color: #0000FF;'
                    ,'types' : 'color: #0000EE;'
                    ,'statements' : 'color: #60CA00;'
                    ,'keywords' : 'color: #48BDDF;'
		}
		,'OPERATORS' : 'color: #FF00FF;'
		,'DELIMITERS' : 'color: #0000FF;'
		,'REGEXPS' : {
                    'directive' : 'color: #009900;'
                    ,'macro' : 'color: #FF0000;'
                    ,'words' : 'color: #994400;'
                    ,'comment' : 'color: #AAAAAA;'
		}
	}
};
