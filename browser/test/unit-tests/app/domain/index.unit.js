define([
  './ssSearch.unit',
  './ssSession.unit',
  './ssQnaDoc.unit',
  './ssAnswer.unit',
  './ssComment.unit'
], function (
  ssSearch,
  ssSession,
  ssQnaDoc,
  ssAnswer,
  ssComment

) {

  return function () {

    describe('domain', function () {
      ssSearch();
      ssSession();
      ssQnaDoc();
      ssAnswer();
      ssComment();
    });

  };
});
