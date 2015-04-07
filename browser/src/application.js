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

define(['app/module', 'app/components'], function (module) {

  // Each referenced component is responsible for defining itself and adding
  // itself to the module.
  //
  // It is thus sufficient to return the module now -- we have forced
  // all components to be defined and included.

  //read buildParams app settings into a variable via lodash template

  var buildOptions;
  /* jscs:disable */
  /* jshint ignore:start */
  buildOptions = {
    enableCsrf: <%= JSON.stringify(options.enableCsrf) %>,
    html5Mode: <%= JSON.stringify(options.html5Mode) %>
  };
  /* jshint ignore:end */
  /* jscs:enable */

  module.config([
    '$provide',
    'mlAuthProvider',
    'mlHttpInterceptorProvider',
    'appRoutingProvider',
    'statesHierarchy',
    function (
      $provide,
      mlAuthProvider,
      mlHttpInterceptorProvider,
      appRoutingProvider,
      statesHierarchy
    ) {

      $provide.decorator('$exceptionHandler', function (
        $delegate, $injector
      ) {
        return function (exception, cause) {
          var $rootScope = $injector.get('$rootScope');
          var alert = 'Exception:\n\n* ' + exception.message;
          if (cause) {
            alert += '\n\nCause: ' + cause;
          }

          var trace;
          try {
            trace = window.stacktrace({ e: exception });
            if (trace) {
              alert += '\n\nStack trace:\n\n<pre>' +
                  trace.join('\n') + '</pre>\n';
            }
          }
          catch (err) {}

          $rootScope.globalError = alert;
          $rootScope.loading = false;

          $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.globalError = '';
          });

          $delegate(exception, cause);
        };
      });

      mlAuthProvider.sessionModel = 'ssSession';
      mlHttpInterceptorProvider.enableCsrf = buildOptions.enableCsrf;

      // Apply the statesHierarchy as configuration for the
      // appRoutingProvider/appRouting service.
      appRoutingProvider.configure(statesHierarchy);

      if (buildOptions.html5Mode === false) {
        appRoutingProvider.forceHashMode();
      }

    }

  ]);

  return module;
});
