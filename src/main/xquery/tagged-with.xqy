xquery version "1.0-ml";

module namespace tagged-with = "http://marklogic.com/rest-api/ext/tagged-with";

import module namespace sem = "http://marklogic.com/semantics" 
      at "/MarkLogic/semantics.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace search = "http://marklogic.com/appservices/search";

declare function tagged-with:parseQuery(
  $query-elem as element(),
  $options as element(search:options)
) as schema-element(cts:query)
{
    let $_ := xdmp:log($query-elem)  
    let $results := sem:sparql('
        prefix sas: <http://marklogic.com/sasquatch/>
        select ?o where {sas:githubTag1 sas:tagsDoc ?o}')
    let $v := $results ! map:get(., "o")
    return 
        element cts:document-query {
            for $doc-uri in $v
            return
            element cts:uri { text {$doc-uri} }}
};
