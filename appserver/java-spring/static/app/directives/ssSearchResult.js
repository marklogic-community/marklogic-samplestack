define(['app/module'], function (module) {

  /* jshint ignore:start */

  /**
   * @ngdoc directive
   * @name ssSearchResult
   * @restrict E
   *
   * @description
   * Directive for displaying a search result from a set of results. Each
   * search result includes a vote and answer summary, title link, tags
   * for the result, author and creation data metadata, and (for searches
   * with query text) snippets.
   *
   * The view binds to various properties of the `$scope.item` property.
   * Display of tag, author, and creation date information for each result
   * item is handled by a {@link ssQnaDocMetadata} directive.
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `displaySnippet`  | {@type function}  | Whether to display a snippet, based on source type. |
   * | `getPrefix`  | {@link function}  | Returns a formatted prefix for snippet display. |
   */

  /* jshint ignore:end */

  module.directive('ssSearchResult', [
    'mlUtil',
    function (mlUtil) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssSearchResult.html',
        link: function (scope) {
          scope.displaySnippet = function (source) {
            // only 'question' and 'answer', no 'tags'
            return source === 'question' || source === 'answer';
          };
          scope.getPrefix = function (source) {
            return '[' + source.substring(0, 1).toUpperCase() + ']';
          };
        } // link
      }; // return
    }
  ]);
});
