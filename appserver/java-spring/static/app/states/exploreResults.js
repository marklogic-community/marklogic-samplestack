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
   * @name exploreResultsCtlr
   * @description
   * Controller for the root.layout.explore.results ui-router state,
   * which provides a container for the search results directive.
   * Upon load, the controller creates an ssSearch object and executes
   * a search.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {object} appRouting (injected)
   *
   * @property {ssSearch} $scope.search
   */
  module.controller('exploreResultsCtlr', [

    '$scope',
    'appRouting',
    function (
      $scope,
      appRouting
    ) {

     /**
      * @ngdoc method
      * @name exploreResultsCtlr#$scope.dedasherize
      * @description Convert dashes to spaces and '%2D' characters to dashes
      * in a URL-friendly string.
      * @param {string} str The string to convert
      * @returns {string} The converted string
      */
      var dedasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, ' ')
            .replace(/%2D/g, '-')
            .trim() :
          null;
      };

      // Create a search that represents the state params.
      // See {@link exploreCtlr} for details.
      var params = angular.copy(appRouting.params);
      params.q = dedasherize(params.q);
      $scope.search.assignStateParams(params);
      $scope.applySearchToScope();
      $scope.runSearch();
    }
  ]);

});
