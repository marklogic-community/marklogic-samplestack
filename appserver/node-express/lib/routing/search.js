var roles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/search', [
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      return req.db.searchQnADocs(req)
      .then(function (result) {
        return res.status(200).send(result);
      })
      .catch(next);
    }
  ]);
};
