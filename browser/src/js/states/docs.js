define(['./_root', 'services/docs'], function(parent) {
  return parent.addChild('docs', {
    url: '/docs',

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
  });
});
