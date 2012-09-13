#ifndef _MAIN_H_739213_
#define _MAIN_H_739213_

//================================================================== 
#include <config.hpp>


QFile _logfile;
QMutex _logmut;

void printMsgHandler(QtMsgType type, const char * _str)
{
    _logmut.lock();
    QString time=QTime::currentTime().toString("hh:mm:ss");
    //	static QString str1="";
    //	if(str1==str) return;
    //	str1=str;
    QString str=QString("[%1]["+time+"] %2\n").arg(type).arg(_str);

    switch (type) 
    {
    case QtDebugMsg:
        _logfile.write(str.toLocal8Bit());
        _logfile.flush();
        break;
    case QtWarningMsg:
        fprintf(stderr, "Debug: %s\n", str.toLocal8Bit().data());
        _logfile.write(str.toLocal8Bit());
        _logfile.flush();
        break;
    case QtCriticalMsg:
        _logfile.write(str.toLocal8Bit());
        _logfile.flush();
        break;
    case QtFatalMsg:
        _logfile.write(str.toLocal8Bit());
        _logfile.flush();
        exit(-1);
        break;
    }
    _logmut.unlock();
};

int main( int _argc, char* _argv[] )
{
    try{
        QCoreApplication Application(_argc, _argv);

        QCoreApplication::setOrganizationName("genome-tools");
        QCoreApplication::setApplicationName(_APPNAME);

        QSettings::setDefaultFormat(QSettings::IniFormat);
        QSettings::setPath(QSettings::IniFormat,QSettings::UserScope,"./config");

        gArgs().Init(QCoreApplication::arguments());

#ifdef _SQL_
        if (!QSqlDatabase::drivers().contains(gArgs().getArgs("sql_driver").toString()))
        {
            qDebug()<<"No SQL driver. Drivers list:"<<QSqlDatabase::drivers();
            throw "No SQL driver";
        }
        else
        {
            QSqlDatabase db = QSqlDatabase::addDatabase(gArgs().getArgs("sql_driver").toString());
            db.setDatabaseName(gArgs().getArgs("sql_dbname").toString());
            db.setHostName(gArgs().getArgs("sql_host").toString());
            db.setPort(gArgs().getArgs("sql_port").toInt());
            db.setUserName(gArgs().getArgs("sql_user").toString());
            db.setPassword(qUncompress(QByteArray::fromBase64(gArgs().getArgs("sql_pass").toByteArray())));
            if (!db.open() ) 
            {      
                QSqlError sqlErr = db.lastError();
                qDebug()<<qPrintable("Error connect to DB:"+sqlErr.text());
                throw "Error connect to DB";
            }      
        }
#endif

        _logfile.setFileName(gArgs().getArgs("log").toString());
        _logfile.open(QIODevice::WriteOnly|QIODevice::Append);

        qInstallMsgHandler(printMsgHandler);

        FSTM *machine = new FSTM();
        QTimer::singleShot(0, machine, SLOT(start()));
        QObject::connect(machine,SIGNAL(finished()),QCoreApplication::instance(),SLOT(quit()));
        return Application.exec();  
    }
    catch(char *str)
    {
        cerr << "Error rised:"<<str << endl;
    }
    catch(exception &e )
    {
        cerr << "Caught " << e.what( ) << endl;
        cerr << "Type " << typeid( e ).name( ) << endl;
    }
    catch(...)
    {
    }
}

#endif
