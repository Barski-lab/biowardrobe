#ifndef FileWriter_H
#define FileWriter_H

#include <config.hpp>

class FileWriter : public QState
{
	Q_OBJECT

private:
    
    HandledData *hd;
    
//    QSettings      setup;
    QString        fileName;

public:

    FileWriter(HandledData &in,QState *parent=0);
    FileWriter(HandledData &in,QString _fileName,QState *parent=0);
    FileWriter(HandledData &in,QString _fileName,ChildMode childMode,QState *parent=0);
    void Load(void);
    ~FileWriter();

protected:
    
    virtual void onEntry(QEvent* event);
//    virtual void onExit(QEvent* event);


};

#endif
