var Promise = require('bluebird');

module.exports = function (app, mw) {
  app.get('/v1/session', [
    function (req, res, next) {
      if (req.session) {
        return next({
          error: 'sessionExists',
          message: 'A session already exists. Log out of it first.',
          status: 400
        });
      }
      next();
    },
    mw.csrf.setHeader,
    mw.auth.createSession,
    function (req, res) {
      res.status(204).send();
    }
  ]);

  app.delete('/v1/session', [
    function (req, res, next) {
      if (!req.session) {
        return next({
          error: 'noSession',
          message: 'There is no session to delete.',
          status: 400
        });
      }
      next();
    },
    mw.auth.logout
  ]);

  var loginRouting = [
    mw.auth.login,
    // use the passportjs library to check authentication against ldap
    // mw.auth.authenticate, //passport.authenticate('ldapauth'),
    // if the user is in the contributors role, assume that role for DB
    // connection purposes, otherwise return 401
    //auth.roles(['contributors'])
    mw.auth.checkRole.bind(app, 'contributors'),
    // set CSRF header if configured to do so
    // mw.csrf.set,
    // get a dbclient instance fitting the role set above
    mw.db.setClientForRole.bind(app, 'contributors'),

    // retrieve and return  information about the user
    function (req, res, next) {
      var self = this;
      console.log(require('util').inspect(req));
      return Promise.join(
        req.db.getContributor(req.user.uid),
        self.locals.ldap.getUserRoles(req.user.uid),
        function (contributor, ldapUser) {
          _.merge(contributor, { role: ldapUser });
          return res.status(200).send(contributor);
        }
      ).catch(next);
    }
  ];

  var putRouting = [
    mw.csrf.checkHeader, mw.parseBody.json
  ].concat(loginRouting);

  var postRouting = [
    mw.csrf.checkHeader, mw.parseBody.urlEncoded
  ].concat(loginRouting);

  // respond to POSTs and PUTs to this address
  // POSTs use url encoding, PUTs use json encoding (newer API)
  app.put('/v1/session', putRouting);
  app.post('/v1/session', postRouting);
};
