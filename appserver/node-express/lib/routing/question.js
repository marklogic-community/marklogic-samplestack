var role = 'contributors';

module.exports = function (app, mw) {
  app.post('/v1/questions', [
    mw.csrf.checkHeader,
    mw.auth.roles.checkRole.bind(app, role),
    mw.parseBody.json,
    mw.db.setClientForRole.bind(app, role),

    function (req, res, next) {
      req.db.postQuestion(req.body, function (err, question) {
        return err ? next(err) : res.send(question);
      });
    }
  ]);
};
