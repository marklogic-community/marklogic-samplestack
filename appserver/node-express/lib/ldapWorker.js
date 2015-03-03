/*
http://ldapjs.org/examples.html

    .userDnPatterns("uid={0},ou=people", "uid={0},ou=apps")
        .groupSearchBase("ou=groups").contextSource()
        .ldif("classpath:samplestack-ds.ldif")
        .root("dc=samplestack,dc=org");

  final String ldapServer = "ldap://localhost:33389";
  final String ldapSearchBase = "dc=samplestack,dc=org";

  //use one of the existing users...
  final String ldapUsername = "uid=mary@example.com,’";
  final String ldapPassword = "marysPassword";

  final String contributor = "Joe User";

    assertEquals(
      "joe@example.com",
       srLdapUser.getAttributes().get("uid").get()
);


  String searchFilter = "(&(objectclass=person)(cn="
        + accountName + "))";


 */



var ldap = require('ldapjs');

var options = libRequire('../options');

///--- Shared handlers

function authorize(req, res, next) {
  if (!req.connection.ldap.bindDN.equals('cn=root')) {
    return next(new ldap.InsufficientAccessRightsError());
  }

  return next();
}


///--- Globals

var SUFFIX = 'dc=samplestack,dc=org';
var db = {};
var server = ldap.createServer();

process.on('exit', function () {
  try {
    server.close();
  }
  catch (e) {}
});


server.bind('cn=root', function (req, res, next) {
  console.log('oooh Im being rooted');
  // console.log('root bind');
  if (req.dn.toString() !== 'cn=root' ||
      req.credentials !== options.ldap.adminPassword
  ) {
    return next(new ldap.InvalidCredentialsError());
  }

  res.end();
  return next();
});

server.bind(SUFFIX, function (req, res, next) {
  console.log('oooh Im being bound');
  // console.log('bind user');
  var dn = req.dn.toString();
  if (!db[dn]) {
    return next(new ldap.NoSuchObjectError(dn));
  }

  if (!db[dn].attributes.userPassword) {
    return next(new ldap.NoSuchAttributeError('userPassword'));
  }

  if (db[dn].attributes.userPassword !== req.credentials) {
    return next(new ldap.InvalidCredentialsError());
  }

  res.end();
  return next();
});

server.compare(SUFFIX, authorize, function (req, res, next) {
  // console.log('compare');
  var dn = req.dn.toString();
  if (!db[dn]) {
    return next(new ldap.NoSuchObjectError(dn));
  }

  if (!db[dn][req.attribute]) {
    return next(new ldap.NoSuchAttributeError(req.attribute));
  }

  var matches = false;
  var vals = db[dn][req.attribute];
  for (var i = 0; i < vals.length; i++) {
    if (vals[i] === req.value) {
      matches = true;
      break;
    }
  }

  res.end(matches);
  return next();
});

server.search(SUFFIX, authorize, function (req, res, next) {
  console.log('oooh Im being searched');
  // console.log('search');
  Object.keys(db).forEach(function (k) {
    if (req.filter.matches(db[k].attributes)) {
      var user = _.cloneDeep(db[k]);
      if (user.attributes) {
        delete user.attributes.userPassword;
      }
      res.send(_.merge({ dn: k }, user ));
      // console.log(user);
    }
  });

  res.end();
  return next();
});

///--- Fire it up
var listener = server.listen(
  options.ldap.port,
  options.ldap.hostname,
  function () {

    // TODO: read from ldif?
    // list of roles for user:
    /*

    ldapsearch -H ldap://localhost:8389 -x -D cn=root -w admin -LLL
      -b "o=samplestack"
      "(&(objectclass=groupOfNames)(uniqueMember= \
      uid=mary@example.com,ou=people,dc=samplestack,dc=org))" \
     cn
     */


    db['ou=groups,dc=samplestack,dc=org'] = {
      dn: 'ou=groups,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['top', 'organizationalUnit'],
        ou: 'people'
      }
    };

    db['ou=people,dc=samplestack,dc=org'] = {
      dn: 'ou=people,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['top', 'organizationalUnit'],
        ou: 'people'
      }
    };

    db['uid=joe@example.com,ou=people,dc=samplestack,dc=org'] = {
      dn: 'uid=joe@example.com,ou=people,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
        cn: 'Joe User',
        sn: 'User',
        uid: 'joe@example.com',
        userPassword: 'joesPassword',
        // TODO: do we want to use a role array?
        role: [
          'cn=contributors,ou=groups,dc=samplestack,dc=org'
        ]
      }
    };

    db['uid=mary@example.com,ou=people,dc=samplestack,dc=org'] = {
      dn: 'uid=mary@example.com,ou=people,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
        cn: 'Mary Admin',
        sn: 'User',
        uid: 'mary@example.com',
        userPassword: 'marysPassword',
        role: [
          'cn=admins,ou=groups,dc=samplestack,dc=org',
          'cn=contributors,ou=groups,dc=samplestack,dc=org'
        ]
      }
    };

    db['cn=admins,ou=groups,dc=samplestack,dc=org'] = {
      dn: 'cn=admins,ou=groups,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['groupOfNames'],
        cn: 'admins',
        ou: 'groups',
        uniqueMember: [
          'uid=mary@example.com,ou=people,dc=samplestack,dc=org'
        ]
      }
    };

    db['cn=contributors,ou=groups,dc=samplestack,dc=org'] = {
      dn: 'cn=contributors,ou=groups,dc=samplestack,dc=org',
      attributes: {
        objectclass: ['groupOfNames'],
        cn: 'contributors',
        ou: 'groups',
        uniqueMember: [
          'uid=mary@example.com,ou=people,dc=samplestack,dc=org',
          'uid=joe@example.com,ou=people,dc=samplestack,dc=org'
        ]
      }
    };

    console.log('Samplestack LDAP server up at: %s', server.url);
  }
);
