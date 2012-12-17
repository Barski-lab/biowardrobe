/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the intersection module of the genome-tools.
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

#ifndef _Intersections_
#define _Intersections_


#include <config.hpp>

#define FSTM Intersections


typedef bicl::interval_map<int,int> current_segment_type;
typedef QMap<QString, current_segment_type > string_map_segments;

class FSTM: public QObject
{
    Q_OBJECT

private:

    QSqlQuery q;
    QSqlQuery big_q;
    QMap<QString,QByteArray> genome;
    bool TSS_wrt;

public slots:

    void start(void);

public:

    FSTM(QObject* parent=0);
    ~FSTM();

    template<typename T>
    void loadBed(T &,QString,QString cond="P-");

    void outData(string_map_segments&,string_map_segments&,string_map_segments&,string_map_segments&,int,int score=40);
    void TSS_LOAD(void);
    bool LOAD_BATCH(QStringList &QL, QStringList &PFL);
signals:
    void finished(void);
};

#endif
