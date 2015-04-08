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
   * @name ssFacetTags
   * @restrict E
   * @param {object} criteria The search `criteria.tags` property from {@link ssSearch}
   * @param {object} results The search `results.facets.tags` property from {@link ssSearch}
   * @param {object} totals The totals calculated during search
   * @param {integer} tagsLimit The number of tags to display
   *
   * @description
   * Renders tags facet of search results into a list, and allows the user to select
   * tags to use a filter in search criteria.
   *
   * <p style="color: red">
   * TODO: should typeahead use the full tags search that the browseTags dialog will be using? The
   * endpoint for such a feature is not yet implemented
   * but planned, so maybe we should do so, otherwise the typeahead is
   * really not all that useful.
   * </p>
   *
   * Displays a typeahead box from which the user may select tags.
   *
   * Listens for `newResults` event to trigger popuplation of results.
   *
   * When the user selects or unselects a tag, moves the tag between the selected and unselected lists
   * and emits `criteriaChange` event so that the search may be
   * updated.
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `selected`  | {@type string}  | Used by typeahead to communicate user selection back to the directive |
   * | `sort` | {@type Array.<string>} |  Used by the repeater that lists tags. Ordered list of column names by which to sort results (descending by count). |
   * | `selTags` | {@type Array.<string>} | Selected tags. |
   * | `unselTags` | {@type Array.<string>} | Unselected tags. |
   * | `selectTag` | {@type function(string)}  | Select an unselectd tag. |
   * | `unSelectTag` | {@type function(string)}  | Unselect a selectd tag. |
   * | `selectTagTypeahead` | {@type function(object, object, strubg)} | Fired by typeahead when user selects from the dropdown. |
   * | `toArray` | {@type function(object)}  | Return array version of the tags facet values. Used by the repeater. |
   * | `haveSelectedTags` | {@type function()} | Returns true if there are selected tags. Determines layout of the lists. |
   */

  /* jshint ignore:end */

  module.directive('ssFacetTags', ['allTagsDialog', 'ssTagsSearch', '$window',
    function (allTagsDialog, ssTagsSearch, $window) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssFacetTags.html',
        scope: {
          criteria: '=',       // Tags in the selection criteria
          results: '=',        // Tags in the results
          totals: '=',         // Object with total data
          tagLimit: '=numTags', // Num tags to show in unsel list
          typeaheadSearch: '=', // function to execute typeahead searches
          typeaheadLoading: '='
        },
        link: function (scope, element, attrs) {
          element.addClass('ss-facet-tags');
          scope.selected = ''; // For typeahead
          // Sort precedence
          scope.sort = ['-count', 'name'];
          scope.relatedShown = null;
          scope.relatedActive = true;

          var tagsConstraints = scope.criteria.constraints.tags;

          // For controlling related-tags popup
          scope.show = {};

          var resetSelections = function () {
            // Start by moving all tags in results to unsel array
            scope.unselTags = angular.copy(scope.results);
            angular.forEach(scope.unselTags, function (tag) {
              // Don't display tags that have no counts
              if (!tag.count) {
                delete scope.unselTags[tag.name];
              }
            });
            scope.selTags = {};
            if (tagsConstraints.values) {
              // Cycle through tags in search criteria (the selected tags)
              tagsConstraints.values.forEach(function (tagName) {
                // If tag exists in unsel array, move to sel array as-is
                if (scope.unselTags[tagName]) {
                  scope.selTags[tagName] = scope.unselTags[tagName];
                  delete scope.unselTags[tagName];
                }
                // Otherwise, set its counts to 0, move to sel array
                else {
                  scope.selTags[tagName] = {
                    name: tagName, count: 0 , shadow: { count: 0 }
                  };
                }
              });
            }

            // setup typeahead
          };

         /**
          * Handle tag selection in UI
          */
          scope.selectTag = function (tag) {
            // Do tag values exist in criteria?
            if (tagsConstraints.values) {
              // Is selected tag not in the array?
              if (tagsConstraints.values.indexOf(tag.name) < 0) {
                // Add tag o criteria array
                tagsConstraints.values.push(tag.name);
                scope.$emit('criteriaChange');
              }
            }
            // Add tag as first value in criteria
            else {
              tagsConstraints.values = [tag.name];
              scope.$emit('criteriaChange');
            }
            // On select, don't show related
            scope.relatedActive = false;
            // On select, close related if open
            scope.relatedShown = null;
          };

         /**
          * Handle typeahead menu selection.
          * @param {object} $item Tag object
          * @param {number} $model Tag count
          * @param {string} $label Menu label text
          */
          scope.selectTagTypeahead = function ($item, $model, $label) {
            scope.selectTag($item);
            scope.selected = ''; // Clear typeahead menu
          };

          scope.unselectTag = function (tag) {
            // Do tag values exist in criteria?
            if (tagsConstraints.values) {
              // Remove tag from criteria array
              tagsConstraints.values.splice(
                tagsConstraints.values.indexOf(tag.name), 1
              );
              scope.$emit('criteriaChange');
            }
            // On unselect, don't show related
            scope.relatedActive = false;
            // On unselect, close related if open
            scope.relatedShown = null;
          };

         /**
          * Convert object to array, for use in list display in template
          * @param {object} obj An object
          * @returns {array} An array of object property values
          */
          scope.toArray = function (obj) {
            return obj ?
                Object.keys(obj).map(function (key) { return obj[key]; }) :
                [];
          };

         /**
          * Do selected tags exist, for use in template layout
          * @returns {boolean} true if selTags object has property keys
          */
          scope.haveSelectedTags = function () {
            return scope.selTags  && Object.keys(scope.selTags).length > 0;
          };

          // set up and then wait for results
          scope.selTags = {};
          scope.unselTags = {};
          scope.$on('newResults', resetSelections);

          scope.showAllTagsDialog = function () {
            scope.$emit('browseTags');
          };

         /**
          * Show related-tags popup for a selected tag
          * @param {object} tag The selected tag object
          */
          scope.showRelated = function (tag) {
            // If popup currently shown, hide
            if (scope.relatedShown === tag) {
              scope.relatedShown = null;
              return;
            }
            // Don't show if flag is false
            // Avoids showing related tags on checkbox or label click
            if (scope.relatedActive === false) {
              scope.relatedActive = true;
              return;
            }

            // Populate and display popup
            scope.show[tag.name]();
            scope.relatedShown = tag;

            // Close popup on outside clicks
            // @see http://stackoverflow.com/a/21151625/3682288
            if (scope.relatedShown) {
              $window.onclick = function (event) {
                  scope.relatedShown = null;
                  scope.$apply();
              };
            }
          };

         /**
          * Hide related-tags popup on mouseleave event
          * @param {object} tag The selected tag object
          */
          scope.hideRelated = function (tag) {
            // If popup currently shown, hide
            if (scope.relatedShown === tag) {
              scope.relatedShown = null;
              return;
            }
          };

        }

      };
    }
  ]);

});
