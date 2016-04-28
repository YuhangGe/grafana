'use strict';

require('colors');
const path = require('path');
const fs = require('fs');
const _util = require('./_util.js');
const glob = require('glob');
const CWD = process.cwd();
const DIR = path.join(CWD, 'public');
const VIEW_DIR = path.join(DIR, 'views');
const DEBUG = process.argv[2] !== '--build';

function genHtml(name) {
  let cnt = fs.readFileSync(path.join(VIEW_DIR, name + '.htm')).toString();
  cnt = cnt.replace(/<!--\s*if\s+DEBUG\s*-->([\d\D]+?)<!--\s*else\s*-->([\d\D]+?)<!--\s*end\s+if\s*-->/g, function (m0, m1, m2) {
    return DEBUG ? m1 : m2;
  });

  let dist = path.resolve(CWD, DEBUG ? 'public' : 'dist');
  fs.writeFileSync(path.join(dist, name + '.html'), cnt);

  if (DEBUG) {
    console.log('Generated ' + `public/${name}.html`.green);
  }
}

genHtml('index');
genHtml('login');


if (process.argv[2] === '--watch') {
  fs.watch(path.join(CWD, 'public', 'views'), {
    persistent: false,
    recursive: false
  }, (event, file) => {
    if (file === 'index.htm') {
      genHtml('index');
    }
    if (file === 'login.htm') {
      genHtml('login');
    }
  });
  setTimeout(loop, 100000);
}

function loop() {
  setTimeout(loop, 100000)
}

