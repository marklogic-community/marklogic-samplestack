var vb = require('marklogic').valuesBuilder;

var funcs = {};

// For typeahead (filtered) and ask tags (not filtered)
funcs.getTags = function (spec) {

  var forTag = spec.forTag;

  var valuesQuery = vb.fromIndexes(
    vb.range('tags')
  )
  .aggregates('count')
  .withOptions({values: ["frequency-order", "descending", "limit=10"]});

  // TODO In 8.0-1, CANNOT include parse* information with Node Client values
  // call, thus we can't get tags constrained to current search qtext/facets
  // or typeahead text.
  // Fixed in 8.0-2: https://github.com/marklogic/node-client-api/issues/155

  return this.values.read(valuesQuery).result()
  .then(function (response) {
    // Rearrange response so it looks like the Java tier's
    // TODO Temporary, we want to avoid this
    var distVals = [];
    var item;
    for (var i = 0; i < response['values-response']['tuple'].length; i++) {
      item = response['values-response']['tuple'][i];
      distVals.push({
        'frequency': item['frequency'],
        '_value': item['distinct-value'][0]
      });
    }
    response['values-response']['distinct-value'] = distVals;
    delete response['values-response']['tuple'];
    console.log(JSON.stringify(response['values-response'], null, ' '));
    return response;
  });

};

// For related tags
// TODO in progress
funcs.getRelatedTags = function (spec) {

  var relatedTo = spec.relatedTo;

  var valuesQuery = vb.fromIndexes(
    vb.range('tags')
  );

  return this.resources.get(
    {name:'relatedTags', params:{tag:relatedTo}}
  ).result();

};

module.exports = function (connection) {
  // create an object with the funcs all bound to the given connection
  var self = {};
  _.each(funcs, function (func, name) {
    self[name] = func.bind(connection);
  });
  return self;
};
