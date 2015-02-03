define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name fourOhFourCtlr
   * @description
   * Controller for the root.layout.fourOhFour ui-router state,
   * which handles page-not-found conditions.
   */
  module.controller('fourOhFourCtlr', [

    '$scope', '$window',
    function ($scope, $window) {

     /**
      * @ngdoc method
      * @name fourOhFourCtlr#$scope.goBack
      * @description Sends the browser back to the previous page.
      */
      $scope.goBack = function () {
        $window.history.back();
      };

    }

  ]);

});
