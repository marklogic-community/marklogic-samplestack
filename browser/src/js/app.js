define([
  'angular',
  'marked',
  'angular-dialogs',
  'ui-router',
  'state-helper',
  'ui-bootstrap',
  'spinner',
  'angular-sanitize',
  'angular-marked'
], function(ng, marked) {
  'use strict';

  // marked and angular-marked are conspiring to make this difficult.
  // angular-marked wants to find marked on the window object, but
  // marked knows about AMD and doesn't put iself there.
  //
  // so before we get near angular-marked, but marked on window

  window.marked = marked;

  var app = ng.module('app', [
    'ui.router',
    'ui.router.stateHelper',
    'ui.bootstrap',
    'angularSpinner',
    'dialogs.main',
    'ngSanitize',
    'hc.marked'
  ]);

  app.value('version', '<%= pkg.version %>');

  return app;

});
