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

/* transforms a single question document */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputation(owner) {
    if (owner == undefined) {
        return { "id":"unknown", 
             "displayName":"unknown", 
             "userName":"unknown",
             "reputation":0
           };
    }
    var results = cts.search(
                    cts.andQuery( [
                      cts.collectionQuery("com.marklogic.samplestack.domain.Contributor"),
                      cts.jsonPropertyValueQuery("id", owner.id) ]));
    for (var result of results) {
        var nextObject = result.toObject();
        var ownerObject = nextObject["com.marklogic.samplestack.domain.Contributor"]
        var reputation = ownerObject.reputation;
    } 
    if (reputation == null) {
        owner.reputation = 0;
    } else {
        owner.reputation = reputation;
    }
    return owner;
}

function adjustVotes(voterId, votingArray) {
    if (votingArray.indexOf(voterId) == -1) {
        votingArray = [ ];
    } else {
        votingArray = [ voterId ];
    }
    return votingArray;
}

/* this will be non-performant but we can optimize */
function searchTransform(context, params, input) {
    var voterId = params.voterId;
    var outputObject = input.toObject();
    var comments = outputObject.comments;
    if (voterId !== undefined) {
        outputObject.upvotingContributorIds = adjustVotes(voterId, outputObject.upvotingContributorIds);
        outputObject.downvotingContributorIds = adjustVotes(voterId, outputObject.downvotingContributorIds);
    }
    for (var i = 0; i < comments.length; i++) {
        comments[i].owner = joinReputation(comments[i].owner);
    }
    
    var answers = outputObject.answers;
    for (var i = 0; i < answers.length; i++) {
        if (voterId !== undefined) {
            answers[i].upvotingContributorIds = adjustVotes(voterId, answers[i].upvotingContributorIds);
            answers[i].downvotingContributorIds = adjustVotes(voterId, answers[i].downvotingContributorIds);
        }
        answers[i].owner = joinReputation(answers[i].owner);
        var answerComments = answers[i].comments;
        for (var j = 0; j < answerComments.length; j++) {
            answerComments[j].owner = joinReputation(answerComments[j].owner);
        }
    }
    outputObject.owner = joinReputation(outputObject.owner)
    return outputObject;
};

exports.transform = searchTransform;
