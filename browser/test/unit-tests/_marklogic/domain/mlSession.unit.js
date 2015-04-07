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
    describe('mlSession', function () {
      var $httpBackend;
      var mlSession;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (_$httpBackend_, _mlSession_) {
            $httpBackend = _$httpBackend_;
            mlSession = _mlSession_;
            done();
          }
        );
      });

      it('should be valid with username and password', function () {
        var s = mlSession.create({
          username: 'username',
          password: 'password'
        });
        s.$ml.valid.should.be.true;
      });

      it('should not be valid with id and stuff', function () {
        var s = mlSession.create({
          id: 'me',
          stuff: 'extra'
        });
        s.$ml.valid.should.be.false;
      });

      it('should be valid with id, username, role', function () {
        var s = mlSession.create({
          id: 'me',
          username: 'theuser',
          role: ['i should come from ldap']
        });
        s.$ml.valid.should.be.true;
      });

      it('should be invalid with id and password', function () {
        var s = mlSession.create({
          id: 'me',
          password: 'notgood'
        });
        s.$ml.valid.should.be.false;
      });

      it('should POST as expected', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(/\/v1\/session$/).respond(200, {
          id: 'someid',
          username: 'username',
          someProp: 'val'
        });

        var s = mlSession.create({
          username: 'username',
          password: 'password'
        });

        mlSession.post(s);
        s.$ml.waiting.then(
          function () {
            s.id.should.equal('someid');
            s.someProp.should.equal('val');
            s.should.not.have.property('password');
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });
    });
  };

});
