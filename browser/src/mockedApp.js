require.config({
  paths: {
    'angular': 'deps/angular/angular',
    'angular-mocks': 'deps/angular-mocks/angular-mocks',
    'appGo': './appGo'
  },
  shim: {
    'angular-mocks': { deps: ['configuredApp'] }
  }
});

define([
  'configuredApp', 'angular-mocks'
], function (appModule) {

  var mockModule = angular.module('mockModule', ['ngMockE2E']);

  mockModule.run([

    '$httpBackend',
    function ($httpBackend) {
      $httpBackend.whenGET(/^(?!\/v1\/).*/).passThrough();
    }

  ]);

  appModule.requires.push('mockModule');
  return appModule;

});
