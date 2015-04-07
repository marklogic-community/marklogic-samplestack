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

define(['testHelper'], function (testHelper) {

  return function () {
    describe('mlWaiter', function () {
      var $q;
      var mlWaiter;
      var $timeout;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (_mlWaiter_, _$q_, _$timeout_) {
            mlWaiter = _mlWaiter_;
            $q = _$q_;
            $timeout = _$timeout_;
            done();
          }
        );
      });

      it('should enable the tracking of promise success', function (done) {
        var obj = {};
        var waiter = mlWaiter.waitOn(obj);
        obj.$ml.waiting.should.exist;
        obj.$ml.should.not.have.property('error');
        obj.$ml.waiting.then(
          function () {
            obj.$ml.should.not.have.property('error');
            obj.$ml.should.not.have.property('wating');
            expect(obj.value).to.equal(1);
            done();
          }
        );
        obj.value = 1;
        waiter.resolve();
        $timeout.flush();
      });

      it('should enable the tracking of promise failure', function (done) {
        var obj = {};
        var waiter = mlWaiter.waitOn(obj);
        obj.$ml.waiting.should.exist;
        obj.$ml.should.not.have.property('error');
        obj.$ml.waiting.catch(
          function () {
            obj.$ml.should.not.have.property('wating');
            obj.$ml.error.should.equal('because');
            obj.should.not.have.property('value');
            done();
          }
        );
        waiter.reject('because');
        $timeout.flush();
      });
    });
  };

});
