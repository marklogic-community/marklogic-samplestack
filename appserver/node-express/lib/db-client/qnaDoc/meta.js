var baseUri = '/questions/';

module.exports = {
  baseUri: baseUri,
  getUri: function (id) {
    return this.baseUri + id + '.json';
  },
  responseToSpec: function (resp) {
    var docID;
    if (resp.documents) {
      if (resp.documents.length > 1) {
        throw { error: 'multiple documents not yet supported' };
      }
      else {
        resp.uri = resp.documents[0].uri;
      }
    }

    if (resp && resp.uri) {
      docID = resp.uri.split('/');
      docID = docID[docID.length - 1].replace('.json','');
    }
    else {
      throw {error: 'unexpected respone', response: resp };
    }
    return { id : docID };
  },

  template: {
    question: {
      accepted:false,
      acceptedAnswerId: null,
      comments:[],
      answers:[],
      answerCount: 0,
      itemTally: 0,
      upvotingContributorIds: [],
      downvotingContributorIds: []
    },
    answer: {
      itemTally: 0,
      comments: [],
      upvotingContributorIds: [],
      downvotingContributorIds: []
    },
    comment: {
    }
  }
};
