#! /usr/bin/env python
# Script goes trough all RNA-Seq experiments
# drops VIEWS _genes, _commont_tss
# creates tables _genes, _common_tss from select
# indexes

import os
import sys
import Settings
import DefFunctions as d
import re
import random
import MySQLdb
import glob
import subprocess as s  # import call
import time
import string

from warnings import filterwarnings

filterwarnings('ignore', category=MySQLdb.Warning)

settings = Settings.Settings()

EDB = settings.settings['experimentsdb']


def replace_genes():
    try:
        settings.cursor.execute("DROP VIEW IF EXISTS " + table_name_genes)
        settings.cursor.execute("DROP TABLE IF EXISTS " + table_name_genes)
        SQL = """ CREATE TABLE IF NOT EXISTS {0} (
          refseq_id VARCHAR(100) NOT NULL,
          gene_id VARCHAR(100) NOT NULL,
          chrom VARCHAR(45) NOT NULL,
          txStart INT NOT NULL,
          txEnd INT NOT NULL,
          strand CHAR(1),
          TOT_R_0 FLOAT,
          RPKM_0 FLOAT,
          INDEX refseq_id_idx (refseq_id) USING BTREE,
          INDEX gene_id_idx (gene_id) USING BTREE,
          INDEX chr_idx (chrom) USING BTREE,
          INDEX txStart_idx (txStart) USING BTREE,
          INDEX txEnd_idx (txEnd) USING BTREE,
          INDEX strand_idx (strand) USING BTREE
          )  ENGINE=MyISAM COMMENT='created by patch script' DEFAULT CHARSET=utf8;
          """.format(table_name_genes)

        settings.cursor.execute(SQL)
        SQL = """
          INSERT INTO {0}
          SELECT
            GROUP_CONCAT(DISTINCT refseq_id
                ORDER BY refseq_id
                SEPARATOR ',') AS refseq_id,
            gene_id,
            MAX(chrom) AS chrom,
            MAX(txStart) AS txStart,
            MAX(txEnd) AS txEnd,
            MAX(strand) AS strand,
            COALESCE(SUM(TOT_R_0), 0) AS TOT_R_0,
            COALESCE(SUM(RPKM_0), 0) AS RPKM_0
          FROM {1}
          GROUP BY gene_id
        """.format(table_name_genes, table_name_isoforms)
        settings.cursor.execute(SQL)

    except Exception, e:
        print "Error with: " + table_name
        print e
        pass

def replace_common_tss():
    try:
        settings.cursor.execute("DROP VIEW IF EXISTS " + table_name_common_tss)
        settings.cursor.execute("DROP TABLE IF EXISTS " + table_name_common_tss)
        SQL = """ CREATE TABLE IF NOT EXISTS {0} (
          refseq_id VARCHAR(100) NOT NULL,
          gene_id VARCHAR(100) NOT NULL,
          chrom VARCHAR(45) NOT NULL,
          txStart INT NOT NULL,
          txEnd INT NOT NULL,
          strand CHAR(1),
          TOT_R_0 FLOAT,
          RPKM_0 FLOAT,
          INDEX refseq_id_idx (refseq_id) USING BTREE,
          INDEX gene_id_idx (gene_id) USING BTREE,
          INDEX chr_idx (chrom) USING BTREE,
          INDEX txStart_idx (txStart) USING BTREE,
          INDEX txEnd_idx (txEnd) USING BTREE,
          INDEX strand_idx (strand) USING BTREE
          )  ENGINE=MyISAM COMMENT='created by patch script' DEFAULT CHARSET=utf8;
          """.format(table_name_common_tss)

        settings.cursor.execute(SQL)
        SQL = """
          INSERT INTO {0}
          SELECT
              GROUP_CONCAT(DISTINCT refseq_id
                  ORDER BY refseq_id
                  SEPARATOR ',') AS refseq_id,
              GROUP_CONCAT(DISTINCT gene_id
                  ORDER BY gene_id
                  SEPARATOR ',') AS gene_id,
              chrom AS chrom,
              txStart AS txStart,
              MAX(txEnd) AS txEnd,
              strand AS strand,
              COALESCE(SUM(TOT_R_0), 0) AS TOT_R_0,
              COALESCE(SUM(RPKM_0), 0) AS RPKM_0
          FROM {1}
          WHERE
              strand = '+'
          GROUP BY chrom , txStart , strand
          UNION SELECT
              GROUP_CONCAT(DISTINCT refseq_id
                  ORDER BY refseq_id
                  SEPARATOR ',') AS refseq_id,
              GROUP_CONCAT(DISTINCT gene_id
                  ORDER BY gene_id
                  SEPARATOR ',') AS gene_id,
              chrom AS chrom,
              MIN(txStart) AS txStart,
              txEnd AS txEnd,
              strand AS strand,
              COALESCE(SUM(TOT_R_0), 0) AS TOT_R_0,
              COALESCE(SUM(RPKM_0), 0) AS RPKM_0
          FROM {1}
          WHERE
              strand = '-'
          GROUP BY chrom , txEnd , strand """.format(table_name_common_tss, table_name_isoforms)
        settings.cursor.execute(SQL)

    except Exception, e:
        print "Error with: " + table_name
        print e
        pass


# one way to select all _isoforms views is:
# settings.cursor.execute("SHOW FULL TABLES FROM "+EDB+" WHERE Tables_in_"+EDB+" like '%-%-%-%-%_genes' and TABLE_TYPE LIKE 'VIEW';")
# the other way is go trough RNA-Seq experiment

settings.cursor.execute(""" select l.id,uid,filename,filenameold,e.etype from ems.labdata l left join ems.experimenttype e on l.experimenttype_id=e.id
where etype like 'RNA%' and deleted = 0 and libstatus between 12 and 100 """);

for row in settings.cursor.fetchall():
    table_name = row[1]
    table_name_isoforms = "{0}.`{1}_isoforms`".format(EDB, table_name)
    table_name_genes = "{0}.`{1}_genes`".format(EDB, table_name)
    table_name_common_tss = "{0}.`{1}_common_tss`".format(EDB, table_name)

    try:
        settings.cursor.execute("SHOW CREATE VIEW " + table_name_genes)
        replace_genes()
    except Exception, e:
        print "_genes is not a view: " + table_name_genes
        pass

    try:
        settings.cursor.execute("SHOW CREATE VIEW " + table_name_common_tss)
        replace_common_tss()
    except Exception, e:
        print "_common_tss is not a view: " + table_name_common_tss
        pass

settings.conn.commit()

