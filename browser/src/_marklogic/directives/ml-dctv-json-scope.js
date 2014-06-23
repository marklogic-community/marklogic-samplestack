(function (undefined) {

  var module = this.angular.module(
    'marklogic.dctv.json-scope',
    [
      'ngPrettyJson',
    ]
  );

  var template = '<div class="ml-json-scope"> ';
  template += '<pre ';
  template += 'pretty-json="parentScope"> ';
  template += '</pre>';
  template += '</div>';

  var link = function (scope, element, attrs, controller, transclude) {
    var parent = element.parent();
    scope.parentName = parent[0].localName;
    var parentScope = {};

    var key;
    for (key in scope.$parent) {
      if (key.charAt(0) !== '$' &&
          key !== 'this' &&
          scope.$parent.hasOwnProperty(key))
      {

        parentScope[key] = scope.$parent[key];
      }
    }
    scope.parentScope = parentScope;
  };

  module.directive(

    'mlJsonScope', [

      function () {
        return {
          restrict: 'EA',
          scope: {},
          link: link,
          template: template,
          replace: true
        };
      }
    ]
  );


}).call(global);
