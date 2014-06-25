#!/usr/bin/env python
##
## Trim fastq file from 5' (left) and 3' (right) end
##
##
##

import sys
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-l", "--left", action="store", type="int",
                  dest="left", help="Trimm from left", metavar="<int>")
parser.add_option("-r", "--right", action="store", type="int",
                  dest="right", help="Trimm from right", metavar="<int>")

(opt, args) = parser.parse_args(sys.argv)

left = 0
if opt.left:
    left = int(opt.left)

right = 0
if opt.right:
    right = int(opt.right)

if left == 0 and right == 0:
    sys.exit(0)

b = 0
for line in sys.stdin:
    line = line.strip()
    b += 1
    if b % 2 == 0:
        print line[left:len(line)-right]
    else:
        print line
