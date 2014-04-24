define(['./_root', 'services/docs'], function(parent) {
  return parent.addChild('docs', {
    url: '/docs',

    controller: function($scope, docs) {

      docs.getDocs().then(function(data) {
        $scope.docs = data;
      });

      $scope.addDoc = function() {
        docs.createAndPostNewDoc().then(function(data) {
          docs.getdocs().then(function(data) {
            $scope.docs = data;
          });
        });
      };

      $scope.deleteDoc = function(uri) {
        docs.deleteDoc(uri).then(function(data) {
          docs.getdocs().then(function(data) {
            $scope.docs = data;
          });
        });
      };

    }
  });
});
