/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the ReadsCounting module of the genome-tools.
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
#ifndef _Threads_
#define _Threads_


#include <config.hpp>
#include <ReadsCounting.hpp>
#include <Math.hpp>

//-------------------------------------------------------------------------------------------------------
class sam_reader_thread: public QRunnable
{
private:
    gen_lines *sam_data;
    QString fileName;
    IsoformsOnChromosome* isoforms;
    bool dUTP;

    void correctBoundings(chrom_coverage::interval_type &itv,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u);
    quint64 getTotal(const QString &key,int &i,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u);

public:

    sam_reader_thread(QString fn,gen_lines *sd,IsoformsOnChromosome* io);

protected:

    void run(void);
};


#endif
