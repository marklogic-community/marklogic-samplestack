define(['app/module'], function (module) {

  /**
   * @ngdoc directive
   * @name ssSearchResults
   * @restrict E
   *
   * @description
   * Directive for displaying a set of search results.
   *
   * The view binds to various properties of the `$scope.results` property
   * and assigns the `item` property in an ngRepeater
   * for use by the {@link ssSearchResult} directive.
   *
   */
  module.directive('ssSearchResults', [
    '$parse',
    function ($parse) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssSearchResults.html',
        scope: {
          search: '='
        },
        link: function (scope, element, attrs) {
          scope.$watch('search.results', function () {
            //Sort settings
            scope.sorts = [
              {
                label: 'relevance',
                value: ['relevance']
              },
              {
                label: 'newest',
                value: ['active']
              },
              {
                label: 'votes',
                value: ['score']
              }
            ];

            scope.setSort = function (sort) {
              scope.search.criteria.sort = sort;
              scope.$emit('criteriaChange');
            };

            scope.incrementPage = function (increment) {
              if (scope.search.incrementPage(increment)) {
                scope.$emit('criteriaChange');
              }
            };

          });
        }
      };
    }
  ]);
});
