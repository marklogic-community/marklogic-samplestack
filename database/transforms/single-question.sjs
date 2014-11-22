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


/* this will be non-performant but we can optimize */
function searchTransform(context, params, input) {
    var outputObject = input.toObject();
    var comments = outputObject.comments;
    for (var i = 0; i < comments.length; i++) {
        comments[i].owner = joinReputation(comments[i].owner);
    }
    
    var answers = outputObject.answers;
    for (var i = 0; i < answers.length; i++) {
        answers[i].owner = joinReputation(answers[i].owner);
        for (var j = 0; j < comments.length; j++) {
            comments[j].owner = joinReputation(comments[j].owner);
        }
    }
    outputObject.owner = joinReputation(outputObject.owner)
    return outputObject;
};

exports.transform = searchTransform;
