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

define(['testHelper'], function (helper) {

  return function () {

    describe('mlAuth', function () {
      var $httpBackend;
      var mlAuth;
      var mlStore;
      var $cookieStore;
      var mlSession;
      var $rootScope;
      var $timeout;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        module(function (mlAuthProvider) {
          mlAuthProvider.sessionModel = 'mlSession';
        });
        inject(
          function (
            _$httpBackend_,
            _$cookieStore_,
            _mlStore_,
            _mlAuth_,
            _mlSession_,
            _$rootScope_,
            _$timeout_
          ) {
            $httpBackend = _$httpBackend_;
            mlAuth = _mlAuth_;
            mlStore = _mlStore_;
            $cookieStore = _$cookieStore_;
            mlSession = _mlSession_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            done();
          }
        );
      });

      var credsTemplate = {
        username: 'joseph',
        password: 'joespass'
      };
      var fakeId = 'seven';
      var userTemplate = _.clone(credsTemplate);
      delete userTemplate.password;
      userTemplate.id = fakeId;
      userTemplate.role = ['hey Iz a role'];

      var doAuthenticate = function (done) {
        var session = mlSession.create(credsTemplate);

        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          /\/v1\/session$/,
          {
            username: credsTemplate.username,
            password: credsTemplate.password
          }
        ).respond(userTemplate);

        mlAuth.authenticate(session).then(
          function (session) {
            done(session);
          },
          function (reason) { assert(false, reason); done(); }
        );
        $httpBackend.flush();
      };

      var testSessionGoodness = function (session) {
        // got the data back
        session.should.deep.equal(mlSession.create(userTemplate));
        // have a valid MlUserModel instance
        session.$ml.valid.should.be.true;
        mlStore.session.should.deep.eql(session);
        $cookieStore.get('sessionId').should.equal('seven');
      };

      var testSessionBadness = function () {
        // got the data back
        mlStore.should.not.have.property('session');
        expect($cookieStore.get('sessionId')).not.to.be.ok;
      };

      describe('authenticate', function () {
        it('should authenticate', function (done) {
          doAuthenticate(function (session) {
            testSessionGoodness(session);
            done();
          });
        });
      });

      describe('restoreSession', function () {
        it('should pass back session if still in store', function (done) {
          doAuthenticate(function (session) {
            mlAuth.restoreSession().then(
              function (session) {
                testSessionGoodness(session);
                done();
              },
              function (reason) {
                assert(false, JSON.stringify(reason));
                done();
              }
            );
          });
        });

        it('should survive store wipeout', function (done) {
          doAuthenticate(function (session) {
            mlStore.session = null;

            $httpBackend.expectGET(/\/v1\/session/)
                .respond(userTemplate);
            mlAuth.restoreSession().then(
              function (session) {
                testSessionGoodness(session);
                done();
              },
              function (reason) {
                assert(false, JSON.stringify(reason));
                done();
              }
            );
          });
        });

        it('should not upset anthing if server fail', function (done) {
          doAuthenticate(function (session) {
            mlStore.session = null;

            $httpBackend.expectGET(/\/v1\/session/)
                .respond(401);
            mlAuth.restoreSession().then(
              function (session) {
                expect(session).be.undefined;
                $cookieStore.get('sessionId').should.equal('seven');
                done();
              },
              function (reason) {
                assert(false, JSON.stringify(reason));
                done();
              }
            );
          });
        });

        it('should do nothing if no session info', function (done) {
          doAuthenticate(function (session) {
            mlStore.session = null;
            $cookieStore.remove('sessionId');

            mlAuth.restoreSession().then(
              function (session) {
                expect(session).be.undefined;
                done();
              },
              function (reason) {
                assert(false, JSON.stringify(reason));
                done();
              }
            );
          });
        });

        it('should enable logout', function (done) {
          doAuthenticate(function (session) {
            $httpBackend.expectDELETE(/\/v1\/session/).respond(200);
            mlAuth.logout().then(
              function () {
                testSessionBadness();
                done();
              },
              function (err) { assert(false, 'saw error: ' + err); done(); }
            );
          });
        });

      });


    });
  };

});
