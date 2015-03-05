var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

module.exports = function (userSpec) {
  var self = this;

  return new Promise(function (resolve, reject) {

    var questionsDir = '/questions/';
    var length = 10;
    var start = (userSpec.start) ? parseInt(userSpec.start) : 1;
    var searchText = (userSpec.q) ? userSpec.q : '';
    var fetch = self.documents.query(
      qb.where(
        qb.directory(questionsDir),
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
        return resolve(response);
      },
      reject
    );
  });
};
