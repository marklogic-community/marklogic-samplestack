/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
