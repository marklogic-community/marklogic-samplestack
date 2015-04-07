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

define(['testHelper','mocks/index'], function (helper, mocks) {

  return function () {
    describe('ssFacetDateRange', function () {
      var el;
      var parentScope;
      var scope;
      var ssSearch;
      var $compile;
      var $timeout;
      var mlUtil;
      var ssSearchInstance;
      var emitSpy;

      beforeEach(function (done) {
        this.timeout(5000);
        module('app');

        inject(
          function (
            $rootScope,
            _$compile_,
            _$timeout_,
            _$httpBackend_,
            _mlUtil_
          ) {

            parentScope = $rootScope.$new();
            $compile = _$compile_;
            $timeout = _$timeout_;
            mlUtil = _mlUtil_;

            ssSearchInstance = mocks.ssSearchInstance;
            var ds = ssSearchInstance.criteria.constraints.dateStart;
            var de = ssSearchInstance.criteria.constraints.dateEnd;
            ds.value = mlUtil.moment(ds.value);
            de.value = mlUtil.moment(de.value);


            el = angular.element(
              '<ss-facet-date-range ' +
                  'constraints="constraints" ' +
                  'results="results" ' +
                '></ss-facet-date-range>'
            );
            $compile(el)(parentScope);
            parentScope.$apply();
            scope = el.isolateScope();

            scope.$apply();
            scope.results = ssSearchInstance.results.facets.dates;
            scope.constraints = ssSearchInstance.criteria.constraints;
            scope.$emit('newResults');
            scope.$apply();
            emitSpy = sinon.spy(scope, '$emit');
            $timeout.flush();
            done();
          }
        );
      });

      it('the first point\'s count should match the results', function () {
        expect(scope.chart.target.series[0].data[0].y)
            .to.equal(scope.results[0].shadow.count);
      });

      it(
        'should fire criteriaChange on col click',
        function () {
          var event = { point: scope.chart.target.series[0].points[2] };
          scope.chart.target.series[0].points[2].firePointEvent('click', event);
          scope.$apply();
          expect(emitSpy.calledWith('criteriaChange')).to.be.true;
        }
      );

      it(
        'should represent dates in browser-local timezone on month click',
        function () {
          var point = scope.chart.target.series[0].points[2];
          var event = { point: point };
          point.firePointEvent('click', event);
          scope.$apply();
          var resultDataPoint = ssSearchInstance.results.facets.dates[2].name;
          var resultStart = mlUtil.moment(resultDataPoint, 'YYYYMM');
          // starts on beginning of month incl. timezone
          expect(resultStart.toISOString())
              .to.equal(scope.constraints.dateStart.value.toISOString());
          // ends on beginning of next month incl. timezone
          expect(resultStart.add(1, 'M').toISOString())
              .to.equal(scope.constraints.dateEnd.value.toISOString());
        }
      );

    });

  };
});
