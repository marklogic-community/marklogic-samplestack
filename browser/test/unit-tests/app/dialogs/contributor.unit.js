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
  'testHelper',
  'text!app/dialogs/contributor.html',
  'mocks/index'
], function (helper, html, mocks) {

  return function () {
    describe('contributor', function () {
      describe('contributorDialog', function () {
        var $httpBackend;
        var contributorDialog;
        beforeEach(function (done) {
          module('app');
          inject(
            function (
              _$httpBackend_,
              _contributorDialog_
            ) {
              $httpBackend = _$httpBackend_;
              contributorDialog = _contributorDialog_;
              done();
            }
          );

        });

        it('can be displayed', function () {
          $httpBackend.expectGET('/app/dialogs/contributor.html')
              .respond(200);
          $httpBackend.expectGET('/v1/contributors/1')
              .respond(mocks.contributor);
          var dialog = contributorDialog(1);
          dialog.then.should.be.ok;
          $httpBackend.flush();
        });
      });

      describe('contributorDialogCtlr', function () {
        var ctlr;
        var el;
        var scope;
        var $timeout;
        var $httpBackend;
        var modalDismiss = sinon.stub();

        beforeEach(function (done) {
          module('app');
          module(function ($provide) {
            $provide.factory('$modalInstance', function () {
              return {
                dismiss: modalDismiss
              };
            });
            $provide.value('contributorId', 1);
          });
          inject(function (
            $controller,
            $rootScope,
            $compile,
            _$timeout_,
            _$httpBackend_
          ) {
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();
            el = angular.element(html);
            $compile(el)(scope);
            ctlr = $controller(
              'contributorDialogCtlr', { $scope: scope }
            );
            done();
          });
        });

        it('displays the expected information', function () {
          $httpBackend.expectGET('/v1/contributors/1')
              .respond(mocks.contributor);
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
          angular.element(
            el[2].querySelector('.ss-contributor-display-name')
          ).text().should.equal(mocks.contributor.displayName);
        });

        // this is presently incompatible with "Page Unavailable"
        // implementation, but this test isn't testing a real world scenario
        // that we expect, so marking it pending
        it('displays an error if contributor not found', function () {
          $httpBackend.expectGET('/v1/contributors/1')
              .respond(401);
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
          angular.element(
            el[2].querySelector('.alert')
          ).text().should.be.ok;
        });

        it('can be dismissed', function () {
          $httpBackend.expectGET('/v1/contributors/1')
              .respond(401);
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
          scope.cancel();
          modalDismiss.calledOnce.should.be.true;
        });

      });
    });
  };
});
