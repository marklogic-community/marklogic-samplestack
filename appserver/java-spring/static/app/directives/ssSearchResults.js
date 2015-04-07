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

  /* jshint ignore:start */

  /**
   * @ngdoc directive
   * @name ssSearchResults
   * @restrict E
   *
   * @description
   * Directive for displaying a set of search results. Upon initialization,
   * an `ssSearch` object representing the current search is bound to
   * `scope.search`. The view binds to various properties of the
   * `scope.search.results` property and assigns element from the `items`
   * property in an ngRepeater for use by the {@link ssSearchResult}
   * directive.
   *
   * Available sorts for a search are defined by an array of objects in
   * `sorts`. Each object specifies the tab label to be displayed in the
   * UI, a sort value, tooltip information for the sort tab, and an active flag
   * (some sorts are only active in certain modes). When the user selects a
   * sort in the UI, the `search.criteria.sort` property is set to
   * the corresponding sort value.
   *
   * The directive uses the
   * <a href="http://angular-ui.github.io/bootstrap/#/pagination">
   * Bootstrap UI pagination component</a> for search-result paging.
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `getSelectedSort`  | {@type function}  | Returns user-selected sort value or default sort value for the current mode. |
   * | `setSort`  | {@link function}  | Sets sort based on selection made in UI. |
   * | `sorts`  | {@type Array.<object>}  | Array of sort objects. |
   * | `search.criteria.q`  | {@type string}  | Search query string set in search bar. |
   * | `search.criteria.sort`  | {@type object}  | Current user-selected sort to be used in searches. |
   * | `search.criteria.start`  | {@type int}  | Starting search result index in results set. |
   * | `maxSize`  | {@type int}  | Maximum page numbers displayed in the pagination. |
   * | `currPage`  | {@type int}  | Current page index. |
   * | `updatePage`  | {@link function}  | Update current page index, called by pagination component. |
   * | `searchMode`  | {@link function}  | Whether app is in Search Mode (i.e., does a query string exist). |
   * | `filterMode`  | {@link function}  | Whether app is in Filter Mode (i.e., is a filter is set). |
   */

  /* jshint ignore:end */

  module.directive('ssSearchResults', [
    function () {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssSearchResults.html',
        scope: {
          search: '='
        },
        link: function (scope, element, attrs) {
          scope.$watch('search.results', function () {

            scope.sorts = [
              {
                label: 'Relevance',
                value: ['relevance'],
                tooltip: 'Sort results by relevance (most relevant first)',
                tooltipDisabled:'Must perform a search to sort by relevance',
                active: scope.searchMode()
              },
              {
                label: 'Newest',
                value: ['active'],
                tooltip: 'Sort results by time (most recent first)',
                active: true
              },
              {
                label: 'Votes',
                value: ['votes'],
                tooltip: 'Sort results by votes (highest total first)',
                active: true
              }
            ];

            scope.getSelectedSort = function () {
              // If sort is unset, use default
              if (!scope.search.criteria.sort) {
                // If search mode (i.e., search query exists): "Relevance"
                if (scope.search.criteria.q &&
                  scope.search.criteria.q.length
                ) {
                  return 'relevance';
                }
                // Else browse mode: "Newest"
                else {
                  return 'active';
                }
              }
              // Else sort is set, use it
              else {
                return scope.search.criteria.sort[0];
              }
            };

            scope.setSort = function (sort) {
              scope.search.criteria.sort = sort;
              scope.search.criteria.start = 1; // reset paging to beginning
              scope.$emit('criteriaChange');
            };

            // paging
            scope.maxSize = 5;
            scope.currPage = scope.search.getCurrentPage(); // set init page
            scope.updatePage = function (currPage) {
              scope.currPage = currPage;
              if (scope.search.setCurrentPage(scope.currPage)) {
                scope.$emit('criteriaChange');
              }
            };

          });

          scope.searchMode = function () {
            return scope.search.criteria.q;
          };

          // returns true if any filters are set
          scope.filterMode = function () {
            return scope.search.criteria.constraints.userName.value ||
              scope.search.criteria.constraints.resolved.value ||
              scope.search.criteria.constraints.dateStart.value ||
              scope.search.criteria.constraints.dateEnd.value ||
              scope.search.criteria.constraints.tags.values;
          };
        }
      };
    }
  ]);
});
