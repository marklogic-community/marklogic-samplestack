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

define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc domain
   * @name mlSearch
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * Represents a MarkLogic search. It houses both the
   * criteria used in the search and, once posted, the results of the search.
   * Implements generalized MarkLogic search for the the browser (as
   * {@link MlSearchObject}).
   *
   * `mlSearch` is a derivation of {@link mlModelBase}, customized to:
   *
   * - determine validity of search criteria;
   * - aid in mapping between URL parameters and search criteria;
   * - aid in handling configuring and operating the paging and and sorting
   * of searches;
   * - handle the POSTing and processing of responses into a unified object;
   * - configure and execute faceted searches and "shadow queries".
   *
   * The schema of an mlSearch is very similar to a combination of the inputs
   * and outputs of the MarkLogic REST
   * API, but is customized to clarify the distinction between inputs and
   * outputs, and to ease handling within a dynamic web application.
   *
   * In Samplestack, mlSearch itself is customized by {@link ssSearch}.
   *
   * Instances are generated using the `create` method of {@link mlSearch},
   * which optionally takes an object which can be used to set the initial
   * configuration for the search.
   *
   * Please use the "View Source" link to see the source code for the
   * full schema of mlSearch instances.
   *
   * For **HTTP support**, mlSearch implements **only** the POST method.
   *
   * When posted, a copy of the criteria property is transformed to
   * standard MarkLogic REST API form and posted to the server at the search
   * endpoint.
   *
   * When the response is received, it is transofrmed to the runtime form
   * and stored in the `results` property, where metadata about the search,
   * results items themselves, and facet calculation results are available.
   *
   * If any facets are configured with **shadows**, then shadow facets are
   * calculated, and  results
   * are combined
   * into the main facet results so that they may accessed together.
   *
   * *Example:*
   *
   * ```javascript
   * angular.module('mlSearchExample', ['marklogic'])
   *   .controller('ExampleController', [
   *     '$scope', 'mlSearch',
   *     function ($scope, mlSearch) {
   *       // create an instance of mlSearch, passing in the configuration
   *       // (note that after creation, the properties of the search may be
   *       // subsequently modified, too)
   *       var search = mlSearch.create({
   *         criteria: {
   *           // search for this text
   *           q: '"red flag"',
   *           // results beginning at 11th item
   *           start: 11,
   *           // results ending at 20th item
   *           limit: 20,
   *           // only include results where someCustomCritera === true
   *           constraints: {
   *             someCustomCriteria: {
   *               type: 'boolean',
   *               value: true
   *             },
   *             myFacetName: {
   *               type: 'enum',
   *               subType: 'string',
   *               values: ['some text', 'some other text']
   *             }
   *           }
   *         },
   *         // configure that we want facet values for the `myFacetName` facet
   *         // and that a shadow query which calculates alternate facet values
   *         // should be included which *omits* myFacetName. This gives
   *         // context to what the results *would have* looked like without
   *         // the applied myFacetName settings
   *         facets: {
   *           myFacetName: {
   *             valuesType: 'object',
   *             shadowConstraints: [ 'myFacetName' ]
   *           }
   *         }
   *       });
   *       search.post().$ml.waiting.then(
   *         // success, do whatever you do when the results have been returned
   *         function () {
   *           console.log('there are ' + search.results.count +
   *               'items in the results!'
   *           );
   *         },
   *         // something went wrong, "handleError" is a function that deals
   *         // with the error message
   *         handleError
   *       );
   *     }
   *   ]);
   * ```
   *
   * The above would result in a POST to /v1/search that looks like:
   *
   * ```json
   * {
   *
   *   "search":{
   *     "qtext":"\"red flag\"",
   *     "query": {
   *       "and-query":{
   *         "queries":[
   *           {
   *             "value-constraint-query":{
   *               "constraint-name":"constrName",
   *               "type": "boolean",
   *               "text":true
   *              }
   *           },
   *           {
   *             "range-constraint-query":{
   *               "constraint-name":"facetName",
   *               "value":"some text"
   *             }
   *           },
   *           {
   *             "range-constraint-query":{
   *               "constraint-name":"facetName",
   *               "value":"some other text"
   *             }
   *           }
   *         ]
   *       }
   *     }
   *    }
   *   "start":11,
   *   "timezone": "America/Los_Angeles"
   * }
   * ```
   *
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
          sort: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          timezone: { type: 'string' },
          start: { type: 'integer', minimum: 0 },
          pageLength: { type: 'integer', minimum: 0 },
          constraints: {
            patternProperties: {
              '^.+$': {
                oneOf: [
                  { $ref: 'http://marklogic.com/#searchConstraintText' },
                  { $ref: 'http://marklogic.com/#searchConstraintBoolean' },
                  { $ref: 'http://marklogic.com/#searchConstraintEnum' },
                  { $ref: 'http://marklogic.com/#searchConstraintDateTime' }
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
              text: { type: ['boolean', 'null' ] }
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
        id: 'http://marklogic.com/#searchConstraintDateTime',
        allOf: [
          { $ref: 'http://marklogic.com/#searchConstraintBase' },
          {
            required: ['type'],
            properties: {
              type: { enum: ['dateTime'] },
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
              '^.+$': { type: ['object', 'array'] }
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


      /**
       * @ngdoc type
       * @name MlSearchObject
       * @description The model instance prototype for
       * {@link mlSearch}, derived from {@link mlModelBase}.
       *
       */

      /**
       * @ngdoc method
       * @name MlSearchObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Creates the simplest of search specifications
       * by creating the `criteria` property with an empty `q` (query string)
       * property and `constraints` property.
       *
       * Application-specific derivations should override this method to
       * configure the application's search feature(s).
       */
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
              facets: {
                patternProperties: {
                  '^.+$': {
                    properties: {
                      name: { type: 'string' },
                      valuesType: { enum: ['array', 'object'] },
                      shadowConstraints: {
                        type: 'array', items: { type: 'string' }
                      }
                    }
                  }
                }
              },
              results: { $ref: 'http://marklogic.com/#searchResults' }
            }
          })
        }
      });

      MlSearchObject.prototype.$mlSpec.serviceName = 'mlSearch';

      MlSearchObject.prototype.put = throwMethod('PUT'),
      MlSearchObject.prototype.del = throwMethod('DELETE'),
      MlSearchObject.prototype.getOne = throwMethod('GET'),

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.onResponsePOST
       * @param {object} data Response from the server.
       * @description Override arranges key properties of the search results
       * in order to simplify their usage in the browser.
       *
       * Moves facet values from the facetValues subproperty up into the
       * `results.facets object.
       *
       * If a facet is configured to keep its results as an object, converts
       * the array to an object.
       *
       * Initializes `$ml.pagingInfo` helper properties.
       */
      MlSearchObject.prototype.onResponsePOST = function (data) {
        var self = this;

        data.items = data.results;
        delete data.results;
        this.results = data;
        var facets = this.results.facets;
        angular.forEach(facets, function (facet, facetName) {
          if (!facet || !facet.facetValues) {
            // server may not return a facet object with facetValues
            facet = {
              facetValues: []
            };
          }
          var facetSpec = self.facets && self.facets[facetName];
          if (facetSpec && facetSpec.valuesType === 'object') {
            var keyed = {};
            angular.forEach(
              self.results.facets[facetName].facetValues,
              function (value) {
                keyed[value.name] = value;
              }
            );
            facets[facetName] = keyed;
          }
          else {
            facets[facetName] = facet.facetValues;
          }
          delete facets[facetName].facetValues;
        });
        this.$ml.pagingInfo = getPageCalcs(this);
      };

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.getMlConstraint
       * @param {object} constraint Browser-side constraint object.
       * @description Based on the browser-side object,
       * create the constraint object that will be passsed to the server when
       * POSTing
       * a search.
       */
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

            // ML bug requires that the value key appear prior to the
            // constraint-type key
            if (constraint.type === 'text') {
              q.text = constraint.value;
            }
            if (constraint.type === 'value') {
              q.value = constraint.value;
            }
            if (constraint.type === 'dateTime') {
              q.value = constraint.value.toISOString();
            }
            if (constraint.type === 'boolean') {
              q.text = constraint.value;
            }


            if (constraint.operator) {
              if (constraint.constraintType === 'range') {
                q['range-operator'] = constraint.operator;
              }
              if (constraint.constraintType === 'value') {
                q['operator'] = constraint.operator;
              }
            }

            synt.push(mySynt);
          }
        }

        return synt;
      };


      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.getHttpDataPOST
       * @description Override. Based on browser-side format of search,
       * constructs a version of the criteria that will be POSTed to the
       * server.
       * @returns {Object} server-interpretable search specification.
       */
      MlSearchObject.prototype.getHttpDataPOST = function () {
        var myCriteria = angular.copy(this.criteria);
        var self = this;

        var criteriaToPost = {
          search: {
            qtext: [myCriteria.q || ''],
          }
        };

        if (this.criteria.sort && this.criteria.sort.length) {
          criteriaToPost.search.qtext.push(
            // middle-tier won't take an array, can't sort on two fields
            'sort:' + this.criteria.sort[0]
          );
        }

        if (myCriteria.start) {
          criteriaToPost.search.start = myCriteria.start;
        }

        var andQueries = [];
        angular.forEach(myCriteria.constraints, function (constraint) {
          // concat because some of these contraints will be represented
          // as arrays of constraints
          var newConstraints = self.getMlConstraint(constraint);
          andQueries = andQueries.concat(newConstraints);
        });

        if (andQueries.length) {
          criteriaToPost.search.query = {
            'and-query': { queries: andQueries }
          };
        }

        return criteriaToPost;
      };

      MlSearchObject.prototype.getHttpUrl = function (httpMethod) {
        var endpoint = '/' + this.getResourceName(httpMethod);

        if (this.shadow) {
          //indicate this is a shadow query so that the middle-tier can
          //skip some steps it doesn't need to do for us
          endpoint += '?shadow=' + this.shadow;
        }
        return endpoint;
      };

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.stateParamFromConstraint
       * @param {object} constraint a constraint object.
       * @description Based on the constraint object, determine the state
       * parameter for routing along with its value.
       * @returns {Object} A plain object containing the found state parameter
       * and its value.
       */
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
        if (constraint.type === 'dateTime' ) {
          if (constraint.value) {
            // TODO: here we are wiping out tht time portion to accomodate
            // the type conigured on the server while not expsoing the user
            // to times
            param[constraint.queryStringName] =
                constraint.value.toISOString();
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

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.getStateParams
       * @param {object} oldParams Parameters currently active for the state
       * @description Based on the search criteria and
       * existing parameters, return an object
       * representing routing state parameters.constraint object.
       * @returns {Object} new parameters.
       */
      MlSearchObject.prototype.getStateParams = function (oldParams) {
        var self = this;
        var params = {};
        if (this.criteria.q) {
          params.q = this.criteria.q;
        }
        if (this.criteria.sort) {
          params.sort = this.criteria.sort[0];
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

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.constraintFromStateParam
       * @param {object} constraint a search constraint for which
       * to find a value in stateParams
       * @param {object} stateParams state params
       * @description Based on the state params, assign value to the specified
       * constraint
       */
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
        if (constraint.type === 'dateTime') {
          if (trimmed && trimmed.length) {
            constraint.value = mlUtil.moment(
              trimmed, [mlUtil.moment.ISO_8601, 'MM-DD-YYYY']
            );
          }
          else {
            constraint.value = null;
          }
        }
      };

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.assignStateParams
       * @param {object} stateParams full set of state parameters
       * @description Based on the state params, assign as relevant
       * search configured values.
       */
      MlSearchObject.prototype.assignStateParams = function (stateParams) {
        var params = {};
        var self = this;
        if (stateParams.page) {
          var page = stateParams.page;
          if (Number(page) !== page) {
            page = parseInt(stateParams.page.trim());
          }
          if (!isNaN(page)) {
            this.setCurrentPage(page);
          }
        }
        else {
          this.setCurrentPage(1);
        }
        this.criteria.q = stateParams.q ? stateParams.q.trim() : null;
        if (stateParams.sort && stateParams.sort.length) {
          this.criteria.sort = [ stateParams.sort.trim() ];
        }
        else {
          this.criteria.sort = null;
        }
        angular.forEach(this.criteria.constraints, function (constraint) {
          mlUtil.merge(params, self.constraintFromStateParam(
            constraint,
            stateParams
          ));
        });


        mlUtil.merge(this.criteria, { constraints : params} );
        this.testValidity();
      };

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.setCurrentPage
       * @param {integer} pageNum page number to make current in search
       * config.
       * @description If a valid page number assign start to cause search
       * to begin at the correct results item.
       * @returns {boolean} Whether or not the page number is valid
       */
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

      //TODO document these functions

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
        if (this.results.total > 0) {
          return this.criteria.start > this.results.total;
        }
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

      var constraintNonEmpty = function (constraint) {
        var valueProp = constraint.values || constraint.value;
        if (valueProp) {
          if (angular.isArray(valueProp)) {
            if (valueProp.length) {
              return true;
            }
          }
          else {
            if (valueProp || valueProp === 0) {
              return true;
            }
          }
        }
        else {
          return false;
        }
      };

      var makeShadowSearches = function (
        self,
        service
      ) {
        // TODO: this implementation means that, for instance, the date
        // range shadow still bears the impact of the tags criteria --
        // is this what we want? I've heard tell that each constraint might
        // want a shadow that is *NOT* impacted by other constraints...
        var shadowSearches = {};
        angular.forEach(self.facets, function (facet, name) {
          if (facet.shadowConstraints) {
            var facetWasFiltered = false;
            var spec = angular.copy(self.criteria);
            angular.forEach(
              facet.shadowConstraints,
              function (constraint) {
              if (constraintNonEmpty(spec.constraints[constraint])) {
                facetWasFiltered = facetWasFiltered || true;
              }
              delete spec.constraints[constraint].values;
              delete spec.constraints[constraint].value;
            });
            if (facetWasFiltered) {
              shadowSearches[name] = service.create({
                criteria: spec,
                shadow: name
              });
            }
          }
        });
        return shadowSearches;
      };

      // Generate array that pagination can repeat over
      // @see http://stackoverflow.com/questions/16824853
      MlSearchObject.prototype.getNumAsArray = function (num) {
        return new Array(num);
      };

      /**
       * @ngdoc method
       * @name MlSearchObject#prototype.shadowSearch
       * @description Use facet configuration to execute both the main search
       * and any shadow queries that are required.
       * @returns {angular.Promise} promise to be resolved when all search
       * results have been returned and processed.
       */
      MlSearchObject.prototype.shadowSearch = function (
      ) {
        var self = this;
        var deferred = $q.defer();

        var shadowSearches = makeShadowSearches(self, this.getService());

        var todo = [];
        todo.push(this.post().$ml.waiting);
        angular.forEach(
          shadowSearches,
          function (shadow) { todo.push(shadow.post().$ml.waiting); }
        );
        $q.all(todo).then(
          function () {
            if (Object.keys(shadowSearches).length) {
              self.results.shadowTotals = {};
              angular.forEach(shadowSearches, function (shadow, facetName) {
                // merge the shadow results with the filtered results
                var filteredFacetStats = self.results.facets[facetName];
                var shadowedFacetStats = shadow.results.facets[facetName];
                // shadows will be the larger set so it is the baseline
                if (self.facets[facetName].valuesType === 'object') {
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
                }
                else {
                  var filteredIterator = 0;
                  var newStats = [];
                  // var tempDict = {};
                  angular.forEach(shadowedFacetStats, function (stat) {
                    var newStat = { name: stat.name, shadow: stat };
                    var filteredStat = filteredFacetStats[filteredIterator];
                    if (
                      filteredStat && filteredStat.name === newStat.name
                    ) {
                      mlUtil.merge(newStat, filteredStat);
                      filteredIterator++;
                    }
                    newStats.push(newStat);
                  });
                  self.results.facets[facetName] = newStats;
                }

                // we have now merged in the shadow query stats for this
                // facet and can loop
                // client code must deal with facet stats that don't have
                // anything other than shadow data
                // and we shouldn't have got
                self.results.shadowTotals[facetName] = shadow.results.total;
              });
            }
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
