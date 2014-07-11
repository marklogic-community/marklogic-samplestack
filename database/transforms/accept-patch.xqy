xquery version "1.0-ml";

module namespace accept-patch = "http://marklogic.com/rest-api/transform/accept-patch";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform 
 : takes a parameter to indicate answer ID to accept
 : for a particular document.
 : it sets acceptedAnswerId and also puts an accepted:true on the accepted answer
 : -- this is workaround for no JSON patch --
 :)
declare function accept-patch:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $_ := xdmp:log(("CONTENT", $content))
    let $answer-id := map:get($params, "answerId")

    let $parent-qna-doc :=
        cts:search(collection(), 
            cts:and-query(
                (
                cts:directory-query("/questions/"),
                cts:json-property-value-query("id", $answer-id)
                )))[1]
    let $doc-uri := $parent-qna-doc/base-uri()
    let $doc-update := xdmp:from-json($parent-qna-doc)

    let $answers := map:get($doc-update, "answers")
    let $update-answers := for $answer in json:array-values($answers)
                           return 
                               if ( map:get($answer, "id") eq $answer-id)
                               then map:put($answer, "accepted", true())
                               else map:delete($answer, "accepted")
    let $update-answers := map:put($doc-update, "answers", $answers)
    let $update-top := map:put($doc-update, "acceptedAnswerId", $answer-id)

    let $_ := xdmp:log(("UPDATED", $doc-update))
    let $update-doc := xdmp:document-insert($doc-uri, document {xdmp:to-json($doc-update)})
    let $add-permissions := xdmp:document-add-permissions($doc-uri, xdmp:permission("samplestack-guest", "read"))

    return
        document {
            object-node { "success" : "true" }
        }
};
