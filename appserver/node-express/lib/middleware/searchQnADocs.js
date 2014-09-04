var Promise = require('bluebird');
var options = libRequire('../options');

module.exports = function (req, res, next) {
  var qb = require('marklogic').queryBuilder;

  var query = {
    search: {
      queries: [
        _.merge(req.body, { directory: '/questions/' })
      ]
    },
    optionsName: 'questions'
  };
  var sliceStart = 1;
  var sliceSize = 10;
  var order = ['relevance'];

  var q = req.db.documents.query(query);
    // .slice(sliceStart, sliceSize)
    // .orderBy(order);

  q.result(
    function (response) {
      console.log(JSON.stringify(response, null, ' '));
      next();
    },
    function (err) {
      next(err);
    }
  );
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
