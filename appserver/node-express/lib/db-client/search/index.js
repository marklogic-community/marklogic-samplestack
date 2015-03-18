var moment = require('moment-timezone');

var search = function (spec) {

  var query = _.clone(spec, true);

  // search settings
  query.pageStart = spec.search.start;
  delete query.search.start;
  query.pageLength = 10;
  query.optionsName = 'questions';
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

    // add snippets to newResponse result set
    var newResponse = _.clone(response, true);
    if (newResponse[0]['total'] > 0) {
      // cycle through each doc (begins at index 1)
      var j;
      for (j = 1; j <= newResponse[0]['page-length']; j++) {
        // store only what is required
        var content = {
          'accepted': newResponse[j]['content']['accepted'],
          'creationDate': newResponse[j]['content']['creationDate'],
          'id': newResponse[j]['content']['id'],
          'lastActivityDate': newResponse[j]['content']['lastActivityDate'],
          'originalId': newResponse[j]['content']['originalId'],
          'owner': newResponse[j]['content']['owner'],
          'tags': newResponse[j]['content']['tags'],
          'title': newResponse[j]['content']['title'],
          'voteCount': newResponse[j]['content']['voteCount']
        };
        // add the existing matches as snippet property
        content['snippet'] = _.clone(
          response[0].results[j - 1].matches, true
        );
        // put assembled content into results
        newResponse[0].results[j - 1].content = content;
        // remove old matches property from results
        delete newResponse[0].results[j - 1].matches;
      }
    }

    // Return first element without all the payload docs
    return newResponse[0];

  })
  .catch(function (err) {
    console.dir(err);
  });
};

module.exports = function (connection) {
  return search.bind(connection);
};
