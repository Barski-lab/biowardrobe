

#include "snp.hpp"


FSTM::FSTM(QObject *parent):
 QThread(parent)
 {
 }

FSTM::~FSTM()
 {
 }


/*void FSTM::DB()
{
  if(!setup.contains("SQL/DRIVER"))
      setup.setValue("SQL/DRIVER","QMYSQL");
  if(!setup.contains("SQL/DBNAME"))
      setup.setValue("SQL/DBNAME","hg18");
  if(!setup.contains("SQL/HOST"))
      setup.setValue("SQL/HOST","10.0.2.2");
  if(!setup.contains("SQL/PORT"))
      setup.setValue("SQL/PORT",3306);
  if(!setup.contains("SQL/USER"))
      setup.setValue("SQL/USER","root");    
  if(!setup.contains("SQL/PASS"))
      setup.setValue("SQL/PASS",qCompress("").toBase64());

  if (!QSqlDatabase::drivers().contains(setup.value("SQL/DRIVER").toString()))
	{
	 qDebug()<<"No SQL driver. Drivers list:"<<QSqlDatabase::drivers();
	 throw 1;
	}
  else
	{
     db = QSqlDatabase::addDatabase(setup.value("SQL/DRIVER").toString());
     db.setDatabaseName(setup.value("SQL/DBNAME").toString());
     db.setHostName(setup.value("SQL/HOST").toString());
     db.setPort(setup.value("SQL/PORT").toInt());
     if (!db.open(setup.value("SQL/USER").toString(),
         qUncompress(QByteArray::fromBase64(setup.value("SQL/PASS").toByteArray())) ) ) 
	  {
        sqlErr = db.lastError();
        qDebug()<<qPrintable(tr("Error connect to DB:")+sqlErr.text());
        throw 1;
      }      
     }
}
*/

void FSTM::run()
 {
//  separate_interval_set<int> uniq_interval;
//  discrete_interval<int> inter_val;

  QList<double> l1;
  QList<double> l2;

  QMap<int,int> map;  
  QFile _outFile;
//  int i=0;

  sam_reader_thread *srt1=new sam_reader_thread(&sam_data1,"1.sam");
  srt1->start();
  sam_reader_thread *srt2=new sam_reader_thread(&sam_data2,"2.sam");
  srt2->start();
  
  srt1->wait();
  srt2->wait();
  
  exit();
 }


