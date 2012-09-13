#include "PostHandler.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
PostHandler::~PostHandler()
{
}

//-------------------------------------------------------------
//-------------------------------------------------------------
PostHandler::PostHandler(HandledData &i,HandledData &o,QState * parent):
 QState(parent),
 hdi(&i),
 hdo(&o)
{
}

//-------------------------------------------------------------
//-------------------------------------------------------------
void PostHandler::onEntry(QEvent*)
{

 hdo->SetSize(hdi->width,1);


 for(quint32 w=0; w<hdi->width;w++)
 {
  hdo->data[0][w]=hdi->data[0][w];//+ na +
  hdo->data[0][w]+=hdi->data[3][hdi->width-w-1];//- na -

  hdo->data[0][w]+=hdi->data[2][hdi->width-w-1];//+ na -
  hdo->data[0][w]+=hdi->data[1][w];//- na +
 }

 #define z 20
 
 for(quint32 w=0; w<hdi->width-z;w++)
 {
  float aver=0;
  for(int q=0;q<z; q++){
     aver+=hdo->data[0][w+q];
    }

  aver=aver/z;  
  hdo->data[0][w]=aver;//- na +
 }
}//end of function


//-------------------------------------------------------------
//-------------------------------------------------------------



