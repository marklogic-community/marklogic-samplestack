define(['app/module'], function (module) {

  module.controller('contributorDialogCtlr', [
    '$scope', '$modalInstance', 'ssContributor', 'contributorId',
    function ($scope, $modalInstance, ssContributor, contributorId) {
      var contributor = ssContributor.getOne(contributorId);
      contributor.$ml.waiting.then(
        function () {
          $scope.contributor = contributor;
        },
        function () {
          $scope.notFound = true;
        }
      );

      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

    }
  ]);

  /**
   * @ngdoc service
   * @name contributorDialog
   *
   * @description
   * TBD
   *
   */

  module.factory('contributorDialog', [
    '$modal',
    function ($modal) {
      return function (contributorId) {
        return $modal.open({
          templateUrl : '/app/dialogs/contributor.html',
          controller : 'contributorDialogCtlr',
          resolve: {
            contributorId: function () { return contributorId; }
          }
        }).result;
      };
    }
  ]);

});
