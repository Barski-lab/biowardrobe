#!/usr/bin/env python

# /****************************************************************************
# **
# ** Copyright (C) 2011-2014 Andrey Kartashov .
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
## If forcerun flag is active in labdata table then change status to 2 and restart the analysis
##
##

import os
import DefFunctions as d
import MySQLdb
import shutil
import subprocess as s
import Settings
import string

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
BIN = WARDROBEROOT + '/' + settings.settings['bin']
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']
ANNOTATION_BASE = BOWTIE_INDICES + "/gtf/"

#BASE_DIR=arguments.readString("BASE_DIR")

pidfile = "/tmp/runForceRUN.pid"
d.check_running(pidfile)


def error_update(str, uid):
    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=2010,forcerun=0 where uid=%s",
                            ("Error: " + str, uid))
    settings.conn.commit()


######################################################
def safe_del(file):
    if os.path.isfile(file):
        os.unlink(file)

while True:
    settings.cursor.execute("SELECT e.etype,g.db,l.uid "
                            " FROM labdata l,experimenttype e,genome g "
                            " WHERE e.id=experimenttype_id AND g.id=genome_id AND forcerun=1 AND libstatus >11 and deleted=0"
                            " ORDER BY dateadd LIMIT 1")
    row = settings.cursor.fetchone()
    if not row:
        break

    PAIR = ('pair' in row[0])
    isRNA = ('RNA' in row[0])
    DB = row[1]
    UID = row[2]

    basedir = PRELIMINARYDATA + '/' + UID
    os.chdir(basedir)

    cmd = ""

    if PAIR:
        cmd = 'bunzip2 ' + UID + '.fastq.bz2; bunzip2 ' + UID + '_2.fastq.bz2;'
    else:
        cmd = 'bunzip2 ' + UID + '.fastq.bz2'

    try:
        s.check_output(cmd, shell=True)
    except Exception, e:
        error_update(str(e), UID)
        continue

    safe_del(basedir + '/' + UID + '.Log.out')
    safe_del(basedir + '/' + UID + '.Log.progress.out')
    safe_del(basedir + '/' + UID + '.Log.std.out')
    safe_del(basedir + '/' + UID + '.Log.final.out')
    safe_del(basedir + '/' + UID + '.SJ.out.tab')
    safe_del(basedir + '/' + UID + '_trimmed.fastq')
    safe_del(basedir + '/' + UID + '_trimmed_2.fastq')
    safe_del(basedir + '/' + UID + '_trimmed.fastq.bz2')
    safe_del(basedir + '/' + UID + '_trimmed_2.fastq.bz2')
    safe_del(basedir + '/' + UID + '.bam')
    safe_del(basedir + '/' + UID + '.bam.bai')
    safe_del(basedir + '/' + UID + '.log')
    safe_del(basedir + '/' + UID + '.fence')
    safe_del(basedir + '/' + UID + '.fastxstat')
    safe_del(basedir + '/' + UID + '.bw')
    safe_del(basedir + '/' + UID + '.stat')
    safe_del(basedir + '/' + UID + '_macs_peaks.xls')
    safe_del(basedir + '/' + UID + '_macs.log')
    safe_del(basedir + '/' + UID + '_macs_model.r')
    safe_del(basedir + '/' + UID + '.ribo')
    safe_del(basedir + '/' + UID + '_rpkm.log')
    safe_del(basedir + '/' + UID + '_rpkm_error.log')
    shutil.rmtree(basedir + '/tophat', True)

    settings.cursor.execute("SELECT DISTINCT db FROM genome;")
    for DB in settings.cursor.fetchall():
        settings.cursor.execute("DROP TABLE IF EXISTS `" + DB[0] + "`.`" + string.replace(UID, "-", "_") + "_wtrack`;")
        settings.cursor.execute("drop view if exists `" + DB[0] + "`.`" + string.replace(UID, "-", "_") + "_islands`;")

    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_islands`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_atdp`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_atdph`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_isoforms`;")
    settings.cursor.execute("drop view if exists `" + EDB + "`.`" + UID + "_genes`;")
    settings.cursor.execute("drop view if exists `" + EDB + "`.`" + UID + "_common_tss`;")

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=10,forcerun=0, tagstotal=0,tagsmapped=0,tagsribo=0,tagsused=0,tagssuppressed=0 where uid=%s",
                            ("Ready to be reanalyzed", UID))
    settings.conn.commit()
