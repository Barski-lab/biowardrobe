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

BOWTIE_INDEXES="/data/DATA/indexes"
BASE_DIR="/data/DATA/FASTQ-DATA"

arguments = Arguments.Arguments(sys.argv)
arguments.checkArguments(2)

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




def file_exist(basedir,fname,extension):
    LIST=glob.glob(basedir+'/'+fname+'.'+extension)
    return LIST

def make_fname(fname):
    outfname=os.path.basename(fname)
    outfname=re.sub('[^a-zA-Z0-9\.]','_',outfname)
    outfname=re.sub('\.'+extension+'','',outfname)
    return outfname

def run_bowtie(infile,findex,pair):

    if pair:
	#FL=file_exist('.',infile,'bam')
	FN=infile.split(";")
        if len(file_exist('.',FN[0],'bam')) == 1 and len(file_exist('.',FN[1],'bam')) == 1:
            success[1]='Bam file exists'
	    return success

	PAR='bowtie -q -v 3 -m 1 --best --strata -p 24 -S '+BOWTIE_INDEXES+'/'+findex+' -1 '+FN[0]+'.fastq -2 '+FN[1]+'.fastq 2>./'+FN[0]+'.bw | samtools view -Sb - >./'+FN[0]+'.bam 2>/dev/null'
    else:
        if len(file_exist('.',infile,'bam')) == 1:
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


def run_fence(infile):
    PAR=''
    
    if ";" in infile:
	FN=infile.split(";")
	if len(file_exist('.',FN[0],'fence')) == 1:
	    success[1]='Fence file exists'
	    return success
	PAR='fence.py --in="'+infile+'" >'+FN[0]+'.fence'
    else:	
	FL=file_exist('.',infile,'fence')
	if len(FL) == 1:
	    success[1]='Fence file exists'
	    return success
	PAR='fence.py --in=./'+infile+'.fastq >'+infile+'.fence'

    RET=''
    try:
	RET=s.Popen(PAR,shell=True)
	success[1]=' Fence backgrounded'
	return success
    except Exception,e:
	error[1]=str(e)
	return error

def run_bedgraph(infile,group,name4browser,bedformat,db,pair):

#    FL=file_exist('.',infile,'log')
    
#    if len(FL) == 1:
#	success[1]=' Bedgraph uploaded'
#	return success

    PAR=''
    if not pair:
	PAR='bam2bedgraph -sql_table="'+infile+'" -in="'+infile+'.bam" -out="'+infile+'.out" -log="'+infile+'.log"' 
	PAR=PAR+' -bed_trackname="'+name4browser+'" -sql_grp="'+group+'" -bed_window=200 -bed_siteshift=75 -bed_format='+bedformat+' -no-bed-file -sql_host=localhost -sql_dbname='+db

    RET=''
    try:
	RET=s.check_output(PAR,shell=True)
	success[1]=' Upload to genome browser success'
	return success
    except Exception,e:
	error[1]=str(e)
	return error

def get_stat(infile):

    FL=file_exist('.',infile,'bw')
    TOTAL=100
    ALIGNED=80    
    SUPRESSED=0
        
    if len(FL) == 1:
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

    
    
    


    #if [ $? -eq 0 ]; then
    #LC=`wc -l ${NA}|awk '{print $1/4}'`
    #grep 'Aligned:' ${NA}.log |awk -v tot=${LC} -F'Aligned: ' '{printf("Total: %d\nAligned: %d\nPercent: %f\n",tot,$2,$2*100/tot);}' >${NA}.stat

######################################################
try:
    conn = MySQLdb.connect (host = arguments.readString("SQLE/HOST"),user = arguments.readString("SQLE/USER"), passwd=arguments.readPass("SQLE/PASS"), db=arguments.readString("SQLE/DB"))
    conn.set_character_set('utf8')
    cursor = conn.cursor ()
except Exception, e: 
    Error_str=str(e)
    error_msg("Error database connection"+Error_str)


cursor.execute("update labdata set libstatustxt='ready for process',libstatus=10 where libstatus=2 and experimenttype_id in (select id from experimenttype where etype like 'DNA%')")




while True:
    row=[]
    cursor.execute ("select e.etype,l.name4browser,g.db,g.findex,g.annotation,filename,w.worker,browsergrp,l.id "
    " from labdata l,experimenttype e,genome g,worker w "
    " where e.id=experimenttype_id and g.id=genome_id and w.id=worker_id and e.etype like 'DNA%' and libstatus in (10,1010) "
    " order by dateadd limit 1")
    row = cursor.fetchone()
    if not row:
	break

    PAIR=('pair' in row[0])
    #FNAME=''
    FNAME=row[5]
    DB=row[2]
    FINDEX=row[3]
    ANNOTATION=row[4]
    GROUP=row[7]
    LID=row[8]
    NAME=row[1]
    SUBDIR='/DNA'
    BEDFORMAT='4'
    if GROUP == "":
	GROUP=row[6]
	
    cursor.execute("update labdata set libstatustxt='processing',libstatus=11 where id=%s",LID)
    conn.commit()

    basedir=BASE_DIR+'/'+row[6].upper()+SUBDIR

    os.chdir(basedir)
    
    FL=[]
    if not PAIR:
	FL=file_exist('.',FNAME,'fastq')

    if not PAIR and len(FL) == 1:
	run_fence(FNAME)

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

        a=run_bedgraph(FNAME,GROUP,NAME,BEDFORMAT,DB,PAIR)
	if 'Error' in a[0]:
	    cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
	    conn.commit()
	    continue

	cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where id=%s",(a[0]+": "+a[1],LID))
	conn.commit()

	a=get_stat(FNAME)
	if type(a[0]) == str and 'Error' in a[0]:
	    cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
	    conn.commit()
	    continue
        cursor.execute("update labdata set libstatustxt='Complete',libstatus=12,tagstotal=%s,tagsmapped=%s,tagsribo=%s where id=%s",(a[0],a[1],a[2],LID))
	conn.commit()

    OK=False
    FN=[]
    if PAIR:
	FN=FNAME.split(";")
	FL1=file_exist('.',FN[0],'fastq')
	FL2=file_exist('.',FN[1],'fastq')
	if len(FL1)==1 and len(FL2)==1:
	    OK=True

    if PAIR and OK:
	run_fence(FNAME)

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

        #a=run_bedgraph(FL[0],GROUP,NAME,BEDFORMAT,DB,PAIR)
	#if 'Error' in a[0]:
	#    cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
	#    conn.commit()
	#    continue

	#cursor.execute("update labdata set libstatustxt=%s,libstatus=11 where id=%s",(a[0]+": "+a[1],LID))
	#conn.commit()

	a=get_stat(FN[0])
	if type(a[0]) == str and 'Error' in a[0]:
	    cursor.execute("update labdata set libstatustxt=%s,libstatus=2010 where id=%s",(a[0]+": "+a[1],LID))
	    conn.commit()
	    continue
        cursor.execute("update labdata set libstatustxt='Complete',libstatus=12,tagstotal=%s,tagsmapped=%s,tagsribo=%s where id=%s",(a[0],a[1],a[2],LID))
	conn.commit()


    #cursor.execute("update labdata set libstatustxt='processing',libstatus=10 where id=%s",LID)
    #conn.commit()    
    #('RNA-Seq dUTP', 'Activated_rested CD4', 'hg19', 'hg19c', 'hg19_refsec_genes_control', 'run0140_lane5_read1_index10_ABYR14', 'yrina')
    
    
    