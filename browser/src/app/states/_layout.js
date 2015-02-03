define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name layoutCtlr
   * @description
   * Controller for the layout ui-router state of the application.
   * Provides methods available across child states.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {object} appRouting (injected)
   * @param {object} appInitialized Object with mlAuth session data
   */
  module.controller('layoutCtlr', [
    '$scope', 'appRouting', 'appInitialized',
    function ($scope, appRouting, appInitialized) {

      /**
       * @ngdoc method
       * @name layoutCtlr#$scope.ask
       * @description Routes user to Ask a Question page
       */
      $scope.ask = function () {
        appRouting.go('root.layout.ask');
      };
    }

  ]);
});
