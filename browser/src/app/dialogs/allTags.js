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
   * @name allTagsDialogCtlr
   * @description
   * Controller for {@link allTagsDialog}. The controller is injected by the
   * $modal service. It handles the display and search of tags in the dialog.
   * The user can page through the tags using a pagination component, sort
   * the tags by count or name, and filter the tags by typing a string. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param  {object} ssTagsSearch Instantiated upon a search for
   * tags to populate the dialog. Represents the tag-specific search criteria.
   * @param  {SsSearchObject} ssTagsSearch Represents the current search
   * criteria, facets, and results for the application.
   * @param  {object} mlUtil An object with various utility methods.
   *
   * @property {Array.<string>} $scope.unselTags Set of tags that are found
   * in tags facet results but not presently selected as criteria.
   * @property {Array.<string>} $scope.selTags Set of tags that are found
   * in tags facet results are are presently selected as criteria.
   * @property {string} $scope.selected Text by which the tag set is
   * filtered.
   * @property {Array.<string>} $scope.arrTags Array whose length is equal to
   * the number of display columns.
   * @property {integer} $scope.tagsPerCol Number of tags to display in
   * each column.
   * @property {integer} $scope.maxSize Maximum number of page numbers
   * displayed in the pagination component.
   * @property {integer} $scope.pageSize Maximum number of tags to be
   * displayed on the page.
   * @property  {Array.<object>} $scope.sorts Set of objects for controlling
   * the sort of the tags.
   * @property {Array.<string>} $scope.tags Set of tags that are found
   * in tags facet results. The total number is limited to a $scope.pageSize
   * maximum.
   * @property  {object} $scope.selectedSort The currently selected sort.
   */
  module.controller('allTagsDialogCtlr', [

    '$scope',
    '$modalInstance',
    'ssTagsSearch',
    'searchObject',
    'mlUtil',
    function (
      $scope,
      $modalInstance,
      ssTagsSearch,
      searchObject,
      mlUtil
    ) {

      // Tag settings
      //
      // get a copy of the search criteria, don't change the main search while
      // in the dialog
      var criteria = angular.copy(searchObject.criteria);
      criteria.constraints.tags.values = criteria.constraints.tags.values || [];
      $scope.selTags = criteria.constraints.tags.values;

      $scope.selected = ''; // For typeahead

      // Layout settings
      var numCols = 3;
      $scope.arrCols = []; // For template ng-repeat
      for (var i = 0; i < numCols; i++) {
        $scope.arrCols.push(i);
      }
      $scope.tagsPerCol = 6;

      // Paging settings
      $scope.tagsCount = 0;
      $scope.currentPage = 1; // initial
      $scope.maxSize = 5;
      $scope.pageSize = numCols * $scope.tagsPerCol;

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.updatePage
       * @description
       * Handle pagination changes.
       * @param  {string} currentPage the current page, initially set to 1.
       */
      $scope.updatePage = function (currentPage) {
        $scope.currentPage = currentPage;
        search();
      };

      // Sort settings
      $scope.sorts = [
        {
          label: 'Name',
          value: 'name',
          title: 'Sort tags by name'
        },
        {
          label: 'Count',
          value: 'frequency',
          title: 'Sort tags by count (most frequent first)'
        }
      ];
      $scope.selectedSort = $scope.sorts[1]; // Default sort

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.onTagClick
       * @description
       * Handle a click event for a tag checkbox
       * @param  {string} tagName the clicked tag name
       */
      $scope.onTagClick = function (tagName) {
        var selectedAsIndex = $scope.selTags.indexOf(tagName);
        if (selectedAsIndex >= 0) {
          $scope.selTags.splice(selectedAsIndex, 1);
        }
        else {
          if (tagName.indexOf($scope.selected) >= 0) {
            $scope.selected = '';
          }
          $scope.selTags.push(tagName);
        }
        search();
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.submit
       * @description
       * Close the dialog via the $modalInstance. This resolves the promise
       * from the {@link allTagsDialog} service
       */
      $scope.submit = function () {
        $modalInstance.close($scope.selTags);
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.cancel
       * @description
       * Cancel the dialog via the $modalInstance.
       */
      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.setSort
       * @description
       * Set the current sort for the tags.
       */
      $scope.setSort = function () {
        $scope.selectedSort = this.sort;
        $scope.currentPage = 1; // reset to first page
        search();
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.tagFilter
       * @description
       * Called upon entering text in the text input.
       * Triggers a tags search on each text change.
       */
      $scope.tagFilter = function () {
        search();
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.clearText
       * @description
       * Clears text input and resets search.
       */
      $scope.clearText = function () {
        $scope.selected = '';
        $scope.currentPage = 1; // reset to first page
        search();
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.search
       * @description
       * Performs a search for tags based on page and sort criteria.
       * Instantiates a ssTagsSearch object. Upon successful search, the
       * method populates a $scope.pagedTagsByColumn array of arrays which
       * organizes tags for display (an array of tags for each column).
       */

      var search = function () {
        var tagsSearch = ssTagsSearch.create({
          criteria: mlUtil.merge(
            _.clone(criteria),
            {
              tagsQuery: {
                forTag: $scope.selected,
                start: 1 + ($scope.currentPage - 1) * $scope.pageSize,
                pageLength: $scope.pageSize,
                sort: $scope.selectedSort.value
              }
            }
          )
        });

        tagsSearch.post().$ml.waiting.then(function () {
          $scope.tagsCount = tagsSearch.results.count;
          $scope.asManyAs = tagsSearch.results.asManyAs;
          $scope.totalPages = Math.ceil(
            (tagsSearch.tagsCount || $scope.asManyAs) / $scope.pageSize
          );
          $scope.pagedTagsByColumn = []; // array of arrays
          while (
            tagsSearch.results.items.length &&
            $scope.pagedTagsByColumn.length < numCols
          ) {
            // an array of tags in each column array
            $scope.pagedTagsByColumn.push(
              tagsSearch.results.items.splice(0, $scope.tagsPerCol)
            );
          }
        });

      };

      // perform the initial search
      search();

    }

  ]);

  /**
   * @ngdoc dialog
   * @kind function
   * @name allTagsDialog
   * @description A UI Bootstrap component that provides a modal dialog for
   * displaying all tags available for a search. When called, this service
   * configures the dialog and the controller {@link allTagsDialogCtlr}, and
   * launches the dialog using the template. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {SsSearchObject} searchObject An object representing the current
   * search criteria, facets, and results for the application.
   *
   * @returns {angular.Promise} The promise will either be rejected
   * or will resolve to an object with an array of selected tags as its
   * property.
   */
  module.factory('allTagsDialog', [
    '$modal',
    function ($modal) {
      return function (searchObject) {
        return $modal.open({
          templateUrl : '/app/dialogs/allTags.html',
          controller : 'allTagsDialogCtlr',
          resolve: {
            searchObject: function () { return searchObject; }
          }
        }).result;
      };
    }
  ]);

});
