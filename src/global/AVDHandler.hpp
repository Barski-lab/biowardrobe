#ifndef AVDHandler_H
#define AVDHandler_H

#include <config.hpp>

template <class StorageIn1,class StorageIn2,class Result>
class AVDHandler : public QState
{
//	Q_OBJECT

private:
    StorageIn1 *sql_input;
    StorageIn2 *sam_input;
    
//    HandledData *hd;
    Result *hd;
    
    QSettings setup;

public:

    AVDHandler(StorageIn1 *sql,StorageIn2 *sam,Result &output,QState *parent=0);
    ~AVDHandler();

//    void onEntry1(QEvent* event);
    void AVD1(void);
    void AVD2(void);

protected:
    
    virtual void onEntry(QEvent* event);

};

#include <AVDHandler.cpp>
#endif //
