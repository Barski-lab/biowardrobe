#!/usr/bin/env python

# #/****************************************************************************
##**
##** Copyright (C) 2011 Andrey Kartashov .
##** All rights reserved.
##** Contact: Andrey Kartashov (porter@porter.st)
##**
##** This file is part of the global module of the genome-tools.
##**
##** GNU Lesser General Public License Usage
##** This file may be used under the terms of the GNU Lesser General Public
##** License version 2.1 as published by the Free Software Foundation and
##** appearing in the file LICENSE.LGPL included in the packaging of this
##** file. Please review the following information to ensure the GNU Lesser
##** General Public License version 2.1 requirements will be met:
##** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
##**
##** Other Usage
##** Alternatively, this file may be used in accordance with the terms and
##** conditions contained in a signed written agreement between you and Andrey Kartashov.
##**
##****************************************************************************/

import os
import sys

import smtplib
import glob
import subprocess as s
import time
import re
import random
import MySQLdb 
import warnings
import string


def send_mail(toaddrs, body):
    fromaddr = 'ems@ems.chmccorp.cchmc.org'
    # Add the From: and To: headers at the start!
    msg = ("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n"
           % (fromaddr, toaddrs, body))
    msg = msg + body

    server = smtplib.SMTP('localhost')
    server.set_debuglevel(1)
    server.sendmail(fromaddr, toaddrs, msg)
    server.quit()


def check_pid(pid):
    """ Check For the existence of a unix pid. """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True


def check_running(fname):
    if os.path.isfile(fname):
        old_pid = file(fname, 'r').readline()
        if check_pid(int(old_pid)):
            sys.exit()
    file(fname, 'w').write(str(os.getpid()))


def file_exist(basedir, fname, extension):
    return glob.glob(basedir + '/' + fname + '.' + extension)


def macs_data(infile):
    FRAGMENT = 0
    ISLANDS = 0
    FNAME = infile
    for line in open(FNAME + '_macs_peaks.xls'):
        if re.match('^# d = ', line):
            FRAGMENT = int(line.split('d = ')[1])
            continue
        if re.match('^#', line):
            continue
        if line.strip() != "":
            ISLANDS = ISLANDS + 1
    ISLANDS = ISLANDS - 1  # header
    return [FRAGMENT, ISLANDS]


def upload_macsdata(conn, infile, dbexp, db):
    warnings.filterwarnings('ignore', category=MySQLdb.Warning)
    cursor = conn.cursor()

    if len(file_exist('.', infile + '_macs_peaks', 'xls')) != 1:
        return ['Error', ' MACS peak file does not exist']

    table_name = dbexp + '.`' + infile + '_islands`'
    gb_table_name = db + '.`' + infile + '_islands`'

    cursor.execute("DROP TABLE IF EXISTS " + table_name)
    cursor.execute(""" CREATE TABLE """ + table_name + """
        ( chrom VARCHAR(255) NOT NULL,
    start INT(10) UNSIGNED NOT NULL,
    end INT(10) UNSIGNED NOT NULL,
    length INT(10) UNSIGNED NOT NULL,
    abssummit INT(10),
    pileup FLOAT,
    log10p FLOAT,
    foldenrich FLOAT,
    log10q FLOAT,
    INDEX chrom_idx (chrom) USING BTREE,
    INDEX start_idx (start) USING BTREE,
    INDEX end_idx (end) USING BTREE
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 """)
    conn.commit()

    cursor.execute("""CREATE OR REPLACE VIEW """ + gb_table_name +
                   """ AS select 0 as bin, chrom, start as chromStart, end as chromEnd,
                   max(log10p) as name, max(log10q) as score
                   from """ + table_name + """ group by chrom,start,end; """)
    conn.commit()

    SQL = "INSERT INTO " + table_name + " (chrom,start,end,length,abssummit,pileup,log10p,foldenrich,log10q) VALUES"
    SQLB = "INSERT INTO " + table_name + " (chrom,start,end,length,pileup,log10p,foldenrich,log10q) VALUES"

    skip = True
    broad = False
    islands = 0
    for line in open(infile + '_macs_peaks.xls', 'r'):
        if re.match('^#', line) or line.strip() == "":
            continue
        if skip:
            a = line.strip().split('\t')
            broad = ("pileup" in a[4])
            skip = False
            continue
        a = line.strip().split('\t')
        islands += 1
        try:
            if broad:
                cursor.execute(SQLB + " (%s,%s,%s,%s,%s,%s,%s,%s)", (a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]))
            else:
                cursor.execute(SQL + " (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                               (a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]))
            conn.commit()
        except Exception, e:
            return ['Error', line + ":" + str(e)]
    return ['Success', islands]


def run_macs(infile, db, fragsize=150, fragforce=False, pair=False, broad=False, force=None, bin="/wardrobe/bin"):
    format = "BAM"
    shiftsize = int(fragsize / 2)

    if pair:
        format = "BAMPE"

    if len(file_exist('.', infile, 'bam')) != 1:
        return ['Error', 'Bam file does not exist']

    if force:
        FL = file_exist('.', infile + '_macs_peaks', 'xls')
        if len(FL) == 1:
            os.unlink(FL[0])

    if len(file_exist('.', infile + '_macs_peaks', 'xls')) == 1:
        return ['Success', ' Macs analyzes done ']

    #samtools view -H b4f4ede6-e866-11e3-9546-ac162d784858.bam |grep 'SQ'| awk -F'LN:' '{print $2}'|paste -sd+ | bc
    G = 'hs'
    if 'mm' in db:
        G = 'mm'

    ADPAR = ""
    if fragforce:
        ADPAR += " --nomodel "
    else:
        ADPAR += " --bw " + str(fragsize)

    if broad:
        ADPAR += " --broad "
    else:
        ADPAR += " --call-summits "

    cmd = bin+'/macs callpeak -t ' + infile + '.bam -n ' + infile + '_macs -g ' + G
    cmd += ' --format ' + format + ' -m 3 60  --verbose 0 --shiftsize=' + str(
        shiftsize) + ' -q 0.01 --nolambda ' + ADPAR + ' >./' + infile + '_macs.log 2>&1'

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' MACS finished ']
    except Exception, e:
        return ['Error', str(e)]


def run_bedgraph(infile, bedformat, db, fragment, isRNA, pair, force=None):
    FL = file_exist('.', infile, 'log')

    if force and len(FL) == 1:
        os.unlink(FL[0])

    if len(file_exist('.', infile, 'log')) == 1:
        return ['Success', ' Bedgraph uploaded']

    cmd = 'bam2bedgraph -sql_table="\`' + db + '\`.\`' + string.replace(infile, "-", "_") + '_wtrack\`" -in="' + infile + '.bam" -out="'
    cmd += infile + '.out" -log="' + infile + '.log"' + ' -bed_format=' + bedformat + ' -no-bed-file '

    if isRNA == 1:
        cmd += ' -bed_type=2 -rna_seq="RNA" '
    elif isRNA == 2:
        cmd += ' -bed_type=2 -rna_seq="dUTP" '
    else:
        if pair:
            cmd += ' -bed_type=2 '
        else:
            cmd += ' -bed_window=' + str(fragment) + ' -bed_siteshift=' + str(fragment / 2)
            cmd += ' -bed_type=3 '

    cmd += ' -bed_normalize '
    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' Upload to genome browser success']
    except Exception, e:
        return ['Error', str(e)]


def run_fence(infile, pair):
    if len(file_exist('.', infile, 'fence')) == 1:
        return ['Success', 'Fence file exists']
    if pair:
        cmd = 'fence.py --in="' + infile + ';' + infile + '_2" >' + infile + '.fence'
    else:
        cmd = 'fence.py --in="' + infile + '.fastq" >' + infile + '.fence'
    try:
        s.Popen(cmd, shell=True)
        return ['Success', ' Fence backgrounded']
    except Exception, e:
        return ['Error', str(e)]


def run_atp(lid,bin="/wardrobe/bin"):
    cmd = bin+'atdp -avd_luid="' + lid + '" -log="./AverageTagDensity.log" '
    cmd += ' -sam_twicechr="chrX chrY" -sam_ignorechr="chrM" -avd_window=5000 -avd_smooth=50 -avd_heat_window=5 '

    try:
        s.check_output(cmd, shell=True)
        return ['Success', ' ATP finished ']
    except Exception, e:
        return ['Error', str(e)]
