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

#ifndef ARGUMENTS_HPP
#define ARGUMENTS_HPP

#include <qvariant.h>
#include <qstring.h>
#include <qstringlist.h>
#include <qsettings.h>
#include <qfileinfo.h>
#include <qmutex.h>
#include <QTextStream>

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>

#ifndef _WIN32
#include <iostream>
#include <string>
#include <termios.h>
#include <unistd.h>
#else
#include <windows.h>
#endif

using namespace std;


/*
 Singleton class to parse arguments after QApplication call
*/
class Arguments
{
public:
    enum en_In { COMMAND, INI, BOTH };
    struct _ArgDescr{
        QString _cname;
        QString _ininame;
        QVariant::Type _type;
        QVariant _value;
        QVariant _defValue;
        QString _descr;
        bool _required;
        bool _stdin;

        _ArgDescr():
            _type(QVariant::Invalid),
            _required(false),
            _stdin(false){};

        _ArgDescr(QString _c, QString _i,QVariant::Type _t,	QVariant _def,QString _d,bool _r=false,bool _s=false):
            _cname(_c),
            _ininame(_i),
            _type(_t),
            _defValue(_def),
            _descr(_d),
            _required(_r),
            _stdin(_s){};
    };
    static Arguments& Instance();
    void Init(QStringList /*arguments list*/);
//	static QStringList

private:
    /*Constructor and variables which allows singleton creation*/
    static Arguments* volatile m_pArgumentsInstance;
    Arguments();
    Arguments(Arguments const&){};
    Arguments& operator = (Arguments const&){ return Arguments::Instance();};

    ~Arguments();

    /*Protected static variables*/
    static QMutex mutex;
    static QSettings      *setup;

public:
    static void addArg(QString key,QString _c/*command line argument*/, QString _i/*name in ini file*/,QVariant::Type _t,
                       QString _d,QVariant _def,bool _r=false/*is argument required or not*/,bool _s=false/*should we read from stdin or not*/);
    static void argsList(void);
    static void usage(void);
    static QMap<QString,_ArgDescr>& getVarValStorage();
    QFileInfo fileInfo(const QString&);
    QStringList split(const QString&,const QChar&);
    QVariant &getArgs(QString key);
};

#define gArgs()  (Arguments::Instance())

/*
//#define gArgs_(n) \
//	BOOST_PP_IF( \
//	BOOST_PP_EQUAL(n,1),GARGS_INIT_1(), \
//	BOOST_PP_IF( \
//	BOOST_PP_GREATER(n,1),(*_gArgs), \
//	BOOST_PP_EMPTY()))
*/


#endif // ARGUMENTS_HPP
