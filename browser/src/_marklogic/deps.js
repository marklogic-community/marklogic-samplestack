/*
marklogic/deps.js

Load all dependency modules files  and return an array of their angular module
names.

TODO: consider possibility of autogenerting here.

TODO: figure out whether things like angular should be manually
referenced where used.

 */

require.config({
  paths: {
    'angular': 'deps/angular/angular<%=min%>',
    'angular-cookies': 'deps/angular-cookies/angular-cookies<%=min%>',
    'moment': 'deps/momentjs/moment<%=min%>',
    'lodash': 'deps/lodash/dist/lodash.compat<%=min%>'
  },

  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-cookies': {
      deps: ['angular']
    },
    'restangular': {
      deps: ['angular', 'lodash']
    }
  }
});

define(
  [
    'angular',
    'angular-cookies'
  ],
  function (angular) {

    // angular is made global as a convenience.
    window.angular = angular;

    // we won't introduce any angular dependencies -- otherwisethis would be
    // an array
    return ['ngCookies'];
  }
);
