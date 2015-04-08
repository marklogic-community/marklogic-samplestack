/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
