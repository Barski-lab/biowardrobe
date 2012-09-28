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

#ifndef BEDHandler_H
#define BEDHandler_H

#include <config.hpp>
#include <Reads.hpp>

#if 0
GLOBALCALL{
 Arguments::addArg("no-bed-file","no-bed-file","",QVariant::Bool,"Do not create bed file",false);
 return 0;
}();
#endif

template <class Storage, class Result>
class BEDHandler : public QState
{

private:

    Storage *sam_input;        
    Result *output;
    
    QSettings setup;

    QFile _outFile;
    bool create_file;
public:

    BEDHandler(Storage &sam,Result &output,QState *parent=0);
//    BEDHandler(Storage &sam,QState *parent=0);
    ~BEDHandler();
    void Load(void);
protected:
#ifdef _SQL_
    QSqlError sqlErr;
    QSqlQuery i_q;
    QString sql_prep;
#endif
    virtual void onEntry(QEvent* event);

};

#include <BEDHandler.cpp>

#endif //
