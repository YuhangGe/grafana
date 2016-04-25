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


function escapeHtml(string) {
  return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\':
        return '\\' + character;
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
    }
  });
}

module.exports = {
  wrapFnPromise,
  existsSync,
  mkdirSync,
  copy,
  copySync,
  statSync: fs.statSync,
  escapeHtml
};
