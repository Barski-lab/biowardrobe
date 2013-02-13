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
#include "Bam2Bedgraph.hpp"

#include <SamReader.hpp>
#include <Reads.hpp>
#include <BEDHandler.hpp>

typedef genome::GenomeDescription gen_lines;

typedef SamReader<gen_lines> sam_reader;
typedef BEDHandler bed_handler;


FSTM::FSTM(QObject *parent):
    QObject(parent)
{
}

FSTM::~FSTM()
{
}

void FSTM::start()
{
    try{
        gen_lines    sam_data;
        sam_reader   s(&sam_data);
        s.Load();

        bed_handler  bed(sam_data);
        bed.Load();

    }
    catch(char *str)
    {
        qDebug() << "Error rised:"<<str;
    }
    catch(exception& e)
    {
        qDebug() << "Error rised:"<<e.what( );
        qDebug() << "Type " << typeid( e ).name( );
    }

    emit finished();
}
