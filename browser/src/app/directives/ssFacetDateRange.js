define(['app/module'], function (module) {

  /**
   * @ngdoc directive
   * @name ssFacetDateRange
   * @restrict A
   *
   * @description
   * Directive rendering an array of search objects as a chart.
   * Selection of a single date result or a range of dates is allowed
   * for filtering. Uses <a href="https://github.com/pablojim/highcharts-ng"
   * target="_blank">highcharts-ng</a> for chart functionality.
   */
  module.directive('ssFacetDateRange', function () {

    var chart;
    var chartClearSelection;
    var chartUpdateSelection;
    var chartSelectAll;
    var convertDateToUTC;
    var refreshChart;
    var transformResults;

  /**
   * Utility funct to convert standard Date() object to UTC for HighCharts
   * @param {Object} dateToConvert as Date obj or Date().getTime() ms
   * @param {Boolean} retDateObj set return type as Date() or ms
   * @returns {Date}
   */
    convertDateToUTC = function (dateToConvert, retDateObj) {
      dateToConvert = (dateToConvert instanceof Date) ?
          dateToConvert :
          new Date(dateToConvert);

      // milliseconds offset from GMT/UTC
      var timeZoneOffsetMs = dateToConvert.getTimezoneOffset() * 60 * 1000;
      var convertedDateMs = Date.UTC(
        dateToConvert.getUTCFullYear(),
        dateToConvert.getUTCMonth(),
        dateToConvert.getUTCDate()
      );

      var convertedDate = convertedDateMs + timeZoneOffsetMs;
      return (retDateObj) ? new Date(convertedDate) : convertedDate;
    };

    /*
    * Converts result "name" format to actual date
    * @param {array} [resultsArray] - date string "201402"
    * @returns {Date.UTC}
    */
    transformResults = function (resultsArray) {
      var convertedDates;
      if (resultsArray instanceof Object) {
        convertedDates = [];
        angular.forEach(resultsArray, function (dateInfo) {
          convertedDates.push({
            x: Date.UTC(
              dateInfo.name.substring(0,4),
              dateInfo.name.substring(4,6),
              1
            ),
            y: dateInfo.count
          });
        });
      }
      return convertedDates;
    };

    refreshChart = function (scope) {
      var dateData    = scope.chartData;
      var dataLength;
      var x;
      var i;

      if (dateData && dateData.length > 0) {
        dataLength  = dateData.length;
        // determine start and end dates for data
        scope.dtDataStart =
            scope.dtDataEnd = convertDateToUTC(dateData[0].x);

        for (i = 0; i < dataLength; i++) {
          x = convertDateToUTC(dateData[i].x);
          if (x < scope.dtDataStart) {
            scope.dtDataStart = x;
          }
          if (x > scope.dtDataEnd) {
            scope.dtDataEnd = x;
          }
        }

        // TODO - handle shadows

        // set inputs to match data high and low
        scope.dtStartSelection  = scope.dtDataStart;
        scope.dtEndSelection    = scope.dtDataEnd;

        // set chart extremes from shadow data
        // scope.chartShadowData

        scope.highchartsConfig.series[0].data = scope.chartData;
      }
      // else {
      //   // TODO: Show chart loading
      // }
    };

   /*
    * Sets up all settings and function for directive UI
    * @param {object} [scope] - set return type as Date() or ms
    * @param {object} [element] - as Date obj or Date().getTime() ms
    * @param {object} [attrs] - set return type as Date() or ms
    */
    var setup = function (scope, element, attrs) {

     /*
      * Resets chart selection to select all points
      */
      chartClearSelection = function () {
        var selectedPoints = chart.getSelectedPoints();
        var pointsLength = selectedPoints.length;
        if (pointsLength > 0) {
          for (var i = 0; i < pointsLength; i = i + 1) {
            selectedPoints[i].select(false);
          }
        }
      };

     /*
      * Changes selection to range of date,
      * watch on start/end triggers chartUpdateSelection()
      */
      chartSelectAll = function () {
        scope.dtStartSelection = scope.dtDataStart;
        scope.dtEndSelection = scope.dtDataEnd;
      };

     /*
      * Updates chart to match the currently selected range
      */
      chartUpdateSelection = function () {
        var points = (chart && chart.series &&
              chart.series[0] && chart.series[0].points) ?
                  chart.series[0].points :
                  undefined;

        if (points &&
            !(scope.dtStartSelection instanceof Date) &&
            !(scope.dtEndSelection instanceof Date)
        ) {
          chartClearSelection();
          angular.forEach(points, function (point, index) {
            // convert to UTC as original series was standard Date
            if (convertDateToUTC(point.x) >= scope.dtStartSelection &&
                convertDateToUTC(point.x) <= scope.dtEndSelection
            ) {
              point.select(true, true);
            }
          });
        }
      };


      // Date Picker Settings
      scope.minDate = scope.dtDataStart;
      scope.maxDate = scope.dtDataEnd;

      scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };


      // Calender Picker Setup and Management

     /*
      * Opens Calendar by ng-click event on directive input fields
      * @param {object} [event] - click event
      * @param {string} [prop] - the property bound to the input calendar
      * state being open or not.  On being set TRUE it opens.
      */
      scope.open = function (event,prop) {
        event.preventDefault();
        event.stopPropagation();

        scope[prop] = true;
      };

     /*
      * Calendar Picker ng-change event on directive.  Convert selection
      * (standard Date) to UTC Date
      * @param {object} [event] - change event
      * @param {string} [prop] - the property bound to the input calendar
      * dtStartSelection or dtEndSelection, depending on wiring
      */
      scope.selectDate = function (event,prop) {
        scope[prop] = convertDateToUTC(event);
      };

      scope.$watchCollection(
        '[dtStartSelection, dtEndSelection]',
        function (newValues, oldValues) {
          var constraintsCopy = angular.copy(scope.criteria.constraints);
          var criteriaNames   = ['dateStart','dateEnd'];
          // internal variables tracking the datas start and endpoints,
          // this is *not* related to date range selection
          var rangeNames      = ['dtDataStart','dtDataEnd'];

          if (!angular.equals(newValues, oldValues)) {
            angular.forEach(newValues, function (newVal, index) {
              if (oldValues[index] !== newVal) {
                // re-render chart with new selection
                chartUpdateSelection();

                // set the attached search criteria object to the
                // new selected value
                if (newVal === scope[rangeNames[index]]) {
                  constraintsCopy[criteriaNames[index]].value
                    = undefined;
                }
                else {
                  constraintsCopy[criteriaNames[index]].value
                    = window.moment(newVal);
                }
              }
            });
            // Apply changes to the criteria constraints all at once
            // so that the watch in explore.js will only trigger ONE TIME.
            scope.criteria.constraints = constraintsCopy;
          }
        });

      // Calender Picker end

      // Expose functions for clearing selection to $parent scope
      scope.$parent.dateScope = {};
      scope.$parent.dateScope.clearSelection = chartSelectAll;

      scope.highchartsConfig = {
        options: {
          chart: {
            type: 'column',
            zoomType: 'x',
            events: {
              load: function (event) {
                // this is a workaround
                //
                // the closre on chart feels strange
                var self = this;
                chart = self;
              },
              redraw: function () {
                chartUpdateSelection();
              },
              click: function (event) {
                // call scope apply so any changes to data model will be
                // triggered with scope.$digest() after this executes
                var self = this;
                scope.$apply(function () {
                  chartSelectAll();
                });
              },
              selection: function (event) {
                // call scope apply so any changes to data model will be
                // triggered with scope.$digest() after this executes
                var self = this;
                scope.$apply(function () {
                  chartClearSelection();
                  var seriesData = self.series[0].data;
                  var selSeriesLow;
                  var selSeriesHigh;

                  for (var i = 0, l = seriesData.length; i < l; i++) {
                    if (seriesData[i].x >= event.xAxis[0].min
                        && seriesData[i].x <= event.xAxis[0].max) {
                      seriesData[i].select(true, true);
                      if (selSeriesLow === undefined) {
                        selSeriesLow  = selSeriesHigh = seriesData[i].x;
                      }
                      // find highest and lowest selected dates
                      if (seriesData[i].x < selSeriesLow) {
                        selSeriesLow = seriesData[i].x;
                      }
                      if (seriesData[i].x > selSeriesHigh) {
                        selSeriesHigh = seriesData[i].x;
                      }
                    }
                  }
                  if (selSeriesLow) {
                    scope.dtStartSelection = convertDateToUTC(selSeriesLow);
                    scope.dtEndSelection = convertDateToUTC(selSeriesHigh);
                  }
                  else {
                    // restore the rendering of the previous selection
                    chartUpdateSelection();
                  }
                });
                event.preventDefault();  // stop zoom from happening
              }
            }
          },

          legend: {
            enabled: false
          },

          xAxis: {
            type: 'datetime',
            title: {
              text: null
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: null
            },
            labels: {
              enabled: false
            }
          },

          tooltip: {
            formatter: function () {
              var formattedDate;

              // TODO: do not introduce dependency on globally scoped
              // Highcharts
              /* jshint ignore:start */
              formattedDate = Highcharts.dateFormat(
                '%b %e, %Y', this.x
              );
              /* jshint ignore:end */
              return '<strong>' +
                  formattedDate +
                  '</strong>' + ': ' + this.y;
            }
          },

          plotOptions: {
            series: {
              color: '#DBEDFA',
              states: {
                select: {
                  color: '#70B8ED'
                }
              },
              marker: {
                enabled: true,
                states: {
                  select: {
                    enabled: true
                  }
                }
              },
              allowPointSelect: true,
              point: {
                events: {
                  click: function (event) {
                    // call scope apply so any changes to data model will
                    // be triggered with scope.$digest() after this
                    // executes
                    var self = this;
                    scope.$apply(function () {
                      scope.dtStartSelection   = self.x;
                      scope.dtEndSelection     = self.x;
                    });
                  }
                }
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

        title: {
          text: null
        },

        subtitle: {
          text: null
        },

        series: [{
          data: scope.chartData
        }]
      };

    };

    var toArray = function (obj) {
      return obj ?
          Object.keys(obj).map(function (key) { return obj[key]; }) :
          [];
    };

    var onWatchResults = function (scope) {
      if (scope.results) {
        // update scope variable, will trigger re-render
        scope.chartData = transformResults(scope.results);
        scope.chartShadowData = angular.copy(scope.chartData);
        // data of chart has refreshed,
        // now re-select that data per our
        // previous selection, if any
        refreshChart(scope);
      }
    };

    var onWatchCriteria = function (scope) {
      var constraintsCopy = angular.copy(scope.criteria.constraints);
      if (constraintsCopy.dateStart.value && constraintsCopy.dateEnd.value) {
        var dateStart   = constraintsCopy.dateStart.value.utc().valueOf();
        var dateEnd     = constraintsCopy.dateEnd.value.utc().valueOf();

        // any changes to selections will re-render chart selection
        // automatically due to a watch on those variables
        if (dateStart !== scope.dtStartSelection
                || dateEnd !== scope.dtEndSelection) {
          scope.dtStartSelection = (dateStart
                                    && dateStart !== scope.dtStartSelection) ?
                                      dateStart : scope.dtStartSelection;
          scope.dtEndSelection = (dateEnd
                                    && dateEnd !== scope.dtEndSelection) ?
                                      dateEnd : scope.dtEndSelection;
        }
      }
    };

    return {
      restrict: 'A',
      template: '<highchart class="highcharts" ' +
          'config="highchartsConfig"></highchart>' +
          '<label for="date-from">From:</label>' +
          '<input type="text" id="date-from" ' +
          'class="form-control ng-valid-date" datepicker-popup="MM/dd/yyyy" ' +
          'ng-model="dtStartSelection" ' +
          'ng-click="open($event,\'startOpened\')" ' +
          'ng-change="selectDate(dtStartSelection,\'dtStartSelection\')"  ' +
              'datepicker-options="dateOptions" min-date="minDate" ' +
              'max-date="maxDate" is-open="startOpened" ' +
              'show-button-bar="false" show-weeks="false" /> ' +
          '<label for="date-to">To:</label>' +
          '<input type="text" id="date-to" ' +
          'class="form-control ng-valid-date" datepicker-popup="MM/dd/yyyy"' +
          'ng-model="dtEndSelection" ng-click="open($event,\'endOpened\')"' +
          'ng-change="selectDate(dtEndSelection,\'dtEndSelection\')"  ' +
          'datepicker-options="dateOptions" min-date="minDate" ' +
          'max-date="maxDate" ' +
          'is-open="endOpened" show-button-bar="false" show-weeks="false" />',

      scope: {
        criteria: '=criteria',
        results: '=results'
      },
      compile: function compile (tElement, tAttrs, transclude) {
        tElement.addClass('ss-facet-date-range');

        return {
          pre: function (scope, element, attrs) {
            scope.chartData = [];
            setup(scope, element, attrs);
          },
          post: function (scope, element, attrs) {
            scope.$watch(
              'results',
              onWatchResults.bind(null, scope)
            );
            scope.$watch(
              'criteria',
              onWatchCriteria.bind(null, scope)
            );
          }
        };
      }
    };
  });
});
