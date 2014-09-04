define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc provider
   * @name mlHttpInterceptorProvider
   *
   * @description
   * Configures CSRF handling in the {@link mlHttpInterceptor}.
   *
   * @property {boolean=} [disableCsrf=`false`] If true, CSRF handling on
   * requests
   * will be suppressed and CSRF tokens on responses will be ignored.
   * Defaults to `false` (CSRF enabled).
   *
   * @property {string=} [endpoint="/v1/session"] Configured the endpoint
   * for requesting the CSRF token. Defaults to `'/v1/sesion'`.

   * @property {string=} [headerName="X-CSRF-TOKEN"] The header name
   * for the CSRF token.  Defaults to X-CSRF-TOKEN.
   */
  module.provider('mlHttpInterceptor', [

    function () {
      var self = this;

      this.disableCsrf = false;
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
        '$injector', '$q', 'mlUtil',
        function ($injector, $q, mlUtil) {

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

              if (self.disableCsrf) {
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
                rejection.status = 401;
                return $q.reject(rejection);
              }
              return $q.reject(rejection);
            }
          };

        }
      ];
    }
  ]);

  module.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('mlHttpInterceptor');
    }
  ]);

});
