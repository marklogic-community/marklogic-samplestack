define(['app/module'], function (module) {

  /*
   * @ngdoc directive
   * @name ssSearchBar
   * @restrict E
   *
   * @description
   * Directive for displaying a search input form.
   */
  module.directive('ssSearchBar', function () {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssSearchBar.html'
    };
  });
});
