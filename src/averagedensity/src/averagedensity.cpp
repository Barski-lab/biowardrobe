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


AverageDensity::AverageDensity(QObject* parent):
QObject(parent)
{
}

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

    QThreadPool *t_pool=QThreadPool::globalInstance();

    try{
        /*Reading bam file in thread
         *TODO: incorrect working with QThread
         *multi bam reader*/
        QFile batchBamFiles;
        batchBamFiles.setFileName(gArgs().getArgs("in").toString());
        batchBamFiles.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream inFiles(&batchBamFiles);
        while(!inFiles.atEnd())
        {
            QString label = inFiles.readLine();
            if(label.isEmpty() || label.isNull()) break;
            if(label.at(0)==QChar('#')) continue;
            QString line = inFiles.readLine();
            if(line.isEmpty() || line.isNull() || line.at(0)==QChar('#')) throw "Error in batch with files";
            fileLabels.append(label);
            sam_data.append(new gen_lines());
            t_queue.append(new sam_reader_thread(sam_data.last(),line));
            t_pool->start(t_queue.last());
        }
        batchBamFiles.close();

        QMap<QString,QList<double> > storage;
        QList<double> smooth_data;

        /* SQL Query batch file format:
         * - first line - grapht title
         * - second line - sql query */
        QFile batchFile;
        batchFile.setFileName(gArgs().getArgs("batch").toString());
        batchFile.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream in(&batchFile);
        while (!in.atEnd())
        {
            QString plotName,Q1;//,Q2;
            gen_lines   sql_data;
            HandledData avd_data;

            plotName = in.readLine();
            if(plotName.isEmpty() || plotName.isNull()) break;
            Q1 = in.readLine();
            qDebug()<<"processed:"<<plotName;

            if(!q.exec(Q1))
            {
                qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
            }
            while (q.next())
            {

                sql_data.setGene(q.value(3).toString().at(0),q.value(0).toString(),q.value(1).toInt(),1, 1 );
                sql_data.total++;
            }

            if(t_pool->activeThreadCount()!=0)
            {
                qDebug()<<plotName<<": waiting";
                t_pool->waitForDone();
            }

            for(int i=0;i<fileLabels.size();i++)
            {
                total_plots++;

                s3  =new AVD_Handler(&sql_data,sam_data.at(i),avd_data);
                s3->AVD2();

                QString plt_name=fileLabels.at(i)+" "+plotName;
                for(quint32 w=0; w< avd_data.width; w++)
                    storage[plt_name]<<avd_data.data[0][w];
                smooth_data=smooth<double>(storage[plt_name],gArgs().getArgs("avd_smooth").toInt());
                storage[plt_name]=smooth_data;
                delete s3;
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
            out+=QString("%1").arg(i-rows/2);
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
            QString plt=QString("set output '%1.%2' \n"
                "set terminal %3 enhanced size 1920,1080 \n"
                "set datafile separator ','\n"
                "set autoscale\n"
                "unset log\n"
                "unset label\n"
                "set xtic auto\n"
                "set ytic auto\n"
                "set key autotitle columnhead\n"
                "set xlabel \"2000bp flanking TSS\"\n"
                "set ylabel \"Tag density\"\n"
                "set style fill transparent\n"
                "set title \"%4\"\n"
                "set format y \"%.1e\"\n"
                "set grid\n"
                "plot \\\n").
                    arg(gArgs().fileInfo("out").baseName()).
                    arg(gArgs().getArgs("plot_ext").toString()).
                    arg(gArgs().getArgs("plot_ext").toString()).
                    arg(gArgs().fileInfo("out").baseName().replace('_',' '));

            QString _plots=QString("\"%1\" u 1:2 with lines").arg(gArgs().getArgs("out").toString());
            for(int i=1;i<total_plots;i++)
                _plots+=QString(", \\\n\"%1\" u 1:%2 with lines").arg(gArgs().getArgs("out").toString()).arg(i+2);
            outFile.setFileName(gArgs().fileInfo("out").baseName()+".plt");
            outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
            outFile.write(plt.toAscii());
            outFile.write(_plots.toAscii());
            outFile.close();

            QProcess myProcess;
            myProcess.start(gArgs().getArgs("gnuplot").toString()+" "+gArgs().fileInfo("out").baseName()+".plt");
            myProcess.waitForFinished(1000*120);
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
