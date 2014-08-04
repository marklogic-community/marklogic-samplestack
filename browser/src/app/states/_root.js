define(['app/module'], function (module) {

  module.controller('rootCtlr', [

    '$scope',
    '$rootScope',
    '$q',
    'mlAuth',
    'loginDialog',
    'contributorDialog',
    function (
      $scope,
      $rootScope,
      $q,
      mlAuth,
      loginDialog,
      contributorDialog
    ) {
      var initDefer = $q.defer();
      $rootScope.initializing = initDefer.promise;

      $q.all([
        // antyhing that is required for init should happen here
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
