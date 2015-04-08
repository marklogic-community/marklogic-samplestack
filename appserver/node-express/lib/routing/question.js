/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var errs = libRequire('errors');
var Promise = require('bluebird');

module.exports = function (app, mw) {

  /**
   * Check if a contributor has not already voted on a question or answer.
   * @param  {Object} content Content for the question or answer being
   * checked.
   * @param  {Object} contributor Contributor objectExample:
   *   {"id":"cf99542d-f024-4478-a6dc-7e723a51b040",
   *    "displayName":"JoeUser"}
   * @return {[type]}
   */
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

  var getAndRespond = function (req, res, next, docSpec) {
    return req.db.qnaDoc.getUniqueContent(
      null, docSpec
    )
    .then(function (content) {
      if (content) {
        res.status(200).send(content);
      }
      else {
        res.status(401).send();
      }
    });
  };

  var handleVote = function (type, db, spec) {
    return db.execAsTransaction(function (txid) {
      return db.qnaDoc.getUniqueContent(
        null, { id: spec.questionId }
      )
      .then(function (doc) {
        var promises = [];
        var contentContributorId;
        var content = spec.answerId ?
            _.find(
              doc.answers, { 'id': spec.answerId }
            ) :
            doc;

        contentContributorId = content.owner.id;
        spec.voteChange = spec.operation === 'upvotes' ? 1 : -1;
        notAlreadyVoted(content, spec.contributor);
        spec.operation = 'vote' + type;
        promises.push(db.qnaDoc.patch(txid, spec));
        promises.push(db.contributor.patchReputation(
          txid, contentContributorId, spec.voteChange
        ));
        promises.push(db.contributor.patchVoteCount(
          txid, spec.contributor.id, 1
        ));
        return Promise.all(promises);
      })
      .then(function (responses) {
        // the first item in the array is the spec we want (question spec)
        return responses[0];
      });
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

  var handleAccept = function (db, spec) {
    return db.execAsTransaction(function (txid) {
      return db.qnaDoc.getUniqueContent(
        null, { id: spec.questionId }
      )
      .then(function (doc) {
        var promises = [];
        var answerContributorId;
        var answer = _.find(
              doc.answers, { 'id': spec.answerId }
            );

        answerContributorId = answer.owner.id;
        if (doc.owner.id !== spec.contributor.id) {
          throw errs.mustBeOwner(spec);
        }
        spec.operation = 'acceptAnswer';
        promises.push(db.qnaDoc.patch(txid, spec));
        // if there was a previously accepted answer (doc.acceptedAnswerId)
        // we need to take a point away from previous
        // accepted answer owner
        if (doc.acceptedAnswerId) {
          var previously =  _.find(
            doc.answers, { 'id': doc.acceptedAnswerId }
          );
          var previousContributorId = previously.owner.id;
          promises.push(
            db.contributor.patchReputation(
              txid, previousContributorId, -1
            )
          );
        }
        promises.push(db.contributor.patchReputation(
          txid, answerContributorId, 1
        ));
        return Promise.all(promises);
      })
      .then(function (responses) {
        // the first item in the array is the spec we want (question spec)
        return responses[0];
      });
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
      return getAndRespond(req, res, next, { id: req.params.id })
      .catch(next);
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
      .then(getAndRespond.bind(null, req, res, next));
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

      var actionPromise;

      switch (spec.operation) {
        case 'upvotes':
        case 'downvotes':
          actionPromise = handleVote('Question', req.db, spec);
          break;
        case 'comments':
          spec.content = req.body;
          actionPromise = handleComment('Question', req.db, spec);
          break;
        case 'answers':
          spec.content = req.body;
          actionPromise = handleAnswer(req.db, spec);
          break;
        default:
          next({ error: 'unsupported method: ' + spec.operation});
      }

      return actionPromise
      .then(getAndRespond.bind(null, req, res, next))
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
  app.post('/v1/questions/:questionId/answers/:answerId/:operation', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, ['contributors']),
    mw.parseBody.json,

    function (req, res, next) {
      var spec = _.clone(req.params);
      var promises = [];

      spec.contributor = _.omit(req.user, 'roles');

      var actionPromise;

      switch (spec.operation) {
        case 'upvotes':
        case 'downvotes':
          actionPromise = handleVote('Answer', req.db, spec);
          break;
        case 'comments':
          spec.content = req.body;
          actionPromise = handleComment('Answer', req.db, spec);
          break;
        case 'accept':
          actionPromise = handleAccept(req.db, spec);
          break;
        default:
          throw new errs.unsupportedMethod(req);
      }

      return actionPromise
      .then(getAndRespond.bind(null, req, res, next))
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
