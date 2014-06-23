xquery version "1.0-ml";

module namespace comment-patch = "http://marklogic.com/rest-api/transform/comment-patch";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform 
 : takes a parameter to indicate answer ID to comment on
 : and text of comment.
 : -- this is workaround for no JSON patch --
 :)
declare function comment-patch:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $username := map:get($params, "userName")
    let $post-id := map:get($params, "postId")
    let $text := map:get($params, "text")

    let $parent-qna-doc :=
        cts:search(collection(), 
            cts:and-query(
                (
                cts:directory-query("/questions/"),
                cts:json-property-value-query("id", $post-id)
                )))[1]
    let $user := head(cts:search(collection(), 
        cts:and-query(
            (
            cts:directory-query("/contributors/"),
            cts:json-property-value-query("userName", $username)
            ))))
    let $denormalizedUser :=
        if ($user) then
            object-node 
            { "userName": $user/userName/data(),
                "id": $user/id/data(),
                "displayName": $user/displayName/data()
            }
        else 
            object-node 
            { "userName": "unknown",
                "id": "none",
                "displayName": "nobody"
            }
    let $doc-uri := $parent-qna-doc/base-uri()
    let $to-replace-node := 
        if ($parent-qna-doc/id eq $post-id)
        then $parent-qna-doc/node()
        else $parent-qna-doc//*[id eq $post-id]
    let $replacement := xdmp:from-json($to-replace-node)
    let $comments := map:get($replacement, "comments")
    let $_ := json:array-push($comments,
        object-node {
            "text" : $text,
            "creationDate": current-dateTime(),
            "owner": $denormalizedUser
        })

    let $_ := xdmp:log(("UPDATED", $replacement))
    let $update-doc := xdmp:node-replace($to-replace-node, xdmp:to-json($replacement)/node())

    return
        document {
            object-node { "success" : "true" }
        }
};
