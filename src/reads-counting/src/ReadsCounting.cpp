/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the ReadsCounting module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/
#include <ReadsCounting.hpp>
#include <Threads.hpp>

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
FSTM::FSTM(QObject *parent):
 QObject(parent)
 {
     m_ThreadCount=0;
 }

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
FSTM::~FSTM()
 {
 }

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
void FSTM::start()
 {
     QStringList bam_names=gArgs().split("in",',');
     int num_bam=bam_names.size();
     m_ThreadNum=num_bam;
     isoforms=new IsoformsOnChromosome* [num_bam];
     sam_data=new gen_lines* [num_bam];
     threads =new sam_reader_thread* [num_bam];

     //int* dublicates=new int [num_bam];

     FillUpData();

     for(int i=0;i<num_bam;i++)
     {
         threads[i]=new sam_reader_thread(bam_names[i],sam_data[i],isoforms[i]);
         connect(threads[i],SIGNAL(finished()),this,SLOT(ThreadCount()));
         connect(threads[i],SIGNAL(terminated()),this,SLOT(ThreadCount()));
     }

     //for(int i=0; i<num_bam; i++)
     //{
     //    qDebug()<<bam_names.at(i)<<" ("<<i<<")";
     //    qDebug()<<"Total chromosomes:"<<isoforms[i][0].size();
     //    foreach(const QString key,isoforms[i][0].keys())
     //    {
     //        qDebug()<<"Total isos in chr("<<key<<") size:"<<isoforms[i][0][key].size();
     //    }
     //}

     StartingThreads();
     WriteResult();
 }//end func
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
 void FSTM::FillUpData()
 {
     for(int i=0;i<m_ThreadNum;i++)
     {
         isoforms[i]=new IsoformsOnChromosome ();
         //if(tot_isoforms!=-1)
         //    isoforms[i]->reserve(tot_isoforms);
         sam_data[i]=new gen_lines();
         //dublicates[i]=0;
     }
     /* fill from one sql or file
      * or from sum of segments from sql queries or files*/
     if(gArgs().getArgs("batch").toString().isEmpty() || !gArgs().fileInfo("batch").exists())
     {
         QString sql_str;
         if(gArgs().getArgs("sql_query1").toString().isEmpty())
         {
             sql_str="select name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2 from refGene where chrom not like '%\\_%'";
             //sql_str="select CONCAT_WS(',',CONCAT('\\\"',refsec,'\\\"'),CONCAT('\\\"',gene,'\\\"'),CONCAT('\\\"',CONVERT(txStart,CHAR),'\\\"')) as name,gene as name2,chrom,strand,txStart,txStart as txEnd from expirements.RNASEQ_CD4_CUFFLINKS";
         }
         else
         {
             sql_str=gArgs().getArgs("sql_query1").toString();
         }
         if(!q.exec(sql_str))
         {
             qDebug()<<"Query error: "<<q.lastError().text();
             emit finished();
         }
         //int tot_isoforms=q.size()+1;

         int fieldExCount = q.record().indexOf("exonCount");
         int fieldExStarts = q.record().indexOf("exonStarts");
         int fieldExEnds = q.record().indexOf("exonEnds");
         int fieldName = q.record().indexOf("name");
         int fieldName2 = q.record().indexOf("name2");
         int fieldChrom = q.record().indexOf("chrom");
         int fieldStrand = q.record().indexOf("strand");
         int fieldTxStart= q.record().indexOf("txStart");
         int fieldTxEnd= q.record().indexOf("txEnd");
         int fieldCdsStart= q.record().indexOf("cdsStart");
         int fieldCdsEnd= q.record().indexOf("cdsEnd");

         while(q.next())
         {
             //-------------------------------------------
             // If counting exons
             //-------------------------------------------
             /*
              Preparing data arrays for multi threading calculation
              each data set for each thread
             */
             for(int i=0;i<m_ThreadNum;i++)
             {
                 /*exon start positions*/
                 QStringList q_starts=q.value(fieldExStarts).toString().split(QChar(','));
                 /*exon end positions*/
                 QStringList q_ends=q.value(fieldExEnds).toString().split(QChar(','));
                 /*exon count*/
                 int exCount=q.value(fieldExCount).toInt();
                 /*exon name*/
                 /*chromosome name*/
                 QString chr=q.value(fieldChrom).toString();
                 /*iso name*/
                 QString iso_name=q.value(fieldName).toString();
                 /*gene name*/
                 QString g_name=q.value(fieldName2).toString();
                 quint64 txStart=q.value(fieldTxStart).toInt();
                 quint64 txEnd=q.value(fieldTxEnd).toInt();
                 quint64 cdsStart=q.value(fieldCdsStart).toInt();
                 quint64 cdsEnd=q.value(fieldCdsEnd).toInt();
                 /*Variables to store start/end exon positions*/
                 bicl::interval_map<t_genome_coordinates,t_reads_count> iso;

                 QChar strand=q.value(fieldStrand).toString().at(0);
                 quint64 len=0;
                 for(int j=0;j<exCount;j++)
                 {
                     quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
                     len+=(e-s);
                     iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s,e),1));
                 }

                 QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd,iso,len)   );
                 isoforms[i][0][chr].append( p );
             }
         }

         /*
            do intersections !!!
         */
         /*
     foreach(const QString key, isoforms[0][0].keys())
     {
         for(int i=0; i<isoforms[0][0][key].size();i++)
         {
             for(int i=0; i<isoforms[0][0][key].size();i++)
             {

             }
         }
     }
    */
     }//if not a batch
     else
     {
         /* This type of reads count is just simple counting within segment and it is does not metter
          * is this segment from + or - strand. If segments intersects then it become single segment that overlaps
          * all intersets one
          */

         /* Working on batch file filling QL and PFL
          * if line starts from "select" than it is query
          * if other then it is bed file
          */
         QFile batchFile;
         batchFile.setFileName(gArgs().getArgs("batch").toString());
         batchFile.open(QIODevice::ReadOnly| QIODevice::Text);
         QStringList QL,PFL;
         QTextStream in(&batchFile);
         while (!in.atEnd())
         {
             QString Q = in.readLine();
             if(Q.isEmpty() || Q.at(0)==QChar('#')) continue;
             if(Q.startsWith("select"))
             {
                 QL<<Q;
             }
             else
             {
                 PFL<<Q;
             }
         }
         batchFile.close();
         QMap<QString,bicl::interval_set<t_genome_coordinates> >segments_lists;
         if(QL.size()>0)
         {
             for(int i=0;i<QL.size();i++)
             {
                 if(!q.exec(QL.at(i)))
                 {
                     qDebug()<<"Query error batch: "<<q.lastError().text();
                     emit finished();
                 }
                 int fieldChrom = q.record().indexOf("chrom");
                 int fieldTxStart = q.record().indexOf("chromStart");
                 int fieldTxEnd= q.record().indexOf("chromEnd");
                 while(q.next())
                 {
                     /*chromosome name*/
                     QString chr=q.value(fieldChrom).toString();
                     quint64 txStart=q.value(fieldTxStart).toInt();
                     quint64 txEnd=q.value(fieldTxEnd).toInt();
                     segments_lists[chr]+=bicl::discrete_interval<t_genome_coordinates>::closed(txStart,txEnd);
                 }
             }
         }
         if(PFL.size()>0)
         {
             for(int i=0;i<PFL.size();i++)
             {

             }
         }
         /* Going through all the chromosomes and copying all segments into uniform struct Isoforms
          */
         foreach(const QString key, segments_lists.keys())
         {
             bicl::interval_set<t_genome_coordinates>::const_iterator it = (segments_lists[key]).begin();
             while(it != (segments_lists[key]).end())
             {
                 /*Duplicate data for each multithreaded bam reader*/
                 for(int i=0;i<m_ThreadNum;i++)
                 {
                     /*chromosome name*/
                     QString chr=key;
                     quint64 txStart=(*it).lower();
                     quint64 txEnd=(*it).upper();
                     quint64 cdsStart=txStart;
                     quint64 cdsEnd=txEnd;
                     /*iso name*/
                     QString iso_name=QString("%1:%2-%3").arg(chr).arg(txStart).arg(txEnd);
                     /*gene name*/
                     QString g_name=iso_name;
                     /*Variables to store start/end exon positions*/
                     bicl::interval_map<t_genome_coordinates,t_reads_count> iso;

                     QChar strand='+';
                     quint64 len=0;
                     len+=(txEnd-txStart);
                     iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(txStart,txEnd),1));

                     QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd,iso,len)   );
                     isoforms[i][0][chr].append( p );
                 }
                 it++;
             }

             //             {
             //                 quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
             //                 len+=(e-s);
             //                 iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s,e),1));
             //             }

             //             QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd,iso,len)   );
             //             isoforms[i][0][chr].append( p );

         }
     }
 }

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
 void FSTM::StartingThreads()
 {
     int max_thr=gArgs().getArgs("threads").toInt();
     if(QThread::idealThreadCount()!=-1)
     {
         max_thr=QThread::idealThreadCount()-1;
         qDebug()<<"idealThreadCount:"<<max_thr;
     }

     for(int i=0; i<m_ThreadNum;i++)
     {
         while(m_ThreadCount>=max_thr)
         {
             QCoreApplication::processEvents();
             sleep(10);
         }

         m_ThreadCount++;
         threads[i]->start();
     }

     while(m_ThreadCount!=0)
     {
         QCoreApplication::processEvents();
         sleep(10);
     }
 }
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

 void FSTM::ThreadCount()
 {
     m_ThreadCount--;
     qDebug()<<"Thread count:"<<m_ThreadCount;
 }
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

 void FSTM::WriteResult()
 {

     qDebug()<<" Writing a result";
     QFile outFile,sqlFile;
     outFile.setFileName(gArgs().getArgs("out").toString());
     outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
     outFile.write(QString("refsec_id,gene_id,chrom,txStart,txEnd,strand,TOT_R_C,RPKM_control").toAscii());

//     sqlFile.setFileName(gArgs().fileInfo("out").baseName().toString()+".sql");
//     sqlFile.open(QIODevice::WriteOnly|QIODevice::Truncate);


     QString RPKM_FIELDS="";

     for(int i=1;i<m_ThreadNum;i++)
     {
         outFile.write(QString(",TOT_R_%1,RPKM_%2,log2_%3").arg(i).arg(i).arg(i).toAscii());
         RPKM_FIELDS+=QString("RPKM_%1 float,log2_%2 float,").arg(i).arg(i);
     }
     outFile.write(QString("\n").toAscii());

     QString CREATE_TABLE=QString("DROP TABLE IF EXISTS `expirements`.`%1`; \
             CREATE TABLE `expirements`.`%2` ( \
             `refsec_id` VARCHAR(100) NOT NULL , \
             `gene_id` VARCHAR(100) NOT NULL , \
             `chrom` VARCHAR(45) NOT NULL, \
             `txStart` INT NULL , \
             `txEnd` INT NULL , \
             `strand` char(1), \
             RPKM_c   float, \
             %3 \
             INDEX refsec_id_idx (refsec_id) using btree, \
             INDEX gene_id_idx (gene_id) using btree, \
             INDEX chr_idx (chrom) using btree, \
             INDEX txStart_idx (txStart) using btree, \
             INDEX txEnd_idx (txEnd) using btree \
             ) \
             ENGINE = MyISAM \
             COMMENT = 'created by readscounting';").
             arg(gArgs().fileInfo("out").baseName()).
             arg(gArgs().fileInfo("out").baseName()).
             arg(RPKM_FIELDS);

     if(!gArgs().getArgs("no-sql-upload").toBool() && !q.exec(CREATE_TABLE))
     {
         qDebug()<<"Query error: "<<q.lastError().text();
     }

     QString SQL_QUERY_BASE=QString("insert into `expirements`.`%1` values ").
             arg(gArgs().fileInfo("out").baseName());


     foreach(const QString &chr,isoforms[0][0].keys())
     {
         QString SQL_QUERY="";
         for(int c=0; c<isoforms[0][0][chr].size(); c++)
         {
             /* if in input controls list say 1,3,7 next loop will have i==list
              * then this variable became equal to current value */
             float control=0.0;

             for(int i=0;i<m_ThreadNum;i++)
             {
                 QSharedPointer<Isoform> current = isoforms[i][0][chr][c];
                 //         if(current.totReads!=0)
                 {
                     if(i==0)
                     {
                         control=current.data()->RPKM;
                         if(control<0.5) control=0.5;
                         outFile.write((QString("\"%1\",\"%2\",%3,%4,%5,%6,%7,%8").
                                        arg(current.data()->name).
                                        arg(current.data()->name2).
                                        arg(current.data()->chrom).
                                        arg(current.data()->txStart).
                                        arg(current.data()->txEnd).
                                        arg(current.data()->strand).
                                        arg(current.data()->totReads).
                                        arg(current.data()->RPKM)).toAscii());
                         SQL_QUERY+=QString(" ('%1','%2','%3',%4,%5,'%6',%7").
                                 arg(current.data()->name).
                                 arg(current.data()->name2).
                                 arg(current.data()->chrom).
                                 arg(current.data()->txStart).
                                 arg(current.data()->txEnd).
                                 arg(current.data()->strand).
                                 arg(current.data()->RPKM);
                     }
                     else
                     {
                         float log2_val=0.0;
                         if(current.data()->RPKM==0.0)
                         {
                             log2_val=0.5/control;
                         }
                         else
                         {
                             log2_val=current.data()->RPKM/control;
                         }
                         QString tmp=QString(",%1,%2,%3").arg(current.data()->totReads).arg(current.data()->RPKM).arg(log2f(log2_val));
                         outFile.write(tmp.toAscii());
                         tmp=QString(",%1,%2").arg(current.data()->RPKM).arg(log2f(log2_val));
                         SQL_QUERY+=tmp;
                     }
                 }
             }
             outFile.write(QString("\n").toAscii());
             SQL_QUERY+="),";
         }
         SQL_QUERY.chop(1);
         if(!gArgs().getArgs("no-sql-upload").toBool() && !q.exec(SQL_QUERY_BASE+SQL_QUERY+";"))
         {
             qDebug()<<"Query error: "<<q.lastError().text();
         }
     }
     outFile.close();
     qDebug()<<"Complete";
     emit finished();
 }
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
