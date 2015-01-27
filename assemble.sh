#!/bin/bash

QMAKE="qmake-qt5"

if [ z"`uname`" == "zDarwin" ]; then
QMAKE="qmake"
fi

#check Qt
${QMAKE} -v >/dev/null 2>&1
[ $? -ne 0 ] && echo "Qt developer tool is not installed" && exit

#check mysql
mysql --version >/dev/null 2>&1
[ $? -ne 0 ] && echo "No mysql client tools installed" && exit

. $(pwd)/scripts/functions.sh

get_db_credentials

#mysql settings
BINS=$(mysql -h${HOST} -p${PASSWD} -u${USER} -N -e "select group_concat(\`value\` order by \`key\` desc separator '/') from ems.settings where \`key\` in ('wardrobe','bin')")
#"

if [ z"$BINS" == "z" ] || [ "${BINS}" == "NULL" ] ; then
echo "Can't access Wardrobe Settings"
exit
fi

function assemble() {
make clean >>../../output.log 2>/dev/null
make distclean >>../../output.log 2>/dev/null
${QMAKE} >>../../output.log 2>&1
make >>../../output.log 2>&1
return $?
}

echo "Compile bamtools lib"
cd ./thirdparty/bamtools
assemble
[ $? -ne 0 ] && echo "Cant compile bam tools" && exit
cd ../../

echo "Compile iaintersect"
cd src/iaintersect
assemble
[ $? -ne 0 ] && echo "Cant compile iaintersect" && exit
ln -sf $(pwd)/iaintersect $BINS/iaintersect

cd ../../
echo "Compile bam2bedgraph"
cd src/bam2bedgraph
assemble
[ $? -ne 0 ] && echo "Cant compile bam2bedgraph" && exit
ln -sf $(pwd)/bam2bedgraph $BINS/bam2bedgraph

cd ../../
echo "Compile reads-counting"
cd src/reads-counting
assemble
[ $? -ne 0 ] && echo "Cant compile reads-counting" && exit
ln -sf $(pwd)/ReadsCounting $BINS/ReadsCounting

cd ../../
echo "Compile averagetagdensity"
cd src/atdp
assemble
[ $? -ne 0 ] && echo "Cant compile averagedensity" && exit
ln -sf $(pwd)/atdp $BINS/atdp

echo "Assemble complete"
cd ../../
