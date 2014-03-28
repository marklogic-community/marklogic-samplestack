'use strict';

// Declare app level module which depends on filters, and services
angular.module('frontend', ['ngRoute', 'frontend.filters', 'frontend.services', 'frontend.directives', 'frontend.controllers']).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {templateUrl: 'views/view1.html', controller: 'FooCtrl'});
    }]);

