#! /usr/bin/env python
##
## Fence creator, count frequence of of character at sequence
##
##
##

import os
import sys
import Arguments

from PyQt4 import QtCore, QtGui
from optparse import OptionParser

arguments = Arguments.Arguments(sys.argv)
arguments.checkArguments(2)
#print arguments.readPass("SQL/PASS")

align=10
length=0
error_len=False

alfa_pos={}

FP_N=open(arguments.opt.infile)

b=0
for line in FP_N:
 b=b+1
 if b%2 == 0 and b%4 !=0:

  if length == 0:
   length=len(line)-1

  if len(line)-1 != length:
   error_len=true
   
   continue
  else:

   for i in range(length):

    a=line[i:i+1]

    try: 
     alfa_pos[a][i] += 1
    except KeyError:
     try:
      app={i:1}
      alfa_pos[a].update(app)
     except:
      ap={a:{i:1}}
      alfa_pos.update(ap)

FP_N.close()

FIN=str()

for i in alfa_pos.keys():
 STRING=str(i).rjust(align)
 STH=str("Pos/Nucl").rjust(align)
 for j in range(length):
  STH+=str(j).rjust(align)
  try:
   STRING+=str(alfa_pos[i][j]).rjust(align)
  except KeyError: 
   STRING+=str().rjust(align)
 FIN+=STRING+str('\n')

print STH
print FIN

print "\n\n\n"

WIN=str("WINNERS").rjust(align)
char=""
maxx=0

for j in range(length):
 maxx=0
 for i in alfa_pos.keys():
  try:
   if maxx < alfa_pos[i][j]:
    maxx=alfa_pos[i][j]
    char=i
  except KeyError:
   NN=0 
 WIN+=str(char).rjust(align)  

print WIN

#print alfa_pos

