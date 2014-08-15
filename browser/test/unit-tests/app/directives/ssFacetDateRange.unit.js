define(['testHelper','mocks/index'], function (helper, mocksIndex) {

  return function () {
    describe('ssFacetDateRange', function () {
      var el;
      var scope;
      var $compile;
      var $timeout;
      var dsElement;
      var qtElement;
      var pageElement;
      var dsScope;
      var dsIsolate;
      var mockSeachObj;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function ($rootScope, _$compile_, _$timeout_) {

            scope = $rootScope.$new();
            $compile = _$compile_;
            $timeout = _$timeout_;

            mockSeachObj = mocksIndex.searchObj;

            dsElement = angular.element(
              '<div ss-facet-date-range ' +
                  'criteria="criteria" ' +
                  'results="results" ' +
                '></div>'
            );

            dsElement.append(qtElement);
            dsElement.append(pageElement);

            scope.results     = mockSeachObj.results.facets.dates;
            scope.criteria    = mockSeachObj.criteria;
            $compile(dsElement)(scope);

            scope.$digest();

            dsScope = dsElement.isolateScope();

            done();
          }
        );
      });

      it(
        'should have access to results object and properties',
          function () {
            dsScope.results.should.be.ok;
            //.should.equal('hey');
            //  dsScope.config.pageLength.should.equal(5);
          }
      );

      it(
        'should have access to scope.highchartsConfig',
          function () {
            dsScope.highchartsConfig.should.be.ok;
            dsScope.highchartsConfig.options.chart.events.should.be.ok;
          }
      );

      it(
        'should be able to select a single bar on the chart',
          function () {
            var event = { x: 1391241600000 };
            var chart = window.Highcharts.charts[0];
            var points;

            chart.should.be.ok;

            chart.series[0].data[0].firePointEvent('click', event);
            points = chart.getSelectedPoints();
            points.length.should.equal(1);
          }
      );


      it(
        'should have no selections on the chart',
          function () {
            var chart = window.Highcharts.charts[0];
            var points;

            chart.should.be.ok;

            chart.options.chart.events.click();
            points = chart.getSelectedPoints();
            points.length.should.equal(4);
          }
      );

      it(
        'should have a selected range on the chart',
          function () {
            var event = {
                          xAxis:[{
                            min: 1392388009411.7646,
                            max: 1400053891764.7058
                          }],
                          preventDefault: function () {}
                        };
            var chart = window.Highcharts.charts[0];
            var points;

            chart.should.be.ok;

            chart.options.chart.events.selection.call(chart,event);
            points = chart.getSelectedPoints();
            points.length.should.equal(2);
          }
      );

    });

  };
});
