define([
  'json!./searchResult.json',
  'json!./searchResponse.json',
  'json!./contributor.json',
  'json!./searchObj.json',
  'json!./question.json'
], function (
  searchResult,
  searchResponse,
  contributor,
  searchObj,
  question
) {
  return {
    searchResult: searchResult,
    searchResponse: searchResponse,
    contributor: contributor,
    searchObj: searchObj,
    question: question
  };
});
