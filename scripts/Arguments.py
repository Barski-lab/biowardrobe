#! /usr/bin/env python
##/****************************************************************************
##**
##** Copyright (C) 2011 Andrey Kartashov .
##** All rights reserved.
##** Contact: Andrey Kartashov (porter@porter.st)
##**
##** This file is part of the global module of the genome-tools.
##**
##** GNU Lesser General Public License Usage
##** This file may be used under the terms of the GNU Lesser General Public
##** License version 2.1 as published by the Free Software Foundation and
##** appearing in the file LICENSE.LGPL included in the packaging of this
##** file. Please review the following information to ensure the GNU Lesser
##** General Public License version 2.1 requirements will be met:
##** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
##**
##** Other Usage
##** Alternatively, this file may be used in accordance with the terms and
##** conditions contained in a signed written agreement between you and Andrey Kartashov.
##**
##****************************************************************************/


import os
import sys
from PyQt4 import QtCore, QtGui
from optparse import OptionParser

##
## Class Arguments provides some common functions and definitions of 
## command line parameters
##
##
class Arguments:

    def __init__(self,a):
	self.argv=a
	self.parser = OptionParser()
	self.parser.add_option("", "--in", action="store", type="string",
                  dest="infile", help="input file", metavar="<file>")
	self.parser.add_option("", "--id", action="store", type="int",
                  dest="id", help="record id", metavar="<int>")
	(self.opt, args) = self.parser.parse_args(self.argv)
	self.settings = QtCore.QSettings(QtCore.QSettings.IniFormat,QtCore.QSettings.UserScope,"genome-tools")
	if not self.settings.isWritable():
 	 self.settings = QtCore.QSettings(QtCore.QSettings.IniFormat,QtCore.QSettings.SystemScope,"genome-tools")



    def checkArguments(self,num):
	if len(self.argv) < num:
	    self.parser.print_help()
	    sys.exit(1)


    def readPass(self,name):
	return str(QtCore.qUncompress(QtCore.QByteArray.fromBase64(self.settings.value(name, QtCore.QVariant()).toByteArray())))

    def readString(self,name):
	return str(self.settings.value(name, QtCore.QVariant()).toString())


