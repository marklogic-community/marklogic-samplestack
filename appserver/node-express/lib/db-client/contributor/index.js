var mlclient = require('marklogic');
var qb = mlclient.queryBuilder;
var pb = mlclient.patchBuilder;
var meta = require('./meta');
var util = libRequire('db-client/util');

var funcs = {};

/**
 * Handle an update to a contributor's reputation by patch the document.
 *
 * @param  {String} txid The transaction ID.
 * @param  {String} id The contributor ID.
 * @param  {Number} repChange Increment or decrement value.
 * @return {Promise} A promise object.
 */
funcs.patchReputation = function (txid, id, repChange) {
  // add (or subtract) from reputation property
  return this.documents.patch({
    txid: txid,
    uri: meta.getUri(id),
    operations: [
      pb.replace('reputation', pb.add(repChange))
    ]
  }).result()
  .then(meta.responseToSpec);
};

/**
 * Handle an update to a contributor's voteCount by patching the document.
 *
 * @param  {String} txid The transaction ID.
 * @param  {String} id The contributor ID.
 * @param  {Number} increment Increment or decrement value.
 * @return {Promise} A promise object.
 */
funcs.patchVoteCount = function (txid, id, increment) {
  return this.documents.patch({
    txid: txid,
    uri: meta.getUri(id),
    operations: [
      pb.replace('voteCount', pb.add(increment))
    ]
  }).result()
  .then(meta.responseToSpec);
};

funcs.getUniqueContent = function (txid, spec) {
  var self = this;
  // if given id, we can do this more efficinetly by reading via URI
  // otheriwse, we search
  if (spec.id) {
    return this.documents.read({
      txid: txid,
      uris: [ meta.getUri(spec.id) ]
    }).result()
    .then(util.getOnlyContent)
    .then(util.unwrapPojo);
  }
  else {
    var built = qb.where(
      qb.directory(meta.baseUri),
      qb.value('userName', spec.userName)
    );
    return this.documents.query(
      built
    ).result()
    .then(util.getOnlyContent)
    .then(util.unwrapPojo);
  }
};

module.exports = function (connection) {
  // create an object with the funcs all bound to the given connection
  var self = {};
  _.each(funcs, function (func, name) {
    self[name] = func.bind(connection);
  });
  return self;
};
