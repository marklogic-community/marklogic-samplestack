define(['app/module'], function (module) {


  /**
   * @ngdoc controller
   * @kind constructor
   * @name allTagsDialogCtlr
   * @usage the controller is injected by the $modal service
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param  {ui.bootstrap.$modalInstance} allTagsStartFromFilter Filter for
   * columnar display of tags
   * @param  {Array.<object>} unselTags unselected tags
   * @param  {Array.<object>} selTags selected tags
   * @property {Array.<string>} $scope.unselTags set of tags that are found
   * in tags facet results but not presently selected as criteria.
   * @property {Array.<string>} $scope.selTags set of tags that are found
   * in tags facet results are are presently selected as criteria.
   * @property {Array.<string>} $scope.tags set of tags that are found
   * in tags facet results. Since the list of tags is limited by configuration
   * to 8, at most 8 tags will be in this array at any time.
   *
   *
   * @description
   * Controller for {@link allTagsDialog}. This dialog isn't fully implemented.
   * More detail TBD.
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
      /**
       */
      // get a fresh copy so we don't mess with main search while we're in
      // the dialog
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
      $scope.updatePage = function (currentPage) {
        $scope.currentPage = currentPage;
        search();
      };

      // Sort settings
      $scope.sorts = [
        {
          label: 'Name',
          value: 'name'
        },
        {
          label: 'Count',
          value: 'frequency'
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

      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

      $scope.setSort = function () {
        $scope.selectedSort = this.sort;
        search();
      };

      $scope.selectTagTypeahead = function ($item, $model, $label) {
        $scope.selected = ''; // Clear typeahead menu
        if ($scope.selTags.indexOf($item.name) === -1) {
          $scope.selTags.push($item.name);
          search();
        }
      };

      $scope.typeaheadSearch = function (searchForName) {
        var tagsSearch = ssTagsSearch.create({
          criteria: mlUtil.merge(
            _.clone(criteria),
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

        $scope.typeaheadPromise = tagsSearch.post().$ml.waiting;

        return $scope.typeaheadPromise.then(function () {
          delete $scope.typeaheadPromise;
          return tagsSearch.results.items;
        });
      };

      var search = function () {
        var tagsSearch = ssTagsSearch.create({
          criteria: mlUtil.merge(
            _.clone(criteria),
            {
              tagsQuery: {
                start: 1 + ($scope.currentPage - 1) * $scope.pageSize,
                pageLength: $scope.pageSize,
                sort: $scope.selectedSort.value
              }
            }
          )
        });

        tagsSearch.post().$ml.waiting.then(function () {
          $scope.tagsCount = tagsSearch.results.count;
          $scope.totalPages = Math.ceil(
            tagsSearch.results.count / $scope.pageSize
          );
          $scope.pagedTagsByColumn = [];
          while (
            tagsSearch.results.items.length &&
            $scope.pagedTagsByColumn.length < numCols
          ) {
            $scope.pagedTagsByColumn.push(
              tagsSearch.results.items.splice(0, $scope.tagsPerCol)
            );
          }
        });


      };


      // kick the search
      search();

    }

  ]);

  /**
   * @ngdoc dialog
   * @kind function
   * @name allTagsDialog
   * @description
   * Displays all tags in the database in a paged modal, and allows for
   * searching and selecting the tags for inclusion as filters on a search.
   * Uses <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a>. Also see the
   * {@link allTagsDialogCtlr}
   * and the {@link allTagsStartFrom allTagsStartFrom filter}.
   * @param {Array.<object>} unselTags unselected tags
   * @param {Array.<object>} selTags selected tags
   * @returns {angular.Promise} the promise will either be rejected
   * or will resolve to an object the following properties that reflect the
   * result of the user interaction has the dialog:
   *
   *   * **unselTags** - `{Array.<object}` the unselected tags
   *   * **selTags** - `{Array.<object}` - the selected tags
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
