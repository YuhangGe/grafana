import { PanelCtrl } from 'app/plugins/sdk';

export default class DBViewCtrl extends PanelCtrl {
  static templateUrl = `public/app/plugins/panel/hansight_dbview/module.html`;

  backendSrv: any;
  datasourceSrv: any;
  datasource: any;
  records: any;
  loading: boolean;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    this.backendSrv = $injector.get('backendSrv');
    this.datasourceSrv = $injector.get('datasourceSrv');
    this.datasource = null;
    this.records = [];
    this.loading = true;
    this.request();
  }

  request() {
    this.loading = true;
    if (!this.datasource) {
      this.datasourceSrv.get('HanSight').then(ds => {
        this.datasource = ds;
        this._request()
      }, err => {
        console.log(err);
        this.loading = false;
      });
    } else {
      this._request();
    }
  }

  _request() {
    this.datasource
      ._request('POST', '/view')
      .then(res => {
        this.records = res;
      }).finally(() => {
      this.loading = false;
    });
  }

}
