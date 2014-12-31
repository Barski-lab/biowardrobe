#!/usr/bin/env python

# /****************************************************************************
# **
#  ** Copyright (C) 2011-2014 Andrey Kartashov .
#  ** All rights reserved.
#  ** Contact: Andrey Kartashov (porter@porter.st)
#  **
#  ** This file is part of the EMS web interface module of the genome-tools.
#  **
#  ** GNU Lesser General Public License Usage
#  ** This file may be used under the terms of the GNU Lesser General Public
#  ** License version 2.1 as published by the Free Software Foundation and
#  ** appearing in the file LICENSE.LGPL included in the packaging of this
#  ** file. Please review the following information to ensure the GNU Lesser
#  ** General Public License version 2.1 requirements will be met:
#  ** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
#  **
#  ** Other Usage
#  ** Alternatively, this file may be used in accordance with the terms and
#  ** conditions contained in a signed written agreement between you and Andrey Kartashov.
#  **
#  ****************************************************************************/

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
    if b == 0:
	line1 = line.strip()
    elif b == 1:
	line2 = line.strip()
    elif b == 2:
	line3 = line.strip()
    elif b == 3:
	line4 = line.strip()
	b=-1
	if left+right+25 < len(line2):
    	    print line1
    	    print line2[left:len(line2)-right]
    	    print line3
    	    print line4[left:len(line4)-right]
    b += 1
