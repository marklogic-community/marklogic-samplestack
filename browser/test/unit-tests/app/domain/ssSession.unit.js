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

define(['testHelper', 'mocks/index'], function (helper, mocks) {

  return function () {
    describe('ssSession', function () {
      var ssSession;
      var $httpBackend;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssSession_) {
            ssSession = _ssSession_;
            $httpBackend = _$httpBackend_;
            done();
          }
        );
      });

      var validCreds = {
        username: 'blahblah',
        password: 'password'
      };

      var validUser;
/* jshint ignore:start */
      validUser = {
        'id':'cf99542d-f024-4478-a6dc-7e723a51b040',
        'username':'joe@example.com',
        'role':[
          'SAMPLESTACK_CONTRIBUTOR'
        ],
        userInfo: {
          'aboutMe':'Twitter: [@joeuser](http://twitter.com/joeuser)\nDisclaimer: This is not me.  JoeUser _doesn\'t exist_!\n',
          'displayName':'joeUser',
          'id':'cf99542d-f024-4478-a6dc-7e723a51b040',
          'originalId':null,
          'location':'San Francisco',
          'reputation':0,
          'userName':'joe@example.com',
          'votes':[
            '5dce8909-0972-4289-93cd-f2e8790a17fb',
            '8450f8a4-2782-4c8a-9fd9-b83bcacc5018',
            '3410347b-abf0-4e1a-8aa8-f153207322eb'
          ],
          'websiteUrl':'http://website.com/joeuser',
          'role':[
            'SAMPLESTACK_CONTRIBUTOR'
          ]

        }


      };
/* jshint ignore:end */

      it('should validate a valid instance pre-login', function () {
        var session = ssSession.create(validCreds);
        session.$ml.valid.should.be.true;
      });

      it('should validate a valid instance post-login', function () {
        var session = ssSession.create(validUser);
        session.$ml.valid.should.be.true;
      });

      it('should form-encode login', function (done) {
        var uname = 'me@somewhere.com';
        var pass = 'myPass';

        // helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          '/v1/session',
          function (body) {
            return body ===
                'username=' + encodeURI(uname) + '&' +
                'password=' + encodeURI(pass);
          },
          function (headers) {
            var encoded = headers['Content-Type'] ===
                'application/x-www-form-urlencoded';
            return encoded;
          }
        ).respond(mocks.contributor);

        var sess = ssSession.create({
          username: uname,
          password: pass
        });
        sess.post().$ml.waiting.then(
          function () {
            sess.$ml.valid.should.be.true;
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });


    });
  };

});
