define(['app/module'], function (module) {

  /*
   * @ngdoc directive
   * @name ssFacetTags
   * @restrict E
   *
   * @description
   * Directive for displaying a section of selectable tags.
   */
  module.directive('ssFacetTags', function () {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssFacetTags.html',
      scope: {
        criteria: '=',
        results: '=',
        totals: '=',
        // Number of tags to display in unselected list
        tagLimit: '=numTags'
      },
      link: function (scope, element, attrs) {
        element.addClass('ss-facet-tags');
        scope.selected = ''; // For typeahead
        // Sort precedence
        scope.sort = ['-count', 'name'];

        var resetSelections = function () {
          scope.unselTags = angular.copy(scope.results);
          angular.forEach(scope.unselTags, function (tag) {
            if (!tag.count) {
              tag.count = 0;
            }
          });
          scope.selTags = {};
          if (scope.criteria.values) {
            scope.criteria.values.forEach(function (tagName) {
              if (scope.unselTags[tagName]) {
                scope.selTags[tagName] = scope.unselTags[tagName];
                delete scope.unselTags[tagName];
              }
              else {
                scope.selTags[tagName] = {
                  name: tagName, count: 0 , shadow: { count: 0 }
                };
              }
            });
          }
        };

        var initialize = function () {
          scope.selTags = {};
          scope.unselTags = {};
          scope.$watch(
            'results', resetSelections, true
          );
        };

        scope.selectTag = function (tag) {
          if (scope.criteria.values &&
              scope.criteria.values.indexOf(tag.name) < 0
          ) {
            scope.criteria.values.push(tag.name);
          }
          else {
            scope.criteria.values = [tag.name];
          }
        };

        scope.unselectTag = function (tag) {
          if (scope.criteria.values) {
            scope.criteria.values.splice(
              scope.criteria.values.indexOf(tag.name), 1
            );
          }
        };

        scope.toArray = function (obj) {
          return obj ?
              Object.keys(obj).map(function (key) { return obj[key]; }) :
              [];
        };

        scope.haveSelectedTags = function () {
          return scope.selTags  && Object.keys(scope.selTags).length > 0;
        };

        var unregister = scope.$watch('results', function (results) {
          if (results) {
            unregister();
            initialize();
          }
        });
      }
    };
  });
});
