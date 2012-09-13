
(select 1 as identity,A.chrom as chrom,LEAST(A.chromStart,B.chromStart) as chromStart,GREATEST(A.chromEnd,B.chromEnd)as chromEnd
#,A.*,B.*
from Naive_H3K4me3_Duplicate_236_8_sicer A, EM_H3K4me3_Duplicate_241_5_sicer B
where 
A.chrom=B.chrom 
and (A.chromStart between B.chromStart and B.chromEnd or A.chromEnd between B.chromStart and B.chromEnd)
group by chromStart,chromEnd
order by chrom,chromStart
)
UNION
(
select 2 as identity,chrom,chromStart,chromEnd from Naive_H3K4me3_Duplicate_236_8_sicer 
where chromStart not in (
select A.chromStart 
from Naive_H3K4me3_Duplicate_236_8_sicer A, EM_H3K4me3_Duplicate_241_5_sicer B
where 
A.chrom=B.chrom 
and (A.chromStart between B.chromStart and B.chromEnd or A.chromEnd between B.chromStart and B.chromEnd)
)
)
ORDER BY chrom,chromStart

#select * from Naive_H3K4me3_Duplicate_236_8_sicer A OUTER join EM_H3K4me3_Duplicate_241_5_sicer B on A.chrom=B.chrom and 
#(A.chromStart between B.chromStart and B.chromEnd or A.chromEnd between B.chromStart and B.chromEnd)
select * from EM_H3K4me3_Duplicate_241_5_sicer