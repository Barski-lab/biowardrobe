

#include "sam2bedgraph.hpp"

//#include <Reads.hpp>


Sam2Bedgraph::Sam2Bedgraph(QObject *parent):
 QStateMachine(parent),
 finalState(new QFinalState())
 {

//  s3  =new BEDHandler(&sam_data,bed_data);
 
/*  s1  =new SqlReader(&sql_data,"QUERIES/SENSE_SITE_QUERY","QUERIES/NSENSE_SITE_QUERY");
  s2  =new SamReader(&sam_data);
  s3  =new AVDHandler(&sql_data,&sam_data,avd_data);
  s4  =new PostHandler(avd_data,post_data);
  s4_1=new QState(QState::ParallelStates);
  s5  =new FileWriter(post_data,setup.value("outFileName").toString(),s4_1);
  s6  =new MGLWriter (post_data,setup.value("outFileName").toString(),s4_1);
  
   
  s1  ->addTransition(s2);
  s2  ->addTransition(s3);
  s3  ->addTransition(s4);
  s4  ->addTransition(s4_1);
//  s4_1->addTransition(s5);
  
  s4_1->addTransition(finalState);

  this->addState(s1);
  this->addState(s2);
  this->addState(s3);
  this->addState(s4);
  this->addState(s4_1);
//  this->addState(s5);
//  this->addState(s6);
*/
  s2  =new sam_reader(&sam_data);
  s3  =new bed_handler(sam_data,bed_data);

  s2  ->addTransition(s3);

  this->addState(s2);
  this->addState(s3);
  this->addState(finalState);

  s3->addTransition(finalState);
  
  this->setInitialState(s2);
 }

Sam2Bedgraph::~Sam2Bedgraph()
 {
//  delete s1;
  delete s2;
  delete s3;
//  delete s4;
//  delete s4_1;
//  delete s5;
//  delete s6;
  delete finalState; 
 }
