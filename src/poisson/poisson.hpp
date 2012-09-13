#ifndef _POISSON_HPP_
#define _POISSON_HPP_

#include <config.hpp>

#include <SqlReader.hpp>
#include <SamReader.hpp>
#include <PoissonHandler.hpp>
//#include <FileWriter.hpp>
//#include <PostHandler.hpp>
//#include <MGLWriter.hpp>

#define FSTM Poisson

typedef SamReader<GenomeDescription> sam_reader;

class Poisson: public QStateMachine
{
 private:
 
  //States
  SqlReader     *s1;
  sam_reader    *s2;
  PoissonHandler    *s3;
//  PostHandler   *s4;
  QState        *s4_1;
//  FileWriter    *s5;
//  MGLWriter     *s6;

  QFinalState   *finalState;

  //Input Output Data
  GenomeDescription     sql_data;    
  GenomeDescription     sam_data;    

  HandledData avd_data;
  HandledData post_data;
  
  QSettings      setup;
  
 public:

  Poisson(QObject* parent=0);
  ~Poisson();  
};

#endif
