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
    let $root := $content/object-node()
    let $_ := xdmp:log(("ROOT", $root))
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
    let $dt := current-dateTime()
    let $dt2 := current-dateTime()
    let $json-doc :=
                $root +
                object-node { 
                    "creationDate" : $dt,
                    "comments": array-node { }, 
                    "answers": array-node { }, 
                    "owner": object-node 
                    { "userName": $user/userName/data(),
                        "id": $user/id/data(),
                        "displayName": $user/displayName/data()
                    },
                    "lastActivityDate" : null-node { }
                }
                
    return
        document {
            $json-doc 
        }
};
