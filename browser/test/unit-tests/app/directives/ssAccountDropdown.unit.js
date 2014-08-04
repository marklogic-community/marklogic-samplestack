define([
  'testHelper',
  'text!app/directives/ssAccountDropdown.html'
], function (helper, html) {

  return function () {
    describe('ssAccountDropdown', function () {
      var el;
      var scope;
      var $compile;
      var $httpBackend;
      var $rootScope;
      var $cookieStore;
      var $timeout;
      var $window;
      var mlAuth;
      var ssSession;

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

      //
      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (
            $injector,
            _$httpBackend_,
            _$compile_,
            _$cookieStore_,
            _$window_,
            _mlAuth_,
            _$timeout_,
            _ssSession_
          ) {
            mlAuth = _mlAuth_;
            $rootScope = $injector.get('$rootScope');
            scope = $rootScope.$new();
            $compile = _$compile_;
            $httpBackend = _$httpBackend_;
            $cookieStore = _$cookieStore_;
            $timeout = _$timeout_;
            $window = _$window_;
            ssSession = _ssSession_;

            el = angular.element('<div ss-account-dropdown></div>');
            $httpBackend.expectGET(
              '/app/directives/ssAccountDropdown.html'
            ).respond(html);
            $compile(el)(scope);
            $httpBackend.flush();
            done();
          }
        );
      });

      it(
        'should be display expected info',
        function () {
          var session = ssSession.create({
            username: 'joeUser'
          });
          session.onResponsePOST(validUser);
          scope.store = {
            session: session
          };
          scope.$apply();
          angular.element(
            el[0].querySelector('.ss-user-info-about-me')
          ).text().should.equal(validUser.aboutMe);
          angular.element(
            el[0].querySelector('.ss-user-info-display-name')
          ).text().should.equal(validUser.displayName);
          angular.element(
            el[0].querySelector('.ss-user-info-website-url')
          ).text().should.equal(validUser.websiteUrl);
        }
      );

      it(
        'should be able to invoke a logout',
        function () {
          $cookieStore.put('sessionId', 'test');
          $httpBackend.expectGET('/v1/logout').respond(200);
          scope.logout();
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
          expect($cookieStore.get('sessionId')).to.be.undefined;
        }
      );

      it(
        'should alert on error',
        function () {
          sinon.stub($window, 'alert', function (message) {
            message.should.be.ok;
          });
          $cookieStore.put('sessionId', 'test');
          $httpBackend.expectGET('/v1/logout').respond(500);
          scope.logout();
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
        }
      );

    });

  };
});
