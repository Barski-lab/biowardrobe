#!/usr/bin/python

import os
import sys
import array
import re

#192010278

#READ_LEN=49;
 

FP_W=open('EA_PXK_risk_mut.fa','r');
x=FP_W.readline().split(' ');
WILD_T=FP_W.readline();#Wild type sequence
FP_W.close();

POS_START=int(x[2].split(':')[1].split('-')[0])
POS_END=int(x[2].split(':')[1].split('-')[1])

#FP_O.write(line)

#D3LH75P1:0:3:2203:2384:98509:0:1:1	16	chr3	58316560	255	50M	*	0	0	ATTTTAGGGCTGAATCATGAAGGTCCAGGATTCCTTCTTCACATCTCGCT	
#DGF?9GGGHDFCGHFCEGGHECG@CHFAGHHHGIHEBHHFHADFDDFC@@	XA:i:0	MD:Z:50	NM:i:0
#XA:i:1  MD:Z:47T2
final_str=WILD_T;
l_len=50;


#@D3LH75P1:0:8:1101:1218:2146:0:1:1
#TGCAACTATAGCAACAGCCTTCATAGGCTATGTCCTCCCGTGAGGCCAAA
#+
#@7@DD?DFDDHAHGIIGGIGIIIDHI<FHGGGHGGHGIIGFG=FGGHEII


FP_O=open("new_t_mut.fastq",'w+')
for i in range(0,len(final_str)-l_len,l_len):
    STR="""@NAME-%d\n%s\n+\n@7@DD?DFDDHAHGIIGGIGIIIDHI<FHGGGHGGHGIIGFG=FGGHEII\n"""%(i,final_str[i:i+l_len])
    FP_O.write(STR);
FP_O.close()


#STR=str();
#FP_O=open("new_t_wt.sam",'w+')
#for i in range(0,len(final_str)-l_len,l_len):
#    STR="""%d\t0\tchr\t%d\t255\t50M\t*\t0\t0\t%s\tPROB\tXA:i:0\tMD:Z:50\tNM:i:0\n"""%(i,POS_START+i+1,final_str[i:i+l_len])
#    FP_O.write(STR);
#FP_O.close()

#STR=str();
#FP_O=open("new_t_mut.sam",'w+')
#for i in range(0,len(final_str)-l_len,l_len):
#    STR="""%d\t0\tchr\t%d\t255\t50M\t*\t0\t0\t%s\tPROB\tXA:i:1\tMD:Z:0T49\tNM:i:1\n"""%(i,POS_START+i+1,final_str[i:i+l_len])
#    FP_O.write(STR);
#FP_O.close()


#STR="""%d\t0\tchr\t%d\t255\t50M\t*\t0\t0\t%s\tPROB\tXA:i:0\tMD:Z:50\tNM:i:0\n"""%(i,POS_START+i,final_str[i+l_len:len(final_str)])
#FP_O.write(STR);

#FP_O.write(final_str[i+l_len:len(final_str)]+"\n")

