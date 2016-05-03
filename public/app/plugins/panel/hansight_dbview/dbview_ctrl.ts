import { PanelCtrl } from 'app/plugins/sdk';

export default class DBViewCtrl extends PanelCtrl {
  static templateUrl = `public/app/plugins/panel/hansight_dbview/module.html`;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
  }
}
