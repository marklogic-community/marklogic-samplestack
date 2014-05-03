(function (undefined) {

  this.app.controller('fourOhFourCtlr', [

    '$scope', '$window',
    function ($scope, $window) {
      $scope.goBack = function () {
        $window.history.back();
      };
    }

  ]);

}).call(global);
