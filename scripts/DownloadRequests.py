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

main_page='http://dna.cchmc.org/www/main.php'
login_page='http://dna.cchmc.org/www/logon.php'
request_page='http://dna.cchmc.org/www/results/nextgen_results.php'
download_page='http://dna.cchmc.org/www/results/nextgen_download.php'

extension='fastq'
libcode='ABYR31'
arguments = Arguments.Arguments(sys.argv)


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
        old_pid=file(fname, 'r').readline()
        if check_pid(int(old_pid)):
            sys.exit()

    file(fname, 'w').write(str(os.getpid()))



pidfile = "/tmp/DownloadRequests.pid"

check_running(pidfile)

session = requests.session()
session.get(main_page)

USERNAME=''
PASSWORD=''

session.post(login_page,data={'username': USERNAME, 'password': PASSWORD})

r = session.get(request_page)

for line in r.text.splitlines():
 if '/data' in line:
  split_line=line.split('\'')
  path = split_line[1]
  fname= split_line[3]
  if extension and libcode in fname: #does not count pair end reads
   break

r = session.get(download_page+'?file='+path+'&name='+fname).raw
outfname=re.sub('[^a-zA-Z0-9\.]','_',fname)
outfname=re.sub('[\.'+extension+']','',outfname)
outfname=outfname+'_'+str(random.randrange(10000,99999))
output=open(outfname+'.'+extension,'wb')

while True:
 chunk = r.read(1024*1024)
 if not chunk: break
 output.write(chunk)

output.close()

