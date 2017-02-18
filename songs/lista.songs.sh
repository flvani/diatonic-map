grep X:"$1" *.abcx | awk -F":" '{print $3, $1}' | sort -k1
