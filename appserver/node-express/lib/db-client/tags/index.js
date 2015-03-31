var hookStartRequest = require('./hookStartRequest');

var funcs = {};

var filterResponse = function (response, forTag, start, pageLength) {
  var vals = response['values-response'];
  if (vals) {
    var distinct = vals['distinct-value'];
    var zeroIndexStart = start - 1;
    if (distinct) {
      var newVals = [];
      var ignored = 0;
      _.each(distinct, function (distinctVal) {
        // Add if empty forTag (no filter) or forTag is in value
        if (!forTag || distinctVal._value.indexOf(forTag) >= 0) {
          // Adjust for starting index
          if (zeroIndexStart <= ignored) {
            newVals.push(distinctVal);
            // Limit reached, exit from _.each
            if (newVals.length === pageLength) {
              return false;
            }
          }
          else {
            ignored++;
          }
        }
      });
      vals['distinct-value'] = newVals;
    }
  }
  return response;
};

// TODO In 8.0-1, CANNOT include parse* information with Node Client values
// call, thus we can't get tags constrained to current search qtext
// or typeahead text.
// Fixed in 8.0-2: https://github.com/marklogic/node-client-api/issues/155
//.DO NOT TRY THE BELOW TECHNIQUE AT HOME.
// The use of the hookStartRequest is not recommended. It is a temporary workaround
// for Samplestack 1.1.0, to be used only as long as compatibility with Node
// Client version 1.0.1 is required.
funcs.getTags = function (spec) {
  // if forTags exists, put into qtext
  if (spec.search.forTag) {
    spec.search.qtext.push('tagword:"*' + spec.search.forTag + '*"');
  }
  // else, set to empty string (!= undefined)
  // hookStartRequest checks !== undefined to determine tags call
  else {
    spec.search.forTag = '';
  }
  var start = spec.search.start;
  delete spec.search.start;
  var pageLength = spec.search.pageLength;
  delete spec.search.pageLength;

  // sort order
  var order = '';
  if (spec.search.sort === 'frequency') {
    order = 'frequency-order';
  }
  else {
    order = 'item-order';
  }

  spec.search.options = {
    values: {
      range: {
        type: 'xs:string',
        'json-property': 'tags'
      },
      name: 'tags',
      'values-option': order
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
