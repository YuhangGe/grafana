export default class HanSightDatasource {

  url: string;
  $q: any;
  backendSrv: any;
  name: string;
  type: string;
  directUrl: string;
  basicAuth: any;
  withCredentials: any;

  /** @ngInject */
  constructor(instanceSettings, $q, backendSrv) {
    this.url = instanceSettings.url;
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.name = instanceSettings.name;
    this.type = 'hansight';
    this.directUrl = instanceSettings.directUrl;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
  }

  queryPcapDownloadUrl(fourTuple) {
    return this._request('POST', '/pcap', fourTuple);
  }

  _request(method, url, data) {
    var options: any = {
      url: this.url + url,
      method: method
    };

    if (data) {
      options.data = data;
    }

    if (this.basicAuth || this.withCredentials) {
      options.withCredentials = true;
    }
    if (this.basicAuth) {
      options.headers = {
        "Authorization": this.basicAuth
      };
    }
    return this.backendSrv.request(options);
  }
}
