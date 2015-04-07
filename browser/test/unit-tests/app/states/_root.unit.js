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
    describe('_root', function () {
      var $controller;
      var $httpBackend;
      var $rootScope;
      var $timeout;
      var scope;
      var rootCtlr;
      var deferredRestore;
      var loginDialogStub = sinon.stub();
      var contributorDialogStub = sinon.stub();

      beforeEach(function (done) {
        module('app');
        module(function ($provide) {
          $provide.factory('loginDialog', function () {
            return loginDialogStub;
          });
          $provide.factory('contributorDialog', function () {
            return contributorDialogStub;
          });

          $provide.factory('mlAuth', function ($q) {
            return {
              restoreSession: function () {
                deferredRestore = $q.defer();
                return deferredRestore.promise;
              }
            };
          });

        });
        inject(
          function (
            _$controller_,
            _$httpBackend_,
            _$rootScope_,
            _$timeout_
          ) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            rootCtlr = $controller('rootCtlr', { $scope: scope });
            done();
          }
        );
      });

      it('should enable to set page title', function () {
        scope.setPageTitle('test');
        scope.$apply();
        $rootScope.pageTitle.should.equal('test');
      });

      it('should enable opening login dialog', function () {
        scope.openLogin();
        scope.$apply();
        loginDialogStub.calledOnce.should.be.true;
      });

      it('should enable showing contributor dialog', function () {
        scope.$emit('showContributor', { contributorId: 1 });
        scope.$apply();
        contributorDialogStub.calledOnce.should.be.true;
      });

    });

  };
});
