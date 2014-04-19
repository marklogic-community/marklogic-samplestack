define(['angular', 'ui-router', 'state-helper'], function(ng) {
  'use strict';

  return ng.module('<%= appName %>', [
    'ui.router', 'ui.router.stateHelper'
  ]);
});
