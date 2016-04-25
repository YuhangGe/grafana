'use strict';

require('colors');
const _util = require('./_util.js');
const ts = require('typescript');
const glob = require('glob');
const path = require('path');
const CWD = process.cwd();
const DIR = path.join(CWD, 'public', 'app');
const execSync = require('child_process').execSync;
const DIST = path.join(CWD, '_ts');
const fs = require('fs');
if (_util.existsSync(DIST)) {
  execSync('rm -rf ' + DIST);
}
_util.mkdirSync(DIST);


let tsArr = glob.sync(path.join(DIR, '**/*.ts')).filter(file => {
  return !/\.d\.ts$/.test(file);
});

let tsMap = {};
tsArr.forEach(tsFile => {
  tsMap[tsFile] = {
    version: 0
  }
});

const options = {
  module: ts.ModuleKind.System,
  sourceMap: true,
  target: ts.ScriptTarget.ES5,
  outDir: DIST,
  rootDir: path.join(CWD, 'public'),
  sourceRoot: '/',
  noEmitOnError: true,
  // declaration: true,
  noImplicitAny: false,
  emitDecoratorMetadata: true,
  experimentalDecorators: true
};

const servicesHost = {
  getScriptFileNames: () => tsArr,
  getScriptVersion: (fileName) => tsMap[fileName] && tsMap[fileName].version.toString(),
  getScriptSnapshot: (fileName) => {
    if (!_util.existsSync(fileName)) {
      return undefined;
    }
    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
  },
  getCurrentDirectory: () => DIR,
  getCompilationSettings: () => options,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
};

const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())

tsArr.forEach(tsFile => {
  emitFile(tsFile);
});

setTimeout(function () {
  fs.writeFileSync(path.join(DIST, '.tsready'), '');
});

if (process.argv[2] === '--watch') {
  fs.watch(DIR, {
    persistent: false,
    recursive: true
  }, (event, file) => {
    if (!/\.ts$/.test(file)) {
      return;
    }
    let fullpath = path.join(DIR, file);
    if (_util.existsSync(fullpath)) {
      if (!tsMap.hasOwnProperty(fullpath)) {
        //new file
        tsMap[fullpath] = {
          version: 0
        };
        tsArr.push(fullpath);
      } else {
        tsMap[fullpath].version++;
      }
      emitFile(fullpath);
    } else {
      if (tsMap.hasOwnProperty(fullpath)) {
        delete tsMap[fullpath];
        let idx = tsArr.indexOf(fullpath);
        tsArr.splice(idx, 1);
        emitFile(fullpath);
      }
    }
  });
  setTimeout(loop, 1000000);
}


function emitFile(fileName) {
  let output = services.getEmitOutput(fileName);
  let shortName = fileName.substring(CWD.length + 1).green;
  if (!output.emitSkipped) {
    console.log(`Compiled ${shortName}`);
  } else {
    console.log(`Compiled ${shortName} failed`);
    logErrors(fileName);
  }

  output.outputFiles.forEach(o => {
    let dir = path.dirname(o.name);
    _util.mkdirSync(dir);
    fs.writeFileSync(o.name, o.text);
  });
}

function logErrors(fileName) {
  let allDiagnostics = services.getCompilerOptionsDiagnostics()
    .concat(services.getSyntacticDiagnostics(fileName))
    .concat(services.getSemanticDiagnostics(fileName));

  allDiagnostics.forEach(diagnostic => {
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (diagnostic.file) {
      let pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      console.log(`  Error ${diagnostic.file.fileName} (${pos.line + 1},${pos.character + 1}): ${message}`);
    }
    else {
      console.log(`  Error: ${message}`);
    }
  });
}
function loop() {
  setTimeout(loop, 100000)
}


