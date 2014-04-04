#! /usr/bin/env python
##
##
## Selecting data from MySQL database with respect to status downloading files from website
##
##

import os
import sys
import Arguments
import DefFunctions as d
import re
import random
import MySQLdb 
import glob
import subprocess as s # import call
import time


arguments = Arguments.Arguments(sys.argv)
arguments.checkArguments(2)

BOWTIE_INDEXES=arguments.readString("BOWTIE_INDEXES")
BASE_DIR=arguments.readString("BASE_DIR")

pidfile = "/tmp/runDNA"+str(arguments.opt.id)+".pid"

d.check_running(pidfile)

error=list()
error.append('Error')
error.append('')
warning=list()
warning.append('Warning')
warning.append('')
success=list()
success.append('Success')
success.append('')


def run_bowtie(infile,findex,pair):

    if pair:
	FN=infile.split(";")
        if len(d.file_exist('.',FN[0],'bam')) == 1:
            success[1]='Bam file exists'
	    return success
	PAR='bowtie -q -v 3 -m 1 --best --strata -p 24 -S '+BOWTIE_INDEXES+'/'+findex+' -1 '+FN[0]+'.fastq -2 '+FN[1]+'.fastq 2>./'+FN[0]+'.bw | samtools view -Sb - >./'+FN[0]+'.bam 2>/dev/null'
    else:
        if len(d.file_exist('.',infile,'bam')) == 1:
            success[1]='Bam file exists'
	    return success
	PAR='bowtie -q -v 2 -m 1 --best --strata -p 24 -S '+BOWTIE_INDEXES+'/'+findex+' '+infile+'.fastq 2>./'+infile+'.bw | samtools view -Sb - >./'+infile+'.bam 2>/dev/null'
    	
    RET=''
    try:
	RET=s.check_output(PAR,shell=True)
	success[1]=' Bowtie done'
	success.append(RET)
	return success
    except Exception,e:
	error[1]=str(e)
	return error


def get_stat(infile):
    TOTAL=100
    ALIGNED=80    
    SUPRESSED=0
    
    infile=infile.split(";")[0]
        
    if len(d.file_exist('.',infile,'bw')) == 1:
	for line in open(infile+'.bw'):
	    if 'processed:' in line:
		TOTAL=int(line.split('processed:')[1])
	    if 'alignment:' in line:
		ALIGNED=int(line.split('alignment:')[1].split()[0])
	    if 'due to -m:' in line:
		SUPRESSED=int(line.split('due to -m:')[1].split()[0])

	fp = open('./'+infile+'.stat', 'w+')
        fp.write(str((TOTAL,ALIGNED,SUPRESSED)))
        fp.close()
        return (TOTAL,ALIGNED,SUPRESSED)
    else:
	error[1]='Cant read bowtie output'
	return error

    
    
######################################################
try:
    conn = MySQLdb.connect (host = arguments.readString("SQLE/HOST"),user = arguments.readString("SQLE/USER"), passwd=arguments.readPass("SQLE/PASS"), db=arguments.readString("SQLE/DB"))
    conn.set_character_set('utf8')
    cursor = conn.cursor ()
except Exception, e: 
    Error_str=str(e)
    d.error_msg("Error database connection"+Error_str)

#FIXME genomebrowser info
cursor.execute("update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'DNA%') " 
" and COALESCE(browsergrp,'') <> '' and COALESCE(name4browser,'') <> '' ")




while True:
    row=[]
    cursor.execute ("select e.etype,l.name4browser,g.db,g.findex,g.annotation,filename,w.worker,browsergrp,l.id,fragmentsizeexp,fragmentsizeforceuse,browsershare "
    " from labdata l,experimenttype e,genome g,worker w "
    " where e.id=experimenttype_id and g.id=genome_id and w.id=worker_id and e.etype like 'DNA%' and libstatus in (10,1010) "
    " order by dateadd limit 1")
    row = cursor.fetchone()
    if not row:
	break

    PAIR=('pair' in row[0])
    isRNA=('RNA' in row[0])
    FNAME=row[5]
    DB=row[2]
    FINDEX=row[3]
    ANNOTATION=row[4]
    GROUP=row[7]
    LID=row[8]
    FRAGEXP=int(row[9])
    FRAGFRC=(int(row[10])==1)
    BROWSERSHARE=(int(row[11])==1)
    NAME=row[1]
    SUBDIR='/DNA'
    if isRNA:
	SUBDIR='/RNA'
    BEDFORMAT='4'
    FRAGMENT=0
    if GROUP == "":
	GROUP=row[6]
	
    cursor.execute("update labdata set libstatustxt='processing',libstatus=11 where id=%s",LID)
    conn.commit()
    
    if len(NAME) < 1:
	cursor.execute("update labdata set libstatustxt='processing',libstatus=1010 where id=%s",LID)
	conn.commit()
	continue
	
    basedir=BASE_DIR+'/'+row[6].upper()+SUBDIR
    os.chdir(basedir)
    
    FN=list()
    OK=True
    for i in FNAME.split(";"):
	FN.append(i)
	if len(d.file_exist('.',i,'fastq'))!=1:
	    OK=False
	    break
    if not OK:
	cursor.execute("update labdata set libstatustxt='Files do not exists',libstatus=2010 where id=%s",LID)
	conn.commit()
	continue	    


    d.run_fence(FNAME)

    a=run_bowtie(FNAME,FINDEX,PAIR)
    if 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue
    if 'Warning' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=1010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where id=%s",(a[0]+": "+a[1],LID))
    conn.commit()

    a=d.run_macs(FNAME,DB,FRAGEXP,FRAGFRC,False,True)
    #def run_macs(infile,db,fragsize=150,fragforce=False,broad=False,force=None):
    if 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=4010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    a=d.macs_data(FNAME)    
    FRAGMENTE=a[0]

    if FRAGMENTE<80:
    	a=d.run_macs(FNAME,DB,FRAGEXP,True,False,True)
	if 'Error' in a[0]:
    	    cursor.execute("update labdata set libstatustxt=%s,libstatus=4010 where id=%s",(a[0]+": "+a[1],LID))
    	    conn.commit()
    	    continue
	a=d.macs_data(FNAME)    
	FRAGMENT=FRAGEXP
    else:
	FRAGMENT=FRAGMENTE

    ISLANDS=a[1]
    cursor.execute("update labdata set fragmentsize=%s,fragmentsizeest=%s,islandcount=%s where id=%s",(FRAGMENT,FRAGMENTE,ISLANDS,LID))
    conn.commit()

    a=d.upload_macsdata(conn,FNAME,arguments.readString("SQLEX/DB"),DB,NAME,GROUP,BROWSERSHARE)
    if 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=4010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

#    ISLANDS=0
#    for line in open(FN[0]+'_macs_peaks.xls'):
#        if re.match('^# d = ',line):
#            FRAGMENT=int(line.split('d = ')[1])
#            continue
#        if re.match('^#',line):
#            continue
#        if line.strip() != "":
#            ISLANDS=ISLANDS+1
#    cursor.execute("update labdata set fragmentsize=%s where id=%s",(FRAGMENT,LID))
#    conn.commit()
	
#    if ISLANDS <100 or FRAGMENT<90:
#        FRAGMENT=150
    a=d.run_bedgraph(FNAME,GROUP,NAME,BEDFORMAT,DB,FRAGMENT,isRNA)
    if 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    cursor.execute ("""
    update """+DB+""".trackDb_local set 
    settings='parent """+FN[0]+"""_grp\ntrack """+FN[0]+"""\nautoScale on\nwindowingFunction maximum'
    where tablename like '"""+FN[0]+"""';""");

    cursor.execute ("""
    delete from """+DB+""".trackDb_external where tablename like '"""+FN[0]+"""'; """)
    conn.commit()
    
    if BROWSERSHARE:
	cursor.execute ("""
	insert into """+DB+""".trackDb_external select * from """+DB+""".trackDb_local where tablename like '"""+FN[0]+"""';""");    
	conn.commit()
	cursor.execute ("""
	update """+DB+""".trackDb_external set 
	settings='parent """+FN[0]+"""_grp\ntrack """+FN[0]+"""\nautoScale on\nwindowingFunction maximum'
	where tablename like '"""+FN[0]+"""';""");
	conn.commit()

    cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where id=%s",(a[0]+": "+a[1],LID))
    conn.commit()

    a=d.run_atp(LID)
    if type(a[0]) == str and 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    #statistics must be followed last update
    a=get_stat(FNAME)
    if type(a[0]) == str and 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    cursor.execute("update labdata set libstatustxt='Complete',libstatus=12,tagstotal=%s,tagsmapped=%s,tagsribo=%s where id=%s",(a[0],a[1],a[2],LID))
    conn.commit()
    
        