/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the averagedensity module of the genome-tools.
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

#ifndef _AVERAGEDENSITY_
#define _AVERAGEDENSITY_

#include <config.hpp>

#include <Reads.hpp>
#include <SamReader.hpp>


#ifndef FSTM
#define FSTM AverageDensity
#endif

typedef genome::GenomeDescription gen_lines;


class sam_reader_thread;

struct DNA_SEQ_DATA {
        int fragmentsize;
        bool pair;
        gen_lines* sam_data;
};

class AverageDensity: public QObject
{
    Q_OBJECT
private:

    QList<gen_lines*>           sam_data;
    QList<sam_reader_thread*>   t_queue;
    QSqlQuery                   q;
    QStringList                 fileLabels;

    void batchfile(void);
    void batchsql(void);

public slots:
    void start(void);

signals:
    void finished(void);

public:
    template<typename T>
    void getReadsAtPointS(genome::cover_map::iterator i,genome::cover_map::iterator e, quint64 const& start,quint64 const& end,bool reverse, int shift,T& result,bool pair);
    template<class T>
    void getReadsAtPoint(genome::cover_map::iterator i,genome::cover_map::iterator e, quint64 const& start,quint64 const& end,bool reverse, quint64 shift,quint64 mapping, T& result);

    template <class T>
    void AVD(quint64 start,quint64 end,QString chrome,bool reverse,quint64 shift,quint64 mapping,gen_lines* input,T& result);
    template <class T>
    void AVDS(quint64 start,quint64 end,QString chrome,bool reverse,int shift, gen_lines* input,T& result,bool pair);


    template<typename T>
    static QList<T> smooth(const QList<T>&,const int &);

    template<typename T>
    static T mean(const QList<T>&,const int&,const int&);

    AverageDensity(QObject* parent=0);
    ~AverageDensity();
};


class sam_reader_thread: public QRunnable
{

public:

    gen_lines               *sam_data;
    QString                  fileName;

    sam_reader_thread(gen_lines *sd,QString fn):
        sam_data(sd),
        fileName(fn)
    {
        this->setAutoDelete(true);
    };

    void run(void){
        SamReader<gen_lines> s(fileName,sam_data);
        s.Load();
    }

};



#endif
