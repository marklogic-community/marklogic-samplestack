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

define([
  'testHelper'
], function (helper) {

  return function () {
    describe('appRouting', function () {
      var ctlr;
      var el;
      var scope;
      var $timeout;
      var $httpBackend;
      var appRouting;

      describe('hash-mode routing', function () {
        it(
          'should be ok with hash-mode routing if configured so',
          function (done) {
            module('app');
            module(function (appRoutingProvider) {
              appRoutingProvider.forceHashMode();
            });
            inject(function (
              $location,
              $rootScope,
              appRouting,
              $httpBackend
            ) {
              $location.path('/');
              $httpBackend.expectGET('/app/states/_root.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/_layout.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/explore.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/exploreResults.html')
                  .respond(200);

              $rootScope.$apply();
              $httpBackend.flush();
              $location.absUrl().indexOf('#')
                  .should.be.greaterThan(-1);
              done();
            });
          }
        );
      });
    });
  };
});
