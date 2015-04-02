// TODO In 8.0-1, CANNOT include parse* information with Node Client values
// call, thus we can't get tags constrained to current search qtext
// or typeahead text.
// Fixed in 8.0-2: https://github.com/marklogic/node-client-api/issues/155
//.DO NOT TRY THE BELOW TECHNIQUE AT HOME.
// The use of the hookStartRequest is not recommended. It is a temporary
// workaround for Samplestack 1.1.0, to be used only as long as compatibility
// with Node Client version 1.0.1 is required.

var mlrest = require('marklogic/lib/mlrest');
var origStartRequest = mlrest.startRequest;

mlrest.startRequest = function (operation) {

  if (
    operation.options.path === '/v1/search?format=json&category=content'
  ) {
    var valuesName = _.deepGet(
      operation,
      'requestBody.search.options.values.name'
    );
    if (valuesName === 'tags') {
      operation.options.path = '/v1/values/tags?' +
          'pageLength=10000&options=tags&start=1&aggregate=count';
      operation.options.headers.accept = 'application/json';
    }
  }
  return origStartRequest(operation);
};
