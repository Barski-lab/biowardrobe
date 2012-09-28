/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the global module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/

#include "PoissonHandler.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
PoissonHandler::~PoissonHandler()
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
PoissonHandler::PoissonHandler(GenomeDescription *sql,GenomeDescription *sam,HandledData &,QState * parent):
QState(parent),
sql_input(sql),
sam_input(sam)
//hd(&_output)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
void PoissonHandler::onEntry(QEvent*)
{
  if(!setup.contains("AvgTagWindow"))
      setup.setValue("AvgTagWindow",500);

  if(!setup.contains("siteShift"))
      setup.setValue("siteShift",75);

  qint32 window=setup.value("AvgTagWindow").toInt();
  qint32 half_window=0;//window/2;

  qint32 shift=setup.value("siteShift").toInt();

  int c=0;//sense count, even/odd c sense/nonsense

  QMap<QString,int> poisson;
  
//  hd->SetSize(1,sql_input->total);

  QMapIterator<QChar,QMap<QString,QMap<qint32,qint32> > > sense(sql_input->genome);
  while(sense.hasNext())
  {
   sense.next(); c++;

   QMapIterator<QString,QMap<qint32,qint32> > dictionary(sense.value());

   while(dictionary.hasNext())
   {
    dictionary.next();
    QMapIterator<qint32,qint32> s(dictionary.value()); //sql result for strand+chromosome

    if((sam_input->genome['+']).contains(dictionary.key())) //chromosome chr1,chr2...
      {
       QMapIterator<qint32,qint32> k( (sam_input->genome['+'])[dictionary.key()]  );//+ strand,sam file, iteration over strand+chromosome

        s.next(); //c++;
        k.next();
        while (k.hasNext()) // + strand, iteration over strand+chromosome+each position
        {
         //if align is inside of the segment of the start site
         qint32 x1=k.key()- s.key() +half_window +shift;
         qint32 x2=x1-window;

         if( (x1^x2)  <  0 )
          {//inside segment
//           hd->data[c][0]+=k.value();

           poisson[((sql_input->genome_h[sense.key()])[dictionary.key()])[s.key()]]+=k.value();    
           k.next();
          }
          else
          {
          if((k.key() +shift)>(s.key()+half_window))
           {
            if(!s.hasNext()) break;
            s.next();// c++;
           }
           else
           {
            k.next();
           }
          }
        }//while k.hasNext
      }//if + strand sam input

    if((sam_input->genome['-']).contains(dictionary.key()))
      {
       QMapIterator<qint32,qint32> j( (sam_input->genome['-'])[dictionary.key()] );//- strand,sam file

       s.toFront();

       s.next();
       j.next();
       while (j.hasNext()) // - strand
       {
        //if align is inside of the segment of the start site
        qint32 x1=j.key()- s.key() +half_window -shift;
        qint32 x2=x1-window;

         if( (x1^x2)  <  0 )
          {//inside segment
//           hd->data[c+c+1][0]+=j.value();
//           poisson[QString("%1_%2_%3").arg(dictionary.key()).arg(s.key()).arg(sense.key())]+=j.value();    
           poisson[((sql_input->genome_h[sense.key()])[dictionary.key()])[s.key()]]+=j.value();    
           j.next();
          }
          else
          {
          if((j.key() -shift)>(s.key()+half_window))
           {
            if(!s.hasNext()) break;
            s.next();
           }
           else
           {
            j.next();
           }
          }
        }

      }//if - strand sam file
   }//while dictionary
  }//while sense



  if(1)//Normalizing
  {
//   qDebug()<<"tot:"<<sam_input->total;
//   qDebug()<<"nal:"<<sam_input->notAligned;
//   qDebug()<<"dev:"<<((sam_input->total-sam_input->notAligned)*sql_input->total);

//   qreal mapedT=sam_input->total-sam_input->notAligned;

   qreal lamda=(qreal)(window*(sam_input->total-sam_input->notAligned))/(sam_input->tot_len*0.741);   
   
   qDebug()<<"stot:"<<sql_input->total;
   qDebug()<<"poisson.size"<<poisson.size();
   qDebug()<<"Lamda"<<lamda;
   qDebug()<<"qExp()"<<qExp(-lamda);

   QFile _outFile;
   _outFile.setFileName(setup.value("outFileName").toString());
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

   qreal exp_l=qExp(-lamda);
   QString str;
   foreach(str,poisson.keys())
    {

     //P(x,L)=(e**-1)*(L**x)/x!
        //   qreal pois=exp_l; //qExp(-lamda)*qPow(lamda,poisson[str]);
        //   for(int i=2; i<= poisson[str];i++)
        //   pois=pois*lamda/i;

     //P(x,L)=(e**-1)*E(1-k)(L**x(i))/x(i)!     
        qreal pois=exp_l;
        qreal delim=1.0;
        qreal sum=1.0;
        for(int i=1; i<= poisson[str];i++)
         {  
          delim*=lamda/i;
//          delim/=i;
          sum+=delim;
         }
        pois*=sum;
     
     _outFile.write( (QString("%1\t%2\t%3\n").arg(str).arg(poisson[str]).arg(1.0-pois,0,'e',15)).toLocal8Bit() );  
    }
   _outFile.flush();
   _outFile.close();   
  }//if(1)

}//end of function

//-------------------------------------------------------------
//-------------------------------------------------------------
