select c1.chromStart, c1.chromEnd,c1.thickStart,c1.thickEnd, c1.chrom, e.TSS_group_id 
 from ZINBA_Naive_H3K4me3 c1, expirements.Expression_MAX_NAIVE_NINTER_EM e


 where score >=950 and e.chrom=c1.chrom 
 and ((c1.chromStart BETWEEN e.low  and e.upp) or (c1.chromEnd BETWEEN e.low  and e.upp))
# or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd)))

and c1.chromStart not IN
(

select B1.chromStart
#type,chromStart,chromEnd,chrom,TSS_group_id
from 
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ZINBA_EM_H3K4me3_Duplicate_241_5 c, expirements.Expression_MAX_NAIVE_NINTER_EM e
 where score >=950 and e.chrom=c.chrom 
 and (
    ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
# or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd))
    )
) as A1,
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ZINBA_Naive_H3K4me3 c,  expirements.Expression_MAX_NAIVE_NINTER_EM e
 where score >=950 and e.chrom=c.chrom 
 and (
     ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
# or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd))
     )
) as B1

where A1.chrom=B1.chrom and A1.chrom=c1.chrom  
#intersection between EM and Naive all in EM are in Naive
and ( ((A1.chromStart BETWEEN B1.chromStart and B1.chromEnd) 
        or (A1.chromEnd BETWEEN B1.chromStart and B1.chromEnd)) 
      or ( (B1.chromStart BETWEEN A1.chromStart and A1.chromEnd) and (B1.chromEnd BETWEEN A1.chromStart and A1.chromEnd) )
    )

)

