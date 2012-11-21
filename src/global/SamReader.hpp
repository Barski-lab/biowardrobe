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
#ifndef _SAM_FILE_HEADER_
#define _SAM_FILE_HEADER_

#ifdef D_USE_SAM
#ifdef D_USE_BAM
#error "BAM and SAM cannot be defined together"
#endif
#endif

#include <config.hpp>


template <class Storage>
class SamReader
{

public:

    SamReader(Storage *o,QObject *parent=0);
    SamReader(QString,Storage *o,QObject *parent=0);

    ~SamReader();

    void Load(void);


private:

    void initialize();

    QString inFile;
    Storage   *output;

    QSet<int> tids;//t ids which should be twiced
    QSet<int> i_tids;//t ids which should be ignored

#ifdef D_USE_BAM
    BamMultiReader reader;
    SamHeader header;
    RefVector references;
#endif
};

#include <SamReader.cpp>
#endif


