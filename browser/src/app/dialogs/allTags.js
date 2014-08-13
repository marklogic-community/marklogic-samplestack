define(['app/module'], function (module) {


  /**
   * @ngdoc controller
   * @kind constructor
   * @name allTagsDialogCtlr
   * @usage the controller is injected by the $modal service
   * @description
   * Controller for {@link allTagsDialog}.
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param  {ui.bootstrap.$modalInstance} allTagsStartFromFilter Filter for
   * columnar display of tags
   * @param  {Array.<object>} unselTags unselected tags
   * @param  {Array.<object>} selTags selected tags
   */
  module.controller('allTagsDialogCtlr', [

    '$scope',
    '$modalInstance',
    'allTagsStartFromFilter',
    'unselTags',
    'selTags',
    function (
      $scope,
      $modalInstance,
      allTagsStartFromFilter,
      unselTags,
      selTags
    ) {

      // Tag settings
      $scope.unselTags = unselTags;
      $scope.selTags = selTags;
      $scope.tags = unselTags.concat(selTags);
      $scope.selected = ''; // For typeahead

      // Layout settings
      var numCols = 3;
      $scope.arrCols = []; // For template ng-repeat
      for (var i = 0; i < numCols; i++) {
        $scope.arrCols.push(i);
      }
      $scope.tagsPerCol = 2;

      // Paging settings
      $scope.currentPage = 0;
      $scope.pageSize = numCols * $scope.tagsPerCol;
      $scope.totalPages = Math.ceil($scope.tags.length / $scope.pageSize);

      // Sort settings
      $scope.sorts = [
        {
          label: 'count',
          value: ['-count', 'name']
        },
        {
          label: 'name',
          value: ['name']
        }
      ];
      $scope.selectedSort = $scope.sorts[1]; // Default sort

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.clicked
       * @description
       * Handle a click event for a tag checkbox
       * @param  {object} tag the clicked element
       */
      $scope.clicked = function (tag) {
        // Selection
        var index;
        if ($scope.unselTags.indexOf(tag) > -1) {
          $scope.selTags.push(tag);
          index = $scope.unselTags.indexOf(tag);
          $scope.unselTags.splice(index, 1);
        }
        // Deselection
        else {
          $scope.unselTags.push(tag);
          index = $scope.selTags.indexOf(tag);
          $scope.selTags.splice(index, 1);
        }
      };

      /**
       * @ngdoc method
       * @name allTagsDialogCtlr#$scope.submit
       * @description
       * Close the dialog via the $modalInstance. This resolves the promise
       * from the {@link allTagsDialog} service
       */

      $scope.submit = function () {
        $modalInstance.close({
          unselTags: $scope.unselTags,
          selTags: $scope.selTags
        });
      };

      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

      $scope.setSort = function () {
        $scope.selectedSort = this.sort;
        $scope.currentPage = 0; // TODO not working, paging stays same???
      };

      /**
       * Handle typeahead selection.
       * @param {object} $item selected item [description]
       * @param {*} $model selected value
       * @param {string} $label selected label
       */
      $scope.onMenuSelect = function ($item, $model, $label) {
        // Add to selected (if not there already)
        if ($scope.selTags.indexOf($item) === -1) {
          $scope.selTags.push($item);
        }
        // Remove from unselected
        var index = $scope.unselTags.indexOf($item);
        if (index > -1) {
          $scope.unselTags.splice(index, 1);
        }
        $scope.selected = ''; // TODO not working, typeahead doesn't clear???
      };

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
      return function (unselTags, selTags) {
        return $modal.open({
          templateUrl : '/app/dialogs/allTags.html',
          controller : 'allTagsDialogCtlr',
          // Data to pass into controller
          resolve: {
            unselTags: function () {
              return unselTags;
            },
            selTags: function () {
              return selTags;
            }
          }
        }).result;
      };
    }
  ]);

  /**
  * @ngdoc filter
  * @name allTagsStartFrom
  * @kind function
  * @description
  * Returns the starting element for columnar display of tags. See
  * {@link allTagsDialog}.
  * @param {Array.<object>} tags set of tags
  * @param {integer} startIndex starting index based on current page
  * @param {integer} colOffset offset based on the column index
  * @returns {object} The starting tag for the column
  */

  module.filter('allTagsStartFrom', function () {
    return function (tags, startIndex, colOffset) {
      var index = startIndex + colOffset;
      return tags.slice(index);
    };
  });

});
