define([
  'app/module'
], function (module) {
  /* jshint ignore:start */

  /**
   * @ngdoc directive
   * @name ssAccountDropdown
   * @restrict A
   * @param {undefined} ssAccountDropdown
   *
   * @description
   * Display info for the logged-in user, and allows the user to
   * logout of their session.
   *
   * The <a href="http://getbootstrap.com/javascript/#dropdowns">Bootstrap
   * Dropdown</a> directive is used to display the dropdown.
   *
   * The template for this dropdown reads logged-in user information
   * from the `scope.store.session` object, an instance of
   * {@link ssSession}.
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `logout`  | {@type function}  | Emits a `logout` event |
   * | `store.session`  | {@link ssSession}  | As provided by $rootScope, provides session information. |
   */

  /* jshint ignore:end */

  module.directive('ssAccountDropdown', function () {
    return {
      restrict: 'A',
      templateUrl: '/app/directives/ssAccountDropdown.html',
      link: function (scope, element, attrs) {

        /**
         * @ngdoc method
         * @name ssAccountDropdown#logout
         */

        scope.logout = function () {
          // On logout, dispatch event to mlAuth.js
          scope.$emit('logout');
        };
      }
    };
  });
});
