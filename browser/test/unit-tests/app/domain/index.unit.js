define([
  './ssSearch.unit',
  './ssSession.unit',
  './ssQnaDoc.unit',
  './ssAnswer.unit',
  './ssComment.unit',
  './ssHasVoted.unit'
], function (
  ssSearch,
  ssSession,
  ssQnaDoc,
  ssAnswer,
  ssComment,
  ssHasVoted
) {

  return function () {

    describe('domain', function () {
      ssSearch();
      ssSession();
      ssQnaDoc();
      ssAnswer();
      ssComment();
      ssHasVoted();
    });

  };
});
