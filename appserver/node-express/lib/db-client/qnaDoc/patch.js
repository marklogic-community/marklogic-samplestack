var mlclient = require('marklogic');
var qb = mlclient.queryBuilder;
var pb = mlclient.patchBuilder;
var meta = require('./meta');
var util = libRequire('db-client/util');
var errs = libRequire('errors');
var moment = require('moment-timezone');
var Promise = require('bluebird');

var qnaDoc = require('./index');

module.exports = function (txid, spec) {
  var self = this;

  var votePatch = function (
    txid, docId, contentPath, contributorId, voteChange
  ) {
    var voteInsert = pb.insert(
      contentPath +
          '/array-node("' +
          (
            voteChange > 0 ?
            'upvotingContributorIds' :
            'downvotingContributorIds'
          ) +
          '")',
      'last-child',
      contributorId
    );

    var voteCountUp = pb.replace('voteCount', pb.add(1));
    var itemTallyChange = pb.replace(
      contentPath + '/itemTally', pb.add(voteChange)
    );

    return self.documents.patch({
      txid: txid,
      uri: meta.getUri(docId),
      operations: [
        voteInsert,
        voteCountUp,
        itemTallyChange
      ]
    }).result()
    .then(meta.responseToSpec);
  };

  var patchQuestionVote = function (txid, contributor, questionId, voteChange) {
    return votePatch(txid, questionId, '', contributor.id, voteChange);
  };

  var xpathAnswerSelect = function (answerId) {
    // select the element in the array that has the id property
    // equal to answerId
    return '/answers[text("id")="' + answerId + '"]';
  };

  var patchAnswerVote = function (
    txid, contributor, questionId, answerId, voteChange
  ) {
    return votePatch(
      txid,
      questionId,
      xpathAnswerSelect(answerId),
      contributor.id,
      voteChange
    );
  };

  var patchQuestionAddAnswer = function (txid, contributor, questionId, spec) {
    var now = moment();
    var answerId = util.uuid();
    var answer = _.merge(
      _.clone(meta.template.answer),
      spec,
      {
        id: answerId,
        owner: contributor,
        creationDate: now,
      }
    );

    return self.documents.patch({
      txid: txid,
      uri: meta.getUri(questionId),
      operations: [
        pb.replace('answerCount', pb.add(1)),
        pb.insert('/array-node("answers")', 'last-child', answer),
        pb.replace('/lastActivityDate', now)
      ]
    }).result()
    .then(meta.responseToSpec);
  };

  var patchQuestionAddComment = function (
    txid, contributor, questionId, spec
  ) {
    var comment = _.merge(
      _.clone(meta.template.comment),
      spec,
      {
        owner: contributor,
        creationDate: moment()
      }
    );

    return self.documents.patch({
      txid: txid,
      uri: meta.getUri(questionId),
      operations: [
        pb.insert('/array-node("comments")', 'last-child', comment)
      ]
    }).result()
    .then(meta.responseToSpec);
  };

  var patchAnswerAddComment = function (
    txid, contributor, questionId, answerId, spec
  ) {
    var comment = _.merge(
      _.clone(meta.template.comment),
      spec,
      {
        owner: contributor,
        creationDate: moment()
      }
    );

    return self.documents.patch({
      txid: txid,
      uri: meta.getUri(questionId),
      operations: [
        pb.insert(
          xpathAnswerSelect(answerId) + '/array-node("comments")',
          'last-child',
          comment
        )
      ]
    }).result()
    .then(meta.responseToSpec);
  };

  var patchAnswerAccept = function (txid, contributor, questionId, answerId) {
    return self.documents.patch(
      {
        txid: txid,
        uri: meta.getUri(questionId),
        operations: [
          pb.replace('/accepted', true),
          pb.replace('/acceptedAnswerId', answerId),
          pb.replace('/lastActivityDate', moment())
        ]
      }
    ).result()
    .then(meta.responseToSpec);
  };

  switch (spec.operation) {
    case 'voteQuestion':
      return patchQuestionVote(
        txid, spec.contributor, spec.questionId, spec.voteChange
      );
    case 'voteAnswer':
      return patchAnswerVote(
        txid, spec.contributor, spec.questionId, spec.answerId, spec.voteChange
      );
    case 'acceptAnswer':
      return patchAnswerAccept(
        txid, spec.contributor, spec.questionId, spec.answerId
      );
    case 'addQuestionComment':
      return patchQuestionAddComment(
        txid, spec.contributor, spec.questionId, spec.content
      );
    case 'addAnswer':
      return patchQuestionAddAnswer(
        txid, spec.contributor, spec.questionId, spec.content
      );
    case 'addAnswerComment':
      return patchAnswerAddComment(
        txid, spec.contributor, spec.questionId, spec.answerId, spec.content
      );
    default:
      Promise.reject(new errs.unsupportedMethod(spec));
  }
};
