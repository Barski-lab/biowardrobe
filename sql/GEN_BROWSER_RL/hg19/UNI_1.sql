set @tbl_name="Naive_H3K4me3_Duplicate_236_8_sicer";
set @tbl_name_1="EM_H3K4me3_Duplicate_241_5_sicer";
#set @expr_tbl="expirements.Expression_MAX_NAIVE_NINTER_EM";
#set @expr_tbl="expirements.Expression_MAX_EM_INTER_NAIVE";
set @expr_tbl="expirements.MAX_EM_NINTER_NAIVE";

set @s = CONCAT('select c1.chromStart, c1.chromEnd, c1.chrom, e.TSS_group_id, c1.score 
 from ',@tbl_name,' c1, ',@expr_tbl,' e

 where  e.chrom=c1.chrom 
 and ((c1.chromStart BETWEEN e.low  and e.upp) or (c1.chromEnd BETWEEN e.low  and e.upp))


and c1.chromStart not IN
(

select B1.chromStart
#type,chromStart,chromEnd,chrom,TSS_group_id
from 
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ',@tbl_name_1,' c, ',@expr_tbl,' e
 where e.chrom=c.chrom 
 and (
    ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
    )
) as A1,
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ',@tbl_name,' c, ',@expr_tbl,' e
 where e.chrom=c.chrom 
 and (
     ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
     )
) as B1

where A1.chrom=B1.chrom and A1.chrom=c1.chrom  
#intersection between EM and Naive all in EM are in Naive
and ( (A1.chromStart BETWEEN B1.chromStart and B1.chromEnd) or (A1.chromEnd BETWEEN B1.chromStart and B1.chromEnd) 
      or (B1.chromStart BETWEEN A1.chromStart and A1.chromEnd)
    )

) order by c1.chrom,c1.score');
PREPARE stmt1 FROM @s; 
EXECUTE stmt1; 
DEALLOCATE PREPARE stmt1; 
