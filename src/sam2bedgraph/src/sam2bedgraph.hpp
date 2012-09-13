#ifndef _SAM2BEDGRAPH_
#define _SAM2BEDGRAPH_

#include <config.hpp>

//#include <SqlReader.hpp>
#include <Reads.hpp>
#include <SamReader.hpp>
#include <AVDHandler.hpp>
#include <FileWriter.hpp>
#include <PostHandler.hpp>
#include <BEDHandler.hpp>
//#include <MGLWriter.hpp>

#define FSTM Sam2Bedgraph


typedef genome::GenomeDescription gen_lines;
typedef SamReader<gen_lines> sam_reader;
typedef BEDHandler<gen_lines,HandledData> bed_handler;


class Sam2Bedgraph: public QStateMachine
{
 private:
 
  //States
//  SqlReader     *s1;
  sam_reader    *s2;
  bed_handler   *s3;
//  PostHandler   *s4;
  QState        *s4_1;
  FileWriter    *s5;
//  MGLWriter     *s6;

  QFinalState   *finalState;

  //Input Output Data
//  GenomeDescription     sql_data;    
  gen_lines             sam_data;    

//  GenomeDescription     sam_data;    

  HandledData bed_data;
  HandledData post_data;
  
  QSettings      setup;
  
 public:

  Sam2Bedgraph(QObject* parent=0);
  ~Sam2Bedgraph();  
};

#endif
