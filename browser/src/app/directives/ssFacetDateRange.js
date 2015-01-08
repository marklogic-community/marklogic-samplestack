define(['app/module'], function (module) {

  /* jshint ignore:start */

  /**
   * @ngdoc directive
   * @name ssFacetDateRange
   * @restrict E
   * @param {object} constraints The search `criteria.constraints property from {@link ssSearch}
   * @param {object} results The search `results` for the date facet form {@link ssSearch}
   *
   * @description
   * Renders date range facet of search results into a
   * <a href="https://github.com/pablojim/highcharts-ng"
   * target="_blank">highcharts-ng</a> chart, and allows the user
   * to specify a range of dates over which to filter the search by selecting
   * a range within the chart or by using date-picker dropdowns.
   *
   * Listens for `newResults` event to trigger popuplation of results.
   *
   * When the user selects a range either through the chart or using the date
   * pickers, a `criteriaChange` event is emitted so that the search may be
   * updated..
   *
   * ## `scope` properties/methods:
   *
   * | Variable  | Type | Details |
   * |--|--|--|
   * | `dateData`  | {@type Array}  | Array of Configuration for the highcharts object. |
   * | `highchartsConfig`  | {@type object}  | Configuration for the highcharts object. |
   * | `chart` | {@type object} | Reference to the actual Highcharts chart |
   * | `store.session`  | {@link ssSession}  | As provided by $rootScope, provides session information. |
   * | `dateStartOptions`  | {@type ojbect}  | Configuration for date start picker |
   * | `dateEndOptions`  | {@type ojbect}  | Configuration for date end picker |
   * | `pickerOpen` | {@type function(string)}  | Opens one or the other date picker as specified by the parameter. |
   * | `applyPickerDates`  | {@type function}  | Applies the values in the date pickers to the relevant properties of the search constraints, and if they have been modified, emits `criteriaChange` |
   * | `dateStartPlaceholder` | {@type string}  | Formatted representation of the first date found (shadowed) search results to use as placeholder in the dateStart picker. |
   * | `dateEndPlaceholder` | {@type string}  | Formatted representation of the late date found (shadowed) search results to use as placeholder in the dateEnd picker. |
   * | `pickerDateStart`  | {@type Date? }  | If a Date object, the value of the dateStart search constraint represented as a day for the dateStart picker. |
   * | `pickerDateEnd`  | {@type Date? }  | If a Date object, the value of the dateEnd search constraint represented as a day for the dateEnd picker. |
   */

  /* jshint ignore:end */

  module.directive('ssFacetDateRange', [
    '$timeout', 'mlUtil',
    function ($timeout, mlUtil) {

      return {
        restrict: 'E',

        template:
          '<highchart class="highcharts ss-facet-date-range" ' +
          '  config="highchartsConfig"></highchart>' +
          '<div class="input-daterange input-group">' +
          '<input ng-model="pickerDateStart" type="text" ' +
          '  class="input-sm form-control ng-valid-date" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateStartOptions" ' +
          '  ng-change="applyPickerDates()" ' +
          '  ng-click="pickerOpen(\'dateStartOpened\')" ' +
          '  is-open="dateStartOpened" ' +
          '  placeholder="{{dateStartPlaceholder}}" ' +
          '  name="start" close-text="Close" />' +

          '<span class="input-group-addon">to</span>' +

          '<input ng-model="pickerDateEnd" type="text" ' +
          '  class="input-sm form-control ng-valid-date" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateEndOptions" ' +
          '  ng-change="applyPickerDates()"  ' +
          '  ng-click="pickerOpen(\'dateEndOpened\')" ' +
          '  is-open="dateEndOpened" ' +
          '  placeholder="{{dateEndPlaceholder}}" ' +
          '  class="form-control ng-valid-date"' +
          '  close-text="Close" />' +
          '</div>',

        scope: {
          constraints: '=constraints',
          results: '=results'
        },

        link: {
          pre: function (scope) {
            // scope.dateData = [];
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

                  if (!selectionEnd) {
                    // for to select to end by adding a month to the date
                    // of the last bar
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
                    // or not to accumulate the selections (as opposed to
                    // allowing the selection of one point to unselect another)
                    allPoints[i].select(isPointIn, true);
                  }
                }
              }
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
                    pointPadding: 0.2, // adjust for bar spacing
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
              var dStart = mlUtil.moment(scope.pickerDateStart);
              var dEnd = mlUtil.moment(scope.pickerDateEnd).add('d', 1);
              if (dStart.isValid() && assignIfDifferent(
                dStart,
                scope.constraints.dateStart
              )) {
                foundChange = true;
              }
              if (dEnd.isValid() && assignIfDifferent(
                dEnd,
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


              //TODO: this timeout is a cheap hack to alleviate
              //problems from overlapping searches. The real solution
              // properly supercede those searches when a new search
              // gets under way.
              $timeout(function () {

                // empty the dateDate without losing the array object
                var newData = [];
                var maxCount = 0;

                angular.forEach(scope.results, function (item) {
                  // we display the *shadow* counts, not the counts
                  // that result from applying this directive's criteria
                  newData.push({
                    x: mlUtil.moment(item.shadow.name, 'YYYYMM').toDate(),
                    y: item.shadow.count
                  });

                  if (item.shadow.count > maxCount) {
                    maxCount = item.shadow.count;
                  }
                });

                scope.chart.target.yAxis.max = maxCount;
                // using this math is presumptuous as to how many bars we are
                // trying to render -- "lies, da*n lies and statistics"
                // scope.chart.target.options.plotOptions.column
                //     .pointWidth =
                //         scope.chart.target.chartWidth / newData.length - 8;
                scope.highchartsConfig.series = [ { data: newData }];

                var dateToPickerStart = function (val) {
                  return val ?
                      val :
                      null;
                };

                var dateToPickerEnd = function (val) {
                  return val ?
                      new Date(mlUtil.moment(val).subtract('d', 1)) :
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
                else {
                  scope.dateStartPlaceholder = null;
                  scope.dateEndPlaceholder = null;
                }

                var pickerStart = scope.constraints.dateStart.value ?
                    mlUtil.moment(
                      dateToPickerStart(scope.constraints.dateStart.value)
                    ).format('MM/DD/YYYY') :
                    null;
                scope.pickerDateStart = pickerStart;

                var pickerEnd = scope.constraints.dateEnd.value ?
                    mlUtil.moment(
                      dateToPickerEnd(scope.constraints.dateEnd.value)
                    ).format('MM/DD/YYYY') :
                    null;
                scope.pickerDateEnd = pickerEnd;
              }, 100);

            });


          }
        } // end link
      }; // end return
    }
  ]); // end directive
});
