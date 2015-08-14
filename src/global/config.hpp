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
//#include <QtSvg/QtSvg>
#include <QSharedPointer>

#include <Arguments.hpp>
#include <Settings.hpp>

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
#include <math.h>
using namespace std;

#ifndef Q_MOC_RUN
#ifndef NOBOOST
 #include <boost/icl/interval.hpp>
 #include <boost/icl/closed_interval.hpp>
 #include <boost/icl/interval_map.hpp>
 #include <boost/icl/split_interval_map.hpp>
 #include <boost/icl/interval_set.hpp>
 #include <boost/icl/separate_interval_set.hpp>
 #include <boost/icl/concept/set_value.hpp>
 #include <boost/icl/concept/map_value.hpp>
 //#include <boost/shared_ptr.hpp>
namespace bicl = boost::icl;
#endif
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



#define CONCAT_IMPL( x, y ) x##y
#define MACRO_CONCAT( x, y ) CONCAT_IMPL( x, y )
#define MAKE_NAME( a ) MACRO_CONCAT( a, __COUNTER__ )
//#define MAKE_NAME( a ) MACRO_CONCAT( a, __LINE__ )

#define GLOBALCALL static int MAKE_NAME(_dummy) = []()->int

#endif
