use ems;
--
-- Table structure for table `egrouprights`
--

DROP TABLE IF EXISTS `labdata_r`;
CREATE TABLE `labdata_r` (
  `id` varchar(36) NOT NULL,
  `record_id` varchar(36) NULL,
  `rscript` text,
  PRIMARY KEY (`id`),
  KEY `labdata_r_ifbk_1_idx` (`record_id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `labdata_r` VALUES 
('default0-0000-0000-0000-000000000001',NULL,'');
