(function (undefined) {

  this.app.controller('searchCtlr', [

    '$scope',
    function ($scope) {

      $scope.setPageTitle('search');
      var facets = {
        'jquery': {
          count: 45
        },
        'angular': {
          count: 68
        }
      };
      $scope.model = {
        code: JSON.stringify(facets, null, ' ')
      };

    }
  ]);

}).call(global);
