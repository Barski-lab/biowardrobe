#ifndef _Template_
#define _Template_


#include <config.hpp>

#define FSTM Template


class FSTM: public QThread
{

 private:
  
  QSqlError sqlErr;
  QSqlQuery q;
  
 public:
   
  
  void run(void);
  
  
  FSTM(QObject* parent=0);
  ~FSTM();  
};

#endif
