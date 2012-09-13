use hg18;
#select * from trackDb_o where tableName not in (select tableName from trackDb);
#select * from trackDb_o where shortLabel not in (select shortLabel from trackDb);

insert into trackDb select * from trackDb_o where tableName not in (select tableName from trackDb);
insert into grp(name,label,priority,defaultIsClosed) select name,label,priority,1 from grp_o where name not in 
 (select name from grp);