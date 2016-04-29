define([
  './core_module'
], function (coreModule) {
  'use strict';

  var localJson = {};

  function i18n(msg) {
    return localJson.hasOwnProperty(msg) ? localJson[msg] : null;
  }
  i18n.has = function (msg) {
    return localJson.hasOwnProperty(msg);
  };
  i18n.registerJson = function (json) {
    localJson = json;
  };
  i18n.t = function (msg) {
    return i18n(msg) || msg;
  };
  
  coreModule.default.directive('i18n', function () {
    return {
      restrict: 'A',
      compile: function($element, $attr) {

        function parse(id) {
          var ids = id.split("#").map(function(it) {
            return it.trim();
          });
          var txt = i18n(ids[0]);
          if (!txt) {
            if ($element.text().trim()) {
              return null;
            } else {
              txt = ids[0];
            }
          }

          return ids.length > 1 ? txt.replace(/\$(\d+)/g, function(m, n) {
            return ids[parseInt(n)] || '';
          }) : txt;
        }

        if ($attr.i18n) {
          var lm = parse($attr.i18n);
          if (!lm) {
            return;
          }
          if (lm.indexOf('\n') >= 0) {
            lm = lm.split('\n').join('<br/>');
            setTimeout(function() {
              $element.html(lm);
            });
          } else {
            $element.html(lm);
          }
        } else if ($element.text()) {
          $element.html(parse($element.text()));
        }
        if ($attr.placeholder) {
          $element.attr('placeholder', parse($attr.placeholder));
        }
        if ($attr.value) {
          $element.val(parse($attr.value));
        }
        if ($attr.title) {
          $element.attr('title', parse($attr.title));
        }
      }
    }
  });

  coreModule.default.filter('t', function () {
    return function (msg, prefix) {
      return i18n((prefix ? prefix + '.' : '') + msg) || msg;
    }
  });

  return i18n;
});
