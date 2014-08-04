define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssAccountDropdown
   * @restrict E
   *
   * @description
   * TBD
   */
  module.directive('ssAccountDropdown', function () {
    return {
      restrict: 'A',
      templateUrl: '/app/directives/ssAccountDropdown.html',
      link: function (scope, element, attrs) {
        scope.logout = function () {
          scope.$emit('logout');
        };
      }
    };
  });
});
