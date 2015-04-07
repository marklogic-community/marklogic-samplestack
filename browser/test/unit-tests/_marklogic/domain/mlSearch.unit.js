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
  'mocks/index'
], function (helper, mocks) {

  return function () {
    describe('mlSearch', function () {
      var $httpBackend;
      var $injector;
      var $timeout;
      var mlSearch;
      var mlUtil;

      beforeEach(function (done) {
        module('_marklogic');
        inject(
          function (
            _$httpBackend_,
            _$injector_,
            _$timeout_,
            _mlSearch_,
            _mlUtil_
          ) {
            $httpBackend = _$httpBackend_;
            $injector = _$injector_;
            $timeout = _$timeout_;
            mlSearch = _mlSearch_;
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      // it('should work with the example in the docs', function () {
      //
      //   var search = mlSearch.create({
      //     criteria: {
      //       // search for this text
      //       q: '"red flag"',
      //       // results beginning at 11th item
      //       start: 11,
      //       // results ending at 20th item
      //       limit: 20,
      //       // only include results where someCustomCritera === true
      //       constraints: {
      //         someCustomCriteria: {
      //           constraintName: 'constrName',
      //           constraintType: 'value',
      //           type: 'boolean',
      //           queryStringName: 'constr-name',
      //           value: true
      //         },
      //         myFacetName: {
      //           constraintName: 'facetName',
      //           constraintType: 'range',
      //           type: 'enum',
      //           subType: 'value',
      //           queryStringName: 'facet-name',
      //           facetValuesType: 'object',
      //           values: ['some text', 'some other text']
      //         }
      //       }
      //     },
      //     // configure that we want facet values for the `myFacetName` facet
      //     // and that a shadow query which calculates alternate facet values
      //     // should be included which *omits* myFacetName. This gives
      //     // context to what the results *would have* looked like without
      //     // the applied myFacetName settings
      //     facets: {
      //       myFacetName: {
      //         valuesType: 'object',
      //         shadowConstraints: [ 'facetName' ]
      //       }
      //     }
      //   });
      //
      //   helper.setExpectCsrf($httpBackend);
      //   /* jshint ignore:start */
      //   $httpBackend.expectPOST('/v1/search', {
      //     "query":{
      //       "qtext":"\"red flag\"",
      //       "and-query":{
      //         "queries":[
      //           {
      //             "value-constraint-query":{
      //               "constraint-name":"constrName",
      //               "text":true
      //             }
      //           },
      //           {
      //             "range-constraint-query":{
      //               "constraint-name":"facetName",
      //               "value":"some text"
      //             }
      //           },
      //           {
      //             "range-constraint-query":{
      //               "constraint-name":"facetName",
      //               "value":"some other text"
      //             }
      //           }
      //         ]
      //       }
      //     },
      //     "start": 11
      //   }).respond(200);
      //   /* jshint ignore:end */
      //
      //   search.post().$ml.waiting.then(
      //     function () {
      //       angular.noop();
      //       assert(true);
      //     }
      //   );
      //   $httpBackend.flush();
      // });

      it('should be valid for a simple a text query', function () {
        var s = mlSearch.create({
          criteria: { q: 'testy' }
        });
        s.$ml.valid.should.be.true;
      });

      it('should POST a text-only query', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(/\/v1\/search$/)
            .respond(200, mocks.searchResponse);

        var s = mlSearch.post({
          criteria: { q: 'testy' }
        });
        s.$ml.waiting.then(
          function () {
            expect(s.results).to.be.ok;
            expect(s.$ml.valid).to.be.true;
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it(
        'should POST a query without a criterion if value is not truthy',
        function (done) {
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST(
            /\/v1\/search$/,
            {
              search: {
                qtext: ['testy']
              }
            }
          ).respond(200, mocks.searchResponse );

          var s = mlSearch.post({
            criteria: {
              q: 'testy',
              constraints: {
                dummy: {
                  queryStringName: 'dummy',
                  constraintName: 'dummy',
                  type: 'text'
                }
              }
            }
          });
          s.$ml.waiting.then(
            function () {
              s.results.should.be.ok;
              s.$ml.valid.should.be.true;
              done();
            },
            function (reason) { assert(false, JSON.stringify(reason)); done(); }
          );

          $httpBackend.flush();
        }
      );

      it('should POST a query with a text constraint', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          /\/v1\/search$/,
          {
            search: {
              qtext: ['testy'],
              query: {
                'and-query': { queries: [
                  { 'range-constraint-query' : {
                    'constraint-name': 'dummy',
                    text: 'testy'
                  } }
                ] }
              }
            },
          }
        ).respond(200, mocks.searchResponse );

        var s = mlSearch.post({
          criteria: {
            q: 'testy',
            constraints: {
              dummy: {
                constraintName: 'dummy',
                constraintType: 'range',
                queryStringName: 'dummy',
                type: 'text',
                value: 'testy'
              }
            }
          }
        });
        s.$ml.waiting.then(
          function () {
            s.results.should.be.ok;
            s.$ml.valid.should.be.true;
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it(
        'should POST a query with no text constraint and still have "q"',
        function (done) {
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST(
            /\/v1\/search$/,
            {
              search: {
                qtext: ['']
              }
            }
          ).respond(200, mocks.searchResponse );

          var s = mlSearch.post({
            criteria: {
            }
          });
          s.$ml.waiting.then(
            function () {
              s.results.should.be.ok;
              s.$ml.valid.should.be.true;
              done();
            },
            function (reason) { assert(false, JSON.stringify(reason)); done(); }
          );

          $httpBackend.flush();
        }
      );

      it('should POST a query with an enum constraint', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          /\/v1\/search$/,
          {
            search: {
              qtext: ['testy'],
              query: {
                'and-query': { queries: [
                  { 'range-constraint-query' : {
                    'constraint-name': 'dummy',
                    text: 'test1'
                  } },
                  { 'range-constraint-query' : {
                    'constraint-name': 'dummy',
                    text: 'test2'
                  } },
                ] }
              }
            }
          }
        ).respond(200, mocks.searchResponse );

        var s = mlSearch.post({
          criteria: {
            q: 'testy',
            constraints: {
              dummy: {
                queryStringName: 'dummy',
                constraintName: 'dummy',
                constraintType: 'range',
                type: 'enum',
                subType: 'text',
                values: ['test1', 'test2']
              }
            }
          }
        });
        s.$ml.waiting.then(
          function () {
            s.results.should.be.ok;
            s.$ml.valid.should.be.true;
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it('should POST a query with a date constraint', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          /\/v1\/search$/,
          {
            search: {
              qtext: ['testy'],
              query: {
                'and-query': { queries: [
                  { 'range-constraint-query' : {
                    'constraint-name': 'dummy',
                    value: mlUtil.moment('2001-01-01T00:00:00Z')
                  } }
                ] }
              }
            }
          }
        ).respond(200, mocks.searchResponse );

        var s = mlSearch.post({
          criteria: {
            q: 'testy',
            constraints: {
              dummy: {
                constraintName: 'dummy',
                constraintType: 'range',
                queryStringName: 'dummy',
                type: 'dateTime',
                value: mlUtil.moment('2001-01-01T00:00:00Z')
              }
            }
          }
        });
        s.$ml.waiting.then(
          function () {
            s.results.should.be.ok;
            s.$ml.valid.should.be.true;
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it('should POST a query with a boolean constraint', function (done) {
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(
          /\/v1\/search$/,
          {
            search: {
              qtext: ['testy'],
              query: {
                'and-query': { queries: [
                  { 'range-constraint-query' : {
                    'constraint-name': 'dummy',
                    'text': true
                  } }
                ] }
              }
            }
          }
        ).respond(200, mocks.searchResponse );

        var s = mlSearch.post({
          criteria: {
            q: 'testy',
            constraints: {
              dummy: {
                constraintName: 'dummy',
                constraintType: 'range',
                queryStringName: 'dummy',
                type: 'boolean',
                value: true
              }
            }
          }
        });
        s.$ml.waiting.then(
          function () {
            s.results.should.be.ok;
            s.$ml.valid.should.be.true;
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it('should produce empty stateParams with no criteria', function () {
        var s = mlSearch.create();
        s.getStateParams().should.deep.equal({});
      });

      it('should produce empty stateParams with empty criteria', function () {
        var s = mlSearch.create({ criteria: {} });
        s.getStateParams().should.deep.equal({});
      });


      it('should produce stateParams with q', function () {
        var s = mlSearch.create({ criteria: { q: 'test' } });
        s.getStateParams().should.have.property('q', 'test');
      });

      it('should produce stateParams with a date', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'dateTime',
              value: mlUtil.moment('2001-01-01T00:00:00.000Z')
            }
          }
        } });
        s.getStateParams().should.have.property(
          'test-name',
          mlUtil.moment('2001-01-01T00:00:00.000Z').toISOString()
        );
      });

      it('should produce stateParams with an enum', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'enum',
              subType: 'string',
              values: ['1', '2']
            }
          }
        } });
        s.getStateParams().should.have.property('test-name', '1,2');
      });

      it('should produce stateParams with an empty enum', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'enum',
              subType: 'string',
              values: []
            }
          }
        } });
        s.getStateParams().should.deep.equal({});
      });

      it('should produce stateParams with no enum', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'enum',
              subType: 'string'
            }
          }
        } });
        s.getStateParams().should.deep.equal({});
      });

      it('should produce stateParams without a date', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'date'
            }
          }
        } });
        s.getStateParams().should.deep.equal({});
      });

      it('should produce stateParams with a boolean', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'boolean',
              value: true
            }
          }
        } });
        s.getStateParams().should.have.property('test-name', 'yes');
      });

      it('should produce stateParams without a boolean', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'boolean'
            }
          }
        } });
        s.getStateParams().should.deep.equal({});
      });

      it('should produce stateParams with a text', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'text',
              value: 'dummy'
            }
          }
        } });
        s.getStateParams().should.have.property('test-name', 'dummy');
      });

      it('should produce stateParams without a text', function () {
        var s = mlSearch.create({ criteria: {
          constraints: {
            dummy: {
              queryStringName: 'test-name',
              type: 'text'
            }
          }
        } });
        s.getStateParams().should.deep.equal({});
      });

      it('should take a set of stateParams and assign them', function () {
        var s = mlSearch.create({
          criteria: { constraints: {
            a: { type: 'boolean', queryStringName: 'a' },
            b: { type: 'text', queryStringName: 'b'  },
            c: { type: 'enum', subType: 'string', queryStringName: 'c'  },
            d: { type: 'dateTime', queryStringName: 'd'  },
            e: { type: 'enum', queryStringName: 'e' },
            f: { type: 'dateTime', queryStringName: 'f' },
            g: { type: 'text', queryStringName: 'g' },
            h: { type: 'boolean', queryStringName: 'h' },
            i: { type: 'boolean', queryStringName: 'i' }
          }}
        });

        s.assignStateParams({
          a: 'yes',
          b: 'test',
          c: '1,2',
          d: mlUtil.moment('2001-01-01T00:00:00.000Z').toISOString(),
          e: '',
          f: '',
          g: '',
          h: 'junk',
          i: 'no',
          q: 'stuff',
          page: '2'
        });

        s.criteria.q.should.equal('stuff');
        expect(s.getCurrentPage()).to.equal(2);

        var expectation = {
          a: { type: 'boolean', queryStringName: 'a', value: true },
          b: { type: 'text', queryStringName: 'b', value: 'test' },
          c: {
            type: 'enum',
            subType: 'string',
            queryStringName: 'c',
            values: ['1', '2']
          },
          d: {
            type: 'dateTime',
            queryStringName: 'd',
            value: mlUtil.moment('2001-01-01T00:00:00.000Z')
          },
          e: {
            type: 'enum',
            queryStringName: 'e',
            values: null
          },
          f: {
            type: 'dateTime',
            queryStringName: 'f',
            value: null
          },
          g: {
            type: 'text',
            queryStringName: 'g',
            value: ''
          },
          h: {
            type: 'boolean',
            queryStringName: 'h',
            value: null
          },
          i: {
            type: 'boolean',
            queryStringName: 'i',
            value: false
          }
        };
        JSON.stringify(s.criteria.constraints)
            .should.deep.equal(JSON.stringify(expectation));
      });

      it('should throw for unsupported methods', function () {
        try {
          var s = mlSearch.getOne({
            id: 1
          });
        }
        catch (err) {
          assert(true);
          return;
        }
        assert(false, 'expected error');
      });

      it('should do a shadow query', function (done) {
        var shadowResult = angular.copy(mocks.searchResult);
        angular.forEach(shadowResult.facets, function (facet) {
          angular.forEach(facet.facetValues, function (facetValues) {
            facetValues.count = facetValues.count * 2;
          });
        });
        helper.setExpectCsrf($httpBackend);
        $httpBackend.expectPOST(/\/v1\/search$/).respond(mocks.searchResponse);
        $httpBackend.expectPOST(/\/v1\/search\?shadow=tag$/)
            .respond(mocks.searchResponse);

        var s = mlSearch.create({
          facets: {
            tag: {
              constraints: ['tag'],
              shadowConstraints: [ 'tag' ]
            }
          },
          criteria: {
            q: 'testy',
            constraints: {
              tag: {
                queryStringName: 'tag',
                constraintName: 'tag',
                constraintType: 'range',
                type: 'enum',
                subType: 'text',
                values: ['test1', 'test2']
              }
            }
          }
        });

        s.shadowSearch().then(
          function () {
            assert(true);
            done();
          },
          function (reason) { assert(false, JSON.stringify(reason)); done(); }
        );

        $httpBackend.flush();
      });

      it(
        'should not modify watched criteria when doing a shadow query',
        function (done) {
          var shadowResult = angular.copy(mocks.searchResult);
          angular.forEach(shadowResult.facets, function (facet) {
            angular.forEach(facet.facetValues, function (facetValues) {
              facetValues.count = facetValues.count * 2;
            });
          });
          helper.setExpectCsrf($httpBackend);
          $httpBackend.expectPOST(/\/v1\/search$/)
              .respond(mocks.searchResponse);
          $httpBackend.expectPOST(/\/v1\/search\?shadow=tag$/)
              .respond(mocks.searchResponse);

          var s = mlSearch.create({
            facets: {
              tag: {
                constraints: ['tag'],
                shadowConstraints: [ 'tag' ]
              }
            },
            criteria: {
              q: 'testy',
              constraints: {
                tag: {
                  queryStringName: 'tag',
                  constraintName: 'tag',
                  constraintType: 'range',
                  type: 'enum',
                  subType: 'text',
                  values: ['test1', 'test2']
                }
              }
            }
          });

          var scope = $injector.get('$rootScope').$new();

          scope.search = s;
          var beWatching = false;
          scope.$watch(
            'search.criteria',
            function (newVal, oldVal) {
              if (beWatching) {
                assert(false, 'detected a criteria change:\n\n' +
                    '\toldVal:\n' + JSON.stringify(oldVal, null, ' ') +
                    '\n\n\tnewVal:\n' + JSON.stringify(newVal, null, ' '));
              }
            },
            true
          );
          scope.$apply();

          beWatching = true;
          s.shadowSearch().then(
            function () {
              assert(true);
              done();
            },
            function (reason) { assert(false, JSON.stringify(reason)); done(); }
          );

          $httpBackend.flush();
        }
      );
    });

  };

});
