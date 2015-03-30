var baseUri = 'com.marklogic.samplestack.domain.Contributor/';

module.exports = {
  baseUri: baseUri,
  getUri: function (contributorId) {
    return this.baseUri + contributorId + '.json';
  },
  responseToSpec: function (resp) {
    var docID;
    if (resp && resp.uri) {
      docID = resp.uri.split('/');
      docID = docID[docID.length - 1].replace('.json','');
    }
    else {
      throw new Error({error: 'unexpected respone', response: resp });
    }
    return { id : docID };
  }
};
