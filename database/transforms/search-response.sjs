/* transforms search response */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputations(ids) {
    var reputationMap = {};
    var results = cts.search(
                    cts.andQuery( [
                      cts.collectionQuery("com.marklogic.samplestack.domain.Contributor"),
                      cts.jsonPropertyValueQuery("id", ids) ]));
    for (var result of results) {
        var nextObject = result.toObject();
        var ownerObject = nextObject["com.marklogic.samplestack.domain.Contributor"]
        var ownerId = ownerObject.id;
        var ownerReputation = ownerObject.reputation;
        reputationMap[ownerId] = ownerReputation;
    } 
    return reputationMap;
}

/* this function requires bulk input */
function searchTransform(context, params, input) {
    var outputObject = input.toObject();
    var ownerIds = input.xpath(".//metadata/owner/id")
    if (ownerIds.count > 0) {
        xdmp.log("Getting reputation map");
        var reputations = joinReputations(ownerIds);
        outputObject.reputations = reputations;
        return outputObject;
    } else {
        /* don't transform document objects */
        xdmp.log("Object Transform");
        return input
    }
};

exports.transform = searchTransform;
