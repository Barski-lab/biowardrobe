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
#ifndef FileWriter_H
#define FileWriter_H

#include <config.hpp>

class FileWriter : public QState
{
    Q_OBJECT

private:

    HandledData *hd;

    QString        fileName;

public:

    FileWriter(HandledData &in,QState *parent=0);
    FileWriter(HandledData &in,QString _fileName,QState *parent=0);
    FileWriter(HandledData &in,QString _fileName,ChildMode childMode,QState *parent=0);
    void Load(void);
    ~FileWriter();

protected:

    virtual void onEntry(QEvent* event);

};

#endif
