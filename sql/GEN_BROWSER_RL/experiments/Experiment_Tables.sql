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

drop table if exists ExperimentType;
create table if not exists ExperimentType (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Type varchar(100) UNIQUE KEY,
Program varchar(100)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into ExperimentType (Type,program) values ('ChIP-Seq','bowtie');
insert into ExperimentType (Type,program) values ('RNA-Seq','tophat');

drop table if exists Antibodies;
create table if not exists Antibodies (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Antibody varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into Antibodies (Antibody) values ('N/A');
insert into Antibodies (Antibody) values ('Pol2, 8WG16, Covance');

drop table if exists Crosslink;
create table if not exists Crosslink (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Crosslink varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into Crosslink (Crosslink) values ('N/A');
insert into Crosslink (Crosslink) values ('FA, 10min, RT');

drop table if exists Genome;
create table if not exists Genome (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Genome varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into Genome (Genome) values ('Human');
insert into Genome (Genome) values ('Human+spike');

drop table if exists Fragmentation;
create table if not exists Fragmentation (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Fragmentation varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into Fragmentation (Fragmentation) values ('Covaris, 17min');
insert into Fragmentation (Fragmentation) values ('Covaris, 15min');
insert into Fragmentation (Fragmentation) values ('Ambion Frag Kit');


drop table if exists Worker;
create table if not exists Worker (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Worker varchar(150) UNIQUE KEY,
passwd varchar(150),
fname varchar(150),
lname varchar(150)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into Worker (Worker,fname,lname) values ('barski','Artem','Barski');
insert into Worker (Worker,fname,lname) values ('porter','Andrey','Kartashov');
insert into Worker (Worker,fname,lname) values ('david','David','Muench');
insert into Worker (Worker,fname,lname) values ('yrina','Yrina','Rochman');

drop table if exists protocol;
create table if not exists protocol (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
protocol varchar(150) UNIQUE KEY
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
insert into protocol(protocol) values('dUTP');

create table if not exists LabData (
 id INTEGER AUTO_INCREMENT,
 Cells varchar(250),
 Mapping_cond varchar(200),
 Chip_cond varchar(200),
 spikeinspool varchar(200),
 spikeins DOUBLE,
 Tags_total INTEGER,
 Tags_mapped INTEGER,
 LibCode varchar(50),
 Name4browser varchar(200),
 Notes TEXT,
 file_name varchar(250),
 date_add datetime not null,
 libStatus INTEGER, 
 libStatusTxt varchar(200),
 genome_id INTEGER,
 crosslink_id INTEGER,
 fragmentation_id INTEGER,
 antibodies_id INTEGER,
 protocol_id INTEGER,
 worker_id INTEGER,
 experimenttype_id INTEGER,
 PRIMARY KEY(id),
 index(worker_id), FOREIGN KEY (worker_id)
  REFERENCES Worker(id),
 index(genome_id), FOREIGN KEY(genome_id)
  REFERENCES Genome(id),
 index(crosslink_id), FOREIGN KEY(crosslink_id)
  REFERENCES Crosslink(id),
 index(fragmentation_id), FOREIGN KEY(fragmentation_id)
  REFERENCES Fragmentation(id),
 index(antibodies_id), FOREIGN KEY(antibodies_id)
  REFERENCES Antibodies(id),
index(protocol_id), FOREIGN KEY(protocol_id)
  REFERENCES protocol(id),
index(experimenttype_id), FOREIGN KEY(experimenttype_id)
  REFERENCES ExperimentType(id)

)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into LabData(worker_id,LibCode,Name4browser,genome_id,experimenttype_id,Cells,crosslink_id,date_add) 
values(1,'ABAB4','Naive CD4 Pol II',1,1,'Human Naive  CD4 T cells (CD45R0-CD27+)',2,now());
insert into LabData(worker_id,LibCode,Name4browser,genome_id,experimenttype_id,Cells,crosslink_id,date_add) 
values(1,'ABAB5','TCM CD4 Pol II',1,1,'Human TCM  CD4 T cells (CD45R0+CD27+)',2,now());


set foreign_key_checks = 1 ;



