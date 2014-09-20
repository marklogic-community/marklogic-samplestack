define(['app/module'], function (module) {

  /**
   * @ngdoc directive
   * @name ssSearchResult
   * @restrict E
   *
   * @description
   * Directive for displaying a search result from a set of results.
   *
   * The view binds to various properties of the `$scope.item` property.
   */

  module.directive('ssSearchResult', [
    '$parse', 'mlUtil',
    function ($parse, mlUtil) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssSearchResult.html',
      };
    }
  ]);
});
