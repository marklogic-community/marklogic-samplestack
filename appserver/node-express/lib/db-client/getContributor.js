var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

//TODO: ldap stuff doesn't belong here!
//
//
module.exports = function (username) {

  return new Promise(function (resolve, reject) {
    this.documents.query(
      qb.where(
        qb.directory('com.marklogic.samplestack.domain.Contributor/'),
        qb.value('userName', username)
      )
    ).result(
      function (response) {
        if (response.length !== 1) {
          return reject({ error: 'cardinalityViolation', username: username });
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
