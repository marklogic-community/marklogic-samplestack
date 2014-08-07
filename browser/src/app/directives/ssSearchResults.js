define(['app/module'], function (module) {

  /**
   * @ngdoc directive
   * @name ssSearchResults
   * @restrict E
   *
   * @description
   * TBD
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
        controller: function ($scope) {

        },
        link: function (scope, element, attrs) {
          scope.$watch('search.results', function () {
              // // Sort settings
              // scope.sorts = [
              //   {
              //     label: 'votes',
              //     value: ['']
              //   },
              //   {
              //     label: 'newest',
              //     value: ['creationDate']
              //   },
              //   {
              //     label: 'relevance',
              //     value: ['-score']
              //   }
              // ];
              // scope.selectedSort = scope.sorts[2]; // Default sort
              //
              // scope.setSort = function () {
              //   scope.selectedSort = this.sort;
              //   scope.$emit('sort', { sort: this.sort });
              // };

          });
        }
      };
    }
  ]);
});
