///<reference path="../../headers/common.d.ts" />

import config from 'app/core/config';
import _ from 'lodash';
import coreModule from 'app/core/core_module';

export class PrefsControlCtrl {
  prefs: any;
  oldTheme: any;
  prefsForm: any;
  mode: string;

  timezones: any = [
    {value: '', text: 'Default'},
    {value: 'browser', text: 'Local browser time'},
    {value: 'utc', text: 'UTC'},
  ];
  themes: any = [
    {value: '', text: 'Default'},
    {value: 'dark', text: 'Dark'},
    {value: 'light', text: 'Light'},
  ];
  languages: any = [
    {value: '', text: 'Default'},
    {value: 'zh-cn', text: '简体中文'},
    {value: 'en', text: 'Engilish'}
  ];

  /** @ngInject **/
  constructor(private backendSrv, private $location) {
  }

  $onInit() {
    return this.backendSrv.get(`/api/${this.mode}/preferences`).then(prefs => {
      this.prefs = prefs;
      this.oldTheme = prefs.theme;
    });
  }

  updatePrefs() {
    if (!this.prefsForm.$valid) { return; }

    var cmd = {
      theme: this.prefs.theme,
      timezone: this.prefs.timezone,
      homeDashboardId: this.prefs.homeDashboardId,
      language: this.prefs.language
    };

    this.backendSrv.put(`/api/${this.mode}/preferences`, cmd).then(() => {
      window.location.href = config.appSubUrl + this.$location.path();
    });
  }

}

var template = `
<form name="ctrl.prefsForm" class="section gf-form-group">
  <h3 class="page-heading" i18n="Preferences"></h3>

  <div class="gf-form">
    <span class="gf-form-label width-9" i18n="UI Theme"></span>
    <div class="gf-form-select-wrapper max-width-20">
      <select class="gf-form-input" ng-model="ctrl.prefs.theme" ng-options="f.value as (f.text | t) for f in ctrl.themes"></select>
    </div>
  </div>

  <!--<div class="gf-form">-->
    <!--<span class="gf-form-label width-9" i18n="Home Dashboard"></span>-->
    <!--<dashboard-selector class="gf-form-select-wrapper max-width-20 gf-form-select-wrapper&#45;&#45;has-help-icon"-->
                        <!--model="ctrl.prefs.homeDashboardId">-->
    <!--</dashboard-selector>-->
  <!--</div>-->

  <div class="gf-form">
    <span class="gf-form-label width-9" i18n="Language"></span>
    <div class="gf-form-select-wrapper max-width-20">
      <select class="gf-form-input" ng-model="ctrl.prefs.language" ng-options="f.value as (f.text | t) for f in ctrl.languages"></select>
    </div>
  </div>
  
  <div class="gf-form">
    <label class="gf-form-label width-9" i18n="Timezone"></label>
    <div class="gf-form-select-wrapper max-width-20">
      <select class="gf-form-input" ng-model="ctrl.prefs.timezone" ng-options="f.value as (f.text | t) for f in ctrl.timezones"></select>
    </div>
  </div>

  <div class="gf-form-button-row">
    <button type="button" class="btn btn-success" ng-click="ctrl.updatePrefs()" i18n="Update"></button>
  </div>
</form>
`;

export function prefsControlDirective() {
  return {
    restrict: 'E',
    controller: PrefsControlCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    template: template,
    scope: {
      mode: "@"
    }
  };
}

coreModule.directive('prefsControl', prefsControlDirective);


