/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
        scope.open = false;

        scope.logout = function () {
          // On logout, dispatch event to mlAuth.js
          scope.$emit('logout');
        };
      }
    };
  });
});
