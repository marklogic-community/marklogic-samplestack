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

      // todo -- there is no real reason that we should be
      // doing it this way -- it is sloppy to use jqLite outside of
      // directives -- should set scope property
      // var htmlElement = window.angular.element(document.children[0]);
      // htmlElement.addClass('spun');
    }

  ]);

});
