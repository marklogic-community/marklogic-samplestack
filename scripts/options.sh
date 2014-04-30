curl -X PUT -Hcontent-type:application/json -d@'src/main/resources/opts.json' --digest --user admin:admin http://cgreer.marklogic.com:8003/v1/config/query/points

curl  -Haccept:application/json --digest --user admin:admin http://cgreer.marklogic.com:8003/v1/values/points?options=points

