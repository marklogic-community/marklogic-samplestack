/* transforms a single question document */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputation(owner) {
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


/* this function requires bulk input */
function searchTransform(context, params, input) {
    var outputObject = input.toObject();
    outputObject.owner = joinReputation(outputObject.owner)
    return outputObject;
};

exports.transform = searchTransform;
