#!/bin/bash

if hash browserify 2>/dev/null; then
  browserify --entry app.js --outfile app.dist.js
else
  ./node_modules/.bin/browserify --entry app.js --outfile app.dist.js
fi
