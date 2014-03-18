# this loads RDF from src/test/resources/tmp
# mlcp obviously is a peculiar dependency
~/source/xcc/mlcp/mlcp-Hadoop1-1.3/bin/mlcp.sh IMPORT -username admin -password admin -host localhost -port 8009 -mode local -input_file_type RDF -input_file_path src/test/resources/triples

# this is rdf from dbpedia
~/source/xcc/mlcp/mlcp-Hadoop1-1.3/bin/mlcp.sh IMPORT -username admin -password admin -host localhost -port 8009 -mode local -output_cleandir true -output_directory /dbpedia/ -input_file_type RDF -input_file_path ../sasquatch-data/dbp-tmp

# this is json all stored by curl at src/test/resources/github
# DOESNT WORK WITH MLCP at this time.
~/source/xcc/mlcp/mlcp-Hadoop1-1.3/bin/mlcp.sh IMPORT -username admin -password admin -host cgreer.marklogic.com -port 8009 -mode local -input_file_type JSON -input_file_path src/test/resources/github

for x in * ; do curl -X PUT -Hcontent-type:application/json --user admin:admin --digest -d@"$x" http://localhost:8006/v1/documents?uri=$x >> errors.txt ; done


# etl of dpbedia from destkop just with computing skos.
curl --digest --user admin:admin -d@'src/main/resources/dbpedia-etl.sparql' -Hcontent-type:application/sparql-query -Haccept:text/turtle -X POST http://cgreer.marklogic.com:8003/v1/graphs/sparql 
