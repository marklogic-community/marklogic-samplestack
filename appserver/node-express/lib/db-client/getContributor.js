var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

module.exports = function (userId) {
  var self = this;

  return new Promise(function (resolve, reject) {
    // TODO: should thie really be approx. 2-times slower? are we missing
    // an index?
    // self.documents.query(
    //   qb.where(
    //     qb.directory('com.marklogic.samplestack.domain.Contributor/'),
    //     qb.value('id', userId)
    //   )
    // ).result(

    self.documents.read(
      'com.marklogic.samplestack.domain.Contributor/' + userId + '.json'
    ).result(
      function (response) {
        if (response.length !== 1) {
          return reject({
            error: 'cardinalityViolation',
            userId: userId,
            count: response.length
          });
        }
        var obj = response[0].content[
          Object.keys(response[0].content)[0]
        ];
        // TODO: how do we handle this now?
        // obj.votes = obj.votes[Object.keys(obj.votes)[0]];
        return resolve(obj);
      },
      reject
    );
  });
};
