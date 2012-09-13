#include "MGLWriter.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
MGLWriter::~MGLWriter()
{
// delete array;
 setup.sync();
 delete graph;
}
//-------------------------------------------------------------
//-------------------------------------------------------------
MGLWriter::MGLWriter(HandledData &in,QString _fileName,QState * parent):
 QState(parent),
 hd(&in),
 fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
MGLWriter::MGLWriter(HandledData &in,QString _fileName,ChildMode childmode,QState * parent):
 QState(childmode,parent),
 hd(&in),
 fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
void MGLWriter::onEntry(QEvent*)
{
   int i=0,j=0,k=0;
   float max;
   
   array.Set((const double **)hd->data,hd->height,hd->width);
   max=array.Maximal(i,j,k);

   if(!setup.contains("PLOT/maxY"))
       setup.setValue("PLOT/maxY",max+max*0.15);
   float maxY=setup.value("PLOT/maxY").toDouble();
//PS
   graph = new mglGraphZB(setup.value("PLOT/width",1920).toInt()
                         ,setup.value("PLOT/height",1080).toInt());
//qDebug()<<"max:"<<max;
//qDebug()<<"i:"<<i;
//qDebug()<<"j:"<<j;
//qDebug()<<"k:"<<k;

   graph->Axis(mglPoint(hd->width/-2.0,0),mglPoint(hd->width/2.0,maxY));
   graph->SetFontSize(1.5);
   graph->SetTuneTicks(false,0);
   graph->SetTicks('x',hd->width/10.0,4);
   graph->SetTicks('y',maxY/10.0,4);
   graph->Grid();
   graph->Box();
   graph->Printf(mglPoint(i-(hd->width/2),max),"%.2e",max);
   
   graph->Title(setup.value("PLOT/fileName").toString().toLocal8Bit().data());
   graph->Label('x',setup.value("PLOT/xname").toString().toLocal8Bit().data());
   graph->Label('y',setup.value("PLOT/yname").toString().toLocal8Bit().data());
   graph->Axis();
   //Show x position of MAX avg
   graph->SetTicksVal('x', 1, i-(hd->width/2), (QString::number(i-(hd->width/2))).toLocal8Bit().data() );
   graph->Axis();
   graph->Plot(array);
//   graph->WriteSVG("/media/sf_G_DRIVE/Examples/test.svg");
//   graph->WriteEPS("/media/sf_G_DRIVE/Examples/test.eps");
   graph->WritePNG((setup.value("PLOT/fileName").toString()+".png").toLocal8Bit().data());
//   graph->WriteSVG((setup.value("PLOT/fileName").toString()+".svg").toLocal8Bit().data());
//   graph->WriteEPS((setup.value("PLOT/fileName").toString()+".eps").toLocal8Bit().data());

}//end of function



//-------------------------------------------------------------
//-------------------------------------------------------------



