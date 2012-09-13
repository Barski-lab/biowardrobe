#ifndef PoissonHandler_H
#define PoissonHandler_H

#include <config.hpp>

class PoissonHandler : public QState
{
	Q_OBJECT

private:
    GenomeDescription *sql_input;
    GenomeDescription *sam_input;
    
//    HandledData *hd;
    
    QSettings setup;

public:

    PoissonHandler(GenomeDescription *sql,GenomeDescription *sam,HandledData &output,QState *parent=0);
    ~PoissonHandler();

protected:
    
    virtual void onEntry(QEvent* event);

};

#endif //
