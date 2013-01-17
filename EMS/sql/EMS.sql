create database if not exists ems;
create database if not exists experiments;
use ems;
set foreign_key_checks = 0 ;
drop table if exists LabData;
drop table if exists ExperimentType;
drop table if exists Antibodies;
drop table if exists Crosslink;
drop table if exists Genome;
drop table if exists Fragmentation;
drop table if exists Worker;
drop table if exists protocol;

drop table if exists experimenttype;
create table if not exists experimenttype (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
etype varchar(100) UNIQUE KEY,
command varchar(400)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into experimenttype (etype,command) values ('DNA-Seq','bowtie');
insert into experimenttype (etype,command) values ('DNA-Seq pair','bowtie');
insert into experimenttype (etype,command) values ('RNA-Seq','tophat');
insert into experimenttype (etype,command) values ('RNA-Seq pair','tophat');
insert into experimenttype (etype,command) values ('RNA-Seq dUTP','tophat');

drop table if exists antibody;
create table if not exists antibody (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
antibody varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into antibody (antibody) values ('N/A');
insert into antibody (antibody) values ('Pol2, 8WG16, Covance');
insert into antibody (antibody) values ('H3K9Ac (ab10812)');
insert into antibody (antibody) values ('H3K36me3 (ab9050)');
insert into antibody (antibody) values ('H3K9me3 (ab8898)');
insert into antibody (antibody) values ('H3K27Ac (ab4729)');

drop table if exists crosslink;
create table if not exists crosslink (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
crosslink varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into crosslink (crosslink) values ('N/A');
insert into crosslink (crosslink) values ('FA, 10min, RT');

drop table if exists genome;
create table if not exists genome (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
genome varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into genome (genome) values ('Human');
insert into genome (genome) values ('Human+spike');
insert into genome (genome) values ('Mouse');

drop table if exists fragmentation;
create table if not exists fragmentation (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
fragmentation varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into fragmentation (fragmentation) values ('Covaris, 17min');
insert into fragmentation (fragmentation) values ('Covaris, 15min');
insert into fragmentation (fragmentation) values ('Ambion Frag Kit');
insert into fragmentation (fragmentation) values ('Covaris, 3min');
insert into fragmentation (fragmentation) values ('Covaris, 3.2min');
insert into fragmentation (fragmentation) values ('Covaris, 10min');
insert into fragmentation (fragmentation) values ('NewCovaris, 3min');
insert into fragmentation (fragmentation) values ('Covaris, 5min');
insert into fragmentation (fragmentation) values ('Mnase');



drop table if exists worker;
create table if not exists worker (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
worker varchar(150) UNIQUE KEY,
passwd varchar(150),
fname varchar(150),
lname varchar(150),
dnalogin varchar(150),
dnapass varchar(150)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into worker (worker,fname,lname) values ('barski','Artem','Barski');
insert into worker (worker,fname,lname) values ('porter','Andrey','Kartashov');
insert into worker (worker,fname,lname) values ('david','David','Muench');
insert into worker (worker,fname,lname) values ('yrina','Yrina','Rochman');
insert into worker (worker,fname,lname) values ('mark','Mark','Rochman');
insert into worker (worker,fname,lname) values ('satoshi','Satoshi','Namekawa');
insert into worker (worker,fname,lname) values ('clark','Willis','Bacon');
insert into worker (worker,fname,lname) values ('rahul','Rahul','D.Mello');

drop table if exists labdata;
create table if not exists labdata (
 id INTEGER AUTO_INCREMENT,
 cells varchar(1000) not null,
 conditions varchar(1000) not null,
 spikeinspool varchar(200) default '',
 spikeins varchar(200) default '',
 tagstotal INTEGER default 0,
 tagsmapped INTEGER default 0,
 notes TEXT default '',
 protocol TEXT default '',
 filename varchar(2000) default '',
 dateadd datetime not null,
 libstatus INTEGER default 0,
 libstatustxt varchar(200) default 'created',
 libcode varchar(200),
 name4browser varchar(300),
 browsergrp_id INTEGER default 0,
 genome_id INTEGER default 1,
 crosslink_id INTEGER default 1,
 fragmentation_id INTEGER default 1,
 antibody_id INTEGER default 1,
 experimenttype_id INTEGER default 1,
 worker_id INTEGER,
 PRIMARY KEY(id),
 index(worker_id), FOREIGN KEY (worker_id)
  REFERENCES worker(id),
 index(genome_id), FOREIGN KEY(genome_id)
  REFERENCES genome(id),
 index(crosslink_id), FOREIGN KEY(crosslink_id)
  REFERENCES crosslink(id),
 index(fragmentation_id), FOREIGN KEY(fragmentation_id)
  REFERENCES fragmentation(id),
 index(antibody_id), FOREIGN KEY(antibody_id)
  REFERENCES antibody(id),
index(experimenttype_id), FOREIGN KEY(experimenttype_id)
  REFERENCES experimenttype(id)

)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB4','Naïve CD4 Pol II',1,1,'Human Naive  CD4 T cells (CD45R0-CD27+)','Resting, purified from filters',2,1,2,date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB5','TCM CD4 Pol II',1,1,'Human TCM  CD4 T cells (CD45R0+CD27+)','Resting, purified from filters',2,1,2,date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB6','TEM CD4 Pol II',1,1,'Human TEM  CD4 T cells (CD45R0+CD27-)','Resting, purified from filters',2,1,2,date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB7','Naïve CD4 Pol II',1,1,'Human Naïve  CD4 T cells (CD45RA0-CD27+)','Resting, purified from filters',2,2,2,date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB8','TCM CD4 Pol II',1,1,'Human Naïve  CD4 T cells (CD45RA0-CD27+)','Resting, purified from filters',2,2,2,date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,crosslink_id,fragmentation_id,antibody_id,dateadd)
values(1,'ABAB9','TEM CD4 Pol II',1,1,'Human Naïve  CD4 T cells (CD45RA0-CD27+)','Resting, purified from filters',2,2,2,date(now()));

insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(3,'ABDM10','Resting Naïve CD4',1,5,'Human Naïve CD4 T cells','Resting, purified from filters',3,'NIST Pool 7','0.4',date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(3,'ABDM11','Activated 18hr Naïve CD4',1,5,'Human Naïve CD4 T cells','Activated 18hrs IL-4, purified from filters',3,'NIST Pool 7','0.4',date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(3,'ABDM12','Resting Naïve CD4 1',1,5,'Human Naïve CD4 T cells','Resting, purified from filters',4,'NIST Pool 7','0.4',date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(3,'ABDM13','Activated 18hr Naïve CD4 1',1,5,'Human Naïve CD4 T cells','Activated 18hrs IL-4, purified from filters',4,'NIST Pool 7','0.4',date(now()));


insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(4,'ABYR14','Activated_rested CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purified, rested 3d',4,'','0',date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(4,'ABYR15','Anergic_rested CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purified, rested 3d',4,'','0',date(now()));
insert into labdata(worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd)
values(4,'ABYR16','Naïve CD4',2,5,'Human CD4 T cells Naïve','Rested with APC 1d, purified',5,'','0',date(now()));



insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR16','Naive CD4 ',2,5,'HumanCD4 T cells Naive','Rested with APC 1d, purified ',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR17','Activated_rested CD4 ',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purified, rested 3d',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR18','Anergic_rested CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purified, rested 3d',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR19','Naive CD4 ',2,5,'Human CD4 T cells Naive','Rested with APC 14h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR20','Activated Ist CD4  3h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28 3h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR21','Anergic Ist CD4 3h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 3h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR22','Activated Ist CD4 7h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28 7h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR23','Anergic Ist CD4 7h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 7h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR24','Activated Ist CD4 14h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28 14h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR25','Anergic Ist CD4 14h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 14h, purified Invitrogen 10min',4,'','',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR28','Naive CD4',2,5,'Human CD4 T cells Naive','Cultured with APC 4d, purified StemCell, rest 2d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR29','Activated CD4+2od Act 4h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 5d, purifiedStemCell, rested 3d, Act4h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR30','Anergic CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 5d, purifiedStemCell, rested 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR31','Anergic CD4+2od Act 4h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 5d, purifiedStemCell, rested 3d, Act4h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR32','Naive CD4',2,5,'Human CD4 T cells Naive','Cultured with APC 4d, purified StemCell, rest 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR33','Naive CD4+2od Act 6h',2,5,'Human CD4 T cells Naive','Cultured with APC 4d, purified StemCell, rest 3d, Act6h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR34','Activated CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purifiedStemCell, rested 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR35','Activated CD4+2od Act 6h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purifiedStemCell, rested 3d, Act6h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR36','Anergic CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR37','Anergic CD4+2od Act 6h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 3d, Act6h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR38','Activated CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purifiedStemCell, rested 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR39','Activated CD4+2od Act 6h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28/IL2 4d, purifiedStemCell, rested 3d, Act6h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR40','Anergic CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 3d',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR41','Anergic CD4+2od Act 6h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 3d, Act6h',4,'2ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR46','Naive CD4',2,5,'Human CD4 T cells Naive',' purified StemCell+1d',4,'5ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR47','Naive CD4+Act 4h',2,5,'Human CD4 T cells Naive',' purified StemCell+1d+Act4h',4,'5ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR48','Effector CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28 4d, purifiedStemCell, rested 4d',7,'5ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR49','Effector CD4+2od Act 4h',2,5,'Human CD4 T cells','Activated with APC & aCD3/aCD28 4d, purifiedStemCell, rested 4d, Act4h',7,'5ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR50','Anergic CD4',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 4d',7,'5ul/1M cells','spike-in mix1',date(now()));
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd) values
(4,'ABYR51','Anergic CD4+2od Act 4h',2,5,'Human CD4 T cells','Activated with APC & aCD3/CTLA4Ig 4d, purifiedStemCell, rested 4d, Act4h',7,'5ul/1M cells','spike-in mix1',date(now()));


insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd,crosslink_id) values
(7,'ABCB42','Naive JURKAT Pol2 2ul',1,1,'Naive JURKAT','Naive JURKAT',8,'','',date(now()),2);
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd,crosslink_id) values
(7,'ABCB43','Naive JURKAT Pol2 10ul',1,1,'Naive JURKAT','Naive JURKAT',8,'','',date(now()),2);
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd,crosslink_id) values
(7,'ABCB44','Naive JURKAT H2AK5Ac',1,1,'Naive JURKAT','Naive JURKAT',8,'','',date(now()),2);
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd,crosslink_id) values
(7,'ABCB45','Trio 120 CAGE H3K27ac',1,1,'','',9,'','',date(now()),2);
insert into labdata (worker_id,libcode,name4browser,genome_id,experimenttype_id,cells,conditions,fragmentation_id,spikeinspool,spikeins,dateadd,crosslink_id) values
(7,'ABCB52','Trio 120 CAGE H3K4me3',1,1,'','',9,'','',date(now()),2);


set foreign_key_checks = 1 ;



