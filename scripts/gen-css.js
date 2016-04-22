'use strict';
require('colors');
const _util = require('./_util.js');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const CWD = process.cwd();
const sass = require('node-sass');

const DIR = path.join(CWD, 'public');
const DIST = path.join(DIR, 'css');
_util.mkdirSync(DIST); // make dir if not exists

const info = {
  'fonts': {
    isBusy: false,
    needAgain: false
  },
  'grafana.dark': {
    isBusy: false,
    needAgain: false
  },
  'grafana.light': {
    isBusy: false,
    needAgain: false
  }
};

function genCss(DEBUG) {
  compile('fonts', DEBUG);
  compile('grafana.dark', DEBUG);
  compile('grafana.light', DEBUG);
}

function compile(name, DEBUG) {
  if (info[name].isBusy) {
    info[name].needAgain = true;
    return;
  }
  sass.render({
    file: path.join(DIR, 'sass', name + '.scss'),
    outFile: 'css/' + name + '.css',
    sourceMap: DEBUG ?  'css/' + name + '.css.map' : false,
    outputStyle: DEBUG ? 'nested' : 'compressed',
    // sourceMapContents: DEBUG ? false : true
  }, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(DEBUG ? path.join(DIR, 'css', name + '.css') : path.join(CWD, 'build', name + '.min.css'), result.css.toString());
      if (DEBUG) {
        var map = result.map.toString().replace(/\.\.\/public\/sass\//g, '../sass/');
        fs.writeFileSync(path.join(DIR, 'css', name + '.css.map'), map);
      }
      DEBUG && console.log('Generated ' + ('public/css/' + name + '.css').green);
    }
    if (info[name].needAgain) {
      compile(name);
    }
  });
}

genCss(process.argv[2] !== '--build');

if (process.argv[2] === '--watch') {
  fs.watch(DIR, {
    persistent: false,
    recursive: true
  }, (event, file) => {
    if (/\.scss/.test(file)) {
      genCss(true);
    }
  });
  setTimeout(loop, 100000);
}

function loop() {
  setTimeout(loop, 100000)
}
