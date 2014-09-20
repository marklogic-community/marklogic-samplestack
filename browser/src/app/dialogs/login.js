define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name loginDialogCtlr
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssSession Session object
   * @param {object} mlAuth Authentication object
   * @description
   * Controller for {@link loginDialog}. The controller is injected by the
   * $modal service.
   *
   * Used to provide a user interface through which to autenticate a user.
   *
   * Upon instantiation the `loginDialogCtlr` creates an empty instance of
   * {@link ssSession} for handling authentication.
   *
   * @property {string} $scope.error If present, indicates textually what
   * error occured while attempting to authenticate a user.
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


      /**
       * @ngdoc method
       * @name loginDialogCtlr#$scope.authenticate
       * @description Initiate authentication of the `$scope.session`
       * credentials.
       *
       * On success, closes the dialog.
       *
       * On failure, reports the failure to the user via the `$scope.error`
       * property.
       */
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

      /**
       * @ngdoc method
       * @name loginDialogCtlr#$scope.cancel
       * @description Dismisses the dialog.
       */
      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

    }
  ]);

  /**
   * @ngdoc dialog
   * @name loginDialog
   * @kind function
   *
   * @description User interface for logging into the Samplestack application.
   *
   * This is the service that cobfigures the dialog and
   * the {@link loginDialogCtlr}, and launches the dialog.
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
