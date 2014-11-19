xquery version "1.0-ml";

module namespace search-response-xqy = "http://marklogic.com/rest-api/transform/search-response-xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace search = "http://marklogic.com/appservices/search";
			 
(: 
 : in search responses, this transform transforms this marklogic-centric path
 : in snippets
    "path": "fn:doc(\"/questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json\")/object-node()/array-node(\"tags\")/text()[2]"
 : to
 : "id" : id of the target
 : "source" : "question"|"answer"  depending on where the results came from.
 : for documents, it invokes a join to get reputations
 :)
declare function search-response-xqy:join-reputations(
 $ids
) as map:map*
{
    for $result in cts:search(collection(),
                    cts:and-query((
                          cts:collection-query("com.marklogic.samplestack.domain.Contributor"),
                          cts:json-property-value-query("id", $ids))))
    let $contrib-node := $result/com.marklogic.samplestack.domain.Contributor
    return
        map:new( 
            ( map:entry("id", $contrib-node/id), 
            map:entry("originalId", $contrib-node/originalId),
            map:entry("reputation", $contrib-node/reputation),
            map:entry("userName", $contrib-node/userName),
            map:entry("displayName",  $contrib-node/displayName) ) )
};

declare function search-response-xqy:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/object-node()
    let $object := xdmp:from-json($root)
    (: this will come from documents, not search envelope :)
    let $owner-ids := $root/owner/id/data()
    return 
        if ( count($owner-ids) > 0 )
        then
            let $owner-with-reputation := search-response-xqy:join-reputations($owner-ids)
            let $_ := if (exists($owner-with-reputation))
                      then map:put($object, "owner", $owner-with-reputation)
                      else map:put($object, "owner", 
                      map:new((
                          map:entry("id", ($root/owner/id, "N/A")[1] ), 
                          map:entry("originalId", $root/owner/originalId ),
                          map:entry("reputation", ($root/owner/reputation, 0)[1] ),
                          map:entry("userName", ($root/owner/userName, "N/A")[1] ),
                          map:entry("displayName", ($root/owner/displayName, "N/A")[1] ) 
                          )))
            return
                document {
                    xdmp:to-json( $object )
                }
        else
            (: this is a search response wrapper, in json presumbaly :)
            let $results := map:get($object, "results")
            let $_ := 
                for $result at $i in json:array-values($results)
                let $matches := map:get($result, "matches")
                let $uri := map:get($result, "uri")
                return
                    for $match at $j  in json:array-values($matches)
                    let $path := map:get($match, "path")
                    let $node := xdmp:unpath($path)
                    let $is-answer := contains($path, "answers")
                    let $source := 
                        if ($is-answer) 
                        then "answer"
                        else if (contains($path, "tags"))
                        then "tags"
                        else "question"
                    let $answer-index := 
                        if ($is-answer) then
                            substring-before(
                                 substring-after($path, 'answers")/object-node()['),
                                 "]")
                        else ()
                    let $answer-index :=
                        if ($is-answer)
                        then 
                            if ($answer-index castable as xs:int)
                            then xs:int($answer-index)
                            else 1
                        else ()
                    let $id := 
                        if ($is-answer)
                        then doc($uri)/array-node('answers')/object-node()[$answer-index]/id
                        else doc($uri)/id
                    return 
                        json:set-item-at($matches, $j, 
                            map:new( (
                                $match, 
                                map:entry("source", $source),
                                map:entry("id", $id)
                            )))
            return
                document {
                    xdmp:to-json($object)
                }
};

