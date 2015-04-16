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

define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc provider
   * @name mlHttpInterceptorProvider
   *
   * @description
   * Configures CSRF handling in the {@link mlHttpInterceptor}.
   *
   * @property {boolean=} [enableCsrf=`false`] If true, CSRF handling is enabled
   * and the browser app will blcok until it can get a CSRF token.
   *
   * @property {string=} [endpoint="/v1/session"] Configured the endpoint
   * for requesting the CSRF token. Defaults to `'/v1/sesion'`.

   * @property {string=} [headerName="X-CSRF-TOKEN"] The header name
   * for the CSRF token.  Defaults to X-CSRF-TOKEN.
   */
  module.provider('mlHttpInterceptor', [

    function () {
      var self = this;

      this.enableCsrf = true;
      this.csrfUrl = '/v1/session';
      this.headerName = 'X-CSRF-TOKEN';

      /**
       * @ngdoc service
       * @name mlHttpInterceptor
       * @requires mlUtil
       *
       * @description
       * Handles CSRF tokens for all AJAX requests. May be configured or
       * disabled  in the
       * {@link mlHttpInterceptorProvider}.
       *
       * The intercept assumes that the CSRF token is named `X-CSRF-TOKEN`.
       * and that it may be retrived from a GET request to
       * `<protocol:server:port>//v1/session`.
       *
       * As such, before the interceptor will allow through
       * any methods that require CSRF (POST, PUT, PATCH, DELETE), it will
       * attempt to do a round trip to the /v1/session endpoint to pick
       * up the token from the server.
       *
       * The token is saved in the `$http` service default headers and will
       * be supplied for all requests subsequently.
       */
      this.$get = [
        // we inject injector in order to avoid circular dependency on $http
        '$injector', '$q', 'mlUtil', 'mlStore', '$rootScope',
        function ($injector, $q, mlUtil, mlStore, $rootScope) {

          var $http;
          var outstanding;

          var csrfMethods = {
            'POST': true,
            'PUT': true,
            'PATCH': true,
            'DELETE': true
          };

          // whether or not we need to get csrf before doing what the app
          // actually wants
          var mustGetCsrf = function (config) {

            return csrfMethods[config.method]
                && !$http.defaults.headers.common[self.headerName];
          };

          // return a promise to have set the csrf header default. To do this,
          // round-trip with the server on get /v1/session
          var setCsrf = function () {
            if (outstanding) {
              return outstanding;
            }
            else {
              var requestConfig = {
                method: 'GET',
                url: self.csrfUrl,
                doNotOverride: true
              };
              var deferred = $q.defer();
              $http(requestConfig).then(
                function (response) {
                  // if the server doesn't give us a CSRF token, we should
                  // we complain? TODO
                  var token = response.headers(self.headerName);
                  if (token){
                    $http.defaults.headers.common[self.headerName] = token;
                  }
                  else {
                    $http.defaults.headers.common[self.headerName] = 'dummy';
                  }
                  deferred.resolve(token);
                },
                function (reason) {
                  deferred.reject(
                    new Error('unable to get CSRF token', reason)
                  );
                }
              );

              outstanding = deferred.promise;
              return outstanding;
            }
          };

          var setCsrfThenResolveConfig = function (config) {
            var deferred = $q.defer();

            setCsrf().then(
              function (token) {
                config.headers[self.headerName] = token;
                deferred.resolve(config);
              },
              deferred.reject
            );

            return deferred.promise;
          };

          return {

            request: function (config) {
              // ensure we have $http
              $http = $http || $injector.get('$http');

              if (!self.enableCsrf) {
                return config;
              }
              else {
                if (mustGetCsrf(config)) {
                  return setCsrfThenResolveConfig(config);
                }
                else {
                  return config;
                }
              }
            },

            responseError: function (rejection) {
              var timeoutMsg =
                  '$http response.status === 0. This may indicate a timeout. ' +
                      'Is the middle tier working?';
              if (rejection.status === 0) {
                return $q.reject(timeoutMsg);
              }
              if (rejection.data && rejection.data.status === 500 &&
                  /RESTAPI-NODOCUMENT/.test(rejection.data.message)
              ) {
                rejection.status = 404;
              }

              if (rejection.status === 404) {
                // not found
                if (mlStore.session && mlStore.session.id) {
                  // someone is logged in
                  $rootScope.errorCondition = 'notFoundWithSession';
                }
                else {
                  $rootScope.errorCondition = 'notFoundNoSession';
                  // noone is logged in
                }
              }

              if (
                rejection.status === 401 ||
                rejection.status === 403
              ) {
                // permissions
                // what is state of session?
                if (mlStore.session && mlStore.session.id) {
                  // someone is logged in
                  $rootScope.errorCondition = 'preventedWithSession';
                }
                else {
                  $rootScope.errorCondition = 'preventedNoSession';
                  // noone is logged in
                }
              }
              return $q.reject(rejection);
            }
          };

        }
      ];
    }
  ]);

  var regexIso8601;
  /* jshint ignore:start */
  regexIso8601 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
  /* jshint ignore:end */

  // courtesy
  var convertDateStringsToDates = function (input) {
    var key;
    // Ignore things that aren't objects.
    if (typeof input === 'object') {
      /* jshint -W089 */
      for (key in input) {
        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === 'string' && (match = value.match(regexIso8601))) {
          input[key] = window.moment(value, window.moment.ISO_8601);
        }
        else {
          // Recurse into object
          convertDateStringsToDates(value);
        }
      }
    }
  };

  // add mlHttpInterceptor to interceptors list of $httpProvider
  module.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('mlHttpInterceptor');
      $httpProvider.defaults.transformResponse.push(function (responseData) {
        convertDateStringsToDates(responseData);
        return responseData;
      });
    }
  ]);

});
