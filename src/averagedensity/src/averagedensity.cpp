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
void getReadsAtPointS(genome::cover_map::iterator i,genome::cover_map::iterator e, quint64 const& start,quint64 const& end,bool reverse, int shift,T& result,bool pair) {

    qint64 length=end-start+1;
    qint64 position=0;

    if(!pair) {
        if(!reverse) {
            /*if iterator points not to the begining of the segment shift to the start position*/
            while(i!=e && (qint64)(i.value()[0].getStart()-start+shift)<0) i++;
            while(i!=e && (position=i.value()[0].getStart()-start+shift) < length) {
                genome::Cover::countReads<double>(i.value(),result[position]);
                ++i;
            }
        } else {
            while(i!=e && (qint64)(i.value()[0].getStart()-start+shift)<0) i++;
            while(i!=e && (position=i.value()[0].getStart()-start+shift) < length) {
                genome::Cover::countReads<double>(i.value(),result[length-position-1]);
                ++i;
            }
        }
    } else {
        int sign=1;
        if(shift<0) sign=-1;
        if(!reverse) {
            while(i!=e ) {
                int position=0;
                for(int c=0;c<i.value().size();c++) {//thru different reads at the same position
                    position=i.value()[c].getStart()+i.value()[c].getLength()/sign*2-start;
                    if(position<0) continue;
                    if(position<length)
                        result[position]+=i.value()[c].getLevel();
                }
                if(position>=length)
                    break;
                ++i;
            }
        } else {
            while(i!=e ) {
                int position=0;
                for(int c=0;c<i.value().size();c++) {//thru different reads at the same position
                    position=i.value()[c].getStart()+i.value()[c].getLength()/sign*2-start;
                    if(position<0) continue;
                    if(position<length)
                        result[length-position-1]+=i.value()[c].getLevel();
                }
                if(position>=length)
                    break;
                ++i;
            }
        }
    }
}


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
                genome::Cover::countReads<double>(i.value(),result[shift+position]);
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
                genome::Cover::countReads<double>(i.value(),result[shift+mapping-position]);
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
template <class T>
void AVDS(quint64 start,quint64 end,QString chrome,bool reverse,int shift, gen_lines* input,T& result,bool pair)
{

    if(!input->getLineCover(chrome+QChar('+')).isEmpty()){
        getReadsAtPointS<T>(input->getLineCover(chrome+QChar('+')).getLowerBound(start-shift)
                            ,input->getLineCover(chrome+QChar('+')).getEndIterator()
                            ,start,end,reverse,shift,result,pair);
    }
    if(!input->getLineCover(chrome+QChar('-')).isEmpty()){
        getReadsAtPointS<T>(input->getLineCover(chrome+QChar('-')).getLowerBound(start-shift)
                            ,input->getLineCover(chrome+QChar('-')).getEndIterator()
                            ,start,end,reverse,-shift,result,pair);
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

void AverageDensity::start() {
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

/*
QString get_expression(int f){
    switch (f) {
        case 1:
        return QString("=");
        case 2:
        return QString("<");
        case 3:
        return QString(">");
        case 4:
        return QString("<=");
        case 5:
        return QString(">=");
    }
    return QString("<>");
}
QString get_operand(int o){
    if(o==2)
        return QString(" OR ");
    return QString(" AND ");
}
QString get_condition(int id,QString rpkm) {

    QSqlQuery q;
    q.prepare("select operand,tbl,field,filter,value from `filter` where fhead_id=?;");
    q.bindValue(0, id);
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        return "";
    }

    QString filter=" ";

    while(q.next()) {
        switch(q.value(2).toInt()) {//field
            case 1: //RPKM
                filter+=" "+get_operand(q.value(0).toInt())+" "+rpkm+get_expression(q.value(3).toInt())+q.value(4).toString()+" ";
            break;
            case 2: //Chrom
                //TODO: potential SQL injection
                filter+=" "+get_operand(q.value(0).toInt())+" a0.chrom like '"+q.value(4).toString()+"' ";
            break;
        }
    }
    return filter;
}
*/

void AverageDensity::batchsql() {
    int avd_lid=gArgs().getArgs("avd_lid").toInt();
    QString avd_id=gArgs().getArgs("avd_id").toString();
    int avd_window=gArgs().getArgs("avd_window").toInt();

    QString avd_table_name=gArgs().getArgs("sql_table").toString();

    if(avd_id.length()>0) {
        avd_table_name=avd_id;
        avd_table_name=avd_table_name.replace("-","");
    }

    if(avd_lid>0 && avd_id.length()>0) {
        qDebug()<<"Error _pid and _lid can not be greater then 0 together.";
        return;
    }

    QThreadPool *t_pool=QThreadPool::globalInstance();


    if(avd_lid>0) {

        q.prepare("select e.etype,l.name4browser,g.db,filename,g.annottable,l.fragmentsize "
                  "from ems.labdata l,ems.experimenttype e,ems.genome g "
                  "where e.id=experimenttype_id and g.id=l.genome_id and l.id=?");
        q.bindValue(0, avd_lid);
        if(!q.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }

        int fieldDb = q.record().indexOf("db");
        int fieldFilename = q.record().indexOf("filename");
        int fieldEtype = q.record().indexOf("etype");
        int fieldGBname = q.record().indexOf("name4browser");
        int fieldAtable = q.record().indexOf("annottable");
        int fieldFsize = q.record().indexOf("fragmentsize");

        if(!q.next()) {
            qDebug()<<"No records";
            return;
        }

        QString DB =q.value(fieldDb).toString();
        QString filename=q.value(fieldFilename).toString();
        if(filename.contains(';'))
            filename=filename.split(';').at(0);
        QString EType =q.value(fieldEtype).toString();
        QString GBName =q.value(fieldGBname).toString();
        QString annottable =q.value(fieldAtable).toString();
        int fragmentsize =q.value(fieldFsize).toInt();
        bool pair=(EType.indexOf("pair")!=-1);

        sam_data.append(new gen_lines());
        t_queue.append(new sam_reader_thread(sam_data.last(),filename+".bam"));
        t_pool->start(t_queue.last());

        if(t_pool->activeThreadCount()!=0) {
            qDebug()<<"waiting threads";
            t_pool->waitForDone();
        }

        QString avd_window_str=QString("%1").arg(avd_window);
        if(!q.exec("select chrom,strand,txStart-"+avd_window_str+" as start,txStart+"+avd_window_str+" as end from "
                   ""+DB+"."+annottable+" where strand = '+' and chrom not like '%\\_%' and chrom like 'chr%' union "
                   "select chrom,strand,txEnd-"+avd_window_str+" as start,txEnd+"+avd_window_str+" as end from "
                   ""+DB+"."+annottable+" where strand = '-' and chrom not like '%\\_%' and chrom like 'chr%'"
                   )) {
            qDebug()<<"Query error annot: "<<q.lastError().text();
            return;
        }

        int fieldChrom = q.record().indexOf("chrom");
        int fieldStrand = q.record().indexOf("strand");
        int fieldStart= q.record().indexOf("start");
        int fieldEnd= q.record().indexOf("end");
        int length=avd_window*2+1;

        QVector<double> avd_raw_data(length+1,0);

        while(q.next()) {
            bool strand=(q.value(fieldStrand).toString().at(0)==QChar('-'));
            int Start=q.value(fieldStart).toInt();
            int End=q.value(fieldEnd).toInt();
            QString Chrom=q.value(fieldChrom).toString();

            if(gArgs().getArgs("sam_ignorechr").toString().contains(Chrom)) {
                continue;
            }
            AVDS<QVector<double> >(Start/*start*/,End/*end*/,Chrom/*chrom*/,
                                   strand/*bool strand*/,fragmentsize/2/*shift*/,sam_data.at(0),avd_raw_data,pair);
        }

        QList<double>  storage;
        int total=sam_data.at(0)->total-sam_data.at(0)->notAligned;
        for(int w=0; w< length; w++)
            storage<<(avd_raw_data[w]/total)/q.size();
        storage=smooth<double>(storage,gArgs().getArgs("avd_smooth").toInt());

        QString CREATE_TABLE=QString("DROP TABLE IF EXISTS experiments.%1_atp;"
                                     "CREATE TABLE experiments.%2_atp ( "
                                     "`X` INT NULL ,"
                                     "`Y` FLOAT NULL ,"
                                     "INDEX X_idx (X) using btree"
                                     ")"
                                     "ENGINE = MyISAM "
                                     "COMMENT = 'created by averagedensity';").
                             arg(filename).
                             arg(filename);

        if(!q.exec(CREATE_TABLE)) {
            qDebug()<<"Query error T: "<<q.lastError().text();
        }

        QString SQL_QUERY_BASE=QString("insert into experiments.%1_atp values ").
                               arg(filename);
        QString SQL_QUERY="";

        int rows=storage.size();
        for(int i=0; i<rows;i++) {

            SQL_QUERY+=QString(" (%1,%2),").
                       arg((int)(i-rows/2)).
                       arg(storage.at(i));
        }

        SQL_QUERY.chop(1);
        if(!q.exec(SQL_QUERY_BASE+SQL_QUERY+";")) {
            qDebug()<<"Query error batch up: "<<q.lastError().text();
        }

    }
    //************************************************************************************
    //************************************************************************************
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
        QList<QList<double> > storages;

        QSqlQuery qq;
        qq.prepare("select tbl1_id,tableName,name from ems.atdp a, ems.genelist gl where a.tbl2_id=gl.id and a.genelist_id like ? order by a.tbl1_id,a.tbl2_id;");
        qq.bindValue(0, avd_id);
        if(!qq.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }
        int nplot=0;
        while(qq.next()) {
            QString cur_tbl = qq.value(0).toString();
            QString sel_table = "experiments."+qq.value(1).toString();
            //QString plt_name=qq.value(2).toString();

            QString sql_queryp="select chrom,strand,txStart-"+avd_window_str+" as start,txStart+"+avd_window_str+" as end from "
                               ""+sel_table+" where strand = '+' ";
            QString sql_querym="select chrom,strand,txEnd-"+avd_window_str+" as start,txEnd+"+avd_window_str+" as end from "
                               ""+sel_table+" where strand = '-' ";

            QString sql_query=sql_queryp+" union "+sql_querym;

            if(!q.exec(sql_query)) {
                qDebug()<<"Query error "<<sel_table<<": "<<q.lastError().text();
                qDebug()<<"SQL "<<sql_query;
                return;
            }

            int fieldChrom = q.record().indexOf("chrom");
            int fieldStrand = q.record().indexOf("strand");
            int fieldStart= q.record().indexOf("start");
            int fieldEnd= q.record().indexOf("end");
            int length=avd_window*2+1;

            QVector<double> avd_raw_data(length+1,0);

            while(q.next()) {
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
            }

            QList<double>  storage;
            int total=table_to_data[cur_tbl].sam_data->total-table_to_data[cur_tbl].sam_data->notAligned;
            for(int w=0; w< length; w++)
                storage<<(avd_raw_data[w]/total)/q.size();
            storage=smooth<double>(storage,gArgs().getArgs("avd_smooth").toInt());
            storages.append(storage);
            nplot++;
        }//qq.next

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
    }//aid>0
}

void AverageDensity::batchfile() {
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
