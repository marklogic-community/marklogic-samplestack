(function (undefined) {

  this.app.controller('searchCtlr', [

    '$scope',
    function ($scope) {
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
