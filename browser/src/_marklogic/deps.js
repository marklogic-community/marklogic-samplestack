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
    'angular': 'deps/angular/angular<%=options.min%>',
    'angular-cookies': 'deps/angular-cookies/angular-cookies<%=options.min%>',
    'moment': 'deps/momentjs/moment<%=options.min%>',
    'lodash': 'deps/lodash/dist/lodash.compat<%=options.min%>'
  },

  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-cookies': {
      deps: ['angular']
    }
  }
});

define(
  [
    'moment',
    'angular',
    'angular-cookies'
  ],
  function (moment, angular) {

    // angular is made global as a convenience.
    window.angular = angular;

    window.moment = moment;

    // we won't introduce any angular dependencies -- otherwisethis would be
    // an array
    return ['ngCookies'];
  }
);
