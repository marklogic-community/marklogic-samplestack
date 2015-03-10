/**
 * Parse the query body sent from the Samplestack browser tier
 * into a convenience object for the Node Client API QueryBuilder.
 *
 * Returns a results object with the following properties:
 *
 * {String} result.qtext -  text from the search box
 * {String} result.sort - selected sort (e.g., "sort:relevance")
 * {Array} result.tags - array of selected tag values
 * {String} result.lastActivityGE - date range "from" timestamp
 * {String} result.lastActivityLT - date range "to" timestamp
 * {String} result.userName - "my contributions only" flag
 * {String} result.resolved - "resolved only" flag
 * {String} result.timezone - timezone of client (e.g., "America/Los_Angeles")
 *
 * @param {Object} queryBody
 * @return {Object}
 */

 module.exports = function (queryBody) {
    var result = {};

    // start index
    result.start = queryBody.search.start;

    // string from search box
    result.qtext = queryBody.search.qtext[0] ? queryBody.search.qtext[0] : '';

    // selected sort
    result.sort = queryBody.search.qtext[1] ? queryBody.search.qtext[1] : '';

    // selected facet values
    if (queryBody.search.query) {
      var queries = queryBody.search.query['and-query'].queries;
      result.user = '';
      result.resolved = '';
      result.lastActivityGE = '';
      result.lastActivityLT = '';
      result.tags = [];
      for (i = 0; i < queries.length; ++i) {
        if (queries[i]['value-constraint-query']) {
          var query = queries[i]['value-constraint-query'];
          switch(query['constraint-name']) {
            case 'userName':
              // my contributions only
              result.user = query.text;
              break;
            case 'resolved':
              // resolved only
              result.resolved = query.text;
              break;
          }
        }
        if (queries[i]['range-constraint-query']) {
          var query = queries[i]['range-constraint-query'];
          switch(query['constraint-name']) {
            case 'lastActivity':
              // date range "from"
              if (query['range-operator'] === 'GE') {
                result.lastActivityGE = query.value;
              }
              // date range "to"
              else if (query['range-operator'] === 'LT') {
                result.lastActivityLT = query.value;
              }
              break;
            case 'tag':
              // tags
              result.tags.push(query.value);
              break;
          }
        }
      }
    }

    // client timezone
    result.timezone = queryBody.search.timezone ? queryBody.search.timezone : '';

    return result;
};
