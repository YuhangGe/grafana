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
    System.import('app/core/i18n'),
    System.import('angular')
  ]).then(function (mArr) {
    var i18n = mArr[0];
    var angular = mArr[1];
    i18n.registerJson(window.__bootGrafanaLocalJson);
    angular.module("ngLocale", [], ["$provide", function($provide) {
      $provide.value('$locale', window.__bootGrafanaNgLocale);
      delete window.__bootGrafanaNgLocale;
    }]);
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
