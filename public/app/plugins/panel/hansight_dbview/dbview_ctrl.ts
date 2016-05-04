import { PanelCtrl } from 'app/plugins/sdk';

export default class DBViewCtrl extends PanelCtrl {
  static templateUrl = `public/app/plugins/panel/hansight_dbview/module.html`;

  backendSrv: any;
  datasourceSrv: any;
  datasource: any;
  records: any;
  
  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    this.backendSrv = $injector.get('backendSrv');
    this.datasourceSrv = $injector.get('datasourceSrv');
    this.datasource = null;
    this.records = [];
  }

  
}
