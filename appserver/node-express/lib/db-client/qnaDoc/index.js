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
  return this.documents.query.apply(
    this,
    [
      qb.directory(meta.baseUri),
      util.specToValues(spec)
    ]
  ).result();
};

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
    .then(util.getOnlyContent);
  }
  else {
    return funcs.search.call(this, spec)
    .then(util.getOnlyContent);
  }
};

funcs.post = function (txid, contributor, spec) {
  var id = util.uuid();
  var now = moment();
  var newDoc = _.merge(
    _.clone(meta.template),
    spec,
    {
      lastActivityDate: now,
      creationDate: now,
      id: id,
      owner: contributor
    }
  );

  return this.documents.write({
    txid: txid,
    uri: meta.getUri(newDoc.id),
    contentType: 'applicaton/json',
    content: newDoc
  }).result();
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
