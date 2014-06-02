xquery version "1.0-ml";

module namespace identity = "http://marklogic.com/rest-api/transform/identity";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace search = "http://marklogic.com/appservices/search";

(: this input transform does nothing to the input.
 : It should not survive EA-2, as it's a workaround for
 : JSON facade configuration
 : if you use this transform, you'll be using the ML7 style JSON facade.
 :)
declare function identity:transform(
  $context as map:map,
  $params as map:map,
  $content as document-node())
as document-node() {
  $content
};
