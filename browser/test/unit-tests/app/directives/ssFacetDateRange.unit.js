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

    });

  };
});
