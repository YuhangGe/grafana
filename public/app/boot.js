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
  Promise.all([
    System.import('app/app'),
    System.import('app/core/i18n')
  ]).then(function(modules) {
    var app = modules[0].default;
    var i18n = modules[1]; // i18n 模块没有使用 ts 不需要通过 .default 引入
    i18n.registerJson(window.__bootGrafanaLocalJson);
    app.init();
    delete window.__bootGrafanaLocalJson;
    delete window.__bootGrafanaError;
  }).catch(function(err) {
    window.__bootGrafanaError(err);
  });
};

if (window.__bootGrafanaReady) {
  window.__bootGrafana();
}
