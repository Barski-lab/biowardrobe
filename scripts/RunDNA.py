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

BOWTIE_INDEXES="/data/DATA/indexes"
ANNOTATION_BASE=BOWTIE_INDEXES+"gtf"
BASE_DIR="/data/DATA/FASTQ-DATA"

arguments = Arguments.Arguments(sys.argv)

pidfile = "/tmp/runDNA.pid"

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



