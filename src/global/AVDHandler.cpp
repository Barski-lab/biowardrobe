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

#undef _MANY_PLOTS
//#define _MANY_PLOTS 1


//-------------------------------------------------------------
//-------------------------------------------------------------
template <class StorageIn1,class StorageIn2,class Result>
AVDHandler<StorageIn1,StorageIn2,Result>::~AVDHandler()
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class StorageIn1,class StorageIn2,class Result>
AVDHandler<StorageIn1,StorageIn2,Result>::AVDHandler(StorageIn1 *sql,StorageIn2 *sam,Result &_output,QState * parent):
QState(parent),
sql_input(sql),
sam_input(sam),
hd(&_output)
{
}

//-------------------------------------------------------------
//-------------------------------------------------------------
template <class StorageIn1,class StorageIn2,class Result>
void AVDHandler<StorageIn1,StorageIn2,Result>::onEntry(QEvent*)
{
AVD2();
}
//-------------------------------------------------------------
//-------------------------------------------------------------


#define __MASS_NAME hd->data
#define check_segment(_X1,_X2,_i1,_i2,_val,iter,__DIRECTION1)               \
    if( (_X1^_X2)  <  0 )/*is read inside segment above*/            \
{/*inside segment first part*/        \
    __MASS_NAME[(int)(_i1)][__DIRECTION1 (int)(graph_shift _i2)]=__MASS_NAME[(int)(_i1)][__DIRECTION1 (int)(graph_shift _i2)] _val;        \
    /*           qDebug()<<"Line:"<<line<<"segm start"<<g_str_w<<" segm end:"<<g_str<<" x1:" << x1<<" x2:"<<x2<<" X:"<<__BP.key();*/ \
    iter; \
    continue;                                            \
}

//-------------------------------------------------------------
//-------------------------------------------------------------

#define positive_while_norma(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE)                                         \
    while(__BP!=__EP && __BP.key()<=g_end_w+abs(__SHIFT))                              \
{                                                                 \
    double cur_val=__BP.value().getLevel();                          \
    qint32 x1;                                                      \
    qint32 x2;                                                      \
    qint32 X=__BP.key() __SHIFT;/*current point*/                                     \
    qint32 graph_shift=0; \
    /**/\
    x1=X-g_str_w;/*left point, start site - window*/       \
    x2=X-g_str;/*right point, start site [a,x1x2,b)*/      \
    check_segment(x1,x2,c_i,+x1/a_window,+(cur_val/(a_window*__NORMALIZE)),++__BP,__DIRECTION); \
    /*percent*/                                              \
    x1=X-g_str;/*left point, start site*/                        \
    x2=X-g_end;/*right point, end gene*/                                    \
    graph_shift=ajescent_window_len; \
    check_segment(x1,x2,c_i,+x1/percent_average_window,+(cur_val/(percent_average_window*__NORMALIZE)),++__BP,__DIRECTION); \
    \
    x1=X-g_end;/*/left point,end of gene*/ \
    x2=X-g_end_w;/*/end of gene plus window*/ \
    graph_shift=ajescent_window_len+percent; \
    check_segment(x1,x2,c_i,+x1/a_window,+(cur_val/(a_window*__NORMALIZE)),++__BP,__DIRECTION); \
    \
    ++__BP;                                                                               \
}                                                                                       \

#define positive_while_wonorma(__BP,__EP,__SHIFT,__DIRECTION)                                         \
    while(__BP!=__EP && __BP.key()<=g_end_w+abs(__SHIFT))                              \
{                                                                 \
    double cur_val=__BP.value().getLevel();                          \
    qint32 x1;                                                      \
    qint32 x2;                                                      \
    qint32 X=__BP.key() __SHIFT;/*current point*/                                     \
    qint32 graph_shift=0; \
    /**/\
    x1=X-g_str_w;/*left point, start site - window*/       \
    x2=X-g_str;/*right point, start site [a,x1x2,b)*/      \
    check_segment(x1,x2,c_i,+x1/a_window,+(cur_val/a_window),++__BP,__DIRECTION); \
    /*percent*/                                              \
    x1=X-g_str;/*left point, start site*/                        \
    x2=X-g_end;/*right point, end gene*/                                    \
    graph_shift=ajescent_window_len; \
    check_segment(x1,x2,c_i,+x1/percent_average_window,+(cur_val/percent_average_window),++__BP,__DIRECTION); \
    \
    x1=X-g_end;/*/left point,end of gene*/ \
    x2=X-g_end_w;/*/end of gene plus window*/ \
    graph_shift=ajescent_window_len+percent; \
    check_segment(x1,x2,c_i,+x1/a_window,+(cur_val/a_window),++__BP,__DIRECTION); \
    \
    ++__BP;                                                                               \
}                                                                                       \

#ifdef _MANY_PLOTS
 #define positive_while(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE) positive_while_norma(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE)
#else
 #define positive_while(__BP,__EP,__SHIFT,__DIRECTION)  positive_while_wonorma(__BP,__EP,__SHIFT,__DIRECTION)
#endif

//-------------------------------------------------------------
//-------------------------------------------------------------
template <class StorageIn1,class StorageIn2,class Result>
void AVDHandler<StorageIn1,StorageIn2,Result>::AVD1(void)
{
  if(!setup.contains("AvgTagWindow"))
      setup.setValue("AvgTagWindow",2000);

  if(!setup.contains("siteShift"))
      setup.setValue("siteShift",75);

/*  qint32 half_window=window/2;*/

   qint32 shift=setup.value("siteShift").toInt();


   QString line;

/*
 Calculate average window before StartSite and after EndSite
*/
  int a_window=0;
  int num=0;
  double numpos=0.0;
  double numneg=0.0;
  foreach(line,sql_input->getLines())
  {
    genome::cover_map::iterator s_b=sql_input->getLineCover(line).getBeginIterator(); //contains list of genes for current line(chromosome+-)
    genome::cover_map::iterator s_e=sql_input->getLineCover(line).getEndIterator();
    if(line.endsWith("+")) { numpos+=sql_input->getLineCover(line).getStarts().size();}//calculate positive and negative genes
    if(line.endsWith("-")) { numneg+=sql_input->getLineCover(line).getStarts().size();}//calculate positive and negative genes
    for(;s_b!=s_e;++s_b)
      {
       a_window+=(s_b.value().getLength()/100);
       num++;
      }
  }
  a_window /= num;
  int total=sam_input->total-sam_input->notAligned;

#ifndef _MANY_PLOTS
  numpos+=numneg;
  numneg=numpos;
#endif

  numpos*=total;
  numneg*=total;

  #define percent 100
  #define ajescent_window_len 10

  int c=0;//sense count, even/odd c sense/nonsense
  qint32 window=a_window*ajescent_window_len;//setup.value("AvgTagWindow").toInt();

#ifdef _MANY_PLOTS
  hd->SetSize(ajescent_window_len*2+percent,4);
#else
  hd->SetSize(ajescent_window_len*2+percent,1);
#endif
  int seg=hd->width-1;

  QString chrome;
  //going thru all chromosomes from SQL, positive and negative are separated
  foreach(line,sql_input->getLines())
   {
    genome::cover_map::iterator s_b=sql_input->getLineCover(line).getBeginIterator(); //contains list of genes for current line(chromosome+-)
    genome::cover_map::iterator s_e=sql_input->getLineCover(line).getEndIterator();

    if(line.endsWith("+")) {c=0;}
    if(line.endsWith("-")) {c=2;}

    chrome=line;
    chrome.truncate(line.length()-1);

    /*qDebug()<<"line:"<<line<<" genes:"<<sql_input->getLineCover(line).getStarts().size()<<" chrome:"<<chrome;
    */
    /*
    reads, end iterator,positive strand
    */
    genome::cover_map::iterator e_p=sam_input->getLineCover(chrome+QChar('+')).getEndIterator();
    /*
    reads, end iterator, negative strand
    */
    genome::cover_map::iterator e_n=sam_input->getLineCover(chrome+QChar('-')).getEndIterator();


    while(s_b!=s_e)//genes in chrom
    {
     int g_str=s_b.value().getStart();
     int g_str_w=g_str-window;
     int g_end=g_str+s_b.value().getLength()-1;
     int g_end_w=g_end+window;
#ifdef _MANY_PLOTS
     int c_i=c;//iterator inside QMap separates strands and directions
#else
     int c_i=0;
#endif
     double percent_average_window=((double)s_b.value().getLength()-1.0)/100.0;

     genome::cover_map::iterator iterator;
        if(c==0)//if positive directions
         {
          if(!sam_input->getLineCover(chrome+QChar('+')).isEmpty()){
           iterator=sam_input->getLineCover(chrome+QChar('+')).getUpperBound(g_str_w-1-shift);//reads
           positive_while(iterator,e_p,+shift,0+); //genes expression to positive direction, bam positive strand
          }
          if(!sam_input->getLineCover(chrome+QChar('-')).isEmpty()){
//           qDebug()<<"notEmpty:"<<chrome+QChar('-')<<"line"<<line;
           iterator=sam_input->getLineCover(chrome+QChar('-')).getUpperBound(g_str_w-1-shift);//reads
#ifdef _MANY_PLOTS
           c_i=c+1;
           positive_while(iterator,e_n,-shift,0+,numpos); //genes expression to positive direction, bam negative strand
#else
           positive_while(iterator,e_n,-shift,0+); //genes expression to positive direction, bam negative strand
#endif
          }
         }
         else//else if negative diretion
         {
          if(!sam_input->getLineCover(chrome+QChar('+')).isEmpty()){
           iterator=sam_input->getLineCover(chrome+QChar('+')).getUpperBound(g_str_w-1-shift);//reads
           positive_while(iterator,e_p,+shift,seg-); //genes expression to positive direction, bam positive strand
          }
          if(!sam_input->getLineCover(chrome+QChar('-')).isEmpty()){
           iterator=sam_input->getLineCover(chrome+QChar('-')).getUpperBound(g_str_w-1-shift);//reads
#ifdef _MANY_PLOTS
           c_i=c+1;
           positive_while(iterator,e_n,-shift,seg-,numneg); //genes expression to positive direction, bam negative strand
#else
           positive_while(iterator,e_n,-shift,seg-); //genes expression to positive direction, bam negative strand
#endif
          }
         }

     ++s_b;
    }//while

   }//end foreach


#ifndef _MANY_PLOTS
unsigned int j;
for(j=0;j<hd->width;j++)
 {
  hd->data[0][j]/=numpos;
 }
#endif

/*unsigned int k,j;
for(k=1;k<hd->height;k++)
for(j=0;j<hd->width;j++)
 {
  hd->data[0][j]+=hd->data[k][j];
 }
*/


}//end of function


//-------------------------------------------------------------
//-------------------------------------------------------------

#define positive_while_avd_wonorm(__BP,__EP,__SHIFT,__DIRECTION)                                         \
     while(__BP!=__EP && __BP.key()<=g_end_w+abs(__SHIFT))                              \
      {                                                                 \
         double cur_val=__BP.value().getLevel();                          \
         qint32 x1;                                                      \
         qint32 x2;                                                      \
         qint32 X=__BP.key() __SHIFT;/*current point*/                                     \
         qint32 graph_shift=0; \
         /**/\
         x1=X-g_str_w;/*left point, start site - window*/       \
         x2=X-g_end_w;/*right point, start site [a,x1x2,b)*/      \
         /*qDebug()<<"chrom:"<<chrome<<" line:"<<line<<"X:"<<__BP.key()<<" ["<<g_str<<"] window ["<<g_str_w<<","<<g_end_w<<"]"<<" shift:"<<__SHIFT<<" x1:"<<x1<<" x2:"<<x2<<" cur_val:"<<cur_val;*/                                                                                     \
         check_segment(x1,x2,c_i,+x1,+cur_val,++__BP,__DIRECTION); \
         ++__BP;                                                                               \
      }                                                                                       \

#define positive_while_avd_norm(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE)                                         \
     while(__BP!=__EP && __BP.key()<=g_end_w+abs(__SHIFT))                              \
      {                                                                 \
         double cur_val=__BP.value().getLevel();                          \
         qint32 x1;                                                      \
         qint32 x2;                                                      \
         qint32 X=__BP.key() __SHIFT;/*current point*/                                     \
         qint32 graph_shift=0; \
         /**/\
         x1=X-g_str_w;/*left point, start site - window*/       \
         x2=X-g_end_w;/*right point, start site [a,x1x2,b)*/      \
         /*qDebug()<<"chrom:"<<chrome<<" line:"<<line<<"X:"<<__BP.key()<<" ["<<g_str<<"] window ["<<g_str_w<<","<<g_end_w<<"]"<<" shift:"<<__SHIFT<<" x1:"<<x1<<" x2:"<<x2<<" cur_val:"<<cur_val;*/                                                                                     \
         check_segment(x1,x2,c_i,+x1,+cur_val,++__BP,__DIRECTION); \
         ++__BP;                                                                               \
      }                                                                                       \


#ifdef _MANY_PLOTS
 #define positive_while_avd(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE)  positive_while_avd_wonorm(__BP,__EP,__SHIFT,__DIRECTION,__NORMALIZE)
#else
 #define positive_while_avd(__BP,__EP,__SHIFT,__DIRECTION)  positive_while_avd_wonorm(__BP,__EP,__SHIFT,__DIRECTION)
#endif
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class StorageIn1,class StorageIn2,class Result>
void AVDHandler<StorageIn1,StorageIn2,Result>::AVD2(void)
{


/*  qint32 half_window=window/2;*/

   qint32 shift=0;


   QString line;

/*
 Calculate normalization number
*/
#ifdef _MANY_PLOTS
  double numpos=0.0;
  double numneg=0.0;
  foreach(line,sql_input->getLines())
  {
    if(line.endsWith("+")) { numpos+=sql_input->getLineCover(line).getStarts().size();}//calculate a number of positive genes
    if(line.endsWith("-")) { numneg+=sql_input->getLineCover(line).getStarts().size();}//calculate a number of negative genes
  }
#else
  quint64 norma=0;
#endif
  quint64 total=sam_input->total-sam_input->notAligned;

  #define percent 100
  #define ajescent_window_len 10

  int c=0;//sense count, even/odd c sense/nonsense
  qint32 window=gArgs().getArgs("avd_window").toInt();

#ifdef _MANY_PLOTS
  hd->SetSize(window*2,4);
#else
  hd->SetSize(window*2,1);
#endif
  int seg=hd->width-1;

  QString chrome;
  //going thru all chromosomes from SQL, positive and negative are separated
  foreach(line,sql_input->getLines())
   {
    genome::cover_map::iterator s_b=sql_input->getLineCover(line).getBeginIterator(); //contains list of genes for current line(chromosome+-)
    genome::cover_map::iterator s_e=sql_input->getLineCover(line).getEndIterator();

/*
 Calculate normalization number
*/
    norma+=sql_input->getLineCover(line).getStarts().size();//calculate a number of positive and negative genes

    if(line.endsWith("+")) {c=0;}
    if(line.endsWith("-")) {c=2;}

    chrome=line;
    chrome.chop(1);

    /*qDebug()<<"line:"<<line<<" genes:"<<sql_input->getLineCover(line).getStarts().size()<<" chrome:"<<chrome;
    */
    /*
    reads, end iterator,positive strand
    */
    genome::cover_map::iterator e_p=sam_input->getLineCover(chrome+QChar('+')).getEndIterator();
    /*
    reads, end iterator, negative strand
    */
    genome::cover_map::iterator e_n=sam_input->getLineCover(chrome+QChar('-')).getEndIterator();


    while(s_b!=s_e)//genes in chrom
    {
        int g_str=s_b.value().getStart();
        int g_str_w=g_str-window;
        int g_end_w=g_str+window;
#ifdef _MANY_PLOTS
        int c_i=c;//iterator inside QMap separates strands and directions
#else
        int c_i=0;
#endif
        //     double percent_average_window=((double)s_b.value().getLength()-1.0)/100.0;

        genome::cover_map::iterator iterator;
        if(c==0)//if positive directions
        {
            if(!sam_input->getLineCover(chrome+QChar('+')).isEmpty()){
                iterator=sam_input->getLineCover(chrome+QChar('+')).getUpperBound(g_str_w-1-shift);//reads
                positive_while_avd(iterator,e_p,+shift,0+); //genes expression to positive direction, bam positive strand
            }
            if(!sam_input->getLineCover(chrome+QChar('-')).isEmpty()){
                //           qDebug()<<"notEmpty:"<<chrome+QChar('-')<<"line"<<line;
                iterator=sam_input->getLineCover(chrome+QChar('-')).getUpperBound(g_str_w-1-shift);//reads
#ifdef _MANY_PLOTS
                c_i=c+1;
#endif
                positive_while_avd(iterator,e_n,-shift,0+); //genes expression to positive direction, bam negative strand
            }
        }
        else//else if negative diretion
        {
            if(!sam_input->getLineCover(chrome+QChar('+')).isEmpty()){
                iterator=sam_input->getLineCover(chrome+QChar('+')).getUpperBound(g_str_w-1-shift);//reads
                positive_while_avd(iterator,e_p,+shift,seg-); //genes expression to positive direction, bam positive strand
            }
            if(!sam_input->getLineCover(chrome+QChar('-')).isEmpty()){
                iterator=sam_input->getLineCover(chrome+QChar('-')).getUpperBound(g_str_w-1-shift);//reads
#ifdef _MANY_PLOTS
                c_i=c+1;
#endif
                positive_while_avd(iterator,e_n,-shift,seg-); //genes expression to positive direction, bam negative strand
            }
        }

        ++s_b;
    }//while

   }//end foreach


#ifndef _MANY_PLOTS
unsigned int j;
for(j=0;j<hd->width;j++)
 {
  hd->data[0][j]/=norma;
  hd->data[0][j]/=total;
 }
#else
unsigned int j,i;
for(i=0;i<hd->height;i++)
for(j=0;j<hd->width;j++)
 {
  hd->data[i][j]/=total;
 }
#endif


}
//-------------------------------------------------------------
//-------------------------------------------------------------

//-------------------------------------------------------------
//-------------------------------------------------------------




#undef __MASS_NAME


