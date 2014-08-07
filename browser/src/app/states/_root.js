define(['app/module'], function (module) {

  module.controller('rootCtlr', [

    '$scope',
    '$rootScope',
    '$q',
    'marked',
    'mlAuth',
    'loginDialog',
    'contributorDialog',
    function (
      $scope,
      $rootScope,
      $q,
      marked,
      mlAuth,
      loginDialog,
      contributorDialog
    ) {
      $rootScope.marked = marked;
      $rootScope.globalError = '';
      $rootScope.setLocalError = function (error) {
        $rootScope.localError = error;
      };
      $rootScope.clearLocalError = function () {
        $rootScope.localError = null;
      };
      $rootScope.$on('$stateChangeSuccess', function () {
        $rootScope.clearLocalError();
      });

      var initDefer = $q.defer();
      $rootScope.initializing = initDefer.promise;

      $q.all([
        // anything that is required for init should happen here
        mlAuth.restoreSession()
      ]).then(
        function () {
          $rootScope.initialized = true;
          delete $rootScope.initializing;
          initDefer.resolve();
        }
      );

      $scope.setPageTitle = function (title) {
        $rootScope.pageTitle = title;
      };

      $scope.openLogin = function () {
        loginDialog();
      };

      $scope.$on('showContributor', function (evt, args) {
        contributorDialog(args.contributorId);
      });

    }

  ]);

});
