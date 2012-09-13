#ifndef ARGUMENTS_HPP
#define ARGUMENTS_HPP

#include <qvariant.h>
#include <qstring.h>
#include <qstringlist.h>
#include <qsettings.h>
#include <qfileinfo.h>
#include <qmutex.h>

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

//#ifndef Q_MOC_RUN
//
//#include <boost/preprocessor/arithmetic/inc.hpp>
//#include <boost/preprocessor/control/if.hpp>
//#include <boost/preprocessor/facilities/empty.hpp>
//#include <boost/preprocessor/comparison/equal.hpp>
//#include <boost/preprocessor/comparison/greater.hpp>
//
//#endif

/*
 Singleton class to parse arguments after QApplication call
*/
class Arguments
{
public:
	enum en_In { COMMAND, INI, BOTH };
	struct _ArgDescr{
		QString _cname;
		QString _ininame;
		QVariant::Type _type;
		QVariant _value;
		QVariant _defValue;
		QString _descr;
		bool _required;
		_ArgDescr():
			_type(QVariant::Invalid),
			_required(false){};
		_ArgDescr(QString _c, QString _i,QVariant::Type _t,	QVariant _def,QString _d,bool _r=false):
			_cname(_c),
			_ininame(_i),
			_type(_t),
			_defValue(_def),
			_descr(_d),
			_required(_r){};
	};
	static Arguments& Instance();
	void Init(QStringList/*arguments list*/);
//	static QStringList
	
private:
	/*Constructor and variables which allows singleton creation*/
	static Arguments* volatile m_pArgumentsInstance;
	Arguments();
	Arguments(Arguments const&){};
	Arguments& operator = (Arguments const&){ return Arguments::Instance();};

    ~Arguments();

	/*Protected static variables*/
    static QMutex mutex;
	static QSettings      *setup;

public:
    static void addArg(QString key,QString _c/*command line argument*/, QString _i/*name in ini file*/,QVariant::Type _t, QString _d,QVariant _def,bool _r=false/*is argument required or not*/);
    static void argsList(void);
    static void usage(void);
    static QMap<QString,_ArgDescr>& getVarValStorage();
    QFileInfo fileInfo(const QString&);
    QStringList split(const QString&,const QChar&);
    QVariant &getArgs(QString key);
};

#define gArgs()  (Arguments::Instance())

/*
//#define gArgs_(n) \
//	BOOST_PP_IF( \
//	BOOST_PP_EQUAL(n,1),GARGS_INIT_1(), \
//	BOOST_PP_IF( \
//	BOOST_PP_GREATER(n,1),(*_gArgs), \
//	BOOST_PP_EMPTY())) 
*/


#endif // ARGUMENTS_HPP
