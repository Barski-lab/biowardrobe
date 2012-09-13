

#include "averagedensity.hpp"


AverageDensity::AverageDensity(QObject* parent):
QThread(parent)
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

void AverageDensity::run()
{
    QSqlQuery q;
    QFile batchFile;

    batchFile.setFileName(gArgs().getArgs("batch").toString());
    batchFile.open(QIODevice::ReadOnly| QIODevice::Text);

    int total_plots=0;

////--------------------------------------------------------------------------------------------------------------------
    try{
        sam_reader_thread *srt1;
        srt1=new sam_reader_thread(&sam_data);
        srt1->start();

        QMap<QString,QList<double> > storage;
        QList<double> smooth_data;

        QTextStream in(&batchFile);
        while (!in.atEnd()) 
        {
            QString fName,Q1;//,Q2;
            gen_lines     sql_data;    
            HandledData avd_data;
            total_plots++;

            fName = in.readLine();
            if(fName.isEmpty() || fName.isNull()) break;
            Q1 = in.readLine();
            qDebug()<<"processed:"<<fName;

            if(!q.exec(Q1))
            {
                qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text());
            }
            while (q.next()) 
            {

                sql_data.setGene(q.value(3).toString().at(0),q.value(0).toString(),q.value(1).toInt(),1, 1 );
                sql_data.total++;
            } 

            if(srt1->isRunning())
            {
                qDebug()<<fName<<": waiting";
                srt1->wait();
            }

            s3  =new AVD_Handler(&sql_data,&sam_data,avd_data);
            s3->AVD2();

            for(quint32 w=0; w< avd_data.width; w++)
                storage[fName]<<avd_data.data[0][w];
            smooth_data=smooth<double>(storage[fName],gArgs().getArgs("avd_smooth").toInt());
            storage[fName]=smooth_data;
            delete s3;
        }
        delete srt1;
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

        QFile _outFile;
        _outFile.setFileName(gArgs().getArgs("out").toString());
        _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        _outFile.write(out.toAscii());
        _outFile.close();

        if(!gArgs().getArgs("plot_ext").toString().isEmpty())
        {
            QString plt=QString("set output '%1."+gArgs().getArgs("plot_ext").toString()+"' \n"
                "set terminal "+gArgs().getArgs("plot_ext").toString()+" enhanced size 1920,1080 \n"
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
                "set title \"%2\"\n"
                "set format y \"%.1e\"\n"
                "set grid\n"
                "plot \\\n").arg(gArgs().fileInfo("out").baseName()).arg(gArgs().fileInfo("out").baseName());
            QString _plots=QString("\"%1\" u 1:2 with lines").arg(gArgs().getArgs("out").toString());
            for(int i=1;i<total_plots;i++)
                _plots+=QString(", \\\n\"%1\" u 1:%2 with lines").arg(gArgs().getArgs("out").toString()).arg(i+2);
            _outFile.setFileName(gArgs().fileInfo("out").baseName()+".plt");
            _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
            _outFile.write(plt.toAscii());
            _outFile.write(_plots.toAscii());
            _outFile.close();

            QProcess myProcess;
            myProcess.start(gArgs().getArgs("gnuplot").toString()+" "+gArgs().fileInfo("out").baseName()+".plt");
            myProcess.waitForFinished(1000*120);
        }
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
