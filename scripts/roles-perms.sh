# put doc as anon should fail
curl --anyauth --user samplestack-anonymous:sa-passs -X PUT -d'{"test":true}' -Hcontent-type:applcation/json http://localhost:8006/v1/documents?uri=nope.json

#right pass here
curl --anyauth --user samplestack-anonymous:sa-pass -X PUT -d'{"test":true}' -Hcontent-type:applcation/json http://localhost:8006/v1/documents?uri=nope.json


#enter w default perms
curl --anyauth --user samplestack-contributor:sc-pass -X PUT -d'{"test":true}' -Hcontent-type:applcation/json http://localhost:8006/v1/documents?uri=cansee.json

#enter w restricted perms
curl --anyauth --user samplestack-contributor:sc-pass -X PUT -d'{"test":true}' -Hcontent-type:applcation/json "http://localhost:8006/v1/documents?uri=nope.json"


curl --anyauth --user samplestack-contributor:sc-pass -X GET "http://localhost:8006/v1/documents?uri=nope.json&category=metadata"
curl --anyauth --user samplestack-contributor:sc-pass -X DELETE "http://localhost:8006/v1/documents?uri=nope.json"
curl --anyauth --user samplestack-anonymous:sa-pass -X GET http://localhost:8006/v1/documents?uri=nope.json




