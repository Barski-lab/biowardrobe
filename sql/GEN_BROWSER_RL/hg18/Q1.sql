#select * from trackDb where tableName not in( select tableName from trackDb_o) 
#select * from trackDb_o where tableName like '%CD4_naive_H3K4me1_dup_GA0047%'
#select * from grp_o