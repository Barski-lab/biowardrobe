/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the intersection module of the genome-tools.
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

#include "Intersections.hpp"


/*************************************************************************************************************
**************************************************************************************************************/
#define PRINT(a,b) \
    _outFile.setFileName(a); \
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
    \
    foreach(const QString chr,chr_intervals_##b.keys()) \
{                                          \
    \
    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals_##b[chr].begin(); it != chr_intervals_##b[chr].end(); it++)\
{                                                                                                                                                 \
    bicl::discrete_interval<int> itv  = (*it);                                                                                                 \
    \
    _outFile.write( QString("%1\t%2\t%3\n").                                                                                                     \
    arg(chr).arg(itv.lower()).arg(itv.upper()).toLocal8Bit() );                                                                  \
    }                                                                                                                                                 \
    }                                                                                                                                                   \
    _outFile.flush();                                                                                                                                   \
    _outFile.close();



/*************************************************************************************************************
**************************************************************************************************************/
FSTM::FSTM(QObject *parent):
    QObject(parent)
{
}

/*************************************************************************************************************
**************************************************************************************************************/
FSTM::~FSTM()
{
}


/*************************************************************************************************************
**************************************************************************************************************/
template<class T>
void UniqSegmentsInA(T &a,T &b,T &c,int max_gap=200)
{
    typedef typename T::iterator Iterator;
    typedef typename T::interval_type IntervalType;
    Iterator it1 = a.begin();
    Iterator it2 = b.begin();
    bool checking=true;

    while(it1 != a.end() && it2 != b.end())
    {
        IntervalType itv1  = bicl::key_value<T>(it1);
        IntervalType itv2  = bicl::key_value<T>(it2);

        if(itv1.upper()>itv2.upper())
        {
            /*if segments intersect and we should move second segment then segment A shouldn't be included in output*/
            if(intersects(T::interval_type::closed(itv1.lower()-max_gap,itv1.upper()+max_gap),itv2)) checking=false;
            it2++;
        }
        else
        {
            if(!intersects(T::interval_type::closed(itv1.lower()-max_gap,itv1.upper()+max_gap),itv2) && checking)
            {
                c.add(*it1);
            }
            checking=true;
            it1++;
        }
    }
    if(it1 != a.end() && !checking) it1++;
    while(it1 != a.end())
    {
        c.add(*it1);
        it1++;
    }
}


/*************************************************************************************************************
 * Load bed from QuEST output PEAKS
**************************************************************************************************************/
template<typename T>
void FSTM::loadBed(T & a,QString fname,QString cond)
{
    QFile bedFile;
    if(QFileInfo(fname).exists())
    {
        bedFile.setFileName(fname);
        bedFile.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream bed_in(&bedFile);

        while (!bed_in.atEnd())
        {
            QString Q=bed_in.readLine();
            if(Q.isEmpty() || Q.startsWith("track")) continue;
            QStringList list=Q.split(QChar(' '));
            if(list.at(3).startsWith(cond))
            {
                a[list.at(0)].add(make_pair(current_segment_type::interval_type::closed(list.at(1).toInt(),list.at(2).toInt()),1));
            }
        }
        bedFile.close();
    }
    else
    {
        qDebug()<<"file:"<<fname<<" does not exist.";
    }
}
/*************************************************************************************************************
**************************************************************************************************************/
void FSTM::TSS_LOAD(void)
{
    /*Reads whole genome .fa file into QMap*/
    QFile genomeFile;
    genomeFile.setFileName(gArgs().getArgs("in").toString());
    genomeFile.open(QIODevice::ReadOnly| QIODevice::Text);
    QTextStream g_in(&genomeFile);
    QString g_key="";
    while (!g_in.atEnd())
    {
        QString cur_line=g_in.readLine();
        if(cur_line.isEmpty()) continue;
        if(cur_line.at(0)==QChar('>'))
        {
            cur_line.remove(0,1);//Chromosome name
            g_key=cur_line;
            continue;
        }
        //save in map QMap[chromosome]
        genome[g_key].append(cur_line.toLocal8Bit());
    }
    genomeFile.close();
}

/*************************************************************************************************************
**************************************************************************************************************/
bool FSTM::LOAD_BATCH(QStringList &QL, QStringList &PFL)
{
    if(!gArgs().fileInfo("batch").exists())
    {
        qDebug()<<"error opening batch:"<<gArgs().getArgs("batch").toString();
        return false;
    }

    QFile batchFile;
    batchFile.setFileName(gArgs().getArgs("batch").toString());
    batchFile.open(QIODevice::ReadOnly| QIODevice::Text);

    QTextStream in(&batchFile);
    while (!in.atEnd())
    {
        QString cur_line = in.readLine();
        if(cur_line.isEmpty() || cur_line.at(0)==QChar('#')) continue;
        if(cur_line.startsWith("select"))
        {
            QL<<cur_line;//Query list
        }
        else
        {
            PFL<<cur_line;
        }
    }
    batchFile.close();
    return true;
}


/*************************************************************************************************************
**************************************************************************************************************/
void FSTM::start()
{
    QStringList QL;/*Query list*/
    QStringList PFL;/*Peaks file list*/

    QFile _outFile;
    QVector< QList<int>  > b_values; //storage for intersections type inA inB in Both
    TSS_wrt=false;

    if(gArgs().fileInfo("in").exists())
    {
        /*Reads whole genome .fa file into QMap*/
        TSS_wrt=true;
        TSS_LOAD();
    }

    /*Working on batch file filling QL and PFL*/
    if(!LOAD_BATCH(QL,PFL))
    {
        emit finished();
        return;
    }
    b_values.resize(QL.size()/2);//recalculate how many columns do we have

    /*
     * Executing ExpressionData_Query
     */
    /*
     * Query string selects all interested genes with expression
     */
    QString ExpressionData_Query=
            "select refsec_id,gene_id,chrom,txStart,txEnd,strand,"
            "RPKM_0,RPKM_1,RPKM_2,RPKM_3,RPKM_4,RPKM_5,RPKM_6,RPKM_7,RPKM_8,RPKM_9,RPKM_10,RPKM_11"
            " from hg19.Artem_NIH_PAPER1_RPKM_common_tss order by chrom,txStart";
    if(!big_q.exec(ExpressionData_Query))
    {
        qWarning()<<qPrintable(tr("Select query error. ")+big_q.lastError().text());
    }
    big_q.first();

    int fieldChrom = big_q.record().indexOf("chrom");
    int fieldStrand = big_q.record().indexOf("strand");
    int fieldTxStart= big_q.record().indexOf("txStart");
    int fieldTxEnd= big_q.record().indexOf("txEnd");
    //int fieldName = big_q.record().indexOf("refsec_id");

    /*
     * cycle through all queries
     */
    for(int i=0,j=0;i<QL.size();i+=2,j++)
    {
        qDebug()<<"Working on:"<<i;
        string_map_segments chr_intervals_P1;//Peaks
        string_map_segments chr_intervals_P2;//Peaks
        //loading bed files, names from batch file, ith and (i+1)th position
        if(PFL.size()==QL.size())
        {
            loadBed< string_map_segments >(chr_intervals_P1,PFL.at(i));
            loadBed< string_map_segments >(chr_intervals_P2,PFL.at(i+1));
        }


        /*loading segments from database(SQL) queries sicer, queries from batch file*/
        string_map_segments chr_intervals_Q1;//SQL, sicer segments ?
        string_map_segments chr_intervals_Q2;//SQL

        if(TSS_wrt)
        {
            _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_ALL_in_A_%1.fasta").arg(j));
            _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        }

        if(!q.exec(QL.at(i)))
        {
            qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
        }
        else
        {
            while (q.next())
            {
                chr_intervals_Q1 [q.value(0).toString()]+=make_pair(bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()),q.value(3).toInt());

                if(TSS_wrt)
                    _outFile.write(QString(">%1:%2-%3\n%5\n").arg(q.value(0).toString()).
                                   arg(q.value(1).toInt()).
                                   arg(q.value(2).toInt()).
                                   arg(genome[q.value(0).toString()].mid(q.value(1).toInt(),q.value(2).toInt()-q.value(1).toInt()).data()).toLocal8Bit() );

            }
        }
        if(TSS_wrt)
            _outFile.close();


        if(!q.exec(QL.at(i+1)))
        {
            qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
        }
        else
        {
            while (q.next())
            {
                chr_intervals_Q2 [q.value(0).toString()]+=make_pair(bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()),q.value(3).toInt());
            }
        }

        /*
         * Preparing QMap chr_intervals_f_  for later analysis,
         * which includes only uniq segments in first Map that are not exist in second
         */
        string_map_segments chr_intervals_f_Q1;
        string_map_segments chr_intervals_f_Q2;

        /*Store result of uniq segments after filtering either around TSS or outside of TSS*/
        string_map_segments chr_intervals_r_Q1;
        string_map_segments chr_intervals_r_Q2;

        foreach(const QString chrom,chr_intervals_Q1.keys())
        {
            UniqSegmentsInA<current_segment_type >(chr_intervals_Q1[chrom],chr_intervals_Q2[chrom],chr_intervals_f_Q1[chrom]);
            UniqSegmentsInA<current_segment_type >(chr_intervals_Q2[chrom],chr_intervals_Q1[chrom],chr_intervals_f_Q2[chrom]);
            chr_intervals_r_Q1[chrom]=chr_intervals_f_Q1[chrom];
            chr_intervals_r_Q2[chrom]=chr_intervals_f_Q2[chrom];
        }




        /*
         * First cycle trough expression query to create 2 different maps of segments
         * one to show where segments are exist
         * the other is list of uniq segments
         */
        big_q.first();
        for(bool cycle=true;cycle;cycle=big_q.next())
        {
            QString chr=big_q.value(fieldChrom).toString();
            QChar strand=big_q.value(fieldStrand).toString().at(0);
            quint64 txStart=big_q.value(fieldTxStart).toInt()+1;
            quint64 txEnd=big_q.value(fieldTxEnd).toInt();

            int frame=1000;
            int min_score=40;
            int tss=txStart;
            if(strand==QChar('-')) tss=txEnd;
            int left=tss-frame;
            int right=tss+frame;
            bool a1,a2;

            /*
            uniq segments are that, that are not intersect each other between experiments
            if looking for intersections within tss with not uniq segments
            and with uniq segments
            */
            //a1=intersects(chr_intervals_Q1[chr],current_segment_type::interval_type::closed(left,right));
            //a2=intersects(chr_intervals_Q2[chr],current_segment_type::interval_type::closed(left,right));
            a1=intersects(chr_intervals_f_Q1[chr],current_segment_type::interval_type::closed(left,right));
            a2=intersects(chr_intervals_f_Q2[chr],current_segment_type::interval_type::closed(left,right));

            if( a1 && a2)//both experiments contains islands
            {
                b_values[j].append(1);
            }
            else if(a1)//only first contains Islands
            {
                int max=0;
                current_segment_type tmp,a;
                a+=make_pair(current_segment_type::interval_type::closed(left,right),3);
                tmp= a & chr_intervals_f_Q1[chr];
                chr_intervals_r_Q1[chr]=chr_intervals_r_Q1[chr]-tmp;
//                for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
//                {
//                    max=qMax<int>(max,it->second);
//                    if(it->second>min_score)
//                        chr_intervals_r_Q1[chr].add(*it);
//                }

                if(max>min_score)
                {
                    b_values[j].append(2);
                }
                else
                {
                    b_values[j].append(4);
                }
            }
            else if(a2)
            {
                int max=0;
                current_segment_type tmp,a;
                a+=make_pair(current_segment_type::interval_type::closed(left,right),3);
                tmp= a & chr_intervals_f_Q2[chr];

                chr_intervals_r_Q2[chr]=chr_intervals_r_Q2[chr]-tmp;

//                for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
//                {
//                    max=qMax<int>(max,it->second);
//                    if(it->second>min_score)
//                        chr_intervals_r_Q2[chr].add(*it);
//                }

                if(max>min_score)
                {
                    b_values[j].append(3);
                }
                else
                {
                    b_values[j].append(4);
                }
            }
            else
            {
                b_values[j].append(4);
            }
        }/*While q.next (Q3)*/


        outData(chr_intervals_P1,chr_intervals_r_Q1,chr_intervals_P2,chr_intervals_r_Q2,j);
        qDebug()<<"Finished working on:"<<i;
    }


    _outFile.setFileName(gArgs().getArgs("out").toString());
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

//    QFile TSSfile;
//    if(TSS_wrt)
//    {
//        TSSfile.setFileName("TSS.fa");
//        TSSfile.open(QIODevice::WriteOnly|QIODevice::Truncate);
//    }

    big_q.first();
    int c=0;

    for(bool cycle=true;cycle;cycle=big_q.next())
    {
//        if(TSS_wrt)
//        {
//            int frame=2000;
//            QString chr=big_q.value(fieldChrom).toString();
//            QChar strand=big_q.value(fieldStrand).toString().at(0);
//            quint64 txStart=big_q.value(fieldTxStart).toInt()+1;
//            quint64 txEnd=big_q.value(fieldTxEnd).toInt();
//            /*iso name*/
//            QString iso_name=big_q.value(fieldName).toString();
//            /*gene name*/
//            //QString g_name=q.value(fieldName2).toString();

//            int tss=txStart;
//            if(strand==QChar('-')) tss=txEnd;
//            int left=tss-frame/2;
//            TSSfile.write(QString(">%1\n%2\n").arg(iso_name).arg(genome[chr].mid(left,frame).data()).toLocal8Bit());
//        }

        for(int cc=0;cc<big_q.record().count();cc++)
        {
            if(cc==0)
            {
                _outFile.write(QString("\"%1\"").arg(big_q.value(cc).toString()).toLocal8Bit() );
            }
            else
            {
                _outFile.write(QString(",\"%1\"").arg(big_q.value(cc).toString()).toLocal8Bit() );
            }
        }

        for(int j=0; j<QL.size()/2;j++)
            _outFile.write(QString(",%1").arg(b_values[j].at(c)).toLocal8Bit() );
        _outFile.write(QString("\n").toLocal8Bit() );
        c++;
    }

//    if(TSS_wrt)
//    {
//        TSSfile.flush();
//        TSSfile.close();
//    }
    _outFile.flush();
    _outFile.close();




    emit finished();
}

/*************************************************************************************************************
**************************************************************************************************************/


/*************************************************************************************************************
**************************************************************************************************************/
void FSTM::outData(string_map_segments& chr_intervals_P1,string_map_segments& chr_intervals_r_Q1,
                   string_map_segments& chr_intervals_P2, string_map_segments& chr_intervals_r_Q2,int j,int score)
{
    QFile _outFile;
    int ajust_win=200;

    /*print result of uniq segments with peaks in A and B*/

    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inA_%1.fasta").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    foreach(const QString key, chr_intervals_P1.keys())
    {
        current_segment_type tmp;
        tmp=chr_intervals_P1[key] & chr_intervals_r_Q1[key];

        for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
        {
            if(it->second<score) continue;
            int start=(bicl::key_value<current_segment_type>(it)).lower()-ajust_win;
            int end=(bicl::key_value<current_segment_type>(it)).upper()+ajust_win;
            int len=end-start;
            _outFile.write(QString(">%1:%2-%3 %4\n%5\n").
                           arg(key).
                           arg(start).
                           arg(end).
                           arg(it->second).
                           arg(genome[key].mid(start,len).data()).toLocal8Bit() );
        }
    }

    foreach(const QString key, chr_intervals_r_Q1.keys())
    {
        for(current_segment_type::const_iterator it = chr_intervals_r_Q1[key].begin(); it != chr_intervals_r_Q1[key].end(); it++)
        {
            if(it->second<score) continue;
            current_segment_type::interval_type itv  = bicl::key_value<current_segment_type>(it);

            if(!intersects(chr_intervals_P1[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                int mid=start+(end-start)/2;
                start=mid-ajust_win;
                end=mid+ajust_win;
                int len=end-start;
                _outFile.write(QString(">%1:%2-%3 %4\n%5\n").arg(key).
                               arg(start).
                               arg(end).
                               arg(it->second).
                               arg(genome[key].mid(start,len).data()).toLocal8Bit() );
            }
        }
    }

    _outFile.flush();
    _outFile.close();

    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inB_%1.fasta").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

    foreach(const QString key, chr_intervals_P2.keys())
    {
        current_segment_type tmp;
        tmp=chr_intervals_P2[key] & chr_intervals_r_Q2[key];

        for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
        {
            if(it->second<score) continue;
            int start=(bicl::key_value<current_segment_type>(it)).lower()-ajust_win;
            int end=(bicl::key_value<current_segment_type>(it)).upper()+ajust_win;
            int len=end-start;
            _outFile.write(QString(">%1:%2-%3 %4\n%5\n").arg(key).
                           arg(start).
                           arg(end).
                           arg(it->second).
                           arg(genome[key].mid(start,len).data()).toLocal8Bit() );
        }
    }

    foreach(const QString key, chr_intervals_r_Q2.keys())
    {

        for(current_segment_type::const_iterator it = chr_intervals_r_Q2[key].begin(); it != chr_intervals_r_Q2[key].end(); it++)
        {
            if(it->second<score) continue;
            current_segment_type::interval_type itv  = bicl::key_value<current_segment_type>(it);

            if(!intersects(chr_intervals_P2[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                int mid=start+(end-start)/2;
                start=mid-ajust_win;
                end=mid+ajust_win;
                int len=end-start;
                _outFile.write(QString(">%1:%2-%3 %4\n%5\n").arg(key).
                               arg(start).
                               arg(end).
                               arg(it->second).
                               arg(genome[key].mid(start,len).data()).toLocal8Bit() );
            }
        }
    }

    _outFile.flush();
    _outFile.close();



    /*print results of uniq segments in A and B that has no peaks in Quest*/
    /*
    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inA_nopeaks_%1.csv").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    foreach(const QString key, chr_intervals_r_Q1.keys())
    {
        for(current_segment_type::const_iterator it = chr_intervals_r_Q1[key].begin(); it != chr_intervals_r_Q1[key].end(); it++)
        {
            current_segment_type::interval_type itv  = bicl::key_value<current_segment_type>(it);

            if(!intersects(chr_intervals_P1[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                _outFile.write(QString("%1,%2,%3\n").
                               arg(key).
                               arg(start).
                               arg(end).
                               toLocal8Bit() );
            }
        }
    }
    _outFile.flush();
    _outFile.close();

    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inB_nopeaks_%1.csv").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    foreach(const QString key, chr_intervals_r_Q2.keys())
    {
        for(current_segment_type::const_iterator it = chr_intervals_r_Q2[key].begin(); it != chr_intervals_r_Q2[key].end(); it++)
        {
            current_segment_type::interval_type itv  = bicl::key_value<current_segment_type>(it);

            if(!intersects(chr_intervals_P2[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                _outFile.write(QString("%1,%2,%3\n").
                               arg(key).
                               arg(start).
                               arg(end).
                               toLocal8Bit() );
            }
        }
    }
    _outFile.flush();
    _outFile.close();
   */

}
