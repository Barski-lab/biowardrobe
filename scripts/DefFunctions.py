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

import smtplib

    
def send_mail(toaddrs,body):
    fromaddr='ems@ems.cchmc.org'
    # Add the From: and To: headers at the start!
    msg = ("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n"
           % (fromaddr,toaddrs,body))
    msg = msg + body
                                                   
    server = smtplib.SMTP('localhost')
    server.set_debuglevel(1)
    server.sendmail(fromaddr, toaddrs, msg)
    server.quit()


def error_msg(msg):
    #print """
    #	{"success": false, "message": "%s" }"""%(msg.replace('"','\\"'))
    print """ %s """%(msg)
    sys.exit()

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
