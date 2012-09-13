#!/usr/bin/python

import os
import sys
import array
import re

#192010278

POS_START=128543578+1;
POS_END=128771994+1;
READ_LEN=49;
 

FP_W=open('EA_IRF5_All_risk_wt.fa','r');
FP_W.readline();
WILD_T=FP_W.readline();#Wild type sequence
FP_W.close();

FP_M=open('EA_IRF5_All_risk_mut.fa','r');
FP_M.readline();
MUT_T=FP_M.readline();#mutation sequence
FP_M.close();

FP_MUT=open('EA_IRF5_All_risk_list.txt','r')
FP_MUT.readline();

IDS=[];#mutation IDs
COORDS=[];#coordinates of mutation if main is wildtype
M_COORDS=[];# coordinates of mutation if main is mutation
R_COORDS=[];#coordinates of reads
R_NAMES=[];# reads names
RW_NAMES=[];
SEQUENCE=[];#read sequence
ERRORS=[];#number of errors for current read 
CIGARS=[];
WTS=[];
MUTS=[];
IDX_SUM=0;
WT=str();

C=0;
for line in FP_MUT:
	X_,ID_,X_,COOR,X_,X_,WT,MUT=line.split('\t');
	MUT=MUT[0:len(MUT)-1];
	IDS.append(ID_);
	COORDS.append(int(COOR));
	WTS.append(WT);
	MUTS.append(MUT);
	C=C+1;
	if WT.find('-')>=0:
		IDX_SUM=IDX_SUM+len(WT);
	if MUT.find('-')>=0:
		IDX_SUM=IDX_SUM-len(MUT);
	M_COORDS.append(int(COOR)+IDX_SUM);
#	print """%s\t%d\t%s\t%s\t%s"""%(ID_,int(COOR)+IDX_SUM,COOR,WT,MUT);
	
FP_MUT.close();	

R_COUNT=array.array('i',(0 for i in range(0,C)));
RM_COUNT=array.array('i',(0 for i in range(0,C)));

#FP_R=open('run0128_lane3_read1_index22=101679-9050_chr7_28543578..128771994_wt_s.sam','r');
#FP_R=open('run0128_lane3_read1_index23=500022-9050_chr7_28543578..128771994_wt_s.sam','r');

FP_R=open(sys.argv[1],'r');
for line in FP_R:
	if line.startswith('@'):
		continue;
	R_NAMES.append(line.split('\t')[0]);
	R_COORDS.append(int(line.split('\t')[3]));
	SEQUENCE.append(line.split('\t')[9]);
	ERRORS.append(int(line.split('\t')[11].split(':')[2] ));
	CIGARS.append(line.split('\t')[12]);
	#print line.split('\t')[11].split(':')[2];

FP_R.close();	

j1=0;
idx=0;
pos=0;
pos1=0;	
cig=str();
tst=[];	

for i in range(len(COORDS)): #mutation
	for j in range(j1,len(R_COORDS)): #reads
#		print """%d==%d"""%(COORDS[i],R_COORDS[j]);
		if COORDS[i]>R_COORDS[j]+READ_LEN:
#			print 'cont';
			j1=j;
			continue;
		if COORDS[i] < R_COORDS[j]:
#			print 'break';
			break;
#		print """%d<>%d"""%(COORDS[i],R_COORDS[j])
		if ERRORS[j]==0:
			R_COUNT[i]=R_COUNT[i]+1;
			RW_NAMES.append(R_NAMES[j]);	
		if ERRORS[j]>0:
			pos=int(COORDS[i]-R_COORDS[j]);
			pos1=R_COORDS[j]-POS_START;
			SEQ=SEQUENCE[j];
			SEQ1=WILD_T[pos1:pos1+50];

			if SEQ[pos:pos+len(WTS[i])]==SEQ1[pos:pos+len(WTS[i])]:
				R_COUNT[i]=R_COUNT[i]+1;
				RW_NAMES.append(R_NAMES[j]);	
			else:
				cig=CIGARS[j].split(':')[2];
				tst=re.split('[A-f]+',cig);
				idx=0;
				for cc in range(len(tst)):
					idx=idx+int(tst[cc]);
					if idx==pos:
						break;
					idx=idx+1;
				if idx!=pos:
					print'__________________________________________'
					print IDS[i];
					print R_NAMES[j];
					print """%d-%d=%d"""%(COORDS[i],R_COORDS[j],pos);
					print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
					print SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
					print SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];
					print SEQ[pos:pos+len(WTS[i])];
					print WTS[i];
					print MUTS[i];
					print cig;
					print tst;
					#	R_COUNT[i]=R_COUNT[i]+1;

#-------------------------------------------------------------------------------
#-------------------------------------------------------------------------------
# mutation type
#-------------------------------------------------------------------------------
#-------------------------------------------------------------------------------
R_COORDS=[];#coordinates of reads
R_NAMES=[];# reads names
SEQUENCE=[];#read sequence
ERRORS=[];#number of errors for current read 
CIGARS=[];

#FP_R=open('run0128_lane3_read1_index22=101679-9050_chr7_28543578..128771994_mut_s.sam','r');
#FP_R=open('run0128_lane3_read1_index23=500022-9050_chr7_28543578..128771994_mut_s.sam','r');
FP_R=open(sys.argv[2],'r');
for line in FP_R:
	if line.startswith('@'):
		continue;
	R_NAMES.append(line.split('\t')[0]);
	R_COORDS.append(int(line.split('\t')[3]));
	SEQUENCE.append(line.split('\t')[9]);
	ERRORS.append(int(line.split('\t')[11].split(':')[2] ));
	CIGARS.append(line.split('\t')[12]);
	#print line.split('\t')[11].split(':')[2];

FP_R.close();	

j1=0;
idx=0;
pos=0;
pos1=0;	
cig=str();
tst=[];	


for i in range(len(M_COORDS)): #mutation
	for j in range(j1,len(R_COORDS)): #reads
		pos=int(M_COORDS[i]-R_COORDS[j]);
		pos1=R_COORDS[j]-POS_START;
		SEQ=SEQUENCE[j];
		SEQ1=MUT_T[pos1:pos1+50];
#		print """%d==%d"""%(COORDS[i],R_COORDS[j]);
		if M_COORDS[i]>R_COORDS[j]+READ_LEN:
#			print 'cont';
			j1=j;
			continue;
		if M_COORDS[i] < R_COORDS[j]:
#			print 'break';
			break;
#		print """%d<>%d"""%(COORDS[i],R_COORDS[j])
		if ERRORS[j]==0:
			if R_NAMES[j] in RW_NAMES:	
				R_COUNT[i]=R_COUNT[i]-1;
			else:
				RM_COUNT[i]=RM_COUNT[i]+1;					
#				print'__________________VVV________________________'
#				print IDS[i];
#				print R_NAMES[j];
#				print """%d-%d=%d"""%(M_COORDS[i],R_COORDS[j],pos);
#				print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
#				print SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
#				print SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];
#				print SEQ[pos:pos+len(WTS[i])];
#				print WTS[i];
#				print MUTS[i];
#				print cig;
#				print tst;
				#	R_COUNT[i]=R_COUNT[i]+1;
					
		if ERRORS[j]>0:
			if SEQ[pos:pos+len(WTS[i])]==SEQ1[pos:pos+len(WTS[i])]:
				if R_NAMES[j] in RW_NAMES:	
					R_COUNT[i]=R_COUNT[i]-1;
				else:
					RM_COUNT[i]=RM_COUNT[i]+1;					

			else:
				cig=CIGARS[j].split(':')[2];
				tst=re.split('[A-f]+',cig);
				idx=0;
				for cc in range(len(tst)):
					idx=idx+int(tst[cc]);
					if idx==pos:
						break;
					idx=idx+1;
				if idx!=pos:
					print'__________________________________________'
					print IDS[i];
					print R_NAMES[j];
					print """%d-%d=%d"""%(M_COORDS[i],R_COORDS[j],pos);
					print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
					print SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
					print SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];
					print SEQ[pos:pos+len(WTS[i])];
					print WTS[i];
					print MUTS[i];
					print cig;
					print tst;
					#	R_COUNT[i]=R_COUNT[i]+1;
					
				
		

print "M_ID\tC_WT\tC_MUT";
for i in range(len(R_COUNT)): #final print
	print """%s\t%d\t%d"""%(IDS[i],R_COUNT[i],RM_COUNT[i]);
	
	