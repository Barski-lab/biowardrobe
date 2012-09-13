SELECT distinct TSS_group_id,gene_id,chrom,l_start,l_end,strand 
  FROM expirements.TSS_TEMCD4Rna_seqPRE 
  where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0 and significant='yes' #order by chrom
  and TSS_group_id in 
   (SELECT distinct TSS_group_id 
     FROM expirements.TSS_NaiveCD4Rna_seqPRE 
     where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0  and significant='yes') 
  GROUP BY TSS_group_id, gene_id
  order by chrom,l_start 