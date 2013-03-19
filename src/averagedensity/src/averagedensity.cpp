/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the averagedensity module of the genome-tools.
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

#include "averagedensity.hpp"


/*
 *  Help function iterates over genome::cover_map::iterator& i,
 *  puts reads from current gene current segment to corresponding visual mapping
 *
 *  fills result of type T by selected data (from start till end)
 */
template<class T>
void getReadsAtPoint(genome::cover_map::iterator i,genome::cover_map::iterator e, quint64 const& start,quint64 const& end,bool reverse, quint64 shift,quint64 mapping, T& result)
{
    /*if iterator points not to the begining of the segment shift to the start position*/
    while(i!=e && (qint64)(i.key()-start)<0) i++;
    /*checking border conditions*/
    if(i==e || (quint64)i.key()>end) return;

    qint64 length=end-start+1;
    double coef=(double)(mapping)/(double)length;
    mapping--;
    /*current and old position*/
    qint64 old_position,position=(old_position=i.key()-start);
    double sum_val=0;

    if(!reverse)
    {
        /* if coefficient less then one then data is compressed
         * coefficient less then one when length of mapping is less then length of original segment
         */
        if(coef<1.0)
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                /*
                 * to make a density, need to calculate sum within length/mapp
                 */
                if((quint64)(old_position*coef) == (quint64)(position*coef))
                {
                    genome::Cover::countReads<double>(i.value(),sum_val);
                    ++i;
                    continue;
                }
                result[shift+(quint64)(coef*old_position)]+=sum_val*coef;
                genome::Cover::countReads<double>(i.value(),sum_val=0);
                //sum_val=i.value().getLevel();
                old_position=position;
                ++i;
            }
            result[shift+(quint64)(coef*old_position)]+=sum_val*coef;
        }
        /*if coefficient bigger then one data should be multiplied, when mapping is applied*/
        else if(coef>1.0)
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                double value=0;//i.value().getLevel();
                genome::Cover::countReads<double>(i.value(),value);
                quint64 map_end=(quint64)(coef*(position+1));
                if(map_end>mapping)
                    map_end=mapping;
                for(quint64 c=(quint64)(coef*position);c<=map_end;c++)
                    result[shift+c]+=value;
                ++i;
            }
        }
        /*if coefficient equal to one*/
        else
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                double value=0;//i.value().getLevel();
                genome::Cover::countReads<double>(i.value(),value);
                result[shift+position]+=value;
                ++i;
            }
        }

    }
    else
    {
        if(coef<1.0)
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                /*to make a density, need to calculate sum within length/mapp*/
                if((quint64)(old_position*coef) == (quint64)(position*coef))
                {
                    //sum_val+=i.value().getLevel();
                    genome::Cover::countReads<double>(i.value(),sum_val);
                    ++i;
                    continue;
                }
                result[shift+mapping-(quint64)(coef*old_position)]+=sum_val*coef;
                //sum_val=i.value().getLevel();
                genome::Cover::countReads<double>(i.value(),sum_val=0);
                old_position=position;
                ++i;
            }
            result[shift+mapping-(quint64)(coef*old_position)]+=sum_val*coef;
        }
        /*if coefficient bigger then one data should be multiplied, when mapping is applied*/
        else if (coef>1.0)
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                double value=0;//i.value().getLevel();
                genome::Cover::countReads<double>(i.value(),value);
                quint64 map_end=(quint64)(coef*(position+1));
                if(map_end>mapping)
                    map_end=mapping;
                for(quint64 c=(quint64)(coef*position);c<=map_end;c++)
                    result[shift+mapping-c]+=value;
                ++i;
            }
        }
        else
        {
            while(i!=e && (position=i.key()-start) < length)
            {
                //double value=0;//i.value().getLevel();
                genome::Cover::countReads<double>(i.value(),result[shift+mapping-position]);
                //result[shift+mapping-position]+=value;
                ++i;
            }
        }
    }
}
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class T>
void AVD(quint64 start,quint64 end,QString chrome,bool reverse,quint64 shift,quint64 mapping,gen_lines* input,T& result)
{

    if(!input->getLineCover(chrome+QChar('+')).isEmpty()){
        getReadsAtPoint<T>(input->getLineCover(chrome+QChar('+')).getLowerBound(start)
                           ,input->getLineCover(chrome+QChar('+')).getEndIterator()
                           ,start,end,reverse,shift,mapping,result);
    }
    if(!input->getLineCover(chrome+QChar('-')).isEmpty()){
        getReadsAtPoint<T>(input->getLineCover(chrome+QChar('-')).getLowerBound(start)
                           ,input->getLineCover(chrome+QChar('-')).getEndIterator()
                           ,start,end,reverse,shift,mapping,result);
    }
}

//-------------------------------------------------------------
//-------------------------------------------------------------
AverageDensity::AverageDensity(QObject* parent):
    QObject(parent)
{
}

/*
 * calculating mean between end and begin in a QList of type T
 */
template<typename T>
T AverageDensity::mean(const QList<T>& list,const int& begin,const int& end)
{
    assert(end<list.size());
    assert((end-begin)>0);
    T tmp=0;
    for(int i=begin;i<=end;i++)
        tmp+=list.at(i);

    return (tmp/(end-begin+1));
}

/*
 * Smooth data in a QList with span
 */
template<typename T>
QList<T> AverageDensity::smooth(const QList<T>& list,const int& span)
{
    QList<T> result;
    int win=span;
    if(win<3 || list.size()<win) return list;
    if(win%2!=1) --win;
    int half_w=win/2;
    int size=list.size();
    int mid=size-half_w;
    int x;
    int start=0,end=0;
    result<<list.first();
    try{
        for(x=1;x<size-1;x++)
        {
            if(x>=half_w && x<mid) //middle
            {
                start=x-half_w;
                end=x+half_w;
            }
            else if(x<half_w) //beginning
            {
                start=0;
                end=x+x;
            }
            else if(x>=mid) //end
            {
                start=x - (size-x);
                end=size-1;
            }
            result<<mean(list,start,end);
        }
        result<<list.last();

    }
    catch(...)
    {
        qDebug()<<"List.size:"<<list.size()<<" result.size:"<<result.size()<<" x="<<x;
    }

    return result;
}

void AverageDensity::start()
{
    int total_plots=0;


    QStringList COLORS;
    COLORS<<"red"<<"dark-violet"<<"blue"<<"orange"<<"cyan"<<"brown"<<"black"<<"gold"<<"gray"<<"green";
    QString line_w="1.5";


    QThreadPool *t_pool=QThreadPool::globalInstance();

    try{
        /*Reading bam file in thread
         *TODO: incorrect working with QThread
         *multi bam reader*/
        QFile batchBamFiles;
        batchBamFiles.setFileName(gArgs().getArgs("in").toString());
        bool raw_data=gArgs().getArgs("avd_rawdata").toBool();
        batchBamFiles.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream inFiles(&batchBamFiles);
        while(!inFiles.atEnd())
        {
            QString label = inFiles.readLine();
            if(label.isEmpty() || label.isNull() || label.at(0)==QChar('#')) continue;
            QString fname = inFiles.readLine();
            if(fname.isEmpty() || fname.isNull() || fname.at(0)==QChar('#')) throw "Error in batch with files";

            fileLabels.append(label);
            sam_data.append(new gen_lines());

            t_queue.append(new sam_reader_thread(sam_data.last(),fname));
            t_pool->start(t_queue.last());
        }
        batchBamFiles.close();

        if(t_pool->activeThreadCount()!=0)
        {
            qDebug()<<"waiting threads";
            t_pool->waitForDone();
        }


        QMap<QString,QList<double> > storage;
        QMap<QString,QMap<int,QVector<double> > > storage_wilconxon;
        QMap<QString,int> wilconxon_norm;
        QVector<int> left_right(2,0);

        /* SQL Query batch file format:
         * - first line - grapht title
         * - second line - sql query */
        QFile batchFile;
        batchFile.setFileName(gArgs().getArgs("batch").toString());
        batchFile.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream in(&batchFile);
        int blocks=1;
        QVector<int> orig_length;

        while (!in.atEnd())
        {
            QString plotName,Q1;

            plotName = in.readLine();
            if(plotName.isEmpty() || plotName.isNull()) break;
            Q1 = in.readLine();//Query
            qDebug()<<"processed:"<<plotName;

            if(!q.exec(Q1))
            {
                qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
            }

            q.first();
            int columns=q.record().count()-2;
            blocks=columns/3;
            qDebug()<<"blocks:"<<blocks;
            quint64 length=0;
            orig_length.resize(blocks);
            /*calculating total plot length, sum up mapping for all segments*/
            for(int tot_len=0;tot_len<blocks;tot_len++)
            {
                length+=q.value(1+3*(tot_len+1)).toInt();
                orig_length[tot_len]=
                        q.value(3*(tot_len+1)).toInt()/*end*/-q.value(3*(tot_len+1)-1).toInt()/*start*/;
            }

            for(int i=0;i<fileLabels.size();i++)
            {
                q.first();
                total_plots++;
                QString plt_name=fileLabels.at(i)+" "+plotName;

                QVector<double> avd_raw_data(length,0);
                int gcount=0;
                do
                {
                    for(int tot_len=0;tot_len<blocks;tot_len++)
                    {
                        AVD<QVector<double> >(q.value(3*(tot_len+1)-1).toInt()/*start*/,q.value(3*(tot_len+1)).toInt()/*end*/,q.value(0).toString()/*chrom*/,
                                              q.value(1).toString().at(0)==QChar('-')/*bool strand*/,
                                              tot_len*q.value(3*(tot_len+1)+1).toInt()/*shift*/,q.value(3*(tot_len+1)+1).toInt()/*mapping*/,sam_data.at(i),avd_raw_data);
                    }
                    if(blocks==1 && raw_data) {
                        storage_wilconxon[plt_name][gcount].fill(0.0,length);

                        AVD<QVector<double> >(q.value(2).toInt()/*start*/,q.value(3).toInt()/*end*/,q.value(0).toString()/*chrom*/,
                                              q.value(1).toString().at(0)==QChar('-')/*bool strand*/,
                                              0/*shift*/,q.value(4).toInt()/*mapping*/,sam_data.at(i),storage_wilconxon[plt_name][gcount]);
                        gcount++;
                    }

                }while(q.next());

                /*Normalization*/
                int total=sam_data.at(i)->total-sam_data.at(i)->notAligned;
                wilconxon_norm[plt_name]=total;
                for(quint64 w=0; w< length; w++)
                    storage[plt_name]<<(avd_raw_data[w]/total)/q.size();

                storage[plt_name]=smooth<double>(storage[plt_name],gArgs().getArgs("avd_smooth").toInt());

                //find max
                if(1==blocks && raw_data) {
                    int pos=0;
                    int mx=storage[plt_name][qMin(5,storage[plt_name].size())];
                    for(int j=5;j<storage[plt_name].size();j++) {
                        if(mx<storage[plt_name].at(j)) {
                            mx=storage[plt_name].at(j);
                            pos=j;
                        }
                    }
                    if(i==0){
                        left_right[0]=pos;
                        left_right[1]=pos;
                    } else {
                        left_right[0]=qMin(pos,left_right[0]);
                        left_right[1]=qMax(pos,left_right[0]);
                    }
                }


            }

        }
        batchFile.close();

        QList<QString> keys=storage.keys();
        int column=keys.size();
        int rows=storage[keys.at(0)].size();


        QString out="N";
        for(int j=0;j<column;j++)
            out+=QString(",%1").arg(keys.at(j));
        out=out+"\n";
        for(int i=0; i<rows;i++)
        {
            //out+=QString("%1").arg((int)((double)i*((double)orig_length[0]/rows)-orig_length[0]/2));
            out+=QString("%1").arg((int)(i-rows/2));
            for(int j=0;j<column;j++)
            {
                out+=QString(",%1").arg(storage[keys.at(j)].at(i));
            }
            out=out+"\n";
        }

        QFile outFile;
        outFile.setFileName(gArgs().getArgs("out").toString());
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        outFile.write(out.toAscii());
        outFile.close();

        if(!gArgs().getArgs("plot_ext").toString().isEmpty())
        {
            QString xlabel="set xlabel \"bp\"\n";
            QString xtics="set xtic auto\n";
            if(blocks==1)
            {
                xlabel=QString("set xlabel \"%1 bp around TSS\"\n").arg(orig_length[0]/2);
                xtics="set xtics rotate by -60 offset -2 (";
                xtics+=QString("\"%1 bp\" %2,").arg(-orig_length[0]/2).arg(-orig_length[0]/2);
                xtics+=QString("\"%1 bp\" %2,").arg(-orig_length[0]/4).arg(-orig_length[0]/4);
                xtics+=QString("\"TSS\" 0,");
                xtics+=QString("\"%1 bp\" %2,").arg(orig_length[0]/4).arg(orig_length[0]/4);
                xtics+=QString("\"%1 bp\" %2)\n").arg(orig_length[0]/2).arg(orig_length[0]/2);
            }

            QString ls;
            for(int i=0;i<total_plots;i++)
            {
                ls+=QString("set style line %1 lt 1 lc rgb \"%2\" lw %3\n").arg(i+1).arg(COLORS.at(i%COLORS.size())).arg(line_w);
            }

            QString plt=QString("set output '%1.%2' \n"
                                "set terminal %3 enhanced size 1920,1080 dynamic mouse standalone fname \"Helvetica\" fsize 24\n"
                                "set datafile separator ','\n"
                                "set autoscale\n"
                                "unset log\n"
                                "unset label\n"
                                +xtics+
                                "set ytic auto\n"
                                "set key autotitle columnhead\n"
                                "#set yrange [*:1.6e-08]\n"
                                +xlabel+
                                "set ylabel \"Avg. Tag Density (per bp)\"\n"
                                "set style fill transparent\n"
                                "set title \"%4\"\n"
                                "set format y \"%.1e\"\n"
                                "unset grid\n"
                                +ls+
                                "plot for [x=2:%5] \"%6\" u 1:x with lines ls x-1\n").

                    arg(gArgs().fileInfo("out").baseName()).
                    arg(gArgs().getArgs("plot_ext").toString()).
                    arg(gArgs().getArgs("plot_ext").toString()).
                    arg(gArgs().fileInfo("out").baseName().replace('_',' ')).
                    arg(total_plots+1).
                    arg(gArgs().getArgs("out").toString());

            outFile.setFileName(gArgs().fileInfo("out").path()+"/"+gArgs().fileInfo("out").baseName()+".plt");
            outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
            outFile.write(plt.toAscii());
            outFile.close();

            QProcess myProcess;
            myProcess.start(gArgs().getArgs("gnuplot").toString()+" "+gArgs().fileInfo("out").path()+"/"+gArgs().fileInfo("out").baseName()+".plt");
            myProcess.waitForFinished(1000*120);
        }

        //Output raw data
        if(1==blocks && raw_data) {
            QList<QString> keys=storage_wilconxon.keys();
            int files=keys.size();
            for(int i=0; i<files;i++) {

                outFile.setFileName(gArgs().fileInfo("out").path()+"/"+keys[i].replace(" ","_")+".raw_data");
                outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

                for(int j=0; j<storage_wilconxon[keys[i]].size();j++) {
                    double cur_sum=0.0;
                    for(int sum=(left_right[0]-200);sum<(left_right[1]+200); sum++) {
                        cur_sum+=storage_wilconxon[keys[i]][j].at(sum);
                    }
                outFile.write(QString("%1\n").arg(cur_sum/wilconxon_norm[keys[i]]).toAscii());
                }
                outFile.close();
            }
        }

        emit finished();
    }
    catch(char*str)
    {
        cerr<<"Catch an error:"<<str<<endl;
    }
    catch(...)
    {
    }
}

AverageDensity::~AverageDensity()
{
}



//        QSvgGenerator generator;
//        generator.setFileName(gArgs().fileInfo("out").baseName()+".svg");
//        generator.setSize(QSize(200, 200));
//        generator.setViewBox(QRect(0, 0, 200, 200));
//        generator.setTitle(tr("SVG Generator Example Drawing"));
//        generator.setDescription(tr("An SVG drawing created by the SVG Generator "
//            "Example provided with Qt."));
//        QPainter painter;
//        painter.begin(&generator);
//        painter.fillRect(QRect(0, 0, 200, 200), Qt::gray);
//        painter.setPen(QPen(Qt::white, 4, Qt::DashLine));
//        painter.drawLine(QLine(0, 35, 200, 35));
//        painter.drawLine(QLine(0, 165, 200, 165));
//        painter.end();
//return;
