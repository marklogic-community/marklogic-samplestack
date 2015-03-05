var roles = ['default'];

module.exports = function (app, mw) {
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
