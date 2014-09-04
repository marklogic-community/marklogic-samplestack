define(['app/module', 'highcharts'], function (module, Highcharts) {

  /**
   * @ngdoc directive
   * @name ssFacetDateRange
   * @restrict E
   *
   * @description
   * Directive rendering an array of search objects as a chart.
   * Selection of a single date result or a range of dates is allowed
   * for filtering. Uses <a href="https://github.com/pablojim/highcharts-ng"
   * target="_blank">highcharts-ng</a> for chart functionality.
   */

  module.directive('ssFacetDateRange', [
    'mlUtil',
    function (mlUtil) {

      return {
        restrict: 'E',

        template:
          '<highchart class="highcharts ss-facet-date-range" ' +
          '  config="highchartsConfig"></highchart>' +
          '<label>From:</label>' +
          '<input ng-model=pickerDateStart type="text" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateStartOptions" ' +
          '  ng-change="applyPickerDates()"  ' +
          '  ng-click="pickerOpen(\'dateStartOpened\')" ' +
          '  is-open="dateStartOpened" ' +
          '  onfocus="this.blur()" ' +
          '  placeholder="{{dateStartPlaceholder}}" ' +
          '  class="form-control ng-valid-date" ' +
          '  />' +
          '<label>To:</label>' +
          '<input ng-model="pickerDateEnd" type="text" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateEndOptions" ' +
          '  ng-change="applyPickerDates()"  ' +
          '  ng-click="pickerOpen(\'dateEndOpened\')" ' +
          '  is-open="dateEndOpened" ' +
          '  onfocus="this.blur()" ' +
          '  placeholder="{{dateEndPlaceholder}}" ' +
          '  class="form-control ng-valid-date"' +
          '  />',

        scope: {
          constraints: '=constraints',
          results: '=results'
        },

        link: {
          pre: function (scope) {
            scope.dateData = [];
            // when highcarts itself loads, store a copy of the instance on the
            // scope
            var onChartLoaded = function (chart) {
              // once the actual chart is loaded by highcharts-ng, maintain
              // a reference to it
              scope.chart = chart;
              // scope.chart.series = [ { data: scope.dateData} ];
            };

            // using scope.dateData and the constraints, assign the
            // selected/non-selected status of points on the chart and the
            // dateStart and dateEnd variables
            var chartUpdateSelections = function (event) {
              var i;

              // $timeout(function () {

              // do nothing if there isn't date data
              // TODO: show some sort of message instead of a blank chart

              // note: using the embedded chart b/c highcharts-ng requires
              // an extra event loop to process its version of the series
              var series = scope.chart.target.series;
              if (series && series[0] && series[0].data.length) {
                var allPoints = series[0].data;
                if (!scope.constraints.dateStart.value &&
                    !scope.constraints.dateEnd.value
                ) {
                  // absent any criteria, all points are considered "in"
                  for (i = 0; i < allPoints.length; i++) {
                    allPoints[i].select(true, true);
                  }
                }
                else {
                  // moment value is being cloned to make sure we aren't
                  // touching the criteria itself

                  var selectionStart = mlUtil.moment(
                    scope.constraints.dateStart.value
                  );
                  if (isNaN(selectionStart)) {
                    selectionStart = null;
                  }
                  // *if* there is an actual constraint, create a scope
                  // variable
                  // for it (again, separate from the actual criteria)
                  // scope.dateStart = selectionStart;

                  // if there isnn't an actual constraint, we start selecting
                  // at the first point
                  if (!selectionStart) {
                    selectionStart = allPoints[0].x;
                  }

                  // same principles for the end point as for the start point
                  var selectionEnd = mlUtil.moment(
                    scope.constraints.dateEnd.value
                  );
                  if (isNaN(selectionEnd)) {
                    selectionEnd = null;
                  }
                  // scope.dateEnd = selectionEnd;
                  if (!selectionEnd) {
                    // for to select to end by adding one to the date
                    selectionEnd =
                        allPoints[allPoints.length - 1].x + 1;
                  }

                  // make the selection assignments based on whether a point
                  // is within bounds
                  for (i = 0; i < allPoints.length; i++) {
                    // mamke a moment variable so we can compare
                    var pointVal = mlUtil.moment(allPoints[i].x);
                    var isPointIn = pointVal >= selectionStart &&
                        pointVal < selectionEnd;
                    // assign point selected status. second param is whether
                    // or
                    // not
                    // to accumulate the selections (as opposed to allowing
                    // the
                    // selection of one point to unselect another)
                    allPoints[i].select(isPointIn, true);
                  }
                }

              }
              // });
              return false; // no more jquery event handling
            };

            var assignIfDifferent = function (newDate, constraint) {
              var newValidDate = isNaN(newDate) ? null : newDate;
              if (newValidDate === null) {
                if (constraint.value === null) {
                  return false;
                }
                else {
                  constraint.value = newValidDate;
                  return true;
                }
              }

              if (!newValidDate.isSame(constraint.value)) {
                constraint.value = newValidDate;
                return true;
              }
              else {
                return false;
              }
            };

            // based on which points are currently selected on the chart,
            // assign the constraints for search.
            //
            // this method DOES modify criteria
            var setScopeSelectedRange = function (event) {

              var foundChange = false;

              scope.$apply(function () {
                var newStart;
                var newEnd;
                if (event.xAxis) {
                  newStart = mlUtil.moment(event.xAxis[0].min).startOf('d');
                  newEnd = mlUtil.moment(event.xAxis[0].max)
                      .startOf('d').add('d', 1);
                }
                else {
                  newStart = mlUtil.moment(event.point.x);
                  newEnd = mlUtil.moment(event.point.x).add('M', 1);
                }
                if (assignIfDifferent(newStart, scope.constraints.dateStart)) {
                  foundChange = true;
                }
                if (assignIfDifferent(newEnd, scope.constraints.dateEnd)) {
                  foundChange = true;
                }
                if (foundChange) {
                  scope.$emit('criteriaChange');
                }
              });

              return false;
            };

            var clearSelectedRange = function (event) {
              scope.$apply(function () {
                var noop = !scope.constraints.dateStart.value &&
                    !scope.constraints.dateEnd.value;
                if (!noop) {
                  scope.constraints.dateStart.value = null;
                  scope.constraints.dateEnd.value = null;
                  scope.$emit('criteriaChange');
                }
              });
              return false;

            };

            scope.highchartsConfig = {
              options: {
                chart: {
                  type: 'column',
                  zoomType: 'x',
                  events: {
                    load: onChartLoaded.bind(this),
                    redraw: chartUpdateSelections,
                    click: clearSelectedRange,
                    selection: setScopeSelectedRange
                  }
                },

                legend: {
                  enabled: false
                },

                xAxis: {
                  type: 'datetime',
                  title: { text: null },
                  // showFirstLabel: true,
                  // showLastLabel: true,
                  // startOnTick: true,
                },
                yAxis: {
                  min: 0, title: {text: null}, labels: { enabled: false }
                },

                tooltip: {
                  formatter: function () {
                    /* jshint ignore:start */
                    return '<strong>' +
                      mlUtil.moment(this.x).format('MMM YYYY') +
                      '</strong>' + ': ' + this.y + ' questions';
                    /* jshint ignore:end */
                  }
                },

                plotOptions: {
                  series: {
                    color: '#DBEDFA',
                    states: { select: { color: '#70B8ED' } },
                    marker: {
                      enabled: true,
                      states: { select: { enabled: true } }
                    },
                    allowPointSelect: true,
                    point: {
                      events: { click: setScopeSelectedRange }
                    }
                  },
                  column: {
                    animation: false,
                    groupPadding: 0,
                    pointPadding: 0,
                    borderWidth: 0
                  }
                }
              },

              title: { text: null },
              subtitle: { text: null }

            };

            scope.dateStartOptions = scope.dateEndOptions = {
              formatYear: 'yy',
              startingDay: 1,
              showWeeks: false,
              showButtonBar: false
            };

            scope.pickerOpen = function (scopeVar) {
              scope[scopeVar] = true;
              return false;
            };

            scope.applyPickerDates = function () {
              var foundChange = false;
              if (assignIfDifferent(
                mlUtil.moment(scope.pickerDateStart),
                scope.constraints.dateStart
              )) {
                foundChange = true;
              }
              if (assignIfDifferent(
                mlUtil.moment(scope.pickerDateEnd).add('d', 1),
                scope.constraints.dateEnd
              )) {
                foundChange = true;
              }
              if (foundChange) {
                scope.$emit('criteriaChange');
              }
            };

          },

          post: function (scope) {
            scope.$on('newResults', function () {
              // empty the dateDate without losing the array object
              var newData = [];
              var maxCount = 0;

              angular.forEach(scope.results, function (item) {
                // we display the *shadow* counts, not the counts
                // that result from applying this directive's criteria
                newData.push({
                  x: Date.UTC(
                    item.shadow.name.substring(0,4),
                    item.shadow.name.substring(4,6) - 1,
                    1
                  ),
                  y: item.shadow.count
                });

                if (item.shadow.count > maxCount) {
                  maxCount = item.shadow.count;
                }
              });

              scope.chart.target.yAxis.max = maxCount;
              scope.chart.target.options.plotOptions.column
                  .pointWidth =
                      scope.chart.target.chartWidth / newData.length - 8;
              scope.highchartsConfig.series = [ { data: newData }];

              var dateToPickerStart = function (val) {
                return val ?
                    new Date(mlUtil.stripZone(
                      mlUtil.moment(val))
                    ) :
                  null;
              };

              var dateToPickerEnd = function (val) {
                return val ?
                    new Date(mlUtil.stripZone(
                      mlUtil.moment(val).subtract('d', 1)
                    )) :
                  null;
              };

              if (newData.length) {
                var date;

                scope.dateStartPlaceholder = mlUtil.moment(
                  dateToPickerStart(newData[0].x)
                ).format('MM/DD/YYYY');

                scope.dateEndPlaceholder = mlUtil.moment(
                  dateToPickerEnd(newData[newData.length - 1].x)
                ).format('MM/DD/YYYY');
              }

              scope.pickerDateStart = dateToPickerStart(
                scope.constraints.dateStart.value
              );

              scope.pickerDateEnd = dateToPickerEnd(
                scope.constraints.dateEnd.value
              );

            });


          }
        } // end link
      }; // end return
    }
  ]); // end directive
});
