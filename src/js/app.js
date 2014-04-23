define(['angular', 'ui-router', 'state-helper'], function(ng) {
  'use strict';

  var app = ng.module('<%= appName %>', [
    'ui.router', 'ui.router.stateHelper'
  ]);

  app.value('version', '0.0.0');

  return app;

});
