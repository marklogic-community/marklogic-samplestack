var app = angular.module('frontend.controllers', []);

app.controller('FooCtrl', ['$scope', 'FooFactory', function ($scope, FooFactory) {
    FooFactory.get({}, function (fooFactory) {
        $scope.name = fooFactory.name;
        $scope.id = fooFactory.id;
        $scope.point = fooFactory.point;
    })
}]);

