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
   * @name rootCtlr
   * @description
   * Controller for the root ui-router state of the application.
   * Provides methods available across child states.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {angular.Scope} $rootScope (injected)
   * @param {object} $q (injected)
   * @param {object} $log (injected)
   * @param {object} mlAuth Service for handling user authentication.
   * @param {object} loginDialog Component for displaying a login dialog.
   * @param {object} contributorDialog Component for displaying a dialog
   * to display contributor account information.
   * @param {object} allTagsDialog Component for displaying all tags
   * associated with a search.
   *
   * @property {boolean} $rootScope.loading Whether application is in the
   * process of loading content.
   * @property {string} $rootScope.pageTitle The page title to be display by
   * the browser.
   */
  module.controller('rootCtlr', [

    '$scope',
    '$rootScope',
    '$q',
    '$log',
    'mlAuth',
    'loginDialog',
    'contributorDialog',
    'allTagsDialog',
    function (
      $scope,
      $rootScope,
      $q,
      $log,
      mlAuth,
      loginDialog,
      contributorDialog,
      allTagsDialog
    ) {

      $rootScope.loading = false;

      /**
       * @ngdoc method
       * @name rootCtlr#$scope.setPageTitle
       * @description Sets the page title.
       * @param {string} title The title.
       */
      $scope.setPageTitle = function (title) {
        $rootScope.pageTitle = title;
      };

      /**
       * @ngdoc method
       * @name rootCtlr#$scope.setPageTitle
       * @description Opens the login dialog.
       */
      $scope.openLogin = function () {
        loginDialog();
      };

      // Upon the 'showContributor' event, open a contributor dialog
      $scope.$on('showContributor', function (evt, args) {
        contributorDialog(args.contributorId);
      });

      // convert spaces to dashes and encode dashes so that
      // we will tend to have a prettier url
     /**
      * @ngdoc method
      * @name rootCtlr#$scope.dasherize
      * @description Convert spaces to dashes and encode dashes for a
      * prettier URL.
      * @param {string} str The string to convert
      * @returns {string} The converted string
      */
      $scope.dasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, '%2D')
            .replace(/ /g, '-') :
          null;
      };

    }

  ]);

});
