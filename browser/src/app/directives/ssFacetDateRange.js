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
   * | `lastValid`  | {@type object }  | Stores the last valid Date values for pickerDateStart and pickerDateEnd to be used in the case of an invalid date through manual entry. |
   */

  /* jshint ignore:end */

  module.directive('ssFacetDateRange', [
    '$timeout', 'mlUtil',
    function ($timeout, mlUtil) {

      return {
        restrict: 'E',

        template:
          '<div ' +
          ' title="Constrain results to selected dates.' +
          ' Drag to select a date range.">' +
          '<highchart class="highcharts ss-facet-date-range" ' +
          '  config="highchartsConfig"></highchart></div>' +
          '<div class="input-daterange input-group">' +
          '<input ng-model="pickerDateStart" type="text" ' +
          '  class="input-sm form-control ng-valid-date" ' +
          '  title=' +
              '"Constrain results to entries beginning on selected date" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateStartOptions" ' +
          '  ng-model-onblur-onenter ' +
          '  ng-change="applyPickerDates()"' +
          '  ng-click="pickerOpen($event,\'Start\')" ' +
          '  is-open="dateStartOpened" ' +
          '  placeholder="{{dateStartPlaceholder}}" ' +
          '  name="start" parse-strict="parseStrict" close-text="Close" />' +

          '<span class="input-group-addon">to</span>' +

          '<input ng-model="pickerDateEnd" type="text" ' +
          '  class="input-sm form-control ng-valid-date" ' +
          '  title=' +
              '"Constrain results to entries ending on selected date" ' +
          '  datepicker-popup="MM/dd/yyyy" ' +
          '  datepicker-options="dateEndOptions" ' +
          '  ng-model-onblur-onenter ' +
          '  ng-change="applyPickerDates()"' +
          '  ng-click="pickerOpen($event,\'End\')" ' +
          '  is-open="dateEndOpened" ' +
          '  placeholder="{{dateEndPlaceholder}}" ' +
          '  class="form-control ng-valid-date"' +
          '   parse-strict="parseStrict" close-text="Close" />' +
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
                    selectionStart = mlUtil.moment(allPoints[0].x);
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
                        mlUtil.moment(allPoints[allPoints.length - 1].x)
                        .add(1, 'M');
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

            // simple utility function thtat checks to see if the date passed
            // has a value that is different from the value of the constraint
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
                var selStart;
                var selEnd;
                var rangeStart;
                var rangeEnd;
                if (event.xAxis) {
                  selStart = mlUtil.moment(event.xAxis[0].min).startOf('M');
                  selEnd = mlUtil.moment(event.xAxis[0].max)
                      .startOf('M').add(1, 'M');
                }
                else {
                  selStart = mlUtil.moment(event.point.x).startOf('M');
                  selEnd = mlUtil.moment(event.point.x)
                      .startOf('M').add(1, 'M');
                }

                // correct for drag selection to the edges of the range
                if (scope.dataRange.start) {
                  rangeStart = scope.dataRange.start.clone();
                  selStart = (selStart < rangeStart) ?
                    rangeStart :
                    selStart;
                }

                if (scope.dataRange.end) {
                  rangeEnd = scope.dataRange.end.clone()
                      .startOf('M').add(1, 'M');
                  selEnd = (scope.dataRange.end && selEnd > rangeEnd) ?
                    rangeEnd :
                    selEnd;
                }

                if (assignIfDifferent(selStart, scope.constraints.dateStart)) {
                  foundChange = true;
                }
                if (assignIfDifferent(selEnd, scope.constraints.dateEnd)) {
                  foundChange = true;
                }
                if (foundChange) {
                  scope.$emit('criteriaChange');
                }
              });

              return false;
            };

            // clears the range selection on the chart,
            // as well as the constraint values
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

            // HighCharts configuration object with event callbacks
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
                  labels: {
                      format: '{value:%Y}',
                  }
                },
                yAxis: {
                  min: 0, title: {text: null}, labels: { enabled: false }
                },

                tooltip: {
                  backgroundColor:'#191919',
                  borderColor:'#191919',
                  style: { color: '#fff' },
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

            // angulas-ui datepicker directive options
            scope.dateStartOptions = scope.dateEndOptions = {
              formatYear: 'yy',
              startingDay: 1,
              showWeeks: false,
              showButtonBar: false
            };

            // angulas-ui datepicker extended option for ensuring that the
            // datepicker only ever parses manually entered dates strictly
            // and does not attempt to set the picker value unless the
            // input matches the required format
            scope.parseStrict = true;

            // clears the constraint associated with a datepicker input
            scope.clearSingleDate = function (inputModel) {
              if (inputModel === 'pickerDateStart') {
                scope.constraints.dateStart.value = null;
              }
              else {
                scope.constraints.dateEnd.value = null;
              }
            };

            // closes the datepicker popup UI for both datepickers
            scope.closePickers = function () {
              scope['dateStartOpened'] = false;
              scope['dateEndOpened'] = false;
            };

            // pickerOpen triggered on input click event
            // event - click event object
            // picker - either 'Start' or 'End', depending on which clicked
            scope.pickerOpen = function (event,picker) {
              var el = angular.element(event.target);
              var scopeVar = 'pickerDate' + picker;
              var openVar = 'date' + picker + 'Opened';
              var placeHolderVar = 'date' + picker + 'Placeholder';
              var closeVar = (picker === 'Start') ?
                                'dateEndOpened' : 'dateStartOpened';

              // store selected input and model to later validation
              if (scope.selectedInputModel !== scopeVar) {
                scope.selectedInput = el;
                scope.selectedInputModel = scopeVar;
              }

              // swap input model's value with placeholder value, only if
              // the input is not defined.  This ensures that when the
              // datepicker pop-up renders, it has the placeholder date
              // as its selected value.
              var oldScope;
              var swappedPlaceholder;
              if (!scope[scopeVar]) {
                swappedPlaceholder = true;
                oldScope = scope[scopeVar];
                scope[scopeVar] = scope[placeHolderVar];
              }

              // open datepicker pop-up
              scope[openVar] = true;
              scope[closeVar] = false;

              // if we swapped the value, so pop-up was set to placeholder
              // then reset the input value back to the old value
              if (swappedPlaceholder) {
                $timeout(function () {
                  scope[scopeVar] = oldScope;
                },10);
              }
              event.preventDefault();
              event.stopPropagation();
            };

            // applyPickerDates triggered on ng-change, which occurs on
            // selection of a date by the picker pop-up, or during manual
            // entry of a date on keydown 'enter' or blur events
            // (see ngModelOnblurOnenter directive below for more details)
            scope.applyPickerDates = function () {
              var foundChange = false;
              var el = scope.selectedInput;
              var model = scope.selectedInputModel;

              // case invalid date format, so bound scope undefined
              // reset value to previously valid value
              if (!scope[model] && el.val()) {
                // case of invalid model value, from manual entry
                // reset it's value in the input to what was there previously
                // but don't update the scope model, as this entry was
                // never committed
                if (el.val() !== scope.lastValid[model]) {
                  el.val(scope.lastValid[model]);
                }
                // case where ng-change is triggered by Clear button in the
                // datepicker pop-up.  This event happens, but the view element
                // in the DOM has yet to be updated, so in still contains
                // the same value as in the lastValid scope value.
                else {
                  scope.clearSingleDate(model);
                  foundChange = true;
                }
              }

              // case where scope was manually cleared
              if (!scope[model] && !el.val()) {
                scope.clearSingleDate(model);
                foundChange = true;
              }

              // If a valid but out-of-order date is manually
              // entered, replace the opposite field with the same date.
              if (scope.pickerDateStart && scope.pickerDateEnd
                    && (mlUtil.moment(scope.pickerDateStart)
                                    > mlUtil.moment(scope.pickerDateEnd)
                    || mlUtil.moment(scope.pickerDateEnd)
                                    < mlUtil.moment(scope.pickerDateStart)) ) {
                var oVar = (model === 'pickerDateStart') ?
                                  'pickerDateEnd' : 'pickerDateStart';
                scope[oVar] = mlUtil.moment(scope[model]).format('MM/DD/YYYY');
              }

              if (scope.pickerDateStart && assignIfDifferent(
                mlUtil.moment(scope.pickerDateStart),
                scope.constraints.dateStart
              )) {
                foundChange = true;
              }
              if (scope.pickerDateEnd && assignIfDifferent(
                mlUtil.moment(scope.pickerDateEnd).add(1, 'd'),
                scope.constraints.dateEnd
              )) {
                foundChange = true;
              }
              if (foundChange) {
                scope.$emit('criteriaChange');
                scope.closePickers();
              }
            };

          },

          post: function (scope) {
            // watches for pickerDateStart & pickerDateEnd, storing the last
            // valid date (scope.lastValid) that was entered into the field.
            // These scope values are used to restore the value of the input
            // in the cause of an invalid date through manual entry.
            scope.lastValid = [];
            scope.$watch('pickerDateStart', function (newValue, oldValue) {
              if (newValue) {
                scope.lastValid['pickerDateStart'] =
                                  mlUtil.moment(new Date(newValue))
                                      .format('MM/DD/YYYY');
              }
            });
            scope.$watch('pickerDateEnd', function (newValue, oldValue) {
              if (newValue) {
                scope.lastValid['pickerDateEnd'] =
                                  mlUtil.moment(new Date(newValue))
                                      .format('MM/DD/YYYY');
              }
            });
            scope.$on('newResults', function () {


              //TODO: this timeout is a cheap hack to alleviate
              //problems from overlapping searches. The real solution
              // properly supercede those searches when a new search
              // gets under way.
              $timeout(function () {

                // empty the dateDate without losing the array object
                var newData = [];
                var maxCount = 0;

                var resultsWithShadows = scope.results[0] &&
                    (
                      scope.results[0].shadow ||
                      scope.results[scope.results.length - 1].shadow
                    );

                angular.forEach(scope.results, function (item) {
                  // we display the *shadow* counts, not the counts
                  // that result from applying this directive's criteria
                  // BUT ONLY if there are shadow results -- for searches
                  // with no date criteria there are no shadow results
                  if (resultsWithShadows) {

                    newData.push({
                      x: mlUtil.moment(item.shadow.name, 'YYYYMM').toDate(),
                      y: item.shadow.count
                    });

                    if (item.shadow.count > maxCount) {
                      maxCount = item.shadow.count;
                    }
                  }
                  else {
                    newData.push({
                      x: mlUtil.moment(item.name, 'YYYYMM').toDate(),
                      y: item.count
                    });

                    if (item.count > maxCount) {
                      maxCount = item.count;
                    }
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
                      new Date(mlUtil.moment(val).subtract(1, 'd')) :
                      null;
                };

                if (newData.length) {
                  var date;

                  scope.dateStartPlaceholder = mlUtil.moment(
                    dateToPickerStart(newData[0].x)
                  ).format('MM/DD/YYYY');

                  scope.dateEndPlaceholder = mlUtil.moment(
                    dateToPickerEnd(newData[newData.length - 1].x)
                  ).add(1, 'M').format('MM/DD/YYYY');
                }
                else {
                  scope.dateStartPlaceholder = null;
                  scope.dateEndPlaceholder = null;
                }

                scope.dataRange = {
                  start: (newData.length) ?
                    mlUtil.moment(newData[0].x) :
                    null,
                  end: (newData.length) ?
                    mlUtil.moment(newData[newData.length - 1].x) :
                    null
                };

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

  // directive for triggering the ng-change event ONLY when the
  // keydown 'enter' or blur event occur.  The directive was created to support
  // UX requirements to only validate a date that has been manually entered
  // during those two events.
  module.directive('ngModelOnblurOnenter', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1,
      link: function (scope, elm, attr, ngModelCtrl) {
        if (attr.type === 'radio' || attr.type === 'checkbox') {
          return;
        }

        elm.unbind('input').unbind('keydown').unbind('change');
        elm.bind('blur', function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(elm.val());
          });
        });

        elm.bind('keydown', function (event) {
          if (event.keyCode === 13) {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(elm.val());
            });
            event.preventDefault();
            event.stopPropagation();
          }
        });
      }
    };
  });

});
