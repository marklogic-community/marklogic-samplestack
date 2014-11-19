/* transforms search response */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputations(ids) {
    var results = cts.search(
                    cts.andQuery( [
                      cts.collectionQuery("com.marklogic.samplestack.domain.Contributor"),
                      cts.jsonPropertyValueQuery("id", ids) ]));
    var returnObject = {};
    for (var result of results) {
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
        returnObject.originalId = ownerObject.originalId;
        returnObject.userName = ownerObject.userName;
        returnObject.displayName =  ownerObject.displayName;
    } 
    return returnObject;
}

/* this function requires bulk input */
function searchTransform(context, params, input) {
    var outputObject = input.toObject();
    var ownerIds = input.xpath("./owner/id");
    xdmp.log("OWNERIDS" + ownerIds);
    if (ownerIds.count > 0) {
        var joinedOwner = joinReputations(ownerIds);
        if (joinedOwner.id == undefined) {
            return outputObject;
        }
        else {
            outputObject.owner = joinedOwner;
            return outputObject;
        }
    } else {
        /* search response here */
        var results = outputObject.results;
        for (var i = 0; i < results.length; i++) {
           var result = results[i];
            var matches = result.matches;
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
                    match.id = "answerid";
                } else {
                    match.id = fn.doc(match.uri).root.id
                }
                match.path = null;
            }
        }
        return outputObject;
    }
};

exports.transform = searchTransform;
