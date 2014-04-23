define(['./_root', 'services/docs'], function(parent) {

  return parent.addChild('docs-item', {

    url: '/docs/:id',

    controller: function($scope, $stateParams, docs) {
      docs.getDoc($stateParams.id)
      .then(function(data) {
        $scope.doc = angular.fromJson(data);
      });

    }

  });
});
