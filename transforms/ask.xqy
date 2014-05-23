xquery version "1.0-ml";

module namespace ask = "http://marklogic.com/rest-api/transform/ask";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform for questions
 : adds the document IRI as ID.
 : sets a creation timestamp,
 : creates empty comments and answers,
 : (and stores native JSON, working on facade JSON, which will break soon.
 :  refactor to resource extension)
 :)
declare function ask:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/node()
    let $uri := map:get($params, "uri")
    let $json-doc := map:new( (
                for $n in $root/* 
                return 
                map:entry(local-name($n), data($n)),
                map:entry("creationDate", current-dateTime())
                ) )
    return
        document {
            xdmp:to-json( $json-doc )
        }
};
