@echo off
@rem del *.log


"debug/bam2bedgraph.exe" -in="run0146_lane8_read1_index10=ABYR21.fastq.bam" -out="run0146_lane8_read1_index10=ABYR21.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0146_lane8_read1_index10=ABYR21.fastq.log" -sql_table="run0146_lane8_read1_index10_ABYR21" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0146_lane8_read1_index23=ABYR25.fastq.bam" -out="run0146_lane8_read1_index23=ABYR25.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0146_lane8_read1_index23=ABYR25.fastq.log" -sql_table="run0146_lane8_read1_index23_ABYR25" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0146_lane8_read1_index8=ABYR19.fastq.bam" -out="run0146_lane8_read1_index8=ABYR19.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0146_lane8_read1_index8=ABYR19.fastq.log" -sql_table="run0146_lane8_read1_index8_ABYR19" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0147_lane8_read1_index11=ABYR22.fastq.bam" -out="run0147_lane8_read1_index11=ABYR22.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0147_lane8_read1_index11=ABYR22.fastq.log" -sql_table="run0147_lane8_read1_index11_ABYR22" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0147_lane8_read1_index21=ABYR23.fastq.bam" -out="run0147_lane8_read1_index21=ABYR23.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0147_lane8_read1_index21=ABYR23.fastq.log" -sql_table="run0147_lane8_read1_index21_ABYR23" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0147_lane8_read1_index22=ABYR24.fastq.bam" -out="run0147_lane8_read1_index22=ABYR24.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0147_lane8_read1_index22=ABYR24.fastq.log" -sql_table="run0147_lane8_read1_index22_ABYR24" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file
"debug/bam2bedgraph.exe" -in="run0147_lane8_read1_index9=ABYR20.fastq.bam" -out="run0147_lane8_read1_index9=ABYR20.fastq.out" -bed_window=20 -bed_siteshift=0 -bed_format=8 -log="run0147_lane8_read1_index9=ABYR20.fastq.log" -sql_table="run0147_lane8_read1_index9_ABYR20" -sql_grp="barskii2" -rna_seq="dUTP" -no-bed-file

                                                                
                                                                
@rem "debug/bam2bedgraph.exe" -in="run0140_lane7_read1_index6=TE7_6hr_control.fastq.bam" -out="output"
@rem "release/bam2bedgraph.exe" -in="run0140_lane7_read1_index6=TE7_6hr_control.fastq.bam" -out="output"