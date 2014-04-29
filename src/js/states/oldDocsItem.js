define(['./_defaultLayout', 'services/docs'], function(parent) {

  return parent.addChild('oldDocsItem', {

    url: '/oldDocs/:id',

    controller: function($scope, $stateParams, docs) {
      docs.getDoc($stateParams.id)
      .then(function(data) {
        $scope.doc = angular.fromJson(data);
      });

    }

  });
});
