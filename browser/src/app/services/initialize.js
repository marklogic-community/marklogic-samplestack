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
   * @ngdoc service
   * @name initialize
   * @requires $rootScope, appRouting
   *
   * @description
   * Initialize the $rootScope and appRouting
   */

  module.factory('initialize', [
    '$rootScope',
    '$log',
    '$window',
    'marked',
    'statesHierarchy',
    'mlStore',
    '$location',
    '$state',
    function (
      $rootScope,
      $log,
      $window,
      marked,
      statesHierarchy,
      mlStore,
      $location,
      $state
    ) {
      $rootScope.log = function () {
        try {
          $log.apply(null, arguments);
        }
        catch (e) {}
      };

      $rootScope.marked = marked;
      $rootScope.globalError = '';
      $rootScope.setLocalError = function (error) {
        $rootScope.localError = error;
        $rootScope.loading = false;
      };
      $rootScope.clearLocalError = function () {
        $rootScope.localError = null;
      };

      $rootScope.setLoading = function (isLoading) {
        $rootScope.loading = isLoading;
      };

      // this was rescrolling the window. Not clear why we were doing this
      // but we certainly don't want to do it each and every time.
      // $rootScope.$on('$locationChangeSuccess',function () {
      //   $window.scrollTo(0, 0);
      // });
      //


      var checkAuth = function (state) {
        // make sure non-logged in users don't get a page which isn't
        // supposed to be navigable for them
        if (
          statesHierarchy.find(state.name).authRequired &&
          !(mlStore.session && mlStore.session.id)
        ) {
          $rootScope.errorCondition = 'authRequiredNav';
        }
        else {
          // if we have any error condition, clear it because
          // the user is trying something that we hope will
          // succeed (pending server-side rejection)
          // Doing this assumes that the server-side rejection
          // and corresponding errorCondition setting will take
          // place after $stateChangeStart
          $rootScope.errorCondition = null;
        }
      };

      $rootScope.$on(
        '$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
          $rootScope.clearLocalError();
          checkAuth(toState);
        }
      );

      // this is too brute a force -- it's preventing deep linking
      $rootScope.$on('sessionChange', function () {
        if (
          $state.current && $state.current.name && $state.current.name.length
        ) {
          checkAuth($state.current);
        }
        // console.log($state);
        // if (!$rootScope.store.session) {
        //   $location.url('/');
        // }
      });


      return {};
    }
  ]);
});
