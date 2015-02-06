#!/bin/bash

# This shell script is not intended for public use.
#
# It is used by members of the development team internally to quickly update
# MarkLogic nightly build and reinstall Samplestack database and seed-data/run
# the server.
#
# It requires OSX, the mlvm (https://github.com/withjam/mlvm) utility, and
# access/credentials for the MarkLogic nightly build download site.


# runs command from parameters and exits with the error code of the command
# if it fails
function successOrExit {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "$1 exited with error: $status"
        exit $status
    fi
}

OSTYPE=`uname`
if [[ "$OSTYPE" -ne "Darwin" ]]; then
  echo "!********* This script only runs on OSX"
  exit 1
fi

command -v mlvm >/dev/null 2>&1 || { echo >&2 "!********* This script requires mlvm"; exit 1; }

# find today
day=$(date +"%Y%m%d")
# if the user passed a day string as a param then use it instead
test $1 && day=$1
# make a version number out of the date
ver="8.0-$day"

echo "********* Will be using MarkLogic nightly $ver"

# find installed versions of MarkLogic
mlvmVers=($(mlvm list))
# assume we'll have to install
install=1
for i in "${mlvmVers[@]}"
do
  if [[ "$i" == "$ver" ]]; then
    # we found that we've already installed the version we want
    echo "********* Existing MLVM installation of $ver found; skipping download/install"
    # therefore we use it rather than downloading/installing a new build
    install=0
  fi
done

# fetch/install ML nightly
if [[ $install == 1 ]]; then
  fname="MarkLogic-$ver-x86_64.dmg"
  url="http://root.marklogic.com/nightly/builds/macosx-64/osx-intel64-80-build.marklogic.com/HEAD/pkgs.$day/$fname"
  echo "********* Downloading MarkLogic nightly $ver"

  echo "********* Enter user for root.marklogic.com"
  read user
  echo "********* Enter password for $user on root.marklogic.com"
  read -s pass

  status=$(curl -k --anyauth -u $user:$pass --head --write-out %{http_code} --silent --output /dev/null $url)
  if [[ $status = 200 ]]; then
    successOrExit curl -k --anyauth -u $user:$pass -o ./$fname $url
    mlvm stop
    fname=$(pwd)/$fname
    successOrExit mlvm install $fname # $ver
    successOrExit mlvm use $ver
    successOrExit rm -rf $fname
    echo "********* MarkLogic nightly $ver installed to mlvm"
  else
    echo "CANNOT DOWNLOAD: status = $status for date $day (URL=\"$url\")"
    exit 1
  fi
fi

echo "********* Cleaning Up Gradle environment"
# get rid of cruft
rm -rf ./.gradle/2.1/taskArtifacts/*
# stop gradle daemons if any are running
successOrExit ./gradlew --stop
# get rid of cruft (again) -- belt and suspenders
rm -rf ./.gradle/2.1/taskArtifacts/*

# echo "********* Downloading/Unpacking Seed Data"
# # wipe out seed data
# rm -rf ../../database/seed-data
# # fetch compressed
# curl -k -L -o seed.tgz http://developer.marklogic.com/media/gh/seed-data1.3.tgz -o seed.tgz
# # unpack
# tar -zxf seed.tgz -C ../..
# # remove compressed file
# rm -rf seed.tgz
#
#stop ml if running
mlvm stop

# echo "********* Reinitializing MarkLogic Installation"
# rm -rf ~/Library/Application\ Support/MarkLogic/Data

# use the correct version and start the server
successOrExit mlvm use $ver

# "normal" gradle steps to make it run
successOrExit ./gradlew dbinit
successOrExit ./gradlew dbteardown --stacktrace
successOrExit ./gradlew clean
successOrExit ./gradlew seedDataFetch
successOrExit ./gradlew seedDataExtract
successOrExit ./gradlew dbinit
successOrExit ./gradlew dbconfigure
./gradlew test # failure is an option
successOrExit ./gradlew dbload
./gradlew bootrun # we don't wait for completion, "this is the end"
