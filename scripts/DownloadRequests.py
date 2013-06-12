#! /usr/bin/env python
##
##
## Selecting data from MySQL database with respect to status downloading files from website
##
##

import os
import sys
import Arguments
import requests
import re
import random
import MySQLdb 
import glob
import DefFunctions as d
import subprocess as s # import call
import datetime

now = datetime.datetime.now()

print str(now)

main_page='http://dna.cchmc.org/www/main.php'
login_page='http://dna.cchmc.org/www/logon.php'
request_page='http://dna.cchmc.org/www/results/nextgen_results.php'
download_page='http://dna.cchmc.org/www/results/nextgen_download.php'


BASE_DIR='/data/DATA/FASTQ-DATA'

extension='fastq'
#libcode='ABYR31'
arguments = Arguments.Arguments(sys.argv)

error=list()
error.append('Error')
error.append('')
warning=list()
warning.append('Warning')
warning.append('')


def error_msg(msg):
    #print """
    #	{"success": false, "message": "%s" }"""%(msg.replace('"','\\"'))
    print """ %s """%(msg)
    sys.exit()


def file_exist(basedir,libcode):
    LIST=glob.glob(basedir+'/*'+libcode+'*.fastq')
    return LIST

def make_fname(fname):
    outfname=os.path.basename(fname)
    outfname=re.sub('[^a-zA-Z0-9\.]','_',outfname)
    outfname=re.sub('\.gz','',outfname)
    outfname=re.sub('\.'+extension+'','',outfname)
    if len(outfname)>45:
	outfname=outfname[:45]	
    return outfname

def get_file(USERNAME,PASSWORD,libcode,basedir,pair):
    #
    flist=list()
    fl=file_exist(basedir,libcode)
    for i in fl:
	mf=make_fname(i)
	newfn=os.path.basename(i)
	if mf != newfn:
	    os.rename(i,basedir+'/'+mf+'.'+extension)
	flist.append(mf)
    if len(flist)==2 and pair: #should we check that the name are the same ?
	return flist
    if len(flist)==1 and not pair:
	return flist

    if len(flist) > 2 and pair: #should we check that the name are the same ?
	error[1]='incorrect number of files for pair end reads'
	return error
    if len(flist) > 1 and not pair: #should we check that the name are the same ?
	error[1]='incorrect number of files for single end reads'
	return error


    session = requests.session()
    session.get(main_page)

    session.post(login_page,data={'username': USERNAME, 'password': PASSWORD})

    r = session.get(request_page)

    fname=list()
    path=list()
    flist=list()
    ofname=str()
    gz=False
    #print r.text
    if 'logon_form' in r.text:
	error[1]='incorrect DNA core credentials'
	return error
    for line in r.text.splitlines():
	if '/data' in line:
	    split_line=line.split('\'')
	    if extension in split_line[3] and libcode in split_line[3]:
		path.append(split_line[1])
		fname.append(split_line[3])
		if re.search("\.gz$",split_line[3]):
		    gz=True
		
    if len(fname) == 1 and not pair:
	r = session.get(download_page+'?file='+path[0]+'&name='+fname[0])
	outfname=make_fname(fname[0])+'_'+str(random.randrange(10000,99999))

	if os.path.isfile(basedir+'/'+outfname+'.'+extension):
	    error[1] = 'Now file exist'
	    return error
	    
	ofname=basedir+'/'+outfname+'.'+extension

	if gz:
	    ofname=basedir+'/'+outfname+'.'+extension+'.gz'
	    
	if r.status_code == 200:
	    with open(ofname, 'wb') as f:
    		for chunk in r.iter_content(1024*1024):
        	    f.write(chunk)

	    PAR='gunzip '+ofname    	
	    RET=''
	    try:
		RET=s.check_output(PAR,shell=True)
	    except Exception,e:
        	print "error ungzip"+RET
		pass
	    flist.append(outfname)
	    return flist

    if len(fname) == 2 and pair:
	rnd=str(random.randrange(10000,99999))

	for i in range(2):
	    r = session.get(download_page+'?file='+path[i]+'&name='+fname[i])
	    outfname=make_fname(fname[i])+'_'+rnd
	    
	    ofname=basedir+'/'+outfname+'.'+extension
	    if gz:
		ofname=basedir+'/'+outfname+'.'+extension+'.gz'
		
	    if os.path.isfile(basedir+'/'+outfname+'.'+extension):
		error[1]='Now file exist'
		return error
	    
	    if r.status_code == 200:
		with open(ofname, 'wb') as f:
    		    for chunk in r.iter_content(1024*1024):
        		f.write(chunk)
		PAR='gunzip '+ofname    	
		RET=''
		try:
		    RET=s.check_output(PAR,shell=True)
		except Exception,e:
        	    print "error ungzip"+RET
		    pass
		
		flist.append(outfname)	
	return flist
	
	
    warning[1]='Cant find file'
    return warning
#### end of def




#USERNAME=''
#PASSWORD=''

pidfile = "/tmp/DownloadRequests.pid"
d.check_running(pidfile)

try:
    conn = MySQLdb.connect (host = arguments.readString("SQLE/HOST"),user = arguments.readString("SQLE/USER"), passwd=arguments.readPass("SQLE/PASS"), db=arguments.readString("SQLE/DB"))
    conn.set_character_set('utf8')
    cursor = conn.cursor ()
except Exception, e: 
    Error_str=str(e)
    error_msg("Error database connection"+Error_str)

    
#in future if exist stus 1 delete temporary donloaded files
cursor.execute ("update labdata set libstatus=2000 where libstatus in (1)")
cursor.execute ("update labdata set libstatus=0 where libstatus in (1000)")
conn.commit()


while True:
    row=[]
    cursor.execute ("select dnalogin,dnapass,a.libcode,worker,a.id, etype e,w.email,w.notify from labdata a, worker w,experimenttype e "
	" where a.worker_id =w.id and e.id=experimenttype_id "
	" and dnalogin is not null and dnalogin <> '' "
	" and dnapass is not null and dnapass <> '' and a.libcode <> '' and libstatus in (0) limit 1")
    row = cursor.fetchone()

    if not row:
	break
    
    notify=(int(row[7])==1)
    email=row[6]
    
    PAIR=('pair' in row[5])
    SUBDIR='/DNA'
    if 'RNA' in row[5]:
	SUBDIR='/RNA'

    cursor.execute("update labdata set libstatustxt='downloading',libstatus=1 where id=%s",row[4])
    conn.commit()
	
    basedir=BASE_DIR+'/'+row[3].upper()+SUBDIR
    try:
	os.makedirs(basedir,0775)
    except:
	pass
    #print row[0]
    a=get_file(row[0],row[1],row[2],basedir,PAIR)
    if 'Error' in a[0]:
	cursor.execute("update labdata set libstatustxt=%s,libstatus=2000 where id=%s",(a[0]+":"+a[1],row[4]))
	conn.commit()
	if 'incorrect DNA core credentials' in a[1]:
	    cursor.execute("update worker set dnapass='' where worker like %s",(row[3]))
	    conn.commit()
	continue

    if 'Warning' in a[0]:
	cursor.execute("update labdata set libstatustxt=%s,libstatus=1000 where id=%s",(a[0]+":"+a[1],row[4]))
	conn.commit()
	continue
    if len(a)==1 and not PAIR:
	cursor.execute("update labdata set libstatustxt='downloaded',libstatus=2,filename=%s where id=%s",(a[0],row[4]))

    if len(a)==2 and PAIR:
	cursor.execute("update labdata set libstatustxt='downloaded',libstatus=2,filename=%s where id=%s",(a[0]+";"+a[1],row[4]))

    if notify:
    	d.send_mail(email,'Record #'+str(row[4])+' has been downloaded')

    conn.commit()

cursor.close()
conn.commit()
conn.close()
