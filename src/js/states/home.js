define(['./_defaultLayout', 'services/rest'], function(parent) {

  var state = {
    name: 'home',
    definition: {
      url: '/',

      controller: function($scope, rest, $dialogs) {

        rest.docs.get().then(function(data) {
          $scope.docs = data;
        });

        $scope.docClick = function(doc, index) {
          return $dialogs.notify(
            'alert','You click the ' + doc.title + ' speech, position ' + index
          );
        };

        $scope.addDoc = function() {
          $scope.docs = null;
          rest.docs.addDummyDoc().then(function(data) {
            rest.docs.getDocs().then(function(data) {
              $scope.docs = data;
            });
          });
        };

        $scope.deleteDoc = function(doc) {
          $scope.docs = null;
          rest.docs.delete(doc.id).then(function(data) {
            rest.docs.get().then(function(data) {
              $scope.docs = data;
            });
          });
        };
      }
    }
  };

  return parent.addChild(state.name, state.definition);
});
