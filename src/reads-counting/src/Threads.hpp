#ifndef _Threads_
#define _Threads_


#include <config.hpp>
#include <ReadsCounting.hpp>


//-------------------------------------------------------------------------------------------------------
class sam_reader_thread: public QThread
{
    Q_OBJECT

private:
    gen_lines *sam_data;
    QString fileName; 
    IsoformsOnChromosome* isoforms;

public:   

    sam_reader_thread(QString fn,gen_lines *sd,IsoformsOnChromosome* io):
      sam_data(sd),
      fileName(fn),
      isoforms(io)
      {};

protected:

    void run(void);
};

#endif
