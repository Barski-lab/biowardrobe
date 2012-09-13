#select * from trackDb_o where tableName not in( select tableName from trackDb) 
#select * from trackDb_o where tableName like '%CD4_naive_H3K4me1_dup_GA0047%'
#select * from grp

#insert into trackDb select * from trackDb_o where trackDb_o.tableName not in( select tableName from trackDb)
#insert into grp(label,name,priority) select label,name,priority from grp_o where name not in( select name from grp)

#update hg18.grp set defaultIsClosed=1 where defaultIsClosed is NULL
#select * from grp