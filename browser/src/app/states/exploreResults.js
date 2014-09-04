define(['app/module','mocks/index'], function (module,mocksIndex) {

  /**
   * @ngdoc state
   * @name exploreResults
   *
   * @description
   * TBD
   *
   */
  module.controller('exploreResultsCtlr', [

    '$scope',
    'appRouting',
    function (
      $scope,
      appRouting
    ) {

      // de-convert dashes to spaces and dencode dashes from friendly url
      var dedasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, ' ')
            .replace(/%2D/g, '-')
            .trim() :
          null;
      };

      // create a search that represents the state params
      var params = angular.copy(appRouting.params);
      params.q = dedasherize(params.q);
      $scope.search.assignStateParams(params);
      $scope.applySearchToScope();
      $scope.runSearch();
    }
  ]);

});
