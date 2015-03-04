var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

module.exports = function (userSpec) {
  var self = this;

  return new Promise(function (resolve, reject) {
    var fetch = self.documents.read(
        '/questions/' + userSpec.questionId + '.json'
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
