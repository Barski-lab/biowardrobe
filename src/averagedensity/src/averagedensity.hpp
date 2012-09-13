#ifndef _AVERAGEDENSITY_
#define _AVERAGEDENSITY_

#include <config.hpp>

#include <Reads.hpp>
#include <SqlReader.hpp>
#include <SamReader.hpp>
#include <AVDHandler.hpp>

#define _NORMAL

#define FSTM AverageDensity

typedef genome::GenomeDescription gen_lines;

typedef SqlReader<gen_lines> sqlReader;
typedef SamReader<gen_lines> sam_reader;
typedef AVDHandler<gen_lines,gen_lines,HandledData> AVD_Handler;

class AverageDensity: public QThread
{
 private:
 
  //States
  AVD_Handler   *s3;
//  FileWriter    *s5;

  //Input Output Data
  gen_lines     sam_data;    
  
 public:
  void run(void);
  template<typename T>
  static QList<T> smooth(const QList<T>&,const int &);
  template<typename T>
  static T mean(const QList<T>&,const int&,const int&);
  AverageDensity(QObject* parent=0);
  ~AverageDensity();  
};


class sam_reader_thread: public QThread
{
 public:
   
  sam_reader    *s;  
  gen_lines *sam_data;
  QString fileName; 
  sam_reader_thread(gen_lines *sd):sam_data(sd){};
  void run(void){
   s  =new sam_reader(sam_data);
   s->Load();
   exit();
  }
};


#endif
