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

insert into atype(name) values('DESeq');
insert into atype(name) values('PCA');
INSERT INTO `ems`.`atype` (`id`, `name`) VALUES ('3', 'DESeq2');
INSERT INTO `ems`.`atype` (`id`, `name`) VALUES ('4', 'ATP & filter');
INSERT INTO `ems`.`atype` (`id`, `name`) VALUES ('5', 'MANorm');

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
    name varchar(50),
    field int(5),
    filter int(5),
    value float,
    ahead_id INTEGER NOT NULL,
    index(ahead_id), FOREIGN KEY (ahead_id)
    REFERENCES ahead(id),
    analysis_id INTEGER NULL,
    index(analysis_id), FOREIGN KEY (analysis_id)
    REFERENCES analysis(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists `filter`;
drop table if exists `fhead`;

create table if not exists `fhead` (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
        index using btree(id),
    `name` varchar(50),
    ahead_id INTEGER NOT NULL,
    index(ahead_id), FOREIGN KEY (ahead_id)
    REFERENCES ahead(id),
    analysis_id INTEGER NULL,
    index(analysis_id), FOREIGN KEY (analysis_id)
    REFERENCES analysis(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `filter` (
    operand int(5),
        tbl	varchar(64),
    field int(5),
    filter int(5),
    value varchar(100),
    fhead_id INTEGER NOT NULL,
    index(fhead_id), FOREIGN KEY (fhead_id)
    REFERENCES fhead(id) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `ems`.`atype`
ADD COLUMN `description` VARCHAR(2000) NULL  AFTER `name` ,
ADD COLUMN `imgsrc` VARCHAR(300) NULL  AFTER `description` ,
ADD COLUMN `sort` INT(11) NULL  AFTER `imgsrc` ,
ADD COLUMN `implemented` INT(1) NULL  AFTER `sort` ;

UPDATE `ems`.`atype` SET `implemented`=0;
UPDATE `ems`.`atype` SET `sort`=999;

insert into ems.atype (name,description,imgsrc,sort,implemented) values
('Genes Lists','This function allows you to organize and manage genes lists (groupping, filtering) for future analysis.
All lists can be saved in excel like format. If you dont know where to start, start from here.',
'/ems/images/notebook3_big.png',1,1);

update ems.atype set description='To produce differentially expressed gene lists use this function. You can use it to compare groups of treated and untreated
experiments and also when you need differences in series of experiments.',
imgsrc='/ems/images/index_view_big.png', sort=2,implemented=1 where id=1;

update ems.atype set description='ATP is Average Tag Density Profile plot which shows modification level (enrichment) for particular gene list.
You can combine all gene list created in "Genes Lists" or "DESeq" analysis and all DNA-Seq experiments in one plot.',
imgsrc='/ems/images/chart_line_big.png', sort=2,implemented=1 where id=4;

update ems.atype set description='PCA stands for Principle Component Analysis it can help to see similarities between all experimental data.',
imgsrc='/ems/images/shopping_cart_big.png', sort=5,implemented=1 where id=2;

update ems.atype set description='Estimate variance-mean dependence in count data from high-throughput sequencing assays and test for
differential expression based on a model using the negative binomial distribution.',
imgsrc='', sort=999,implemented=0 where id=3;

drop table if exists genelist;
create table if not exists genelist (
    id varchar(36) PRIMARY KEY,
    name varchar(100) NOT NULL,
    leaf bool not null default false,
    `type` INTEGER NOT NULL,
    conditions TEXT,
    gblink TEXT,
    db varchar(64) NOT NULL default 'experiments',
    tableName varchar(64) NULL,
    labdata_id INTEGER default NULL,
    rtype_id INTEGER default NULL,
    atype_id INTEGER default NULL,
    project_id INTEGER NOT NULL,
    parent_id varchar(36) default NULL,

index(rtype_id), FOREIGN KEY (rtype_id)
REFERENCES rtype(id),

index(atype_id), FOREIGN KEY (atype_id)
REFERENCES atype(id),

index(project_id), FOREIGN KEY (project_id)
REFERENCES project(id),

index(labdata_id), FOREIGN KEY (labdata_id)
REFERENCES labdata(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `ems`.`genelist`
  ADD CONSTRAINT `genelist_ifbk_5`
  FOREIGN KEY (`parent_id` )
  REFERENCES `ems`.`genelist` (`id` )
  ON DELETE CASCADE
  ON UPDATE CASCADE
, ADD INDEX `genelist_ifbk_5_idx` (`parent_id` ASC) ;


set foreign_key_checks = 1 ;
