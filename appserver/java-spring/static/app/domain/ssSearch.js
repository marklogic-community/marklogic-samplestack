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

  /**
   * @ngdoc domain
   * @name ssSearch
   * @requires mlModelBase
   * @requires mlSchema
   * @requires mlSearch
   *
   * @description
   * Implements search for the Samplestack application (as
   * {@link SsSearchObject}).
   *
   * `ssSearch` is a derivation of {@link mlSearch},
   * customized for the specifics of Samplestack.
   *
   */

  module.factory('ssSearch', [

    'mlModelBase', 'mlSchema', 'mlSearch', 'mlUtil',
    function (
      mlModelBase, mlSchema, mlSearch, mlUtil
    ) {

      var mlSearchObj = mlSearch.object;

      /**
       * @ngdoc type
       * @name SsSearchObject
       * @description The model instance prototype for
       * {@link ssSearch}, derived from {@link MlSearchObject}.
       */

      /**
       * @ngdoc method
       * @name SsSearchObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Creates the basic structure of a search,
       * including the definitions for search criteria and facets, and
       * sets the pageLength for search results.
       */
      var SsSearchObject = function (spec) {
        spec = mlUtil.merge(
          {
            facets: {
              tags: {
                valuesType: 'object',
                shadowConstraints: [ 'tags' ]
              },
              dates: {
                valuesType: 'array',
                shadowConstraints: [ 'dateStart', 'dateEnd' ]
              }
            },
            criteria: {
              sort: undefined,
              constraints: {
                resolved: {
                  constraintName: 'resolved',
                  constraintType: 'value',
                  type: 'boolean',
                  queryStringName: 'resolved'
                },
                userName: {
                  constraintName: 'userName',
                  constraintType: 'value',
                  type: 'text',
                  queryStringName: 'contributor'
                },
                tags: {
                  constraintName: 'tag',
                  constraintType: 'range',
                  type: 'enum',
                  subType: 'value',
                  queryStringName: 'tags',
                  facetValuesType: 'object'
                },
                dateStart: {
                  constraintName: 'lastActivity',
                  constraintType: 'range',
                  type: 'dateTime',
                  operator: 'GE',
                  queryStringName: 'date-ge'
                },
                dateEnd: {
                  constraintName: 'lastActivity',
                  constraintType: 'range',
                  type: 'dateTime',
                  operator: 'LT',
                  queryStringName: 'date-lt'
                }
              }
            }
          },
          spec
        );
        mlSearch.object.call(this, spec);
        this.$ml.pageLength = 10;
      };
      SsSearchObject.prototype = Object.create(
        mlSearch.object.prototype
      );

      Object.defineProperty(SsSearchObject.prototype, '$mlSpec', {
        value: {
          schema: mlSchema.addSchema({
            id: 'http://marklogic.com/samplestack#search',
            allOf: [
              { $ref: 'http://marklogic.com/#search' }
            ],
            required: ['criteria'],
            properties: {
              criteria: {
                required: ['constraints'],
                properties: {
                  timezone: { type: [ 'string', null ] },
                  sort: {
                    type: 'array',
                    items: {
                      type: {
                        enum: ['relevance', 'active', 'score']
                      }
                    }
                  },
                  constraints: {
                    required: [
                      'userName',
                      'resolved',
                      'tags',
                      'dateStart',
                      'dateEnd'
                    ],
                    properties: {
                      userName: {
                        properties: {
                          constraintName: { enum: ['userName'] },
                          type: { enum: ['text'] },
                          value: { type: ['string', 'null'] },
                          queryStringName: { enum: ['contributor'] }
                        }
                      },
                      resolved: {
                        properties: {
                          constraintName: { enum: ['resolved'] },
                          type: { enum: ['boolean'] },
                          value: { type: ['boolean', 'null'] },
                          queryStringName: { enum: ['resolved'] }
                        }
                      },
                      tags: {
                        properties: {
                          constraintName: { enum: ['tag'] },
                          type: { enum: ['enum'] },
                          subType: { enum: ['value'] },
                          values: { type: ['array', 'null'] },
                          queryStringName: { enum: ['tags'] }
                        }
                      },
                      dateStart: {
                        properties: {
                          constraintName: { enum: ['lastActivity'] },
                          operator: { enum: ['GE'] },
                          type: { enum: ['dateTime'] },
                          value: { type: ['date-time', 'null'] },
                          queryStringName: { enum: ['date-ge'] }
                        }
                      },
                      dateEnd: {
                        properties: {
                          constraintName: { enum: ['lastActivity'] },
                          operator: { enum: ['LT'] },
                          type: { enum: ['dateTime'] },
                          value: { type: ['date-time', 'null'] },
                          queryStringName: { enum: ['date-lt'] }
                        }
                      }
                    }
                  }
                }
              }
            }
          })
        }
      });

      SsSearchObject.prototype.$mlSpec.serviceName = 'ssSearch';

      SsSearchObject.prototype.getResourceName = function (httpMethod) {
        return 'search';
      };

      SsSearchObject.prototype.getHttpDataPOST = function () {
        var base = mlSearch.object.prototype
            .getHttpDataPOST.call(this);

        if (!(this.criteria.sort && this.criteria.sort.length)) {
          if (this.criteria.q && this.criteria.q.length) {
            base.search.qtext.push(
              'sort:' + 'relevance'
            );
          }
          if (!this.criteria.q) {
            base.search.qtext.push(
              'sort:' + 'active'
            );
          }
        }

        base.search.timezone = window.jstz.determine().name();

        return base;
      };

      /**
       * @ngdoc method
       * @name SsSearchObject#prototype.onHttpResponsePOST
       * @param {object} data Data from the call to the server.
       * @description Override. Simplifies and
       * adapts the search results for the browser.
       *
       * Renames facet reusults for clarity.
       *
       * Tweaks answer objects for consistency.
       *
       * Calculated docScore.
       *
       * <p style="color: red">
       * This method can be simplified when seed data are improved.
       * </p>
       */
      SsSearchObject.prototype.onResponsePOST = function (data) {
        // do some renaming
        data.facets.tags = data.facets.tag;
        delete data.facets.tag;

        data.facets.dates = data.facets.date;
        delete data.facets.date;

        if (data.facets.dates && data.facets.dates.facetValues) {
          data.facets.dates.facetValues.forEach(function (val) {
            var incoming = mlUtil.moment(val.name);
            val.name = val.value = incoming.format('YYYYMM');
          });
        }

        mlSearch.object.prototype.onResponsePOST.call(this, data);


        if (this.results.items) {
          angular.forEach(this.results.items, function (item) {
            var docScore = item.content.docScore || item.content.itemTally || 0;
            item.content.id = item.content.id.replace(/^\/questions\//, '');
            if (item.content.acceptedAnswerId) {
              item.content.acceptedAnswerId = item.content.acceptedAnswerId
                  .replace(/^\/answers\//, '');
            }
            angular.forEach(item.content.answers, function (answer, index) {
              docScore += answer.itemTally || 0;
              answer.id = answer.id.replace(/^\/answers\//, '');
            });

            item.content.docScore = docScore;
          });
        }
      };

      // TODO for now, we will have full dateTimes in stateparams
      // so we won't monkey with stateParams production or parsing
      // return to this issue if we change the constraint to a date
      //
      // SsSearchObject.prototype.stateParamFromConstraint = function (
      //   constraint
      // ) {
      //   var parentFunc = mlSearch.object.prototype.stateParamFromConstraint;
      //   var param = {};
      //   switch (constraint.queryStringName) {
      //     case 'date-start':
      //     case 'date-end':
      //       if (constraint.value) {
      //         param[constraint.queryStringName] =
      //             constraint.value.toISOString().replace(/T.*/, '');
      //       }
      //       return param;
      //     default:
      //       return parentFunc.call(this, constraint);
      //   }
      // };
      //
      //

      return mlModelBase.extend('SsSearchObject', SsSearchObject);
    }
  ]);
});
