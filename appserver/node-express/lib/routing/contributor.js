var db = libRequire('db-client');

var role = 'default';

module.exports = function (app, mw) {
  app.get('/v1/contributors/:id', [
    mw.csrf.checkHeader,
    // mw.auth.roles.getRole.bind(app.locals.options.ldap, role),
    // mw.db.setClientForRole.bind(app.locals.options.db, role),
    mw.db.setClientForRole.bind(app, 'contributors'),

    function (req, res, next) {
      return req.db.getContributor(req.params.id)
      .then(function (contributor) {
        return res.status(200).send(contributor);
      })
      .catch(next);
    }
  ]);
};
