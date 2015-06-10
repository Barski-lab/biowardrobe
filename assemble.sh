#!/bin/bash

QMAKE="qmake-qt5"

if [ z"`uname`" == "zDarwin" ]; then
QMAKE="qmake"
fi

#check Qt
${QMAKE} -v >/dev/null 2>&1
[ $? -ne 0 ] && echo "Qt developer tool is not installed" && exit -1

#check mysql
mysql --version >/dev/null 2>&1
[ $? -ne 0 ] && echo "No mysql client tools installed" && exit -1

. $(pwd)/scripts/functions.sh

get_db_credentials

#mysql settings
BINS=$(mysql -h${HOST} -p${PASSWD} -u${USER} -N -e "select group_concat(\`value\` order by \`key\` desc separator '/') from ems.settings where \`key\` in ('wardrobe','bin')")
#"

if [ z"$BINS" == "z" ] || [ "${BINS}" == "NULL" ] ; then
echo "Can't access BioWardrobe Settings"
exit -1
fi

function assemble() {
make clean >>./output.log 2>/dev/null
make distclean >>./output.log 2>/dev/null
${QMAKE} >>./output.log 2>&1
make >>./output.log 2>&1
return $?
}

echo "Compile bamtools lib"
cd ./thirdparty/bamtools
assemble
[ $? -ne 0 ] && echo "Cant compile bam tools" && exit -1
cd ../../

echo "Compile iaintersect"
cd src/iaintersect
assemble
[ $? -ne 0 ] && echo "Cant compile iaintersect" && exit -1
ln -sf $(pwd)/iaintersect $BINS/iaintersect

cd ../../
echo "Compile bam2bedgraph"
cd src/bam2bedgraph
assemble
[ $? -ne 0 ] && echo "Cant compile bam2bedgraph" && exit -1
ln -sf $(pwd)/bam2bedgraph $BINS/bam2bedgraph

cd ../../
echo "Compile reads-counting"
cd src/reads-counting
assemble
[ $? -ne 0 ] && echo "Cant compile reads-counting" && exit -1
ln -sf $(pwd)/ReadsCounting $BINS/ReadsCounting

cd ../../
echo "Compile atdb"
cd src/atdp
assemble
[ $? -ne 0 ] && echo "Cant compile atdp" && exit -1
ln -sf $(pwd)/atdp $BINS/atdp

cd ../../
echo "Compile averagetagdensity"
cd src/averagedensity
assemble
[ $? -ne 0 ] && echo "Cant compile averagedensity" && exit -1
ln -sf $(pwd)/averagedensity $BINS/averagedensity

echo "Assemble complete"
cd ../../

exit 0
