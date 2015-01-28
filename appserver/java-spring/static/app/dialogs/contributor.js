define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name contributorDialogCtlr
   * @description
   * Controller for the {@link contributorDialog}. The controller
   * is injected by the $modal service. Upon instantiation, the controller
   * looks up the specified contributor by ID on the server. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssContributor respresents a Samplestack contributor with
   * properties for displayName, reputation, etc.
   * @param {string} contributorId The ID of the contributor whose information
   * is displayed
   *
   * @property {ssContributor} $scope.contributor a Samplestack contributor
   * @property {boolean} $scope.notFound set to true if contributor not found
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
       * @description Dismisses the dialog
       */
      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

    }
  ]);

  /**
   * @ngdoc dialog
   * @kind function
   * @name contributorDialog
   * @description A UI Bootstrap component that provides a modal dialog for
   * information about a Samplestack contributor. When called, this service
   * configures the dialog and the controller {@link contributorDialogCtlr},
   * and launches the dialog using the template. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {string} contributorId The ID of the contributor
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
