define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssSearch
   * @requires mlModelBase
   * @requires mlSchema
   * @requires mlSeearch
   *
   * @description
   * TBD
   *
   */

  module.factory('ssSearch', [

    'mlModelBase', 'mlSchema', 'mlSearch', 'mlUtil',
    function (
      mlModelBase, mlSchema, mlSearch, mlUtil
    ) {

      var mlSearchObj = mlSearch.object;

      var SsSearchObject = function (spec) {
        spec = mlUtil.merge(
          {
            criteria: {
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
                  queryStringName: 'tags'
                },
                dateStart: {
                  constraintName: 'lastActivity',
                  constraintType: 'range',
                  type: 'date',
                  operator: 'GE',
                  queryStringName: 'date-start'
                },
                dateEnd: {
                  constraintName: 'lastActivity',
                  constraintType: 'range',
                  type: 'date',
                  operator: 'LE',
                  queryStringName: 'date-end'
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
      SsSearchObject.prototype.$mlSpec.schema = mlSchema.addSchema({
        id: 'http://marklogic.com/samplestack#search',
        allOf: [
          { $ref: 'http://marklogic.com/#search' }
        ],
        required: ['criteria'],
        properties: {
          criteria: {
            required: ['constraints'],
            properties: {
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
                      queryStringName: { enum: ['user'] }
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
                      subType: { enum: ['string'] },
                      values: { type: ['array', 'null'] },
                      queryStringName: { enum: ['tags'] }
                    }
                  },
                  dateStart: {
                    properties: {
                      constraintName: { enum: ['lastActivity'] },
                      operator: { enum: ['GT'] },
                      type: { enum: ['date'] },
                      value: { type: ['date', 'null'] },
                      queryStringName: { enum: ['date-start'] }
                    }
                  },
                  dateEnd: {
                    properties: {
                      constraintName: { enum: ['lastActivity'] },
                      operator: { enum: ['LT'] },
                      type: { enum: ['date'] },
                      value: { type: ['date', 'null'] },
                      queryStringName: { enum: ['date-end'] }
                    }
                  }
                }
              }
            }
          }
        }
      });

      SsSearchObject.prototype.onResponsePOST = function (data) {
        // do some renaming
        data.facets.tags = data.facets.tag;
        delete data.facets.tag;

        data.facets.dates = data.facets.date;
        delete data.facets.date;

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

      return mlModelBase.extend('SsSearchObject', SsSearchObject);
    }
  ]);
});
