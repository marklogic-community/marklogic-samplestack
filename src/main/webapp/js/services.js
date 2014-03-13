var services = angular.module('aj.services', ['ngResource']);

services.factory('UserFactory', function ($resource) {
    return $resource('/rest/users', {}, {
        query: {
            method: 'GET',
            params: {},
            isArray: false
        }
    })
});

