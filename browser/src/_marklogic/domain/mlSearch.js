define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlSearch
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * An mlModel element that represents a MarkLogic search. Has both criteria
   * and results. It is posted to effect the search based on the criteria.
   *
   * @example
   *  <example module="mlSearchExample">
   *    <file name="search.js">
   *      angular.module('mlSearchExample', ['marklogic'])
   *        .controller('ExxampleController', [
   *          '$scope', 'mlSearch',
   *          function ($scope, mlSearch) {
   *            var search = mlSearch.create({
   *              criteria: {
   *                q: '"red flag"'
   *              }
   *            });
   *            search.post().$ml.waiting.then(
   *              function () {
   *                console.log('there are ' + search.results.count +
   *                    'items in the results!'
   *                );
   *              },
   *              handleError
   *            );
   *          }
   *        ]);
   *    </file>
   *  </example>
   */
  module.factory('mlSearch', [

    '$q', 'mlModelBase', 'mlSchema', 'mlUtil',
    function (
      $q, mlModelBase, mlSchema, mlUtil
    ) {

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchCriteria',
        additionalProperties: false,
        properties: {
          q: {
            oneOf: [ { type: 'string' }, { type: 'null' } ]
          },
          start: { type: 'integer', minimum: 0 },
          constraints: {
            patternProperties: {
              '^.+$': {
                oneOf: [
                  { $ref: 'http://marklogic.com/#searchConstraintText' },
                  { $ref: 'http://marklogic.com/#searchConstraintBoolean' },
                  { $ref: 'http://marklogic.com/#searchConstraintEnum' },
                  { $ref: 'http://marklogic.com/#searchConstraintDate' }
                ]
              }
            }
          }
        }
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchConstraintText',
        allOf: [
          { $ref: 'http://marklogic.com/#searchConstraintBase' },
          {
            required: ['type'],
            properties: {
              type: { enum: ['text'] },
              value: { type: ['string', 'null' ] }
            }
          }
        ]
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchConstraintBoolean',
        allOf: [
          { $ref: 'http://marklogic.com/#searchConstraintBase' },
          {
            required: ['type'],
            properties: {
              type: { enum: ['boolean'] },
              value: { type: ['boolean', 'null' ] }
            }
          }
        ]
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchConstraintEnum',
        allOf: [
          { $ref: 'http://marklogic.com/#searchConstraintBase' },
          {
            required: ['type', 'subType'],
            properties: {
              type: { enum: ['enum'] },
              subType: { enum: ['text'] },
              values: { type: ['array', 'null' ], items: { type: 'text' } }
            }
          }
        ]
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchConstraintDate',
        allOf: [
          { $ref: 'http://marklogic.com/#searchConstraintBase' },
          {
            required: ['type'],
            properties: {
              type: { enum: ['date'] },
              value: { type: ['date-time', 'null' ] },
              operator: { enum: ['GE', 'LE' ] }
            }
          }
        ]
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchConstraintBase',
        required: ['constraintName', 'queryStringName'],
        properties: {
          constraintName: { type: 'string' },
          constraintType: { enum: ['range', 'value'] },
          queryStringName: { type: 'string' }
        },
      });

      mlSchema.addSchema({
        id: 'http://marklogic.com/#searchResults',
        additionalProperties: true,
        required: ['start', 'total', 'page-length', 'items'],
        properties: {
          start: { type: 'integer' },
          total: { type: 'integer' },
          'page-length': { type: 'integer' },
          items: {
            type: 'array',
            items: { type: 'object' }
          },
          facets: {
            type: 'object',
            patternProperties: {
              '^.+$': { type: 'object' }
            }
          }
        }
      });

      var throwMethod = function (method) {
        return function () {
          throw new Error({
            message: 'mlSearch does not implement ' + method,
            cause: 'mlSearch'
          });
        };
      };

      var MlSearchObject = function (spec) {
        spec = mlUtil.merge({
          criteria: {
            q: null,
            constraints: {}
          }
        }, spec);
        mlModelBase.object.call(this, spec);
      };
      MlSearchObject.prototype = Object.create(mlModelBase.object.prototype);
      Object.defineProperty(MlSearchObject.prototype, '$mlSpec', {
        value: {
          schema: mlSchema.addSchema({
            id: 'http://marklogic.com/#search',
            required: ['criteria'],
            additionalProperties: false,
            properties: {
              criteria: { $ref: 'http://marklogic.com/#searchCriteria' },
              results: { $ref: 'http://marklogic.com/#searchResults' }
            }
          })
        }
      });

      MlSearchObject.prototype.put = throwMethod('PUT'),
      MlSearchObject.prototype.del = throwMethod('DELETE'),
      MlSearchObject.prototype.getOne = throwMethod('GET'),
      MlSearchObject.prototype.onResponsePOST = function (data) {
        data.items = data.results;
        delete data.results;
        this.results = data;
        var facets = this.results.facets;
        angular.forEach(facets, function (facet, facetName) {
          var keyed = {};
          angular.forEach(facet.facetValues, function (value) {
            keyed[value.name] = value;
          });
          facets[facetName] = keyed;
        });
        this.$ml.pagingInfo = getPageCalcs(this);
      };

      MlSearchObject.prototype.getMlConstraint = function (constraint) {
        var synt = [];
        var self = this;

        var queryType;

        if (constraint.constraintType === 'range') {
          queryType = 'range-constraint-query';
        }
        if (constraint.constraintType === 'value') {
          queryType = 'value-constraint-query';
        }

        if (constraint.type === 'enum') {
          angular.forEach(constraint.values, function (enumValue) {
            // expand an enum constraint to multiple constraints (remember
            // everything is an and query in samplestack)
            var singleEnum = {
              constraintName: constraint.constraintName,
              constraintType: constraint.constraintType,
              operator: constraint.operator,
              type: constraint.subType,
              value: enumValue
            };
            synt = synt.concat(self.getMlConstraint(singleEnum));
          });
        }
        else {
          if (constraint.value) {
            var mySynt = {};
            var q = { 'constraint-name': constraint.constraintName };
            mySynt[queryType] = q;

            if (constraint.operator) {
              if (constraint.constraintType === 'range') {
                q['range-operator'] = constraint.operator;
              }
              if (constraint.constraintType === 'value') {
                q['operator'] = constraint.operator;
              }
            }

            if (constraint.type === 'text') {
              q.text = constraint.value;
            }
            if (constraint.type === 'value') {
              q.value = constraint.value;
            }
            if (constraint.type === 'date') {
              q.value = constraint.value.toISOString()
                  .replace(/T.*/, 'T00:00:00');
            }
            if (constraint.type === 'boolean') {
              q.boolean = constraint.value;
            }

            synt.push(mySynt);
          }
        }

        return synt;
      };


      MlSearchObject.prototype.getHttpDataPOST = function (httpMethod) {
        var myCriteria = angular.copy(this.criteria);
        var self = this;

        var criteriaToPost = {
          query: {
            qtext: myCriteria.q || '',
          },
        };

        if (myCriteria.start) {
          criteriaToPost.start = myCriteria.start;
        }

        var andQueries = [];
        angular.forEach(myCriteria.constraints, function (constraint) {
          // concat because some of these contraints will be represented
          // as arrays of constraints
          var newConstraints = self.getMlConstraint(constraint);
          andQueries = andQueries.concat(newConstraints);
        });

        if (andQueries.length) {
          criteriaToPost.query['and-query'] = {
            queries: andQueries
          };
        }

        return criteriaToPost;
      };

      MlSearchObject.prototype.stateParamFromConstraint = function (
        constraint
      ) {
        var param = {};
        if (constraint.type === 'enum') {
          var vals = constraint.values &&
              constraint.values.length &&
              constraint.values.join(',');
          if (vals) {
            param[constraint.queryStringName] = vals;
          }
        }
        if (constraint.type === 'date' ) {
          if (constraint.value) {
            // TODO: here we are wiping out tht time portion to accomodate
            // the type conigured on the server while not expsoing the user
            // to times
            param[constraint.queryStringName] =
                constraint.value.format('YYYY-MM-DD');
          }
        }
        if (constraint.type === 'boolean' ) {
          if (typeof constraint.value === 'boolean') {
            if (constraint.value === true) {
              param[constraint.queryStringName] = 'yes';
            }
            else {
              if (constraint.value === false) {
                param[constraint.queryStringName] = 'no';
              }
              else {
                param[constraint.queryStringName] = null;
              }
            }
          }
        }
        if (constraint.type === 'text' ) {
          if (constraint.value) {
            param[constraint.queryStringName] = constraint.value;
          }
        }
        return param;
      };

      MlSearchObject.prototype.getStateParams = function (oldParams) {
        var self = this;
        var params = {};
        if (this.criteria.q) {
          params.q = this.criteria.q;
        }
        angular.forEach(this.criteria.constraints, function (constraint) {
          mlUtil.merge(params, self.stateParamFromConstraint(constraint));
        });
        var page = getPageForStart(this);
        if (page > 1 || oldParams && oldParams.page) {
          params.page = page;
        }
        return params;
      };

      MlSearchObject.prototype.constraintFromStateParam = function (
        constraint,
        stateParams
      ) {
        if (constraint.type === 'boolean') {
          if (typeof stateParams[constraint.queryStringName] !== 'string') {
            stateParams[constraint.queryStringName] = '';
          }
        }

        var trimmed = stateParams[constraint.queryStringName] &&
            stateParams[constraint.queryStringName].trim();

        var propName = constraint.type === 'enum' ? 'values' : 'value';
        if (constraint.type === 'enum') {
          if (trimmed && trimmed.length) {
            constraint.values = trimmed.split(',');
          }
          else {
            constraint.values = null;
          }
        }
        if (constraint.type === 'boolean') {
          switch (trimmed) {
            case 'yes':
              constraint.value = true;
              break;
            case 'no':
              constraint.value = false;
              break;
            default:
              constraint.value = null;
              break;
          }
        }
        if (constraint.type === 'text') {
          constraint.value = trimmed;
        }
        if (constraint.type === 'date') {
          if (trimmed && trimmed.length) {
            constraint.value = mlUtil.moment(trimmed);
          }
          else {
            constraint.value = null;
          }
        }
      };

      MlSearchObject.prototype.assignStateParams = function (stateParams) {
        var params = {};
        var self = this;
        if (stateParams.page) {
          var page = parseInt(stateParams.page.trim());
          if (!isNaN(page)) {
            this.setCurrentPage(page);
          }
        }
        this.criteria.q = stateParams.q ? stateParams.q.trim() : null;
        angular.forEach(this.criteria.constraints, function (constraint) {
          mlUtil.merge(params, self.constraintFromStateParam(
            constraint,
            stateParams
          ));
        });

        mlUtil.merge(this.criteria, { constraints : params} );
        this.testValidity();
      };

      MlSearchObject.prototype.setCurrentPage = function (pageNum) {
        this.$ml.pagingInfo = getPageCalcs(this);
        if (pageNum > 0) {
          this.$ml.pagingInfo.currentPage = pageNum;
          this.criteria.start = 1 + (pageNum - 1) * this.getPageLength();
          return true;
        }
        else {
          return false;
        }
      };

      MlSearchObject.prototype.incrementPage = function (increment) {
        var newPage = this.getCurrentPage() + increment;
        if (newPage > 0 && newPage <= this.getPageCount()) {
          return this.setCurrentPage(newPage);
        }
      };

      MlSearchObject.prototype.getCurrentPage = function () {
        return this.$ml.pagingInfo.currentPage;
      };

      MlSearchObject.prototype.getPageLength = function () {
        return this.$ml.pagingInfo.pageLength;
      };

      MlSearchObject.prototype.getPageCount = function () {
        return this.$ml.pagingInfo.pageCount;
      };

      MlSearchObject.prototype.hasPrevPage = function () {
        return this.getCurrentPage() > 1;
      };

      MlSearchObject.prototype.hasNextPage = function () {
        return this.getCurrentPage() < this.getPageCount();
      };

      MlSearchObject.prototype.pageOutOfBounds = function () {
        return this.criteria.start > this.results.total;
      };

      MlSearchObject.prototype.setPageInBounds = function () {
        this.setCurrentPage(getPageForStart(this, this.results.total));
      };

      var getPageForStart = function (self, override) {
        return window.Math.ceil(
          (override || self.criteria.start) / self.$ml.pageLength
        );
      };

      var getStartForPage = function (self, override) {
        return  1 +
            ((override || self.getCurrentPage) - 1) * self.getPageLength();
      };

      var getPageCalcs = function (self) {
        var info = {};
        info.pageLength = self.$ml.pageLength;
        if (!self.results || self.results.count === 0) {
          return info;
        }
        if (self.results.start > self.results.total) {
          return info;
        }

        info.start = self.results.start;
        info.total = self.results.total;

        info.currentPage = window.Math.ceil(info.start / info.pageLength);
        info.pageCount = window.Math.ceil(info.total / info.pageLength);
        info.isLastPage = info.currentPage === info.pageCount;
        info.isFirstPage = info.currentPage === 1;
        info.nextPageStart = info.isLastPage ?
            null :
            1 + info.pageLength * (info.currentPage + 1);
        info.prevPageStart = info.isFirstPage ?
            null :
            1 + info.pageLength * (info.currentPage - 1);

        return info;
      };

      MlSearchObject.prototype.makeShadowQueries = function (
        shadowConstraints,
        service
      ) {
        var self = this;
        return shadowConstraints.reduce(function (acc, constraint) {
          var spec = angular.copy(self.criteria);
          delete spec.constraints[constraint].values;
          delete spec.constraints[constraint].value;
          // TODO: this implementation means that, for instance, the date
          // range shadow still bears the impact of the tags criteria --
          // is this what we want? I've heard tell that each constraint might
          // want a shadow that is *NOT* impacted by other constraints...
          acc[constraint] = service.create({ criteria: spec });
          return acc;
        }, {});
      };

      MlSearchObject.prototype.go = function (
        shadowConstraints,
        service
      ) {
        var self = this;
        var deferred = $q.defer();

        var shadows = this.makeShadowQueries(
          shadowConstraints, service
        );

        var todo = [];
        todo.push(this.post().$ml.waiting);
        angular.forEach(
          shadows,
          function (shadow) { todo.push(shadow.post().$ml.waiting); }
        );
        $q.all(todo).then(
          function () {
            self.results.shadowTotals = {};
            angular.forEach(shadows, function (shadow, key) {
              // merge the shadow results with the filtered results
              var filteredFacetStats = self.results.facets[key];
              var shadowedFacetStats = shadow.results.facets[key];
              // shadows will be the larger set so it is the baseline
              angular.forEach(shadowedFacetStats, function (
                shadowStat, shadowStatKey
              ) {
                // if we didn't get any numbers for a key in the filtered
                // results, at least start with an object there
                filteredFacetStats[shadowStatKey] = mlUtil.merge(
                  { name: shadowStatKey }, filteredFacetStats[shadowStatKey]
                );
                filteredFacetStats[shadowStatKey].shadow = shadowStat;
              });

              // we have now merged in the shadow query stats for this
              // facet and can loop
              // client code must deal with facet stats that don't have
              // anything other than shadow data
              // and we shouldn't have got
              self.results.shadowTotals[key] = shadow.results.total;
            });

            deferred.resolve();
          },
          deferred.reject
        );
        return deferred.promise;
      };

      return mlModelBase.extend('MlSearchObject', MlSearchObject);
    }
  ]);
});
