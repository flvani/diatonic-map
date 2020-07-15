grep X:$1 $( grep "^F:" *.abcx | awk -F ":" '{print $1}' ) |  awk -F":" '{print $1}' | sort -uk1 
