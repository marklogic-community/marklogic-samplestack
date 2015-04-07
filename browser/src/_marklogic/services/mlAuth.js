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
   * @name mlAuthProvider
   * @description May be used to configure the {@link mlAuth} service.
   *
   * @property {string} sessionModel May be used to override the name of the
   * service that should be used as the domain model for sessions.
   *
   * By default, the sessionModel is {@link mlSession}.
   *
   * Samplestack customizes the session to be an insatnce of {@link ssSession}.
   */
  module.provider('mlAuth', [

    function () {

      this.sessionModel = 'mlSession';

      /**
       * @ngdoc service
       * @name mlAuth
       * @requires mlStore
       *
       * @description Facilities for handling authentication and sessions.
       *
       * It provides for logging in and out of a session and for events and
       * properties to track status or presence/absense of a sesssion.
       *
       * Once injected, `mlAuth` immediatly configures a listener on the
       * ``$rootScope` for `logout` events. When such an event occurs, it
       * logs out the user if there is an authenticated session and then
       * broadcasts `sessionChange`.
       */

      this.$get = [
        '$injector',
        '$rootScope',
        '$q',
        '$window',
        '$cookieStore',
        '$timeout',
        'mlStore',
        '$location',
        function (
          $injector,
          $rootScope,
          $q,
          $window,
          $cookieStore,
          $timeout,
          mlStore,
          $location
        ) {
          var sessionModel = $injector.get(this.sessionModel);

          var onSessionChange = function () {
            $rootScope.$broadcast('sessionChange');
          };

          $rootScope.$on('logout', function (evt) {
            svc.logout().then(
              function () {
                onSessionChange();
              },
              function (err) {
                $rootScope.$broadcast('logoutFailed', err);
                $window.alert(
                  'An error ocurred while logging out: ' + err
                );
              }
            );
          });

          var svc = {};

          /**
           * @ngdoc method
           * @name mlAuth#restoreSession
           * @returns {angular.Promise} promise to restore the session (or
           * to reject if session is not present or cannot be resotred).
           *
           * @description Attempts to find an existing, valid session, first
           * by determining whether on is already present in the
           * `$rootScope.store`, and then by checkikng the `sessionId` cookie.
           *
           * If a session is found in the cookie, the object for the session
           * is optimistically reinstantiated and an attempt is made to verify
           * the sesion with the server and to retrieve additional properties
           * of the sesssion. If that succeeds, the session is consider valid
           * and active.
           *
           * Otherwise, or if any other error occurs, we consider there to be
           * no active session and traces of any prior session are removed.
           *
           * Within the processing of this function, if there is a change
           * to the session state, a `sessionChange` event is broaccast on
           * $rootScope.
           *
           */
          svc.restoreSession = function () {
            var deferred = $q.defer();

            if (!mlStore.session) {
              var sessionId;
              try {
                sessionId = $cookieStore.get('sessionId');
              }
              catch (err) {
                $rootScope.log(err);
              }

              if (sessionId) {

                var sess = sessionModel.getOne(sessionId);
                sess.$ml.waiting.then(
                  // TODO: if/we we have an auth interceptor, this one
                  // should be exempt from it -- we'd prefer to drop the
                  // session silently
                  function () {
                    if (sess.$ml.invalid) {
                      delete mlStore.session;
                      deferred.resolve();
                      onSessionChange();
                    }
                    else {
                      try {
                        $cookieStore.put('sessionId', sess.id);
                        mlStore.session = sess;
                      }
                      catch (err) {
                        $rootScope.log(err);
                      }

                      deferred.resolve(sess);
                      onSessionChange();
                    }
                  },
                  function () {
                    // don't really care -- we just don't have a session
                    // won't clear cookie b/c might work next time
                    deferred.resolve();
                    onSessionChange();
                  }
                );
              }
              else {
                // we don't think we have a session
                deferred.resolve();
                onSessionChange();
              }
            }
            else {
              // already have a session
              deferred.resolve(mlStore.session);
            }
            return deferred.promise;
          };

          /**
           * @ngdoc method
           * @name mlAuth#authenticate
           * @param {object} session session object to use in attempting to
           * authenticate.
           * @return {angular.Promise} Promise to be resolved if successful
           * authetnication or rejected on failureto authenticate.
           * @description Authenticates (or reauthenticates) a user. On success,
           * stores the user id in a `sessionId` cookie.
           *
           */
          svc.authenticate = function (session) {
            var deferred = $q.defer();

            var sess = sessionModel.post(session);
            sess.$ml.waiting.then(
              function () {
                if (sess.$ml.invalid) {
                  deferred.reject(new Error(
                    'Invalid session data:\n' + JSON.stringify(sess)
                  ));
                }
                else {
                  try {
                    $cookieStore.put('sessionId', sess.id);
                    mlStore.session = sess;
                  }
                  catch (err) { $rootScope.log(err); }
                  deferred.resolve(sess);
                  onSessionChange();
                }
              },
              function (reason) {
                deferred.reject(new Error(reason.statusText));
                $rootScope.errorCondition = null;
              }
            );
            return deferred.promise;
          };

          /**
           * @ngdoc method
           * @name mlAuth#logout
           * @return {angular.Promise} Promise to be resolved upon logging
           * out the session or rejected on failure to log out.
           * @description Logs out of a session, including from the REST server
           * session that represents the browser session object..
           */
          svc.logout = function () {
            var deferred = $q.defer();

            var successHandler = function () {
              $cookieStore.remove('sessionId');
              delete mlStore.session;
              deferred.resolve();
              onSessionChange();
              $location.url('/');
            };

            // the heaviest part of being logged in is the cookie
            // the rest we'll just wipe out

            var sessionId;

            try {
              sessionId = $cookieStore.get('sessionId');
              sessionModel.del(sessionId).then(
                successHandler,
                deferred.reject
              );
            }
            catch (err) {
              $rootScope.log(err);
              // we can't log out of a session we can't identify
              deferred.reject(err);
            }

            return deferred.promise;
          };

          return svc;
        }
      ];
    }
  ]);

});
