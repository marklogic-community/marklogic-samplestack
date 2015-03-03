var Promise = require('bluebird');

module.exports = function (uid) {
  var self = this;
  return new Promise(function (resolve, reject) {

    var roles = [];
    var filter = '(&(objectclass=groupOfNames)(uniqueMember=uid=' +
        uid +
        ',ou=people,dc=samplestack,dc=org)(|' +
        '))';
    self.search(
      'dc=samplestack,dc=org',
      {
        filter: filter,
        attributes: ['cn'],
      },
      function (err, response) {
        if (err) {
          reject(err);
        }
        else {
          response.on('error', reject);

          response.on('searchReference', function (referral) {
            reject(new Error(
              'LDAP search reference returned -- not implemented'
            ));
          });

          response.on('searchEntry', function (entry) {
            roles.push(entry.object.cn);
          });

          response.on('end', function () {
            console.log(JSON.stringify(roles));
            resolve(roles);
          });
        }
      }
    );
  });
};
