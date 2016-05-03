define([
  '../core_module',
  'app/core/i18n'
],
function (coreModule, i18n) {
  "use strict";

  coreModule.default.controller('LoadDashboardCtrl', function($scope, $routeParams, dashboardLoaderSrv, backendSrv, $location) {

    if (!$routeParams.slug) {
      backendSrv.get('/api/dashboards/home').then(function(homeDash) {
        if (homeDash.redirectUri) {
          $location.path('dashboard/' + homeDash.redirectUri);
        } else {
          var meta = homeDash.meta;
          homeDash.dashboard.title = i18n.t(homeDash.dashboard.title);
          meta.canSave = meta.canShare = meta.canStar = false;
          $scope.initDashboard(homeDash, $scope);
        }
      });
      return;
    }

    dashboardLoaderSrv.loadDashboard($routeParams.type, $routeParams.slug).then(function(result) {
      if ($routeParams.type === 'file') {
        result.dashboard.title = i18n.t(result.dashboard.title);
      }
      $scope.initDashboard(result, $scope);
    });

  });

  coreModule.default.controller('DashFromImportCtrl', function($scope, $location, alertSrv) {
    if (!window.grafanaImportDashboard) {
      alertSrv.set(i18n.t('Not found'), i18n.t('Cannot reload page with unsaved imported dashboard'), 'warning', 7000);
      $location.path('');
      return;
    }
    $scope.initDashboard({
      meta: { canShare: false, canStar: false },
      dashboard: window.grafanaImportDashboard
    }, $scope);
  });

  coreModule.default.controller('NewDashboardCtrl', function($scope) {
    $scope.initDashboard({
      meta: { canStar: false, canShare: false },
      dashboard: {
        title: i18n.t("New dashboard"),
        rows: [{ height: '250px', panels:[] }]
      },
    }, $scope);
  });

});
