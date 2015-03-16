var roles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/search', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      return req.db.search(req.body)
      .then(function (result) {
        return res.status(200).send(result);
      })
      .catch(next);
    }
  ]);
};
