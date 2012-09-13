#ifndef BEDHandler_H
#define BEDHandler_H

#include <config.hpp>
#include <Reads.hpp>

#if 0
GLOBALCALL{
 Arguments::addArg("no-bed-file","no-bed-file","",QVariant::Bool,"Do not create bed file",false);
 return 0;
}();
#endif

template <class Storage, class Result>
class BEDHandler : public QState
{

private:

    Storage *sam_input;        
    Result *output;
    
    QSettings setup;

    QFile _outFile;
    bool create_file;
public:

    BEDHandler(Storage &sam,Result &output,QState *parent=0);
//    BEDHandler(Storage &sam,QState *parent=0);
    ~BEDHandler();
    void Load(void);
protected:
#ifdef _SQL_
    QSqlError sqlErr;
    QSqlQuery i_q;
    QString sql_prep;
#endif
    virtual void onEntry(QEvent* event);

};

#include <BEDHandler.cpp>

#endif //
