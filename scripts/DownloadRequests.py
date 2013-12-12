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
import urlparse
import urllib2
import shutil
import base64

print str(datetime.datetime.now())

arguments = Arguments.Arguments(sys.argv)

#global vars

main_page=arguments.readString("main_page")
login_page=arguments.readString("login_page")
request_page=arguments.readString("request_page")
download_page=arguments.readString("download_page")

BOWTIE_INDEXES=arguments.readString("BOWTIE_INDEXES")
BASE_DIR=arguments.readString("BASE_DIR")

extension='fastq'

error=list()
error.append('Error')
error.append('')
warning=list()
warning.append('Warning')
warning.append('')


def error_msg(msg):
    print """ %s """%(msg)
    sys.exit()


def file_exist(basedir,libcode):
    LIST=glob.glob(basedir+'/*'+libcode+'*.fastq')
    return LIST


def make_fname(fname):
    outfname=os.path.basename(fname)
    outfname=re.sub(r'\.gz$|\.bz2$|\.zip$|\.'+extension,'',outfname)
    try:
	outfname=re.match(r'(.*index[0-9]*).*',outfname).group(1)
    except:
	pass
    outfname=re.sub(r'[^a-zA-Z0-9]','_',outfname)
    if len(outfname)>35:
	outfname=outfname[:35]	
    return outfname+'_'+datetime.datetime.now().strftime("%Y%m%d%H%M%S")+str(random.randrange(10,99))


def get_file_core(USERNAME,PASSWORD,libcode,basedir,pair):
    #
    flist=list()
    fl=file_exist(basedir,libcode)
    libcode=libcode.strip()

    if len(fl) > 0 and len(fl)!=2 and pair: 
	error[1]='incorrect number of files for pair end reads'
	return error
    if len(fl) > 0 and len(fl) != 1 and not pair: 
	error[1]='incorrect number of files for single end reads'
	return error

    for i in fl:
	mf=make_fname(i)
	newfn=os.path.basename(i)
	if mf != newfn:
	    os.rename(i,basedir+'/'+mf+'.'+extension)
	flist.append(mf)

    if len(flist)>0:
	return flist


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
	outfname=make_fname(fname[0]) #+'_'+str(random.randrange(10000,99999))

	if os.path.isfile(basedir+'/'+outfname+'.'+extension):
	    error[1] = 'Now file exist'
	    return error
	    
	ofname=basedir+'/'+outfname+'.'+extension

	if gz:
	    ofname=ofname+'.gz'
	    
	if r.status_code == 200:
	    with open(ofname, 'wb') as f:
    		for chunk in r.iter_content(1024*1024):
        	    f.write(chunk)
	    if gz:
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

	for i in range(2):
	    r = session.get(download_page+'?file='+path[i]+'&name='+fname[i])
	    outfname=make_fname(fname[i]) #+'_'+rnd
	    
	    ofname=basedir+'/'+outfname+'.'+extension
	    if gz:
		ofname=ofname+'.gz'
		
	    if os.path.isfile(basedir+'/'+outfname+'.'+extension):
		error[1]='Now file exist'
		return error
	    
	    if r.status_code == 200:
		with open(ofname, 'wb') as f:
    		    for chunk in r.iter_content(1024*1024):
        		f.write(chunk)
        	if gz:	
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
#### end of def get_file




######################################################################

def get_file(urlin,basedir,pair):
    #
    flist=list()

    ofname=str()
    urls=urlin.split(';')
    
    for url in urls:
	if len(url) == 0: 
	    print "empty"
	    continue
	urlparsed=urlparse.urlparse(url)
	if ('http' not in urlparsed[0]) and ('ftp' not in urlparsed[0]):
	    warning[1]='ftp and http methods are supported'
    	    return warning

	if ('@' in urlparsed[1]) and ('http' in urlparsed[0]):
	    lp=urlparsed[1].split('@')[0]
	    username=lp.split(':')[0]
	    password=lp.split(':')[1]
	    url=url.replace(lp+'@','')
	    req = urllib2.Request(url)
	    try:
		r = urllib2.urlopen(req)
	    except IOError, e:
		pass
	    if hasattr(e, 'code') and e.code==401 and 'basic' in e.headers.get('www-authenticate', '').lower():
		base64string = base64.encodestring('%s:%s' % (username, password))[:-1]
		authheader =  "Basic %s" % base64string
		req.add_header("Authorization", authheader)
		try:
		    r = urllib2.urlopen(req)
		except IOError, e:
		    warning[1]='Wrong authorization '+url
		    return warning
		    pass
	    else:
		warning[1]='Unsupported authorization '+ e.headers.get('www-authenticate', '').lower()
		return warning
		pass
	else:
	    r = urllib2.urlopen(url)
	    
	if r.info().has_key('Content-Disposition'):
	# If the response has Content-Disposition, we take file name from it
	    fname = r.info()['Content-Disposition'].split('filename=')[1]
	    if fname[0] == '"' or fname[0] == "'":
		fname = fname[1:-1]
	else:
	    fname=os.path.basename(urlparse.urlparse(r.url)[2])
	    
	if len(fname)==0:
	    fname="default_fastq"

	if 'fastq' not in fname and 'sra' not in fname:
	    warning[1]='File has to contain fastq string'
	    return warning
	#r.close();
    	
    if not pair:
	outfname=make_fname(fname) #+'_'+str(random.randrange(10000,99999))
	if os.path.isfile(basedir+'/'+outfname+'.'+extension):
	    error[1] = 'Now file exist'
	    return error
	    
	ofname=basedir+'/'+outfname+'.'+extension

	PAR=""
	if re.search("\.gz$",fname):
	    PAR='zcat '+ofname+'.gz >>'+ofname+'; rm -f '+ofname+'.gz'
	    ofname=ofname+'.gz'
	elif re.search("\.bz2$",fname):
	    PAR='bzcat '+ofname+'.bz2 >>'+ofname+'; rm -f '+ofname+'.bz2'
	    ofname=ofname+'.bz2'
	elif re.search("\.zip$",fname):
	    PAR='unzip -p '+ofname+'.zip >>'+ofname+'; rm -f '+ofname+'.zip'
	    ofname=ofname+'.zip'
	elif re.search("\.sra$",fname):
	    PAR='fastq-dump -Z -B '+ofname+'.sra >>'+ofname+'; rm -f '+ofname+'.sra'
	    ofname=ofname+'.sra'
	else:
	    PAR='cat '+ofname+'.part >>'+ofname+'; rm -f '+ofname+'.part'
	    ofname=ofname+'.part'
	
	for url in urls:
	    urlparsed=urlparse.urlparse(url)
	    if ('@' in urlparsed[1]) and ('http' in urlparsed[0]):
		lp=urlparsed[1].split('@')[0]
		www=urlparsed[1].split('@')[1]
		username=lp.split(':')[0]
		password=lp.split(':')[1]
		url=url.replace(lp+'@','')
		req = urllib2.Request(url)
		try:
		    r = urllib2.urlopen(req)
		except IOError, e:
		    pass
		if hasattr(e, 'code') and e.code==401 and 'basic' in e.headers.get('www-authenticate', '').lower():
		    base64string = base64.encodestring('%s:%s' % (username, password))[:-1]
		    authheader =  "Basic %s" % base64string
		    req.add_header("Authorization", authheader)
		    try:
			r = urllib2.urlopen(req)
		    except IOError, e:
    			warning[1]='Cant download from '+url
			return warning
			pass
		else:
		    warning[1]='Unsupported authorization '+ e.headers.get('www-authenticate', '').lower()
		    return warning
		    pass
	    else:
		r = urllib2.urlopen(url)
	    try:
        	with open(ofname, 'wb') as f:
            	    shutil.copyfileobj(r,f)
    	    except Exception,e:
    		warning[1]='Cant download from '+url
		return warning
    	    finally:
        	r.close()

	    RET=''
	    try:
		RET=s.check_output(PAR,shell=True)
	    except Exception,e:
    		warning[1]='Cant uncompress '+ofname
		return warning
	flist.append(outfname)
	return flist

    warning[1]='Cant find file'
    return warning
#### end of def get_file

######################################################################


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
    cursor.execute ("select dnalogin,dnapass,a.libcode,worker,a.id, etype e,w.email,w.notify,a.url from labdata a, worker w,experimenttype e "
	" where a.worker_id =w.id and e.id=experimenttype_id "
	" and (( dnalogin is not null and dnalogin <> '' and dnapass is not null and dnapass <> '' and a.libcode <> '') or (url is not null and url <> '' )) and libstatus in (0) limit 1")
    row = cursor.fetchone()

    if not row:
	break
    
    notify=(int(row[7])==1)
    url=row[8]
    libcode=row[2]
    email=row[6]
    
    PAIR=('pair' in row[5])
    SUBDIR='/DNA'
    if 'RNA' in row[5]:
	SUBDIR='/RNA'

	
    basedir=BASE_DIR+'/'+row[3].upper()+SUBDIR
    try:
	os.makedirs(basedir,0775)
    except:
	pass
    #print row[0]
    a=list()
    if len(libcode)>0 and len(url) == 0:
	cursor.execute("update labdata set libstatustxt='downloading',libstatus=1 where id=%s",row[4])
	conn.commit()
	a=get_file_core(row[0],row[1],row[2],basedir,PAIR)
    if len(libcode)==0 and len(url) > 0:
	cursor.execute("update labdata set libstatustxt=%s,libstatus=1 where id=%s",("URL downloading in proccess",row[4]))
	conn.commit()
	a=get_file(url,basedir,PAIR)
    if len(libcode)>0 and len(url) > 0:
	cursor.execute("update labdata set libstatustxt=%s,libstatus=1000 where id=%s",("Libcode and url are set together!",row[4]))
	conn.commit()
	continue		

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
