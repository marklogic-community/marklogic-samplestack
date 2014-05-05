(function (undefined) {

  this.app.controller('rootCtlr', [

    '$scope', '$rootScope',
    function ($scope, $rootScope) {
      $scope.setPageTitle = function (title) {
        $rootScope.pageTitle = title;
      };

      // todo -- there is no real reason that we should be
      // doing it this way -- it is sloppy to use jqLite outside of
      // directives -- should set scope property
      var htmlElement = window.angular.element(document.children[0]);
      htmlElement.addClass('spun');
    }

  ]);

}).call(global);
