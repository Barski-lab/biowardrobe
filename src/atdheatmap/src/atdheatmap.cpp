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

#include "atdheatmap.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
ATDHeatmap::ATDHeatmap(QObject* parent):
    AverageDensity(parent)
{
}


void ATDHeatmap::batchsql() {
    int avd_lid=gArgs().getArgs("avd_lid").toInt();
    QString avd_id=gArgs().getArgs("avd_id").toString();
    int avd_window=gArgs().getArgs("avd_window").toInt();

    //QString avd_table_name=gArgs().getArgs("sql_table").toString();

//    if(avd_id.length()>0) {
//        avd_table_name=avd_id;
//        avd_table_name=avd_table_name.replace("-","");
//    }

    if(avd_lid>0 && avd_id.length()>0) {
        qDebug()<<"Either _pid or _lid can be greater then 0.";
        return;
    }

    QThreadPool *t_pool=QThreadPool::globalInstance();

    /*
     * Average Tag Density by genelist ID (future result id)
     *
     */

    if(avd_id.length()>0) {
        QMap<QString,DNA_SEQ_DATA> table_to_data;
        QString BASE_DIR="/data/DATA/FASTQ-DATA";

        q.prepare("select distinct e.etype,l.name4browser,g.db,filename,l.fragmentsize,UPPER(w.worker) as worker,a.tbl1_id "
                  "from ems.labdata l,ems.experimenttype e,ems.genome g, ems.worker w , ems.atdp a,ems.genelist ge "
                  "where e.id=experimenttype_id and g.id=l.genome_id and l.worker_id=w.id and "
                  "l.id=ge.labdata_id and a.tbl1_id=ge.id and a.genelist_id like ?;");
        q.bindValue(0, avd_id);

        if(!q.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }

        int fieldFilename = q.record().indexOf("filename");
        int fieldEtype = q.record().indexOf("etype");
        int fieldWorker = q.record().indexOf("worker");
        int fieldFsize = q.record().indexOf("fragmentsize");
        int fieldTbl = q.record().indexOf("tbl1_id");


        while(q.next()) {
            QString filename=q.value(fieldFilename).toString();
            if(filename.contains(';'))
                filename=filename.split(';').at(0);
            QString EType =q.value(fieldEtype).toString();
            QString worker=q.value(fieldWorker).toString();
            int fragmentsize =q.value(fieldFsize).toInt();
            QString TBL = q.value(fieldTbl).toString();
            bool pair=(EType.indexOf("pair")!=-1);

            QString path=BASE_DIR+"/"+worker+"/"+EType.left(3)+"/";

            DNA_SEQ_DATA dsd;
            dsd.fragmentsize=fragmentsize;
            dsd.pair=pair;
            dsd.sam_data=new gen_lines();
            table_to_data[TBL]=dsd;
            t_queue.append(new sam_reader_thread(table_to_data[TBL].sam_data,path+filename+".bam"));
            t_pool->start(t_queue.last());
        }

        if(table_to_data.size()==0) {
            qDebug()<<"No records";
            return;
        }


        if(t_pool->activeThreadCount()!=0) {
            qDebug()<<"waiting threads";
            t_pool->waitForDone();
        }

        QString avd_window_str=QString("%1").arg(avd_window);

        /* differencese start here
         */

        //QList<QList<double> > storages;

        QSqlQuery qq;
        qq.prepare("select tbl1_id,tableName,name from ems.atdp a, ems.genelist gl where a.tbl2_id=gl.id and a.genelist_id like ? order by a.tbl1_id,a.tbl2_id;");
        qq.bindValue(0, avd_id);
        if(!qq.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }
        int nplot=0;
        QMap<QString,QMap<int,QVector<double> > > storage_heatmap;

        while(qq.next()) {//loop trough all plots and corresponding gene lists
            QString cur_tbl = qq.value(0).toString();
            QString plt_name = qq.value(2).toString();
            QString sel_table = "experiments."+qq.value(1).toString();

            QString sql_queryp="select chrom,strand,txStart-"+avd_window_str+" as start,txStart+"+avd_window_str+" as end from "
                    ""+sel_table+" where strand = '+' ";
            QString sql_querym="select chrom,strand,txEnd-"+avd_window_str+" as start,txEnd+"+avd_window_str+" as end from "
                    ""+sel_table+" where strand = '-' ";

            QString sql_query=sql_queryp+" union "+sql_querym;

            if(!q.exec(sql_query)) {//takes gene lists coordinates into q
                qDebug()<<"Query error "<<sel_table<<": "<<q.lastError().text();
                qDebug()<<"SQL "<<sql_query;
                return;
            }

            int fieldChrom = q.record().indexOf("chrom");
            int fieldStrand = q.record().indexOf("strand");
            int fieldStart= q.record().indexOf("start");
            int fieldEnd= q.record().indexOf("end");
            int length=avd_window*2+1;
            int WIN_SIZE=200;
            int heatmap_length=length/WIN_SIZE +1;
            //int records = q.size();

            int gcount=0;
            while(q.next()) { //loop trough all genes for the current plot
                QVector<double> avd_raw_data(length+1,0);

                bool strand=(q.value(fieldStrand).toString().at(0)==QChar('-'));
                int Start=q.value(fieldStart).toInt();
                int End=q.value(fieldEnd).toInt();
                QString Chrom=q.value(fieldChrom).toString();

                if(gArgs().getArgs("sam_ignorechr").toString().contains(Chrom)) {
                    continue;
                }
                AVDS<QVector<double> >(Start/*start*/,End/*end*/,Chrom/*chrom*/,
                                       strand/*bool strand*/,table_to_data[cur_tbl].fragmentsize/2/*shift*/,
                                       table_to_data[cur_tbl].sam_data,avd_raw_data,table_to_data[cur_tbl].pair);

                storage_heatmap[plt_name][gcount].fill(0.0,heatmap_length+1);
                int sum=0;
                for(int j=0; j< length;j++) {
                    sum+=avd_raw_data[j];

                    if((j%WIN_SIZE)==0 && j>0) {
                        storage_heatmap[plt_name][gcount][j/WIN_SIZE -1]=sum;
                        sum=0;
                    }
                }
                gcount++;
            }

            //            QList<double>  storage;
            //            int total=table_to_data[cur_tbl].sam_data->total-table_to_data[cur_tbl].sam_data->notAligned;
            //            for(int w=0; w< length; w++)//normalization step
            //                storage<<(avd_raw_data[w]/total)/records;
            //            storage=smooth<double>(storage,gArgs().getArgs("avd_smooth").toInt());
            //storages.append(storage);
            nplot++;
        }//qq.next


            QFile outFile;
            QList<QString> keys=storage_heatmap.keys();
            int files=keys.size();

            for(int i=0; i<files;i++) {
                QString filename=keys[i];

                outFile.setFileName(gArgs().fileInfo("out").path()+"/"+filename.replace(" ","_")+".raw_data");
                outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

                for(int j=0; j<storage_heatmap[keys[i]].size();j++) {
                    QString line="";
                    for(int r=0;r<storage_heatmap[keys[i]][j].size();r++) {
                        line.append(QString("%1 ").arg(storage_heatmap[keys[i]][j].at(r)));
                    }
                    line.chop(1);
                    line+="\n";
                    outFile.write(line.toAscii());
                }
                outFile.close();
            }


        /*
         QString Y="`Y0` FLOAT NULL ,";
        for(int i=1; i<nplot;i++) {
            Y+=QString("`Y%1` FLOAT NULL ,").arg(i);
        }

        QString CREATE_TABLE=QString("DROP TABLE IF EXISTS experiments.%1;"
                                     "CREATE TABLE experiments.%2( "
                                     "`X` INT NULL ,"+Y+
                                     "INDEX X_idx (X) using btree"
                                     ")"
                                     "ENGINE = MyISAM "
                                     "COMMENT = 'created by averagedensity';").
                             arg(avd_table_name).
                             arg(avd_table_name);

        if(!q.exec(CREATE_TABLE)) {
            qDebug()<<"Query error T: "<<q.lastError().text();
        }

        QString SQL_QUERY_BASE=QString("insert into experiments.%1 values ").
                               arg(avd_table_name);
        QString SQL_QUERY="";

        int rows=storages[0].size();
        for(int i=0; i<rows;i++) {
            SQL_QUERY+=QString(" (%1").arg((int)(i-rows/2));
            for(int c=0;c<nplot;c++) {
                if(isnan(storages[c].at(i)) || isinf(storages[c].at(i))) {
                    SQL_QUERY+=QString(",%1").arg(0);
                } else {
                    SQL_QUERY+=QString(",%1").arg(storages[c].at(i));
                }
            }
            SQL_QUERY+=QString("),");
        }

        SQL_QUERY.chop(1);
        if(!q.exec(SQL_QUERY_BASE+SQL_QUERY+";")) {
            qDebug()<<"Query error batch up: "<<q.lastError().text();
            qDebug()<<"Query error batch up: "<<SQL_QUERY_BASE;
        }
        */
    }//aid>0
}

void ATDHeatmap::batchfile() {
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
        //bool isRegion=false;

        batchBamFiles.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream inFiles(&batchBamFiles);
        while(!inFiles.atEnd()) {
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

        if(t_pool->activeThreadCount()!=0) {
            qDebug()<<"waiting threads";
            t_pool->waitForDone();
        }


        QMap<QString,QList<double> > storage;
        QMap<QString,QMap<int,QVector<double> > > storage_wilconxon;
        QMap<QString,int> wilconxon_norm;
        QVector<int> left_right(2,0);
        if(raw_data && !gArgs().getArgs("avd_wilc_region").toString().isEmpty()) {
            QStringList split=gArgs().getArgs("avd_wilc_region").toString().split(":");
            left_right[0]=split[0].toInt();
            left_right[1]=split[1].toInt();
            //isRegion=true;
        }


        /* SQL Query batch file format:
                * - first line - grapht title
                * - second line - sql query */
        QFile batchFile;
        batchFile.setFileName(gArgs().getArgs("batch").toString());
        batchFile.open(QIODevice::ReadOnly| QIODevice::Text);
        QTextStream in(&batchFile);
        int blocks=1;
        QVector<int> orig_length;

        //int ccc=0;

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

                //                //find max
                //                if(1==blocks && raw_data) {
                //                    int pos=0;
                //                    double mx=storage[plt_name].at(qMin(5,storage[plt_name].size()));
                //                    for(int j=5;j<storage[plt_name].size();j++) {
                //                        if(mx<storage[plt_name].at(j)) {
                //                            mx=storage[plt_name].at(j);
                //                            pos=j;
                //                        }
                //                    }
                //                    if(!isRegion) {
                //                        if(ccc==0) {
                //                            ccc=1;
                //                            left_right[0]=pos;
                //                            left_right[1]=pos;
                //                        } else {
                //                            left_right[0]=qMin(pos,left_right[0]);
                //                            left_right[1]=qMax(pos,left_right[1]);
                //                        }
                //                    }
                //                }
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
            if(blocks==1) {
                xlabel=QString("set xlabel \"%1 bp around TSS\"\n").arg(orig_length[0]/2);
                xtics="set xtics rotate by -60 offset -2 (";
                xtics+=QString("\"%1 bp\" %2,").arg(-orig_length[0]/2).arg(-orig_length[0]/2);
                xtics+=QString("\"%1 bp\" %2,").arg(-orig_length[0]/4).arg(-orig_length[0]/4);
                xtics+=QString("\"TSS\" 0,");
                xtics+=QString("\"%1 bp\" %2,").arg(orig_length[0]/4).arg(orig_length[0]/4);
                xtics+=QString("\"%1 bp\" %2)\n").arg(orig_length[0]/2).arg(orig_length[0]/2);
            }

            QString ls;
            for(int i=0;i<total_plots;i++) {
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
            //            if(!isRegion) {
            //                left_right[0]-=300;
            //                left_right[1]+=300;
            //            }

            QList<QString> keys=storage_wilconxon.keys();
            int files=keys.size();
            qDebug()<<"left_right="<<left_right[0]<<" , "<<left_right[1];
            for(int i=0; i<files;i++) {
                QString filename=keys[i];
                qDebug()<<"file:"<<filename<<"normalization "<<wilconxon_norm[keys[i]];

                outFile.setFileName(gArgs().fileInfo("out").path()+"/"+filename.replace(" ","_")+".raw_data");
                outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

                for(int j=0; j<storage_wilconxon[keys[i]].size();j++) {
                    //double cur_sum=0.0;
                    //                    for(int sum=qMax(0,(left_right[0]));sum<qMin((left_right[1]),storage_wilconxon[keys[i]][j].size()); sum++) {
                    //                        cur_sum+=storage_wilconxon[keys[i]][j].at(sum);
                    //                    }
                    QString line="";
                    for(int r=0;r<storage_wilconxon[keys[i]][j].size();r++) {
                        line.append(QString("%1 ").arg(storage_wilconxon[keys[i]][j].at(r)));
                    }
                    line.chop(1);
                    line+="\n";
                    outFile.write(line.toAscii());
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

ATDHeatmap::~ATDHeatmap()
{
}

void ATDHeatmap::start() {
    try{
        batchsql();
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
