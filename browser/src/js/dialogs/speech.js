define(['./_dialogDefs'], function(_dialogDefs) {

  var dlg = {
    name: 'speech',
    definition: {

      controller: function($scope, $modalInstance, data) {

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
    }
  };

  _dialogDefs.add(dlg);

  return dlg;
});


/* stuff

create returns a dialog instance
var di = $dialogs.create(
dlgUrl,'newProposalDialogCtrl',{title: tempTitle},{key: false,back: 'static'}
);

the dialog controller can end things with:
          // promise will resolve to success
        $modalInstance.close(outgoing);
          // promise will resolve to fail
        $modalInstance.dismiss(outgoing);

which will result in handling the promise:

di.result.then(

SUCESS FUNCTION (i.e. the modal was CLOSED (i.e. ok was pressed))
  function(title){
   // dialog closed with data to be returned
   $dialogs.wait('Creating record for new proposal.',50);
   proposalSrvc.newProposal(title).then(function(){
      $rootScope.$broadcast('dialogs.wait.complete');
      $scope.proposal.title = title;
      //.. new proposal record created, do stuff ..//
   },function(){
      $rootScope.$broadcast('dialogs.wait.complete');
      //.. failed to create proposal ..//
   }); // end service call
  },
FAIL FUNCTION (i.e. the modal was CLOSED (i.e. ok was pressed))

  function(){
      // dialog dismissed without entering a proposal title
      $location.path('/'); // go to home
  });
*/
