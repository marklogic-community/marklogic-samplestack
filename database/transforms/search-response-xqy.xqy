xquery version "1.0-ml";

module namespace search-response-xqy = "http://marklogic.com/rest-api/transform/search-response-xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace search = "http://marklogic.com/appservices/search";

declare function search-response-xqy:join-reputations(
 $ids
) 
{
    let $reputations := map:map()
    let $_ :=
        for $result in cts:search(collection(),
                        cts:and-query((
                              cts:collection-query("com.marklogic.samplestack.domain.Contributor"),
                              cts:json-property-value-query("id", $ids))))
        let $contrib-node := $result/com.marklogic.samplestack.domain.Contributor
        let $id := data($contrib-node/id)
        let $reputation := data($contrib-node/reputation)
        return map:put($reputations, $id, $reputation)
    return $reputations
};

declare function search-response-xqy:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/object-node()
    let $owner-ids := $root//metadata/owner/id/data()
    return 
        if ( count($owner-ids) > 0 )
        then
            let $_ := xdmp:log(("GETTING REPUTATION MAP"))
            let $reputations := search-response-xqy:join-reputations($owner-ids)
            return
            document {
                xdmp:to-json(
                    xdmp:from-json($root)
                    +
                    map:entry("reputations", $reputations)
                )
            }
        else
            document {
                $root
            }
};

