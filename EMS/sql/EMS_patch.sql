#Patch 4
#
use ems;
set foreign_key_checks = 0 ;

drop table if exists project;
drop table if exists rtype;
drop table if exists atype;
drop table if exists analysis;
drop table if exists ahead;
drop table if exists subtype;
drop table if exists result;
drop table if exists rhead;
drop table if exists resultintersection;


create table if not exists rtype (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


insert into rtype(name) values('RPKM isoforms');
insert into rtype(name) values('RPKM genes');
insert into rtype(name) values('RPKM common tss');
insert into rtype(name) values('CHIP islands');

create table if not exists atype (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into atype(name) values('DEseq');
insert into atype(name) values('PCA');

create table if not exists project (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    description TEXT default '',
    article TEXT default '',
    worker_id INTEGER NOT NULL,
index(worker_id), FOREIGN KEY(worker_id)
 REFERENCES worker(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists ahead (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    status INTEGER default 0,
    atype_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    index(atype_id), FOREIGN KEY (atype_id)
    REFERENCES atype(id),
    index(project_id), FOREIGN KEY (project_id)
    REFERENCES project(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table if not exists result (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    description TEXT default '',
    tableName varchar(200) NOT NULL,
    labdata_id INTEGER default NULL,
    ahead_id INTEGER default NULL,
    rtype_id INTEGER default NULL,
    atype_id INTEGER default NULL,
    project_id INTEGER NOT NULL,
index(rtype_id), FOREIGN KEY (rtype_id)
REFERENCES rtype(id),
index(atype_id), FOREIGN KEY (atype_id)
REFERENCES atype(id),
index(project_id), FOREIGN KEY (project_id)
REFERENCES project(id),
index(ahead_id), FOREIGN KEY (ahead_id)
REFERENCES ahead(id),
index(labdata_id), FOREIGN KEY (labdata_id)
REFERENCES labdata(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table if not exists rhead (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    project_id INTEGER NOT NULL,
    index(project_id), FOREIGN KEY (project_id)
    REFERENCES project(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists resultintersection (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    result_id INTEGER NOT NULL,
    rhead_id INTEGER NOT NULL,
    index(result_id), FOREIGN KEY (result_id)
    REFERENCES result(id),
    index(rhead_id), FOREIGN KEY (rhead_id)
    REFERENCES rhead(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists subtype (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    atype_id INTEGER NOT NULL,
    name varchar(200) NOT NULL,
    index(atype_id), FOREIGN KEY (atype_id)
    REFERENCES atype(id)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into subtype(atype_id,name) values(1,'untreated');
insert into subtype(atype_id,name) values(1,'treated');

create table if not exists analysis (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    ahead_id INTEGER NOT NULL,
    rhead_id INTEGER NOT NULL,
    subtype_id INTEGER NULL,
    index(ahead_id), FOREIGN KEY (ahead_id)
    REFERENCES ahead(id),
    index(subtype_id), FOREIGN KEY (subtype_id)
    REFERENCES subtype(id),
    index(rhead_id), FOREIGN KEY (rhead_id)
    REFERENCES rhead(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `ems`.`analysis` ADD COLUMN `type` VARCHAR(45) NOT NULL DEFAULT ''  AFTER `rhead_id` ;
ALTER TABLE `ems`.`project` ADD COLUMN `dateadd` DATE NULL  AFTER `worker_id` ;

ALTER TABLE `ems`.`labdata` ADD COLUMN `fragmentsize` INT NULL COMMENT 'fragment size for Chip-seq data'  AFTER `tagsribo` ;
ALTER TABLE `ems`.`labdata` ADD COLUMN `url` VARCHAR(2000) NULL COMMENT 'direct link for a file'  AFTER `libcode` ;

ALTER TABLE `ems`.`genome` ADD COLUMN `annottable` VARCHAR(64) NULL DEFAULT NULL  AFTER `annotation` ;


create table if not exists `condition` (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(50),
    type varchar(50),
    ahead_id INTEGER NOT NULL,
    index(ahead_id), FOREIGN KEY (ahead_id)
    REFERENCES ahead(id),
    analysis_id INTEGER NULL,
    index(analysis_id), FOREIGN KEY (analysis_id)
    REFERENCES analysis(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

set foreign_key_checks = 1 ;
