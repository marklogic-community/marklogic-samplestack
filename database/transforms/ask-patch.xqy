xquery version "1.0-ml";

module namespace answer-patch = "http://marklogic.com/rest-api/transform/answer-patch";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform 
 : takes an answer JSON
 : and appends it to an existing JSON document
 : adds the document IRI as ID.
 :)
declare function answer-patch:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $root := $content/object-node()
    let $_ := xdmp:log(("ROOT", $root))
    let $uri := map:get($params, "uri")
    let $existing-doc := xdmp:from-json(doc($uri))
    let $username := map:get($params, "userName")

    (: get the user that matches parameter :)
    (: this transform gets the first match.  If there are duplicates in userName
     : then the answer will be non-deterministic
     : TODO should that be an error?
     :)
    let $user := cts:search(collection(), 
        cts:and-query(
            (
            cts:directory-query("/contributors/"),
            cts:json-property-value-query("userName", $username)
            )))[1]
    let $_ := xdmp:log(("USER", $user))

    let $answers := map:get($existing-doc, "answers")
    let $p := json:array-push($answers, $root/text)

    return
        document {
            $existing-doc
        }
};
