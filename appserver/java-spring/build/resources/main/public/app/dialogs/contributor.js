define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name contributorDialogCtlr
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssContributor
   * @param {string} contributorId
   * @description Controller for the {@link contributorDialog}. The controller
   * is
   * injected by the $modal service.
   *
   * Upon instantiation the `contributorDialogCtlr` looks up the specified
   * contributor by id on the server.
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

      /**
       * @ngdoc method
       * @name contributorDialogCtlr#$scope.cancel
       * @description Dismisses the modal (without logging in).
       */
      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

    }
  ]);

  /**
   * @ngdoc dialog
   * @name contributorDialog
   * @kind function
   * @param {string} contributorId The id of the contributor whose information
   * should
   * be displayed
   * @description The
   * contributor dialog displays information about a contributor.
   *
   * This is the service that configures the dialog and the
   * {@link contributorDialogCtlr}, and launches the dialog.
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
