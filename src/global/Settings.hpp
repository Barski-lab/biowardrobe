/****************************************************************************
**
** Copyright (C) 2011-2014 Andrey Kartashov .
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

#ifndef Settings_HPP
#define Settings_HPP

#include <qvariant.h>
#include <qstring.h>
#include <qstringlist.h>
#include <qsettings.h>
#include <qfileinfo.h>
#include <qmutex.h>
#include <QTextStream>
#include <QSqlDatabase>
#include <QSqlError>
#include <QSqlQuery>
#include <QtDebug>

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
 Singleton class to parse Settings after QApplication call
*/
class Settings
{
public:
    static Settings& Instance();

private:
    /*Constructor and variables which allows singleton creation*/
    static Settings* volatile m_pSettingsInstance;
    Settings();
    Settings(Settings const&){};
    Settings& operator = (Settings const&){ return Settings::Instance();};

    ~Settings();

    /*Protected static variables*/
    static QMutex mutex;
    QMap<QString,QString> settings;
public:
    bool Init(QString);
    QString getValue(QString key);
};

#define gSettings()  (Settings::Instance())


#endif // Settings_HPP
