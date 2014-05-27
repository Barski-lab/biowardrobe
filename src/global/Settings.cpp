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

#include "Settings.hpp"

// Global static pointer used to ensure a single instance of the class.
Settings* volatile Settings::m_pSettingsInstance = 0;
QMutex Settings::mutex;


/***************************************************************************************

****************************************************************************************/
Settings& Settings::Instance()
{
    if(!m_pSettingsInstance)
    {
        mutex.lock();
        if(!m_pSettingsInstance) {
            m_pSettingsInstance=new Settings();
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
bool Settings::Init(QString configfile) {
    QFile config(configfile);
    if(!config.exists())
        return false;
    if (!config.open(QIODevice::ReadOnly | QIODevice::Text))
        return false;

    QTextStream in(&config);
    QString db_user,db_host,db_name,db_pass,db_driver,db_port;

    while (!in.atEnd()) {
        QString line = in.readLine().trimmed();
        if(line.startsWith('#') || line.length()==0)
            continue;
        if(db_host.isEmpty())
            db_host=line;
        else if(db_user.isEmpty())
            db_user=line;
        else if(db_pass.isEmpty())
            db_pass=line;
        else if(db_name.isEmpty())
            db_name=line;
        else if(db_port.isEmpty())
            db_port=line;
        else if(db_driver.isEmpty())
            db_driver=line;
    }

    if(db_port.isEmpty())
        db_port="3306";
    if(db_driver.isEmpty())
        db_driver="QMYSQL";

    if (!QSqlDatabase::drivers().contains(db_driver)) {
        qDebug()<<"No SQL driver. Drivers list:"<<QSqlDatabase::drivers();
        throw "No SQL driver";
    } else {
        QSqlDatabase db = QSqlDatabase::addDatabase(db_driver);
        db.setDatabaseName(db_name);
        db.setHostName(db_host);
        db.setPort(db_port.toInt());
        db.setUserName(db_user);
        db.setPassword(db_pass);
        if (!db.open() ) {
            qDebug()<<qPrintable("Error connect to DB:"+db.lastError().text());
            throw "Error connect to DB";
        }
    }

    QSqlQuery q;
    q.prepare("select `key`,`value` from settings");
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }
    while(q.next())
        this->settings[q.value(0).toString()]=q.value(1).toString();

    return true;
}

/***************************************************************************************

****************************************************************************************/
QString Settings::getValue(QString key) {
    if(settings.contains(key))
        return settings[key];
    else
        return "";
}
