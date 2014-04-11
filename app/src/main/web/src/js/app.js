define(['angular', 'ui-router'], function(ng) {
  'use strict';

  return ng.module('<%= settings.appName || \'app\' %>', ['ui.router']);
});
