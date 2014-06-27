xquery version "1.0-ml";

module namespace related-tags = "http://marklogic.com/rest-api/resource/related-tags.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function related-tags:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    let $tag := map:get($params, "tag")
    let $_ := xdmp:log(("TAG", $tag))
    let $related-tags := sem:sparql(
        "prefix dbr: <http://dbpedia.org/resource/>
        prefix dbc: <http://dbpedia.org/resource/Category:>
        prefix dc: <http://purl.org/dc/terms/>
        prefix dbo: <http://dbpedia.org/ontology/>
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        select distinct ?label2
        where 
        {
           ?r rdfs:label ?label ;
               dc:subject ?sub .
           ?r2 dc:subject ?sub ;
               rdfs:label ?label2 .
           filter (?r != $r2)
           filter (lcase(?label) = $tag)
        }
        order by ?label2
        limit 100", map:new( ( map:entry("tag", $tag) )))
    let $_ := map:put($context,"output-types","text/plain")
    return
    document { 
        $related-tags ! map:get(.,"label2")
    }
};

