var Promise = require('bluebird');
var options = libRequire('../options');

var dbUserByUsername = function (db, username) {
  var qb = require('marklogic').queryBuilder;

  return new Promise(function (resolve, reject) {
    db.documents.query(
      qb.where(
        qb.directory('com.marklogic.samplestack.domain.Contributor/'),
        qb.value('userName', username)
      )
    ).result(
      function (response) {
        if (response.length !== 1) {
          reject(new Error(
            'Cardinality Violation for username ' + username
          ));
        }
        else {
          var obj = response[0].content[
            Object.keys(response[0].content)[0]
          ];
          // obj.votes = obj.votes[Object.keys(obj.votes)[0]];
          resolve(obj);
        }
      },
      reject
    );
  });
};

var ldapUserRoles = function (uid) {
  var ldapProtocol = options.ldap.ldaps ? 'ldaps' : 'ldap';
  var ldap = require('ldapjs').createClient({
    url: ldapProtocol +
        '://' + options.ldap.hostname +
        ':' + options.ldap.port,
    timeout: undefined, // inifinty TODO: fixme
    connectTimeout: undefined, // OS-determined TODO: fixme
    maxConnections: 3, // TODO: stress test to figure out
    bindDN: options.ldap.adminDn,
    bindCredentials: options.ldap.adminPassword,
    checkInterval: undefined, // TODO: research me
    maxIdleTime: undefined // TODO: research me
  });

  return new Promise(function (resolve, reject) {

    var roles = [];
    ldap.search(
      'dc=samplestack,dc=org',
      {
        filter: '(&(objectclass=groupOfNames)' +
            '(uniqueMember=uid=maryAdmin@marklogic.com,' +
            'ou=people,dc=samplestack,dc=org))',
        attributes: ['cn'],
      },
      function (err, ldapres) {
        if (err) {
          reject(err);
        }
        else {
          ldapres.on('error', reject);

          ldapres.on('searchReference', function (referral) {
            reject(new Error(
              'LDAP search reference returned -- not implemented'
            ));
          });

          ldapres.on('searchEntry', function (entry) {
            roles.push(entry.object.cn);
          });

          ldapres.on('end', function () {
            resolve(roles);
          });
        }
      }
    );
  });
};


module.exports = function (req, res, next) {
  // var joinCallbacks = 0;
  // var thens = 0;
  if (req.params.id) {
    return next(new Error('by id not implemented'));
  }

  Promise.join(
    dbUserByUsername(req.db, req.user.uid),
    ldapUserRoles(req.user.uid),
    function (dbInfo, ldapInfo) {
      // console.log('joinCallbacks: ' + (++joinCallbacks));

      return _.merge(dbInfo, { role: ldapInfo });
    }
  ).then(
    function (result) {
      // console.log('thens: ' + (++thens));
      // console.log(require('util').inspect(res));
      res.status(200).send(result);
    },
    function (err) {
      // console.log('err?');
      //  + (++thens));
      next(err);
    }
  );
};
