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

    describe('mlUtil', function () {
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (
            _mlUtil_
          ) {
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      describe('merge', function () {
        it('should enabled merge of objects', function () {
          var x = { a: { b: { c: 2, d: [ 1, 2, 3 ] } } };

          var y = { a: { b1: { c: 2, d: [ 4 ] } } };

          var z = mlUtil.merge(x, y);
          x.should.deep.equal(
            { a: { b: { c: 2, d: [ 1, 2, 3 ] }, b1: { c: 2, d: [4 ]} } }
          );

        });
      });

    });
  };

});
