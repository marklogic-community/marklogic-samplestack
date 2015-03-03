var Promise = require('bluebird');

module.exports = function (uid) {
  var self = this;
  return new Promise(function (resolve, reject) {

    var roles = [];
    var filter = '(&(objectclass=groupOfNames)(uniqueMember=uid=' +
        uid +
        ',ou=people,dc=samplestack,dc=org))';
    return self.search(
      'dc=samplestack,dc=org',
      {
        filter: filter,
        attributes: ['cn'],
      },
      function (err, response) {
        if (err) {
          return reject(err);
        }
        else {
          response.on('error', function (err) {
            return reject(err);
          });

          response.on('searchReference', function (referral) {
            return reject(new Error(
              'LDAP search reference returned -- not implemented'
            ));
          });

          response.on('searchEntry', function (entry) {
            roles.push(entry.object.cn);
          });

          response.on('end', function () {
            return resolve(roles);
          });
        }
      }
    );
  });
};
