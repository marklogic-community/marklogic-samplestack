define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlStore
   *
   * @description
   * Simple object store which attaches itself to the $rootScope so that
   * long-lived model data may be stored on a "side" scope.
   *
   * The object is thus accessisble from any scope in the application as
   * `[the scope].store`. It is to be used as a name/value pair dictionary.
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
