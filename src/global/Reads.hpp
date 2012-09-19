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

typedef unsigned int t_genome_coordinates;
typedef unsigned int t_reads_count;
typedef bicl::discrete_interval<t_genome_coordinates> interval_type;

/**********************************************************************************

**********************************************************************************/
class Read
{
public:

    Read():
      multiplying(1),
          length(0),
        position(interval_type::closed(0,0)),
        positions(make_pair(interval_type::closed(0,0),0)),
        sentenceRepresentation(""),
        qualityRepresentation("")
      {};

      Read(Read const &r):
      multiplying(r.multiplying),
          length(r.length),
          position(r.position)
      {
          sentenceRepresentation=r.sentenceRepresentation;
          qualityRepresentation=r.qualityRepresentation;
      };


      Read(int start,int len,QString sr="",QString qr=""):
      multiplying(1),
          length(len),
          position(bicl::discrete_interval<t_genome_coordinates>::closed(start,start+len-1)),
          sentenceRepresentation(sr),
          qualityRepresentation(qr)
      {};

      Read(int start,int len,int num,QString sr="",QString qr=""):
      multiplying(num),
          length(len),
          position(bicl::discrete_interval<t_genome_coordinates>::closed(start,start+len-1)),
          sentenceRepresentation(sr),
          qualityRepresentation(qr)
      {};

      Read(bicl::interval_map<t_genome_coordinates,t_reads_count> p,int len,QString sr="",QString qr=""):
      multiplying(1),
          length(len),
          positions(p),
          sentenceRepresentation(sr),
          qualityRepresentation(qr)
      {};

      int&  getLevel()   {return multiplying;};
      void plusLevel()  {++multiplying;};
      int  getStart()   {return position.lower();};
      int&  getLength()  {return length;};
      interval_type& getInterval(){return position;};
      Read& getMyself(void) {return *this;};

      void  operator+= (const int& c) {this->multiplying+=c;};
      bool  operator== (const Read& r) const {return this->position==r.position;};
      bool  operator!= (const Read& r) const {return this->position!=r.position;};
      void  operator++ (int) {this->multiplying++;};
      Read & operator= (const Read &r);

private:
    int multiplying;
    int length;
    //  read_position position;
    bicl::discrete_interval<t_genome_coordinates> position; //::closed(s,e)
    bicl::interval_map<t_genome_coordinates,t_reads_count> positions;
    QString sentenceRepresentation;
    QString qualityRepresentation;
};


/**********************************************************************************

**********************************************************************************/
typedef QMap<int,Read> cover_map;

class Cover
{
 public:
  Cover():max_len(0),length(0){};

  void add(Read&);
  int  getHeight(int);//not implemented yet. number of overlaped reads at coordinate
  int  getHeight(int,int);//not implemented yet. number of overlaped reads between coordinates
  int  getStarts(int); //get number of reads starts at exact position
  int  getStarts(int,int); //get number of reads starts at segment between
  QList<int> getStarts(); //get set of coordinates where reads starts
  void setLength(int);

  cover_map::iterator getBeginIterator(){return covering.begin();};
  cover_map::iterator getEndIterator(){return covering.end();};

  cover_map::iterator getUpperBound(int Key){return covering.upperBound(Key);};

 bool  operator== (const Cover& c) const {return this==&c;};

 bool isEmpty(){return covering.size()==0;};

// static Cover empty(){ return Cover();};

 private:
  cover_map covering;

  bicl::interval_map<t_genome_coordinates,t_reads_count> m_covering;

  int max_len;
  int length;
};

/**********************************************************************************

**********************************************************************************/
class Lines
{
 public:
  Lines():length(0){};
  Lines(Lines&):length(0){};
  void  addLine(QString, Read&);
  void  setLength(quint64 l);
  void  setLength(const QChar &sense,const QString &chrName, quint64 l);
  Cover& getLineCover(QString);

  QList<QString> getLines(void)
  {
   return lines.keys();
  };
  /*
  */

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
  quint64              total;
  quint64              tot_len;                     //total hromosome length
  /*
  */
  void setGene(const QChar &sense,const QString &chrName,const qint32 &pos,const qint32 & num,const qint32 &len)
  {
    Read r(pos,len,num);
    addLine(chrName+sense,r);
  };
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

