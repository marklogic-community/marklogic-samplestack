var roles = ['contributors'];

module.exports = function (app, mw) {
  app.get('/v1/questions', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getQuestions({ q: req.query.q, start: req.query.start })
      .then(function (questions) {
        return res.status(200).send(questions);
      })
      .catch(next);
    }
  ]);

  app.get('/v1/questions/:id', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getQuestion({ questionId: req.params.id })
      .then(function (question) {
        return res.status(200).send(question);
      })
      .catch(next);
    }
  ]);

  app.post('/v1/questions', [
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      return req.db.postQuestion(req.body)
      .then(function (question) {
        return res.status(200).send(question);
      })
      .catch(next);
    }
  ]);

  app.delete('/v1/questions:id', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.deleteQuestion({ questionId: req.params.id })
      .then(function (response) {
        return res.status(200).send(response);
      })
      .catch(next);
    }
  ]);


};
