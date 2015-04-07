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

define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name loginDialogCtlr
   * @description
   * Controller for {@link loginDialog}. The controller is injected by the
   * $modal service. Provides a user interface for authenticating a user.
   * Upon instantiation the `loginDialogCtlr` creates an empty instance of
   * {@link ssSession} for handling authentication. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssSession Session object
   * @param {object} mlAuth Authentication object
   *
   * @property {string} $scope.error If present, indicates what error
   * occurred while attempting to authenticate a user.
   * @property {string} $scope.session.username The username input.
   * @property {string} $scope.session.password The password input.
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

      // some browsers don't raise events when they autocomplete
      var getFromInputByClass = function (className) {
        var el = angular.element(
          document.getElementsByClassName(className).item(0)
        );
        return el.val();
      };

      var credentialsHack = function () {
        $scope.session.username = getFromInputByClass('ss-input-username');
        $scope.session.password = getFromInputByClass('ss-input-password');
      };

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
        credentialsHack();
        mlAuth.authenticate($scope.session).then(
          onAuthSuccess,
          onAuthFailure
        );
      };

      /**
       * @ngdoc method
       * @name loginDialogCtlr#$scope.onAuthSuccess
       * @description Called upon successful authentication and closes the
       * dialog.
       */
      var onAuthSuccess = function (user) {
        $modalInstance.close(user);
      };

      /**
       * @ngdoc method
       * @name loginDialogCtlr#$scope.onAuthFailure
       * @description Called upon failed authentication. Sets the error message
       * and attaches a ssSession object with username information only to
       * scope.
       */
      var onAuthFailure = function (reason) {
        $scope.error = 'Login Failed: ' + reason;
        ssSession.create( { username: $scope.session.username })
            .attachScope($scope, 'session');
      };

      /**
       * @ngdoc method
       * @name loginDialogCtlr#$scope.cancel
       * @description Dismisses the dialog (without logging in)
       */
      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

      var randomName = function () {
        var text = '';
        var possible = 'abcdefghijklmnopqrstuvwxyz';
        var i;
        for (i = 0; i < 8; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
      };

      $scope.random1 = randomName();
      $scope.random2 = randomName();

    }
  ]);

  /**
   * @ngdoc dialog
   * @name loginDialog
   * @kind function
   * @description A UI Bootstrap component that provides a modal dialog for
   * logging into the Samplestack application. When called, this service
   * configures the dialog and the controller {@link loginDialogCtlr}, and
   * launches the dialog using the template. The size property controls the
   * size of the dialog. See <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   */
  module.factory('loginDialog', [
    '$modal',
    function ($modal) {
      return function () {
        return $modal.open({
          templateUrl : '/app/dialogs/login.html',
          controller : 'loginDialogCtlr',
          size : 'sm'
        }).result;
      };
    }
  ]);

});
