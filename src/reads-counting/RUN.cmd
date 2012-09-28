#!/bin/bash

export REPO_DIR="/data/DEVEL/REPO/genome-tools/src/reads-counting"

#export FILE_LIST="run0146_lane8_read1_index8=ABYR19.fastq.bam,run0147_lane8_read1_index9=ABYR20.fastq.bam,run0146_lane8_read1_index10=ABYR21.fastq.bam,run0147_lane8_read1_index11=ABYR22.fastq.bam,run0147_lane8_read1_index21=ABYR23.fastq.bam,run0147_lane8_read1_index22=ABYR24.fastq.bam,run0146_lane8_read1_index23=ABYR25.fastq.bam"
#${REPO_DIR}/ReadsCounting -in="${FILE_LIST}" \
#-out="RPKM.csv" -log="RPKM.log" -sam_ignorechr="chrM" -threads=8

#export FILE_LIST="run0140_lane5_read1_index10=ABYR14.fastq.bam,run0140_lane5_read1_index11=ABTR15.fastq.bam"
#export BASE_NAME="YRINA_14vs15"
#${REPO_DIR}/ReadsCounting -in=${FILE_LIST} \
#-out="${BASE_NAME}.csv" -log="${BASE_NAME}.log" -sam_ignorechr="chrM" -threads=8 -no-sql-upload &


#run0140_lane7_read1_index6=TE7_6hr_control.fastq.bam,run0140_lane7_read1_index12=TE7_6hr_IL13.fastq.bam
export FILE_LIST="run0134_lane8_read1_index4=TE7_2hr_control.fastq.bam,run0134_lane8_read1_index5=TE7_2hr_IL13.fastq.bam"
export BASE_NAME="MARK_2Hvs6H_cont_IL13"
${REPO_DIR}/ReadsCounting -in=${FILE_LIST} -batch="batch.sicer_queries" \
-out="${BASE_NAME}.csv" -log="${BASE_NAME}.log" -sam_ignorechr="chrM" -threads=8 -no-sql-upload &


#export FILE_LIST="run0137_lane1_read1_index25=TE7_2hr_control.fastq.bam,run0137_lane3_read1_index27=TE7_2hr_IL13.fastq.bam"
#${REPO_DIR}/ReadsCounting -in=${FILE_LIST} \
#-out="RPKM_TE7_2hr.csv" -log="RPKM_TE7_2hr.log" -sam_ignorechr="chrM" -threads=8 &

#export FILE_LIST="run0137_lane3_read1_index8=control_TE7_6hr.fastq.bam,run0137_lane3_read1_index9=IL13_TE7_6hr.fastq.bam"
#${REPO_DIR}/ReadsCounting -in=${FILE_LIST} \
#-out="RPKM_TE7_6hr.csv" -log="RPKM_TE7_6hr.log" -sam_ignorechr="chrM" -threads=8 &



#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index10=10NN0_RNA_seq_24hr_cont.fastq.bam,run0144_lane1_read1_index12=10NN0_RNA_seq_24hr_IL13.fastq.bam,run0144_lane1_read1_index15=10NN0_RNA_seq_24hr_TNF.fastq.bam,run0144_lane2_read1_index16=10NN0_RNA_seq_24hr_TNF_IL13.fastq.bam" -out="10NN0.csv" -log="10NN0.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane2_read1_index18=10YN5_RNA_seq_24hr_cont.fastq.bam,run0144_lane2_read1_index19=10YN5_RNA_seq_24hr_IL13.fastq.bam,run0144_lane2_read1_index20=10YN5_RNA_seq_24hr_TNF.fastq.bam,run0144_lane2_read1_index1=10YN5_RNA_seq_24hr_TNF_IL13.fastq.bam" -out="10YN5.csv" -log="10YN5.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="" -out="10NN0.csv" -log="10NN0.log" -sam_ignorechr="chrM"

#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index12=10NN0_RNA_seq_24hr_IL13.fastq.bam" -out="10NN0_il13.csv" -log="10NN0_il13.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index15=10NN0_RNA_seq_24hr_TNF.fastq.bam" -out="10NN0_tnf.csv" -log="10NN0_tnf.log" -sam_ignorechr="chrM"
