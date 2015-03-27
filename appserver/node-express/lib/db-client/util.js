var Promise = require('bluebird');
var errs = libRequire('errors');
var qb = require('marklogic').queryBuilder;

module.exports = {
  // POJO-managed docs "bury" the content under a Java fully qualified
  // class name, so we find the first key an use it to locate the actual
  // content
  unwrapPojo: function (pojo) {
    return pojo[Object.keys(pojo)[0]];
  },

  getOnlyContent: function (response) {
    if (response.length !== 1) {
      throw errs.cardinality({ length: response.length,
        response: response });
    }
    else {
      return response[0].content;
    }
  },

  serverResponseToSpec: function (resp) {
    var docID;
    if (resp && resp.uri) {
      docID = resp.uri.split('/');
      docID = docID[docID.length - 1].replace('.json','');
    }
    console.log('serverResponseToSpec: ' + docID);
    return { id : docID };
  },

  specToValues: function (spec) {
    return _.map(spec, function (property, name) {
      return qb.value(name, property);
    });
  },

  uuid: require('node-uuid').v4
};
