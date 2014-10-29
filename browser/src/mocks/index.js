define([
  'json!./contributor.json',
  'json!./question.json',
  'json!./searchResponse.json',
  'json!./searchResult.json',
  'json!./ssSearchInstance.json',
  'json!./hasVotes.json'
], function (
  contributor,
  question,
  searchResponse,
  searchResult,
  ssSearchInstance,
  hasVotes
) {
  return {
    searchResult: searchResult,
    searchResponse: searchResponse,
    contributor: contributor,
    ssSearchInstance: ssSearchInstance,
    question: question,
    hasVotes: hasVotes
  };
});
