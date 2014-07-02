/*
app/states/fourOhFour.js
 */
define(['app/module'], function (module) {

  module.controller('fourOhFourCtlr', [

    '$scope', '$window',
    function ($scope, $window) {
      $scope.goBack = function () {
        $window.history.back();
      };
    }

  ]);

});
