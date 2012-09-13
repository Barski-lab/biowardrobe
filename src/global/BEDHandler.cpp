
//#include "BEDHandler.hpp"


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
BEDHandler<Storage,Result>::BEDHandler(Storage& sam,Result &_output,QState * parent):
QState(parent),
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
    QSqlDatabase db=QSqlDatabase::database();
    QSqlQuery q;


    QStringList tbls=db.tables();
    if(!q.exec("DROP TABLE IF EXISTS "+gArgs().getArgs("sql_table").toString()+";"))
    { 
        sqlErr = q.lastError(); 
        qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
    } 

    QString tbl;
    QString sql;
    tbl=gArgs().getArgs("sql_table").toString();
    tbl.replace('_'," ");

    switch(gArgs().getArgs("bed_format").toInt())
    {
    case 4:
        if(!q.exec("CREATE TABLE "+gArgs().getArgs("sql_table").toString()+" \
                                                                           ( \
                                                                           bin smallint(5) unsigned NOT NULL, \
                                                                           chrom varchar(255) NOT NULL, \
                                                                           chromStart int(10) unsigned NOT NULL, \
                                                                           chromEnd int(10) unsigned NOT NULL, \
                                                                           name varchar(255) NOT NULL \
                                                                           ) ENGINE=MyISAM DEFAULT CHARSET=utf8"))
        { 
            sqlErr = q.lastError(); 
            qWarning()<<qPrintable(tr("Create table error. ")+sqlErr.text()); 
	    exit(-1);
        } 
        sql=QString("insert ignore into trackDb(tablename,shortLabel,type,longLabel,visibility,priority,\
                    colorR,colorG,colorB,\
                    altColorR,altColorG,altColorB,useScore,private,restrictCount,restrictList,url,html,grp,canPack,settings)\
                    values('%1','%2','bedGraph 4','%3',0,10,\
                    255,0,0,\
                    0,0,255,0,0,0,'','','','%4',0,'autoScale on\nwindowingFunction maximum')").
                    arg(gArgs().getArgs("sql_table").toString()).
                    arg(tbl).arg(tbl).
                    arg(gArgs().getArgs("sql_grp").toString());
        if(!q.exec(sql))
        { 
            sqlErr = q.lastError(); 
            qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
        } 
        sql_prep="START TRANSACTION; INSERT INTO "+gArgs().getArgs("sql_table").toString()+" (bin,chrom,chromStart,chromEnd,name) VALUES";
        break;
    case 8:
        if(!q.exec("CREATE TABLE "+gArgs().getArgs("sql_table").toString()+" \
                                                                           ( \
                                                                           bin smallint(5) unsigned NOT NULL,\
                                                                           chrom varchar(255) NOT NULL,\
                                                                           chromStart int(10) unsigned NOT NULL,\
                                                                           chromEnd int(10) unsigned NOT NULL,\
                                                                           name varchar(255) NOT NULL,\
                                                                           score int(5) not null,\
                                                                           strand char not null\
                                                                           ) ENGINE=MyISAM DEFAULT CHARSET=utf8"))
        { 
            sqlErr = q.lastError(); 
            qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
        } 
        sql=QString("insert ignore into trackDb(tablename,shortLabel,type,longLabel,visibility,priority,\
                    colorR,colorG,colorB,\
                    altColorR,altColorG,altColorB,useScore,private,restrictCount,restrictList,url,html,grp,canPack,settings)\
                    values('%1','%2','PbedGraph 4','%3',0,10,\
                    255,0,0,\
                    0,0,255,0,0,0,'','','','%4',0,'autoScale on\nwindowingFunction maximum')").
                    arg(gArgs().getArgs("sql_table").toString()).
                    arg(tbl).arg(tbl).
                    arg(gArgs().getArgs("sql_grp").toString());
        if(!q.exec(sql))
        { 
            sqlErr = q.lastError(); 
            qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
        } 
        sql_prep="START TRANSACTION; INSERT INTO "+gArgs().getArgs("sql_table").toString()+" (bin,chrom,chromStart,chromEnd,name,score,strand) VALUES";
        break;
    }
#endif
}
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class Storage,class Result>
void BEDHandler<Storage,Result>::onEntry(QEvent*)
{
    this->Load();
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

    QString chrome;
    foreach(chrome,sam_input->getLines())
    {
        if(chrome.endsWith("-")) continue;
        chrome.chop(1);
        qDebug()<<chrome;
        QMap <int,int> bed;

        {
            genome::cover_map::iterator i=sam_input->getLineCover(chrome+QChar('+')).getBeginIterator();
            genome::cover_map::iterator e=sam_input->getLineCover(chrome+QChar('+')).getEndIterator();

            while(i!=e)
            {
                int val=i.key()+shift;
                bed[val-val%w_h]+=i.value().getLevel();
                ++i;
            }
        }

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
                appe+=QString(" (0,'%1',%2,%3,%4,0,'%5'),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value()).arg("+");
            }
            //-----------------------------------------------------------------------------------    
#ifdef _SQL_
            appe.chop(1);
            if(!i_q.exec(sql_prep+appe+"; COMMIT;"))
            {
                sqlErr = i_q.lastError(); 
                qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
            }
#endif
            bed.clear();
        }

        {
            genome::cover_map::iterator i=sam_input->getLineCover(chrome+QChar('-')).getBeginIterator();
            genome::cover_map::iterator e=sam_input->getLineCover(chrome+QChar('-')).getEndIterator();

            while(i!=e)
            {
                int val=i.key()-shift;
                if(val<0) val=0;
                bed[val-val%w_h]+=i.value().getLevel();
                ++i;
            }
        }


        QMap<int,int>::iterator i = bed.begin();

        if(gArgs().getArgs("bed_format").toInt()!=4)
        {
            QString appe;
            for(;i!=bed.end();i++)
            {
                if(!create_file)
                {
                    _outFile.write(QString(chrome+"\t%1\t%2\t-%3\t0\t-\n").arg(i.key()).arg(i.key()+window).arg(i.value()).toLocal8Bit());
                }
                appe+=QString(" (0,'%1',%2,%3,-%4,0,'%5'),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value()).arg("-");
            }
#ifdef _SQL_
            appe.chop(1);
            if(!i_q.exec(sql_prep+appe+"; COMMIT;"))
            {
                sqlErr = i_q.lastError(); 
                qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
            }
#endif
        }
        else
        {
            QString appe;
            for(;i!=bed.end();i++)
            {
                if(!create_file)
                {
                    _outFile.write(QString(chrome+"\t%1\t%2\t%3\n").arg(i.key()).arg(i.key()+window).arg(i.value()).toLocal8Bit());
                }
                appe+=QString(" (0,'%1',%2,%3,%4),").arg(chrome).arg(i.key()).arg(i.key()+window).arg(i.value());
            }
#ifdef _SQL_
            appe.chop(1);
            if(!i_q.exec(sql_prep+appe+"; COMMIT;"))
            {
                sqlErr = i_q.lastError(); 
                qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
            }
#endif
        }

    }

    if(!create_file)
    {
        _outFile.flush();	 
    }
}//end of function

//-------------------------------------------------------------
//-------------------------------------------------------------
