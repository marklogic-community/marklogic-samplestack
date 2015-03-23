// expose lodash globally for easy access
global._ = require('lodash');

module.exports = {
  // how many worker child processes to launch
  numWorkers: 1,
  // easy access to the contents of package.json file
  // pkg: require('./package.json'),
  // ip to which the server children bind
  address: '0.0.0.0',
  // port on which server children bind
  port: 3000,
  // whether to use https or not
  https: false,
  // https: {
  //   key: fs.readFileSync('sslcert/server.key', 'utf8'),
  //   cert: fs.readFileSync('sslcert/server.crt', 'utf8')
  // }
  // whether html5 pushstate mode should be enabled (if serving webapp)
  html5Mode: true,
  // whether to run/enforce CSRF protection
  enableCsrf: false,
  // properties for database tier connections
  db: {
    clientConnection: {
      host:     'localhost',
      port:     '8006',
      authType: 'DIGEST'
    }
  },
  // properties of LDAP authentication
  //
  // //better docs please
  ldap: {
    hostname: 'localhost',
    port: 33388, // was 33389
    adminDn: 'cn=root',
    adminPassword: 'admin',
    searchBase: 'ou=people,dc=samplestack,dc=org',
    searchFilter: '(uid={{username}})',
    useBuiltInServer: true,
    // true for ldap over ssl (built-in server support not implemented)
    protocol: 'ldap' // or 'ldaps' for secure
  },
  // mapping of LDAP roles to database credentials
  // TODO store/manage passwords more securely
  rolesMap: {
    admins: {
      name: 'admins',
      ldap: 'cn=admins,ou=groups,dc=samplestack,dc=org',
      dbUser: 'samplestack-admin',
      dbPassword: 'samplestack-admin-password'
    },
    contributors: {
      name: 'contributors',
      ldap: 'cn=contributors,ou=groups,dc=samplestack,dc=org',
      dbUser: 'samplestack-contributor',
      dbPassword: 'sc-pass'
    },
    default: {
      name: 'default',
      dbUser: 'samplestack-guest',
      dbPassword: 'sa-pass'
    }
  }
};
