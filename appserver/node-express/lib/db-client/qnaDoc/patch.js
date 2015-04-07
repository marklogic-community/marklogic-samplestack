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

  /**
   * Handles an upvote or downvote for a Samplestack question or answer.
   * Performs three patch operations:
   *   1. Adds the contributor ID to the array of upvoters or
   *      downvoters.
   *   2. Increments the vote count for the question.
   *   3. Increments (for an upvote) or decrements (for a downvote) the
   *      vote tally for the question or answer.
   *
   * @param  {String} txid The transaction ID.
   * @param  {String} docId The document (question or answer) ID.
   * @param  {String} contentPath For an answer vote, an XPath expression
   * for locating the answer. For a question vote, an empty string.
   * @param  {String} contributorId The contributor ID.
   * @param  {Number} voteChange Increment or decrement value.
   * @return {Promise} A promise object.
   */
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

    // @see http://docs.marklogic.com/jsdoc/documents.html#patch
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

  /**
   * Handle a vote for a Samplestack question. Calls votePatch to update the
   * vote information in the MarkLogic database.
   *
   * @param  {String} txid The transaction ID.
   * @param  {Object} contributor Contributor object. Example:
   *   {"id":"cf99542d-f024-4478-a6dc-7e723a51b040",
   *    "displayName":"JoeUser"}
   * @param  {String} questionId The question ID.
   * @param  {Number} voteChange Increment or decrement value.
   * @return {Promise} A promise object.
   */
  var patchQuestionVote = function (txid, contributor, questionId, voteChange) {
    return votePatch(txid, questionId, '', contributor.id, voteChange);
  };

  /**
   * Construct an XPath expression for locating an answer.
   *
   * @param  {String} answerId The answer ID.
   * @return {String} The XPath expression.
   */
  var xpathAnswerSelect = function (answerId) {
    // select the element in the array that has the id property
    // equal to answerId
    return '/answers[text("id")="' + answerId + '"]';
  };

  /**
   * Handle a vote for a Samplestack answer. Constructs an XPath expression
   * for locating the correct answer. Calls votePatch to update the vote
   * information in the MarkLogic database.
   *
   * @param  {String} txid The transaction ID.
   * @param  {Object} contributor Contributor object. Example:
   *   {"id":"cf99542d-f024-4478-a6dc-7e723a51b040",
   *    "displayName":"JoeUser"}
   * @param  {String} questionId The question ID.
   * @param  {String} answerId The answer ID.
   * @param  {Number} voteChange Increment (1) or decrement (-1) value.
   * @return {Promise} A promise object.
   */
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

  /**
   * Handle the post of a new answer to a Samplestack question. The posted
   * answer is merged with an answer template object, a unique ID, contributor
   * information, and the current time. The resulting object is written to the
   * MarkLogic database. During the write, the answer count for the question is
   * incremented and the last activity date is updated.
   *
   * @param  {String} txid The transaction ID.
   * @param  {Object} contributor Contributor object. Example:
   *   {"id":"cf99542d-f024-4478-a6dc-7e723a51b040",
   *    "displayName":"JoeUser"}
   * @param  {String} questionId The question ID.
   * @param  {Object} spec The answer content from the request. Example:
   *   {"comments":[],
   *    "text":"The answer is foo."}
   * @return {Promise} A promise object. When fulfilled, the response for the
   * promise is empty.
   */
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

    // @see http://docs.marklogic.com/jsdoc/documents.html#patch
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
