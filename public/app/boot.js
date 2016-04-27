(function () {

  var __DEBUG = true; // this var will be changed to false when minify

  // first, we got global data

  var http = new XMLHttpRequest();

  http.open('GET', '/api/boot_data', true);
  http.onreadystatechange = function () {
    if (http.readyState === 4) {
      if (http.status === 200) {
        try {
          var bootData = JSON.parse(http.responseText);
          // console.log(bootData.Settings)
          // bootData.Settings.appSubUrl = 'http://127.0.0.1:3000';
          window.grafanaBootData = {
            user: bootData.User,
            settings: bootData.Settings,
            mainNavLinks: bootData.MainNavLinks
          };
          loadTheme();
        } catch(ex) {
          console.log(ex);
          bootError();
        }
      } else {
        bootError();
      }
    }
  };
  http.send(null);

  function bootError(err) {
    err && console.log(err);
    var $s = document.getElementById('splash');
    $s && ($s.innerHTML = '<p class="error">加载出错, 请刷新重试或联系管理员</p>');
  }

  // then, we load theme

  function loadTheme() {
    var $style = document.createElement('link');
    $style.setAttribute('rel', 'stylesheet');
    $style.setAttribute('type', 'text/css');
    $style.onload = function () {
      var $s = document.getElementById('splash');
      $s && document.body.removeChild($s);
      bootGrafana();
    };
    $style.setAttribute('href', '/css/grafana.' + (window.grafanaBootData.user.lightTheme ? 'light' : 'dark') + (__DEBUG ? '' : '.min') + '.css');
    document.getElementsByTagName('head')[0].appendChild($style);
    $style.onerror = bootError;
  }

  // finally, we boot grafana

  function bootGrafana() {
    'use strict';

    var systemLocate = System.locate;
    System.locate = function(load) {
      var System = this;
      return Promise.resolve(systemLocate.call(this, load)).then(function(address) {
        return address + System.cacheBust;
      });
    };
    System.cacheBust = '?bust=' + Date.now();

    System.import('app/app').then(function(app) {
      app.default.init();
    }).catch(function(err) {
      bootError(err);
    });

  }
})();
