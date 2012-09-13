SELECT distinct chrom,txStart,txEnd FROM refGene where chrom  like 'chr1' and strand='+' and txEnd-txStart>100 order by chrom,txStart
#SELECT distinct * FROM refGene where chrom not like '%random%'  and txEnd-txStart<100 
#and name like 'NM%'
#order by chrom,txStart
#and strand='-'
#create table NIH_BAM( fileName varchar(255))
#drop table ZINBA_SRR097566
#select name,SUBSTRING_INDEX(SUBSTRING_INDEX(NAME,":",-1),"-",1)  as a from ZINBA_SRR097566
#update ZINBA_SRR097566 set thickEnd=SUBSTRING_INDEX(SUBSTRING_INDEX(NAME,":",-1),"-",-1)
#insert into trackDb(tablename,shortLabel,type,longLabel,visibility,priority,
#colorR,colorG,colorB,
#altColorR,altColorG,altColorB,useScore,private,restrictCount,restrictList,url,html,grp,canPack,settings)
#values('CM_H3K4me3_Duplicate_241_4','CM_H3K4me3_Duplicate_241_4','bed 4 +','CM H3K4me3 Duplicate 241 4',1,1,
#0,0,0,
#0,0,0,0,0,0,'','','','barskii1',1,'')

#  `tableName` varchar(255) NOT NULL,
#  `shortLabel` varchar(255) NOT NULL,
#  `type` varchar(255) NOT NULL,
#  `longLabel` varchar(255) NOT NULL,
#  `visibility` tinyint(3) unsigned NOT NULL,
#  `priority` float NOT NULL,
# `colorR` tinyint(3) unsigned NOT NULL,
# `colorG` tinyint(3) unsigned NOT NULL,
#  `colorB` tinyint(3) unsigned NOT NULL,
#  `altColorR` tinyint(3) unsigned NOT NULL,
#  `altColorG` tinyint(3) unsigned NOT NULL,
#  `altColorB` tinyint(3) unsigned NOT NULL,
#  `useScore` tinyint(3) unsigned NOT NULL,
# `private` tinyint(3) unsigned NOT NULL,
#  `restrictCount` int(11) NOT NULL,
 # `restrictList` longblob NOT NULL,
 # `url` longblob NOT NULL,
 # `html` longblob NOT NULL,
 # `grp` varchar(255) NOT NULL,
 # `canPack` tinyint(3) unsigned NOT NULL,
 # `settings` longblob NOT NULL,
 # PRIMARY KEY (`tableName`)


