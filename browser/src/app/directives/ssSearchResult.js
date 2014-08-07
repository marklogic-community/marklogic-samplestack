define(['app/module'], function (module) {

  /**
   * @ngdoc directive
   * @name ssSearchResult;
   * @restrict E
   *
   * @description
   * TBD
   *
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
