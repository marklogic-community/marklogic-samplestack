var passport = require('passport');
var ldapauth = require('passport-ldapauth');
var cookieSession = require('cookie-session');
var async = require('async');
var options = libRequire('../options').ldap;

var configurePassport = function (app , ldapConfig) {
  passport.use(new ldapauth.Strategy(

    {
      server : {
        url: options.protocol +
            '://' + options.hostname +
            ':' + options.port,
        bindDn: options.adminDn,
        bindCredentials: options.adminPassword,
        searchBase: options.searchBase,
        searchFilter: options.searchFilter
      },
      usernameField: 'username',
      passwordField: 'password'
    }
  ));

  // TODO: serialize to-from server
  var users = {};

  passport.serializeUser(function (user, done) {
    console.log('serialize: ' + JSON.stringify(user));
    users[user.uid] = JSON.stringify(user);
    done(null, user.uid);
  });


  passport.deserializeUser(function (id, done) {


    console.log('serialize');

    // console.log('deserialize, users: ' + JSON.stringify(users));

    var userStr = users[id];
    if (userStr) {
      var user = JSON.parse(userStr);
      // console.log('deserialize: ' + JSON.stringify(user));
      done(null, user);
    }
    else {
      done(new Error('user not found in memory: ' + id));
    }
  });

  var expressSession = require('express-session')({
    secret: '<mysecret>',

    // this is here so that a successful
    // GET /v1/session will always make a connect.sid cookie
    saveUninitialized: true,

    // if you are timing out unused sessions, you probably want this to be
    // true so that you don't keep touching the timestamp of your document
    resave: false
  });

  var authenticate = passport.authenticate('ldapauth');

  // app.use(require('express-session')({
  //   secret: '<mysecret>',
  //   saveUninitialized: false,
  //   resave: false
  // }));
  //
  //

  return {
    createSession: expressSession,
    // createSession: function (req, res, next) {
    //   expressSession(
    //     req,
    //     res,
    //     passport.initialize.bind(passport,req, res, next)
    //   );
    // },
    loginSession: function (req, res, next) {
      // next();
      async.waterfall([
        expressSession.bind(this, req, res),
        passport.initialize().bind(passport, req, res),
        passport.session().bind(passport, req, res),
        authenticate.bind(passport, req, res)
      ], next);
    }
  };

};

module.exports = function (app) {
  var ldap = libRequire('ldap-client')(app);
  var sessions = configurePassport(app, ldap.config);

  return {
    getUserRoles: ldap.getUserRoles,

    checkRole: function (role, req, res, next) {
      ldap.getUserRoles(req.user.uid)
      .then(function (roles) {
        console.log(JSON.stringify(roles));
        req.roles = roles;
        if (roles.indexOf(role) < 0) {
          return next({ status: 403, message: 'insufficientPrivileges' });
        }
        else {
          req.role = role;
        }
      })
      .catch(next);
    },
    // getBestRole: function (roles, req, res, next) {
    //   ldap.authorization.roles(roles)(req, res, next);
    // },
    logout: function (req, res, next) {
      try {
        // TODO this is the passport logout function -- does it clear the
        // session in the database?
        // what else does it do?
        req.logout();
      }
      finally {
        // this function shouldn't fail
        // TODO
        next();
      }
    },
    createSession: sessions.createSession,
    login: sessions.loginSession
  };
};
