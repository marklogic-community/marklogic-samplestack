var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

module.exports = function (userSpec) {
  var self = this;

  return new Promise(function (resolve, reject) {

    var contributorsDir = 'com.marklogic.samplestack.domain.Contributor/';
    var length = 10;
    var start = (userSpec.start) ? userSpec.start : 1;
    var searchText = (userSpec.q) ? userSpec.q : '';
    var fetch = self.documents.query(
      qb.where(
        qb.directory(contributorsDir),
        qb.parsedFrom(searchText)
      ).slice(start,length).withOptions({categories: 'none'})
    );
    fetch.result(
      function (response) {
        if (response.length !== 1) {
          return reject({
            error: 'cardinalityViolation',
            userSpec: userSpec,
            count: response.length
          });
        }
        var obj = response[0].content[
          Object.keys(response[0].content)[0]
        ];
        return resolve(obj);
      },
      reject
    );
  });
};
