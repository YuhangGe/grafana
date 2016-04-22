'use strict';
require('colors');
const _util = require('./_util.js');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const CWD = process.cwd();
const SRC_DIR = path.join(CWD, 'public');
const npmModules = [
  'eventemitter3/*.js',
  'systemjs/dist/*.js',
  'es6-promise/**/*',
  'es6-shim/*.js',
  'reflect-metadata/*.js',
  'reflect-metadata/*.ts',
  'reflect-metadata/*.d.ts',
  'rxjs/**/*',
  'tether/dist/**/*',
  'tether-drop/dist/**/*',
  'remarkable/dist/*'
];

const NPM_DIR = path.join(SRC_DIR, 'vendor', 'npm');
const MODULES_DIR = path.join(CWD, 'node_modules');

if (_util.existsSync(NPM_DIR)) {
  execSync('rm -rf ' + NPM_DIR);
}
fs.mkdirSync(NPM_DIR);


Promise.all(npmModules.map(function (m) {
  return Promise.all(glob.sync(path.join(CWD, 'node_modules', m)).map(function (file) {
    if (!_util.statSync(file).isFile()) {
      return;
    }
    let distFile = path.join(NPM_DIR, file.substring(MODULES_DIR.length + 1));
    let distDir = path.dirname(distFile);
    _util.mkdirSync(distDir);
    return _util.copy(file, distFile);
  }));
})).then(() => {
  console.log('NPM modules copied to ' + 'public/vendor/npm'.green);
}, (err) => {
  console.log(err)
});
