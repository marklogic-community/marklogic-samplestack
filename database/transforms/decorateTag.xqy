xquery version "1.0-ml";

module namespace decorateTag = "http://marklogic.com/rest-api/transform/decorateTag";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(:
 : a transform that adds a triple to a document structure
 : (XML), experiemental
 :)
declare function decorateTag:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/node()
    let $doc-uri := map:get($params, "uri")
    let $subject := sem:iri($doc-uri)
    let $predicate := sem:iri("http://purl.org/dc/terms/about")
    let $object := sem:iri("concept")
    return document {
        element { node-name ($root) } {
            $root/*,
            element sem:triple {
                element sem:subject { $subject },
                element sem:predicate { $predicate },
                element sem:object { $object }
            }
        }
    }
};
