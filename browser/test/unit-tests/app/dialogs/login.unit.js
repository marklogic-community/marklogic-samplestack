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
  'testHelper', 'mocks/index'
], function (helper, mocks) {

  return function () {
    describe('login', function () {
      describe('loginDialog', function () {
        var $httpBackend;
        var loginDialog;
        beforeEach(function (done) {
          module('app');
          inject(
            function (
              _$httpBackend_,
              _loginDialog_
            ) {
              $httpBackend = _$httpBackend_;
              loginDialog = _loginDialog_;
              done();
            }
          );
        });

        it('can be instantiated', function () {
          $httpBackend.expectGET('/app/dialogs/login.html')
              .respond(200);
          var dialog = loginDialog();
          dialog.then.should.be.ok;
          $httpBackend.flush();
        });
      });

      describe('loginDialogCtlr', function () {
        var $rootScope;
        var $controller;
        var $httpBackend;
        var $timeout;
        var modalDismiss;
        var modalClose;
        var loginDialogCtlr;
        var scope;
        var validUser = {
          'websiteUrl':'http://website.com/grechaw',
          'reputation':0,
          'displayName':'joeUser',
          'aboutMe':'Some text about a basic user',
          'id':'cf99542d-f024-4478-a6dc-7e723a51b040',
          'location':null,
          'username':'joe@example.com',
          'votes':[],
          'role':[
            'SAMPLESTACK_CONTRIBUTOR'
          ]
        };

        beforeEach(function (done) {
          modalClose = sinon.stub();
          modalDismiss = sinon.stub();

          module('app');
          module(function ($provide) {
            $provide.factory(
              '$modalInstance',
              function () {
                return {
                  close: modalClose,
                  dismiss: modalDismiss
                };
              }
            );
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
              $rootScope = _$rootScope_;
              $timeout = _$timeout_;
              scope = $rootScope.$new();
              loginDialogCtlr = $controller(
                'loginDialogCtlr', { $scope: scope }
              );
              done();
            }
          );
        });

        it('can authenticate', function () {
          scope.session.username = 'joeUser';
          scope.session.password = 'password';

          // helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST('/v1/session').respond(mocks.contributor);

          scope.authenticate();
          $httpBackend.flush();
          $timeout.flush();
          expect(modalClose.args[0].length).to.equal(1);
        });

        it('can handle bad auth', function () {
          scope.session.username = 'joeUser';
          scope.session.password = 'password';

          // helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST('/v1/session').respond(401);

          scope.authenticate();
          $httpBackend.flush();
          $timeout.flush();
          scope.error.should.be.ok;
        });

        it('can dismiss the modal', function () {
          scope.cancel();
          modalDismiss.calledOnce.should.be.true;
        });
      });
    });
  };
});
