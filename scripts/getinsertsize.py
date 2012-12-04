#!/usr/bin/env python
'''
Selecting "insert size" of the paired-end reads from a given SAM/BAM file.
Usage: getinsertsize.py <SAM file> or samtools view <BAM file> | getinsertsize.py
'''


from __future__ import print_function
import sys;
import pydoc;
import os;
import re;
import fileinput;
import math;

nline=0

for lines in fileinput.input(sys.argv[1:]):
  field=lines.strip().split();
  nline=nline+1;
  if field[0] in ('@HD','@PG','@SQ'):
    continue
  if nline%1000000==0:
    print(str(nline/1000000)+'M...',file=sys.stderr);
  if len(field)<12:
    continue;
  if int(field[8])<=0:
    continue;
  print(field[8])
