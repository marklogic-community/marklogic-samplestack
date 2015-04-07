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

define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name fourOhFourCtlr
   * @description
   * Controller for the root.layout.fourOhFour ui-router state,
   * which handles page-not-found conditions.
   */
  module.controller('fourOhFourCtlr', [

    '$scope', '$window',
    function ($scope, $window) {

     /**
      * @ngdoc method
      * @name fourOhFourCtlr#$scope.goBack
      * @description Sends the browser back to the previous page.
      */
      $scope.goBack = function () {
        $window.history.back();
      };

    }

  ]);

});
