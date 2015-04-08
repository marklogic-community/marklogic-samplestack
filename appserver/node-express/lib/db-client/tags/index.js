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
funcs.getTags = function (spec) {
  // don't worry about uppercase, all tags are lowercase
  spec.search.forTag = spec.search.forTag ?
      spec.search.forTag.toLowerCase() :
      spec.search.forTag;

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
    return filterResponse(response, spec.search.forTag, start, pageLength);
  })
  .catch(function (err) {
    throw err;
  });
};

funcs.getRelatedTags = function (spec) {
  var self = this;
  var start = spec.search.start;
  delete spec.search.start;
  var pageLength = spec.search.pageLength;
  delete spec.search.pageLength;
  var sort = spec.search.sort;
  delete spec.search.sort;

  // First call to resources endpoint, get related tags
  return self.resources.get({
    name: 'relatedTags',
    params: {
      'tag':spec.search.relatedTo
    }
  }).result().then(function (response) {

    spec.search.options = {
      values: {
        range: {
          type: 'xs:string',
          'json-property': 'tags'
        },
        name: 'tags',
        'values-option': 'frequency-order'
      }
    };

    // Add ORed tags to qtext
    var orString = 'tag:' + response[0].content.reltags.join(' OR tag:');
    spec.search.qtext.push(orString);

    // Second call to tags endpoint (via hookStartRequest)
    return self.documents.query(spec)
    .result().then(function (response2) {

      // Only return tag values that exist in first results set
      var newDistVals = [];
      if (response2['values-response']['distinct-value']) {
        _.each(response2['values-response']['distinct-value'], function (item) {
          if (_.contains(response[0].content.reltags, item._value)) {
            newDistVals.push(item);
          }
        });
      }

      response2['values-response']['distinct-value'] = newDistVals;

      return response2;
    });
  })
  .catch(function (err) {
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
