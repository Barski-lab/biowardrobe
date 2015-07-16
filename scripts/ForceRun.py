#!/usr/bin/env python

# /****************************************************************************
# **
# ** Copyright (C) 2011-2014 Andrey Kartashov .
# ** All rights reserved.
# ** Contact: Andrey Kartashov (porter@porter.st)
# **
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
import datetime
from warnings import filterwarnings

print str(datetime.datetime.now())

filterwarnings('ignore', category=MySQLdb.Warning)

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']
WARDROBEROOT = settings.settings['wardrobe']
PRELIMINARYDATA = WARDROBEROOT + '/' + settings.settings['preliminary']
TEMP = WARDROBEROOT + '/' + settings.settings['temp']
BIN = WARDROBEROOT + '/' + settings.settings['bin']
BOWTIE_INDICES = WARDROBEROOT + '/' + settings.settings['indices']

pidfile = TEMP+"/runForceRUN.pid"
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
    settings.cursor.execute("SELECT e.etype,g.db,l.uid,l.deleted,COALESCE(l.download_id,0) "
                            " FROM labdata l,experimenttype e,genome g "
                            " WHERE e.id=experimenttype_id AND g.id=genome_id AND "
                            "((forcerun=1 AND libstatus >11 AND deleted=0) OR deleted=1)"
                            " ORDER BY dateadd LIMIT 1")
    row = settings.cursor.fetchone()
    if not row:
        break

    print "ROW:" + str(row)

    PAIR = ('pair' in row[0])
    isRNA = ('RNA' in row[0])
    DB = row[1]
    UID = row[2]
    isCore = (int(row[4]) == 1)
    isDeleted = (int(row[3]) != 0)

    basedir = PRELIMINARYDATA + '/' + UID
    try:
        os.chdir(basedir)

        for root, dirs, files in os.walk("./", topdown=False):
            for name in files:
                if "fastq" in name:
                    continue
                os.remove(os.path.join(root, name))
        shutil.rmtree(basedir + '/tophat', True)
    except:
        pass

    cmd = ""

    if not isDeleted:
        cmd = 'bunzip2 ' + UID + '*.fastq.bz2'

        try:
            s.check_output(cmd, shell=True)
        except Exception, e:
            error_update(str(e), UID)

        if not os.path.isfile(UID + '.fastq'):
            continue
        if not os.path.isfile(UID + '_2.fastq') and PAIR:
            continue

    else:
        if not isCore:
            shutil.rmtree(basedir, True)

    settings.cursor.execute("SELECT DISTINCT db FROM genome;")
    for DB in settings.cursor.fetchall():
        settings.cursor.execute("DROP TABLE IF EXISTS `" + DB[0] + "`.`" + string.replace(UID, "-", "_") + "_wtrack`;")
        settings.cursor.execute("DROP TABLE IF EXISTS `" + DB[0] + "`.`" + string.replace(UID, "-", "_") + "_islands`;")
        settings.cursor.execute("drop view if exists `" + DB[0] + "`.`" + string.replace(UID, "-", "_") + "_islands`;")

    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_islands`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_atdp`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_atdph`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_isoforms`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_genes`;")
    settings.cursor.execute("DROP TABLE IF EXISTS `" + EDB + "`.`" + UID + "_common_tss`;")
    settings.cursor.execute("drop view if exists `" + EDB + "`.`" + UID + "_genes`;")
    settings.cursor.execute("drop view if exists `" + EDB + "`.`" + UID + "_common_tss`;")

    if isDeleted:
        settings.cursor.execute(
            "update labdata set libstatustxt=%s,deleted=2 where uid=%s",
            ("Deleted", UID))
    else:
        settings.cursor.execute(
            "update labdata set libstatustxt=%s,libstatus=10,forcerun=0, tagstotal=0,tagsmapped=0,tagsribo=0,tagsused=0,tagssuppressed=0 where uid=%s",
            ("Ready to be reanalyzed", UID))
    settings.conn.commit()
