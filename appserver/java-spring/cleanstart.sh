echo "Enter <username:password> (e.g. ssalsbur:notMyPassword) for wiki.marklogic.com:"
read -s creds
rm -rf ../../database/seed-data
curl -k -L -u $creds -o seed.tgz https://wiki.marklogic.com/download/attachments/31359376/seed-data1.3.tgz?api=v2 -o seed.tgz
tar -zxvf seed.tgz -C ../..
rm -rf seed.tgz
./gradlew dbteardown
./gradlew dbConfigureClean
./gradlew clean
./gradlew dbinit
./gradlew dbconfigure
./gradlew test
./gradlew dbload
./gradlew bootrun
