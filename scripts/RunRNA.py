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
## Selecting data from MySQL database with respect to status downloading files from website
##
##

import os
import sys
import Settings
import datetime
import DefFunctions as d
import re
import random
import MySQLdb
import glob
import subprocess as s
import time


#print str(datetime.datetime.now())

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
BIN = WARDROBEROOT + '/' + settings.settings['bin']
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']
ANNOTATION_BASE = BOWTIE_INDICES + "/gtf/"

pidfile = "/tmp/runRNA.pid"
d.check_running(pidfile)


def run_tophat(infile, params, pair, force=False):
    outdir = 'tophat'

    if not force and len(d.file_exist('.', infile, 'bam')) == 1:
        return ['Success', ' Bam file exists']

    if pair:
        cmd = 'tophat2 -o ' + outdir + ' ' + params + ' ' + infile + '.fastq' + ' ' + infile + '_2.fastq >/dev/null 2>&1'
    else:
        cmd = 'tophat2 -o ' + outdir + ' ' + params + ' ' + infile + '.fastq >/dev/null 2>&1'

    try:
        s.check_output(cmd, shell=True)
        if len(d.file_exist('./' + outdir, 'accepted_hits', 'bam')) != 1:
            return ['Error', 'accepted_hits.bam does not exist']
        os.rename('./' + outdir + '/accepted_hits.bam', './' + infile + '.bam')
        s.check_output('samtools sort ./' + infile + '.bam ' +infile+"_s ", shell=True)
        os.unlink('./' + infile + '.bam')
        os.rename('./' + infile + '_s.bam', './' + infile + '.bam')
        s.check_output('samtools index ./' + infile + '.bam ', shell=True)
        s.check_output('bzip2 ' + infile + '*.fastq', shell=True)
        return ['Success', ' Tophat finished']
    except Exception, e:
        return ['Error', str(e)]


def run_ribosomal(infile, db, pair):
    suffix = ''
    if 'hg' in db:
        suffix = 'human'
    if 'mm' in db:
        suffix = 'mouse'

    if len(d.file_exist('.', infile, 'ribo')) == 1:
        return ['Success', 'Ribosomal file exist']
    if pair:
        cmd = 'bowtie -q -v 3 -m 1 --best --strata -p 24 -S ' + BOWTIE_INDICES + '/ribo_' + suffix + ' -1' + infile + '.fastq -2 ' + infile + '_2.fastq  >/dev/null 2>./' + infile + '.ribo'
    else:
        cmd = 'bowtie -q -v 3 -m 1 --best --strata -p 24 -S ' + BOWTIE_INDICES + '/ribo_' + suffix + ' ' + infile + '.fastq >/dev/null 2>./' + infile + '.ribo'

    try:
        ret = s.Popen(cmd, shell=True)
        return ['Success', ' Ribosomal backgrounded', ret]
    except Exception, e:
        return ['Error', str(e)]


def get_stat(infile, pair):
    FL = d.file_exist('.', infile, 'log')
    lines = 0

    if len(FL) == 1:
        for line in open(infile + '.fastq'):
            lines += 1
        TOTAL = lines / 4
        ALIGNED = 0
        RIBO = 0
        for line in open(infile + '.log'):
            if 'Aligned' in line:
                ALIGNED = int(line.split('Aligned:')[1])
                if pair:  # maybe remove in the future
                    ALIGNED = ALIGNED / 2
                break
        for line in open(infile + '.ribo'):
            if 'alignment' in line:
                RIBO = line.split('alignment:')[1]
                RIBO = int(RIBO.split()[0])
                break
        fp = open('./' + infile + '.stat', 'w+')
        fp.write(str((TOTAL, ALIGNED, RIBO)))
        fp.close()
        return (TOTAL, ALIGNED, RIBO)
    else:
        return ['Error', 'Cant read stat file']


def run_rpkm(infile, db, dutp, spike, antab, force=False):
    FL = d.file_exist('.', infile + '_rpkm', 'log')
    if len(FL) == 1 and force:
        os.unlink(FL[0])
    if len(FL) == 1 and not force:
        return ['Success', ' Rpkm list uploaded']

    cmd = 'ReadsCounting -sql_table="' + infile + '" -in="' + infile + '.bam" -out="' + infile + '.csv" -log="' + infile + '_rpkm.log" -rpkm-cutoff=0.001 -rpkm-cutoff-val=0 '
    cmd += '-sql_query1="select name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2 from '
    cmd += db + "." + antab + " where chrom not like '%\\_%' "
    if not spike:
        cmd += " and chrom not like 'control%' "
    cmd += " order by chrom,strand,txStart,txEnd"
    cmd += '" -sql_dbname=' + EDB + ' -threads=4 -math-converging="arithmetic" -no-file '

    if dutp:
        cmd += ' -rna_seq="dUTP" '
    else:
        cmd += ' -rna_seq="RNA" '
    if not spike:
        cmd += ' -sam_ignorechr="control" '
    cmd += ' >'+infile + '_rpkm_error.log 2>&1'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' RPKMs was uploaded to genome browser']
    except Exception, e:
        return ['Error', str(e)]

######################################################


settings.cursor.execute(
    "update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'RNA%')"
    " and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 "
   )

while True:
    settings.cursor.execute("select e.etype,l.uid,g.db,g.findex,g.annotation,g.annottable,g.genome,l.forcerun "
                            " from labdata l,experimenttype e,genome g "
                            " where e.id=experimenttype_id and g.id=genome_id and e.etype like 'RNA%' and libstatus in (10,1010) "
                            " and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 "
                            " order by dateadd limit 1")

    row = settings.cursor.fetchone()
    if not row:
        break

    PAIR = ('pair' in row[0])
    DUTP = ('dUTP' in row[0])
    isRNA = ('RNA' in row[0])
    UID = row[1]
    DB = row[2]
    FINDEX = row[3]
    ANNOTATION = row[4]
    ANNOTTABLE = row[5]
    SPIKE = ('spike' in row[6])
    forcerun = (int(row[7]) == 1)

    BEDFORMAT = '4'
    ADD_TOPHAT = " -T "

    if DUTP:
        ADD_TOPHAT = " --library-type fr-firststrand "  # DUTP
        BEDFORMAT = '8'

    if PAIR:
        ADD_TOPHAT = " --no-mixed --no-discordant " + ADD_TOPHAT

    ADD_TOPHAT = " -g 1 --no-novel-juncs " + ADD_TOPHAT

    TRANSCRIPTOME = ' --transcriptome-index ' + ANNOTATION_BASE + ANNOTATION + ' '
    GFT_FILE = '-G ' + ANNOTATION_BASE + ANNOTATION + '.gtf '

    TOPHAT_PARAM = ' --num-threads 24 ' + GFT_FILE + ADD_TOPHAT + TRANSCRIPTOME + BOWTIE_INDICES + '/' + FINDEX + ' '

    os.chdir(PRELIMINARYDATA+'/'+UID)

    OK = True

    if len(d.file_exist('.', UID, 'fastq')) != 1:
        OK = False
    if PAIR and len(d.file_exist('.', UID+"_2", 'fastq')) != 1:
        OK = False
    if not OK:
        settings.cursor.execute("update labdata set libstatustxt='Files do not exists',libstatus=2010 where uid=%s",(UID,))
        settings.conn.commit()
        continue

    settings.cursor.execute("update labdata set libstatustxt='processing',libstatus=11 where uid=%s", (UID,))
    settings.conn.commit()
    try:
        d.run_fence(UID, PAIR)
    except:
        pass
    a = run_ribosomal(UID, DB, PAIR)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue
    PID = 0
    if len(a) == 3:
        PID = a[2].pid

    a = run_tophat(UID, TOPHAT_PARAM, PAIR, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue
    if 'Warning' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=1010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where uid=%s", (a[0] + ": " + a[1], UID))
    settings.conn.commit()

    rnadutp = 1
    if DUTP:
        rnadutp = 2
    a = d.run_bedgraph(UID, BEDFORMAT, DB, 150, rnadutp, PAIR, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where uid=%s", (a[0] + ": " + a[1], UID))
    settings.conn.commit()
    try:
        os.waitpid(PID, 0)
        time.sleep(5)
    except:
        pass

    a = get_stat(UID,PAIR)
    settings.cursor.execute(
        "update labdata set libstatustxt='RPKMs calculating',libstatus=11,tagstotal=%s,tagsmapped=%s,tagsribo=%s where uid=%s",
        (a[0], a[1], a[2], UID))
    settings.conn.commit()

    a = run_rpkm(UID, DB, DUTP, SPIKE, ANNOTTABLE, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2020 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue

    settings.cursor.execute("update labdata set libstatustxt='Complete',libstatus=12 where uid=%s", (UID,))
    settings.conn.commit()

