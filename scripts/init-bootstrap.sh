from start
sudo rpm -i MarkLogic-8.0-20140303.x86_64.rpm 
sudo /etc/init.d/MarkLogic start


curl --anyauth -Hcontent-type:application/json -d'{}' -X POST http://localhost:8001/admin/v1/init
curl --anyauth -Haccept:application/json http://localhost:8001/admin/v1/timestamp
curl --anyauth -Hcontent-type:application/json -d'{ "admin-username" : "admin", "admin-password" : "admin", "realm" : "public" }' -X POST http://localhost:8001/admin/v1/instance-admin 
curl --anyauth -user admin:admin -Haccept:application/json http://localhost:8001/admin/v1/timestamp
curl --anyauth --user admin:admin -Hcontent-type:application/json -d'{"rest-api":{ "name" : "boo", "port" : 8006} }' -X POST http://localhost:8002/v1/rest-apis
curl --anyauth --user admin:admin -X DELETE http://localhost:8002/v1/rest-apis/boo
