#! /usr/bin/env python
##/****************************************************************************
##**
##** Copyright (C) 2011-2014 Andrey Kartashov .
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
from optparse import OptionParser
import MySQLdb

class WardrobeOptionParser(OptionParser):
    def error(self, msg):
        pass

##
## Class Settings provides some common functions and definitions of 
## command line parameters
##
##
class Settings:
    db_host=""
    db_user=""
    db_pass=""
    db_name=""
    
    def __init__(self):
        self.argv=sys.argv
        self.parser = WardrobeOptionParser()
        self.parser.add_option("", "--wardrobe", action="store", type="string",
                  dest="wardrobe", help="Wardrobe config file", metavar="<file>")
        (self.opt, args) = self.parser.parse_args(self.argv)
        self.wardrobe="/etc/wardrobe/wardrobe"
        if self.opt.wardrobe is not None:
            self.wardrobe=str(self.opt.wardrobe)
        try:
            with open(self.wardrobe, 'r') as f:
                for line in f:
                    line=line.strip()
                    if line.startswith("#") or len(line) == 0:
                        continue
                    if len(self.db_host) == 0:
                        self.db_host=line
                    elif len(self.db_user) == 0:
                        self.db_user=line
                    elif len(self.db_pass) == 0:
                        self.db_pass=line
                    elif len(self.db_name) == 0:
                        self.db_name=line
            f.closed
        except IOError:
            print "Cant open file "+str(self.wardrobe)
            return
        self.def_connect()
        self.get_settings()

    def def_connect(self):
        try:
            self.conn = MySQLdb.connect (host = self.db_host,user = self.db_user, passwd=self.db_pass, db=self.db_name)
            self.conn.set_character_set('utf8')
            self.cursor = self.conn.cursor ()
        except Exception, e: 
            Error_str=str(e)
            print("Error database connection"+Error_str)
        return self.cursor

    def get_settings(self):
        self.settings={}
        self.cursor.execute ("select * from settings")
        for (key,value,descr,stat,group) in self.cursor.fetchall():
            self.settings[key]=value
