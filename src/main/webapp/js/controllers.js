var app = angular.module('aj.controllers', []);

app.controller('MyCtrl', ['$scope', 'UserFactory', function ($scope, UserFactory) {
    UserFactory.get({}, function (userFactory) {
        $scope.firstname = userFactory.firstName;
    })
}]);

