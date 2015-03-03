var Promise = require('bluebird');
var async = require('async');

var sessionGetter = function (req, res, next) {
  console.log(JSON.stringify(req.user, null, ' '));
  return req.db.getContributor({ uid: req.user.uid })
  .then(function (contributor) {
    // add in the roles of the user
    contributor.role = req.user.roles;
    return res.status(200).send(contributor);
  })
  .catch(next);
};

module.exports = function (app, mw) {
  app.get('/v1/session', [
    mw.auth.tryReviveSession,
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
    }
  ]);

  app.delete('/v1/session', [
    function (req, res, next) {
      // fail silently so as not to upset the browser's applecart
      if (!req.session) {
        res.status(205).send({ message: 'Reset Content'});
      }
      else {
        async.waterfall([
          mw.auth.logout.bind(app, req, res)
        ], function (err) {
          if (err) {
            // we might want to log this formally
            console.log('failed logoout');
          }
          res.status(205).send({ message: 'Reset Content'});
        });
      }
    },
  ]);

  app.put('/v1/session', [
    mw.auth.tryReviveSession,
    mw.parseBody.json,
    mw.auth.login,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    sessionGetter.bind(app)
  ]);

  app.post('/v1/session', [
    mw.auth.tryReviveSession,
    mw.parseBody.urlEncoded,
    mw.auth.login,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    sessionGetter.bind(app)
  ]);
};
