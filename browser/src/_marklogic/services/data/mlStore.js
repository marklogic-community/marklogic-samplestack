define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlStore
   *
   * @description
   * Simple object store which attaches itself to the $rootScope so that
   * long-lived model data may be stored on a "side" scope.
   */
  module.provider('mlStore', [

    function (
    ) {
      var svc = {};

      this.$get = [
        '$rootScope',
        function ($rootScope) {
          $rootScope.store = svc;
          return svc;
        }
      ];

    }
  ]);
});
