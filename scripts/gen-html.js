'use strict';

require('colors');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const CWD = process.cwd();
const VIEW_DIR = path.join(CWD, 'public', 'views');

function genHtml(DEBUG) {
  let cnt = fs.readFileSync(path.join(VIEW_DIR, 'index.htm')).toString();
  cnt = cnt.replace(/<!--\s*if\s+DEBUG\s*-->([\d\D]+?)<!--\s*else\s*-->([\d\D]+?)<!--\s*end\s+if\s*-->/g, function (m0, m1, m2) {
    return DEBUG ? m1 : m2;
  });

  let dist = path.resolve(CWD, DEBUG ? 'public' : 'build');
  fs.writeFileSync(path.join(dist, 'index.html'), cnt);

  if (DEBUG) {
    console.log('Generated ' + 'public/index.html'.green);
  }
}

genHtml(process.argv[2] !== '--build');


if (process.argv[2] === '--watch') {
  fs.watch(path.join(CWD, 'public', 'views'), {
    persistent: false,
    recursive: false
  }, (event, file) => {
    if (file === 'index.htm') {
      genHtml(true);
    }
  });
  setTimeout(loop, 100000);
}

function loop() {
  setTimeout(loop, 100000)
}

