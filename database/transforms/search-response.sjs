/* transforms search response */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputations(ownerNodes) {
    var ids = [];
    var returnMap = {}
    for (var owner of ownerNodes) {
        ids.push(owner.toObject().id);
    }
    var results = cts.search(
                    cts.andQuery( [
                      cts.collectionQuery("com.marklogic.samplestack.domain.Contributor"),
                      cts.jsonPropertyValueQuery("id", ids) ]));
    for (var result of results) {
        var returnObject = {};
        var nextObject = result.toObject();
        var ownerObject = nextObject["com.marklogic.samplestack.domain.Contributor"]
        if (ownerObject.id == null) {
            returnObject.id = "N/A";
        } else {
            returnObject.id = ownerObject.id;
        }
        if (ownerObject.reputation == null) {
            returnObject.reputation = 0;
        } else {
            returnObject.reputation = ownerObject.reputation;
        }
        if (ownerObject.originalId === undefined) {
            // pass
        } else {
            returnObject.originalId = ownerObject.originalId;
        }
        returnObject.userName = ownerObject.userName;
        returnObject.displayName =  ownerObject.displayName;
        returnMap[ownerObject.id] = returnObject;
    } 
    return returnMap;
}

/* this function requires bulk input */
function searchTransform(context, params, input) {
    var outputObject = input.toObject();
    var ownerNodes = input.xpath(".//owner");
    if (ownerNodes.count > 0) {
        var joinedOwners = joinReputations(ownerNodes);
        if (outputObject.owner !== undefined) {
            outputObject.owner = joinedOwners[outputObject.owner.id];
        }
        else {
            // null user
            outputObject.owner = {
                nullowner : "true"
            };
        }
        if (outputObject.answers !== undefined) {
            for (var i=0; i < outputObject.answers.length; i++) {
                var answer = outputObject.answers[i];
                if (answer.owner !== undefined) {
                    answer.owner = joinedOwners[answer.owner.id];
                }
            }
        }
        return outputObject;
    } else {
        /* search response here */
        var results = outputObject.results;
        if (results === undefined) {
            return outputObject;
        } else {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var matches = result.matches; // HEAD will need snippets here
                var uri = result.uri;
                var sourceDoc = fn.doc(uri).next().value;
                for (var j = 0; j < matches.length; j++) {
                    var match = matches[j];
                    var source = "question";
                    if (match.path.indexOf("answers") > -1) {
                        source = "answer";                
                    }
                    else if (match.path.indexOf("tags") > -1) {
                        source = "tags";
                    }
                    match.source = source;
                    if (source == "answer") {
                        var left = "array-node(\"answers\")/object-node()[";
                        var leftIndex = match.path.indexOf(left);
                        var right = match.path.substr(leftIndex);
                        var answerIndex = right.substring(left.length, right.indexOf("]"));
                        if (!answerIndex.length || leftIndex == -1) {
                            answerIndex = "1";
                        }
                        var answerNodePath = "/array-node(\"answers\")/object-node()[" + answerIndex + "]/id";

                        var answersSource = sourceDoc.xpath(answerNodePath).next().value;
                        if (answersSource !== undefined) {
                            match.id = answersSource;
                        } else {
                            match.id = "error - unknown";
                        }
                    } else {
                        var root = sourceDoc.toObject();
                        if (root.id !== undefined) {
                            match.id = root.id;
                        }
                    }
                    delete match.path;
                }
            }
            return outputObject;
        }
    }
};

exports.transform = searchTransform;
