#! /usr/bin/env python
##
##
## Selecting data from MySQL database with respect to status downloading files from website
##
##

import os
import sys
import Arguments
#import requests
import re
import random

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



pidfile = "/tmp/BowTie.pid"

check_running(pidfile)

