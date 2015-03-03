var passport = require('passport');
var ldapauth = require('passport-ldapauth');
var cookieSession = require('cookie-session');
var async = require('async');
var options = libRequire('../options').ldap;
var csrf = require('csurf');
var util = require('util');

var csrf = {
  handleError: function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') {
      return next(err);
    }
    res.status(400).send({error: 'Invalid CSRF token.'});
  },

  /**
   * Error handlers associated with this module.
   * @type {Array}
   */
  /**
   * If enabled, generates a CSRF token, stores it to the session (TODO), and
   * sets the response HEADER.
   *
   * @param {Object}   req
   * @param {Object}   res
   * @param {Function} next
   */
  setHeader: function (req, res, next) {
    if (options.enableCsrf) {
      try {
        csrf()(req, res, function () {});
      }
      // expect failure, csurf needs work here, they don't let you
      // cleanly generate a token ATM
      catch (err) {}
      res.set('X-CSRF-Token', req.csrfToken());
    }
    next();
  },

  /**
   * When this is called, we only do something if BOTH:
   * a) CSRF protection is enabled in the options file; and
   * b) the request is associated with a session
   *
   * In other words, we allow people to proceed without CSRF if they
   * do not even claim to have a session, or if we aren't intending to
   * enforce CSRF. Otherwise, they must pass the CSRF token test.
   * (The token must have been stored in the session data for this to work.)
   * TODO:
   * a) revive session data if the user comes in with a sessionid
   * b) set the server-side token in memory to match the revived session data
   * c) store token in session data as part of auth. mechanism
   * d) throw out sessions when a bad request comes in (not found token or
   * CSRF mismatch)
   *
   * @param {Object}   req
   * @param {Object}   res
   * @param {Function} next
   */
  checkHeader: function (req, res, next) {
    if (options.enableCsrf && req.session) {
      csrf()(req, res, next);
    }
    else {
      next();
    }
  }
};

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
    console.log('store user');
    users[user.uid] = JSON.stringify(user);
    done(null, user.uid);
  });


  passport.deserializeUser(function (id, done) {
    console.log('load user');
    var userStr = users[id];
    if (userStr) {
      var user = JSON.parse(userStr);
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

  return {
    createSession: expressSession,
    getSession: expressSession,
    loginSession: function (req, res, next) {
      async.waterfall([
        expressSession.bind(this, req, res),
        passport.initialize().bind(passport, req, res),
        passport.session().bind(passport, req, res),
        authenticate.bind(passport, req, res),
        // function (cb) {
        //   console.log(JSON.stringify(req.session));
        //   cb();
        // }
      ], next);
    }
  };

};

module.exports = function (app) {
  app.use(csrf.handleError);

  var ldap = libRequire('ldap-client')(app);
  var sessions = configurePassport(app, ldap.config);

  return {
    getUserRoles: ldap.getUserRoles,

    checkRole: function (role, req, res, next) {
      ldap.getUserRoles(req.user.uid)
      .then(function (roles) {
        req.roles = roles;
        if (roles.indexOf(role) < 0) {
          return next({ status: 403, message: 'insufficientPrivileges' });
        }
        else {
          req.role = role;
          return next();
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
    login: sessions.loginSession,

    tryReviveSession: function (req, res, next) {
      console.log('revive');
      console.log(util.inspect(req));
      // is the request purporting to have a session?
      // if so, it should have a csrf ID, in which case we will try reviving
      // the user
      // otherwise, it's business as usual
      if (req.cookies && req.cookies['connect.sid']) {
        console.log('waterfall');
        async.waterfall([
          csrf.checkHeader.bind(app, req, res),
          sessions.getSession.bind(app, req, res),
          passport.initialize().bind(passport, req, res),
          passport.session().bind(passport, req, res),
        ], next);
      }
      else {
        next();
      }
    }
  };
};
