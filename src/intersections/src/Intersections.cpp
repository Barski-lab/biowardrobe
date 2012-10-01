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

//bicl::interval_map<int,int>::interval_type inline getFirst(bicl::interval_map<int,int>::segment_type a)
//{
//    return a.first;
//}
//bicl::interval_set<int>::interval_type inline getFirst(bicl::interval_set<int>::segment_type a)
//{
//    return a;
//}


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
        //typename T::interval_type itv1  = getFirst<typename T::interval_type,typename T::segment_type>(*it1);
        //typename T::interval_type itv2  = getFirst<typename T::interval_type,typename T::segment_type>(*it2);
//        typename T::interval_type itv1  = getFirst(*it1);
//        typename T::interval_type itv2  = getFirst(*it2);
        IntervalType itv1  = bicl::key_value<T>(it1);
        IntervalType itv2  = bicl::key_value<T>(it2);

        if(itv1.upper()>itv2.upper())
        {
            /*if segments intersect and we should move second segment then segment A should not be included in output*/
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
**************************************************************************************************************/
template<typename T>
void FSTM::loadBed(T & a,QString fname)
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
            if(Q.isEmpty() || Q.isNull() || Q.startsWith("track")) continue;
            QStringList list=Q.split(QChar(' '));
            if(list.at(3).startsWith("P-"))
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
void FSTM::start()
{
    QStringList QL;/*Query list*/
    QStringList PFL;/*Peaks file list*/

    /*RNASEQ_CD4_CUFFLINKS - has unique TSS start positions and in addition FPKMs from CD4 experiments*/
    QString Q3="select chrom,txStart,refsec,gene from expirements.RNASEQ_CD4_CUFFLINKS order by chrom,txStart";
    QSqlQuery q;

    /*Reads whole genome .fa file into QMap*/
    QFile genomeFile;
    if(gArgs().fileInfo("in").exists())
    {
        genomeFile.setFileName(gArgs().getArgs("in").toString());
        genomeFile.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream g_in(&genomeFile);
        QString g_key="";
        while (!g_in.atEnd())
        {
            QString Q=g_in.readLine();
            if(Q.isEmpty() || Q.isNull()) continue;
            if(Q.at(0)==QChar('>'))
            {
                Q.remove(0,1);
                //if(g_key!="")
                //{
                //    qDebug()<<"k:"<<g_key<<"s:"<<genome[g_key].length();
                //}
                g_key=Q;
                continue;
            }
            genome[g_key].append(Q.toLocal8Bit());
        }
        genomeFile.close();
    }

    /*Working on batch file filling QL and PFL*/
    QFile batchFile;
    batchFile.setFileName(gArgs().getArgs("batch").toString());
    batchFile.open(QIODevice::ReadOnly| QIODevice::Text);

    QTextStream in(&batchFile);
    while (!in.atEnd())
    {
        QString Q = in.readLine();
        if(Q.isEmpty() || Q.isNull() || Q.at(0)==QChar('#')) continue;
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



    QFile _outFile;

    QList<int>** b_values;
    b_values=new QList<int>* [QL.size()/2];

    for(int i=0,j=0;i<QL.size();i+=2,j++)
    {
        b_values[j]=new QList<int>();

        string_map_segments chr_intervals_P1;//Peaks
        string_map_segments chr_intervals_P2;//Peaks

        loadBed< string_map_segments >(chr_intervals_P1,PFL.at(i));
        loadBed< string_map_segments >(chr_intervals_P2,PFL.at(i+1));

        /*loading segments from database(SQL) queries sicer*/
        string_map_segments chr_intervals_Q1;//SQL, sicer segments ?
        string_map_segments chr_intervals_Q2;//SQL

        if(!q.exec(QL.at(i)))
        {
            qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
        }
        else
        {
            while (q.next())
            {
                chr_intervals_Q1 [q.value(0).toString()]+=make_pair(bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()),q.value(3).toInt());
            }
        }

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

        /*Preparing chr_intervals_f_ QMap for later analysis, which includes only uniq segments in first Map that are not exist in second*/
        string_map_segments chr_intervals_f_Q1;
        string_map_segments chr_intervals_f_Q2;

        foreach(const QString chrom,chr_intervals_Q1.keys())
        {
            UniqSegmentsInA<current_segment_type >(chr_intervals_Q1[chrom],chr_intervals_Q2[chrom],chr_intervals_f_Q1[chrom]);
            UniqSegmentsInA<current_segment_type >(chr_intervals_Q2[chrom],chr_intervals_Q1[chrom],chr_intervals_f_Q2[chrom]);
        }




        /*Store result of uniq segments around TSS*/
        QMap<QString, current_segment_type > chr_intervals_r_Q1;
        QMap<QString, current_segment_type > chr_intervals_r_Q2;

        if(!q.exec(Q3))
        {
            qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
        }

        while(q.next())
        {
            int frame=10000;
            int min_score=31;
            int tss=q.value(1).toInt();
            int left=tss-frame;
            int right=tss+frame;
            bool a1,a2;
            QString chr=q.value(0).toString();

            current_segment_type a;
            a+=make_pair(current_segment_type::interval_type::closed(left,right),1);

            /*
            uniq segments are that, that are not intersect each other between experiments
            if looking for intersections within tss with not uniq segments
            and with uniq segments
            */
            if(0)
            {
                a1=intersects(chr_intervals_Q1[chr],current_segment_type::interval_type::closed(left,right));
                a2=intersects(chr_intervals_Q2[chr],current_segment_type::interval_type::closed(left,right));
            }
            else
            {
                a1=intersects(chr_intervals_f_Q1[chr],current_segment_type::interval_type::closed(left,right));
                a2=intersects(chr_intervals_f_Q2[chr],current_segment_type::interval_type::closed(left,right));
            }

            if( a1 && a2)
            {
                b_values[j]->append(1);
            }
            else if(a1)
            {
                int max=0;
                current_segment_type tmp;
                tmp= a & chr_intervals_f_Q1[chr];

                for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
                {
                    max=qMax<int>(max,it->second);
                    if(it->second>min_score)
                        chr_intervals_r_Q1[chr].add(*it);
                }

                if(max>min_score)
                {
                    b_values[j]->append(2);
                }
                else
                {
                    b_values[j]->append(4);
                }
            }
            else if(a2)
            {
                int max=0;
                current_segment_type tmp;
                tmp= a & chr_intervals_f_Q2[q.value(0).toString()];

                for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
                {
                    max=qMax<int>(max,it->second);
                    if(it->second>min_score)
                        chr_intervals_r_Q2[chr].add(*it);
                }

                if(max>min_score)
                {
                    b_values[j]->append(3);
                }
                else
                {
                    b_values[j]->append(4);
                }
            }
            else
            {
                b_values[j]->append(4);
            }
        }/*While q.next (Q3)*/

        outData(chr_intervals_P1,chr_intervals_r_Q1,chr_intervals_P2,chr_intervals_r_Q2,j);
    }

    if(!q.exec(Q3))
    {
        qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
    }


    _outFile.setFileName(gArgs().getArgs("out").toString());
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

    //_outFile.write(QString("NAME,N_E,N_C,E_C\n").toLocal8Bit() );
    int c=0;
    while(q.next())
    {
        _outFile.write(QString("\"%1\"").arg(q.value(2).toString()).toLocal8Bit() );
        for(int j=0; j<QL.size()/2;j++)
            _outFile.write(QString(",%1").arg(b_values[j]->at(c)).toLocal8Bit() );
        _outFile.write(QString("\n").toLocal8Bit() );
        c++;
    }
    _outFile.flush();
    _outFile.close();




    emit finished();
}


/*************************************************************************************************************
**************************************************************************************************************/
void FSTM::outData(string_map_segments& chr_intervals_P1,string_map_segments& chr_intervals_r_Q1,
    string_map_segments& chr_intervals_P2, string_map_segments& chr_intervals_r_Q2,int j)
{
    QFile _outFile;
    int ajust_win=200;

    /*print result of uniq segments with peaks in A and B*/

    //_outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inA_%1.csv").arg(j));
    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inA_%1.fasta").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    foreach(const QString key, chr_intervals_P1.keys())
    {
        current_segment_type tmp;
        tmp=chr_intervals_P1[key] & chr_intervals_r_Q1[key];

        for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
        {
            //            int start=getFirst<current_segment_type::interval_type,current_segment_type::segment_type>(*it).lower();
            //            int end=getFirst<current_segment_type::interval_type,current_segment_type::segment_type>(*it).upper();
            int start=getFirst(*it).lower()-ajust_win;
            int end=getFirst(*it).upper()+ajust_win;
            int len=end-start;
            //_outFile.write(QString("%1,%2,%3,%4,%5\n").arg(key).
            //    arg(start).
            //    arg(end).
            //    arg(len).
            //    arg(genome[key].mid(start,len).data()).toLocal8Bit() );
            _outFile.write(QString(">%1:%2-%3\n%5\n").
                arg(key).
                arg(start).
                arg(end).
                arg(genome[key].mid(start,len).data()).toLocal8Bit() );
        }
    }

    foreach(const QString key, chr_intervals_P1.keys())
    {
//        current_segment_type &tmp = chr_intervals_r_Q1[key];

        for(current_segment_type::const_iterator it = chr_intervals_r_Q1[key].begin(); it != chr_intervals_r_Q1[key].end(); it++)
        {
            current_segment_type::interval_type itv  = getFirst(*it);

            if(!intersects(chr_intervals_P1[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                int mid=start+(end-start)/2;
                start=mid-ajust_win;
                end=mid+ajust_win;
                int len=end-start;
                _outFile.write(QString(">%1:%2-%3\n%5\n").arg(key).
                    arg(start).
                    arg(end).
                    arg(genome[key].mid(start,len).data()).toLocal8Bit() );
            }
        }
    }

    _outFile.flush();
    _outFile.close();

    //_outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inB_%1.csv").arg(j));
    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inB_%1.fasta").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

    foreach(const QString key, chr_intervals_P2.keys())
    {
        current_segment_type tmp;
        tmp=chr_intervals_P2[key] & chr_intervals_r_Q2[key];
//        tmp=chr_intervals_P2[key] & store2[key];
        for(current_segment_type::const_iterator it = tmp.begin(); it != tmp.end(); it++)
        {
            int start=getFirst(*it).lower()-ajust_win;
            int end=getFirst(*it).upper()+ajust_win;
            int len=end-start;
            _outFile.write(QString(">%1:%2-%3\n%5\n").arg(key).
                arg(start).
                arg(end).
                arg(genome[key].mid(start,len).data()).toLocal8Bit() );
        }
    }

    foreach(const QString key, chr_intervals_P2.keys())
    {
//        current_segment_type &tmp = chr_intervals_r_Q2[key];
//        tmp=chr_intervals_r_Q2[key];
//        tmp=store2[key];

        for(current_segment_type::const_iterator it = chr_intervals_r_Q2[key].begin(); it != chr_intervals_r_Q2[key].end(); it++)
        {
            current_segment_type::interval_type itv  = getFirst(*it);

            if(!intersects(chr_intervals_P2[key],itv) )
            {
                int start=itv.lower();
                int end=itv.upper();
                int mid=start+(end-start)/2;
                start=mid-ajust_win;
                end=mid+ajust_win;
                int len=end-start;
                _outFile.write(QString(">%1:%2-%3\n%5\n").arg(key).
                    arg(start).
                    arg(end).
                    arg(genome[key].mid(start,len).data()).toLocal8Bit() );
            }
        }
    }

    _outFile.flush();
    _outFile.close();



    /*print results of uniq segments in A and B that has no peaks in Quest*/

    _outFile.setFileName(gArgs().fileInfo("out").baseName()+QString("_inA_nopeaks_%1.csv").arg(j));
    _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
    foreach(const QString key, chr_intervals_P1.keys())
    {
//        current_segment_type &tmp = chr_intervals_r_Q1[key];
//        tmp=chr_intervals_r_Q1[key];

        for(current_segment_type::const_iterator it = chr_intervals_r_Q1[key].begin(); it != chr_intervals_r_Q1[key].end(); it++)
        {
            current_segment_type::interval_type itv  = getFirst(*it);

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
    foreach(const QString key, chr_intervals_P1.keys())
    {
//        current_segment_type &tmp = chr_intervals_r_Q2[key];
//        tmp=chr_intervals_r_Q2[key];

        for(current_segment_type::const_iterator it = chr_intervals_r_Q2[key].begin(); it != chr_intervals_r_Q2[key].end(); it++)
        {
            current_segment_type::interval_type itv  = getFirst(*it);

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


}
