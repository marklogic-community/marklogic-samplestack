define(['testHelper'], function (helper) {

  return function () {
    describe('ssMarkdown', function () {
      var el;
      var scope;
      var $compile;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function ($rootScope, _$httpBackend_, _$compile_, _$timeout_) {

            scope = $rootScope.$new();
            $compile = _$compile_;

            el = angular.element(
              '<div><div ss-markdown="content"/></div>'
            );
            $compile(el)(scope);

            done();
          }
        );
      });

      it(
        'should call highlight on code',
          function () {
            this.timeout(150);
            scope.content = '# I Heading\n\n' +
                '```javascript\nreturn \'I Code\';\n```\n';
            scope.$apply();
            el.find('h1').text().should.equal('I Heading');
            el.find('code').text().should.equal('return \'I Code\';\n');
          }
      );
    });

  };
});
