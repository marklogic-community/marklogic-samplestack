xquery version "1.0-ml";

module namespace related = "http://marklogic.com/rest-api/transform/related";

import module namespace sem = "http://marklogic.com/semantics" 
      at "/MarkLogic/semantics.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace search = "http://marklogic.com/appservices/search";

declare function related:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $_ := xdmp:log($content)  
    let $root := $content/node()
    let $qtext := $root/search:qtext
    let $results := json:object()
    let $vars := json:array()
    let $_ := json:array-push($vars, "o")
    let $_ := json:array-push($vars, "p")
    let $_ := json:array-push($vars, "s")
    let $bindings := json:array()
    let $_ := map:put($results, "head", map:new(map:entry("vars", $vars)))
    let $_ :=
            for $result in $root//search:result
            for $match in $result//search:match
            let $path := $match/@path/data()
            let $text := $match/string()
            return
                if (contains($path, "sem:subject"))
                then
                    let $q-results := sem:sparql('select ?s ?p ?o where {?s ?p ?o. filter (?s = $text)}', map:new(map:entry("text", sem:iri($text))))
                    return
                        json:array-push($bindings,
                            map:get(
                                map:get(sem:query-results-serialize($q-results, "json"), "results"), "bindings"))

                else ()
    let $_ := map:put($results, "results", $bindings)
    return document {
        $results
    }
};
