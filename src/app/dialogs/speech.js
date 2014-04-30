(function (undefined) {

  this.app.controller('speechDialogCtlr', [

    '$scope', '$modalInstance', 'data',
    function($scope, $modalInstance, data) {

      $scope.isNew = data.isNew;

      $scope.$watch('model.title', function(newValue, oldValue) {
        var valueForTitle = newValue && newValue.trim().length ?
            newValue.trim() :
            '(untitled)';
        $scope.dialogTitle = $scope.isNew ?
            'New Speech: ' + valueForTitle :
            'Speech: ' + valueForTitle;
      });


      $scope.save = function() {
        $modalInstance.close($scope.model);
      };

      $scope.cancel = function() {
        $modalInstance.dismiss();
      };

      $scope.maxDate = new Date();
      $scope.dateOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.dateOpened = true;
      };

      $scope.model = data.model;

    }
  ]);


  this.app.factory('speechDialog', [
    '$modal',
    function($modal) {
      return function(data, opts) {
        return $modal.open({
          templateUrl : '/app/dialogs/speech.html',
          controller : 'speechDialogCtlr',
          keyboard : false,
          backdrop : true,
          windowClass: 'dialogs-default',
          resolve : {
            data : function() { return _.cloneDeep(data); }
          }
        })
            .result;
      };
    }
  ]);

}).call(global);
