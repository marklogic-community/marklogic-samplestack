var Promise = require('bluebird');
var async = require('async');
var mon = libRequire('monitoring');

var sessionGetter = function (req, res, next) {
  return req.db.getContributor({ uid: req.user.uid })
  .then(function (contributor) {
    // add in the roles of the user
    contributor.role = req.user.roles;
    req.user.displayName = contributor.displayName;
    req.user.contributorId = contributor.id;
    return res.status(200).send(contributor);
  })
  .catch(next);
};

module.exports = function (app, mw) {

  // for every REST endpoing, we first want to try to identify the requestor
  app.use('/v1/', mw.auth.tryReviveSession);

  app.get('/v1/session', [
    mw.auth.associateBestRole.bind(app, ['default']),
    function (req, res, next) {
      if (req.user) {
        sessionGetter(req, res, next);
      }
      else {
        // there is isn't an authenticated user -- so generate or regenerate
        // a csrf token
        mw.auth.createSession(req, res, next);
        res.status(204).send();
      }
    },

  ]);

  app.delete('/v1/session', [
    mw.auth.logout
  ]);

  app.put('/v1/session', [
    mw.parseBody.json,
    mw.auth.login,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    sessionGetter.bind(app),
  ]);

  app.post('/v1/session', [
    mw.parseBody.urlEncoded,
    mw.auth.login,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    sessionGetter.bind(app)
  ]);
};
