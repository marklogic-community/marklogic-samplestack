var mw = libRequire('middleware');
var dbClient = libRequire('db-client');

var role = 'contributors';

module.exports = function (app) {
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
    mw.auth.roles.getRole.bind(app, role),
    // set CSRF header if configured to do so
    // mw.csrf.set,
    // get a dbclient instance fitting the role set above
    mw.db.getClientForRole.bind(app, role), //dbClient,
    // retrieve and return  information about the user

    function (req, res, next) {
      dbClient.getContributor(req.session.id, function (err, contributor) {
        return err ? next(err) : res.send(contributor);
      });
    }
  ]);
};
