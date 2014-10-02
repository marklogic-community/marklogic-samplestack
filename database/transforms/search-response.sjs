/* transforms search response */

/* given an iterator of ids, get the reputations of these
 * and return a mapping of ids to reputations
 */
function joinReputations(input, ids) {
    xdmp.log(ids);
    var reputationMap = {};
    var results = cts.search(
                    cts.andQuery( [
                      cts.collectionQuery("com.marklogic.samplestack.domain.Contributor"),
                      cts.jsonPropertyValueQuery("id", ids) ]));
    while(true) {
        var nextResult = results.next();
        if (nextResult.done) break;
        var nextObject = nextResult.value;
        xdmp.log(nextObject);
        var ownerId = nextObject.owner.id;
        var ownerReputation = nextObject.owner.reputation;
    } 
    return reputationMap;
}

function searchTransform(context, params, input) {
    var inputObject = input.toObject();
    var reputations = joinReputations(input, input.xpath(".//content/owner/id"))
    var outputObject = {};
    outputObject.results = []
    for (key in inputObject) {
        if (key == "facets") {
            outputObject[key] = inputObject[key];
        }
        else if (key == "results") {
            var results = inputObject.results;
            for (var i=0; i<results.length; i++) {
                var r = {};
                var inComing = results[i].content;
                r.accepted =  inComing.accepted;
                r.creationDate = inComing.creationDate;
                r.voteCount = inComing.voteCount;
                r.snippet = "SNIPPET GOES HERE";
                r.owner = inComing.owner; 
                r.owner.reputation = reputations[r.owner.id]
                if (r.owner.reputation == null) r.owner.reputation = "NO REP";
                r.tags = inComing.tags;
                r.lastActivityDate = inComing.lastActivityDate;
                r.id = inComing.id;
                r.originalId = inComing.originalId;
                r.answerCount = inComing.answers.length;
                r.title = inComing.title;
                outputObject.results.push(r);
            }
        } else {
            outputObject[key] = inputObject[key];
        }
    }
    return outputObject;
};

exports.transform = searchTransform;
