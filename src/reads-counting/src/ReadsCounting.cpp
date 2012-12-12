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
#include <Math.hpp>

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
FSTM::FSTM(QObject *parent):
    QObject(parent)
{
    m_ThreadCount=0;
    dUTP=(gArgs().getArgs("rna_seq").toString()=="dUTP");
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

    FillUpData();

    for(int i=0;i<num_bam;i++)
    {
        threads[i]=new sam_reader_thread(bam_names[i],sam_data[i],isoforms[i]);
        connect(threads[i],SIGNAL(finished()),this,SLOT(ThreadCount()));
        connect(threads[i],SIGNAL(terminated()),this,SLOT(ThreadCount()));
    }

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
        sam_data[i]=new gen_lines();
    }

    TSS_organized_list.resize(m_ThreadNum);
    GENES_organized_list.resize(m_ThreadNum);

    /* fill from one sql or file
      * or from sum of segments from sql queries or files*/
    if(gArgs().getArgs("batch").toString().isEmpty() || !gArgs().fileInfo("batch").exists())
    {
        QString sql_str;
        if(gArgs().getArgs("sql_query1").toString().isEmpty())
        {
            sql_str="select name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2 from refGene where chrom not like '%\\_%' order by chrom,strand,txStart,txEnd";
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
            /*exon start positions*/
            QStringList q_starts=q.value(fieldExStarts).toString().split(QChar(','));
            /*exon end positions*/
            QStringList q_ends=q.value(fieldExEnds).toString().split(QChar(','));
            /*exon count*/
            int exCount=q.value(fieldExCount).toInt();
            /*exon name*/
            /*chromosome name*/
            QString chr=q.value(fieldChrom).toString();
            QChar strand=q.value(fieldStrand).toString().at(0);
            /*iso name*/
            QString iso_name=q.value(fieldName).toString();
            /*gene name*/
            QString g_name=q.value(fieldName2).toString();
            quint64 txStart=q.value(fieldTxStart).toInt()+1;
            quint64 txEnd=q.value(fieldTxEnd).toInt();
            quint64 cdsStart=q.value(fieldCdsStart).toInt();
            quint64 cdsEnd=q.value(fieldCdsEnd).toInt();
            /*Variables to store start/end exon positions*/
            bicl::interval_map<t_genome_coordinates,t_reads_count> iso;

            if(gArgs().getArgs("sam_ignorechr").toString().contains(chr))
            {
                continue;
            }

            for(int j=0;j<exCount;j++)
            {
                quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
                iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s+1,e),1));
            }

            for(int i=0;i<m_ThreadNum;i++)
            {

                QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd,iso,iso.size())   );
                isoforms[i][0][chr].append( p );
                QString str;
                if(strand==QChar('+'))
                {
                    str=QString("%1%2%3").arg(chr).arg(strand).arg(txStart);
                }
                else
                {
                    str=QString("%1%2%3").arg(chr).arg(strand).arg(txEnd);
                }

                TSS_organized_list[i][str].append(p);
                GENES_organized_list[i][g_name].append(p);
            }
        }

        /*
            do intersections !!!
         */

        foreach(const QString key, isoforms[0][0].keys()) /*How many chromosomes ?*/
        {
            qDebug()<<"chr:"<<key;
            for(int i=0; i<isoforms[0][0][key].size();i++) /*How many refsec pointers (QVector< IsoformPtr > refsec;), isoforms for current chromosome*/
            {
                for(int j=i+1; j<isoforms[0][0][key].size();j++) /*Compare all isoforms with the others*/
                {
                    if(isoforms[0][0][key][i]->intersects_count.isNull())
                    {
                        if(( !dUTP || isoforms[0][0][key][i]->strand == isoforms[0][0][key][j]->strand) && bicl::intersects(isoforms[0][0][key][i]->isoform,isoforms[0][0][key][j]->isoform))
                        {
                            /*repeat this part for multithread*/
                            for(int t=0;t<m_ThreadNum;t++)
                            {
                                isoforms[t][0][key][i]->intersects=true;
                                isoforms[t][0][key][j]->intersects=true;

                                if(isoforms[t][0][key][j]->intersects_count.isNull())
                                {
                                    bicl::interval_map<t_genome_coordinates,unsigned int> * p = new bicl::interval_map<t_genome_coordinates,unsigned int>();
                                    p[0] += isoforms[t][0][key][i]->isoform ;
                                    p[0] += isoforms[t][0][key][j]->isoform ;

                                    //qDebug()<<"inter i:"<<isoforms[0][0][key][i].data()->name<<" inter j:"<<isoforms[0][0][key][j].data()->name;
                                    isoforms[t][0][key][i]->intersects_count=QSharedPointer<bicl::interval_map<t_genome_coordinates,unsigned int> >(p);
                                    isoforms[t][0][key][j]->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                    QList<IsoformPtr> *p0 = new QList<IsoformPtr>();

                                    p0->append(isoforms[t][0][key][i]);
                                    p0->append(isoforms[t][0][key][j]);

                                    isoforms[t][0][key][i]->intersects_isoforms=QSharedPointer<QList<IsoformPtr> >( p0 );
                                    isoforms[t][0][key][j]->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;
                                }
                                else
                                {
                                    isoforms[t][0][key][j]->intersects_count.data()[0] += isoforms[t][0][key][i]->isoform ;
                                    isoforms[t][0][key][i]->intersects_count=isoforms[t][0][key][j]->intersects_count;

                                    isoforms[t][0][key][j]->intersects_isoforms->append(isoforms[t][0][key][i]);
                                    isoforms[t][0][key][i]->intersects_isoforms=isoforms[t][0][key][j]->intersects_isoforms;
                                }

                            }

                            break;
                        }
                    }
                    else
                    {
                        if(bicl::intersects(isoforms[0][0][key][i]->intersects_count.data()[0],isoforms[0][0][key][j]->isoform))
                        {
                            /*repeat this part for multithread*/
                            for(int t=0;t<m_ThreadNum;t++)
                            {
                                isoforms[t][0][key][j]->intersects=true;
                                if(isoforms[t][0][key][j]->intersects_count.isNull())
                                {
                                    isoforms[t][0][key][i]->intersects_count.data()[0] += isoforms[t][0][key][j]->isoform ;
                                    isoforms[t][0][key][j]->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                    isoforms[t][0][key][i]->intersects_isoforms->append(isoforms[t][0][key][j]);
                                    isoforms[t][0][key][j]->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;
                                }
                                else if(isoforms[t][0][key][j]->intersects_count==isoforms[t][0][key][i]->intersects_count)
                                {
                                    qDebug()<<"Upps, bug happend!";
                                }
                                else
                                {
                                    for(int c=0;c<isoforms[t][0][key][j]->intersects_isoforms->size();c++)
                                    {
                                        isoforms[t][0][key][i]->intersects_count.data()[0] += isoforms[t][0][key][c]->isoform ;
                                        isoforms[t][0][key][c]->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                        isoforms[t][0][key][i]->intersects_isoforms->append(isoforms[t][0][key][c]);
                                        isoforms[t][0][key][c]->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;
                                    }

                                }

                            }
                            //qDebug()<<"inter i:"<<isoforms[0][0][key][i].data()->name<<" inter j:"<<isoforms[0][0][key][j].data()->name;
                            break;
                        }
                    }
                }
            }
        }


#ifdef _DEBUG
        {
            int cc=1;
            QString key=isoforms[cc][0].keys().at(0); /*How many chromosomes ?*/
            for(int i=0; i<isoforms[cc][0][key].size();i++) /*How many refsec pointers (QVector< IsoformPtr > refsec;), isoforms for current chromosome*/
            {
                if(i>500) break;
                if(!isoforms[cc][0][key][i]->intersects_isoforms.isNull())
                {
                    qDebug()<<"---------------------------------------------";
                    for(int j=0;j<isoforms[cc][0][key][i]->intersects_isoforms->size();j++)
                    {
                        qDebug()<<" name:"<<isoforms[cc][0][key][i]->intersects_isoforms->at(j)->name;
                    }
                    if(isoforms[cc][0][key][i]->intersects_count.isNull())
                    {
                        qDebug()<<"FATALITY";
                    }
                    bicl::interval_map<t_genome_coordinates,unsigned int>::iterator it=
                            isoforms[cc][0][key][i]->intersects_count->begin();
                    qDebug()<<"is size:"<<isoforms[cc][0][key][i]->intersects_count->size();
                    QString str;
                    while(it != isoforms[cc][0][key][i]->intersects_count->end())
                    {
                        bicl::interval_map<t_genome_coordinates,unsigned int>::interval_type itv  = bicl::key_value<bicl::interval_map<t_genome_coordinates,unsigned int> >(it);
                        str+=QString("([%1:%2]->%3)").arg(itv.lower()).arg(itv.upper()).arg(it->second);
                        it++;
                    }
                    qDebug()<<"intervals:"<<str;
                }
            }
        }
#endif
    }//if not a batch
    else
    {
        /* This type of reads count is just simple counting within segment and it is does not metter
          * is this segment from + or - strand. If segments intersects then it become single segment that overlaps
          * all intersects one
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

                iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(txStart,txEnd),1));

                /*Duplicate data for each multithreaded bam reader*/
                for(int i=0;i<m_ThreadNum;i++)
                {
                    QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd,iso,iso.size())   );
                    isoforms[i][0][chr].append( p );
                }
                it++;
            }

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
    QFile outFile;
    outFile.setFileName(gArgs().getArgs("out").toString());
    outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    outFile.write(QString("refsec_id,gene_id,chrom,txStart,txEnd,strand,TOT_R_0,RPKM_0").toAscii());


    QString RPKM_FIELDS="";

    for(int i=1;i<m_ThreadNum;i++)
    {
        outFile.write(QString(",TOT_R_%1,RPKM_%2,log2_%3").arg(i).arg(i).arg(i).toAscii());
        RPKM_FIELDS+=QString("RPKM_%1 float,").arg(i);
    }
    outFile.write(QString("\n").toAscii());

    QString CREATE_TABLE=QString("DROP TABLE IF EXISTS %1;"
                                 "CREATE TABLE %2 ( "
                                 "`refsec_id` VARCHAR(100) NOT NULL ,"
                                 "`gene_id` VARCHAR(100) NOT NULL ,"
                                 "`chrom` VARCHAR(45) NOT NULL,"
                                 "`txStart` INT NULL ,"
                                 "`txEnd` INT NULL ,"
                                 "`strand` char(1),"
                                 "RPKM_0   float,"
                                 "%3 "
                                 "INDEX refsec_id_idx (refsec_id) using btree,"
                                 "INDEX gene_id_idx (gene_id) using btree,"
                                 "INDEX chr_idx (chrom) using btree,"
                                 "INDEX txStart_idx (txStart) using btree,"
                                 "INDEX txEnd_idx (txEnd) using btree"
                                 ")"
                                 "ENGINE = MyISAM "
                                 "COMMENT = 'created by readscounting';").
            arg(gArgs().getArgs("sql_table").toString()).
            arg(gArgs().getArgs("sql_table").toString()).
            arg(RPKM_FIELDS);

    if(!gArgs().getArgs("no-sql-upload").toBool() && !q.exec(CREATE_TABLE))
    {
        qDebug()<<"Query error: "<<q.lastError().text();
    }

    QString SQL_QUERY_BASE=QString("insert into %1 values ").
            arg(gArgs().getArgs("sql_table").toString());


    foreach(const QString &chr,isoforms[0][0].keys())
    {

        QString SQL_QUERY="";
        for(int c=0; c<isoforms[0][0][chr].size(); c++)
        {
            /* if in input controls list say 1,3,7 next loop will have i==list
              * then this variable became equal to current value */
            double control=0.0;

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
                        double log2_val=0.0;
                        if(current.data()->RPKM==0.0)
                        {
                            log2_val=0.5/control;
                        }
                        else
                        {
                            log2_val=current.data()->RPKM/control;
                        }
                        QString tmp=QString(",%1,%2,%3").arg(current.data()->totReads).arg(current.data()->RPKM).arg(Math::mlog<double>(log2_val));
                        outFile.write(tmp.toAscii());
                        tmp=QString(",%1").arg(current.data()->RPKM);//.arg(Math::mlog<double>(log2_val));
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

    RPKM_FIELDS="";
    for(int i=1;i<m_ThreadNum;i++)
    {
        RPKM_FIELDS+=QString("coalesce(sum(RPKM_%1),0) AS RPKM_%2,").arg(i).arg(i);
    }


    if(!gArgs().getArgs("no-sql-upload").toBool())
    {

    QString DROP_TBL= QString("DROP VIEW IF EXISTS %1_common_tss;").arg(gArgs().getArgs("sql_table").toString());
    CREATE_TABLE=QString(
                "CREATE VIEW %1_common_tss AS "
                "select "
                "group_concat(refsec_id  separator ',') AS refsec_id,"
                "group_concat(gene_id    separator ',') AS gene_id,"
                "chrom AS chrom,"
                "txStart AS txStart,"
                "txEnd AS txEnd,"
                "strand AS strand,"
                "coalesce(sum(RPKM_0),0) AS RPKM_0,"
                "%2 "
                "from %3 "
                "where strand = '%4' "
                "group by chrom,%5,strand ");

            QString CT1=CREATE_TABLE.
            arg(gArgs().getArgs("sql_table").toString()).
            arg(RPKM_FIELDS).
            arg(gArgs().getArgs("sql_table").toString()).
            arg("+").arg("txStart");
            QString CT2=CREATE_TABLE.
            arg(gArgs().getArgs("sql_table").toString()).
            arg(RPKM_FIELDS).
            arg(gArgs().getArgs("sql_table").toString()).
            arg("-").arg("txEnd");
            if(!q.exec(DROP_TBL+CT1+" union "+CT2+";"))
            {
                qDebug()<<"Query error: "<<q.lastError().text();
            }
    }




    /*
     *   Reporting isoforms with common TSS
     */
    outFile.setFileName(gArgs().fileInfo("out").baseName()+"_common_tss.csv");
    outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    outFile.write(QString("\"=\"\"refsec_id\"\"\",\"=\"\"gene_id\"\"\",\"chrom\",txStart,txEnd,strand,TOT_R_0,RPKM_0").toAscii());

    for(int i=1;i<m_ThreadNum;i++)
    {
        outFile.write(QString(",TOT_R_%1,RPKM_%2").arg(i).arg(i).toAscii());
    }
    outFile.write(QString("\n").toAscii());

    foreach(QString key,TSS_organized_list[0].keys())
    {
        for(int i=0;i<m_ThreadNum;i++)
        {
            QString name,name2;
            double RPKM=0.0;
            quint64 totReads=0;

            QSharedPointer<Isoform> current;
            for(int j=0;j<TSS_organized_list[i][key].size();j++)
            {
                current = TSS_organized_list[i][key].at(j);
                name+=current.data()->name+",";
                if(!name2.contains(current.data()->name2))
                    name2+=current.data()->name2+",";
                RPKM+=current.data()->RPKM;
                totReads+=current.data()->totReads;
            }
            name.chop(1);
            name2.chop(1);

            if(i==0)
            {
                outFile.write((QString("\"=\"\"%1\"\"\",\"=\"\"%2\"\"\",\"%3\",%4,%5,%6,%7,%8").
                               arg(name).
                               arg(name2).
                               arg(current.data()->chrom).
                               arg(current.data()->txStart).
                               arg(current.data()->txEnd).
                               arg(current.data()->strand).
                               arg(totReads).
                               arg(RPKM)).toAscii());
            }
            else
            {
                QString tmp=QString(",%1,%2").arg(totReads).arg(RPKM);
                outFile.write(tmp.toAscii());
            }
        }
        outFile.write(QString("\n").toAscii());
    }

    outFile.close();









    /*
     *   Reporting GENES Expression
     */
    outFile.setFileName(gArgs().fileInfo("out").baseName()+"_GENES.csv");
    outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    outFile.write(QString("\"=\"\"refsec_id\"\"\",\"=\"\"gene_id\"\"\",\"chrom\",txStart,txEnd,strand,TOT_R_0,RPKM_0").toAscii());

    for(int i=1;i<m_ThreadNum;i++)
    {
        outFile.write(QString(",TOT_R_%1,RPKM_%2").arg(i).arg(i).toAscii());
    }
    outFile.write(QString("\n").toAscii());

    foreach(QString key,GENES_organized_list[0].keys())
    {
        for(int i=0;i<m_ThreadNum;i++)
        {
            QString name,name2;
            double RPKM=0.0;
            quint64 totReads=0;

            QSharedPointer<Isoform> current;
            for(int j=0;j<GENES_organized_list[i][key].size();j++)
            {
                current = GENES_organized_list[i][key].at(j);
                name+=current.data()->name+",";
                if(!name2.contains(current.data()->name2))
                    name2+=current.data()->name2+",";
                RPKM+=current.data()->RPKM;
                totReads+=current.data()->totReads;
            }
            name.chop(1);
            name2.chop(1);

            if(i==0)
            {
                outFile.write((QString("\"=\"\"%1\"\"\",\"=\"\"%2\"\"\",\"%3\",%4,%5,%6,%7,%8").
                               arg(name).
                               arg(name2).
                               arg(current.data()->chrom).
                               arg(current.data()->txStart).
                               arg(current.data()->txEnd).
                               arg(current.data()->strand).
                               arg(totReads).
                               arg(RPKM)).toAscii());
            }
            else
            {
                QString tmp=QString(",%1,%2").arg(totReads).arg(RPKM);
                outFile.write(tmp.toAscii());
            }
        }
        outFile.write(QString("\n").toAscii());
    }

    outFile.close();

    /*
     *
     */

    qDebug()<<"Complete";
    emit finished();
}
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
