
//#include "SqlReader.hpp"


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
SqlReader<Storage>::SqlReader(Storage *o,QString iqn,QString iqnns,QState *parent):
 QState(parent),
 output(o),
 iniQueryNameSense(iqn),
 iniQueryNameNSense(iqnns)
{
 // if(!setup.contains("SQL/DRIVER"))
 //     setup.setValue("SQL/DRIVER","QMYSQL");
 // if(!setup.contains("SQL/DBNAME"))
 //     setup.setValue("SQL/DBNAME","hg18");
 // if(!setup.contains("SQL/HOST"))
 //     setup.setValue("SQL/HOST","10.0.2.2");
 // if(!setup.contains("SQL/PORT"))
 //     setup.setValue("SQL/PORT",3306);
 // if(!setup.contains("SQL/USER"))
 //     setup.setValue("SQL/USER","root");    
 // if(!setup.contains("SQL/PASS"))
 //     setup.setValue("SQL/PASS",qCompress("").toBase64());

 // if (!QSqlDatabase::drivers().contains(setup.value("SQL/DRIVER").toString()))
	//{
	// qDebug()<<"No SQL driver. Drivers list:"<<QSqlDatabase::drivers();
	// throw 1;
	//}
 // else
	//{
 //    db = QSqlDatabase::addDatabase(setup.value("SQL/DRIVER").toString());
 //    db.setDatabaseName(setup.value("SQL/DBNAME").toString());
 //    db.setHostName(setup.value("SQL/HOST").toString());
 //    db.setPort(setup.value("SQL/PORT").toInt());
 //    if (!db.open(setup.value("SQL/USER").toString(),
 //        qUncompress(QByteArray::fromBase64(setup.value("SQL/PASS").toByteArray())) ) ) 
	//  {
 //       sqlErr = db.lastError();
 //       qDebug()<<qPrintable(tr("Error connect to DB:")+sqlErr.text());
 //       throw 1;
 //     }      
 //    }
}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
void SqlReader<Storage>::onEntry(QEvent*)
{
  QSqlQuery q;

  if(!q.exec(setup.value(iniQueryNameSense).toString()))
    {
      sqlErr = q.lastError();
      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text());
    }

  while (q.next()) 
    {
     output->setGene('+',q.value(0).toString(),q.value(1).toInt(),1, q.value(2).toInt()-q.value(1).toInt()+1 );
     output->total++;
    } 

  if(setup.contains(iniQueryNameNSense))
  {
   if(!q.exec(setup.value(iniQueryNameNSense).toString()))
     {
      sqlErr = q.lastError();
      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text());	   
     }

   while (q.next()) 
     {
      output->setGene('-',q.value(0).toString(),q.value(1).toInt(),1,q.value(2).toInt()-q.value(1).toInt()+1);
      output->total++;
     }
  }
}
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
SqlReader<Storage>::~SqlReader()
{
}

