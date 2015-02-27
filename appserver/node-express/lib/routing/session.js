module.exports = function (app, mw) {
  // respond to POSTs to this address
  app.post('/v1/session', [
    mw.csrf.checkHeader, //csrf.conditionalCheck,
    // parse a url-encoded body
    mw.parseBody.urlEncoded, //urlencodedParser,
    // use the passportjs library to check authentication against ldap
    mw.auth.authenticate, //passport.authenticate('ldapauth'),
    // if the user is in the contributors role, assume that role for DB
    // connection purposes, otherwise return 401
    //auth.roles(['contributors'])
    mw.auth.roles.checkRole.bind(app, 'contributors'),
    // set CSRF header if configured to do so
    // mw.csrf.set,
    // get a dbclient instance fitting the role set above
    mw.db.getClientForRole.bind(app, 'contributors'),
    // retrieve and return  information about the user

    function (req, res, next) {
      return Promise.join(
        req.db.getContributor(req.user.uid),
        app.locals.ldap.getUserRoles(req.user.uid),
        function (contributor, ldapUser) {
          _.merge(contributor, { role: ldapUser });
          return res.status(200).send(contributor);
        }
      ).catch(next);
    }
  ]);
};
