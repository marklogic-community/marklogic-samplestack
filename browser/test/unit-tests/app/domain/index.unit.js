define([
  './ssSearch.unit',
  './ssSession.unit',
  './ssQnaDoc.unit',
  './ssAnswer.unit',
  './ssComment.unit',
  './ssTagsSearch.unit'
], function (
  ssSearch,
  ssSession,
  ssQnaDoc,
  ssAnswer,
  ssComment,
  ssTagsSearch
) {

  return function () {

    describe('domain', function () {
      ssSearch();
      ssSession();
      ssQnaDoc();
      ssAnswer();
      ssComment();
      ssTagsSearch();
    });
  };
});
