define(['./_root'], function(parent) {

  return parent.addChild('fourOhFour', {

    url: '/404',

    controller: function($scope, $window) {

       $scope.goBack = function() {
        $window.history.back();
      };

    }

  });
});
