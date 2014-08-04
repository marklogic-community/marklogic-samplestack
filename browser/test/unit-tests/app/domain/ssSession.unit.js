define(['testHelper'], function (helper) {

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

      var validUser = {
        'websiteUrl':'http://website.com/grechaw',
        'reputation':0,
        'displayName':'joeUser',
        'aboutMe':'Some text about a basic user',
        'id':'cf99542d-f024-4478-a6dc-7e723a51b040',
        'location':null,
        'username':'joeUser@marklogic.com',
        'votes':[],
        'role':[
          'SAMPLESTACK_CONTRIBUTOR'
        ]
      };

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
          '/v1/login',
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
        ).respond(validUser);

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
