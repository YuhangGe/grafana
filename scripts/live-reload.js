'use strict';

const fs = require('fs');
const path = require('path');
const CWD = process.cwd();

function init(app, server, port) {
  const LiveReloadTemplate = fs.readFileSync(path.join(__dirname, 'live-reload-client.js')).toString().replace('$$PORT$$', () => port);
  const WSServer = require('websocket').server;
  let ws = new WSServer({
    httpServer: server,
    autoAcceptConnections: false
  });
  let liveReloadClients = [];
  let liveReloadTM = null;
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
    if (!/\.(js|html|css)$/.test(file)) {
      return;
    }
    if (liveReloadTM) {
      clearTimeout(liveReloadTM);
    }
    liveReloadTM = setTimeout(() => {
      console.log('Live Reload.');
      liveReloadClients.forEach(connection => {
        connection.sendUTF('reload');
      })
    }, 100);
  });
  app.use(function *(next) {
    if (this.url === '/__liveload.js') {
      this.body = LiveReloadTemplate;
      return;
    }
    yield next;
  })
}
module.exports = {
  init: init
};
