var funcs = {};

var filterResponse = function (response, forTag, start, pageLength) {
  var vals = response['values-response'];
  if (vals) {
    var distinct = vals['distinct-value'];
    var zeroIndexStart = start - 1;
    if (distinct) {
      var allMatches;

      if (forTag) {
        allMatches = _.filter(distinct, function (distinctVal) {
          return distinctVal._value.indexOf(forTag) >= 0;
        });
      }
      else {
        allMatches = distinct;
      }

      vals['distinct-value'] = allMatches.slice(
        zeroIndexStart, zeroIndexStart + pageLength
      );
      vals.total = allMatches.length;
    }
  }
  return response;
};

// TODO In 8.0-1, CANNOT include parse* information with Node Client values
// call, thus we can't get tags constrained to current search qtext
// or typeahead text.
// Fixed in 8.0-2: https://github.com/marklogic/node-client-api/issues/155
//.DO NOT TRY THE BELOW TECHNIQUE AT HOME.
// The use of the hookStartRequest is not recommended. It is a temporary
// workaround for Samplestack 1.1.0, to be used only as long as compatibility
// with Node Client version 1.0.1 is required.
var hookStartRequest = require('./hookStartRequest');
funcs.getTags = function (spec) {
  // if forTags exists, put into qtext
  if (spec.search.forTag) {
    spec.search.qtext.push('tagword:"*' + spec.search.forTag + '*"');
  }
  else {
    spec.search.qtext.push('tagword:"*"');
  }

  var start = spec.search.start;
  delete spec.search.start;
  var pageLength = spec.search.pageLength;
  delete spec.search.pageLength;

  spec.search.options = {
    values: {
      range: {
        type: 'xs:string',
        'json-property': 'tags'
      },
      name: 'tags',
      'values-option': spec.search.sort === 'frequency' ?
          'frequency-order' :
          'item-order'
    }
  };
  var result = this.documents.query(spec).result();

  return result.then(function (response) {
    // unhook();
    return filterResponse(response, spec.search.forTag, start, pageLength);
  })
  .catch(function (err) {
    // unhook();
    throw err;
  });
};


module.exports = function (connection) {
  // create an object with the funcs all bound to the given connection
  var self = {};
  _.each(funcs, function (func, name) {
    self[name] = func.bind(connection);
  });
  return self;
};
