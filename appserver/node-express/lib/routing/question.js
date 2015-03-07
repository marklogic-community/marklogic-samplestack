var roles = ['default','contributors'];

module.exports = function (app, mw) {
  app.get('/v1/questions', [

    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getQuestions({ 'q': req.query.q, 'start': req.query.start })
      .then(function (questions) {
        return res.status(200).send(questions);
      })
      .catch(next);
    }
  ]);

  app.get('/v1/questions/:id', [
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.getQuestion({ 'questionId': req.params.id })
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

  /*
   * Route for the following requests
   *
   * /v1/questions/{id}/{upvotes | downvotes}
   * /v1/questions/{id}/comments
   * /v1/questions/{id}/answers
   */
  app.post('/v1/questions/:id/:operation', [
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      var operation = req.params.operation;
      if (operation === 'upvotes' || operation === 'downvotes') {
        operation = 'questionVote';
      }
      else if (operation === 'comments') {
        operation = 'questionComment';
      }
      else if (operation === 'answers') {
        operation = 'questionAnswer';
      }
      return req.db.patchQuestion({ 'questionId': req.params.id,
                                    'operation': operation,
                                    'body': req.body })
      .then(function (question) {
        return res.status(200).send(question);
      })
      .catch(next);
    }
  ]);

  /*
   * Route for the following requests
   *
   * /v1/questions/{id}/answers/{answerId}/{upvotes | downvotes}
   * /v1/questions/{id}/answers/{answerId}/comments
   * /v1/questions/{id}/answers/{answerId}/accept
   */
  app.post('/v1/questions/:questionid/answers/:answerid/:operation', [
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      var operation = req.params.operation;
      if (operation === 'upvotes' || operation === 'downvotes') {
        operation = 'answerVote';
      }
      else if (operation === 'comments') {
        operation = 'answerComment';
      }
      else if (operation === 'accept') {
        operation = 'answerAccept';
      }
      return req.db.patchQuestion({ 'questionId': req.params.questionid,
                                    'answerId': req.params.answerid,
                                    'operation': operation,
                                    'body': req.body })
      .then(function (question) {
        return res.status(200).send(question);
      })
      .catch(next);
    }
  ]);

  // app.delete('/v1/questions:id', [
  //   mw.auth.associateBestRole.bind(app, roles),

  //   function (req, res, next) {
  //     return req.db.deleteQuestion({ questionId: req.params.id })
  //     .then(function (response) {
  //       return res.status(200).send(response);
  //     })
  //     .catch(next);
  //   }
  // ]);
};
