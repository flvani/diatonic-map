for a in $(grep X:$1 $( grep "^F:" *.abcx | awk -F ":" '{print $1}' ) |  awk -F":" '{print $1}' | sort -uk1 )
do
 cp $a $a.original
 sed 's/^F:/\%F:/g' $a.original > $a
done
