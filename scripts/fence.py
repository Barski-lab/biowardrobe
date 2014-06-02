#! /usr/bin/env python
##
## Fence creator, count frequency of nucleotides in sequence
##
##
##

import os
import sys
import Arguments

#from PyQt4 import QtCore, QtGui
from optparse import OptionParser

arguments = Arguments.Arguments(sys.argv)
arguments.checkArguments(2)


align=10
length=0
error_len=False

alfa_pos={}

infile=arguments.opt.infile
infile2=""

if ";" in arguments.opt.infile:
    FN=infile.split(";")
    infile=FN[0]+'.fastq'
    infile2=FN[1]+'.fastq'
    
b=0
for line in open(infile):
 b=b+1
 if b%2 == 0 and b%4 !=0:

  if length == 0:
   length=len(line)-1

  if len(line)-1 != length:
   error_len=True
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


if infile2 != "":
 b=0
 for line in open(infile2):
  b=b+1
  if b%2 == 0 and b%4 !=0:

   if length == 0:
    length=len(line)-1

   if len(line)-1 != length:
    error_len=True
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






FIN=str()
STH=str()

for i in alfa_pos.keys():
 STRING=str(i).rjust(align)
 STH=str("Pos/Nucl").rjust(align)
 for j in range(length):
  STH+=str(j).rjust(align)
  try:
   STRING+=str(alfa_pos[i][j]).rjust(align)
  except KeyError: 
   STRING+=str(0).rjust(align)
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

