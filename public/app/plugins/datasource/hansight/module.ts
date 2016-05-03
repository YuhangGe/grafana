import HanSightDatasource from './datasource';
import HanSightQueryCtrl from './query_ctrl';

class HanSightConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class HanSightAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  HanSightDatasource as Datasource,
  HanSightQueryCtrl as QueryCtrl,
  HanSightConfigCtrl as ConfigCtrl,
  HanSightAnnotationsQueryCtrl as AnnotationQueryCtrl
}
