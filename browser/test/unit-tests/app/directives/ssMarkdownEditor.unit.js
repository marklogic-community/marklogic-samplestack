define(['testHelper'], function (helper) {

  return function () {
    describe('ssMarkdownEditor', function () {
      var el;
      var scope;
      var $compile;
      var divElement;
      var editorElement;
      var editorScope;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function ($rootScope, _$httpBackend_, _$compile_, _$timeout_) {
            scope         = $rootScope.$new();
            $compile      = _$compile_;

            divElement = angular.element('<div"/>');
            editorElement = angular.element(
              '<div ss-markdown-editor content="testContent"></div>'
            );
            divElement.append(editorElement);
            $compile(divElement)(scope);
            editorScope = editorElement.isolateScope();

            done();
          }
        );
      });

      it(
        'should be rendering question in textarea',
          function () {
            scope.testContent = 'this is my text `var code = content;`';
            scope.$apply();
            var txtArea = editorElement.find('textarea');
            txtArea.val().should.equal(scope.testContent);
          }
      );

      it(
        'should have rendered markdown in content area',
          function () {
            scope.testContent = '# test\n';
            scope.$apply();
            angular.element(
              editorElement[0].querySelector('.ss-markdown-editor-preview h1')
            ).text().should.equal('test');
          }
      );

    });

  };
});
