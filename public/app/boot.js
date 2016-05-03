window.__bootGrafana = function () {
  delete window.__bootGrafanaReady;
  delete window.__bootGrafana;
  var systemLocate = System.locate;
  System.locate = function(load) {
    var System = this;
    return Promise.resolve(systemLocate.call(this, load)).then(function(address) {
      return address + System.cacheBust;
    });
  };
  if (window.__DEBUG) {
    System.cacheBust = '?bust=' + Date.now();
  }
  System.import('app/core/i18n').then(function (i18n) {
    i18n.registerJson(window.__bootGrafanaLocalJson);
    delete window.__bootGrafanaLocalJson;
    return System.import('app/app');
  }).then(function(app) {
    app.default.init();
    delete window.__bootGrafanaError;
  }).catch(function(err) {
    window.__bootGrafanaError(err);
  });
};

if (window.__bootGrafanaReady) {
  window.__bootGrafana();
}
