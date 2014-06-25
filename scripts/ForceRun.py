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
        cmd = 'bunzip2 ' + UID + '.fastq.bz2;'
        cmd += 'bunzip2 ' + UID + '_2.fastq.bz2;'
    else:
        cmd = 'bunzip2 ' + UID + '.fastq.bz2'

    try:
        s.check_output(cmd, shell=True)
    except Exception, e:
        error_update(str(e), UID)
        continue

    if os.path.isfile(basedir + '/' + UID + '_trimmed.fastq'):
        os.unlink(basedir + '/' + UID + '_trimmed.fastq')
    if os.path.isfile(basedir + '/' + UID + '_trimmed_2.fastq'):
        os.unlink(basedir + '/' + UID + '_trimmed_2.fastq')
    if os.path.isfile(basedir + '/' + UID + '_trimmed.fastq.bz2'):
        os.unlink(basedir + '/' + UID + '_trimmed.fastq.bz2')
    if os.path.isfile(basedir + '/' + UID + '_trimmed_2.fastq.bz2'):
        os.unlink(basedir + '/' + UID + '_trimmed_2.fastq.bz2')
    if os.path.isfile(basedir + '/' + UID + '.bam'):
        os.unlink(basedir + '/' + UID + '.bam')
    if os.path.isfile(basedir + '/' + UID + '.bam.bai'):
        os.unlink(basedir + '/' + UID + '.bam')
    if os.path.isfile(basedir + '/' + UID + '.log'):
        os.unlink(basedir + '/' + UID + '.log')
    if os.path.isfile(basedir + '/' + UID + '.fence'):
        os.unlink(basedir + '/' + UID + '.fence')
    if os.path.isfile(basedir + '/' + UID + '.bw'):
        os.unlink(basedir + '/' + UID + '.bw')
    if os.path.isfile(basedir + '/' + UID + '.stat'):
        os.unlink(basedir + '/' + UID + '.stat')
    if os.path.isfile(basedir + '/' + UID + '_macs_peaks.xls'):
        os.unlink(basedir + '/' + UID + '._macs_peaks.xls')
    if os.path.isfile(basedir + '/' + UID + '_macs_model.r'):
        os.unlink(basedir + '/' + UID + '_macs_model.r')
    if os.path.isfile(basedir + '/' + UID + '.ribo'):
        os.unlink(basedir + '/' + UID + '.ribo')
    if os.path.isfile(basedir + '/' + UID + '_rpkm.log'):
        os.unlink(basedir + '/' + UID + '_rpkm.log')
    if os.path.isfile(basedir + '/' + UID + '_rpkm_error.log'):
        os.unlink(basedir + '/' + UID + '_rpkm_error.log')
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

    settings.cursor.execute("update labdata set libstatustxt=%s,libstatus=10,forcerun=0, tagstotal=0,tagsmapped=0,tagsribo=0 where uid=%s",
                            ("Ready to be reanalyzed", UID))
    settings.conn.commit()
