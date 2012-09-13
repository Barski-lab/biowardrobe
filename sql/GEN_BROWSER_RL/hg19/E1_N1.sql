select c.chromStart, c.chromEnd,c.thickStart,c.thickEnd, c.chrom, e.TSS_group_id 
 from ZINBA_EM_H3K4me3_Duplicate_241_5 c, expirements.MAX_EM_NINTER_NAIVE e


 where score >=950 and e.chrom=c.chrom 
 and ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
# or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd)))

and c.chromStart not IN
(

select A1.chromStart
#type,chromStart,chromEnd,chrom,TSS_group_id
from 
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ZINBA_EM_H3K4me3_Duplicate_241_5 c, expirements.MAX_EM_NINTER_NAIVE e
 where score >=950 and e.chrom=c.chrom 
 and (((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
 or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd)))
) as A1,
(
select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
 from ZINBA_Naive_H3K4me3 c,  expirements.MAX_EM_NINTER_NAIVE e
 where score >=950 and e.chrom=c.chrom 
 and (((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
 or ((e.low BETWEEN c.chromStart and c.chromEnd) and (e.upp BETWEEN c.chromStart and c.chromEnd)))
) as B1

where A1.chrom=B1.chrom and A1.chrom=c.chrom  
and ( ((A1.chromStart BETWEEN B1.chromStart and B1.chromEnd) 
        or (A1.chromEnd BETWEEN B1.chromStart and B1.chromEnd)) 
      or ( (B1.chromStart BETWEEN A1.chromStart and A1.chromEnd) and (B1.chromEnd BETWEEN A1.chromStart and A1.chromEnd) )
    )

)

#(
#select b.chrom,b.l_start,b.l_end,b.TSS_group_id, 
# (select max(txStart) from refGene a where a.txEnd < b.l_start and a.chrom=b.chrom) as low,
# (select min(txEnd) from refGene a where a.txStart > b.l_end and a.chrom=b.chrom) as upp
#from expirements.EM_INTER_NAIVE b
#) as d
#) as B1,

#(
#select c.chromStart, c.chromEnd, c.chrom, e.TSS_group_id 
# from ZINBA_EM_H3K4me3_Duplicate_241_5 c, expirements.MAX_EM_INTER_NAIVE e
#where score >=950 and e.chrom=c.chrom and ((c.chromStart BETWEEN e.low  and e.upp) or (c.chromEnd BETWEEN e.low  and e.upp))
#(
#select b.chrom,b.l_start,b.l_end,b.TSS_group_id, 
# (select max(txStart) from refGene a where a.txEnd < b.l_start and a.chrom=b.chrom) as low,
# (select min(txEnd) from refGene a where a.txStart > b.l_end and a.chrom=b.chrom) as upp
#from expirements.EM_INTER_NAIVE b
#from (
#SELECT distinct TSS_group_id,chrom,l_start,l_end,strand 
#  FROM expirements.TSS_TEMCD4Rna_seqPRE 
#  where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0 and significant='yes' #order by chrom
#  and TSS_group_id not in 
# (SELECT distinct TSS_group_id 
#   FROM expirements.TSS_NaiveCD4Rna_seqPRE 
#   where chrom not like '%\_%' and length>200 and sample_1='0h' and value_1<=2.0  and significant='yes') 
# order by chrom,l_start
#) as b
#) as e
#) as A1
#where A1.chrom=B1.chrom and A1.TSS_group_id=B1.TSS_group_id 
#and ((A1.chromStart BETWEEN B1.chromStart and B1.chromEnd) 
#or (A1.chromEnd BETWEEN B1.chromStart and B1.chromEnd))
#)

