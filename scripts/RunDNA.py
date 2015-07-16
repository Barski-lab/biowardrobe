#!/usr/bin/env python

# /****************************************************************************
# **
# ** Copyright (C) 2011-2014 Andrey Kartashov .
# ** All rights reserved.
# ** Contact: Andrey Kartashov (porter@porter.st)
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
## Selects and analazes data from MySQL database with respect to the current status
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
import datetime

print str(datetime.datetime.now())

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
MTH = str(settings.settings['maxthreads'])
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']



pidfile = TEMP+"/runDNA.pid"
d.check_running(pidfile)


def run_bowtie(infile, findex, pair, left=0, right=0):
    if len(d.file_exist('.', infile, 'bam')) == 1:
        return ['Success', 'Bam file exists']

    cmd = 'bowtie -q -v 3 -m 1 --best --strata -p ' + MTH + ' -S ' + BOWTIE_INDICES + '/' + findex + \
          ' -5 ' + str(left) + ' -3 ' + str(right)

    if pair:
        cmd += ' -1 ' + infile + '.fastq -2 ' + infile + '_2.fastq 2>./' + infile + '.bw '
    else:
        cmd += ' ' + infile + '.fastq 2>./' + infile + '.bw '

    cmd += '| samtools view -Sb - | samtools sort - ' + infile + ' 2>/dev/null;'
    cmd += 'samtools index "' + infile + '.bam"; '
    cmd += 'bzip2 ' + infile + '*.fastq'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' Bowtie done']
    except Exception, e:
        return ['Error', str(e)]


def run_rmdup(infile, pair):
    if len(d.file_exist('.', infile, 'bam')) != 1:
        return ['Error', 'Bam file does not exist']

    if pair:
        cmd = 'samtools rmdup ' + infile + '.bam ' + infile + '.r.bam >' + infile + '.rmdup 2>&1;'
    else:
        cmd = 'samtools rmdup -s ' + infile + '.bam ' + infile + '.r.bam >' + infile + '.rmdup 2>&1;'

    cmd += 'rm -f "' + infile + '.bam";rm -f "' + infile + '.bam.bai";'
    cmd += 'samtools sort ' + infile + '.r.bam ' + infile + ' 2>/dev/null;'
    cmd += 'samtools index "' + infile + '.bam"; rm -f "' + infile + '.r.bam"'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' Rmdup done']
    except Exception, e:
        return ['Error', str(e)]


def run_island_intersect(infile, promoter=1000):
    cmd = "iaintersect -uid=" + infile + " -log=./iaintersect.log -promoter=" + str(promoter)
    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' IAIntersect done']
    except Exception, e:
        return ['Error', str(e)]


def get_stat(infile, rmdup=False):
    TOTAL = 100
    ALIGNED = 80
    SUPRESSED = 0
    USED = 0

    if len(d.file_exist('.', infile, 'bw')) == 1:
        for line in open(infile + '.bw'):
            if 'processed:' in line:
                TOTAL = int(line.split('processed:')[1])
            if 'alignment:' in line:
                ALIGNED = int(line.split('alignment:')[1].split()[0])
            if 'due to -m:' in line:
                SUPRESSED = int(line.split('due to -m:')[1].split()[0])
    else:
        return ['Error', 'Cant read bowtie output']

    USED = ALIGNED

    if rmdup and len(d.file_exist('.', infile, 'rmdup')) == 1:
        for line in open(infile + '.rmdup'):
            if '/' in line:
                splt = line.split('/')
                USED = int((splt[1].split('='))[0].strip()) - int((splt[0].split(']'))[1].strip())

    fp = open('./' + infile + '.stat', 'w+')
    fp.write(str((TOTAL, ALIGNED, SUPRESSED, USED)))
    fp.close()

    return (TOTAL, ALIGNED, SUPRESSED, USED)


def check_error(a, UID):
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        return True
    return False

######################################################
######################################################

settings.cursor.execute(
    "update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'DNA%') "
    " and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 ")

while True:
    settings.cursor.execute(
        "select e.etype,g.db,g.findex,g.annotation,l.uid,fragmentsizeexp,fragmentsizeforceuse,forcerun, "
        "COALESCE(l.trim5,0), COALESCE(l.trim3,0),COALESCE(a.properties,0), COALESCE(l.rmdup,0),g.gsize, COALESCE(control,0), COALESCE(control_id,'') "
        "from labdata l "
        "inner join (experimenttype e,genome g ) ON (e.id=experimenttype_id and g.id=genome_id) "
        "LEFT JOIN (antibody a) ON (l.antibody_id=a.id) "
        "where e.etype like 'DNA%' and libstatus in (10,1010) "
        "and deleted=0 and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' "
        " order by control DESC,dateadd limit 1")
    row = settings.cursor.fetchone()
    if not row:
        break

    print "ROW: " + str(row)

    PAIR = ('pair' in row[0])
    isRNA = ('RNA' in row[0])
    DB = row[1]
    FINDEX = row[2]
    ANNOTATION = row[3]
    UID = row[4]
    FRAGEXP = int(row[5])
    FRAGFRC = (int(row[6]) == 1)
    forcerun = (int(row[7]) == 1)
    left = int(row[8])
    right = int(row[9])
    broad = (int(row[10]) == 2)
    rmdup = (int(row[11]) == 1)
    gsize = row[12]

    isControl = (int(row[13]) == 1)
    control_id = row[14]

    if control_id != "":
        settings.cursor.execute("select libstatus from labdata where uid=%s", (control_id,))
        crow = settings.cursor.fetchone()
        if int(crow[0]) < 12 or int(crow[0]) > 100:
            settings.cursor.execute(
                "update labdata set libstatustxt='control dataset has not been analyzed',libstatus=2 where uid=%s",
                (UID,))
            settings.conn.commit()
            continue

    FRAGMENT = 0

    settings.cursor.execute("update labdata set libstatustxt='processing',libstatus=11,forcerun=0 where uid=%s", (UID,))
    settings.conn.commit()

    basedir = PRELIMINARYDATA + '/' + UID
    os.chdir(basedir)

    controlfile = ""
    if control_id != "":
        controlfile = PRELIMINARYDATA + '/' + control_id + '/' + control_id + '.bam'

    OK = True
    if len(d.file_exist('.', UID, 'fastq')) != 1:  # and len(d.file_exist('.', UID+"_trimmed", 'fastq')) != 1:
        OK = False

    if PAIR and len(
            d.file_exist('.', UID + "_2", 'fastq')) != 1:  # and len(d.file_exist('.', UID+"_trimmed_2", 'fastq')) != 1:
        OK = False

    if not OK:
        settings.cursor.execute("update labdata set libstatustxt='Files do not exists',libstatus=2010 where uid=%s",
                                (UID,))
        settings.conn.commit()
        continue

    try:
        d.run_fence(UID, PAIR, False, forcerun)
    except:
        pass

    if check_error(run_bowtie(UID, FINDEX, PAIR, left, right), UID):
        continue

    if rmdup and check_error(run_rmdup(UID, PAIR), UID):
        continue

    #run_macs(infile, db, fragsize=150, fragforce=False, pair=False, broad=False, force=None, bin="/wardrobe/bin"):
    MACSER = False
    if check_error(d.run_macs(UID, gsize, FRAGEXP, FRAGFRC, PAIR, broad, forcerun, controlfile), UID):
        MACSER = True
        FRAGMENTE = FRAGEXP
        FRAGMENT = FRAGMENTE
        ISLANDS = 0
    else:
        a = d.macs_data(UID)
        FRAGMENTE = a[0]
        ISLANDS = a[1]
        FRAGMENT = a[0]

    if MACSER or (FRAGMENTE < 80 and not FRAGFRC):
        if check_error(d.run_macs(UID, gsize, FRAGEXP, True, PAIR, broad, True, controlfile), UID):
            MACSER = True
        else:
            a = d.macs_data(UID)
            FRAGMENT = FRAGEXP
            ISLANDS = a[1]

    settings.cursor.execute("update labdata set fragmentsize=%s,fragmentsizeest=%s,islandcount=%s where uid=%s",
                            (FRAGMENT, FRAGMENTE, ISLANDS, UID))
    settings.conn.commit()

    if check_error(d.upload_macsdata(settings.conn, UID, EDB, DB), UID):
        if not MACSER:
            continue
    if check_error(run_island_intersect(UID), UID):
        continue
    settings.cursor.execute(
        """update labdata set params='{"promoter":1000}' where uid=%s""", (UID,))
    settings.conn.commit()

    if check_error(d.run_bedgraph(UID, DB, FRAGMENT, isRNA, PAIR, forcerun), UID):
        continue

    a = get_stat(UID, rmdup)
    if type(a[0]) is str and check_error(a, UID):
        continue

    settings.cursor.execute(
        "update labdata set libstatustxt='ATDP Running',libstatus=11,tagstotal=%s,tagsmapped=%s,tagsribo=%s,tagssuppressed=%s,tagsused=%s where uid=%s",
        (a[0], a[1], a[2], a[2], a[3], UID))
    settings.conn.commit()

    if check_error(d.run_atp(UID), UID):
        continue

    settings.cursor.execute(
        "update labdata set libstatustxt='Complete',libstatus=12 where uid=%s",
        (UID,))
    settings.conn.commit()

