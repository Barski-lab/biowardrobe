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





