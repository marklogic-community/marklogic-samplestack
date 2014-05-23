xquery version "1.0-ml";

module namespace json-in = "http://marklogic.com/rest-api/transform/json-in";

(: a tools transform to mock how json will be stored natively via rest 
 : ONLY FOR flat JSON file (doesn't recurse, dirty hack) 
 : to be removed when JSON REST facade is removed 
 :)

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

declare function json-in:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/node()
    let $uri := map:get($params, "uri")
    let $json-doc := map:new( (
                for $n in $root/* 
                return map:entry(local-name($n), data($n))
                ))
    return
        document {
            xdmp:to-json( $json-doc )
        }
};
