'use strict';

const fs = require('fs');
const path = require('path');

function wrapFnPromise(fn) {
  return function () {
    return new Promise((resolve, reject) => {
      let args = [].slice.apply(arguments);
      args.push(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve.apply(this, [].slice.apply(arguments, 1));
        }
      });
      fn.apply(this, args);
    });
  }
}

var existsSync = fs.existsSync ? fs.existsSync : function (file) {
  try {
    fs.accessSync(file);
    return true;
  } catch(ex) {
    return false;
  }
};

function mkdirSync(dir) {
  if (existsSync(dir)) {
    return;
  }
  let parentDir = path.dirname(dir);
  mkdirSync(parentDir);
  fs.mkdirSync(dir);
}

function copy(source, target) {
  return new Promise(function(resolve, reject) {
    let rd = fs.createReadStream(source);
    rd.on('error', reject);
    let wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
}

function copySync(source, target) {
  // todo
}

module.exports = {
  wrapFnPromise,
  existsSync,
  mkdirSync,
  copy,
  copySync,
  statSync: fs.statSync
};
