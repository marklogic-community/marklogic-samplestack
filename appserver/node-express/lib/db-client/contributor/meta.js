var baseUri = 'com.marklogic.samplestack.domain.Contributor/';

module.exports = {
  baseUri: baseUri,
  getUri: function (contributorId) {
    return this.baseUri + contributorId + '.json';
  }
};
