#SELECT distinct TSS_group_id,chrom,l_start,l_end,strand 
#  FROM expirements.TSS_TEMCD4Rna_seqPRE 
#  where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0 and significant='yes' #order by chrom
#  and TSS_group_id not in 
#(SELECT distinct TSS_group_id 
#   FROM expirements.TSS_NaiveCD4Rna_seqPRE 
#   where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0  and significant='yes') order by chrom,l_start

#select chrom,chromStart,chromEnd,strand from ZINBA_CM_H3K4me3_Duplicate_241_4

select c.chromStart, c.chromEnd, c.chrom, d.TSS_group_id from ZINBA_EM_H3K4me1_Duplicate_319_6 c, (

select b.chrom,b.l_start,b.l_end,b.TSS_group_id, 
 (select max(txStart) from refGene a where a.txEnd < b.l_start and a.chrom=b.chrom) as low,
 (select min(txEnd) from refGene a where a.txStart > b.l_end and a.chrom=b.chrom) as upp
#from expirements.EM_INTER_NAIVE b
from (
SELECT distinct TSS_group_id,chrom,l_start,l_end,strand 
  FROM expirements.TSS_NaiveCD4Rna_seqPRE 
  where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0 and significant='yes' #order by chrom
  and TSS_group_id not in 
 (SELECT distinct TSS_group_id 
   FROM expirements.TSS_TEMCD4Rna_seqPRE 
   where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0  and significant='yes') 
 order by chrom,l_start
) as b
) as d

where score >=950 and d.chrom=c.chrom and ((c.chromStart BETWEEN d.low  and d.upp) or (c.chromEnd BETWEEN d.low  and d.upp))
