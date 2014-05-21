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

#include "Settings.hpp"
#include <QCoreApplication>

// Global static pointer used to ensure a single instance of the class.
Settings* volatile Settings::m_pSettingsInstance = 0;
QSettings* Settings::setup = 0;

QMutex Settings::mutex;

/***************************************************************************************

****************************************************************************************/
QMap<QString,Settings::_ArgDescr>& Settings::getVarValStorage()
{
    static QMap<QString,_ArgDescr> m_VarValStorage;
    return m_VarValStorage;
}

/***************************************************************************************

****************************************************************************************/
Settings& Settings::Instance()
{
    if(!m_pSettingsInstance)
    {
        mutex.lock();
        if(!m_pSettingsInstance)
        {
            //Settings* volatile temp =
            //      static_cast< Settings* >(operator new (sizeof(Settings)));
            m_pSettingsInstance=new Settings();
            setup=new QSettings(QSettings::IniFormat,QSettings::UserScope,QCoreApplication::organizationName());
            argsList();
        }
        mutex.unlock();
    }
    return *m_pSettingsInstance;
}

/***************************************************************************************

****************************************************************************************/
Settings::Settings()
{
}

Settings::~Settings()
{
}


/***************************************************************************************

****************************************************************************************/
void Settings::Init(QStringList l)
{
    int correct=0;
    foreach(const QString &key,getVarValStorage().keys())
    {
        int index=-1;
        if(getVarValStorage()[key]._cname!="")
        {
            if(getVarValStorage()[key]._type==QVariant::Bool)
            {
                index=l.indexOf(QRegExp("^\\-{1,2}"+getVarValStorage()[key]._cname+"$"),1);
            }
            else
            {
                index=l.indexOf(QRegExp("^\\-{1,2}"+getVarValStorage()[key]._cname+"=.+$"),1);
            }
            if(index>0)
            {
                QString command=l[index];

                if(command.left(2)=="--")
                {
                    command.remove(0,2);
                }
                else if(command.left(1)=="-")
                {
                    command.remove(0,1);
                }
                else
                {
                    usage();
                    throw "Incorrect parameter";
                }
                if(command=="help")
                {
                    usage();
                    exit(0);
                }
                /*Selecting correct command*/
                if(getVarValStorage()[key]._type==QVariant::Bool && command==getVarValStorage()[key]._cname)
                {
                    getVarValStorage()[key]._value=QVariant(true);
                    /*probably save to the INI*/
                    correct++;
                    continue;
                }
                if( getVarValStorage()[key]._type==QVariant::String &&
                        command.at(getVarValStorage()[key]._cname.size())==QChar('='))
                {
                    command.remove(0,getVarValStorage()[key]._cname.size()+1);
                    getVarValStorage()[key]._value=QVariant(command);
                    correct++;
                    continue;
                }
                if( getVarValStorage()[key]._type==QVariant::Int &&
                        command.at(getVarValStorage()[key]._cname.size())==QChar('='))
                {
                    command.remove(0,getVarValStorage()[key]._cname.size()+1);
                    getVarValStorage()[key]._value=QVariant(command).toInt();
                    correct++;
                    continue;
                }
                /*
                 *   by default treat all parameters as String
                 */
                if( command.at(getVarValStorage()[key]._cname.size())==QChar('='))
                {
                    command.remove(0,getVarValStorage()[key]._cname.size()+1);
                    getVarValStorage()[key]._value=QVariant(command);
                    correct++;
                    continue;
                }
                usage();
                throw "Incorrect parameter";
            }
            //index>0
        }

        if(!getVarValStorage()[key]._ininame.isEmpty() && setup->contains(getVarValStorage()[key]._ininame))
        {
            getVarValStorage()[key]._value=setup->value(getVarValStorage()[key]._ininame);
            continue;
        }

        if(!getVarValStorage()[key]._ininame.isEmpty() && getVarValStorage()[key]._stdin)
        {
            QTextStream stream(stdin);
            QString line;
#ifndef _WIN32
            termios oldt;
            tcgetattr(STDIN_FILENO, &oldt);
            termios newt = oldt;
            newt.c_lflag &= ~ECHO;
            tcsetattr(STDIN_FILENO, TCSANOW, &newt);
#else
            HANDLE hStdin = GetStdHandle(STD_INPUT_HANDLE);
            DWORD mode = 0;
            GetConsoleMode(hStdin, &mode);
            SetConsoleMode(hStdin, mode & (~ENABLE_ECHO_INPUT));
#endif
            cout<<"Please enter "<<getVarValStorage()[key]._descr.toStdString()<<":";

            line = stream.readLine();
            cout<<endl;
#ifndef _WIN32
            tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
#else
            SetConsoleMode(hStdin, mode & (ENABLE_ECHO_INPUT));
#endif
            QByteArray ba=qCompress(line.toLocal8Bit().data()).toBase64();
            getVarValStorage()[key]._value=ba;
            setup->setValue(getVarValStorage()[key]._ininame,ba);
            setup->sync();
            continue;
        }
        else
        {
            if(getVarValStorage()[key]._required==true)
            {
                usage();
                throw "Required parameter not present";
            }

        }
    }
    if(correct!=l.size()-1)
    {
        usage();
        for(int i=0;i<l.size();i++)
        {
            cout<<"DEBUG: "<<l[i].toStdString()<<endl;
        }
        throw "Incorrect command line";
    }
}

/***************************************************************************************

****************************************************************************************/
void Settings::argsList(void)
{
    Settings::addArg("in","in","inFileName",QVariant::String,"Input filename, or list of filenames separated by comma without spaces.",QString(""));
    Settings::addArg("wardrobe","wardrobe","wardrobe",QVariant::String,"Wardrobe SQL Config",QString("/etc/wardrobe/wardrobe"));
    Settings::addArg("bedin","bedin","inBedFileName",QVariant::String,"Input filename in bed format",QString(""));
    Settings::addArg("batch","batch","batchFileName",QVariant::String,"Input Batchfile name, different structure for each programm","");
    Settings::addArg("out","out","outFileName",QVariant::String,"Base output file name",QString(""));
    Settings::addArg("log","log","logFileName",QVariant::String,"log file name (default is ./logfile_def.log)",QString("./logfile_def.log"));
    Settings::addArg("in_mutation","in_mutation","in_mutation",QVariant::String,"Mutations filename.",QString(""));

    Settings::addArg("sql_driver","sql_driver","SQL/DRIVER",QVariant::String,"Database driver",QString("QMYSQL"));
    Settings::addArg("sql_dbname","sql_dbname","SQL/DBNAME",QVariant::String,"Database name",QString("hg19"));
    Settings::addArg("sql_host","sql_host","SQL/HOST",QVariant::String,"Database hostname",QString("localhost"));
    Settings::addArg("sql_port","sql_port","SQL/PORT",QVariant::Int,"Database port",3306);
    Settings::addArg("sql_user","sql_user","SQL/USER",QVariant::String,"Database user",QString("root"));
    Settings::addArg("sql_pass","sql_pass","SQL/PASS",QVariant::ByteArray,"Database pass","",false,true);
    Settings::addArg("sql_query1","sql_query1","QUERIES/Q1",QVariant::String,"Q1","");
    Settings::addArg("sql_query2","sql_query2","QUERIES/Q2",QVariant::String,"Q2","");
    Settings::addArg("sql_query3","sql_query3","QUERIES/Q3",QVariant::String,"Q3","");
    Settings::addArg("sql_query4","sql_query4","QUERIES/Q4",QVariant::String,"Q4","");
    Settings::addArg("sql_query5","sql_query5","QUERIES/Q5",QVariant::String,"Q5","");

    Settings::addArg("bed_window","bed_window","BED/WINDOW",QVariant::Int,"Window for counting ",20);
    Settings::addArg("bed_siteshift","bed_siteshift","BED/SITESHIFT",QVariant::Int,"Bed graph reads shifting",0);
    Settings::addArg("bed_format","bed_format","BED/FORMAT",QVariant::Int,"Plus/minus =8, just barplot =4",4);
    Settings::addArg("bed_type","bed_type","BED/type",QVariant::Int,"How to count reads: just starts =0, middle of fragments =1,whole read =2",0);
    Settings::addArg("bed_separatestrand","bed_separatestrand","BED/SEPARATESTRAND",QVariant::Bool,"",false);
    Settings::addArg("bed_HeaderString","bed_HeaderString","BED/HEADERSTRING",QVariant::String,"",QString("track type=bedGraph name=%1"));
    Settings::addArg("bed_trackname","bed_trackname","BED/TRACKNAME",QVariant::String,"Track name which will appear in genome browser","");
    Settings::addArg("bed_normalize","bed_normalize","",QVariant::Bool,"",false);

    Settings::addArg("no-bed-file","no-bed-file","",QVariant::Bool,"Do not create bed file",false);
    Settings::addArg("no-file","no-file","",QVariant::Bool,"Do not produce file output",false);
    Settings::addArg("no-sql-upload","no-sql-upload","",QVariant::Bool,"Do not upload to SQL",false);

    Settings::addArg("sql_table","sql_table","",QVariant::String,"Sql table name","");
    Settings::addArg("sql_grp","sql_grp","",QVariant::String,"Sql group for trackDb table","");

    Settings::addArg("rna_seq","rna_seq","rnaseq",QVariant::String,"","");

    Settings::addArg("debug_gene","debug_gene","debug_gene",QVariant::String,"Shows full debug information about this gene","");

    Settings::addArg("rpkm_cutoff","rpkm-cutoff","RPKM/CUTOFF",QVariant::String,"Cutoff for RPKM","0.1");
    Settings::addArg("rpkm_cutoff_val","rpkm-cutoff-val","RPKM/CUTOFFVAL",QVariant::String,"Cutoff value for RPKM","0.0");

    Settings::addArg("math_converging","math-converging","MATH/CONVERGING",QVariant::String,"Type of converging: arithmetic, geometric","geometric");


    Settings::addArg("avd_window","avd_window","AVD/WINDOW",QVariant::Int,"Average tag density window",5000);
    Settings::addArg("avd_smooth","avd_smooth","AVD/SMOOTH",QVariant::Int,"Average smooth window (odd)",0);
    Settings::addArg("avd_rawdata","avd_rawdata","AVD/RAWDATA",QVariant::Bool,"Output of raw data",false);
    Settings::addArg("avd_wilc_region","avd_wilc_region","AVD/WILCREG",QVariant::String,"Which region dump with raw data -avd_wilc_region=\"-100:-5\"",QString(""));
    Settings::addArg("avd_lid","avd_lid","AVD/LID",QVariant::Int,"Labdata id",0);
    Settings::addArg("avd_id","avd_id","AVD/ID",QVariant::String,"Genelist id",QString(""));
    Settings::addArg("avd_sort_name","avd_sort_name","AVD/SORTNAME",QVariant::String,"Name of the column to sort",QString(""));
    Settings::addArg("avd_sort_column","avd_sort_column","AVD/SSORTNAME",QVariant::String,"Name of the column to sort",QString(""));
    Settings::addArg("avd_expresssion_columns","avd_expresssion_columns","AVD/EXPRESSIONCOL",QVariant::String,"Names of the columns to select",QString(""));


    Settings::addArg("plot_ext","plot_ext","",QVariant::String,"","");
    Settings::addArg("gnuplot","gnuplot","",QVariant::String,"Path to gnuplot",QString("gnuplot.exe"));

    Settings::addArg("window","window","WINDOW",QVariant::Int,"Window",2000);

    Settings::addArg("threads","threads","",QVariant::Int,"Max number of threads",0);

    Settings::addArg("sam_siteshift","sam_siteshift","SAM/SITESHIFT",QVariant::Int,"Default siteshift",0);
    Settings::addArg("sam_mapped_limit","sam_mapped_limit","SAM/MAPPEDLIMIT",QVariant::Int,"Default limit to mapped data",0);
    Settings::addArg("sam_twicechr","sam_twicechr","SAM/TWICECHR",QVariant::String,"Which chromosome to double",QString(""));// chrX chrY
    Settings::addArg("sam_ignorechr","sam_ignorechr","SAM/IGNORECHR",QVariant::String,"Which chromosome to ignore",QString(""));//chrM
    Settings::addArg("sam_frag_filtr","sam_frag_filtr","SAM/FRAGFILTR",QVariant::String,"Which length of fragment to leave -sam_frag_filtr=\"120-150\"",QString(""));

    Settings::addArg("debug","debug","DEBUG",QVariant::Bool,"Output debug data",false);
}

/***************************************************************************************

****************************************************************************************/
QFileInfo Settings::fileInfo(const QString& str)
{
    return QFileInfo(gArgs().getArgs(str).toString());
}

/***************************************************************************************

****************************************************************************************/
QStringList  Settings::split(const QString& str,const QChar& sep)
{
    return gArgs().getArgs(str).toString().split(sep);
}

/***************************************************************************************

****************************************************************************************/
void Settings::usage(void)
{
   cout << "Usage:" <<endl;
   foreach(const QString &key,getVarValStorage().keys())
    {
        if(getVarValStorage()[key]._cname!="")
        {
            cout<<QString("\t--%1%2").arg(getVarValStorage()[key]._cname).
                  arg("",25-getVarValStorage()[key]._cname.length(),QChar(' ')).toStdString()<<"\t"<<getVarValStorage()[key]._descr.toStdString()<<endl;
        }
    }
}

/***************************************************************************************

****************************************************************************************/
void Settings::addArg(QString key,QString _c/*command line argument*/, QString _i/*name in ini file*/,QVariant::Type _t, QString _d,QVariant _def,bool _r/*is argument required or not*/,bool _s/*should we read from stdin or not*/)
{
    if(!getVarValStorage().contains(key))
        getVarValStorage().insert(key,_ArgDescr(_c,_i,_t,_def,_d,_r,_s));
}

/***************************************************************************************

****************************************************************************************/
QVariant &Settings::getArgs(QString key)
{
    mutex.lock();
    if(getVarValStorage().contains(key))
    {
        if(getVarValStorage()[key]._value.isValid() && !getVarValStorage()[key]._value.isNull())
        {
            QVariant &_v=getVarValStorage()[key]._value;
            mutex.unlock();
            return _v;
        }
        if(getVarValStorage()[key]._defValue.isValid() && !getVarValStorage()[key]._defValue.isNull())
        {
            QVariant &_v=getVarValStorage()[key]._defValue;
            mutex.unlock();
            return _v;
        }
    }

    mutex.unlock();
    throw "Incorrect key";
}
/***************************************************************************************

****************************************************************************************/

