define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name initialize
   * @requires $rootScope, appRouting
   *
   * @description
   * Initialize the $rootScope and appRouting
   */

  module.factory('initialize', [
    '$rootScope',
    '$log',
    '$window',
    'marked',
    function (
      $rootScope,
      $log,
      $window,
      marked
    ) {
      $rootScope.log = function () {
        try {
          $log.apply(null, arguments);
        }
        catch (e) {}
      };

      $rootScope.marked = marked;
      $rootScope.globalError = '';
      $rootScope.setLocalError = function (error) {
        $rootScope.localError = error;
        $rootScope.loading = false;
      };
      $rootScope.clearLocalError = function () {
        $rootScope.localError = null;
      };

      $rootScope.setLoading = function (isLoading) {
        $rootScope.loading = isLoading;
      };
      return {};
    }
  ]);
});
