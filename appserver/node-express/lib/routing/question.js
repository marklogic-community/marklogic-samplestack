var errs = libRequire('errors');
var Promise = require('bluebird');

module.exports = function (app, mw) {

  var notAlreadyVoted = function (content, contributor) {
    var already = (content.upvotingContributorIds &&
        content.upvotingContributorIds.indexOf(contributor.id) >= 0) ||
      (content.downvotingContributorIds &&
        content.downvotingContributorIds.indexOf(contributor.id) >= 0);
    if (already) {
      throw errs.alreadyVoted(content, contributor);
    }
    else {
      return;
    }
  };

  var handleVote = function (type, db, spec, txid) {
    return db.qnaDoc.getUniqueContent(
      null, { id: spec.questionId }
    )
    .then(function (doc) {
      var step1;
      var step2;
      var contentContributorId;

      contentContributorId = doc.owner.id;
      spec.voteChange = spec.operation === 'upvotes' ? 1 : -1;
      notAlreadyVoted(doc, spec.contributor);
      spec.operation = 'vote' + type;
      step1 = db.qnaDoc.patch(txid, spec);
      step2 = db.contributor.patchReputation(
        txid, contentContributorId, spec.voteChange
      );
      return [step1, step2]
    })
    .then(function (promises) {
      console.log('Promise.all');
      return Promise.all(promises);
    })
    .then(function (responses) {
      console.log('responses');
      console.log(responses);
      // the first item in the array is the spec we want (question spec)
      return responses[0];
    });
  };

  var handleComment = function (type, db, spec) {
    spec.operation = 'add' + type + 'Comment';
    return db.qnaDoc.patch(null, spec);
  };

  var handleAnswer = function (db, spec) {
    spec.operation = 'addAnswer';
    return db.qnaDoc.patch(null, spec);
  };

  var handleAccept = function (db, spec, txid) {
    return db.qnaDoc.getUniqueContent(
      null, { id: spec.questionId }
    )
    .then(function (doc) {
      var promises = [];
      var contentContributorId;

      contentContributorId = doc.owner.id;
      if (doc.owner.id !== spec.contributor.id) {
        throw errs.mustBeOwner(spec);
      }
      spec.operation = 'acceptAnswer';
      promises.push(db.qnaDoc.patch(txid, spec));
      promises.push(db.contributor.patchReputation(
        txid, contentContributorId, 1
      ));
      if (doc.acceptedAnswerId) {
        // we also need to take a point away from previous
        // accepted answer owner
        var previously =  _.find(
          doc.answers, { 'id': spec.answerId }
        );
        var previousContributorId = previously.owner.id;
        promises.push(
          db.contributor.patchReputation(
            txid, previousContributorId, -1
          )
        );
      }
      return promises;
    })
    .then(function (promises) {
      console.log('Promise.all');
      return Promise.all(promises);
    })
    .then(function (responses) {
      console.log('responses');
      console.log(responses);
      // the first item in the array is the spec we want (question spec)
      return responses[0];
    });
  };

  /*
   * ROUTE DEFINITIONS
   */

  // app.get('/v1/questions', [
  //
  //   mw.auth.associateBestRole.bind(app, roles),
  //
  //   function (req, res, next) {
  //     return req.db.getQuestions(
  //       { 'q': req.query.q, 'start': req.query.start }
  //     )
  //     .then(function (questions) {
  //       return res.status(200).send(questions);
  //     })
  //     .catch(next);
  //   }
  // ]);

  app.get('/v1/questions/:id', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors', 'default']),

    function (req, res, next) {
      return req.db.qnaDoc.getUniqueContent(null, { id: req.params.id })
      .then(function (question) {
        return res.status(200).send(question);
      })
      .catch(function (err) {
        next({ status: err.statusCode || 500, error: err });
      });
    }
  ]);

  app.post('/v1/questions', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    mw.parseBody.json,

    function (req, res, next) {
      return req.db.qnaDoc.post(
        null, _.omit(req.user, 'roles'), req.body
      )
      .then(function (response) {
        var docId = _.last(
          response.documents[0].uri.split('/')
        ).replace(/\.json$/, '');
        return req.db.qnaDoc.getUniqueContent(null, { id: docId });
      })
      .then(function (doc) {
        return res.status(200).send(doc);
      })
      .catch(function (err) {
        next({ status: err.statusCode || 500, error: err });
      });
    }
  ]);


  /*
   * Route for the following requests
   *
   * /v1/questions/{id}/{upvotes | downvotes}
   * /v1/questions/{id}/comments
   * /v1/questions/{id}/answers
   */
  app.post('/v1/questions/:questionId/:operation', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    mw.parseBody.json,

    function (req, res, next) {
      var spec = _.clone(req.params);
      var promises = [];

      spec.contributor = _.omit(req.user, 'roles');

      /* Generalized response handler - NEED TO MOVE OUT OF ROUTE */
      var responder = function(resultSpec) {
        return req.db.qnaDoc.getUniqueContent(
          null, resultSpec
        )
        .then(function (response) {
          return res.status(200).send(response);
        })
      };

      var actionPromise;

      switch (spec.operation) {
        case 'upvotes':
        case 'downvotes':
          actionPromise = req.db.execAsTransaction(
            handleVote.bind(null, "Question", req.db, spec)
          );
          break;
        case 'comments':
          spec.content = req.body;
          actionPromise = handleComment("Question", req.db, spec);
          break;
        case 'answers':
          spec.content = req.body;
          actionPromise = handleAnswer(req.db, spec);
          break;
        default:
          throw new errs.unsupportedMethod(req);
      }

      return actionPromise
      .then(responder)
      .catch(function (err) {
        next({ status: err.statusCode || 500, error: err });
      });

    }
  ]);


  /*
   * Route for the following requests
   *
   * /v1/questions/{id}/answers/{answerId}/{upvotes | downvotes}
   * /v1/questions/{id}/answers/{answerId}/comments
   * /v1/questions/{id}/answers/{answerId}/accept
   */
  app.post('/v1/questions/:questionId/answers/:answerId/:operation', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    mw.parseBody.json,

    function (req, res, next) {
      var spec = _.clone(req.params);
      var promises = [];

      spec.contributor = _.omit(req.user, 'roles');

      /* Generalized response handler - NEED TO MOVE OUT OF ROUTE */
      var responder = function(resultSpec) {
        return req.db.qnaDoc.getUniqueContent(
          null, resultSpec
        )
        .then(function (response) {
          return res.status(200).send(response);
        })
      };

      var actionPromise;

      switch (spec.operation) {
        case 'upvotes':
        case 'downvotes':
          actionPromise = req.db.execAsTransaction(
            handleVote.bind(null, "Answer", req.db, spec)
          );
          break;
        case 'comments':
          spec.content = req.body;
          actionPromise = handleComment("Answer", req.db, spec);
          break;
        case 'accept':
          actionPromise = req.db.execAsTransaction(
            handleAccept.bind(null, req.db, spec)
          );
          break;
        default:
          throw new errs.unsupportedMethod(req);
      }

      return actionPromise
      .then(responder)
      .catch(function (err) {
        next({ status: err.statusCode || 500, error: err });
      });
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
