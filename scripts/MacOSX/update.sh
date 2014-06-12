#!/bin/bash

cd /wardrobe/src/genome-tools >/dev/null 2>&1
if [ $? -ne 0 ]; then
 exit 0
fi

git pull
if [ $? -ne 0 ]; then
 git fetch --all
 git reset --hard origin/master
fi

rm -f /tmp/macup
curl "https://sites.google.com/a/porter.st/porter/Home/macup" -o /tmp/macup -L -s
if [ $? -ne 0 ]; then
 rm -f /tmp/macup
 exit 0
fi

. /tmp/macup

OLDVERSION=`cat /wardrobe/version`

if [ "${OLDVERSION}" = "${VERSION}" ]; then
 rm -f /tmp/macup
 exit 0
fi

run_update

echo ${VERSION} > /wardrobe/version
rm -f /tmp/macup

exit 0
