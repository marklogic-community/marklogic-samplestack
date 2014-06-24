xquery version "1.0-ml";

module namespace vote-patch = "http://marklogic.com/rest-api/transform/vote-patch";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform 
 : takes a parameter to indicate post ID to vote
 : and another for the amount to incremenet/decrement score
 : -- this is workaround for no JSON patch, or for JavaScript resource maybe --
 :)
declare function vote-patch:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $post-id := map:get($params, "postId")
    let $delta := map:get($params, "delta")
    let $delta-value := xs:int($delta)

    let $parent-qna-doc :=
        cts:search(collection(), 
            cts:and-query(
                (
                cts:directory-query("/questions/"),
                cts:json-property-value-query("id", $post-id)
                )))[1]
    let $doc-uri := $parent-qna-doc/base-uri()

    let $question-node :=  $parent-qna-doc/node()
    let $question-replacement := xdmp:from-json($question-node)
    let $doc-score := $question-node/docScore
    let $new-score := $doc-score + $delta-value

    let $_ := if ($parent-qna-doc/id eq $post-id)
    then
        let $to-vote-on-node := $parent-qna-doc/node()
        let $tally-update := xdmp:from-json($to-vote-on-node)
        let $item-tally := map:get($tally-update, "itemTally")
        let $new-tally := $item-tally + $delta-value
        return
            (map:put($question-replacement, "itemTally", $new-tally),
              map:put($question-replacement, "docScore", $new-score))
    else
        let $to-vote-on-node := $parent-qna-doc//*[id eq $post-id]
        let $tally-update := xdmp:from-json($to-vote-on-node)
        let $item-tally := map:get($tally-update, "itemTally")
        let $new-tally := $item-tally + $delta-value
        let $answers := map:get($question-replacement, "answers")
        let $new-answers := array-node {
            for $n in json:array-values($answers)
            return 
                if (map:get($n, "id") eq $post-id)
                then map:new((
                    for $k in map:keys($n)
                    where $k ne "itemTally"
                    return map:entry($k, map:get($n, $k))
                    ,
                    map:entry("itemTally", $new-tally)))
                else $n
        }
        return (map:put($question-replacement, "docScore", $new-score),
            map:put($question-replacement, "answers", $new-answers))
    
    let $update-doc := xdmp:node-replace($question-node, xdmp:to-json($question-replacement)/node())

    return
        document {
            object-node { "success" : "true" }
        }
};
