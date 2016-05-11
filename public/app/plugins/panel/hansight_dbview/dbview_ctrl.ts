import { PanelCtrl } from 'app/plugins/sdk';

export default class DBViewCtrl extends PanelCtrl {
  static templateUrl = `public/app/plugins/panel/hansight_dbview/module.html`;

  backendSrv: any;
  datasourceSrv: any;
  datasource: any;
  records: any;
  props: any;
  loading: boolean;
  $filter: any;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    this.backendSrv = $injector.get('backendSrv');
    this.datasourceSrv = $injector.get('datasourceSrv');
    this.$filter = $injector.get('$filter');
    this.datasource = null;
    this.records = [];
    this.props = [];
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
        this.records = res.map(record => {
          record.timestamp = this.$filter('date')(record.timestamp, 'yyyy-MM-dd HH:mm');
          return record;
        });
        this.props = res.length > 0 ? Object.keys(res[0]) : [];
      }).finally(() => {
      this.loading = false;
    });
  }

}
