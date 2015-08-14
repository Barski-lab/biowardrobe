#!/usr/bin/env python

# /****************************************************************************
# **
# ** Copyright (C) 2011-2014 Andrey Kartashov .
# ** All rights reserved.
# ** Contact: Andrey Kartashov (porter@porter.st)
# **
# ** This file is part of the EMS web interface module of the genome-tools.
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
## Selecting data from MySQL database with respect to the status, run RNA-Seq pipeline
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

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
MTH = str(settings.settings['maxthreads'])
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']
ANNOTATION_BASE = BOWTIE_INDICES + "/gtf/"

pidfile = TEMP + "/runRNA.pid"
d.check_running(pidfile)

print str(datetime.datetime.now())


def run_star(infile, db, pair, left=0, right=0, force=False):
    fl = d.file_exist('.', infile, 'bam')

    if not force and len(fl) == 1:
        return ['Success', ' Bam file exists']

    if force and len(fl) == 1:
        os.unlink(fl[0])

    cmd = 'STAR --runThreadN '+MTH+' --outFilterMultimapNmax 1 --outFilterMismatchNmax 5 '
    cmd += '--alignSJDBoverhangMin 1 --seedSearchStartLmax 15 --outStd SAM --outSAMmode Full '
    cmd += '--clip3pNbases ' + str(left) + ' --clip5pNbases ' + str(right) + ' '
    cmd += '--genomeDir ' + BOWTIE_INDICES + '/STAR/' + db + ' --readFilesIn "' + infile + '.fastq" '

    if pair:
        cmd += '"' + infile + '_2.fastq" '

    cmd += '--outFileNamePrefix ' + infile + '. | samtools view -Sb - |samtools sort - ' + infile + ';'
    cmd += 'samtools index ' + infile + '.bam;'

    try:
        o = s.check_output(cmd, stderr=s.STDOUT, shell=True)
        if not os.path.isfile('./' + infile + '.Log.final.out'):
            return ['Error', o]
        return ['Success', ' Star finished']
    except Exception, e:
        return ['Error', str(e)]


def run_bzip(infile):
    try:
        s.check_output('bzip2 ' + infile + '*.fastq', shell=True)
        return ['Success', ' Bzipped']
    except Exception, e:
        return ['Error', str(e)]


def run_ribosomal(infile, db, pair, left=0, right=0, forcerun=False):
    suffix = db
    # if 'hg' in db:
    #     suffix = 'human'
    # if 'mm' in db:
    #     suffix = 'mouse'

    if not forcerun and len(d.file_exist('.', infile, 'ribo')) == 1:
        return ['Success', 'Ribosomal file exist']

    cmd = 'bowtie -q -v 3 -m 1 --best --strata -p '+MTH+' -S ' + BOWTIE_INDICES + '/ribo_' + suffix + \
          ' -5 ' + str(left) + ' -3 ' + str(right)

    if pair:
        cmd += ' -1' + infile + '.fastq -2 ' + infile + '_2.fastq  >/dev/null 2>./' + infile + '.ribo'
    else:
        cmd += ' ' + infile + '.fastq >/dev/null 2>./' + infile + '.ribo'

    try:
        ret = s.Popen(cmd, shell=True)
        return ['Success', ' Ribosomal checking', ret]
    except Exception, e:
        return ['Error', str(e)]


def get_stat_top(infile, pair):
    FL = d.file_exist('.', infile, 'log')
    if len(FL) == 1:
        TOTAL = 0
        for line in open('tophat/align_summary.txt'):
            if 'Input:' in line:
                TOTAL = int(line.split('Input:')[1])
                break
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


def get_stat(infile):
    fl = d.file_exist('.', infile, 'Log.final.out')
    TOTAL = 0
    ALIGNED = 0
    SUPPRESSED = 0

    if len(fl) == 1:
        for line in open(infile + '.Log.final.out'):
            if 'Number of input reads' in line:
                TOTAL = int(line.split('|')[1])
            if 'Uniquely mapped reads number' in line:
                ALIGNED = int(line.split('|')[1])
            if 'Number of reads mapped to too many loci' in line:
                SUPPRESSED = int(line.split('|')[1])
        RIBO = 0
        for line in open(infile + '.ribo'):
            if 'alignment' in line:
                RIBO = line.split('alignment:')[1]
                RIBO = int(RIBO.split()[0])
                break
        fp = open('./' + infile + '.stat', 'w+')
        fp.write(str((TOTAL, ALIGNED, RIBO, SUPPRESSED)))
        fp.close()
        return (TOTAL, ALIGNED, RIBO, SUPPRESSED)
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
    cmd += db + "." + antab
    # + " where chrom not like '%\\_%' " - was a mistake to remove randome chr from hg
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
    cmd += ' >' + infile + '_rpkm_error.log 2>&1'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' RPKMs was uploaded to genome browser']
    except Exception, e:
        return ['Error', str(e)]

######################################################


settings.cursor.execute(
    "update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'RNA%')"
    " and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 ")

while True:
    settings.cursor.execute(
        "select e.etype,l.uid,g.db,g.findex,g.annotation,g.annottable,g.genome,l.forcerun, COALESCE(l.trim5,0), COALESCE(l.trim3,0) "
        " from labdata l,experimenttype e,genome g "
        " where e.id=experimenttype_id and g.id=genome_id and e.etype like 'RNA%' and libstatus in (10,1010) "
        " and COALESCE(egroup_id,'') <> '' and COALESCE(name4browser,'') <> '' and deleted=0 "
        " order by dateadd limit 1")

    row = settings.cursor.fetchone()
    if not row:
        break

    print "ROW:" + str(row)
    sys.stdout.flush()

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
    left = int(row[8])
    right = int(row[9])

    os.chdir(PRELIMINARYDATA + '/' + UID)

    settings.cursor.execute("update labdata set libstatustxt='processing',libstatus=11 where uid=%s", (UID,))
    settings.conn.commit()


    OK = True
    if len(d.file_exist('.', UID, 'fastq')) != 1:  # and len(d.file_exist('.', UID + "_trimmed", 'fastq')) != 1:
        OK = False
    if PAIR and len(d.file_exist('.', UID + "_2",
                                 'fastq')) != 1:  # and len(d.file_exist('.', UID + "_trimmed_2", 'fastq')) != 1:
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

    a = run_ribosomal(UID, DB, PAIR, left, right, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue

    PID = 0
    if len(a) == 3:
        PID = a[2].pid

    a = run_star(UID, DB, PAIR, left, right, forcerun)
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
    a = d.run_bedgraph(UID, DB, 150, rnadutp, PAIR, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where uid=%s", (a[0] + ": " + a[1], UID))
    settings.conn.commit()

    try:
        if PID != 0:
            os.waitpid(PID, 0)
            time.sleep(5)
    except:
        pass

    a = run_bzip(UID)
    settings.cursor.execute(
        "update labdata set libstatustxt='Bzipped',libstatus=11 where uid=%s",
        (UID,))
    settings.conn.commit()

    a = get_stat(UID)
    settings.cursor.execute(
        "update labdata set libstatustxt='RPKMs calculating',libstatus=11,tagstotal=%s,tagsmapped=%s,tagsribo=%s,tagssuppressed=%s where uid=%s",
        (a[0], a[1], a[2], a[3], UID))
    settings.conn.commit()

    a = run_rpkm(UID, DB, DUTP, SPIKE, ANNOTTABLE, forcerun)
    if 'Error' in a[0]:
        settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2020 where uid=%s",
                                (a[0] + ": " + a[1], UID))
        settings.conn.commit()
        continue
    if PAIR:
        settings.cursor.execute(
            "update labdata set tagsused=(select sum(TOT_R_0)/2 from `" + EDB + "`.`" + UID + "_isoforms`) where uid = %s",
            (UID,))
    else:
        settings.cursor.execute(
            "update labdata set tagsused=(select sum(TOT_R_0) from `" + EDB + "`.`" + UID + "_isoforms`) where uid = %s",
            (UID,))
    settings.cursor.execute("update labdata set libstatustxt='Complete',libstatus=12 where uid=%s", (UID,))
    settings.conn.commit()

