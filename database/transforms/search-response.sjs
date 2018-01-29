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
        if (ownerObject.originalId == null) {
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
    var unknownOwner =   {
                        id : "unknown",
                        userName : "unknown",
                        displayName : "unknown",
                        reputation : 0
                        };

    if (outputObject.owner === undefined) {
        outputObject.owner = unknownOwner;
    };
    var ownerNodes = input.xpath(".//owner");
    if (fn.count(ownerNodes) > 0) {
        var joinedOwners = joinReputations(ownerNodes);
        outputObject.owner = joinedOwners[outputObject.owner.id];
        if (outputObject.answers !== undefined) {
            for (var i=0; i < outputObject.answers.length; i++) {
                var answer = outputObject.answers[i];
                answer.owner = joinedOwners[answer.owner.id];
                if (answer.owner === undefined) {
                    answer.owner = unknownOwner;
                }
            }
        }
        if (outputObject.owner === undefined) {
            outputObject.owner = unknownOwner;
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
                var matches = result.matches;
                var uri = result.uri;
                var sourceDoc = cts.doc(uri);
                for (var j = 0; j < matches.length; j++) {
                    var match = matches[j];
                    var source = "";
                    if (match.path.indexOf("answers") > -1) {
                        source = "answer";                
                    }
                    else if (match.path.indexOf("tags") > -1) {
                        source = "tags";
                    }
                    else if (match.path.indexOf('text("text")') > -1) {
                        source = "question";
                    }
                    else if (match.path.indexOf('text("title")') > -1) {
                        source = "question";
                    }
                    else {
                        match = null;
                        continue;
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

                        var answersSource = fn.head(sourceDoc.xpath(answerNodePath));
                        if (answersSource !== undefined) {
                            match.id = answersSource;
                        } else {
                            match.id = "error - unknown";
                        }
                    } else if (source == "question") {
                        var id = sourceDoc.root.id;
                        if (id !== undefined) {
                            match.id = id;
                        }
                    } else {
                        match.id = "";
                    }
                    delete match.path;
                }
            }
            delete outputObject.owner;  // from spurious cleanup action at start of function.  TODO ensure all data have owner object on root.
            return outputObject;
        }
    }
};

exports.transform = searchTransform;
