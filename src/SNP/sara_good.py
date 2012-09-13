#!/usr/bin/python

import os
import sys
import array
import re

#192010278
#58316557-58411694

#IRF5
#POS_START=128543578+1;
#POS_END=128771994+1;

#PKX
#POS_START=58316557+1;
#POS_END=58411694+1;

READ_LEN=49;
 

#FP_W=open('EA_IRF5_All_risk_wt.fa','r');
#x=FP_W.readline().split(' ');
#WILD_T=FP_W.readline();#Wild type sequence
#FP_W.close();

#FP_M=open('EA_IRF5_All_risk_mut.fa','r');
#FP_M.readline();
#MUT_T=FP_M.readline();#mutation sequence
#FP_M.close();

#FP_MUT=open('EA_IRF5_All_risk_list.txt','r')
#FP_MUT.readline();

TYPE=sys.argv[3];

FP_W=open(TYPE+'_risk_wt.fa','r');
x=FP_W.readline().split(' ');
WILD_T=FP_W.readline();#Wild type sequence
FP_W.close();

FP_M=open(TYPE+'_risk_mut.fa','r');
FP_M.readline();
MUT_T=FP_M.readline();#mutation sequence
FP_M.close();

FP_MUT=open(TYPE+'_risk_list.txt','r')
FP_MUT.readline();

#FP_W=open('EA_Stat4_risk_wt.fa','r');
#x=FP_W.readline().split(' ');
#WILD_T=FP_W.readline();#Wild type sequence
#FP_W.close();

#FP_M=open('EA_Stat4_risk_mut.fa','r');
#FP_M.readline();
#MUT_T=FP_M.readline();#mutation sequence
#FP_M.close();

#FP_MUT=open('EA_Stat4_risk_list.txt','r')
#FP_MUT.readline();

POS_START=int(x[2].split(':')[1].split('-')[0])+1
POS_END=int(x[2].split(':')[1].split('-')[1])+1

IDS=[];#mutation IDs
COORDS=[];#coordinates of mutation if main is wildtype
M_COORDS=[];# coordinates of mutation if main is mutation

R_COORDS=[];#coordinates of reads
R_NAMES=[];# reads names
SEQUENCE=[];#read sequence
ERRORS=[];#number of errors for current read 
CIGARS=[];

M_R_COORDS=[];#coordinates of reads
M_R_NAMES=[];# reads names
M_SEQUENCE=[];#read sequence
M_ERRORS=[];#number of errors for current read 
M_CIGARS=[];
SEQ2=str();
#SEQ3=[];

RW_NAMES=[];
COM_NAMES=[];
WTS=[];
MUTS=[];
IDX_SUM=0;
WT=str();

C=0;
for line in FP_MUT:# cycle reading MUTATION DATA
	X_,ID_,X_,COOR,X_,X_,WT,MUT=line.split('\t');
	MUT=MUT[0:len(MUT)-1];
	IDS.append(ID_);
	COORDS.append(int(COOR));
	WTS.append(WT);
	MUTS.append(MUT);
	C=C+1;
	M_COORDS.append(int(COOR)+IDX_SUM);
	if WT.find('-')>=0:
		IDX_SUM=IDX_SUM+len(WT);
	if MUT.find('-')>=0:
		IDX_SUM=IDX_SUM-len(MUT);
#	print """%s\t%d\t%s\t%s\t%s"""%(ID_,int(COOR)+IDX_SUM,COOR,WT,MUT);
	
FP_MUT.close();	

R_COUNT=array.array('i',(0 for i in range(0,C)));#Wild type reads overlap mutation positions
RM_COUNT=array.array('i',(0 for i in range(0,C)));#Mutation reads overlap mutation positions

#FP_R=open('run0128_lane3_read1_index22=101679-9050_chr7_28543578..128771994_wt_s.sam','r');
#FP_R=open('run0128_lane3_read1_index23=500022-9050_chr7_28543578..128771994_wt_s.sam','r');

FP_R=open(sys.argv[1],'r');# this cycle reads SAM file with alignment on WT genome
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

#FP_R=open('run0128_lane3_read1_index22=101679-9050_chr7_28543578..128771994_mut_s.sam','r');
#FP_R=open('run0128_lane3_read1_index23=500022-9050_chr7_28543578..128771994_mut_s.sam','r');
FP_R=open(sys.argv[2],'r');# this cycle reads SAM file with alignment on MUT genome
for line in FP_R:
	if line.startswith('@'):
		continue;
	M_R_NAMES.append(line.split('\t')[0]);
	M_R_COORDS.append(int(line.split('\t')[3]));
	M_SEQUENCE.append(line.split('\t')[9]);
	M_ERRORS.append(int(line.split('\t')[11].split(':')[2] ));
	M_CIGARS.append(line.split('\t')[12]);
	#print line.split('\t')[11].split(':')[2];
FP_R.close();	

j1=0;
idx=0;
pos=0;
pos1=0;	
pos2=0;
cig=str();
tst=[];	
corr=0;
j2=0;
idx1=0;
#pos=0;
#pos1=0;	
#cig=str();
#tst=[];	


for i in range(len(COORDS)): #mutation
        RW_NAMES=[];
	for j in range(j1,len(R_COORDS)): #reads
		pos2=int(COORDS[i]-R_COORDS[j]);
		pos1=R_COORDS[j]-POS_START;
		SEQ2=SEQUENCE[j];
		SEQ1=WILD_T[pos1:pos1+51];
		cig=CIGARS[j].split(':')[2];
		tst=re.split('[A-f]+',cig);
		corr=0;
		delition=False;
		if MUTS[i].find('-')>=0:
		        delition=True;
		
		if len(WTS[i]) > 1 and delition==True:
		        corr=len(WTS[i]);

                if pos2-READ_LEN>0:
			j1=j;
			continue;
                if pos2+corr<0:
			break;

		if pos2<0:
		        pos2=0;

#		if ERRORS[j]==0:# NO ERRORS
#			R_COUNT[i]=R_COUNT[i]+1;
#			RW_NAMES.append(R_NAMES[j]);	
#			print'_____________________WT CLR_____________________'
#			print IDS[i];
#			print R_NAMES[j];
#			print """%d-%d=%d"""%(COORDS[i],R_COORDS[j],pos2);
#			print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
#		        print 'READ:'+SEQ2[0:pos2]+' '+SEQ2[pos2:len(SEQ2)];
#		        print 'POSI:'+SEQ1[0:pos2]+' '+SEQ1[pos2:len(SEQ1)];				
#			print SEQ2[pos2:pos2+len(WTS[i])];
#			print WTS[i];
#			print MUTS[i];
#		if ERRORS[j]>=0:
		if SEQ2[pos2:pos2+len(WTS[i])]==SEQ1[pos2:pos2+len(WTS[i])]:
			R_COUNT[i]=R_COUNT[i]+1;
			RW_NAMES.append(R_NAMES[j]);	
		        print'_____________________WT EQ >=0_____________________'
		        print IDS[i];
		        print R_NAMES[j];
		        print """COORD:%d COORD MUT:%d"""%(COORDS[i],M_COORDS[i]);
		        print """%d-%d=%d"""%(COORDS[i],R_COORDS[j],pos2);
		        print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
	                print 'READ:'+SEQ2[0:pos2]+' '+SEQ2[pos2:len(SEQ2)];
	                print 'POSI:'+SEQ1[0:pos2]+' '+SEQ1[pos2:len(SEQ1)];				
			print """Curr=%s,WT=%s,MUT=%s"""%(SEQ2[pos2:pos2+len(WTS[i])],WTS[i],MUTS[i]);
			print cig;
		else:
#				idx=0;
#				for cc in range(len(tst)):
#					idx=idx+int(tst[cc]);
#					if idx==pos2:
#						break;
#					idx=idx+1;
#				if idx!=pos2: #possible incorrect assignment to WT while it is MUT
#                                if True:
			print'_____________________WT NEQ >=0_____________________'
			print IDS[i];
			print R_NAMES[j];
			print """%d-%d=%d"""%(COORDS[i],R_COORDS[j],pos2);
			print """%d-%d=%d"""%(R_COORDS[j],POS_START,pos1);
		        print 'READ:'+SEQ2[0:pos2]+' '+SEQ2[pos2:len(SEQ2)];
		        print 'POSI:'+SEQ1[0:pos2]+' '+SEQ1[pos2:len(SEQ1)];				
		        print """Curr=%s,WT=%s,MUT=%s"""%(SEQ2[pos2:pos2+len(WTS[i])],WTS[i],MUTS[i]);
			print cig;

#-------------------------------------------------------------------------------
#-------------------------------------------------------------------------------
# mutation type
#-------------------------------------------------------------------------------
#-------------------------------------------------------------------------------
	j=0;
	for j in range(j2,len(M_R_COORDS)): #reads
		pos=int(M_COORDS[i]-M_R_COORDS[j]);
		pos1=M_R_COORDS[j]-POS_START;
		SEQ=M_SEQUENCE[j];
		SEQ1=MUT_T[pos1:pos1+51];
		cig=M_CIGARS[j].split(':')[2];
		tst=re.split('[A-f]+',cig);
		corr=0;
		delition=False;
		if MUTS[i].find('-')>=0:
		        delition=True;
		
		if len(WTS[i]) > 1 and delition==False:
		        corr=len(WTS[i]);
		
                if pos-READ_LEN>0:
			j2=j;
			continue;
                if pos+corr<0:
			break;
		
		if pos<0:
		        pos=0;

#		if M_ERRORS[j]==0:
				
#			RM_COUNT[i]=RM_COUNT[i]+1;					

#			if M_R_NAMES[j] in RW_NAMES:	
#				if WTS[i].find('-') >=0 or MUTS[i].find('-')>=0:
#					RM_COUNT[i]=RM_COUNT[i]-1;					
#					R_COUNT[i]=R_COUNT[i]-1;
#					continue;	
#				#R_COUNT[i]=R_COUNT[i]-1;
##				COM_NAMES.append(R_NAMES[j]);
#				print'__________________MUT E0________________________'
#				print IDS[i];
#				print M_R_NAMES[j];
#				print """ORG COORD: %d"""%(COORDS[i]);				
#				print """%d-%d=%d"""%(M_COORDS[i],M_R_COORDS[j],pos);
#				print """%d-%d=%d"""%(M_R_COORDS[j],POS_START,pos1);
#				print 'WTy READ:'+SEQ2[0:pos2]+' '+SEQ2[pos2:len(SEQ2)];				
#				print 'READ:'+SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
#				print 'POSI:'+SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];				
#				print """Curr=%s,WT=%s,MUT=%s"""%(SEQ[pos:pos+len(WTS[i])],WTS[i],MUTS[i]);
#				print cig;
#				print tst;
				#	R_COUNT[i]=R_COUNT[i]+1;
#			else:
					
		if M_ERRORS[j]>=0:
			if SEQ[pos:pos+len(WTS[i])]==SEQ1[pos:pos+len(WTS[i])]:
				RM_COUNT[i]=RM_COUNT[i]+1;					
				print'__________________MUT EQ >=0________________________'
				print IDS[i];
				print M_R_NAMES[j];
				print """ORG COORD: %d"""%(COORDS[i]);				
				print """%d-%d=%d"""%(M_COORDS[i],M_R_COORDS[j],pos);
				print """%d-%d=%d"""%(M_R_COORDS[j],POS_START,pos1);
				print 'READ:'+SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
				print 'POSI:'+SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];				
				print """Curr=%s,WT=%s,MUT=%s"""%(SEQ[pos:pos+len(WTS[i])],WTS[i],MUTS[i]);
				print cig;

				if M_R_NAMES[j] in RW_NAMES:	
					if WTS[i].find('-') >=0 or MUTS[i].find('-')>=0:
					        RW_NAMES.remove(M_R_NAMES[j]);
						RM_COUNT[i]=RM_COUNT[i]-1;					
						R_COUNT[i]=R_COUNT[i]-1;
				                print'__________________DELETED________________________'
				                print IDS[i];
				                print M_R_NAMES[j];
						continue;	
					
					print'__________________MUT SAME NAMES >=0________________________'
					print IDS[i];
					print M_R_NAMES[j];
					print """ORG COORD: %d"""%(COORDS[i]);				
					print """%d-%d=%d"""%(M_COORDS[i],M_R_COORDS[j],pos);
					print """%d-%d=%d"""%(M_R_COORDS[j],POS_START,pos1);
					print 'READ:'+SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
					print 'POSI:'+SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];				
					print """Curr=%s,WT=%s,MUT=%s"""%(SEQ[pos:pos+len(WTS[i])],WTS[i],MUTS[i]);
					print cig;

			else:
#				idx=0;
#				for cc in range(len(tst)):
#					idx=idx+int(tst[cc]);
#					if idx==pos:
#						break;
#					idx=idx+1;
#				if idx!=pos:
                                if True:
					print'_______________MUT NEQ_________________________'
					print IDS[i];
					print M_R_NAMES[j];
					print """ORG COORD: %d"""%(COORDS[i]);				
					print """%d-%d=%d"""%(M_COORDS[i],M_R_COORDS[j],pos);
					print """%d-%d=%d"""%(M_R_COORDS[j],POS_START,pos1);
					print 'READ:'+SEQ[0:pos]+' '+SEQ[pos:len(SEQ)];
					print 'POSI:'+SEQ1[0:pos]+' '+SEQ1[pos:len(SEQ1)];				
					print """Curr=%s,WT=%s,MUT=%s"""%(SEQ[pos:pos+len(WTS[i])],WTS[i],MUTS[i]);
					print cig;
					
				
		
tot1=0;
tot2=0;

chrom="chr";
if TYPE.find('STAT4') >= 0:
        chrom="chr2";
if TYPE.find('IRF5') >= 0:
        chrom="chr7";
if TYPE.find('PXK') >=0:
        chrom="chr3";


FP_O=open(sys.argv[4],'w+');
#FP_O.write("M_ID\tC_WT\tC_MUT\n");

for i in range(len(R_COUNT)): #final print
#        FP_O.write("""%s\t%d\t%d\n"""%(IDS[i],R_COUNT[i],RM_COUNT[i]));
        if R_COUNT[i]!=0:
            FP_O.write("""%s\t%d\t%d\t%d\t%s\t+\n"""%(chrom,COORDS[i],COORDS[i],R_COUNT[i],IDS[i]));        
        if RM_COUNT[i]!=0:
            FP_O.write("""%s\t%d\t%d\t-%d\t%s\t+\n"""%(chrom,COORDS[i],COORDS[i],RM_COUNT[i],IDS[i]));        
#        tot1=tot1+R_COUNT[i];
#        tot2=tot2+RM_COUNT[i];

#FP_O.write("""total\t%d\t%d\n"""%(tot1,tot2));        
	
FP_O.close();
	