#!/bin/bash

# runs command from parameters and exits with the eoror code of the command
# if it fails
function successOrExit {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "$1 exited with error: $status"
        exit $status
    fi
}

test $1 && arg1=$1
if [[ $arg1 = 'release' ]]; then

  fname=MarkLogic-8.0-3.x86_64.rpm
  ver=8.0-3
  fnamedeb="marklogic_"
  fnamedeb=$fnamedeb$ver
  suff="_amd64.deb"
  fnamedeb=$fnamedeb$suff

  url=$MLRELEASE_URL

  echo "********* Downloading MarkLogic $ver"

  status=$(curl -k --head --write-out %{http_code} --silent --output /dev/null $url)
  if [[ $status = 200 ]]; then
    successOrExit curl -k -o ./$fname $url

    fname=$(pwd)/$fname

    sudo apt-get update
    sudo apt-get install alien dpkg-dev debhelper build-essential
    sudo alien -d -k $fname
    sudo dpkg -i $fnamedeb

    echo "********* MarkLogic nightly $ver installed"
  else
    echo "CANNOT DOWNLOAD: status = $status for version $ver (URL=secure/suppressed)"
    exit 1
  fi

else
  # find today
  day=$(date +"%Y%m%d")

  # if the user passed a day string as a param then use it instead
  test $1 && day=$1
  # make a version number out of the date
  ver="8.0-$day"

  echo "********* Will be using MarkLogic nightly $ver"

  # fetch/install ML nightly
  fname="MarkLogic-$ver.x86_64.rpm"
  fnamedeb="marklogic_"
  fnamedeb=$fnamedeb$ver
  suff="_amd64.deb"
  fnamedeb=$fnamedeb$suff

  url="http://root.marklogic.com/nightly/builds/linux64/rh6-intel64-80-test-1.marklogic.com/HEAD/pkgs.$day/$fname"
  echo "********* Downloading MarkLogic nightly $ver"


  status=$(curl -k --anyauth -u $MLBUILD_USER:$MLBUILD_PASSWORD --head --write-out %{http_code} --silent --output /dev/null $url)
  if [[ $status = 200 ]]; then
    successOrExit curl -k --anyauth -u $MLBUILD_USER:$MLBUILD_PASSWORD -o ./$fname $url

    fname=$(pwd)/$fname

    sudo apt-get update
    sudo apt-get install alien dpkg-dev debhelper build-essential
    sudo alien -d -k $fname
    sudo dpkg -i $fnamedeb

    echo "********* MarkLogic nightly $ver installed"
  else
    echo "CANNOT DOWNLOAD: status = $status for date $day (URL=\"$url\")"
    exit 1
  fi
fi
