define([
  'testHelper',
  'text!app/dialogs/allTags.html',
  'mocks/index'
], function (helper, html, mocks) {

  return function () {
    describe('allTags', function () {
      describe('allTagsDialog', function () {
        var $httpBackend;
        var allTagsDialog;
        beforeEach(function (done) {
          module('app');
          inject(
            function (
              _$httpBackend_,
              _allTagsDialog_,
              $rootScope
            ) {
              $httpBackend = _$httpBackend_;
              allTagsDialog = _allTagsDialog_;
              done();
            }
          );

        });

        it('can be displayed', function () {
          $httpBackend.expectGET('/app/dialogs/allTags.html')
              .respond(200);
          var dialog = allTagsDialog([], []);
          dialog.then.should.be.ok;
          $httpBackend.flush();
        });
      });

      describe('allTagsDialogCtlr', function () {
        var ctlr;
        var el;
        var scope;
        var modalDismiss = sinon.stub();
        var modalClose = sinon.stub();

        beforeEach(function (done) {
          module('app');
          module(function ($provide) {
            $provide.factory('$modalInstance', function () {
              return {
                dismiss: modalDismiss,
                close: modalClose
              };
            });
            $provide.value('unselTags', [
              'one', 'two'
              // { label: 'one', value: 1 },
              // { label: 'two', value: 2 },
            ]);
            $provide.value('selTags', [
              'three', 'four'
              // { label: 'three', value: 3 },
              // { label: 'four', value: 4 },
            ]);
          });
          inject(function (
            $controller,
            $rootScope,
            $compile,
            allTagsStartFromFilter
          ) {
            scope = $rootScope.$new();
            el = angular.element(html);
            $compile(el)(scope);
            ctlr = $controller(
              'allTagsDialogCtlr', { $scope: scope }
            );
            done();
          });
        });

        it('doesn\'t error on click selected', function () {
          scope.$apply();
          try {
            scope.clicked('three');
            assert(true);
          }
          catch (err) {
            assert(false, 'error produced: ' + err);
          }
        });

        it('doesn\'t error on click unselected', function () {
          scope.$apply();
          try {
            scope.clicked('one');
            assert(true);
          }
          catch (err) {
            assert(false, 'error produced: ' + err);
          }
        });

        it('doesn\'t error on sort', function () {
          scope.setSort();
        });


      });
    });
  };
});
