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

var mlclient = require('marklogic');
var qb = mlclient.queryBuilder;
var pb = mlclient.patchBuilder;
var meta = require('./meta');
var util = libRequire('db-client/util');

var funcs = {};
var moment = require('moment-timezone');
// funcs.exploreSearch = require('./exploreSearch');
funcs.patch = require('./patch');

funcs.search = function (spec) {
  // TODO: should really be supporting the txid param
  // query function wants an args list so we use apply since we
  // are dynamically creating values out of what is specified
  // console.log(require('util').inspect(this));
  // console.log(JSON.stringify(spec));
  return this.documents.query.apply(
    this,
    [
      qb.directory(meta.baseUri),
      util.specToValues(spec)
    ]
  ).result();
};

/**
 * Get one or more documents from the Samplestack database based ID(s).
 * For single documents, apply a transform to include voting and
 * reputation information.
 *
 * @param  {String} txid The transaction ID.
 * @param  {Object|Array} spec An object with a document ID property. Example:
 *   {"id":"b6ff5e47-2d08-4c20-9a16-4998fbb1bc10"}
 * For multiple documents, an array of objects (not currently used).
 * @return {Promise} A promise object.
 */
funcs.getUniqueContent = function (txid, spec) {
  // TODO: this is identical to the code for contributor (except for the pojo
  // issue)... abstract it?
  // if given id, we can do this more efficinetly by reading via URI
  // otheriwse, we search
  if (spec.id) {
    return this.documents.read({
      txid: txid,
      uris: [ meta.getUri(spec.id) ],
      transform: ['single-question', {} ]
    }).result()
    .then(util.getOneOrNoneContent);
  }
  else {
    return funcs.search.call(this, spec)
    .then(util.getOnlyContent);
  }
};

/**
 * Handle the post of a new question to Samplestack. The posted question
 * is merged with a question template object, a unique ID, contributor
 * information, and the current time. The resulting object is written to
 * the MarkLogic database with a URI based on the unique ID.
 *
 * @param  {String} txid Transaction ID (currently unused and set to null)
 * @param  {Object} contributor Contributor objectExample:
 *   {"id":"cf99542d-f024-4478-a6dc-7e723a51b040",
 *    "displayName":"JoeUser"}
 * @param  {Object} spec New question content object. Example:
 *   {"title":"What is foo?",
 *    "text":"I want to know about foo.",
 *    "tags":["foo", "bar"]}
 * @return {Promise} A promise object. When fulfilled, the response for the
 * promise includes the new document URI. Example response object:
 *   {"documents":[{
 *     "uri":"/questions/5ddb169f-b5d0-4be6-bba5-77277a719b3b.json",
 *     "contentType":null}
 *   ]}
 */
funcs.post = function (txid, contributor, spec) {
  var id = util.uuid();
  var now = moment();
  var newDoc = _.merge(
    _.clone(meta.template.question),
    spec,
    {
      lastActivityDate: now,
      creationDate: now,
      id: id,
      owner: contributor
    }
  );

  // @see http://docs.marklogic.com/jsdoc/documents.html#write
  return this.documents.write({
    txid: txid,
    uri: meta.getUri(newDoc.id),
    contentType: 'applicaton/json',
    content: newDoc
  }).result()
  .then(meta.responseToSpec);
};

// TODO: various patches

module.exports = function (connection) {
  // create an object with the funcs all bound to the given connection
  var self = {};
  _.each(funcs, function (func, name) {
    self[name] = func.bind(connection);
  });
  return self;
};
