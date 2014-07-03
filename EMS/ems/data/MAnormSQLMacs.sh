#!/bin/bash
export PATH=/usr/local/mysql/bin/:/usr/local/bin:$PATH

if [ $# -ne 12 ]
then
  echo "Usage: `basename $0` peak1 peak2 read1 read2 bp_shift_1 bp_shift_2 bp_flanked1 bp_flanked2 uuid db tmp bin"
  exit 
fi

RS=`pwd`  #"/srv/ems/htdocs/ems/data/"

MAINDIR="${11}/MANORM/${9}"

mkdir "${MAINDIR}"
cd "$MAINDIR"

exec &>./LOG
echo $*
echo "StepI: clean input"

mysql -ureadonly -hlocalhost -P3306 -preadonly --disable-column-names -e "select chrom,greatest(0,cast(start as signed)-$7),end+$7 from \`$1\` where chrom not like 'chrM'" ${10} >peak1.bed
mysql -ureadonly -hlocalhost -P3306 -preadonly --disable-column-names -e "select chrom,greatest(0,cast(start as signed)-$8),end+$8 from \`$2\` where chrom not like 'chrM'" ${10} >peak2.bed

bamToBed -i $3 |sed 's/\s$//g' | awk -v var=$5 'BEGIN {OFS="\t"}
     {if ($1~/chr/ && $1 !="chrM" && $6=="+" && $1 !~/random/  && $2>0 && $3>0)
          print $1,$2+var,$3+var>"read1.bed";
      else if ($1~/chr/  && $1 !="chrM" && $6=="-" && $1 !~/random/   && $2>var && $3>var)
          print $1,$2-var,$3-var>"read1.bed";
      else 
          print $0 > "/dev/null"}' &
bamToBed -i $4 |sed 's/\s$//g' | awk -v var=$6 'BEGIN {OFS="\t"}
     {if ($1~/chr/ && $1 !="chrM" && $6=="+" && $1 !~/random/   && $2>0 && $3>0)
          print $1,$2+var,$3+var>"read2.bed";
      else if ($1~/chr/  && $1 !="chrM" && $6=="-" && $1 !~/random/   && $2>var && $3>var)
          print $1,$2-var,$3-var>"read2.bed";
      else 
          print $0 > "/dev/null"}' &

wait

echo "StepII: classify common or unique peaks"
intersectBed -a peak1.bed -b peak2.bed -u | sort -k1,1 -k2,2n -k3,3n > common_peak1.bed &
intersectBed -a peak2.bed -b peak1.bed -u | sort -k1,1 -k2,2n -k3,3n > common_peak2.bed &
intersectBed -a peak1.bed -b peak2.bed -v | sort -k1,1 -k2,2n -k3,3n > unique_peak1.bed &
intersectBed -a peak2.bed -b peak1.bed -v | sort -k1,1 -k2,2n -k3,3n > unique_peak2.bed &

wait 

cat common_peak1.bed common_peak2.bed |sort -k1,1 -k2,2n | mergeBed -i - > common_peak.bed
#cat common_peak1.bed common_peak2.bed > temp_common_peak.bed
#mergeBed -i temp_common_peak.bed > common_peak.bed


echo "StepIII: count peak read"
if [ -f MAnorm.bed ];
then
rm MAnorm.bed
fi
coverageBed -a read1.bed -b unique_peak1.bed | sort -k1,1 -k2,2n -k3,3n  | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"unique_peak1" >> "MAnorm.bed"; print $4 > "unique_peak1_count_read1"}' &
coverageBed -a read2.bed -b unique_peak1.bed | sort -k1,1 -k2,2n -k3,3n  | awk '{print $4 > "unique_peak1_count_read2"}' &
wait 
coverageBed -a read1.bed -b common_peak1.bed | sort -k1,1 -k2,2n -k3,3n  | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"common_peak1" >> "MAnorm.bed";print $4 > "common_peak1_count_read1"}' &
coverageBed -a read2.bed -b common_peak1.bed | sort -k1,1 -k2,2n -k3,3n  | awk '{print $4 > "common_peak1_count_read2"}' &
wait
coverageBed -a read1.bed -b common_peak2.bed | sort -k1,1 -k2,2n -k3,3n  | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"common_peak2"  >> "MAnorm.bed";print $4 > "common_peak2_count_read1"}' &
coverageBed -a read2.bed -b common_peak2.bed |sort -k1,1 -k2,2n -k3,3n  |  awk '{print $4 > "common_peak2_count_read2"}' &
wait
coverageBed -a read1.bed -b unique_peak2.bed | sort -k1,1 -k2,2n -k3,3n  | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"unique_peak2">> "MAnorm.bed";print $4 > "unique_peak2_count_read1"}' &
coverageBed -a read2.bed -b unique_peak2.bed | sort -k1,1 -k2,2n -k3,3n  | awk '{print $4 > "unique_peak2_count_read2"}' &

wait 

cat common_peak1_count_read1 common_peak2_count_read1 > common_peak_count_read1
cat common_peak1_count_read2 common_peak2_count_read2 > common_peak_count_read2
#cat unique_peak1_count_read1 common_peak1_count_read1 common_peak2_count_read1 unique_peak2_count_read1 > peak_count_read1
#cat unique_peak1_count_read2 common_peak1_count_read2 common_peak2_count_read2 unique_peak2_count_read2 > peak_count_read2

if [ -f MAnorm_merge.bed ];
then
rm MAnorm_merge.bed
fi

cat  unique_peak1.bed | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"unique_peak1" >> "MAnorm_merge.bed"}'
coverageBed -a read1.bed -b common_peak.bed | sort -k1,1 -k2,2n -k3,3n  | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"merged_common_peak" >> "MAnorm_merge.bed"; print $4 > "merge_common_read1"}' &
coverageBed -a read2.bed -b common_peak.bed | sort -k1,1 -k2,2n -k3,3n  | awk '{print $4 > "merge_common_read2"}' &
wait
cat  unique_peak2.bed | awk 'BEGIN {OFS="\t"} {print $1,$2,$3,"unique_peak2" >> "MAnorm_merge.bed"}'

cat unique_peak1_count_read1 merge_common_read1  unique_peak2_count_read1 > merge_common_peak_count_read1
cat unique_peak1_count_read2 merge_common_read2  unique_peak2_count_read2 > merge_common_peak_count_read2




echo "SetpIV: normalize using common peaks"
#R --vanilla MAnorm.r >Rcommand.out
R CMD BATCH ${RS}/MAnorm.R Rcommand.out

#awk 'BEGIN{OFS="\t"}{if($4~/1/) print $1,$2,$3,$7>"sample1_peaks.wig"}' MAnorm_result.xls
#awk 'BEGIN{OFS="\t"}{if($4~/2/) print $1,$2,$3,$7>"sample2_peaks.wig"}' MAnorm_result.xls


#rm temp_common_peak.bed
#rm *count*
#rm *read1*
#rm *read2*
#rm *peak1*
#rm *peak2*
#rm MAnorm.bed
#rm MAnorm_merge.bed
#rm common_peak.bed
