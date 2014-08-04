define(['app/module'], function (module) {

  module.controller('askCtlr', [

    '$scope', 'appRouting',
    function ($scope, appRouting) {

      $scope.setPageTitle('ask');

      $scope.post = function () {
        appRouting.go('qnaDoc');
      };

    }

  ]);

});
