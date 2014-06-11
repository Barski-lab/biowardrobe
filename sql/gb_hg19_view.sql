/**
View for tracks in hg19
**/
drop view if exists hg19.trackDb_local;

create view hg19.trackDb_local as

#RNA
select replace(concat(l.uid,'_wtrack'),'-','_') as tableName, l.name4browser as shortLabel, IF(etype LIKE '%dUTP%',"PbedGraph 4","bedGraph 4") as type, l.name4browser as longLabel,
0 as visibility, 10 as priority, 30 as colorR, 70 as colorG, 150 as colorB, 30 as altColorR, 70 as altColorG, 150 as altColorB,
0 as useScore, 0 private, 0 as restrictCount, null as restrictList, null as url, null as html, egroup_id as grp, 0 as canPack, 
"autoScale on\nwindowingFunction maximum" as settings
from ems.labdata l, ems.experimenttype et, ems.genome g
where deleted=0 and libstatus between 10 and 99 and experimenttype_id=et.id and etype like '%RNA%' and genome_id=g.id and g.db like 'hg%'
union 
#DNA GRP
select replace(concat(l.uid,'_grp'),'-','_') as tableName, l.name4browser as shortLabel, "bed 4 +" as type, l.name4browser as longLabel,
0 as visibility, 10 as priority, 30 as colorR, 70 as colorG, 150 as colorB, 30 as altColorR, 70 as altColorG, 150 as altColorB,
0 as useScore, 0 private, 0 as restrictCount, null as restrictList, null as url, null as html, egroup_id as grp, 0 as canPack, 
concat("
compositeTrack on
group ",egroup_id,"\n track ",replace(concat(l.uid,'_grp'),'-','_'),"")
 as settings
from ems.labdata l, ems.experimenttype et, ems.genome g
where deleted=0 and libstatus between 10 and 99 and experimenttype_id=et.id and etype like '%DNA%' and genome_id=g.id and g.db like 'hg%'
union
#DNA
select replace(concat(l.uid,'_wtrack'),'-','_') as tableName, l.name4browser as shortLabel, "bedGraph 4" as type, l.name4browser as longLabel,
0 as visibility, 10 as priority, 30 as colorR, 70 as colorG, 150 as colorB, 30 as altColorR, 70 as altColorG, 150 as altColorB,
0 as useScore, 0 private, 0 as restrictCount, null as restrictList, null as url, null as html, egroup_id as grp, 0 as canPack, 
concat("parent ",replace(concat(l.uid,'_grp'),'-','_'),"\n track ",replace(concat(l.uid,'_wtrack'),'-','_'),"
autoScale on\n
windowingFunction maximum
") as settings
from ems.labdata l, ems.experimenttype et, ems.genome g
where deleted=0 and libstatus between 10 and 99 and experimenttype_id=et.id and etype like '%DNA%' and genome_id=g.id and g.db like 'hg%'
union 
#DNA islands
select replace(concat(l.uid,'_islands'),'-','_') as tableName, l.name4browser as shortLabel, "bed 4 +" as type, l.name4browser as longLabel,
0 as visibility, 10 as priority, 0 as colorR, 30 as colorG, 100 as colorB, 30 as altColorR, 70 as altColorG, 150 as altColorB,
0 as useScore, 0 private, 0 as restrictCount, null as restrictList, null as url, null as html, egroup_id as grp, 1 as canPack, 
concat("parent ",replace(concat(l.uid,'_grp'),'-','_'),"\n track ",replace(concat(l.uid,'_islands'),'-','_'),"
visibility dense
") as settings
from ems.labdata l, ems.experimenttype et, ems.genome g
where deleted=0 and libstatus between 10 and 99 and experimenttype_id=et.id and etype like '%DNA%' and genome_id=g.id and g.db like 'hg%'
;

drop view if exists hg19.grp_local;

create view hg19.grp_local as

select id as `name`,`name` as label,priority,1 as defaultClose from ems.egroup;

