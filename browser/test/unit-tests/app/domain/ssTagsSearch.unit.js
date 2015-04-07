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
    describe('ssTagsSearch', function () {
      var $httpBackend;
      var ssTagsSearch;
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssTagsSearch_, _mlUtil_) {
            $httpBackend = _$httpBackend_;
            ssTagsSearch = _ssTagsSearch_;
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      it('should validate a minimally viable search', function () {
        var self = this;
        var s = ssTagsSearch.create({});
        expect(s.$ml.valid).to.be.true;
      });

      it('should post a minimal body for minimal search', function () {
        var s = ssTagsSearch.create();
        $httpBackend.expectPOST('/v1/tags', {
          search: {
            start: s.criteria.tagsQuery.start,
            pageLength: s.criteria.tagsQuery.pageLength,
            qtext: [''],
            timezone: window.jstz.determine().name()
          }
        }).respond(mocks.tagsResult);
        s.post();
        $httpBackend.flush();
      });


      it('should post a body for underlying search', function () {
        var s = ssTagsSearch.create({
          criteria: { constraints: { dateStart: {
            value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
          } } }
        });
        $httpBackend.expectPOST('/v1/tags', {
          search: {
            start: s.criteria.tagsQuery.start,
            pageLength: s.criteria.tagsQuery.pageLength,
            qtext: [''],
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
        }).respond(mocks.tagsResult);
        s.post();
        $httpBackend.flush();
      });

    });
  };
});
