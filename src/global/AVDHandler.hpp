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
#ifndef AVDHandler_H
#define AVDHandler_H

#include <config.hpp>

template <class StorageIn1,class StorageIn2,class Result>
class AVDHandler : public QState
{
//	Q_OBJECT

private:
    StorageIn1 *sql_input;
    StorageIn2 *sam_input;

//    HandledData *hd;
    Result *hd;

    QSettings setup;

public:

    AVDHandler(StorageIn1 *sql,StorageIn2 *sam,Result &output,QState *parent=0);
    ~AVDHandler();

//    void onEntry1(QEvent* event);
    void AVD1(void);
    void AVD2(void);

protected:

    virtual void onEntry(QEvent* event);

};

#include <AVDHandler.cpp>
#endif //
