# straight ahead directory search to find just github stuff, language, with facet on type...
curl --user admin:admin --digest -d@'src/main/resources/search1.json' -X POST -Hcontent-type:application/json -H accept:application/json "http://localhost:8006/v1/search?directory=/github/" | python -mjson.tool | less

# without directory, with tranfsorm
curl --user admin:admin --digest -d@'src/main/resources/search1.json' -X POST -Hcontent-type:application/json -H accept:application/json "http://localhost:8006/v1/search?transform=related"

# string search, w transform
curl --user admin:admin --digest -X GET -H accept:application/json "http://localhost:8006/v1/search?transform=related&q=language"  | python -mjson.tool

# post a transform
curl --user admin:admin --digest -d@'src/main/xquery/related-result-transform.xqy' -X PUT -Hcontent-type:application/xquery http://localhost:8006/v1/config/transforms/related

# post extension library for custom constraint
curl --user admin:admin --digest -d@'src/main/xquery/tagged-with.xqy' -X PUT -Hcontent-type:application/xquery http://localhost:8006/v1/ext/tagged-with.xqy

# custom constraint, structured query
curl --user admin:admin --digest -d@'src/main/resources/custom1.json' -X POST -Hcontent-type:application/json -H accept:application/json "http://localhost:8006/v1/search"

# CRUD get a github doc
curl --user admin:admin --digest -X GET -Haccept:application/json http://localhost:8006/v1/documents?uri=/github/1007227863139673301.json | python -mjson.tool

# error format
curl --user admin:admin --digest -d'{"error-format":"xml"}' -X PUT -Hcontent-type:application/json http://localhost:8006/v1/config/properties

things to consider:
facets, co-occurrences on type and lanaguage (what languages are most often forked)

transform results to get related things - 1. search for clojure, find things about clojure in skos.

AHA
if a search results is triple file, do result expansion in result transform...

