import { PanelCtrl } from 'app/plugins/sdk';
import i18n from 'app/core/i18n';

export default class PcapCtrl extends PanelCtrl {
  static templateUrl = `public/app/plugins/panel/hansight_pcap/module.html`;

  query: {
    localIP: string,
    localPort: string,
    remoteIP: string,
    remotePort: string,
    startTime: any,
    endTime: any
  };

  datasourceSrv: any;
  datasource: any;
  backendSrv: any;
  _submitting: boolean;
  _pop1: boolean;
  _pop2: boolean;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    this.query = {
      localIP: '',
      localPort: '',
      remoteIP: '',
      remotePort: '',
      startTime: new Date(),
      endTime: new Date()
    };
    this._submitting = false;
    this._pop1 = false;
    this._pop2 = false;
    this.backendSrv = $injector.get('backendSrv');
    this.datasourceSrv = $injector.get('datasourceSrv');
    this.datasource = null;
  }

  getMenu() {
    let menu = [];
    menu.push({text: i18n.t('View'), click: 'ctrl.viewPanel(); dismiss();'});
    if (!this.fullscreen) { //  duplication is not supported in fullscreen mode
      menu.push({ text: i18n.t('Duplicate'), click: 'ctrl.duplicate()', role: 'Editor' });
    }
    return menu;
  }

  initEditMode() {
    this.editorTabs = [];
  }

  download() {
    this._submitting = true;
    if (!this.datasource) {
      this.datasourceSrv.get('HanSight').then(ds => {
        this.datasource = ds;
        this._request()
      }, err => {
        console.log(err);
        this._submitting = false;
      });
    } else {
      this._request();
    }
  }

  _request() {
    this.datasource
      .queryPcapDownloadUrl(this.query)
      .then(res => {
        location.href = res.url;
      }).finally(() => {
      this._submitting = false;
    });
  }

  open() {
    console.log('fo');
    this._pop2 = true;
  }
}
