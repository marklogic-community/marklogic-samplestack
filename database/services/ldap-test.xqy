xquery version "1.0-ml";

module namespace ldap-test = "http://marklogic.com/rest-api/resource/ldap-test.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function ldap-test:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    let $search := xdmp:ldap-search(
  "(objectclass=*)",
   <options xmlns="xdmp:ldap">
  <username>samplestack-contributor</username>
  <password>sc-pass</password>
  <search-base>dc=samplestack,dc=org</search-base>
  <server-uri>ldap://cgreer-laptop:53389</server-uri>
 </options>)
    return
        (
        map:put($context,"output-types","application/xml"),
        document { $search }
        )
};

