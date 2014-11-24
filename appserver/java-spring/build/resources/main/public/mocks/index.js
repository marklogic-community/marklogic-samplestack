define([
  'json!./contributor.json',
  'json!./question.json',
  'json!./searchResponse.json',
  'json!./searchResult.json',
  'json!./ssSearchInstance.json',
  'json!./hasVoted.json'
], function (
  contributor,
  question,
  searchResponse,
  searchResult,
  ssSearchInstance,
  hasVoted
) {
  return {
    searchResult: searchResult,
    searchResponse: searchResponse,
    contributor: contributor,
    ssSearchInstance: ssSearchInstance,
    question: question,
    hasVoted: hasVoted
  };
});
