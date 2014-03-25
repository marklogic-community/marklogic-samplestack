# get appserver config
curl -Haccept:application/json --digest -u admin:admin "http://localhost:8002/manage/v2/servers/sasquatch?group-id=Default&view=package"

# gt db config
# curl -o boo.json -Haccept:application/json --digest -u admin:admin http://localhost:8002/manage/v2/databases/boo?view=package

#cleanup- teardown package
curl --digest -u admin:admin -X DELETE http://localhost:8002/manage/v2/packages/sasquatch
curl --digest -u admin:admin -X DELETE http://localhost:8002/manage/v2/packages/xdbc

# make named package from that db config
curl --digest -u admin:admin -X POST -d@'src/main/resources/app-package.json' -Haccept:application/json -Hcontent-type:application/json http://localhost:8002/manage/v2/packages?pkgname=sasquatch
curl --digest -u admin:admin -X POST -d@'src/main/resources/xdbc-package.json' -Hcontent-type:application/json http://localhost:8002/manage/v2/packages?pkgname=xdbc

curl --digest -u admin:admin --data-binary @/dev/null -Hcontent-type:application/json -X POST http://localhost:8002/manage/v2/packages/sasquatch/install
curl --digest -u admin:admin --data-binary @/dev/null -Hcontent-type:application/json -X POST http://localhost:8002/manage/v2/packages/xdbc/install


# this gets me a path for database configuration.  Is it appropriate to use REST bootstrap and then packages?

