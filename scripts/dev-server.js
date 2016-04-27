'use strict';

const serve = require('koa-static');
const request = require('request');
const path = require('path');
const CWD = process.cwd();
const fs = require('fs');
const livereload = require('./live-reload.js');

const IndexRoutes = [
  '/login',
  /^\/invite\/.+/,
  '/profile/password',
  '/profile',
  "/admin/stats",
  '/datasources',
  '/datasources/new',
  /^\/datasources\/edit\/.+/,
  '/org/users',
  '/org/apikeys',
  '/dashboard/import',
  '/admin/users',
  '/admin/settings',
  '/admin/users/create',
  /^\/admin\/users\/edit\/.+/,
  '/admin/orgs',
  /^\/admin\/orgs\/edit\/.+/,
  '/plugins',
  /^\/plugins\/[^\/]+\/edit/,
  /^\/plugins\/[^\/]+\/page\/[^\/]+/,
  /^\/dashboard\/.+/,
  '/dashboard/snapshots',
  /^\/dashboard\/snapshots\/.+/,
  '/user/password/reset',
  '/user/password/send-reset-email',
  '/signup',
  '/playlists',
  /^\/playlists\/.+/,
  /^\/dashboard-solo\/.+/,
];

function isIndexRoute(url) {
  if (url[url.length - 1] === '/') {
    url = url.substring(0, url.length - 1);
  }
  return IndexRoutes.some(r => {
    return r instanceof RegExp ? r.test(url) : r.indexOf(url) === 0;
  });
}

let ready = false;
let readyResolve = null;
let readyPromise = new Promise(resolve => {
  readyResolve = resolve;
});
function onReady() {
  ready = true;
  readyResolve();
}

module.exports = function (app, server, port) {
  if (process.argv[3] === '--liveload') {
    livereload.init(app, server, port, onReady);
  } else {
    onReady();
  }

  app.use(function *(next) {
    if (!ready) {
      yield readyPromise;
    }
    yield next;
  });

  app.use(function *(next) {
    if (typeof this.query.__delay !== 'undefined') {
      yield new Promise(res => setTimeout(res, Number(this.query.__delay || 1500)));
    }
    if (this.method === 'GET' && isIndexRoute(this.url)) {
      this.url = '/index.html';
    }
    if (/^\/public\//.test(this.url)) {
      this.url = this.url.replace(/^\/public\//, '/');
    }
    yield next;
  });

  if (process.argv[3] === '--build') {
    app.use(serve(path.join(CWD, 'dist')));
  } else {
    app.use(serve(path.join(CWD, 'public')));
    app.use(serve(path.join(CWD, '_ts')));
  }

  app.use(function *(next) {
    // 接口代理
    if (this.body) {
      yield next;
      return;
    }
    let port = 3000; // default is grafana server

    if (/^\/prometheus\//.test(this.url)) {
      this.url = this.url.replace(/^\/prometheus\//, '/');
      port = 9090;
    } else if (/^\/elasticsearch\//.test(this.url)) {
      this.url = this.url.replace(/^\/elasticsearch\//, '/');
      port = 9200;
    } else if (/^\/sockdb\//.test(this.url)) {
      this.url = this.url.replace(/^\/sockdb\//, '/');
      port = 9300;
    }
    let remoteUrl = 'http://127.0.0.1:' + port + this.url;
    console.log('Proxy ' + this.method + ' ==> ' + remoteUrl);
    let res = this.res;
    this.req.pipe(request(remoteUrl, {
      followRedirect: false
    }).on('error',  function (err) {
      console.error(err);
      res.statusCode = 404;
      res.end('Backend Connection Error.\n' + err.message);
    })).pipe(res);
    this.response = false;
  });
};
