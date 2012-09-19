#ifndef _CONFIG_HPP_
#define _CONFIG_HPP_

#ifdef D_USE_SAM
#ifdef D_USE_BAM
#error "BAM and SAM cannot be defined together"
#endif
#endif

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
#include <QRunnable>
#include <QThreadPool>
#include <QtGui/QtGui>
#include <QtSvg/QtSvg>
#include <QSharedPointer>

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
 #include <boost/icl/interval.hpp>
 #include <boost/icl/closed_interval.hpp>
 #include <boost/icl/interval_map.hpp>
 #include <boost/icl/interval_set.hpp>
 #include <boost/icl/separate_interval_set.hpp>
 //#include <boost/icl/concept/interval_associator.hpp>
 //#include <boost/shared_ptr.hpp>
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

#ifdef _WIN32
#include <windows.h>
#define sleep Sleep
#endif

#define _MAX_SQ_SN 255

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
