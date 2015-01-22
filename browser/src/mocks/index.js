define([
  'json!./contributor.json',
  'json!./question.json',
  'json!./searchResponse.json',
  'json!./searchResult.json',
  'json!./ssSearchInstance.json',
  'json!./tagsResult.json'
], function (
  contributor,
  question,
  searchResponse,
  searchResult,
  ssSearchInstance,
  tagsResult
) {
  return {
    searchResult: searchResult,
    searchResponse: searchResponse,
    contributor: contributor,
    ssSearchInstance: ssSearchInstance,
    question: question,
    tagsResult: tagsResult
  };
});
