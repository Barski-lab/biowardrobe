#!/bin/bash
#@echo off
#
#
#@rem "ReadsCounting.exe" -in="run0146_lane8_read1_index8=ABYR19.fastq.bam,run0147_lane8_read1_index9=ABYR20.fastq.bam" -out="RPKM.csv" -log="RPKM.log" -sam_ignorechr="chrM"
/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0146_lane8_read1_index8=ABYR19.fastq.bam,run0147_lane8_read1_index9=ABYR20.fastq.bam,run0146_lane8_read1_index10=ABYR21.fastq.bam,run0147_lane8_read1_index11=ABYR22.fastq.bam,run0147_lane8_read1_index21=ABYR23.fastq.bam,run0147_lane8_read1_index22=ABYR24.fastq.bam,run0146_lane8_read1_index23=ABYR25.fastq.bam" -out="RPKM.csv" -log="RPKM.log" -sam_ignorechr="chrM" -threads=8
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index10=10NN0_RNA_seq_24hr_cont.fastq.bam,run0144_lane1_read1_index12=10NN0_RNA_seq_24hr_IL13.fastq.bam,run0144_lane1_read1_index15=10NN0_RNA_seq_24hr_TNF.fastq.bam,run0144_lane2_read1_index16=10NN0_RNA_seq_24hr_TNF_IL13.fastq.bam" -out="10NN0.csv" -log="10NN0.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane2_read1_index18=10YN5_RNA_seq_24hr_cont.fastq.bam,run0144_lane2_read1_index19=10YN5_RNA_seq_24hr_IL13.fastq.bam,run0144_lane2_read1_index20=10YN5_RNA_seq_24hr_TNF.fastq.bam,run0144_lane2_read1_index1=10YN5_RNA_seq_24hr_TNF_IL13.fastq.bam" -out="10YN5.csv" -log="10YN5.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="" -out="10NN0.csv" -log="10NN0.log" -sam_ignorechr="chrM"

#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index12=10NN0_RNA_seq_24hr_IL13.fastq.bam" -out="10NN0_il13.csv" -log="10NN0_il13.log" -sam_ignorechr="chrM"
#/usr/src/REPO/genomebrowser/src/reads-counting/ReadsCounting -in="run0144_lane1_read1_index15=10NN0_RNA_seq_24hr_TNF.fastq.bam" -out="10NN0_tnf.csv" -log="10NN0_tnf.log" -sam_ignorechr="chrM"
