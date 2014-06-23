/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.

TODO: consider possibility of autogenerting here.

TODO: figure out whether things like angular, lodash should be manually
referenced where used.

TODO: include angular-mocks somewhere for unit testing.

 */

require.config({
  paths: {
    'deps': '/deps',

    'lodash': 'deps/lodash/dist/lodash.compat<%=min%>',
    'angular': 'deps/angular/angular<%=min%>',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls<%=min%>',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router<%=min%>',
    'angular-marked': 'deps/angular-marked/angular-marked<%=min%>',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper<%=min%>',
    'marked': 'deps/marked/lib/marked<%=min%>'
  },

  shim: {
    'angular': { exports: 'angular' },
    // 'angular-mocks': {
    //   deps: ['angular']
    // },
    'ui-bootstrap': { deps: ['angular'] },
    'ui-router': { deps: ['angular'] },
    'angular-marked': { deps: ['angular', 'marked'] },
    // 'angular-sanitize': {
    //   deps: ['angular']
    // },
    // 'angular-translate': {
    //   deps: ['angular']
    // },
    // 'marked': {
    //   exports: 'marked'
    // },
    'state-helper': { deps: ['angular', 'ui-router'] },

    // 'spinner': {
    //   deps: ['spinjs']
    // },
    // 'angular-dialogs': {
    //   deps: ['ui-bootstrap', 'angular-sanitize', 'angular-translate']
    // },
    // 'mocha': {
    //   exports: 'mocha'
    // },
    // 'sinon-chai': {
    //   deps: ['sinon']
    // }
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
    //TODO: possibly rearrange bootstrap-tpls to use customized
    'ui-bootstrap',
    'marked',
    'angular-marked',

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
      'hc.marked',

      // this one isn't auto-generated -- marklogic.sample includes
      // some of its own dependencies.  We need not concern ourselves
      // with those here.
      'marklogic.sample'
    ];
  }
);
