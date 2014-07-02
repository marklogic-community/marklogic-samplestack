/*
app/states/_layout.js
 */
define(['app/module'], function (module) {

  module.controller('layoutCtlr', [

    '$scope', 'appRouting',
    function ($scope, appRouting) {
      // TODO: this is dead code, do we need a controller?
      // $scope.collapsed = true;


      $scope.ask = function () {
        appRouting.go('ask');
      };
    }

  ]);

});
