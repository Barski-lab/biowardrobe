#ifndef MGLWriter_H
#define MGLWriter_H

#include <config.hpp>
#include <mgl/mgl_eps.h>
#include <mgl/mgl_zb.h>

class MGLWriter : public QState
{
	Q_OBJECT

private:
    
    HandledData *hd;
    
    QSettings      setup;
    QString        fileName;
    mglData        array;
    mglGraph       *graph;
public:

    MGLWriter(HandledData &in,QString _fileName,QState *parent=0);
    MGLWriter(HandledData &in,QString _fileName,ChildMode childmode,QState *parent=0);
    ~MGLWriter();

protected:
    
    virtual void onEntry(QEvent* event);

};

#endif
