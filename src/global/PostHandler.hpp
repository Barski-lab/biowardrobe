#ifndef PostHandler_H
#define PostHandler_H

#include <config.hpp>

class PostHandler : public QState
{
	Q_OBJECT

private:
    
    HandledData *hdi;
    HandledData *hdo;
    
    QSettings setup;

public:

    PostHandler(HandledData &i,HandledData &o,QState *parent=0);
    ~PostHandler();

protected:
    
    virtual void onEntry(QEvent* event);

};

#endif
