var passport = require('passport');
var ldapauth = require('passport-ldapauth');

var options = libRequire('../options');

var ldapProtocol = options.ldap.ldaps ? 'ldaps' : 'ldap';

var csrf = require('csurf');

passport.use(new ldapauth.Strategy(
  {
    server: {
      url: ldapProtocol +
          '://' + options.ldap.hostname +
          ':' + options.ldap.port,
      adminDn: options.ldap.adminDn,
      adminPassword: options.ldap.adminPassword,
      searchBase: options.ldap.searchBase,
      searchFilter: options.ldap.searchFilter
    },
    usernameField: 'username',
    passwordField: 'password'
  }
));

// TODO: serialize to-from server
var users = {};

passport.serializeUser(function (user, done) {
  // console.log('serialize: ' + JSON.stringify(user));
  users[user.uid] = JSON.stringify(user);
  done(null, user.uid);
});


passport.deserializeUser(function (id, done) {
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

// var checkCsrf = function (req, res, next) {
//   if (
//     // trying to login -- this is always ok
//     (req.method === 'POST' && req.path === '/v1/login') ||
//     // not yet authenticated -- this is always ok
//     !req.user
//   ) {
//     next();
//   }
//   else {
//     csrf({ ingoreMethods: [] })(req, res, next);
//   }
// };
//

module.exports = function (app) {
  // deal with any existing session
  app.use(require('express-session')({
    secret: '<mysecret>',
    saveUninitialized: false,
    resave: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // req.user now available if logged in
  // logged-in users must use CSRF
  // app.use(checkCsrf);
  // app.use(csrfError);

};


// module.exports = passport.authenticate('ldapauth');


// var secModules = require('requireindex')(__dirname);
//
// app.use(require('express-session')({
//   secret: '<mysecret>',
//   saveUninitialized: true,
//   resave: true
// }));
//
//
// module.exports = function (req, res, next) {
//   secModules.getSessionInfo(req, res);
//
//   if (secModules.csrfRequi)
//   if (req.user && !
//      // don't require csrf if attempting to log in
//     !req.user &&
//     //
//     req.method === 'GET' && req.path.toLowerCase() === '/v1/session') {
//     res.set('X-CSRF-Token', req.csrfToken());
//     next();
//   }
//   else {
//     csrf({ ignoreMethods: ['OPTIONS'] })(req, res, next);
//   }
// });
// app.use(function (req, res, next) {
//   next();
// });
//
//
// app.use(function (err, req, res, next) {
//   if (err.code !== 'EBADCSRFTOKEN') {
//     return next(err);
//   }
//   // handle CSRF token errors here
//   res.status(403);
//   res.send('session has expired or form tampered with');
// });
//
// //app.use(libRequire('middleware/ml-passport'));
//   //passport.initialize
//   //passport.session
//
// // TBD
// //app.use(libRequire('middleware/ml-ldap-passport'));
//
//
// // function (req, res, next) {
// //   require('csurf')({ ignoreMethods: ['OPTIONS'] })(req, res, function () {
// //     // console.log(req.csrfToken());
// //
// //     next();
// //   });
// // });
//
//
// // app.use(function (req, res, next) {
// //   require('csurf')({ ignoreMethods: ['OPTIONS'] })(req, res, function () {
// //     // console.log(req.csrfToken());
// //
// //     res.set('X-CSRF-Token', req.csrfToken());
// //     next();
// //   });
// // });
//
// var csrf = require('csurf');
//
// //
// app.use(security.session());
// app.use(security.checkCsrf());
//
