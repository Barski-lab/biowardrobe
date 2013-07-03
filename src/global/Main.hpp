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
#ifndef _MAIN_H_739213_
#define _MAIN_H_739213_


#include <config.hpp>


QFile _logfile;
QMutex _logmut;

void printMsgHandler(QtMsgType type, const char * _str)
{
    _logmut.lock();
    QString time=QTime::currentTime().toString("hh:mm:ss");
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

        gArgs().Init(QCoreApplication::arguments());

        _logfile.setFileName(gArgs().getArgs("log").toString());
        _logfile.open(QIODevice::WriteOnly|QIODevice::Append);

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
                qDebug()<<qPrintable("Error connect to DB commpressed:"+sqlErr.text());
                db.setPassword(gArgs().getArgs("sql_pass").toString());
                if (!db.open())
                {
                    qDebug()<<qPrintable("Error connect to DB uncopressed:"+sqlErr.text());
                    throw "Error connect to DB";
                }
            }
        }
#endif

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
