#Patch 4
#
use ems;
set foreign_key_checks = 0 ;

drop table if exists project;
drop table if exists rtype;
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
insert into rtype(name) values('RPKM islands');
insert into rtype(name) values('DEseq');
insert into rtype(name) values('PCA');

create table if not exists project (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    description TEXT default '',
    article TEXT default '',
    worker_id INTEGER NOT NULL,
index(worker_id), FOREIGN KEY(worker_id)
 REFERENCES worker(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table if not exists result (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name varchar(200) NOT NULL,
    description TEXT default '',
    tableName varchar(200) NOT NULL,
    labdata_id INTEGER default NULL,
    rtype_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
index(rtype_id), FOREIGN KEY (rtype_id)
REFERENCES rtype(id),
index(project_id), FOREIGN KEY (project_id)
REFERENCES project(id),
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


set foreign_key_checks = 1 ;
