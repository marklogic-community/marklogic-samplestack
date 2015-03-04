var roles = ['default'];

module.exports = function (app, mw) {
  app.get('/v1/contributors', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getContributors({ q: req.query.q, start: req.query.start })
      .then(function (contributors) {
        return res.status(200).send(contributors);
      })
      .catch(next);
    }
  ]);

  app.get('/v1/contributors/:id', [
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getContributor({ contributorId: req.params.id })
      .then(function (contributor) {
        return res.status(200).send(contributor);
      })
      .catch(next);
    }
  ]);
};
