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
  'mocks/index'
], function (mocks) {

  return function () {
    describe('ssSearch', function () {
      var $httpBackend;
      var ssSearch;
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssSearch_, _mlUtil_) {
            $httpBackend = _$httpBackend_;
            ssSearch = _ssSearch_;
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      it('should be produce a valid range query', function () {
        var self = this;
        var s = ssSearch.create({
          criteria: { constraints: { dateStart: {
            value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
          } } }
        });
        $httpBackend.expectPOST(
          '/v1/search',
          {
            search: {
              qtext: ['', 'sort:active'],
              query: {
                'and-query': {
                  queries: [ {
                    'range-constraint-query': {
                      'constraint-name': 'lastActivity',
                      'value': mlUtil.moment('2014-08-01T00:00:00.000-05:00'),
                      'range-operator': 'GE'
                    }
                  } ]
                }
              },
              timezone: window.jstz.determine().name()
            }
          }
        ).respond(500);
        // keep it from trying to parse the reponse by sending an error,
        // we only care that the request was valid
        s.post();
        $httpBackend.flush();
        assert(true);
      });

      it('should produce a query for "resolved"', function () {
        var self = this;
        var s = ssSearch.create({
          criteria: { constraints: { resolved: {
            value: true
          } } }
        });
        $httpBackend.expectPOST(
          '/v1/search',
          {
            search: {
              qtext: ['', 'sort:active'],
              query: {
                'and-query': {
                  queries: [ {
                    'value-constraint-query': {
                      'constraint-name': 'resolved',
                      'text': true
                    }
                  } ]
                }
              },
              timezone: window.jstz.determine().name()
            }
          }
        ).respond(500);
        // keep it from trying to parse the reponse by sending an error,
        // we only care that the request was valid
        s.post();
        $httpBackend.flush();
        assert(true);
      });

      it('should get back an object for tags facet results', function (done) {
        var s = ssSearch.create({
          criteria: {
            constraints: {
              dateStart: {
                value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
              },
              tags: {
                values: ['javascript']
              }
            }
          }
        });
        $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
        s.post().$ml.waiting.then(
          function () {
            expect(s.results.facets.tags).not.to.be.an('array');
            done();
          }
        );
        $httpBackend.flush();
      });

      it('should get back an array for dates facet results', function (done) {
        var s = ssSearch.create({
          criteria: {
            constraints: {
              dateStart: {
                value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
              },
              tags: {
                values: ['javascript']
              }
            }
          }
        });
        $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
        s.post().$ml.waiting.then(
          function () {
            expect(s.results.facets.dates).to.be.an('array');
            done();
          }
        );
        $httpBackend.flush();
      });

      it('should have shadows dates', function (done) {
        var s = ssSearch.create({
          criteria: {
            constraints: {
              dateStart: {
                value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
              },
              tags: {
                values: ['javascript']
              }
            }
          }
        });
        $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
        $httpBackend.expectPOST('/v1/search?shadow=tags')
            .respond(mocks.searchResponse);
        $httpBackend.expectPOST('/v1/search?shadow=dates')
            .respond(mocks.searchResponse);
        s.shadowSearch().then(
          function () {
            expect(s.results.facets.dates[0].shadow).to.be.ok;
            done();
          }
        );
        $httpBackend.flush();
      });

    });

  };

});
