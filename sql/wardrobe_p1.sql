use ems;
--
-- Table structure for table `egrouprights`
--

DROP TABLE IF EXISTS `labdata_r`;
CREATE TABLE `labdata_r` (
  `id` varchar(36) NOT NULL,
  `rscript` text,
  `lastmodified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `labdata_r`(`id`,`rscript`) VALUES ('default0-0000-0000-0000-000000000001','#  You can find full documentation at https://wardrobe.porter.st/projects/wardrobe/wiki/Preliminary_Analysis_Run_R\n#  This script has been processed by \'Rscript\' all the output can be found in \"Result(s)\" tab\n#  \n#  Variable \'experiment\' has been injected into the script and it contains current experiment data experiment<-wardrobe(current_experiment_id)\n#	\n#  Quick \'experiment\' - description:\n#	experiment$alias   - experiment\'s short name\n#	experiment$isRNA   - T/F, TRUE if experiment\'s type is RNA-Seq \n#	experiment$isPair  - T/F, TRUE if it is pair end experiment\n#	experiment$db      - UCSC genome browser database name hg19/mm10/rn5/xenTro3/...\n#     ChIP Specific:\n#	    experiment$dataset  - MACS table, column names can be found in Islands tab: refseq_id,gene_id... experiment$dataset$pileup\n#     RNA  Specific:\n#	    experiment$dataseti - RPKM isoform table, column names can be found in \"RPKM list\" tab: refseq_id,gene_id... experiment$dataset$TOT_R_0\n#\n\n#Check if experiment is RNA-Seq or DNA-Seq\nif(experiment$isRNA) {\n\n	rpkm<-experiment$dataseti$RPKM_0\n	hist(rpkm[rpkm>2 & rpkm<500],main=paste(\"RPKM distribution of\",experiment$alias),breaks=1000,xlab=\"rpkm>2 & rpkm<500\")\n\n} else {\n\n	# plot Island length distribution\n	islands_length<-experiment$dataset$length\n\n	hist(islands_length,breaks=100,main=paste(\"Islands distribution of \",experiment$alias),xlab=\"Island length\")\n\n	# plot Island height rank from hist\n	r<-hist(experiment$dataset$pileup,breaks=100,plot=F)\n	ss<-smooth.spline(r$counts,r$breaks[1:length(r$counts)])\n\n	plot(ss,main=paste(\"Rank plot of \",experiment$alias),xlab=\"Ranked peak number\",ylab=\"Tag height\",type=\"l\")\n	\n	summary(islands_length)\n}\n');
