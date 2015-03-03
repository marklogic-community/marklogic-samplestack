var roles = ['contributors'];

module.exports = function (app, mw) {
  app.post('/v1/questions', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      req.db.postQuestion(req.body, function (err, question) {
        return err ? next(err) : res.send(question);
      });
    }
  ]);
};
