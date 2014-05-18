(function (undefined) {

  var link = function (scope, element, attrs, controller, transclude) {

    transclude(
      scope,
      function (clone) {
        clone.addClass('ml-search');

        element
          .after(clone);

      }
    );

  };

  var func = [
    function () {
      return {
        restrict: 'EA',
        transclude: 'element',
        link: link,
        scope: {
        }
      };

    }
  ];

  global.mlSearchDctv = func;

}).call(global);
