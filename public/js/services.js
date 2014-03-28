var services = angular.module('frontend.services', ['ngResource']);

services.factory('FooFactory', function ($resource) {
    return $resource('/foo/2', {}, {
        query: {
            method: 'GET',
            params: {},
            isArray: false
        }
    })
});

