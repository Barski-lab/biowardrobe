# selecting intersection between five_percent_em_vs_naive where 
# 1 means enreached in EM and 
# 2 means enreached in Naive 
# experiments.XXX has comentared at its own line
#
select distinct e.gene_id,A.chromStart,A.chromEnd
from 
#EM_H3K4me3_Duplicate_241_5_sicer A
#five_percent_em_vs_naive A,
#five_percent_em_vs_naive_h2az A,
five_percent_em_vs_naive_h3k4me1 A,
#expirements.MAX_EM_NINTER_NAIVE e # Clear EM
expirements.Expression_MAX_EM_INTER_NAIVE e # EM inter Naive
#expirements.Expression_MAX_NAIVE_NINTER_EM e #clear naive
where 
#((A.chromStart between e.low and e.upp) or (A.chromEnd between e.low and e.upp)) and 
A.chrom=e.chrom AND A.`name`=1 and
A.chromStart < e.upp and A.chromEnd > e.low
order by e.gene_id