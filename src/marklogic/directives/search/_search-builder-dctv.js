(function (undefined) {


  var template = '<div ng-model="model.filterCriteria">';
  template += '<ml-json-scope></ml-json-scope>';
  template += '</div>';

  var link = function (scope, element, attrs, controller, transclude) {

    element.addClass('ml-search-builder');

  };

  var controller = function ($scope) {
    $scope.model = {
      filterCriteria: { status: 'TODO' }
    };
  };


  var func = [
    function () {
      return {
        restrict: 'EAC',
        link: link,
        scope: {
        },
        template: template,
        controller: controller
      };

    }
  ];

  global.mlSearchBuilderDctv = func;

}).call(global);
