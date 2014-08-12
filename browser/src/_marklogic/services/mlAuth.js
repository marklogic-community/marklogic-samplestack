define(['_marklogic/module'], function (module) {

  module.provider('mlAuth', [

    function () {

      this.sessionModel = 'mlSession';

      this.$get = [
        '$injector',
        '$rootScope',
        '$q',
        '$window',
        '$cookieStore',
        'mlStore',
        function (
          $injector,
          $rootScope,
          $q,
          $window,
          $cookieStore,
          mlStore
        ) {
          var sessionModel = $injector.get(this.sessionModel);

          $rootScope.$on('logout', function (evt) {
            svc.logout().then(
              angular.noop,
              function (err) {
                $rootScope.$broadcast('logoutFailed', err);
                $window.alert(
                  'An error ocurred while logging out: ' + err
                );
              }
            );
          });

          var svc = {};

          svc.restoreSession = function () {
            var deferred = $q.defer();

            if (!mlStore.session) {
              var sessionId;
              try {
                sessionId = $cookieStore.get('sessionId');
              }
              catch (err) { $rootScope.log(err); }

              if (sessionId) {

                var sess = sessionModel.getOne(sessionId);
                sess.$ml.waiting.then(
                  // TODO: if/we we have an auth interceptor, this one
                  // should be exempt from it -- we'd prefer to drop the
                  // session silently
                  function () {
                    try {
                      $cookieStore.put('sessionId', sess.id);
                    }
                    catch (err) { $rootScope.log(err); }

                    mlStore.session = sess;
                    deferred.resolve(sess);
                  },
                  function () {
                    // don't really care -- we just don't have a session
                    // won't clear cookie b/c might work next time
                    deferred.resolve();
                  }
                );
              }
              else {
                // we don't think we have a session
                deferred.resolve();
              }
            }
            else {
              deferred.resolve(mlStore.session);
            }
            return deferred.promise;
          };

          svc.authenticate = function (session) {
            var deferred = $q.defer();

            var sess = sessionModel.post(session);
            sess.$ml.waiting.then(
              function () {
                mlStore.session = sess;
                try {
                  $cookieStore.put('sessionId', sess.id);
                }
                catch (err) { $rootScope.log(err); }
                deferred.resolve(sess);
              },
              deferred.reject
            );
            return deferred.promise;
          };

          svc.logout = function () {
            var deferred = $q.defer();

            var successHandler = function () {
              $cookieStore.remove('sessionId');
              delete mlStore.session;
              deferred.resolve();
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
