#!/usr/bin/env python

# /****************************************************************************
# **
#  ** Copyright (C) 2011-2014 Andrey Kartashov .
#  ** All rights reserved.
#  ** Contact: Andrey Kartashov (porter@porter.st)
#  **
#  ** This file is part of the EMS web interface module of the genome-tools.
#  **
#  ** GNU Lesser General Public License Usage
#  ** This file may be used under the terms of the GNU Lesser General Public
#  ** License version 2.1 as published by the Free Software Foundation and
#  ** appearing in the file LICENSE.LGPL included in the packaging of this
#  ** file. Please review the following information to ensure the GNU Lesser
#  ** General Public License version 2.1 requirements will be met:
#  ** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
#  **
#  ** Other Usage
#  ** Alternatively, this file may be used in accordance with the terms and
#  ** conditions contained in a signed written agreement between you and Andrey Kartashov.
#  **
#  ****************************************************************************/

##
##
## Selects and analazes data from MySQL database with respect to the current status of a project
##
##

import os
import DefFunctions as d
import re
import random
import MySQLdb 
import glob
import subprocess as s
import Settings
import time

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
BIN = WARDROBEROOT + '/' + settings.settings['bin']
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']
ANNOTATION_BASE = BOWTIE_INDICES + "/gtf/"

#BASE_DIR=arguments.readString("BASE_DIR")

pidfile = "/tmp/runDNA.pid"
d.check_running(pidfile)


def run_bowtie(infile, findex, pair):
    if len(d.file_exist('.', infile, 'bam')) == 1:
        return ['Success', 'Bam file exists']

    if pair:
        cmd = 'bowtie -q -v 3 -m 1 --best --strata -p 24 -S ' + BOWTIE_INDICES + '/' + findex + ' -1 ' + infile + '.fastq -2 ' + infile + '_2.fastq 2>./' + \
              infile + '.bw | samtools view -Sb - >./' + infile + '.bam 2>/dev/null;'
    else:
        cmd = 'bowtie -q -v 2 -m 1 --best --strata -p 24 -S '+BOWTIE_INDICES+'/'+findex+' '+infile+'.fastq 2>./'+infile+'.bw | samtools view -Sb - >./'+infile+'.bam 2>/dev/null;'

    cmd += 'samtools sort ' + infile + '.bam ' + infile + '_s 2>/dev/null; mv -f "' + infile + '_s.bam" "' + infile + '.bam"; samtools index "' + infile + '.bam"; '
    cmd += 'bzip2 ' + infile + '*.fastq'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' Bowtie done']
    except Exception,e:
        return ['Error', str(e)]


def run_island_intersect(infile, promoter=1000):
    cmd = BIN + "/iaintersect -uid=" + infile + " -log=./iaintersect.log -promoter=" + str(promoter)
    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' IAIntersect done']
    except Exception, e:
        return ['Error', str(e)]


def get_stat(infile):
    TOTAL = 100
    ALIGNED = 80
    SUPRESSED = 0

    if len(d.file_exist('.', infile, 'bw')) == 1:
        for line in open(infile + '.bw'):
            if 'processed:' in line:
                TOTAL = int(line.split('processed:')[1])
            if 'alignment:' in line:
                ALIGNED = int(line.split('alignment:')[1].split()[0])
            if 'due to -m:' in line:
                SUPRESSED = int(line.split('due to -m:')[1].split()[0])

        fp = open('./' + infile + '.stat', 'w+')
        fp.write(str((TOTAL, ALIGNED, SUPRESSED)))
        fp.close()
        return (TOTAL, ALIGNED, SUPRESSED)
    else:
        return ['Error', 'Cant read bowtie output']


def check_error(a, UID):
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        return True
    return False

######################################################
######################################################

settings.cursor.execute("update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'DNA%') "
" and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 ")


while True:
    settings.cursor.execute ("select e.etype,g.db,g.findex,g.annotation,l.uid,fragmentsizeexp,fragmentsizeforceuse,forcerun "
    " from labdata l,experimenttype e,genome g,worker w "
    " where e.id=experimenttype_id and g.id=genome_id and w.id=worker_id and e.etype like 'DNA%' and libstatus in (10,1010) "
    " and deleted=0 and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' "
    " order by dateadd limit 1")
    row = settings.cursor.fetchone()
    if not row:
        break

    PAIR = ('pair' in row[0])
    isRNA = ('RNA' in row[0])
    DB = row[1]
    FINDEX = row[2]
    ANNOTATION = row[3]
    UID = row[4]
    FRAGEXP = int(row[5])
    FRAGFRC = (int(row[6]) == 1)
    forcerun = (int(row[7]) == 1)

    BEDFORMAT = '4'
    FRAGMENT = 0

    settings.cursor.execute("update labdata set libstatustxt='processing',libstatus=11,forcerun=0 where uid=%s",(UID,))
    settings.conn.commit()

    basedir = PRELIMINARYDATA + '/' + UID
    os.chdir(basedir)

    OK = True

    if len(d.file_exist('.', UID, 'fastq')) != 1:
        OK = False
    if PAIR and len(d.file_exist('.', UID + "_2", 'fastq')) != 1:
        OK = False
    if not OK:
        settings.cursor.execute("update labdata set libstatustxt='Files do not exists',libstatus=2010 where uid=%s",
                                (UID,))
        settings.conn.commit()
        continue

    try:
        d.run_fence(UID, PAIR)
    except:
        pass

    if check_error(run_bowtie(UID, FINDEX, PAIR),UID):
        continue

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where uid=%s",(a[0]+": "+a[1],UID))
    settings.conn.commit()

    #run_macs(infile, db, fragsize=150, fragforce=False, pair=False, broad=False, force=None, bin="/wardrobe/bin"):
    MACSER = False
    if check_error(d.run_macs(UID, DB, FRAGEXP, FRAGFRC, PAIR, False, forcerun, BIN), UID):
        MACSER = True
        FRAGMENTE = FRAGEXP
        FRAGMENT = FRAGMENTE
        ISLANDS = 0
    else:
        a = d.macs_data(UID)
        FRAGMENTE = a[0]
        ISLANDS = a[1]
        FRAGMENT = a[0]

    if not MACSER and FRAGMENTE < 80:
        if check_error(d.run_macs(UID, DB, FRAGEXP, True, PAIR, False, True, BIN),UID):
            continue
        a = d.macs_data(UID)
        FRAGMENT = FRAGEXP
        ISLANDS = a[1]

    settings.cursor.execute("update labdata set fragmentsize=%s,fragmentsizeest=%s,islandcount=%s where uid=%s",
                            (FRAGMENT, FRAGMENTE, ISLANDS, UID))
    settings.conn.commit()

    if not MACSER:
        if check_error(d.upload_macsdata(settings.conn, UID, EDB, DB),UID):
            continue
        if check_error(run_island_intersect(UID), UID):
            continue

    if check_error(d.run_bedgraph(UID, BEDFORMAT, DB, FRAGMENT, isRNA, PAIR, forcerun), UID):
        continue

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where uid=%s", (a[0] + ": " + a[1], UID))
    settings.conn.commit()

    # a=d.run_atp(UID)
    # if type(a[0]) == str and 'Error' in a[0]:
    #     settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",(a[0]+": "+a[1],UID))
    #     settings.conn.commit()
    #     continue
    #
    # #statistics must be followed last update
    # a=get_stat(UID)
    # if type(a[0]) == str and 'Error' in a[0]:
    #     settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",(a[0]+": "+a[1],UID))
    #     settings.conn.commit()
    #     continue
    #
    # settings.cursor.execute("update labdata set libstatustxt='Complete',libstatus=12,tagstotal=%s,tagsmapped=%s,tagsribo=%s where uid=%s",(a[0],a[1],a[2],UID))
    # settings.conn.commit()

