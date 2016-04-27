'use strict';

const fs = require('fs');
const path = require('path');
const _util = require('./_util.js');
const CWD = process.cwd();
let liveReloadClients = [];
let liveReloadTM = null;
let tsReady = false;

function init(app, server, port, onReadyCallback) {
  const LiveReloadTemplate = fs.readFileSync(path.join(__dirname, 'live-reload-client.js')).toString().replace('$$PORT$$', () => port);
  const WSServer = require('websocket').server;
  let ws = new WSServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  ws.on('request', function(request) {
    let connection = request.accept('echo-protocol', request.origin);
    liveReloadClients.push(connection);
    connection.on('close', function() {
      let idx = liveReloadClients.indexOf(connection);
      liveReloadClients.splice(idx, 1);
    });
  });
  fs.watch(path.join(CWD, 'public'), {
    persistent: false,
    recursive: true
  }, (event, file) => {
    if (!/\.(?:js|html|css)$/.test(file)) {
      return;
    }
    handleChange(event, file);
  });
  fs.watch(path.join(CWD, '_ts'), {
    persistent: false,
    recursive: true
  }, (event, file) => {
    if (file === '.tsready' && _util.existsSync(path.join(CWD, '_ts', '.tsready'))) {
      tsReady = true;
      onReadyCallback && onReadyCallback();
      return;
    }
    if (!tsReady || !/\.js$/.test(file)) {
      return;
    }
    handleChange(event, file);
  });
  app.use(function *(next) {
    if (this.url === '/__liveload.js') {
      this.body = LiveReloadTemplate;
      return;
    }
    yield next;
  });

  if (_util.existsSync(path.join(CWD, '_ts', '.tsready'))) {
    onReadyCallback && onReadyCallback();
  }
}

function handleChange(event, file) {
  if (liveReloadTM) {
    clearTimeout(liveReloadTM);
  }
  liveReloadTM = setTimeout(() => {
    console.log('Live Reload.');
    liveReloadClients.forEach(connection => {
      connection.sendUTF('reload');
    })
  }, 50);
}
module.exports = {
  init: init
};
