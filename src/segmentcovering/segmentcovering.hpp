#ifndef _SegmentCovering_
#define _SegmentCovering_


#include <config.hpp>

#define FSTM SegmentCovering


class FSTM: public QThread
{
 Q_OBJECT
 private:
 
  
  QSqlError sqlErr;
  QSqlDatabase db;
  QSqlQuery q;
  
 public:
   
  
  void run(void);
  
//  void DB(void);
  
  FSTM(QObject* parent=0);
  ~FSTM();  
};

#endif
