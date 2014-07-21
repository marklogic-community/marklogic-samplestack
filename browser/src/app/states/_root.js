/*
app/states/_root.js
 */
define(['app/module'], function (module) {

  module.controller('rootCtlr', [

    // TODO: unstub data

    '$scope', '$rootScope', 'stubData',
    function ($scope, $rootScope, stubData) {
      $scope.searchResults = stubData;

      $scope.setPageTitle = function (title) {
        $rootScope.pageTitle = title;
      };
    }

  ]);

});
