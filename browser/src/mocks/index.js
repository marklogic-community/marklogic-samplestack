define([
  'json!./searchResult1.json',
  'json!./contributor.json'
], function (
  searchResult,
  contributor
) {
  return {
    searchResult: searchResult,
    contributor: contributor

  };
});
