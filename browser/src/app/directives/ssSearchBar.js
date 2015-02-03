define(['app/module'], function (module) {

  /* jshint ignore:start */

  /*
   * @ngdoc directive
   * @name ssSearchBar
   * @restrict E
   *
   * @description
   * Directive for displaying a search input form and a submit button. A
   * search submission dispatches a `setQueryText` event that includes the
   * query text. The `exploreCtlr` controller listens for this event and
   * executes a search based on the search text as well a other criteria
   * in the user interface.
   *
   * The directive also includes a Search Tips box listing examples of valid
   * search queries. The visibility of the box is controlled by a Search Tips
   * button.
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `setQueryText`  | {@type function}  | Submits a search by dispatching a `setQueryText` event. |
   * | `clearSearch`  | {@link function}  | Clears the search text, hides the search tips, and executes a search. |
   * | `searchbarText`  | {@type string}  | The query text in the search bar input. |
   * | `showTips`  | {@type boolean}  | Flag that determines whether to display the Search Tips box. |
   */

  /* jshint ignore:end */

  module.directive('ssSearchBar', function () {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssSearchBar.html',
      link: function (scope) {
        scope.setQueryText = function () {
          scope.$emit('setQueryText', { queryText: scope.searchbarText });
        };
        scope.clearSearch = function () {
          scope.searchbarText = null;
          scope.showTips = false;
          scope.setQueryText(); // Empty search resets UI to browser mode
        };
        scope.showTips = false; // Search Tips box initially closed
      }
    };
  });
});
