
./node_modules/@angular/cli/bin/ng build --base-href=/stores --deployUrl=/static/page_map/ --prod
csplit ./dist/encore-maps/index.html /"<body>"/
sed -i /\<body\>/d ./xx01
sed -i 's/<\/body>/\'$'\n/g' xx01
sed -i 's/<\/html>/\'$'\n/g' xx01

sed -i 's/<\/head>/\'$'\n/g' xx00
sed -i -n '/.css/p' xx00
mv xx00 ./dist/encore-maps/
mv xx01 ./dist/encore-maps/

