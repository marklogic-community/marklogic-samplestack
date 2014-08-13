define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name loginDialogCtlr
   * @usage the controller is injected by the $modal service
   * @description
   * Controller for {@link loginDialog}.
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssSession Session object
   * @param {object} mlAuth Authentication object
   */
  module.controller('loginDialogCtlr', [

    '$scope',
    '$modalInstance',
    'ssSession',
    'mlAuth',
    function (
      $scope,
      $modalInstance,
      ssSession,
      mlAuth
    ) {

      ssSession.create().attachScope($scope, 'session');

      $scope.authenticate = function () {
        mlAuth.authenticate($scope.session).then(
          onAuthSuccess,
          onAuthFailure
        );
      };

      var onAuthSuccess = function (user) {
        $modalInstance.close(user);
      };

      var onAuthFailure = function (reason) {
        $scope.error = 'Login Failed: ' + reason.statusText;
      };

      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

    }
  ]);

  /**
   * @ngdoc service
   * @name loginDialog
   *
   * @description
   * Displays a user login form in a modal.
   * Uses <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a>.
   * @param {object} $modal (injected)
   */

  module.factory('loginDialog', [
    '$modal',
    function ($modal) {
      return function () {
        return $modal.open({
          templateUrl : '/app/dialogs/login.html',
          controller : 'loginDialogCtlr'
        }).result;
      };
    }
  ]);

});
