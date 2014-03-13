'use strict';

// Declare app level module which depends on filters, and services
angular.module('aj', ['ngRoute', 'aj.filters', 'aj.services', 'aj.directives', 'aj.controllers']).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {templateUrl: 'views/view1.html', controller: 'MyCtrl'});
    }]);

