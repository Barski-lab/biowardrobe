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
#ifndef _READS_29122011_HPP_
#define _READS_29122011_HPP_

#include <QString>
#include <QMap>
#include <QtDebug>

#ifndef Q_MOC_RUN
#include <boost/icl/interval.hpp>
#include <boost/icl/closed_interval.hpp>
#include <boost/icl/interval_map.hpp>
#include <boost/icl/separate_interval_set.hpp>

namespace bicl = boost::icl;
#endif

namespace genome {

typedef quint64 t_genome_coordinates;
typedef unsigned int t_reads_count;
typedef bicl::discrete_interval<t_genome_coordinates> interval_type;
typedef bicl::interval_set<t_genome_coordinates> read_representation;

/**********************************************************************************

**********************************************************************************/
class Read
{
public:

    Read():
        multiplying(0),
        length(0),
        strand(false),
        m_read_representation(interval_type::closed(0,0)),
        sentenceRepresentation(""),
        qualityRepresentation("")
    {};

    Read(Read const &r):
        multiplying(r.multiplying),
        length(r.length)
    {
        strand=r.strand;
        sentenceRepresentation=r.sentenceRepresentation;
        qualityRepresentation=r.qualityRepresentation;
        this->m_read_representation=r.m_read_representation;
    };


//    Read(int start,int len,bool st=true,QString sr="",QString qr=""):
//        multiplying(1),
//        length(len),
//        strand(st),
//        //position(interval_type::closed(start,start+len-1)),
//        m_read_representation(interval_type::closed(start,start+len-1)),
//        sentenceRepresentation(sr),
//        qualityRepresentation(qr)
//    {};

//    Read(int start,int len,int num,bool st=true,QString sr="",QString qr=""):
//        multiplying(num),
//        length(len),
//        strand(st),
//        m_read_representation(interval_type::closed(start,start+len-1)),
//        sentenceRepresentation(sr),
//        qualityRepresentation(qr)
//    {};

    Read(read_representation p,bool st=true,int num=1,QString sr="",QString qr=""):
        multiplying(num),
        length(p.size()),
        strand(st),
        m_read_representation(p),
        sentenceRepresentation(sr),
        qualityRepresentation(qr)
    {};

    int&  getLevel();//   {return multiplying;};
    int   getStart();//   {return bicl::key_value<read_representation>(m_read_representation.begin()).lower();};
    int   getEnd();
    int&  getLength();//  {return length;};
    read_representation& getInterval();
    Read& getMyself(void);// {return *this;};

    void  operator+= (const int& c);// {this->multiplying+=c;};
    bool  operator== (const Read& r) const;// {return this->m_read_representation==r.m_read_representation;};
    bool  operator!= (const Read& r) const;// {return this->m_read_representation!=r.m_read_representation;};
    void  operator++ (int);// {this->multiplying++;};
    Read & operator= (const Read &r);

private:
    int multiplying;
    int length;
    bool strand;
    //  read_position position;
    //interval_type position; //::closed(s,e)
    read_representation m_read_representation;
    QString sentenceRepresentation;
    QString qualityRepresentation;
};


/**********************************************************************************

**********************************************************************************/
typedef QMap<int,QList<Read> > cover_map;

class Cover
{
public:
    typedef cover_map::iterator iterator;

    Cover():length(0){};

    void addRead(Read&);

    int  getStarts(int,int); //get number of reads that are starts at particular segment
    QList<int> getStarts(); //get set of coordinates where reads starts
    void setLength(qint64);
    qint64 getLength(void);

    iterator getBeginIterator(){return covering.begin();};
    iterator getEndIterator(){return covering.end();};

    iterator getUpperBound(int Key){return covering.upperBound(Key);};

    iterator getLowerBound(int Key){return covering.lowerBound(Key);};

    bool  operator== (const Cover& c) const {return this==&c;};

    bool isEmpty(){return covering.size()==0;};


    template <typename T>
    static void countReads(QList<Read> &qr,T &tot) {
        for(int c=0;c<qr.size();c++)
            tot+=qr[c].getLevel();
    };



private:
    cover_map covering;
    qint64 length;
};

/**********************************************************************************

**********************************************************************************/
class Lines
{
public:
    Lines():length(0){};
    Lines(Lines&):length(0){};
    void  addRead(QString, Read&);
    void  setLength(quint64 l);
    void  setLength(const QChar &sense,const QString &chrName, quint64 l);
    quint64  getLength(void);
    quint64  getLength(const QChar &sense,const QString &chrName);
    Cover& getLineCover(QString);

    QList<QString> getLines(void);

protected:
    QMap<QString,Cover> lines;
    quint64 length;
    Cover empty;
};

/**********************************************************************************

**********************************************************************************/
class GenomeDescription:
        public Lines
{
public:
    quint64              notAligned;                  // number of reads (ussualy form sam/bam file) that are not aligned
    quint64              total;                       // total number of reads
    quint64              tot_len;                     // total hromosome length

    /*
    */
    //void setGene(const QChar &sense,const QString &chrName,const qint32 &pos,const qint32 & num,const qint32 &len);
    void setGene(const QChar &sense,const QString &chrName,read_representation &r,const qint32 & num);

    /*
    */
    GenomeDescription():Lines(),
        notAligned(0),
        total(0),
        tot_len(0)
    {};

    GenomeDescription(GenomeDescription& a):Lines()
    {
        this->notAligned=a.notAligned;
        this->total=a.total;
        this->tot_len=a.tot_len;
        this->lines=a.lines;
        this->length=a.length;
    };

};

}


#endif

