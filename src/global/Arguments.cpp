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

#include "Arguments.hpp"
#include <QCoreApplication>

// Global static pointer used to ensure a single instance of the class.
Arguments* volatile Arguments::m_pArgumentsInstance = 0;
QSettings* Arguments::setup = 0;

QMutex Arguments::mutex;

/***************************************************************************************

****************************************************************************************/
QMap<QString,Arguments::_ArgDescr>& Arguments::getVarValStorage()
{
    static QMap<QString,_ArgDescr> m_VarValStorage;
    return m_VarValStorage;
}

/***************************************************************************************

****************************************************************************************/
Arguments& Arguments::Instance()
{
    if(!m_pArgumentsInstance)
    {
        mutex.lock();
        if(!m_pArgumentsInstance)
        {
            //Arguments* volatile temp =
            //      static_cast< Arguments* >(operator new (sizeof(Arguments)));
            m_pArgumentsInstance=new Arguments();
            setup=new QSettings(QSettings::IniFormat,QSettings::UserScope,QCoreApplication::organizationName());
            argsList();
        }
        mutex.unlock();
    }
    return *m_pArgumentsInstance;
}

/***************************************************************************************

****************************************************************************************/
Arguments::Arguments()
{
}

Arguments::~Arguments()
{
}


/***************************************************************************************

****************************************************************************************/
void Arguments::Init(QStringList l)
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
void Arguments::argsList(void)
{
    Arguments::addArg("in","in","inFileName",QVariant::String,"Input filename, or list of filenames separated by comma without spaces.",QString(""));
    Arguments::addArg("wardrobe","wardrobe","wardrobe",QVariant::String,"Wardrobe SQL Config",QString("/etc/wardrobe/wardrobe"));
    Arguments::addArg("bedin","bedin","inBedFileName",QVariant::String,"Input filename in bed format",QString(""));
    Arguments::addArg("batch","batch","batchFileName",QVariant::String,"Input Batchfile name, different structure for each programm","");
    Arguments::addArg("out","out","outFileName",QVariant::String,"Base output file name",QString(""));
    Arguments::addArg("log","log","logFileName",QVariant::String,"log file name (default is ./logfile_def.log)",QString("./logfile_def.log"));
    Arguments::addArg("in_mutation","in_mutation","in_mutation",QVariant::String,"Mutations filename.",QString(""));

    /*
    Arguments::addArg("sql_driver","sql_driver","SQL/DRIVER",QVariant::String,"Database driver",QString("QMYSQL"));
    Arguments::addArg("sql_host","sql_host","SQL/HOST",QVariant::String,"Database hostname",QString("localhost"));
    Arguments::addArg("sql_port","sql_port","SQL/PORT",QVariant::Int,"Database port",3306);
    Arguments::addArg("sql_user","sql_user","SQL/USER",QVariant::String,"Database user",QString("root"));
    Arguments::addArg("sql_pass","sql_pass","SQL/PASS",QVariant::ByteArray,"Database pass","",false,true);
    */
    Arguments::addArg("sql_dbname","sql_dbname","SQL/DBNAME",QVariant::String,"Database name",QString("hg19"));
    Arguments::addArg("sql_query1","sql_query1","QUERIES/Q1",QVariant::String,"Q1","");
    Arguments::addArg("sql_query2","sql_query2","QUERIES/Q2",QVariant::String,"Q2","");
    Arguments::addArg("sql_query3","sql_query3","QUERIES/Q3",QVariant::String,"Q3","");
    Arguments::addArg("sql_query4","sql_query4","QUERIES/Q4",QVariant::String,"Q4","");
    Arguments::addArg("sql_query5","sql_query5","QUERIES/Q5",QVariant::String,"Q5","");

    Arguments::addArg("sql_table","sql_table","",QVariant::String,"Sql table name","");
    Arguments::addArg("sql_grp","sql_grp","",QVariant::String,"Sql group for trackDb table - depricated","");

    Arguments::addArg("bed_window","bed_window","BED/WINDOW",QVariant::Int,"Window for counting ",20);
    Arguments::addArg("bed_siteshift","bed_siteshift","BED/SITESHIFT",QVariant::Int,"Bed graph reads shifting",0);
    Arguments::addArg("bed_format","bed_format","BED/FORMAT",QVariant::Int,"Plus/minus =8, just barplot =4",4);
    Arguments::addArg("bed_type","bed_type","BED/type",QVariant::Int,"How to count reads: just starts =0, middle of fragments =1,whole read cover =2, window cover =3",0);
    Arguments::addArg("bed_separatestrand","bed_separatestrand","BED/SEPARATESTRAND",QVariant::Bool,"",false);
    Arguments::addArg("bed_HeaderString","bed_HeaderString","BED/HEADERSTRING",QVariant::String,"",QString("track type=bedGraph name=%1"));
    Arguments::addArg("bed_normalize","bed_normalize","",QVariant::Bool,"",false);
    Arguments::addArg("bed_autoresolution","bed_autoresolution","",QVariant::Bool,"Scales a resolution from 1 to 10 ",true);

    Arguments::addArg("no-bed-file","no-bed-file","",QVariant::Bool,"Do not create bed file",false);
    Arguments::addArg("no-file","no-file","",QVariant::Bool,"Do not produce file output",false);
    Arguments::addArg("no-sql-upload","no-sql-upload","",QVariant::Bool,"Do not upload to SQL",false);

    Arguments::addArg("rna_seq","rna_seq","rnaseq",QVariant::String,"","");

    Arguments::addArg("debug_gene","debug_gene","debug_gene",QVariant::String,"Shows full debug information about this gene","");

    Arguments::addArg("rpkm_cutoff","rpkm-cutoff","RPKM/CUTOFF",QVariant::String,"Cutoff for RPKM","0.1");
    Arguments::addArg("rpkm_cutoff_val","rpkm-cutoff-val","RPKM/CUTOFFVAL",QVariant::String,"Cutoff value for RPKM","0.0");

    Arguments::addArg("math_converging","math-converging","MATH/CONVERGING",QVariant::String,"Type of converging: arithmetic, geometric","geometric");


    Arguments::addArg("avd_window","avd_window","AVD/WINDOW",QVariant::Int,"Average tag density window",5000);
    Arguments::addArg("avd_heat_window","avd_heat_window","",QVariant::Int,"Average tag density window for heatmap",10);
    Arguments::addArg("avd_smooth","avd_smooth","AVD/SMOOTH",QVariant::Int,"Average smooth window (odd)",0);
    Arguments::addArg("avd_bsmooth","avd_bsmooth","AVD/BSMOOTH",QVariant::Int,"Average smooth window for gene body",20);
    Arguments::addArg("avd_rawdata","avd_rawdata","AVD/RAWDATA",QVariant::Bool,"Output of raw data",false);
    Arguments::addArg("avd_wilc_region","avd_wilc_region","AVD/WILCREG",QVariant::String,"Which region dump with raw data -avd_wilc_region=\"-100:-5\"",QString(""));
    Arguments::addArg("avd_luid","avd_luid","",QVariant::String,"Labdata uid",QString(""));
    Arguments::addArg("avd_guid","avd_guid","",QVariant::String,"Genelist uid",QString(""));
    Arguments::addArg("avd_lid","avd_lid","AVD/LID",QVariant::Int,"Labdata id",0);
    Arguments::addArg("avd_id","avd_id","AVD/ID",QVariant::String,"Genelist id",QString(""));
    Arguments::addArg("avd_sort","avd_sort","",QVariant::Bool,"Order output in asc",false);
    Arguments::addArg("avd_sort_name","avd_sort_name","AVD/SORTNAME",QVariant::String,"Name of the column to sort",QString(""));
    Arguments::addArg("avd_sort_column","avd_sort_column","AVD/SSORTNAME",QVariant::String,"Name of the column to sort",QString(""));
    Arguments::addArg("avd_expresssion_columns","avd_expresssion_columns","AVD/EXPRESSIONCOL",QVariant::String,"Names of the columns to select",QString(""));

    Arguments::addArg("uid","uid","UUID",QVariant::String,"UUID",QString(""));
    Arguments::addArg("guid","guid","GUUID",QVariant::String,"GUUID",QString(""));

    Arguments::addArg("promoter","promoter","",QVariant::Int,"Promoter region around TSS in bp.",1000);
    Arguments::addArg("upstream","upstream","",QVariant::Int,"Upstream region before promoter in BP",20000);


    Arguments::addArg("plot_ext","plot_ext","",QVariant::String,"","");
    Arguments::addArg("gnuplot","gnuplot","",QVariant::String,"Path to gnuplot",QString("gnuplot.exe"));

    Arguments::addArg("window","window","WINDOW",QVariant::Int,"Window",2000);

    Arguments::addArg("threads","threads","",QVariant::Int,"Max number of threads",0);

    Arguments::addArg("sam_siteshift","sam_siteshift","SAM/SITESHIFT",QVariant::Int,"Default siteshift",0);
    Arguments::addArg("sam_mapped_limit","sam_mapped_limit","SAM/MAPPEDLIMIT",QVariant::Int,"Default limit to mapped data",0);
    Arguments::addArg("sam_twicechr","sam_twicechr","SAM/TWICECHR",QVariant::String,"Which chromosome to double",QString(""));// chrX chrY
    Arguments::addArg("sam_ignorechr","sam_ignorechr","SAM/IGNORECHR",QVariant::String,"Which chromosome to ignore",QString(""));//chrM
    Arguments::addArg("sam_frag_filtr","sam_frag_filtr","SAM/FRAGFILTR",QVariant::String,"Which length of fragment to leave -sam_frag_filtr=\"120-150\"",QString(""));

    Arguments::addArg("debug","debug","DEBUG",QVariant::Bool,"Output debug data",false);
}

/***************************************************************************************

****************************************************************************************/
QFileInfo Arguments::fileInfo(const QString& str)
{
    return QFileInfo(gArgs().getArgs(str).toString());
}

/***************************************************************************************

****************************************************************************************/
QStringList  Arguments::split(const QString& str,const QChar& sep)
{
    return gArgs().getArgs(str).toString().split(sep);
}

/***************************************************************************************

****************************************************************************************/
void Arguments::usage(void)
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
void Arguments::addArg(QString key,QString _c/*command line argument*/, QString _i/*name in ini file*/,QVariant::Type _t, QString _d,QVariant _def,bool _r/*is argument required or not*/,bool _s/*should we read from stdin or not*/)
{
    if(!getVarValStorage().contains(key))
        getVarValStorage().insert(key,_ArgDescr(_c,_i,_t,_def,_d,_r,_s));
}

/***************************************************************************************

****************************************************************************************/
QVariant &Arguments::getArgs(QString key)
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

