use ems;

UPDATE `ems`.`atype` SET `name`='R language processing', `description`='R is a language and environment for statistical computing and graphics.
In Wardrobe you can run preinstalled scripts or run your own. For instance, IDR tool has been preinstalled.', `imgsrc`='images/rlogo.png' WHERE `id`='1';

DROP TABLE IF EXISTS `advanced_r`;
CREATE TABLE `advanced_r` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rscript` text,
  `lastmodified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `advanced_r`(`id`,`name`,`rscript`) 
VALUES ('IDR00000-0000-0000-0000-000000000001','IDR',
'#\n#  If you have any questions do not hesitate to ask email: Andrey Kartashov <porter@porter.st>\n#\n#  You can find full documentation at https://biowardrobe.com/projects/wardrobe/wiki/Devel_R_Wardrobe_Library\n#  This script goes into \'Rscript\' command. All the output can be found in \"Default Result(s)\" tab\n#\n#  Variable \'experiment\' is injected into the script and it contains current experiment data\n#  experiment<-wardrobe(current_experiment_id)[[1]]\n#\n#  Quick \'experiment\' - description:\n#	experiment$alias   - experiment\'s short name\n#	experiment$isRNA   - T/F, TRUE if experiment\'s type is RNA-Seq\n#	experiment$db      - UCSC genome browser database name hg19/mm10/rn5/xenTro3/...\n#     ChIP Specific:\n#	    experiment$dataset  - MACS table, column names can be found in Islands tab: refseq_id,gene_id... \n#             				  experiment$dataset$pileup\n#     RNA  Specific:\n#	    experiment$dataseti - RPKM isoform table, column names can be found in \"RPKM list\" tab: refseq_id,gene_id... \n#							  experiment$dataset$TOT_R_0\n#\n\n#  Only administrators can edit this code',
'2015-02-23 23:29:15')
ON DUPLICATE KEY UPDATE `rscript`=value(`rscript`);

INSERT INTO `settings`(`key`,`value`,`description`,`status`,`group`) 
VALUES ('advanced','/ANL-DATA','Relative path where all files from advanced analysis are stored; also used by apache to download data files.',0,1)
ON DUPLICATE KEY UPDATE `description`=value(`description`);
