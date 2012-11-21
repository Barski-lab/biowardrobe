select A.chromStart,A.chromEnd,A.chrom,e.gene_id,A.score 
from 
#EM_H3K4me3_Duplicate_241_5_sicer A
Naive_H3K4me3_Duplicate_236_8_sicer A,
expirements.MAX_EM_NINTER_NAIVE e # Clear EM
#expirements.Expression_MAX_EM_INTER_NAIVE e # EM inter Naive
#expirements.Expression_MAX_NAIVE_NINTER_EM e #clear naive
where 
#((A.chromStart between e.low and e.upp) or (A.chromEnd between e.low and e.upp)) and 
A.chrom=e.chrom AND
A.chromStart < e.upp and A.chromEnd > e.low and
A.chromStart not in 
(
select A1.chromStart 
from 
EM_H3K4me3_Duplicate_241_5_sicer B1, 
Naive_H3K4me3_Duplicate_236_8_sicer A1
where 
A1.chrom=B1.chrom 
and A1.chrom=A.chrom
#and A1.chromStart=EX.chromStart and A1.chromEnd=EX.chromEnd
and A1.score>15 and B1.score>15
and B1.chromStart<A1.chromEnd and B1.chromEnd >A1.chromStart
#group by A1.chromStart
)
group by A.chromStart
order by A.chrom,e.gene_id,A.score
 
