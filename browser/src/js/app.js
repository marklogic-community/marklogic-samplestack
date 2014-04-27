define([
  'angular',
  'ui-router',
  'state-helper',
  'ui-bootstrap',
  'spinner',
  'dialogs',
  'angular-sanitize'
], function(ng) {
  'use strict';

  var app = ng.module('app', [
    'ui.router',
    'ui.router.stateHelper',
    'ui.bootstrap',
    'angularSpinner',
    'dialogs',
    'ngSanitize'
  ]);

  app.value('version', '<%= pkg.version %>');

  return app;

});
