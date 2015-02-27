module.exports = function (uid) {
  return new Promise(function (resolve, reject) {

    var roles = [];
    this.search(
      'dc=samplestack,dc=org',
      {
        filter: '(&(objectclass=groupOfNames)' +
            '(uniqueMember=uid=maryAdmin@marklogic.com,' +
            'ou=people,dc=samplestack,dc=org))',
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
            resolve(roles);
          });
        }
      }
    );
  });
};
