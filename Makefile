
build:
	coffee -p -j -c src/settee/parser.coffee src/settee/context.coffee src/settee/tag.coffee src/settee/index.coffee > settee.js
	coffee -p -j -c src/settee/context.coffee src/settee/tag.coffee src/settee/runtime.coffee | uglifyjs -m > settee.runtime.js
	coffee -b -o ./lib -c ./src
	coffee -b -o ./test -c ./test/src

dist:
	cat settee.js | uglifyjs -m > settee.min.js

gzip:
	gzip -c settee.min.js > settee.min.js.gz
	gzip -c settee.runtime.js > settee.runtime.js.gz

watch:
	coffee -w -b -o ./lib -c ./src
