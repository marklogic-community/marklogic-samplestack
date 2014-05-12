(function (undefined) {


  // var template = '<div class="codemirror-container">';
  var template = '<div ui-codemirror="editorOptions" ';
  template += 'ui-refresh="code" ng-model="code"> ';
  template += '</div>';
  // template += '</div';

  var link = function (scope, element, attrs, controller, transclude) {

    scope.editorOptions = {
      mode: 'javascript',
      onLoad: scope.onLoaded
    };

    element.addClass('ml-search-builder');
    scope.cmLoaded = function (_editor) {
    };

    scope.$watch('code', function (newVal, oldVal) {
      try {
        scope.obj = JSON.parse(newVal);
        scope.parses = true;
      }
      catch (err) {
        scope.obj = null;
        scope.parses = false;
      }
    });


  };

  var controller = function ($scope) {
  };


  var func = [
    function () {
      return {
        restrict: 'EAC',
        link: link,
        scope: {
          code: '=',
          obj: '=?',
          parses: '=?'
        },
        template: template,
        controller: controller
      };

    }
  ];

  global.mlSearchBuilderDctv = func;

}).call(global);



