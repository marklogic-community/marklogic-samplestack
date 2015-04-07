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
   * @name exploreCtlr
   * @description
   * Controller for the root.layout.explore ui-router state, which displays
   * a sidebar of search filters and a container for search results.
   * The controller provides methods for executing searches and managing
   * filter data. Upon initialization, the controller creates an ssSearch
   * object and sets up watches that will trigger new searches. The initial
   * search is executed in {@link exploreResultsCtlr}.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {object} $timeout (injected)
   * @param {object} appRouting (injected)
   * @param {object} ssSearch A model object for executing a search
   * @param {object} allTagsDialog A service for displaying a tags modal
   * dialog
   * @param {object} ssTagsSearch Represents the tag-specific search criteria
   * @param  {object} mlUtil An object with various utility methods
   *
   * @property {ssSearch} $scope.search Instatiated for handling searches
   * @property {boolean} $scope.showMineOnly Whether to show only results
   * that include contributions from the logged-in user
   * @property {boolean} $scope.resolvedOnlyEnabled Whether to show only
   * results that have an accepted answer
   * @property {string} $scope.searchbarText Current search bar text
   * @property {boolean} $scope.showMineOnlyEnabled Whether to enabled the
   * showMineOnly checkbox filter
   * @property {boolean} $scope.resolvedOnlyEnabled Whether to enabled the
   * resolvedOnly checkbox filter
   * @property {string} $scope.tagsTypeaheadPromise Current search bar text
   * @property {angular.Promise} $scope.tagsTypeaheadPromise A promise
   * object that results from the user typing in the Tags filter search box.
   */
  module.controller('exploreCtlr', [

    '$scope',
    '$timeout',
    'appRouting',
    'ssSearch',
    'allTagsDialog',
    'ssTagsSearch',
    'mlUtil',
    function (
      $scope,
      $timeout,
      appRouting,
      ssSearch,
      allTagsDialog,
      ssTagsSearch,
      mlUtil
    ) {

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.init
       * @description After everything is arranged, this function is called to
       * initialize the state.
       */
      var init = function () {
        $scope.setPageTitle('explore');

        // while we haven't finished loading, say so
        $scope.setLoading(true);

        $scope.search = ssSearch.create();

        setWatches();
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.sortOverride
       * @description Called by $scope.onCriteriaChange(). Deletes sort
       * criteria if the 'relevance' sort is set and there is no search
       * query text.
       */
      var sortOverride = function () {
        if (
          $scope.search.criteria.sort &&
          $scope.search.criteria.sort[0] === 'relevance' &&
          (!($scope.search.criteria.q && $scope.search.criteria.q.length))
        ) {
          delete $scope.search.criteria.sort;
        }
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.setWatches
       * @description Handle changes to search criteria in the user
       * interface.
       */
      var setWatches = function () {
        var onChange = function (newVal, oldVal) {
          if (newVal !== oldVal) { $scope.$emit('criteriaChange'); }
        };

        $scope.$watch(
          'search.criteria.q', onChange
        );
        $scope.$watch(
          'search.criteria.sort', onChange
        );
        $scope.$watch(
          'search.criteria.constraints.userName.value', onChange
        );
        $scope.$watch(
          'search.criteria.constraints.resolved.value', onChange
        );
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.applyScopeToSearch
       * @description Apply scope information in the user interface to
       * the ssSearch object, which handles searches.
       */
      $scope.applyScopeToSearch = function () {
        $scope.search.criteria.constraints.userName.value =
            $scope.showMineOnly === true ?
              $scope.store.session.userInfo.userName :
              null;
        $scope.search.criteria.constraints.resolved.value =
            $scope.resolvedOnly === true ? true : null;
        $scope.search.criteria.q = $scope.searchbarText;
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.applyScopeToSearch
       * @description Apply ssSearch object data to properties in the
       * controller scope that determine what appears in the user interface.
       */
      $scope.applySearchToScope = function () {
        // showMineOnly only if the user is a contributor AND they have
        // specified it in the url. see also setShowMineOnly and
        // showMineOnlyEnabled
        $scope.showMineOnly = ($scope.showMineOnlyEnabled() &&
            $scope.search.criteria.constraints.userName.value) ? true : null;

        // IF there is a session, set resolved only if they have specified
        // it in the url.  see also setResolvedOnly and resolvedOnly enabled
        if ($scope.resolvedOnlyEnabled()) {
          $scope.resolvedOnly =
              $scope.search.criteria.constraints.resolved.value === true;
        }

        $scope.searchbarText = $scope.search.criteria.q;
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.showMineOnlyEnabled,
       * exploreCtlr#$scope.resolvedOnlyEnabled
       * @description Enable showMineOnly and resolvedOnly inputs for users
       * who are logged in.
       * @returns {boolean} true if user has a session
       */
      $scope.showMineOnlyEnabled = $scope.resolvedOnlyEnabled = function () {
        return $scope.store.session;
      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.onCriteriaChange
       * @description React to a change in the search criteria in the user
       * interface.
       */
      $scope.onCriteriaChange = function () {
        sortOverride();
        $scope.applyScopeToSearch();
        var newStateParams = $scope.search.getStateParams();
        if (newStateParams.q) {
          newStateParams.q = $scope.dasherize(newStateParams.q);
        }
        appRouting.updateQueryParams(newStateParams);
      };

      $scope.$on('setQueryText', $scope.onCriteriaChange);

      $scope.$on('browseTags', function () {
        // open dialog, promise returned
        var modalInstance = allTagsDialog($scope.search);
        // called on dialog submit, promise fulfilled
        modalInstance.then(
          function (newTags) {
            $scope.search.criteria.constraints.tags.values = newTags;
            $scope.onCriteriaChange();
          },
          function () {
            // cancelled
          }
        );
      });

      // whenever criteria changes, go to the state that represents the
      // criteria's results
      $scope.$on('criteriaChange', $scope.onCriteriaChange);

      // will be broadcast by mlAuth on a change to the session state
      // do a search b/c permissions are impacted
      $scope.$on('sessionChange', function () {
        $scope.runSearch();
      });

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.clearConstraints
       * @description React to a clear button event in the filters sidebar.
       * Emits a 'criteriaChange' event to execute a search.
       */
      $scope.clearConstraints = function (type) {
        // can only change showMineOnly and resolvedOnly if logged in
        if (type === 'all' && $scope.store.session) {
          $scope.showMineOnly = false;
          $scope.resolvedOnly = false;
        }
        if (type === 'dates' || type === 'all') {
          $scope.search.criteria.constraints.dateStart.value = null;
          $scope.search.criteria.constraints.dateEnd.value = null;
        }
        if (type === 'tags' || type === 'all') {
          var tags = $scope.search.criteria.constraints.tags;
          if (tags.values && tags.values.length) {
            tags.values = [];
          }
        }
        $scope.$emit('criteriaChange');
      };

      var activeSearches = [];

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.runSearch
       * @description Execute a search
       */
      $scope.runSearch = function () {
        $scope.searching = true;
        if ($scope.search.results) {
          $scope.search.results.total = null;
        }

        $scope.applyScopeToSearch();

        var mySearch = $scope.search.shadowSearch();
        activeSearches.push(mySearch);
        mySearch.then(
          function () {
            if (mySearch === activeSearches.slice().pop()) {
              activeSearches.pop();
              // if the search params specify an out-of-bounds page,
              // change the page spec
              if ($scope.search.pageOutOfBounds()) {
                $scope.search.setPageInBounds();
                $scope.$emit('criteriaChange');
                return;
              }

              // notify directives so they don't have to watch
              // wait for a digestcycle so that we don't show repeaters
              // while they're repeating
              $timeout(function () {
                $scope.$broadcast('newResults');
                // so templates can stop showing spinners
                $scope.searching = false;
                // so the layout can stop showing its spinner
                $scope.setLoading(false);

              });
            }
          },
          function (reason) {
            if (mySearch === activeSearches.slice().pop()) {
              activeSearches.pop();
              // so templates can stop showing spinners
              $scope.searching = false;
              // so the layout can stop showing its spinner
              $scope.setLoading(false);
              throw new Error(
                JSON.stringify(reason),
                'ssSearch:post'
              );
            }
          }
        );

      };

      /**
       * @ngdoc method
       * @name exploreCtlr#$scope.tagsTypeaheadSearch
       * @description React to typing in the Tags filter search input
       * and execute a search for tags.
       * @returns {angular.Promise} A promise object. Its resolution
       * returns an array of tag item objects that include name and
       * frequency properties.
       */
      $scope.tagsTypeaheadSearch = function (searchForName) {
        var tagsSearch = ssTagsSearch.create({
          criteria: mlUtil.merge(
            _.clone($scope.search.criteria),
            {
              tagsQuery: {
                start: 1,
                pageLength: 10,
                forTag: searchForName,
                sort: 'name'
              }
            }
          )
        });

        $scope.tagsTypeaheadPromise = tagsSearch.post().$ml.waiting;

        return $scope.tagsTypeaheadPromise.then(function () {
          delete $scope.tagsTypeaheadPromise;
          return tagsSearch.results.items;
        });
      };

      init();

    }

  ]);

});
