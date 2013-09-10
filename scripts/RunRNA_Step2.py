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
ANNOTATION_BASE=BOWTIE_INDEXES+"/gtf/"

pidfile = "/tmp/runRNA"+str(arguments.opt.id)+"_Step2.pid"

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


def run_rpkm(infile,name4browser,db,dutp,spike,antab,force=False):

    infile=infile.split(";")[0]
    FL=d.file_exist('.',infile+'_rpkm','log')
    if len(FL) == 1 and force:
	os.unlink(FL[0])
    if len(FL) == 1 and not force:
	success[1]=' Rpkm list uploaded'
	return success
	

    PAR='ReadsCounting -sql_table="'+infile+'" -in="'+infile+'.bam" -out="'+infile+'.csv" -log="'+infile+'_rpkm.log" -rpkm-cutoff=0.001 -rpkm-cutoff-val=0 '
    PAR=PAR+'-sql_query1="select name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2 from '
    PAR=PAR+""+db+"."+antab+" where chrom not like '%\\_%' "
    if not spike:
        PAR=PAR+" and chrom not like 'control%' "
    PAR=PAR+" order by chrom,strand,txStart,txEnd"
    PAR=PAR+'" -bed_trackname="'+name4browser+'" -sql_host=localhost -sql_dbname=experiments '
    PAR=PAR+' -threads=4 -math-converging="arithmetic" -no-file '

    if dutp:
        PAR=PAR+' -rna_seq="dUTP" '
    else:
        PAR=PAR+' -rna_seq="RNA" '	
    if not spike:
	PAR=PAR+' -sam_ignorechr="control" '
    
    RET=''
    try:
	RET=s.check_output(PAR,shell=True)
	#print RET
	success[1]=' RPKMs was uploaded to genome browser'
	return success
    except Exception,e:
	#print RET
	error[1]=str(e)
	return error


######################################################
try:
    conn = MySQLdb.connect (host = arguments.readString("SQLE/HOST"),user = arguments.readString("SQLE/USER"), passwd=arguments.readPass("SQLE/PASS"), db=arguments.readString("SQLE/DB"))
    conn.set_character_set('utf8')
    cursor = conn.cursor ()
except Exception, e: 
    Error_str=str(e)
    d.error_msg("Error database connection"+Error_str)


#cursor.execute("update labdata set libstatustxt='ready for process',libstatus=20 where libstatus=12 and experimenttype_id in (select id from experimenttype where etype like 'RNA%') and id=120")
cursor.execute("update labdata set libstatustxt='ready for process',libstatus=20 where experimenttype_id in (select id from experimenttype where etype like 'RNA%') and libstatus=12")


while True:
    row=[]
    cursor.execute ("select e.etype,l.name4browser,g.db,g.genome,g.annotation,filename,w.worker,l.id,g.annottable "
    " from labdata l,experimenttype e,genome g,worker w "
    " where e.id=experimenttype_id and g.id=genome_id and w.id=worker_id and e.etype like 'RNA%' and libstatus=20 order by dateadd limit 1")
    row = cursor.fetchone()
    if not row:
	break

    PAIR=('pair' in row[0])
    DUTP=('dUTP' in row[0])
    FNAME=row[5]
    if PAIR:
	FNAME=row[5].split(";")[0]

    DB=row[2]
    SPIKE=('spike' in row[3])
    ANNOTATION=row[4]
    ANNOTTABLE=row[8]
    LID=row[7]
    NAME=row[1]
    SUBDIR='/RNA'

    basedir=BASE_DIR+'/'+row[6].upper()+SUBDIR

    os.chdir(basedir)

    if len(d.file_exist('.',FNAME,'bam')) != 1:
        cursor.execute("update labdata set libstatustxt='Cant find bam file',libstatus=2020 where id=%s",LID)
        conn.commit()
        continue

    cursor.execute("update labdata set libstatustxt='processing',libstatus=21 where id=%s",LID)
    conn.commit()

    a=run_rpkm(FNAME,NAME,DB,DUTP,SPIKE,ANNOTTABLE,True)
    if 'Error' in a[0]:
        cursor.execute("update labdata set libstatustxt=%s,libstatus=2020 where id=%s",(a[0]+": "+a[1],LID))
        conn.commit()
        continue

    cursor.execute("update labdata set libstatustxt=%s,libstatus=21 where id=%s",(a[0]+": "+a[1],LID))
    conn.commit()

    
    
    