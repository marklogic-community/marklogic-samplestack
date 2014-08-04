/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.
 */

require.config({
  paths: {
    'deps': '/deps',

    'lodash': 'deps/lodash/dist/lodash.compat<%=min%>',
    'angular': 'deps/angular/angular<%=min%>',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router<%=min%>',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper<%=min%>',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls<%=min%>',
    'jquery': 'deps/jquery/dist/jquery<%=min%>',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text'
  },

  shim: {
    'angular': { exports: 'angular', deps: ['jquery'] },
    'angular-mocks': { deps: ['angular'] },
    'ui-router': { deps: ['angular'] },
    'state-helper': { deps: ['angular', 'ui-router'] },
    'ui-bootstrap': { deps: ['angular'] }
  }
});

define(
  [
    // first include those that we actually need to "handle" while we load
    // them here.  List them first so that only those that need special
    // handling need to be referenced in the callback function.
    'lodash',
    'angular',

    'ui-router',
    'state-helper',
    'ui-bootstrap',

    '_marklogic/marklogic'
  ],
  function (lodash, angular) {

    // lodash and angular are made global as a convenience.
    window._ = lodash;
    window.angular = angular;

    return [
      'ui.router',
      'ui.router.stateHelper',
      'ui.bootstrap',

      '_marklogic'
    ];
  }
);
