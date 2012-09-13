#include "Bam2Bedgraph.hpp"

#include <SamReader.hpp>
#include <Reads.hpp>
#include <BEDHandler.hpp>

typedef genome::GenomeDescription gen_lines;

typedef SamReader<gen_lines> sam_reader;
typedef BEDHandler<gen_lines,HandledData> bed_handler;


FSTM::FSTM(QObject *parent):
 QThread(parent)
 {
 }

FSTM::~FSTM()
 {
 }

void FSTM::run()
 {  
     try{
         gen_lines sam_data;
         sam_reader    *s=new sam_reader(&sam_data);  
         s->Load();

         HandledData bed_data;
         bed_handler   *s3=new bed_handler(sam_data,bed_data);
         s3->Load();

         delete s;
         delete s3;
     }
     catch(char *str)
     {
         cerr << "Error rised:"<<str << endl;
     }
     catch(...)
     {
         //cerr << "Caught " << e.what( ) << endl;
         //cerr << "Type " << typeid( e ).name( ) << endl;
     }

     exit();
 }
