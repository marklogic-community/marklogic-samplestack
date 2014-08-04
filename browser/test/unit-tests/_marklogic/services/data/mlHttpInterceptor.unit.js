define(['testHelper'], function (helper) {

  return function () {
    describe('mlHttpInterceptor ', function () {
      var $q;
      var $http;
      var $httpBackend;


      describe('with csrf disabled', function () {
        beforeEach(function (done) {
          module('_marklogic');
          module(function (mlHttpInterceptorProvider) {
            mlHttpInterceptorProvider.disableCsrf = true;
          });
          inject(
            function (_$http_, _$httpBackend_, _$q_) {
              $q = _$q_;
              $http = _$http_;
              $httpBackend = _$httpBackend_;
              done();
            }
          );
        });

        it('should NOT set CSRF prior to POSTing', function (done) {
          $httpBackend.expectPOST('/v1/anything').respond(200);
          var resp = $http.post('/v1/anything');
          resp.then(
            function () {
              $http.defaults.headers.common
                  .should.not.have.property('X-CSRF-TOKEN');
              done();
            },
            function (reason) { assert(JSON.stringify(reason)); done(); }
          );
          $httpBackend.flush();
        });
      });

      describe('with csrf enabled', function () {
        beforeEach(function (done) {
          angular.mock.module('_marklogic');
          inject(
            function (_$http_, _$httpBackend_, _$q_) {
              $q = _$q_;
              $http = _$http_;
              $httpBackend = _$httpBackend_;
              done();
            }
          );
        });

        it('should set CSRF prior to POSTing', function (done) {
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST('/v1/anything').respond(200);
          var resp = $http.post('/v1/anything');
          resp.then(
            function () {
              $http.defaults.headers.common['X-CSRF-TOKEN']
                  .should.equal('some token');
              done();
            },
            function (reason) { assert(JSON.stringify(reason)); done(); }
          );
          $httpBackend.flush();
        });

        it('should supply CSRF when POSTing', function () {
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST(
            '/v1/something',
            null,
            function (headers) {
              var hasCsrf = headers['X-CSRF-TOKEN'] === 'some token';
              return hasCsrf;
            }
          ).respond(200);

          var resp = $http.post('/v1/something');
          $httpBackend.flush();
          resp.should.eventually.have.property('status', 200);
        });

        it('should only make one request to get CSRF', function (done) {
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST('/v1/first').respond(200);
          $httpBackend.expectPUT('/v1/second').respond(200);
          $q.all([
            $http.post('/v1/first'),
            $http.put('/v1/second')
          ]).then(
            function (responses) {
              responses[0].status.should.equal(200);
              responses[1].status.should.equal(200);
              done();
            },
            function (reason) { assert(JSON.stringify(reason)); done(); }
          );
          $httpBackend.flush();
        });

        it('shouldn\'t get in the way if no CSRF', function () {
          // second parameter makes CSRF not come back from backend
          helper.setExpectCsrf($httpBackend, true);
          $httpBackend.expectPOST(
            '/v1/something',
            null,
            function (headers) {
              return !headers['X-CSRF-TOKEN'];
            }
          ).respond(200);

          var resp = $http.post('/v1/something');
          $httpBackend.flush();
          resp.should.eventually.have.property('status', 200);
        });

        it('shouldn\'t go crazy on error', function (done) {
          // second parameter makes CSRF not come back from backend

          $httpBackend.expectGET('/v1/session').respond(400);
          var resp = $http.post('/v1/something');
          resp.then(
            function () {
              assert(false, 'should not have succeeded');
              done();
            },
            function (reason) {
              reason.should.be.ok;
              done();
            }
          );
          $httpBackend.flush();
        });


      });
    });
  };

});
