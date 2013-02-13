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


class BEDHandler
{

private:
    typedef genome::GenomeDescription Storage;

    Storage *sam_input;
    QList<int> *output;
    QList<int> def_output;

    QFile _outFile;

    bool create_file;
    bool no_sql_upload;
    int bed_type;
    quint32 window;
public:

    BEDHandler(Storage &sam);
    BEDHandler(Storage &sam,QList<int> &output);
    ~BEDHandler();
    void Load(void);
protected:
    void init(Storage &sam);
    void fill_bed_cover(QMap <int,int>& bed,QVector<int>& cover,QString const& chrom,QChar const& strand,int shift=0);
    void cover_save(QVector<int>& cover,QString& sql_prep,QString const& chrom, QChar const& strand);
    void bed_save(QMap <int,int>& bed,QString& sql_prep,QString const& chrom, QChar const& strand);

#ifdef _SQL_
    QSqlQuery q;
    QString sql_prep;
#endif


};

//#include <BEDHandler.cpp>

#endif //
