update human_naive_CD4_gene_expression a1, human_em_CD4_gene_expression a2 
set a1.o_value_1=a2.value_1 where a1.chrom=a2.chrom and a1.l_start=a2.l_start and
a1.l_end=a2.l_end and a1.sample_1=a2.sample_1 and a1.sample_2=a2.sample_2 
and a1.sample_1='0h'  #and a1.gene_id=a2.gene_id

select * from human_naive_CD4_gene_expression a2, human_em_CD4_gene_expression a1 
 where a1.chrom=a2.chrom and a1.l_start=a2.l_start and
a1.l_end=a2.l_end and a1.sample_1=a2.sample_1 and a1.sample_2=a2.sample_2 
and a1.sample_1='0h'  #and a1.gene_id=a2.gene_id



#update human_em_CD4_gene_expression set o_value_1=0