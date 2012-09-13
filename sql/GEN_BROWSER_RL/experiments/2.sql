SELECT distinct chrom,l_start,gene  FROM TSS_TEMCD4Rna_seqPRE 
where chrom not like '%\\_%' and length>200 and strand='+' and sample_1='0h' 
group by (l_start)
order by chrom, l_start