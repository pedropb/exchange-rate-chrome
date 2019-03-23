#! /bin/bash
rm -rf dist/ dist.zip
uglify -s background.js -o background.min.js
uglify -s options.js -o options.min.js
zip dist.zip background.min.js LICENSE manifest.json options.html options.min.js icons/icon16.png icons/icon48.png icons/icon128.png
mkdir dist
unzip -o dist.zip -d dist
rm background.min.js options.min.js
