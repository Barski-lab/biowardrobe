-- MySQL dump 10.13  Distrib 5.6.19, for osx10.9 (x86_64)
--
-- Host: localhost    Database: ems
-- ------------------------------------------------------
-- Server version	5.6.19-log

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
  `filenameold` varchar(2000) DEFAULT '',
  `dateadd` date NOT NULL,
  `libstatus` int(11) DEFAULT '0',
  `libstatustxt` varchar(2000) DEFAULT 'created',
  `url` varchar(2000) DEFAULT NULL COMMENT 'direct link for a file',
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

LOCK TABLES `worker` WRITE;
/*!40000 ALTER TABLE `worker` DISABLE KEYS */;
/*admin with pass admin */
INSERT INTO `worker` VALUES 
(1,'admin','9026a980d44388745cf28b0a95f2393770dd0345ece6126fa19d34e46756f914341878fd456f8c3e1cca8c62651820f9022f8b66cfdba0b88a6a1ed6f0048439','Wardrobe','Admin','','','',0,0,0,0,'laborato-ry00-0000-0000-000000000001');
/*!40000 ALTER TABLE `worker` ENABLE KEYS */;
UNLOCK TABLES;
