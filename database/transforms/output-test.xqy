xquery version "1.0-ml";

module namespace output-test = "http://marklogic.com/rest-api/transform/output-test";


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
declare function output-test:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $_ := xdmp:log($content)  
    let $root := $content/node()
    return
        document {
            $root
        }
};
