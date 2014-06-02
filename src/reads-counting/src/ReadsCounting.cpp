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
    totIsoLen=0.0;

    isoforms=new IsoformsOnChromosome* [num_bam];
    sam_data=new gen_lines* [num_bam];

    FillUpData();

    int max_thr=gArgs().getArgs("threads").toInt();
    QThreadPool *t_pool=QThreadPool::globalInstance();
    if(max_thr>0 && max_thr < t_pool->maxThreadCount())
        t_pool->setMaxThreadCount(max_thr);

    for(int i=0;i<m_ThreadNum;i++) {
        t_pool->start(new sam_reader_thread(bam_names[i],sam_data[i],isoforms[i],totIsoLen));
    }

    if(t_pool->activeThreadCount()!=0) {
        qDebug()<<"waiting threads";
        t_pool->waitForDone();
    }

    WriteResult();

    qDebug()<<"Complete";
    emit finished();
    return;
}//end func

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
void FSTM::FillUpData()
{
    for(int i=0;i<m_ThreadNum;i++) {
        isoforms[i]=new IsoformsOnChromosome ();
        sam_data[i]=new gen_lines();
    }

    TSS_organized_list.resize(m_ThreadNum);
    GENES_organized_list.resize(m_ThreadNum);

    if(gArgs().getArgs("sql_query1").toString().isEmpty()) {
        qDebug()<<"Query string cannot be empty.";
        emit finished();
        return;
    }

    if(!q.exec(gArgs().getArgs("sql_query1").toString())) {
        qDebug()<<"Query error: "<<q.lastError().text();
        emit finished();
        return;
    }

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

    while(q.next()) {
        /*
         *      Preparing data arrays for multi threading calculation
         *      each data set for each thread
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


        if(gArgs().getArgs("sam_ignorechr").toString().contains(chr)) {
            continue;
        }


        for(int i=0;i<m_ThreadNum;i++) {
            IsoformPtr p(   new Isoform(iso_name,g_name,chr,strand,txStart,txEnd,cdsStart,cdsEnd)   );

            chrom_coverage iso;
            QList<IsoformPtr> iptr; iptr.append(p);

            for(int j=0;j<exCount;j++) {
                quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
                iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s+1,e),iptr));
            }
            p->exCount=iso.iterative_size();
            p->isoform=iso;
            p->len=iso.size();

            if(i==0) totIsoLen+=iso.size();

            isoforms[i][0][chr].append( p );
            QString str;
            if(strand==QChar('+')) {
                str=QString("%1%2%3").arg(chr).arg(strand).arg(txStart);
            } else {
                str=QString("%1%2%3").arg(chr).arg(strand).arg(txEnd);
            }
            TSS_organized_list[i][str].append(p);
            GENES_organized_list[i][g_name].append(p);
        }
    }

    /*
     *       do intersections !!!
     */
    foreach(const QString key, isoforms[0][0].keys()) /*How many chromosomes ?*/
    {
        qDebug()<<"chr:"<<key;
        for(int i=0; i<isoforms[0][0][key].size();i++) /*How many refseq pointers (QVector< IsoformPtr > refseq;), isoforms for current chromosome*/
        {
            for(int j=i+1; j<isoforms[0][0][key].size();j++) /*Compare all isoforms with the others*/
            {
                if(isoforms[0][0][key][i]->intersects_count.isNull()) {
                    if(( !dUTP || isoforms[0][0][key][i]->strand == isoforms[0][0][key][j]->strand) &&
                       bicl::intersects(isoforms[0][0][key][i]->isoform,isoforms[0][0][key][j]->isoform)) {
                        /*repeat this part for multithread*/
                        for(int t=0;t<m_ThreadNum;t++) {
                            isoforms[t][0][key][i]->intersects=true;
                            isoforms[t][0][key][j]->intersects=true;

                            if(isoforms[t][0][key][j]->intersects_count.isNull()) {
                                chrom_coverage * p = new chrom_coverage();
                                p[0] += isoforms[t][0][key][i]->isoform ;
                                p[0] += isoforms[t][0][key][j]->isoform ;

                                //qDebug()<<"inter i:"<<isoforms[0][0][key][i].data()->name<<" inter j:"<<isoforms[0][0][key][j].data()->name;
                                isoforms[t][0][key][i]->intersects_count=QSharedPointer< chrom_coverage >(p);
                                isoforms[t][0][key][j]->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                QList<IsoformPtr> *p0 = new QList<IsoformPtr>();

                                p0->append(isoforms[t][0][key][i]);
                                p0->append(isoforms[t][0][key][j]);

                                isoforms[t][0][key][i]->intersects_isoforms=QSharedPointer<QList<IsoformPtr> >( p0 );
                                isoforms[t][0][key][j]->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;
                            } else {
                                isoforms[t][0][key][j]->intersects_count.data()[0] += isoforms[t][0][key][i]->isoform ;
                                isoforms[t][0][key][i]->intersects_count=isoforms[t][0][key][j]->intersects_count;

                                isoforms[t][0][key][j]->intersects_isoforms->append(isoforms[t][0][key][i]);
                                isoforms[t][0][key][i]->intersects_isoforms=isoforms[t][0][key][j]->intersects_isoforms;
                            }
                        }
                        break;
                    } //if intersects
                }
                else { //if intersects_count is null
                    if(( !dUTP || isoforms[0][0][key][i]->strand == isoforms[0][0][key][j]->strand) &&
                       bicl::intersects(isoforms[0][0][key][i]->intersects_count.data()[0],isoforms[0][0][key][j]->isoform)) {
                        /*repeat this part for multithread*/
                        for(int t=0;t<m_ThreadNum;t++) {
                            isoforms[t][0][key][j]->intersects=true;
                            if(isoforms[t][0][key][j]->intersects_count.isNull()) {

                                isoforms[t][0][key][i]->intersects_count.data()[0] += isoforms[t][0][key][j]->isoform ;
                                isoforms[t][0][key][j]->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                isoforms[t][0][key][i]->intersects_isoforms->append(isoforms[t][0][key][j]);
                                isoforms[t][0][key][j]->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;

                            } else {
                                int sz=isoforms[t][0][key][j]->intersects_isoforms->size();
                                for(int c=0;c<sz;c++) {
                                    isoforms[t][0][key][i]->intersects_count.data()[0] += isoforms[t][0][key][j]->intersects_isoforms->at(c)->isoform ;
                                    isoforms[t][0][key][j]->intersects_isoforms->at(c)->intersects_count=isoforms[t][0][key][i]->intersects_count;

                                    isoforms[t][0][key][i]->intersects_isoforms->append(isoforms[t][0][key][j]->intersects_isoforms->at(c));
                                    isoforms[t][0][key][j]->intersects_isoforms->at(c)->intersects_isoforms=isoforms[t][0][key][i]->intersects_isoforms;
                                }
                            }
                        }
                        //qDebug()<<"inter i:"<<isoforms[0][0][key][i].data()->name<<" inter j:"<<isoforms[0][0][key][j].data()->name;
                        break;
                    } //
                }//intersects count null or not null
            }
        }/*loop trough isoforms on chromosome*/
    }/*foreach trough chromosomes*/
}

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

void FSTM::WriteResult()
{

    qDebug()<<" Writing a result";

    QFile outFile;
    bool  wrtFile=!(gArgs().getArgs("out").toString().isEmpty() || gArgs().getArgs("no-file").toBool());
    if(wrtFile) {
        outFile.setFileName(gArgs().getArgs("out").toString());
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        outFile.write(QString("refseq_id,gene_id,chrom,txStart,txEnd,strand,TOT_R_0,RPKM_0").toLocal8Bit());
        for(int i=1;i<m_ThreadNum;i++) {
            outFile.write(QString(",TOT_R_%1,RPKM_%2").arg(i).arg(i).toLocal8Bit());
        }
        outFile.write(QString("\n").toLocal8Bit());
    }

    this->CreateTablesViews();

    QString SQL_QUERY_BASE=QString("insert into %1 values ").
                           arg(gArgs().getArgs("sql_table").toString());

    foreach(const QString &chr,isoforms[0][0].keys())
    {

        QString SQL_QUERY="";
        for(int c=0; c<isoforms[0][0][chr].size(); c++)
        {
            /* if in input controls list say 1,3,7 next loop will have i==list
              * then this variable became equal to current value */

            for(int i=0;i<m_ThreadNum;i++)
            {
                QSharedPointer<Isoform> current = isoforms[i][0][chr][c];

                if(i==0)
                {
                    if(wrtFile)
                        outFile.write((QString("\"%1\",=\"%2\",%3,%4,%5,%6,%7,%8").
                                       arg(current.data()->name).
                                       arg(current.data()->name2).
                                       arg(current.data()->chrom).
                                       arg(current.data()->txStart).
                                       arg(current.data()->txEnd).
                                       arg(current.data()->strand).
                                       arg(current.data()->totReads).
                                       arg(current.data()->RPKM)).toLocal8Bit());
                    if(!gArgs().getArgs("no-sql-upload").toBool())
                        SQL_QUERY+=QString(" ('%1','%2','%3',%4,%5,'%6',%7,%8").
                                   arg(current.data()->name).
                                   arg(current.data()->name2).
                                   arg(current.data()->chrom).
                                   arg(current.data()->txStart).
                                   arg(current.data()->txEnd).
                                   arg(current.data()->strand).
                                   arg(current.data()->totReads).
                                   arg(current.data()->RPKM);
                } else {
                    if(wrtFile)
                        outFile.write(QString(",%1,%2").arg(current.data()->totReads).arg(current.data()->RPKM).toLocal8Bit());
                    if(!gArgs().getArgs("no-sql-upload").toBool())
                        SQL_QUERY+=QString(",%1,%2").arg(current.data()->totReads).arg(current.data()->RPKM);
                }
            }
            if(wrtFile)
                outFile.write(QString("\n").toLocal8Bit());
            SQL_QUERY+="),";
        }
        SQL_QUERY.chop(1);
        if(!gArgs().getArgs("no-sql-upload").toBool() && !q.exec(SQL_QUERY_BASE+SQL_QUERY+";"))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }
    }
    if(wrtFile)
        outFile.close();


    /*
     *   Reporting isoforms with common TSS
     */
    if(wrtFile) {
        outFile.setFileName(gArgs().fileInfo("out").baseName()+"_common_tss.csv");
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        outFile.write(QString("\"=\"\"refseq_id\"\"\",\"=\"\"gene_id\"\"\",\"chrom\",txStart,txEnd,strand,TOT_R_0,RPKM_0").toLocal8Bit());

        for(int i=1;i<m_ThreadNum;i++) {
            outFile.write(QString(",TOT_R_%1,RPKM_%2").arg(i).arg(i).toLocal8Bit());
        }
        outFile.write(QString("\n").toLocal8Bit());

        foreach(QString key,TSS_organized_list[0].keys()) {
            for(int i=0;i<m_ThreadNum;i++) {
                QString name,name2;
                double RPKM=0.0;
                quint64 totReads=0;

                QSharedPointer<Isoform> current;
                for(int j=0;j<TSS_organized_list[i][key].size();j++) {
                    current = TSS_organized_list[i][key].at(j);
                    name+=current.data()->name+",";
                    if(!name2.contains(current.data()->name2))
                        name2+=current.data()->name2+",";
                    RPKM+=current.data()->RPKM;
                    totReads+=current.data()->totReads;
                }
                name.chop(1);
                name2.chop(1);

                if(i==0) {
                    outFile.write((QString("\"=\"\"%1\"\"\",\"=\"\"%2\"\"\",\"%3\",%4,%5,%6,%7,%8").
                                   arg(name).
                                   arg(name2).
                                   arg(current.data()->chrom).
                                   arg(current.data()->txStart).
                                   arg(current.data()->txEnd).
                                   arg(current.data()->strand).
                                   arg(totReads).
                                   arg(RPKM)).toLocal8Bit());
                } else {
                    QString tmp=QString(",%1,%2").arg(totReads).arg(RPKM);
                    outFile.write(tmp.toLocal8Bit());
                }
            }
            outFile.write(QString("\n").toLocal8Bit());
        }

        outFile.close();



        /*
        *   Reporting GENES Expression
        */
        outFile.setFileName(gArgs().fileInfo("out").baseName()+"_GENES.csv");
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        outFile.write(QString("\"=\"\"refseq_id\"\"\",\"=\"\"gene_id\"\"\",\"chrom\",txStart,txEnd,strand,TOT_R_0,RPKM_0").toLocal8Bit());

        for(int i=1;i<m_ThreadNum;i++)
        {
            outFile.write(QString(",TOT_R_%1,RPKM_%2").arg(i).arg(i).toLocal8Bit());
        }
        outFile.write(QString("\n").toLocal8Bit());

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
                                   arg(RPKM)).toLocal8Bit());
                }
                else
                {
                    QString tmp=QString(",%1,%2").arg(totReads).arg(RPKM);
                    outFile.write(tmp.toLocal8Bit());
                }
            }
            outFile.write(QString("\n").toLocal8Bit());
        }

        outFile.close();
    }//if wrtFile
}
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

void FSTM::CreateTablesViews(void)
{
    if(!gArgs().getArgs("no-sql-upload").toBool())
    {

        QString DROP_TBL= QString("DROP VIEW IF EXISTS `%1`.`%2_common_tss`;").arg(gArgs().getArgs("sql_dbname").toString()).arg(gArgs().getArgs("sql_table").toString());
        if(!q.exec(DROP_TBL))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }
        DROP_TBL= QString("DROP VIEW IF EXISTS `%1`.`%2_genes`;").arg(gArgs().getArgs("sql_dbname").toString()).arg(gArgs().getArgs("sql_table").toString());
        if(!q.exec(DROP_TBL))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }

        QString RPKM_FIELDS="";
        for(int i=1;i<m_ThreadNum;i++) {
            RPKM_FIELDS+=QString("TOT_R_%1 float,").arg(i);
            RPKM_FIELDS+=QString("RPKM_%1 float,").arg(i);
        }

        QString CREATE_TABLE=QString("DROP TABLE IF EXISTS `%1`.`%2`;"
                                     "CREATE TABLE `%3`.`%4` ( "
                                     "`refseq_id` VARCHAR(100) NOT NULL ,"
                                     "`gene_id` VARCHAR(100) NOT NULL ,"
                                     "`chrom` VARCHAR(45) NOT NULL,"
                                     "`txStart` INT NULL ,"
                                     "`txEnd` INT NULL ,"
                                     "`strand` char(1),"
                                     "TOT_R_0   float,"
                                     "RPKM_0   float,"
                                     "%5 "
                                     "INDEX refseq_id_idx (refseq_id) using btree,"
                                     "INDEX gene_id_idx (gene_id) using btree,"
                                     "INDEX chr_idx (chrom) using btree,"
                                     "INDEX txStart_idx (txStart) using btree,"
                                     "INDEX txEnd_idx (txEnd) using btree"
                                     ")"
                                     "ENGINE = MyISAM "
                                     "COMMENT = 'created by readscounting';").
                             arg(gArgs().getArgs("sql_dbname").toString()).
                             arg(gArgs().getArgs("sql_table").toString()).
                             arg(gArgs().getArgs("sql_dbname").toString()).
                             arg(gArgs().getArgs("sql_table").toString()).
                             arg(RPKM_FIELDS);

        if(!gArgs().getArgs("no-sql-upload").toBool() && !q.exec(CREATE_TABLE))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }

        RPKM_FIELDS="";
        for(int i=1;i<m_ThreadNum;i++)
        {
            RPKM_FIELDS+=QString(",coalesce(sum(TOT_R_%1),0) AS TOT_R_%2 ").arg(i).arg(i);
            RPKM_FIELDS+=QString(",coalesce(sum(RPKM_%1),0) AS RPKM_%2 ").arg(i).arg(i);
        }


        CREATE_TABLE=QString(
                         "CREATE VIEW `%1`.`%2_common_tss` AS "
                         "select "
                         "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id,"
                         "group_concat(distinct gene_id   order by gene_id   separator ',') AS gene_id,"
                         "chrom AS chrom,"
                         "txStart AS txStart,"
                         "max(txEnd) AS txEnd,"
                         "strand AS strand,"
                         "coalesce(sum(TOT_R_0),0) AS TOT_R_0, "
                         "coalesce(sum(RPKM_0),0) AS RPKM_0 "
                         "%3 "
                         "from `%4`.`%5` "
                         "where strand = '+' "
                         "group by chrom,txStart,strand ").
                     arg(gArgs().getArgs("sql_dbname").toString()).
                     arg(gArgs().getArgs("sql_table").toString()).
                     arg(RPKM_FIELDS).
                     arg(gArgs().getArgs("sql_dbname").toString()).
                     arg(gArgs().getArgs("sql_table").toString())+
                     QString(
                         " union "
                         "select "
                         "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id,"
                         "group_concat(distinct gene_id   order by gene_id   separator ',') AS gene_id,"
                         "chrom AS chrom,"
                         "min(txStart) AS txStart,"
                         "txEnd AS txEnd,"
                         "strand AS strand,"
                         "coalesce(sum(TOT_R_0),0) AS TOT_R_0, "
                         "coalesce(sum(RPKM_0),0) AS RPKM_0 "
                         "%1 "
                         "from `%2`.`%3` "
                         "where strand = '-' "
                         "group by chrom,txEnd,strand ").
                     arg(RPKM_FIELDS).
                     arg(gArgs().getArgs("sql_dbname").toString()).
                     arg(gArgs().getArgs("sql_table").toString());
        if(!q.exec(CREATE_TABLE))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }

        CREATE_TABLE=QString(
                         "CREATE VIEW `%1`.`%2_genes` AS "
                         "select "
                         "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id,"
                         "gene_id,"
                         "max(chrom) AS chrom,"
                         "max(txStart) AS txStart,"
                         "max(txEnd) AS txEnd,"
                         "max(strand) AS strand,"
                         "coalesce(sum(TOT_R_0),0) AS TOT_R_0, "
                         "coalesce(sum(RPKM_0),0) AS RPKM_0 "
                         "%3 "
                         "from `%4`.`%5` "
                         "group by gene_id ").
                     arg(gArgs().getArgs("sql_dbname").toString()).
                     arg(gArgs().getArgs("sql_table").toString()).
                     arg(RPKM_FIELDS).
                     arg(gArgs().getArgs("sql_dbname").toString()).
                     arg(gArgs().getArgs("sql_table").toString());

        if(!q.exec(CREATE_TABLE))
        {
            qDebug()<<"Query error: "<<q.lastError().text();
        }

    }

}
