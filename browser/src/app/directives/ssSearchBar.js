define(['app/module'], function (module) {

  /* jshint ignore:start */

  /*
   * @ngdoc directive
   * @name ssSearchBar
   * @restrict E
   *
   * @description
   * Directive for displaying a search input form and a button that
   * applies the text in the form to the search criteria
   */

  /* jshint ignore:end */

  module.directive('ssSearchBar', function () {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssSearchBar.html',
      link: function (scope) {
        scope.setQueryText = function () {
          scope.$emit('setQueryText', { queryText: scope.searchbarText });
        };
        scope.clearSearch = function () {
          scope.searchbarText = null;
          scope.showTips = false;
        };
        scope.showTips = false;
      }
    };
  });
});
