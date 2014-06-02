xquery version "1.0-ml";

module namespace test-ext = "http://marklogic.com/rest-api/resource/test-ext.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

declare function test-ext:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
    map:put($context,"output-types","application/json"),
    document { object-node {"test" : "You did a GET" } }
};

declare function test-ext:post(
    $context as map:map,
    $params  as map:map,
    $input as document-node()*
) as document-node()*
{
    map:put($context,"output-types","application/json"),
    document { object-node {"test" : "You did a POST" } }
};
