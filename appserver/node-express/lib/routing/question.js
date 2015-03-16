var errs = libRequire('errors');
var Promise = require('bluebird');

module.exports = function (app, mw) {
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

  var notAlreadyVoted = function (content, contributor) {
    var already = content.upvotingContributorIds.indexOf(contributor.id) >= 0 ||
    content.downvotingContributorIds.indexOf(contributor.id) >= 0;
    if (already) {
      throw errs.alreadyVoted(content, contributor);
    }
    else {
      return;
    }
  };

  /*
   * Route for the following requests
   *
   * /v1/questions/{id}/{upvotes | downvotes}
   * /v1/questions/{id}/comments
   * /v1/questions/{id}/answers
   */
  app.post('/v1/questions/:questionId/:operation', [
    //fd044632-55eb-4c91-9300-7578cee12eb3
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    mw.parseBody.json,

    function (req, res, next) {
      var spec = _.clone(req.params);
      var promises = [];

      spec.contributor = _.omit(req.user, 'roles');

      var txid;
      // return req.db.transactions.open().result()
      // .then(function (transactionId) {
        // txid = transactionId;
      txid = undefined;

      // TODO: b/c we need to know the contributor of the content
      // item we need to do a around trip -- two extra round
      // trips = mmore performant to do this in a server extension
      return req.db.transactions.open().result()
      .then(function (response) {
        txid = response.txid;
        return req.db.qnaDoc.getUniqueContent(
          txid, { id: spec.questionId }
        )
        .then(function (doc) {
          var contentContributorId = doc.owner.id;
          switch (spec.operation) {
            case 'upvotes':
            case 'downvotes':
              spec.voteChange = spec.operation === 'upvotes' ?
                  1 :
                  -1;
              notAlreadyVoted(doc, spec.contributor);
              spec.operation = 'voteQuestion';
              promises.push(req.db.qnaDoc.patch(txid, spec));
              promises.push(
                req.db.contributor.patchReputation(
                  txid, contentContributorId, spec.voteChange
                )
              );
              break;
            case 'comments':
              spec.operation = 'addQuestionComment';
              spec.content = req.body;
              promises.push(req.db.qnaDoc.patch(txid, spec));
              break;
            case 'answers':
              spec.operation = 'addAnswer';
              spec.content = req.body;
              promises.push(req.db.qnaDoc.patch(txid, spec));
              break;
            default:
              throw new errs.unsupportedMethod(req);
          }

          return Promise.all(promises);
        })
        .then(function () {
          return req.db.transactions.commit(txid).result()
          .then(function () {
            return req.db.qnaDoc.getUniqueContent(
              null, { id: spec.questionId }
            );
          })
          .then(function (question) {
            return res.status(200).send(question);
          });
        })
        .catch(function (err) {
          return req.db.transactions.rollback(txid).result()
          .then(function () {
            next({ status: err.statusCode || 500, error: err });
          });
        });
      })
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
    mw.auth.associateBestRole.bind(app, ['contributors', 'default']),
    mw.parseBody.json,

    function (req, res, next) {
      var spec = _.clone(req.params);
      var promises = [];

      spec.contributor = _.omit(req.user, 'roles');

      var txid;
      // return req.db.transactions.open().result()
      // .then(function (transactionId) {
        // txid = transactionId;
      txid = undefined;

      // TODO: b/c we need to know the contributor of the content
      // item we need to do a around trip -- two extra round
      // trips = mmore performant to do this in a server extension
      return req.db.transactions.open().result()
      .then(function (response) {
        txid = response.txid;
        return req.db.qnaDoc.getUniqueContent(
          txid, { id: spec.questionId }
        )
        .then(function (doc) {
          var answer =  _.find(
            doc.answers, { 'id': spec.answerId }
          );
          var contentContributorId = answer.owner.id;
          switch (spec.operation) {
            case 'upvotes':
            case 'downvotes':
              spec.voteChange = spec.operation === 'upvotes' ?
                  1 :
                  -1;
              notAlreadyVoted(answer, spec.contributor);
              spec.operation = 'voteAnswer';
              promises.push(txid, req.db.qnaDoc.patch(txid, spec));
              promises.push(
                req.db.contributor.patchReputation(
                  txid, contentContributorId, spec.voteChange
                )
              );
              break;
            case 'comments':
              spec.operation = 'addAnswerComment';
              spec.content = req.body;
              promises.push(req.db.qnaDoc.patch(txid, spec));
              break;
            case 'accept':
              if (doc.owner.id !== spec.contributor.id) {
                throw errs.mustBeOwner(spec);
              }
              spec.operation = 'acceptAnswer';
              promises.push(req.db.qnaDoc.patch(txid, spec));
              promises.push(
                req.db.contributor.patchReputation(
                  txid, contentContributorId, 1
                )
              );
              if (doc.acceptedAnswerId) {
                // we also need to take a point away from previous
                // accepted answer owner
                var previously =  _.find(
                  doc.answers, { 'id': spec.answerId }
                );
                var previousContributorId = previously.owner.id;
                promises.push(
                  req.db.contributor.patchReputation(
                    txid, previousContributorId, -1
                  )
                );
              }
              break;
            default:
              throw new errs.unsupportedMethod(req);
          }

          return Promise.all(promises);
        })
        .then(function () {
          return req.db.transactions.commit(txid).result()
          .then(function () {
            return req.db.qnaDoc.getUniqueContent(
              null, { id: spec.questionId }
            );
          })
          .then(function (question) {
            return res.status(200).send(question);
          });
        })
        .catch(function (err) {
          return req.db.transactions.rollback(txid).result()
          .then(function () {
            next({ status: err.statusCode || 500, error: err });
          });
        });
      })
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
