var moment = require('moment-timezone');

var search = function (spec) {

  var query = spec;

  // search settings
  query.pageStart = spec.search.start;
  delete query.search.start;
  query.pageLength = 10;
  query.optionsName = 'questions';
  query['transform'] = 'search-response';
  query.view = 'all';

  // limit to qna docs
  var dirClause = {'directory-query': {uri:[ '/questions/' ]}};
  if (query.search.query) {
    query.search.query['and-query'].queries.push(dirClause);
  }
  else {
    query.search.query = { 'and-query': { 'queries': [ dirClause ] } };
  }

  // create date buckets for facet
  var datesBuckets = {
    'name': 'date',
    range: {
      facet: true,
      'json-property': 'lastActivityDate',
      'type': 'xs:dateTime',
      'bucket':[]
    }
  };
  var minDate = moment('2008-01-01T00:00:00Z').tz(spec.search.timezone);
  var maxDate = moment('2014-12-31T11:59:59Z').tz(spec.search.timezone);
  var currDate = minDate.clone();
  var b;
  var nextDate;
  while (currDate < maxDate) {
    nextDate = currDate.clone().add(1, 'month');
    b = {
      ge: currDate.format(),
      lt: nextDate.format(),
      name: currDate.format(),
      label: currDate.format()
    };
    datesBuckets.range.bucket.push(b);
    currDate = nextDate;
  }
  _.merge(query.search, { options: { constraint: [ datesBuckets ]}});

  // execute async search
  return this.documents.query(query).result()
  .then(function (response) {
    // final response is first element of original response
    var finalResponse = response.shift();
    // put doc content into each result
    _.each(finalResponse.results, function (finalItem, index) {
      var snippets = finalItem.matches;
      delete finalItem.matches;
      finalItem.content = response[index].content;
      // add snippets if they exist
      if (snippets && snippets.length && snippets[0].id) {
        delete finalItem.content.text;
        finalItem.content.snippets = snippets;
      }
    });
    return finalResponse;
  });
};

module.exports = function (connection) {
  return search.bind(connection);
};
