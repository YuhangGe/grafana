window.__DEBUG = window.__DEBUG || false;
window.__bootGrafanaReady = false;
window.__bootGrafanaError = function(err) {
  err && console.log(err);
  var $s = document.getElementById('splash');
  if (!$s) {
    $s = document.createElement('div');
    $s.id = 'splash';
    document.body.appendChild($s);
  }
  $s.innerHTML = '<p class="error">加载出错, 请刷新重试或联系管理员</p>';
};
(function () {

  function getJson(url) {
    return new Promise(function(resolve, reject) {
      var http = new XMLHttpRequest();
      http.open('GET', url, true);
      http.onreadystatechange = function () {
        if (http.readyState === 4) {
          if (http.status === 200) {
            try {
              resolve(JSON.parse(http.responseText));
            } catch(ex) {
              reject(ex);
            }
          } else {
            reject('network error');
          }
        }
      };
      http.send(null);
    });
  }

  function loadTheme(theme) {
    return new Promise(function (resolve, reject) {
      var $style = document.createElement('link');
      $style.setAttribute('rel', 'stylesheet');
      $style.setAttribute('type', 'text/css');
      $style.onload = function () {
        var $s = document.getElementById('splash');
        $s && document.body.removeChild($s);
        resolve();
      };
      $style.setAttribute('href', '/css/grafana.' + theme + (window.__DEBUG ? '' : '.min') + '.css');
      document.getElementsByTagName('head')[0].appendChild($style);
      $style.onerror = reject;
    });
  }

  getJson('/api/boot_data').then(function(bootData) {
    if (!bootData.User.isSignedIn) {
      location.href = '/login?url=' + encodeURIComponent(location.href);
      return;
    }
    console.log(bootData.User);
    window.grafanaBootData = {
      user: bootData.User,
      settings: bootData.Settings,
      mainNavLinks: bootData.MainNavLinks
    };
    Promise.all([
      getJson('/locals/' + (bootData.Settings.language || navigator.language || 'zh-CN') + '.json'),
      loadTheme(bootData.User.lightTheme ? 'light' : 'dark')
    ]).then(function (ds) {
      window.__bootGrafanaLocalJson = ds[0];
      if (window.__bootGrafana) {
        window.__bootGrafana();
      } else {
        window.__bootGrafanaReady = true;
      }
    }).catch(window.__bootGrafanaError);
  }).catch(window.__bootGrafanaError);

})();
