var vb = require('marklogic').valuesBuilder;

var funcs = {};

// For typeahead (filtered) and ask tags (not filtered)
funcs.getTags = function (spec) {

  var forTag = spec.forTag;

  var valuesQuery = vb.fromIndexes(
    vb.range('tags')
  );

  // TODO In 8.0-1, CANNOT include parse* information with Node Client values
  // call, thus we can't get tags constrained to current search qtext/facets
  // or typeahead text.
  // Fixed in 8.0-2: https://github.com/marklogic/node-client-api/issues/155

  return this.values.read(valuesQuery).result();
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
