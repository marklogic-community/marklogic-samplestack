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
    describe('mlModelBase', function () {
      var mlUtil;
      var $q;
      var $http;
      var $httpBackend;
      var $rootScope;
      var mlModelBase;
      var mlSchema;
      var impl1;
      var impl2;

      var schema = {
        id: 'http://example.com/#example',
        required: ['id', 'myProp2'],
        properties: {
          id: {
            type: 'string'
          },
          myProp1: {
            type: 'string'
          },
          myProp2: {
            type: 'object',
            properties: {
              subProp: {
                type: 'string'
              }
            }
          },
          myProp3: {
            required: ['prop13'],
            properties: {
              prop13: { type: 'string' }
            }
          },
          myProp4: {
            required: ['prop4a', 'prop4b'],
            properties: {
              prop4a: { type: 'string'},
              prop4b: { type: 'string'}
            }
          }
        }
      };



      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (
            _$http_,
            _$httpBackend_,
            _$q_,
            _$rootScope_,
            _mlModelBase_,
            _mlUtil_,
            _mlSchema_
          ) {
            $q = _$q_;
            $http = _$http_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            mlModelBase = _mlModelBase_;
            mlUtil = _mlUtil_;
            mlSchema = _mlSchema_;

            var Object1 = function (spec) {
              mlModelBase.object.call(this, spec);
            };
            Object1.prototype = Object.create(mlModelBase.object.prototype);
            Object1.prototype.$mlSpec = {
              schema: mlSchema.addSchema(schema)
            };
            impl1 = mlModelBase.extend('Object1', Object1);

            var Object2 = function (spec) {
              mlModelBase.object.call(this, spec);
            };
            Object2.prototype = Object.create(mlModelBase.object.prototype);
            Object2.prototype.$mlSpec = {
              schema: mlSchema.addSchema(schema)
            };
            Object2.prototype.onResponsePOST = function (data) {
              mlUtil.merge(this, {
                newProp: data
              });
            };

            impl2 = mlModelBase.extend('Object2', Object2);

            done();
          }
        );
      });

      it('should support creation of empty objects', function () {
        var instance = impl1.create();
        instance.$ml.valid.should.be.false;
      });

      it('should support creation of valid objects', function () {
        var instance = impl1.create({
          id: '1',
          myProp2: {}
        });
        instance.$ml.valid.should.be.true;
      });

      it('should test validity on change when attached to scope', function () {
        var instance = impl1.create();
        instance.$ml.valid.should.be.false;
        var scope = $rootScope.$new();

        instance.attachScope(scope, 'testProp');
        scope.testProp.id = '1';
        scope.testProp.myProp2 = {};
        scope.$digest();
        instance.$ml.valid.should.be.true;
      });

      it('should assign data from GETs', function () {
        var instance = impl1.create({
          id: '1'
        });
        instance.onHttpResponse({
          id: '1',
          myProp2: {}
        }, 'GET');
        instance.$ml.valid.should.be.true;
      });

      it('should assign data from POSTs', function () {
        var instance = impl1.create({
          myProp2: {}
        });
        instance.onHttpResponse({
          id: '1'
        }, 'POST');
        instance.$ml.valid.should.be.true;
      });

      it('shouldn\'t merge anything on PUTs', function () {
        var instance = impl1.create({
          myProp2: {}
        });
        instance.onHttpResponse({
          id: '1'
        }, 'PUT');
        instance.$ml.valid.should.be.false;
      });

      it(
        'should not error on DELETE',
        function () {
          var instance = impl1.create({
            id: '1'
          });
          try {
            instance.onHttpResponse({}, 'DELETE');
          }
          catch (err) {
            assert(false, 'we should not have an error');
            return;
          }
          assert(true);
        }
      );

      it(
        'should complain about unsupported methods',
        function () {
          var instance = impl1.create({
            id: '1'
          });
          try {
            instance.onHttpResponse({ stuff: 'bad'}, 'OPTIONS');
          }
          catch (err) {
            assert(true);
            return;
          }
          assert(false, 'no error was thrown');
        }
      );

      it('should process args array into a spec', function () {
        var inst = impl1.create();
        var spec = inst.specFromArguments('1', '2');
        spec.id.should.equal('1');
      });

      it('should provide the right GET config', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        var httpConfig = inst.getHttpConfig('GET');
        httpConfig.should.deep.equal({
          method: 'GET',
          url: '/example/1',
          data: undefined
        });
      });

      it('should provide the right POST config', function () {
        var inst = impl1.create({
          myProp2: {}
        });
        var httpConfig = inst.getHttpConfig('POST');
        httpConfig.should.eql({
          method: 'POST',
          url: '/example',
          data:inst
        });
      });

      it('should provide the right PUT config', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        var httpConfig = inst.getHttpConfig('PUT');
        httpConfig.should.eql({
          method: 'PUT',
          url: '/example/1',
          data:inst
        });
      });

      it('should provide the right DELETE config', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        var httpConfig = inst.getHttpConfig('DELETE');
        httpConfig.should.eql({
          method: 'DELETE',
          url: '/example/1',
          data:undefined
        });
      });

      it('should error on attempt to get a PATCH config', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });

        try {
          var httpConfig = inst.getHttpConfig('PATCH');
        }
        catch (err) {
          assert(true);
          return;
        }
        assert(false, 'no error was thrown');
      });

      it(
        'should error on attempt to get an unsupported http config',
        function () {
          var inst = impl1.create({
            id: '1',
            myProp2: {}
          });

          try {
            var httpConfig = inst.getHttpConfig('OPTIONS');
          }
          catch (err) {
            assert(true);
            return;
          }
          assert(false, 'no error was thrown');
        }
      );

      it(
        'should error on attempt to get data for an unsupported http method',
        function () {
          var inst = impl1.create({
            id: '1',
            myProp2: {}
          });

          try {
            var httpConfig = inst.getHttpData('OPTIONS');
          }
          catch (err) {
            assert(true);
            return;
          }
          assert(false, 'no error was thrown');
        }
      );

      it('should allow prototype overrides of functions', function () {
        var inst = impl2.create({
          id: '1'
        });
        inst.onResponsePOST({
          stuff: 'test'
        });
        inst.should.deep.equal(impl2.create({
          id: '1',
          newProp: { stuff: 'test' }
        }));
      });

      it(
        'should disallow prototype overrides of data not under $mlSpec',
        function () {
          try {
            var Illegal = function () {

            };
            Illegal.prototype = Object.create(mlModelBase.object.prototype);
            Illegal.prototype.stuff = 1;
            Illegal.prototype.$mlSpec = {
              schema: mlSchema.addSchema(schema)
            };
            var stuff = mlModelBase.extend('Illegal', Illegal);
          }
          catch (err) {
            assert(true);
            return;
          }
          assert(false, 'no error was thrown');
        }
      );

      it(
        'should allow prototype overrides of data under $mlSpec',
        function () {
          try {
            var Legal = function () {

            };
            Legal.prototype = Object.create(mlModelBase.object.prototype);
            Legal.prototype.$mlSpec = {
              schema: mlSchema.addSchema(schema)
            };
            Legal.prototype.$mlSpec.junk = 'test';
            var stuff = mlModelBase.extend('Legal', Legal);
          }
          catch (err) {
            assert(false, 'an error was thrown: ' + err);
            return;
          }
          assert(true);
        }
      );

      it('should support GET from a spec', function (done) {
        $httpBackend.expectGET('/v1/example/1').respond({
          myProp: 'stuff'
        });
        var inst = impl1.getOne({ id: '1'});
        inst.$ml.waiting.then(
          function () {
            inst.myProp.should.equal('stuff');
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('the service should support get from an args list', function (done) {
        $httpBackend.expectGET('/v1/example/1').respond({
          myProp: 'stuff'
        });
        var inst = impl1.getOne('1');
        inst.$ml.waiting.then(
          function () {
            inst.myProp.should.equal('stuff');
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('the service should support del from a spec', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectDELETE('/v1/example/1').respond({});
        var promise = impl1.del({ id: '1'});
        promise.then(
          function () {
            assert(true);
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('the service should support del from an args list', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectDELETE('/v1/example/1').respond({});
        var promise = impl1.del('1');
        promise.then(
          function () {
            assert(true);
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('should support post from an instance', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST('/v1/example').respond({
          id: '1'
        });
        var inst = impl1.create({
          myProp: 'stuff'
        });
        inst = inst.post();
        inst.$ml.waiting.then(
          function () {
            inst.id.should.equal('1');
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('the service should support post from spec', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST('/v1/example').respond({
          id: '1'
        });
        var inst = impl1.post({
          myProp: 'stuff'
        });
        inst.$ml.waiting.then(
          function () {
            inst.id.should.equal('1');
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('should support put from instance', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPUT('/v1/example/1').respond({});
        var inst = impl1.create({
          id: '1',
          myProp: { stuff: 'test' }
        });
        inst.put({
          myProp: 'stuff'
        }).$ml.waiting.then(
          function () {
            inst.id.should.equal('1');
            inst.myProp.stuff.should.equal('test');
            done();
          },
          function (err) {
            assert(false, 'failed with ' + err);
            done();
          }
        );
        $httpBackend.flush();
      });

      it('does not yet support patch', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        try {
          inst.patch({ with: 'something' });
        }
        catch (err) {
          assert(true);
          return;
        }
        assert(false, 'expected error');
      });

      it('can produce a list of errors for a property', function () {
        var inst = impl1.create({
          id: '1'
        });
        expect(inst.errors('').length).to.equal(1);
      });

      it('can find an error on a property', function () {
        var inst = impl1.create({
          id: '1',

          myProp2: {},
          myProp3: {}
        });
        expect(inst.errors('myProp3').length).to.equal(1);
      });

      it('can inform of zero errors on a property', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        expect(inst.errors('myProp2').length).to.equal(0);
      });

      it('can answer whether a property is valid', function () {
        var inst = impl1.create({
          id: '1',
          myProp2: {}
        });
        inst.propertyValid('myProp2').should.be.true;
      });

      it('can find mulitple errors on a property', function () {
        var inst = impl1.create({
          id: '1',
          myProp4: {}
        });
        expect(inst.errors('myProp4').length).to.equal(2);
      });

      it(
        'should throw on functions that have no default implementation',
        function () {
          var inst = impl1.create();
          try {
            inst.getStateParams();
            assert(false, 'expected to throw');
          }
          catch (e) {}
          try {
            inst.assignStateParams({});
            assert(false, 'expected to throw');
          }
          catch (e) {}

          assert(true);
        }
      );

    });
  };

});
