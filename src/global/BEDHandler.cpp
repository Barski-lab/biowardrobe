/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the global module of the genome-tools.
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


//-------------------------------------------------------------
//-------------------------------------------------------------
template <class Storage,class Result>
BEDHandler<Storage,Result>::~BEDHandler()
{
    if(!create_file)
    {
        _outFile.close();
    }
}
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class Storage,class Result>
BEDHandler<Storage,Result>::BEDHandler(Storage& sam,Result &_output):
    sam_input(&sam),
    output(&_output)
{
    create_file=gArgs().getArgs("no-bed-file").toBool();
    if(!create_file)
    {
        _outFile.setFileName(gArgs().fileInfo("out").baseName()+".bed");
        _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        if(gArgs().getArgs("bed_HeaderString").toString().contains('%'))
        {
            _outFile.write((gArgs().getArgs("bed_HeaderString").toString().arg(_outFile.fileName())+"\n").toLocal8Bit());
            _outFile.flush();
        }
        else
        {
            _outFile.write((gArgs().getArgs("bed_HeaderString").toString()+"\n").toLocal8Bit());
            _outFile.flush();
        }
    }
#ifdef _SQL_
    //QStringList  tbls=QSqlDatabase::database().tables();
    no_sql_upload=gArgs().getArgs("no-sql-upload").toBool();
    if(no_sql_upload) return;

    if(!q.exec("DROP TABLE IF EXISTS "+gArgs().getArgs("sql_table").toString()+";"))
    {
        qWarning()<<qPrintable("Select query error. "+q.lastError().text());
    }

    QString tbl;
    QString sql;
    tbl=gArgs().getArgs("sql_table").toString();
    tbl.replace('_'," ");

    switch(gArgs().getArgs("bed_format").toInt())
    {
    case 4:
        if(!q.exec("CREATE TABLE "+gArgs().getArgs("sql_table").toString()+
                   "( "
                   "bin smallint(5) unsigned NOT NULL, "
                   "chrom varchar(255) NOT NULL, "
                   "chromStart int(10) unsigned NOT NULL, "
                   "chromEnd int(10) unsigned NOT NULL, "
                   "name varchar(255) NOT NULL "
                   ") ENGINE=MyISAM DEFAULT CHARSET=utf8"))
        {
            qWarning()<<qPrintable("Create table error. "+q.lastError().text());
            exit(-1);
        }
        sql=QString("insert ignore into trackDb_local(tablename,shortLabel,type,longLabel,visibility,priority,"
                    "colorR,colorG,colorB,"
                    "altColorR,altColorG,altColorB,useScore,private,restrictCount,restrictList,url,html,grp,canPack,settings)"
                    "values('%1','%2','bedGraph 4','%3',0,10,"
                    "255,0,0,"
                    "0,0,255,0,0,0,'','','','%4',0,'autoScale on\nwindowingFunction maximum')").
                arg(gArgs().getArgs("sql_table").toString()).
                arg(tbl).arg(tbl).
                arg(gArgs().getArgs("sql_grp").toString());
        if(!q.exec(sql))
        {
            qWarning()<<qPrintable("Select query error. "+q.lastError().text());
        }
        sql_prep="START TRANSACTION; INSERT INTO "+gArgs().getArgs("sql_table").toString()+" (bin,chrom,chromStart,chromEnd,name) VALUES";
        break;
    case 8:
        if(!q.exec("CREATE TABLE "+gArgs().getArgs("sql_table").toString()+
                   "( "
                   "bin smallint(5) unsigned NOT NULL,"
                   "chrom varchar(255) NOT NULL,"
                   "chromStart int(10) unsigned NOT NULL,"
                   "chromEnd int(10) unsigned NOT NULL,"
                   "name varchar(255) NOT NULL,"
                   "score int(5) not null,"
                   "strand char not null"
                   ") ENGINE=MyISAM DEFAULT CHARSET=utf8"))
        {
            qWarning()<<qPrintable("Select query error. "+q.lastError().text());
        }
        sql=QString("insert ignore into trackDb_local(tablename,shortLabel,type,longLabel,visibility,priority,"
                    "colorR,colorG,colorB,"
                    "altColorR,altColorG,altColorB,useScore,private,restrictCount,restrictList,url,html,grp,canPack,settings)"
                    "values('%1','%2','PbedGraph 4','%3',0,10,"
                    "255,0,0,"
                    "0,0,255,0,0,0,'','','','%4',0,'autoScale on\nwindowingFunction maximum')").
                arg(gArgs().getArgs("sql_table").toString()).
                arg(tbl).arg(tbl).
                arg(gArgs().getArgs("sql_grp").toString());
        if(!q.exec(sql))
        {
            qWarning()<<qPrintable("Select query error. "+q.lastError().text());
        }
        sql_prep="START TRANSACTION; INSERT INTO "+gArgs().getArgs("sql_table").toString()+" (bin,chrom,chromStart,chromEnd,name,score,strand) VALUES";
        break;
    }
#endif
}

//-------------------------------------------------------------
//-------------------------------------------------------------
template <class Storage,class Result>
void BEDHandler<Storage,Result>::Load()
{
    quint32 window=gArgs().getArgs("bed_window").toUInt();
    quint32 w_h=window;
    if(window<=0)
    { w_h=1; window=0; }
    quint32 shift= gArgs().getArgs("bed_siteshift").toUInt();


    foreach(QString chrome,sam_input->getLines())
    {
        if(chrome.endsWith("-")) continue;
        chrome.chop(1);
        //+ strand
        QMap <int,int> bed;
        QVector<quint64> cover;
        cover.resize(sam_input->getLength('+',chrome)+1);

        {
            genome::cover_map::iterator i=sam_input->getLineCover(chrome+QChar('+')).getBeginIterator();
            genome::cover_map::iterator e=sam_input->getLineCover(chrome+QChar('+')).getEndIterator();

            if(gArgs().getArgs("bed_type").toInt()==0)
            {
                while(i!=e)
                {
                    int val=i.key()+shift;
                    for(int c=0;c<i.value().size();c++)
                    {
                        bed[val-val%w_h]+=i.value()[c].getLevel();
                    }
                    ++i;
                }
            }
            else if(gArgs().getArgs("bed_type").toInt()==1)
            {
                while(i!=e)
                {
                    for(int c=0;c<i.value().size();c++)
                    {
                        int val=i.key()+i.value()[c].getLength()/2+shift;
                        bed[val-val%w_h]+=i.value()[c].getLevel();
                    }
                    ++i;
                }
            }
            else if(gArgs().getArgs("bed_type").toInt()==2)
            {
                qDebug()<<"begin type 2 cycles+"<<chrome;
                for(;i!=e;i++)//thru start positions
                    for(int c=0;c<i.value().size();c++)//thru different reads at the same position
                    {
                        genome::read_representation::const_iterator it=i.value()[c].getInterval().begin();
                        for(;it!=i.value()[c].getInterval().end();it++)
                        {
                            genome::read_representation::interval_type itv  = bicl::key_value<genome::read_representation>(it);
                            for(quint64 l=itv.lower(); l<=itv.upper(); l++)
                                cover[l]+=(*it).second;
                        }
                    }
                qDebug()<<"finish type 2 cycles+"<<chrome;
            }
        }

        /* if bed format not eq to 4 then output data for strand + */
        if(gArgs().getArgs("bed_format").toInt()!=4)
        {
            //-----------------------------------------------------------------------------------
            QString appe;
            QMap<int,int>::iterator i = bed.begin();
            for(;i!=bed.end();i++)
            {
                if(!create_file)
                {
                    _outFile.write(QString(chrome+"\t%1\t%2\t%3\t0\t+\n").arg(i.key()).arg(i.key()+window).arg(i.value()).toLocal8Bit());
                }
                if(!no_sql_upload)
                    appe+=QString(" (0,'%1',%2,%3,%4,0,'%5'),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value()).arg("+");
            }
            //-----------------------------------------------------------------------------------
#ifdef _SQL_
            if(!no_sql_upload)
            {
                appe.chop(1);
                if(!q.exec(sql_prep+appe+"; COMMIT;"))
                {
                    qWarning()<<qPrintable("Select query error. "+q.lastError().text());
                }
            }
#endif
            bed.clear();
        }


        //- strand
        {
            genome::cover_map::iterator i=sam_input->getLineCover(chrome+QChar('-')).getBeginIterator();
            genome::cover_map::iterator e=sam_input->getLineCover(chrome+QChar('-')).getEndIterator();

            if(gArgs().getArgs("bed_type").toInt()==0)
            {
                while(i!=e)
                {
                    int val=i.key()-shift;
                    if(val<0) val=0;
                    for(int c=0;c<i.value().size();c++)
                    {
                        bed[val-val%w_h]+=i.value()[c].getLevel();
                    }
                    ++i;
                }
            }
            else if(gArgs().getArgs("bed_type").toInt()==1)
            {
                while(i!=e)
                {
                    for(int c=0;c<i.value().size();c++)
                    {
                        int val=i.key()+i.value()[c].getLength()/2-shift;
                        if(val<0) val=0;
                        bed[val-val%w_h]+=i.value()[c].getLevel();
                    }
                    ++i;
                }
            }
            else if(gArgs().getArgs("bed_type").toInt()==2)
            {
                qDebug()<<"begin type 2 cycles+"<<chrome;
                for(;i!=e;i++)//thru start positions
                    for(int c=0;c<i.value().size();c++)//thru different reads at the same position
                    {
                        genome::read_representation::const_iterator it=i.value()[c].getInterval().begin();
                        for(;it!=i.value()[c].getInterval().end();it++)
                        {
                            genome::read_representation::interval_type itv  = bicl::key_value<genome::read_representation>(it);
                            for(quint64 l=itv.lower(); l<=itv.upper(); l++)
                                cover[l]+=(*it).second;
                        }
                    }
                qDebug()<<"finish type 2 cycles+"<<chrome;
            }
        }//-strand



        //Output collected data
        QMap<int,int>::iterator i = bed.begin();


        /* if bed format not eq to 4 then output data for strand - */
        if(gArgs().getArgs("bed_format").toInt()!=4)
        {
            QString appe;
            for(;i!=bed.end();i++)
            {
                if(!create_file)
                {
                    _outFile.write(QString(chrome+"\t%1\t%2\t-%3\t0\t-\n").arg(i.key()).arg(i.key()+window).arg(i.value()).toLocal8Bit());
                }
                if(!no_sql_upload)
                    appe+=QString(" (0,'%1',%2,%3,-%4,0,'%5'),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value()).arg("-");
            }
#ifdef _SQL_
            if(!no_sql_upload)
            {
                appe.chop(1);
                if(!q.exec(sql_prep+appe+"; COMMIT;"))
                {
                    qWarning()<<qPrintable("Select query error. "+q.lastError().text());
                }
            }
#endif
        }
        else
         /* if bed format eq to 4 then output data for both strand */
        {
            QString appe;

            if(gArgs().getArgs("bed_type").toInt()==2)
            {
                for(;it!=read_re.end();it++)
                {
                    genome::read_representation::interval_type itv  = bicl::key_value<genome::read_representation>(it);

                    if(!create_file)
                    {
                        _outFile.write(QString(chrome+"\t%1\t%2\t%3\n").arg(itv.lower()).arg(itv.upper()).arg((*it).second).toLocal8Bit());
                    }
#ifdef _SQL_
                    if(!no_sql_upload)
                        appe+=QString(" (0,'%1',%2,%3,%4),").arg(chrome).arg(itv.lower()).arg(itv.upper()).arg((*it).second);
#endif
                }
#ifdef _SQL_
                if(!no_sql_upload)
                {
                    appe.chop(1);
                    if(!q.exec(sql_prep+appe+"; COMMIT;"))
                    {
                        qWarning()<<qPrintable("Select query error. "+q.lastError().text());
                    }
                }
#endif

            }
            else
            {
                for(;i!=bed.end();i++)
                {
                    if(!create_file)
                    {
                        _outFile.write(QString(chrome+"\t%1\t%2\t%3\n").arg(i.key()).arg(i.key()+window).arg(i.value()).toLocal8Bit());
                    }
#ifdef _SQL_
                    if(!no_sql_upload)
                        appe+=QString(" (0,'%1',%2,%3,%4),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value());
#endif
                }
#ifdef _SQL_
                if(!no_sql_upload)
                {
                    appe.chop(1);
                    if(!q.exec(sql_prep+appe+"; COMMIT;"))
                    {
                        qWarning()<<qPrintable("Select query error. "+q.lastError().text());
                    }
                }
#endif
            }//bed_type
        }

    }

    if(!create_file)
    {
        _outFile.flush();
    }
}//end of function

//-------------------------------------------------------------
//-------------------------------------------------------------
