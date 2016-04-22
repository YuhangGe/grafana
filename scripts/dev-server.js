'use strict';

const serve = require('koa-static');
const request = require('request');
const path = require('path');
const CWD = process.cwd();
const fs = require('fs');
const livereload = require('./live-reload.js');

module.exports = function (app, server, port) {
  if (process.argv[3] === '--liveload') {
    livereload.init(app, server, port);
  }

  app.use(function *(next) {
    // 接口代理
    if (!/^\/api\//.test(this.url)) {
      yield next;
      return;
    }
    let res = this.res;
    this.req.pipe(request('http://127.0.0.1:9090' + this.url).on('error',  function (err) {
      console.error(err);
      res.statusCode = 404;
      res.end('Backend Connection Error.\n' + err.message);
    })).pipe(res);
    this.response = false;
  });

  if (process.argv[3] === '--build') {
    
  } else {
    app.use(function *(next) {
      if (typeof this.query.__delay !== 'undefined') {
        yield new Promise(res => setTimeout(res, Number(this.query.__delay || 1500)));
      }
      yield next;
    });
    app.use(serve(path.join(CWD, 'public')));
  }

};
