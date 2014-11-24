define(['app/module'], function (module) {

  module.controller('rootCtlr', [

    '$scope',
    '$rootScope',
    '$q',
    '$log',
    'mlAuth',
    'loginDialog',
    'contributorDialog',
    function (
      $scope,
      $rootScope,
      $q,
      $log,
      mlAuth,
      loginDialog,
      contributorDialog
    ) {
      $rootScope.loading = false;
      $scope.setPageTitle = function (title) {
        $rootScope.pageTitle = title;
      };

      $scope.openLogin = function () {
        loginDialog();
      };

      $scope.$on('showContributor', function (evt, args) {
        contributorDialog(args.contributorId);
      });

      // convert spaces to dashes and encode dashes so that
      // we will tend to have a prettier url
      $scope.dasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, '%2D')
            .replace(/ /g, '-') :
          null;
      };

    }

  ]);

});
