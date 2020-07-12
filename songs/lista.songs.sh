grep X:"$1" *.abcx | awk -F":" '{print $3, $1}' | sort -k1
grep X:"h$1" *.abcx | awk -F":" '{print $3, $1}' | sort -k1
#sleep 10
