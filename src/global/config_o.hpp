#ifndef _CONFIG_HPP_
#define _CONFIG_HPP_

#include <QCoreApplication>
#include <QString>
#include <QBitArray>
#include <QDir>
#include <QFile>
#include <QTimer>
#include <QTime>
#include <QDateTime>
#include <QVector>
#include <QSettings>
#include <QTextCodec>
#include <QObject>
#include <QtSql>
#include <QHash>
#include <QState>
#include <QStateMachine>
#include <QtDebug>
#include <QThread>
#include <QMutex>
#include <QtGui/QtGui>
#include <QtSvg/QtSvg>


#include <Arguments.hpp>

#ifdef D_USE_BAM
#include <api/BamMultiReader.h>
#include <api/BamWriter.h>

using namespace BamTools;
#endif

#include <typeinfo>
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <sstream>
#include <string>
#include <vector>
using namespace std; 

#ifndef Q_MOC_RUN
 #include <boost/numeric/interval.hpp>
 #include <boost/icl/separate_interval_set.hpp>
 #include <boost/icl/interval_map.hpp>

namespace bicl = boost::icl;
#endif

#ifdef D_USE_SAM
#include <sam.h>
#endif

#ifndef _WIN32
#include <pwd.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <syslog.h>
#include <signal.h>
#include <sys/stat.h> 
#include <assert.h>
#endif 

#define _MAX_SQ_SN 255


class GenomeDescription
{
 public:
  quint64              notAligned;                  // number of reads (ussualy form sam/bam file) that are not aligned
  quint64              total;
  quint64              tot_len;
  
  QMap<QChar,QMap<QString,QMap<qint32,qint32> > > genome;
  QMap<QChar,QMap<QString,QMap<qint32,QString> > > genome_h;
  
//  QMap<qint32,quint32> senseStrand[_MAX_SQ_SN];     // position of interest on sense strand [#chromosome]
//  QMap<qint32,quint32> nonsenseStrand[_MAX_SQ_SN];  // position of interest on nonsense strand [#chromosome]
//  QList<QString>       dictionary;                  // index of chromosome

  /*
  */
  void setGene(const QChar &sense,const QString &chrName,const qint32 &pos,const qint32 &quantity,const qint32& =0)
  {
   ((genome[sense])[chrName])[pos]+=quantity;
  };

  /*
  */
  void setGene(const QChar &sense,const QString &chrName,const qint32 &pos,const qint32 &quantity,QString gene)
  {
   ((genome[sense])[chrName])[pos]+=quantity;
   ((genome_h[sense])[chrName])[pos]=gene;
  };

  /*
  */
  GenomeDescription():
   notAligned(0),
   total(0)
   {};
};
//----------------------------------------------------------------------
//----------------------------------------------------------------------
class HandledData
{
 public:
  quint32 width;
  quint32 height;
  QMap<QString,QList< qreal > > _data;

  double **data;
  
  HandledData():
  width(0),
  height(0),
  data(NULL)
  {};
  
  HandledData(quint32 w, quint32 h)
   {
    SetSize(w,h);
   };

  HandledData(HandledData &hd):
  width(hd.width),
  height(hd.height),
  data(hd.data)
  {};

  void SetSize(quint32 w,quint32 h)
   {
    width=w; height=h;
    data=new double* [sizeof(double*)*h];
    while(h--)
     {
      data[h]=new qreal[sizeof(double)*w];
      memset(data[h],0,sizeof(double)*w);
     }
   };
  
  ~HandledData()
   {
    while(height--)
     delete [] data[height];
    delete [] data;  
    data=NULL;
   };
};

#define CONCAT_IMPL( x, y ) x##y
#define MACRO_CONCAT( x, y ) CONCAT_IMPL( x, y )
#define MAKE_NAME( a ) MACRO_CONCAT( a, __COUNTER__ )
//#define MAKE_NAME( a ) MACRO_CONCAT( a, __LINE__ )

#define GLOBALCALL static int MAKE_NAME(_dummy) = []()->int

#endif
