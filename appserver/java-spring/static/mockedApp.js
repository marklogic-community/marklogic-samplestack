require.config({
  paths: {
    'angular': 'deps/angular/angular',
    'angular-mocks': 'deps/angular-mocks/angular-mocks',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text'
  },
  shim: {
    'angular-mocks': { deps: ['application'] }
  }
});

define([
  'application', 'mocks/index', 'angular-mocks'
], function (appModule, mocks) {

  var mockModule = angular.module('mockModule', ['ngMockE2E']);

  mockModule.run([

    '$httpBackend',
    function ($httpBackend) {
      // sessiong
      // $httpBackend.whenGET(/^\/v1\/session$/).respond(200, {
      //   stuff: 'ok'
      // }, { 'X-CSRF-TOKEN': 'some token' });
      //
      // $httpBackend.whenPOST(/^\/v1\/login$/).respond(200, {
      //   'websiteUrl': 'http://website.com/grechaw',
      //   'reputation': 0,
      //   'displayName': 'joeUser',
      //   'aboutMe': 'Some text about a basic user',
      //   'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
      //   'location': null,
      //   'userName': 'joeUser@marklogic.com',
      //   'votes': [],
      //   'role': ['SAMPLESTACK_CONTRIBUTOR']
      // }, { 'X-CSRF-TOKEN': 'some token' });

      // $httpBackend.whenPOST(/^\/v1\/search$/)
      //    .respond(200, mocks.searchResult);

      $httpBackend.whenGET(/.*/).passThrough();
      $httpBackend.whenPOST(/.*/).passThrough();
      $httpBackend.whenPUT(/.*/).passThrough();
      $httpBackend.whenPATCH(/.*/).passThrough();
      $httpBackend.whenDELETE(/.*/).passThrough();


    }

  ]);

  appModule.requires.push('mockModule');
  return appModule;

});
