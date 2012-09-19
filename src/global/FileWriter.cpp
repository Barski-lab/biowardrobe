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
#include "FileWriter.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::~FileWriter()
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QState * parent):
QState(parent),
    hd(&in)
{
    fileName=gArgs().getArgs("out").toString();
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QString _fileName,QState * parent):
QState(parent),
    hd(&in),
    fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QString _fileName,ChildMode childmode,QState * parent):
QState(childmode,parent),
    hd(&in),
    fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
void FileWriter::onEntry(QEvent*)
{
    Load();
}//end of function

//-------------------------------------------------------------
//-------------------------------------------------------------
void FileWriter::Load(void)
{
    for(quint32 h=0;h<hd->height;h++)
    {
        QFile _outFile;
        if(fileName.indexOf("%")>0)
        {
            _outFile.setFileName(fileName.arg(h));
            _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        }
        else
        {
            _outFile.setFileName(fileName);
            _outFile.open(QIODevice::WriteOnly|QIODevice::Append);
        }

        for(quint32 w=0; w< hd->width; w++)
            _outFile.write( (QString("%1\t%2\n").arg(w).arg( hd->data[h][w] )).toLocal8Bit() );

        _outFile.flush();
        _outFile.close();
    }
}

//-------------------------------------------------------------
//-------------------------------------------------------------



