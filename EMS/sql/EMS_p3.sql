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
