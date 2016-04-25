'use strict';

require('colors');
const path = require('path');
const fs = require('fs');
const _util = require('./_util.js');
const UglifyJS = require('uglify-js');
const ts = require('typescript');
const glob = require('glob');
const CWD = process.cwd();
const DIST = path.join(CWD, 'dist');
const ngAnnotate = require('ng-annotate');
// const execSync = require('child_process').execSync;
const APP_DIR = path.join(DIST, 'app');

let tplCnt = `define('app/core/partials', ['app/core/core_module'], function(coreModule) {
  coreModule.default.run(['$templateCache', function($templateCache) {
  ${glob.sync(path.join(APP_DIR, '**/*.html')).map(htmlFile => {
    let cnt = fs.readFileSync(htmlFile).toString();
    let name = htmlFile.substring(DIST.length + 1);
    return `$templateCache.put("${name}", "${_util.escapeHtml(cnt)}");`
  }).join('\n')}
  }]);
});`;

fs.writeFileSync(path.join(APP_DIR, 'core/partials.js'), tplCnt);

let tsArr = glob.sync(path.join(APP_DIR, '**/*.ts')).filter(file => {
  return !/\.d\.ts$/.test(file);
});

const options = {
  module: ts.ModuleKind.System,
  sourceMap: false,
  target: ts.ScriptTarget.ES5,
  rootDir: DIST,
  noEmitOnError: true,
  // declaration: true,
  noImplicitAny: false,
  emitDecoratorMetadata: true,
  experimentalDecorators: true
};

const servicesHost = {
  getScriptFileNames: () => tsArr,
  getScriptVersion: () => "0",
  getScriptSnapshot: (fileName) => {
    if (!_util.existsSync(fileName)) {
      return undefined;
    }
    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
  },
  getCurrentDirectory: () => DIST,
  getCompilationSettings: () => options,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
};

const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())

console.log('Starting typescripts...');
tsArr.forEach(tsFile => {
  emitFile(tsFile);
});

console.log('Starting ng-annotate...');
Promise.all(glob.sync(path.join(APP_DIR, '**/*.js')).map(jsFile => {
  return new Promise((resolve, reject) => {
    fs.readFile(jsFile, (err, cnt) => {
      if (err) {
        reject(err);
      } else {
        let result = ngAnnotate(cnt.toString(), {
          add: true
        });
        fs.writeFile(jsFile, result.src, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    })
  });
})).then(() => {
  runSystemJS();
}, err => {
  console.log(err);
});

function runSystemJS() {
  const Builder = require('systemjs-builder');
  // optional constructor options
  // sets the baseURL and loads the configuration file
  const builder = new Builder(DIST, path.join(DIST, 'app/system.conf.js'));
  console.log('Starting systemjs-builder...');

  const modules = [
    'app/app',
    'app/features/all',
    'app/plugins/panel/**/module',
    'app/plugins/datasource/graphite/module',
    'app/plugins/datasource/influxdb/module',
    'app/plugins/datasource/elasticsearch/module',
  ];

  var expression = modules.join(' + ');

  builder
    .bundle(expression, path.join(DIST, 'app/app_bundle.js'))
    .then(function() {
      concatBoot();
    })
    .catch(function(err) {
      console.log('System Build error');
      console.log(err);
    });
}

function concatBoot() {
  let bootCnt = fs.readFileSync(path.join(APP_DIR, 'boot.js')).toString();
  bootCnt = bootCnt.replace(/\b\s*var\s+__DEBUG\s+=\s+true\b/, 'var __DEBUG = false');
  let bundleCnt = fs.readFileSync(path.join(DIST, 'app/app_bundle.js')).toString() + '\n' + bootCnt;
  fs.writeFileSync(path.join(DIST, 'app/app_bundle.js'), bundleCnt);
  let result;
  console.log('Starting uglifyjs...');
  try {
    result = UglifyJS.minify(bundleCnt, {
      fromString: true,
      mangle: true,
      compress: {
        dead_code: false,
        unused: false,
        warnings: false
      },
      outSourceMap: false
    })
  } catch(ex) {
    // console.error(ex.stack);
    console.log(`UglifyJS error ${ex.message}`);
    console.log(`Please check line ${ex.line}, col ${ex.col} of ./dist/app/app_bundle.js`);
    fs.writeFileSync(path.join(DIST, '.js'), cnt);
    return;
  }
  _util.mkdirSync(path.join(DIST, 'js'));
  fs.writeFileSync(path.join(DIST, 'js/boot.min.js'), result.code);
  console.log('Complete.');
}

function emitFile(fileName) {
  let output = services.getEmitOutput(fileName);
  if (output.emitSkipped) {
    logErrors(fileName);
    throw new Error('Type scripts errors');
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


