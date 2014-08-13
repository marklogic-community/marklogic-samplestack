define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name contributorDialogCtlr
   * @usage the controller is injected by the $modal service
   * @description
   * Controller for {@link contributorDialog}.
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssContributor
   * @param {string} contributorId
   */
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
