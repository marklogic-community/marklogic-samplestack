/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
