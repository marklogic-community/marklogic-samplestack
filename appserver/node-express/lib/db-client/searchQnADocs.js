var Promise = require('bluebird');
var options = libRequire('../options');

module.exports = function (searchSpec) {
  var qb = require('marklogic').queryBuilder;

  var query = {
    search: {
      queries: [
        _.merge(searchSpec, { directory: '/questions/' })
      ]
    },
    optionsName: 'questions'
  };
  var sliceStart = 1;
  var sliceSize = 10;
  var order = ['relevance'];

  var q = this.documents.query(query);
    // .slice(sliceStart, sliceSize)
    // .orderBy(order);

  // TODO: suspect this is a promise, not a function, pergaps
  return q.result;
};

/*
{
   "optionsName":"questions",
   "start":11,
   "limit":20,
   "search":{
      "queries":[
         {
            "directory-query":{
               "uri":[
                  "/questions/"
               ]
            },
            "and-query":{
               "qtext":[
                  "tried",
                  "sort:active"
               ],
               "value-constraint-query":{
                  "constraint-name":"constrName",
                  "boolean":true
               }
            }
         }
      ]
   }
}
 */
