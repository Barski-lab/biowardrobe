#select count(*) from TSS_TEMCD4Rna_seqPRE
#select * from TSS_TEMCD4Rna_seqPRE where TSS_group_id in (
#select * from TSS_TEMCD4Rna_seqPRE where sample_1="150m" and significant="yes" 
#and status="ok" 
#) and significant="yes" and sample_1="40m"

#select TSS_group_id from TSS_TEMCD4Rna_seqPRE where sample_1="40m" and significant="yes"

#select strand from hg19.refGene where name2 in (  select distinct gene_id from TSS_TEMCD4Rna_seqPRE where l_start not in 
#(select txStart from hg19.refGene where chrom=TSS_TEMCD4Rna_seqPRE.chr) )
#and sample_1="0h" and sample_2="40m" and chr="chr1"
#select * from TSS_TEMCD4Rna_seqPRE where status like "NOTEST" and value_1 > 2.0
#and strand='-'
SELECT distinct gene, locus FROM TSS_TEMCD4Rna_seqPRE where chrom not like '%\_%' and length>200 
and sample_1='0h' and value_1<=2.0  and significant='yes'  and TSS_group_id not in (

SELECT distinct TSS_group_id FROM TSS_NaiveCD4Rna_seqPRE where chrom not like '%\_%' and length>200 
and sample_1='0h' and value_1<=2.0  and significant='yes'
)and TSS_group_id not in (

SELECT distinct TSS_group_id FROM TSS_TCMCD4Rna_seqPRE where chrom not like '%\_%' and length>200 
and sample_1='0h' and value_1<=2.0  and significant='yes'
) order by gene,locus
