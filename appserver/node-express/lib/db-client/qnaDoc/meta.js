/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
      downvotingContributorIds: [],
      // seems to be unused but its absence is triggering error in java
      // code
      voteCount: 0
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
