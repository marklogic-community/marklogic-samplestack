/* transforms search response */

function searchTransform(context, params, input) {
    var inputObject = input.toObject();
    var outputObject = {};
    outputObject.results = []
    for (key in inputObject) {
        if (key == "facets") {
            outputObject[key] = inputObject[key]
        }
        else if (key == "results") {
            var results = inputObject.results;
            for (var i=0; i<results.length; i++) {
                var r = {}
                var inComing = results[i].content;
                r.accepted =  inComing.accepted;
                r.creationDate = inComing.creationDate;
                r.voteCount = inComing.voteCount;
                r.snippet = "SNIPPET GOES HERE";
                r.owner = inComing.owner; 
                if (r.owner == undefined) { r.owner = {} };
                r.owner.reputation = "1000REPUTATION";
                r.tags = inComing.tags;
                r.lastActivityDate = inComing.lastActivityDate;
                r.id = inComing.id;
                r.originalId = inComing.originalId;
                r.answerCount = inComing.answers.length;
                r.title = inComing.title;
                outputObject.results.push(r);
            }
        }
    }
    return outputObject;
};

exports.transform = searchTransform;
