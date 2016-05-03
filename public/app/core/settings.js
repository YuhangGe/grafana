define([
  'lodash',
  'app/core/i18n'
],
function (_, i18n) {
  "use strict";
  return function Settings (options) {
    var defaults = {
      datasources                   : {},
      window_title_prefix           : i18n.t('HanSight') + ' - ',
      panels                        : {},
      new_panel_title: i18n.t('Panel Title'),
      playlist_timespan: "1m",
      unsaved_changes_warning: true,
      appSubUrl: ""
    };
    return _.extend({}, defaults, options);
  };
});
