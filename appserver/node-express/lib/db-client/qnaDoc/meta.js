var baseUri = '/questions/';

module.exports = {
  baseUri: baseUri,
  getUri: function (id) {
    return this.baseUri + id + '.json';
  },
  template: {
    question: {
      accepted:false,
      acceptedAnswerId: null,
      comments:[],
      answers:[],
      answerCount: 0
    },
    answer: {
      // text: ',
      itemTally: 0,
      comments: [],
      // owner: {
      //   id: contributorId,
      //   displayName: contributorDisplayName,
      //   userName: contributorUserName
      // },
      upvotingContributorIds: [],
      downvotingContributorIds: []
    },
    comment: {
      // text: ',
    }
  }
};
