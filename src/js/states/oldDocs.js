define(['./_defaultLayout', 'services/docs'], function(parent) {

  var state = {
    name: 'oldDocs',
    definition: {
      url: '/oldDocs',

      controller: function($scope, docs) {

        docs.getDocs().then(function(data) {
          $scope.docs = data;
        });

        $scope.addDoc = function() {
          docs.addDummyDoc().then(function(data) {
            docs.getDocs().then(function(data) {
              $scope.docs = data;
            });
          });
        };

        $scope.deleteDoc = function(uri) {
          docs.deleteDoc(uri).then(function(data) {
            docs.getDocs().then(function(data) {
              $scope.docs = data;
            });
          });
        };
      }
    }
  };

  return parent.addChild(state.name, state.definition);
});
