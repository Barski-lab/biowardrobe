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
#include <SqlReader.hpp>
#include <SamReader.hpp>
#include <AVDHandler.hpp>

#define _NORMAL

#define FSTM AverageDensity

typedef genome::GenomeDescription gen_lines;

typedef SqlReader<gen_lines> sqlReader;
typedef SamReader<gen_lines> sam_reader;
typedef AVDHandler<gen_lines,gen_lines,HandledData> AVD_Handler;

class sam_reader_thread;

class AverageDensity: public QObject
{
    Q_OBJECT
private:

    //States
    AVD_Handler   *s3;
    QList<gen_lines*>  sam_data;
    QList<sam_reader_thread*> t_queue;
    QSqlQuery q;
    QStringList fileLabels;

public slots:
    void start(void);
signals:
    void finished(void);
public:
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

  sam_reader    *s;
  gen_lines *sam_data;
  QString fileName;
  sam_reader_thread(gen_lines *sd,QString fn):sam_data(sd),fileName(fn){this->setAutoDelete(true);};

  void run(void){
   s  =new sam_reader(fileName,sam_data);
   s->Load();
  }

  ~sam_reader_thread(){delete s;};
};


#endif
