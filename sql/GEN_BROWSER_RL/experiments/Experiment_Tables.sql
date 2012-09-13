set foreign_key_checks = 0 ; 
drop table if exists LabExperiments;
drop table if exists ExperimentTypes;
create table if not exists ExperimentTypes (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Type varchar(100) UNIQUE KEY,
Program varchar(100)
);

insert into ExperimentTypes (Type,program) values ('ChIP-Seq','bowtie');
insert into ExperimentTypes (Type,program) values ('RNA-Seq','tophat');

drop table if exists Antibodies;
create table if not exists Antibodies (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Antibody varchar(150) UNIQUE KEY
);

insert into Antibodies (Antibody) values ('N/A');
insert into Antibodies (Antibody) values ('Pol2, 8WG16, Covance');

drop table if exists Crosslinking;
create table if not exists Crosslinking (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Crosslink varchar(150) UNIQUE KEY
);

insert into Crosslinking (Crosslink) values ('N/A');
insert into Crosslinking (Crosslink) values ('FA, 10min, RT');

drop table if exists GENOME;
create table if not exists GENOME (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
GENOME varchar(150) UNIQUE KEY
);

insert into GENOME (GENOME) values ('Human');
insert into GENOME (GENOME) values ('Human+spike');

drop table if exists Fragmentation;
create table if not exists Fragmentation (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
Fragmentation varchar(150) UNIQUE KEY
);

insert into Fragmentation (Fragmentation) values ('Covaris, 17min');
insert into Fragmentation (Fragmentation) values ('Covaris, 15min');
insert into Fragmentation (Fragmentation) values ('Ambion Frag Kit');


drop table if exists worker;
create table if not exists worker (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
worker varchar(150) UNIQUE KEY,
passwd varchar(150),
fname varchar(150),
lname varchar(150)
);

insert into worker (worker,fname,lname) values ('barski','Artem','Barski');
insert into worker (worker,fname,lname) values ('porter','Andrey','Kartashov');
insert into worker (worker,fname,lname) values ('david','David','Muench');
insert into worker (worker,fname,lname) values ('irina','Irina','Rochman');

drop table if exists protocol;
create table if not exists protocol (
id INTEGER AUTO_INCREMENT PRIMARY KEY,
protocol varchar(150) UNIQUE KEY
);
insert into protocol(protocol) values('dUTP');

create table if not exists LabExperiments (
 ID INTEGER AUTO_INCREMENT,
 WORKER_ID INTEGER,
 LibCode varchar(50),
 Name4browser varchar(200),
 genomeType INTEGER,
 libStatus INTEGER, 
 libStatusTxt varchar(200),
 IndexRun INTEGER,
 Type INTEGER,
 Cells varchar(250),
 Tags_total INTEGER,
 Tags_mapped INTEGER,
 Mapping_cond varchar(200),
 Chip_cond varchar(200),
 Crosslink INTEGER,
 fragmentation INTEGER,
 antibody INTEGER,
 protocol INTEGER,
 spikeinspool varchar(200),
 spikeins DOUBLE,
 file_name varchar(250),
 date_add datetime not null,
 PRIMARY KEY(ID),
 index(WORKER_ID), FOREIGN KEY (WORKER_ID)
  REFERENCES WORKER(ID),
 index(genomeType), FOREIGN KEY(genomeType)
  REFERENCES GENOME(ID),
 index(Crosslink), FOREIGN KEY(Crosslink)
  REFERENCES Crosslinking(ID),
 index(Fragmentation), FOREIGN KEY(Fragmentation)
  REFERENCES Fragmentation(ID),
 index(antibody), FOREIGN KEY(antibody)
  REFERENCES Antibodies(ID),
index(protocol), FOREIGN KEY(protocol)
  REFERENCES protocol(ID),
index(Type), FOREIGN KEY(Type)
  REFERENCES ExperimentTypes(ID)

);

insert into LabExperiments(Worker_ID,LibCode,Name4browser,genomeType,IndexRun,Type,Cells,Crosslink,date_add) 
values(1,'ABAB4','Naive CD4 Pol II',1,11,1,'Human Naive  CD4 T cells (CD45R0-CD27+)',2,now());
insert into LabExperiments(Worker_ID,LibCode,Name4browser,genomeType,IndexRun,Type,Cells,Crosslink,date_add) 
values(1,'ABAB5','TCM CD4 Pol II',1,21,1,'Human TCM  CD4 T cells (CD45R0+CD27+)',2,now());


set foreign_key_checks = 1 ;



