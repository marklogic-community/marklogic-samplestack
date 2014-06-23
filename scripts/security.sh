ldapsearch -h localhost -p 33389 -b"ou=apps,dc=samplestack,dc=org" "(&(cn=samplestack-contributor)(objectClass=applications))" -D "uid=samplestack-contributor,ou=apps,dc=samplestack,dc=org" -w sc-pass
ldapsearch -h localhost -p 33389 -b"ou=apps,dc=samplestack,dc=org" "(&(cn=samplestack-contributor)(objectClass=applications))" -D "uid=samplestack-contributor,ou=apps,dc=samplestack,dc=org" -w sc-pass



# SASL
# this works, but no results
ldapsearch -H"ldap://cgreer-laptop:53389" -b"ou=apps,dc=samplestack,dc=org" "(objectClass=*)" -U samplestack-contributor -Y DIGEST-MD5 -R samplestack -w sc-pass

#this search works, finds everything using simple
ldapsearch -H"ldap://cgreer-laptop:53389" -b"ou=apps,dc=samplestack,dc=org" "(objectClass=*)" -D "uid=samplestack-contributor,ou=apps,dc=samplestack,dc=org" -w sc-pass 



ldapsearch -h localhost -p 53389 -b"dc=samplestack,dc=org" "(&(cn=samplestack-contributor)(objectClass=person))" -D "uid=samplestack-contributor,ou=apps,dc=samplestack,dc=org" -w sc-pass



curl --anyauth --user admin:admin -X POST -i -Hcontent-type:application/json -d@database/security/users/rest-admin.json http://localhost:8002/manage/v2/users

curl --anyauth --user admin:admin -X GET -i -Haccept:application/xml http://localhost:8002/manage/v2/roles/samplestack-unrestricted

curl --anyauth --user admin:admin -X GET -Haccept:application/json "http://localhost:8002/manage/v2/privileges/rest-reader?database=Security&kind=execute" | python -mjson.tool

curl --anyauth --user admin:admin -i -X PUT -Hcontent-type:application/json -d@'database/security/privileges/rest-reader.json' "http://localhost:8002/manage/v2/privileges/rest-reader/properties?database=Security&kind=execute"
curl --anyauth --user admin:admin -i -X GET -Haccept:application/json "http://localhost:8002/manage/v2/privileges/rest-reader/properties?database=Security&kind=execute"


