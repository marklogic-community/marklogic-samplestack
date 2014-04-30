# lines are commented except those required to bootstrap
# with sh
# from start
# sudo rpm -i MarkLogic-8.0-20140303.x86_64.rpm 
# sudo /etc/init.d/MarkLogic start

curl --anyauth -Hcontent-type:application/json -d'{}' -X POST http://localhost:8001/admin/v1/init

# curl --anyauth -Haccept:application/json http://localhost:8001/admin/v1/timestamp

sleep 6
curl --anyauth -Hcontent-type:application/json -d'{ "admin-username" : "admin", "admin-password" : "admin", "realm" : "public" }' -X POST http://localhost:8001/admin/v1/instance-admin 


# curl --anyauth --user admin:admin -Haccept:application/json http://localhost:8001/admin/v1/timestamp

sleep 6
curl --anyauth --user admin:admin -Hcontent-type:application/json -d'{"rest-api":{ "name" : "boo", "port" : 8006} }' -X POST http://localhost:8002/v1/rest-apis

# curl --anyauth --user admin:admin -X DELETE http://localhost:8002/v1/rest-apis/boo

curl --anyauth --user admin:admin -i -X POST -Hcontent-type:application/json -d'{ "name": "restwriter", "password": "restwriter" }' http://localhost:8002/manage/v2/users
#shouldnt need this:
curl --anyauth --user admin:admin -i -X POST -Hcontent-type:application/json -d'{ "name": "restwriter", "password": "restwriter", "description":"description", "roles": [{"role":"rest-writer"}]}' http://localhost:8002/manage/v2/users
# rather this matches the spec
curl --anyauth --user admin:admin -i -X POST -Hcontent-type:application/json -d'{ "name": "restwriter", "password": "restwriter", "description":"description", "roles": [{"role":"rest-writer"}]}' http://localhost:8002/manage/v2/users
curl --anyauth --user admin:admin -i -X DELETE -Haccept:application/json http://localhost:8002/manage/v2/users/restwriter
curl --anyauth --user admin:admin  -X GET -Haccept:application/json http://localhost:8002/manage/v2/users/restwriter | python -mjson.tool

