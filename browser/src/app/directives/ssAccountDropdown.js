define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssAccountDropdown
   * @restrict E
   *
   * @description
   * Display info for the logged-in user inside a
   * <a href="http://getbootstrap.com/javascript/#dropdowns">Bootstrap
   * Dropdown</a> component.
   */
  module.directive('ssAccountDropdown', function () {
    return {
      restrict: 'A',
      templateUrl: '/app/directives/ssAccountDropdown.html',
      link: function (scope, element, attrs) {
        scope.logout = function () {
          // On logout, dispatch event to mlAuth.js
          scope.$emit('logout');
        };
      }
    };
  });
});
