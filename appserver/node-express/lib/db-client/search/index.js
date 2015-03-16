var qb = require('marklogic').queryBuilder;
var vb = require('marklogic').valuesBuilder;
var moment = require('moment-timezone');
var parseSearchQuery = require('./parseSearchQuery');

/**
 * Perform a Samplestack search based on user-submitted query text and
 * facet, sort, and paging selections. The search involves the following:
 *
 * 1. Parse structured JSON query from browser.
 * 2. Set up variables for pagination, sorting, and facet constraints.
 * 3. Build search clause with submitted qtext and defined constraints.
 * 4. Perform a values.read() to get min and max last-activity dates
 *    from the results.
 * 5. Build the bucket constraints based on the min and max dates.
 * 6. Perform a documents.query() to get the search results.
 *
 * @param {Object} spec Search specification
 * @return {Object}
 */
var search = function (spec) {

  var self = this;

  // parse query JSON from browser
  var parsedQuery = parseSearchQuery(spec);

  // pagination
  var resultsPerPage = 10; // TODO get from options?
  var start = parsedQuery.start;

  // sorting
  var sort;
  switch(parsedQuery.sort) {
    case 'sort:active':
      sort = qb.sort('lastActivityDate', 'descending');
      break;
    case 'sort:votes':
      sort = qb.sort('voteCount', 'descending');
      break;
    default:
      sort = qb.score(); // default relevance
  }

  // facet constraints
  var facets = [];
  if (parsedQuery.user) {
    facets.push(qb.value('displayName', parsedQuery.user));
  }
  if (parsedQuery.resolved) {
    facets.push(qb.value('accepted', parsedQuery.resolved));
  }
  if (parsedQuery.lastActivityGE) {
    facets.push(qb.range('lastActivityDate', '>=', parsedQuery.lastActivityGE));
  }
  if (parsedQuery.lastActivityLT) {
    facets.push(qb.range('lastActivityDate', '>=', parsedQuery.lastActivityLT));
  }
  var i;
  if (parsedQuery.tags) {
    for (i = 0; i < parsedQuery.tags.length; ++i) {
      facets.push(qb.range('tags', parsedQuery.tags[i]));
    }
  }

  // search clause used in both values query and search query
  // see: http://docs.marklogic.com/jsdoc/queryBuilder.html#parsedFrom
  var parsedFrom = qb.parsedFrom(
    // query text from search box
    parsedQuery.qtext,
    // define constraints allowed in query text (e.g., "askedBy:joeUser")
    qb.parseBindings(
      qb.range(qb.pathIndex('/owner/displayName'), qb.bind('askedBy')),
      qb.range(
        qb.pathIndex('/answers/owner/displayName'), qb.bind('answeredBy')
      ),
      qb.range(
        qb.pathIndex('//comments/owner/displayName'), qb.bind('commentedBy')
      ),
      qb.value('displayName', qb.bind('user')),
      qb.range('id', qb.bind('id')),
      qb.word('title', qb.bind('title')),
      qb.word('accepted', qb.bind('resolved')),
      qb.range('lastActivityDate', qb.bind('lastActivity')),
      qb.range('voteCount', qb.bind('votes')),
      qb.range('answerCount', qb.bind('answers'))
    )
  );

  // construct values query with ValuesBuilder
  // see: http://docs.marklogic.com/jsdoc/valuesBuilder.html
  var valuesQuery = vb.fromIndexes(
    // get values from lastActivityDate prop
    vb.range('lastActivityDate')
  )
  .where(
    parsedFrom,
    qb.directory('/questions/'), // limit to qna docs
    qb.and.apply(this, facets)
  )
  // get min and max aggregates
  .aggregates('min', 'max').
  // don't return the values, only aggregates
  slice(0);

  // TODO values.read() can be skipped if from/to values coming from browser
  return this.values.read(valuesQuery).result(function (response) {

    // from values call, get min and max dates, adjusting for timezone
    var min = moment(
      response['values-response']['aggregate-result'][0]['_value']
    ).tz(parsedQuery.timezone);
    var max = moment(
      response['values-response']['aggregate-result'][1]['_value']
    ).tz(parsedQuery.timezone);
    // adjust to start and end of months
    var minDate = min.clone().startOf('month');
    var maxDate = max.clone().endOf('month');
    // create date buckets for facet
    // see: http://docs.marklogic.com/jsdoc/queryBuilder.html#bucket
    var dateBuckets = [];
    var currDate = minDate.clone();
    while (currDate < maxDate) {
      var nextDate = currDate.clone().add(1, 'month');
      dateBuckets.push(
        qb.bucket(
          currDate.format(),
          currDate.format(),
          '<',
          nextDate.format()
        )
      );
      currDate = nextDate;
    }

    // construct search query with QueryBuilder
    // see: http://docs.marklogic.com/jsdoc/queryBuilder.html
    var searchQuery = qb.where(
      parsedFrom,
      qb.directory('/questions/'), // limit to qna docs
      qb.and.apply(this, facets)
    )
    // apply sort
    .orderBy(sort)
    // return tag and date facets in results
    .calculate(
      qb.facet('tag', 'tags', qb.facetOptions(
        'frequency-order', 'descending', 'limit=10'
      )),
      qb.facet('date', 'lastActivityDate', dateBuckets)
    )
    // handle paging and turn on snippets
    .slice(
      start,
      resultsPerPage,
      qb.snippet({
        'apply': 'snippet',
        'max-snippet-chars': 100,
        'max-matches' :4,
        'per-match-tokens' :12,
        'preferred-matches': {
          'json-property': ['text', 'title']
        }
      }),
      qb.transform('search-response')
    )
    // miscellaneous settings for testing
    // TODO remove after testing
    .withOptions({
      metrics: true
    });

    return self.documents.query(searchQuery).result()
    .then(function (response) {

      // add snippets to newResponse result set
      var newResponse = _.clone(response, true);
      if (newResponse[0]['total'] > 0) {
        // cycle through each doc (begins at index 1)
        for (var i = 1; i <= newResponse[0]['page-length']; i++) {
          // store only what is required
          var content = {
            'accepted': newResponse[i]['content']['accepted'],
            'creationDate': newResponse[i]['content']['creationDate'],
            'id': newResponse[i]['content']['id'],
            'lastActivityDate': newResponse[i]['content']['lastActivityDate'],
            'originalId': newResponse[i]['content']['originalId'],
            'owner': newResponse[i]['content']['owner'],
            'tags': newResponse[i]['content']['tags'],
            'title': newResponse[i]['content']['title'],
            'voteCount': newResponse[i]['content']['voteCount']
          };
          // add the existing matches as snippet property
          content['snippet'] = _.clone(
            response[0].results[i - 1].matches, true
          );
          // put assembled content into results
          newResponse[0].results[i - 1].content = content;
          // remove old matches property from results
          delete newResponse[0].results[i - 1].matches;
        }
      }
      // remove all docs from newResponse before returning
      newResponse.splice(1, newResponse[0]['page-length']);

      return newResponse;

    });

  });

};

module.exports = function (connection) {
  return search.bind(connection);
};
