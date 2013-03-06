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

insert into worker (worker,passwd,fname,lname) values ('admin','admin','admin','admin');

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

set foreign_key_checks = 1 ;

#Patch one
#

ALTER TABLE `ems`.`genome` ADD COLUMN `db` VARCHAR(100) NULL  AFTER `genome` , ADD COLUMN `findex` VARCHAR(200) NULL  AFTER `db` ;
ALTER TABLE `ems`.`genome` ADD COLUMN `annotation` VARCHAR(200) NULL  AFTER `findex` ;

update `ems`.`genome` set `db`='hg19',`findex`='hg19',`annotation`='hg19_refsec_genes' where id=1;
update `ems`.`genome` set `db`='hg19',`findex`='hg19c',`annotation`='hg19_refsec_genes_control' where id=2;
update `ems`.`genome` set `db`='mm9',`findex`='mm9',`annotation`='mm9_refsec_genes_2012' where id=3;

#Patch two
#

ALTER TABLE `ems`.`labdata` CHANGE COLUMN `browsergrp_id` `browsergrp` VARCHAR(150) NULL DEFAULT ''  ;
ALTER TABLE `ems`.`labdata` ADD COLUMN `tagsribo` INT(11) NULL DEFAULT '0'  AFTER `tagsmapped` ;

#Patch three
#
use ems;
set foreign_key_checks = 0 ;

ALTER TABLE `ems`.`worker` ADD COLUMN `email` VARCHAR(200) NULL DEFAULT NULL  AFTER `dnapass` , ADD COLUMN `notify` INT NULL DEFAULT 0  AFTER `email` ;
ALTER TABLE `ems`.`labdata` CHANGE COLUMN `dateadd` `dateadd` DATE NOT NULL  ;


drop table if exists spikeinslist;
drop table if exists spikeins;
drop table if exists info;

create table if not exists info (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
info  TEXT default ''
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
insert into info(info) values('');
insert into info(info) values('');

create table if not exists spikeins (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
spikeins varchar(200) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into spikeins(spikeins) values ('spike-in mix1');

ALTER TABLE `ems`.`labdata` CHANGE COLUMN `spikeins` `spikeins_id` INT NULL  ;
UPDATE `ems`.`labdata` SET spikeins_id=NULL;
UPDATE `ems`.`labdata` SET spikeins_id=1 where genome_id in (2,4);
ALTER TABLE `ems`.`labdata` ADD CONSTRAINT
  FOREIGN KEY ( `spikeins_id` ) REFERENCES `ems`.`spikeins` (`id` );

create table if not exists spikeinslist (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
spikeins_id INTEGER,
name varchar(100),
info varchar(100) default '',
concentration float,
unique index(spikeins_id,name),
index(spikeins_id), FOREIGN KEY (spikeins_id)
 REFERENCES spikeins(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00002','D',15000);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00003','D',937.5);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00004','A',7500);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00009','B',937.5);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00012','C',0.11444092);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00013','D',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00014','D',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00016','C',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00017','A',0.11444092);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00019','A',29.296875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00022','D',234.375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00024','C',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00025','B',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00028','A',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00031','B',1.83105469);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00033','A',1.83105469);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00034','B',7.32421875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00035','B',117.1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00039','C',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00040','C',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00041','D',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00042','B',468.75);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00043','D',468.75);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00044','C',117.1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00046','D',3750);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00048','D',0.01430512);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00051','B',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00053','B',29.296875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00054','C',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00057','C',0.01430512);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00058','C',1.83105469);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00059','D',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00060','B',234.375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00061','D',0.05722046);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00062','A',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00067','B',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00069','D',1.83105469);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00071','C',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00073','B',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00074','C',15000);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00075','B',0.01430512);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00076','C',234.375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00077','D',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00078','D',29.296875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00079','D',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00081','D',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00083','A',0.02861023);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00084','C',29.296875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00085','A',7.32421875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00086','D',0.11444092);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00092','A',234.375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00095','A',117.1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00096','B',15000);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00097','A',0.45776367);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00098','C',0.05722046);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00099','C',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00104','B',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00108','A',937.5);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00109','B',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00111','C',468.75);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00112','D',117.1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00113','C',3750);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00116','A',468.75);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00117','B',0.05722046);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00120','C',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00123','A',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00126','B',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00130','A',30000);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00131','A',117.1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00134','A',1.83105469);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00136','A',1875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00137','D',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00138','B',0.11444092);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00142','B',0.22888184);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00143','C',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00144','A',29.296875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00145','C',937.5);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00147','A',0.91552734);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00148','B',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00150','B',3.66210938);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00154','A',7.32421875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00156','A',0.45776367);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00157','C',7.32421875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00158','B',0.45776367);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00160','D',7.32421875);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00162','C',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00163','D',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00164','C',0.45776367);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00165','D',58.59375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00168','D',0.45776367);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00170','A',14.6484375);
insert into spikeinslist (spikeins_id,name,info,concentration) values
(1,'ERCC-00171','B',3750);

set foreign_key_checks = 1 ;




