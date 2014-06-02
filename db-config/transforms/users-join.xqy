xquery version "1.0-ml";

module namespace users-join = "http://marklogic.com/rest-api/transform/users-join";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(:
 : join in user information to the results
 :)
declare function users-join:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
    let $userids := $content//ownerUserId/data()
    let $userData := 
        cts:search(/, cts:and-query( (cts:directory-query("/contributors/"), cts:element-range-query(xs:QName("Id"), "=", $userids)) ) ) 
    return document {
        $userData
    }
};
