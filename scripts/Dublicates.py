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


import sys
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-l", "--left", action="store", type="int",
                  dest="left", help="Trimm from left", metavar="<int>")

(opt, args) = parser.parse_args(sys.argv)

left = 0
if opt.left:
    left = int(opt.left)

if left == 0:
    sys.exit(0)

b = 0
l1 = str()
l2 = str()
l3 = str()
l4 = str()
adap = str()
seq = str()
qual = str()

data = {}

for line in sys.stdin:
    line = line.strip()
    b += 1
    if b == 1:
        l1 = line
    elif b == 2:
        l2 = line
    elif b == 3:
        l3 = line
    elif b == 4:
        l4 = line
        adap = l2[0:left]
        seq = l2[left+1:len(l2)]
        b = 0
        if adap not in data:
            data[adap] = list()
        if seq not in data[adap]:
            qual = l4[left+1:len(l4)]
            data[adap].append(seq)
            print l1
            print seq
            print l3
            print qual
