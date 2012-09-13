#ifndef _Bam2Bedgraph_
#define _Bam2Bedgraph_


#include <config.hpp>


#define FSTM Bam2Bedgraph


class Bam2Bedgraph: public QThread
{
 Q_OBJECT
 private:
 
  
/*  QSqlError sqlErr;
  QSqlDatabase db;
  QSqlQuery q;
*/  
 public:
   
  
  void run(void);
  
//  void DB(void);
  
  FSTM(QObject* parent=0);
  ~FSTM();  
};

#endif
