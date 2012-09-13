#ifndef _AVERAGEDENSITY_
#define _AVERAGEDENSITY_


#include <config.hpp>

#include <Reads.hpp>
#include <SamReader.hpp>

#include <boost/icl/separate_interval_set.hpp>

namespace bicl = boost::icl;

//#include <SqlReader.hpp>
//#include <AVDHandler.hpp>
//#include <FileWriter.hpp>
//#include <PostHandler.hpp>
//#include <MGLWriter.hpp>

#define FSTM SNP

typedef genome::GenomeDescription gen_lines;

typedef SamReader<gen_lines> sam_reader;

class FSTM: public QThread
{
 Q_OBJECT
 private:
 
  
  QSqlError sqlErr;
  QSqlDatabase db;
  QSqlQuery q;
  QSettings      setup;

  
 public:
   
//  sam_reader    *s1;  
//  sam_reader    *s2;  

  gen_lines sam_data1;
  gen_lines sam_data2;
  
  void run(void);
  
//  void DB(void);
  
  FSTM(QObject* parent=0);
  ~FSTM();  
};

class sam_reader_thread: public QThread
{
 public:
   
  sam_reader    *s;  
  gen_lines *sam_data;
  QString fileName; 
  sam_reader_thread(gen_lines *sd,QString fn):sam_data(sd),fileName(fn){};
  void run(void){
   s  =new sam_reader(sam_data,fileName);
   s->Load();
   exit();
  }
};


class sam_data_searcher: public QThread
{
 public:
  
  QList<double> *list;   
  gen_lines  *sam_data;
  QMap<QString,bicl::separate_interval_set<int> > *map;

  sam_data_searcher(QList<double> *l,gen_lines * sd,QMap<QString,bicl::separate_interval_set<int> > *m)
   :list(l),sam_data(sd),map(m){};

  void run(void){
   QString chr;
   foreach(chr,map->keys())
   {
    qDebug()<<"working on:"<<chr;
    for(bicl::separate_interval_set<int>::const_iterator it = (*map)[chr].begin(); it != (*map)[chr].end(); it++)
     {
         double n=0.0;
         bicl::discrete_interval<int> itv  = (*it);
         n+=sam_data->getLineCover(chr+QChar('+')).getStarts(itv.lower(),itv.upper());
         n+=sam_data->getLineCover(chr+QChar('-')).getStarts(itv.lower(),itv.upper());
         if(n==0.0) n=1.0;
         *list<<n;
     }  
   }   
   exit();
  }
};

#endif
