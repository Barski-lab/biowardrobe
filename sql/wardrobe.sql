
DROP DATABASE IF EXISTS `experiments`;
DROP DATABASE IF EXISTS `ems`;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `experiments` /*!40100 DEFAULT CHARACTER SET utf8 */;
--
-- Current Database: `ems`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ems` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `ems`;

set foreign_key_checks = 0 ;

--
-- Table structure for table `antibody`
--

DROP TABLE IF EXISTS `antibody`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `antibody` (
  `id` varchar(36) NOT NULL,
  `antibody` varchar(150) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `atdp`
--

DROP TABLE IF EXISTS `atdp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `atdp` (
  `genelist_id` varchar(36) DEFAULT NULL,
  `tbl1_id` varchar(36) DEFAULT NULL,
  `tbl2_id` varchar(36) DEFAULT NULL,
  `pltname` varchar(200) NOT NULL,
  KEY `genelist_id` (`genelist_id`) USING HASH,
  KEY `tbl1_id` (`tbl1_id`) USING HASH,
  KEY `tbl2_id` (`tbl2_id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `atype`
--

DROP TABLE IF EXISTS `atype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `atype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `imgsrc` varchar(300) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `implemented` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crosslink`
--

DROP TABLE IF EXISTS `crosslink`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crosslink` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `crosslink` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `crosslink` (`crosslink`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `download`
--

DROP TABLE IF EXISTS `download`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `download` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `download` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `egroup`
--

DROP TABLE IF EXISTS `egroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `egroup` (
  `id` varchar(36) NOT NULL COMMENT 'name in original grp_local',
  `laboratory_id` varchar(36) NOT NULL COMMENT 'main owner, additional rights in egrouprights',
  `genome` varchar(300) DEFAULT NULL COMMENT 'genomes for UCSC hg19;mm10;mm9 - depend which analysis was done',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT 'label in original grp_local',
  `description` text,
  `priority` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `laboratory_id` (`laboratory_id`),
  CONSTRAINT `egroup_ibfk_1` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `egrouprights`
--

DROP TABLE IF EXISTS `egrouprights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `egrouprights` (
  `egroup_id` varchar(36) NOT NULL,
  `laboratory_id` varchar(36) NOT NULL,
  PRIMARY KEY (`laboratory_id`,`egroup_id`),
  KEY `egroup_id` (`egroup_id`),
  KEY `laboratory_id` (`laboratory_id`),
  CONSTRAINT `egrouprights_ibfk_1` FOREIGN KEY (`egroup_id`) REFERENCES `egroup` (`id`),
  CONSTRAINT `egrouprights_ibfk_2` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `experimenttype`
--

DROP TABLE IF EXISTS `experimenttype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `experimenttype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `etype` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `etype` (`etype`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fragmentation`
--

DROP TABLE IF EXISTS `fragmentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fragmentation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fragmentation` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fragmentation` (`fragmentation`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `friendlylabs`
--

DROP TABLE IF EXISTS `friendlylabs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friendlylabs` (
  `laboratory_id` varchar(36) NOT NULL,
  `flaboratory_id` varchar(36) NOT NULL,
  KEY `laboratory_id` (`laboratory_id`),
  KEY `flaboratory_id` (`flaboratory_id`),
  CONSTRAINT `friendlylabs_ibfk_1` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`),
  CONSTRAINT `friendlylabs_ibfk_2` FOREIGN KEY (`flaboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genelist`
--

DROP TABLE IF EXISTS `genelist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genelist` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `leaf` tinyint(1) NOT NULL DEFAULT '0',
  `type` int(11) NOT NULL,
  `conditions` text,
  `gblink` text,
  `db` varchar(64) NOT NULL DEFAULT 'experiments',
  `tableName` varchar(64) DEFAULT NULL,
  `labdata_id` int(11) DEFAULT NULL,
  `rtype_id` int(11) DEFAULT NULL,
  `atype_id` int(11) DEFAULT NULL,
  `project_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rtype_id` (`rtype_id`) USING BTREE,
  KEY `atype_id` (`atype_id`) USING BTREE,
  KEY `project_id` (`project_id`) USING HASH,
  KEY `labdata_id` (`labdata_id`) USING BTREE,
  KEY `genelist_ifbk_5_idx` (`parent_id`) USING HASH,
  CONSTRAINT `genelist_ibfk_1` FOREIGN KEY (`rtype_id`) REFERENCES `rtype` (`id`),
  CONSTRAINT `genelist_ibfk_2` FOREIGN KEY (`atype_id`) REFERENCES `atype` (`id`),
  CONSTRAINT `genelist_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `project2` (`id`),
  CONSTRAINT `genelist_ibfk_4` FOREIGN KEY (`labdata_id`) REFERENCES `labdata` (`id`),
  CONSTRAINT `genelist_ifbk_5` FOREIGN KEY (`parent_id`) REFERENCES `genelist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genome`
--

DROP TABLE IF EXISTS `genome`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genome` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `genome` varchar(150) DEFAULT NULL,
  `db` varchar(100) DEFAULT NULL,
  `findex` varchar(200) DEFAULT NULL,
  `annotation` varchar(200) DEFAULT NULL,
  `annottable` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `genome` (`genome`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info`
--

DROP TABLE IF EXISTS `info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `info` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `labdata`
--

DROP TABLE IF EXISTS `labdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labdata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(36) DEFAULT NULL,
  `deleted` int(1) NOT NULL DEFAULT '0',
  `groupping` varchar(200) DEFAULT NULL,
  `author` varchar(300) DEFAULT NULL,
  `cells` varchar(1000) NOT NULL,
  `conditions` varchar(1000) NOT NULL,
  `spikeinspool` varchar(200) DEFAULT '',
  `spikeins_id` int(11) DEFAULT NULL,
  `tagstotal` int(11) DEFAULT '0',
  `tagsmapped` int(11) DEFAULT '0',
  `tagsribo` int(11) DEFAULT '0',
  `fragmentsize` int(11) DEFAULT NULL COMMENT 'fragment shifting for Chip-seq',
  `fragmentsizeest` int(5) DEFAULT NULL COMMENT 'Estimated fragment size by MACS',
  `fragmentsizeexp` int(5) DEFAULT '150' COMMENT 'Expected fragment size from wet lab',
  `fragmentsizeforceuse` int(1) DEFAULT '0',
  `islandcount` int(7) DEFAULT NULL,
  `notes` text,
  `protocol` text,
  `filename` varchar(40) DEFAULT NULL,
  `dateadd` date NOT NULL,
  `libstatus` int(11) DEFAULT '0',
  `libstatustxt` varchar(2000) DEFAULT 'created',
  `url` varchar(2000) DEFAULT NULL COMMENT 'direct link to a file',
  `name4browser` varchar(300) DEFAULT NULL,
  `browsergrp` varchar(150) DEFAULT '',
  `browsershare` int(1) DEFAULT '1',
  `forcerun` int(1) DEFAULT '0',
  `antibodycode` varchar(100) DEFAULT NULL,
  `genome_id` int(11) DEFAULT '1',
  `crosslink_id` int(11) DEFAULT '1',
  `fragmentation_id` int(11) DEFAULT '1',
  `antibody_id` varchar(36) DEFAULT NULL,
  `experimenttype_id` int(11) DEFAULT '1',
  `worker_id` int(11) DEFAULT NULL,
  `laboratory_id` varchar(36) DEFAULT NULL,
  `egroup_id` varchar(36) DEFAULT NULL,
  `download_id` int(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  KEY `genome_id` (`genome_id`),
  KEY `crosslink_id` (`crosslink_id`),
  KEY `fragmentation_id` (`fragmentation_id`),
  KEY `experimenttype_id` (`experimenttype_id`),
  KEY `spikeins_id` (`spikeins_id`),
  KEY `labdata_ibfk_5_idx` (`antibody_id`),
  KEY `labdata_ifbk_9_idx` (`laboratory_id`) USING HASH,
  KEY `labdata_ifbk_8_idx` (`egroup_id`) USING HASH,
  CONSTRAINT `labdata_ibfk_2` FOREIGN KEY (`genome_id`) REFERENCES `genome` (`id`),
  CONSTRAINT `labdata_ibfk_3` FOREIGN KEY (`crosslink_id`) REFERENCES `crosslink` (`id`),
  CONSTRAINT `labdata_ibfk_4` FOREIGN KEY (`fragmentation_id`) REFERENCES `fragmentation` (`id`),
  CONSTRAINT `labdata_ibfk_5` FOREIGN KEY (`antibody_id`) REFERENCES `antibody` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `labdata_ibfk_6` FOREIGN KEY (`experimenttype_id`) REFERENCES `experimenttype` (`id`),
  CONSTRAINT `labdata_ibfk_7` FOREIGN KEY (`spikeins_id`) REFERENCES `spikeins` (`id`),
  CONSTRAINT `labdata_ifbk_8` FOREIGN KEY (`egroup_id`) REFERENCES `egroup` (`id`),
  CONSTRAINT `labdata_ifbk_9` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=727 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `labdatarights`
--

DROP TABLE IF EXISTS `labdatarights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labdatarights` (
  `labdata_id` varchar(36) DEFAULT NULL,
  `laboratory_id` varchar(36) NOT NULL,
  KEY `labdata_id` (`labdata_id`),
  KEY `laboratory_id` (`laboratory_id`),
  CONSTRAINT `labdatarights_ibfk_1` FOREIGN KEY (`labdata_id`) REFERENCES `labdata` (`uid`),
  CONSTRAINT `labdatarights_ibfk_2` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `laboratory`
--

DROP TABLE IF EXISTS `laboratory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laboratory` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `rlogin` varchar(200) NOT NULL DEFAULT '',
  `rpass` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login_journal`
--

DROP TABLE IF EXISTS `login_journal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_journal` (
  `login` varchar(300) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project2`
--

DROP TABLE IF EXISTS `project2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project2` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `article` text,
  `worker_id` int(11) NOT NULL,
  `dateadd` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `worker_id` (`worker_id`),
  CONSTRAINT `project2_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `worker` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project2_share`
--

DROP TABLE IF EXISTS `project2_share`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project2_share` (
  `project_id` varchar(36) DEFAULT NULL,
  `worker_id` int(11) NOT NULL,
  KEY `project_id` (`project_id`) USING HASH,
  KEY `worker_id` (`worker_id`),
  CONSTRAINT `project2_share_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project2` (`id`),
  CONSTRAINT `project2_share_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `worker` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `result` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text,
  `tableName` varchar(200) NOT NULL,
  `labdata_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labdata_id` (`labdata_id`),
  CONSTRAINT `result_ibfk_5` FOREIGN KEY (`labdata_id`) REFERENCES `labdata` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=601 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rtype`
--

DROP TABLE IF EXISTS `rtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rtype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `key` varchar(200) NOT NULL,
  `value` varchar(2000) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `status` int(2) NOT NULL DEFAULT '0',
  `group` int(2) NOT NULL DEFAULT '0',
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spikeins`
--

DROP TABLE IF EXISTS `spikeins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spikeins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `spikeins` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `spikeins` (`spikeins`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spikeinslist`
--

DROP TABLE IF EXISTS `spikeinslist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `spikeinslist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `spikeins_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `info` varchar(100) DEFAULT '',
  `concentration` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `spikeins_id` (`spikeins_id`,`name`),
  KEY `spikeins_id_2` (`spikeins_id`),
  CONSTRAINT `spikeinslist_ibfk_1` FOREIGN KEY (`spikeins_id`) REFERENCES `spikeins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `worker`
--

DROP TABLE IF EXISTS `worker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `worker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker` varchar(150) DEFAULT NULL,
  `passwd` varchar(150) DEFAULT NULL,
  `fname` varchar(150) DEFAULT NULL,
  `lname` varchar(150) DEFAULT NULL,
  `dnalogin` varchar(150) DEFAULT NULL,
  `dnapass` varchar(150) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `notify` int(11) DEFAULT '0',
  `changepass` int(1) NOT NULL DEFAULT '0',
  `relogin` int(1) NOT NULL DEFAULT '0',
  `admin` int(1) NOT NULL DEFAULT '0',
  `laboratory_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `worker` (`worker`),
  KEY `worker_ifbk_1_idx` (`laboratory_id`) USING HASH,
  CONSTRAINT `worker_ifbk_1` FOREIGN KEY (`laboratory_id`) REFERENCES `laboratory` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `crosslink`
--

LOCK TABLES `crosslink` WRITE;
/*!40000 ALTER TABLE `crosslink` DISABLE KEYS */;
INSERT INTO `crosslink` VALUES (1,' N/A'),(2,'FA, 10min, RT'),(5,'FA, 5min, RT'),(4,'FA, 8min');
/*!40000 ALTER TABLE `crosslink` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `download`
--

LOCK TABLES `download` WRITE;
/*!40000 ALTER TABLE `download` DISABLE KEYS */;
INSERT INTO `download` VALUES (1,'Core facility'),(2,'Direct link'),(3,'Server upload directory');
/*!40000 ALTER TABLE `download` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `fragmentation`
--

LOCK TABLES `fragmentation` WRITE;
/*!40000 ALTER TABLE `fragmentation` DISABLE KEYS */;
INSERT INTO `fragmentation` VALUES (1,' NA'),(2,'Ambion Frag Kit'),(3,'Biorupter, 30 min'),(4,'Covaris, 10min'),(5,'Covaris, 12min'),(6,'Covaris, 15min'),(7,'Covaris, 17min'),(8,'Covaris, 3.2min'),(9,'Covaris, 30min'),(10,'Covaris, 3min'),(11,'Covaris, 5min'),(12,'Mnase'),(13,'NewCovaris, 3min'),(14,'Sonication');
/*!40000 ALTER TABLE `fragmentation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES 
('wardrobe','/wardrobe','Absolute path to the Wardrobe directory. In this directory preliminary results folder, temporary folder, bin folder will be created',0,0),
('bin','/bin','Relative path to the directory for executable files',0,1),
('temp','/tmp','Relative path to the directory for temporary files',0,1),
('upload','/upload','Relative path to the server shared directory for files uploading',0,1),
('experimentsdb','experiments','Experiment results database name',0,3),
('indices','/indices','Relative path to the directory for mapping software indices files',0,1),
('preliminary','/RAW-DATA','Relative path where fastq and all preliminary results are stored also used for apache to download data files.',0,1),
('genomebrowserroot','','Apache path to a local copy of UCSC genome browser to access tracks',0,2),
('wardroberoot','/ems','Apache path to a root of Wardrobe html files',0,2),
('maxthreads','8','Maximum allowed threads for tools',0,5);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `genome`
--

LOCK TABLES `genome` WRITE;
/*!40000 ALTER TABLE `genome` DISABLE KEYS */;
INSERT INTO `genome` VALUES 
(1,'Human','hg19','hg19','hg19_refseq_genes','refGene'),
(2,'Human+spike','hg19','hg19c','hg19_refseq_genes_control','refGene'),
(3,'Mouse','mm10','mm10','mm10_refseq_genes','refGene'),
(4,'Mouse+spike','mm10','mm10c','mm10_refseq_genes_control','refGene'),
(5,'Rat','rn5','rn5','rn5_refseq_genes','refGene'),
(6,'Rat+spike','rn5','rn5c','rn5_refseq_genes_control','refGene');

/*!40000 ALTER TABLE `genome` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `antibody`
--

LOCK TABLES `antibody` WRITE;
/*!40000 ALTER TABLE `antibody` DISABLE KEYS */;
INSERT INTO `antibody` VALUES 
('antibody-0000-0000-0000-000000000001',' N/A',''),
('7012c2ca-b9cc-11e3-b6bf-ac162d784858','NELFB',''),
('71a0f7b6-ad6a-11e3-b6bf-ac162d784858','POL2',''),
('71a0fa2a-ad6a-11e3-b6bf-ac162d784858','H3K9ac',''),
('71a0fbcb-ad6a-11e3-b6bf-ac162d784858','H3K36me3',''),
('71a0fd5b-ad6a-11e3-b6bf-ac162d784858','H3K9me3',''),
('71a0ff4d-ad6a-11e3-b6bf-ac162d784858','H3K27ac',''),
('71a104e0-ad6a-11e3-b6bf-ac162d784858','H3K4me1',''),
('71a10868-ad6a-11e3-b6bf-ac162d784858','H3K27me3',''),
('71a10a01-ad6a-11e3-b6bf-ac162d784858','H3K4me3',''),
('71a10ead-ad6a-11e3-b6bf-ac162d784858','H4K8ac',''),
('71a11036-ad6a-11e3-b6bf-ac162d784858','H3K9me2',''),
('71a1ef7b-ad6a-11e3-b6bf-ac162d784858','H2A.Z',''),
('71a1fda5-ad6a-11e3-b6bf-ac162d784858','H3K4me2',''),
('71a1ff69-ad6a-11e3-b6bf-ac162d784858','H4K16ac','');
/*!40000 ALTER TABLE `antibody` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `laboratory` WRITE;
insert into `laboratory` values('laborato-ry00-0000-0000-000000000001','admin','Admin\'s labaratory. Can do everything.','','');
UNLOCK TABLES;

--
-- Dumping data for table `experimenttype`
--

LOCK TABLES `experimenttype` WRITE;
/*!40000 ALTER TABLE `experimenttype` DISABLE KEYS */;
INSERT INTO `experimenttype` VALUES (1,'DNA-Seq'),(2,'DNA-Seq pair'),(3,'RNA-Seq'),(5,'RNA-Seq dUTP'),(6,'RNA-Seq dUTP pair'),(4,'RNA-Seq pair');
/*!40000 ALTER TABLE `experimenttype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `spikeins`
--

LOCK TABLES `spikeins` WRITE;
/*!40000 ALTER TABLE `spikeins` DISABLE KEYS */;
INSERT INTO `spikeins` VALUES (1,'spike-in mix1');
/*!40000 ALTER TABLE `spikeins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `spikeinslist`
--

LOCK TABLES `spikeinslist` WRITE;
/*!40000 ALTER TABLE `spikeinslist` DISABLE KEYS */;
INSERT INTO `spikeinslist` VALUES (1,1,'ERCC-00002','D',15000),(2,1,'ERCC-00003','D',937.5),(3,1,'ERCC-00004','A',7500),(4,1,'ERCC-00009','B',937.5),(5,1,'ERCC-00012','C',0.114441),(6,1,'ERCC-00013','D',0.915527),(7,1,'ERCC-00014','D',3.66211),(8,1,'ERCC-00016','C',0.228882),(9,1,'ERCC-00017','A',0.114441),(10,1,'ERCC-00019','A',29.2969),(11,1,'ERCC-00022','D',234.375),(12,1,'ERCC-00024','C',0.228882),(13,1,'ERCC-00025','B',58.5938),(14,1,'ERCC-00028','A',3.66211),(15,1,'ERCC-00031','B',1.83105),(16,1,'ERCC-00033','A',1.83105),(17,1,'ERCC-00034','B',7.32422),(18,1,'ERCC-00035','B',117.188),(19,1,'ERCC-00039','C',3.66211),(20,1,'ERCC-00040','C',0.915527),(21,1,'ERCC-00041','D',0.228882),(22,1,'ERCC-00042','B',468.75),(23,1,'ERCC-00043','D',468.75),(24,1,'ERCC-00044','C',117.188),(25,1,'ERCC-00046','D',3750),(26,1,'ERCC-00048','D',0.0143051),(27,1,'ERCC-00051','B',58.5938),(28,1,'ERCC-00053','B',29.2969),(29,1,'ERCC-00054','C',14.6484),(30,1,'ERCC-00057','C',0.0143051),(31,1,'ERCC-00058','C',1.83105),(32,1,'ERCC-00059','D',14.6484),(33,1,'ERCC-00060','B',234.375),(34,1,'ERCC-00061','D',0.0572205),(35,1,'ERCC-00062','A',58.5938),(36,1,'ERCC-00067','B',3.66211),(37,1,'ERCC-00069','D',1.83105),(38,1,'ERCC-00071','C',58.5938),(39,1,'ERCC-00073','B',0.915527),(40,1,'ERCC-00074','C',15000),(41,1,'ERCC-00075','B',0.0143051),(42,1,'ERCC-00076','C',234.375),(43,1,'ERCC-00077','D',3.66211),(44,1,'ERCC-00078','D',29.2969),(45,1,'ERCC-00079','D',58.5938),(46,1,'ERCC-00081','D',0.228882),(47,1,'ERCC-00083','A',0.0286102),(48,1,'ERCC-00084','C',29.2969),(49,1,'ERCC-00085','A',7.32422),(50,1,'ERCC-00086','D',0.114441),(51,1,'ERCC-00092','A',234.375),(52,1,'ERCC-00095','A',117.188),(53,1,'ERCC-00096','B',15000),(54,1,'ERCC-00097','A',0.457764),(55,1,'ERCC-00098','C',0.0572205),(56,1,'ERCC-00099','C',14.6484),(57,1,'ERCC-00104','B',0.228882),(58,1,'ERCC-00108','A',937.5),(59,1,'ERCC-00109','B',0.915527),(60,1,'ERCC-00111','C',468.75),(61,1,'ERCC-00112','D',117.188),(62,1,'ERCC-00113','C',3750),(63,1,'ERCC-00116','A',468.75),(64,1,'ERCC-00117','B',0.0572205),(65,1,'ERCC-00120','C',0.915527),(66,1,'ERCC-00123','A',0.228882),(67,1,'ERCC-00126','B',14.6484),(68,1,'ERCC-00130','A',30000),(69,1,'ERCC-00131','A',117.188),(70,1,'ERCC-00134','A',1.83105),(71,1,'ERCC-00136','A',1875),(72,1,'ERCC-00137','D',0.915527),(73,1,'ERCC-00138','B',0.114441),(74,1,'ERCC-00142','B',0.228882),(75,1,'ERCC-00143','C',3.66211),(76,1,'ERCC-00144','A',29.2969),(77,1,'ERCC-00145','C',937.5),(78,1,'ERCC-00147','A',0.915527),(79,1,'ERCC-00148','B',14.6484),(80,1,'ERCC-00150','B',3.66211),(81,1,'ERCC-00154','A',7.32422),(82,1,'ERCC-00156','A',0.457764),(83,1,'ERCC-00157','C',7.32422),(84,1,'ERCC-00158','B',0.457764),(85,1,'ERCC-00160','D',7.32422),(86,1,'ERCC-00162','C',58.5938),(87,1,'ERCC-00163','D',14.6484),(88,1,'ERCC-00164','C',0.457764),(89,1,'ERCC-00165','D',58.5938),(90,1,'ERCC-00168','D',0.457764),(91,1,'ERCC-00170','A',14.6484),(92,1,'ERCC-00171','B',3750);
/*!40000 ALTER TABLE `spikeinslist` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `worker` WRITE;
/*!40000 ALTER TABLE `worker` DISABLE KEYS */;
/*admin with pass admin */
INSERT INTO `worker` VALUES 
(1,'admin','9026a980d44388745cf28b0a95f2393770dd0345ece6126fa19d34e46756f914341878fd456f8c3e1cca8c62651820f9022f8b66cfdba0b88a6a1ed6f0048439','Wardrobe','Admin','','','',0,0,0,0,'laborato-ry00-0000-0000-000000000001');
/*!40000 ALTER TABLE `worker` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `atype` WRITE;
/*!40000 ALTER TABLE `atype` DISABLE KEYS */;
INSERT INTO `atype` VALUES 
(1,'DESeq 1/2','Use DESeq to identify differentially expressed genes between samples or groups of samples or different conditions. System will automatically choose DESeq or DESeq2.','images/index_view_big.png',2,1),
(2,'PCA','PCA stands for Principle Component Analysis it can help to see similarities between all experimental data.','images/shopping_cart_big.png',5,0),
(3,'DESeq 1/2','Use DESeq to identify differentially expressed genes between samples or groups of samples or different conditions. System will automatically choose DESeq or DESeq2.','images/index_view_big.png',999,0),
(4,'ATP & filter','ATP is Average Tag Density Profile plot which shows modification level (enrichment) for particular gene list.\nYou can combine all gene list created in \"Genes Lists\" or \"DESeq\" analysis and all DNA-Seq experiments in one plot.','images/chart_line_big.png',2,1),
(5,'MANorm','MANorm is a simple and effective method, for quantitative comparison of \nChIP-Seq data sets describing transcription factor binding sites and epigenetic modifications.','images/documents_preferences_b.png',999,1),
(6,'Genes Lists','This function allows you to organize and manage genes lists (grouping, filtering) for future analysis. All lists can be saved in excel like format. If you dont know where to start, start from here.','images/notebook3_big.png',1,1);
/*!40000 ALTER TABLE `atype` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `info` WRITE;
/*!40000 ALTER TABLE `info` DISABLE KEYS */;
INSERT INTO `info` VALUES (1,''),(2,'');
/*!40000 ALTER TABLE `info` ENABLE KEYS */;
UNLOCK TABLES;


-- PATCH p1

ALTER TABLE `ems`.`labdata` 
ADD COLUMN `trim3` INT(5) NULL DEFAULT 0 AFTER `antibodycode`,
ADD COLUMN `trim5` INT(5) NULL DEFAULT 0 AFTER `trim3`;

INSERT INTO `ems`.`rtype` VALUES (1,'RPKM isoforms'),(2,'RPKM genes'),(3,'RPKM common tss'),(4,'ChIP islands');

ALTER TABLE `ems`.`antibody` 
ADD COLUMN `properties` INT(6) UNSIGNED NOT NULL DEFAULT 0 AFTER `description`;

ALTER TABLE `ems`.`labdata` 
DROP FOREIGN KEY `labdata_ibfk_5`,
DROP FOREIGN KEY `labdata_ifbk_9`;

-- ALTER TABLE `ems`.`labdata` 
-- CHANGE COLUMN `antibody_id` `antibody_id` VARCHAR(36) NOT NULL ,
-- CHANGE COLUMN `laboratory_id` `laboratory_id` VARCHAR(36) NOT NULL ,
-- CHANGE COLUMN `download_id` `download_id` INT(3) NOT NULL ;

ALTER TABLE `ems`.`labdata` 
ADD CONSTRAINT `labdata_ibfk_5`
  FOREIGN KEY (`antibody_id`)
  REFERENCES `ems`.`antibody` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `labdata_ifbk_9`
  FOREIGN KEY (`laboratory_id`)
  REFERENCES `ems`.`laboratory` (`id`);


ALTER TABLE `ems`.`labdata` 
ADD COLUMN `tagssuppressed` INT(11) NULL DEFAULT '0' AFTER `tagsmapped`,
ADD COLUMN `datedel` DATE NULL AFTER `dateadd`,
ADD COLUMN `rmdup` INT(1) NULL DEFAULT '0' AFTER `forcerun`;

ALTER TABLE `ems`.`labdata` 
ADD COLUMN `tagsused` INT(11) NULL DEFAULT '0' AFTER `tagssuppressed`;

-- PATCH genome size

ALTER TABLE `ems`.`genome` 
ADD COLUMN `gsize` VARCHAR(20) NULL AFTER `annottable`;

update `ems`.`genome` set gsize="2.35e9" where db like 'hg19';
update `ems`.`genome` set gsize="2.0e9" where db like 'mm10';
update `ems`.`genome` set gsize="2.18e9" where db like 'rn5';
-- update `ems`.`genome` set gsize="1.2e8" where db like 'dm3';
-- update `ems`.`genome` set gsize="1.13e9" where db like 'xenTro3';

ALTER TABLE `ems`.`genome` 
CHANGE COLUMN `gsize` `gsize` VARCHAR(20) NOT NULL DEFAULT '2.0e9' ;

-- PATCH experiment as a control

ALTER TABLE `ems`.`labdata` 
ADD COLUMN `control` INT(1) NULL AFTER `trim5`,
ADD COLUMN `control_id` VARCHAR(36) NULL AFTER `control`;

-- PATCH R preliminary

DROP TABLE IF EXISTS `labdata_r`;
CREATE TABLE `labdata_r` (
  `id` varchar(36) NOT NULL,
  `rscript` text,
  `lastmodified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `labdata_r`(`id`,`rscript`) VALUES ('default0-0000-0000-0000-000000000001','#\n#  If you have any questions do not hesitate to ask email: Andrey Kartashov <porter@porter.st>\n#\n#  You can find full documentation at https://wardrobe.porter.st/projects/wardrobe/wiki/Devel_R_Wardrobe_Library\n#  This script goes into \'Rscript\' command. All the output can be found in \"Default Result(s)\" tab\n#\n#  Variable \'experiment\' is injected into the script and it contains current experiment data\n#  experiment<-wardrobe(current_experiment_id)[[1]]\n#\n#  Quick \'experiment\' - description:\n#	experiment$alias   - experiment\'s short name\n#	experiment$isRNA   - T/F, TRUE if experiment\'s type is RNA-Seq\n#	experiment$db      - UCSC genome browser database name hg19/mm10/rn5/xenTro3/...\n#     ChIP Specific:\n#	    experiment$dataset  - MACS table, column names can be found in Islands tab: refseq_id,gene_id... \n#             				  experiment$dataset$pileup\n#     RNA  Specific:\n#	    experiment$dataseti - RPKM isoform table, column names can be found in \"RPKM list\" tab: refseq_id,gene_id... \n#							  experiment$dataset$TOT_R_0\n#\n\n#  Only administrators can edit this code, please use \'custom\' script\n\ncolvar<-5\nicolor = colorRampPalette(c(\"#7fc97f\",\"#beaed4\",\"#fdc086\",\"#386cb0\",\"#f0027f\"))(colvar)\n\nif(experiment$isRNA) { #If RNA-Seq experiment\n\n	#plot RNA body coverage\n	cov<-wardrobe.RNACoverage(experiment)\n	plot(cov/(experiment$tagsmapped/1000000),type=\"l\",xaxt = \"n\",main=\"Gene body average tag density\",\n		ylab=\"Average Tag Density (per percentile)\", xlab=\"Gene body percentile (5\'->3\')\",lwd=3,col=icolor[floor(runif(1)*colvar)+1])\n    axis(1, at=seq(0,200,40), labels=seq(0,100,20),las=1)\n\n	#plot RPKM histogram\n	rpkm<-experiment$dataseti$RPKM_0\n	hist(rpkm[rpkm>2 & rpkm<500],main=paste(\"RPKM distribution of\",experiment$alias),breaks=1000,xlab=\"rpkm>2 & rpkm<500\",col=icolor[floor(runif(1)*colvar) +1])\n	\n} else { #If DNA-Seq experiment\n\n	# plot Island height rank\n	p<-sort(experiment$dataset$pileup, decreasing=T)\n	plot(p,main=paste(\"Rank plot of \",experiment$alias),xlab=\"Ranked peak number\",ylab=\"Pileup\",type=\"l\",lwd=3,col=icolor[floor(runif(1)*colvar)+1])\n	\n	# plot Island length distribution\n	islands_length<-experiment$dataset$length\n	hist(islands_length,breaks=100,main=paste(\"Islands distribution of \",experiment$alias),xlab=\"Island length\",col=icolor[floor(runif(1)*colvar)+1])\n\n	#Plot log ratio distribution pileup/islands_length\n	#hist(log(experiment$dataset$pileup/islands_length),breaks=200,plot=T,main=\"Histogram of log(pileup/island_length)\",xlab=\"ratio\")\n	\n}\n');

-- PATCH Save Preliminary MACS filters

ALTER TABLE `ems`.`labdata` 
ADD COLUMN `params` VARCHAR(2000) NULL AFTER `download_id`;

-- PATCH R advanced


UPDATE `ems`.`atype` SET `name`='R language processing', `description`='R is a language and environment for statistical computing and graphics.
In Wardrobe you can run preinstalled scripts or run your own. For instance, PCA has been preinstalled.', `imgsrc`='images/rlogo.png' WHERE `id`='1';

UPDATE `ems`.`atype` SET `implemented`=1 WHERE `id`='3';

INSERT INTO `ems`.`settings`(`key`,`value`,`description`,`status`,`group`) 
VALUES ('advanced','/ANL-DATA','Relative path where all files from advanced analysis are stored; also used by apache to download data files.',0,1)
ON DUPLICATE KEY UPDATE `description`=values(`description`);


DROP TABLE IF EXISTS `advanced_r`;
CREATE TABLE `advanced_r` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rscript` text,
  `lastmodified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `advanced_r`
--
INSERT INTO `ems`.`advanced_r` VALUES ('IDR00000-0000-0000-0000-000000000001','IDR','#\n#  If you have any questions do not hesitate to ask email: Andrey Kartashov <porter@porter.st>\n#\n#  You can find full documentation at https://biowardrobe.com/projects/wardrobe/wiki/Devel_R_Wardrobe_Library\n#  This script goes into \'Rscript\' command. All the output can be found in \"Default Result(s)\" tab\n#\n#  Variable \'experiment\' is injected into the script and it contains current experiment data\n#  experiment<-wardrobe(current_experiment_id)[[1]]\n#\n#  Quick \'experiment\' - description:\n#	experiment$alias   - experiment\'s short name\n#	experiment$isRNA   - T/F, TRUE if experiment\'s type is RNA-Seq\n#	experiment$db      - UCSC genome browser database name hg19/mm10/rn5/xenTro3/...\n#     ChIP Specific:\n#	    experiment$dataset  - MACS table, column names can be found in Islands tab: refseq_id,gene_id... \n#             				  experiment$dataset$pileup\n#     RNA  Specific:\n#	    experiment$dataseti - RPKM isoform table, column names can be found in \"RPKM list\" tab: refseq_id,gene_id... \n#							  experiment$dataset$TOT_R_0\n#\n\n#  Only administrators can edit this code\n\nnames<-c()\nfiles<-\"\"\n\nfor(i in 1:length(args)){\n    experiment<-wardrobe(args[i])[[1]]\n    if(experiment$isRNA == 0) {\n      names[i]<-c(experiment$alias)\n      files<-paste(files,gsub(\".bam\",\"_macs_peaks.narrowPeak\",experiment$bamfile))\n    }\n}\n\nsystem(paste(\"idr -s\",files,\"--plot\"))\n\n#colnames(fullData)<-names\n','2015-04-24 21:00:17'),
('PCA00000-0000-0000-0000-000000000001','PCA','#\n#  If you have any questions do not hesitate to ask email: Andrey Kartashov <porter@porter.st>\n#\n#  You can find full documentation at https://biowardrobe.com/projects/wardrobe/wiki/Devel_R_Wardrobe_Library\n#  This script goes into \'Rscript\' command. \n\n#  Only administrators can edit this code\n\nnames<-c()\nfor(i in 1:length(args)){\n    experiment<-wardrobe(args[i])[[1]]\n    if(experiment$isRNA == 1) {\n      names[i]<-c(experiment$alias)\n      if(i==1) {\n   	    fullData<-experiment$dataseti$RPKM_0\n 	    }\n      if(i>1) {\n        fullData<-cbind(fullData,experiment$dataseti$RPKM_0)\n      }\n    }\n}\n\ncolnames(fullData)<-names\n\ncolvar<-length(names)\nicolor = colorRampPalette(c(\"#7fc97f\",\"#beaed4\",\"#fdc086\",\"#386cb0\",\"#f0027f\"))(colvar)\n\nrowIdx<-rowSums(fullData)!=0\nfd2<-fullData[rowIdx,]\n\npca<-prcomp(t(fd2),cor=TRUE,scale.=T)\nresult<-pca$x\n\n\nplot(result[,1],result[,2],col=icolor,xlab=\"PCA1\",ylab=\"PCA2\",main=\"\")\nlegend(\"bottomright\",text.col= icolor, bg=\"white\",legend = names,yjust=0,horiz=F,bty=\'n\',cex=0.8)\n\nplot(result[,2],result[,3],col=icolor,xlab=\"PCA2\",ylab=\"PCA3\",main=\"\")\nlegend(\"bottomright\",text.col= icolor, bg=\"white\",legend = names,yjust=0,horiz=F,bty=\'n\',cex=0.8)\n\nplot(pca,type=\"lines\")\n\nlibrary(scatterplot3d)\ns3d<-scatterplot3d(result[,1],result[,2],result[,3],xlab=\"PC1\",ylab=\"PC2\",zlab=\"PC3\", main=\"\",\n	color=icolor,col.axis=\"blue\",sub=\"\",box=T,lwd=5,type=\"p\")\nlegend(\"bottomright\",inset=c(0.03,0.03),text.col= icolor, bg=\"white\",legend = names,yjust=0,horiz=F,bty=\'n\',cex=0.8)\n','2015-04-07 04:26:21')
ON DUPLICATE KEY UPDATE `rscript`=values(`rscript`);
