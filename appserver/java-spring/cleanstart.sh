#!/bin/bash

function successOrExit {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "$1 exited with error: $status"
        exit $status
    fi
}

day=$(date +"%Y%m%d")
test $1 && day=$1
ver="8.0-$day"

echo "********* Will be using MarkLogic nightly $ver"

mlvmVers=($(mlvm list))
install=1
for i in "${mlvmVers[@]}"
do
  if [[ "$i" == "$ver" ]]; then
    echo "********* Existing MLVM installation of $ver found; skipping download/install"
    install=0
  fi
done

OSTYPE=`uname`
if [[ "$OSTYPE" == "Darwin" ]]; then
  echo "********* OS is OSX"
  fname="MarkLogic-$ver-x86_64.dmg"
  url="http://root.marklogic.com/nightly/builds/macosx-64/osx-intel64-80-build.marklogic.com/HEAD/pkgs.$day/MarkLogic-8.0-$day-x86_64.dmg"
else
  fname="MarkLogic-$ver.x86_64.rpm"
  url="http://root.marklogic.com/nightly/builds/linux64/rh6-intel64-80-test-1.marklogic.com/HEAD/pkgs.$day/MarkLogic-8.0-$day.x86_64.rpm"
fi
if [[ $install == 1 ]]; then
  echo "********* Downloading MarkLogic nightly $ver"

  echo "********* Enter user for root.marklogic.com"
  read -s user
  echo "********* Enter password for $user on root.marklogic.com"
  read -s pass

  status=$(curl -k --anyauth -u $user:$pass --head --write-out %{http_code} --silent --output /dev/null $url)
  if [[ $status = 200 ]]; then
    successOrExit curl -k --anyauth -u $user:$pass -o ./$fname $url
    mlvm stop
    fname=$(pwd)/$fname
    successOrExit mlvm install $fname # $ver
    successOrExit mlvm use $ver
    rm -rf ./$fname
    echo "********* MarkLogic nightly $ver installed to mlvm"
  else
    echo "CANNOT DOWNLOAD: status = $status for date $day (URL=\"$url\")"
    exit 1
  fi
fi

echo "********* Cleaning Up Gradle environment"
rm -rf ./.gradle/2.1/taskArtifacts/*
successOrExit ./gradlew --stop
rm -rf ./.gradle/2.1/taskArtifacts/*

echo "********* Downloading/Unpacking Seed Data"
rm -rf ../../database/seed-data
curl -k -L -o seed.tgz http://developer.marklogic.com/media/gh/seed-data1.3.tgz -o seed.tgz
tar -zxf seed.tgz -C ../..
rm -rf seed.tgz

mlvm stop
if [[ "$OSTYPE" == "Darwin" ]]; then
  echo "********* Reinitializing MarkLogic Installation"
  rm -rf ~/Library/Application\ Support/MarkLogic/Data
else
  echo "*****************************************************"
  echo "I don't know where linux ML stores data directory!!!!"
  echo "Thus, not wiping out existing ML data"
  echo "*****************************************************"
fi

successOrExit mlvm use $ver
# ./gradlew dbteardown
# mlvm stop
# mlvm start
# successOrExit ./gradlew dbConfigureClean
successOrExit ./gradlew clean
successOrExit ./gradlew dbinit
successOrExit ./gradlew dbconfigure
./gradlew test
successOrExit ./gradlew dbload
./gradlew bootrun
