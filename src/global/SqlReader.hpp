#ifndef SQLDB_H
#define SQLDB_H

#include <config.hpp>
#include <Reads.hpp>

template <class Storage>
class SqlReader : public QState
{
//	Q_OBJECT
//private:

public:
    SqlReader(Storage *o,QString iqns,QString iqnns,QState *parent=0);
	~SqlReader();

protected:
    
    virtual void onEntry(QEvent* event);
    
private:

//    GenomeDescription *output;
    Storage *output;
    QString iniQueryNameSense;
    QString iniQueryNameNSense;

	QSqlError sqlErr;
	QSqlDatabase db;
    QSettings setup;
    QSqlQuery q;

};

#include <SqlReader.cpp>
#endif // SQLDB_H
