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

#if QT_VERSION >= 0x050000
// Qt5 code
void printMsgHandler(QtMsgType type, const QMessageLogContext&, const QString &_str)
{
    static QMutex _logmut;
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

#else
// Qt4 code
void printMsgHandler(QtMsgType type, const char * _str)
{
    static QMutex _logmut;
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
#endif


class App : public QCoreApplication
{
    public:

    App(int& argc, char** argv):QCoreApplication(argc,argv){}
    virtual ~App(){}

    virtual bool notify(QObject *receiver, QEvent *event)
    {
        try
        {
            return QCoreApplication::notify(receiver, event);
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
        emit quit();
        return false;
    }
};

int main( int _argc, char* _argv[] )
{
    try{
        App Application(_argc, _argv);

        QCoreApplication::setOrganizationName("genome-tools");
        QCoreApplication::setApplicationName(_APPNAME);

        gArgs().Init(QCoreApplication::arguments());
        for(int j=1; j< _argc;j++) {
              QString s(_argv[j]);
              if(s.contains("pass"))
                  for(int i=0;i<s.size();i++)
                      _argv[j][i]='*';
        }
        _logfile.setFileName(gArgs().getArgs("log").toString());
        _logfile.open(QIODevice::WriteOnly|QIODevice::Append);

#ifdef _WARDROBE_
        gSettings().Init(gArgs().getArgs("wardrobe").toString());
#endif

#if QT_VERSION >= 0x050000
        qInstallMessageHandler(printMsgHandler);
#else
        qInstallMsgHandler(printMsgHandler);
#endif

        FSTM *machine = new FSTM();
        QObject::connect(machine,SIGNAL(finished()),QCoreApplication::instance(),SLOT(quit()));
        QTimer::singleShot(0, machine, SLOT(start()));
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
