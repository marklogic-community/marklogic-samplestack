var mlclient = require('marklogic');
var qb = mlclient.queryBuilder;
var pb = mlclient.patchBuilder;
var meta = require('./meta');
var util = libRequire('db-client/util');

var funcs = {};

/*
 * REPUTATION CHANGE
 * A contributor's reputation may be changed up or down --
 * repChange may be a positive or negative int. Use server-side
 * math so we don't need to read the value into the middle-tier
 */
funcs.patchReputation = function (txid, id, repChange) {
  // add (or subtract) from reputation property
  return this.documents.patch({
    txid: txid,
    uri: meta.getUri(id),
    operations: [
      pb.replace('reputation', pb.add(repChange))
    ]
  }
  ).result(util.serverResponseToSpec);
};

funcs.patchVoteCount = function (txid, id, voteCountChange) {
  // add (or subtract) from voteCount property
  return this.documents.patch({
    txid: txid,
    uri: meta.getUri(id),
    operations: [
      pb.replace('voteCount', pb.add(voteCountChange))
    ]
  }
  ).result(util.serverResponseToSpec);
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
